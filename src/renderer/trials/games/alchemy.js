/**
 * Модуль мини-игры: Зельеварение D&D 5e (Alchemy Brewing)
 * Аутентичная алхимическая лаборатория D&D с каноническими зельями (DMG / XGtE):
 * - Рецепты привязаны к конкретным официальным зельям D&D 5e разной сложности
 * - Понятный интерактивный процесс: нагрев мехов, добавление реагентов, помешивание ложкой
 * - Монолитный, красивый чугунный котел с живым огнем, воронкой и светящейся жидкостью
 * - Подробное D&D описание эффекта и редкости приготовленного зелья
 */

import { audio } from '../audio.js';
import { dnd } from '../dnd-engine.js';

// =========================================================================
// --- БАЗА ИНГРЕДИЕНТОВ D&D 5E ---
// =========================================================================
export const ALL_REAGENTS = {
  sweet_root: { id: 'sweet_root', name: 'Корень колючника', icon: '🌾', color: '#fde68a' },
  goodberry: { id: 'goodberry', name: 'Ягоды добродрева', icon: '🍒', color: '#dc2626' },
  ironbark_resin: { id: 'ironbark_resin', name: 'Смола железнодерева', icon: '🪵', color: '#78350f' },
  spider_silk: { id: 'spider_silk', name: 'Нити паучьего шёлка', icon: '🕸️', color: '#e2e8f0' },
  elf_blossom: { id: 'elf_blossom', name: 'Эльфийский первоцвет', icon: '🌸', color: '#f472b6' },
  gold_root: { id: 'gold_root', name: 'Золотой корень', icon: '✨', color: '#fbbf24' },
  gillyweed: { id: 'gillyweed', name: 'Жаброросль глубин', icon: '🌿', color: '#10b981' },
  triton_scale: { id: 'triton_scale', name: 'Лазурная чешуя тритона', icon: '🐟', color: '#06b6d4' },
  salamander_ash: { id: 'salamander_ash', name: 'Пепел саламандры', icon: '🔥', color: '#ea580c' },
  magma_resin: { id: 'magma_resin', name: 'Магматическая смола', icon: '🌋', color: '#b91c1c' },
  ogre_bone: { id: 'ogre_bone', name: 'Костяной порошок огра', icon: '🦴', color: '#cbd5e1' },
  troll_blood: { id: 'troll_blood', name: 'Кровь тролля', icon: '🩸', color: '#991b1b' },
  shadow_moss: { id: 'shadow_moss', name: 'Призрачный мох', icon: '🔮', color: '#8b5cf6' },
  phase_essence: { id: 'phase_essence', name: 'Эссенция фазового паука', icon: '🌌', color: '#6366f1' },
  moon_dew: { id: 'moon_dew', name: 'Лунная роса', icon: '🌙', color: '#38bdf8' },
  griffon_feather: { id: 'griffon_feather', name: 'Перо грифона', icon: '🪶', color: '#eab308' },
  holy_oil: { id: 'holy_oil', name: 'Освящённый елей', icon: '🏺', color: '#fef08a' },
  lightning_salt: { id: 'lightning_salt', name: 'Молниеносная соль', icon: '⚡', color: '#3b82f6' },
  quicksilver_root: { id: 'quicksilver_root', name: 'Ртутный корень', icon: '🌪️', color: '#94a3b8' },
  pegasus_down: { id: 'pegasus_down', name: 'Пух пегаса', icon: '🪽', color: '#f8fafc' },
  meteor_dust: { id: 'meteor_dust', name: 'Метеоритная пыль', icon: '☄️', color: '#64748b' },
  phoenix_tear: { id: 'phoenix_tear', name: 'Слеза феникса', icon: '💫', color: '#f97316' },
  diamond_dust: { id: 'diamond_dust', name: 'Алмазная пыль', icon: '💎', color: '#67e8f9' },
  forest_berry: { id: 'forest_berry', name: 'Лесные ягоды ласки', icon: '🍓', color: '#f43f5e' },
  giant_mushroom: { id: 'giant_mushroom', name: 'Гриб-великаноборец', icon: '🍄', color: '#e11d48' },
  vapor_spore: { id: 'vapor_spore', name: 'Споры эфирного тумана', icon: '🌫️', color: '#cbd5e1' },
  adamantine_flake: { id: 'adamantine_flake', name: 'Адамантиновая стружка', icon: '🛡️', color: '#334155' },
  storm_core: { id: 'storm_core', name: 'Ядро грозовой тучи', icon: '⛈️', color: '#2563eb' }
};

