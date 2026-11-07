/**
 * D&D 5e Shop & Merchant Generator English Localization Dataset
 */

export const SHOP_TYPES_EN = {
  armory: {
    name: 'Weaponsmith & Armor',
    desc: 'Blades, axes, shields, plate armor, and field repair services.'
  },
  alchemy: {
    name: 'Alchemist & Herbalist',
    desc: 'Potions, antitoxins, alchemist\'s fire, dried herbs, and powders.'
  },
  magic: {
    name: 'Arcane Shop & Scrolls',
    desc: 'Spell scrolls, arcane foci, enchanted ink, and mysterious grimoires.'
  },
  pawnshop: {
    name: 'Pawnshop & Antiques',
    desc: 'Curiosities, odd trinkets, second-hand gear, and forgotten relics.'
  },
  black_market: {
    name: 'Underground Black Market',
    desc: 'Poisons, thieves\' picks, contraband, smuggled gems, and forged seals.'
  },
  general: {
    name: 'General Store & Outfitter',
    desc: 'Backpacks, hempen ropes, torches, rations, bedrolls, and toolkits.'
  }
};

export const WEALTH_TIERS_EN = {
  medium: {
    name: 'City Merchant Quarter',
    desc: 'Solid craftsmanship, standard city rates, dependable inventory.'
  },
  poor: {
    name: 'Village / Slums Outskirts',
    desc: 'Humble stock, worn second-hand gear, discount prices, rustic quality.'
  },
  wealthy: {
    name: 'Capital Noble Plaza',
    desc: 'Masterwork craftsmanship, gilded filigree, rare alloys, inflated luxury rates.'
  }
};

export const SHOP_NAMES_EN = {
  armory: {
    prefixes: ['The Gilded', 'The Iron', 'The Adamantine', 'The Sharp', 'The Heavy', 'The Blazing', 'The Stalwart', 'The Bloodstained'],
    roots: ['Anvil', 'Blade', 'Halberd', 'Shield', 'Gauntlet', 'Hammer', 'Bastion', 'Hearth'],
    personal: ['Torvald\'s War Forge', 'The Golden Scabbard', 'Garrison Steel & Mail', 'The Keen Edge']
  },
  alchemy: {
    prefixes: ['The Bubbling', 'The Emerald', 'The Verdant', 'The Whispering', 'The Distilled', 'The Celestial', 'The Secret'],
    roots: ['Crucible', 'Mortar', 'Vial', 'Elixir', 'Fern', 'Alembic', 'Flask', 'Root'],
    personal: ['Miriel\'s Botanical Lab', 'The Dragon\'s Bile', 'Essence & Spirit', 'The Amber Alembic']
  },
  magic: {
    prefixes: ['The Starlight', 'The Arcane', 'The Ethereal', 'The Gilded', 'The Mystic', 'The Celestial', 'The Ancient'],
    roots: ['Scroll', 'Orb', 'Rune', 'Tome', 'Prism', 'Eye', 'Sigil', 'Grimoire'],
    personal: ['Valerius\'s Curio Emporium', 'The Silver Quill', 'Vault of Secrets', 'The Starry Astrolabe']
  },
  pawnshop: {
    prefixes: ['The Dusty', 'The Old', 'The Forgotten', 'The Lucky', 'The Crooked', 'The Curious'],
    roots: ['Key', 'Chest', 'Trinket', 'Relic', 'Locket', 'Lantern', 'Barnacle'],
    personal: ['Barnaby\'s Vault of Oddities', 'The Second Hand', 'Relics & Remnants', 'The Rusty Coin']
  },
  black_market: {
    prefixes: ['The Shadow', 'The Cloaked', 'The Silent', 'The Midnight', 'The Veiled', 'The Velvet'],
    roots: ['Dagger', 'Mask', 'Sleeve', 'Alley', 'Coin', 'Rook', 'Web'],
    personal: ['The Cat\'s Paw', 'Under the Cobblestones', 'The Blind Eye Guild', 'Whisper & Coin']
  },
  general: {
    prefixes: ['The Honest', 'The Reliable', 'The Sturdy', 'The Traveler\'s', 'The Daily', 'The Frontier'],
    roots: ['Pack', 'Wagon', 'Rope', 'Compass', 'Outfitter', 'Provisions', 'Bazaar'],
    personal: ['Goodbarrel\'s General Goods', 'The Trailhead Depot', 'Wayfarer\'s Oasis', 'The Brass Lantern']
  }
};

