import React, { useState } from 'react';
import { 
  BookOpen, Skull, Swords, ShieldHalf, AlertTriangle, 
  Eye, Tent, Footprints, Brain, ArrowDownToLine, 
  HeartPulse, Waves, Zap, Pickaxe, Search, X 
} from 'lucide-react';

const categories = [
  { id: 'conditions', label: 'Состояния', icon: Skull },
  { id: 'combat', label: 'Действия в бою', icon: Swords },
  { id: 'cover', label: 'Укрытия', icon: ShieldHalf },
  { id: 'exhaustion', label: 'Истощение', icon: AlertTriangle },
  { id: 'vision', label: 'Зрение и Свет', icon: Eye },
  { id: 'rest', label: 'Отдых', icon: Tent },
  { id: 'movement', label: 'Прыжки и Движение', icon: Footprints },
  { id: 'concentration', label: 'Концентрация', icon: Brain },
  { id: 'falling', label: 'Урон от падения', icon: ArrowDownToLine },
  { id: 'deathSaves', label: 'Спасброски от смерти', icon: HeartPulse },
  { id: 'underwater', label: 'Подводный бой', icon: Waves },
  { id: 'twoWeapon', label: 'Бой двумя оружиями', icon: Zap },
  { id: 'objects', label: 'Прочность предметов', icon: Pickaxe }
];

