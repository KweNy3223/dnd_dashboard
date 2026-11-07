/**
 * D&D 5e NPC Generator English Localization Dataset
 * Provides idiomatic D&D 5e names, epithets, clans, occupations, voices, appearances, traits, and secrets.
 */

export const RACES_EN = {
  orc: {
    name: 'Half-Orc / Orc',
    namingStyle: 'epithet-suffix',
    maleNames: [
      'Thokk', 'Dench', 'Krog', 'Garzh', 'Feng', 'Krusk', 'Mhurren', 'Ront', 'Shump',
      'Luro', 'Hargu', 'Ugraak', 'Tarrok', 'Gorbash', 'Brakka', 'Rognar', 'Grok',
      'Nazgul', 'Golbag', 'Kulkan', 'Morgok', 'Vurg', 'Shaggar', 'Dreg', 'Bashur'
    ],
    femaleNames: [
      'Baggi', 'Shautha', 'Vola', 'Emen', 'Murola', 'Ovkka', 'Kangra', 'Morga',
      'Grisha', 'Ugra', 'Varka', 'Draka', 'Ronda', 'Shegga', 'Lurga'
    ],
    epithets: [
      'The Radiant', 'Ironhide', 'Skullsplitter', 'Bloodfang', 'Bonecrusher',
      'Stonebreaker', 'The Indomitable', 'Ash-Strider', 'War-Cry', 'The Scarred',
      'Doomhammer', 'Gore-Drenched', 'Thunder-Tusk', 'The Unbroken'
    ]
  },
  dwarf: {
    name: 'Dwarf',
    namingStyle: 'clan-quote',
    maleNames: [
      'Thorin', 'Balin', 'Dwalin', 'Gloin', 'Dain', 'Thrain', 'Gimli', 'Bofur',
      'Bombur', 'Rurik', 'Eberk', 'Morgran', 'Kildrak', 'Adrik', 'Baern', 'Brottor',
      'Bruenor', 'Dain', 'Darrak', 'Delg', 'Fargrim', 'Flint', 'Harbek', 'Kagran', 'Orsik'
    ],
    femaleNames: [
      'Amber', 'Artin', 'Audhild', 'Dagnal', 'Diesa', 'Eldeth', 'Falkrunn', 'Gunnloda',
      'Gurdis', 'Helja', 'Hlin', 'Kathra', 'Kristryd', 'Ilde', 'Liftrasa', 'Mardred',
      'Riswynn', 'Sannl', 'Torbera', 'Vistra'
    ],
    clans: [
      'Ironforge', 'Stonehammer', 'Battlehammer', 'Fireforge', 'Goldbeard',
      'Coppervein', 'Deepdelver', 'Anvilmar', 'Frostbeard', 'Oakenshield',
      'Silverpike', 'Mountainheart', 'Thunderaxe', 'Runekeeper', 'Steelshield'
    ],
    epithets: [
      'Stonebreaker', 'Ironheart', 'The Stout', 'Anvil-Hand', 'Gold-Seeker',
      'Dragon-Foe', 'Deep-Watcher', 'True-Strike', 'Shield-Breaker', 'The Stubborn'
    ]
  },
  elf: {
    name: 'Elf',
    namingStyle: 'clan-quote',
    maleNames: [
      'Aerin', 'Althidon', 'Celeborn', 'Faelar', 'Galean', 'Ilanis', 'Legolas',
      'Soveliss', 'Thamior', 'Tharivol', 'Adran', 'Aelar', 'Aramil', 'Arannis',
      'Aust', 'Berrian', 'Carric', 'Enialis', 'Erdan', 'Halimath', 'Heian', 'Himo',
      'Ivellios', 'Laucian', 'Mindartis', 'Paelias', 'Peren', 'Quarion', 'Rolen'
    ],
    femaleNames: [
      'Arwen', 'Caelynn', 'Enna', 'Felosial', 'Jelenneth', 'Keyleth', 'Leshanna',
      'Lia', 'Meriele', 'Naivara', 'Sariel', 'Shanairra', 'Shava', 'Tauryon',
      'Vadania', 'Valanthe', 'Xanaphia', 'Althaea', 'Anastrianna', 'Andraste', 'Antinua'
    ],
    clans: [
      'Moonwhisper', 'Stargazer', 'Silverleaf', 'Sunstrider', 'Windrunner',
      'Shadowsong', 'Nightbreeze', 'Emerald-Branch', 'Dew-Glade', 'Dawnsinger',
      'Evenstar', 'High-Bough', 'Mist-Walker', 'Oak-Whisper', 'Swift-Arrow'
    ],
    epithets: [
      'The Nimble', 'Starcaller', 'Swiftbow', 'The Graceful', 'Silver-Tongue',
      'Moonlit', 'Wind-Rider', 'The Ageless', 'Sun-Blessed', 'Shadow-Step'
    ]
  },
  human: {
    name: 'Human',
    namingStyle: 'clan-quote',
    maleNames: [
      'Arthur', 'Benjamin', 'Conrad', 'Derrick', 'Edward', 'Frederick', 'Geoffrey',
      'Howard', 'Lucas', 'Roderick', 'Walter', 'Thomas', 'Cedric', 'Gareth',
      'Roland', 'Percival', 'Tristan', 'Godfrey', 'Aldous', 'Barnaby', 'Gregory',
      'Julian', 'Nicholas', 'Raymond', 'Tobias'
    ],
    femaleNames: [
      'Adeline', 'Beatrice', 'Clara', 'Dorothy', 'Eleanor', 'Fiona', 'Grace',
      'Hilda', 'Judith', 'Maeve', 'Rose', 'Sybil', 'Winifred', 'Agnes',
      'Cecilia', 'Edith', 'Gwendolyn', 'Isolde', 'Mabel', 'Rowena'
    ],
    clans: [
      'Blackwood', 'Cooper', 'Miller', 'Smith', 'Fletcher', 'Tanner', 'Ward',
      'Baker', 'Carter', 'Evans', 'Green', 'Hall', 'Jackson', 'King', 'Locke',
      'Mason', 'Oakhaven', 'Parker', 'Rivers', 'Sterling', 'Thorne', 'Underwood',
      'Vance', 'Winter', 'Young'
    ],
    epithets: [
      'The Bold', 'The Honest', 'Red-Eye', 'Quickhand', 'The Lucky',
      'Greybeard', 'Crow-Eye', 'The Tall', 'Iron-Will', 'Fair-Haired',
      'The Silent', 'Fox-Heart', 'Braveheart', 'Wild-Card'
    ]
  },
  halfling: {
    name: 'Halfling',
    namingStyle: 'clan-quote',
    maleNames: [
      'Alton', 'Ander', 'Corrin', 'Eldon', 'Finnan', 'Garrett', 'Lindal',
      'Lyle', 'Merric', 'Milo', 'Osborn', 'Perrin', 'Reed', 'Roscoe', 'Wellby',
      'Barnaby', 'Cade', 'Drogo', 'Falco', 'Hobbit', 'Ludo', 'Pippin', 'Samwise'
    ],
    femaleNames: [
      'Andry', 'Bree', 'Callie', 'Cora', 'Euphemia', 'Jillian', 'Kithri',
      'Lavinia', 'Lidda', 'Merla', 'Nedda', 'Paela', 'Portia', 'Seraphina',
      'Shaena', 'Trym', 'Vani', 'Verna', 'Daisy', 'Marigold', 'Primrose', 'Rosie'
    ],
    clans: [
      'Brushgather', 'Goodbarrel', 'Greenbottle', 'High-Hill', 'Hilltopple',
      'Leagallow', 'Tealeaf', 'Thorngage', 'Tosscobble', 'Underbough',
      'Appleblossom', 'Bramblethorn', 'Cherrycheeks', 'Elderberry', 'Honeykettle'
    ],
    epithets: [
      'Swiftfoot', 'Nimblefingers', 'Buttercup', 'Sweet-Tooth', 'The Inquisitive',
      'Gold-Seeker', 'Puddle-Jumper', 'Silent-Step', 'Pie-Banter', 'Lucky-Strike'
    ]
  },
  tiefling: {
    name: 'Tiefling',
    namingStyle: 'title',
    maleNames: [
      'Akmenos', 'Amnon', 'Barakas', 'Damakos', 'Ekemon', 'Iados', 'Kairon',
      'Leucis', 'Melech', 'Mordai', 'Morthos', 'Pelaios', 'Skamos', 'Therai',
      'Valrak', 'Zephan', 'Malakor', 'Balthazar', 'Azazel', 'Kazimir'
    ],
    femaleNames: [
      'Akta', 'Anakis', 'Bryseis', 'Criella', 'Damaia', 'Ea', 'Kallista',
      'Lerissa', 'Makaria', 'Nemeia', 'Orianna', 'Phelaia', 'Rieta',
      'Vespera', 'Lilith', 'Morrigan', 'Nyx', 'Sarielle', 'Zara'
    ],
    epithets: [
      'Torment', 'Creed', 'Glory', 'Sorrow', 'Despair', 'Faith', 'Nowhere',
      'Temerity', 'Art', 'Chant', 'Reverence', 'Venom', 'Ash', 'Pyre',
      'Eclipse', 'Discord', 'Solitude', 'Sanctuary', 'Zenith', 'Abyss'
    ]
  },
  dragonborn: {
    name: 'Dragonborn',
    namingStyle: 'clan-quote',
    maleNames: [
      'Arjhan', 'Balasar', 'Bharash', 'Donaar', 'Ghesh', 'Heskan', 'Kriv',
      'Medrash', 'Mehen', 'Nadarr', 'Pandjed', 'Patrin', 'Rhogar', 'Shamash',
      'Shedinn', 'Torinn', 'Ghaash', 'Kavaan', 'Zorrak', 'Drakon'
    ],
    femaleNames: [
      'Akra', 'Biri', 'Daar', 'Farideh', 'Harann', 'Havilar', 'Jheri', 'Kava',
      'Korinn', 'Mishann', 'Nala', 'Perra', 'Raiann', 'Sora', 'Surina',
      'Thava', 'Uadjit', 'Drashta', 'Valkira', 'Zenobia'
    ],
    clans: [
      'Clethtinthiallor', 'Daardendrian', 'Delmirev', 'Drachedandion',
      'Fenkenkabradon', 'Kepeshkmolik', 'Kerrhylon', 'Kimbatuul',
      'Linxakasendalor', 'Myastan', 'Nemmonis', 'Norixius', 'Ophinshtalajiir',
      'Prexijandilin', 'Verthisathurgiesh', 'Yarjerit'
    ],
    epithets: [
      'Flametongue', 'Scaleguard', 'Thunder-Roar', 'Dragon-Eye', 'Bronze-Hide',
      'The Unyielding', 'Iron-Claw', 'Wyrm-Bane', 'Frost-Breath', 'Golden-Wing'
    ]
  },
  gnome: {
    name: 'Gnome',
    namingStyle: 'clan-quote',
    maleNames: [
      'Alston', 'Alvyn', 'Boddynock', 'Brocc', 'Burgell', 'Dimble', 'Eldon',
      'Erky', 'Fonkin', 'Frug', 'Gerbo', 'Gimble', 'Glim', 'Jebeddo', 'Kellen',
      'Namfoodle', 'Orryn', 'Roondar', 'Seebo', 'Sindri', 'Warryn', 'Wrenn', 'Zook'
    ],
    femaleNames: [
      'Bimpnottin', 'Breena', 'Caramip', 'Carlin', 'Donella', 'Ella', 'Ellyjobell',
      'Ellywick', 'Lilli', 'Loopmottin', 'Nissa', 'Nyx', 'Oda', 'Orla', 'Roywyn',
      'Shamil', 'Tana', 'Zanna'
    ],
    clans: [
      'Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Murnig', 'Ningel',
      'Raulnor', 'Scheppen', 'Timbers', 'Turen', 'Cogspinner', 'Gearwhistle',
      'Sparkbright', 'Coppersprocket'
    ],
    epithets: [
      'Spark-Master', 'Spring-Heel', 'Clock-Winder', 'Tinker-Fingers', 'Gizmo',
      'Lightning-Braid', 'Little-Wonder', 'The Inquisitive', 'Boiler-Keeper'
    ]
  },
  goliath: {
    name: 'Goliath',
    namingStyle: 'clan-quote',
    maleNames: [
      'Aukan', 'Eglath', 'Gae-Al', 'Gauthak', 'Ilikan', 'Keothi', 'Kuori',
      'Lo-Kag', 'Manneo', 'Maveith', 'Nanak', 'Orilo', 'Paavu', 'Pethani',
      'Thalai', 'Thotham', 'Uthal', 'Vaunea', 'Vibur'
    ],
    femaleNames: [
      'Gauthak', 'Ilikan', 'Keothi', 'Kuori', 'Lo-Kag', 'Manneo', 'Maveith',
      'Nanak', 'Orilo', 'Paavu', 'Pethani', 'Thalai', 'Thotham', 'Uthal', 'Vaunea'
    ],
    clans: [
      'Anakalave', 'Kola-Moku', 'Ogolakan', 'Thuliaga', 'Thunukalathi',
      'Ugru-Mukan', 'Vunaka-Te', 'Mountain-Peak', 'Crag-Walker', 'Storm-Pinnacle'
    ],
    epithets: [
      'Avalanche-Breaker', 'Bearkiller', 'Dawncaller', 'Fearless', 'Flintfinder',
      'Horncarver', 'Keeneye', 'Lonehunter', 'Longleaper', 'Rootsmasher',
      'Skywatcher', 'Steadyhand', 'Threadtwister', 'Twice-Orphaned'
    ]
  },
  tabaxi: {
    name: 'Tabaxi',
    namingStyle: 'tabaxi',
    maleNames: [
      'Cloud on Mountain', 'Five Timber', 'Jade Shoe', 'Left-Hand Hummingbird',
      'Seven Thunder Cloud', 'Skirt of Smoke', 'Smoking Mirror', 'River Ripple',
      'Shadow of Tree', 'Silent Claw', 'Wind in Reeds', 'Dusk Path'
    ],
    femaleNames: [
      'Evening Vesper', 'Floral Blossom', 'Hidden Depths', 'Jeweled Pebble',
      'Secret Moon', 'Star at Twilight', 'Morning Dew', 'Amber Sparkle',
      'Velvet Whispers', 'Summer Rain', 'Golden Dawn'
    ],
    clans: [
      'Distant Rain', 'Bright Forest', 'Golden Sands', 'Whispering Winds',
      'Midnight Jungle', 'Red Canyon', 'Silent Savanna', 'Azure Shore'
    ],
    epithets: [
      'Cloud', 'Timber', 'Jade', 'Hummingbird', 'Thunder', 'Smoke', 'Mirror',
      'Vesper', 'Blossom', 'Pebble', 'Moon', 'Star', 'Claw', 'Whisper'
    ]
  },
  kenku: {
    name: 'Kenku',
    namingStyle: 'kenku',
    maleNames: [
      'Clang of Iron', 'Rustle of Leaves', 'Ratchet Click', 'Bell Toll',
      'Screech of Hinges', 'Whistle of Kettle', 'Snap of Branch', 'Chirp of Sparrow',
      'Rattle of Chains', 'Hiss of Steam', 'Creak of Wood', 'Gavel Knock'
    ],
    femaleNames: [
      'Echo of Chimes', 'Flute Melody', 'Patter of Rain', 'Whisper of Silk',
      'Coin Clink', 'Feather Brush', 'Wind Howl', 'Glass Clink',
      'Water Drop', 'Purr of Kitten'
    ],
    epithets: [
      'Hinge-Creak', 'Rattler', 'Whistler', 'Bell-Ringer', 'Rustle', 'Clinker',
      'Echo', 'Chirp', 'Clicker', 'Coin-Drop'
    ]
  },
  goblin: {
    name: 'Goblin',
    namingStyle: 'epithet-suffix',
    maleNames: [
      'Griz', 'Droop', 'Boop', 'Skrag', 'Snark', 'Krog', 'Zix', 'Raz',
      'Gob', 'Poz', 'Rax', 'Gnasher', 'Nibbler', 'Grub', 'Stink', 'Spite'
    ],
    femaleNames: [
      'Vex', 'Grizelda', 'Squeak', 'Muck', 'Snag', 'Pebble', 'Blink',
      'Pip', 'Zul', 'Ratch', 'Twitch', 'Slime', 'Krikk'
    ],
    epithets: [
      'Stonespitter', 'Mudfoot', 'Fleabite', 'Rattooth', 'Bonegnawer',
      'Slimepot', 'Nose-Biter', 'Grease-Ear', 'Rusty-Dagger', 'Sneak-Thief'
    ]
  },
  kobold: {
    name: 'Kobold',
    namingStyle: 'epithet-suffix',
    maleNames: [
      'Meepo', 'Deekin', 'Snik', 'Kark', 'Vrax', 'Zik', 'Pip', 'Krik',
      'Rax', 'Toop', 'Snag', 'Klack', 'Zurk', 'Fizz'
    ],
    femaleNames: [
      'Kip', 'Zilla', 'Malka', 'Vexi', 'Tixi', 'Snikki', 'Roxi',
      'Drix', 'Piri', 'Kalli', 'Tika', 'Glim'
    ],
    epithets: [
      'Dragon-Pawn', 'Cave-Skulker', 'Scaled-Shadow', 'Tail-Swiper', 'Trap-Tinker',
      'Red-Horn', 'Tunnel-Rat', 'Spark-Tosser', 'Gold-Seeker', 'Tooth-Nip'
    ]
  },
  aasimar: {
    name: 'Aasimar',
    namingStyle: 'title',
    maleNames: [
      'Castiel', 'Gabriel', 'Uriel', 'Malakh', 'Raphael', 'Seraph', 'Raziel',
      'Valen', 'Lucian', 'Auriel', 'Zadkiel', 'Jophiel', 'Azrael'
    ],
    femaleNames: [
      'Aurelia', 'Celestine', 'Lyra', 'Seraphina', 'Ariel', 'Talia', 'Angela',
      'Elysia', 'Mirielle', 'Solaria', 'Lumina', 'Divina'
    ],
    epithets: [
      'The Radiant', 'Sunbearer', 'Dawn-Bringer', 'Lightwarden', 'The Blessed',
      'Wing of Grace', 'Halo-Crowned', 'Divine Flame', 'Silver-Gaze', 'The Pure'
    ]
  },
  genasi: {
    name: 'Genasi',
    namingStyle: 'clan-quote',
    maleNames: [
      'Ignis', 'Cinder', 'Blaze', 'Ash', 'Pyro', 'Zephyr', 'Gale', 'Breeze',
      'Torrent', 'Flint', 'Granite', 'Jasper', 'Basalt', 'Onyx', 'Brook'
    ],
    femaleNames: [
      'Ember', 'Flare', 'Spark', 'Sirocco', 'Mist', 'Aura', 'Coral',
      'River', 'Marina', 'Terra', 'Clay', 'Geode', 'Jade', 'Crystal'
    ],
    clans: [
      'Fireborn', 'Stormcaller', 'Deepwave', 'Earthheart', 'Ashwind',
      'Thunderpeak', 'Tidewalker', 'Sunstone', 'Galechaser'
    ],
    epithets: [
      'The Flame', 'Zephyr-Heart', 'Stone-Fist', 'Tide-Shifter', 'Spark-Dancer',
      'Gale-Rider', 'Molten-Blood', 'The Whispering Wind', 'Abyssal-Eye'
    ]
  },
  lizardfolk: {
    name: 'Lizardfolk',
    namingStyle: 'epithet-suffix',
    maleNames: [
      'Kesh', 'Ksakshkor', 'Ssax', 'Vrak', 'Zir', 'Kresh', 'Drosh', 'Hiss', 'Gar',
      'Slith', 'Zul', 'Khor', 'Bask', 'Scale', 'Rend'
    ],
    femaleNames: [
      'Ssura', 'Kessa', 'Zhara', 'Vressa', 'Miska', 'Liska', 'Shara', 'Tess', 'Sula'
    ],
    epithets: [
      'Cold-Blooded', 'Swamp-Hunter', 'Scale-Bite', 'Mud-Stalker', 'Sharp-Claw',
      'Tail-Strike', 'Bone-Cracker', 'Venom-Gland', 'Silent-Swimmer'
    ]
  },
  bugbear: {
    name: 'Bugbear',
    namingStyle: 'epithet-suffix',
    maleNames: [
      'Krog', 'Gnash', 'Skull', 'Grump', 'Bolar', 'Targ', 'Stun', 'Ruck',
      'Morg', 'Brunt', 'Gorg', 'Vrag', 'Thump'
    ],
    femaleNames: [
      'Gna', 'Muka', 'Vola', 'Gruba', 'Tara', 'Ruka', 'Zola', 'Brakka'
    ],
    epithets: [
      'The Brute', 'Iron-Club', 'Quiet-Step', 'Bone-Cracker', 'Long-Arm',
      'Throat-Squeezer', 'Shadow-Lurker', 'Heavy-Fist', 'Night-Terror'
    ]
  },
  changeling: {
    name: 'Changeling',
    namingStyle: 'title',
    maleNames: [
      'Echo', 'Mask', 'Mirror', 'Phantom', 'Shade', 'Veil', 'Riddle', 'Rune',
      'Silhouette', 'Faceless', 'Shift', 'Chance', 'Dusk', 'Ghost'
    ],
    femaleNames: [
      'Chameleon', 'Illusion', 'Shimmer', 'Reflection', 'Mist', 'Fable',
      'Whisper', 'Secret', 'Vanish', 'Silhouette', 'Echo', 'Mirage'
    ],
    epithets: [
      'Nobody', 'The Stranger', 'Ten-Faces', 'Many-Eyes', 'The Mimic',
      'Wax-Mask', 'Glass-Soul', 'The Chameleon', 'False-Face'
    ]
  }
};

