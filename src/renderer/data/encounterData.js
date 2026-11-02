// База данных для Генератора боевых столкновений (Encounter Builder) D&D 5e

export const BIOMES = [
  { id: 'any', label: 'Любая местность' },
  { id: 'forest', label: 'Дремучий лес' },
  { id: 'dungeon', label: 'Подземелье и катакомбы' },
  { id: 'urban', label: 'Город и подворотни' },
  { id: 'swamp', label: 'Гиблое болото' },
  { id: 'mountain', label: 'Горы и перевалы' },
  { id: 'ruins', label: 'Древние руины' }
];

// Таблица порогов опыта (XP Thresholds by Character Level) из DMG 5e
export const XP_THRESHOLDS = {
  1:  { easy: 25,   medium: 50,   hard: 75,   deadly: 100 },
  2:  { easy: 50,   medium: 100,  hard: 150,  deadly: 200 },
  3:  { easy: 75,   medium: 150,  hard: 225,  deadly: 400 },
  4:  { easy: 125,  medium: 250,  hard: 375,  deadly: 500 },
  5:  { easy: 250,  medium: 500,  hard: 750,  deadly: 1100 },
  6:  { easy: 300,  medium: 600,  hard: 900,  deadly: 1400 },
  7:  { easy: 350,  medium: 750,  hard: 1100, deadly: 1700 },
  8:  { easy: 450,  medium: 900,  hard: 1400, deadly: 2100 },
  9:  { easy: 550,  medium: 1100, hard: 1600, deadly: 2400 },
  10: { easy: 600,  medium: 1200, hard: 1900, deadly: 2800 },
  11: { easy: 800,  medium: 1600, hard: 2400, deadly: 3600 },
  12: { easy: 1000, medium: 2000, hard: 3000, deadly: 4500 },
  13: { easy: 1100, medium: 2200, hard: 3400, deadly: 5100 },
  14: { easy: 1250, medium: 2500, hard: 3800, deadly: 5700 },
  15: { easy: 1400, medium: 2800, hard: 4300, deadly: 6400 },
  16: { easy: 1600, medium: 3200, hard: 4800, deadly: 7200 },
  17: { easy: 2000, medium: 3900, hard: 5900, deadly: 8800 },
  18: { easy: 2100, medium: 4200, hard: 6300, deadly: 9500 },
  19: { easy: 2400, medium: 4900, hard: 7300, deadly: 10900 },
  20: { easy: 2800, medium: 5700, hard: 8500, deadly: 12700 }
};

