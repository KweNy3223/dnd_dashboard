import shopDatabase from './shopData.json';
import pricesDatabase from '../../prices.json';
import {
  SHOP_TYPES_EN,
  WEALTH_TIERS_EN,
  SHOP_NAMES_EN,
  MERCHANTS_EN,
  ATMOSPHERES_EN,
  SECURITY_EN,
  SHOP_RUMORS_EN,
  SECRET_LOTS_EN
} from './shopDataEn.js';

// Карта перевода названий товаров из справочника цен
const PRICE_NAMES_MAP = {};
Object.values(pricesDatabase).forEach(category => {
  if (Array.isArray(category)) {
    category.forEach(item => {
      if (item.name && item.name_en) {
        PRICE_NAMES_MAP[item.name.toLowerCase().trim()] = item.name_en;
      }
    });
  }
});

export const SHOP_TYPES = shopDatabase.types.map(t => ({
  ...t,
  name_en: SHOP_TYPES_EN[t.id]?.name || t.name,
  desc_en: SHOP_TYPES_EN[t.id]?.desc || t.desc
}));

export const WEALTH_TIERS = shopDatabase.wealthTiers.map(w => ({
  ...w,
  name_en: WEALTH_TIERS_EN[w.id]?.name || w.name,
  desc_en: WEALTH_TIERS_EN[w.id]?.desc || w.desc
}));

export const SHOP_NAMES = shopDatabase.names;
export const MERCHANTS_POOL = shopDatabase.merchants;
export const ATMOSPHERES = shopDatabase.atmospheres;
export const GOODS_CATALOG = shopDatabase.catalog || shopDatabase.goods;
export const SECRET_LOTS = shopDatabase.secretLots;
export const SECURITY_OPTIONS = shopDatabase.security;
export const SHOP_RUMORS = shopDatabase.rumors;

/**
 * Генерация названия лавки в зависимости от ее типа (RU / EN)
 */
export function generateShopName(typeId = 'armory', isEn = false) {
  if (isEn) {
    const naming = SHOP_NAMES_EN[typeId] || SHOP_NAMES_EN.armory;
    if (Math.random() < 0.35 && naming.personal && naming.personal.length > 0) {
      return naming.personal[Math.floor(Math.random() * naming.personal.length)];
    }
    const prefix = naming.prefixes[Math.floor(Math.random() * naming.prefixes.length)];
    const root = naming.roots[Math.floor(Math.random() * naming.roots.length)];
    return `"${prefix} ${root}"`;
  }

  const naming = SHOP_NAMES[typeId] || SHOP_NAMES.armory;
  if (Math.random() < 0.35 && naming.personal && naming.personal.length > 0) {
    return naming.personal[Math.floor(Math.random() * naming.personal.length)];
  }
  const prefix = naming.prefixes[Math.floor(Math.random() * naming.prefixes.length)];
  const root = naming.roots[Math.floor(Math.random() * naming.roots.length)];
  return `«${prefix} ${root}»`;
}

function getRandomSubset(array, count) {
  const shuffled = [...array].sort(() => 0.5 - Math.random());
  return shuffled.slice(0, count);
}

/**
 * Генератор лавки и торговца D&D 5e с поддержкой i18n
 */
