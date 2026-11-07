/**
 * D&D Engine - Логика правил, генератор испытаний и расчёт последствий
 */

import { getCurrentLanguage } from '../i18n/translate.js';

export const TIER_PRESETS = {
  1: {
    tierName: "Тир 1 (1–4 ур. Приключенцы)",
    tierName_en: "Tier 1 (Lvl 1–4 Adventurers)",
    defaultDC: 12,
    dcRange: [10, 14],
    timer: 40,
    attempts: 4,
    objects: {
      lockpick: [
        { name: "Окованный железом сундук бандитов", desc: "Грубый навесной замок со следами ржавчины и царапин от ножа.", name_en: "Bandit's Iron-Banded Chest", desc_en: "Rough padlock with traces of rust and dagger scratches." },
        { name: "Дверь кельи в заброшенном склепе", desc: "Древний бронзовый механизм, забитый многовековой пылью.", name_en: "Cell Door in Abandoned Crypt", desc_en: "Ancient bronze mechanism clogged with centuries of dust." },
        { name: "Шкатулка трактирщика с двойным дном", desc: "Простой замочек со спрятанным внутри пружинным фиксатором.", name_en: "Innkeeper's False-Bottom Box", desc_en: "Simple lock concealing an internal spring catch." }
      ],
      trap: [
        { name: "Растяжка с арбалетным болтом", desc: "Тонкая медная струна, соединяющая порог с замаскированным самострелом.", name_en: "Tripwire Crossbow Trap", desc_en: "Thin copper wire connecting threshold to concealed self-bow." },
        { name: "Механизм качающегося лезвия", desc: "Балансировочные грузила под полом, соединенные с желобом в потолке.", name_en: "Swinging Blade Mechanism", desc_en: "Counterweights under floorboards connected to ceiling slot." },
        { name: "Плита с ядовитыми иглами", desc: "При нажатии срабатывает система выпуска паралитического яда змеи.", name_en: "Poison Needle Pressure Plate", desc_en: "Trigger releases paralytic serpent venom upon depression." }
      ],
      runes: [
        { name: "Печать на дневнике ученика мага", desc: "Простые руны стихий (Огонь, Вода, Воздух), требующие гармонии потока.", name_en: "Apprentice's Spellbook Ward", desc_en: "Simple elemental runes (Fire, Water, Air) requiring harmonious flow." },
        { name: "Защитный глиф на каменной двери", desc: "Концентрические круги с символами древнего наречия лесных эльфов.", name_en: "Protective Glyph on Stone Door", desc_en: "Concentric circles with ancient Wood Elf dialect glyphs." },
        { name: "Свиток с тайным посланием культа", desc: "Энергетический контур, который нужно замкнуть до рассеивания чернил.", name_en: "Cult Secret Message Scroll", desc_en: "Energy conduit needing closure before ink dissipates." }
      ],
      pickpocket: [
        { name: "Кожаный кошель подвыпившего купца", desc: "Купец громко спорит с трактирщиком, периодически хлопая себя по карману.", name_en: "Drunken Merchant's Leather Pouch", desc_en: "Merchant argues loudly with innkeeper, slapping his hip." },
        { name: "Ключи на поясе сонного стражника", desc: "Связка ключей звенит при каждом шаге патрульного у ворот склада.", name_en: "Sleeping Guard's Belt Keys", desc_en: "Ring of keys jingling with each step of the gate patrol." },
        { name: "Карта подземелья в сумке картографа", desc: "Торговец разглядывает товары в торговой палатке, повернувшись спиной.", name_en: "Cartographer's Dungeon Map", desc_en: "Merchant examines goods at stall with back turned." }
      ],
      alchemy: [
        { name: "Зелье лечения (Малое)", desc: "Базовая настойка на корнях цмина и слезах феи. Требует ровного слабого огня.", name_en: "Potion of Healing (Lesser)", desc_en: "Basic infusion of feverfew roots and pixie tears. Requires steady low flame." },
        { name: "Эликсир кошачьей грации", desc: "Летучая эссенция серебряного мха. При перегреве даёт едкий дым.", name_en: "Elixir of Cat's Grace", desc_en: "Volatile essence of silver moss; overheats into acrid smoke." },
        { name: "Взрывчатый алхимический огонь", desc: "Смесь серы и смолы. Необходим строгий контроль плотности раствора.", name_en: "Alchemist's Fire (Volatile)", desc_en: "Mixture of sulfur and pitch; requires strict density control." }
      ]
    }
  },
  2: {
    tierName: "Тир 2 (5–10 ур. Герои королевства)",
    tierName_en: "Tier 2 (Lvl 5–10 Heroes)",
    defaultDC: 16,
    dcRange: [15, 18],
    timer: 30,
    attempts: 3,
    objects: {
      lockpick: [
        { name: "Гномий сейфовый цилиндр с противоотмычками", desc: "Сложная система фальшивых пазов и зазубренных штифтов из закаленной стали.", name_en: "Dwarven Vault Anti-Pick Cylinder", desc_en: "Complex system of serrated pins and false grooves in hardened steel." },
        { name: "Тайник в кабинете магистра гильдии воров", desc: "Замок с магнитными пластинами и защитой от грубого взлома.", name_en: "Thieves' Guildmaster Hidden Safe", desc_en: "Lock fitted with magnetic tumblers and brute-force deadlocks." },
        { name: "Врата сокровищницы горного форта", desc: "Двойной механизм с шестерёнчатым приводом и скрытой шпонкой.", name_en: "Mountain Fort Vault Gates", desc_en: "Dual mechanism with clockwork gearing and a hidden cotter pin." }
      ],
      trap: [
        { name: "Газовая камера с обратным клапаном", desc: "Трубки из позеленевшей меди подают удушающий хлор при разрыве цепи.", name_en: "Check-Valve Poison Gas Chamber", desc_en: "Verdigris copper tubes delivering choking chlorine upon line break." },
        { name: "Огненная ловушка с руническим капсюлем", desc: "Три контура проводов: красный нагревает плиты, черный активирует детонатор.", name_en: "Fire Trap with Runic Primer", desc_en: "Triple wire circuit: red heats plates, black triggers detonator." },
        { name: "Захлопывающаяся решетка с зубьями", desc: "Пневматический поршень, удерживаемый натянутыми тросами.", name_en: "Toothed Slamming Portcullis", desc_en: "Pneumatic ram suspended by taut braided cables." }
      ],
      runes: [
        { name: "Барьер архимага иллюзий", desc: "Мерцающие символы искривляют пространство, постоянно меняя полярность.", name_en: "Illusionist Archmage's Barrier", desc_en: "Shimmering glyphs warping space, constantly inverting polarity." },
        { name: "Саркофаг забытого полководца", desc: "Руны некромантии пульсируют темной энергией, ожидая разрыва печати.", name_en: "Forgotten Warlord's Sarcophagus", desc_en: "Necromantic runes pulsing dark energy, awaiting seal rupture." },
        { name: "Врата в Карманное Измерение", desc: "Четыре кольца эфирных знаков, вращающихся в противоположные стороны.", name_en: "Pocket Dimension Gateway", desc_en: "Four rings of ethereal glyphs rotating in counter directions." }
      ],
      pickpocket: [
        { name: "Амулет на груди подозрительного инквизитора", desc: "Инквизитор бдительно сканирует толпу, рука часто лежит на эфесе меча.", name_en: "Suspicious Inquisitor's Breast Amulet", desc_en: "Inquisitor scans crowd, hand resting on sword hilt." },
        { name: "Письмо с компроматом у тайного советника", desc: "Советник окружен телохранителями, кражу нужно совершить во время давки.", name_en: "Privy Councilor's Blackmail Letter", desc_en: "Councilor surrounded by guards; heist must occur in crowd press." },
        { name: "Перстень-печатка коррумпированного судьи", desc: "Судья пересчитывает взятку за столом в VIP-комнате игорного дома.", name_en: "Corrupt Judge's Signet Ring", desc_en: "Judge tallies bribes at gambling den VIP table." }
      ],
      alchemy: [
        { name: "Зелье невидимости", desc: "Экстракт призрачной пыльцы и ртути. Малейшее падение температуры кристаллизует осадок.", name_en: "Potion of Invisibility", desc_en: "Extract of phantom pollen and quicksilver; temp drops cause sediment to crystalize." },
        { name: "Яд 'Дыхание Василиска'", desc: "Смертоносный состав, требующий быстрого добавления нейтрализатора перед кипением.", name_en: "Basilisk's Breath Toxin", desc_en: "Lethal concoction requiring prompt neutralizer prior to boiling." },
        { name: "Настойка каменной кожи", desc: "Тяжелая суспензия толченого алмаза и лавы. Требует бешеной температуры поддува.", name_en: "Stoneskin Draught", desc_en: "Dense slurry of crushed diamonds and lava; demands fierce bellows heat." }
      ]
    }
  },
  3: {
    tierName: "Тир 3 (11–16 ур. Защитники мира)",
    tierName_en: "Tier 3 (Lvl 11–16 Masters)",
    defaultDC: 21,
    dcRange: [19, 23],
    timer: 25,
    attempts: 2,
    objects: {
      lockpick: [
        { name: "Адамантиновый ларец повелителя демонов", desc: "Замок вкован в живую кость, штифты двигаются под влиянием инфернальной воли.", name_en: "Demon Lord's Adamantine Coffer", desc_en: "Lock forged in living bone, tumblers shifting under infernal will." },
        { name: "Врата Хранилища Вечности в Сигиле", desc: "Механизм Механуса с шестью уровнями независимых затворов.", name_en: "Vault of Eternity Gates in Sigil", desc_en: "Mechanus apparatus with six tiers of independent locks." },
        { name: "Шкатулка с филактерией лича", desc: "Защищена проклятием: неверный угол отмычки высасывает жизненные силы.", name_en: "Lich's Phylactery Casket", desc_en: "Cursed ward: improper pick angle drains vital lifeforce." }
      ],
      trap: [
        { name: "Ловушка расщепления (Disintegrate)", desc: "Кристаллический фокусирующий луч, готовый испепелить всё в радиусе 10 футов.", name_en: "Disintegration Ray Trap", desc_en: "Focusing crystal ray primed to incinerate all within 10 feet." },
        { name: "Гравитационная воронка Бездны", desc: "При размыкании сдерживающего контура открывается портал отрицательной энергии.", name_en: "Abyssal Gravity Singularity", desc_en: "Rupturing containment field unleashes a negative energy tear." },
        { name: "Стена лезвий из жидкого адамантина", desc: "Высокоточный часовой механизм, активируемый малейшей вибрацией воздуха.", name_en: "Liquid Adamantine Blade Wall", desc_en: "Precision clockwork triggered by slightest ambient vibration." }
      ],
      runes: [
        { name: "Печать Первородного Титана", desc: "Древнейшие проторуны созидания, требующие идеального резонанса стихий.", name_en: "Primordial Titan's Seal", desc_en: "Ancient protorunes of genesis requiring pure elemental resonance." },
        { name: "Звездный код Астрального Корабля", desc: "Созвездия гитов, проецируемые чистым светом во вращающиеся сферы.", name_en: "Astral Ship Starlight Cipher", desc_en: "Gith constellations projected in pure light upon revolving spheres." },
        { name: "Узилище Архидьявола", desc: "Пентаграмма кровавых рун с защитным кодом истинного имени.", name_en: "Archdevil's Binding Pentagram", desc_en: "Blood-rune pentagram bound by true-name security cipher." }
      ],
      pickpocket: [
        { name: "Око Истины у чемпиона титанов", desc: "Существо обладает истинным зрением (Truesight) и невероятным чутьем.", name_en: "Titan Champion's Eye of Truth", desc_en: "Being possesses Truesight and extraordinary sixth sense." },
        { name: "Флакон с эссенцией бога у архиепископа", desc: "Постоянно под наблюдением духов-хранителей и магических сенсоров.", name_en: "Archbishop's Divine Essence Phial", desc_en: "Constant vigilance of guardian spirits and divination sensors." },
        { name: "Ключ от портала стихий у джинна", desc: "Джинн парит над полом, его одежда постоянно развевается ураганным ветром.", name_en: "Djinn's Elemental Portal Key", desc_en: "Djinn hovers above floor, robes whipping in perpetual gale." }
      ],
      alchemy: [
        { name: "Эликсир вечной молодости", desc: "Ингредиенты: пыльца феникса, первородная вода. Нестабилен до последней секунды реакции.", name_en: "Elixir of Eternal Youth", desc_en: "Phoenix dust and primordial water; unstable until final reaction second." },
        { name: "Зелье Высшего Лечения (Supreme Healing)", desc: "Сверхконцентрированная святая амброзия, требующая ювелирного баланса фаз.", name_en: "Potion of Supreme Healing", desc_en: "Super-concentrated ambrosia demanding surgical phase balance." },
        { name: "Слезы Тиамат", desc: "Пять разнородных эссенций драконьего дыхания в состоянии критической нестабильности.", name_en: "Tears of Tiamat", desc_en: "Five chromatic dragonbreath essences in critical instability." }
      ]
    }
  },
  4: {
    tierName: "Тир 4 (17–20 ур. Богоподобные легенды)",
    tierName_en: "Tier 4 (Lvl 17–20 Legends)",
    defaultDC: 26,
    dcRange: [25, 29],
    timer: 20,
    attempts: 2,
    objects: {
      lockpick: [
        { name: "Замок Врат Времени в Хроносфере", desc: "Замок существует одновременно в прошлом и будущем; штифты подчиняются законам парадокса.", name_en: "Chronosphere Time Gate Lock", desc_en: "Lock exists simultaneously in past and future; pins obey paradox." },
        { name: "Сердце Механического Бога Механуса", desc: "Сложнейшее творение Модронов с нулевым допуском на погрешность.", name_en: "Heart of the Mechanus Machine God", desc_en: "Pinnacle of Modron craftsmanship with zero tolerance margin." },
        { name: "Клеть для сдерживания Старшего Древнего", desc: "Защитные цепи сотканы из темной материи и первозданного вакуума.", name_en: "Elder One Containment Cage", desc_en: "Warded chains spun from dark matter and primal vacuum." }
      ],
      trap: [
        { name: "Схлопыватель Реальности (Sphere of Annihilation)", desc: "Критическая ошибка мгновенно стирает комнату из ткани мироздания.", name_en: "Sphere of Annihilation Trap", desc_en: "Slip instantly erases chamber from fabric of reality." },
        { name: "Временная петля забвения", desc: "Проволока из чистого времени: при ошибке партия выбрасывается в астральный лимб.", name_en: "Temporal Loop of Oblivion", desc_en: "Tether of pure time: trips party into astral purgatory." },
        { name: "Метеоритный триггер Небесного Суда", desc: "Орбитальный спусковой механизм богов правосудия.", name_en: "Celestial Judgment Meteor Trigger", desc_en: "Orbital kinetic trigger of justice deities." }
      ],
      runes: [
        { name: "Слова Власти Создателя (Power Word)", desc: "Первичный язык творения вселенной, сжигающий рассудок смертных при искажении.", name_en: "Creator's Power Words", desc_en: "Primal language of creation; scorches mortal minds on mispronunciation." },
        { name: "Матрица сдерживания Тарраска", desc: "Космический лабиринт рун, удерживающий чудовище в стазисе.", name_en: "Tarrasque Stasis Matrix", desc_en: "Cosmic labyrinth of wards binding the beast in stasis." },
        { name: "Печать над Колодцем Забвения", desc: "Глифы, стирающие само воспоминание о том, кто пытается их прочесть.", name_en: "Seal over Well of Oblivion", desc_en: "Glyphs eroding memory of anyone attempting decryption." }
      ],
      pickpocket: [
        { name: "Нить судьбы из рук Норн", desc: "Попытка украсть саму ткань рока из-под носа богинь судьбы.", name_en: "Norns' Thread of Fate", desc_en: "Stealing the fabric of doom from under the fate goddesses' noses." },
        { name: "Корона Владыки Преисподней Асмодея", desc: "Аура ужаса и всеведения; малейший тремор руки означает вечное рабство души.", name_en: "Crown of Asmodeus, Lord of Hell", desc_en: "Aura of dread and omniscience; tremor damns soul eternally." },
        { name: "Зерно Новой Вселенной", desc: "Спрятано в складках пространственной мантии странника измерений.", name_en: "Seed of a New Universe", desc_en: "Concealed within spatial folds of dimensional wanderer's robe." }
      ],
      alchemy: [
        { name: "Философский Камень в жидкой форме", desc: "Трансмутация самой ткани элементов; выделяет плазму при малейшем дисбалансе.", name_en: "Liquid Philosopher's Stone", desc_en: "Transmutation of elemental fabric; radiates plasma on flux." },
        { name: "Эликсир Богоподобия", desc: "Смешение звездного огня и крови богов. Реакция идет на грани ядерного синтеза.", name_en: "Elixir of Godhood", desc_en: "Starlight fire and celestial blood; reaction skirts nuclear synthesis." },
        { name: "Анти-вещество Пустоты", desc: "Контролируемое удержание сингулярности в алхимической колбе.", name_en: "Void Antimatter", desc_en: "Controlled confinement of a singularity inside an alchemy flask." }
      ]
    }
  }
};