// Полная расширенная база правил
const rulesData = {
  conditions: [
    { name: 'Ослепленный', points: ['Существо автоматически проваливает проверки характеристик, требующие зрения.', 'Броски атаки по существу совершаются с преимуществом, а броски атаки самого существа — с помехой.'] },
    { name: 'Испуганный', points: ['Существо совершает с помехой проверки характеристик и броски атаки, пока источник его страха находится в пределах его видимости.', 'Существо не способно добровольно приблизиться к источнику своего страха.'] },
    { name: 'Отравленный', points: ['Существо совершает с помехой броски атаки и проверки характеристик.'] },
    { name: 'Сбитый с ног', points: ['Единственный вариант передвижения — ползком (стоит 1 доп. фут за каждый фут перемещения), пока существо не встанет.', 'Существо совершает броски атаки с помехой.', 'Бросок атаки по существу совершается с преимуществом, если нападающий находится в пределах 5 футов. В противном случае бросок атаки совершается с помехой.'] },
    { name: 'Ошеломленный', points: ['Существо недееспособно (не может совершать действия и реакции), не может двигаться и говорит только запинаясь.', 'Существо автоматически проваливает спасброски Силы и Ловкости.', 'Броски атаки по существу совершаются с преимуществом.'] },
    { name: 'Парализованный', points: ['Существо недееспособно, не может двигаться и говорить.', 'Автоматически проваливает спасброски Силы и Ловкости.', 'Броски атаки по существу совершаются с преимуществом.', 'Любая атака, попавшая по существу, становится критическим попаданием, если нападающий находится в пределах 5 футов.'] },
    { name: 'Схваченный', points: ['Скорость схваченного существа становится равна 0, и она не может увеличиться.', 'Состояние оканчивается, если захватчик становится недееспособным, или если эффект отбрасывает схваченное существо за пределы досягаемости захватчика.'] },
    { name: 'Опутанный', points: ['Скорость существа становится равна 0.', 'Броски атаки по существу совершаются с преимуществом, а броски атаки самого существа — с помехой.', 'Существо совершает спасброски Ловкости с помехой.'] },
    { name: 'Невидимый', points: ['Существо невозможно увидеть без помощи магии или особых чувств. При попытке спрятаться существо считается сильно замаскированным.', 'Броски атаки по существу совершаются с помехой, а броски атаки самого существа — с преимуществом.'] }
  ],
  combat: [
    { name: 'Рывок (Dash)', points: ['Вы получаете дополнительное перемещение в текущем ходу. Увеличение равно вашей скорости после применения всех модификаторов.'] },
    { name: 'Отход (Disengage)', points: ['Если вы совершаете действие Отход, ваше перемещение до конца текущего хода не провоцирует атаки.'] },
    { name: 'Уклонение (Dodge)', points: ['До начала вашего следующего хода любой бросок атаки по вам совершается с помехой, если вы видите нападающего.', 'Вы совершаете спасброски Ловкости с преимуществом.'] },
    { name: 'Помощь (Help)', points: ['Вы можете помочь другому существу с проверкой характеристики, давая преимущество.', 'Альтернативно, вы можете помочь атаковать цель в пределах 5 футов от вас. Следующий бросок атаки союзника по этой цели совершается с преимуществом.'] },
    { name: 'Засада (Hide)', points: ['Вы совершаете проверку Ловкости (Скрытность), чтобы спрятаться. В случае успеха вы получаете преимущества невидимого существа.'] },
    { name: 'Подготовка (Ready)', points: ['Вы выбираете условие и действие (или перемещение), которое совершите в ответ. Требует реакции.', 'Подготовка заклинания требует концентрации.'] }
  ],
  cover: [
    { name: 'Полу-укрытие (+2)', points: ['Дает бонус +2 к КД и спасброскам Ловкости.', 'Примеры: низкая стена, крупная мебель, другое существо.'] },
    { name: 'Укрытие на 3/4 (+5)', points: ['Дает бонус +5 к КД и спасброскам Ловкости.', 'Примеры: опускная решетка, бойница, толстый ствол дерева.'] },
    { name: 'Полное укрытие', points: ['Существо не может быть целью заклинаний и атак прямого действия.', 'Примеры: глухая стена, полностью закрытая дверь.'] }
  ],
  exhaustion: [
    { name: 'Степени истощения', points: ['Уровень 1: Помеха на проверки характеристик.', 'Уровень 2: Скорость уменьшается вдвое.', 'Уровень 3: Помеха на броски атаки и спасброски.', 'Уровень 4: Максимум хитов уменьшается вдвое.', 'Уровень 5: Скорость становится равна 0.', 'Уровень 6: Смерть.', 'Продолжительный отдых (с едой и водой) снижает уровень на 1.'] }
  ],
  vision: [
    { name: 'Тусклый свет', points: ['Слабо замаскированная местность. Существа совершают с помехой проверки Мудрости (Внимательность), полагающиеся на зрение.'] },
    { name: 'Тьма', points: ['Сильно замаскированная местность. Существо фактически страдает от состояния «Ослепленный» при попытке увидеть что-либо в этой зоне.'] },
    { name: 'Темное зрение (Darkvision)', points: ['Позволяет видеть в тусклом свете как в ярком, и во тьме как в тусклом (только в оттенках серого).'] }
  ],
  rest: [
    { name: 'Короткий отдых', points: ['Минимум 1 час. Можно тратить Кости Хитов для лечения.'] },
    { name: 'Продолжительный отдых', points: ['Минимум 8 часов (минимум 6 часов сна). Восстанавливает все хиты и половину Костей Хитов. Возможен 1 раз в 24 часа.'] }
  ],
  movement: [
    { name: 'Прыжок в длину', points: ['С разбегом (10 фт): Расстояние равно значению Силы.', 'С места: Дальность уменьшается вдвое.', 'Каждый фут прыжка тратит фут скорости.'] },
    { name: 'Прыжок в высоту', points: ['С разбегом (10 фт): 3 фута + модификатор Силы.', 'С места: Высота уменьшается вдвое.'] },
    { name: 'Труднопроходимая местность', points: ['Каждый 1 фут перемещения стоит 1 дополнительный фут.'] }
  ],
  concentration: [
    { name: 'Получение урона', points: ['При получении урона нужно совершить спасбросок Телосложения.', 'Сложность (Сл) равна 10 или половине полученного урона (выбирается большее значение).', 'При уроне из нескольких источников бросок делается для каждого отдельно.'] },
    { name: 'Другие причины потери', points: ['Накладывание другого заклинания, требующего концентрации.', 'Смерть персонажа или состояние «Недееспособный».'] }
  ],
  falling: [
    { name: 'Урон', points: ['Существо получает 1к6 дробящего урона за каждые 10 футов падения.', 'Максимальный урон от падения составляет 20к6.'] },
    { name: 'Приземление', points: ['При получении урона от падения существо падает ничком (Сбитый с ног).', 'Если урон не получен (например, заклинание «Плавное падение»), существо остается стоять на ногах.'] }
  ],
  deathSaves: [
    { name: 'Правила броска', points: ['Совершается в начале вашего хода, если у вас 0 хитов.', 'Бросается 1к20 без модификаторов. 10 или выше — успех, ниже 10 — провал.'] },
    { name: 'Исход', points: ['3 успеха: персонаж стабилизирован (0 хитов, не умирает).', '3 провала: персонаж мертв.'] },
    { name: 'Особые случаи (Криты)', points: ['Выпадение «1» на кубике считается как два провала.', 'Выпадение «20» на кубике: персонаж мгновенно получает 1 хит и возвращается в сознание.'] },
    { name: 'Урон при 0 хитов', points: ['Любой полученный урон дает 1 провал спасброска.', 'Если урон получен от критического попадания, это дает 2 провала.', 'Если полученный урон равен или превышает ваш максимум хитов — персонаж умирает мгновенно.'] }
  ],
  underwater: [
    { name: 'Атаки ближнего боя', points: ['Без скорости плавания атаки рукопашным оружием совершаются с помехой.', 'Исключения (без помехи): кинжал, копье, короткий меч, трезубец.'] },
    { name: 'Дальнобойные атаки', points: ['Дальнобойные атаки автоматически промахиваются за пределами нормальной дистанции.', 'Атаки в пределах нормальной дистанции совершаются с помехой.', 'Исключения (нет помехи в пределах норм. дистанции): арбалет, сеть, метательное копье, трезубец или дротик.'] }
  ],
  twoWeapon: [
    { name: 'Правило', points: ['Если вы атакуете легким оружием ближнего боя в одной руке, вы можете бонусным действием совершить атаку другим легким оружием во второй руке.'] },
    { name: 'Урон', points: ['Вы не добавляете свой модификатор характеристики к урону бонусной атаки (если он положительный).'] },
    { name: 'Метательное', points: ['Если у любого из оружия есть свойство «метательное», его можно бросить вместо удара в ближнем бою.'] }
  ],
  objects: [
    { name: 'Класс Доспеха (КД) материалов', points: ['Ткань, бумага, веревка: КД 11', 'Хрусталь, стекло, лед: КД 13', 'Дерево, кость: КД 15', 'Камень: КД 17', 'Железо, сталь: КД 19', 'Мифрил: КД 21', 'Адамантин: КД 23'] }
  ]
};

