import type { Credentials, ProfessionalSignupData, Role, Session } from '../types';
import { apiUrl, request } from './client';
import { BACKEND_ROLE, roleFromBackend } from './roles';
import { mockLogin, mockSignUp } from './mock/handlers';

type LoginResponse = {
  token: string;
  userId: number;
  fullName: string;
  role: string;
};

const onlyDigits = (value: string) => value.replace(/\D/g, '');

function sessionFrom(profile: Role, response: LoginResponse): Session {
  return {
    token: response.token,
    userId: response.userId,
    role: profile,
    name: response.fullName,
    ...(profile === 'usuario' ? { patientId: String(response.userId) } : {}),
  };
}

export async function login(profile: Role, credentials: Credentials): Promise<Session> {
  if (!apiUrl()) return mockLogin(profile, credentials);

  const response = await request<LoginResponse>('/api/auth/web/login', {
    body: { email: credentials.email.trim().toLowerCase(), password: credentials.password },
  });

  if (roleFromBackend(response.role) !== profile) {
    throw new Error('Esta conta pertence a outro perfil. Volte e selecione o perfil correto.');
  }
  return sessionFrom(profile, response);
}

export async function signUp(profile: Role, data: ProfessionalSignupData): Promise<Session> {
  if (!apiUrl()) return mockSignUp(profile, data);

  const phone = onlyDigits(data.phone);
  await request('/api/users', {
    body: {
      fullName: data.name.trim(),
      cpf: onlyDigits(data.cpf),
      email: data.email.trim().toLowerCase(),
      password: data.password,
      identifier: data.registration.trim().toUpperCase(),
      role: BACKEND_ROLE[profile],
      ...(phone.length >= 10 ? { phone } : {}),
    },
  });

  // Conta criada; entra em seguida com as mesmas credenciais.
  return login(profile, { email: data.email, password: data.password });
}
