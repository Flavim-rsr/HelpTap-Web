import type { Criticidade, PacienteView, Role } from '../types';
import { apiUrl, request } from './client';
import { idadeDe } from '../utils/formato';
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

type DadosBasicos = { dateBirth: string | null; userPicture: string | null };

/**
 * Foto e data de nascimento ainda não vêm no perfil profissional; busca no
 * endpoint de usuário. Falha aqui não derruba a tela (dados extras).
 */
async function dadosBasicosDe(userId: number, token: string): Promise<DadosBasicos | null> {
  try {
    return await request<DadosBasicos>(`/api/users/${userId}`, { method: 'GET', token });
  } catch {
    return null;
  }
}

function paraPacienteView(
  perfil: LeituraResponse['professionalProfile'],
  basicos: DadosBasicos | null,
): PacienteView {
  const contatos = perfil.emergencyContacts ?? [];
  return {
    nome: perfil.fullName,
    ...(basicos?.dateBirth ? { idade: idadeDe(basicos.dateBirth) } : {}),
    ...(basicos?.userPicture ? { fotoUrl: basicos.userPicture } : {}),
    // CPF, endereço e filiação seguem fora do contrato profissional.
    identificacao: {
      ...(contatos[0] ? { telefoneResponsavel: contatos[0].phone } : {}),
    },
    ...(contatos.length
      ? { contatos: contatos.map((c) => ({ nome: c.phoneOwner, telefone: c.phone })) }
      : {}),
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

  const basicos = await dadosBasicosDe(resposta.professionalProfile.userId, token);
  return paraPacienteView(resposta.professionalProfile, basicos);
}
