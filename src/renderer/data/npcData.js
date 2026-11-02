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
 * Функция генерации случайного NPC с глубокими параметрами
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
  const firstName = namesPool && namesPool.length > 0
    ? namesPool[Math.floor(Math.random() * namesPool.length)]
    : 'Безымянный';

  // Фамилия / Клан / Племя
  let surname = '';
  if (race.clans && race.clans.length > 0) {
    surname = race.clans[Math.floor(Math.random() * race.clans.length)];
  }

  // Псевдоним / Титул заслуги (у орков, дварфов, голиафов, табакси и т.д.)
  let epithet = '';
  if (race.epithets && race.epithets.length > 0) {
    // 80% шанс получить эпитет заслуги
    if (Math.random() < 0.8) {
      epithet = race.epithets[Math.floor(Math.random() * race.epithets.length)];
    }
  }

  // Формируем красивое полное имя в зависимости от расовых традиций D&D
  const style = race.namingStyle || 'clan-quote';
  let fullName = firstName;

  if (style === 'epithet-suffix') {
    // Орк Тугал Сияющий, Гоблин Грыз Камнеплюй, Людоящер Ксашкор Хладнокровный
    fullName = epithet ? `${firstName} ${epithet}` : firstName;
  } else if (style === 'tabaxi') {
    // Дымка на Рассвете («Дымка») из Клана Золотых Песков
    const nick = epithet || firstName.split(' ')[0];
    fullName = surname 
      ? `${firstName} («${nick}») из Клана ${surname}`
      : `${firstName} («${nick}»)`;
  } else if (style === 'kenku') {
    // Скрип Несмазанных Петель («Скрипун»)
    fullName = epithet ? `${firstName} («${epithet}»)` : firstName;
  } else if (style === 'title') {
    // Акенос «Пепел», Кассиэль «Светозарный», Игнис «Пламерождённый»
    fullName = epithet ? `${firstName} «${epithet}»` : firstName;
  } else {
    // 'clan-quote' (Дварф Торин «Камнелом» Железнощит, Голиаф Вайкан «Сокрушитель Лавин» Кола-Телу)
    if (epithet && surname) {
      fullName = `${firstName} «${epithet}» ${surname}`;
    } else if (surname) {
      fullName = `${firstName} ${surname}`;
    } else if (epithet) {
      fullName = `${firstName} «${epithet}»`;
    }
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

  // Голос и отыгрыш для Мастера
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