export const OCCUPATIONS_EN = {
  "Трактирщик / Владелец таверны": "Tavern Keeper / Innkeeper",
  "Кузнец-оружейник": "Weaponsmith / Blacksmith",
  "Алхимик / Зельевар": "Alchemist / Potion Brewer",
  "Скупщик краденого": "Fence / Pawn Broker",
  "Вышибала / Наёмный телохранитель": "Bouncer / Hired Bodyguard",
  "Картограф и географ": "Cartographer & Geographer",
  "Ростовщик / Банкир": "Moneylender / Banker",
  "Целитель / Сельская травница": "Healer / Village Herbalist",
  "Прорицательница / Таролог": "Diviner / Fortune Teller",
  "Городской стражник / Дозорный": "Town Guard / Watchman",
  "Вор-карманник / Срезыватель кошельков": "Pickpocket / Cutpurse",
  "Торговец редкостями и реликвиями": "Curio & Relic Merchant",
  "Бродячий бард / Сказитель": "Wandering Bard / Storyteller",
  "Охотник за головами": "Bounty Hunter",
  "Капитан торговой шхуны": "Merchant Ship Captain",
  "Судья магистрата / Законник": "Magistrate Judge / Lawman",
  "Служитель храма / Жрец": "Temple Acolyte / Priest",
  "Могильщик / Смотритель погоста": "Gravedigger / Groundskeeper",
  "Гладиатор подпольной арены": "Underground Arena Gladiator",
  "Библиотекарь / Архивист": "Librarian / Archivist",
  "Городской герольд / Глашатай": "Town Herald / Town Crier",
  "Палач / Заплечных дел мастер": "Executioner / Headsman",
  "Инквизитор тайной канцелярии": "Secret Inquisitor",
  "Крысолов канализации": "Sewer Rat-Catcher",
  "Уличный попрошайка-осведомитель": "Street Beggar & Informant",
  "Фальшивомонетчик": "Coin Counterfeiter",
  "Смотритель маяка": "Lighthouse Keeper",
  "Каретный ямщик / Проводник тракта": "Stagecoach Driver / Trail Guide",
  "Укротитель боевых псов": "Warhound Trainer",
  "Послушник тайного монастыря": "Secret Monastery Initiate",
  "Сборщик налогов / Мытарь": "Tax Collector / Bailiff",
  "Мастер-стеклодув": "Master Glassblower",
  "Ювелир и огранщик": "Jeweler & Gemcutter",
  "Пивовар / Хозяин хмельника": "Brewmaster / Hop Farmer",
  "Мясник / Раздельщик туш": "Butcher / Meat Carver",
  "Расхититель гробниц / Кладоискатель": "Tomb Raider / Treasure Hunter",
  "Горный проходчик / Рудокоп": "Miner / Tunnel Digger",
  "Следопыт / Егерь": "Ranger / Gamekeeper",
  "Придворный шут / Сатирик": "Court Jester / Satirist",
  "Тайный шпион соседнего герцогства": "Foreign Spymaster / Agent",
  "Фокусник и глотатель огня": "Magician & Fire-Eater",
  "Кожевник и шорник": "Leatherworker & Saddler",
  "Портной богатых господ": "Noble Tailor",
  "Паромщик / Лодочник": "Ferryman / Boatman",
  "Дезертир наёмничьей роты": "Mercenary Deserter",
  "Канонир / Подрывник": "Cannoneer / Demolitionist",
  "Конюх / Заводчик скакунов": "Stablehand / Horse Breeder",
  "Смотритель сиротского приюта": "Orphanage Warden",
  "Криминальный авторитет квартала": "Underworld Crime Boss"
};

