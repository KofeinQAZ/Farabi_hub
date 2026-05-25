import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, Map as MapIcon, 
  CheckCircle, Clock, XCircle, Check, X, 
  BarChart3, ListOrdered, Calendar as CalendarIcon, 
  TrendingUp, Users
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MapEditor from './MapEditor'; 

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('stats');
  const [filter, setFilter] = useState('all');

  // ВСТАВЬ СВОЙ ID СТАРТАП АЛЛЕИ СЮДА:
  const ALLEY_SPACE_ID = 'e37ab429-c875-4ca1-ac59-8621a6400a0b';

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    const { data } = await supabase
      .from('event_bookings')
      .select('*')
      .order('created_at', { ascending: false });
    setBookings(data || []);
    setLoading(false);
  }

  const updateStatus = async (id, newStatus) => {
    await supabase.from('event_bookings').update({ status: newStatus }).eq('id', id);
    fetchBookings(); 
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    rejected: bookings.filter(b => b.status === 'rejected').length,
    guests: bookings.filter(b => b.status === 'approved').reduce((acc, curr) => acc + (curr.attendees_count || 0), 0)
  };

  // Фейковые данные для графика (для наглядности)
  const chartData = [
    { name: 'Пнд', заявки: 4, подтверждено: 2 },
    { name: 'Втр', заявки: 7, подтверждено: 5 },
    { name: 'Срд', заявки: 5, подтверждено: 3 },
    { name: 'Чтв', заявки: 12, подтверждено: 9 },
    { name: 'Птн', заявки: 8, подтверждено: 6 },
    { name: 'Суб', заявки: 3, подтверждено: 2 },
    { name: 'Вск', заявки: 5, подтверждено: 4 },
  ];

  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden">
      
      {/* ЛЕВОЕ МЕНЮ (SIDEBAR) */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col hidden md:flex">
        <div className="p-6 border-b border-slate-100">
          <h1 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <LayoutDashboard size={18} className="text-white" />
            </div>
            Админ-панель
          </h1>
        </div>
        
        <div className="flex-1 py-6 px-4 space-y-2">
          <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'stats' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}>
            <BarChart3 size={18} /> <span>Статистика</span>
          </button>
          <button onClick={() => setActiveTab('list')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'list' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}>
            <ListOrdered size={18} /> <span>Все бронирования</span>
            {stats.pending > 0 && <span className="ml-auto bg-amber-100 text-amber-700 text-xs font-bold px-2 py-0.5 rounded-full">{stats.pending}</span>}
          </button>
          <button onClick={() => setActiveTab('map')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'map' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}>
            <MapIcon size={18} /> <span>Конструктор зала</span>
          </button>
        </div>
      </div>

      {/* ОСНОВНОЙ КОНТЕНТ */}
      <div className="flex-1 overflow-y-auto">
        
        {/* Мобильная шапка */}
        <div className="md:hidden bg-white p-4 border-b border-slate-200 flex justify-between items-center overflow-x-auto gap-2">
           <button onClick={() => setActiveTab('stats')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'stats' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Статистика</button>
           <button onClick={() => setActiveTab('list')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'list' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Заявки</button>
           <button onClick={() => setActiveTab('map')} className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === 'map' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'}`}>Карта</button>
        </div>

        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-300">
          
          {/* ВКЛАДКА 1: СТАТИСТИКА */}
          {activeTab === 'stats' && (
            <>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Панель статистики</h2>
                <p className="text-slate-500 text-sm">Обзор метрик и загруженности площадки</p>
              </div>

              {/* Карточки KPI */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-slate-500 text-sm font-medium">Всего заявок</div>
                    <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><ListOrdered size={18} /></div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stats.total}</div>
                  <div className="text-xs text-slate-400">За все время</div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-slate-500 text-sm font-medium">Ожидают ответа</div>
                    <div className="p-2 bg-amber-50 text-amber-600 rounded-lg"><Clock size={18} /></div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stats.pending}</div>
                  <div className="text-xs text-amber-600/70 font-medium">Требуют внимания</div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-slate-500 text-sm font-medium">Подтверждено</div>
                    <div className="p-2 bg-green-50 text-green-600 rounded-lg"><CheckCircle size={18} /></div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stats.approved}</div>
                  <div className="text-xs text-green-600/70 font-medium">Одобренные мероприятия</div>
                </div>

                <div className="bg-white border border-slate-200 p-5 rounded-2xl flex flex-col shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                    <div className="text-slate-500 text-sm font-medium">Ожидаемый трафик</div>
                    <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Users size={18} /></div>
                  </div>
                  <div className="text-3xl font-bold text-slate-900 mb-1">{stats.guests}</div>
                  <div className="text-xs text-slate-400">Гостей (по одобренным)</div>
                </div>
              </div>

              {/* График трендов */}
              <div className="bg-white border border-slate-200 p-6 rounded-2xl shadow-sm">
                <h3 className="text-lg font-bold text-slate-900 mb-6">Тренды активности (Заявки)</h3>
                <div className="h-72 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                      <YAxis stroke="#64748b" tick={{fill: '#64748b', fontSize: 12}} axisLine={false} tickLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', color: '#0f172a', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                      <Line type="monotone" dataKey="заявки" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                      <Line type="monotone" dataKey="подтверждено" stroke="#10b981" strokeWidth={3} dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </>
          )}

          {/* ВКЛАДКА 2: СПИСОК ЗАЯВОК */}
          {activeTab === 'list' && (
            <>
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-slate-900 mb-1">Управление бронированиями</h2>
                  <p className="text-slate-500 text-sm">Модерация входящих запросов</p>
                </div>
                
                {/* Фильтры */}
                <div className="flex bg-slate-100 border border-slate-200 rounded-xl p-1">
                  {[ { id: 'all', label: 'Все' }, { id: 'pending', label: 'Ожидают' }, { id: 'approved', label: 'Одобрены' }, { id: 'rejected', label: 'Отклонены' } ].map(f => (
                    <button 
                      key={f.id} 
                      onClick={() => setFilter(f.id)} 
                      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${filter === f.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Карточки заявок */}
              <div className="space-y-3">
                {loading ? (
                  <div className="p-12 text-center text-slate-400 bg-white rounded-2xl border border-slate-200">Загрузка данных...</div>
                ) : filteredBookings.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200">Нет элементов для модерации</div>
                ) : (
                  filteredBookings.map(booking => (
                    <div key={booking.id} className="bg-white border border-slate-200 p-5 rounded-2xl hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row justify-between gap-4">
                        
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-lg font-bold text-slate-900">{booking.event_title || 'Без названия'}</h3>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                              booking.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                              booking.status === 'approved' ? 'bg-green-50 text-green-600 border-green-200' : 
                              'bg-red-50 text-red-600 border-red-200'}`}>
                              {booking.status === 'pending' ? 'Ожидает' : booking.status === 'approved' ? 'Одобрено' : 'Отклонено'}
                            </span>
                          </div>
                          
                          <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600 mb-4">
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100"><CalendarIcon size={14} className="text-blue-500"/> {new Date(booking.start_time).toLocaleString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100"><Users size={14} className="text-blue-500"/> {booking.attendees_count} чел.</span>
                            <span className="flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100"><MapIcon size={14} className="text-blue-500"/> {booking.space_id === ALLEY_SPACE_ID ? 'Стартап аллея' : 'Конференц-зал'}</span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm bg-slate-50 p-3 rounded-xl border border-slate-100">
                            <div>
                              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1 font-bold">Резидент</span>
                              <span className="text-slate-800 font-medium">{booking.event_details?.full_name || '-'} ({booking.event_details?.company || '-'})</span>
                              <span className="text-slate-600 block mt-0.5">{booking.event_details?.phone || '-'}</span>
                            </div>
                            <div>
                              <span className="text-slate-400 text-xs uppercase tracking-wider block mb-1 font-bold">Запрос</span>
                              <span className="text-slate-700 block truncate">Инвентарь: {booking.event_details?.equipment?.length > 0 ? booking.event_details.equipment.join(', ') : 'Нет'}</span>
                              <span className="text-slate-700 block mt-0.5">Кейтеринг: {booking.event_details?.catering || 'Нет'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Кнопки модерации */}
                        {booking.status === 'pending' && (
                          <div className="flex flex-row lg:flex-col gap-2 min-w-[140px] pt-1">
                            <button onClick={() => updateStatus(booking.id, 'approved')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 rounded-xl text-sm font-medium transition-all">
                              <Check size={16} /> Одобрить
                            </button>
                            <button onClick={() => updateStatus(booking.id, 'rejected')} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 border border-red-200 rounded-xl text-sm font-medium transition-all">
                              <X size={16} /> Отклонить
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </>
          )}

          {/* ВКЛАДКА 3: КАРТА */}
          {activeTab === 'map' && (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-slate-900 mb-1">Редактор зала</h2>
                <p className="text-slate-500 text-sm">Настройка рассадки и объектов для бронирования</p>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                 <MapEditor spaceId={ALLEY_SPACE_ID} /> 
              </div>
            </>
          )}

        </div>
      </div>
    </div>
  );
}