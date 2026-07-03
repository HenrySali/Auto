import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const navItems = [
    { to: '/', label: 'Inicio', icon: '📊' },
    { to: '/km', label: 'Km', icon: '🛣️' },
    { to: '/entregas', label: 'Entregas', icon: '💰' },
    { to: '/fotos', label: 'Fotos', icon: '📷' },
    ...(user?.role === 'admin' ? [
      { to: '/gastos', label: 'Gastos', icon: '💸' },
      { to: '/vehiculo', label: 'Auto', icon: '🚗' },
    ] : []),
    { to: '/notas', label: 'Notas', icon: '📝' },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-primary text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div>
          <h1 className="text-lg font-bold">Auto Manager</h1>
          <p className="text-xs text-purple-200">{user?.name} - {user?.role === 'admin' ? 'Admin/Dueno' : 'Conductor'}</p>
        </div>
        <button onClick={handleLogout} className="text-sm bg-white/20 px-3 py-1 rounded-lg hover:bg-white/30">Salir</button>
      </header>
      <main className="flex-1 p-4 pb-20 max-w-lg mx-auto w-full"><Outlet /></main>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-2 py-1 flex justify-around items-center shadow-lg">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/'} className={({ isActive }) =>
            `flex flex-col items-center px-2 py-1 rounded-lg text-xs transition-colors ${isActive ? 'text-primary font-bold' : 'text-gray-500'}`
          }>
            <span className="text-lg">{item.icon}</span>
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

export default Layout;
