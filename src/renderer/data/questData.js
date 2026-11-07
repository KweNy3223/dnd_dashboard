// База данных для Генератора квестов, контрактов и слухов (D&D 5e Quest Generator)
export const QUEST_CATEGORIES = [
  { id: 'any', label: 'Любая категория', label_en: 'Any category' },
  { id: 'hunt', label: 'Охота на чудовищ', label_en: 'Monster Hunt & Extermination' },
  { id: 'mystery', label: 'Тайны и расследования', label_en: 'Mysteries & Investigations' },
  { id: 'escort', label: 'Сопровождение и спасение', label_en: 'Escort & Rescue' },
  { id: 'relic', label: 'Реликвии и подземелья', label_en: 'Relics & Dungeon Delving' },
  { id: 'underworld', label: 'Преступный мир и интриги', label_en: 'Underworld & Heists' }
];

export const CLIENT_TYPES = [
  { 
    role: 'Местный староста', 
    role_en: 'Town Elder / Burgomaster', 
    vibe: 'усталый, отчаявшийся и готовый отдать последние сбережения общины',
    vibe_en: 'exhausted, desperate, willing to spend the village\'s last emergency coppers'
  },
  { 
    role: 'Зажиточный купец', 
    role_en: 'Wealthy Guild Merchant', 
    vibe: 'нервный, скуповатый, постоянно оглядывается по сторонам',
    vibe_en: 'nervous, tight-fisted, glances anxiously over both shoulders'
  },
  { 
    role: 'Жрица местного храма', 
    role_en: 'Temple High Priestess', 
    vibe: 'спокойная, говорит притчами, скрывает истинные масштабы угрозы',
    vibe_en: 'composed, speaks in solemn parables, concealing the true magnitude of the evil'
  },
  { 
    role: 'Командир городской стражи', 
    role_en: 'City Watch Captain', 
    vibe: 'суровый, действует негласно в обход бюрократии городского совета',
    vibe_en: 'grim, operating off-the-books to bypass sluggish city council red tape'
  },
  { 
    role: 'Таинственный незнакомец в капюшоне', 
    role_en: 'Cloaked Stranger', 
    vibe: 'платит чеканным золотом неизвестного королевства',
    vibe_en: 'pays upfront in stamped golden coins from an unknown fallen kingdom'
  },
  { 
    role: 'Хозяин загородной таверны', 
    role_en: 'Roadside Innkeeper', 
    vibe: 'весёлый с виду, но в глазах застыл неподдельный страх за семью',
    vibe_en: 'jovial on the surface, but raw paternal dread burns in his eyes'
  },
  { 
    role: 'Учёный-арканист', 
    role_en: 'Eccentric Arcanist', 
    vibe: 'эксцентричный, его мало волнует опасность, важен лишь научный образец',
    vibe_en: 'unconcerned with mortal peril; cares strictly for rare magical specimens'
  },
  { 
    role: 'Опальный дворянин', 
    role_en: 'Disgraced Nobleman', 
    vibe: 'горделивый, пытается сохранить лицо при явной нехватке влияния',
    vibe_en: 'haughty, striving to maintain aristocratic poise despite dwindling influence'
  }
];

