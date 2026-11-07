/**
 * D&D 5e Encounter Generator English Localization Dataset
 * Hazards, road travel events, monster rosters, tactics, complications and difficulty ratings.
 */

export const ENCOUNTER_TYPES_EN = {
  any: '🎲 Any Encounter',
  combat: '⚔️ Combat Ambush',
  hazard: '⛰️ Environmental Hazard',
  event: '🧭 Travel Event / Encounter'
};

export const BIOMES_EN = {
  any: 'Any environment',
  mountain: 'Mountains & High Passes',
  forest: 'Deep Forest & Woods',
  dungeon: 'Dungeons & Catacombs',
  swamp: 'Fetid Swamps & Bogs',
  urban: 'City Alleys & Slums',
  ruins: 'Ancient Ruins'
};

export const DIFFICULTY_LABELS_EN = {
  'Легко': 'Easy',
  'Средне': 'Medium',
  'Опасно': 'Hard',
  'Смертельно': 'Deadly'
};

export const HAZARDS_EN = {
  mountain: [
    {
      title: 'Rockfall on a Narrow Mountain Ledge',
      hazardLevel: 'Dangerous Threat',
      dc: 13,
      trigger: 'A startled mountain goat or the echo of shouting triggers a cascade of tumbling slate.',
      description: 'With a deafening roar, a shower of razor-sharp shale and a multi-ton granite boulder plummet straight toward the narrow ledge.',
      checks: [
        { skill: 'Wisdom (Perception) DC 13', effect: 'Success grants Advantage on the upcoming Dexterity saving throw (spotted the tumbling rocks early).' },
        { skill: 'Dexterity saving throw DC 14', effect: 'Half damage on success. On failure: 3d8 bludgeoning damage and pinned against the cliff face.' },
        { skill: 'Strength (Athletics) DC 13', effect: 'Pull a prone ally from under rubble or stabilize a pack mule sliding toward the precipice.' }
      ],
      consequences: 'The mountain path is choked with boulders. The party must spend 2 hours clearing the rubble or scout a treacherous detour.',
      countermeasures: 'Feather Fall spell, Stone Shape, driving pitons and climbing rope harnesses into the cliff face.'
    },
    {
      title: 'Sudden Mudslide on Rain-Soaked Slope',
      hazardLevel: 'Severe Threat',
      dc: 14,
      trigger: 'Heavy rainfall destabilizes clay soil, shearing off a massive section of earth, rocks, and briars.',
      description: 'The earth shakes beneath boots and abruptly gives way, plunging the adventurers down a steep muddy slope.',
      checks: [
        { skill: 'Strength or Dexterity saving throw DC 14', effect: 'Keep footing and grab an exposed tree root. Failure: tumble 40 ft down (4d6 damage) and land Prone in mud.' },
        { skill: 'Wisdom (Survival) DC 12', effect: 'Quickly spot a solid rock outcropping amidst the shifting mudslide.' }
      ],
      consequences: 'Loss of pack cargo or damaged cart wheel; thick mud cakes armor (Disadvantage on Stealth checks until cleaned).',
      countermeasures: 'Tying party members together with safety rope, Levitate or Misty Step spells.'
    },
    {
      title: 'Collapse of a Rotted Rope Suspension Bridge',
      hazardLevel: 'Deadly Threat',
      dc: 15,
      trigger: 'A fierce canyon gust or the weight of an armored fighter snaps a frayed support hemp rope.',
      description: 'A sharp snap echoes through the gorge. The suspension bridge tilts violently sideways over a hundred-foot canyon, floorboards plunging into the abyss.',
      checks: [
        { skill: 'Dexterity saving throw DC 15', effect: 'Snatch the remaining steel guide cable. Failure: fall over the edge into the chasm.' },
        { skill: 'Strength (Athletics) DC 14', effect: 'Haul oneself back onto the cable or hoist a dangling companion up to safety.' }
      ],
      consequences: 'The bridge is completely destroyed. Crossing to the far ridge now demands a perilous canyon descent or flight magic.',
      countermeasures: 'Silk climbing harness, Jump or Feather Fall spells, firing a grappling hook.'
    }
  ],
  forest: [
    {
      title: 'Windfall & Crashing Ancient Pines',
      hazardLevel: 'Dangerous Threat',
      dc: 13,
      trigger: 'A sudden gale or shifting root system snaps deadwood timber.',
      description: 'With an ear-splitting crack, a massive two-hundred-year-old oak shears in half, crashing across the trail directly toward the vanguard.',
      checks: [
        { skill: 'Wisdom (Perception) DC 12', effect: 'Hear the fatal timber groan a heartbeat before the collapse.' },
        { skill: 'Dexterity saving throw DC 13', effect: 'Dive into the undergrowth. Failure: 3d6 bludgeoning damage and pinned under heavy branches.' }
      ],
      consequences: 'The road is blocked; clearing the trunk with axes takes an hour or attracts prowling woodland predators.',
      countermeasures: 'Chopping or burning the trunk, or scouting an animal trail around the windfall.'
    },
    {
      title: 'Concealed Sinkhole Under Bog Moss',
      hazardLevel: 'Moderate Threat',
      dc: 12,
      trigger: 'An innocent-looking lush moss glade is actually a thin turf crust over an ancient 25-foot limestone sinkhole.',
      description: 'The green moss tears like soggy linen, and the ground collapses beneath the lead scout into pitch-black subterranean cavern.',
      checks: [
        { skill: 'Wisdom (Perception) DC 14', effect: 'Notice the unnatural springiness of the turf before stepping onto it.' },
        { skill: 'Dexterity saving throw DC 13', effect: 'Leap backwards onto firm soil. Failure: fall into the pit (2d6 falling damage).' }
      ],
      consequences: 'Sharp limestone stalagmites or animal carcasses line the bottom of the sinkhole.',
      countermeasures: 'Probing the road ahead with a ten-foot pole, rope ladders.'
    }
  ],
  dungeon: [
    {
      title: 'Ceiling Cave-In in Forgotten Gallery',
      hazardLevel: 'Severe Threat',
      dc: 14,
      trigger: 'Loud thunderous spells, shouting, or breaking an arch keystone destabilizes ancient mortar.',
      description: 'The vaulted ceiling showers granite slabs. The doorway behind the heroes is sealed shut under tons of rubble.',
      checks: [
        { skill: 'Dexterity saving throw DC 14', effect: 'Sprint into the adjacent hall. Failure: 4d6 bludgeoning damage and Stunned for 1 round.' },
        { skill: 'Strength (Athletics) DC 15', effect: 'Brace a collapsing timber beam, giving companions a crucial second to scramble past.' }
      ],
      consequences: 'Retreat is cut off; thick dust fills the air for 10 minutes (lightly obscured, heavy coughing).',
      countermeasures: 'Wall of Stone, Misty Step, sturdy dwarven timber props.'
    },
    {
      title: 'Breach of an Underground Water Pocket',
      hazardLevel: 'Dangerous Threat',
      dc: 13,
      trigger: 'A pickaxe strike or fissure wall cracks, releasing pressurized icy water from a submerged flooded tier.',
      description: 'The masonry bulges and bursts open: a surging torrent of glacial water knocks heroes off their feet, sweeping them down the descending corridor.',
      checks: [
        { skill: 'Strength saving throw DC 13', effect: 'Anchor against a wall fissure. Failure: swept 30 feet downstream slamming into rocks (2d6 damage).' },
        { skill: 'Strength (Athletics) DC 12', effect: 'Keep head above the surging water and surface in an air pocket.' }
      ],
      consequences: 'Torches and tinderboxes are soaked; dry trail rations spoiled.',
      countermeasures: 'Water Breathing spell, portable barricade, sealed oilskin pouches.'
    }
  ],
  swamp: [
    {
      title: 'Treacherous Quicksand Mud Bog',
      hazardLevel: 'Devious Threat',
      dc: 13,
      trigger: 'A misstep into a muddy slough deceptively camouflaged under floating duckweed.',
      description: 'Dark, viscous mire instantly swallows the lead adventurer up to the belt, suction dragging them deeper with every frantic move.',
      checks: [
        { skill: 'Perception or Survival DC 13', effect: 'Notice the stagnant duckweed lacking ripples before stepping in.' },
        { skill: 'Strength saving throw DC 13', effect: 'Each round: crawl 5 feet toward solid reeds. Panic doubles the sink rate.' },
        { skill: 'Dexterity (Acrobatics) DC 12', effect: 'Cast a rope or staff to the sinking ally without tumbling into the mire yourself.' }
      ],
      consequences: 'Complete submersion causes suffocation after rounds equal to Constitution modifier (minimum 1).',
      countermeasures: 'Levitate, probing poles, wide snowshoes or swamp reed boards.'
    }
  ],
  urban: [
    {
      title: 'Tenement Scaffolding Collapse',
      hazardLevel: 'Moderate Threat',
      dc: 12,
      trigger: 'An overloaded brick hod breaks flimsy wooden scaffolding high above a bustling street.',
      description: 'Splintering beams and frantic shouts of stonemasons: massive wooden scaffolding laden with heavy bricks tilts toward the cobblestones.',
      checks: [
        { skill: 'Dexterity saving throw DC 12', effect: 'Dive into an open shop doorway or raise shield. Failure: 2d8 damage from falling bricks.' },
        { skill: 'Perception or Insight DC 12', effect: 'Notice the snapping hemp cord a second before the crowd panics.' }
      ],
      consequences: 'Street riot panic; city watch arrives immediately suspecting guild sabotage.',
      countermeasures: 'Shield spell, ducking under stone awnings.'
    }
  ],
  ruins: [
    {
      title: 'Domino Collapse of Ancient Colonnade',
      hazardLevel: 'Dangerous Threat',
      dc: 14,
      trigger: 'Settling foundation or touching a crumbling temple support pylon.',
      description: 'A twenty-foot marble pillar splits and crashes into the adjacent column, unleashing a catastrophic chain reaction of falling capitals.',
      checks: [
        { skill: 'Dexterity saving throw DC 14', effect: 'Evade collapsing stone masonry. Success: unscathed. Failure: 4d6 bludgeoning damage and pinned Prone.' },
        { skill: 'Arcana or History DC 12', effect: 'Identify a solid reinforced load-bearing archway and seek shelter under it.' }
      ],
      consequences: 'A blinding dust cloud lingers for 5 minutes; the thunderous crash echoes for miles, alerting nearby wandering monsters.',
      countermeasures: 'Protective magical dome, sprinting beneath intact stone archways.'
    }
  ]
};