/**
 * Класс управления логикой D&D
 */
export class DndEngine {
  constructor() {
    this.currentTier = 2;
    this.dc = 16;
    this.bonus = 3;
    this.mode = 'realtime'; // 'realtime' | 'turnbased'
    this.timeLimit = 35; // в секундах
    this.maxAttempts = 3;
    this.currentChallenge = null;
  }

  setTier(tierNum) {
    this.currentTier = parseInt(tierNum, 10) || 2;
    const preset = TIER_PRESETS[this.currentTier];
    if (preset) {
      this.dc = preset.defaultDC;
      this.timeLimit = preset.timer;
      this.maxAttempts = preset.attempts;
    }
  }

  setDC(val) {
    this.dc = Math.max(5, Math.min(32, parseInt(val, 10)));
  }

  setBonus(val) {
    this.bonus = Math.max(-5, Math.min(15, parseInt(val, 10)));
  }

  setMode(mode) {
    this.mode = mode === 'turnbased' ? 'turnbased' : 'realtime';
  }

  setTimeLimit(sec) {
    this.timeLimit = Math.max(10, Math.min(120, parseInt(sec, 10)));
  }

  setAttempts(count) {
    this.maxAttempts = Math.max(1, Math.min(8, parseInt(count, 10)));
  }

  getEffectiveAdvantage() {
    const targetRoll = this.dc - this.bonus;
    return {
      targetRoll,
      toleranceFactor: Math.max(0.45, Math.min(2.2, 1.0 + (this.bonus * 2 - (this.dc - 10)) * 0.05)),
      extraDurability: Math.max(0, Math.floor(this.bonus / 3))
    };
  }

