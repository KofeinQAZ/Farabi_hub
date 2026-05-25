import { Link } from 'react-router-dom';
import { ArrowRight, Building2, Users, Zap, ShieldCheck } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center animate-in fade-in duration-500 pb-12">
      
      {/* Главный экран (Hero Section) */}
      <div className="w-full max-w-5xl px-4 pt-16 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-sm font-medium mb-8">
          <Zap size={16} className="fill-blue-600" />
          <span>Лучшее пространство в Алматы</span>
        </div>
        
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
          Инновационный хаб для <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
            вашего бизнеса
          </span>
        </h1>
        
        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
          Проводите форумы, митапы и презентации на высшем уровне. 
          Премиальный Конференц-зал с новейшим оборудованием и полным спектром услуг.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link 
            to="/book" 
            className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            Забронировать зал <ArrowRight size={20} />
          </Link>
        </div>
      </div>

      {/* Карточки преимуществ */}
      <div className="w-full max-w-5xl px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
            <Users size={24} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Вместимость до 200 чел.</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Просторный зал площадью 450 м² с удобной рассадкой и зоной для нетворкинга.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
            <Building2 size={24} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Передовое оснащение</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Огромный LED-экран, профессиональный звук, микрофоны и стабильный гигабитный Wi-Fi.
          </p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center mb-4">
            <ShieldCheck size={24} className="text-blue-600" />
          </div>
          <h3 className="text-lg font-bold text-slate-900 mb-2">Премиум сервис</h3>
          <p className="text-slate-500 text-sm leading-relaxed">
            Организация кофе-брейков, фуршетов и техническое сопровождение вашего ивента под ключ.
          </p>
        </div>
      </div>
      
    </div>
  );
}