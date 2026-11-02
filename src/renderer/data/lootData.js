// База данных для Генератора сокровищ и лута (Loot & Hoard Generator) D&D 5e

export const LOOT_TIERS = [
  { id: 'tier1', label: 'Уровень опасности 0–4 (Новички)', cr: 'CR 0–4' },
  { id: 'tier2', label: 'Уровень опасности 5–10 (Герои)', cr: 'CR 5–10' },
  { id: 'tier3', label: 'Уровень опасности 11–16 (Мастера)', cr: 'CR 11–16' },
  { id: 'tier4', label: 'Уровень опасности 17+ (Легенды)', cr: 'CR 17+' }
];

export const LOOT_TYPES = [
  { id: 'hoard', label: 'Сокровищница / Сундук логова' },
  { id: 'individual', label: 'Карманная добыча с врага' }
];

// Самоцветы и предметы искусства по категориям ценности (DMG 5e)
export const GEMS_10GP = [
  'Азурит (матовый синий)', 'Дымчатый кварц (полупрозрачный серый)', 
  'Бирюза (светло-голубая с прожилками)', 'Малахит (полосчатый зеленый)',
  'Обсидиан (блестящий черный скол)', 'Тигровый глаз (золотисто-коричневый перелив)'
];

export const GEMS_50GP = [
  'Хризопраз (яблочно-зеленый)', 'Цитрин (прозрачный лимонно-желтый)',
  'Лунный камень (молочно-белый с голубым сиянием)', 'Яшма (кроваво-красная крапчатая)',
  'Оникс (глубокий непрозрачный черный)', 'Звездчатая роза (нежно-розовый кварц)'
];

export const GEMS_100GP = [
  'Янтарь (золотистый с застывшим древним насекомым)', 'Аметист (насыщенно-фиолетовый кристалл)',
  'Гранат (темно-красный граненый)', 'Нефрит (шелковистый зеленый кабошон)',
  'Жемчужина (круглая с серебристым отливом)', 'Турмалин (двухцветный зелено-розовый)'
];

export const GEMS_500GP = [
  'Александрит (меняет цвет с зеленого на багровый)', 'Аквамарин (бледно-голубой прозрачный)',
  'Черный жемчуг (редкий с радужным сиянием)', 'Синий шпинель (яркий кобальтовый цвет)',
  'Топаз (золотисто-янтарный крупный самородок)'
];

export const ART_OBJECTS_25GP = [
  'Серебряный кубок с гравировкой виноградной лозы',
  'Костяная резная статуэтка крылатого льва',
  'Небольшое зеркало в резной деревянной оправе с золотой фольгой',
  'Шёлковый платок с вышитым родовым гербом золотой нитью',
  'Медная курильница для благовоний с бирюзовыми вставками'
];

export const ART_OBJECTS_250GP = [
  'Золотое ожерелье с мелким рубиновым каплевидным кулоном',
  'Инкрустированная перламутром шкатулка из черного дерева',
  'Серебряный церемониальный кинжал с ножнами из змеиной кожи',
  'Парные золоченые бокалы с эмалевым гербом древнего баронства',
  'Шёлковая мантия с серебряным шитьем и жемчужными пуговицами'
];

export const MAGIC_ITEMS_TIER1 = [
  { name: 'Зелье лечения (2d4+2)', rarity: 'Обычный', desc: 'Алый мерцающий эликсир со вкусом диких ягод.' },
  { name: 'Свиток заклинания 1-го круга', rarity: 'Обычный', desc: 'Пергамент из телячьей кожи с рунической вязью на драконьем.' },
  { name: 'Свиток заклинания 2-го круга', rarity: 'Необычный', desc: 'Плотный свиток в медном футляре, пахнет озоном.' },
  { name: 'Зелье восхождения', rarity: 'Обычный', desc: 'Вязкая серая жижа; дает скорость лазания равную скорости ходьбы на 1 час.' },
  { name: 'Кошель фокусника', rarity: 'Обычный', desc: 'Извлекает маленькие безделушки или издает тихие звуки птиц.' },
  { name: 'Плащ кошачьих шагов', rarity: 'Необычный', desc: 'Тёмно-серый плащ, шаги владельца не издают ни звука.' }
];

export const MAGIC_ITEMS_TIER2 = [
  { name: 'Большое зелье лечения (4d4+4)', rarity: 'Необычный', desc: 'Ярко-рубиновое густое зелье с золотыми искрами.' },
  { name: 'Оружие +1 (по выбору Мастера)', rarity: 'Необычный', desc: 'Идеально сбалансированная сталь, не тупится и слегка светится в темноте.' },
  { name: 'Щит +1', rarity: 'Необычный', desc: 'Кованый щит с барельефом рычащего дракона.' },
  { name: 'Кольцо защиты (+1 к КД и спасброскам)', rarity: 'Редкий', desc: 'Платиновое кольцо с гравировкой защитных глифов.' },
  { name: 'Сапоги скрытности (Boots of Elvenkind)', rarity: 'Необычный', desc: 'Мягкая оленья кожа; шаги абсолютно бесшумны, преимущество на Скрытность.' },
  { name: 'Жезл волшебных стрел', rarity: 'Необычный', desc: 'Тисовый жезл с 7 зарядами волшебных стрел.' }
];

