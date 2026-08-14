import { afterEach, beforeEach, expect, test, vi } from 'vitest';
import { getPatientByUuid } from './patient';

const RESPONSE = {
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
    emergencyContacts: [
      { phone: '(16) 99223-5555', phoneOwner: 'Maria' },
      { phone: '(16) 98877-1234', phoneOwner: 'João' },
    ],
  },
};

const BASIC_DATA = { dateBirth: '2002-05-22', userPicture: 'data:image/jpeg;base64,Zm90bw==' };

function stubFetch(body: unknown, basicData: unknown = BASIC_DATA) {
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
      text: () => Promise.resolve(JSON.stringify(basicData)),
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
  const fetchMock = stubFetch(RESPONSE);

  const patient = await getPatientByUuid('uuid-1', 'medico', undefined, 'jwt');

  expect(fetchMock).toHaveBeenCalledWith(
    'https://api.teste/api/nfc/read/uuid-1/professional',
    expect.objectContaining({ method: 'POST' }),
  );
  expect(patient.name).toBe('Rafael Andrade');
  expect(patient.age).toBeGreaterThanOrEqual(24);
  expect(patient.photoUrl).toBe('data:image/jpeg;base64,Zm90bw==');
  expect(fetchMock.mock.calls[1][0]).toBe('https://api.teste/api/users/7');
  expect(patient.identification.guardianPhone).toBe('(16) 99223-5555');
  expect(patient.contacts).toEqual([
    { name: 'Maria', phone: '(16) 99223-5555' },
    { name: 'João', phone: '(16) 98877-1234' },
  ]);
  expect(patient.medicalRecord).toEqual({
    bloodType: 'O+',
    heightCm: 170,
    weightKg: 70.5,
    ethnicity: 'Pardo',
    organDonor: true,
    notes: 'Histórico cardiovascular.',
  });
  expect(patient.allergies).toEqual([{ name: 'Dipirona', severity: 'Critica' }]);
  expect(patient.illnesses).toEqual([{ name: 'Diabetes tipo 2', sensitive: true }]);
  expect(patient.disorders).toEqual([{ name: 'TDAH', note: 'Moderado, Acompanhamento' }]);
  expect(patient.deficiencies).toEqual([{ name: 'Auditiva' }]);
});

test('perfil sem ficha médica e sem listas vem só com o essencial', async () => {
  stubFetch({
    ...RESPONSE,
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

  const patient = await getPatientByUuid('uuid-1', 'policial', undefined, 'jwt');

  expect(patient.medicalRecord).toBeUndefined();
  expect(patient.photoUrl).toBe('data:image/jpeg;base64,Zm90bw==');
  expect(patient.allergies).toBeUndefined();
  expect(patient.contacts).toBeUndefined();
  expect(patient.identification).toEqual({});
});

test('titular não abre pulseira de outra pessoa', async () => {
  stubFetch(RESPONSE);

  await expect(getPatientByUuid('uuid-1', 'usuario', '999', 'jwt')).rejects.toThrow(
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

  await expect(getPatientByUuid('uuid-1', 'medico', undefined, 'jwt')).rejects.toThrow(
    /desativada/,
  );
});
