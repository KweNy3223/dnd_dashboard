/**
 * D&D 5e Loot & Hoard Generator English Localization Dataset
 * Currency denominations, gemstones, art objects, magic items, and hoard tiers.
 */

export const LOOT_TIERS_EN = {
  tier1: { label: 'Challenge Rating 0–4 (Novice)', cr: 'CR 0–4' },
  tier2: { label: 'Challenge Rating 5–10 (Heroic)', cr: 'CR 5–10' },
  tier3: { label: 'Challenge Rating 11–16 (Master)', cr: 'CR 11–16' },
  tier4: { label: 'Challenge Rating 17+ (Legendary)', cr: 'CR 17+' }
};

export const LOOT_TYPES_EN = {
  hoard: 'Hoard Chest / Lair Cache',
  individual: 'Individual Pocket Loot'
};

export const GEMS_10GP_EN = [
  'Azurite (opaque mottled deep blue)',
  'Smoky quartz (translucent gray crystal)',
  'Turquoise (light blue-green with dark veins)',
  'Malachite (striated rich banded green)',
  'Obsidian (lustrous volcanic black glass)',
  'Tiger eye (translucent golden-brown bands)'
];

export const GEMS_50GP_EN = [
  'Chrysoprase (translucent apple-green)',
  'Citrine (transparent pale yellow-brown)',
  'Moonstone (translucent milky white with blue sheen)',
  'Jasper (opaque blood-red mottled stone)',
  'Onyx (opaque bands of solid jet-black)',
  'Star rose quartz (translucent rose stone with star sheen)'
];

export const GEMS_100GP_EN = [
  'Amber (golden-yellow resin with ancient trapped insect)',
  'Amethyst (deep transparent royal purple crystal)',
  'Garnet (transparent faceted dark crimson stone)',
  'Jade (translucent silky forest green cabochon)',
  'Pearl (lustrous freshwater pearl with silver sheen)',
  'Tourmaline (transparent bi-color pink and green)'
];

export const GEMS_500GP_EN = [
  'Alexandrite (shifts from emerald green to deep purple-red)',
  'Aquamarine (transparent pale sea-green beryl)',
  'Black pearl (rare iridescent dark luster)',
  'Blue spinel (vivid deep cobalt blue crystal)',
  'Topaz (transparent golden-amber faceted gem)'
];

export const ART_OBJECTS_25GP_EN = [
  'Silver ewer engraved with sprawling grapevines',
  'Carved bone statuette of a winged lion',
  'Small hand mirror set in a gilded wooden frame',
  'Silk handkerchief embroidered with a gold thread coat of arms',
  'Engraved brass incense censer with turquoise cabochon inlays'
];

export const ART_OBJECTS_250GP_EN = [
  'Gold necklace with a fine teardrop ruby pendant',
  'Ebony jewelry box inlaid with iridescent mother-of-pearl',
  'Ceremonial silver dagger with a supple serpent-skin scabbard',
  'Pair of matched gold goblets with enameled baronial crests',
  'Silk ceremonial mantle stitched with silver thread and pearl buttons'
];

export const MAGIC_ITEMS_TIER1_EN = [
  { name: 'Potion of Healing (2d4+2)', rarity: 'Common', desc: 'Glowing crimson draught tasting of wild tart berries.' },
  { name: 'Spell Scroll (1st Level)', rarity: 'Common', desc: 'Fine calfskin vellum bearing Draconic runic script.' },
  { name: 'Spell Scroll (2nd Level)', rarity: 'Uncommon', desc: 'Thick parchment in a sealed copper scroll tube, smelling of ozone.' },
  { name: 'Potion of Climbing', rarity: 'Common', desc: 'Viscous gray sludge granting climbing speed equal to walking speed for 1 hour.' },
  { name: 'Bag of Tricks (Rust)', rarity: 'Uncommon', desc: 'A fuzzy rust-colored cloth bag that pulls forth small beast companions.' },
  { name: 'Cloak of Elvenkind', rarity: 'Uncommon', desc: 'Mottled gray cloak that shifts hue to match forest shadows; muffles steps.' }
];

export const MAGIC_ITEMS_TIER2_EN = [
  { name: 'Potion of Greater Healing (4d4+4)', rarity: 'Uncommon', desc: 'Deep ruby draught sparkling with floating golden flecks.' },
  { name: 'Weapon +1 (DM\'s choice)', rarity: 'Uncommon', desc: 'Masterwork balanced tempered steel that never dulls and glimmers softly in darkness.' },
  { name: 'Shield +1', rarity: 'Uncommon', desc: 'Forged steel heater shield embossed with a roaring wyrm.' },
  { name: 'Ring of Protection (+1 AC & Saves)', rarity: 'Rare', desc: 'Polished platinum band engraved with ancient warding sigils.' },
  { name: 'Boots of Elvenkind', rarity: 'Uncommon', desc: 'Supple deerskin boots; footsteps make no sound, Advantage on Stealth.' },
  { name: 'Wand of Magic Missiles', rarity: 'Uncommon', desc: 'Carved yew wand holding 7 charges of unerring force darts.' }
];

export const MAGIC_ITEMS_TIER3_EN = [
  { name: 'Potion of Superior Healing (8d4+8)', rarity: 'Rare', desc: 'Luminous crimson elixir pulsing with pure restorative vitality.' },
  { name: 'Weapon +2 (DM\'s choice)', rarity: 'Rare', desc: 'Legendary craftsmanship glowing with arcane power.' },
  { name: 'Cloak of Displacement', rarity: 'Rare', desc: 'Projects an illusionary duplicate a few inches away, imposing Disadvantage on incoming attacks.' },
  { name: 'Flame Tongue Sword', rarity: 'Rare', desc: 'Command word engulfs the blade in searing fire dealing +2d6 fire damage.' },
  { name: 'Sun Blade', rarity: 'Rare', desc: 'Hilt of pure platinum that projects a luminous radiant solar blade dealing radiant damage.' }
];

export const MAGIC_ITEMS_TIER4_EN = [
  { name: 'Potion of Supreme Healing (10d4+20)', rarity: 'Very Rare', desc: 'Opalescent elixir that instantly knits shattered bones and mortal wounds.' },
  { name: 'Weapon +3 (DM\'s choice)', rarity: 'Very Rare', desc: 'Imbued with the soul of a celestial war titan.' },
  { name: 'Holy Avenger', rarity: 'Legendary', desc: 'Radiant blade providing paladins with spell resistance auras and devastating fiend-slaying strikes.' },
  { name: 'Staff of the Magi', rarity: 'Legendary', desc: 'Supreme arcane focus holding 50 charges of devastating high-level spells and spell absorption.' }
];
