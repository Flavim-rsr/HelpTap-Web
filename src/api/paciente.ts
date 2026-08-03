import type { PacienteView, Role } from '../types';
import { mockGetPaciente } from './mock/handlers';

export function getPacienteByUuid(
  uuid: string,
  perfil: Role,
  pacienteId?: string,
): Promise<PacienteView> {
  return mockGetPaciente(uuid, perfil, pacienteId);
}
