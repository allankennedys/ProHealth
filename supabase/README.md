# Backend (Supabase)

1. `supabase link --project-ref vedrbhldjowxpilucyfo`
2. `supabase db push` — aplica `migrations/20261105000000_idoso_familiar.sql`
   (se o banco restaurado ainda não tiver as tabelas base, rode antes `supabase db pull` e commite).
3. `supabase functions deploy process-alerts`
4. Agende a função a cada 5 minutos (SQL Editor, com `pg_cron` e `pg_net` habilitados):

```sql
select cron.schedule('process-alerts', '*/5 * * * *', $$
  select net.http_post(
    url := 'https://vedrbhldjowxpilucyfo.supabase.co/functions/v1/process-alerts',
    headers := jsonb_build_object('Authorization', 'Bearer <SERVICE_ROLE_KEY>')
  );
$$);
```

Alertas de valor fora da faixa são gerados por triggers no banco (`alerta_glicemia`, `alerta_pressao`);
a função cuida de medições atrasadas e do envio de push. SMS ainda não está integrado (ponto marcado no código).
