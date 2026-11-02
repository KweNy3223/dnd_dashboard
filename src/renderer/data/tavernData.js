import tavernDatabase from './tavernData.json';

export const TAVERN_CONCEPTS = tavernDatabase.concepts;
export const TAVERN_KEEPERS = tavernDatabase.keepers;
export const TAVERN_ATMOSPHERES = tavernDatabase.atmospheres;
export const TAVERN_SPECIALTIES = tavernDatabase.specialties;
export const TAVERN_STANDARD_MENU = tavernDatabase.standardMenu;
export const TAVERN_ROOM_TIERS = tavernDatabase.roomTiers;
export const TAVERN_PATRONS = tavernDatabase.patrons;
export const TAVERN_RUMORS = tavernDatabase.rumors;
export const TAVERN_EVENTS = tavernDatabase.events;

/**
 * Генерация названия таверны
 */
export function generateTavernName() {
  const { adjectives, nouns, uniqueNames } = tavernDatabase.nameComponents;
  // 30% шанс на уникальное готовое название
  if (Math.random() < 0.3 && uniqueNames && uniqueNames.length > 0) {
    return uniqueNames[Math.floor(Math.random() * uniqueNames.length)];
  }
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj} ${noun}`;
}

/**
 * Генератор таверны D&D 5e
 * @param {Object} options - { conceptId }
 */
export function generateRandomTavern(options = {}) {
  // Концепт
  let concept = null;
  if (options.conceptId && options.conceptId !== 'any') {
    concept = TAVERN_CONCEPTS.find(c => c.id === options.conceptId);
  }
  if (!concept) {
    concept = TAVERN_CONCEPTS[Math.floor(Math.random() * TAVERN_CONCEPTS.length)];
  }

  // Название
  const name = generateTavernName();

  // Трактирщик
  const keeper = TAVERN_KEEPERS[Math.floor(Math.random() * TAVERN_KEEPERS.length)];

  // Атмосфера (запахи, вид, звуки)
  const atmosphere = TAVERN_ATMOSPHERES[Math.floor(Math.random() * TAVERN_ATMOSPHERES.length)];

  // Фирменное меню
  const specialty = TAVERN_SPECIALTIES[Math.floor(Math.random() * TAVERN_SPECIALTIES.length)];

  // Посетители
  const patrons = TAVERN_PATRONS[Math.floor(Math.random() * TAVERN_PATRONS.length)];

  // Слух за стойкой
  const rumor = TAVERN_RUMORS[Math.floor(Math.random() * TAVERN_RUMORS.length)];

  // Внезапное происшествие
  const event = TAVERN_EVENTS[Math.floor(Math.random() * TAVERN_EVENTS.length)];

  return {
    id: `tavern_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    name,
    concept,
    keeper,
    atmosphere,
    specialty,
    standardMenu: TAVERN_STANDARD_MENU,
    rooms: TAVERN_ROOM_TIERS,
    patrons,
    rumor,
    event,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
