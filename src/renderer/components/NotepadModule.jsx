import React, { useState, useRef } from 'react';
import { Rnd } from 'react-rnd';
import { Pin, PinOff, ChevronDown, ChevronUp, X, StickyNote, Save, FolderOpen, Trash2 } from 'lucide-react';
export default function NotepadModule({ onClose, text, setText, isPinned, setIsPinned, isMinimized, setIsMinimized, snapToGrid, layout, setLayout }) {

  const fileInputRef = useRef(null);

  const handleSave = () => {
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `note_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLoad = (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => setText(e.target.result);
    reader.readAsText(file);
  };

  return (
    <Rnd
      className={isMinimized ? "module-card minimized" : "module-card"}
      
      /* 1. Берем координаты из памяти. Если их там еще нет - ставим дефолтные */
      default={{ 
        x: layout?.x || 200, 
        y: layout?.y || 200, 
        width: layout?.width || 350, 
        height: layout?.height || 350 
      }}
      minWidth={250}
      minHeight={150}
      bounds="parent"
      dragHandleClassName="tracker-header"
      disableDragging={isPinned}
      dragGrid={snapToGrid ? [50, 50] : [1, 1]}
      
      /* 2. Запоминаем позицию после перетаскивания */
      onDragStop={(e, d) => {
        if (setLayout) {
          setLayout({ ...(layout || {}), x: d.x, y: d.y });
        }
      }}
      
      /* 3. Запоминаем размер и позицию после растягивания окна */
      onResizeStop={(e, direction, ref, delta, position) => {
        if (setLayout) {
          setLayout({
            width: ref.style.width,
            height: ref.style.height,
            x: position.x,
            y: position.y
          });
        }
      }}
    >
        <div className="tracker-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <StickyNote size={20} /> Заметки
            </h3>
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                <button onClick={() => setIsPinned(!isPinned)}>
                    {isPinned ? <Pin size={18} /> : <PinOff size={18} />}
                </button>
                <button onClick={() => setIsMinimized(!isMinimized)}>
                    {isMinimized ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
                </button>
                <button className="delete-btn" onClick={onClose} style={{ padding: '0 4px' }}>
                    <X size={18} />
                </button>
            </div>
        </div>

      <div className={`tracker-body ${isMinimized ? 'collapsed' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 40px)' }}>
        <div className="tracker-body-inner" style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, height: '100%' }}>
          
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Наброски квестов, имена NPC..."
            style={{
              flex: 1,
              backgroundColor: 'var(--bg-input)',
              color: 'var(--text-primary)',
              border: '1px solid var(--border-color)',
              borderRadius: '6px',
              padding: '12px',
              fontFamily: 'inherit',
              fontSize: '14px',
              resize: 'none',
              outline: 'none',
              width: '100%',
              boxSizing: 'border-box'
            }}
          />

          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="sort-btn" onClick={handleSave} style={{ flex: 1, margin: 0, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Save size={16} /> .txt
            </button>
            <input type="file" ref={fileInputRef} onChange={handleLoad} style={{ display: 'none' }} accept=".txt" />
            <button className="sort-btn" onClick={() => fileInputRef.current.click()} style={{ flex: 1, margin: 0, padding: '8px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <FolderOpen size={16} /> Загрузить
            </button>
            <button className="sort-btn" onClick={() => setText('')} style={{ flex: 1, margin: 0, padding: '8px 0', backgroundColor: 'var(--bg-hover)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Trash2 size={16} /> Очистить
            </button>
          </div>
        </div>
      </div>
    </Rnd>
  );
}