import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { 
  LayoutDashboard, Map as MapIcon, 
  CheckCircle, Clock, XCircle, Check, X, 
  BarChart3, ListOrdered, Calendar, 
  Users, Package, QrCode as QrIcon // Переименовали иконку для ясности
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import MapEditor from './MapEditor'; 
import QRCode from 'react-qr-code';

// Фикс для Vite: проверяем, как импортировалась библиотека
const QRGenerator = typeof QRCode === 'function' ? QRCode : QRCode.default;

export default function AdminDashboard() {
  const [bookings, setBookings] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [activeTab, setActiveTab] = useState('inventory'); 
  const [filter, setFilter] = useState('all');

  const [showAddModal, setShowAddModal] = useState(false);
  const [newItemName, setNewItemName] = useState('');
  const [newItemId, setNewItemId] = useState('');

  const ALLEY_SPACE_ID = 'e37ab429-c875-4ca1-ac59-8621a6400a0b';

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    const { data: bData } = await supabase.from('event_bookings').select('*').order('created_at', { ascending: false });
    setBookings(bData || []);

    const { data: iData } = await supabase.from('inventory').select('*').order('created_at', { ascending: false });
    setInventory(iData || []);
    
    setLoading(false);
  }

  const updateStatus = async (id, newStatus) => {
    await supabase.from('event_bookings').update({ status: newStatus }).eq('id', id);
    fetchData(); 
  };

  const handleAddItem = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    const { error } = await supabase.from('inventory').insert([{
      name: newItemName,
      inventory_number: newItemId || `ITEM-${Math.floor(Math.random() * 10000)}`,
      status: 'available'
    }]);

    if (!error) {
      setShowAddModal(false);
      setNewItemName('');
      setNewItemId('');
      fetchData();
    } else {
      console.error(error);
      alert('Ошибка при добавлении предмета');
      setLoading(false);
    }
  };

  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === 'pending').length,
    approved: bookings.filter(b => b.status === 'approved').length,
    guests: bookings.filter(b => b.status === 'approved').reduce((acc, curr) => acc + (curr.attendees_count || 0), 0)
  };

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
  const siteUrl = window.location.origin;

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 font-sans overflow-hidden relative">
      
      {/* SIDEBAR */}
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
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${activeTab === 'inventory' ? 'bg-blue-50 text-blue-700 font-semibold' : 'hover:bg-slate-50 text-slate-600 hover:text-slate-900'}`}>
            <Package size={18} /> <span>Склад (Инвентарь)</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8">
          
          {activeTab === 'stats' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white border p-5 rounded-2xl shadow-sm">
                   <div className="text-slate-500 text-sm">Всего заявок</div>
                   <div className="text-3xl font-bold">{stats.total}</div>
                </div>
                <div className="bg-white border p-5 rounded-2xl shadow-sm">
                   <div className="text-slate-500 text-sm">Ожидают</div>
                   <div className="text-3xl font-bold">{stats.pending}</div>
                </div>
                <div className="bg-white border p-5 rounded-2xl shadow-sm">
                   <div className="text-slate-500 text-sm">Одобрено</div>
                   <div className="text-3xl font-bold">{stats.approved}</div>
                </div>
                <div className="bg-white border p-5 rounded-2xl shadow-sm">
                   <div className="text-slate-500 text-sm">Гостей</div>
                   <div className="text-3xl font-bold">{stats.guests}</div>
                </div>
              </div>
              
              <div className="bg-white border p-6 rounded-2xl shadow-sm h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="заявки" stroke="#3b82f6" strokeWidth={3} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </>
          )}

          {activeTab === 'inventory' && (
            <div className="animate-in fade-in">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold">Склад и Инвентарь</h2>
                <button onClick={() => setShowAddModal(true)} className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-colors">
                  + Добавить предмет
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {inventory.map(item => (
                  <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col items-center">
                    <div className="mb-4">
                      {/* Использование исправленного компонента */}
                      <QRGenerator 
                        value={`${siteUrl}/rent/${item.id}`} 
                        size={130} 
                      />
                    </div>
                    <h3 className="font-bold text-lg">{item.name}</h3>
                    <p className="text-xs font-mono text-slate-400 mb-4">{item.inventory_number}</p>
                    <div className="w-full pt-4 border-t flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${item.status === 'available' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                        {item.status === 'available' ? 'На складе' : 'В аренде'}
                      </span>
                      <button onClick={() => window.print()} className="text-blue-600 hover:bg-blue-50 p-2 rounded-lg transition-colors">
                        <QrIcon size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Другие вкладки (упрощено для стабильности) */}
          {activeTab === 'list' && (
            <div className="space-y-4">
              <h2 className="text-2xl font-bold">Список заявок</h2>
              {bookings.filter(b => filter === 'all' || b.status === filter).map(b => (
                <div key={b.id} className="bg-white p-4 border rounded-xl flex justify-between items-center">
                  <div>
                    <div className="font-bold">{b.event_title || 'Заявка'}</div>
                    <div className="text-sm text-slate-500">{b.event_details?.full_name}</div>
                  </div>
                  <div className="flex gap-2">
                    {b.status === 'pending' && (
                      <>
                        <button onClick={() => updateStatus(b.id, 'approved')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg"><Check size={20}/></button>
                        <button onClick={() => updateStatus(b.id, 'rejected')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><X size={20}/></button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {activeTab === 'map' && <MapEditor spaceId={ALLEY_SPACE_ID} />}
        </div>
      </div>

      {/* МОДАЛКА */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-md animate-in zoom-in-95">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Новое оборудование</h3>
              <button onClick={() => setShowAddModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleAddItem} className="space-y-4">
              <input 
                type="text" 
                required 
                placeholder="Название (Sony A7, DJI Mic...)" 
                value={newItemName} 
                onChange={e => setNewItemName(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input 
                type="text" 
                placeholder="Инв. номер (CAM-01)" 
                value={newItemId} 
                onChange={e => setNewItemId(e.target.value)}
                className="w-full p-3 bg-slate-50 border rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button type="submit" className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-colors">
                Создать QR-код
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}