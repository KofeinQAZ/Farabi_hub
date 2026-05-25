import PublicInventory from './components/PublicInventory';
import RentItem from './components/RentItem';
import LandingPage from "./components/LandingPage";
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "./supabaseClient";
import BookingForm from "./components/BookingForm";
import AdminDashboard from "./components/AdminDashboard";
import Auth from "./components/Auth";
import About from "./components/About"; 
import { Layers, LogOut, LayoutDashboard, LogIn, Loader2, Lock } from "lucide-react";

// ─── Full-screen loader ───────────────────────────────────────────────────────
function PageLoader() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <div className="w-12 h-12 bg-gradient-to-br from-slate-700 to-slate-900 rounded-2xl flex items-center justify-center shadow-lg">
        <Layers size={20} className="text-white" />
      </div>
      <Loader2 size={20} className="text-slate-400 animate-spin" />
      <p className="text-sm text-slate-400 tracking-wide">Farabi Tech Hub</p>
    </div>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────
function Navbar({ session, isAdmin }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <header className="bg-white border-b border-slate-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Brand */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 bg-gradient-to-br from-slate-700 to-slate-900 rounded-lg flex items-center justify-center shadow-sm group-hover:shadow transition-shadow">
            <Layers size={15} className="text-white" />
          </div>
          <div className="leading-none">
            <span className="text-sm font-bold text-slate-800 block">Farabi Tech Hub</span>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase">
              Conference Center
            </span>
          </div>
        </Link>

        {/* НАВИГАЦИЯ ПО ЦЕНТРУ (Добавили Склад) */}
        <div className="hidden md:flex items-center gap-8">
          {[
            { path: '/', label: 'Главная' },
            { path: '/about', label: 'О нас' },
            { path: '/inventory', label: 'Склад' }, // <--- Теперь юзеры увидят ссылку в меню
            { path: '/book', label: 'Забронировать' }
          ].map(link => (
            <Link 
              key={link.path} 
              to={link.path} 
              className={`text-sm font-semibold transition-colors ${location.pathname === link.path ? 'text-blue-600' : 'text-slate-500 hover:text-slate-900'}`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Nav actions */}
        <div className="flex items-center gap-2">
          {session ? (
            <>
              {isAdmin && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                >
                  <LayoutDashboard size={15} />
                  <span className="hidden sm:inline">Админ-панель</span>
                </Link>
              )}
              <div className="w-px h-5 bg-slate-200 mx-1" />
              <div className="hidden sm:flex items-center gap-2 mr-2">
                <div className="w-7 h-7 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold">
                  {session.user.email?.[0]?.toUpperCase() ?? "M"}
                </div>
                <span className="text-xs text-slate-500 max-w-[140px] truncate">
                  {session.user.email}
                </span>
              </div>
              <button
                onClick={handleSignOut}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 border border-slate-200 hover:border-red-200 transition-all"
              >
                <LogOut size={14} />
                <span className="hidden sm:inline">Выйти</span>
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
            >
              <LogIn size={14} />
              Вход для менеджеров
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}

// ─── Protected Admin Route ────────────────────────────────────────────────────
function ProtectedAdminRoute({ session, isAdmin, children }) {
  if (!session) return <Navigate to="/auth" replace />;
  if (isAdmin === null) return <PageLoader />; 
  
  if (isAdmin === false) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mb-6 shadow-sm border border-red-100">
          <Lock size={36} className="text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Доступ закрыт</h2>
        <p className="text-slate-500 max-w-md mb-8 leading-relaxed">
          У вас нет прав доступа к панели администратора. Если вы менеджер, обратитесь к руководителю для выдачи прав.
        </p>
        <Link to="/" className="px-6 py-3 bg-slate-900 text-white rounded-xl font-medium hover:bg-slate-800 transition-colors shadow-md">
          Вернуться на главную
        </Link>
      </div>
    );
  }

  return children;
}

// ─── Public Auth Route (redirect if logged in) ────────────────────────────────
function PublicAuthRoute({ session, children }) {
  if (session) return <Navigate to="/" replace />;
  return children;
}

// ─── Inner App ────────────────────────────────────────────────────────────────
function AppInner({ session, isAdmin }) {
  return (
    <>
      <Navbar session={session} isAdmin={isAdmin} />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/inventory" element={<PublicInventory />} />
        <Route path="/rent/:id" element={<RentItem />} />
        <Route path="/about" element={<About />} />
        <Route path="/book" element={<div className="max-w-6xl mx-auto"><BookingForm /></div>} />

        <Route
          path="/auth"
          element={
            <PublicAuthRoute session={session}>
              <Auth />
            </PublicAuthRoute>
          }
        />
        
        <Route
          path="/admin"
          element={
            <ProtectedAdminRoute session={session} isAdmin={isAdmin}>
              <div className="max-w-7xl mx-auto px-4 py-8">
                <AdminDashboard />
              </div>
            </ProtectedAdminRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

// ─── Root App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [session, setSession] = useState(undefined);
  const [isAdmin, setIsAdmin] = useState(null);

  const checkAdminStatus = async (user) => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    const { data } = await supabase
      .from('admins')
      .select('user_id')
      .eq('user_id', user.id)
      .single();
    
    setIsAdmin(!!data); 
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) checkAdminStatus(session.user);
      else setIsAdmin(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) checkAdminStatus(session.user);
      else setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (session === undefined || (session && isAdmin === null)) return <PageLoader />;

  return (
    <BrowserRouter>
      <AppInner session={session} isAdmin={isAdmin} />
    </BrowserRouter>
  );
}
