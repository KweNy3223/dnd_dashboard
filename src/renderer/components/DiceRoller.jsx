import React, { useState } from 'react';
import { Rnd } from 'react-rnd';
import { Pin, PinOff, ChevronDown, ChevronUp, X, Dices } from 'lucide-react';

export default function DiceRoller({ onClose, history, setHistory, isPinned, setIsPinned, isMinimized, setIsMinimized, snapToGrid, layout, setLayout }) {

    const [quantity, setQuantity] = useState(1);
    const [modifier, setModifier] = useState(0);
    
    // Память для "Крупного экрана"
    const [latestRoll, setLatestRoll] = useState(null); 

    const rollDice = (sides) => {
        let sum = 0;
        let individualRolls = [];
        
        // Бросаем кубик нужное количество раз
        for (let i = 0; i < quantity; i++) {
        const roll = Math.floor(Math.random() * sides) + 1;
        sum += roll;
        individualRolls.push(roll);
        }

        const total = sum + modifier;
        const time = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        // Собираем красивую строку математики
        let baseStr = `${quantity}d${sides}`;
        if (modifier !== 0) {
        baseStr += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
        }
        
        const detailsStr = `(${individualRolls.join(', ')})`;
        let fullText = `${baseStr} = ${detailsStr}`;
        if (modifier !== 0) {
        fullText += modifier > 0 ? ` + ${modifier}` : ` - ${Math.abs(modifier)}`;
        }
        fullText += ` = ${total}`;

        // Обновляем большой экран (с проверкой на 1 и 20 для d20)
        setLatestRoll({
        total: total,
        dice: `d${sides}`,
        details: fullText,
        isCrit: sides === 20 && quantity === 1 && sum === 20,
        isFail: sides === 20 && quantity === 1 && sum === 1
        });

        // Сохраняем в глобальную историю
        const newHistoryItem = { id: Date.now(), text: fullText, time: time };
        setHistory([newHistoryItem, ...history]);
    };

    return (
        <Rnd
            className={isMinimized ? "module-card minimized" : "module-card"}
            default={{ 
                x: layout?.x || 50, 
                y: layout?.y || 50, 
                width: layout?.width || 320, 
                height: layout?.height || 400 
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
        {/* 1. ШАПКА */}
        <div className="tracker-header">
            <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                <Dices size={20} /> Бросок кубиков
            </h3>
            
            {/* Вот эта невидимая коробка сгруппирует кнопки вместе */}
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
        <div className={`tracker-body ${isMinimized ? 'collapsed' : ''}`}>
            <div className="tracker-body-inner" style={{ gap: '15px' }}>
            
            {/* ОГРОМНЫЙ ЭКРАН РЕЗУЛЬТАТА С ВОДЯНЫМ ЗНАКОМ */}
            <div style={{
                backgroundColor: 'var(--bg-app)',
                border: '1px solid var(--border-color)',
                borderRadius: '8px',
                padding: '20px',
                textAlign: 'center',
                display: 'flex',
                flexDirection: 'column',
                gap: '5px',
                minHeight: '120px',
                justifyContent: 'center',
                position: 'relative', 
                overflow: 'hidden'    
            }}>
                {latestRoll ? (
                <>
                    {/* ФОНОВЫЙ КУБИК (SVG водяной знак) */}
                    <svg 
                    viewBox="0 0 100 100" 
                    style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        width: '120px',
                        height: '120px',
                        opacity: latestRoll.isCrit || latestRoll.isFail ? 0.15 : 0.05, 
                        color: latestRoll.isCrit ? 'var(--accent-gold)' : latestRoll.isFail ? 'var(--accent-red)' : 'var(--text-title)',
                        zIndex: 0,
                        pointerEvents: 'none'
                    }}
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                    strokeLinejoin="round"
                    >
                    <polygon points="50,5 95,28 95,72 50,95 5,72 5,28" />
                    <polygon points="50,5 25,50 75,50" />
                    <line x1="25" y1="50" x2="5" y2="28" />
                    <line x1="75" y1="50" x2="95" y2="28" />
                    <line x1="25" y1="50" x2="5" y2="72" />
                    <line x1="75" y1="50" x2="95" y2="72" />
                    <line x1="25" y1="50" x2="50" y2="95" />
                    <line x1="75" y1="50" x2="50" y2="95" />
                    </svg>

                    {/* САМ ТЕКСТ (Размещаем поверх кубика) */}
                    <div style={{ position: 'relative', zIndex: 1 }}>
                    <div style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
                        Результат броска {latestRoll.dice}:
                    </div>
                    <div style={{ 
                        fontSize: '56px', 
                        fontWeight: 'bold', 
                        lineHeight: '1',
                        color: latestRoll.isCrit ? 'var(--accent-gold)' : latestRoll.isFail ? 'var(--accent-red)' : 'var(--text-title)',
                        textShadow: latestRoll.isCrit 
                        ? '0 0 15px rgba(207, 168, 50, 0.6)' 
                        : latestRoll.isFail 
                            ? '0 0 15px rgba(237, 66, 69, 0.6)' 
                            : 'none'
                    }}>
                        {latestRoll.total}
                    </div>
                    <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        {latestRoll.details}
                    </div>
                    </div>
                </>
                ) : (
                <div style={{ color: 'var(--text-muted)', fontSize: '16px', position: 'relative', zIndex: 1 }}>
                    Выберите количество и бросьте кубик
                </div>
                )}
            </div>

            {/* НАСТРОЙКА КОЛИЧЕСТВА И МОДИФИКАТОРА */}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <div className="tracker-row" style={{ margin: 0, gridTemplateColumns: '1fr', textAlign: 'center', flex: 1 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Количество</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <button className="delete-btn" style={{ fontSize: '24px' }} onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-title)' }}>{quantity}</span>
                    <button className="delete-btn" style={{ fontSize: '24px' }} onClick={() => setQuantity(quantity + 1)}>+</button>
                </div>
                </div>

                <div className="tracker-row" style={{ margin: 0, gridTemplateColumns: '1fr', textAlign: 'center', flex: 1 }}>
                <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Модификатор</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', justifyContent: 'center' }}>
                    <button className="delete-btn" style={{ fontSize: '24px' }} onClick={() => setModifier(modifier - 1)}>-</button>
                    <span style={{ fontSize: '20px', fontWeight: 'bold', color: 'var(--text-title)' }}>{modifier > 0 ? `+${modifier}` : modifier}</span>
                    <button className="delete-btn" style={{ fontSize: '24px' }} onClick={() => setModifier(modifier + 1)}>+</button>
                </div>
                </div>
            </div>

            {/* ПАНЕЛЬ КНОПОК (КУБИКИ) */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {[4, 6, 8, 10, 12, 20, 100].map((dice) => (
                <button 
                    key={dice} 
                    className="sort-btn" 
                    style={{ flex: 1, padding: '12px 0', margin: 0, fontSize: '16px', fontWeight: 'bold' }}
                    onClick={() => rollDice(dice)}
                >
                    d{dice}
                </button>
                ))}
            </div>

            {/* ИСТОРИЯ БРОСКОВ */}
            <div className="tracker-list" style={{ borderTop: '1px solid var(--border-color)', paddingTop: '10px' }}>
                {history.map((roll) => (
                <div key={roll.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 8px', fontSize: '13px' }}>
                    <span style={{ color: 'var(--text-primary)' }}>{roll.text}</span>
                    <span style={{ color: 'var(--text-muted)' }}>{roll.time}</span>
                </div>
                ))}
            </div>

            <div className="tracker-footer">
                <button className="sort-btn" onClick={() => setHistory([])}>Очистить историю</button>
            </div>

            </div>
        </div>
        </Rnd>
    );
}