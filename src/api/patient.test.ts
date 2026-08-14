import { getPatientByUuid } from './patient';
import { accessLogs } from './mock/handlers';

const UUID_RAFAEL = '550e8400-e29b-41d4-a716-446655440001';
const UUID_ANA = '550e8400-e29b-41d4-a716-446655440002';

test('devolve o paciente filtrado pelo perfil', async () => {
  const v = await getPatientByUuid(UUID_RAFAEL, 'policial');
  expect(v.name).toBe('Rafael Andrade');
  expect(v.medicalRecord).toBeUndefined(); // policial não vê dados clínicos
});

test('uuid desconhecido rejeita com PULSEIRA_NAO_ENCONTRADA', async () => {
  await expect(getPatientByUuid('nao-existe', 'medico')).rejects.toThrow(
    'PULSEIRA_NAO_ENCONTRADA',
  );
});

test('cada leitura grava um AccessLog com role e wearableId', async () => {
  const before = accessLogs.length;
  await getPatientByUuid(UUID_RAFAEL, 'bombeiro');
  expect(accessLogs).toHaveLength(before + 1);
  const log = accessLogs[accessLogs.length - 1];
  expect(log.wearableId).toBe(UUID_RAFAEL);
  expect(log.role).toBe('bombeiro');
  expect(log.accessedAt).toBeTruthy();
});

test('usuario (titular) lendo a pulseira de outro paciente rejeita com ACESSO_NEGADO', async () => {
  await expect(getPatientByUuid(UUID_ANA, 'usuario', 'p1')).rejects.toThrow('ACESSO_NEGADO');
});

test('usuario (titular) lendo a própria pulseira resolve normalmente', async () => {
  const v = await getPatientByUuid(UUID_RAFAEL, 'usuario', 'p1');
  expect(v.name).toBe('Rafael Andrade');
});

test('médico continua lendo qualquer pulseira normalmente (sem patientId)', async () => {
  const v = await getPatientByUuid(UUID_ANA, 'medico');
  expect(v.name).toBe('Ana Clara Souza');
});