export const MERCHANTS_EN = [
  { name: 'Torvald Ironcleaver', race: 'Dwarf', gender: 'Male', occupation: 'Weaponsmith & Armorer', bargain: 'Gruff and unyielding; respects warriors who appreciate fine balance in an axe.' },
  { name: 'Helma Stoneheart', race: 'Dwarf', gender: 'Female', occupation: 'Forge Mistress & Appraiser', bargain: 'Sharp eye for metals; offers minor discounts if given rare ore samples.' },
  { name: 'Miriel Thinleaf', race: 'Elf', gender: 'Female', occupation: 'Alchemist-Herbalist', bargain: 'Gentle and serene; fascinated by exotic flora and fey seeds.' },
  { name: 'Aldous Vance', race: 'Human', gender: 'Male', occupation: 'Apothecary & Scholar', bargain: 'Nervous perfectionist; strictly follows imperial weights and measures.' },
  { name: 'Valerius the Astute', race: 'Half-Elf', gender: 'Male', occupation: 'Curio Dealer & Collector', bargain: 'Aristocratic drawl; always looking to purchase ancient coins and trinkets.' },
  { name: 'Madam Malora', race: 'Tiefling', gender: 'Female', occupation: 'Antique Dealer & Diviner', bargain: 'Insinuating and velvet-voiced; trades secrets for rare components.' },
  { name: 'Barnaby Tosscobble', race: 'Halfling', gender: 'Male', occupation: 'Pawnbroker & Scavenger', bargain: 'Fast talker; loves haggling over coppers and telling grand stories.' },
  { name: 'Gareth Cooper', race: 'Human', gender: 'Male', occupation: 'General Storekeeper', bargain: 'Honest family man; throws in free torch bundles for large orders.' },
  { name: 'Shadowy Vane', race: 'Human', gender: 'Male', occupation: 'Underworld Fence & Smuggler', bargain: 'Speaks in code; requires a covert guild handshake before discussing real goods.' },
  { name: 'Kaelen Swiftarrow', race: 'Elf', gender: 'Male', occupation: 'Bowyer & Fletcher', bargain: 'Demanding craftsman; refuses to sell fine composite bows to clumsy brutes.' },
  { name: 'Orrin Goldfinder', race: 'Gnome', gender: 'Male', occupation: 'Clockwork Jeweler & Gemcutter', bargain: 'Excitable inventor; gets distracted by shiny gemstones and spring coils.' },
  { name: 'Brakka Bonecrusher', race: 'Half-Orc', gender: 'Female', occupation: 'Heavy Armor Smith', bargain: 'Tests armor with her own warhammer; respects physical endurance.' },
  { name: 'Cedric Highgate', race: 'Human', gender: 'Male', occupation: 'Imperial Guild Merchant', bargain: 'Stiff bureaucrat; adds a 10% city luxury tax for non-citizens.' },
  { name: 'Zara Nightingale', race: 'Half-Elf', gender: 'Female', occupation: 'Bardic Instrument Maker', bargain: 'Passionate musician; gives discounts to anyone who performs a ballad.' },
  { name: 'Grumm the Silent', race: 'Goliath', gender: 'Male', occupation: 'Expedition Outfitter', bargain: 'Speaks in single-word grunts; packs backpacks with surgical balance.' },
  { name: 'Vespera Blackwood', race: 'Tiefling', gender: 'Female', occupation: 'Poisons & Dark Arcana Dealer', bargain: 'Icy polite smile; demands complete discretion and upfront gold.' },
  { name: 'Toby Appleblossom', race: 'Halfling', gender: 'Male', occupation: 'Trail Baker & Provisioner', bargain: 'Generous and jovial; slips warm honey cakes into travelers\' rations.' }
];

