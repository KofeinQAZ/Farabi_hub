import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Loader2, Armchair } from 'lucide-react';

export default function FloorMap({ spaceId, selectedItemId, onSelect, bookingDate }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [occupiedIds, setOccupiedIds] = useState([]);

  useEffect(() => {
    // Функция загрузки данных
    const loadMapData = async () => {
      if (!spaceId) return;
      setLoading(true);
      
      console.log("Загрузка карты для ID:", spaceId); // Отладка в консоль

      // 1. Грузим элементы зала
      const { data: mapItems, error } = await supabase
        .from('space_items')
        .select('*')
        .eq('space_id', spaceId);
      
      if (error) console.error("Ошибка загрузки столов:", error);
      setItems(mapItems || []);

      // 2. Грузим брони, чтобы пометить занятые (красные) столы
      if (bookingDate) {
        const { data: bookings } = await supabase
          .from('event_bookings')
          .select('item_id')
          .eq('status', 'approved')
          .filter('start_time', 'gte', `${bookingDate}T00:00:00`)
          .filter('start_time', 'lte', `${bookingDate}T23:59:59`);
        
        setOccupiedIds(bookings?.map(b => b.item_id).filter(id => id !== null) || []);
      }
      
      setLoading(false);
    };

    loadMapData();
  }, [spaceId, bookingDate]); // Перезагружать, если изменился зал или дата

  if (loading) return (
    <div className="h-64 flex flex-col items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
      <Loader2 className="animate-spin text-blue-500 mb-2" />
      <p className="text-xs text-slate-400">Загрузка схемы зала...</p>
    </div>
  );

  if (items.length === 0) return (
    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 text-slate-400 text-sm">
      Схема зала еще не настроена в админке
    </div>
  );

  return (
    <div className="relative w-full aspect-[16/9] bg-white rounded-2xl border-2 border-slate-200 shadow-inner overflow-hidden mt-4">
      {/* Сетка */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
      
      {items.map(item => {
        const isOccupied = occupiedIds.includes(item.id);
        const isSelected = selectedItemId === item.id;

        return (
          <button
            key={item.id}
            type="button"
            disabled={isOccupied}
            onClick={() => onSelect(item.id)}
            style={{ 
              left: `${item.x_pos}%`, 
              top: `${item.y_pos}%`,
              width: `${item.width}px`,
              height: `${item.height}px`,
              position: 'absolute',
              transform: 'translate(-50%, -50%)' // Чтобы точка (x,y) была центром стола
            }}
            className={`flex flex-col items-center justify-center transition-all duration-200 group
              ${isOccupied ? 'opacity-50 cursor-not-allowed' : 'hover:scale-110 active:scale-95'}
            `}
          >
            <div className={`w-full h-full rounded-lg border-2 flex items-center justify-center shadow-sm
              ${isOccupied ? 'bg-red-50 border-red-200 text-red-300' : 
                isSelected ? 'bg-blue-600 border-blue-700 text-white shadow-blue-200 scale-105' : 
                'bg-white border-slate-200 text-slate-600 group-hover:border-blue-400'}
            `}>
              <Armchair size={item.width > 40 ? 18 : 12} />
            </div>
            <span className={`text-[9px] font-bold mt-1 px-1 rounded bg-white/80 ${isSelected ? 'text-blue-600' : 'text-slate-500'}`}>
              {item.label}
            </span>
          </button>
        );
      })}

      {/* Легенда */}
      <div className="absolute bottom-3 right-3 flex gap-3 bg-white/90 backdrop-blur-sm p-2 rounded-lg border border-slate-100 shadow-sm text-[10px] font-semibold text-slate-600">
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-white border border-slate-300 rounded"></div> Свободно</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-red-400 rounded"></div> Занято</div>
        <div className="flex items-center gap-1"><div className="w-2 h-2 bg-blue-600 rounded"></div> Ваш выбор</div>
      </div>
    </div>
  );
}