export const QUEST_TEMPLATES = {
  hunt: [
    {
      titlePrefix: 'Клыки в тумане',
      titlePrefix_en: 'Fangs in the Mist',
      goal: 'Выследить и истребить стаю падальщиков, терроризирующих старый тракт.',
      goal_en: 'Track down and exterminate a pack of ravenous carrion beasts stalking the trade road.',
      twist: 'Звери подчиняются воле одичавшего друида, защищающего древний алтарь от вырубки.',
      twist_en: 'The beasts are commanded by a reclusive wild druid defending an ancient shrine from loggers.',
      location: 'Заболоченная низина у Чёрных Ив',
      location_en: 'Black Willow Marsh Basin',
      urgency: 'До следующего полнолуния (2 дня)',
      urgency_en: 'Before the full moon (2 days)'
    },
    {
      titlePrefix: 'Тень над шахтами',
      titlePrefix_en: 'Shadow Over the Mines',
      goal: 'Уничтожить пещерного ужаса, пробившего штольню в заброшенный горизонт.',
      goal_en: 'Slay the subterranean burrowing horror that breached the abandoned lower mine shaft.',
      twist: 'Тварь охраняет кладку яиц, а шахтовладелец хочет захватить детёнышей для подпольных боёв.',
      twist_en: 'The creature is protecting her nest; the greedy mine baron wants the eggs for pit fights.',
      location: 'Глубокие выработки Старого Шурфа',
      location_en: 'Deep Shafts of Old Pit',
      urgency: 'Срочно — рабочие объявили забастовку',
      urgency_en: 'Urgent — miners refuse to descend'
    },
    {
      titlePrefix: 'Крылатый кошмар холмов',
      titlePrefix_en: 'Winged Nightmare of the Crags',
      goal: 'Добыть голову мантикоры, утаскивающей домашний скот и одиноких пастухов.',
      goal_en: 'Claim the head of a rogue manticore carrying off farm cattle and lone shepherds.',
      twist: 'Мантикора ранена отравленным гарпуном браконьеров и обезумела от агонии.',
      twist_en: 'The manticore was crazed with agony from a poacher\'s barbed poison harpoon lodged in its flank.',
      location: 'Ветреные утесы Гнездовья',
      location_en: 'Wind-Swept Aerie Cliffs',
      urgency: 'В течение недели',
      urgency_en: 'Within a week'
    }
  ],
  mystery: [
    {
      titlePrefix: 'Молчание архивного зала',
      titlePrefix_en: 'Silence in the Scriptorium',
      goal: 'Выяснить, кто похитил запретный гримуар из запертого хранилища библиотеки.',
      goal_en: 'Uncover who stole the forbidden black grimoire from the sealed monastery vault.',
      twist: 'Книга сама подчинила разум младшего послушника и заставила его сбежать в катакомбы.',
      twist_en: 'The tome itself charmed the mind of an innocent novice, compelling him to flee into catacombs.',
      location: 'Подземные хранилища аббатства Знаний',
      location_en: 'Catacombs of the Lore Abbey',
      urgency: 'До приезда верховного инквизитора',
      urgency_en: 'Before the Grand Inquisitor arrives'
    },
    {
      titlePrefix: 'Яд в благородном доме',
      titlePrefix_en: 'Venom in the Manor',
      goal: 'Найти источник яда, медленно убивающего молодого наследника торгового дома.',
      goal_en: 'Identify the slow poison afflicting the young heir of a prominent merchant house.',
      twist: 'Яд содержится в краске фамильного портрета, подаренного его «верным» дядей.',
      twist_en: 'The toxin is mixed into the oils of a family portrait gifted by his "doting" uncle.',
      location: 'Особняк рода Вальдер',
      location_en: 'Valder Family Estate',
      urgency: 'Счёт идёт на часы',
      urgency_en: 'Time is measured in hours'
    },
    {
      titlePrefix: 'Призрачный стук за стеной',
      titlePrefix_en: 'Midnight Knock Behind the Wall',
      goal: 'Разобраться с ночными звуками и криками в недавно выкупленном доходном доме.',
      goal_en: 'Investigate horrific nightly knocking and screams in a newly purchased tenement hall.',
      twist: 'В подвале замурован тайник контрабандистов, и они пытаются вырыть проход снаружи.',
      twist_en: 'Smugglers are tunneling from the sewer to reclaim a sealed cache of uncut gems.',
      location: 'Квартал Ремесленников, дом № 7',
      location_en: 'Artisan Square, Tenement #7',
      urgency: 'Жильцы грозятся съехать завтра',
      urgency_en: 'Tenants threaten to abandon by dawn'
    }
  ],
  escort: [
    {
      titlePrefix: 'Опасный транзит',
      titlePrefix_en: 'Hazardous Transit',
      goal: 'Сопроводить закрытый фургон с алхимическими реактивами через горное ущелье.',
      goal_en: 'Escort a sealed wagon carrying explosive alchemical reagents through an alpine gorge.',
      twist: 'Груз крайне нестабилен при тряске, а на перевале засела банда с огненными стрелами.',
      twist_en: 'Vibration makes the vials unstable; bandits with flaming arrows lie in ambush at the pass.',
      location: 'Змеиный перевал в Серых горах',
      location_en: 'Serpent Pass in the Grey Crags',
      urgency: 'Отправление на рассвете',
      urgency_en: 'Departs at daybreak'
    },
    {
      titlePrefix: 'Беглая невеста',
      titlePrefix_en: 'The Runaway Bride',
      goal: 'Найти и вернуть сбежавшую дочь барона до того, как огласка разрушит династический союз.',
      goal_en: 'Track down and retrieve a baron\'s missing daughter before scandal shatters a noble alliance.',
      twist: 'Девушка сбежала не с любовником, а чтобы вступить в тайный орден охотников на ведьм.',
      twist_en: 'She did not flee for love, but to take vows in a clandestine order of witch hunters.',
      location: 'Приграничные вольные пустоши',
      location_en: 'Frontier Free Marches',
      urgency: '3 дня до церемонии',
      urgency_en: '3 days until royal nuptials'
    },
    {
      titlePrefix: 'Пилигримы на тропе войны',
      titlePrefix_en: 'Pilgrims on the Warpath',
      goal: 'Провести группу безоружных паломников к святилищу сквозь территорию орков.',
      goal_en: 'Guide a group of unarmed pilgrims to a secluded mountaintop shrine across hostile orc territory.',
      twist: 'Среди паломников скрывается шпион враждебного лорда с картой укреплений.',
      twist_en: 'A spy disguised among the devout carries classified fort maps for a rival warlord.',
      location: 'Долина Белых Камней',
      location_en: 'White Stone Valley',
      urgency: 'Праздник Солнцестояния через 4 дня',
      urgency_en: 'Solstice festival in 4 days'
    }
  ],
  relic: [
    {
      titlePrefix: 'Осколок затерянной эпохи',
      titlePrefix_en: 'Shard of the Forgotten Epoch',
      goal: 'Проникнуть в затопленный храмовый комплекс и извлечь звёздную линзу.',
      goal_en: 'Infiltrate a submerged sunken temple complex and recover an ancient starlight prism lens.',
      twist: 'Механизм храма активирует приливные ловушки, запирающие выход при снятии реликвии.',
      twist_en: 'Removing the relic triggers flood sluices that seal all exits beneath swirling waters.',
      location: 'Затонувший храм Аквамарин',
      location_en: 'Sunken Aquamarine Fane',
      urgency: 'Во время низкого отлива (сегодня ночью)',
      urgency_en: 'During low spring tide (tonight)'
    },
    {
      titlePrefix: 'Печать королей-кузнецов',
      titlePrefix_en: 'Seal of the Forge Kings',
      goal: 'Отыскать фамильную наковальню клана в глубинах заброшенного бастиона дварфов.',
      goal_en: 'Recover an ancestral clan anvil from the deepest magma vaults of a ruined dwarven hold.',
      twist: 'Кузню облюбовал огненный саламандр, почитающий её как колыбель своего пламени.',
      twist_en: 'A fire salamander has claimed the forge as its nest, venerating the sacred heat.',
      location: 'Забытая цитадель Карак-Дум',
      location_en: 'Lost Citadel of Karak-Doom',
      urgency: 'Экспедиция конкурентов уже вышла',
      urgency_en: 'A rival mercenary team departed at noon'
    },
    {
      titlePrefix: 'Сердце голема',
      titlePrefix_en: 'Core of the Colossus',
      goal: 'Добыть висмутовый кристалл из древнего автоматона в разрушенной обсерватории.',
      goal_en: 'Harvest a bismuth core crystal from an ancient dormant automaton in a ruined observatory.',
      twist: 'Голем до сих пор функционирует и считает всех гостей нарушителями карантина.',
      twist_en: 'The automaton still functions and treats all visitors as contaminated quarantine violators.',
      location: 'Утёс Астрономов',
      location_en: 'Astronomer\'s Pinnacle',
      urgency: 'Пока не начался сезон штормов',
      urgency_en: 'Before the winter monsoon hits'
    }
  ],
  underworld: [
    {
      titlePrefix: 'Долг чести воровского дворика',
      titlePrefix_en: 'Honor Debt of Thieves\' Court',
      goal: 'Украсть долговую расписку из сейфа продажного ростовщика.',
      goal_en: 'Steal an extortionist debt promissory note from a corrupt loan shark\'s iron vault.',
      twist: 'Сейф защищён магической сигнализацией и живым мимиком внутри фальшивого ящика.',
      twist_en: 'The safe is rigged with silent alarm runes and houses a hungry mimic inside a decoy box.',
      location: 'Контора «Золотой Вексель» в Нижнем Городе',
      location_en: 'Golden Draft Exchange, Lower City',
      urgency: 'До полуночного обхода стражи',
      urgency_en: 'Before midnight guard patrol'
    },
    {
      titlePrefix: 'Фальшивая монета',
      titlePrefix_en: 'Counterfeit Mint',
      goal: 'Выследить подпольный монетный двор, наводнивший рынок порченым серебром.',
      goal_en: 'Track down a clandestine mint flooding the market with debased lead-core silver coins.',
      twist: 'Чеканкой тайно руководит казначей гильдии купцов, подставляя конкурентов.',
      twist_en: 'The mint is run by the Merchant Guild treasurer himself, framing his trade rivals.',
      location: 'Подвалы старой красильни у реки',
      location_en: 'Old Riverside Dye Works Cellar',
      urgency: 'Завтра начнется ярмарка',
      urgency_en: 'The Grand Solstice Fair opens tomorrow'
    },
    {
      titlePrefix: 'Тайная встреча в «Ржавом якоре»',
      titlePrefix_en: 'Rendezvous at the Rusty Anchor',
      goal: 'Перехватить письмо связного шпионской сети перед его передачей заказчику.',
      goal_en: 'Intercept an encoded spymaster dispatch before it reaches a foreign conspirator.',
      twist: 'Связного уже устранили, и в таверне вас ждёт засада наёмных убийц.',
      twist_en: 'The contact was already liquidated; an assassin kill-team awaits anyone who gives the password.',
      location: 'Портовые доки, тупик Висельников',
      location_en: 'Port Docks, Hangman\'s Cul-de-sac',
      urgency: 'Сегодня в полночь',
      urgency_en: 'Tonight at midnight'
    }
  ]
};

