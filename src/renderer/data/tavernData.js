import tavernDatabase from './tavernData.json';
import {
  TAVERN_CONCEPTS_EN,
  TAVERN_REGIONS_EN,
  TAVERN_NAMES_EN,
  TAVERN_KEEPERS_EN,
  TAVERN_ATMOSPHERES_EN,
  TAVERN_ROOM_TIERS_EN,
  TAVERN_PATRONS_EN,
  TAVERN_RUMORS_EN,
  TAVERN_EVENTS_EN,
  REGIONAL_MENUS_EN
} from './tavernDataEn.js';

export const TAVERN_CONCEPTS = tavernDatabase.concepts.map(c => ({
  ...c,
  name_en: TAVERN_CONCEPTS_EN[c.id]?.name || c.name
}));

export const TAVERN_REGIONS = tavernDatabase.regions.map(r => ({
  ...r,
  name_en: TAVERN_REGIONS_EN[r.id]?.name || r.name
}));

export const TAVERN_KEEPERS = tavernDatabase.keepers;
export const TAVERN_ATMOSPHERES = tavernDatabase.atmospheres;
export const TAVERN_ROOM_TIERS = tavernDatabase.roomTiers;
export const TAVERN_PATRONS = tavernDatabase.patrons;
export const TAVERN_RUMORS = tavernDatabase.rumors;
export const TAVERN_EVENTS = tavernDatabase.events;

/**
 * Генерация названия таверны (RU / EN)
 */
export function generateTavernName(isEn = false) {
  if (isEn) {
    const { adjectives, nouns, uniqueNames } = TAVERN_NAMES_EN;
    if (Math.random() < 0.35 && uniqueNames && uniqueNames.length > 0) {
      return uniqueNames[Math.floor(Math.random() * uniqueNames.length)];
    }
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    return `${adj} ${noun}`;
  }

  const { adjectives, nouns, uniqueNames } = tavernDatabase.nameComponents;
  if (Math.random() < 0.3 && uniqueNames && uniqueNames.length > 0) {
    return uniqueNames[Math.floor(Math.random() * uniqueNames.length)];
  }
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

/**
 * Генератор таверны D&D 5e с поддержкой i18n
 * @param {Object} options - { conceptId, regionId, language }
 */
export function generateRandomTavern(options = {}) {
  const isEn = options.language === 'en';

  // 1. Концепт заведения
  let concept = null;
  if (options.conceptId && options.conceptId !== 'any') {
    concept = TAVERN_CONCEPTS.find(c => c.id === options.conceptId);
  }
  if (!concept) {
    concept = TAVERN_CONCEPTS[Math.floor(Math.random() * TAVERN_CONCEPTS.length)];
  }

  // 2. Регион / Биом
  let region = null;
  if (options.regionId && options.regionId !== 'any') {
    region = TAVERN_REGIONS.find(r => r.id === options.regionId);
  }
  if (!region) {
    region = TAVERN_REGIONS[Math.floor(Math.random() * TAVERN_REGIONS.length)];
  }

  // 3. Название
  const nameRu = generateTavernName(false);
  const nameEn = generateTavernName(true);

  // 4. Трактирщик
  const keeperIdx = Math.floor(Math.random() * TAVERN_KEEPERS.length);
  const keeperRu = TAVERN_KEEPERS[keeperIdx];
  const keeperEn = TAVERN_KEEPERS_EN[keeperIdx] || keeperRu;

  // 5. Атмосфера
  const atmosIdx = Math.floor(Math.random() * TAVERN_ATMOSPHERES.length);
  const atmosphereRu = TAVERN_ATMOSPHERES[atmosIdx];
  const atmosphereEn = TAVERN_ATMOSPHERES_EN[atmosIdx] || atmosphereRu;

  // 6. Посетители
  const patronIdx = Math.floor(Math.random() * TAVERN_PATRONS.length);
  const patronsRu = TAVERN_PATRONS[patronIdx];
  const patronsEn = TAVERN_PATRONS_EN[patronIdx] || patronsRu;

  // 7. Слух
  const rumorIdx = Math.floor(Math.random() * TAVERN_RUMORS.length);
  const rumorRu = TAVERN_RUMORS[rumorIdx];
  const rumorEn = TAVERN_RUMORS_EN[rumorIdx] || rumorRu;

  // 8. Событие
  const eventIdx = Math.floor(Math.random() * TAVERN_EVENTS.length);
  const eventRu = TAVERN_EVENTS[eventIdx];
  const eventEn = TAVERN_EVENTS_EN[eventIdx] || eventRu;

  // 9. Меню региона
  const menuRu = {
    food: region.food,
    drinks: region.drinks
  };
  const regEnData = REGIONAL_MENUS_EN[region.id] || {};
  const menuEn = {
    food: regEnData.food || region.food,
    drinks: regEnData.drinks || region.drinks
  };

  const roomsEn = TAVERN_ROOM_TIERS_EN;

  return {
    id: `tavern_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name: isEn ? nameEn : nameRu,
    name_ru: nameRu,
    name_en: nameEn,
    concept: {
      ...concept,
      name: isEn ? (concept.name_en || concept.name) : concept.name,
      name_ru: concept.name,
      name_en: concept.name_en || concept.name
    },
    region: {
      ...region,
      name: isEn ? (region.name_en || region.name) : region.name,
      name_ru: region.name,
      name_en: region.name_en || region.name
    },
    keeperIdx,
    keeper: isEn ? keeperEn : keeperRu,
    keeper_ru: keeperRu,
    keeper_en: keeperEn,
    atmosIdx,
    atmosphere: isEn ? atmosphereEn : atmosphereRu,
    atmosphere_ru: atmosphereRu,
    atmosphere_en: atmosphereEn,
    menu: isEn ? menuEn : menuRu,
    menu_ru: menuRu,
    menu_en: menuEn,
    rooms: isEn ? roomsEn : TAVERN_ROOM_TIERS,
    rooms_ru: TAVERN_ROOM_TIERS,
    rooms_en: roomsEn,
    patrons: isEn ? patronsEn : patronsRu,
    patrons_ru: patronsRu,
    patrons_en: patronsEn,
    rumor: isEn ? rumorEn : rumorRu,
    rumor_ru: rumorRu,
    rumor_en: rumorEn,
    event: isEn ? eventEn : eventRu,
    event_ru: eventRu,
    event_en: eventEn,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