export const MONSTERS_BY_BIOME = {
  forest: [
    { name: 'Гоблин-лучник', cr: '1/4', xp: 50, ac: 15, hp: 7, role: 'Застрельщик' },
    { name: 'Волк', cr: '1/4', xp: 50, ac: 13, hp: 11, role: 'Стайный зверь' },
    { name: 'Лютый волк', cr: '1', xp: 200, ac: 14, hp: 37, role: 'Вожак стаи' },
    { name: 'Медвежатник (Багбир)', cr: '1', xp: 200, ac: 16, hp: 27, role: 'Громила' },
    { name: 'Лесной тролль', cr: '5', xp: 1800, ac: 15, hp: 84, role: 'Опасный регенератор' },
    { name: 'Овитый лозами кустарник', cr: '1/2', xp: 100, ac: 13, hp: 26, role: 'Живая ловушка' }
  ],
  dungeon: [
    { name: 'Скелет-воин', cr: '1/4', xp: 50, ac: 13, hp: 13, role: 'Миньон' },
    { name: 'Зомби', cr: '1/4', xp: 50, ac: 8, hp: 22, role: 'Живой щит' },
    { name: 'Вурдалак (Гуль)', cr: '1', xp: 200, ac: 12, hp: 22, role: 'Парализатор' },
    { name: 'Культист-фанатик', cr: '2', xp: 450, ac: 13, hp: 33, role: 'Заклинатель' },
    { name: 'Минотавр-страж', cr: '3', xp: 700, ac: 14, hp: 76, role: 'Элитный громила' },
    { name: 'Слизь охряная', cr: '2', xp: 450, ac: 8, hp: 45, role: 'Разрушитель доспехов' }
  ],
  urban: [
    { name: 'Головорез банды', cr: '1/2', xp: 100, ac: 12, hp: 32, role: 'Зачинщик' },
    { name: 'Бандит-налётчик', cr: '1/8', xp: 25, ac: 12, hp: 11, role: 'Шестёрка' },
    { name: 'Наёмный убийца (Ассасин)', cr: '8', xp: 3900, ac: 15, hp: 78, role: 'Скрытный киллер' },
    { name: 'Шпион гильдии', cr: '1', xp: 200, ac: 12, hp: 27, role: 'Диверсант' },
    { name: 'Орк-гладиатор', cr: '2', xp: 450, ac: 16, hp: 58, role: 'Тяжелый боец' },
    { name: 'Бойцовский мастиф', cr: '1/8', xp: 25, ac: 12, hp: 5, role: 'Ищейка' }
  ],
  swamp: [
    { name: 'Булливуг-копейщик', cr: '1/4', xp: 50, ac: 15, hp: 11, role: 'Земноводный пехотинец' },
    { name: 'Гигантская ядовитая змея', cr: '1/4', xp: 50, ac: 14, hp: 11, role: 'Скрытный охотник' },
    { name: 'Болотная карга', cr: '3', xp: 700, ac: 17, hp: 82, role: 'Колдунья иллюзий' },
    { name: 'Трупный червь', cr: '2', xp: 450, ac: 13, hp: 51, role: 'Парализующий хищник' },
    { name: 'Гигантский крокодил', cr: '5', xp: 1800, ac: 14, hp: 85, role: 'Водный титан' }
  ],
  mountain: [
    { name: 'Огр-камнеметатель', cr: '2', xp: 450, ac: 11, hp: 59, role: 'Дальнобойный гигант' },
    { name: 'Гарпия', cr: '1', xp: 200, ac: 11, hp: 38, role: 'Летун-очарователь' },
    { name: 'Мантикора', cr: '3', xp: 700, ac: 14, hp: 68, role: 'Шипохвостый ужас' },
    { name: 'Горный козёл-людоед', cr: '1/2', xp: 100, ac: 12, hp: 19, role: 'Таранщик' },
    { name: 'Горный великан (Хилл джайент)', cr: '5', xp: 1800, ac: 13, hp: 105, role: 'Крушитель' }
  ],
  ruins: [
    { name: 'Анимированный доспех', cr: '1', xp: 200, ac: 18, hp: 33, role: 'Стальной страж' },
    { name: 'Горгулья', cr: '2', xp: 450, ac: 15, hp: 52, role: 'Каменная засада' },
    { name: 'Призрак (Спектр)', cr: '1', xp: 200, ac: 12, hp: 22, role: 'Бесплотный пожиратель' },
    { name: 'Теневой дух', cr: '1/2', xp: 100, ac: 12, hp: 16, role: 'Похититель силы' },
    { name: 'Каменный голем', cr: '10', xp: 5900, ac: 17, hp: 178, role: 'Древний монолит' }
  ]
};

export const TACTICAL_COMPLICATIONS = [
  'Густой туман или дым: все существа далее 15 футов считаются сильно замаскированными (помеха на атаки).',
  'Неустойчивая опора (зыбучий песок, скользкие камни): при быстром беге проверка Ловкости Сл 12 или падение плашмя.',
  'Узкое дефиле / подвесной мост: одновременно в ряд могут сражаться не более 2 бойцов с каждой стороны.',
  'Ядовитые испарения / пыльца: в начале каждого раунда спасбросок Телосложения Сл 11 против отравления.',
  'Падающие обломки / камнепад: на счет инициативы 20 случайный сектор арены осыпается щебнем (2d6 дробящего урона, Сл 13 Ловкости).',
  'Ограниченная видимость: источники света привлекают внимание врагов с удвоенной дистанции.'
];

export const ENEMY_TACTICS = [
  'Атакуют из внезапной засады, фокусируя огонь стрелков на магах и лекарях отряда.',
  'Используют окружение: заманивают игроков на узкий мост или под обвал.',
  'Трусливы: если их лидер падает или погибает половина стаи, бросаются в бегство.',
  'Фанатичны до конца: дерутся насмерть, пытаясь утащить за собой хотя бы одного врага.',
  'Пытаются захватить пленников для ритуала или выкупа, используя оглушающие удары.'
];

