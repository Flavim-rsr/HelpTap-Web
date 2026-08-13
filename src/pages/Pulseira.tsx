import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Accessibility,
  Brain,
  HeartPulse,
  IdCard,
  Stethoscope,
  TriangleAlert,
} from 'lucide-react';
import { getPacienteByUuid } from '../api/paciente';
import { useAuth } from '../contexts/AuthContext';
import { CardSecao } from '../components/CardSecao';
import { BadgeCriticidade } from '../components/BadgeCriticidade';
import { HeaderPaciente } from '../components/HeaderPaciente';
import type { PacienteView } from '../types';

function LinhaDado({ rotulo, valor }: { rotulo: string; valor: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="shrink-0 text-slate-500">{rotulo}</dt>
      <dd className="text-right font-medium">{valor}</dd>
    </div>
  );
}

export default function Pulseira() {
  const { uuid = '' } = useParams();
  const { sessao } = useAuth();
  const [estado, setEstado] = useState<'carregando' | 'erro' | 'ok'>('carregando');
  const [paciente, setPaciente] = useState<PacienteView | null>(null);
  const [mensagemErro, setMensagemErro] = useState('');

  useEffect(() => {
    if (!sessao) return;
    let ativo = true;
    setEstado('carregando');
    getPacienteByUuid(uuid, sessao.role, sessao.pacienteId, sessao.token)
      .then((p) => {
        if (ativo) {
          setPaciente(p);
          setEstado('ok');
        }
      })
      .catch((erro: unknown) => {
        if (ativo) {
          const texto = erro instanceof Error ? erro.message : '';
          setMensagemErro(texto === 'ACESSO_NEGADO' ? '' : texto);
          setEstado('erro');
        }
      });
    return () => {
      ativo = false;
    };
  }, [uuid, sessao]);

  if (estado === 'carregando') {
    return (
      <main className="grid min-h-screen place-items-center p-4">
        <p className="text-sm text-slate-500">Carregando informações do paciente…</p>
      </main>
    );
  }

  if (estado === 'erro' || !paciente) {
    return (
      <main className="grid min-h-screen place-items-center p-4 text-center">
        <div>
          <h1 className="text-xl font-bold">Pulseira não vinculada</h1>
          <p className="mt-1 text-sm text-slate-500">
            {mensagemErro || 'Nenhum paciente está associado a este código.'}
          </p>
          <Link to="/leitura" className="mt-4 inline-block text-brand underline">
            Voltar à leitura
          </Link>
        </div>
      </main>
    );
  }

  const { identificacao: id, fichaMedica: ficha } = paciente;

  return (
    <main className="mx-auto flex w-full max-w-md flex-col gap-4 p-4 pb-10">
      <Link to="/leitura" className="text-sm text-slate-500 hover:text-slate-700">
        ← Nova leitura
      </Link>
      <HeaderPaciente
        nome={paciente.nome}
        idade={paciente.idade}
        telefoneResponsavel={id.telefoneResponsavel}
      />
      <CardSecao titulo="Identificação" Icone={IdCard}>
        <dl className="flex flex-col gap-2 text-sm">
          {id.cpf && <LinhaDado rotulo="CPF" valor={id.cpf} />}
          {id.endereco && <LinhaDado rotulo="Endereço" valor={id.endereco} />}
          {id.telefoneResponsavel && (
            <LinhaDado rotulo="Tel. Responsável" valor={id.telefoneResponsavel} />
          )}
          {id.mae && <LinhaDado rotulo="Mãe" valor={id.mae} />}
          {id.pai && <LinhaDado rotulo="Pai" valor={id.pai} />}
        </dl>
      </CardSecao>

      {ficha && (
        <CardSecao titulo="Ficha Médica" Icone={HeartPulse}>
          <div className="mb-3 flex items-center justify-between rounded-lg bg-red-50 px-3 py-2">
            <span className="text-sm text-slate-600">Tipo Sanguíneo</span>
            <span className="text-lg font-bold text-red-600">{ficha.tipoSanguineo}</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-sm">
            <div className="rounded-lg bg-slate-50 p-2">
              <span className="block text-xs text-slate-500">Altura</span>
              <span className="font-semibold">{ficha.alturaCm} cm</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <span className="block text-xs text-slate-500">Peso</span>
              <span className="font-semibold">{ficha.pesoKg} kg</span>
            </div>
            <div className="rounded-lg bg-slate-50 p-2">
              <span className="block text-xs text-slate-500">Etnia</span>
              <span className="font-semibold">{ficha.etnia}</span>
            </div>
          </div>
          {ficha.doadorOrgaos && (
            <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-center text-sm font-medium text-red-600">
              Doador de Órgãos
            </p>
          )}
          {ficha.observacoes && (
            <p className="mt-3 text-sm text-slate-600">
              <span className="font-medium">Observações:</span> {ficha.observacoes}
            </p>
          )}
        </CardSecao>
      )}

      {paciente.alergias && paciente.alergias.length > 0 && (
        <CardSecao titulo="Alergias" Icone={TriangleAlert}>
          <ul className="flex flex-col gap-2 text-sm">
            {paciente.alergias.map((a) => (
              <li key={a.nome} className="flex items-center justify-between">
                {a.nome}
                <BadgeCriticidade nivel={a.criticidade} />
              </li>
            ))}
          </ul>
        </CardSecao>
      )}

      {paciente.doencas && paciente.doencas.length > 0 && (
        <CardSecao titulo="Doenças" Icone={Stethoscope}>
          <ul className="flex flex-col gap-1 text-sm">
            {paciente.doencas.map((d) => (
              <li key={d.nome}>{d.nome}</li>
            ))}
          </ul>
        </CardSecao>
      )}

      {paciente.transtornos && paciente.transtornos.length > 0 && (
        <CardSecao titulo="Transtornos" Icone={Brain}>
          <ul className="flex flex-col gap-2 text-sm">
            {paciente.transtornos.map((t) => (
              <li key={t.nome}>
                <p className="font-medium">{t.nome}</p>
                {t.observacao && <p className="text-slate-500">{t.observacao}</p>}
              </li>
            ))}
          </ul>
        </CardSecao>
      )}

      {paciente.deficiencias && paciente.deficiencias.length > 0 && (
        <CardSecao titulo="Deficiências" Icone={Accessibility}>
          <ul className="flex flex-col gap-1 text-sm">
            {paciente.deficiencias.map((d) => (
              <li key={d.nome}>{d.nome}</li>
            ))}
          </ul>
        </CardSecao>
      )}
    </main>
  );
}