export const REWARD_PRESETS = [
  { ru: '75 ЗМ и рекомендательное письмо гильдии', en: '75 GP and an official Guild Letter of Recommendation' },
  { ru: '150 ЗМ звонкой монетой + бочонок выдержанного эля', en: '150 GP in freshly minted coin + a cask of vintage dwarven stout' },
  { ru: '250 ЗМ и Зелье лечения (х2)', en: '250 GP and Potions of Healing (×2)' },
  { ru: '400 ЗМ, драгоценный агат (50 зм) и обещание ответной услуги', en: '400 GP, banded agate gemstone (50 GP) and a sworn favor' },
  { ru: '500 ЗМ и Свиток заклинания 2-го круга', en: '500 GP and a 2nd-Level Spell Scroll' },
  { ru: 'По 60 ЗМ каждому члену отряда + бесплатный ночлег в таверне на месяц', en: '60 GP per party member + free comfortable tavern lodging for a month' },
  { ru: 'Старинный кинжал с гравировкой (+1 к попаданию) и 100 ЗМ', en: 'Engraved masterwork dagger (+1 to hit) and 100 GP' }
];

export const RUMOR_TABLE = {
  truths: [
    {
      ru: 'Говорят, в полночь у старой мельницы слышен лязг цепей — это стражники закапывают контрабанду.',
      en: 'They say at midnight iron chains rattle by the old watermill — corrupt watchmen bury contraband there.'
    },
    {
      ru: 'Травница на окраине не принимает медь: ей нужны только лесные коренья с границы топей.',
      en: 'The marsh herbalist refuses copper coins: she accepts only rare swamp roots from the bog fringe.'
    },
    {
      ru: 'Командир гарнизона ищет надёжных наёмников без знаков отличия для тайной миссии.',
      en: 'The garrison commander is quietly scouting sellswords with no insignia for a black-ops contract.'
    },
    {
      ru: 'В северной крипте обвалился потолок, обнажив проход в ещё более древние катакомбы.',
      en: 'A cave-in in the northern crypt unsealed an archway leading into pre-imperial catacombs.'
    }
  ],
  halftruths: [
    {
      ru: 'В лесу объявился оборотень! (На самом деле — изгнанный варвар в медвежьей шкуре, ворующий кур).',
      en: 'A ravenous werewolf stalks the woods! (In reality — an exiled barbarian clad in bear furs poaching hens).'
    },
    {
      ru: 'Старый ростовщик продал душу дьяволу за сундук рубинов! (Рубины фальшивые, а в сундуке ядовитый скорпион).',
      en: 'The old loan shark sold his soul for a chest of rubies! (The gems are glass; a venomous scorpion guards them).'
    },
    {
      ru: 'В реке завелась русалка, топящая лодки! (Это речные контрабандисты на подводном колоколе пугают зевак).',
      en: 'A siren drowns rowboats in the estuary! (River smugglers in a diving bell scaring away nosey guards).'
    },
    {
      ru: 'Во дворце бургомистра завелось привидение! (Слуги просто пускают сквозняки, воруя серебряные ложки).',
      en: 'A vengeful ghost haunts the manor! (Mischievous servants staging drafts while stealing silverware).'
    }
  ],
  fakes: [
    {
      ru: 'Если выпить три кружки гоблинского взвара залпом, сможешь понимать язык змей до рассвета!',
      en: 'Downing three flagons of goblin moonshine in one chug grants you the ability to speak with serpents!'
    },
    {
      ru: 'Городская статуя основателя по ночам сходит с пьедестала и пьёт воду из фонтана.',
      en: 'The bronze city founder statue steps off its pedestal at midnight to drink from the marble fountain.'
    },
    {
      ru: 'Королевские монеты нового чекана заколдованы — они плавятся при свете полной луны.',
      en: 'The royal crown minted cursed coins this year — they dissolve into lead under the full moon.'
    },
    {
      ru: 'В колодце на площади спит золотой дракон, брось туда 10 золотых и загадай желание!',
      en: 'A slumbering golden wyrm rests beneath the town well; toss ten gold coins down to be granted a wish!'
    }
  ]
};

