import { Routes, Route } from 'react-router-dom';
import ProfileSelection from './pages/ProfileSelection';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Bracelet from './pages/Bracelet';
import NotFound from './pages/NotFound';
import { RequireAuth } from './components/RequireAuth';
import Account from './pages/Account';

export default function App() {
  return (
    <div className="min-h-screen bg-creme text-slate-800">
      <Routes>
        <Route path="/" element={<ProfileSelection />} />
        <Route path="/login/:perfil" element={<Login />} />
        <Route path="/cadastro/:perfil" element={<Signup />} />
        <Route
          path="/pulseira/:uuid"
          element={
            <RequireAuth>
              <Bracelet />
            </RequireAuth>
          }
        />
        <Route
          path="/conta"
          element={
            <RequireAuth>
              <Account />
            </RequireAuth>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </div>
  );
}
