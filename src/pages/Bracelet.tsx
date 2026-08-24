import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { HeartPulse, IdCard, UserRound } from 'lucide-react';
import {
  AllergyIcon,
  BrainIcon,
  DeficiencyIcon,
  MedicalRecordIcon,
  RulerIcon,
  WeightIcon,
} from '../components/icons';
import { heightMeters, weightKg } from '../utils/format';
import { getPatientByUuid } from '../api/patient';
import { useAuth } from '../contexts/AuthContext';
import { SectionCard } from '../components/SectionCard';
import { SeverityBadge } from '../components/SeverityBadge';
import { PatientHeader } from '../components/PatientHeader';
import type { PatientView } from '../types';

function DataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{label}</dt>
      <dd className="text-right font-medium">{value}</dd>
    </div>
  );
}

export default function Bracelet() {
  const { uuid = '' } = useParams();
  const navigate = useNavigate();
  const { session, signOut } = useAuth();
  const [status, setStatus] = useState<'loading' | 'error' | 'ok'>('loading');
  const [patient, setPatient] = useState<PatientView | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!session) return;
    let active = true;
    setStatus('loading');
    getPatientByUuid(uuid, session.role, session.patientId, session.token)
      .then((p) => {
        if (active) {
          setPatient(p);
          setStatus('ok');
        }
      })
      .catch((error: unknown) => {
        if (active) {
          const text = error instanceof Error ? error.message : '';
          setErrorMessage(text === 'ACESSO_NEGADO' ? '' : text);
          setStatus('error');
        }
      });
    return () => {
      active = false;
    };
  }, [uuid, session]);

  if (status === 'loading') {
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <p className="text-sm text-slate-500">Carregando informações do paciente…</p>
      </main>
    );
  }

  if (status === 'error' || !patient) {
    return (
      <main className="grid min-h-screen place-items-center p-4 text-center">
        <div>
          <h1 className="text-xl font-bold">Pulseira não vinculada</h1>
          <p className="mt-1 text-sm text-slate-500">
            {errorMessage || 'Nenhum paciente está associado a este código.'}
          </p>
          {session?.role === 'usuario' ? (
            <button
              onClick={() => {
                signOut();
                navigate('/');
              }}
              className="mt-4 inline-block text-brand"
            >
              Sair
            </button>
          ) : (
            <Link to="/leitura" className="mt-4 inline-block text-brand underline">
              Voltar à leitura
            </Link>
          )}
        </div>
      </main>
    );
  }

  const { identification: id, medicalRecord: record } = patient;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-4 pb-10">
      {session?.role === 'usuario' ? (
        // Para o titular a volta é sair da conta; profissionais vão à própria conta.
        <button
          onClick={() => {
            signOut();
            navigate('/');
          }}
          className="self-start text-sm text-slate-500 hover:text-slate-700"
        >
          ← Sair
        </button>
      ) : (
        <Link to="/conta" className="text-sm text-slate-500 hover:text-slate-700">
          ← Minha conta
        </Link>
      )}
      <PatientHeader
        name={patient.name}
        age={patient.age}
        contacts={patient.contacts}
        photoUrl={patient.photoUrl}
      />
      <SectionCard title="Identificação" Icon={IdCard}>
        <dl className="flex flex-col gap-2 text-sm">
          {id.cpf && <DataRow label="CPF" value={id.cpf} />}
          {id.address && <DataRow label="Endereço" value={id.address} />}
          {id.guardianPhone && (
            <DataRow label="Tel. Responsável" value={id.guardianPhone} />
          )}
          {id.motherName && <DataRow label="Mãe" value={id.motherName} />}
          {id.fatherName && <DataRow label="Pai" value={id.fatherName} />}
        </dl>
      </SectionCard>

      {record && (
        <SectionCard title="Ficha Médica" Icon={HeartPulse}>
          <div className="mb-3 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
            <span className="text-sm text-slate-600">Tipo Sanguíneo</span>
            <span className="text-lg font-bold text-red-600">{record.bloodType}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-slate-50 p-2">
              <RulerIcon className="mx-auto size-4 text-slate-400" />
              <span className="block text-xs text-slate-500">Altura</span>
              <span className="font-semibold">{heightMeters(record.heightCm)}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <WeightIcon className="mx-auto size-4 text-slate-400" />
              <span className="block text-xs text-slate-500">Peso</span>
              <span className="font-semibold">{weightKg(record.weightKg)}</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <UserRound aria-hidden className="mx-auto size-4 text-slate-400" />
              <span className="block text-xs text-slate-500">Etnia</span>
              <span className="font-semibold">{record.ethnicity}</span>
            </div>
          </div>
          {record.organDonor && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">
              Doador de Órgãos
            </p>
          )}
          {record.notes && (
            <p className="mt-3 text-sm text-slate-600">
              <span className="font-medium">Observações:</span> {record.notes}
            </p>
          )}
        </SectionCard>
      )}

      {patient.allergies && patient.allergies.length > 0 && (
        <SectionCard title="Alergias" Icon={AllergyIcon}>
          <ul className="flex flex-col gap-2 text-sm">
            {patient.allergies.map((a) => (
              <li key={a.name} className="flex items-center justify-between">
                {a.name}
                <SeverityBadge level={a.severity} />
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {patient.illnesses && patient.illnesses.length > 0 && (
        <SectionCard title="Doenças" Icon={MedicalRecordIcon}>
          <ul className="flex flex-col gap-1 text-sm">
            {patient.illnesses.map((d) => (
              <li key={d.name}>{d.name}</li>
            ))}
          </ul>
        </SectionCard>
      )}

      {patient.disorders && patient.disorders.length > 0 && (
        <SectionCard title="Transtornos" Icon={BrainIcon}>
          <ul className="flex flex-col gap-2 text-sm">
            {patient.disorders.map((t) => (
              <li key={t.name}>
                <p className="font-medium">{t.name}</p>
                {t.note && <p className="text-slate-500">{t.note}</p>}
              </li>
            ))}
          </ul>
        </SectionCard>
      )}

      {patient.deficiencies && patient.deficiencies.length > 0 && (
        <SectionCard title="Deficiências" Icon={DeficiencyIcon}>
          <ul className="flex flex-col gap-1 text-sm">
            {patient.deficiencies.map((d) => (
              <li key={d.name}>{d.name}</li>
            ))}
          </ul>
        </SectionCard>
      )}
    </main>
  );
}
