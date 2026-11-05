-- ProHealth: módulos Idoso / Familiar
-- Idempotente: pode rodar sobre o banco restaurado (ADD COLUMN IF NOT EXISTS etc.).
-- Rode com `supabase db push` ou cole no SQL Editor.

------------------------------------------------------------------
-- 1. profiles: papel, metas e contatos
------------------------------------------------------------------
alter table public.profiles
  add column if not exists role text not null default 'idoso',
  add column if not exists phone text,
  add column if not exists emergency_name text,
  add column if not exists emergency_phone text,
  add column if not exists emergency_email text,
  add column if not exists glucose_min numeric not null default 70,
  add column if not exists glucose_max numeric not null default 140,
  add column if not exists sys_min numeric not null default 90,
  add column if not exists sys_max numeric not null default 140,
  add column if not exists dia_min numeric not null default 60,
  add column if not exists dia_max numeric not null default 90,
  add column if not exists horarios_glicemia text[] not null default '{}',
  add column if not exists horarios_pressao text[] not null default '{}',
  add column if not exists expo_push_token text,
  add column if not exists codigo_vinculo text;

alter table public.profiles drop constraint if exists profiles_role_check;
alter table public.profiles add constraint profiles_role_check check (role in ('idoso', 'familiar'));

-- código curto (6 caracteres) que o idoso informa ao familiar para vincular as contas
create or replace function public.gen_codigo_vinculo() returns text
language sql volatile as $$
  select upper(substr(translate(encode(extensions.gen_random_bytes(6), 'base64'), '+/=OIl01', 'XYZABCD'), 1, 6));
$$;

update public.profiles set codigo_vinculo = public.gen_codigo_vinculo() where codigo_vinculo is null;
create unique index if not exists profiles_codigo_vinculo_key on public.profiles (codigo_vinculo);

------------------------------------------------------------------
-- 2. Trigger de criação do profile a partir do cadastro (auth.users)
--    role / full_name vêm de options.data no signUp()
------------------------------------------------------------------
create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, full_name, role, codigo_vinculo)
  values (
    new.id,
    new.raw_user_meta_data ->> 'full_name',
    coalesce(nullif(new.raw_user_meta_data ->> 'role', ''), 'idoso'),
    public.gen_codigo_vinculo()
  )
  on conflict (id) do update
    set role = excluded.role,
        full_name = coalesce(excluded.full_name, public.profiles.full_name);
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

