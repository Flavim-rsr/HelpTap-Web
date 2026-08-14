import type { PatientView, Role, Severity } from '../types';
import { apiUrl, request } from './client';
import { ageFrom } from '../utils/format';
import { mockGetPatient } from './mock/handlers';

/** Resposta de POST /api/nfc/read/{uuid}/professional (já filtrada por papel no back). */
type ReadResponse = {
  accessLogId: number;
  accessLevel: string;
  professionalProfile: {
    userId: number;
    fullName: string;
    viewerRole: string;
    medicalRecord: {
      bloodType: string;
      height: number;
      weight: number;
      ethnicity: string;
      organDonor: boolean;
      description: string | null;
    } | null;
    illnesses: Array<{ illnessName: string; isSensitive: boolean | null }> | null;
    disorders: Array<{
      disorderName: string;
      disorderDegree: string;
      description: string | null;
    }> | null;
    allergies: Array<{ allergenic: string; riskRating: string }> | null;
    deficiencies: Array<{ type: string }> | null;
    emergencyContacts: Array<{ phone: string; phoneOwner: string }> | null;
  };
};

const SEVERITY_LABELS: Record<string, Severity> = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Critica',
};

type BasicData = { dateBirth: string | null; userPicture: string | null };

/**
 * Foto e data de nascimento ainda não vêm no perfil profissional; busca no
 * endpoint de usuário. Falha aqui não derruba a tela (dados extras).
 */
async function fetchBasicData(userId: number, token: string): Promise<BasicData | null> {
  try {
    return await request<BasicData>(`/api/users/${userId}`, { method: 'GET', token });
  } catch {
    return null;
  }
}

function toPatientView(
  profile: ReadResponse['professionalProfile'],
  basicData: BasicData | null,
): PatientView {
  const contacts = profile.emergencyContacts ?? [];
  return {
    name: profile.fullName,
    ...(basicData?.dateBirth ? { age: ageFrom(basicData.dateBirth) } : {}),
    ...(basicData?.userPicture ? { photoUrl: basicData.userPicture } : {}),
    // CPF, endereço e filiação seguem fora do contrato profissional.
    identification: {
      ...(contacts[0] ? { guardianPhone: contacts[0].phone } : {}),
    },
    ...(contacts.length
      ? { contacts: contacts.map((c) => ({ name: c.phoneOwner, phone: c.phone })) }
      : {}),
    ...(profile.medicalRecord
      ? {
          medicalRecord: {
            bloodType: profile.medicalRecord.bloodType,
            heightCm: profile.medicalRecord.height,
            weightKg: profile.medicalRecord.weight,
            ethnicity: profile.medicalRecord.ethnicity,
            organDonor: profile.medicalRecord.organDonor,
            ...(profile.medicalRecord.description
              ? { notes: profile.medicalRecord.description }
              : {}),
          },
        }
      : {}),
    ...(profile.allergies
      ? {
          allergies: profile.allergies.map((a) => ({
            name: a.allergenic,
            severity: SEVERITY_LABELS[a.riskRating] ?? 'Baixa',
          })),
        }
      : {}),
    ...(profile.illnesses
      ? {
          illnesses: profile.illnesses.map((d) => ({
            name: d.illnessName,
            sensitive: d.isSensitive === true,
          })),
        }
      : {}),
    ...(profile.disorders
      ? {
          disorders: profile.disorders.map((t) => ({
            name: t.disorderName,
            note: [t.disorderDegree, t.description].filter(Boolean).join(', '),
          })),
        }
      : {}),
    ...(profile.deficiencies
      ? { deficiencies: profile.deficiencies.map((d) => ({ name: d.type })) }
      : {}),
  };
}

export async function getPatientByUuid(
  uuid: string,
  profile: Role,
  patientId?: string,
  token?: string,
): Promise<PatientView> {
  if (!apiUrl() || !token) return mockGetPatient(uuid, profile, patientId);

  const response = await request<ReadResponse>(`/api/nfc/read/${uuid}/professional`, {
    body: {},
    token,
  });

  // O back registra a leitura e filtra por papel, mas não impede um titular de
  // abrir pulseira alheia — regra que o web já tinha e mantém.
  if (profile === 'usuario' && patientId && String(response.professionalProfile.userId) !== patientId) {
    throw new Error('ACESSO_NEGADO');
  }

  const basicData = await fetchBasicData(response.professionalProfile.userId, token);
  return toPatientView(response.professionalProfile, basicData);
}
