import React from 'react';
import { Users, Lightbulb, MapPin, CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function About() {
  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      {/* Hero Section */}
      <div className="bg-white border-b border-slate-200 pt-16 pb-20 px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6 tracking-tight">
          Место, где рождаются <span className="text-blue-600">инновации</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-slate-500 leading-relaxed">
          Farabi Tech Hub — это современное пространство для IT-специалистов, стартапов и креативных индустрий. Мы предоставляем инфраструктуру для работы, нетворкинга и запуска масштабных проектов.
        </p>
      </div>

      {/* Особенности */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-14 h-14 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Users size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Сильное комьюнити</h3>
            <p className="text-slate-500 text-sm">Общайтесь с единомышленниками, находите партнеров и обменивайтесь опытом с лучшими специалистами.</p>
          </div>
          
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Lightbulb size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Стартап аллея</h3>
            <p className="text-slate-500 text-sm">Отдельная зона для резидентов. Презентуйте свои проекты инвесторам и собирайте обратную связь.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm text-center">
            <div className="w-14 h-14 bg-purple-50 text-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <MapPin size={28} />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-3">Премиум локация</h3>
            <p className="text-slate-500 text-sm">Конференц-зал на 200 человек, передовое оборудование и полный сервис для ваших мероприятий.</p>
          </div>
        </div>

        {/* Призыв к действию */}
        <div className="mt-16 bg-slate-900 rounded-3xl p-8 md:p-12 text-center flex flex-col md:flex-row items-center justify-between gap-8 shadow-xl">
          <div className="text-left">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2">Готовы провести мероприятие?</h2>
            <p className="text-slate-400">Забронируйте площадку прямо сейчас и получите полный спектр услуг.</p>
          </div>
          <Link to="/book" className="shrink-0 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-900/50">
            Перейти к бронированию
          </Link>
        </div>
      </div>
    </div>
  );
}