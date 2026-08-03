# HelpTap Web

Front-end web do ecossistema HelpTap — um Trabalho de Conclusão de Curso (TCC, Uni-FACEF) que
propõe acesso emergencial a dados médicos por meio de uma pulseira com NFC/QR Code. Ao ler o
código da pulseira de uma vítima, profissionais autorizados (Médico, Policial, Bombeiro/Socorrista)
ou o próprio titular visualizam, na hora, apenas as informações que o seu perfil tem permissão de
ver — identificação, ficha médica, alergias, doenças e transtornos — reduzindo o tempo de resposta
em situações de emergência.

## Stack

- React 19 + Vite + TypeScript
- Tailwind CSS
- React Router
- Vitest + Testing Library (testes)

## Como rodar

```bash
npm install
npm run dev        # servidor de desenvolvimento
npm test           # suíte de testes (Vitest)
npm run typecheck  # checagem de tipos
npm run build      # build de produção
```

## Credenciais de demonstração

Todos os perfis usam a senha `123456`.

| Perfil | E-mail | Observação |
|---|---|---|
| Médico | medico@helptap.com | acesso completo (identificação, ficha médica, alergias, doenças, transtornos) |
| Policial | policial@helptap.com | identificação e filiação, sem dados clínicos |
| Bombeiro/Socorrista | bombeiro@helptap.com | dados essenciais (sem CPF, sem doenças sensíveis) |
| Usuário (titular) | rafael@helptap.com | só acessa a própria pulseira |

## Pulseiras de demonstração

| UUID | Paciente |
|---|---|
| `550e8400-e29b-41d4-a716-446655440001` | Rafael Andrade |
| `550e8400-e29b-41d4-a716-446655440002` | Ana Clara Souza |

Acesse `/leitura` após o login para simular a leitura de uma pulseira com um desses UUIDs.

## Sobre a camada de dados

Toda a autenticação e os dados de pacientes são **mockados** (`src/api/mock/`), simulando o
comportamento que o back-end real em Spring Boot terá — inclusive a filtragem por perfil (RBAC) e
a trilha de auditoria (`AccessLog`). Nenhum componente filtra dados; a filtragem acontece inteiramente
no mock handler, para que a futura troca por chamadas HTTP reais não exija mudanças de tela. O ponto
único dessa troca é `src/api/client.ts`.