// =========================================================================
// --- КАНОНИЧЕСКИЙ КАТАЛОГ ЗЕЛИЙ D&D 5E ---
// =========================================================================
export const POTIONS_CATALOG = {
  // 1. ОБЫЧНЫЕ (COMMON) — Для начинающих алхимиков
  healing: {
    id: 'healing',
    name: 'Зелье лечения',
    englishName: 'Potion of Healing',
    rarity: 'Обычное (Common)',
    rarityClass: 'common',
    icon: '🍷',
    effect: 'Восстанавливает 2d4 + 2 хитов',
    desc: 'Густая мерцающая рубиновая жидкость, пахнет мёдом и сушёными ягодами.',
    liquidColor: '#dc2626',
    baseLiquidColor: '#fed7aa',
    allowedMistakes: 3,
    steps: [
      { type: 'heat', mode: 'warm', minT: 60, maxT: 115, text: 'Разогреть тигель до лёгкого пара (60°–115°C)' },
      { type: 'reagent', reagentId: 'sweet_root', tempMin: 60, tempMax: 125, text: 'Всыпать Корень колючника (🌾)' },
      { type: 'reagent', reagentId: 'goodberry', tempMin: 60, tempMax: 130, text: 'Выжать сок Ягод добродрева (🍒)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Помешать 2 раза по часовой стрелке ↻' }
    ]
  },
  climbing: {
    id: 'climbing',
    name: 'Зелье лазания',
    englishName: 'Potion of Climbing',
    rarity: 'Обычное (Common)',
    rarityClass: 'common',
    icon: '🧗',
    effect: 'Скорость лазания = скорости ходьбы + преимущество на Атлетику (1 час)',
    desc: 'Вязкий янтарный сироп с плавающими белыми каплями, пахнет сосновой корой.',
    liquidColor: '#b45309',
    baseLiquidColor: '#fde68a',
    allowedMistakes: 3,
    steps: [
      { type: 'heat', mode: 'warm', minT: 70, maxT: 120, text: 'Прогреть тигель до томления (70°–120°C)' },
      { type: 'reagent', reagentId: 'ironbark_resin', tempMin: 70, tempMax: 130, text: 'Добавить Смолу железнодерева (🪵)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Загустить: перемешать по часовой стрелке ↻' },
      { type: 'reagent', reagentId: 'spider_silk', tempMin: 60, tempMax: 120, text: 'Всыпать Нити паучьего шёлка (🕸️)' }
    ]
  },
  animal_friendship: {
    id: 'animal_friendship',
    name: 'Зелье дружбы с животными',
    englishName: 'Potion of Animal Friendship',
    rarity: 'Обычное (Common)',
    rarityClass: 'common',
    icon: '🌿',
    effect: 'Заклинание «Дружба с животными» (СЛ 13) на 24 часа',
    desc: 'Свежий травяной отвар с ароматом скошенного луга, привлекающий лесных зверьков.',
    liquidColor: '#65a30d',
    baseLiquidColor: '#bef264',
    allowedMistakes: 3,
    steps: [
      { type: 'heat', mode: 'warm', minT: 50, maxT: 95, text: 'Мягко согреть родниковую воду (50°–95°C)' },
      { type: 'reagent', reagentId: 'sweet_root', tempMin: 50, tempMax: 100, text: 'Всыпать Корень колючника (🌾)' },
      { type: 'reagent', reagentId: 'forest_berry', tempMin: 50, tempMax: 105, text: 'Добавить Лесные ягоды ласки (🍓)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Мягко перемешать по часовой стрелке ↻' }
    ]
  },

  // 2. НЕОБЫЧНЫЕ (UNCOMMON) — Умеренная сложность
  greater_healing: {
    id: 'greater_healing',
    name: 'Большее зелье лечения',
    englishName: 'Potion of Greater Healing',
    rarity: 'Необычное (Uncommon)',
    rarityClass: 'uncommon',
    icon: '💖',
    effect: 'Восстанавливает 4d4 + 4 хитов',
    desc: 'Ярко-алая светящаяся жидкость, от которой исходит живительное тепло.',
    liquidColor: '#ef4444',
    baseLiquidColor: '#fca5a5',
    allowedMistakes: 2,
    steps: [
      { type: 'heat', mode: 'boil', minT: 140, maxT: 190, text: 'Довести настой до уверенного кипения (140°–190°C)' },
      { type: 'reagent', reagentId: 'elf_blossom', tempMin: 140, tempMax: 195, text: 'Бросить Лепестки эльфийского первоцвета (🌸)' },
      { type: 'stir', dir: 'ccw', count: 2, text: 'Остудить вихрем: помешать против часовой стрелки ↺' },
      { type: 'reagent', reagentId: 'gold_root', tempMin: 90, tempMax: 150, text: 'Всыпать тёртый Золотой корень (✨)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Закрепить: помешать по часовой стрелке ↻' }
    ]
  },
  water_breathing: {
    id: 'water_breathing',
    name: 'Зелье дыхания под водой',
    englishName: 'Potion of Water Breathing',
    rarity: 'Необычное (Uncommon)',
    rarityClass: 'uncommon',
    icon: '🌊',
    effect: 'Позволяет дышать под водой в течение 1 часа',
    desc: 'Прозрачная лазурная жидкость с крошечными вечными пузырьками в форме медуз.',
    liquidColor: '#06b6d4',
    baseLiquidColor: '#cffafe',
    allowedMistakes: 2,
    steps: [
      { type: 'heat', mode: 'warm', minT: 80, maxT: 130, text: 'Нагреть морскую воду до парения (80°–130°C)' },
      { type: 'reagent', reagentId: 'gillyweed', tempMin: 80, tempMax: 135, text: 'Опустить пучок Жаброросли (🌿)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Закрутить водоворот по часовой стрелке ↻' },
      { type: 'reagent', reagentId: 'triton_scale', tempMin: 80, tempMax: 140, text: 'Бросить Лазурную чешую тритона (🐟)' }
    ]
  },
  fire_resistance: {
    id: 'fire_resistance',
    name: 'Зелье огнестойкости',
    englishName: 'Potion of Resistance (Fire)',
    rarity: 'Необычное (Uncommon)',
    rarityClass: 'uncommon',
    icon: '🛡️',
    effect: 'Сопротивление огненному урону на 1 час',
    desc: 'Тёплая багряно-золотая жидкость с мерцающими искрами, пахнет корицей и серой.',
    liquidColor: '#ea580c',
    baseLiquidColor: '#fed7aa',
    allowedMistakes: 2,
    steps: [
      { type: 'heat', mode: 'boil', minT: 160, maxT: 215, text: 'Раздуть тигель до жаркого кипения (160°–215°C)' },
      { type: 'reagent', reagentId: 'salamander_ash', tempMin: 160, tempMax: 220, text: 'Всыпать Пепел огненной саламандры (🔥)' },
      { type: 'reagent', reagentId: 'magma_resin', tempMin: 165, tempMax: 225, text: 'Влить каплю Магматической смолы (🌋)' },
      { type: 'stir', dir: 'ccw', count: 2, text: 'Усмирить огонь: перемешать против часовой стрелки ↺' }
    ]
  },
  hill_giant: {
    id: 'hill_giant',
    name: 'Зелье силы холмового великана',
    englishName: 'Potion of Hill Giant Strength',
    rarity: 'Необычное (Uncommon)',
    rarityClass: 'uncommon',
    icon: '🦾',
    effect: 'Значение Силы становится 21 (+5) на 1 час',
    desc: 'Густая стальная жидкость с резким ароматом железа, в которой плавает ноготь великана.',
    liquidColor: '#475569',
    baseLiquidColor: '#94a3b8',
    allowedMistakes: 2,
    steps: [
      { type: 'heat', mode: 'boil', minT: 150, maxT: 200, text: 'Прогреть до кипения экстракт костей (150°–200°C)' },
      { type: 'reagent', reagentId: 'ogre_bone', tempMin: 150, tempMax: 205, text: 'Всыпать Костяной порошок огра (🦴)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Взболтать по часовой стрелке ↻' },
      { type: 'reagent', reagentId: 'troll_blood', tempMin: 140, tempMax: 195, text: 'Добавить три капли Крови тролля (🩸)' }
    ]
  },
  growth: {
    id: 'growth',
    name: 'Зелье роста',
    englishName: 'Potion of Growth',
    rarity: 'Необычное (Uncommon)',
    rarityClass: 'uncommon',
    icon: '🍄',
    effect: 'Увеличивает размер на 1 категорию и +1d4 к урону оружием (1d4 часа)',
    desc: 'Бурлящий багряный настой, на дне которого непрерывно пульсирует багровый сгусток.',
    liquidColor: '#dc2626',
    baseLiquidColor: '#fca5a5',
    allowedMistakes: 2,
    steps: [
      { type: 'heat', mode: 'boil', minT: 140, maxT: 195, text: 'Разжечь пламя до вскипания (140°–195°C)' },
      { type: 'reagent', reagentId: 'giant_mushroom', tempMin: 140, tempMax: 200, text: 'Бросить Гриб-великаноборец (🍄)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Перемешать по часовой стрелке ↻' },
      { type: 'reagent', reagentId: 'ironbark_resin', tempMin: 120, tempMax: 180, text: 'Добавить Смолу железнодерева (🪵)' },
      { type: 'stir', dir: 'ccw', count: 2, text: 'Остудить вихрем против часовой стрелки ↺' }
    ]
  },

  // 3. РЕДКИЕ (RARE) — Высокая сложность
  invisibility: {
    id: 'invisibility',
    name: 'Зелье невидимости',
    englishName: 'Potion of Invisibility',
    rarity: 'Редкое (Rare)',
    rarityClass: 'rare',
    icon: '👻',
    effect: 'Персонаж становится невидимым на 1 час',
    desc: 'Абсолютно прозрачное зелье, колба кажется пустой, но ощущается тяжёлой.',
    liquidColor: '#e0e7ff',
    baseLiquidColor: '#c7d2fe',
    allowedMistakes: 1,
    steps: [
      { type: 'heat', mode: 'cool', minT: 25, maxT: 65, text: 'Остудить тигель: зелье не терпит огня (25°–65°C)' },
      { type: 'reagent', reagentId: 'shadow_moss', tempMin: 25, tempMax: 70, text: 'Растереть Пыльцу призрачного мха (🔮)' },
      { type: 'reagent', reagentId: 'phase_essence', tempMin: 25, tempMax: 75, text: 'Влить Эссенцию фазового паука (🌌)' },
      { type: 'stir', dir: 'ccw', count: 3, text: 'Растворить силуэт: помешать против часовой стрелки ↺' },
      { type: 'reagent', reagentId: 'moon_dew', tempMin: 25, tempMax: 65, text: 'Добавить чистую Лунную росу (🌙)' }
    ]
  },
  heroism: {
    id: 'heroism',
    name: 'Зелье героизма',
    englishName: 'Potion of Heroism',
    rarity: 'Редкое (Rare)',
    rarityClass: 'rare',
    icon: '👑',
    effect: '10 временных хитов + эффект заклинания Благословение на 1 час',
    desc: 'Сияющая лазурная жидкость с золотыми искрами, наполняющая сердце бесстрашием.',
    liquidColor: '#2563eb',
    baseLiquidColor: '#93c5fd',
    allowedMistakes: 1,
    steps: [
      { type: 'heat', mode: 'boil', minT: 160, maxT: 210, text: 'Довести до звонкого кипения (160°–210°C)' },
      { type: 'reagent', reagentId: 'griffon_feather', tempMin: 160, tempMax: 215, text: 'Опустить Золотое перо грифона (🪶)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Собрать вихрь доблести по часовой стрелке ↻' },
      { type: 'reagent', reagentId: 'holy_oil', tempMin: 140, tempMax: 195, text: 'Влить Освящённый елей (🏺)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Завершить благословение по часовой стрелке ↻' }
    ]
  },
  gaseous_form: {
    id: 'gaseous_form',
    name: 'Зелье газообразной формы',
    englishName: 'Potion of Gaseous Form',
    rarity: 'Редкое (Rare)',
    rarityClass: 'rare',
    icon: '🌫️',
    effect: 'Форма тумана: полет 10 фт, сквозь щели, сопротивление урону (1 час)',
    desc: 'Флакон кажется пустым, но при встряхивании поднимается перламутровый вихрь пара.',
    liquidColor: '#94a3b8',
    baseLiquidColor: '#e2e8f0',
    allowedMistakes: 1,
    steps: [
      { type: 'heat', mode: 'cool', minT: 20, maxT: 55, text: 'Остудить тигель: пары не терпят тепла (20°–55°C)' },
      { type: 'reagent', reagentId: 'vapor_spore', tempMin: 20, tempMax: 60, text: 'Всыпать Споры эфирного тумана (🌫️)' },
      { type: 'stir', dir: 'ccw', count: 2, text: 'Закрутить эфирный туман против часовой стрелки ↺' },
      { type: 'reagent', reagentId: 'phase_essence', tempMin: 20, tempMax: 65, text: 'Влить Эссенцию фазового паука (🌌)' },
      { type: 'heat', mode: 'warm', minT: 70, maxT: 110, text: 'Кратко прогреть для возгонки пара (70°–110°C)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Поймать конденсат вращением по часовой стрелке ↻' }
    ]
  },
  invulnerability: {
    id: 'invulnerability',
    name: 'Зелье неуязвимости',
    englishName: 'Potion of Invulnerability',
    rarity: 'Редкое (Rare)',
    rarityClass: 'rare',
    icon: '🛡️',
    effect: 'Сопротивление АБСОЛЮТНО ВСЕМУ входящему урону на 1 минуту',
    desc: 'Густая смолистая жидкость цвета жидкого обсидиана с мерцающей алмазной коркой.',
    liquidColor: '#312e81',
    baseLiquidColor: '#4338ca',
    allowedMistakes: 1,
    steps: [
      { type: 'heat', mode: 'raging', minT: 220, maxT: 275, text: 'Раздуть меха до адского жара (220°–275°C)' },
      { type: 'reagent', reagentId: 'adamantine_flake', tempMin: 220, tempMax: 280, text: 'Всыпать Адамантиновую стружку (🛡️)' },
      { type: 'stir', dir: 'cw', count: 3, text: 'Закалить металл вращением по часовой стрелке ↻' },
      { type: 'reagent', reagentId: 'salamander_ash', tempMin: 210, tempMax: 265, text: 'Добавить Пепел саламандры (🔥)' },
      { type: 'stir', dir: 'ccw', count: 2, text: 'Снять напряжение против часовой стрелки ↺' },
      { type: 'reagent', reagentId: 'diamond_dust', tempMin: 180, tempMax: 240, text: 'Закрепить Алмазной пылью (💎)' }
    ]
  },

  // 4. ОЧЕНЬ РЕДКИЕ (VERY RARE) — Мастерские зелья
  speed: {
    id: 'speed',
    name: 'Зелье скорости',
    englishName: 'Potion of Speed',
    rarity: 'Очень редкое (Very Rare)',
    rarityClass: 'very-rare',
    icon: '⚡',
    effect: 'Эффект заклинания Ускорение (Haste) без концентрации на 1 минуту',
    desc: 'Шелковистая жёлтая жидкость с чёрной полосой, кружащейся сама по себе.',
    liquidColor: '#eab308',
    baseLiquidColor: '#fef08a',
    allowedMistakes: 1,
    steps: [
      { type: 'heat', mode: 'raging', minT: 215, maxT: 265, text: 'Раздуть меха до яростного жара (215°–265°C)' },
      { type: 'reagent', reagentId: 'lightning_salt', tempMin: 215, tempMax: 270, text: 'Бросить искрящуюся Молниеносную соль (⚡)' },
      { type: 'stir', dir: 'cw', count: 3, text: 'Быстро закрутить по часовой стрелке ↻' },
      { type: 'reagent', reagentId: 'quicksilver_root', tempMin: 190, tempMax: 245, text: 'Добавить Ртутный корень (🌪️)' },
      { type: 'stir', dir: 'ccw', count: 2, text: 'Резко остановить обратным вращением ↺' },
      { type: 'heat', mode: 'warm', minT: 60, maxT: 110, text: 'Остудить тигель до стабильного тепла (60°–110°C)' }
    ]
  },
  flying: {
    id: 'flying',
    name: 'Зелье полёта',
    englishName: 'Potion of Flying',
    rarity: 'Очень редкое (Very Rare)',
    rarityClass: 'very-rare',
    icon: '🕊️',
    effect: 'Скорость полёта 60 футов с парением на 1 час',
    desc: 'Прозрачная небесно-голубая жидкость с парящими белыми хлопьями.',
    liquidColor: '#38bdf8',
    baseLiquidColor: '#bae6fd',
    allowedMistakes: 1,
    steps: [
      { type: 'heat', mode: 'boil', minT: 150, maxT: 200, text: 'Нагреть горный эфир до кипения (150°–200°C)' },
      { type: 'reagent', reagentId: 'pegasus_down', tempMin: 150, tempMax: 205, text: 'Всыпать Пух пегаса (🪽)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Поднять восходящий поток по часовой стрелке ↻' },
      { type: 'reagent', reagentId: 'meteor_dust', tempMin: 130, tempMax: 185, text: 'Добавить Порошок левитирующего метеорита (☄️)' },
      { type: 'stir', dir: 'ccw', count: 2, text: 'Уравновесить тягу против часовой стрелки ↺' }
    ]
  },
  supreme_healing: {
    id: 'supreme_healing',
    name: 'Высшее зелье лечения',
    englishName: 'Potion of Supreme Healing',
    rarity: 'Очень редкое (Very Rare)',
    rarityClass: 'very-rare',
    icon: '🌟',
    effect: 'Восстанавливает 10d4 + 20 хитов',
    desc: 'Ослепительно сияющий пурпурно-алый нектар, излечивающий смертельные раны.',
    liquidColor: '#c026d3',
    baseLiquidColor: '#f0abfc',
    allowedMistakes: 1,
    steps: [
      { type: 'heat', mode: 'raging', minT: 220, maxT: 270, text: 'Накалить тигель до высшей точки кипения (220°–270°C)' },
      { type: 'reagent', reagentId: 'phoenix_tear', tempMin: 220, tempMax: 275, text: 'Опустить Огненную слезу феникса (💫)' },
      { type: 'stir', dir: 'cw', count: 3, text: 'Инициировать перерождение по часовой стрелке ↻' },
      { type: 'reagent', reagentId: 'diamond_dust', tempMin: 180, tempMax: 235, text: 'Всыпать Алмазную пыль (💎)' },
      { type: 'heat', mode: 'warm', minT: 50, maxT: 95, text: 'Мягко остудить до живительного тепла (50°–95°C)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Закрепить эликсир жизни по часовой стрелке ↻' }
    ]
  },
  storm_giant: {
    id: 'storm_giant',
    name: 'Зелье силы великана бурь',
    englishName: 'Potion of Storm Giant Strength',
    rarity: 'Легендарное (Legendary)',
    rarityClass: 'legendary',
    icon: '⛈️',
    effect: 'Значение Силы становится равным 29 (+9) на 1 час!',
    desc: 'Сапфировая эссенция, в глубине которой сверкают молнии и грохочет тихий гром.',
    liquidColor: '#1d4ed8',
    baseLiquidColor: '#60a5fa',
    allowedMistakes: 1,
    steps: [
      { type: 'heat', mode: 'raging', minT: 235, maxT: 285, text: 'Накалить тигель до грозового разряда (235°–285°C)' },
      { type: 'reagent', reagentId: 'storm_core', tempMin: 235, tempMax: 290, text: 'Опустить Ядро грозовой тучи (⛈️)' },
      { type: 'stir', dir: 'cw', count: 3, text: 'Закрутить вихрь урагана по часовой стрелке ↻' },
      { type: 'reagent', reagentId: 'lightning_salt', tempMin: 220, tempMax: 275, text: 'Всыпать Молниеносную соль (⚡)' },
      { type: 'stir', dir: 'ccw', count: 2, text: 'Укротить разряд против часовой стрелки ↺' },
      { type: 'reagent', reagentId: 'troll_blood', tempMin: 190, tempMax: 240, text: 'Связать плотью: Кровь тролля (🩸)' },
      { type: 'heat', mode: 'warm', minT: 60, maxT: 105, text: 'Резко охладить до спокойного эфира (60°–105°C)' },
      { type: 'stir', dir: 'cw', count: 2, text: 'Запечатать мощь по часовой стрелке ↻' }
    ]
  }
};