  generateRandomChallenge(gameType = 'lockpick') {
    const tierData = TIER_PRESETS[this.currentTier] || TIER_PRESETS[2];
    const items = tierData.objects[gameType] || tierData.objects.lockpick;
    const randomItem = items[Math.floor(Math.random() * items.length)];

    const [minDC, maxDC] = tierData.dcRange;
    const randomDC = Math.floor(Math.random() * (maxDC - minDC + 1)) + minDC;
    this.dc = randomDC;

    this.currentChallenge = {
      gameType,
      name: randomItem.name,
      desc: randomItem.desc,
      name_en: randomItem.name_en || randomItem.name,
      desc_en: randomItem.desc_en || randomItem.desc,
      dc: this.dc,
      tier: this.currentTier,
      tierName: tierData.tierName,
      tierName_en: tierData.tierName_en || tierData.tierName
    };

    return this.currentChallenge;
  }

  evaluateOutcome({ success, timeSpent, mistakes, noiseLevel, gameType = 'lockpick', language }) {
    const isEn = language === 'en' || getCurrentLanguage() === 'en';
    const noisePercent = Math.min(100, Math.max(0, Math.round(noiseLevel)));
    const isCriticalSuccess = success && mistakes === 0 && noisePercent <= 15 && timeSpent <= (this.timeLimit * 0.5);
    const isPartialSuccess = success && (mistakes > 0 || noisePercent >= 60 || timeSpent >= this.timeLimit * 0.85);

    let resultType = 'FAILURE';
    let crest = '💀';
    let title = isEn ? 'Challenge Failed!' : 'Провал испытания!';
    let subtitle = '';
    let narrative = '';
    let toolsLabel = isEn ? 'Tool Condition:' : 'Состояние инструментов:';
    let toolsStatus = isEn ? 'Damaged' : 'Повреждены';
    let noiseStatus = `${noisePercent}%`;

    // Оценка шума
    if (noisePercent < 25) {
      noiseStatus += isEn ? ' (Complete silence)' : ' (Полная тишина)';
    } else if (noisePercent < 60) {
      noiseStatus += isEn ? ' (Suspicious rustle / click)' : ' (Подозрительный шорох / щелчок)';
    } else {
      noiseStatus += isEn ? ' (LOUD NOISE! Guards alerted)' : ' (ГРОМКИЙ ЗВУК! Внимание стражи)';
    }

    const toolLabelsMapRu = {
      lockpick: 'Состояние отмычек:',
      trap: 'Инструменты сапёра:',
      runes: 'Эфирный контур:',
      pickpocket: 'Скрытность и маскировка:',
      alchemy: 'Состояние тигля и зелья:'
    };
    const toolLabelsMapEn = {
      lockpick: 'Lockpicks Condition:',
      trap: 'Sapper Tools:',
      runes: 'Aetheric Conduit:',
      pickpocket: 'Stealth & Disguise:',
      alchemy: 'Crucible & Potion State:'
    };
    toolsLabel = isEn ? (toolLabelsMapEn[gameType] || 'Tool Condition:') : (toolLabelsMapRu[gameType] || 'Состояние инструментов:');

    const trapDmgDice = this.currentTier === 1 ? '2d10' : this.currentTier === 2 ? '4d10' : '8d10';
    const partialTrapDmg = this.currentTier === 1 ? '1d8' : this.currentTier === 2 ? '3d8' : '6d8';

    if (isCriticalSuccess) {
      resultType = 'CRITICAL_SUCCESS';
      crest = '🌟';
      title = isEn ? 'Critical Triumph!' : 'Критический Триумф!';
      subtitle = isEn ? 'Challenge overcome flawlessly with surgical precision!' : 'Испытание пройдено безупречно с филигранным мастерством!';

      if (gameType === 'lockpick') {
        toolsStatus = isEn ? 'Pristine (0 broken)' : 'Идеальное (0 сломано)';
        narrative = isEn 
          ? 'DM: The lock yielded silently like silk! Not a single stray click. The guards behind the door suspect nothing. Recommend awarding Inspiration or bonus loot in the chest!'
          : 'Мастер: Замок поддался бесшумно, как по маслу! Ни единого лишнего шороха. Охрана за дверью ничего не заподозрила. Рекомендуется выдать вдохновение (Inspiration) или скрытый бонус в сундуке!';
      } else if (gameType === 'trap') {
        toolsStatus = isEn ? 'All circuits disarmed without damage' : 'Все контуры разряжены без повреждений';
        narrative = isEn
          ? 'DM: The trap was disarmed with surgical precision! The character salvages intact blasting primers and valuable trap components as a trophy.'
          : 'Мастер: Ловушка деактивирована с хирургической точностью! Персонаж сохранил все детонационные капсюли и ценные компоненты ловушки себе как трофей.';
      } else if (gameType === 'runes') {
        toolsStatus = isEn ? 'Absolute aetheric resonance' : 'Абсолютный эфирный резонанс';
        narrative = isEn
          ? 'DM: The runic seal unlocked harmoniously, blessing the character (+1d4 to next ability check within 1 hour).'
          : 'Мастер: Руническая печать гармонично открылась, наполнив персонажа благословением (+1d4 к следующей проверке характеристик в течение 1 часа).';
      } else if (gameType === 'pickpocket') {
        toolsStatus = isEn ? 'Undetected (victim oblivious)' : 'Полная невидимость (жертва в неведении)';
        narrative = isEn
          ? 'DM: Flawless heist! The loot slid into the rogue\'s sleeve so smoothly the mark will not notice until the following morning.'
          : 'Мастер: Филигранная кража! Добыча скользнула в рукав так мягко, что жертва не заметит пропажу вплоть до следующего утра.';
      } else if (gameType === 'alchemy') {
        toolsStatus = isEn ? 'Crystal-clear masterwork elixir' : 'Кристально чистый эликсир высшего качества';
        narrative = isEn
          ? 'DM: Brewed with impeccable essence balance! The potion yields maximum possible effect without rolling dice, or lasts twice as long.'
          : 'Мастер: Зелье сварено с идеальным балансом эссенций! Оно даёт максимальный возможный эффект без броска костей или действует вдвое дольше.';
      }
    } else if (success && !isPartialSuccess) {
      resultType = 'SUCCESS';
      crest = '🏆';
      title = isEn ? 'Clean Success!' : 'Чистый Успех!';
      subtitle = isEn ? 'Objective accomplished well within safe boundaries.' : 'Цель успешно достигнута в пределах допустимого риска.';

      if (gameType === 'lockpick') {
        toolsStatus = mistakes === 0 ? (isEn ? 'Undamaged' : 'Без повреждений') : (isEn ? `Lockpicks spent: ${mistakes}` : `Потрачено отмычек: ${mistakes}`);
        narrative = isEn
          ? 'DM: The lock is cleanly picked. The party gains access to the contents; the situation remains fully in control.'
          : 'Мастер: Замок успешно взломан. Партия получает доступ к содержимому, ситуация под полным контролем.';
      } else if (gameType === 'trap') {
        toolsStatus = isEn ? 'Mechanism disarmed' : 'Механизм обезврежен';
        narrative = isEn
          ? 'DM: All combat triggers have been safely dismantled, clearing the corridor for the party.'
          : 'Мастер: Все боевые триггеры ловушки успешно сняты, путь для партии свободен.';
      } else if (gameType === 'runes') {
        toolsStatus = isEn ? 'Conduits aligned, seal cleared' : 'Каналы замкнуты, печать снята';
        narrative = isEn
          ? 'DM: The magical barrier shimmers and fades away, opening the secret portal or unsealing the scroll.'
          : 'Мастер: Магический барьер мерцает и гаснет, тайный проход или свиток открыт.';
      } else if (gameType === 'pickpocket') {
        toolsStatus = isEn ? 'Item in thief\'s hands' : 'Предмет в руках вора';
        narrative = isEn
          ? 'DM: The heist succeeded, and the thief melted safely back into the crowd with the stolen prize.'
          : 'Мастер: Кража удалась, персонаж благополучно отступил обратно в толпу с добычей.';
      } else if (gameType === 'alchemy') {
        toolsStatus = isEn ? 'Potion ready for consumption' : 'Зелье готово к употреблению';
        narrative = isEn
          ? 'DM: The chemical reaction proceeded smoothly. The draught is bottled into flasks and ready to drink.'
          : 'Мастер: Реакция прошла штатно, состав разлит по склянкам и готов к применению.';
      }
    } else if (isPartialSuccess) {
      resultType = 'PARTIAL_SUCCESS';
      crest = '⚖️';
      title = isEn ? 'Success at a Cost!' : 'Успех с Осложнением!';
      subtitle = isEn ? 'Objective achieved, but the party paid a toll.' : 'Цель достигнута, но партия заплатила определенную цену.';

      if (gameType === 'lockpick') {
        toolsStatus = isEn ? `Bent / broken lockpicks (${mistakes} pcs)` : `Погнуты / сломаны отмычки (${mistakes} шт.)`;
        narrative = isEn
          ? 'DM: The lock clicked open, but the final lockpick snapped with a loud clang. Nearby guards perk up and head to inspect the source in 1d4 rounds!'
          : 'Мастер: Замок щелкнул и открылся, но последняя отмычка застряла или лопнула со звоном. Ближайший патруль насторожился и направляется проверить источник шума через 1d4 раундов!';
      } else if (gameType === 'trap') {
        toolsStatus = isEn ? `Tools singed (${mistakes} slips)` : `Инструменты опалены (${mistakes} сбоев)`;
        narrative = isEn
          ? `DM: Trap disarmed, but a secondary charge discharged! The character ducked in time, taking partial damage (${partialTrapDmg}) with noise heightened.`
          : `Мастер: Ловушка обезврежена, но остаточный заряд сдетонировал! Персонаж успел отпрыгнуть, но получает часть урона (${partialTrapDmg}) и уровень шума повышен.`;
      } else if (gameType === 'runes') {
        toolsStatus = isEn ? 'Residual aetheric backfire' : 'Остаточное искривление эфира';
        narrative = isEn
          ? 'DM: The ward opened, but an arcane energy burst blinds the character for 1 minute or draws attention from ethereal predators.'
          : 'Мастер: Печать открылась, но вспышка арканной энергии ослепляет персонажа на 1 минуту или привлекает внимание эфирных созданий.';
      } else if (gameType === 'pickpocket') {
        toolsStatus = isEn ? 'Suspicion aroused' : 'Подозрение вызвано';
        narrative = isEn
          ? 'DM: The pouch was cut, but the victim felt the pull and is turning around! Requires a Deception check or immediate flight.'
          : 'Мастер: Кошель срезан, но жертва почувствовала прикосновение и оборачивается! Нужна проверка Обмана (Deception) или немедленный побег.';
      } else if (gameType === 'alchemy') {
        toolsStatus = isEn ? 'Unstable precipitate' : 'Осадок нестабилен';
        narrative = isEn
          ? 'DM: The potion was brewed, but temperature fluctuations induced a side-effect (e.g. temporary movement penalty or turning skin the brew\'s color).'
          : 'Мастер: Зелье сварено, но из-за скачка температуры имеет побочный эффект (например, снижает скорость или окрашивает кожу в цвет зелья).';
      }
    } else {
      const isCriticalFail = mistakes >= this.maxAttempts || timeSpent <= 0.1 || noisePercent >= 85;
      if (isCriticalFail) {
        resultType = 'CRITICAL_FAILURE';
        crest = '💥';
        title = isEn ? 'Catastrophic Failure!' : 'Катастрофический Провал!';
        subtitle = isEn ? 'Worst-case outcome triggered: full alert or detonation!' : 'Сработал худший сценарий: тревога или детонация!';

        if (gameType === 'lockpick') {
          toolsStatus = isEn ? 'Picks snapped and jammed mechanism' : 'Отмычки сломались и намертво застряли';
          narrative = isEn
            ? 'DM: The lock mechanism is permanently jammed with jagged pick shrapnel! Picking is impossible. Requires Knock spell or a noisy Athletics check; full alert raised!'
            : 'Мастер: Механизм намертво заклинило обломками отмычек! Взлом невозможен. Требуется заклинание "Стук" (Knock) или грубая сила Атлетики со штрафом, поднята тревога!';
        } else if (gameType === 'trap') {
          toolsStatus = isEn ? 'Tools destroyed in detonation' : 'Инструменты уничтожены взрывом';
          narrative = isEn
            ? `DM: The primer detonated! The trap exploded, dealing ${trapDmgDice} damage to the entire party within 15 ft. The stronghold is in total uproar!`
            : `Мастер: Боевой детонатор сработал! Ловушка взорвалась, нанося ${trapDmgDice} урона всей партии в радиусе 15 футов. Вся цитадель поднята на уши!`;
        } else if (gameType === 'runes') {
          toolsStatus = isEn ? 'Conduit energy collapse' : 'Энергетический коллапс контура';
          narrative = isEn
            ? 'DM: Protective runes detonated in a magical discharge! The character is blasted back by the shockwave as alarm glyphs screech through the dungeon.'
            : 'Мастер: Защитные руны сдетонировали магическим взрывом! Персонаж отброшен ударной волной, а тревожный глиф оглашает подземелье звуковой сиреной.';
        } else if (gameType === 'pickpocket') {
          toolsStatus = isEn ? 'Caught red-handed' : 'Пойман за руку на месте преступления';
          narrative = isEn
            ? 'DM: The victim seized the rogue\'s wrist in an iron grip! A shout of "Thief!" echoes through the streets as guards immediately draw steel.'
            : 'Мастер: Жертва перехватила руку вора железной хваткой! Крик "Держи вора!" оглашает улицу, стража немедленно атакует.';
        } else if (gameType === 'alchemy') {
          toolsStatus = isEn ? 'Crucible shattered to pieces' : 'Котел разорван на части';
          narrative = isEn
            ? 'DM: Critical thermal runaway! The crucible ruptured in toxic shrapnel and acrid smoke. All creatures in the room must make a Con save against poison.'
            : 'Мастер: Критический перегрев! Котел взорвался ядовитыми брызгами и едким паром. Все в комнате совершают спасбросок Телосложения против отравления.';
        }
      } else {
        resultType = 'FAILURE';
        crest = '❌';
        title = isEn ? 'Failure!' : 'Неудача!';
        subtitle = isEn ? 'The attempt did not succeed. A different approach is needed.' : 'Испытание не увенчалось успехом. Требуется иной подход.';

        if (gameType === 'lockpick') {
          toolsStatus = isEn ? `Lockpicks spent: ${mistakes}` : `Потрачено отмычек: ${mistakes}`;
          narrative = isEn
            ? 'DM: The lock resists your touch; the tumblers are too rigid. The party might search for a key, bypass the obstacle, or batter the door down.'
            : 'Мастер: Замок не поддался, механизм слишком тугой. Персонажи могут попробовать найти ключ, обойти препятствие или выбить дверь.';
        } else if (gameType === 'trap') {
          toolsStatus = isEn ? 'Mechanism locked in armed state' : 'Механизм заблокирован во взведенном состоянии';
          narrative = isEn
            ? 'DM: Unable to disarm. The trigger wires are wound dangerously tight; further tinkering will trigger instant detonation.'
            : 'Мастер: Обезвредить не удалось. Спусковые нити слишком натянуты, дальнейшие манипуляции гарантированно вызовут детонацию.';
        } else if (gameType === 'runes') {
          toolsStatus = isEn ? 'Conduit locked' : 'Контур заблокирован';
          narrative = isEn
            ? 'DM: The mana dissipated, and the runes dimmed under a hardened shell. A short rest is required to restore aetheric flow.'
            : 'Мастер: Энергия рассеялась, руны потускнели и закрылись защитной коркой. Потребуется короткий отдых для восстановления эфира.';
        } else if (gameType === 'pickpocket') {
          toolsStatus = isEn ? 'Stealth lost' : 'Скрытность потеряна';
          narrative = isEn
            ? 'DM: The victim shifted away and tucked the pouch under their cloak. The window is gone; another attempt requires a diversion.'
            : 'Мастер: Жертва отошла или спрятала кошель под плащ. Момент упущен, повторная попытка невозможна без отвлечения.';
        } else if (gameType === 'alchemy') {
          toolsStatus = isEn ? 'Concoction spoiled' : 'Состав испорчен';
          narrative = isEn
            ? 'DM: The brew curdled and cooled into useless sludge. The rare ingredients are irrevocably wasted.'
            : 'Мастер: Зелье расслоилось и остыло в бесполезный ил. Ингредиенты безвозвратно потрачены.';
        }
      }
    }

    return {
      resultType,
      crest,
      title,
      subtitle,
      timeFormatted: isEn ? `${timeSpent.toFixed(1)} s` : `${timeSpent.toFixed(1)} сек`,
      noiseStatus,
      toolsLabel,
      toolsStatus,
      narrative
    };
  }
}

export const dnd = new DndEngine();
