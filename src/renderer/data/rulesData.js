export const rulesDataRu = {
  conditions: [
    { name: 'Ослепленный', points: ['Существо автоматически проваливает проверки характеристик, требующие зрения.', 'Броски атаки по существу совершаются с преимуществом, а броски атаки самого существа — с помехой.'] },
    { name: 'Испуганный', points: ['Существо совершает с помехой проверки характеристик и броски атаки, пока источник его страха находится в пределах его видимости.', 'Существо не способно добровольно приблизиться к источнику своего страха.'] },
    { name: 'Отравленный', points: ['Существо совершает с помехой броски атаки и проверки характеристик.'] },
    { name: 'Сбитый с ног', points: ['Единственный вариант передвижения — ползком (стоит 1 доп. фут за каждый фут перемещения), пока существо не встанет.', 'Существо совершает броски атаки с помехой.', 'Бросок атаки по существу совершается с преимуществом, если нападающий находится в пределах 5 футов. В противном случае бросок атаки совершается с помехой.'] },
    { name: 'Ошеломленный', points: ['Существо недееспособно (не может совершать действия и реакции), не может двигаться и говорит только запинаясь.', 'Существо автоматически проваливает спасброски Силы и Ловкости.', 'Броски атаки по существу совершаются с преимуществом.'] },
    { name: 'Парализованный', points: ['Существо недееспособно, не может двигаться и говорить.', 'Автоматически проваливает спасброски Силы и Ловкости.', 'Броски атаки по существу совершаются с преимуществом.', 'Любая атака, попавшая по существу, становится критическим попаданием, если нападающий находится в пределах 5 футов.'] },
    { name: 'Схваченный', points: ['Скорость схваченного существа становится равна 0, и она не может увеличиться.', 'Состояние оканчивается, если захватчик становится недееспособным, или если эффект отбрасывает схваченное существо за пределы досягаемости захватчика.'] },
    { name: 'Опутанный', points: ['Скорость существа становится равна 0.', 'Броски атаки по существу совершаются с преимуществом, а броски атаки самого существа — с помехой.', 'Существо совершает спасброски Ловкости с помехой.'] },
    { name: 'Невидимый', points: ['Существо невозможно увидеть без помощи магии или особых чувств. При попытке спрятаться существо считается сильно замаскированным.', 'Броски атаки по существу совершаются с помехой, а броски атаки самого существа — с преимуществом.'] }
  ],
  combat: [
    { name: 'Рывок (Dash)', points: ['Вы получаете дополнительное перемещение в текущем ходу. Увеличение равно вашей скорости после применения всех модификаторов.'] },
    { name: 'Отход (Disengage)', points: ['Если вы совершаете действие Отход, ваше перемещение до конца текущего хода не провоцирует атаки.'] },
    { name: 'Уклонение (Dodge)', points: ['До начала вашего следующего хода любой бросок атаки по вам совершается с помехой, если вы видите нападающего.', 'Вы совершаете спасброски Ловкости с преимуществом.'] },
    { name: 'Помощь (Help)', points: ['Вы можете помочь другому существу с проверкой характеристики, давая преимущество.', 'Альтернативно, вы можете помочь атаковать цель в пределах 5 футов от вас. Следующий бросок атаки союзника по этой цели совершается с преимуществом.'] },
    { name: 'Засада (Hide)', points: ['Вы совершаете проверку Ловкости (Скрытность), чтобы спрятаться. В случае успеха вы получаете преимущества невидимого существа.'] },
    { name: 'Подготовка (Ready)', points: ['Вы выбираете условие и действие (или перемещение), которое совершите в ответ. Требует реакции.', 'Подготовка заклинания требует концентрации.'] }
  ],
  cover: [
    { name: 'Полу-укрытие (+2)', points: ['Дает бонус +2 к КД и спасброскам Ловкости.', 'Примеры: низкая стена, крупная мебель, другое существо.'] },
    { name: 'Укрытие на 3/4 (+5)', points: ['Дает бонус +5 к КД и спасброскам Ловкости.', 'Примеры: опускная решетка, бойница, толстый ствол дерева.'] },
    { name: 'Полное укрытие', points: ['Существо не может быть целью заклинаний и атак прямого действия.', 'Примеры: глухая стена, полностью закрытая дверь.'] }
  ],
  exhaustion: [
    { name: 'Степени истощения', points: ['Уровень 1: Помеха на проверки характеристик.', 'Уровень 2: Скорость уменьшается вдвое.', 'Уровень 3: Помеха на броски атаки и спасброски.', 'Уровень 4: Максимум хитов уменьшается вдвое.', 'Уровень 5: Скорость становится равна 0.', 'Уровень 6: Смерть.', 'Продолжительный отдых (с едой и водой) снижает уровень на 1.'] }
  ],
  vision: [
    { name: 'Тусклый свет', points: ['Слабо замаскированная местность. Существа совершают с помехой проверки Мудрости (Внимательность), полагающиеся на зрение.'] },
    { name: 'Тьма', points: ['Сильно замаскированная местность. Существо фактически страдает от состояния «Ослепленный» при попытке увидеть что-либо в этой зоне.'] },
    { name: 'Темное зрение (Darkvision)', points: ['Позволяет видеть в тусклом свете как в ярком, и во тьме как в тусклом (только в оттенках серого).'] }
  ],
  rest: [
    { name: 'Короткий отдых', points: ['Минимум 1 час. Можно тратить Кости Хитов для лечения.'] },
    { name: 'Продолжительный отдых', points: ['Минимум 8 часов (минимум 6 часов сна). Восстанавливает все хиты и половину Костей Хитов. Возможен 1 раз в 24 часа.'] }
  ],
  movement: [
    { name: 'Прыжок в длину', points: ['С разбегом (10 фт): Расстояние равно значению Силы.', 'С места: Дальность уменьшается вдвое.', 'Каждый фут прыжка тратит фут скорости.'] },
    { name: 'Прыжок в высоту', points: ['С разбегом (10 фт): 3 фута + модификатор Силы.', 'С места: Высота уменьшается вдвое.'] },
    { name: 'Труднопроходимая местность', points: ['Каждый 1 фут перемещения стоит 1 дополнительный фут.'] }
  ],
  concentration: [
    { name: 'Получение урона', points: ['При получении урона нужно совершить спасбросок Телосложения.', 'Сложность (Сл) равна 10 или половине полученного урона (выбирается большее значение).', 'При уроне из нескольких источников бросок делается для каждого отдельно.'] },
    { name: 'Другие причины потери', points: ['Накладывание другого заклинания, требующего концентрации.', 'Смерть персонажа или состояние «Недееспособный».'] }
  ],
  falling: [
    { name: 'Урон', points: ['Существо получает 1к6 дробящего урона за каждые 10 футов падения.', 'Максимальный урон от падения составляет 20к6.'] },
    { name: 'Приземление', points: ['При получении урона от падения существо падает ничком (Сбитый с ног).', 'Если урон не получен (например, заклинание «Плавное падение»), существо остается стоять на ногах.'] }
  ],
  deathSaves: [
    { name: 'Правила броска', points: ['Совершается в начале вашего хода, если у вас 0 хитов.', 'Бросается 1к20 без модификаторов. 10 или выше — успех, ниже 10 — провал.'] },
    { name: 'Исход', points: ['3 успеха: персонаж стабилизирован (0 хитов, не умирает).', '3 провала: персонаж мертв.'] },
    { name: 'Особые случаи (Криты)', points: ['Выпадение «1» на кубике считается как два провала.', 'Выпадение «20» на кубике: персонаж мгновенно получает 1 хит и возвращается в сознание.'] },
    { name: 'Урон при 0 хитов', points: ['Любой полученный урон дает 1 провал спасброска.', 'Если урон получен от критического попадания, это дает 2 провала.', 'Если полученный урон равен или превышает ваш максимум хитов — персонаж умирает мгновенно.'] }
  ],
  underwater: [
    { name: 'Атаки ближнего боя', points: ['Без скорости плавания атаки рукопашным оружием совершаются с помехой.', 'Исключения (без помехи): кинжал, копье, короткий меч, трезубец.'] },
    { name: 'Дальнобойные атаки', points: ['Дальнобойные атаки автоматически промахиваются за пределами нормальной дистанции.', 'Атаки в пределах нормальной дистанции совершаются с помехой.', 'Исключения (нет помехи в пределах норм. дистанции): арбалет, сеть, метательное копье, трезубец или дротик.'] }
  ],
  twoWeapon: [
    { name: 'Правило', points: ['Если вы атакуете легким оружием ближнего боя в одной руке, вы можете бонусным действием совершить атаку другим легким оружием во второй руке.'] },
    { name: 'Урон', points: ['Вы не добавляете свой модификатор характеристики к урону бонусной атаки (если он положительный).'] },
    { name: 'Метательное', points: ['Если у любого из оружия есть свойство «метательное», его можно бросить вместо удара в ближнем бою.'] }
  ],
  objects: [
    { name: 'Класс Доспеха (КД) материалов', points: ['Ткань, бумага, веревка: КД 11', 'Хрусталь, стекло, лед: КД 13', 'Дерево, кость: КД 15', 'Камень: КД 17', 'Железо, сталь: КД 19', 'Мифрил: КД 21', 'Адамантин: КД 23'] }
  ]
};

