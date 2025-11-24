# ProHealth

ProHealth é um aplicativo de gerenciamento de saúde pessoal que ajuda o usuário a registrar e monitorar dados de saúde, cadastrar medicamentos, definir lembretes e receber notificações para não esquecer de tomá-los.

---

## Tecnologias

* **Frontend:** React Native + Expo
* **Backend:** Supabase (PostgreSQL, Auth, Edge Functions)
* **Notificações:** Expo Push Notifications
* **Hospedagem do Backend:** Supabase Edge Functions
* **Relatórios** Gerados por AI Agent via n8n

---

## Funcionalidades

* Cadastro de medicamentos com nome, dosagem e horário.
* Lembretes automáticos baseados em horário.
* Notificações push em Android e iOS.
* Histórico de notificações enviadas.
* Relatórios diários gerados por IA a partir dos dados inseridos pelo usuário.

---

## Pré-requisitos

* Node.js >= 20
* Expo CLI
* Conta no Supabase
* Conta no Firebase (para push notifications Android)

---

## Configuração do Projeto

1. Clone o repositório:

```bash
git clone git@github.com:allankennedys/ProHealth.git
cd prohealth
```

2. Instale dependências:

```bash
npm install
# ou
yarn install
```

3. Crie um arquivo `.env` na raiz com as variáveis do Supabase:

```
SUPABASE_URL=<sua_url_supabase>
SUPABASE_ANON_KEY=<sua_anon_key>
SUPABASE_SERVICE_ROLE_KEY=<sua_service_role_key>
```

## Rodando localmente

```bash
expo start
```

* Para testes Android/iOS com push notifications, use o Expo Go.

---

## Build para produção

```bash
eas build -p android --profile production
eas build -p ios --profile production
```


## Estrutura do Banco de Dados

* **profiles**: informações do usuário + `expo_push_token`.
* **medicamentos**: lista de medicamentos por usuário.
* **lembretes**: horários dos medicamentos.
* **notificacoes_enviadas**: histórico de notificações enviadas.

---

## Observações

* Notificações são enviadas via Supabase Edge Function que consulta os lembretes no horário exato.

---

## Contato

Desenvolvedores: Allan Kennedy, Felipe Santos, Lucas Câmera, Kiria Velsoso
