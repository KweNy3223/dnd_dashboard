import shopDatabase from './shopData.json';

export const SHOP_TYPES = shopDatabase.types;
export const WEALTH_TIERS = shopDatabase.wealthTiers;
export const SHOP_NAMES = shopDatabase.names;
export const MERCHANTS_POOL = shopDatabase.merchants;
export const ATMOSPHERES = shopDatabase.atmospheres;
export const GOODS_CATALOG = shopDatabase.goods;
export const SECRET_LOTS = shopDatabase.secretLots;
export const SECURITY_OPTIONS = shopDatabase.security;
export const SHOP_RUMORS = shopDatabase.rumors;

/**
 * Генерация названия лавки в зависимости от ее типа
 * @param {string} typeId - id типа лавки
 */
export function generateShopName(typeId = 'armory') {
  const naming = SHOP_NAMES[typeId] || SHOP_NAMES.armory;
  if (Math.random() < 0.35 && naming.personal && naming.personal.length > 0) {
    return naming.personal[Math.floor(Math.random() * naming.personal.length)];
  }
  const prefix = naming.prefixes[Math.floor(Math.random() * naming.prefixes.length)];
  const root = naming.roots[Math.floor(Math.random() * naming.roots.length)];
  return `«${prefix} ${root}»`;
}

/**
 * Случайный выбор N элементов из массива без повторений
 */
function getRandomSubset(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Генератор лавки и торговца D&D 5e
 * @param {Object} options - { typeId, wealthId }
 */
export function generateRandomShop(options = {}) {
  // 1. Тип заведения
  let shopType = null;
  if (options.typeId && options.typeId !== 'any') {
    shopType = SHOP_TYPES.find(t => t.id === options.typeId);
  }
  if (!shopType) {
    shopType = SHOP_TYPES[Math.floor(Math.random() * SHOP_TYPES.length)];
  }

  // 2. Уровень достатка / Квартал
  let wealthTier = null;
  if (options.wealthId && options.wealthId !== 'any') {
    wealthTier = WEALTH_TIERS.find(w => w.id === options.wealthId);
  }
  if (!wealthTier) {
    wealthTier = WEALTH_TIERS[Math.floor(Math.random() * WEALTH_TIERS.length)];
  }

  // 3. Название
  const name = generateShopName(shopType.id);

  // 4. Владелец лавки (краткая выжимка: имя, раса, пол, профессия)
  const merchant = MERCHANTS_POOL[Math.floor(Math.random() * MERCHANTS_POOL.length)];

  // 5. Атмосфера
  const atmosList = ATMOSPHERES[shopType.id] || ATMOSPHERES.armory;
  const atmosphere = atmosList[Math.floor(Math.random() * atmosList.length)];

  // 6. Витрина товаров (3-4 позиции из каталога для данного типа и уровня достатка)
  const availableGoods = GOODS_CATALOG[shopType.id]?.[wealthTier.id] || GOODS_CATALOG.armory.medium;
  const showcase = getRandomSubset(availableGoods, Math.min(4, availableGoods.length));

  // 7. Секретный лот "Из-под прилавка"
  const availableSecrets = SECRET_LOTS[shopType.id] || SECRET_LOTS.armory;
  const secretLot = availableSecrets[Math.floor(Math.random() * availableSecrets.length)];

  // 8. Охрана и защита от кражи
  const security = SECURITY_OPTIONS[Math.floor(Math.random() * SECURITY_OPTIONS.length)];

  // 9. Слух / забота торговца (опциональная зацепка)
  const rumor = SHOP_RUMORS[Math.floor(Math.random() * SHOP_RUMORS.length)];

  return {
    id: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name,
    type: shopType,
    wealth: wealthTier,
    merchant,
    atmosphere,
    showcase,
    secretLot,
    security,
    rumor
  };
}