export default function RulesTab() {
  const [activeCategory, setActiveCategory] = useState('conditions');
  const [searchQuery, setSearchQuery] = useState('');

  const trimmedQuery = searchQuery.trim().toLowerCase();
  const isSearching = trimmedQuery.length > 0;

  // Поиск по всем правилам во всех категориях
  const searchResults = isSearching
    ? categories.flatMap(cat => {
        const list = rulesData[cat.id] || [];
        return list
          .filter(rule => {
            const inName = rule.name.toLowerCase().includes(trimmedQuery);
            const inPoints = rule.points.some(p => p.toLowerCase().includes(trimmedQuery));
            return inName || inPoints;
          })
          .map(rule => ({
            ...rule,
            categoryLabel: cat.label,
            categoryId: cat.id,
            categoryIcon: cat.icon
          }));
      })
    : [];

  const currentRules = isSearching ? searchResults : (rulesData[activeCategory] || []);

  const highlightMatch = (text, query) => {
    if (!query) return text;
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() ? (
        <mark key={i} style={{ backgroundColor: 'rgba(207, 168, 50, 0.35)', color: 'var(--text-title)', borderRadius: '3px', padding: '0 3px', fontWeight: 'bold' }}>
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div style={{ padding: '20px', color: 'var(--text-title)', maxWidth: '1100px', margin: '0 auto', height: 'calc(100vh - 40px)', overflowY: 'auto', boxSizing: 'border-box' }}>
      
      {/* Шапка: Заголовок + Строка живого поиска */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '22px', flexWrap: 'wrap', gap: '14px' }}>
        <h2 style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: 0, fontSize: '24px' }}>
          <BookOpen size={26} color="var(--accent-gold)" />
          Справочник правил
        </h2>

        {/* Поле поиска */}
        <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Поиск по всем правилам, состояниям и КД..."
            style={{
              width: '100%',
              padding: '10px 38px 10px 40px',
              backgroundColor: 'var(--bg-module)',
              border: `1px solid ${isSearching ? 'var(--accent-gold)' : 'var(--border-color)'}`,
              borderRadius: '8px',
              color: 'var(--text-title)',
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
              transition: 'border-color 0.2s'
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              title="Очистить поиск"
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                color: 'var(--text-muted)',
                cursor: 'pointer',
                padding: '4px',
                display: 'flex',
                alignItems: 'center'
              }}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Индикатор результатов поиска */}
      {isSearching && (
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          padding: '10px 16px', 
          backgroundColor: 'rgba(207, 168, 50, 0.1)', 
          border: '1px solid rgba(207, 168, 50, 0.3)', 
          borderRadius: '8px', 
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          <div>
            Найдено совпадений: <strong>{searchResults.length}</strong> по запросу «<strong>{searchQuery}</strong>»
          </div>
          <button 
            type="button" 
            onClick={() => setSearchQuery('')}
            style={{ 
              background: 'none', 
              border: 'none', 
              color: 'var(--accent-gold)', 
              cursor: 'pointer', 
              fontSize: '13px', 
              textDecoration: 'underline' 
            }}
          >
            Сбросить поиск
          </button>
        </div>
      )}

      {/* ГЛАВНЫЙ КОНТЕЙНЕР (Сайдбар + Карточки) */}
      <div style={{ display: 'flex', gap: '25px', alignItems: 'flex-start' }}>
        
        {/* ЛЕВОЕ МЕНЮ (Сайдбар) */}
        <div style={{ 
          display: 'flex', flexDirection: 'column', gap: '8px', 
          minWidth: '240px', flexShrink: 0 
        }}>
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isSelected = !isSearching && activeCategory === cat.id;
            
            // Если включен поиск, подсчитаем количество совпадений в этой категории
            let matchCountInCat = 0;
            if (isSearching) {
              const list = rulesData[cat.id] || [];
              matchCountInCat = list.filter(r => 
                r.name.toLowerCase().includes(trimmedQuery) || 
                r.points.some(p => p.toLowerCase().includes(trimmedQuery))
              ).length;
            }

            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  if (isSearching) setSearchQuery('');
                }}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 16px',
                  backgroundColor: isSelected ? 'var(--bg-module)' : 'transparent',
                  color: isSelected ? 'var(--accent-gold)' : (matchCountInCat > 0 ? 'var(--text-title)' : 'var(--text-muted)'),
                  border: `1px solid ${isSelected ? 'var(--accent-gold)' : 'var(--border-color)'}`,
                  borderRadius: '8px', cursor: 'pointer', textAlign: 'left',
                  fontSize: '15px', fontWeight: isSelected || matchCountInCat > 0 ? '600' : 'normal',
                  transition: 'all 0.2s', boxShadow: isSelected ? '0 4px 12px rgba(0,0,0,0.1)' : 'none',
                  opacity: isSearching && matchCountInCat === 0 ? 0.45 : 1
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Icon size={18} color={isSelected ? 'var(--accent-gold)' : 'currentColor'} />
                  {cat.label}
                </div>
                {isSearching && matchCountInCat > 0 && (
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '2px 7px', 
                    borderRadius: '10px', 
                    backgroundColor: 'rgba(207, 168, 50, 0.2)', 
                    color: 'var(--accent-gold)', 
                    fontWeight: 'bold' 
                  }}>
                    {matchCountInCat}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* ПРАВАЯ ЧАСТЬ (Список карточек) */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {currentRules.length === 0 ? (
            <div style={{ 
              backgroundColor: 'var(--bg-module)', 
              borderRadius: '8px', 
              border: '1px dashed var(--border-color)', 
              padding: '40px 20px', 
              textAlign: 'center',
              color: 'var(--text-muted)'
            }}>
              <BookOpen size={40} style={{ margin: '0 auto 12px auto', opacity: 0.3 }} />
              <p style={{ margin: '0 0 6px 0', fontSize: '16px', color: 'var(--text-title)', fontWeight: 'bold' }}>
                Ничего не найдено по запросу «{searchQuery}»
              </p>
              <p style={{ margin: 0, fontSize: '13px' }}>
                Попробуйте другие слова, например: <em>помеха, преимущество, укрытие, спасбросок, КД, отдых</em>.
              </p>
            </div>
          ) : (
            currentRules.map((rule, index) => {
              const CategoryIcon = rule.categoryIcon;
              return (
                <div 
                  key={index} 
                  style={{ 
                    backgroundColor: 'var(--bg-input)', borderRadius: '8px', 
                    border: '1px solid var(--border-color)', padding: '20px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '0 0 10px 0', flexWrap: 'wrap', gap: '8px' }}>
                    <h3 style={{ margin: 0, color: 'var(--accent-gold)', fontSize: '18px' }}>
                      {highlightMatch(rule.name, trimmedQuery)}
                    </h3>
                    {isSearching && rule.categoryLabel && (
                      <span style={{ 
                        display: 'inline-flex', 
                        alignItems: 'center', 
                        gap: '6px', 
                        fontSize: '12px', 
                        padding: '3px 10px', 
                        borderRadius: '12px', 
                        backgroundColor: 'rgba(207, 168, 50, 0.12)', 
                        color: 'var(--accent-gold)', 
                        border: '1px solid rgba(207, 168, 50, 0.3)',
                        fontWeight: '600'
                      }}>
                        {CategoryIcon && <CategoryIcon size={13} />}
                        {rule.categoryLabel}
                      </span>
                    )}
                  </div>
                  <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--text-title)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {rule.points.map((point, i) => (
                      <li key={i} style={{ lineHeight: '1.5', fontSize: '14px' }}>
                        {highlightMatch(point, trimmedQuery)}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}