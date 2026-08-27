import type { Role } from '../types';

/** Papéis do back (UserRole do Spring) ↔ perfis do web. */
export const BACKEND_ROLE: Record<Role, string> = {
  medico: 'DOCTOR',
  policial: 'POLICE',
  bombeiro: 'FIREFIGHTER',
  socorrista: 'RESCUER',
  usuario: 'PATIENT',
};

export function roleFromBackend(role: string): Role | null {
  switch (role) {
    case 'DOCTOR':
      return 'medico';
    case 'POLICE':
      return 'policial';
    case 'FIREFIGHTER':
      return 'bombeiro';
    case 'RESCUER':
      return 'socorrista';
    case 'PATIENT':
      return 'usuario';
    default:
      return null;
  }
}
