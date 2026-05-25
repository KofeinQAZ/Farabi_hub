import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Package, Search, Camera, Mic, Laptop, MousePointer2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const getIcon = (cat) => {
  if (cat?.includes('cam')) return <Camera size={20} />;
  if (cat?.includes('mic') || cat?.includes('audio')) return <Mic size={20} />;
  if (cat?.includes('laptop')) return <Laptop size={20} />;
  return <Package size={20} />;
};

export default function PublicInventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchInventory();
  }, []);

  async function fetchInventory() {
    const { data } = await supabase.from('inventory').select('*').order('name');
    setItems(data || []);
    setLoading(false);
  }

  const filteredItems = items.filter(i => 
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 pb-20">
      <div className="bg-white border-b border-slate-200 py-12 px-4 mb-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-slate-900 mb-4">Инвентарь хаба</h1>
          <p className="text-slate-500 mb-8">Техника и оборудование доступное для резидентов Farabi Tech Hub.</p>
          
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Поиск техники..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4">
        {loading ? (
          <div className="text-center py-20 text-slate-400">Загрузка склада...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${item.status === 'available' ? 'bg-blue-50 text-blue-600' : 'bg-slate-50 text-slate-400'}`}>
                    {getIcon(item.name.toLowerCase())}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                    item.status === 'available' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-amber-50 text-amber-600 border-amber-100'
                  }`}>
                    {item.status === 'available' ? 'Свободно' : 'В аренде'}
                  </span>
                </div>
                
                <h3 className="text-lg font-bold text-slate-900 mb-1">{item.name}</h3>
                <p className="text-xs text-slate-400 font-mono mb-6">№ {item.inventory_number}</p>
                
                {item.status === 'available' ? (
                  <Link 
                    to={`/rent/${item.id}`}
                    className="mt-auto w-full py-3 bg-slate-900 text-white text-center font-bold rounded-xl hover:bg-slate-800 transition-all flex items-center justify-center gap-2"
                  >
                    Взять в аренду <MousePointer2 size={16} />
                  </Link>
                ) : (
                  <button disabled className="mt-auto w-full py-3 bg-slate-100 text-slate-400 font-bold rounded-xl cursor-not-allowed">
                    Сейчас недоступно
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}