export const TRAVEL_EVENTS_EN = {
  mountain: [
    {
      title: 'Wounded Royal Courier',
      vibe: 'Dramatic Encounter',
      description: 'Near the pass footing, heroes discover an exhausted messenger beside a collapsed horse. An iron arrowhead pierces his shoulder; his wax-sealed satchel is intact.',
      dilemma: 'The courier begs for first aid and urges the party to deliver his pouch to the frontier fortress — shadow syndicate sellswords are on his heels.',
      reward: '25 GP, a garrison token of trust, and vital warning of an ambush up the mountain pass.'
    },
    {
      title: 'Lone Monk by the Wind Shrine',
      vibe: 'Mystical Encounter',
      description: 'Perched on a wind-swept cliff ridge, an aged hermit meditates serenely before a stacked stone cairn.',
      dilemma: 'If the party leaves a humble offering (rations, fresh water, or a single coin) and honors the spirits of the wind, the monk reveals a hidden alpine shortcut.',
      reward: 'Mountain Blessing: the party gains Advantage on Survival checks while traveling high altitudes for the next 2 days.'
    }
  ],
  forest: [
    {
      title: 'Stranded Alchemist\'s Cart',
      vibe: 'Comical / Beneficial Encounter',
      description: 'At the roadside sits a tilted wooden wagon billowing pungent violet smoke. A frantic alchemist is frantically tossing damp cloaks over hissing alembics.',
      dilemma: 'If the party helps repair the broken axle (Strength or Tinker\'s Tools DC 12), the thankful merchant offers half-price potions and rare botanical reagents.',
      reward: '50% discount on Healing Potions and a vial of glowing luminous bioluminescent pollen.'
    },
    {
      title: 'Lost Child with a Whispering Doll',
      vibe: 'Eerie Mystery Hook',
      description: 'In a moonlit woodland hollow sits a lone child clutching a stitched rag doll. The doll whispers incantations in an ancient eldritch tongue.',
      dilemma: 'Guide the lost child safely to the high road, or investigate why the pack of woodland wolves refuses to approach this clearing?',
      reward: 'Crucial plot hook leading to a local swamp hag coven.'
    }
  ],
  dungeon: [
    {
      title: 'Imprisoned Goblin Cartographer',
      vibe: 'Unexpected Ally',
      description: 'Locked inside an iron hanging cage sits a bruised goblin wearing thick magnifying spectacles, desperately clutching a stained parchment scroll to his chest.',
      dilemma: 'Locked up by his clan for refusing to share stash maps, he offers a secret shortcut bypassing the boss\'s deadly trap rooms in exchange for freedom.',
      reward: 'Hand-drawn sketch map of adjacent chambers marking a hidden pitfall trap.'
    }
  ],
  swamp: [
    {
      title: 'Will-o\'-Wisp Over Sunken Rowboat',
      vibe: 'Eerie Discovery',
      description: 'A pale azure light dances softly over cypress snags, hovering directly above a half-submerged skiff with an ironbound chest protruding from the murky water.',
      dilemma: 'The light is not immediately aggressive, but bobbing deeper into the bog tests the party\'s bravery and true motives.',
      reward: 'Masterwork engraved dagger and an antique silver hair comb (30 GP).'
    }
  ],
  urban: [
    {
      title: 'Rooftop Cutpurse Chase',
      vibe: 'Dynamic Action Episode',
      description: 'Sprinting right past the party comes a nimble young urchin clutching a velvet coin purse, pursued by a wheezing dwarven tavernkeeper brandishing a meat cleaver.',
      dilemma: 'Tackle the nimble cutpurse, aid his escape down an alley, or demand a cut of the purse?',
      reward: 'Tavernkeeper\'s gratitude (free ale and board for a week) or underground thieves\' guild contacts.'
    }
  ],
  ruins: [
    {
      title: 'Ancient Astronomical Orrery Monument',
      vibe: 'Intellectual Riddle',
      description: 'Amidst crumbling arches stands a three-sided obsidian prism with polished mirrors aligned toward the night constellations.',
      dilemma: 'Aligning the mirrors to refract moonlight (Arcana or History DC 13) projects a glowing celestial star map onto the marble floor.',
      reward: 'Each party member gains Inspiration from communion with ancient celestial wisdom.'
    }
  ]
};

