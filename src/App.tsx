import { Routes, Route } from 'react-router-dom';
import SelecaoPerfil from './pages/SelecaoPerfil';
import Login from './pages/Login';
import NotFound from './pages/NotFound';

export default function App() {
  return (
    <div className="min-h-screen bg-creme text-slate-800">
      <Routes>
        <Route path="/" element={<SelecaoPerfil />} />
        <Route path="/login/:perfil" element={<Login />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
