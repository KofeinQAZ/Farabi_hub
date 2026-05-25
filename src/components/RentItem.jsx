import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { ArrowLeft, CheckCircle2, Clock, Send, Camera } from 'lucide-react';

export default function RentItem() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);

  const [form, setForm] = useState({
    name: '',
    email: '',
    duration: '2' // часы по умолчанию
  });

  useEffect(() => {
    fetchItem();
  }, [id]);

  async function fetchItem() {
    const { data } = await supabase.from('inventory').select('*').eq('id', id).single();
    if (!data) return navigate('/inventory');
    setItem(data);
    setLoading(false);
  }

  const handleRent = async (e) => {
    e.preventDefault();
    setLoading(true);

    const startTime = new Date();
    const endTime = new Date();
    endTime.setHours(startTime.getHours() + parseInt(form.duration));

    // 1. Создаем запись о бронировании инвентаря
    const { error: rentError } = await supabase.from('inventory_bookings').insert([{
      item_id: id,
      renter_name: form.name,
      renter_email: form.email,
      start_time: startTime.toISOString(),
      end_time: endTime.toISOString(),
      status: 'active'
    }]);

    // 2. Обновляем статус самого предмета
    const { error: updateError } = await supabase.from('inventory')
      .update({ status: 'rented' })
      .eq('id', id);

    if (!rentError && !updateError) {
      setSubmitted(true);
    } else {
      alert('Ошибка при оформлении аренды');
    }
    setLoading(false);
  };

  if (loading && !submitted) return <div className="p-20 text-center">Проверка оборудования...</div>;

  if (submitted) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
        <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mb-6 animate-bounce">
          <CheckCircle2 size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Техника у вас!</h2>
        <p className="text-slate-500 mb-8">Вы успешно арендовали <b>{item.name}</b>. <br/> Пожалуйста, верните оборудование до положенного времени.</p>
        <button onClick={() => navigate('/inventory')} className="px-8 py-3 bg-slate-900 text-white font-bold rounded-xl">Понятно</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-10">
      <button onClick={() => navigate('/inventory')} className="flex items-center gap-2 text-slate-500 hover:text-slate-900 mb-8 transition-colors">
        <ArrowLeft size={20} /> Назад к списку
      </button>

      <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="bg-slate-900 p-8 text-white text-center">
          <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Camera size={30} />
          </div>
          <h1 className="text-xl font-bold">{item.name}</h1>
          <p className="text-slate-400 text-sm mt-1">Инвентарный номер: {item.inventory_number}</p>
        </div>

        <form onSubmit={handleRent} className="p-8 space-y-5">
          {item.status !== 'available' ? (
            <div className="bg-amber-50 text-amber-700 p-4 rounded-2xl text-center font-medium border border-amber-100">
              Этот предмет сейчас занят другим резидентом
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Ваше ФИО</label>
                <input 
                  type="text" required 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Иван Иванов"
                  value={form.name}
                  onChange={e => setForm({...form, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Email</label>
                <input 
                  type="email" required 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="name@company.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 mb-1.5">Время аренды (часов)</label>
                <select 
                  className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none"
                  value={form.duration}
                  onChange={e => setForm({...form, duration: e.target.value})}
                >
                  <option value="1">1 час</option>
                  <option value="2">2 часа</option>
                  <option value="4">4 часа</option>
                  <option value="8">Весь день</option>
                </select>
              </div>

              <button 
                type="submit" 
                className="w-full py-4 bg-blue-600 text-white font-bold rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 flex items-center justify-center gap-2"
              >
                Подтвердить выдачу <Send size={18} />
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}