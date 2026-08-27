import { Outlet, NavLink } from 'react-router-dom';
import {
  LayoutDashboard, DollarSign, CreditCard,
  Users, FileText, LogOut, Moon, Sun, Menu, X, ClipboardList
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState, useEffect } from 'react';

const navItems = [
  { to: '/',          label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/donations', label: 'Donations',    icon: DollarSign },
  { to: '/expenses',  label: 'Expenses',     icon: CreditCard },
  { to: '/members',   label: 'Members',      icon: Users },
  { to: '/reports',   label: 'Reports',      icon: FileText },
  { to: '/logs',      label: 'Activity Log', icon: ClipboardList },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const [darkMode, setDarkMode]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const isDark = localStorage.getItem('darkMode') === 'true';
    setDarkMode(isDark);
    if (isDark) document.documentElement.classList.add('dark');
  }, []);

  const toggleDark = () => {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next);
    document.documentElement.classList.toggle('dark');
  };

  const close = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-slate-50 dark:bg-gray-950">

      {/* ── Mobile top bar ── */}
      <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3
                         bg-white/90 dark:bg-gray-900/90 backdrop-blur border-b
                         border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-2.5">
          <img src="/logo.png" alt="logo" className="w-8 h-8 object-contain" />
          <span className="font-bold text-base text-gray-900 dark:text-white">Ganesh Mahotsav</span>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={toggleDark}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
            {darkMode ? <Sun size={19} /> : <Moon size={19} />}
          </button>
          <button onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800">
            {sidebarOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </header>

      {/* ── Overlay ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/40 lg:hidden backdrop-blur-sm" onClick={close} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50 flex flex-col w-64
        bg-white dark:bg-gray-900
        border-r border-gray-200 dark:border-gray-800
        shadow-sidebar
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="hidden lg:flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <img src="/logo.png" alt="logo"
            className="w-11 h-11 object-contain" />
          <div>
            <p className="font-bold text-sm text-gray-900 dark:text-white leading-tight">Ganesh Mahotsav</p>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-0.5">Hisab Management</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <p className="px-3 mb-2 text-[10px] font-semibold uppercase tracking-widest text-gray-400 dark:text-gray-500">
            Main Menu
          </p>
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} onClick={close}
              className={({ isActive }) => `
                flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-primary-600 text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }
              `}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-3 py-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-2 px-3 py-2 mb-2 rounded-xl bg-gray-50 dark:bg-gray-800">
            <div className="w-7 h-7 rounded-full bg-primary-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
              <p className="text-[10px] text-gray-400 capitalize">{user?.role}</p>
            </div>
            <button onClick={toggleDark}
              className="hidden lg:flex p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
              {darkMode ? <Sun size={15} /> : <Moon size={15} />}
            </button>
          </div>
          <button onClick={logout}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-colors">
            <LogOut size={16} />
            Sign out
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8 animate-fade-in page-enter">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default Layout;
