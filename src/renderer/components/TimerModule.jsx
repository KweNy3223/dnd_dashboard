import React, { useState, useEffect } from 'react';
import { Rnd } from 'react-rnd';
import { Hourglass, Pin, PinOff, ChevronDown, ChevronUp, X, Play, Square, RotateCcw } from 'lucide-react';
import { useTranslation } from '../i18n/LanguageContext.jsx';

export default function TimerModule({
  onClose,
  isPinned,
  setIsPinned,
  isMinimized,
  setIsMinimized,
  snapToGrid,
  layout,
  setLayout
}) {
  const { t } = useTranslation();
  // --- ПАМЯТЬ ТАЙМЕРА ---
  const [timeLeft, setTimeLeft] = useState(300); // 300 секунд = 5 минут
  const [isRunning, setIsRunning] = useState(false);

  // --- ГЕНЕРАТОР ЗВУКА (Web Audio API) ---
  const playAlarm = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playBeep = (startTime) => {
        const oscillator = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        oscillator.type = 'triangle'; // Тип звуковой волны (похоже на электронику)
        oscillator.frequency.setValueAtTime(600, startTime); // Высота звука
        
        // Громкость (плавно затухает)
        gainNode.gain.setValueAtTime(0.5, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.4);
        
        oscillator.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        oscillator.start(startTime);
        oscillator.stop(startTime + 0.4);
      };

      // Играем 3 коротких гудка с интервалом в полсекунды
      playBeep(audioCtx.currentTime);
      playBeep(audioCtx.currentTime + 0.5);
      playBeep(audioCtx.currentTime + 1.0);
    } catch (e) {
      console.log("Звук не поддерживается в этом окружении");
    }
  };

  // --- ЛОГИКА ОТСЧЕТА (ТИК-ТАК) ---
  useEffect(() => {
    let interval = null;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (isRunning && timeLeft === 0) {
      // Когда время вышло — останавливаем таймер и играем звук
      setIsRunning(false);
      playAlarm(); 
    }
    
    // Очистка интервала
    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);
  
  // --- ФУНКЦИИ УПРАВЛЕНИЯ ---
  const toggleTimer = () => setIsRunning(!isRunning);
  const resetTimer = () => {
    setIsRunning(false);
    setTimeLeft(300);
  };
  const addTime = (seconds) => {
    setTimeLeft((prev) => Math.max(0, prev + seconds)); // Чтобы не ушло в минус
  };

  // --- ОФОРМЛЕНИЕ ВРЕМЕНИ (ММ:СС) ---
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <Rnd
      className={isMinimized ? "module-card minimized" : "module-card"}
      default={{ 
        x: layout?.x || 150, 
        y: layout?.y || 150, 
        width: layout?.width || 300, 
        height: layout?.height || 260 
      }}
      minWidth={280}
      minHeight={220}
      bounds="parent"
      dragHandleClassName="tracker-header"
      disableDragging={isPinned}
      dragGrid={snapToGrid ? [50, 50] : [1, 1]}
      onDragStop={(e, d) => {
        if (setLayout) setLayout({ ...(layout || {}), x: d.x, y: d.y });
      }}
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
      {/* 1. ШАПКА */}
      <div className="tracker-header">
        <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
          <Hourglass size={20} /> {t('modules.timer.title')}
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

      {/* 2. ТЕЛО */}
      <div className={`tracker-body ${isMinimized ? 'collapsed' : ''}`} style={{ display: 'flex', flexDirection: 'column', height: 'calc(100% - 40px)', justifyContent: 'center' }}>
        
        {/* Крупный циферблат */}
        <div style={{ 
          textAlign: 'center', 
          fontSize: '56px', 
          fontWeight: 'bold', 
          color: timeLeft === 0 ? 'var(--accent-red)' : 'var(--text-title)', 
          fontFamily: 'monospace', 
          margin: '0 0 15px 0',
          letterSpacing: '2px'
        }}>
          {formattedTime}
        </div>

        {/* Кнопки Плей/Пауза и Сброс */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '15px' }}>
          <button 
            onClick={toggleTimer} 
            className="sort-btn" 
            style={{ 
              flex: 1, margin: 0, display: 'flex', justifyContent: 'center', gap: '6px', 
              backgroundColor: isRunning ? 'var(--bg-hover)' : 'var(--accent-primary)',
              color: 'white'
            }}
          >
            {isRunning ? <><Square size={16}/> {t('common.pause')}</> : <><Play size={16}/> {t('common.start')}</>}
          </button>
          
          <button onClick={resetTimer} className="sort-btn" style={{ flex: 1, margin: 0, display: 'flex', justifyContent: 'center', gap: '6px' }}>
            <RotateCcw size={16}/> {t('common.reset')}
          </button>
        </div>

        {/* Быстрое добавление/убавление времени */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px' }}>
          <button onClick={() => addTime(-60)} className="sort-btn" style={{ flex: 1, margin: 0, padding: '6px 2px', fontSize: '12px' }}>{t('modules.timer.minusMinute')}</button>
          <button onClick={() => addTime(-10)} className="sort-btn" style={{ flex: 1, margin: 0, padding: '6px 2px', fontSize: '12px' }}>{t('modules.timer.minusTen')}</button>
          <button onClick={() => addTime(10)} className="sort-btn" style={{ flex: 1, margin: 0, padding: '6px 2px', fontSize: '12px' }}>{t('modules.timer.plusTen')}</button>
          <button onClick={() => addTime(60)} className="sort-btn" style={{ flex: 1, margin: 0, padding: '6px 2px', fontSize: '12px' }}>{t('modules.timer.plusMinute')}</button>
        </div>

      </div>
    </Rnd>
  );
}