export class AlchemyGame {
  constructor(container, app) {
    this.container = container;
    this.app = app;

    this.canvas = null;
    this.ctx = null;
    this.animationFrameId = null;

    // Выбранное зелье
    this.currentPotionId = 'healing';
    this.potion = POTIONS_CATALOG.healing;

    // Параметры тигля
    this.temperature = 35; // 20..300 °C
    this.isBellowsPumping = false;
    this.isBrewed = false;
    this.isRuined = false;
    this.mistakesCount = 0;

    // Шаги рецепта
    this.steps = [];
    this.currentStepIndex = 0;
    this.heatHoldTimer = 0; // Для шагов нагрева
    this.stirProgress = 0;  // Счётчик помешиваний

    // Анимация жидкости
    this.currentLiquidColor = '#fed7aa';
    this.targetLiquidColor = '#dc2626';
    this.stirAngle = 0;
    this.isStirring = false;
    this.stirDir = 1; // 1 = CW, -1 = CCW

    // Частицы
    this.bubbles = [];
    this.steam = [];
    this.sparks = [];

    // Привязанные события
    this.boundKeyDown = this.onKeyDown.bind(this);
    this.boundKeyUp = this.onKeyUp.bind(this);
    this.boundResize = this.setupCanvas.bind(this);
  }

