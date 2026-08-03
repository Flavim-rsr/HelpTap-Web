import type { PacienteCompleto, Role, Wearable } from '../../types';

export interface UsuarioMock {
  email: string;
  senha: string;
  role: Role;
  nome: string;
}

export const usuariosMock: UsuarioMock[] = [
  { email: 'medico@helptap.com', senha: '123456', role: 'medico', nome: 'Dra. Carla Mendes' },
  { email: 'policial@helptap.com', senha: '123456', role: 'policial', nome: 'Sgt. Paulo Lima' },
  { email: 'bombeiro@helptap.com', senha: '123456', role: 'bombeiro', nome: 'Cb. Marcos Dias' },
  { email: 'rafael@helptap.com', senha: '123456', role: 'usuario', nome: 'Rafael Andrade' },
];

export const pacientesMock: PacienteCompleto[] = [
  {
    id: 'p1',
    nome: 'Rafael Andrade',
    idade: 22,
    cpf: '123.456.789-00',
    endereco: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    telefoneResponsavel: '(16) 99223-5555',
    mae: 'Ana Santos',
    pai: 'José Santos',
    fichaMedica: {
      tipoSanguineo: 'O+',
      alturaCm: 165,
      pesoKg: 68,
      etnia: 'Branco',
      doadorOrgaos: true,
      observacoes:
        'Paciente com histórico cardiovascular. Necessita acompanhamento contínuo.',
    },
    alergias: [{ nome: 'Dipirona', criticidade: 'Alta' }],
    doencas: [
      { nome: 'Hipertensão', sensivel: false },
      { nome: 'HIV positivo', sensivel: true },
    ],
    transtornos: [],
    deficiencias: [],
  },
  {
    id: 'p2',
    nome: 'Ana Clara Souza',
    idade: 12,
    cpf: '987.654.321-00',
    endereco: 'Av. Brasil, 456 - Jardim América, Franca - SP',
    telefoneResponsavel: '(16) 98877-1234',
    mae: 'Mariana Souza',
    pai: 'Carlos Souza',
    fichaMedica: {
      tipoSanguineo: 'A-',
      alturaCm: 148,
      pesoKg: 40,
      etnia: 'Parda',
      doadorOrgaos: false,
    },
    alergias: [
      { nome: 'Amendoim', criticidade: 'Alta' },
      { nome: 'Poeira', criticidade: 'Baixa' },
    ],
    doencas: [{ nome: 'Asma', sensivel: false }],
    transtornos: [
      {
        nome: 'Transtorno do Espectro Autista — nível 2',
        observacao: 'Hipersensibilidade sensorial. Abordar com redução de estímulos.',
      },
    ],
    deficiencias: [],
  },
];

export const wearablesMock: Wearable[] = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655440001',
    pacienteId: 'p1',
    nome: 'Pulseira de Rafael Andrade',
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440002',
    pacienteId: 'p2',
    nome: 'Pulseira de Ana Clara Souza',
  },
];