export const rulesDataEn = {
  conditions: [
    { name: 'Blinded', points: ['A blinded creature cannot see and automatically fails any ability check that requires sight.', 'Attack rolls against the creature have advantage, and the creature’s attack rolls have disadvantage.'] },
    { name: 'Frightened', points: ['A frightened creature has disadvantage on ability checks and attack rolls while the source of fear is within line of sight.', 'The creature cannot willingly move closer to the source of its fear.'] },
    { name: 'Poisoned', points: ['A poisoned creature has disadvantage on attack rolls and ability checks.'] },
    { name: 'Prone', points: ['A prone creature’s only movement option is to crawl (1 extra foot of movement per foot moved), unless it stands up.', 'The creature has disadvantage on attack rolls.', 'An attack roll against the creature has advantage if the attacker is within 5 feet. Otherwise, the attack roll has disadvantage.'] },
    { name: 'Stunned', points: ['A stunned creature is incapacitated (can’t take actions or reactions), can’t move, and can speak only falteringly.', 'The creature automatically fails Strength and Dexterity saving throws.', 'Attack rolls against the creature have advantage.'] },
    { name: 'Paralyzed', points: ['A paralyzed creature is incapacitated and cannot move or speak.', 'The creature automatically fails Strength and Dexterity saving throws.', 'Attack rolls against the creature have advantage.', 'Any attack that hits the creature is a critical hit if the attacker is within 5 feet.'] },
    { name: 'Grappled', points: ['A grappled creature’s speed becomes 0, and it cannot benefit from any bonus to its speed.', 'The condition ends if the grappler is incapacitated or an effect moves the grappled creature out of reach.'] },
    { name: 'Restrained', points: ['A restrained creature’s speed becomes 0, and it cannot benefit from any bonus to its speed.', 'Attack rolls against the creature have advantage, and the creature’s attack rolls have disadvantage.', 'The creature has disadvantage on Dexterity saving throws.'] },
    { name: 'Invisible', points: ['An invisible creature is impossible to see without magic or a special sense.', 'Attack rolls against the creature have disadvantage, and the creature’s attack rolls have advantage.'] }
  ],
  combat: [
    { name: 'Dash', points: ['You gain extra movement for the current turn equal to your speed, after applying any modifiers.'] },
    { name: 'Disengage', points: ['If you take the Disengage action, your movement doesn’t provoke opportunity attacks for the rest of the turn.'] },
    { name: 'Dodge', points: ['Until the start of your next turn, any attack roll made against you has disadvantage if you can see the attacker.', 'You make Dexterity saving throws with advantage.'] },
    { name: 'Help', points: ['You can aid a friendly creature in an ability check, giving them advantage.', 'Alternatively, you can feint or distract an enemy within 5 feet, granting advantage on the next attack roll against that target before your next turn.'] },
    { name: 'Hide', points: ['You make a Dexterity (Stealth) check in an attempt to hide, gaining the benefits of being unseen if successful.'] },
    { name: 'Ready', points: ['You decide what trigger will finish the action and what action (or movement) you will take in response using your reaction.', 'Readying a spell requires concentration until released.'] }
  ],
  cover: [
    { name: 'Half Cover (+2 AC / Dex)', points: ['Provides a +2 bonus to AC and Dexterity saving throws.', 'Examples: low wall, large furniture, a creature standing between you and the attacker.'] },
    { name: 'Three-Quarters Cover (+5 AC / Dex)', points: ['Provides a +5 bonus to AC and Dexterity saving throws.', 'Examples: portcullis, an arrow slit, a sturdy oak tree trunk.'] },
    { name: 'Total Cover', points: ['A target with total cover cannot be targeted directly by an attack or a spell.'] }
  ],
  exhaustion: [
    { name: 'Exhaustion Levels', points: ['Level 1: Disadvantage on ability checks.', 'Level 2: Speed halved.', 'Level 3: Disadvantage on attack rolls and saving throws.', 'Level 4: Hit point maximum halved.', 'Level 5: Speed reduced to 0.', 'Level 6: Death.', 'A long rest with sufficient food and drink reduces exhaustion by 1 level.'] }
  ],
  vision: [
    { name: 'Dim Light', points: ['Lightly obscured area. Creatures have disadvantage on Wisdom (Perception) checks that rely on sight.'] },
    { name: 'Darkness', points: ['Heavily obscured area. Characters in darkness effectively suffer from the Blinded condition when trying to see something there.'] },
    { name: 'Darkvision', points: ['Allows a creature to see in dim light as if it were bright light, and in darkness as if it were dim light (in shades of gray only).'] }
  ],
  rest: [
    { name: 'Short Rest', points: ['At least 1 hour long. Characters can spend Hit Dice to regain hit points.'] },
    { name: 'Long Rest', points: ['At least 8 hours long (with at least 6 hours of sleep). Restores all hit points and up to half the character’s maximum Hit Dice. Available at most once per 24 hours.'] }
  ],
  movement: [
    { name: 'Long Jump', points: ['With a 10-foot running start: jump distance equals your Strength score in feet.', 'From a standstill: jump distance is halved.', 'Each foot cleared costs a foot of movement.'] },
    { name: 'High Jump', points: ['With a 10-foot running start: height equals 3 + Strength modifier in feet.', 'From a standstill: jump height is halved.'] },
    { name: 'Difficult Terrain', points: ['Every 1 foot of movement costs 1 additional foot (2 feet total per foot moved).'] }
  ],
  concentration: [
    { name: 'Taking Damage', points: ['Whenever you take damage while concentrating, make a Constitution saving throw.', 'The DC equals 10 or half the damage taken, whichever is higher.', 'Make a separate save for each source of damage.'] },
    { name: 'Other Interruptions', points: ['Casting another spell that requires concentration.', 'Being incapacitated or killed.'] }
  ],
  falling: [
    { name: 'Damage', points: ['A creature takes 1d6 bludgeoning damage for every 10 feet fallen.', 'Maximum fall damage is capped at 20d6.'] },
    { name: 'Landing', points: ['A creature lands prone unless it avoids taking damage from the fall (e.g. Feather Fall).'] }
  ],
  deathSaves: [
    { name: 'The Roll', points: ['Roll at the start of your turn whenever you start with 0 hit points.', 'Roll 1d20 with no modifiers. 10 or higher is a success; 9 or lower is a failure.'] },
    { name: 'Outcome', points: ['3 successes: stable at 0 HP.', '3 failures: dead.'] },
    { name: 'Criticals', points: ['Rolling a 1 counts as two failures.', 'Rolling a 20 regains 1 HP immediately and regains consciousness.'] },
    { name: 'Damage at 0 HP', points: ['Taking any damage causes one death save failure.', 'Damage from a critical hit causes two failures.', 'If damage equals or exceeds your max HP, instant death occurs.'] }
  ],
  underwater: [
    { name: 'Melee Attacks', points: ['Without a swimming speed, melee weapon attacks have disadvantage.', 'Exceptions (no disadvantage): dagger, javelin, shortsword, spear, or trident.'] },
    { name: 'Ranged Attacks', points: ['Ranged attacks automatically miss beyond normal weapon range.', 'Ranged attacks within normal range have disadvantage unless using a crossbow, net, or thrown weapon designed for water (spear, trident, dart).'] }
  ],
  twoWeapon: [
    { name: 'The Rule', points: ['When you take the Attack action with a light melee weapon in one hand, you can use a bonus action to attack with a different light melee weapon in the other hand.'] },
    { name: 'Damage', points: ['You don’t add your ability modifier to the damage of the bonus attack unless that modifier is negative.'] },
    { name: 'Thrown Weapons', points: ['If either weapon has the thrown property, you can throw it instead of making a melee attack.'] }
  ],
  objects: [
    { name: 'Armor Class by Material', points: ['Cloth, paper, rope: AC 11', 'Crystal, glass, ice: AC 13', 'Wood, bone: AC 15', 'Stone: AC 17', 'Iron, steel: AC 19', 'Mithral: AC 21', 'Adamantine: AC 23'] }
  ]
};