  init() {
    this.renderDOM();
    this.setupCanvas();
    this.bindEvents();
    this.loadPotion(this.currentPotionId);
    this.startAnimationLoop();
  }

  setPotion(potionId) {
    if (POTIONS_CATALOG[potionId]) {
      this.currentPotionId = potionId;
      this.loadPotion(potionId);
    }
  }

  renderDOM() {
    this.container.innerHTML = `
      <div class="stage-container alchemy-stage">
        <!-- Шапка с выбором зелья -->
        <div class="stage-header" style="margin-bottom: 12px;">
          <div style="display: flex; align-items: center; justify-content: center; gap: 12px; flex-wrap: wrap;">
            <h2 class="stage-title" style="margin: 0;">🧪 Зельеварение D&D 5e</h2>
            <div class="potion-picker-box">
              <label for="potionSelect" style="font-size: 11px; color: var(--text-muted); margin-right: 6px;">Рецепт:</label>
              <select id="potionSelect" class="potion-select-input">
                <optgroup label="Обычные (Common) — для начинающих">
                  <option value="healing">🍷 Зелье лечения (2d4+2 HP)</option>
                  <option value="climbing">🧗 Зелье лазания (Атлетика)</option>
                  <option value="animal_friendship">🌿 Зелье дружбы с животными (24 часа)</option>
                </optgroup>
                <optgroup label="Необычные (Uncommon) — умеренные">
                  <option value="greater_healing">💖 Большее зелье лечения (4d4+4 HP)</option>
                  <option value="water_breathing">🌊 Зелье дыхания под водой (1 час)</option>
                  <option value="fire_resistance">🛡️ Зелье огнестойкости (Огонь)</option>
                  <option value="hill_giant">🦾 Зелье силы холмового великана (Сила 21)</option>
                  <option value="growth">🍄 Зелье роста (+1d4 к урону, размер)</option>
                </optgroup>
                <optgroup label="Редкие (Rare) — высшее мастерство">
                  <option value="invisibility">👻 Зелье невидимости (1 час)</option>
                  <option value="heroism">👑 Зелье героизма (Благословение + 10 HP)</option>
                  <option value="gaseous_form">🌫️ Зелье газообразной формы (Туман)</option>
                  <option value="invulnerability">🛡️ Зелье неуязвимости (Сопротивление всему)</option>
                </optgroup>
                <optgroup label="Очень редкие (Very Rare) — великие">
                  <option value="speed">⚡ Зелье скорости (Ускорение)</option>
                  <option value="flying">🕊️ Зелье полёта (60 футов)</option>
                  <option value="supreme_healing">🌟 Высшее зелье лечения (10d4+20 HP)</option>
                </optgroup>
                <optgroup label="Легендарные (Legendary) — богоподобные">
                  <option value="storm_giant">⛈️ Зелье силы великана бурь (Сила 29!)</option>
                </optgroup>
              </select>
            </div>
          </div>
          <p class="stage-subtitle" id="potionSubtitleDesc" style="margin-top: 4px;">
            Управляйте нагревом тигля мехами, вовремя добавляйте реагенты и помешивайте варево.
          </p>
        </div>

        <div class="alchemy-layout">
          <!-- Левая панель: Алхимический трактат с шагами -->
          <div class="alchemy-recipe-panel">
            <div class="recipe-header">
              <span class="recipe-icon" id="recipePotionIcon">🍷</span>
              <div style="flex: 1;">
                <h3 class="recipe-title" id="recipePotionTitle">Зелье лечения</h3>
                <span class="recipe-rarity-badge common" id="recipeRarityBadge">Обычное (Common)</span>
              </div>
            </div>

            <div class="potion-effect-card" id="potionEffectCard">
              <span class="effect-label">Эффект в D&D:</span>
              <span class="effect-text" id="potionEffectText">Восстанавливает 2d4 + 2 хитов</span>
            </div>

            <div class="recipe-steps-list" id="recipeStepsList">
              <!-- Шаги рецепта -->
            </div>

            <div class="alchemy-mistakes-counter" id="mistakesCounterBox">
              <span class="mistakes-label">Устойчивость варева:</span>
              <span class="mistakes-value" id="mistakesText">Ошибки: 0 / 3</span>
            </div>
          </div>

          <!-- Центральная арена: Котел, шкала нагрева и управление -->
          <div class="alchemy-cauldron-wrapper">
            <div class="thermometer-hud">
              <div class="thermometer-label-row">
                <span style="font-size: 11px; color: var(--text-muted);">Температура тигля:</span>
                <span class="thermometer-val" id="tempValueDisplay">35°C (Холодный)</span>
              </div>
              <div class="thermometer-track">
                <div class="thermometer-zone" id="tempTargetZone" style="left: 20%; width: 25%;"></div>
                <div class="thermometer-fill" id="tempFillBar" style="width: 12%;"></div>
              </div>
              <div class="thermometer-zones-labels">
                <span>❄️ Холод</span>
                <span>🕯️ Томление</span>
                <span>♨️ Кипение</span>
                <span>💥 Жар</span>
              </div>
            </div>

            <!-- Холст цельного пузатого котла -->
            <canvas id="alchemyCanvas" class="game-canvas" style="border-radius: 10px;"></canvas>

            <!-- Панель инструментов алхимика -->
            <div class="alchemy-actions-toolbar">
              <button type="button" class="btn fantasy-btn primary bellows-btn" id="btnBellows">
                <span>💨</span> Раздувать меха (ПРОБЕЛ)
              </button>

              <div class="stir-btn-group">
                <button type="button" class="btn fantasy-btn secondary stir-btn" id="btnStirCCW" title="Помешать против часовой стрелки (A / ←)">
                  <span>↺</span> Влево
                </button>
                <button type="button" class="btn fantasy-btn secondary stir-btn" id="btnStirCW" title="Помешать по часовой стрелке (D / →)">
                  <span>↻</span> Вправо
                </button>
              </div>
            </div>
          </div>

          <!-- Правая панель: Полка реагентов -->
          <div class="alchemy-shelf-panel">
            <h4 class="shelf-title">🌿 Полка алхимика:</h4>
            <div class="reagents-grid" id="reagentsGrid">
              <!-- Ингредиенты -->
            </div>
          </div>
        </div>

        <!-- Подсказка по управлению -->
        <div class="lock-controls-guide" style="margin-top: 10px;">
          <div class="guide-pill">
            <span class="guide-key">Удерживать Меха / ПРОБЕЛ</span>
            <span>Поднимать температуру пламени</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">Клик по реагенту</span>
            <span>Бросить в кипящий тигель</span>
          </div>
          <div class="guide-pill">
            <span class="guide-key">A / D или ← / →</span>
            <span>Помешивать ложкой</span>
          </div>
        </div>
      </div>
    `;

    this.canvas = this.container.querySelector('#alchemyCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.potionSelect = this.container.querySelector('#potionSelect');
    this.potionSubtitleDesc = this.container.querySelector('#potionSubtitleDesc');
    this.recipePotionIcon = this.container.querySelector('#recipePotionIcon');
    this.recipePotionTitle = this.container.querySelector('#recipePotionTitle');
    this.recipeRarityBadge = this.container.querySelector('#recipeRarityBadge');
    this.potionEffectText = this.container.querySelector('#potionEffectText');
    this.recipeStepsList = this.container.querySelector('#recipeStepsList');
    this.mistakesText = this.container.querySelector('#mistakesText');
    this.tempValueDisplay = this.container.querySelector('#tempValueDisplay');
    this.tempFillBar = this.container.querySelector('#tempFillBar');
    this.tempTargetZone = this.container.querySelector('#tempTargetZone');
    this.reagentsGrid = this.container.querySelector('#reagentsGrid');
    this.btnBellows = this.container.querySelector('#btnBellows');
    this.btnStirCW = this.container.querySelector('#btnStirCW');
    this.btnStirCCW = this.container.querySelector('#btnStirCCW');
  }

  setupCanvas() {
    if (!this.canvas) return;
    const width = Math.min(420, Math.min(window.innerWidth - 48, 420));
    const height = 280;
    const dpr = (typeof window !== 'undefined' && window.devicePixelRatio) || 1;

    this.canvas.width = width * dpr;
    this.canvas.height = height * dpr;
    this.canvas.style.width = `${width}px`;
    this.canvas.style.height = `${height}px`;

    this.ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ctx.scale(dpr, dpr);
    this.logicalWidth = width;
    this.logicalHeight = height;
  }

  bindEvents() {
    window.addEventListener('resize', this.boundResize);
    window.addEventListener('keydown', this.boundKeyDown);
    window.addEventListener('keyup', this.boundKeyUp);

    if (this.potionSelect) {
      this.potionSelect.addEventListener('change', (e) => {
        this.setPotion(e.target.value);
      });
    }

    const startBellows = (e) => {
      e.preventDefault();
      this.startPumping();
    };
    const stopBellows = (e) => {
      e.preventDefault();
      this.stopPumping();
    };

    if (this.btnBellows) {
      this.btnBellows.addEventListener('mousedown', startBellows);
      this.btnBellows.addEventListener('mouseup', stopBellows);
      this.btnBellows.addEventListener('mouseleave', stopBellows);
      this.btnBellows.addEventListener('touchstart', startBellows, { passive: false });
      this.btnBellows.addEventListener('touchend', stopBellows);
    }

    if (this.btnStirCW) {
      this.btnStirCW.addEventListener('click', () => this.performStir('cw'));
    }
    if (this.btnStirCCW) {
      this.btnStirCCW.addEventListener('click', () => this.performStir('ccw'));
    }
  }

  loadPotion(potionId) {
    const p = POTIONS_CATALOG[potionId] || POTIONS_CATALOG.healing;
    this.potion = p;
    this.currentPotionId = p.id;
    this.isBrewed = false;
    this.isRuined = false;
    this.mistakesCount = 0;
    this.temperature = 35;
    this.currentStepIndex = 0;
    this.heatHoldTimer = 0;
    this.currentLiquidColor = p.baseLiquidColor;
    this.targetLiquidColor = p.liquidColor;
    this.bubbles = [];
    this.steam = [];
    this.sparks = [];

    // Копируем шаги рецепта
    this.steps = p.steps.map((st, i) => ({ ...st, index: i, completed: false }));

    // Обновляем шапку
    if (this.potionSelect) this.potionSelect.value = p.id;
    if (this.potionSubtitleDesc) this.potionSubtitleDesc.textContent = p.desc;
    if (this.recipePotionIcon) this.recipePotionIcon.textContent = p.icon;
    if (this.recipePotionTitle) this.recipePotionTitle.textContent = p.name;
    if (this.recipeRarityBadge) {
      this.recipeRarityBadge.textContent = p.rarity;
      this.recipeRarityBadge.className = `recipe-rarity-badge ${p.rarityClass}`;
    }
    if (this.potionEffectText) this.potionEffectText.textContent = p.effect;

    // Собираем ингредиенты для полки
    this.setupShelfForPotion(p);
    this.renderRecipeSteps();
    this.updateTargetZoneHUD();
    this.updateMistakesHUD();
  }

  setupShelfForPotion(potion) {
    if (!this.reagentsGrid) return;
    // Находим все нужные реагенты для этого рецепта
    const neededIds = new Set();
    potion.steps.forEach(st => {
      if (st.type === 'reagent' && st.reagentId) {
        neededIds.add(st.reagentId);
      }
    });

    // Добавляем 2-3 ложных реагента из общего пула для выбора
    const otherKeys = Object.keys(ALL_REAGENTS).filter(k => !neededIds.has(k)).sort(() => Math.random() - 0.5);
    const decoys = otherKeys.slice(0, 2);

    const shelfList = [...Array.from(neededIds), ...decoys]
      .map(id => ALL_REAGENTS[id])
      .filter(Boolean)
      .sort(() => Math.random() - 0.5);

    this.reagentsGrid.innerHTML = shelfList.map(r => `
      <button type="button" class="reagent-btn" data-reagent="${r.id}">
        <span class="reagent-icon">${r.icon}</span>
        <span class="reagent-name">${r.name}</span>
      </button>
    `).join('');

    this.reagentsGrid.querySelectorAll('.reagent-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.reagent;
        this.addReagentToCauldron(id);
      });
    });
  }

  renderRecipeSteps() {
    if (!this.recipeStepsList) return;
    this.recipeStepsList.innerHTML = this.steps.map((step, idx) => {
      const isActive = idx === this.currentStepIndex;
      const isDone = step.completed;
      let badge = `${idx + 1}`;
      if (isDone) badge = '✓';

      return `
        <div class="recipe-step-item ${isActive ? 'active' : ''} ${isDone ? 'completed' : ''}" id="recipe-step-${idx}">
          <span class="step-num ${isDone ? 'done' : ''}">${badge}</span>
          <div class="step-desc">
            <p class="step-action">${step.text}</p>
          </div>
        </div>
      `;
    }).join('');
  }

  updateMistakesHUD() {
    if (!this.mistakesText) return;
    const max = this.potion.allowedMistakes;
    this.mistakesText.textContent = `Ошибки: ${this.mistakesCount} / ${max}`;
    this.mistakesText.style.color = this.mistakesCount === 0 ? '#10b981' : this.mistakesCount >= max ? '#ef4444' : '#f59e0b';
  }

  updateTargetZoneHUD() {
    const current = this.steps[this.currentStepIndex];
    if (!current || !this.tempTargetZone) return;

    let minT = 0;
    let maxT = 300;

    if (current.type === 'heat') {
      minT = current.minT;
      maxT = current.maxT;
    } else if (current.type === 'reagent') {
      minT = current.tempMin;
      maxT = current.tempMax;
    } else {
      // Для помешивания температура не критична, подсвечиваем рабочий диапазон
      minT = 40;
      maxT = 240;
    }

    const leftPercent = (minT / 300) * 100;
    const widthPercent = ((maxT - minT) / 300) * 100;
    this.tempTargetZone.style.left = `${leftPercent}%`;
    this.tempTargetZone.style.width = `${widthPercent}%`;
  }

  startPumping() {
    if (this.isBrewed || this.isRuined) return;
    if (!this.isBellowsPumping) {
      this.isBellowsPumping = true;
      if (this.btnBellows) this.btnBellows.classList.add('active');
      audio.playBellowsPuff();
    }
  }

  stopPumping() {
    this.isBellowsPumping = false;
    if (this.btnBellows) this.btnBellows.classList.remove('active');
  }

  performStir(direction) {
    if (this.isBrewed || this.isRuined) return;
    this.isStirring = true;
    this.stirDir = direction === 'cw' ? 1 : -1;
    audio.playCauldronBubble();

    // Создаем вихревые брызги
    this.spawnStirSplash();

    const currentStep = this.steps[this.currentStepIndex];
    if (currentStep && currentStep.type === 'stir') {
      if (currentStep.dir === direction) {
        // Успешный взмах ложки в правильную сторону!
        this.stirProgress = (this.stirProgress || 0) + 1;
        if (this.stirProgress >= currentStep.count) {
          this.advanceStepSuccess();
          this.stirProgress = 0;
        }
      } else {
        // Не та сторона вращения
        this.registerMistake('Размешивание в неверную сторону испортило вихрь!');
      }
    }
  }

  onKeyDown(e) {
    if (['INPUT', 'SELECT', 'TEXTAREA'].includes(e.target?.tagName)) return;
    if (e.code === 'Space') {
      this.startPumping();
      e.preventDefault();
    } else if (e.code === 'KeyD' || e.code === 'ArrowRight') {
      this.performStir('cw');
      e.preventDefault();
    } else if (e.code === 'KeyA' || e.code === 'ArrowLeft') {
      this.performStir('ccw');
      e.preventDefault();
    }
  }

  onKeyUp(e) {
    if (e.code === 'Space') {
      this.stopPumping();
      e.preventDefault();
    }
  }

  addReagentToCauldron(reagentId) {
    if (this.isBrewed || this.isRuined) return;
    const currentStep = this.steps[this.currentStepIndex];
    if (!currentStep) return;

    if (currentStep.type !== 'reagent') {
      this.registerMistake('Тигель ещё не готов к добавлению реагента!');
      return;
    }

    const isCorrect = currentStep.reagentId === reagentId;
    const isTempOk = this.temperature >= currentStep.tempMin && this.temperature <= currentStep.tempMax;

    if (isCorrect && isTempOk) {
      // Идеально!
      const reagent = ALL_REAGENTS[reagentId];
      audio.playCauldronBubble();
      audio.playMagicChime(1.2);
      this.spawnIngredientSplash(reagent ? reagent.color : '#e0e7ff');

      // Плавно смещаем цвет жидкости к целевому цвету зелья
      this.advanceStepSuccess();
    } else if (!isCorrect) {
      this.registerMistake('Добавлен не тот реагент по рецепту!');
    } else {
      if (this.temperature < currentStep.tempMin) {
        this.registerMistake('Тигель слишком холодный: реагент не растворился!');
      } else {
        this.registerMistake('Тигель перегрет: ценный реагент сгорел в пепел!');
      }
    }
  }

  advanceStepSuccess() {
    const currentStep = this.steps[this.currentStepIndex];
    if (currentStep) currentStep.completed = true;

    this.currentStepIndex++;
    this.renderRecipeSteps();

    if (this.currentStepIndex >= this.steps.length) {
      this.triggerBrewSuccess();
    } else {
      this.updateTargetZoneHUD();
    }
  }

  registerMistake(reason) {
    this.mistakesCount++;
    this.updateMistakesHUD();

    audio.playSteamHiss(0.5);
    audio.playExplosion();
    this.spawnFoulSmoke();

    this.app.recordMistake();
    this.app.addNoise(25);

    if (this.mistakesCount >= this.potion.allowedMistakes) {
      this.triggerBrewRuined();
    }
  }

  triggerBrewSuccess() {
    if (this.isBrewed) return;
    this.isBrewed = true;
    audio.playSuccess();
    audio.playResonanceSurge();

    // Салют алхимических искр
    this.spawnVictorySparks();

    const timeSpent = Math.max(2, Math.round((performance.now() - (this.startTime || performance.now())) / 1000));
    setTimeout(() => {
      this.app.finishGame(true, {
        potionName: this.potion.name,
        effect: this.potion.effect,
        mistakes: this.mistakesCount,
        timeSpent
      });
    }, 1400);
  }

  triggerBrewRuined() {
    if (this.isRuined) return;
    this.isRuined = true;
    audio.playFailure();

    setTimeout(() => {
      this.app.finishGame(false, {
        reason: 'spoiled_brew',
        mistakes: this.mistakesCount
      });
    }, 1000);
  }

  destroy() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    window.removeEventListener('resize', this.boundResize);
    window.removeEventListener('keydown', this.boundKeyDown);
    window.removeEventListener('keyup', this.boundKeyUp);
  }

  // =========================================================================
  // --- АНИМАЦИОННЫЙ ЦИКЛ И ФИЗИКА ---
  // =========================================================================
  startAnimationLoop() {
    let lastTime = performance.now();
    const loop = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;

      this.update(dt);
      this.draw();

      this.animationFrameId = requestAnimationFrame(loop);
    };
    this.animationFrameId = requestAnimationFrame(loop);
  }

  update(dt) {
    if (!this.isBrewed && !this.isRuined) {
      // 1. Физика температуры тигля
      if (this.isBellowsPumping) {
        this.temperature = Math.min(300, this.temperature + dt * 55);
      } else {
        // Естественное остывание к комнатной температуре 22°C
        this.temperature = Math.max(22, this.temperature - dt * 14);
      }

      // 2. Проверка шагов удержания температуры (type: 'heat')
      const currentStep = this.steps[this.currentStepIndex];
      if (currentStep && currentStep.type === 'heat') {
        const inRange = this.temperature >= currentStep.minT && this.temperature <= currentStep.maxT;
        if (inRange) {
          this.heatHoldTimer = (this.heatHoldTimer || 0) + dt;
          if (this.heatHoldTimer >= 1.2) {
            this.heatHoldTimer = 0;
            audio.playMagicChime(1.1);
            this.advanceStepSuccess();
          }
        } else {
          this.heatHoldTimer = Math.max(0, (this.heatHoldTimer || 0) - dt * 0.5);
        }
      }
    }

    // 3. Обновление термометра в HUD
    if (this.tempFillBar && this.tempValueDisplay) {
      const rounded = Math.round(this.temperature);
      this.tempFillBar.style.width = `${(rounded / 300) * 100}%`;

      let status = '❄️ Холодный';
      if (rounded >= 210) status = '💥 Бурный жар';
      else if (rounded >= 140) status = '♨️ Кипение';
      else if (rounded >= 65) status = '🕯️ Томление';

      this.tempValueDisplay.textContent = `${rounded}°C (${status})`;
      this.tempFillBar.style.background = rounded > 220 ? '#ef4444' : rounded > 130 ? '#22c55e' : '#3b82f6';
    }

    // 4. Вращение ложки при помешивании
    if (this.isStirring) {
      this.stirAngle += dt * 8 * this.stirDir;
      if (Math.abs(this.stirAngle) > Math.PI * 4) {
        this.isStirring = false;
        this.stirAngle = 0;
      }
    }

    // 5. Генерация пузырей при нагреве
    if (this.temperature > 70 && Math.random() < (this.temperature / 300) * 0.45) {
      this.spawnBubble();
    }

    // 6. Генерация пара
    if (this.temperature > 90 && Math.random() < 0.25) {
      this.spawnSteamParticle();
    }

    // 7. Обновление частиц
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const b = this.bubbles[i];
      b.y -= b.vy * dt;
      b.life -= dt * 1.2;
      if (b.life <= 0) this.bubbles.splice(i, 1);
    }

    for (let i = this.steam.length - 1; i >= 0; i--) {
      const s = this.steam[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.life -= dt * 0.8;
      if (s.life <= 0) this.steam.splice(i, 1);
    }

    for (let i = this.sparks.length - 1; i >= 0; i--) {
      const sp = this.sparks[i];
      sp.x += sp.vx * dt;
      sp.y += sp.vy * dt;
      sp.life -= dt * 1.5;
      if (sp.life <= 0) this.sparks.splice(i, 1);
    }
  }

  spawnBubble() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const rimY = this.logicalHeight * 0.44;
    this.bubbles.push({
      x: cx + (Math.random() - 0.5) * 130,
      y: rimY + 8 + (Math.random() - 0.5) * 16,
      vy: 15 + (this.temperature / 10),
      size: 2.5 + Math.random() * 5,
      life: 1
    });
  }

  spawnSteamParticle() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const rimY = this.logicalHeight * 0.44;
    this.steam.push({
      x: cx + (Math.random() - 0.5) * 110,
      y: rimY - 4,
      vx: (Math.random() - 0.5) * 20,
      vy: -25 - Math.random() * 35,
      size: 10 + Math.random() * 16,
      color: this.potion.liquidColor,
      life: 1
    });
  }

  spawnIngredientSplash(color) {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const rimY = this.logicalHeight * 0.44;
    for (let i = 0; i < 28; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 40 + Math.random() * 110;
      this.sparks.push({
        x: cx,
        y: rimY,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 40,
        color,
        size: 3 + Math.random() * 4,
        life: 1
      });
    }
  }

  spawnStirSplash() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const rimY = this.logicalHeight * 0.44;
    for (let i = 0; i < 14; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 20 + Math.random() * 60;
      this.sparks.push({
        x: cx + Math.cos(a) * 40,
        y: rimY + Math.sin(a) * 12,
        vx: Math.cos(a + Math.PI / 2 * this.stirDir) * speed,
        vy: -15 - Math.random() * 25,
        color: '#ffffff',
        size: 2 + Math.random() * 3,
        life: 0.8
      });
    }
  }

  spawnFoulSmoke() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const rimY = this.logicalHeight * 0.44;
    for (let i = 0; i < 25; i++) {
      this.steam.push({
        x: cx + (Math.random() - 0.5) * 60,
        y: rimY,
        vx: (Math.random() - 0.5) * 45,
        vy: -40 - Math.random() * 50,
        size: 18 + Math.random() * 24,
        color: 'rgba(30, 30, 35, 0.85)',
        life: 1.2
      });
    }
  }

  spawnVictorySparks() {
    if (!this.logicalWidth || !this.logicalHeight) return;
    const cx = this.logicalWidth / 2;
    const rimY = this.logicalHeight * 0.44;
    for (let i = 0; i < 60; i++) {
      const a = Math.random() * Math.PI * 2;
      const speed = 50 + Math.random() * 150;
      this.sparks.push({
        x: cx,
        y: rimY,
        vx: Math.cos(a) * speed,
        vy: Math.sin(a) * speed - 60,
        color: i % 2 === 0 ? '#fbbf24' : this.potion.liquidColor,
        size: 3 + Math.random() * 5,
        life: 1.5
      });
    }
  }

  // =========================================================================
  // --- ОТРИСОВКА АЛХИМИЧЕСКОГО КОТЛА (CANVAS 2D) ---
  // =========================================================================
  draw() {
    if (!this.ctx || !this.logicalWidth) return;
    const ctx = this.ctx;
    const w = this.logicalWidth;
    const h = this.logicalHeight;
    const cx = w / 2;

    ctx.save();
    ctx.clearRect(0, 0, w, h);

    // 1. Алхимический фон
    this.drawBackground(ctx, w, h);

    // 2. Жаровня и пламя под котлом
    this.drawFireBrazier(ctx, cx, h);

    // 3. Монолитный пузатый чугунный котел
    this.drawSolidCauldron(ctx, cx, h);

    // 4. Зеркало кипящего зелья с воронкой
    this.drawLiquidSurface(ctx, cx, h);

    // 5. Ложка-половник
    this.drawLadle(ctx, cx, h);

    // 6. Пар, пузыри и искры
    this.drawParticles(ctx);

    // 7. Сваренное зелье во флаконе при победе
    if (this.isBrewed) {
      this.drawCompletedPotionFlask(ctx, cx, h);
    }

    ctx.restore();
  }

  drawBackground(ctx, w, h) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0f1118');
    bgGrad.addColorStop(0.6, '#0b0d13');
    bgGrad.addColorStop(1, '#05070a');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Лёгкая арканная сетка
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    for (let x = 20; x < w; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
  }

  drawFireBrazier(ctx, cx, h) {
    const brazierY = h * 0.88;
    const flameRatio = Math.min(1, Math.max(0.1, (this.temperature - 20) / 260));

    // Кованая подставка жаровни
    ctx.save();
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(cx - 90, brazierY + 18);
    ctx.lineTo(cx - 50, brazierY + 2);
    ctx.lineTo(cx + 50, brazierY + 2);
    ctx.lineTo(cx + 90, brazierY + 18);
    ctx.stroke();

    // Горящие угли
    const coalGrad = ctx.createRadialGradient(cx, brazierY, 10, cx, brazierY, 60);
    coalGrad.addColorStop(0, '#ffedd5');
    coalGrad.addColorStop(0.3, '#ea580c');
    coalGrad.addColorStop(0.8, '#7c2d12');
    coalGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coalGrad;
    ctx.beginPath();
    ctx.ellipse(cx, brazierY, 65, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    // Языки пламени
    const flameHeight = 16 + flameRatio * 52;
    const flameGrad = ctx.createRadialGradient(cx, brazierY - flameHeight * 0.3, 4, cx, brazierY - 10, flameHeight);
    flameGrad.addColorStop(0, '#ffffff');
    flameGrad.addColorStop(0.2, '#fde047');
    flameGrad.addColorStop(0.5, '#ea580c');
    flameGrad.addColorStop(0.9, '#dc2626');
    flameGrad.addColorStop(1, 'transparent');

    ctx.shadowColor = '#ea580c';
    ctx.shadowBlur = 10 + flameRatio * 25;
    ctx.fillStyle = flameGrad;

    ctx.beginPath();
    ctx.ellipse(cx, brazierY - flameHeight * 0.35, 55 + flameRatio * 15, flameHeight, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  drawSolidCauldron(ctx, cx, h) {
    const rimY = h * 0.44;
    const rimRadiusX = 105;
    const rimRadiusY = 25;
    const bottomY = rimY + 105;

    ctx.save();

    // 1. Монолитное пузатое чугунное тело котла (без дыр!)
    const ironGrad = ctx.createRadialGradient(cx - 35, rimY + 45, 15, cx, rimY + 50, 115);
    ironGrad.addColorStop(0, '#475569');
    ironGrad.addColorStop(0.4, '#1e293b');
    ironGrad.addColorStop(0.85, '#0f172a');
    ironGrad.addColorStop(1, '#020617');

    ctx.fillStyle = ironGrad;
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3.5;

    ctx.beginPath();
    // Старт от левой точки горловины
    ctx.moveTo(cx - rimRadiusX, rimY);
    // Пузатый левый бок котла
    ctx.bezierCurveTo(
      cx - rimRadiusX - 16, rimY + 45,
      cx - 65, bottomY,
      cx, bottomY
    );
    // Пузатый правый бок котла
    ctx.bezierCurveTo(
      cx + 65, bottomY,
      cx + rimRadiusX + 16, rimY + 45,
      cx + rimRadiusX, rimY
    );
    // Замыкаем по нижней половине обода
    ctx.ellipse(cx, rimY, rimRadiusX, rimRadiusY, 0, 0, Math.PI);
    ctx.fill();
    ctx.stroke();

    // 2. Литые боковые ручки-кольца котла
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 4;
    [-1, 1].forEach(side => {
      ctx.beginPath();
      ctx.arc(cx + side * (rimRadiusX + 8), rimY + 32, 14, 0, Math.PI * 2);
      ctx.stroke();
    });

    // 3. Толстый кованый обод горловины
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.ellipse(cx, rimY, rimRadiusX, rimRadiusY, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = 'rgba(212, 175, 55, 0.75)'; // Латунная окантовка обода
    ctx.lineWidth = 2.8;
    ctx.stroke();

    ctx.restore();
  }

  drawLiquidSurface(ctx, cx, h) {
    const rimY = h * 0.44;
    const surfRadiusX = 96;
    const surfRadiusY = 21;
    const surfY = rimY + 3;

    ctx.save();

    // Клиппинг по эллипсу зеркала
    ctx.beginPath();
    ctx.ellipse(cx, surfY, surfRadiusX, surfRadiusY, 0, 0, Math.PI * 2);
    ctx.clip();

    // Глубокий светящийся градиент зелья
    const liqGrad = ctx.createRadialGradient(cx, surfY, 5, cx, surfY, surfRadiusX);
    liqGrad.addColorStop(0, '#ffffff');
    liqGrad.addColorStop(0.25, this.potion.liquidColor);
    liqGrad.addColorStop(0.85, this.darkenColor(this.potion.liquidColor, 0.4));
    liqGrad.addColorStop(1, '#020617');

    ctx.fillStyle = liqGrad;
    ctx.fillRect(cx - surfRadiusX, surfY - surfRadiusY, surfRadiusX * 2, surfRadiusY * 2);

    // Воронка при помешивании
    if (this.isStirring) {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
      ctx.lineWidth = 2;
      for (let r = 12; r < surfRadiusX - 10; r += 16) {
        ctx.beginPath();
        ctx.ellipse(cx, surfY, r, r * 0.22, this.stirAngle, 0, Math.PI * 1.5);
        ctx.stroke();
      }
    }

    // Блик света на поверхности
    ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
    ctx.beginPath();
    ctx.ellipse(cx - 25, surfY - 5, 45, 6, -0.1, 0, Math.PI * 2);
    ctx.fill();

    // Пузырьки кипения на поверхности
    this.bubbles.forEach(b => {
      ctx.fillStyle = 'rgba(255, 255, 255, 0.65)';
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
    });

    ctx.restore();
  }

  drawLadle(ctx, cx, h) {
    const rimY = h * 0.44;
    ctx.save();

    const ladleAngle = this.isStirring ? Math.sin(this.stirAngle) * 0.25 : -0.28;
    const ladleX = cx + (this.isStirring ? Math.cos(this.stirAngle) * 35 : 30);
    const ladleY = rimY + 5 + (this.isStirring ? Math.sin(this.stirAngle) * 8 : 0);

    ctx.translate(ladleX, ladleY);
    ctx.rotate(ladleAngle);

    // Деревянная ручка
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(35, -75);
    ctx.stroke();

    // Черпак половника
    ctx.fillStyle = '#92400e';
    ctx.strokeStyle = '#451a03';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(0, 0, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  drawParticles(ctx) {
    // Пар
    this.steam.forEach(s => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, s.life * 0.45);
      ctx.fillStyle = s.color || '#ffffff';
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Искры
    this.sparks.forEach(sp => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, sp.life);
      ctx.fillStyle = sp.color;
      ctx.shadowColor = sp.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(sp.x, sp.y, sp.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });
  }

  drawCompletedPotionFlask(ctx, cx, h) {
    const flaskY = h * 0.44 - 15;
    ctx.save();

    // Сияющий ореол
    const glowGrad = ctx.createRadialGradient(cx, flaskY, 5, cx, flaskY, 70);
    glowGrad.addColorStop(0, this.potion.liquidColor);
    glowGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(cx, flaskY, 70, 0, Math.PI * 2);
    ctx.fill();

    // Стеклянная D&D колба
    ctx.fillStyle = this.potion.liquidColor;
    ctx.shadowColor = this.potion.liquidColor;
    ctx.shadowBlur = 25;

    // Шарообразная колба
    ctx.beginPath();
    ctx.arc(cx, flaskY + 12, 24, 0, Math.PI * 2);
    ctx.fill();

    // Горлышко
    ctx.fillRect(cx - 6, flaskY - 20, 12, 16);

    // Пробка
    ctx.fillStyle = '#78350f';
    ctx.fillRect(cx - 7, flaskY - 25, 14, 6);

    // Блик стекла
    ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
    ctx.beginPath();
    ctx.arc(cx - 8, flaskY + 6, 8, 0, Math.PI * 2);
    ctx.fill();

    // Текст готово
    ctx.font = 'bold 14px "Segoe UI", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#000000';
    ctx.shadowBlur = 6;
    ctx.fillText('✨ Зелье сварено!', cx, flaskY + 54);

    ctx.restore();
  }

  darkenColor(hex, factor) {
    if (!hex.startsWith('#')) return '#0f172a';
    const num = parseInt(hex.slice(1), 16);
    const r = Math.floor(((num >> 16) & 255) * factor);
    const g = Math.floor(((num >> 8) & 255) * factor);
    const b = Math.floor((num & 255) * factor);
    return `rgb(${r}, ${g}, ${b})`;
  }
}
