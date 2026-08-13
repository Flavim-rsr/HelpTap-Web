import { vi } from 'vitest';
// O Vitest carrega o .env do projeto; sem isto, os testes que esperam o
// mock iriam parar na API real do Railway.
vi.stubEnv('VITE_API_URL', '');

import '@testing-library/jest-dom/vitest';
