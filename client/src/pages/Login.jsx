import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try { await login(email, password); navigate('/'); }
    catch (err) { setError(err.response?.data?.error || 'Error al iniciar sesion'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-b from-primary/10 to-white">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-primary">Auto Manager</h1>
          <p className="text-gray-500 mt-2">Gestion de tu auto en Cabify</p>
        </div>
        <form onSubmit={handleSubmit} className="card space-y-4">
          <h2 className="text-xl font-bold text-center">Iniciar Sesion</h2>
          {error && <p className="text-danger text-sm text-center bg-red-50 p-2 rounded">{error}</p>}
          <div><label className="label">Email</label><input type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="tu@email.com" required /></div>
          <div><label className="label">Contrasena</label><input type="password" className="input" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="******" required /></div>
          <button type="submit" className="btn-primary w-full" disabled={loading}>{loading ? 'Entrando...' : 'Entrar'}</button>
          <p className="text-center text-sm text-gray-500">No tienes cuenta? <Link to="/register" className="text-primary font-medium">Registrate</Link></p>
        </form>
      </div>
    </div>
  );
}

export default Login;
