# HelpTap Web — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** SPA React que exibe dados de paciente filtrados por perfil (RBAC) a partir da URL de uma pulseira NFC, com autenticação mockada pronta para trocar pelo back-end Spring Boot.

**Architecture:** Service layer em `src/api/` cujo miolo hoje é mock local (dados + handlers com filtragem RBAC e latência simulada). Componentes só renderizam o que a camada de API devolve — a filtragem por perfil NUNCA acontece em componente. Rotas protegidas por `RequireAuth`, que preserva o destino (`/pulseira/:uuid`) para redirecionar após o login.

**Tech Stack:** React 19 + Vite + TypeScript + Tailwind CSS v4 (`@tailwindcss/vite`) + React Router (react-router-dom v7) + lucide-react. Testes: Vitest + Testing Library + jsdom.

**Spec:** `docs/superpowers/specs/2026-08-03-helptap-web-design.md`
**Protótipo de referência (visual):** `/Users/flavim/Downloads/Web.png`

## Global Constraints

- Toda a UI em pt-BR; commits em português no padrão convencional (`feat:`, `test:`, `chore:`)
- Nenhuma chamada de rede: toda a camada de dados é mock local em `src/api/mock/`
- Filtragem RBAC acontece exclusivamente em `src/api/mock/handlers.ts` (espelha o back-end futuro)
- Tailwind v4: tema via `@theme` no `src/index.css`; NÃO existe `tailwind.config.js`
- Cores: fundo `bg-creme` (#f7f5ec), marca `brand` (#14b8a6, teal); vermelho reservado a criticidade
- Acessibilidade: todo `<input>` com `<label>` associado; ícones lucide sempre com `aria-hidden` e texto adjacente; mensagens de erro com `role="alert"`
- Props de perfil chamam-se `perfil` (nunca `role`, que conflita com o atributo ARIA)
- Chaves de sessionStorage: `helptap.sessao` (sessão) e `helptap.destino` (redirect pós-login)

---

### Task 1: Scaffold do projeto (Vite + Tailwind + Vitest)

**Files:**
- Create: `package.json`, `vite.config.ts`, `tsconfig.json`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`, `src/index.css`, `src/test/setup.ts`
- Test: `src/App.test.tsx`

**Interfaces:**
- Produces: projeto que roda com `npm run dev`, testa com `npm test` e faz typecheck com `npm run typecheck`. Tokens Tailwind `bg-creme` e `text-brand`/`bg-brand` disponíveis.

- [ ] **Step 1: Inicializar npm e instalar dependências**

```bash
cd /Users/flavim/Projetos/HelpTap-Web
npm init -y
npm i react react-dom react-router-dom lucide-react
npm i -D vite @vitejs/plugin-react typescript @types/react @types/react-dom \
  tailwindcss @tailwindcss/vite \
  vitest jsdom @testing-library/react @testing-library/jest-dom @testing-library/user-event
```

- [ ] **Step 2: Escrever os arquivos de configuração**

`.gitignore`:
```
node_modules
dist
*.local
```

`package.json` — substituir a seção `scripts` por:
```json
"scripts": {
  "dev": "vite",
  "build": "tsc --noEmit && vite build",
  "preview": "vite preview",
  "test": "vitest run",
  "test:watch": "vitest",
  "typecheck": "tsc --noEmit"
}
```
E adicionar `"type": "module"` na raiz do JSON.

`vite.config.ts`:
```ts
/// <reference types="vitest/config" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.ts',
  },
});
```

`tsconfig.json`:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true,
    "isolatedModules": true,
    "noEmit": true,
    "types": ["vite/client", "vitest/globals", "@testing-library/jest-dom"]
  },
  "include": ["src", "vite.config.ts"]
}
```

`index.html`:
```html
<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>HelpTap — Proteção em Emergências</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

`src/index.css`:
```css
@import "tailwindcss";

@theme {
  --color-creme: #f7f5ec;
  --color-brand: #14b8a6;
}
```

`src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

`src/App.tsx` (placeholder — vira tabela de rotas na Task 8):
```tsx
export default function App() {
  return <h1>HelpTap</h1>;
}
```

`src/test/setup.ts`:
```ts
import '@testing-library/jest-dom/vitest';
```

- [ ] **Step 3: Escrever o teste de fumaça**

`src/App.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import App from './App';

test('renderiza o app', () => {
  render(<App />);
  expect(screen.getByText('HelpTap')).toBeInTheDocument();
});
```

- [ ] **Step 4: Rodar testes e typecheck**

Run: `npm test && npm run typecheck`
Expected: 1 teste PASS, typecheck sem erros.

- [ ] **Step 5: Verificar que o dev server sobe**

Run: `npm run build`
Expected: build conclui sem erro (valida Tailwind + TS de ponta a ponta).

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "chore: scaffold Vite + React + Tailwind v4 + Vitest"
```

---

### Task 2: Tipos de domínio e configuração de perfis

**Files:**
- Create: `src/types/index.ts`, `src/styles/perfis.ts`
- Test: `src/styles/perfis.test.ts`

**Interfaces:**
- Produces (usado por TODAS as tasks seguintes):
  - Tipos: `Role`, `Criticidade`, `Alergia`, `Doenca`, `Transtorno`, `Deficiencia`, `FichaMedica`, `Identificacao`, `PacienteView`, `PacienteCompleto`, `Wearable`, `AccessLog`, `Sessao`, `Credenciais`, `CadastroProfissional`
  - `PERFIS: Role[]`, `PERFIS_CADASTRO: Role[]`, `PERFIL_CONFIG: Record<Role, PerfilInfo>`, `ehPerfil(v: string): v is Role`

- [ ] **Step 1: Escrever o teste**

`src/styles/perfis.test.ts`:
```ts
import { PERFIS, PERFIS_CADASTRO, PERFIL_CONFIG, ehPerfil } from './perfis';

test('há 4 perfis e todos têm configuração completa', () => {
  expect(PERFIS).toEqual(['medico', 'policial', 'bombeiro', 'usuario']);
  for (const p of PERFIS) {
    expect(PERFIL_CONFIG[p].titulo).toBeTruthy();
    expect(PERFIL_CONFIG[p].descricao).toBeTruthy();
    expect(PERFIL_CONFIG[p].gradiente).toContain('from-');
  }
});

test('usuário não tem cadastro profissional', () => {
  expect(PERFIS_CADASTRO).toEqual(['medico', 'policial', 'bombeiro']);
});

