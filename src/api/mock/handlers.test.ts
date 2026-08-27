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
});

test('policial recebe SOMENTE identificação civil — nunca dados clínicos', () => {
  const v = filterPatientByRole(rafael, 'policial');
  expect(v.identification.cpf).toBe(rafael.cpf);
  expect(v.identification.motherName).toBe(rafael.motherName);
  expect(v.medicalRecord).toBeUndefined();
  expect(v.allergies).toBeUndefined();
  expect(v.illnesses).toBeUndefined();
  expect(v.disorders).toBeUndefined();
  expect(v.deficiencies).toBeUndefined();
});

test('bombeiro recebe ficha essencial sem CPF, sem filiação, sem dados sensíveis', () => {
  const v = filterPatientByRole(rafael, 'bombeiro');
  expect(v.identification.cpf).toBeUndefined();
  expect(v.identification.motherName).toBeUndefined();
  expect(v.identification.fatherName).toBeUndefined();
  expect(v.identification.address).toBe(rafael.address);
  expect(v.medicalRecord?.bloodType).toBe(rafael.medicalRecord.bloodType);
  expect(v.allergies).toHaveLength(rafael.allergies.length);
  expect(v.illnesses?.every((d) => !d.sensitive)).toBe(true);
  expect(v.deficiencies).toBeDefined();
  expect(filterPatientByRole(anaClara, 'bombeiro').disorders).toBeUndefined();
});

test('socorrista recebe ficha essencial como o bombeiro, mas COM doenças sensíveis (RESCUER no back)', () => {
  const v = filterPatientByRole(rafael, 'socorrista');
  expect(v.identification.cpf).toBeUndefined();
  expect(v.identification.motherName).toBeUndefined();
  expect(v.identification.address).toBe(rafael.address);
  expect(v.medicalRecord?.bloodType).toBe(rafael.medicalRecord.bloodType);
  expect(v.allergies).toHaveLength(rafael.allergies.length);
  expect(v.illnesses?.some((d) => d.sensitive)).toBe(true);
  expect(v.deficiencies).toBeDefined();
  expect(filterPatientByRole(anaClara, 'socorrista').disorders).toBeUndefined();
});

test('titular (usuario) vê os próprios dados completos', () => {
  const v = filterPatientByRole(rafael, 'usuario');
  expect(v.identification.cpf).toBe(rafael.cpf);
  expect(v.medicalRecord).toBeDefined();
  expect(v.illnesses?.some((d) => d.sensitive)).toBe(true);
});
