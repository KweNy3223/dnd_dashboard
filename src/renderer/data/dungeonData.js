import { 
  DUNGEON_THEMES_EN, 
  ROOM_SIZES_EN, 
  THEME_DETAILS_EN 
} from './dungeonDataEn.js';

// База данных для Генератора комнат подземелий и атмосферы (Dungeon Room Generator)

export const DUNGEON_THEMES = [
  { id: 'any', label: 'Любая тема', label_en: 'Any Theme' },
  { id: 'crypt', label: 'Древний склеп', label_en: 'Ancient Crypt' },
  { id: 'temple', label: 'Забытое святилище', label_en: 'Forgotten Temple & Shrine' },
  { id: 'cave', label: 'Пещера и логово', label_en: 'Cavern & Monster Lair' },
  { id: 'fortress', label: 'Заброшенная крепость', label_en: 'Abandoned Stronghold' },
  { id: 'lab', label: 'Магическая лаборатория', label_en: 'Arcane Alchemical Laboratory' },
  { id: 'catacombs', label: 'Катакомбы и стоки', label_en: 'Catacombs & Sewers' }
];

export const ROOM_SIZES = [
  'Небольшая комната (20×20 фт.), низкий свод 10 фт.',
  'Вытянутая галерея (15×45 фт.), стрельчатые арки 15 фт.',
  'Просторный квадратный зал (40×40 фт.), массивные колонны 25 фт.',
  'Круглый зал с куполом (диаметр 35 фт.), высота купола 30 фт.',
  'Многоуровневая пещерная полость (50×35 фт.) с каменными уступами',
  'Узкий тупиковый коридор (10×30 фт.), осыпающийся потолок'
];

export const THEME_DETAILS = {
  crypt: {
    titles: ['Усыпальница рыцарей Ордена', 'Склеп Безымянного лорда', 'Колумбарий забытых душ', 'Зал погребальных урн'],
    architecture: 'Тёмно-серый гранит, высеченные в камне погребальные ниши с истлевшими саванами.',
    sight: 'Плотный сумрак. Лишь тусклое фосфоресцирующее свечение могильного лишайника у основания саркофагов.',
    sound: 'Глухой скрип оседающего камня и монотонное падение капель из трещины в своде.',
    smell: 'Затхлый дух сухого праха, старого воска и могильного холода.',
    feature: 'Центральный каменный саркофаг с барельефом рыцаря, держащего в руках меч остриём вниз. Поворот меча открывает потайную полость.',
    hazard: 'Каменная плита перед саркофагом соединена с нажимным шепталом: наступивший вызывает залп отравленных дротиков из ниш (Сл 13 Ловкости, 2d6 урона ядом).',
    treasure: 'В складках савана спрятан серебряный перстень с гравировкой родового герба (стоимость 35 зм) и старинный латунный ключ.'
  },
  temple: {
    titles: ['Святилище Падшей Звезды', 'Зал угасших алтарей', 'Притвор Шепчущих богов', 'Капелла вечного обета'],
    architecture: 'Потрескавшийся белый мрамор, остатки золочёной мозаики и разбитые статуи с отбитыми лицами.',
    sight: 'Тонкий луч пыльного света пробивается сквозь трещину в потолке, освещая жертвенную чашу.',
    sound: 'Призрачный шёпот ветра в вентиляционных шахтах, напоминающий хоровое пение на забытом наречии.',
    smell: 'Запах старого сандала, мирры и озона, оставшегося после древних ритуалов.',
    feature: 'Массивный алтарь с четырьмя углублениями под стихийные подношения (земля, вода, огонь, воздух).',
    hazard: 'Руна святотатства на ступенях алтаря: неверующие существа получают вспышку слепящего света (Сл 14 Телосложения или ослепление на 1 минуту).',
    treasure: 'На дне чаши лежит чаша из резного сердолика (стоимость 75 зм) и свиток с молитвой защиты.'
  },
  cave: {
    titles: ['Грот капающих слёз', 'Логово костяного охотника', 'Расселина подземных ветров', 'Провал червя'],
    architecture: 'Неровные сырые базальтовые стены, сталактиты угрожающе свисают с неровного свода.',
    sight: 'Абсолютная тьма. В свете факела мокрый камень блестит, создавая иллюзию шевелящихся стен.',
    sound: 'Эхо падающих капель воды, хруст костей под сапогами и отдалённое низкое урчание хищника.',
    smell: 'Едкий запах сырости, помёта летучих мышей и гниющей плоти.',
    feature: 'Подземное ключевое озерцо с кристально чистой водой, на дне которого мерцает странный минерал.',
    hazard: 'Колония плотоядных грибов-крикунов: при приближении источника тепла испускает оглушительный визг, призывая окрестных тварей.',
    treasure: 'В углу пещеры лежит разорванный рюкзак погибшего старателя: 14 зм, кусок необработанного пирита и компас.'
  },
  fortress: {
    titles: ['Оружейная палата бастиона', 'Караульный пост верхнего яруса', 'Штабная комната коменданта', 'Заброшенная казарма'],
    architecture: 'Массивная кладка из тёсаных блоков, кованые железные скобы и следы застарелой осады.',
    sight: 'Стены закопчены старыми пожарами, на полу валяются обломки деревянных щитов и ржавые наконечники.',
    sound: 'Сквозняк хлопает полусорванной с петель кованой дверью где-то в конце коридора.',
    smell: 'Запах ржавчины, горелого дерева и старого машинного масла.',
    feature: 'Стол с полуистлевшей тактической картой крепости и металлическим тубусом, запечатанным сургучом.',
    hazard: 'Ослабленная балка перекрытия: при громком крике или заклинании грома потолок осыпается каменными глыбами (Сл 12 Ловкости, 3d6 урона).',
    treasure: 'В оружейной стойке чудом уцелел отличный арбалет с узором клана и тугой шёлковой тетивой (стоимость 40 зм).'
  },
  lab: {
    titles: ['Лаборатория трансмутатора', 'Зал алхимических дистилляторов', 'Кабинет анатомических опытов', 'Архив запретных формул'],
    architecture: 'Каменные столы со следами кислотных ожогов, полки с треснувшими ретортами и медными трубками.',
    sight: 'Призрачное зеленоватое свечение из стеклянного сосуда с плавающим в консерванте странным органом.',
    sound: 'Тихое бульканье в самоподдерживающейся алхимической установке и шипение химикатов.',
    smell: 'Резкий запах серы, уксуса, формалина и жжёных перьев.',
    feature: 'Механический арифмометр с наборными дисками: подбор трёхзначного числа открывает нишу в столешнице.',
    hazard: 'Разбитая склянка на полу источает ядовитый газ: наступивший поднимает облако токсина (Сл 13 Телосложения или состояние «Отравлен» на 1 час).',
    treasure: 'В уцелевшей капсуле хранится флакон Зелья лечения и стеклянная мензурка с ртутью высокой очистки (25 зм).'
  },
  catacombs: {
    titles: ['Смывной коллектор Нижнего города', 'Шлюзовая камера стоков', 'Тайный тупик контрабандистов', 'Утильный колодец'],
    architecture: 'Арочные кирпичные своды, покрытые слизью, сточные желоба с медленно текущей тёмной жижей.',
    sight: 'Вяло горящие гнилушки на мусорных островках, маслянистые разводы на чёрной воде.',
    sound: 'Плеск бегущих крыс, глухой гул уличного движения где-то далеко над головой.',
    smell: 'Удушающий смрад нечистот, гнили и болотного газа.',
    feature: 'Чугунное штурвальное колесо шлюза. Поворот колеса спускает воду в желобе, обнажая застрявший сундучок.',
    hazard: 'Скопление горючего болотного газа: открытый огонь факела вызывает вспышку пламени (2d6 урона огнем всем в радиусе 15 фт., Сл 12 Ловкости наполовину).',
    treasure: 'В иле на решётке застрял водонепроницаемый кошель: 28 сп, 9 зм и резная костяная трубка.'
  }
};

