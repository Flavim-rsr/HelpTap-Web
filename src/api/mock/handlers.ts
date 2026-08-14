import type {
  AccessLog,
  Credentials,
  FullPatientRecord,
  PatientView,
  ProfessionalSignupData,
  Role,
  Session,
} from '../../types';
import { mockPatients, mockUsers, mockWearables } from './data';

/**
 * Espelha a filtragem que o Spring Security + camada de serviços fará no
 * back-end real. Componentes NUNCA filtram — só renderizam o que chega.
 */
export function filterPatientByRole(p: FullPatientRecord, role: Role): PatientView {
  const base = {
    name: p.name,
    age: p.age,
    contacts: [{ name: 'Responsável', phone: p.guardianPhone }],
  };
  switch (role) {
    case 'medico':
    case 'usuario':
      return {
        ...base,
        identification: {
          cpf: p.cpf,
          address: p.address,
          guardianPhone: p.guardianPhone,
          motherName: p.motherName,
          fatherName: p.fatherName,
        },
        medicalRecord: p.medicalRecord,
        allergies: p.allergies,
        illnesses: p.illnesses,
        disorders: p.disorders,
        deficiencies: p.deficiencies,
      };
    case 'policial':
      return {
        ...base,
        identification: {
          cpf: p.cpf,
          address: p.address,
          guardianPhone: p.guardianPhone,
          motherName: p.motherName,
          fatherName: p.fatherName,
        },
      };
    case 'bombeiro':
      return {
        ...base,
        identification: {
          address: p.address,
          guardianPhone: p.guardianPhone,
        },
        medicalRecord: p.medicalRecord,
        allergies: p.allergies,
        illnesses: p.illnesses.filter((d) => !d.sensitive),
        deficiencies: p.deficiencies,
      };
  }
}

/** Latência artificial que simula a rede; zerada nos testes. */
export const LATENCY_MS = import.meta.env.MODE === 'test' ? 0 : 400;
export const delay = () => new Promise((r) => setTimeout(r, LATENCY_MS));

function newSession(role: Role, name: string, patientId?: string): Session {
  return { token: `mock-jwt-${role}-${Date.now()}`, role, name, patientId };
}

export async function mockLogin(role: Role, credentials: Credentials): Promise<Session> {
  await delay();
  const user = mockUsers.find(
    (u) => u.role === role && u.email === credentials.email && u.password === credentials.password,
  );
  if (!user) throw new Error('E-mail ou senha inválidos');
  return newSession(user.role, user.name, user.patientId);
}

/**
 * Simula a API mockada de validação de credenciais profissionais do artigo
 * (CRM para médicos, registros funcionais para policiais e bombeiros).
 */
export function validateRegistration(role: Role, registration: string): boolean {
  const r = registration.trim();
  if (role === 'medico') return /^(CRM)?\d{4,7}-[A-Z]{2}$/i.test(r);
  if (role === 'policial') return /^POL\d{4,8}-[A-Z]{2,4}-[A-Z]{2}$/i.test(r);
  return /^CBM\d{4,8}-[A-Z]{2}$/i.test(r);
}

export async function mockSignUp(role: Role, data: ProfessionalSignupData): Promise<Session> {
  await delay();
  if (!validateRegistration(role, data.registration)) {
    throw new Error('Registro profissional inválido');
  }
  if (mockUsers.some((u) => u.email === data.email)) {
    throw new Error('E-mail já cadastrado');
  }
  mockUsers.push({ email: data.email, password: data.password, role, name: data.name });
  return newSession(role, data.name);
}

/** Trilha de auditoria exigida pela LGPD — entidade AccessLog do artigo. */
export const accessLogs: AccessLog[] = [];

export async function mockGetPatient(
  uuid: string,
  role: Role,
  patientId?: string,
): Promise<PatientView> {
  await delay();
  const wearable = mockWearables.find((w) => w.uuid === uuid);
  const patient = wearable && mockPatients.find((p) => p.id === wearable.patientId);
  if (!wearable || !patient) throw new Error('PULSEIRA_NAO_ENCONTRADA');
  if (role === 'usuario' && wearable.patientId !== patientId) {
    throw new Error('ACESSO_NEGADO');
  }
  accessLogs.push({
    wearableId: wearable.uuid,
    accessedAt: new Date().toISOString(),
    role,
    location: 'São Paulo - SP (simulado)',
  });
  return filterPatientByRole(patient, role);
}