export const ALIGNMENTS_EN = {
  "Законно-добрый (LG)": "Lawful Good (LG)",
  "Нейтрально-добрый (NG)": "Neutral Good (NG)",
  "Хаотично-добрый (CG)": "Chaotic Good (CG)",
  "Законно-нейтральный (LN)": "Lawful Neutral (LN)",
  "Истинно нейтральный (N)": "True Neutral (N)",
  "Хаотично-нейтральный (CN)": "Chaotic Neutral (CN)",
  "Законно-злой (LE)": "Lawful Evil (LE)",
  "Нейтрально-злой (NE)": "Neutral Evil (NE)",
  "Хаотично-злой (CE)": "Chaotic Evil (CE)"
};

export const VOICES_EN = [
  {
    pitch: "Deep, gravelly bass; speaks slowly from deep in the chest, occasionally coughing lightly.",
    manner: "Speaks with stern confidence, cutting sentences short, leaving heavy pauses before crucial words.",
    actingTip: "Drop your voice into your lower chest, speak on an exhale, slouch slightly, and tilt your chin up.",
    quotes: [
      "Why are you standing in my doorway? Either state your business or get out.",
      "I've seen things in these wilds that would turn your little beard pure white in an instant, lad.",
      "Listen closely. I will not repeat myself a second time."
    ]
  },
  {
    pitch: "Insinuating, rustling whisper — speaks so softly you must lean in close to catch every word.",
    manner: "Looks around constantly, shifts glance between the listener's eyes and hands, stretches sibilants.",
    actingTip: "Speak in a half-whisper right up to the microphone or players' ears, smirk subtly, and avoid blinking.",
    quotes: [
      "Keep your voice down... Walls in this tavern have both ears and daggers.",
      "Everything has a price, my friend. Especially secrets that could bring down an empire.",
      "I know where they hide the key. But what do I get if I share?"
    ]
  },
  {
    pitch: "Booming, jovial rolling baritone — speaks far too loud for an enclosed room.",
    manner: "Bursts into sudden boisterous laughter, constantly claps hands on the table or the listener's shoulder.",
    actingTip: "Smile broadly, speak loud with chest puffed out, gesticulate grandly with open palms.",
    quotes: [
      "Hey, barkeep! Bring a whole roast leg of mutton for my fine new companions here!",
      "Hahaha! By the gods, you lot look like you just wrestled an owlbear in a mud pit!",
      "Gold comes and goes, but glorious ale and true friendship endure forever!"
    ]
  },
  {
    pitch: "High-pitched, squawking, hurried falsetto — squeaks on high notes when agitated.",
    manner: "Rambles at breakneck speed, interrupts themselves, twitches their fingers nervously.",
    actingTip: "Raise pitch into upper register, speak rapidly without breathing, bite your lip nervously.",
    quotes: [
      "Wait-wait-wait! Don't touch that! If you turn that screw, we'll all be blown sky-high!",
      "I swear on my auntie's grave, the shipment was right here just ten minutes ago!",
      "Oh gods, they're watching us... did you hear that floorboard creak just now?!"
    ]
  },
  {
    pitch: "Dry, monotonous, bureaucratic drone — sounds like they are reading off parchment ledger.",
    manner: "Devoid of emotion, pauses mechanically, relies heavily on official phrasing and legal jargon.",
    actingTip: "Keep a completely flat deadpan face, look past players, adjust invisible spectacles on your nose.",
    quotes: [
      "According to clause 4, subsection 'B', entry into the vault without a sealed magistrate charter is forbidden.",
      "I am merely doing my assigned duty. Bribery of an official incurs five lashes and confiscation of boots.",
      "Your requisition has been filed. Approximate waiting period is three to six lunar cycles."
    ]
  },
  {
    pitch: "Slow, creaking, elderly rasp — breathes heavily with audible wheezing.",
    manner: "Dwells on memories of bygone eras, trails off mid-sentence, occasionally forgets what they were saying.",
    actingTip: "Scratch your temple, squint, speak through lips pressed together like an ancient grandparent.",
    quotes: [
      "Eh? Speak louder, my ears haven't caught fine words since the Great Dragon Siege...",
      "In my youthful days, youth had respect for iron and faith, not like today's rabble...",
      "What was I saying? Ah, yes... whatever you do, never cross the Old Barrow bridge after dusk..."
    ]
  },
  {
    pitch: "Velvety, honeyed, seductive tone — words flow smooth like melted warm wax.",
    manner: "Languid pauses, playful intonation, maintains intense, hypnotic eye contact.",
    actingTip: "Lower voice to a smooth purr, lean forward slightly, tilt head to one side with an enigmatic smile.",
    quotes: [
      "Such weary travelers... Sit down, rest your blade. You are among friends now.",
      "Heroes like you deserve something far sweeter than muddy road stew, don't you think?",
      "Tell me everything, darling. A heart burdened by secrets is far too heavy to carry alone."
    ]
  },
  {
    pitch: "Sharp, clipped military bark — sounds like ordering a squad on a parade ground.",
    manner: "Speaks strictly to the point, tolerates zero hesitation, expects immediate obedience.",
    actingTip: "Straighten your back stiffly, lock eyes on the speaker, cut off phrases sharply like blade strikes.",
    quotes: [
      "Halt! State your regiment, commander, and objective in this quadrant!",
      "Enough blabbering! Five minutes to assemble, then we move out under double march!",
      "In my unit, hesitation is treason. Keep your shields locked!"
    ]
  },
  {
    pitch: "Nasal, sneering drawl through clenched teeth — oozes condescension and venom.",
    manner: "Raises an eyebrow derisively, sighs dramatically before answering, spits to the side.",
    actingTip: "Clench your teeth, look down your nose, speak with clear contempt and annoyance.",
    quotes: [
      "Pah... Another pack of dirt-poor adventurers seeking fame and cheap glory. How utterly quaint.",
      "If you break anything in my shop with those clumsy paws, you'll be paying with your own organs.",
      "Don't waste my breath. Buy something or get lost back into the mud."
    ]
  },
  {
    pitch: "Gruff guttural growl; strictly refers to themselves in the third person.",
    manner: "Heavy breathing, sniffing the air, flexing clawed fingers, measuring everyone by physical strength.",
    actingTip: "Growl slightly from your throat, keep sentences short and blunt (3-4 words max).",
    quotes: [
      "Grak smells elf blood. Grak does not like elf perfume. Very bad.",
      "Give meat. You want pass the gate? Give fat boar, then Grak lets you through.",
      "Little shiny swords break against stone. Big club smashes skull good!"
    ]
  },
  {
    pitch: "Kenku: Mimicry and borrowed voices — stitches words together from four different accents.",
    manner: "Accompanies words with sound effects: clicks, squeaks, coin chimes, door rattles.",
    actingTip: "Switch tone and accent abruptly between phrases, snap fingers or click your tongue periodically.",
    quotes: [
      "*[Clang of an iron gate]* ... 'No entry!' ... *[Chink of gold coins]* ... 'Unless you pay!'",
      "*[Sound of whistling arrow]* ... 'Ambush in the grove!' ... *[Painful wail]* ... 'Flee!'",
      "*[Squeak of ungreased door]* ... 'Secret stairs behind the wine rack!' ... *[Cackle of an old crone]*"
    ]
  },
  {
    pitch: "Hissing, serpentine, drawn-out sibilance — heavily drags out 's' and 'sh' sounds.",
    manner: "Flicks tongue between lips, tilts head side to side like a viper measuring strike distance.",
    actingTip: "Prolong every 's' sound, speak cold and detached, stare without blinking.",
    quotes: [
      "Warm-bloodsss... Sssuch soft flesh, sssuch fragile bones...",
      "The swamp devoursss all who wander without our perrmisssion...",
      "We will watch your journey... One falssse step, and the fangss sink deep."
    ]
  },
  {
    pitch: "Frantic, stuttering cadence of an obsessed inventor or mad scholar.",
    manner: "Hands flutter in the air, loses train of thought mid-sentence, gasps with sudden revelations.",
    actingTip: "Speak in breathless bursts, trip over syllables, tap your fingers on the desk rapidly.",
    quotes: [
      "Wait, wait! If the aetheric coil aligns with... by the sparks, the resonance frequency will collapse!",
      "I haven't slept in nine days! Or is it twelve? Irrelevant! Look at this blueprint!",
      "Careful with the blue vial! It reacts violently to ambient humidity! Or was it the red one...?"
    ]
  },
  {
    pitch: "Pretentious, drawling aristocratic drawl — overly polite, utterly venomous.",
    manner: "Dabs nostrils with an invisible silk handkerchief, gestures with limp wrists, feigns disgust.",
    actingTip: "Purse your lips, speak as if smelling bad cheese, prolong every vowel languidly.",
    quotes: [
      "My dear peasants, one simply does not track dungeon filth across imported Calimshan rugs.",
      "A hero? How deliciously quaint. I suppose someone has to perform the vulgar work.",
      "Do tell the guards to wipe down wherever you stood. The stench of common sweat gives me a migraine."
    ]
  },
  {
    pitch: "Feverish, fanatical whisper of an occultist or zealous doomsday prophet.",
    manner: "Wide unblinking eyes, murmurs prayers under breath, grips holy symbol until knuckles turn white.",
    actingTip: "Clutch hands to your chest, breathe in shallow rapid gasps, whisper with burning intensity.",
    quotes: [
      "The Stars are aligning! Can you hear the whisper beneath the cobblestones?! It awakens!",
      "Blood must pay for the harvest. The Old Ones demand a tithe of pure sorrow!",
      "You think you walk freely? The Shadow already drapes over your shoulders like a burial shroud!"
    ]
  },
  {
    pitch: "Wheezing, raspy gasps of a lifelong chain-smoker or severe asthmatic.",
    manner: "Speaks in short 2-3 word bursts, taking noisy, wheezing gasps for air between phrases.",
    actingTip: "Take an audible, ragged breath through an open mouth every few words, speak in a tired gravelly tone.",
    quotes: [
      "Can't... breathe... in these damp... cellars... no air at all...",
      "Give me... a minute... my chest feels... like a furnace...",
      "The boss... said to tell you... the deal... is off..."
    ]
  },
  {
    pitch: "Slurred, boozy, overly affectionate drawl of a friendly tavern drunk.",
    manner: "Sways in place, leans heavily on the closest person, hiccups, gets overly emotional.",
    actingTip: "Loosen jaw, slur consonants, smile warmly, throw an arm around an imaginary shoulder.",
    quotes: [
      "You know what? You're the best... the absolute greatest friend I ever had, pal! *[hic]*",
      "I used to be... an adventurer like you... until that blasted ogre sat on my donkey...",
      "Another round! Barkeep! Put it on my cousin's tab, he's rich as a dragon's hoard!"
    ]
  },
  {
    pitch: "Theatrical, melodramatic baritone of a wandering Shakespearean tragedy actor.",
    manner: "Over-enunciates every syllable, strikes dramatic poses, gazes into the distance wistfully.",
    actingTip: "Project from the diaphragm, roll your 'R's, gesture grandly toward the heavens.",
    quotes: [
      "Alas! Is this destiny that stands before me, or merely another cruel jest of fickle fate?!",
      "Behold the cruel ruins of mortality! Where once kings feasted, now only worms make merry!",
      "Speak on, noble souls! Let the crimson tragedy of our times unfold its next act!"
    ]
  },
  {
    pitch: "Drowsy, yawning, impossibly sluggish drawl — on the verge of falling asleep mid-word.",
    manner: "Rubs eyes, stretches endlessly, answers with monumental reluctance after long pauses.",
    actingTip: "Yawn audibly mid-sentence, speak at half speed, let your eyelids droop heavily.",
    quotes: [
      "Urrgh... Why did you wake me up? The sun isn't even... oh, it's noon. Still too early...",
      "Whatever you want... come back tomorrow. Or next week. The dungeon isn't going anywhere...",
      "*[Yawn]* Just leave the gold on the barrel and shut the door on your way out..."
    ]
  },
  {
    pitch: "Chilling, spectral, otherworldly whisper echoing as if from the bottom of an icy tomb.",
    manner: "Absolute stillness, moves head without moving torso, chillingly flat, empty vocal delivery.",
    actingTip: "Speak without any inflection, keep jaw almost stationary, maintain a cold unblinking stare.",
    quotes: [
      "Your mortal warmth is merely a fleeting ember in the vast, freezing void of eternity.",
      "The dead do not forget. We remember every drop of blood spilled on these stones.",
      "Turn back. The path ahead leads only to rot, dust, and forgotten graves."
    ]
  },
  {
    pitch: "Fast-talking, bombastic pitch of a carnival barker or marketplace huckster.",
    manner: "Smiles wide, points enthusiastically at wares, rattles off deals like auction lots.",
    actingTip: "Speak with high energy, clap hands rhythmically, bounce slightly on the balls of your feet.",
    quotes: [
      "Step right up, ladies and gentle-folk! Genuine hydra tooth! Cures warts and attracts maidens!",
      "Only three silver pieces for the bargain of a lifetime! Don't let your neighbor grab it first!",
      "Guaranteed authentic elven steel, forged beneath a full moon by virgin smiths! Look at that shine!"
    ]
  },
  {
    pitch: "Tabaxi: Soft, purring feline cadence — rolls words smoothly with playful inflection.",
    manner: "Paces back and forth, tilts head, playfully examines shiny trinkets with nimble claws.",
    actingTip: "Add a subtle vibrating purr to your vowels, speak with intense playful curiosity.",
    quotes: [
      "Ooh... what a shiny bauble you have there! Does it glow in the dark? Can I touch it, yes?",
      "Curiosity is a blessing, not a curse, traveler! Tell me, what lies behind that sealed door?",
      "Tabaxi travels light, but our stories weigh more than an iron anvil, purrr..."
    ]
  },
  {
    pitch: "Genasi: Resonant elemental hum — voice crackles like embers or flows like deep water.",
    manner: "Confident and elemental, hair and eyes reflect their plane, gestures have elemental weight.",
    actingTip: "Speak with deliberate warmth or breezy coolness depending on the elemental affinity.",
    quotes: [
      "The sparks in my blood dance to the rhythm of the eternal forge. What fire burns within you?",
      "Water finds every crack, stone outlasts every storm. You cannot bar our passage.",
      "Listen to the wind, wanderer. It carries the ash of kingdoms that thought themselves eternal."
    ]
  },
  {
    pitch: "Chillingly polite, icy baritone of an underworld mafia boss or cartel syndicate capo.",
    manner: "Speaks with immaculate courtly etiquette while quietly cleaning nails with a stiletto dagger.",
    actingTip: "Keep voice quiet, calm and velvet-smooth. Never raise volume; let the threat hang in the quiet.",
    quotes: [
      "My dear friends, in our line of work, trust is currency... and you appear to be in debt.",
      "Accidents happen so frequently in these wet alleyways. Loose cobblestones, stray crossbow bolts...",
      "Let us sit, share this fine wine, and come to an amicable understanding. For your sake."
    ]
  }
];

