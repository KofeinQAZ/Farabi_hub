import React, { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import { Save, Plus, Trash2, RotateCw, Move } from 'lucide-react';

export default function MapEditor({ spaceId }) {
  const [elements, setElements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchElements();
  }, [spaceId]);

  const fetchElements = async () => {
    const { data } = await supabase.from('space_items').select('*').eq('space_id', spaceId);
    setElements(data || []);
    setLoading(false);
  };

  // Функция обновления координат в БД после перетаскивания
  const updatePosition = async (id, x, y) => {
    const { error } = await supabase
      .from('space_items')
      .update({ x_pos: Math.round(x), y_pos: Math.round(y) })
      .eq('id', id);
    if (error) console.error(error);
  };

  const handleDragEnd = (e, id) => {
    const rect = e.currentTarget.parentElement.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    // Обновляем локально для скорости
    setElements(elements.map(el => el.id === id ? { ...el, x_pos: x, y_pos: y } : el));
    // Сохраняем в базу
    updatePosition(id, x, y);
  };

  const addElement = async (kind) => {
    const newEl = {
      space_id: spaceId,
      label: kind === 'table' ? 'T-' + (elements.length + 1) : '',
      kind: kind,
      x_pos: 45, y_pos: 45,
      width: kind === 'table' ? 60 : 100,
      height: kind === 'table' ? 60 : 40
    };
    const { data } = await supabase.from('space_items').insert([newEl]).select();
    if (data) setElements([...elements, data[0]]);
  };

  const deleteElement = async (id) => {
    await supabase.from('space_items').delete().eq('id', id);
    setElements(elements.filter(el => el.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Панель инструментов как в Restobooking */}
      <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
        <button onClick={() => addElement('table')} className="flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
          <Plus size={16} /> + Столик
        </button>
        <button onClick={() => addElement('bar')} className="flex items-center gap-2 px-3 py-2 bg-slate-50 text-slate-600 rounded-lg text-sm font-medium hover:bg-slate-100 transition-colors">
          <Move size={16} /> + Бар / Стена
        </button>
      </div>

      {/* Хост (Холст конструктора) */}
      <div className="relative w-full aspect-[16/9] bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden shadow-inner">
        {/* Сетка */}
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: 'linear-gradient(#000 1.5px, transparent 1.5px), linear-gradient(90deg, #000 1.5px, transparent 1.5px)', backgroundSize: '40px 40px' }}></div>

        {elements.map((el) => (
          <div
            key={el.id}
            draggable
            onDragEnd={(e) => handleDragEnd(e, el.id)}
            style={{ 
              left: `${el.x_pos}%`, 
              top: `${el.y_pos}%`, 
              width: `${el.width}px`, 
              height: `${el.height}px`,
              cursor: 'move'
            }}
            className={`absolute flex items-center justify-center border-2 group transition-shadow hover:shadow-xl
              ${el.kind === 'table' ? 'rounded-full bg-white border-blue-500' : 'bg-slate-200 border-slate-400 rounded-md'}
            `}
          >
            <span className="text-[10px] font-bold select-none">{el.label}</span>
            
            {/* Кнопка удаления (появляется при наведении) */}
            <button 
              onClick={() => deleteElement(el.id)}
              className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Trash2 size={10} />
            </button>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 text-center italic">Перетаскивайте элементы мышкой. Позиция сохраняется автоматически.</p>
    </div>
  );
}