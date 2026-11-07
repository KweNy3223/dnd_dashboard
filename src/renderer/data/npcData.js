import npcDatabase from './npcData.json';
import { 
  RACES_EN, 
  OCCUPATIONS_EN, 
  ALIGNMENTS_EN, 
  VOICES_EN, 
  APPEARANCES_EN, 
  PERSONALITY_TRAITS_EN, 
  SECRETS_EN 
} from './npcDataEn.js';

/**
 * База данных NPC D&D 5e загружается из npcData.json и npcDataEn.js
 * Добавлена полная двуязычная поддержка (RU / EN).
 */
export const RACES_DATA = Object.entries(npcDatabase.races).reduce((acc, [key, race]) => {
  const enData = RACES_EN[key] || {};
  acc[key] = {
    ...race,
    name_en: enData.name || race.name,
    maleNames_en: enData.maleNames || race.maleNames,
    femaleNames_en: enData.femaleNames || race.femaleNames,
    clans_en: enData.clans || race.clans,
    epithets_en: enData.epithets || race.epithets
  };
  return acc;
}, {});

export const OCCUPATIONS = npcDatabase.occupations.map(occ => ({
  ...occ,
  name_en: OCCUPATIONS_EN[occ.name] || occ.name
}));

export const ALIGNMENTS = npcDatabase.alignments;
export const ALIGNMENTS_MAP = ALIGNMENTS_EN;

export const VOICE_DATA = npcDatabase.voices;
export const APPEARANCE_FEATURES = npcDatabase.appearanceFeatures;
export const PERSONALITY_TRAITS = npcDatabase.personalityTraits;
export const SECRETS_MOTIVATIONS = npcDatabase.secrets;

function pickRandom(arr) {
  if (!arr || arr.length === 0) return '';
  return arr[Math.floor(Math.random() * arr.length)];
}

function assembleFullName(style, firstName, epithet, surname, isEn = false) {
  if (style === 'epithet-suffix') {
    return epithet ? `${firstName} ${epithet}` : firstName;
  } else if (style === 'tabaxi') {
    const nick = epithet || firstName.split(' ')[0];
    if (isEn) {
      return surname ? `${firstName} ("${nick}") of Clan ${surname}` : `${firstName} ("${nick}")`;
    }
    return surname ? `${firstName} («${nick}») из Клана ${surname}` : `${firstName} («${nick}»)`;
  } else if (style === 'kenku') {
    return epithet ? (isEn ? `${firstName} ("${epithet}")` : `${firstName} («${epithet}»)` ) : firstName;
  } else if (style === 'title') {
    return epithet ? (isEn ? `${firstName} "${epithet}"` : `${firstName} «${epithet}»`) : firstName;
  } else {
    // 'clan-quote'
    if (epithet && surname) {
      return isEn ? `${firstName} "${epithet}" ${surname}` : `${firstName} «${epithet}» ${surname}`;
    } else if (surname) {
      return `${firstName} ${surname}`;
    } else if (epithet) {
      return isEn ? `${firstName} "${epithet}"` : `${firstName} «${epithet}»`;
    }
    return firstName;
  }
}

/**
 * Функция генерации случайного NPC с глубокими параметрами и поддержкой i18n
 * @param {Object} options - { race, gender, occupation, language }
 */
