import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DailyKm from './pages/DailyKm';
import WeeklyDelivery from './pages/WeeklyDelivery';
import Expenses from './pages/Expenses';
import VehicleControl from './pages/VehicleControl';
import Notes from './pages/Notes';
import Photos from './pages/Photos';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="flex items-center justify-center min-h-screen"><p>Cargando...</p></div>;
  if (!user) return <Navigate to="/login" />;
  return children;
}

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
        <Route index element={<Dashboard />} />
        <Route path="km" element={<DailyKm />} />
        <Route path="entregas" element={<WeeklyDelivery />} />
        <Route path="gastos" element={<Expenses />} />
        <Route path="vehiculo" element={<VehicleControl />} />
        <Route path="notas" element={<Notes />} />
        <Route path="fotos" element={<Photos />} />
      </Route>
    </Routes>
  );
}

export default App;
