import { filtrarPacientePorRole } from './handlers';
import { pacientesMock } from './data';

const rafael = pacientesMock[0]; // tem doença sensível e ficha completa
const anaClara = pacientesMock[1]; // tem TEA (transtorno)

test('médico recebe o prontuário completo', () => {
  const v = filtrarPacientePorRole(rafael, 'medico');
  expect(v.identificacao.cpf).toBe(rafael.cpf);
  expect(v.identificacao.mae).toBe(rafael.mae);
  expect(v.fichaMedica?.observacoes).toBeTruthy();
  expect(v.alergias).toHaveLength(rafael.alergias.length);
  expect(v.doencas?.some((d) => d.sensivel)).toBe(true);
  expect(filtrarPacientePorRole(anaClara, 'medico').transtornos?.length).toBeGreaterThan(0);
});

test('policial recebe SOMENTE identificação civil — nunca dados clínicos', () => {
  const v = filtrarPacientePorRole(rafael, 'policial');
  expect(v.identificacao.cpf).toBe(rafael.cpf);
  expect(v.identificacao.mae).toBe(rafael.mae);
  expect(v.fichaMedica).toBeUndefined();
  expect(v.alergias).toBeUndefined();
  expect(v.doencas).toBeUndefined();
  expect(v.transtornos).toBeUndefined();
  expect(v.deficiencias).toBeUndefined();
});

test('bombeiro recebe ficha essencial sem CPF, sem filiação, sem dados sensíveis', () => {
  const v = filtrarPacientePorRole(rafael, 'bombeiro');
  expect(v.identificacao.cpf).toBeUndefined();
  expect(v.identificacao.mae).toBeUndefined();
  expect(v.identificacao.pai).toBeUndefined();
  expect(v.identificacao.endereco).toBe(rafael.endereco);
  expect(v.fichaMedica?.tipoSanguineo).toBe(rafael.fichaMedica.tipoSanguineo);
  expect(v.alergias).toHaveLength(rafael.alergias.length);
  expect(v.doencas?.every((d) => !d.sensivel)).toBe(true);
  expect(v.deficiencias).toBeDefined();
  expect(filtrarPacientePorRole(anaClara, 'bombeiro').transtornos).toBeUndefined();
});

test('titular (usuario) vê os próprios dados completos', () => {
  const v = filtrarPacientePorRole(rafael, 'usuario');
  expect(v.identificacao.cpf).toBe(rafael.cpf);
  expect(v.fichaMedica).toBeDefined();
  expect(v.doencas?.some((d) => d.sensivel)).toBe(true);
});