export const APPEARANCES_EN = [
  "A wide, jagged scar slashing across the bridge of the nose and the left cheek.",
  "One eye covered by an embroidered leather patch bearing a gilded guild crest.",
  "A dazzling solid-gold front tooth that gleams prominently whenever they grin.",
  "Calloused, soot-stained hands with missing fingertips on the left hand.",
  "Wears a faded military officer's coat missing its brass buttons, smelling faintly of pipeweed.",
  "Constantly twirls a polished silver coin or luck talisman between dexterous knuckles.",
  "Shaved head adorned with intricate, winding dark blue tattoos representing elemental rites.",
  "Striking heterochromia: one piercing amber eye and one deep slate-blue.",
  "A dense, lavishly braided beard interwoven with polished bone beads and small silver bells.",
  "Thin, manicured mustache waxed into sharp upturned curls with scented pomade.",
  "Tall, gaunt frame with uncommonly long fingers, moving with ghostly silence.",
  "A broken, crooked nose clearly reset by an amateur tavern brawler multiple times.",
  "Covered in faint glowing arcane burn scars that pulse faintly in total darkness.",
  "Smells distinctly of cloves, brimstone, and dried mountain lavender.",
  "Wears a thick wool traveler's cloak lined with numerous secret interior pockets and pouches.",
  "Noticeable limp, leaning upon a polished ironwood cane capped with a brass raven skull.",
  "Sharp, pointed fangs that slightly catch on the lower lip when speaking excitedly.",
  "Wears round, green-tinted lenses in wire frames perched precariously on the tip of the nose.",
  "Lush copper-red hair swept into a messy ponytail held by a bone hairpin.",
  "Heavily calloused knuckles wrapped tightly in worn linen bandages.",
  "Dressed in immaculate high-collar velvet, visibly out of place in this grimy district.",
  "Wears a faded broad-brimmed leather hat casting deep shadows across their face.",
  "Faint blue veins visible beneath translucent, paper-pale skin.",
  "A heavy bronze signet ring depicting a roaring manticore worn on the thumb.",
  "Adorned with numerous silver earrings, nose hoops, and ear-cuffs along both lobes.",
  "A patch of rough, reptilian green scales visible along the left side of the neck.",
  "Broad-shouldered, barrel-chested build with arms the thickness of oak boughs.",
  "Constantly chews on a bitter herbal root or sweet dried cherry stem.",
  "A noticeable twitch under the right eye whenever voices are raised in anger.",
  "Cloak hem is caked in dried swamp mud and thorny briar burrs from recent travels.",
  "Wears mismatched leather boots, one buckled with brass and the other laced with raw cord.",
  "Carries a brass sundial and intricate astronomical compass hanging from their belt.",
  "A thin, wire-sharp stiletto dagger partially peeking from a hidden wrist sheath.",
  "Eyes are perpetually bloodshot, surrounded by dark circles from chronic insomnia.",
  "A wide toothy grin that never seems to reach their cold, calculating eyes.",
  "Wears a necklace fashioned from polished bear claws and wolf teeth.",
  "Soft, melodic, feather-light footsteps that make absolutely no sound on bare stone.",
  "Fingers stained deep purple and walnut-brown with alchemical dyes and indelible inks.",
  "Shivers periodically even in front of a roaring hearth, clutching a fur collar.",
  "A prominent burn scar on the chest shaped unmistakably like a broken holy sigil.",
  "Dressed in rugged, patch-covered hunting leathers lined with soft rabbit fur.",
  "Wears a set of gleaming cavalry boots polished to a mirror shine, complete with golden spurs."
];

