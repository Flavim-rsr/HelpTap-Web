import type {
  AccessLog,
  CadastroProfissional,
  Credenciais,
  PacienteCompleto,
  PacienteView,
  Role,
  Sessao,
} from '../../types';
import { pacientesMock, usuariosMock, wearablesMock } from './data';

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
