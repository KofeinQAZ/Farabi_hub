import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Layers, LogOut, Menu, X } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const [session, setSession] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      checkAdmin(session?.user?.email);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      checkAdmin(session?.user?.email);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkAdmin = async (email) => {
    if (!email) return setIsAdmin(false);
    const { data } = await supabase.from('admins').select('*').eq('email', email).single();
    setIsAdmin(!!data);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Не показываем Navbar внутри админки
  if (location.pathname.startsWith('/admin')) return null;

  const navLinks = [
    { path: '/', label: 'Главная' },
    { path: '/about', label: 'О нас' },
    { path: '/book', label: 'Забронировать' },
  ];

  return (
    <nav className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Логотип */}
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center shadow-sm">
              <Layers className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-slate-900 leading-none">Farabi Tech Hub</span>
              <span className="text-[10px] text-slate-400 font-medium uppercase tracking-widest mt-1">Conference Center</span>
            </div>
          </Link>

          {/* Ссылки (Десктоп) */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map(link => (
              <Link key={link.path} to={link.path} className={`text-sm font-semibold transition-colors ${location.pathname === link.path ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}>
                {link.label}
              </Link>
            ))}
          </div>

          {/* Авторизация / Админка */}
          <div className="hidden md:flex items-center gap-4">
            {session ? (
              <div className="flex items-center gap-4">
                {isAdmin && (
                  <Link to="/admin" className="text-sm font-bold text-blue-600 hover:text-blue-700 bg-blue-50 px-4 py-2 rounded-xl transition-colors">
                    Панель управления
                  </Link>
                )}
                <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 py-1.5 pl-4 pr-1.5 rounded-full">
                  <span className="text-xs font-medium text-slate-600 truncate max-w-[150px]">{session.user.email}</span>
                  <button onClick={handleLogout} className="bg-white p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-100 shadow-sm transition-all" title="Выйти">
                    <LogOut size={14} />
                  </button>
                </div>
              </div>
            ) : (
              <Link to="/admin" className="text-sm font-medium text-slate-600 hover:text-slate-900 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors border border-slate-200">
                Вход для менеджеров
              </Link>
            )}
          </div>

          {/* Кнопка мобильного меню */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="text-slate-600 hover:text-slate-900">
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Мобильное меню */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-1 shadow-lg absolute w-full">
          {navLinks.map(link => (
            <Link key={link.path} to={link.path} onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-3 rounded-xl text-base font-medium ${location.pathname === link.path ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}`}>
              {link.label}
            </Link>
          ))}
          {session && isAdmin && (
            <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)} className="block px-3 py-3 rounded-xl text-base font-bold text-blue-600 hover:bg-blue-50">
              Панель управления
            </Link>
          )}
        </div>
      )}
    </nav>
  );
}