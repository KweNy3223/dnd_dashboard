import tavernDatabase from './tavernData.json';

export const TAVERN_CONCEPTS = tavernDatabase.concepts;
export const TAVERN_REGIONS = tavernDatabase.regions;
export const TAVERN_KEEPERS = tavernDatabase.keepers;
export const TAVERN_ATMOSPHERES = tavernDatabase.atmospheres;
export const TAVERN_ROOM_TIERS = tavernDatabase.roomTiers;
export const TAVERN_PATRONS = tavernDatabase.patrons;
export const TAVERN_RUMORS = tavernDatabase.rumors;
export const TAVERN_EVENTS = tavernDatabase.events;

/**
 * Генерация названия таверны
 */
export function generateTavernName() {
  const { adjectives, nouns, uniqueNames } = tavernDatabase.nameComponents;
  if (Math.random() < 0.3 && uniqueNames && uniqueNames.length > 0) {
    return uniqueNames[Math.floor(Math.random() * uniqueNames.length)];
  }
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

/**
 * Генератор таверны D&D 5e с раздельной кухней, выпивкой и ночлегом
 * @param {Object} options - { conceptId, regionId }
 */
export function generateRandomTavern(options = {}) {
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
  const name = generateTavernName();

  // 4. Трактирщик
  const keeper = TAVERN_KEEPERS[Math.floor(Math.random() * TAVERN_KEEPERS.length)];

  // 5. Атмосфера
  const atmosphere = TAVERN_ATMOSPHERES[Math.floor(Math.random() * TAVERN_ATMOSPHERES.length)];

  // 6. Посетители
  const patrons = TAVERN_PATRONS[Math.floor(Math.random() * TAVERN_PATRONS.length)];

  // 7. Слух
  const rumor = TAVERN_RUMORS[Math.floor(Math.random() * TAVERN_RUMORS.length)];

  // 8. Событие
  const event = TAVERN_EVENTS[Math.floor(Math.random() * TAVERN_EVENTS.length)];

  return {
    id: `tavern_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name,
    concept,
    region,
    keeper,
    atmosphere,
    menu: {
      food: region.food,
      drinks: region.drinks
    },
    rooms: TAVERN_ROOM_TIERS,
    patrons,
    rumor,
    event,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
