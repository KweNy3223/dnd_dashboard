import npcDatabase from './npcData.json';

/**
 * База данных NPC D&D 5e загружается из npcData.json
 * Здесь хранятся расы, имена, прозвища/титулы заслуг, профессии,
 * внешность, характеры, секреты и параметры отыгрыша голосом.
 */
export const RACES_DATA = npcDatabase.races;
export const OCCUPATIONS = npcDatabase.occupations;
export const ALIGNMENTS = npcDatabase.alignments;
export const VOICE_DATA = npcDatabase.voices;
export const APPEARANCE_FEATURES = npcDatabase.appearanceFeatures;
export const PERSONALITY_TRAITS = npcDatabase.personalityTraits;
export const SECRETS_MOTIVATIONS = npcDatabase.secrets;

/**
 * Функция генерации случайного NPC
 * @param {Object} options - { race, gender, occupation }
 */
export function generateRandomNPC(options = {}) {
  const raceKeys = Object.keys(RACES_DATA);
  const selectedRaceKey = (options.race && options.race !== 'any')
    ? options.race
    : raceKeys[Math.floor(Math.random() * raceKeys.length)];

  const race = RACES_DATA[selectedRaceKey] || RACES_DATA.human;

  // Пол
  let gender = options.gender;
  if (!gender || gender === 'any') {
    gender = Math.random() < 0.5 ? 'male' : 'female';
  }

  // Имя
  const namesPool = gender === 'male' ? race.maleNames : race.femaleNames;
  const firstName = namesPool[Math.floor(Math.random() * namesPool.length)];

  // Фамилия / Клан
  let surname = '';
  if (race.clans && race.clans.length > 0) {
    surname = race.clans[Math.floor(Math.random() * race.clans.length)];
  }

  // Псевдоним / Титул заслуги (у орков, дварфов, людей и т.д.)
  let epithet = '';
  if (race.epithets && race.epithets.length > 0) {
    // 75% шанс получить эпитет заслуги
    if (Math.random() < 0.75) {
      epithet = race.epithets[Math.floor(Math.random() * race.epithets.length)];
    }
  }

  // Формируем красивое полное имя
  let fullName = '';
  if (selectedRaceKey === 'orc') {
    // Орк Тугал Сияющий или Тугал Железный Кулак
    fullName = epithet ? `${firstName} ${epithet}` : firstName;
  } else if (selectedRaceKey === 'dwarf') {
    // Торин «Камнелом» Железнощит
    fullName = epithet 
      ? `${firstName} «${epithet}» ${surname}`.trim()
      : `${firstName} ${surname}`.trim();
  } else if (selectedRaceKey === 'tiefling') {
    // Акенос (прозвище «Пепел»)
    fullName = epithet ? `${firstName} «${epithet}»` : firstName;
  } else {
    // Универсальное
    fullName = epithet 
      ? `${firstName} «${epithet}» ${surname}`.trim()
      : `${firstName} ${surname}`.trim();
  }

  // Профессия
  let occupation = '';
  if (options.occupation && options.occupation !== 'any') {
    occupation = options.occupation;
  } else {
    const occ = OCCUPATIONS[Math.floor(Math.random() * OCCUPATIONS.length)];
    occupation = occ.name;
  }

  // Мировоззрение
  const alignment = ALIGNMENTS[Math.floor(Math.random() * ALIGNMENTS.length)];

  // Голос и отыгрыш
  const voice = VOICE_DATA[Math.floor(Math.random() * VOICE_DATA.length)];
  const randomQuote = voice.quotes[Math.floor(Math.random() * voice.quotes.length)];

  // Внешность
  const appearance = APPEARANCE_FEATURES[Math.floor(Math.random() * APPEARANCE_FEATURES.length)];

  // Характер и тайна
  const personality = PERSONALITY_TRAITS[Math.floor(Math.random() * PERSONALITY_TRAITS.length)];
  const secret = SECRETS_MOTIVATIONS[Math.floor(Math.random() * SECRETS_MOTIVATIONS.length)];

  return {
    id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    firstName,
    surname,
    epithet,
    fullName,
    gender: gender === 'male' ? 'Мужчина' : 'Женщина',
    raceId: race.id,
    raceName: race.name,
    raceIcon: race.icon,
    occupation,
    alignment,
    voice: {
      pitch: voice.pitch,
      manner: voice.manner,
      actingTip: voice.actingTip,
      quote: randomQuote
    },
    appearance,
    personality,
    secret,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
