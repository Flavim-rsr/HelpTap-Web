import { getPacienteByUuid } from './paciente';
import { accessLogs } from './mock/handlers';

const UUID_RAFAEL = '550e8400-e29b-41d4-a716-446655440001';
const UUID_ANA = '550e8400-e29b-41d4-a716-446655440002';

test('devolve o paciente filtrado pelo perfil', async () => {
  const v = await getPacienteByUuid(UUID_RAFAEL, 'policial');
  expect(v.nome).toBe('Rafael Andrade');
  expect(v.fichaMedica).toBeUndefined(); // policial não vê dados clínicos
});

test('uuid desconhecido rejeita com PULSEIRA_NAO_ENCONTRADA', async () => {
  await expect(getPacienteByUuid('nao-existe', 'medico')).rejects.toThrow(
    'PULSEIRA_NAO_ENCONTRADA',
  );
});

test('cada leitura grava um AccessLog com role e wearableId', async () => {
  const antes = accessLogs.length;
  await getPacienteByUuid(UUID_RAFAEL, 'bombeiro');
  expect(accessLogs).toHaveLength(antes + 1);
  const log = accessLogs[accessLogs.length - 1];
  expect(log.wearableId).toBe(UUID_RAFAEL);
  expect(log.role).toBe('bombeiro');
  expect(log.accessedAt).toBeTruthy();
});

test('usuario (titular) lendo a pulseira de outro paciente rejeita com ACESSO_NEGADO', async () => {
  await expect(getPacienteByUuid(UUID_ANA, 'usuario', 'p1')).rejects.toThrow('ACESSO_NEGADO');
});

test('usuario (titular) lendo a própria pulseira resolve normalmente', async () => {
  const v = await getPacienteByUuid(UUID_RAFAEL, 'usuario', 'p1');
  expect(v.nome).toBe('Rafael Andrade');
});

test('médico continua lendo qualquer pulseira normalmente (sem pacienteId)', async () => {
  const v = await getPacienteByUuid(UUID_ANA, 'medico');
  expect(v.nome).toBe('Ana Clara Souza');
});
