/**
 * Ponto único de troca mock → back-end real.
 * Com VITE_API_URL definida (`.env`), auth.ts e patient.ts falam com a API
 * Spring no Railway; sem ela (testes, demonstração offline), caem nos mocks.
 * As assinaturas das funções NÃO mudam — nenhuma página é alterada.
 */
export function apiUrl(): string | undefined {
  return (import.meta.env.VITE_API_URL as string | undefined) || undefined;
}

/** @deprecated use apiUrl() — mantido para compatibilidade */
export const API_URL: string | undefined = import.meta.env.VITE_API_URL;

const TIMEOUT_MS = 15_000;

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  token?: string;
};

/** O back responde erros como ErrorResponseDTO, com mensagens em inglês. */
const TRANSLATIONS: Array<[RegExp, string]> = [
  [/invalid email or password/i, 'E-mail ou senha inválidos.'],
  [/cannot be accessed by a web/i, 'Esta conta não tem acesso pelo site.'],
  [/email already/i, 'Este e-mail já está cadastrado.'],
  [/(national registration|cpf) already/i, 'Este CPF já está cadastrado.'],
  [/identifier already/i, 'Este registro profissional já está cadastrado.'],
  [/unable to validate a credential/i,
    'Não foi possível validar o registro profissional agora. Tente novamente mais tarde.'],
  [/invalid crm format|crm number/i, 'Formato do CRM inválido. Use: CRM123456-SP'],
  [/invalid police/i, 'Formato do registro inválido. Use: POL12345-SSP-SP'],
  [/invalid firefighter/i, 'Formato do registro inválido. Use: CBM98765-SP'],
];

function translate(message: string): string {
  for (const [pattern, text] of TRANSLATIONS) {
    if (pattern.test(message)) return text;
  }
  return message;
}

function extractMessage(data: unknown): string {
  const body = data as { message?: string; details?: unknown } | null;
  if (Array.isArray(body?.details) && typeof body.details[0] === 'string') {
    return translate(body.details[0]);
  }
  if (body?.message) return translate(body.message);
  return 'Não foi possível concluir a solicitação. Tente novamente.';
}

/** Erro de API com o status HTTP preservado para decisões de tela. */
export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

  let response: Response;
  try {
    response = await fetch(`${apiUrl()}${path}`, {
      method: options.method ?? 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
      },
      body: options.body ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });
  } catch {
    throw new Error('Não foi possível conectar ao servidor. Verifique sua internet.');
  } finally {
    clearTimeout(timeoutId);
  }

  const text = await response.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    // Auth do Spring sem corpo JSON (token ausente/expirado) → sessão expirada
    if ((response.status === 401 || response.status === 403) && data === null) {
      throw new ApiError('Sessão expirada. Faça login novamente.', response.status);
    }
    throw new ApiError(extractMessage(data), response.status);
  }

  return data as T;
}