export const ATMOSPHERES_EN = {
  armory: [
    'A searing hearth furnace roars at the back; walls lined with gleaming polished broadswords and chainmail hauberks.',
    'Heavy scent of hot iron, machine oil, and charred coal; the rhythmic clang of an anvil echoes continuously.',
    'A display of dented tournament shields and a suit of gilded plate armor standing guard beside the doorway.'
  ],
  alchemy: [
    'Glass alembics bubble with amber and turquoise liquids; rows of dried wolfsbane hang from the wooden rafters.',
    'Pungent aroma of crushed mint, sulfur, and sweet dragon-nectar; multicolored vapor gently curls around the ceiling.',
    'A small caged homunculus sleeping atop a dusty shelf beside glowing vials of bioluminescent moss.'
  ],
  magic: [
    'Floating orbs of gentle blue starlight illuminate velvet-lined display cases filled with wand cores and crystal foci.',
    'Fragrant scent of rare frankincense, parchment dust, and ozone; quiet spectral whispers faintly murmur between bookshelves.',
    'An animated silver quill meticulously copying scrolls on its own behind a protective glass counter.'
  ],
  pawnshop: [
    'A dense labyrinth of brass clocks, cracked oil portraits, rusted birdcages, and peculiar taxidermy creatures.',
    'Smells of mothballs, old leather, and dry attic memories; grandfather clocks chime slightly out of sync.',
    'A glass case filled with mysterious broken lockets, foreign coins, and puzzle boxes with carved runes.'
  ],
  black_market: [
    'Hidden beneath a trapdoor behind a butcher shop; dim red oil lantern light reveals cloaked figures in dark booths.',
    'Damp cellar stones, bitter scent of nightshade oil and cigar smoke; silent bouncers watch every pocket.',
    'A discreet velvet tray displaying lockpick sets, hollow signet rings, and vials marked with skull runes.'
  ],
  general: [
    'Floor-to-ceiling wooden cubbies packed with coils of hempen rope, tin lanterns, iron rations, and canvas bedrolls.',
    'Hearty, comforting aroma of smoked sausage, dry grain, fresh pitch pine, and beeswax candles.',
    'A heavy iron brass scale on the counter surrounded by bundles of arrows, mess kits, and pitons.'
  ]
};

export const SECURITY_EN = [
  {
    type: 'Hunting Mastiff',
    desc: 'A heavy, scarred mastiff sleeps lightly beneath the counter, ears twitching at the slightest footstep.',
    dc: 'DC 14 (Dog\'s Passive Perception)',
    badge: '🐕 Guard Beast'
  },
  {
    type: 'Alarm Bells',
    desc: 'Fine, near-invisible tripwires connected to brass jingle bells are rigged along showcase shelves.',
    dc: 'DC 13 (Sleight of Hand to Bypass)',
    badge: '🔔 Mechanical Alarm'
  },
  {
    type: 'Hired Bouncer',
    desc: 'A seven-foot half-orc mercenary leans quietly against the back door, arms crossed over a spiked maul.',
    dc: 'CR 2 (Veteran Guard)',
    badge: '🛡️ Armed Guard'
  },
  {
    type: 'Arcane Glyph',
    desc: 'A faint blue warding rune etched beneath the showcase glass, primed to flash blind any thief.',
    dc: 'DC 14 (Arcana / Dispel Magic)',
    badge: '✨ Arcane Ward'
  },
  {
    type: 'Reinforced Iron Grate',
    desc: 'All valuable wares are locked behind heavy forged steel bars secured by a masterwork dwarven padlock.',
    dc: 'DC 18 (Thieves\' Tools)',
    badge: '🔒 Iron Grates'
  },
  {
    type: 'Glyph of Alarm',
    desc: 'A magical sensor tied to the local City Watch barracks that rings silently if glass is cracked.',
    dc: 'DC 15 (Arcana to Detect)',
    badge: '🚨 Silent Alarm'
  }
];

export const SHOP_RUMORS_EN = [
  'The caravan carrying rare supplies from the capital is four days late; whispers on the trail speak of coordinated bandit raids.',
  'A city watch officer visited yesterday warning that lead-adulterated counterfeit gold coins are circulating in the market.',
  'An eccentric foreign nobleman has been buying up every scrap of silver weaponry in the city, paying double price.',
  'A thief broke into the High Magistrate\'s manor two nights ago, ignoring gold and stealing only an ancient velvet-bound ledger.',
  'The local alchemist claims his latest batch of healing potions boiled away into blue sparks due to a sudden planar alignment.',
  'Dock workers refuse to unload night shipments from the southern freighter, claiming they hear weeping from inside sealed barrels.',
  'Prices of grain and flour are expected to triple next week following a mysterious blight across the southern wheat fields.',
  'A local adventurer sold an ancient copper idol to a pawnshop yesterday; the shopkeeper was found babbling in dead tongues this morning.'
];

