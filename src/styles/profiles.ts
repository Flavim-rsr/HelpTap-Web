import { Flame, HeartPulse, Shield, Stethoscope, User, type LucideIcon } from 'lucide-react';
import type { Role } from '../types';

export interface ProfileInfo {
  title: string;
  /** Versão curta para botões (ex.: "Cadastrar Bombeiro"). */
  shortTitle?: string;
  accessTitle: string;
  description: string;
  gradient: string; // classes tailwind from-.. to-..
  solidColor: string; // bg-*
  textColor: string; // text-*
  registrationLabel?: string;
  registrationPlaceholder?: string;
  Icon: LucideIcon;
}

export const PROFILES: Role[] = ['medico', 'policial', 'bombeiro', 'socorrista', 'usuario'];
export const SIGNUP_PROFILES: Role[] = ['medico', 'policial', 'bombeiro', 'socorrista'];

export function isProfile(v: string): v is Role {
  return (PROFILES as string[]).includes(v);
}

export const PROFILE_CONFIG: Record<Role, ProfileInfo> = {
  medico: {
    title: 'Médico',
    accessTitle: 'Acesso Médico',
    description: 'Acesso completo com validação CRM',
    gradient: 'from-blue-500 to-blue-600',
    solidColor: 'bg-blue-600',
    textColor: 'text-blue-600',
    registrationLabel: 'CRM',
    registrationPlaceholder: 'CRM123456-SP',
    Icon: Stethoscope,
  },
  policial: {
    title: 'Policial',
    accessTitle: 'Acesso Policial',
    description: 'Informações de identificação',
    gradient: 'from-indigo-700 to-indigo-900',
    solidColor: 'bg-indigo-800',
    textColor: 'text-indigo-800',
    registrationLabel: 'Registro funcional',
    registrationPlaceholder: 'POL12345-SSP-SP',
    Icon: Shield,
  },
  bombeiro: {
    title: 'Bombeiro',
    accessTitle: 'Acesso Bombeiro',
    description: 'Informações de emergência',
    gradient: 'from-orange-500 to-red-500',
    solidColor: 'bg-orange-600',
    textColor: 'text-orange-600',
    registrationLabel: 'Registro funcional',
    registrationPlaceholder: 'CBM98765-SP',
    Icon: Flame,
  },
  socorrista: {
    title: 'Socorrista',
    accessTitle: 'Acesso Socorrista',
    description: 'Ficha de emergência com validação COREN',
    gradient: 'from-rose-500 to-pink-600',
    solidColor: 'bg-rose-600',
    textColor: 'text-rose-600',
    registrationLabel: 'COREN',
    registrationPlaceholder: 'COREN123456-SP',
    Icon: HeartPulse,
  },
  usuario: {
    title: 'Próprio Usuário',
    accessTitle: 'Acesso Usuário',
    description: 'Acesse seus próprios dados de emergência',
    gradient: 'from-teal-500 to-emerald-500',
    solidColor: 'bg-teal-600',
    textColor: 'text-teal-600',
    Icon: User,
  },
};
