import { Flame, Shield, Stethoscope, User, type LucideIcon } from 'lucide-react';
import type { Role } from '../types';

export interface PerfilInfo {
  titulo: string;
  /** Versão curta para botões (ex.: "Cadastrar Bombeiro"). */
  tituloCurto?: string;
  acessoTitulo: string;
  descricao: string;
  gradiente: string; // classes tailwind from-.. to-..
  corSolida: string; // bg-*
  corTexto: string; // text-*
  registroLabel?: string;
  registroPlaceholder?: string;
  Icone: LucideIcon;
}

export const PERFIS: Role[] = ['medico', 'policial', 'bombeiro', 'usuario'];
export const PERFIS_CADASTRO: Role[] = ['medico', 'policial', 'bombeiro'];

export function ehPerfil(v: string): v is Role {
  return (PERFIS as string[]).includes(v);
}

export const PERFIL_CONFIG: Record<Role, PerfilInfo> = {
  medico: {
    titulo: 'Médico',
    acessoTitulo: 'Acesso Médico',
    descricao: 'Acesso completo com validação CRM',
    gradiente: 'from-blue-500 to-blue-600',
    corSolida: 'bg-blue-600',
    corTexto: 'text-blue-600',
    registroLabel: 'CRM',
    registroPlaceholder: 'CRM123456-SP',
    Icone: Stethoscope,
  },
  policial: {
    titulo: 'Policial',
    acessoTitulo: 'Acesso Policial',
    descricao: 'Informações de identificação',
    gradiente: 'from-indigo-700 to-indigo-900',
    corSolida: 'bg-indigo-800',
    corTexto: 'text-indigo-800',
    registroLabel: 'Registro funcional',
    registroPlaceholder: 'POL12345-SSP-SP',
    Icone: Shield,
  },
  bombeiro: {
    titulo: 'Bombeiro / Socorrista',
    tituloCurto: 'Bombeiro',
    acessoTitulo: 'Acesso Bombeiro / Socorrista',
    descricao: 'Informações de emergência',
    gradiente: 'from-orange-500 to-red-500',
    corSolida: 'bg-orange-600',
    corTexto: 'text-orange-600',
    registroLabel: 'Registro funcional',
    registroPlaceholder: 'CBM98765-SP',
    Icone: Flame,
  },
  usuario: {
    titulo: 'Próprio Usuário',
    acessoTitulo: 'Acesso Usuário',
    descricao: 'Acesse seus próprios dados de emergência',
    gradiente: 'from-teal-500 to-emerald-500',
    corSolida: 'bg-teal-600',
    corTexto: 'text-teal-600',
    Icone: User,
  },
};