test('ehPerfil valida o parâmetro de rota', () => {
  expect(ehPerfil('medico')).toBe(true);
  expect(ehPerfil('xyz')).toBe(false);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/styles/perfis.test.ts`
Expected: FAIL — módulo `./perfis` não existe.

- [ ] **Step 3: Implementar os tipos**

`src/types/index.ts`:
```ts
export type Role = 'medico' | 'policial' | 'bombeiro' | 'usuario';

export type Criticidade = 'Baixa' | 'Media' | 'Alta';

export interface Alergia {
  nome: string;
  criticidade: Criticidade;
}

export interface Doenca {
  nome: string;
  /** espelha Illness.is_sensitive do artigo — visível apenas para médico/titular */
  sensivel: boolean;
}

export interface Transtorno {
  nome: string;
  observacao?: string;
}

export interface Deficiencia {
  nome: string;
}

export interface FichaMedica {
  tipoSanguineo: string;
  alturaCm: number;
  pesoKg: number;
  etnia: string;
  doadorOrgaos: boolean;
  observacoes?: string;
}

export interface Identificacao {
  cpf?: string;
  endereco?: string;
  telefoneResponsavel?: string;
  mae?: string;
  pai?: string;
}

/** O que a API devolve para /pulseira/:uuid — já filtrado por perfil */
export interface PacienteView {
  nome: string;
  idade: number;
  identificacao: Identificacao;
  fichaMedica?: FichaMedica;
  alergias?: Alergia[];
  doencas?: Doenca[];
  transtornos?: Transtorno[];
  deficiencias?: Deficiencia[];
}

/** Registro completo, existe apenas dentro do mock (papel do banco) */
export interface PacienteCompleto {
  id: string;
  nome: string;
  idade: number;
  cpf: string;
  endereco: string;
  telefoneResponsavel: string;
  mae: string;
  pai: string;
  fichaMedica: FichaMedica;
  alergias: Alergia[];
  doencas: Doenca[];
  transtornos: Transtorno[];
  deficiencias: Deficiencia[];
}

export interface Wearable {
  uuid: string;
  pacienteId: string;
  nome: string;
}

export interface AccessLog {
  wearableId: string;
  accessedAt: string; // ISO 8601
  role: Role;
  location: string;
}

export interface Sessao {
  token: string;
  role: Role;
  nome: string;
}

export interface Credenciais {
  email: string;
  senha: string;
}

export interface CadastroProfissional {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  /** CRM (médico) ou registro funcional (policial/bombeiro) */
  registro: string;
}
```

`src/styles/perfis.ts`:
```ts
import { Flame, Shield, Stethoscope, User, type LucideIcon } from 'lucide-react';
import type { Role } from '../types';

export interface PerfilInfo {
  titulo: string;
  acessoTitulo: string;
  descricao: string;
  gradiente: string; // classes tailwind from-.. to-..
  corSolida: string; // bg-*
  corTexto: string; // text-*
  registroLabel?: string;
  registroPlaceholder?: string;
  Icone: LucideIcon;
}

export const PERFIS: Role[] = ['medico', 'policial', 'bombeiro', 'usuario'];
export const PERFIS_CADASTRO: Role[] = ['medico', 'policial', 'bombeiro'];

export function ehPerfil(v: string): v is Role {
  return (PERFIS as string[]).includes(v);
}

export const PERFIL_CONFIG: Record<Role, PerfilInfo> = {
  medico: {
    titulo: 'Médico',
    acessoTitulo: 'Acesso Médico',
    descricao: 'Acesso completo com validação CRM',
    gradiente: 'from-blue-500 to-blue-600',
    corSolida: 'bg-blue-600',
    corTexto: 'text-blue-600',
    registroLabel: 'CRM',
    registroPlaceholder: 'CRM/UF 00000',
    Icone: Stethoscope,
  },
  policial: {
    titulo: 'Policial',
    acessoTitulo: 'Acesso Policial',
    descricao: 'Informações de identificação',
    gradiente: 'from-slate-700 to-slate-900',
    corSolida: 'bg-slate-700',
    corTexto: 'text-slate-700',
    registroLabel: 'Registro funcional',
    registroPlaceholder: '00000000',
    Icone: Shield,
  },
  bombeiro: {
    titulo: 'Bombeiro / Socorrista',
    acessoTitulo: 'Acesso Bombeiro / Socorrista',
    descricao: 'Informações de emergência',
    gradiente: 'from-orange-500 to-red-500',
    corSolida: 'bg-orange-600',
    corTexto: 'text-orange-600',
    registroLabel: 'Registro funcional',
    registroPlaceholder: '00000000',
    Icone: Flame,
  },
  usuario: {
    titulo: 'Próprio Usuário',
    acessoTitulo: 'Acesso Usuário',
    descricao: 'Acesse seus próprios dados de emergência',
    gradiente: 'from-teal-500 to-emerald-500',
    corSolida: 'bg-teal-600',
    corTexto: 'text-teal-600',
    Icone: User,
  },
};
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/styles/perfis.test.ts && npm run typecheck`
Expected: 3 testes PASS, typecheck limpo.

- [ ] **Step 5: Commit**

```bash
git add src/types src/styles && git commit -m "feat: tipos de domínio e configuração dos perfis de acesso"
```

---

### Task 3: Dados mockados + filtro RBAC

**Files:**
- Create: `src/api/mock/data.ts`, `src/api/mock/handlers.ts`
- Test: `src/api/mock/handlers.test.ts`

**Interfaces:**
- Consumes: tipos da Task 2
- Produces:
  - `data.ts`: `pacientesMock: PacienteCompleto[]`, `wearablesMock: Wearable[]`, `usuariosMock: UsuarioMock[]` (com `interface UsuarioMock { email: string; senha: string; role: Role; nome: string }`)
  - `handlers.ts`: `filtrarPacientePorRole(p: PacienteCompleto, role: Role): PacienteView`
  - UUIDs de demo: Rafael `550e8400-e29b-41d4-a716-446655440001`, Ana Clara `550e8400-e29b-41d4-a716-446655440002`

- [ ] **Step 1: Escrever os testes do filtro RBAC (a regra central do sistema)**

`src/api/mock/handlers.test.ts`:
```ts
import { filtrarPacientePorRole } from './handlers';
import { pacientesMock } from './data';

const rafael = pacientesMock[0]; // tem doença sensível e ficha completa
const anaClara = pacientesMock[1]; // tem TEA (transtorno)

test('médico recebe o prontuário completo', () => {
  const v = filtrarPacientePorRole(rafael, 'medico');
  expect(v.identificacao.cpf).toBe(rafael.cpf);
  expect(v.identificacao.mae).toBe(rafael.mae);
  expect(v.fichaMedica?.observacoes).toBeTruthy();
  expect(v.alergias).toHaveLength(rafael.alergias.length);
  expect(v.doencas?.some((d) => d.sensivel)).toBe(true);
  expect(filtrarPacientePorRole(anaClara, 'medico').transtornos?.length).toBeGreaterThan(0);
});

test('policial recebe SOMENTE identificação civil — nunca dados clínicos', () => {
  const v = filtrarPacientePorRole(rafael, 'policial');
  expect(v.identificacao.cpf).toBe(rafael.cpf);
  expect(v.identificacao.mae).toBe(rafael.mae);
  expect(v.fichaMedica).toBeUndefined();
  expect(v.alergias).toBeUndefined();
  expect(v.doencas).toBeUndefined();
  expect(v.transtornos).toBeUndefined();
});

test('bombeiro recebe ficha essencial sem CPF, sem filiação, sem dados sensíveis', () => {
  const v = filtrarPacientePorRole(rafael, 'bombeiro');
  expect(v.identificacao.cpf).toBeUndefined();
  expect(v.identificacao.mae).toBeUndefined();
  expect(v.identificacao.endereco).toBe(rafael.endereco);
  expect(v.fichaMedica?.tipoSanguineo).toBe(rafael.fichaMedica.tipoSanguineo);
  expect(v.alergias).toHaveLength(rafael.alergias.length);
  expect(v.doencas?.every((d) => !d.sensivel)).toBe(true);
  expect(filtrarPacientePorRole(anaClara, 'bombeiro').transtornos).toBeUndefined();
});

test('titular (usuario) vê os próprios dados completos', () => {
  const v = filtrarPacientePorRole(rafael, 'usuario');
  expect(v.identificacao.cpf).toBe(rafael.cpf);
  expect(v.fichaMedica).toBeDefined();
  expect(v.doencas?.some((d) => d.sensivel)).toBe(true);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/api/mock/handlers.test.ts`
Expected: FAIL — módulos não existem.

- [ ] **Step 3: Implementar dados e filtro**

`src/api/mock/data.ts`:
```ts
import type { PacienteCompleto, Role, Wearable } from '../../types';

export interface UsuarioMock {
  email: string;
  senha: string;
  role: Role;
  nome: string;
}

export const usuariosMock: UsuarioMock[] = [
  { email: 'medico@helptap.com', senha: '123456', role: 'medico', nome: 'Dra. Carla Mendes' },
  { email: 'policial@helptap.com', senha: '123456', role: 'policial', nome: 'Sgt. Paulo Lima' },
  { email: 'bombeiro@helptap.com', senha: '123456', role: 'bombeiro', nome: 'Cb. Marcos Dias' },
  { email: 'rafael@helptap.com', senha: '123456', role: 'usuario', nome: 'Rafael Andrade' },
];

export const pacientesMock: PacienteCompleto[] = [
  {
    id: 'p1',
    nome: 'Rafael Andrade',
    idade: 22,
    cpf: '123.456.789-00',
    endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    telefoneResponsavel: '(16) 99223-5555',
    mae: 'Ana Santos',
    pai: 'José Santos',
    fichaMedica: {
      tipoSanguineo: 'O+',
      alturaCm: 165,
      pesoKg: 68,
      etnia: 'Branco',
      doadorOrgaos: true,
      observacoes:
        'Paciente com histórico cardiovascular. Necessita acompanhamento contínuo.',
    },
    alergias: [{ nome: 'Dipirona', criticidade: 'Alta' }],
    doencas: [
      { nome: 'Hipertensão', sensivel: false },
      { nome: 'HIV positivo', sensivel: true },
    ],
    transtornos: [],
    deficiencias: [],
  },
  {
    id: 'p2',
    nome: 'Ana Clara Souza',
    idade: 12,
    cpf: '987.654.321-00',
    endereco: 'Av. Brasil, 456 - Jardim América, Franca - SP',
    telefoneResponsavel: '(16) 98877-1234',
    mae: 'Mariana Souza',
    pai: 'Carlos Souza',
    fichaMedica: {
      tipoSanguineo: 'A-',
      alturaCm: 148,
      pesoKg: 40,
      etnia: 'Parda',
      doadorOrgaos: false,
    },
    alergias: [
      { nome: 'Amendoim', criticidade: 'Alta' },
      { nome: 'Poeira', criticidade: 'Baixa' },
    ],
    doencas: [{ nome: 'Asma', sensivel: false }],
    transtornos: [
      {
        nome: 'Transtorno do Espectro Autista — nível 2',
        observacao: 'Hipersensibilidade sensorial. Abordar com redução de estímulos.',
      },
    ],
    deficiencias: [],
  },
];

export const wearablesMock: Wearable[] = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655440001',
    pacienteId: 'p1',
    nome: 'Pulseira de Rafael Andrade',
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440002',
    pacienteId: 'p2',
    nome: 'Pulseira de Ana Clara Souza',
  },
];
```

`src/api/mock/handlers.ts` (nesta task só o filtro; auth e leitura vêm nas Tasks 4–5):
```ts
import type { PacienteCompleto, PacienteView, Role } from '../../types';

/**
 * Espelha a filtragem que o Spring Security + camada de serviços fará no
 * back-end real. Componentes NUNCA filtram — só renderizam o que chega.
 */
export function filtrarPacientePorRole(p: PacienteCompleto, role: Role): PacienteView {
  const base = { nome: p.nome, idade: p.idade };
  switch (role) {
    case 'medico':
    case 'usuario':
      return {
        ...base,
        identificacao: {
          cpf: p.cpf,
          endereco: p.endereco,
          telefoneResponsavel: p.telefoneResponsavel,
          mae: p.mae,
          pai: p.pai,
        },
        fichaMedica: p.fichaMedica,
        alergias: p.alergias,
        doencas: p.doencas,
        transtornos: p.transtornos,
        deficiencias: p.deficiencias,
      };
    case 'policial':
      return {
        ...base,
        identificacao: {
          cpf: p.cpf,
          endereco: p.endereco,
          telefoneResponsavel: p.telefoneResponsavel,
          mae: p.mae,
          pai: p.pai,
        },
      };
    case 'bombeiro':
      return {
        ...base,
        identificacao: {
          endereco: p.endereco,
          telefoneResponsavel: p.telefoneResponsavel,
        },
        fichaMedica: p.fichaMedica,
        alergias: p.alergias,
        doencas: p.doencas.filter((d) => !d.sensivel),
        deficiencias: p.deficiencias,
      };
  }
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/api/mock/handlers.test.ts && npm run typecheck`
Expected: 4 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api && git commit -m "feat: dados mockados e filtragem RBAC por perfil"
```

---

### Task 4: Autenticação mock + validação de registro profissional

**Files:**
- Modify: `src/api/mock/handlers.ts` (adicionar ao final)
- Test: `src/api/mock/auth.test.ts`

**Interfaces:**
- Consumes: `usuariosMock`, tipos `Sessao`, `Credenciais`, `CadastroProfissional`
- Produces (em `handlers.ts`):
  - `mockLogin(role: Role, credenciais: Credenciais): Promise<Sessao>` — rejeita com `Error('E-mail ou senha inválidos')`
  - `validarRegistro(role: Role, registro: string): boolean`
  - `mockCadastro(role: Role, dados: CadastroProfissional): Promise<Sessao>` — rejeita com `Error('Registro profissional inválido')` ou `Error('E-mail já cadastrado')`
  - `LATENCIA_MS` (0 em teste, 400 no navegador) e `delay()`

- [ ] **Step 1: Escrever os testes**

`src/api/mock/auth.test.ts`:
```ts
import { mockLogin, mockCadastro, validarRegistro } from './handlers';

test('login com credenciais válidas devolve sessão com role e nome', async () => {
  const s = await mockLogin('medico', { email: 'medico@helptap.com', senha: '123456' });
  expect(s.role).toBe('medico');
  expect(s.nome).toBe('Dra. Carla Mendes');
  expect(s.token).toBeTruthy();
});

test('login com senha errada rejeita', async () => {
  await expect(
    mockLogin('medico', { email: 'medico@helptap.com', senha: 'errada' }),
  ).rejects.toThrow('E-mail ou senha inválidos');
});

test('login exige que o e-mail pertença ao perfil escolhido', async () => {
  await expect(
    mockLogin('policial', { email: 'medico@helptap.com', senha: '123456' }),
  ).rejects.toThrow('E-mail ou senha inválidos');
});

test('validarRegistro aceita CRM no formato CRM/UF 00000 e registros funcionais numéricos', () => {
  expect(validarRegistro('medico', 'CRM/SP 12345')).toBe(true);
  expect(validarRegistro('medico', '12345')).toBe(false);
  expect(validarRegistro('policial', '12345678')).toBe(true);
  expect(validarRegistro('bombeiro', 'abc')).toBe(false);
});

test('cadastro com registro inválido rejeita; com registro válido cria conta e permite login', async () => {
  const dados = {
    nome: 'Dr. Novo',
    email: 'novo@helptap.com',
    telefone: '(16) 90000-0000',
    senha: 'senha123',
    registro: 'CRM/SP 54321',
  };
  await expect(mockCadastro('medico', { ...dados, registro: 'xx' })).rejects.toThrow(
    'Registro profissional inválido',
  );
  const s = await mockCadastro('medico', dados);
  expect(s.role).toBe('medico');
  const login = await mockLogin('medico', { email: dados.email, senha: dados.senha });
  expect(login.nome).toBe('Dr. Novo');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/api/mock/auth.test.ts`
Expected: FAIL — funções não exportadas.

- [ ] **Step 3: Implementar (adicionar ao final de `handlers.ts`)**

```ts
import type { CadastroProfissional, Credenciais, Sessao } from '../../types';
import { usuariosMock } from './data';
// (mesclar imports com os já existentes no topo do arquivo)

/** Latência artificial que simula a rede; zerada nos testes. */
export const LATENCIA_MS = import.meta.env.MODE === 'test' ? 0 : 400;
export const delay = () => new Promise((r) => setTimeout(r, LATENCIA_MS));

function novaSessao(role: Role, nome: string): Sessao {
  return { token: `mock-jwt-${role}-${Date.now()}`, role, nome };
}

export async function mockLogin(role: Role, credenciais: Credenciais): Promise<Sessao> {
  await delay();
  const usuario = usuariosMock.find(
    (u) => u.role === role && u.email === credenciais.email && u.senha === credenciais.senha,
  );
  if (!usuario) throw new Error('E-mail ou senha inválidos');
  return novaSessao(usuario.role, usuario.nome);
}

/**
 * Simula a API mockada de validação de credenciais profissionais do artigo
 * (CRM para médicos, registros funcionais para policiais e bombeiros).
 */
export function validarRegistro(role: Role, registro: string): boolean {
  if (role === 'medico') return /^CRM\/[A-Z]{2}\s?\d{4,6}$/i.test(registro.trim());
  return /^\d{5,8}$/.test(registro.trim());
}

export async function mockCadastro(role: Role, dados: CadastroProfissional): Promise<Sessao> {
  await delay();
  if (!validarRegistro(role, dados.registro)) {
    throw new Error('Registro profissional inválido');
  }
  if (usuariosMock.some((u) => u.email === dados.email)) {
    throw new Error('E-mail já cadastrado');
  }
  usuariosMock.push({ email: dados.email, senha: dados.senha, role, nome: dados.nome });
  return novaSessao(role, dados.nome);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/api/mock && npm run typecheck`
Expected: todos PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api && git commit -m "feat: autenticação mock com validação de registro profissional"
```

---

### Task 5: Leitura de paciente + AccessLog + service layer

**Files:**
- Modify: `src/api/mock/handlers.ts` (adicionar ao final)
- Create: `src/api/client.ts`, `src/api/auth.ts`, `src/api/paciente.ts`
- Test: `src/api/paciente.test.ts`

**Interfaces:**
- Consumes: Tasks 3–4
- Produces (a interface pública que as páginas usam — NUNCA importar `handlers.ts` de página):
  - `api/auth.ts`: `login(perfil: Role, credenciais: Credenciais): Promise<Sessao>`, `cadastrar(perfil: Role, dados: CadastroProfissional): Promise<Sessao>`
  - `api/paciente.ts`: `getPacienteByUuid(uuid: string, perfil: Role): Promise<PacienteView>` — rejeita com `Error('PULSEIRA_NAO_ENCONTRADA')`
  - `handlers.ts`: `accessLogs: AccessLog[]`, `mockGetPaciente(uuid, role)`

- [ ] **Step 1: Escrever os testes**

`src/api/paciente.test.ts`:
```ts
import { getPacienteByUuid } from './paciente';
import { accessLogs } from './mock/handlers';

const UUID_RAFAEL = '550e8400-e29b-41d4-a716-446655440001';

test('devolve o paciente filtrado pelo perfil', async () => {
  const v = await getPacienteByUuid(UUID_RAFAEL, 'policial');
  expect(v.nome).toBe('Rafael Andrade');
  expect(v.fichaMedica).toBeUndefined(); // policial não vê dados clínicos
});

test('uuid desconhecido rejeita com PULSEIRA_NAO_ENCONTRADA', async () => {
  await expect(getPacienteByUuid('nao-existe', 'medico')).rejects.toThrow(
    'PULSEIRA_NAO_ENCONTRADA',
  );
});

test('cada leitura grava um AccessLog com role e wearableId', async () => {
  const antes = accessLogs.length;
  await getPacienteByUuid(UUID_RAFAEL, 'bombeiro');
  expect(accessLogs).toHaveLength(antes + 1);
  const log = accessLogs[accessLogs.length - 1];
  expect(log.wearableId).toBe(UUID_RAFAEL);
  expect(log.role).toBe('bombeiro');
  expect(log.accessedAt).toBeTruthy();
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/api/paciente.test.ts`
Expected: FAIL — módulos não existem.

- [ ] **Step 3: Implementar**

Adicionar ao final de `src/api/mock/handlers.ts`:
```ts
import type { AccessLog, PacienteView } from '../../types';
import { pacientesMock, wearablesMock } from './data';
// (mesclar com imports existentes)

/** Trilha de auditoria exigida pela LGPD — entidade AccessLog do artigo. */
export const accessLogs: AccessLog[] = [];

export async function mockGetPaciente(uuid: string, role: Role): Promise<PacienteView> {
  await delay();
  const wearable = wearablesMock.find((w) => w.uuid === uuid);
  const paciente = wearable && pacientesMock.find((p) => p.id === wearable.pacienteId);
  if (!wearable || !paciente) throw new Error('PULSEIRA_NAO_ENCONTRADA');
  accessLogs.push({
    wearableId: wearable.uuid,
    accessedAt: new Date().toISOString(),
    role,
    location: 'São Paulo - SP (simulado)',
  });
  return filtrarPacientePorRole(paciente, role);
}
```

`src/api/client.ts`:
```ts
/**
 * Ponto único de troca mock → back-end real.
 * Quando a API Spring Boot estiver pronta, defina VITE_API_URL no .env
 * e substitua o miolo de auth.ts e paciente.ts por fetch(`${API_URL}/...`).
 * As assinaturas das funções NÃO mudam — nenhuma página é alterada.
 */
export const API_URL: string | undefined = import.meta.env.VITE_API_URL;
```

`src/api/auth.ts`:
```ts
import type { CadastroProfissional, Credenciais, Role, Sessao } from '../types';
import { mockCadastro, mockLogin } from './mock/handlers';

export function login(perfil: Role, credenciais: Credenciais): Promise<Sessao> {
  return mockLogin(perfil, credenciais);
}

export function cadastrar(perfil: Role, dados: CadastroProfissional): Promise<Sessao> {
  return mockCadastro(perfil, dados);
}
```

`src/api/paciente.ts`:
```ts
import type { PacienteView, Role } from '../types';
import { mockGetPaciente } from './mock/handlers';

export function getPacienteByUuid(uuid: string, perfil: Role): Promise<PacienteView> {
  return mockGetPaciente(uuid, perfil);
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test && npm run typecheck`
Expected: todos PASS.

- [ ] **Step 5: Commit**

```bash
git add src/api && git commit -m "feat: service layer com leitura de pulseira e trilha de auditoria"
```

---

### Task 6: AuthContext + RequireAuth

**Files:**
- Create: `src/contexts/AuthContext.tsx`, `src/components/RequireAuth.tsx`
- Test: `src/contexts/AuthContext.test.tsx`

**Interfaces:**
- Consumes: tipo `Sessao`
- Produces:
  - `AuthProvider({ children })`, `useAuth(): { sessao: Sessao | null; entrar(s: Sessao): void; sair(): void }`
  - `RequireAuth({ children })` — sem sessão: grava `location.pathname` em `sessionStorage['helptap.destino']` e redireciona para `/`
  - Chaves: `helptap.sessao`, `helptap.destino`

- [ ] **Step 1: Escrever os testes**

`src/contexts/AuthContext.test.tsx`:
```tsx
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthContext';
import { RequireAuth } from '../components/RequireAuth';
import type { Sessao } from '../types';

const sessaoFake: Sessao = { token: 't', role: 'medico', nome: 'Dra. Carla' };

beforeEach(() => sessionStorage.clear());

function Cenario({ inicial }: { inicial: string }) {
  return (
    <MemoryRouter initialEntries={[inicial]}>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<p>Seleção de perfil</p>} />
          <Route
            path="/pulseira/:uuid"
            element={
              <RequireAuth>
                <p>Tela do paciente</p>
              </RequireAuth>
            }
          />
        </Routes>
      </AuthProvider>
    </MemoryRouter>
  );
}

test('sem sessão, redireciona para / e guarda o destino', () => {
  render(<Cenario inicial="/pulseira/abc-123" />);
  expect(screen.getByText('Seleção de perfil')).toBeInTheDocument();
  expect(sessionStorage.getItem('helptap.destino')).toBe('/pulseira/abc-123');
});

test('com sessão persistida, renderiza a rota protegida', () => {
  sessionStorage.setItem('helptap.sessao', JSON.stringify(sessaoFake));
  render(<Cenario inicial="/pulseira/abc-123" />);
  expect(screen.getByText('Tela do paciente')).toBeInTheDocument();
});

test('entrar persiste a sessão e sair limpa', () => {
  function Sonda() {
    const { sessao, entrar, sair } = useAuth();
    return (
      <div>
        <p>{sessao ? sessao.nome : 'anônimo'}</p>
        <button onClick={() => entrar(sessaoFake)}>entrar</button>
        <button onClick={() => sair()}>sair</button>
      </div>
    );
  }
  render(
    <AuthProvider>
      <Sonda />
    </AuthProvider>,
  );
  fireEvent.click(screen.getByText('entrar'));
  expect(sessionStorage.getItem('helptap.sessao')).toContain('Dra. Carla');
  fireEvent.click(screen.getByText('sair'));
  expect(sessionStorage.getItem('helptap.sessao')).toBeNull();
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/contexts/AuthContext.test.tsx`
Expected: FAIL — módulos não existem.

- [ ] **Step 3: Implementar**

`src/contexts/AuthContext.tsx`:
```tsx
import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Sessao } from '../types';

const CHAVE_SESSAO = 'helptap.sessao';

interface AuthContextValue {
  sessao: Sessao | null;
  entrar: (s: Sessao) => void;
  sair: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [sessao, setSessao] = useState<Sessao | null>(() => {
    const salvo = sessionStorage.getItem(CHAVE_SESSAO);
    return salvo ? (JSON.parse(salvo) as Sessao) : null;
  });

  const entrar = (s: Sessao) => {
    sessionStorage.setItem(CHAVE_SESSAO, JSON.stringify(s));
    setSessao(s);
  };

  const sair = () => {
    sessionStorage.removeItem(CHAVE_SESSAO);
    setSessao(null);
  };

  return <AuthContext.Provider value={{ sessao, entrar, sair }}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider');
  return ctx;
}
```

`src/components/RequireAuth.tsx`:
```tsx
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import { useAuth } from '../contexts/AuthContext';

export function RequireAuth({ children }: { children: ReactNode }) {
  const { sessao } = useAuth();
  const location = useLocation();
  if (!sessao) {
    sessionStorage.setItem('helptap.destino', location.pathname);
    return <Navigate to="/" replace />;
  }
  return children;
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/contexts && npm run typecheck`
Expected: 3 testes PASS.

- [ ] **Step 5: Commit**

```bash
git add src/contexts src/components && git commit -m "feat: contexto de autenticação e guarda de rota com destino preservado"
```

---

### Task 7: Componentes de UI base

**Files:**
- Create: `src/components/InputComIcone.tsx`, `src/components/BotaoPerfil.tsx`, `src/components/CardSecao.tsx`, `src/components/BadgeCriticidade.tsx`, `src/components/PerfilCard.tsx`
- Test: `src/components/ui.test.tsx`

**Interfaces:**
- Consumes: `PERFIL_CONFIG`, tipos `Role`, `Criticidade`
- Produces (assinaturas exatas usadas pelas páginas):
  - `InputComIcone({ label: string; Icone: LucideIcon; ...props de <input> })`
  - `BotaoPerfil({ perfil: Role; ...props de <button> })`
  - `CardSecao({ titulo: string; Icone: LucideIcon; children })`
  - `BadgeCriticidade({ nivel: Criticidade })` — exibe "Média" com acento
  - `PerfilCard({ perfil: Role })` — `<Link>` para `/login/:perfil`

- [ ] **Step 1: Escrever os testes**

`src/components/ui.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { Mail } from 'lucide-react';
import { InputComIcone } from './InputComIcone';
import { BadgeCriticidade } from './BadgeCriticidade';
import { PerfilCard } from './PerfilCard';

test('InputComIcone associa label ao input', () => {
  render(<InputComIcone label="E-mail" Icone={Mail} type="email" />);
  expect(screen.getByLabelText('E-mail')).toBeInTheDocument();
});

test('BadgeCriticidade exibe o nível com acento', () => {
  render(<BadgeCriticidade nivel="Media" />);
  expect(screen.getByText('Média')).toBeInTheDocument();
});

test('PerfilCard aponta para a tela de login do perfil', () => {
  render(
    <MemoryRouter>
      <PerfilCard perfil="medico" />
    </MemoryRouter>,
  );
  const link = screen.getByRole('link', { name: /médico/i });
  expect(link).toHaveAttribute('href', '/login/medico');
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/components/ui.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar os 5 componentes**

`src/components/InputComIcone.tsx`:
```tsx
import { useId, type InputHTMLAttributes } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  Icone: LucideIcon;
}

export function InputComIcone({ label, Icone, ...props }: Props) {
  const id = useId();
  return (
    <div className="flex flex-col gap-1.5 text-left">
      <label htmlFor={id} className="text-sm font-medium text-slate-600">
        {label}
      </label>
      <div className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2.5 focus-within:ring-2 focus-within:ring-brand">
        <Icone aria-hidden className="size-4 shrink-0 text-slate-400" />
        <input
          id={id}
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
          {...props}
        />
      </div>
    </div>
  );
}
```

`src/components/BotaoPerfil.tsx`:
```tsx
import type { ButtonHTMLAttributes } from 'react';
import type { Role } from '../types';
import { PERFIL_CONFIG } from '../styles/perfis';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  perfil: Role;
}

export function BotaoPerfil({ perfil, children, ...props }: Props) {
  const cfg = PERFIL_CONFIG[perfil];
  return (
    <button
      className={`w-full rounded-lg bg-gradient-to-r ${cfg.gradiente} px-4 py-2.5 text-sm font-semibold text-white shadow transition hover:opacity-90 focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50`}
      {...props}
    >
      {children}
    </button>
  );
}
```

`src/components/CardSecao.tsx`:
```tsx
import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  titulo: string;
  Icone: LucideIcon;
  children: ReactNode;
}

export function CardSecao({ titulo, Icone, children }: Props) {
  return (
    <section aria-label={titulo} className="rounded-xl bg-white p-4 shadow-sm">
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
        <Icone aria-hidden className="size-4 text-brand" />
        {titulo}
      </h2>
      {children}
    </section>
  );
}
```

`src/components/BadgeCriticidade.tsx`:
```tsx
import type { Criticidade } from '../types';

const CORES: Record<Criticidade, string> = {
  Alta: 'bg-red-100 text-red-700',
  Media: 'bg-amber-100 text-amber-700',
  Baixa: 'bg-emerald-100 text-emerald-700',
};

const ROTULOS: Record<Criticidade, string> = { Alta: 'Alta', Media: 'Média', Baixa: 'Baixa' };

export function BadgeCriticidade({ nivel }: { nivel: Criticidade }) {
  return (
    <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${CORES[nivel]}`}>
      {ROTULOS[nivel]}
    </span>
  );
}
```

`src/components/PerfilCard.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Role } from '../types';
import { PERFIL_CONFIG } from '../styles/perfis';

export function PerfilCard({ perfil }: { perfil: Role }) {
  const cfg = PERFIL_CONFIG[perfil];
  const Icone = cfg.Icone;
  return (
    <Link
      to={`/login/${perfil}`}
      className={`flex items-center gap-3 rounded-xl bg-gradient-to-r ${cfg.gradiente} p-4 text-left text-white shadow-md transition hover:scale-[1.01] focus-visible:ring-2 focus-visible:ring-offset-2`}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-white/20">
        <Icone aria-hidden className="size-5" />
      </span>
      <span className="flex-1">
        <span className="block font-semibold">{cfg.titulo}</span>
        <span className="block text-xs text-white/80">{cfg.descricao}</span>
      </span>
      <ChevronRight aria-hidden className="size-5 shrink-0" />
    </Link>
  );
}
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npx vitest run src/components && npm run typecheck`
Expected: todos PASS.

- [ ] **Step 5: Commit**

```bash
git add src/components && git commit -m "feat: componentes de UI base (inputs, botões, cartões e badges)"
```

---

### Task 8: Tabela de rotas + Seleção de Perfil + 404

**Files:**
- Create: `src/pages/SelecaoPerfil.tsx`, `src/pages/NotFound.tsx`
- Modify: `src/App.tsx` (tabela de rotas), `src/main.tsx` (BrowserRouter + AuthProvider), `src/App.test.tsx` (reescrever)

**Interfaces:**
- Consumes: `PerfilCard`, `PERFIS`, `PERFIS_CADASTRO`, `PERFIL_CONFIG`, `AuthProvider`
- Produces: `App` com rotas `/`, `*` (as demais entram nas Tasks 9–12); páginas `SelecaoPerfil` e `NotFound` (default exports)

- [ ] **Step 1: Reescrever `src/App.test.tsx`**

```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

function renderEm(rota: string) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('a raiz mostra os 4 perfis e os botões de cadastro profissional', () => {
  renderEm('/');
  expect(screen.getByRole('heading', { name: /entrar no/i })).toBeInTheDocument();
  // regex ancorado em ^: o nome acessível do cartão começa com o título do perfil,
  // enquanto "Cadastrar Médico" não — evita match duplo
  expect(screen.getByRole('link', { name: /^médico/i })).toHaveAttribute('href', '/login/medico');
  expect(screen.getByRole('link', { name: /^policial/i })).toHaveAttribute('href', '/login/policial');
  expect(screen.getByRole('link', { name: /^bombeiro/i })).toHaveAttribute('href', '/login/bombeiro');
  expect(screen.getByRole('link', { name: /^próprio usuário/i })).toHaveAttribute('href', '/login/usuario');
  expect(screen.getByRole('link', { name: 'Cadastrar Médico' })).toHaveAttribute('href', '/cadastro/medico');
});

test('rota desconhecida cai no 404', () => {
  renderEm('/qualquer-coisa');
  expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/App.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/pages/NotFound.tsx`:
```tsx
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Página não encontrada</h1>
        <p className="mt-1 text-sm text-slate-500">O endereço acessado não existe.</p>
        <Link to="/" className="mt-4 inline-block text-brand underline">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
```

`src/pages/SelecaoPerfil.tsx`:
```tsx
import { Link } from 'react-router-dom';
import { HandHeart } from 'lucide-react';
import { PerfilCard } from '../components/PerfilCard';
import { PERFIS, PERFIS_CADASTRO, PERFIL_CONFIG } from '../styles/perfis';

export default function SelecaoPerfil() {
  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-md text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10">
          <HandHeart aria-hidden className="size-7 text-brand" />
        </span>
        <h1 className="mt-4 text-2xl font-bold text-slate-800">
          Entrar no <span className="text-brand">HelpTap</span>
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Selecione seu perfil de acesso para visualizar informações de emergência
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {PERFIS.map((p) => (
            <PerfilCard key={p} perfil={p} />
          ))}
        </div>
        <p className="mt-8 text-xs text-slate-500">Profissional ainda não cadastrado?</p>
        <div className="mt-2 flex flex-wrap justify-center gap-2">
          {PERFIS_CADASTRO.map((p) => (
            <Link
              key={p}
              to={`/cadastro/${p}`}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 ${PERFIL_CONFIG[p].corSolida}`}
            >
              Cadastrar {PERFIL_CONFIG[p].titulo}
            </Link>
          ))}
        </div>
        <p className="mt-8 text-[10px] text-slate-400">© 2026 HelpTap · Proteção em Emergências</p>
      </div>
    </main>
  );
}
```

`src/App.tsx`:
```tsx
import { Routes, Route } from 'react-router-dom';
import SelecaoPerfil from './pages/SelecaoPerfil';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-creme text-slate-800">
      <Routes>
        <Route path="/" element={<SelecaoPerfil />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
```

`src/main.tsx`:
```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test && npm run typecheck`
Expected: todos PASS.

- [ ] **Step 5: Conferir no navegador**

Run: `npm run dev` e abrir http://localhost:5173 — comparar com o protótipo (`/Users/flavim/Downloads/Web.png`): fundo creme, 4 cartões com gradiente, botões de cadastro.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: tabela de rotas com seleção de perfil e página 404"
```

---

### Task 9: Página de Login por perfil

**Files:**
- Create: `src/pages/Login.tsx`
- Modify: `src/App.tsx` (adicionar rota `/login/:perfil`)
- Test: `src/pages/Login.test.tsx`

**Interfaces:**
- Consumes: `login` (api/auth), `useAuth`, `InputComIcone`, `BotaoPerfil`, `PERFIL_CONFIG`, `ehPerfil`, `NotFound`
- Produces: página `Login` (default export). Pós-login: navega para `sessionStorage['helptap.destino']` (removendo a chave) ou `/leitura`.

- [ ] **Step 1: Escrever os testes**

`src/pages/Login.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

beforeEach(() => sessionStorage.clear());

function renderEm(rota: string) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('perfil inválido na URL mostra 404', () => {
  renderEm('/login/astronauta');
  expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument();
});

test('credenciais erradas mostram erro acessível', async () => {
  renderEm('/login/medico');
  await userEvent.type(screen.getByLabelText('E-mail'), 'medico@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'errada');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('E-mail ou senha inválidos');
});

test('login bem-sucedido leva ao destino guardado pela pulseira', async () => {
  sessionStorage.setItem(
    'helptap.destino',
    '/pulseira/550e8400-e29b-41d4-a716-446655440001',
  );
  renderEm('/login/medico');
  await userEvent.type(screen.getByLabelText('E-mail'), 'medico@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), '123456');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  expect(await screen.findByText('Rafael Andrade')).toBeInTheDocument();
  expect(sessionStorage.getItem('helptap.destino')).toBeNull();
});

test('usuário não tem link de cadastro', () => {
  renderEm('/login/usuario');
  expect(screen.queryByText(/cadastre-se/i)).not.toBeInTheDocument();
});
```

Nota: o 3º teste acima é a versão DEFINITIVA, mas depende da rota `/pulseira/:uuid` (Task 12). Nesta task, escreva-o na versão provisória abaixo (um destino inexistente prova que a navegação ocorreu via 404); a Task 12 o substitui pela versão definitiva:

```tsx
test('login bem-sucedido navega para o destino guardado', async () => {
  sessionStorage.setItem('helptap.destino', '/destino-teste');
  renderEm('/login/medico');
  await userEvent.type(screen.getByLabelText('E-mail'), 'medico@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), '123456');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
  // /destino-teste não existe -> 404 comprova que a navegação ocorreu
  expect(await screen.findByText(/página não encontrada/i)).toBeInTheDocument();
  expect(sessionStorage.getItem('helptap.destino')).toBeNull();
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/pages/Login.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/pages/Login.tsx`:
```tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Lock, Mail } from 'lucide-react';
import { login } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { InputComIcone } from '../components/InputComIcone';
import { BotaoPerfil } from '../components/BotaoPerfil';
import { PERFIL_CONFIG, ehPerfil } from '../styles/perfis';
import NotFound from './NotFound';

export default function Login() {
  const { perfil = '' } = useParams();
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (!ehPerfil(perfil)) return <NotFound />;
  const cfg = PERFIL_CONFIG[perfil];
  const Icone = cfg.Icone;

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!ehPerfil(perfil)) return;
    setErro('');
    setCarregando(true);
    try {
      const sessao = await login(perfil, { email, senha });
      entrar(sessao);
      const destino = sessionStorage.getItem('helptap.destino');
      sessionStorage.removeItem('helptap.destino');
      navigate(destino ?? '/leitura', { replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao entrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
          ← Início
        </Link>
        <div className="mt-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white shadow-sm">
            <Icone aria-hidden className={`size-6 ${cfg.corTexto}`} />
          </span>
          <h1 className="mt-3 text-xl font-bold">{cfg.acessoTitulo}</h1>
          <p className="mt-1 text-sm text-slate-500">Entre com suas credenciais</p>
        </div>
        <form onSubmit={aoEnviar} className="mt-6 flex flex-col gap-4">
          <InputComIcone
            label="E-mail"
            Icone={Mail}
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
          />
          <InputComIcone
            label="Senha"
            Icone={Lock}
            type="password"
            required
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••"
          />
          {erro && (
            <p role="alert" className="text-sm text-red-600">
              {erro}
            </p>
          )}
          <BotaoPerfil perfil={perfil} type="submit" disabled={carregando}>
            {carregando ? 'Entrando…' : 'Entrar'}
          </BotaoPerfil>
        </form>
        {perfil !== 'usuario' && (
          <p className="mt-4 text-center text-sm text-slate-600">
            Não tem uma conta?{' '}
            <Link to={`/cadastro/${perfil}`} className={`font-semibold ${cfg.corTexto}`}>
              Cadastre-se
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
```

Em `src/App.tsx`, adicionar antes da rota `*`:
```tsx
<Route path="/login/:perfil" element={<Login />} />
```
(com `import Login from './pages/Login';`)

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test && npm run typecheck`
Expected: todos PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: tela de login por perfil com redirecionamento pós-login"
```

---

### Task 10: Página de Cadastro profissional

**Files:**
- Create: `src/pages/Cadastro.tsx`
- Modify: `src/App.tsx` (rota `/cadastro/:perfil`)
- Test: `src/pages/Cadastro.test.tsx`

**Interfaces:**
- Consumes: `cadastrar` (api/auth), `useAuth`, `InputComIcone`, `BotaoPerfil`, `PERFIS_CADASTRO`, `PERFIL_CONFIG`, `ehPerfil`
- Produces: página `Cadastro` (default export). Perfil `usuario` ou inválido → 404. Sucesso → mesma navegação do login.

- [ ] **Step 1: Escrever os testes**

`src/pages/Cadastro.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';

beforeEach(() => sessionStorage.clear());

function renderEm(rota: string) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('usuário comum não tem cadastro na web', () => {
  renderEm('/cadastro/usuario');
  expect(screen.getByText(/página não encontrada/i)).toBeInTheDocument();
});

test('cadastro de médico exibe campo CRM e rejeita registro inválido', async () => {
  renderEm('/cadastro/medico');
  expect(screen.getByRole('heading', { name: 'Cadastro de Médico' })).toBeInTheDocument();
  await userEvent.type(screen.getByLabelText('Nome Completo'), 'Dr. Teste');
  await userEvent.type(screen.getByLabelText('Telefone'), '(16) 91111-1111');
  await userEvent.type(screen.getByLabelText('CRM'), 'abc');
  await userEvent.type(screen.getByLabelText('E-mail'), 'teste@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
  await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
  expect(await screen.findByRole('alert')).toHaveTextContent('Registro profissional inválido');
});

test('cadastro válido cria a conta e navega para /leitura', async () => {
  renderEm('/cadastro/bombeiro');
  await userEvent.type(screen.getByLabelText('Nome Completo'), 'Cb. Nova');
  await userEvent.type(screen.getByLabelText('Telefone'), '(16) 92222-2222');
  await userEvent.type(screen.getByLabelText('Registro funcional'), '1234567');
  await userEvent.type(screen.getByLabelText('E-mail'), 'nova@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), 'senha123');
  await userEvent.click(screen.getByRole('button', { name: 'Criar Conta' }));
  // /leitura ainda não existe (Task 11) -> por ora o 404 comprova a navegação;
  // a Task 11 troca esta asserção por: await screen.findByText(/leitura de pulseira/i)
  expect(await screen.findByText(/página não encontrada/i)).toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/pages/Cadastro.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/pages/Cadastro.tsx`:
```tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { BadgeCheck, Lock, Mail, Phone, UserRound } from 'lucide-react';
import { cadastrar } from '../api/auth';
import { useAuth } from '../contexts/AuthContext';
import { InputComIcone } from '../components/InputComIcone';
import { BotaoPerfil } from '../components/BotaoPerfil';
import { PERFIL_CONFIG, PERFIS_CADASTRO, ehPerfil } from '../styles/perfis';
import NotFound from './NotFound';

export default function Cadastro() {
  const { perfil = '' } = useParams();
  const navigate = useNavigate();
  const { entrar } = useAuth();
  const [form, setForm] = useState({ nome: '', telefone: '', registro: '', email: '', senha: '' });
  const [erro, setErro] = useState('');
  const [carregando, setCarregando] = useState(false);

  if (!ehPerfil(perfil) || !PERFIS_CADASTRO.includes(perfil)) return <NotFound />;
  const cfg = PERFIL_CONFIG[perfil];
  const Icone = cfg.Icone;

  const campo = (nome: keyof typeof form) => ({
    value: form[nome],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setForm((f) => ({ ...f, [nome]: e.target.value })),
  });

  async function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (!ehPerfil(perfil)) return;
    setErro('');
    setCarregando(true);
    try {
      const sessao = await cadastrar(perfil, form);
      entrar(sessao);
      const destino = sessionStorage.getItem('helptap.destino');
      sessionStorage.removeItem('helptap.destino');
      navigate(destino ?? '/leitura', { replace: true });
    } catch (err) {
      setErro(err instanceof Error ? err.message : 'Erro ao cadastrar');
    } finally {
      setCarregando(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm">
        <Link to="/" className="text-sm text-slate-500 hover:text-slate-700">
          ← Início
        </Link>
        <div className="mt-6 text-center">
          <span className="mx-auto grid size-12 place-items-center rounded-xl bg-white shadow-sm">
            <Icone aria-hidden className={`size-6 ${cfg.corTexto}`} />
          </span>
          <h1 className="mt-3 text-xl font-bold">Cadastro de {cfg.titulo}</h1>
          <p className="mt-1 text-sm text-slate-500">
            Preencha seus dados profissionais para validação
          </p>
        </div>
        <form onSubmit={aoEnviar} className="mt-6 flex flex-col gap-4">
          <InputComIcone label="Nome Completo" Icone={UserRound} required placeholder="Seu nome completo" {...campo('nome')} />
          <InputComIcone label="Telefone" Icone={Phone} required placeholder="(00) 00000-0000" {...campo('telefone')} />
          <InputComIcone
            label={cfg.registroLabel ?? 'Registro'}
            Icone={BadgeCheck}
            required
            placeholder={cfg.registroPlaceholder}
            {...campo('registro')}
          />
          <InputComIcone label="E-mail" Icone={Mail} type="email" required placeholder="seu@email.com" {...campo('email')} />
          <InputComIcone label="Senha" Icone={Lock} type="password" required minLength={6} placeholder="Mínimo 6 caracteres" {...campo('senha')} />
          {erro && (
            <p role="alert" className="text-sm text-red-600">
              {erro}
            </p>
          )}
          <BotaoPerfil perfil={perfil} type="submit" disabled={carregando}>
            {carregando ? 'Criando…' : 'Criar Conta'}
          </BotaoPerfil>
        </form>
        <p className="mt-4 text-center text-sm text-slate-600">
          Já tem conta?{' '}
          <Link to={`/login/${perfil}`} className={`font-semibold ${cfg.corTexto}`}>
            Fazer login
          </Link>
        </p>
      </div>
    </main>
  );
}
```

Em `src/App.tsx`, adicionar:
```tsx
<Route path="/cadastro/:perfil" element={<Cadastro />} />
```

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test && npm run typecheck`
Expected: todos PASS.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: cadastro profissional com validação de CRM e registro funcional"
```

---

### Task 11: Página Leitura (pós-login sem pulseira)

**Files:**
- Create: `src/pages/Leitura.tsx`
- Modify: `src/App.tsx` (rota `/leitura` com RequireAuth), `src/pages/Cadastro.test.tsx` (asserção definitiva)
- Test: `src/pages/Leitura.test.tsx`

**Interfaces:**
- Consumes: `useAuth`, `InputComIcone`, `BotaoPerfil`, `wearablesMock` (bloco de demonstração), `RequireAuth`
- Produces: página `Leitura` (default export) — submit navega para `/pulseira/<código digitado>`; botão "Sair" chama `sair()` e volta para `/`

- [ ] **Step 1: Escrever os testes**

`src/pages/Leitura.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';
import type { Sessao } from '../types';

const sessaoMedico: Sessao = { token: 't', role: 'medico', nome: 'Dra. Carla Mendes' };

beforeEach(() => {
  sessionStorage.clear();
  sessionStorage.setItem('helptap.sessao', JSON.stringify(sessaoMedico));
});

function renderEm(rota: string) {
  render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('mostra quem está conectado e as pulseiras de demonstração', () => {
  renderEm('/leitura');
  expect(screen.getByText(/dra\. carla mendes/i)).toBeInTheDocument();
  expect(screen.getByText('Pulseira de Rafael Andrade')).toBeInTheDocument();
});

test('submeter um código navega para /pulseira/:uuid', async () => {
  renderEm('/leitura');
  await userEvent.type(screen.getByLabelText('Código da pulseira'), 'abc-inexistente');
  await userEvent.click(screen.getByRole('button', { name: 'Abrir paciente' }));
  // rota /pulseira ainda não existe (Task 12) -> 404 comprova a navegação;
  // a Task 12 troca por: await screen.findByText(/pulseira não vinculada/i)
  expect(await screen.findByText(/página não encontrada/i)).toBeInTheDocument();
});

test('sem sessão, /leitura redireciona para a seleção de perfil', () => {
  sessionStorage.clear();
  renderEm('/leitura');
  expect(screen.getByRole('heading', { name: /entrar no/i })).toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/pages/Leitura.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/pages/Leitura.tsx`:
```tsx
import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Nfc } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { InputComIcone } from '../components/InputComIcone';
import { BotaoPerfil } from '../components/BotaoPerfil';
import { PERFIL_CONFIG } from '../styles/perfis';
import { wearablesMock } from '../api/mock/data';

export default function Leitura() {
  const [codigo, setCodigo] = useState('');
  const navigate = useNavigate();
  const { sessao, sair } = useAuth();
  if (!sessao) return null; // RequireAuth garante sessão; guarda de tipo

  function aoEnviar(e: FormEvent) {
    e.preventDefault();
    if (codigo.trim()) navigate(`/pulseira/${codigo.trim()}`);
  }

  return (
    <main className="grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-sm text-center">
        <span className="mx-auto grid size-14 place-items-center rounded-2xl bg-brand/10">
          <Nfc aria-hidden className="size-7 text-brand" />
        </span>
        <h1 className="mt-4 text-xl font-bold">Leitura de Pulseira</h1>
        <p className="mt-1 text-sm text-slate-500">
          Conectado como <strong>{sessao.nome}</strong> ({PERFIL_CONFIG[sessao.role].titulo}).
          Aproxime o celular da pulseira NFC ou digite o código abaixo.
        </p>
        <form onSubmit={aoEnviar} className="mt-6 flex flex-col gap-4">
          <InputComIcone
            label="Código da pulseira"
            Icone={Nfc}
            required
            value={codigo}
            onChange={(e) => setCodigo(e.target.value)}
            placeholder="UUID da pulseira"
          />
          <BotaoPerfil perfil={sessao.role} type="submit">
            Abrir paciente
          </BotaoPerfil>
        </form>
        {/* Bloco exclusivo de demonstração acadêmica — remover na integração real */}
        <div className="mt-8 rounded-xl bg-white p-4 text-left shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Pulseiras de demonstração
          </h2>
          <ul className="mt-2 flex flex-col gap-1 text-sm">
            {wearablesMock.map((w) => (
              <li key={w.uuid}>
                <Link to={`/pulseira/${w.uuid}`} className="text-brand underline">
                  {w.nome}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <button
          onClick={() => {
            sair();
            navigate('/');
          }}
          className="mt-6 text-sm text-slate-500 underline hover:text-slate-700"
        >
          Sair
        </button>
      </div>
    </main>
  );
}
```

Em `src/App.tsx`, adicionar:
```tsx
<Route
  path="/leitura"
  element={
    <RequireAuth>
      <Leitura />
    </RequireAuth>
  }
/>
```
(com `import Leitura from './pages/Leitura';` e `import { RequireAuth } from './components/RequireAuth';`)

Em `src/pages/Cadastro.test.tsx`, trocar a asserção final do 3º teste por:
```tsx
expect(await screen.findByText(/leitura de pulseira/i)).toBeInTheDocument();
```
(e remover o comentário sobre a Task 11)

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test && npm run typecheck`
Expected: todos PASS (incluindo o teste atualizado do Cadastro).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat: tela de leitura de pulseira com pulseiras de demonstração"
```

---

### Task 12: Página Pulseira — visualização do paciente por perfil

**Files:**
- Create: `src/pages/Pulseira.tsx`, `src/components/HeaderPaciente.tsx`
- Modify: `src/App.tsx` (rota `/pulseira/:uuid`), `src/pages/Login.test.tsx` e `src/pages/Leitura.test.tsx` (asserções definitivas)
- Test: `src/pages/Pulseira.test.tsx`

**Interfaces:**
- Consumes: `getPacienteByUuid`, `useAuth`, `CardSecao`, `BadgeCriticidade`, `RequireAuth`, tipos `PacienteView`
- Produces: página `Pulseira` (default export), `HeaderPaciente({ nome, idade, telefoneResponsavel? })`

- [ ] **Step 1: Escrever os testes**

`src/pages/Pulseira.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from '../contexts/AuthContext';
import App from '../App';
import { accessLogs } from '../api/mock/handlers';
import type { Role, Sessao } from '../types';

const UUID_RAFAEL = '550e8400-e29b-41d4-a716-446655440001';
const UUID_ANA = '550e8400-e29b-41d4-a716-446655440002';

beforeEach(() => sessionStorage.clear());

function renderComo(role: Role, rota: string) {
  const sessao: Sessao = { token: 't', role, nome: 'Teste' };
  sessionStorage.setItem('helptap.sessao', JSON.stringify(sessao));
  render(
    <MemoryRouter initialEntries={[rota]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
}

test('médico vê ficha completa, alergias com criticidade e transtornos', async () => {
  renderComo('medico', `/pulseira/${UUID_ANA}`);
  expect(await screen.findByText('Ana Clara Souza')).toBeInTheDocument();
  expect(screen.getByText('A-')).toBeInTheDocument();
  expect(screen.getByText('Amendoim')).toBeInTheDocument();
  expect(screen.getByText('Alta')).toBeInTheDocument();
  expect(screen.getByText(/espectro autista/i)).toBeInTheDocument();
});

test('policial vê identificação civil e NENHUM dado clínico', async () => {
  renderComo('policial', `/pulseira/${UUID_RAFAEL}`);
  expect(await screen.findByText('Rafael Andrade')).toBeInTheDocument();
  expect(screen.getByText('123.456.789-00')).toBeInTheDocument();
  expect(screen.getByText('Ana Santos')).toBeInTheDocument();
  expect(screen.queryByText('Ficha Médica')).not.toBeInTheDocument();
  expect(screen.queryByText('O+')).not.toBeInTheDocument();
  expect(screen.queryByText('Dipirona')).not.toBeInTheDocument();
});

test('bombeiro vê ficha essencial sem CPF, filiação nem doenças sensíveis', async () => {
  renderComo('bombeiro', `/pulseira/${UUID_RAFAEL}`);
  expect(await screen.findByText('O+')).toBeInTheDocument();
  expect(screen.getByText('Dipirona')).toBeInTheDocument();
  expect(screen.queryByText('123.456.789-00')).not.toBeInTheDocument();
  expect(screen.queryByText('Ana Santos')).not.toBeInTheDocument();
  expect(screen.queryByText('HIV positivo')).not.toBeInTheDocument();
});

test('uuid desconhecido mostra tela de pulseira não vinculada', async () => {
  renderComo('medico', '/pulseira/nao-existe');
  expect(await screen.findByText(/pulseira não vinculada/i)).toBeInTheDocument();
});

test('a leitura registra um AccessLog', async () => {
  const antes = accessLogs.length;
  renderComo('medico', `/pulseira/${UUID_RAFAEL}`);
  await screen.findByText('Rafael Andrade');
  expect(accessLogs.length).toBeGreaterThan(antes);
});
```

- [ ] **Step 2: Rodar e ver falhar**

Run: `npx vitest run src/pages/Pulseira.test.tsx`
Expected: FAIL.

- [ ] **Step 3: Implementar**

`src/components/HeaderPaciente.tsx`:
```tsx
import { useState } from 'react';
import { Calendar, MapPin, Phone, UserRound } from 'lucide-react';

interface Props {
  nome: string;
  idade: number;
  telefoneResponsavel?: string;
}

export function HeaderPaciente({ nome, idade, telefoneResponsavel }: Props) {
  const [enviada, setEnviada] = useState(false);
  return (
    <header className="flex flex-col items-center gap-3 py-6 text-center">
      <span className="grid size-16 place-items-center rounded-full bg-brand/10">
        <UserRound aria-hidden className="size-8 text-brand" />
      </span>
      <div>
        <h1 className="text-xl font-bold">{nome}</h1>
        <p className="mt-0.5 flex items-center justify-center gap-1 text-sm text-slate-500">
          <Calendar aria-hidden className="size-4" />
          {idade} anos
        </p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {telefoneResponsavel && (
          <a
            href={`tel:${telefoneResponsavel.replace(/\D/g, '')}`}
            className="flex items-center gap-1.5 rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
          >
            <Phone aria-hidden className="size-4" />
            Ligar Responsável
          </a>
        )}
        <button
          onClick={() => setEnviada(true)}
          className="flex items-center gap-1.5 rounded-lg bg-brand px-3 py-2 text-xs font-semibold text-white hover:opacity-90"
        >
          <MapPin aria-hidden className="size-4" />
          {enviada ? 'Localização enviada ✓' : 'Enviar Localização'}
        </button>
      </div>
    </header>
  );
}
```

`src/pages/Pulseira.tsx`:
```tsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Accessibility,
  Brain,
  HeartPulse,
  IdCard,
  Stethoscope,
  TriangleAlert,
} from 'lucide-react';
import { getPacienteByUuid } from '../api/paciente';
import { useAuth } from '../contexts/AuthContext';
import { CardSecao } from '../components/CardSecao';
import { BadgeCriticidade } from '../components/BadgeCriticidade';
import { HeaderPaciente } from '../components/HeaderPaciente';
import type { PacienteView } from '../types';

function LinhaDado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{rotulo}</dt>
      <dd className="text-right font-medium">{valor}</dd>
    </div>
  );
}

export default function Pulseira() {
  const { uuid = '' } = useParams();
  const { sessao } = useAuth();
  const [estado, setEstado] = useState<'carregando' | 'erro' | 'ok'>('carregando');
  const [paciente, setPaciente] = useState<PacienteView | null>(null);

  useEffect(() => {
    if (!sessao) return;
    let ativo = true;
    setEstado('carregando');
    getPacienteByUuid(uuid, sessao.role)
      .then((p) => {
        if (ativo) {
          setPaciente(p);
          setEstado('ok');
        }
      })
      .catch(() => {
        if (ativo) setEstado('erro');
      });
    return () => {
      ativo = false;
    };
  }, [uuid, sessao]);

  if (estado === 'carregando') {
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <p className="text-sm text-slate-500">Carregando informações do paciente…</p>
      </main>
    );
  }

  if (estado === 'erro' || !paciente) {
    return (
      <main className="grid min-h-screen place-items-center p-4 text-center">
        <div>
          <h1 className="text-xl font-bold">Pulseira não vinculada</h1>
          <p className="mt-1 text-sm text-slate-500">
            Nenhum paciente está associado a este código.
          </p>
          <Link to="/leitura" className="mt-4 inline-block text-brand underline">
            Voltar à leitura
          </Link>
        </div>
      </main>
    );
  }

  const { identificacao: id, fichaMedica: ficha } = paciente;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-4 pb-10">
      <Link to="/leitura" className="text-sm text-slate-500 hover:text-slate-700">
        ← Nova leitura
      </Link>
      <HeaderPaciente
        nome={paciente.nome}
        idade={paciente.idade}
        telefoneResponsavel={id.telefoneResponsavel}
      />
      <CardSecao titulo="Identificação" Icone={IdCard}>
        <dl className="flex flex-col gap-2 text-sm">
          {id.cpf && <LinhaDado rotulo="CPF" valor={id.cpf} />}
          {id.endereco && <LinhaDado rotulo="Endereço" valor={id.endereco} />}
          {id.telefoneResponsavel && (
            <LinhaDado rotulo="Tel. Responsável" valor={id.telefoneResponsavel} />
          )}
          {id.mae && <LinhaDado rotulo="Mãe" valor={id.mae} />}
          {id.pai && <LinhaDado rotulo="Pai" valor={id.pai} />}
        </dl>
      </CardSecao>

      {ficha && (
        <CardSecao titulo="Ficha Médica" Icone={HeartPulse}>
          <div className="mb-3 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
            <span className="text-sm text-slate-600">Tipo Sanguíneo</span>
            <span className="text-lg font-bold text-red-600">{ficha.tipoSanguineo}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-slate-50 p-2">
              <span className="block text-xs text-slate-500">Altura</span>
              <span className="font-semibold">{ficha.alturaCm} cm</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <span className="block text-xs text-slate-500">Peso</span>
              <span className="font-semibold">{ficha.pesoKg} kg</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <span className="block text-xs text-slate-500">Etnia</span>
              <span className="font-semibold">{ficha.etnia}</span>
            </div>
          </div>
          {ficha.doadorOrgaos && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">
              Doador de Órgãos
            </p>
          )}
          {ficha.observacoes && (
            <p className="mt-3 text-sm text-slate-600">
              <span className="font-medium">Observações:</span> {ficha.observacoes}
            </p>
          )}
        </CardSecao>
      )}

      {paciente.alergias && paciente.alergias.length > 0 && (
        <CardSecao titulo="Alergias" Icone={TriangleAlert}>
          <ul className="flex flex-col gap-2 text-sm">
            {paciente.alergias.map((a) => (
              <li key={a.nome} className="flex items-center justify-between">
                {a.nome}
                <BadgeCriticidade nivel={a.criticidade} />
              </li>
            ))}
          </ul>
        </CardSecao>
      )}

      {paciente.doencas && paciente.doencas.length > 0 && (
        <CardSecao titulo="Doenças" Icone={Stethoscope}>
          <ul className="flex flex-col gap-1 text-sm">
            {paciente.doencas.map((d) => (
              <li key={d.nome}>{d.nome}</li>
            ))}
          </ul>
        </CardSecao>
      )}

      {paciente.transtornos && paciente.transtornos.length > 0 && (
        <CardSecao titulo="Transtornos" Icone={Brain}>
          <ul className="flex flex-col gap-2 text-sm">
            {paciente.transtornos.map((t) => (
              <li key={t.nome}>
                <p className="font-medium">{t.nome}</p>
                {t.observacao && <p className="text-slate-500">{t.observacao}</p>}
              </li>
            ))}
          </ul>
        </CardSecao>
      )}

      {paciente.deficiencias && paciente.deficiencias.length > 0 && (
        <CardSecao titulo="Deficiências" Icone={Accessibility}>
          <ul className="flex flex-col gap-1 text-sm">
            {paciente.deficiencias.map((d) => (
              <li key={d.nome}>{d.nome}</li>
            ))}
          </ul>
        </CardSecao>
      )}
    </main>
  );
}
```

Em `src/App.tsx`, adicionar:
```tsx
<Route
  path="/pulseira/:uuid"
  element={
    <RequireAuth>
      <Pulseira />
    </RequireAuth>
  }
/>
```

Atualizar asserções provisórias:
- `src/pages/Login.test.tsx` — 3º teste vira a versão definitiva (destino `/pulseira/550e8400-e29b-41d4-a716-446655440001`, asserção `expect(await screen.findByText('Rafael Andrade')).toBeInTheDocument()`).
- `src/pages/Leitura.test.tsx` — 2º teste: asserção vira `expect(await screen.findByText(/pulseira não vinculada/i)).toBeInTheDocument()`.

- [ ] **Step 4: Rodar e ver passar**

Run: `npm test && npm run typecheck`
Expected: todos PASS.

- [ ] **Step 5: Conferir no navegador**

Run: `npm run dev` — logar como `medico@helptap.com` / `123456`, abrir as duas pulseiras de demonstração e comparar com o protótipo. Repetir com `policial@` e `bombeiro@` conferindo a filtragem.

- [ ] **Step 6: Commit**

```bash
git add -A && git commit -m "feat: visualização do paciente filtrada por perfil com trilha de auditoria"
```

---

### Task 13: Teste de fluxo completo (leitura NFC de ponta a ponta)

**Files:**
- Test: `src/fluxo-nfc.test.tsx`

**Interfaces:**
- Consumes: tudo das tasks anteriores — este teste simula o cenário real do artigo: socorrista lê a pulseira sem estar logado.

- [ ] **Step 1: Escrever o teste de integração**

`src/fluxo-nfc.test.tsx`:
```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import App from './App';

const UUID_RAFAEL = '550e8400-e29b-41d4-a716-446655440001';

beforeEach(() => sessionStorage.clear());

test('fluxo NFC completo: pulseira → seleção de perfil → login → paciente filtrado', async () => {
  // 1. O socorrista aproxima o celular da pulseira: abre a URL sem estar logado
  render(
    <MemoryRouter initialEntries={[`/pulseira/${UUID_RAFAEL}`]}>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );

  // 2. É levado à seleção de perfil (destino preservado)
  expect(screen.getByRole('heading', { name: /entrar no/i })).toBeInTheDocument();

  // 3. Escolhe o perfil Bombeiro / Socorrista (regex ancorado para não casar com "Cadastrar Bombeiro")
  await userEvent.click(screen.getByRole('link', { name: /^bombeiro/i }));
  expect(await screen.findByRole('heading', { name: /acesso bombeiro/i })).toBeInTheDocument();

  // 4. Faz login
  await userEvent.type(screen.getByLabelText('E-mail'), 'bombeiro@helptap.com');
  await userEvent.type(screen.getByLabelText('Senha'), '123456');
  await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));

  // 5. Cai DIRETO na tela do paciente (sem etapas intermediárias — requisito dos 30s)
  expect(await screen.findByText('Rafael Andrade')).toBeInTheDocument();
  expect(screen.getByText('O+')).toBeInTheDocument();
  expect(screen.getByText('Dipirona')).toBeInTheDocument();
  // ...já filtrado: bombeiro não vê CPF nem doenças sensíveis
  expect(screen.queryByText('123.456.789-00')).not.toBeInTheDocument();
  expect(screen.queryByText('HIV positivo')).not.toBeInTheDocument();
});
```

- [ ] **Step 2: Rodar**

Run: `npx vitest run src/fluxo-nfc.test.tsx`
Expected: PASS de primeira (todas as peças já existem). Se falhar, é um bug real de integração — investigar antes de seguir.

- [ ] **Step 3: Suíte completa + build final**

Run: `npm test && npm run build`
Expected: todos os testes PASS e build de produção sem erros.

- [ ] **Step 4: Commit**

```bash
git add -A && git commit -m "test: fluxo NFC de ponta a ponta (pulseira → login → paciente filtrado)"
```

---

## Verificação final contra a spec

Após a Task 13, conferir manualmente no navegador (`npm run dev`):

1. `/` replica a tela de seleção do protótipo (fundo creme, 4 cartões gradientes, botões de cadastro)
2. Login de cada perfil com as contas de demonstração (`medico@helptap.com`, `policial@helptap.com`, `bombeiro@helptap.com`, `rafael@helptap.com`, senha `123456`)
3. As três telas de visualização batem com as Figs. 6–8 do artigo (filtragem progressiva)
4. `/pulseira/<uuid-inválido>` mostra "Pulseira não vinculada"
5. Responsividade: janela estreita (~375px) mantém tudo legível
6. Navegação por teclado: Tab percorre cartões, campos e botões com anel de foco visível
