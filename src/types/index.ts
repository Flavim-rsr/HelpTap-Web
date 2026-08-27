export type Role = 'medico' | 'policial' | 'bombeiro' | 'socorrista' | 'usuario';

export type Severity = 'Baixa' | 'Media' | 'Alta' | 'Critica';

export interface Allergy {
  name: string;
  severity: Severity;
}

export interface Illness {
  name: string;
  /** espelha Illness.is_sensitive do artigo — visível apenas para médico/titular */
  sensitive: boolean;
}

export interface Disorder {
  name: string;
  note?: string;
}

export interface Deficiency {
  name: string;
}

export interface MedicalRecordData {
  bloodType: string;
  heightCm: number;
  weightKg: number;
  ethnicity: string;
  organDonor: boolean;
  notes?: string;
}

export interface EmergencyContact {
  name: string;
  phone: string;
}

export interface Identification {
  cpf?: string;
  address?: string;
  guardianPhone?: string;
  motherName?: string;
  fatherName?: string;
}

/** O que a API devolve para /pulseira/:uuid — já filtrado por perfil */
export interface PatientView {
  name: string;
  /** Ausente quando o backend não expõe a data de nascimento no perfil. */
  age?: number;
  /** Foto de perfil (data URI), quando o titular cadastrou uma. */
  photoUrl?: string;
  identification: Identification;
  /** Ordem segue os slots do app: índice 0 = principal, 1 = alternativo. */
  contacts?: EmergencyContact[];
  medicalRecord?: MedicalRecordData;
  allergies?: Allergy[];
  illnesses?: Illness[];
  disorders?: Disorder[];
  deficiencies?: Deficiency[];
}

/** Registro completo, existe apenas dentro do mock (papel do banco) */
export interface FullPatientRecord {
  id: string;
  name: string;
  age: number;
  cpf: string;
  address: string;
  guardianPhone: string;
  motherName: string;
  fatherName: string;
  medicalRecord: MedicalRecordData;
  allergies: Allergy[];
  illnesses: Illness[];
  disorders: Disorder[];
  deficiencies: Deficiency[];
}

export interface Wearable {
  uuid: string;
  patientId: string;
  name: string;
}

export interface AccessLog {
  wearableId: string;
  accessedAt: string; // ISO 8601
  role: Role;
  location: string;
}

export interface Session {
  token: string;
  /** id do usuário no backend; ausente nas sessões de demonstração (mock). */
  userId?: number;
  role: Role;
  name: string;
  /** id do FullPatientRecord vinculado a este usuário, quando role === 'usuario' */
  patientId?: string;
}

export interface Credentials {
  email: string;
  password: string;
}

export interface ProfessionalSignupData {
  name: string;
  cpf: string;
  email: string;
  phone: string;
  password: string;
  /** CRM (médico) ou registro funcional (policial/bombeiro) */
  registration: string;
}
