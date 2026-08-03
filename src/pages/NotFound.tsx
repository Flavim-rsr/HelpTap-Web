import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center p-4 text-center">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Página não encontrada</h1>
        <p className="mt-1 text-sm text-slate-500">O endereço acessado não existe.</p>
        <Link to="/" className="mt-4 inline-block text-brand underline">
          Voltar ao início
        </Link>
      </div>
    </main>
  );
}