export function generateRandomDungeonRoom(theme = 'any', options = {}) {
  const isEn = options.language === 'en';
  const chosenTheme = theme === 'any'
    ? DUNGEON_THEMES.filter(t => t.id !== 'any')[Math.floor(Math.random() * (DUNGEON_THEMES.length - 1))].id
    : theme;

  const dataRu = THEME_DETAILS[chosenTheme] || THEME_DETAILS.crypt;
  const dataEn = THEME_DETAILS_EN[chosenTheme] || THEME_DETAILS_EN.crypt;

  const titleIdx = Math.floor(Math.random() * dataRu.titles.length);
  const titleRu = dataRu.titles[titleIdx];
  const titleEn = dataEn.titles[titleIdx] || titleRu;

  const sizeIdx = Math.floor(Math.random() * ROOM_SIZES.length);
  const sizeRu = ROOM_SIZES[sizeIdx];
  const sizeEn = ROOM_SIZES_EN[sizeIdx] || sizeRu;

  const themeObj = DUNGEON_THEMES.find(t => t.id === chosenTheme);
  const themeLabelRu = themeObj ? themeObj.label : 'Подземелье';
  const themeLabelEn = DUNGEON_THEMES_EN[chosenTheme] || (themeObj?.label_en || themeLabelRu);

  return {
    id: `room_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    theme: chosenTheme,
    themeLabel: isEn ? themeLabelEn : themeLabelRu,
    themeLabel_ru: themeLabelRu,
    themeLabel_en: themeLabelEn,
    title: isEn ? titleEn : titleRu,
    title_ru: titleRu,
    title_en: titleEn,
    size: isEn ? sizeEn : sizeRu,
    size_ru: sizeRu,
    size_en: sizeEn,
    architecture: isEn ? dataEn.architecture : dataRu.architecture,
    architecture_ru: dataRu.architecture,
    architecture_en: dataEn.architecture,
    sight: isEn ? dataEn.sight : dataRu.sight,
    sight_ru: dataRu.sight,
    sight_en: dataEn.sight,
    sound: isEn ? dataEn.sound : dataRu.sound,
    sound_ru: dataRu.sound,
    sound_en: dataEn.sound,
    smell: isEn ? dataEn.smell : dataRu.smell,
    smell_ru: dataRu.smell,
    smell_en: dataEn.smell,
    feature: isEn ? dataEn.feature : dataRu.feature,
    feature_ru: dataRu.feature,
    feature_en: dataEn.feature,
    hazard: isEn ? dataEn.hazard : dataRu.hazard,
    hazard_ru: dataRu.hazard,
    hazard_en: dataEn.hazard,
    treasure: isEn ? dataEn.treasure : dataRu.treasure,
    treasure_ru: dataRu.treasure,
    treasure_en: dataEn.treasure,
    perceptionDC: Math.floor(Math.random() * 5) + 11, // DC 11-15
    investigationDC: Math.floor(Math.random() * 5) + 12 // DC 12-16
  };
}
