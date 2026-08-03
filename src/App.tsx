import { Routes, Route } from 'react-router-dom';
import SelecaoPerfil from './pages/SelecaoPerfil';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-creme text-slate-800">
      <Routes>
        <Route path="/" element={<SelecaoPerfil />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
