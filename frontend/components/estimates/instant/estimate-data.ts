// ─── estimate-data.ts — all logic, trees, prices, options ───────
// InstantEstimate.tsx imports from here only. No UI in this file.

// ─── Types ──────────────────────────────────────────────────────
export type Fx =
  | { t: 'price'; n: number }
  | { t: 'flag'; msg: string }
  | { t: 'online'; msg: string }
  | { t: 'recommend'; svc: string }
  | { t: 'condFlag'; msg: string };

export interface DNode {
  q: string;
  opts: { label: string; fx: Fx[]; next: string | null }[];
}

// ─── Base Prices ────────────────────────────────────────────────
export const BASE_PRICE: Record<string, number> = {
  'Crown repolish': 50,
  'Pavilion repolish': 50,
  'Crown recut & repolish': 100,
  'Pavilion recut & repolish': 100,
  'Full recut & repolish': 150,
  'Rough to Reveal': 250,
};

// ─── Estimate Tier Prices ────────────────────────────────────────
export const TIER_PRICES = {
  instant: 0,
  online: 3,
  inPerson: 10,
  feasibility: 30,
};

// ─── Weight Options ─────────────────────────────────────────────
export const WEIGHT_OPTS = [
  { label: '0 – 0.99ct',    mk: 15,  online: false },
  { label: '1 – 4.99ct',    mk: 30,  online: false },
  { label: '5 – 7.99ct',    mk: 45,  online: false },
  { label: '8 – 9.99ct',    mk: 50,  online: false },
  { label: '10 – 14.99ct',  mk: 0,   online: true  },
  { label: '15 – 19.99ct',  mk: 0,   online: true  },
  { label: '20ct and up',   mk: 0,   online: true  },
  { label: "I don't know",  mk: 0,   online: true  },
];

// ─── Species Options ────────────────────────────────────────────
// "Other" triggers online redirect — no markup for any species
export const SPECIES_OPTS = [
  'Sapphire','Ruby','Emerald','Aquamarine',
  'Topaz','Quartz','Garnet','Tourmaline','Peridot','Other',
];

// ─── Shape Options ──────────────────────────────────────────────
// No markup — recorded for cutter template only (do not tell clients)
export const SHAPE_OPTS = [
  'Round','Oval','Cushion','Emerald cut',
  'Pear','Marquise','Heart','Trillion','Other',
];

// ─── Color Options ──────────────────────────────────────────────
export const COLOR_OPTS = [
  'Colorless','Yellow','Blue','Green','Red',
  'Pink','Purple','Orange','Brown','Black','Other',
];

// ─── Darkness Scale (brightening intent) ────────────────────────
// 1 = cannot see through in warm LED, 10 = fully transparent in warm LED
export const DARKNESS_OPTS = ['1','2','3','4','5','6','7','8','9','10'];

// ─── Damage Type Options ────────────────────────────────────────
export const DAMAGE_OPTS = [
  { id: 'crack',    label: 'Crack' },
  { id: 'gash',     label: 'Gash' },
  { id: 'void',     label: 'Void or hole' },
  { id: 'cloudy',   label: 'Cloudy surface' },
  { id: 'abrasion', label: 'Breadcrumb abrasions' },
  { id: 'nodamage', label: 'No damage' },
];

// ─── Service Comparison Options ─────────────────────────────────
// Customer selection — compared against system recommendation, not used to set price
export const SERVICE_OPTS = [
  'Crown repolish',
  'Pavilion repolish',
  'Crown recut & repolish',
  'Pavilion recut & repolish',
  'Full recut & repolish',
  'Rough to Reveal',
  'Not sure',
];

// ─── Condition Options ──────────────────────────────────────────
export const CONDITION_OPTS = [
  { id: 'rough',        label: 'Rough — not yet cut' },
  { id: 'cut',          label: 'Cut — no visible damage' },
  { id: 'cut_damaged',  label: 'Cut and damaged' },
];

