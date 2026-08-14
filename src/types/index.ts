export type Role = 'medico' | 'policial' | 'bombeiro' | 'usuario';

export type Criticidade = 'Baixa' | 'Media' | 'Alta' | 'Critica';

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

export interface ContatoEmergencia {
  nome: string;
  telefone: string;
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
  /** Ausente quando o backend não expõe a data de nascimento no perfil. */
  idade?: number;
  /** Foto de perfil (data URI), quando o titular cadastrou uma. */
  fotoUrl?: string;
  identificacao: Identificacao;
  /** Ordem segue os slots do app: índice 0 = principal, 1 = alternativo. */
  contatos?: ContatoEmergencia[];
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
  /** id do usuário no backend; ausente nas sessões de demonstração (mock). */
  userId?: number;
  role: Role;
  nome: string;
  /** id do PacienteCompleto vinculado a este usuário, quando role === 'usuario' */
  pacienteId?: string;
}

export interface Credenciais {
  email: string;
  senha: string;
}

export interface CadastroProfissional {
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  senha: string;
  /** CRM (médico) ou registro funcional (policial/bombeiro) */
  registro: string;
}