export const PERSONALITY_TRAITS_EN = [
  "Penny-pincher and paranoid: bargains over every single copper coin, suspects traps everywhere, but melts at blatant flattery.",
  "Boaster and carouser: exaggerates personal exploits tenfold, buys rounds of ale for everyone with their last coppers.",
  "Grim fatalist: genuinely believes the city is cursed and the gods have turned away; cynical and bluntly truthful.",
  "Chivalrous romantic: believes in sworn oaths, courtly honor, and never leaves a lady or comrade in distress.",
  "Obsessive perfectionist: can't stand messy tables, crooked paintings, or unstructured schedules; corrects everyone's grammar.",
  "Nervous coward: terrifies easily of loud noises and drawn blades, yet possesses an uncanny knack for surviving catastrophes.",
  "Cold pragmatist: feelings are weakness; every decision is weighed purely by risk, expenditure, and tangible profit.",
  "Sunny idealist: sees inner goodness in the nastiest bandits, naive to a fault, easily taken advantage of.",
  "Fanatical scholar: would gladly walk into a dragon's lair if promised a glimpse of an unread first-edition tome.",
  "Vengeful grudge-holder: writes down every perceived slight into a pocket ledger; never forgets and never forgives.",
  "Gossip monger: knows every affair, bastard child, and unpaid tax in town, and simply cannot keep secrets.",
  "Quiet observer: speaks only when spoken to, listens intently, remembers every slip of the tongue around the room.",
  "Adrenaline junkie: loves high stakes, gambling, and dangerous bets; lives entirely for the thrill of the razor's edge.",
  "Deeply superstitious: won't step under ladders, tosses salt over left shoulder, refuses to travel on the full moon.",
  "Gruff mentor: constantly critiques younger adventurers' stances and gear, secretly cares deeply about their survival.",
  "Silver-tongued flatterer: showers everyone with lavish compliments, masking true intentions behind an angelic smile.",
  "Melancholy poet: finds beauty in autumn decay, ruined castles, and tragic romance; speaks in somber metaphors.",
  "Stubborn mule: will never admit being wrong, even if presented with ironclad proof; doubles down on mistakes.",
  "Protector of the weak: harbors a fierce, protective soft spot for orphans, stray animals, and downtrodden laborers.",
  "Arrogant aristocrat: views commoners as amusing simpletons, expects prompt deference and impeccable manners.",
  "Dry wit cynic: responds to mortal peril and impending doom with dark sarcasm and weary, deadpan quips.",
  "Zealous penitent: constantly seeks redemption for a grave sin committed years ago, practicing daily ascetic rites.",
  "Curious meddler: cannot resist picking locks, reading unsealed letters, and sticking their nose where it doesn't belong.",
  "Honorable bookworm: follows all written laws to the letter, despises improvisation, and respects bureaucratic protocol."
];

