import type { Criticidade, PacienteView, Role } from '../types';
import { apiUrl, request } from './client';
import { mockGetPaciente } from './mock/handlers';

/** Resposta de POST /api/nfc/read/{uuid}/professional (já filtrada por papel no back). */
type LeituraResponse = {
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

const CRITICIDADE: Record<string, Criticidade> = {
  LOW: 'Baixa',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  CRITICAL: 'Critica',
};

function paraPacienteView(perfil: LeituraResponse['professionalProfile']): PacienteView {
  const contato = perfil.emergencyContacts?.[0];
  return {
    nome: perfil.fullName,
    // O perfil profissional do back ainda não expõe data de nascimento,
    // CPF, endereço nem filiação — a idade e esses campos ficam ausentes.
    identificacao: {
      ...(contato ? { telefoneResponsavel: contato.phone } : {}),
    },
    ...(perfil.medicalRecord
      ? {
          fichaMedica: {
            tipoSanguineo: perfil.medicalRecord.bloodType,
            alturaCm: perfil.medicalRecord.height,
            pesoKg: perfil.medicalRecord.weight,
            etnia: perfil.medicalRecord.ethnicity,
            doadorOrgaos: perfil.medicalRecord.organDonor,
            ...(perfil.medicalRecord.description
              ? { observacoes: perfil.medicalRecord.description }
              : {}),
          },
        }
      : {}),
    ...(perfil.allergies
      ? {
          alergias: perfil.allergies.map((a) => ({
            nome: a.allergenic,
            criticidade: CRITICIDADE[a.riskRating] ?? 'Baixa',
          })),
        }
      : {}),
    ...(perfil.illnesses
      ? {
          doencas: perfil.illnesses.map((d) => ({
            nome: d.illnessName,
            sensivel: d.isSensitive === true,
          })),
        }
      : {}),
    ...(perfil.disorders
      ? {
          transtornos: perfil.disorders.map((t) => ({
            nome: t.disorderName,
            observacao: [t.disorderDegree, t.description].filter(Boolean).join(', '),
          })),
        }
      : {}),
    ...(perfil.deficiencies
      ? { deficiencias: perfil.deficiencies.map((d) => ({ nome: d.type })) }
      : {}),
  };
}

export async function getPacienteByUuid(
  uuid: string,
  perfil: Role,
  pacienteId?: string,
  token?: string,
): Promise<PacienteView> {
  if (!apiUrl() || !token) return mockGetPaciente(uuid, perfil, pacienteId);

  const resposta = await request<LeituraResponse>(`/api/nfc/read/${uuid}/professional`, {
    body: {},
    token,
  });

  // O back registra a leitura e filtra por papel, mas não impede um titular de
  // abrir pulseira alheia — regra que o web já tinha e mantém.
  if (perfil === 'usuario' && pacienteId && String(resposta.professionalProfile.userId) !== pacienteId) {
    throw new Error('ACESSO_NEGADO');
  }

  return paraPacienteView(resposta.professionalProfile);
}