export function generateRandomQuest(category = 'any', options = {}) {
  const isEn = options.language === 'en';
  const chosenCategory = category === 'any' 
    ? Object.keys(QUEST_TEMPLATES)[Math.floor(Math.random() * Object.keys(QUEST_TEMPLATES).length)]
    : category;

  const templates = QUEST_TEMPLATES[chosenCategory] || QUEST_TEMPLATES.hunt;
  const template = templates[Math.floor(Math.random() * templates.length)];
  const client = CLIENT_TYPES[Math.floor(Math.random() * CLIENT_TYPES.length)];
  const rewardObj = REWARD_PRESETS[Math.floor(Math.random() * REWARD_PRESETS.length)];

  // Слухи
  const truthObj = RUMOR_TABLE.truths[Math.floor(Math.random() * RUMOR_TABLE.truths.length)];
  const halftruthObj = RUMOR_TABLE.halftruths[Math.floor(Math.random() * RUMOR_TABLE.halftruths.length)];
  const fakeObj = RUMOR_TABLE.fakes[Math.floor(Math.random() * RUMOR_TABLE.fakes.length)];

  const titleRu = `${template.titlePrefix}: ${template.location.split(' ').slice(0, 2).join(' ')}`;
  const titleEn = `${template.titlePrefix_en || template.titlePrefix}: ${template.location_en ? template.location_en.split(' ').slice(0, 2).join(' ') : template.location}`;

  return {
    id: `quest_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    category: chosenCategory,
    title: isEn ? titleEn : titleRu,
    title_ru: titleRu,
    title_en: titleEn,
    client: isEn ? client.role_en : client.role,
    client_ru: client.role,
    client_en: client.role_en,
    clientVibe: isEn ? client.vibe_en : client.vibe,
    clientVibe_ru: client.vibe,
    clientVibe_en: client.vibe_en,
    goal: isEn ? template.goal_en : template.goal,
    goal_ru: template.goal,
    goal_en: template.goal_en,
    twist: isEn ? template.twist_en : template.twist,
    twist_ru: template.twist,
    twist_en: template.twist_en,
    location: isEn ? template.location_en : template.location,
    location_ru: template.location,
    location_en: template.location_en,
    urgency: isEn ? template.urgency_en : template.urgency,
    urgency_ru: template.urgency,
    urgency_en: template.urgency_en,
    reward: isEn ? rewardObj.en : rewardObj.ru,
    reward_ru: rewardObj.ru,
    reward_en: rewardObj.en,
    rumors: [
      { 
        type: 'truth', 
        label: isEn ? 'Verified Fact' : 'Достоверный слух', 
        text: isEn ? truthObj.en : truthObj.ru,
        text_ru: truthObj.ru,
        text_en: truthObj.en
      },
      { 
        type: 'halftruth', 
        label: isEn ? 'Exaggerated Gossip' : 'Приукрашенная молва', 
        text: isEn ? halftruthObj.en : halftruthObj.ru,
        text_ru: halftruthObj.ru,
        text_en: halftruthObj.en
      },
      { 
        type: 'fake', 
        label: isEn ? 'Tavern Tall Tale' : 'Пьяная байка', 
        text: isEn ? fakeObj.en : fakeObj.ru,
        text_ru: fakeObj.ru,
        text_en: fakeObj.en
      }
    ]
  };
}