export const SECRETS_EN = [
  "Secretly owes a massive debt to the local Thieves' Guild and anticipates knee-breakers visiting every dusk.",
  "Hides a fugitive heretic, disgraced wizard, or political exile in a secret crawlspace beneath the floorboards.",
  "Desperately seeking a rare elixir ingredient to cure a fatal illness afflicting their only child or spouse.",
  "An undercover informant for the City Watch or High Magistrate, gathering dirt on local taverns and patrons.",
  "A former member of a notorious bandit gang living under an assumed identity; terrified of being recognized.",
  "Stole a minor enchanted relic from a noble estate years ago and now hides it inside an ordinary hollow bedpost.",
  "An illegitimate heir to an impoverished noble house with sealed lineage documents hidden in their boot.",
  "Possesses a treasure map leading to a forgotten catacomb beneath the graveyard, but lacks martial skill to explore it.",
  "Involved in a forbidden romantic affair with the child or spouse of the city's most feared rival clan leader.",
  "Inadvertently overheard an assassination plot against the town Burgomaster and lives in terror of being silenced.",
  "Suffers from a dormant lycanthrope bite or cursed affliction that stirs whenever the full moon rises.",
  "Worships a forbidden elder deity or fiend in a hidden basement shrine, offering small blood tithes of rats and wine.",
  "Falsified credentials and certificates to obtain their prestigious position; utterly unqualified for the role.",
  "Knows the location of a secret smuggler's tunnel leading directly beneath the city walls into the harbor.",
  "Unwittingly carries a dormant magical parasite or mind flayer tadpole that whispers in alien tongues during sleep.",
  "Blackmailed by a corrupt inquisitor who demands monthly payments to overlook fabricated charges of witchcraft.",
  "Accidentally poisoned an influential trade rival during an altercation; framed an innocent stranger for the crime.",
  "Discovered a strange, glowing crystalline vein in the cellar that causes unsettling mutations in household vermin.",
  "Once deserted a mercenary regiment during a slaughter; their old captain is currently in town hunting deserters.",
  "Possesses an ancient cursed ring that cannot be discarded; it brings uncanny good luck followed by catastrophic misfortune.",
  "Quietly siphoning funds from their master's coffers to finance an escape across the sea to the southern colonies.",
  "Their entire family was captured by drow raiders into the Underdark; desperately raising coin to pay a drow ransom.",
  "Fled a blood-hunt bloodline blood-debt; an assassin guild has placed a five-hundred gold bounty on their head.",
  "Secretly manufactures counterfeit gold coins using lead and illusion magic to pay off local suppliers.",
  "A shapeshifter or changeling who assumed the identity of a real person after their mysterious disappearance.",
  "Holds the keys to a forgotten vault sealed by imperial order three centuries ago, containing forbidden arcana.",
  "Their true birth name was stricken from all official annals due to an act of heinous blasphemy in their youth."
];
