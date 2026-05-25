import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, Map as MapIcon, RefreshCw, 
  CheckCircle, Clock, XCircle, Check, X
} from 'lucide-react';
import MapEditor from './MapEditor'; 

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditingMap, setIsEditingMap] = useState(false);
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
    fetchBookings(); // обновляем список после изменения статуса
  };

  // Считаем статистику
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
  };

  // Фильтруем заявки
  const filteredBookings = bookings.filter(b => filter === 'all' || b.status === filter);

  return (
    <div className="space-y-6">
      {/* Шапка админки */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            {isEditingMap ? <MapIcon className="text-blue-600" /> : <LayoutDashboard className="text-blue-600" />}
            {isEditingMap ? 'Конструктор площадки' : 'Панель управления'}
          </h2>
          <p className="text-sm text-slate-500">
            {isEditingMap ? 'Настройте расположение столов и объектов' : 'Управление входящими заявками на бронирование'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {!isEditingMap && (
            <button onClick={fetchBookings} className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
            </button>
          )}
          <button
            onClick={() => setIsEditingMap(!isEditingMap)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm ${
              isEditingMap ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
          >
            {isEditingMap ? <><LayoutDashboard size={18} /> К заявкам</> : <><MapIcon size={18} /> Конструктор зала</>}
          </button>
        </div>
      </div>

      {/* Основной контент */}
      {isEditingMap ? (
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
           <MapEditor spaceId={ALLEY_SPACE_ID} /> 
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in">
          
          {/* Блок статистики */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600"><LayoutDashboard size={24} /></div>
              <div><div className="text-2xl font-bold text-slate-900">{stats.total}</div><div className="text-sm text-slate-500">Всего заявок</div></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500"><Clock size={24} /></div>
              <div><div className="text-2xl font-bold text-slate-900">{stats.pending}</div><div className="text-sm text-slate-500">Ожидают ответа</div></div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-12 h-12 bg-green-50 rounded-xl flex items-center justify-center text-green-500"><CheckCircle size={24} /></div>
              <div><div className="text-2xl font-bold text-slate-900">{stats.approved}</div><div className="text-sm text-slate-500">Подтверждены</div></div>
            </div>
          </div>

          {/* Фильтры */}
          <div className="flex gap-2 bg-white p-2 rounded-xl border border-slate-100 shadow-sm inline-flex">
            {[ { id: 'all', label: 'Все' }, { id: 'pending', label: 'Ожидают' }, { id: 'approved', label: 'Подтверждены' }, { id: 'rejected', label: 'Отклонены' } ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)} className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${filter === f.id ? 'bg-slate-100 text-slate-900 shadow-sm' : 'text-slate-500 hover:bg-slate-50'}`}>
                {f.label}
              </button>
            ))}
          </div>

          {/* Список заявок */}
          <div className="space-y-4">
            {loading ? (
              <div className="p-10 text-center text-slate-400 bg-white rounded-2xl border border-slate-100">Загрузка данных...</div>
            ) : filteredBookings.length === 0 ? (
              <div className="p-10 text-center text-slate-500 bg-white rounded-2xl border border-slate-100">Заявок в этой категории нет</div>
            ) : (
              filteredBookings.map(booking => (
                <div key={booking.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row justify-between gap-4 mb-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="text-lg font-bold text-slate-900">{booking.event_title || 'Без названия'}</h3>
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${booking.status === 'pending' ? 'bg-amber-100 text-amber-700' : booking.status === 'approved' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {booking.status === 'pending' ? 'Ожидает' : booking.status === 'approved' ? 'Подтверждена' : 'Отклонена'}
                        </span>
                      </div>
                      <div className="text-sm text-slate-500 flex flex-wrap items-center gap-x-4 gap-y-1 mt-2">
                        <span className="font-medium text-slate-700">🏢 {booking.event_details?.company || 'Частное лицо'}</span>
                        <span>📅 {new Date(booking.start_time).toLocaleString('ru-RU', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' })}</span>
                        <span>👥 {booking.attendees_count} чел.</span>
                      </div>
                    </div>
                    {/* Кнопки подтверждения/отклонения */}
                    {booking.status === 'pending' && (
                      <div className="flex items-center gap-2">
                        <button onClick={() => updateStatus(booking.id, 'approved')} className="flex items-center gap-1.5 px-4 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl text-sm font-medium transition-colors border border-green-100">
                          <Check size={16} /> Подтвердить
                        </button>
                        <button onClick={() => updateStatus(booking.id, 'rejected')} className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 rounded-xl text-sm font-medium transition-colors border border-slate-100 hover:border-red-100">
                          <X size={16} /> Отклонить
                        </button>
                      </div>
                    )}
                  </div>
                  
                  {/* Детали заявки */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Контакты</p>
                      <p className="font-medium text-slate-800">{booking.event_details?.full_name || '-'}</p>
                      <p className="text-slate-600 mt-0.5">{booking.event_details?.phone || '-'}</p>
                      <p className="text-slate-600">{booking.event_details?.email || '-'}</p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Оборудование</p>
                      <p className="text-slate-700">
                        {booking.event_details?.equipment?.length > 0 ? booking.event_details.equipment.join(', ') : 'Не требуется'}
                      </p>
                    </div>
                    <div>
                      <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mb-1.5">Доп. информация</p>
                      <p className="text-slate-700">Питание: {booking.event_details?.catering || 'Не выбрано'}</p>
                      <p className="text-slate-700 mt-0.5">Площадка: {booking.space_id === ALLEY_SPACE_ID ? 'Стартап аллея (Стол)' : 'Конференц-зал'}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}