------------------------------------------------------------------
-- 3. Vínculo familiar <-> idoso
------------------------------------------------------------------
create table if not exists public.care_links (
  id uuid primary key default gen_random_uuid(),
  familiar_id uuid not null references public.profiles (id) on delete cascade,
  idoso_id uuid not null references public.profiles (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (familiar_id, idoso_id)
);
alter table public.care_links enable row level security;

drop policy if exists "care_links: ver os próprios" on public.care_links;
create policy "care_links: ver os próprios" on public.care_links
  for select using (auth.uid() in (familiar_id, idoso_id));
drop policy if exists "care_links: remover os próprios" on public.care_links;
create policy "care_links: remover os próprios" on public.care_links
  for delete using (auth.uid() in (familiar_id, idoso_id));

-- true se o usuário logado é familiar vinculado ao idoso informado
create or replace function public.is_caregiver_of(p_idoso uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from public.care_links
    where familiar_id = auth.uid() and idoso_id = p_idoso
  );
$$;

-- familiar informa o código do idoso e o vínculo é criado
create or replace function public.vincular_paciente(p_codigo text) returns uuid
language plpgsql security definer set search_path = public as $$
declare
  v_idoso uuid;
begin
  if not exists (select 1 from profiles where id = auth.uid() and role = 'familiar') then
    raise exception 'Apenas contas de familiar/cuidador podem vincular pacientes';
  end if;

  select id into v_idoso from profiles
   where codigo_vinculo = upper(trim(p_codigo)) and role = 'idoso';
  if v_idoso is null then
    raise exception 'Código não encontrado';
  end if;

  insert into care_links (familiar_id, idoso_id) values (auth.uid(), v_idoso)
  on conflict do nothing;
  return v_idoso;
end;
$$;
grant execute on function public.vincular_paciente(text) to authenticated;

------------------------------------------------------------------
-- 4. Glicemia: contexto da medição
------------------------------------------------------------------
alter table public.glucose_logs add column if not exists context text;
alter table public.glucose_logs drop constraint if exists glucose_logs_context_check;
alter table public.glucose_logs
  add constraint glucose_logs_context_check
  check (context is null or context in ('jejum', 'pos_refeicao', 'antes_dormir'));

------------------------------------------------------------------
-- 5. Alertas
------------------------------------------------------------------
create table if not exists public.alertas (
  id uuid primary key default gen_random_uuid(),
  paciente_id uuid not null references public.profiles (id) on delete cascade,
  tipo text not null,            -- glicemia_alta | glicemia_baixa | pressao_alta | pressao_baixa | medicao_atrasada
  mensagem text not null,
  chave text unique,             -- deduplicação (ex.: medicao_atrasada:glicemia:2026-11-05:08:00)
  lido boolean not null default false,
  enviado_push boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists alertas_paciente_idx on public.alertas (paciente_id, created_at desc);
alter table public.alertas enable row level security;

drop policy if exists "alertas: paciente e familiar leem" on public.alertas;
create policy "alertas: paciente e familiar leem" on public.alertas
  for select using (paciente_id = auth.uid() or public.is_caregiver_of(paciente_id));
drop policy if exists "alertas: familiar marca como lido" on public.alertas;
create policy "alertas: familiar marca como lido" on public.alertas
  for update using (public.is_caregiver_of(paciente_id));

-- gera alerta quando a medição sai da faixa definida no perfil do idoso
create or replace function public.alerta_glicemia() returns trigger
language plpgsql security definer set search_path = public as $$
declare p profiles%rowtype;
begin
  select * into p from profiles where id = new.user_id;
  if new.glucose_mgdl > p.glucose_max then
    insert into alertas (paciente_id, tipo, mensagem) values (
      new.user_id, 'glicemia_alta',
      format('Atenção: glicemia de %s registrou %s mg/dL (limite %s)', coalesce(p.full_name, 'paciente'), new.glucose_mgdl, p.glucose_max));
  elsif new.glucose_mgdl < p.glucose_min then
    insert into alertas (paciente_id, tipo, mensagem) values (
      new.user_id, 'glicemia_baixa',
      format('Atenção: glicemia de %s registrou %s mg/dL (mínimo %s)', coalesce(p.full_name, 'paciente'), new.glucose_mgdl, p.glucose_min));
  end if;
  return new;
end;
$$;
drop trigger if exists trg_alerta_glicemia on public.glucose_logs;
create trigger trg_alerta_glicemia after insert on public.glucose_logs
  for each row execute function public.alerta_glicemia();

create or replace function public.alerta_pressao() returns trigger
language plpgsql security definer set search_path = public as $$
declare p profiles%rowtype;
begin
  select * into p from profiles where id = new.user_id;
  if new.systolic > p.sys_max or new.diastolic > p.dia_max then
    insert into alertas (paciente_id, tipo, mensagem) values (
      new.user_id, 'pressao_alta',
      format('Atenção: pressão de %s registrou %s/%s mmHg (limite %s/%s)', coalesce(p.full_name, 'paciente'), new.systolic, new.diastolic, p.sys_max, p.dia_max));
  elsif new.systolic < p.sys_min or new.diastolic < p.dia_min then
    insert into alertas (paciente_id, tipo, mensagem) values (
      new.user_id, 'pressao_baixa',
      format('Atenção: pressão de %s registrou %s/%s mmHg (mínimo %s/%s)', coalesce(p.full_name, 'paciente'), new.systolic, new.diastolic, p.sys_min, p.dia_min));
  end if;
  return new;
end;
$$;
drop trigger if exists trg_alerta_pressao on public.blood_pressure_logs;
create trigger trg_alerta_pressao after insert on public.blood_pressure_logs
  for each row execute function public.alerta_pressao();

------------------------------------------------------------------
-- 6. RLS: o familiar vinculado enxerga/gerencia os dados do idoso
--    (as políticas "o próprio usuário" das tabelas existentes continuam valendo)
------------------------------------------------------------------
drop policy if exists "profiles: familiar lê paciente" on public.profiles;
create policy "profiles: familiar lê paciente" on public.profiles
  for select using (public.is_caregiver_of(id));

drop policy if exists "profiles: familiar edita metas do paciente" on public.profiles;
create policy "profiles: familiar edita metas do paciente" on public.profiles
  for update using (public.is_caregiver_of(id));

-- idoso precisa ler o perfil do familiar vinculado (nome/telefone de emergência)
drop policy if exists "profiles: idoso lê familiar" on public.profiles;
create policy "profiles: idoso lê familiar" on public.profiles
  for select using (exists (
    select 1 from public.care_links where familiar_id = profiles.id and idoso_id = auth.uid()
  ));

drop policy if exists "glucose_logs: familiar lê" on public.glucose_logs;
create policy "glucose_logs: familiar lê" on public.glucose_logs
  for select using (public.is_caregiver_of(user_id));

drop policy if exists "blood_pressure_logs: familiar lê" on public.blood_pressure_logs;
create policy "blood_pressure_logs: familiar lê" on public.blood_pressure_logs
  for select using (public.is_caregiver_of(user_id));

drop policy if exists "medicamentos: familiar gerencia" on public.medicamentos;
create policy "medicamentos: familiar gerencia" on public.medicamentos
  for all using (public.is_caregiver_of(usuario)) with check (public.is_caregiver_of(usuario));

drop policy if exists "lembretes: familiar gerencia" on public.lembretes;
create policy "lembretes: familiar gerencia" on public.lembretes
  for all using (exists (
    select 1 from public.medicamentos m
    where m.id = lembretes.medicamento_id and public.is_caregiver_of(m.usuario)
  )) with check (exists (
    select 1 from public.medicamentos m
    where m.id = lembretes.medicamento_id and public.is_caregiver_of(m.usuario)
  ));

------------------------------------------------------------------
-- 7. Realtime para o painel do familiar
------------------------------------------------------------------
do $$
begin
  perform 1 from pg_publication where pubname = 'supabase_realtime';
  if found then
    begin alter publication supabase_realtime add table public.glucose_logs; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.blood_pressure_logs; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.alertas; exception when duplicate_object then null; end;
  end if;
end $$;

------------------------------------------------------------------
-- 8. Excluir conta não pode ser bloqueada por remédios cadastrados
------------------------------------------------------------------
alter table public.medicamentos drop constraint if exists medicamentos_usuario_fkey;
alter table public.medicamentos
  add constraint medicamentos_usuario_fkey foreign key (usuario) references auth.users (id) on delete cascade;
