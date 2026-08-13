import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { getPacienteByUuid } from './paciente';

const RESPOSTA = {
  accessLogId: 9,
  accessLevel: 'PROFESSIONAL',
  professionalProfile: {
    userId: 7,
    fullName: 'Rafael Andrade',
    viewerRole: 'DOCTOR',
    medicalRecord: {
      bloodType: 'O+',
      height: 170,
      weight: 70.5,
      ethnicity: 'Pardo',
      organDonor: true,
      description: 'Histórico cardiovascular.',
    },
    illnesses: [{ illnessName: 'Diabetes tipo 2', isSensitive: true }],
    disorders: [{ disorderName: 'TDAH', disorderDegree: 'Moderado', description: 'Acompanhamento' }],
    allergies: [{ allergenic: 'Dipirona', riskRating: 'CRITICAL' }],
    deficiencies: [{ type: 'Auditiva' }],
    emergencyContacts: [{ phone: '(16) 99223-5555', phoneOwner: 'Maria' }],
  },
};

const DADOS_BASICOS = { dateBirth: '2002-05-22', userPicture: 'data:image/jpeg;base64,Zm90bw==' };

function stubFetch(body: unknown, basicos: unknown = DADOS_BASICOS) {
  const fetchMock = vi
    .fn()
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(body)),
    })
    .mockResolvedValueOnce({
      ok: true,
      status: 200,
      text: () => Promise.resolve(JSON.stringify(basicos)),
    });
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

beforeEach(() => {
  vi.stubEnv('VITE_API_URL', 'https://api.teste');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

test('mapeia a leitura profissional real para a visão do paciente', async () => {
  const fetchMock = stubFetch(RESPOSTA);

  const paciente = await getPacienteByUuid('uuid-1', 'medico', undefined, 'jwt');

  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.teste/api/nfc/read/uuid-1/professional',
    expect.objectContaining({ method: 'POST' }),
  );
  expect(paciente.nome).toBe('Rafael Andrade');
  expect(paciente.idade).toBeGreaterThanOrEqual(24);
  expect(paciente.fotoUrl).toBe('data:image/jpeg;base64,Zm90bw==');
  expect(fetchMock.mock.calls[1][0]).toBe('https://api.teste/api/users/7');
  expect(paciente.identificacao.telefoneResponsavel).toBe('(16) 99223-5555');
  expect(paciente.fichaMedica).toEqual({
    tipoSanguineo: 'O+',
    alturaCm: 170,
    pesoKg: 70.5,
    etnia: 'Pardo',
    doadorOrgaos: true,
    observacoes: 'Histórico cardiovascular.',
  });
  expect(paciente.alergias).toEqual([{ nome: 'Dipirona', criticidade: 'Critica' }]);
  expect(paciente.doencas).toEqual([{ nome: 'Diabetes tipo 2', sensivel: true }]);
  expect(paciente.transtornos).toEqual([{ nome: 'TDAH', observacao: 'Moderado, Acompanhamento' }]);
  expect(paciente.deficiencias).toEqual([{ nome: 'Auditiva' }]);
});

test('perfil sem ficha médica e sem listas vem só com o essencial', async () => {
  stubFetch({
    ...RESPOSTA,
    professionalProfile: {
      userId: 7,
      fullName: 'Rafael Andrade',
      viewerRole: 'POLICE',
      medicalRecord: null,
      illnesses: null,
      disorders: null,
      allergies: null,
      deficiencies: null,
      emergencyContacts: null,
    },
  });

  const paciente = await getPacienteByUuid('uuid-1', 'policial', undefined, 'jwt');

  expect(paciente.fichaMedica).toBeUndefined();
  expect(paciente.fotoUrl).toBe('data:image/jpeg;base64,Zm90bw==');
  expect(paciente.alergias).toBeUndefined();
  expect(paciente.identificacao).toEqual({});
});

test('titular não abre pulseira de outra pessoa', async () => {
  stubFetch(RESPOSTA);

  await expect(getPacienteByUuid('uuid-1', 'usuario', '999', 'jwt')).rejects.toThrow(
    'ACESSO_NEGADO',
  );
});

test('erro do back chega com a mensagem original (ex.: pulseira desativada)', async () => {
  vi.stubGlobal(
    'fetch',
    vi.fn().mockResolvedValue({
      ok: false,
      status: 422,
      text: () =>
        Promise.resolve(
          JSON.stringify({ status: 422, message: 'Esta pulseira está desativada e não pode ser lida.' }),
        ),
    }),
  );

  await expect(getPacienteByUuid('uuid-1', 'medico', undefined, 'jwt')).rejects.toThrow(
    /desativada/,
  );
});
