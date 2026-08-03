# HelpTap Web — Documento de Design

**Data:** 2026-08-03
**Contexto:** Front-end web do ecossistema HelpTap (TCC — Uni-FACEF), destinado aos profissionais autorizados (Médico, Policial, Bombeiro/Socorrista) e ao próprio titular da pulseira. Replica o protótipo de alta fidelidade (exports do Lovable) e segue a arquitetura descrita no artigo.

## Objetivo

SPA que, a partir da leitura de uma pulseira NFC (URL com UUID), apresenta ao profissional autenticado os dados do paciente **filtrados pelo seu perfil de acesso (RBAC)**, atendendo ao requisito de consulta em 30 segundos a 1 minuto identificado na pesquisa de campo.

## Escopo

**Incluído:**
- Seleção de perfil, login por perfil, cadastro profissional (Médico, Policial, Bombeiro)
- Login do titular da pulseira por e-mail e senha
- Rota `/pulseira/:uuid` protegida, com redirecionamento pós-login preservando o destino
- Visualização do paciente filtrada por perfil (RBAC simulado no mock)
- Tela `/leitura` para inserir código de pulseira após login avulso
- Camada de API mockada com latência simulada, pronta para troca pelo back-end Spring Boot
- Registro mockado de `AccessLog` a cada leitura

**Fora do escopo (por decisão do usuário):**
- Painel de Administrador
- Acesso do titular por código de 6 dígitos
- Integração com o back-end real (existe, mas incompleto — troca futura)

## Stack

React 18 + Vite + TypeScript + Tailwind CSS + React Router. Testes com Vitest + Testing Library.

> Nota de implementação: o projeto foi efetivamente construído com **React 19** (a versão
> estável mais recente no momento), em vez do React 18 mencionado acima na concepção inicial.
> Nenhuma decisão de arquitetura descrita neste documento depende da diferença entre as versões.

**Decisões e alternativas consideradas:**
- **Service layer com mocks** (escolhido) vs. MSW: funções tipadas em `src/api/` cujo miolo hoje retorna mocks; na integração, só o interior das funções muda para `fetch` real (`VITE_API_URL`). Mais simples de entender e debugar que interceptação via MSW.
- **Tailwind CSS** (escolhido) vs. CSS puro: o protótipo veio do Lovable (que usa Tailwind); replicação rápida de gradientes, cartões e cores por perfil com design tokens.

## Estrutura de pastas

```
src/
  api/            # service layer (mock hoje, Spring Boot depois)
    client.ts     # troca mock/real por variável de ambiente
    auth.ts       # login(perfil, credenciais), cadastro
    paciente.ts   # getPacienteByUuid(uuid)
    mock/
      data.ts     # pacientes fictícios
      handlers.ts # simula RBAC, validação de credenciais e latência
  components/     # PerfilCard, InputComIcone, BotaoPerfil, CardSecao,
                  # BadgeCriticidade, HeaderPaciente, AcoesEmergencia...
  pages/          # uma pasta por tela
  contexts/       # AuthContext (token fake + role, persistido)
  types/          # entidades espelhando o TCC
  styles/         # tokens (cores por perfil, creme, teal)
```

## Rotas

| Rota | Tela | Proteção |
|---|---|---|
| `/` | Seleção de perfil (4 cartões + botões de cadastro profissional) | pública |
| `/login/:perfil` | Login (`medico`, `policial`, `bombeiro`, `usuario`) | pública |
| `/cadastro/:perfil` | Cadastro profissional (`medico`, `policial`, `bombeiro`) | pública |
| `/pulseira/:uuid` | Visualização do paciente filtrada por perfil | autenticada |
| `/leitura` | Campo para inserir código da pulseira | autenticada |
| `*` | 404 (inclui perfil inválido na URL) | pública |

**Fluxo NFC:** acessar `/pulseira/:uuid` sem autenticação leva à seleção de perfil guardando o destino; após o login, o usuário cai direto na tela do paciente, sem etapas intermediárias. `/leitura` existe apenas para o login avulso (sem pulseira lida).

## Tipos (espelham as entidades do artigo)

`User` (núcleo, enum `Role`: Paciente, Médico, Policial, Bombeiro, Socorrista), `Address`, `EmergencyContact` (entidade "Counted" do artigo), `Wearable` (`accessUrl` UUID), `MedicalRecord` (tipo sanguíneo, altura, peso, etnia, doador de órgãos, observações), `Illness` (`isSensitive`), `Disorder`, `Allergy` (`riskRating`), `Deficiency`, `AccessLog` (`wearableId`, `accessedAt`, `role`, `location`).

## RBAC — regra central

A filtragem por perfil acontece **no mock handler** (simulando o back-end), nunca nos componentes. `getPacienteByUuid(uuid)` retorna somente os campos permitidos ao perfil autenticado:

| Perfil | Identificação | Filiação | Ficha médica | Alergias |
|---|---|---|---|---|
| Médico | ✔ | ✔ | completa (incl. observações) | ✔ com criticidade |
| Policial | ✔ (CPF, endereço) | ✔ | — | — |
| Bombeiro/Socorrista | ✔ (sem CPF) | — | essencial (com observações) | ✔ com criticidade |
| Usuário (titular) | próprios dados completos | ✔ | completa | ✔ |

Os componentes renderizam o que chega — a troca pelo Spring Security não altera tela nenhuma. Cada leitura grava um `AccessLog` mockado (auditoria/LGPD, conforme o artigo).

## Dados mockados

- **Rafael Andrade, 22 anos** — idêntico ao protótipo (O+, 1,65 m, 68 kg, alergia a Dipirona "Alta", filiação Ana Santos/José Santos, endereço Rua das Flores 123 — Centro, São Paulo-SP)
- **Segundo paciente** com caso distinto (TEA + alergias) para demonstrar variedade na banca
- Cada paciente vinculado a um `Wearable` com UUID fixo e conhecido (para demo)

## Visual e acessibilidade

- Fundo creme, cartões brancos arredondados, teal primária; cor/gradiente por perfil: azul (Médico), azul-escuro (Policial), laranja→vermelho (Bombeiro), teal (Usuário)
- Vermelho reservado a criticidade (badge de alergia "Alta", botão "Ligar Responsável")
- Cabeçalho do paciente: nome + idade; ações de emergência no topo — "Ligar Responsável" (link `tel:`) e "Enviar Localização" (mock com confirmação visual)
- WCAG: contraste, foco visível, labels associados aos campos, navegação por teclado, ícones acompanhados de texto
- Layout responsivo (desktop e mobile — profissional em campo usa o celular)

## Erros e casos-limite

- Credenciais inválidas no login → mensagem no formulário
- Cadastro: validação de formato de CRM/UF e registros funcionais, simulando a API mockada de validação de credenciais do artigo (com latência artificial)
- UUID de pulseira inexistente → tela "pulseira não vinculada"
- Perfil inválido na URL (`/login/xyz`) → 404

## Testes

Vitest + Testing Library nos pontos críticos:
1. Filtragem RBAC dos handlers — cada perfil recebe exatamente seus campos (em especial: Policial nunca recebe dados clínicos)
2. Guard de rota — `/pulseira/:uuid` sem auth redireciona e retorna ao destino após login
3. Fluxo completo login → pulseira → tela do paciente