export const MONSTERS_EN = {
  mountain: [
    { name: 'Ogre Rock-Hurler', role: 'Ranged Brute' },
    { name: 'Harpy', role: 'Flying Charmer' },
    { name: 'Manticore', role: 'Spike-Tailed Horror' },
    { name: 'Hill Giant', role: 'Crusher' }
  ],
  forest: [
    { name: 'Goblin Archer', role: 'Skirmisher' },
    { name: 'Wolf', role: 'Pack Beast' },
    { name: 'Dire Wolf', role: 'Pack Leader' },
    { name: 'Bugbear', role: 'Ambush Brute' },
    { name: 'Forest Troll', role: 'Relentless Regenerator' }
  ],
  dungeon: [
    { name: 'Skeleton Warrior', role: 'Minion' },
    { name: 'Zombie', role: 'Meat Shield' },
    { name: 'Ghoul', role: 'Paralyzer' },
    { name: 'Cult Fanatic', role: 'Spellcaster' },
    { name: 'Minotaur Guard', role: 'Elite Brute' }
  ],
  swamp: [
    { name: 'Bullywug Spearman', role: 'Amphibious Soldier' },
    { name: 'Giant Poisonous Snake', role: 'Stealth Hunter' },
    { name: 'Green Hag', role: 'Coven Illusionist' },
    { name: 'Carrion Crawler', role: 'Paralyzing Stalker' }
  ],
  urban: [
    { name: 'Thug Enforcer', role: 'Brawler' },
    { name: 'Bandit Raider', role: 'Footpad' },
    { name: 'Guild Spy', role: 'Infiltrator' },
    { name: 'Orc Gladiator', role: 'Heavy Fighter' }
  ],
  ruins: [
    { name: 'Animated Armor', role: 'Steel Sentry' },
    { name: 'Gargoyle', role: 'Stone Ambusher' },
    { name: 'Specter', role: 'Incorporeal Life-Drainer' }
  ]
};

export const TACTICAL_COMPLICATIONS_EN = [
  'Heavy fog or choking smoke: creatures beyond 15 feet are heavily obscured (Disadvantage on ranged attacks).',
  'Unstable footing (quicksand, wet moss, slick shale): moving at full speed requires a DC 12 Dexterity check or falling Prone.',
  'Narrow chokepoint / rope bridge: no more than 2 combatants can fight side-by-side from either side.',
  'Poisonous fungal spores / swamp vapor: at the start of each round, DC 11 Constitution save against the Poisoned condition.',
  'Tumbling stone masonry: on Initiative count 20, loose rubble showers a random combat zone (2d6 bludgeoning damage, DC 13 Dexterity save for half).'
];

export const ENEMY_TACTICS_EN = [
  'Spring from stealthy ambush, focusing ranged fire on the party\'s spellcasters and healers first.',
  'Exploit environment: luring adventurers onto treacherous bridges or beneath unstable overhangs.',
  'Cowardly morale: if their leader falls or half the pack is slain, survivors scatter and flee in panic.',
  'Zealous to the death: fight fiercely to the bitter end, attempting to drag down at least one hero with them.'
];