export function generateRandomNPC(options = {}) {
  const isEn = options.language === 'en';
  const raceKeys = Object.keys(RACES_DATA);
  const selectedRaceKey = (options.race && options.race !== 'any')
    ? options.race
    : raceKeys[Math.floor(Math.random() * raceKeys.length)];

  const race = RACES_DATA[selectedRaceKey] || RACES_DATA.human;
  const raceEn = RACES_EN[selectedRaceKey] || RACES_EN.human;

  // Пол
  let genderKey = options.gender;
  if (!genderKey || genderKey === 'any') {
    genderKey = Math.random() < 0.5 ? 'male' : 'female';
  } else if (genderKey === 'Мужчина') {
    genderKey = 'male';
  } else if (genderKey === 'Женщина') {
    genderKey = 'female';
  }

  // 1. Имена (RU и EN)
  const namesPoolRu = genderKey === 'male' ? race.maleNames : race.femaleNames;
  const namesPoolEn = genderKey === 'male' ? (race.maleNames_en || raceEn.maleNames) : (race.femaleNames_en || raceEn.femaleNames);

  const firstNameRu = pickRandom(namesPoolRu) || 'Безымянный';
  const firstNameEn = pickRandom(namesPoolEn) || firstNameRu;

  // Фамилия / Клан
  let surnameRu = '';
  let surnameEn = '';
  if (race.clans && race.clans.length > 0) {
    const clanIdx = Math.floor(Math.random() * race.clans.length);
    surnameRu = race.clans[clanIdx];
    surnameEn = (race.clans_en && race.clans_en[clanIdx]) ? race.clans_en[clanIdx] : (raceEn.clans ? pickRandom(raceEn.clans) : surnameRu);
  }

  // Эпитет
  let epithetRu = '';
  let epithetEn = '';
  if (race.epithets && race.epithets.length > 0 && Math.random() < 0.8) {
    const epIdx = Math.floor(Math.random() * race.epithets.length);
    epithetRu = race.epithets[epIdx];
    epithetEn = (race.epithets_en && race.epithets_en[epIdx]) ? race.epithets_en[epIdx] : (raceEn.epithets ? pickRandom(raceEn.epithets) : epithetRu);
  }

  const style = race.namingStyle || 'clan-quote';
  const fullNameRu = assembleFullName(style, firstNameRu, epithetRu, surnameRu, false);
  const fullNameEn = assembleFullName(style, firstNameEn, epithetEn, surnameEn, true);

  // 2. Профессия
  let occupationRu = '';
  let occupationEn = '';
  if (options.occupation && options.occupation !== 'any') {
    occupationRu = options.occupation;
    const matchOcc = OCCUPATIONS.find(o => o.name === options.occupation || o.name_en === options.occupation);
    occupationEn = matchOcc ? matchOcc.name_en : (OCCUPATIONS_EN[options.occupation] || options.occupation);
  } else {
    const occ = pickRandom(OCCUPATIONS);
    occupationRu = occ.name;
    occupationEn = occ.name_en || OCCUPATIONS_EN[occ.name] || occ.name;
  }

  // 3. Мировоззрение
  const alignIdx = Math.floor(Math.random() * ALIGNMENTS.length);
  const alignmentRu = ALIGNMENTS[alignIdx];
  const alignmentEn = ALIGNMENTS_EN[alignmentRu] || alignmentRu;

  // 4. Голос
  const voiceIdx = Math.floor(Math.random() * VOICE_DATA.length);
  const vRu = VOICE_DATA[voiceIdx];
  const vEn = VOICES_EN[voiceIdx] || vRu;
  const quoteIdx = Math.floor(Math.random() * vRu.quotes.length);
  const quoteRu = vRu.quotes[quoteIdx];
  const quoteEn = (vEn.quotes && vEn.quotes[quoteIdx]) ? vEn.quotes[quoteIdx] : (vEn.quotes ? vEn.quotes[0] : quoteRu);

  // 5. Внешность
  const appIdx = Math.floor(Math.random() * APPEARANCE_FEATURES.length);
  const appearanceRu = APPEARANCE_FEATURES[appIdx];
  const appearanceEn = APPEARANCES_EN[appIdx] || appearanceRu;

  // 6. Характер
  const traitIdx = Math.floor(Math.random() * PERSONALITY_TRAITS.length);
  const personalityRu = PERSONALITY_TRAITS[traitIdx];
  const personalityEn = PERSONALITY_TRAITS_EN[traitIdx] || personalityRu;

  // 7. Секрет
  const secretIdx = Math.floor(Math.random() * SECRETS_MOTIVATIONS.length);
  const secretRu = SECRETS_MOTIVATIONS[secretIdx];
  const secretEn = SECRETS_EN[secretIdx] || secretRu;

  return {
    id: `npc_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    genderKey,
    // Локализованные версии
    firstName: isEn ? firstNameEn : firstNameRu,
    firstName_ru: firstNameRu,
    firstName_en: firstNameEn,
    surname: isEn ? surnameEn : surnameRu,
    surname_ru: surnameRu,
    surname_en: surnameEn,
    epithet: isEn ? epithetEn : epithetRu,
    epithet_ru: epithetRu,
    epithet_en: epithetEn,
    fullName: isEn ? fullNameEn : fullNameRu,
    fullName_ru: fullNameRu,
    fullName_en: fullNameEn,
    gender: isEn ? (genderKey === 'male' ? 'Male' : 'Female') : (genderKey === 'male' ? 'Мужчина' : 'Женщина'),
    gender_ru: genderKey === 'male' ? 'Мужчина' : 'Женщина',
    gender_en: genderKey === 'male' ? 'Male' : 'Female',
    raceId: race.id,
    raceName: isEn ? (race.name_en || raceEn.name) : race.name,
    raceName_ru: race.name,
    raceName_en: race.name_en || raceEn.name,
    raceIcon: race.icon,
    occupation: isEn ? occupationEn : occupationRu,
    occupation_ru: occupationRu,
    occupation_en: occupationEn,
    alignment: isEn ? alignmentEn : alignmentRu,
    alignment_ru: alignmentRu,
    alignment_en: alignmentEn,
    voiceIdx,
    quoteIdx,
    voice: {
      pitch: isEn ? vEn.pitch : vRu.pitch,
      pitch_ru: vRu.pitch,
      pitch_en: vEn.pitch,
      manner: isEn ? vEn.manner : vRu.manner,
      manner_ru: vRu.manner,
      manner_en: vEn.manner,
      actingTip: isEn ? vEn.actingTip : vRu.actingTip,
      actingTip_ru: vRu.actingTip,
      actingTip_en: vEn.actingTip,
      quote: isEn ? quoteEn : quoteRu,
      quote_ru: quoteRu,
      quote_en: quoteEn
    },
    appIdx,
    appearance: isEn ? appearanceEn : appearanceRu,
    appearance_ru: appearanceRu,
    appearance_en: appearanceEn,
    traitIdx,
    personality: isEn ? personalityEn : personalityRu,
    personality_ru: personalityRu,
    personality_en: personalityEn,
    secretIdx,
    secret: isEn ? secretEn : secretRu,
    secret_ru: secretRu,
    secret_en: secretEn,
    createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  };
}
