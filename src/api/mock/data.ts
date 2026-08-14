import type { FullPatientRecord, Role, Wearable } from '../../types';

export interface MockUser {
  email: string;
  password: string;
  role: Role;
  name: string;
  /** id do FullPatientRecord vinculado, quando role === 'usuario' */
  patientId?: string;
}

export const mockUsers: MockUser[] = [
  { email: 'medico@helptap.com', password: '123456', role: 'medico', name: 'Dra. Carla Mendes' },
  { email: 'policial@helptap.com', password: '123456', role: 'policial', name: 'Sgt. Paulo Lima' },
  { email: 'bombeiro@helptap.com', password: '123456', role: 'bombeiro', name: 'Cb. Marcos Dias' },
  {
    email: 'rafael@helptap.com',
    password: '123456',
    role: 'usuario',
    name: 'Rafael Andrade',
    patientId: 'p1',
  },
];

export const mockPatients: FullPatientRecord[] = [
  {
    id: 'p1',
    name: 'Rafael Andrade',
    age: 22,
    cpf: '123.456.789-00',
    address: 'Rua das Flores, 123 - Centro, São Paulo - SP',
    guardianPhone: '(16) 99223-5555',
    motherName: 'Ana Santos',
    fatherName: 'José Santos',
    medicalRecord: {
      bloodType: 'O+',
      heightCm: 165,
      weightKg: 68,
      ethnicity: 'Branco',
      organDonor: true,
      notes:
        'Paciente com histórico cardiovascular. Necessita acompanhamento contínuo.',
    },
    allergies: [{ name: 'Dipirona', severity: 'Alta' }],
    illnesses: [
      { name: 'Hipertensão', sensitive: false },
      { name: 'HIV positivo', sensitive: true },
    ],
    disorders: [],
    deficiencies: [],
  },
  {
    id: 'p2',
    name: 'Ana Clara Souza',
    age: 12,
    cpf: '987.654.321-00',
    address: 'Av. Brasil, 456 - Jardim América, Franca - SP',
    guardianPhone: '(16) 98877-1234',
    motherName: 'Mariana Souza',
    fatherName: 'Carlos Souza',
    medicalRecord: {
      bloodType: 'A-',
      heightCm: 148,
      weightKg: 40,
      ethnicity: 'Parda',
      organDonor: false,
    },
    allergies: [
      { name: 'Amendoim', severity: 'Alta' },
      { name: 'Poeira', severity: 'Baixa' },
    ],
    illnesses: [{ name: 'Asma', sensitive: false }],
    disorders: [
      {
        name: 'Transtorno do Espectro Autista — nível 2',
        note: 'Hipersensibilidade sensorial. Abordar com redução de estímulos.',
      },
    ],
    deficiencies: [],
  },
];

export const mockWearables: Wearable[] = [
  {
    uuid: '550e8400-e29b-41d4-a716-446655440001',
    patientId: 'p1',
    name: 'Pulseira de Rafael Andrade',
  },
  {
    uuid: '550e8400-e29b-41d4-a716-446655440002',
    patientId: 'p2',
    name: 'Pulseira de Ana Clara Souza',
  },
];
