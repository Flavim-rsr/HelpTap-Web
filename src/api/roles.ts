import type { Role } from '../types';

/** Papéis do back (UserRole do Spring) ↔ perfis do web. */
export const BACKEND_ROLE: Record<Role, string> = {
  medico: 'DOCTOR',
  policial: 'POLICE',
  bombeiro: 'FIREFIGHTER',
  usuario: 'PATIENT',
};

/** RESCUER (socorrista) entra pelo card de bombeiro até existir card próprio. */
export function roleFromBackend(role: string): Role | null {
  switch (role) {
    case 'DOCTOR':
      return 'medico';
    case 'POLICE':
      return 'policial';
    case 'FIREFIGHTER':
    case 'RESCUER':
      return 'bombeiro';
    case 'PATIENT':
      return 'usuario';
    default:
      return null;
  }
}
