/**
 * D&D 5e Dungeon & Chamber Generator English Localization Dataset
 * Chamber themes, dimensions, sensory details, interactive mechanisms, hazards, and discoveries.
 */

export const DUNGEON_THEMES_EN = {
  any: 'Any Theme',
  crypt: 'Ancient Crypt',
  temple: 'Forgotten Temple & Shrine',
  cave: 'Cavern & Monster Lair',
  fortress: 'Abandoned Stronghold',
  lab: 'Arcane Alchemical Laboratory',
  catacombs: 'Catacombs & Sewers'
};

export const ROOM_SIZES_EN = [
  'Small chamber (20×20 ft.), low 10 ft. ceiling.',
  'Elongated gallery (15×45 ft.), pointed rib vaults 15 ft.',
  'Spacious square hall (40×40 ft.), massive stone columns 25 ft.',
  'Circular domed rotunda (35 ft. diameter), dome apex 30 ft.',
  'Multi-tiered cavern hollow (50×35 ft.) with natural stone ledges.',
  'Narrow dead-end corridor (10×30 ft.), crumbling masonry.'
];

export const THEME_DETAILS_EN = {
  crypt: {
    titles: [
      'Sepulcher of the Knightly Order',
      'Crypt of the Nameless Lord',
      'Columbarium of Forgotten Souls',
      'Hall of Funerary Urns'
    ],
    architecture: 'Dark gray ashlar granite, burial alcoves chiseled into stone with moth-eaten funerary shrouds.',
    sight: 'Oppressive gloom. Only the faint bioluminescent glow of tomb lichen creeping around sarcophagus bases.',
    sound: 'Hollow groan of shifting bedrock and the rhythmic drip of condensation from a vaulted ceiling fissure.',
    smell: 'Stale odor of bone dust, aged beeswax candles, and crypt cold.',
    feature: 'Central stone sarcophagus sculpted with a knight resting hands on a down-pointed broadsword. Rotating the hilt unlocks a hidden hollow compartment.',
    hazard: 'A flagstone before the bier is linked to a pressure sear: stepping on it triggers poisoned dart volleys from burial niches (DC 13 Dexterity, 2d6 poison damage).',
    treasure: 'Concealed in the shroud folds is a signet ring engraved with a forgotten crest (35 GP) and an ornate antique brass key.'
  },
  temple: {
    titles: [
      'Sanctuary of the Fallen Star',
      'Chamber of Extinguished Altars',
      'Narthex of the Whispering Gods',
      'Chapel of the Eternal Vow'
    ],
    architecture: 'Cracked white Carrara marble, gilded mosaic remnants, and desecrated statues with chiseled-away faces.',
    sight: 'A single shaft of dusty daylight pierces a fractured dome fissure, illuminating a tarnished brass sacrificial bowl.',
    sound: 'Ghostly sigh of wind whistling through acoustic ventilation flues, echoing like liturgical choir chants in a forgotten dialect.',
    smell: 'Ancient frankincense, myrrh, and residual ozone from divine rites performed centuries ago.',
    feature: 'A massive basalt altar carved with four depressions designed for elemental offerings (earth, water, fire, air).',
    hazard: 'A glyph of blasphemy on the altar dais: uninitiated creatures trigger a burst of radiant blinding flash (DC 14 Constitution save or Blinded for 1 minute).',
    treasure: 'At the bottom of the holy font lies a carved carnelian chalice (75 GP) and a vellum scroll bearing a prayer of protection.'
  },
  cave: {
    titles: [
      'Grotto of Weeping Stalactites',
      'Lair of the Bone Stalker',
      'Fissure of Subterranean Winds',
      'Burrow of the Great Worm'
    ],
    architecture: 'Jagged moist basalt walls; glistening needle stalactites hanging precariously from an uneven jagged vault.',
    sight: 'Absolute, pitch-black darkness. In torchlight, wet slick stone gleams, creating the illusion that the cavern walls are breathing.',
    sound: 'Echo of dripping mineral water, crunch of gnawed bones under boots, and the low predatory growl of a stalking beast.',
    smell: 'Pungent reek of damp mildew, guano, and decomposing flesh.',
    feature: 'Subterranean spring pool with crystal-clear turquoise water; a strange phosphorescent crystal glimmers at the bottom.',
    hazard: 'Colony of carnivorous Shrieker mushrooms: approaching heat sources triggers an ear-splitting shriek that summons wandering predators.',
    treasure: 'Tucked in a cave cleft is a shredded leather satchel from a dead prospector: 14 GP, raw pyrite nugget, and an explorer\'s compass.'
  },
  fortress: {
    titles: [
      'Bastion Weaponry Armory',
      'Upper Rampart Guardpost',
      'Commandant\'s War Room',
      'Abandoned Garrison Barracks'
    ],
    architecture: 'Heavy dressed stone masonry, wrought-iron brackets, and deep scars from ancient catapult bombardments.',
    sight: 'Walls blackened by bygone fires; splintered tower shields and rusted iron spearheads litter the dirt floor.',
    sound: 'Draft slams a loose ironbound timber door somewhere down the drafty corridor with rhythmic clanging.',
    smell: 'Odor of iron rust, charred oak beams, and rancid machine oil.',
    feature: 'Oak war table with a crumbling tactical map of the stronghold and a wax-sealed bronze map scroll tube.',
    hazard: 'Weakened ceiling crossbeam: thunder spells or heavy blows cause stone blocks to collapse (DC 12 Dexterity, 3d6 bludgeoning damage).',
    treasure: 'In an iron rack survives a masterwork light crossbow adorned with dwarven runes and a taut oiled silk bowstring (40 GP).'
  },
  lab: {
    titles: [
      'Transmuter\'s Crucible Lab',
      'Hall of Alchemical Alembics',
      'Cabinet of Anatomical Curiosities',
      'Archive of Forbidden Formulas'
    ],
    architecture: 'Acid-etched stone benches, iron shelving crowded with cracked retorts, glass beakers, and spiraling copper tubing.',
    sight: 'Eerie sickly-green luminescence pulsing from a pressurized glass vat preserving a floating multi-eyed organ.',
    sound: 'Faint bubbling in a self-heating distillation apparatus and the hiss of reactive chemicals.',
    smell: 'Acre stench of sulfur, vinegar, formaldehyde, and singed feathers.',
    feature: 'Mechanical brass arithmometer with engraved dials: entering a three-digit cipher pops open a concealed compartment in the tabletop.',
    hazard: 'A shattered chemical flask on the floor releases toxic vapor when disturbed (DC 13 Constitution save or Poisoned condition for 1 hour).',
    treasure: 'In an unbroken padded velvet case rests a Potion of Healing and a glass vial of refined philosopher\'s quicksilver (25 GP).'
  },
  catacombs: {
    titles: [
      'Lower Ward Runoff Sewer',
      'Sluice Gate Chamber',
      'Smugglers\' Hidden Dead-End',
      'Refuse Disposal Well'
    ],
    architecture: 'Slime-coated vaulted brick arches, deep drainage troughs carrying sluggish brackish murky runoff.',
    sight: 'Flickering bio-luminescent swamp rot clinging to debris islands, iridescent oily slicks on stagnant black water.',
    sound: 'Skittering of sewer rats and the muffled rumble of city carriage traffic echoing from high iron street grates.',
    smell: 'Suffocating stench of rotting refuse, black sludge, and stagnant marsh gas.',
    feature: 'A cast-iron sluice wheel. Turning the rusted wheel drains the sewage canal, revealing a stuck ironbound footlocker.',
    hazard: 'Pocket of flammable marsh methane gas: open torch flames trigger a fiery deflagration (2d6 fire damage in a 15-ft radius, DC 12 Dexterity save for half).',
    treasure: 'Snagged in an iron sewer grate is a water-tight oilskin pouch: 28 SP, 9 GP, and a carved bone pipe.'
  }
};
