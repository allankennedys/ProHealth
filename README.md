# ProHealth

App para acompanhar a saúde de pessoas idosas e deixar a família por perto. O idoso registra glicemia e pressão e é lembrado dos remédios. Quem cuida acompanha tudo de longe e é avisado quando algum valor sai do normal.

Versão web: https://allankennedys.github.io/ProHealth/

## Como funciona

Existem dois tipos de conta.

**Paciente (idoso)**
- Telas com botões grandes e letras grandes, pensadas para ser fáceis de usar.
- Entra só com e-mail e um PIN de 4 números.
- Registra glicemia (em jejum, depois de comer ou antes de dormir) e pressão arterial.
- Vê o histórico e gráficos dos últimos 30 dias, com cores indicando se está normal, em atenção ou fora da faixa.
- Cadastra os remédios e os horários. O app avisa com som e mensagem na tela.
- Tem um botão para ligar para o contato de emergência.
- Tem um código de 6 letras que serve para a família se vincular à conta.

**Familiar / cuidador**
- Digita o código do paciente para acompanhá-lo. Dá para acompanhar mais de um.
- Vê no painel as últimas medições, os gráficos e os alertas, tudo atualizado na hora.
- Define os limites aceitáveis de glicemia e pressão (as metas passadas pelo médico).
- Cadastra e ajusta os remédios do paciente.
- Gera um relatório em PDF para levar à consulta.

**Alertas:** quando uma medição fica fora dos limites, o familiar é avisado. O app também avisa quando o paciente esquece de medir. O envio por SMS ainda não foi configurado.

## Celular e navegador

- No celular (Android e iOS) os lembretes tocam mesmo com o app fechado.
- No navegador os lembretes só tocam com a aba aberta.
- O botão de ligar funciona no celular. No computador ele copia o número.

## Rodando o projeto

Precisa do Node 20 ou mais novo.

```bash
npm install
npx expo start
```

Aperte `w` para abrir no navegador, ou leia o QR code com o app Expo Go no celular.

Para gerar a versão web:

```bash
npx expo export --platform web
```

A cada alteração enviada para a branch `main`, o site é atualizado sozinho pelo GitHub.

## Servidor

Os dados ficam no Supabase. A pasta `supabase/` tem a estrutura do banco e a função que confere as medições atrasadas. O passo a passo está em `supabase/README.md`.
