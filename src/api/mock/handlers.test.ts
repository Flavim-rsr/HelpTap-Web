import { filterPatientByRole } from './handlers';
import { mockPatients } from './data';

const rafael = mockPatients[0]; // tem doença sensível e ficha completa
const anaClara = mockPatients[1]; // tem TEA (transtorno)

test('médico recebe o prontuário completo', () => {
  const v = filterPatientByRole(rafael, 'medico');
  expect(v.identification.cpf).toBe(rafael.cpf);
  expect(v.identification.motherName).toBe(rafael.motherName);
  expect(v.medicalRecord?.notes).toBeTruthy();
  expect(v.allergies).toHaveLength(rafael.allergies.length);
  expect(v.illnesses?.some((d) => d.sensitive)).toBe(true);
  expect(filterPatientByRole(anaClara, 'medico').disorders?.length).toBeGreaterThan(0);
  expect(v.healthInsurance).toEqual({ has: true, number: rafael.healthInsuranceNumber });
});

test('policial recebe identificação civil, endereço e transtornos — nunca ficha clínica', () => {
  const v = filterPatientByRole(rafael, 'policial');
  expect(v.identification.cpf).toBe(rafael.cpf);
  expect(v.identification.motherName).toBe(rafael.motherName);
  expect(v.identification.addresses).toEqual([rafael.address]);
  expect(v.medicalRecord).toBeUndefined();
  expect(v.allergies).toBeUndefined();
  expect(v.illnesses).toBeUndefined();
  expect(v.deficiencies).toBeUndefined();
  expect(filterPatientByRole(anaClara, 'policial').disorders?.length).toBeGreaterThan(0);
});

test('endereço da vítima é exclusivo do policial (e do titular/médico)', () => {
  expect(filterPatientByRole(rafael, 'bombeiro').identification.addresses).toBeUndefined();
  expect(filterPatientByRole(rafael, 'socorrista').identification.addresses).toBeUndefined();
});

test('convênio médico chega em todos os perfis', () => {
  for (const role of ['medico', 'policial', 'bombeiro', 'socorrista', 'usuario'] as const) {
    expect(filterPatientByRole(rafael, role).healthInsurance).toEqual({
      has: true,
      number: rafael.healthInsuranceNumber,
    });
  }
  // Sem plano, o número não é enviado.
  expect(filterPatientByRole(anaClara, 'bombeiro').healthInsurance).toEqual({ has: false });
});

test('bombeiro recebe ficha essencial sem CPF, sem filiação e sem doenças sensíveis', () => {
  const v = filterPatientByRole(rafael, 'bombeiro');
  expect(v.identification.cpf).toBeUndefined();
  expect(v.identification.motherName).toBeUndefined();
  expect(v.identification.fatherName).toBeUndefined();
  expect(v.medicalRecord?.bloodType).toBe(rafael.medicalRecord.bloodType);
  expect(v.allergies).toHaveLength(rafael.allergies.length);
  expect(v.illnesses?.every((d) => !d.sensitive)).toBe(true);
  expect(v.deficiencies).toBeDefined();
  // transtornos passaram a ser legíveis por bombeiro (ProfileService.canReadDisorders)
  expect(filterPatientByRole(anaClara, 'bombeiro').disorders?.length).toBeGreaterThan(0);
});

test('socorrista recebe ficha essencial como o bombeiro, mas COM doenças sensíveis (RESCUER no back)', () => {
  const v = filterPatientByRole(rafael, 'socorrista');
  expect(v.identification.cpf).toBeUndefined();
  expect(v.identification.motherName).toBeUndefined();
  expect(v.medicalRecord?.bloodType).toBe(rafael.medicalRecord.bloodType);
  expect(v.allergies).toHaveLength(rafael.allergies.length);
  expect(v.illnesses?.some((d) => d.sensitive)).toBe(true);
  expect(v.deficiencies).toBeDefined();
  expect(filterPatientByRole(anaClara, 'socorrista').disorders?.length).toBeGreaterThan(0);
});

test('titular (usuario) vê os próprios dados completos', () => {
  const v = filterPatientByRole(rafael, 'usuario');
  expect(v.identification.cpf).toBe(rafael.cpf);
  expect(v.medicalRecord).toBeDefined();
  expect(v.illnesses?.some((d) => d.sensitive)).toBe(true);
});
