import type { PacienteCompleto, PacienteView, Role } from '../../types';

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