export function generateRandomLoot(tier = 'tier1', type = 'hoard') {
  let coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
  let gemsAndArt = [];
  let magicItems = [];

  const pickRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const rollDice = (count, sides) => {
    let sum = 0;
    for (let i = 0; i < count; i++) sum += Math.floor(Math.random() * sides) + 1;
    return sum;
  };

  if (type === 'individual') {
    // Карманная добыча
    if (tier === 'tier1') {
      coins.cp = rollDice(3, 6) * 10;
      coins.sp = rollDice(1, 6) * 5;
      coins.gp = rollDice(1, 6) * 2;
    } else if (tier === 'tier2') {
      coins.sp = rollDice(4, 6) * 10;
      coins.gp = rollDice(2, 6) * 10;
      coins.pp = rollDice(1, 4);
    } else if (tier === 'tier3') {
      coins.gp = rollDice(4, 6) * 50;
      coins.pp = rollDice(2, 6) * 10;
    } else {
      coins.gp = rollDice(8, 6) * 100;
      coins.pp = rollDice(4, 6) * 50;
    }

    // Шанс на маленькую вещь
    if (Math.random() > 0.5) {
      if (tier === 'tier1') {
        gemsAndArt.push({ name: pickRandom(GEMS_10GP), value: 10, count: rollDice(1, 2) });
      } else {
        gemsAndArt.push({ name: pickRandom(GEMS_50GP), value: 50, count: rollDice(1, 2) });
      }
    }
  } else {
    // Сокровищница / Сундук логова (Hoard)
    if (tier === 'tier1') {
      coins.cp = rollDice(6, 6) * 100;
      coins.sp = rollDice(3, 6) * 100;
      coins.gp = rollDice(2, 6) * 10;
      
      const gemCount = rollDice(2, 6);
      gemsAndArt.push({ name: pickRandom(GEMS_10GP), value: 10, count: gemCount });
      if (Math.random() > 0.4) {
        gemsAndArt.push({ name: pickRandom(ART_OBJECTS_25GP), value: 25, count: 1 });
      }
      magicItems.push(pickRandom(MAGIC_ITEMS_TIER1));
      if (Math.random() > 0.5) magicItems.push(pickRandom(MAGIC_ITEMS_TIER1));
    } else if (tier === 'tier2') {
      coins.sp = rollDice(4, 6) * 100;
      coins.gp = rollDice(6, 6) * 100;
      coins.pp = rollDice(2, 6) * 10;

      const gemCount = rollDice(3, 6);
      gemsAndArt.push({ name: pickRandom(GEMS_50GP), value: 50, count: gemCount });
      gemsAndArt.push({ name: pickRandom(ART_OBJECTS_250GP), value: 250, count: rollDice(1, 2) });
      magicItems.push(pickRandom(MAGIC_ITEMS_TIER2));
      magicItems.push(pickRandom(MAGIC_ITEMS_TIER1));
    } else if (tier === 'tier3') {
      coins.gp = rollDice(10, 6) * 500;
      coins.pp = rollDice(4, 6) * 100;

      const gemCount = rollDice(4, 6);
      gemsAndArt.push({ name: pickRandom(GEMS_100GP), value: 100, count: gemCount });
      gemsAndArt.push({ name: pickRandom(GEMS_500GP), value: 500, count: rollDice(1, 3) });
      magicItems.push(pickRandom(MAGIC_ITEMS_TIER2));
      magicItems.push(pickRandom(MAGIC_ITEMS_TIER2));
    } else {
      coins.gp = rollDice(12, 6) * 1000;
      coins.pp = rollDice(8, 6) * 500;

      gemsAndArt.push({ name: pickRandom(GEMS_500GP), value: 500, count: rollDice(5, 6) });
      magicItems.push(pickRandom(MAGIC_ITEMS_TIER2));
      magicItems.push(pickRandom(MAGIC_ITEMS_TIER2));
    }
  }

  // Расчёт общей ценности в ЗМ
  const coinTotalGp = Math.round(
    coins.cp / 100 +
    coins.sp / 10 +
    coins.ep / 2 +
    coins.gp +
    coins.pp * 10
  );

  const gemsTotalGp = gemsAndArt.reduce((sum, item) => sum + (item.value * item.count), 0);
  const totalValueGp = coinTotalGp + gemsTotalGp;

  const tierObj = LOOT_TIERS.find(t => t.id === tier);
  const typeObj = LOOT_TYPES.find(t => t.id === type);

  return {
    id: `loot_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    tier,
    tierLabel: tierObj ? tierObj.label : 'Тир 1',
    type,
    typeLabel: typeObj ? typeObj.label : 'Сокровищница',
    coins,
    coinTotalGp,
    gemsAndArt,
    gemsTotalGp,
    magicItems,
    totalValueGp
  };
}
