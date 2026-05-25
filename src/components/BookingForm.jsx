import React, { useState } from 'react';
import { supabase } from '../supabaseClient';
import { CheckCircle, Calendar, User, List, Check, Send, ChevronRight, ChevronLeft, MapPin } from 'lucide-react';
import FloorMap from './FloorMap';

const initialForm = {
  venue: 'conference',
  itemId: null,
  date: '', timeStart: '', timeEnd: '',
  fullName: '', company: '', phone: '', email: '',
  eventName: '', eventGoal: '', guestCount: '',
  equipment: [], catering: '' 
};

// ВСТАВЬ СВОИ ID СЮДА:
const VENUE_IDS = {
  conference: '812e9710-c6cf-4cbd-8f35-33815afdff24',
  alley: 'e37ab429-c875-4ca1-ac59-8621a6400a0b'
};

export default function BookingForm() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const onChange = (key, value) => setForm(prev => ({ ...prev, [key]: value }));
  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handleBack = () => setStep(s => Math.max(s - 1, 1));

  const handleEquipment = (item) => {
    setForm(prev => ({
      ...prev,
      equipment: prev.equipment.includes(item)
        ? prev.equipment.filter(i => i !== item)
        : [...prev.equipment, item]
    }));
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const payload = {
        space_id: VENUE_IDS[form.venue],
        item_id: form.itemId, 
        event_title: form.eventName,
        attendees_count: Number(form.guestCount) || 1,
        start_time: new Date(`${form.date}T${form.timeStart}:00`).toISOString(),
        end_time: new Date(`${form.date}T${form.timeEnd}:00`).toISOString(),
        status: 'pending',
        event_details: {
          full_name: form.fullName,
          company: form.company,
          phone: form.phone,
          email: form.email,
          event_goal: form.eventGoal,
          equipment: form.equipment,
          catering: form.catering,
        },
      };

      const { error: sbError } = await supabase.from('event_bookings').insert([payload]);
      if (sbError) throw sbError;

      setSubmitted(true);
    } catch (err) {
      console.error(err);
      setError('Не удалось отправить заявку. Проверьте правильность заполнения.');
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center max-w-lg mx-auto mt-10">
        <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={40} className="text-green-500" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Заявка отправлена!</h2>
        <p className="text-slate-500 mb-6">Мы получили вашу заявку. Место забронировано, ожидайте подтверждения администратора.</p>
        <button onClick={() => window.location.reload()} className="text-blue-600 font-medium hover:underline">
          Вернуться на главную
        </button>
      </div>
    );
  }

  // Динамические списки инвентаря в зависимости от локации
  const equipmentOptions = form.venue === 'conference' 
    ? ['Проектор', 'Микрофоны', 'Флипчарт', 'Колонки'] 
    : ['Доп. стул', 'Удлинитель (220V)', 'ТВ-экран на стойке', 'Место для Роллапа'];

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 sm:p-8 max-w-2xl mx-auto mt-6">
      
      {/* Прогресс-бар */}
      <div className="flex items-center justify-between mb-8 relative">
        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-100 -z-10 rounded-full"></div>
        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-blue-600 -z-10 rounded-full transition-all duration-300" style={{ width: `${((step - 1) / 3) * 100}%` }}></div>
        
        {[ { icon: Calendar, label: 'Место' }, { icon: User, label: 'Организатор' }, { icon: List, label: 'Детали' }, { icon: Check, label: 'Итог' } ].map((s, i) => {
          const isActive = step >= i + 1;
          const Icon = s.icon;
          return (
            <div key={i} className="flex flex-col items-center gap-2 bg-white px-2">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-300 ${isActive ? 'bg-blue-600 text-white shadow-md' : 'bg-slate-100 text-slate-400'}`}>
                <Icon size={20} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-blue-600' : 'text-slate-400'} hidden sm:block`}>{s.label}</span>
            </div>
          );
        })}
      </div>

      {/* Шаг 1: Место и Время */}
      {step === 1 && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <h3 className="text-xl font-bold text-slate-900">Выбор площадки</h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button 
              onClick={() => { onChange('venue', 'conference'); onChange('equipment', []); }} 
              className={`p-4 rounded-xl border-2 text-left transition-all ${form.venue === 'conference' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={18} className={form.venue === 'conference' ? 'text-blue-600' : 'text-slate-400'} />
                <span className="font-bold">Конференц-зал</span>
              </div>
              <p className="text-xs text-slate-500">До 200 гостей. Общее бронирование.</p>
            </button>
            
            <button 
              onClick={() => { onChange('venue', 'alley'); onChange('equipment', []); }} 
              className={`p-4 rounded-xl border-2 text-left transition-all ${form.venue === 'alley' ? 'border-blue-600 bg-blue-50' : 'border-slate-100 hover:border-slate-200'}`}
            >
              <div className="flex items-center gap-2 mb-1">
                <MapPin size={18} className={form.venue === 'alley' ? 'text-blue-600' : 'text-slate-400'} />
                <span className="font-bold">Стартап аллея</span>
              </div>
              <p className="text-xs text-slate-500">Выставка проектов. Выбор конкретного стенда.</p>
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Дата</label>
            <input type="date" value={form.date} onChange={e => onChange('date', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" />
          </div>

          {form.venue === 'alley' && form.date && (
            <div className="space-y-2 animate-in fade-in">
              <label className="text-sm font-bold text-slate-700">Выберите место на карте:</label>
              <FloorMap 
                spaceId={VENUE_IDS.alley} 
                bookingDate={form.date}
                selectedItemId={form.itemId}
                onSelect={(id) => onChange('itemId', id)} 
              />
              {!form.itemId && <p className="text-xs text-amber-600 font-medium">Кликните на свободный стол для выбора</p>}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Начало</label>
              <input type="time" value={form.timeStart} onChange={e => onChange('timeStart', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Окончание</label>
              <input type="time" value={form.timeEnd} onChange={e => onChange('timeEnd', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
        </div>
      )}

      {/* Шаг 2: Организатор */}
      {step === 2 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <h3 className="text-xl font-bold text-slate-900 mb-4">Данные резидента</h3>
          <div><label className="block text-sm font-medium mb-1">ФИО</label><input type="text" value={form.fullName} onChange={e => onChange('fullName', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="Иван Иванов" /></div>
          <div><label className="block text-sm font-medium mb-1">Организация / Стартап</label><input type="text" value={form.company} onChange={e => onChange('company', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="ТОО Ромашка" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium mb-1">Телефон</label><input type="tel" value={form.phone} onChange={e => onChange('phone', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="+7 777 000 0000" /></div>
            <div><label className="block text-sm font-medium mb-1">Email</label><input type="email" value={form.email} onChange={e => onChange('email', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="mail@example.com" /></div>
          </div>
        </div>
      )}

      {/* Шаг 3: Детали (УМНЫЙ ШАГ) */}
      {step === 3 && (
        <div className="space-y-5 animate-in fade-in duration-300">
          <h3 className="text-xl font-bold text-slate-900 mb-4">
            {form.venue === 'conference' ? 'Детали мероприятия' : 'Детали стенда'}
          </h3>
          
          <div>
            <label className="block text-sm font-medium mb-1">
              {form.venue === 'conference' ? 'Название мероприятия' : 'Название стартапа / проекта'}
            </label>
            <input type="text" value={form.eventName} onChange={e => onChange('eventName', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder={form.venue === 'conference' ? "Презентация продукта" : "Например: SuperApp"} />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                {form.venue === 'conference' ? 'Количество гостей' : 'Людей за стендом'}
              </label>
              <input type="number" value={form.guestCount} onChange={e => onChange('guestCount', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder={form.venue === 'conference' ? "До 200" : "Например: 2"} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                {form.venue === 'conference' ? 'Формат / Цель' : 'Краткое описание проекта'}
              </label>
              <input type="text" value={form.eventGoal} onChange={e => onChange('eventGoal', e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder={form.venue === 'conference' ? "Лекция, Митап..." : "Чем занимается проект?"} />
            </div>
          </div>

          {/* Инвентарь тоже подстраивается */}
          <div>
            <label className="block text-sm font-medium mb-2">Оборудование (Инвентарь)</label>
            <div className="flex flex-wrap gap-2">
              {equipmentOptions.map(item => (
                <button key={item} onClick={() => handleEquipment(item)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${form.equipment.includes(item) ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Питание (Кейтеринг)</label>
            <div className="flex flex-wrap gap-2">
              {['Фуршет', 'Кофе-брейк', 'Без питания'].map(item => (
                <button key={item} onClick={() => onChange('catering', item)} className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors border ${form.catering === item ? 'bg-blue-600 border-blue-600 text-white shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                  {item}
                </button>
              ))}
            </div>
          </div>

        </div>
      )}

      {/* Шаг 4: Итог (УМНЫЙ ШАГ) */}
      {step === 4 && (
        <div className="space-y-4 animate-in fade-in duration-300">
          <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
            <h3 className="text-xl font-bold text-slate-900 mb-4">Проверьте данные</h3>
            <ul className="space-y-3 text-sm text-slate-700">
              <li className="flex justify-between border-b border-slate-200 pb-2"><span className="font-medium text-slate-500">Локация:</span> <span className="font-bold">{form.venue === 'conference' ? 'Конференц-зал' : 'Стартап аллея (Стенд)'}</span></li>
              <li className="flex justify-between border-b border-slate-200 pb-2"><span className="font-medium text-slate-500">Дата и Время:</span> <span className="font-bold">{form.date} | {form.timeStart} - {form.timeEnd}</span></li>
              <li className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-500">{form.venue === 'conference' ? 'Мероприятие:' : 'Проект:'}</span> 
                <span>{form.eventName || '-'}</span>
              </li>
              <li className="flex justify-between border-b border-slate-200 pb-2">
                <span className="font-medium text-slate-500">{form.venue === 'conference' ? 'Гостей:' : 'Команда:'}</span> 
                <span>{form.guestCount ? `${form.guestCount} чел.` : '-'}</span>
              </li>
              <li className="flex justify-between border-b border-slate-200 pb-2"><span className="font-medium text-slate-500">Оборудование:</span> <span>{form.equipment.length > 0 ? form.equipment.join(', ') : 'Не требуется'}</span></li>
              <li className="flex justify-between pb-2"><span className="font-medium text-slate-500">Питание:</span> <span>{form.catering || 'Не выбрано'}</span></li>
            </ul>
          </div>
          {error && <div className="bg-red-50 text-red-600 p-3 rounded-xl text-sm border border-red-100">{error}</div>}
        </div>
      )}

      {/* Кнопки навигации */}
      <div className="flex justify-between mt-8 pt-6 border-t border-slate-100">
        {step > 1 ? (
          <button onClick={handleBack} className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium text-slate-600 hover:bg-slate-100 transition-colors">
            <ChevronLeft size={18} /> Назад
          </button>
        ) : <div></div>}

        {step < 4 ? (
          <button 
            disabled={step === 1 && (form.venue === 'alley' && !form.itemId || !form.date || !form.timeStart || !form.timeEnd)}
            onClick={handleNext} 
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Далее <ChevronRight size={18} />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={isLoading} className="flex items-center gap-2 px-8 py-2.5 rounded-xl font-bold text-white bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200 transition-all disabled:opacity-70">
            {isLoading ? 'Отправляем...' : 'Подтвердить бронь'} <Send size={18} />
          </button>
        )}
      </div>
    </div>
  );
}