export const SECRET_LOTS_EN = {
  armory: [
    {
      name: 'Vicious Dagger of the Shadow Guild',
      price: '180 gp',
      desc: 'Blackened blade that drinks ambient light. Critical hits deal an extra 7 piercing damage.',
      lore: 'Confiscated from an assassin who failed to eliminate a visiting trade ambassador.'
    },
    {
      name: 'Adamantine Chain Shirt (Lightweight)',
      price: '500 gp',
      desc: 'Masterwork dark alloy mail. Any critical hit against the wearer turns into a normal hit.',
      lore: 'Forged in a secret dwarven hold, smuggled out past imperial excise customs.'
    }
  ],
  alchemy: [
    {
      name: 'Oil of Ethereal Slipperiness',
      price: '150 gp',
      desc: 'Can be applied to a creature to grant Freedom of Movement for 8 hours, or poured on the floor as Grease.',
      lore: 'Brewed from distilled phase spider silk and celestial oil.'
    },
    {
      name: 'Philter of Glibness & Silver Tongue',
      price: '220 gp',
      desc: 'Sweet golden nectar; grants advantage on Charisma (Persuasion) checks for 1 hour.',
      lore: 'Favored by high-stakes ambassadors and courtly conspirators.'
    }
  ],
  magic: [
    {
      name: 'Scroll of Misty Step (Two Castings)',
      price: '250 gp',
      desc: 'Crisp vellum scroll sealed with shimmering azure wax; allows bonus action 30 ft. teleportation.',
      lore: 'Salvaged from the saddlebag of an imperial courier found near the Grey Crags.'
    },
    {
      name: 'Wand of Minor Pyrotechnics',
      price: '300 gp',
      desc: 'Carved cherrywood wand with 3 charges; creates blinding flashes of smoke or dazzling fireworks.',
      lore: 'Left as collateral by a traveling wizard who never returned for it.'
    }
  ],
  pawnshop: [
    {
      name: 'Cursed Locket of False Memories',
      price: '90 gp',
      desc: 'Ancient silver locket showing a portrait of whoever opens it as a child in noble robes.',
      lore: 'The pawnbroker wants it gone immediately; says it murmurs nursery rhymes at night.'
    },
    {
      name: 'Folding Skeleton Key of Mystery',
      price: '200 gp',
      desc: 'Intricate brass mechanism with rotating teeth; grants +2 on checks to pick non-magical locks.',
      lore: 'Pawned by an aging burglar looking to buy a quiet retirement farm.'
    }
  ],
  black_market: [
    {
      name: 'Vial of Midnight Tears (Lethal Poison)',
      price: '400 gp',
      desc: 'Colorless, odorless toxin. Ingested creature must succeed on DC 17 CON save or suffer 31 (9d6) poison damage.',
      lore: 'Strictly outlawed across all civilized baronies under pain of public hanging.'
    },
    {
      name: 'Masterwork Infiltration Picks (Adamantine)',
      price: '150 gp',
      desc: 'Virtually unbreakable lockpicks that never snap on failed checks and grant advantage on DC 15+ locks.',
      lore: 'Bore the stamped sigil of the Royal Master of Keys.'
    }
  ],
  general: [
    {
      name: 'Dwarven Miner\'s Everburning Lantern',
      price: '110 gp',
      desc: 'Solid brass hood containing a continual flame spell; emits bright light in a 30 ft. radius without burning fuel.',
      lore: 'Unearthed during a road renovation near an ancient abandoned mineshaft.'
    },
    {
      name: 'Silken Climbing Rope of Spiders (100 ft.)',
      price: '85 gp',
      desc: 'Feather-light enchanted silk that weighs only 2 lbs, holds up to 1,500 lbs, and clings securely to stone.',
      lore: 'Looted from a Drow scouting party ambushed along the lower foothills.'
    }
  ]
};