// ─── Intent Options (Cut path only) ─────────────────────────────
export const INTENT_OPTS = [
  { id: 'complete_recut', label: 'Complete recut' },
  { id: 'shape_change',   label: 'Shape change' },
  { id: 'surface_clean',  label: 'Cleaning up the surface' },
  { id: 'brighten',       label: 'Brightening the color' },
  { id: 'measurement',    label: 'Need a specific measurement' },
];

// ─── Intent Why — Recut ─────────────────────────────────────────
export const WHY_RECUT_OPTS = [
  { id: 'damage',    label: 'Damage' },
  { id: 'no_reason', label: 'No specific reason' },
];

// ─── Intent Why — Shape Change ──────────────────────────────────
export const WHY_SHAPE_OPTS = [
  { id: 'jewelry_fit', label: 'Needs to fit into jewelry' },
  { id: 'damage',      label: 'Damage' },
  { id: 'no_reason',   label: 'No specific reason' },
  { id: 'dont_like',   label: "Don't like the current shape" },
];

// ─── Damage Decision Trees ──────────────────────────────────────
export const DAMAGE_TREES: Record<string, Record<string, DNode>> = {
  crack: {
    start: { q: 'Where does the crack begin?', opts: [
      { label: 'Girdle',   fx: [], next: 'g_across' },
      { label: 'Pavilion', fx: [], next: 'p_loc' },
      { label: 'Crown',    fx: [], next: 'c_loc' },
    ]},
    // GIRDLE
    g_across: { q: 'Does the crack reach across the stone?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Crack reaches across the stone — structural evaluation required' }], next: null },
      { label: 'No',  fx: [], next: 'g_center' },
    ]},
    g_center: { q: 'Does the crack reach the center of the stone?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Girdle crack reaches center — structural' }], next: null },
      { label: 'No',  fx: [], next: 'g_beauty' },
    ]},
    g_beauty: { q: 'Does the crack affect the beauty of the stone?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Girdle crack affects appearance' }], next: null },
      { label: 'No',  fx: [], next: 'g_worried' },
    ]},
    g_worried: { q: 'Are you worried about the crack?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Client concerned about girdle crack' }], next: null },
      { label: 'No',  fx: [{ t: 'price', n: 50 }, { t: 'condFlag', msg: 'Isolated girdle crack — in-person recommended if only damage present' }], next: null },
    ]},
    // PAVILION
    p_loc: { q: 'Where on the pavilion does the crack begin?', opts: [
      { label: 'Culet',      fx: [], next: 'p_culet' },
      { label: 'Mid tier',   fx: [], next: 'p_mid' },
      { label: 'Near girdle',fx: [{ t: 'flag', msg: 'Pavilion crack near girdle — structural risk' }], next: null },
    ]},
    p_culet: { q: 'Can you see the damage when you look through the crown?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Pavilion culet crack visible through crown' }], next: null },
      { label: 'No',  fx: [{ t: 'price', n: 60 }, { t: 'condFlag', msg: 'Pavilion culet crack — in-person recommended if only damage' }], next: null },
    ]},
    p_mid: { q: 'Does the crack reach the edge of the stone?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Mid-pavilion crack reaches edge — structural' }], next: null },
      { label: 'No',  fx: [], next: 'p_edge' },
    ]},
    p_edge: { q: 'Does the crack reach the edge of the stone?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Pavilion crack reaches edge' }], next: null },
      { label: 'No',  fx: [], next: null },
    ]},
    // CROWN
    c_loc: { q: 'Where on the crown does the crack begin?', opts: [
      { label: 'Edge',       fx: [{ t: 'flag', msg: 'Crown crack at edge — structural risk' }], next: null },
      { label: 'Center',     fx: [], next: 'c_ctr_edge' },
      { label: 'In-between', fx: [], next: 'c_btw_edge' },
    ]},
    c_ctr_edge: { q: 'Does the crack reach the edge of the crown?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Crown center crack reaches edge — structural' }], next: null },
      { label: 'No',  fx: [], next: 'c_ctr_app' },
    ]},
    c_ctr_app: { q: 'Is the crack clearly apparent (visibly obvious)?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Apparent crown center crack' }], next: null },
      { label: 'No',  fx: [{ t: 'price', n: 50 }], next: null },
    ]},
    c_btw_edge: { q: 'Does the crack reach the edge?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Crown crack reaches edge' }], next: null },
      { label: 'No',  fx: [], next: 'c_btw_ctr' },
    ]},
    c_btw_ctr: { q: 'Does the crack reach the center?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Crown crack reaches center' }], next: null },
      { label: 'No',  fx: [], next: 'c_btw_app' },
    ]},
    c_btw_app: { q: 'Is the crack apparent?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Apparent mid-crown crack' }], next: null },
      { label: 'No',  fx: [], next: 'c_btw_reason' },
    ]},
    c_btw_reason: { q: 'Is the crack the main reason you are seeking gem services?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Crack is the primary service reason' }], next: null },
      { label: 'No',  fx: [{ t: 'price', n: 60 }], next: null },
    ]},
  },

  gash: {
    start: { q: 'Where is the gash located?', opts: [
      { label: 'Crown',    fx: [], next: 'c_dirt' },
      { label: 'Pavilion', fx: [], next: 'p_dirt' },
      { label: 'Girdle',   fx: [{ t: 'flag', msg: 'Gash at girdle — full approach required' }], next: null },
    ]},
    c_dirt: { q: 'Can dirt become trapped inside the gash?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Deep crown gash traps debris' }], next: null },
      { label: 'No',  fx: [], next: 'c_feel' },
    ]},
    c_feel: { q: 'Can you feel the gash with your fingernail?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Crown gash has depth — felt with fingernail' }], next: null },
      { label: 'No',  fx: [], next: 'c_reason' },
    ]},
    c_reason: { q: 'Is the gash the main reason you are seeking gem services?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Crown gash is the primary service reason' }], next: null },
      { label: 'No',  fx: [{ t: 'price', n: 50 }, { t: 'recommend', svc: 'Crown recut & repolish' }, { t: 'online', msg: 'Online estimate recommended for crown gash before sending' }], next: null },
    ]},
    p_dirt: { q: 'Can dirt become trapped inside the gash?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Deep pavilion gash traps debris' }], next: null },
      { label: 'No',  fx: [], next: 'p_feel' },
    ]},
    p_feel: { q: 'Can you feel the gash with your fingernail?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Pavilion gash has depth' }, { t: 'online', msg: 'Online estimate also recommended for pavilion gash' }], next: null },
      { label: 'No',  fx: [], next: 'p_vis' },
    ]},
    p_vis: { q: 'Can you see the gash when you look through the table?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Pavilion gash visible through table' }], next: null },
      { label: 'No',  fx: [{ t: 'price', n: 50 }, { t: 'recommend', svc: 'Pavilion recut & repolish' }, { t: 'online', msg: 'Online or in-person estimate recommended for pavilion gash' }], next: null },
    ]},
  },

  void: {
    start: { q: 'Where is the void or hole located?', opts: [
      { label: 'Crown',    fx: [{ t: 'flag', msg: 'Void in crown — structural evaluation required' }], next: null },
      { label: 'Pavilion', fx: [{ t: 'flag', msg: 'Void in pavilion — structural evaluation required' }], next: null },
      { label: 'Girdle',   fx: [{ t: 'flag', msg: 'Void at girdle — structural evaluation required' }], next: null },
    ]},
  },

  cloudy: {
    start: { q: 'Where is the cloudiness located?', opts: [
      { label: 'Crown',    fx: [], next: 'c_wipe' },
      { label: 'Pavilion', fx: [], next: 'p_wipe' },
    ]},
    c_wipe: { q: 'Does the cloudiness wipe away with a damp cloth?', opts: [
      { label: 'Yes', fx: [], next: 'c_white' },
      { label: 'No',  fx: [], next: 'c_white' },
    ]},
    c_white: { q: 'Does the cloudiness have a white hue?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'White-hued cloudiness in crown — possible surface crystal damage' }], next: null },
      { label: 'No',  fx: [], next: 'c_tex' },
    ]},
    c_tex: { q: 'Does the cloudiness have a texture?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Textured cloudiness in crown — structural concern' }], next: null },
      { label: 'No',  fx: [], next: 'c_see' },
    ]},
    c_see: { q: 'Can you see through the cloudiness?', opts: [
      { label: 'Yes', fx: [{ t: 'price', n: 60 }], next: null },
      { label: 'No',  fx: [{ t: 'online', msg: 'Crown cloudiness — online estimate with photos required' }], next: null },
    ]},
    p_wipe: { q: 'Does the cloudiness wipe away with a damp cloth?', opts: [
      { label: 'Yes', fx: [{ t: 'price', n: 40 }], next: 'p_white' },
      { label: 'No',  fx: [], next: 'p_white' },
    ]},
    p_white: { q: 'Does the cloudiness have a white hue?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'White-hued cloudiness in pavilion' }], next: null },
      { label: 'No',  fx: [], next: 'p_tex' },
    ]},
    p_tex: { q: 'Does the cloudiness have a texture?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Textured cloudiness in pavilion — structural concern' }], next: null },
      { label: 'No',  fx: [], next: 'p_see' },
    ]},
    p_see: { q: 'Can you see through the cloudiness?', opts: [
      { label: 'Yes', fx: [{ t: 'price', n: 60 }], next: null },
      { label: 'No',  fx: [{ t: 'online', msg: 'Pavilion cloudiness — online estimate with photos required' }], next: null },
    ]},
  },

  abrasion: {
    start: { q: 'Where are the abrasions located?', opts: [
      { label: 'Crown',    fx: [], next: 'c_edges' },
      { label: 'Girdle',   fx: [{ t: 'flag', msg: 'Abrasions at girdle — full recut approach required' }], next: null },
      { label: 'Pavilion', fx: [], next: 'p_culet' },
    ]},
    c_edges: { q: 'Do the abrasions follow along the facet edges?', opts: [
      { label: 'Yes', fx: [], next: 'c_gird' },
      { label: 'No',  fx: [{ t: 'flag', msg: 'Crown abrasions not on facet edges — in-person evaluation needed' }], next: null },
    ]},
    c_gird: { q: 'Do the abrasions reach the girdle?', opts: [
      { label: 'Yes', fx: [{ t: 'online', msg: 'Crown abrasions reach girdle — online estimate required, likely crown recut' }], next: null },
      { label: 'No',  fx: [{ t: 'price', n: 50 }, { t: 'recommend', svc: 'Crown recut & repolish' }, { t: 'online', msg: 'Online estimate recommended before sending' }], next: null },
    ]},
    p_culet: { q: 'Do the abrasions follow along the culet and travel up the facet edges?', opts: [
      { label: 'Yes', fx: [], next: 'p_gird' },
      { label: 'No',  fx: [{ t: 'flag', msg: 'Pavilion abrasions not on culet or facet edges — in-person needed' }], next: null },
    ]},
    p_gird: { q: 'Do the abrasions reach the girdle?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Pavilion abrasions reach girdle — full approach required' }], next: null },
      { label: 'No',  fx: [], next: 'p_vis' },
    ]},
    p_vis: { q: 'Can you see the abrasions when looking through the table?', opts: [
      { label: 'Yes', fx: [{ t: 'flag', msg: 'Pavilion abrasions visible through table' }], next: null },
      { label: 'No',  fx: [{ t: 'price', n: 50 }, { t: 'recommend', svc: 'Pavilion recut & repolish' }, { t: 'online', msg: 'Online estimate recommended before sending' }], next: null },
    ]},
  },
};