export function calculateEncounterDifficulty(partySize, partyLevel, monsters) {
  const levelData = XP_THRESHOLDS[Math.min(20, Math.max(1, partyLevel))] || XP_THRESHOLDS[1];
  const partyThresholds = {
    easy: levelData.easy * partySize,
    medium: levelData.medium * partySize,
    hard: levelData.hard * partySize,
    deadly: levelData.deadly * partySize
  };

  const rawXP = monsters.reduce((sum, m) => sum + (m.xp * m.count), 0);
  const totalMonsters = monsters.reduce((sum, m) => sum + m.count, 0);

  // Множитель за количество монстров (DMG rules)
  let multiplier = 1;
  if (totalMonsters === 2) multiplier = 1.5;
  else if (totalMonsters >= 3 && totalMonsters <= 6) multiplier = 2;
  else if (totalMonsters >= 7 && totalMonsters <= 10) multiplier = 2.5;
  else if (totalMonsters >= 11 && totalMonsters <= 14) multiplier = 3;
  else if (totalMonsters >= 15) multiplier = 4;

  // Поправка на нестандартный размер группы (< 3 или > 5)
  if (partySize < 3) {
    if (multiplier === 1) multiplier = 1.5;
    else if (multiplier === 1.5) multiplier = 2;
    else if (multiplier === 2) multiplier = 2.5;
    else if (multiplier === 2.5) multiplier = 3;
    else multiplier = 4;
  } else if (partySize >= 6) {
    if (multiplier === 1.5) multiplier = 1;
    else if (multiplier === 2) multiplier = 1.5;
    else if (multiplier === 2.5) multiplier = 2;
    else if (multiplier === 3) multiplier = 2.5;
    else if (multiplier === 4) multiplier = 3;
  }

  const adjustedXP = Math.round(rawXP * multiplier);

  let difficulty = 'Легко';
  let badgeColor = '#22c55e'; // Green
  if (adjustedXP >= partyThresholds.deadly) {
    difficulty = 'Смертельно';
    badgeColor = '#ef4444'; // Red
  } else if (adjustedXP >= partyThresholds.hard) {
    difficulty = 'Опасно';
    badgeColor = '#f97316'; // Orange
  } else if (adjustedXP >= partyThresholds.medium) {
    difficulty = 'Средне';
    badgeColor = '#eab308'; // Yellow
  }

  return {
    rawXP,
    adjustedXP,
    difficulty,
    badgeColor,
    partyThresholds
  };
}

export function generateRandomEncounter(biome = 'any', partySize = 4, partyLevel = 3, targetDiff = 'any') {
  const chosenBiome = biome === 'any'
    ? Object.keys(MONSTERS_BY_BIOME)[Math.floor(Math.random() * Object.keys(MONSTERS_BY_BIOME).length)]
    : biome;

  const pool = MONSTERS_BY_BIOME[chosenBiome] || MONSTERS_BY_BIOME.forest;
  
  // Выбираем 1 лидера/тяжелого врага и 1-2 вспомогательных отряда
  const leaderCandidate = pool[Math.floor(Math.random() * pool.length)];
  const minionCandidate = pool.filter(m => m.name !== leaderCandidate.name)[0] || pool[0];

  let roster = [];
  const leaderCount = 1;
  const minionCount = Math.floor(Math.random() * 3) + 2;

  roster = [
    { ...leaderCandidate, count: leaderCount },
    { ...minionCandidate, count: minionCount }
  ];

  const analysis = calculateEncounterDifficulty(partySize, partyLevel, roster);
  const complication = TACTICAL_COMPLICATIONS[Math.floor(Math.random() * TACTICAL_COMPLICATIONS.length)];
  const tactics = ENEMY_TACTICS[Math.floor(Math.random() * ENEMY_TACTICS.length)];

  const biomeObj = BIOMES.find(b => b.id === chosenBiome);

  return {
    id: `enc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    title: `Засада: ${roster.map(r => `${r.count}x ${r.name}`).join(' и ')}`,
    biome: chosenBiome,
    biomeLabel: biomeObj ? biomeObj.label : 'Дикая местность',
    partySize,
    partyLevel,
    roster,
    complication,
    tactics,
    ...analysis
  };
}