export function generateRandomShop(options = {}) {
  const isEn = options.language === 'en';

  // 1. Тип заведения
  let shopType = null;
  if (options.typeId && options.typeId !== 'any') {
    shopType = SHOP_TYPES.find(t => t.id === options.typeId);
  }
  if (!shopType) {
    shopType = SHOP_TYPES[Math.floor(Math.random() * SHOP_TYPES.length)];
  }

  // 2. Уровень достатка
  let wealthTier = null;
  if (options.wealthId && options.wealthId !== 'any') {
    wealthTier = WEALTH_TIERS.find(w => w.id === options.wealthId);
  }
  if (!wealthTier) {
    if (options.forceRandom) {
      wealthTier = WEALTH_TIERS[Math.floor(Math.random() * WEALTH_TIERS.length)];
    } else {
      wealthTier = WEALTH_TIERS.find(w => w.id === 'medium') || WEALTH_TIERS[0];
    }
  }

  // 3. Название
  const nameRu = generateShopName(shopType.id, false);
  const nameEn = generateShopName(shopType.id, true);

  // 4. Владелец лавки
  const mIdx = Math.floor(Math.random() * MERCHANTS_POOL.length);
  const merchantRu = MERCHANTS_POOL[mIdx];
  const merchantEn = MERCHANTS_EN[mIdx] || merchantRu;

  // 5. Атмосфера
  const atmosListRu = ATMOSPHERES[shopType.id] || ATMOSPHERES.armory || [];
  const atmosListEn = ATMOSPHERES_EN[shopType.id] || ATMOSPHERES_EN.armory || atmosListRu;
  const aIdx = Math.floor(Math.random() * atmosListRu.length);
  const atmosphereRu = atmosListRu[aIdx] || '';
  const atmosphereEn = atmosListEn[aIdx] || atmosphereRu;

  // 6. Товары
  const rawGoods = GOODS_CATALOG[shopType.id] || [];
  const localizedGoods = rawGoods.map(g => {
    const enName = PRICE_NAMES_MAP[g.name.toLowerCase().trim()] || g.name;
    const enDesc = g.isHandbook ? 'Price Handbook' : g.desc;
    return {
      ...g,
      name: isEn ? enName : g.name,
      name_ru: g.name,
      name_en: enName,
      desc: isEn ? enDesc : g.desc,
      desc_ru: g.desc,
      desc_en: enDesc
    };
  });
  const showcase = getRandomSubset(localizedGoods, Math.min(4, localizedGoods.length));

  // 7. Секретный лот
  const secretsRu = SECRET_LOTS[shopType.id] || SECRET_LOTS.armory || [];
  const secretsEn = SECRET_LOTS_EN[shopType.id] || SECRET_LOTS_EN.armory || secretsRu;
  const sIdx = Math.floor(Math.random() * secretsRu.length);
  const secretLotRu = secretsRu[sIdx] || {};
  const secretLotEn = secretsEn[sIdx] || secretLotRu;

  // 8. Охрана
  const secIdx = Math.floor(Math.random() * SECURITY_OPTIONS.length);
  const securityRu = SECURITY_OPTIONS[secIdx] || {};
  const securityEn = SECURITY_EN[secIdx] || securityRu;

  // 9. Слух
  const rIdx = Math.floor(Math.random() * SHOP_RUMORS.length);
  const rumorRu = SHOP_RUMORS[rIdx] || '';
  const rumorEn = SHOP_RUMORS_EN[rIdx] || rumorRu;

  return {
    id: `shop_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: isEn ? nameEn : nameRu,
    name_ru: nameRu,
    name_en: nameEn,
    type: {
      ...shopType,
      name: isEn ? (shopType.name_en || shopType.name) : shopType.name,
      name_ru: shopType.name,
      name_en: shopType.name_en || shopType.name
    },
    wealth: {
      ...wealthTier,
      name: isEn ? (wealthTier.name_en || wealthTier.name) : wealthTier.name,
      name_ru: wealthTier.name,
      name_en: wealthTier.name_en || wealthTier.name
    },
    mIdx,
    merchant: isEn ? merchantEn : merchantRu,
    merchant_ru: merchantRu,
    merchant_en: merchantEn,
    aIdx,
    atmosphere: isEn ? atmosphereEn : atmosphereRu,
    atmosphere_ru: atmosphereRu,
    atmosphere_en: atmosphereEn,
    showcase,
    allGoods: localizedGoods,
    sIdx,
    secretLot: isEn ? secretLotEn : secretLotRu,
    secretLot_ru: secretLotRu,
    secretLot_en: secretLotEn,
    secIdx,
    security: isEn ? securityEn : securityRu,
    security_ru: securityRu,
    security_en: securityEn,
    rIdx,
    rumor: isEn ? rumorEn : rumorRu,
    rumor_ru: rumorRu,
    rumor_en: rumorEn,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
