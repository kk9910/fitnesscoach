import type { Meal } from '../types';

// ─────────────────────────────────────────────────────────────
// Source: content/ernaehrung-baukasten.md
// Portionslogik: Handmaß (kein Kalorienzählen)
// Nährwerte: grobe Schätzwerte – immer mit "ca." ausweisen
// Zutatenmengen: eine Portion (1 Person, 1 Mahlzeit)
// ─────────────────────────────────────────────────────────────

export const MEALS: Meal[] = [

  // ── Frühstück ─────────────────────────────────────────────

  {
    id: 'fr-muesli',
    type: 'fruehstueck',
    name: 'Protein-Müsli',
    description: '250 g Magerquark/Skyr + 50 g Haferflocken + Beeren + 1 Daumen Nüsse',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 570, proteinG: 44, carbsG: 50, fatG: 14 },
    ingredients: [
      { item: 'Haferflocken',    amount: 50,  unit: 'g',      category: 'getreide'    },
      { item: 'Magerquark',      amount: 250, unit: 'g',      category: 'milch-eier'  },
      { item: 'Beeren (TK)',     amount: 100, unit: 'g',      category: 'obst-gemuese'},
      { item: 'Nüsse (gemischt)',amount: 20,  unit: 'g',      category: 'sonstiges'   },
    ],
  },
  {
    id: 'fr-ruehrei',
    type: 'fruehstueck',
    name: 'Rührei mit Brot',
    description: '4 Eier + 1 Scheibe Vollkornbrot + Gemüse + Olivenöl',
    workdayFriendly: false,
    isVegetarian: true,
    nutrition: { kcal: 520, proteinG: 35, carbsG: 22, fatG: 30 },
    ingredients: [
      { item: 'Eier',         amount: 4,   unit: 'Stück', category: 'milch-eier'  },
      { item: 'Vollkornbrot', amount: 50,  unit: 'g',     category: 'getreide'    },
      { item: 'Tomaten',      amount: 100, unit: 'g',     category: 'obst-gemuese'},
      { item: 'Paprika',      amount: 75,  unit: 'g',     category: 'obst-gemuese'},
    ],
  },
  {
    id: 'fr-shake',
    type: 'fruehstueck',
    name: 'Stressmorgen-Shake',
    description: '300 g Skyr + 50 g Haferflocken + Beeren + 20 g Nüsse, gemixt',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 550, proteinG: 40, carbsG: 50, fatG: 10 },
    ingredients: [
      { item: 'Skyr',           amount: 300, unit: 'g', category: 'milch-eier'  },
      { item: 'Beeren (TK)',    amount: 100, unit: 'g', category: 'obst-gemuese'},
      { item: 'Haferflocken',   amount: 50,  unit: 'g', category: 'getreide'    },
      { item: 'Nüsse (gemischt)', amount: 20, unit: 'g', category: 'sonstiges' },
    ],
  },

  // ── Mittagessen ───────────────────────────────────────────

  {
    id: 'mi-haehnchen-reis',
    type: 'mittagessen',
    name: 'Hähnchen + Reis + Pfannengemüse',
    description: '200 g Hähnchenbrust + 80 g Reis + Brokkoli-Paprika-Pfanne',
    workdayFriendly: false,
    isVegetarian: false,
    nutrition: { kcal: 750, proteinG: 55, carbsG: 68, fatG: 16 },
    ingredients: [
      { item: 'Hähnchenbrust', amount: 200, unit: 'g', category: 'fleisch-fisch'},
      { item: 'Reis (trocken)',amount: 80,  unit: 'g', category: 'getreide'     },
      { item: 'Brokkoli',      amount: 150, unit: 'g', category: 'obst-gemuese' },
      { item: 'Paprika',       amount: 75,  unit: 'g', category: 'obst-gemuese' },
    ],
  },
  {
    id: 'mi-hack-kartoffel',
    type: 'mittagessen',
    name: 'Hackfleisch-Kartoffel-Pfanne',
    description: '200 g mageres Rinderhack + 250 g Kartoffeln + Zucchini/Tomate',
    workdayFriendly: false,
    isVegetarian: false,
    nutrition: { kcal: 720, proteinG: 50, carbsG: 48, fatG: 28 },
    ingredients: [
      { item: 'Rinderhack (mager)', amount: 200, unit: 'g', category: 'fleisch-fisch'},
      { item: 'Kartoffeln',         amount: 250, unit: 'g', category: 'obst-gemuese' },
      { item: 'Zucchini',           amount: 150, unit: 'g', category: 'obst-gemuese' },
      { item: 'Tomaten',            amount: 150, unit: 'g', category: 'obst-gemuese' },
    ],
  },
  {
    id: 'mi-lachs-kartoffel',
    type: 'mittagessen',
    name: 'Lachs mit Kartoffeln',
    description: '200 g Lachsfilet + 200 g Kartoffeln + Erbsen',
    workdayFriendly: false,
    isVegetarian: false,
    nutrition: { kcal: 700, proteinG: 50, carbsG: 44, fatG: 24 },
    ingredients: [
      { item: 'Lachsfilet',   amount: 200, unit: 'g', category: 'fleisch-fisch'},
      { item: 'Kartoffeln',   amount: 200, unit: 'g', category: 'obst-gemuese' },
      { item: 'Erbsen (TK)',  amount: 100, unit: 'g', category: 'obst-gemuese' },
    ],
  },
  {
    id: 'mi-pute-nudeln',
    type: 'mittagessen',
    name: 'Putengeschnetzeltes + Nudeln',
    description: '200 g Putenbrust + 80 g Vollkornnudeln + Spinat/Paprika',
    workdayFriendly: false,
    isVegetarian: false,
    nutrition: { kcal: 720, proteinG: 58, carbsG: 62, fatG: 14 },
    ingredients: [
      { item: 'Putenbrust',       amount: 200, unit: 'g', category: 'fleisch-fisch'},
      { item: 'Vollkornnudeln',   amount: 80,  unit: 'g', category: 'getreide'     },
      { item: 'Spinat (TK)',      amount: 100, unit: 'g', category: 'obst-gemuese' },
      { item: 'Paprika',          amount: 75,  unit: 'g', category: 'obst-gemuese' },
    ],
  },
  {
    id: 'mi-linsen-curry',
    type: 'mittagessen',
    name: 'Linsen-/Tofu-Curry',
    description: '100 g rote Linsen + 75 g Reis + Kokosmilch + Curry (fleischfreier Tag)',
    workdayFriendly: false,
    isVegetarian: true,
    nutrition: { kcal: 700, proteinG: 30, carbsG: 90, fatG: 14 },
    ingredients: [
      { item: 'Rote Linsen',       amount: 100, unit: 'g',  category: 'getreide'    },
      { item: 'Reis (trocken)',    amount: 75,  unit: 'g',  category: 'getreide'    },
      { item: 'Kokosmilch (light)',amount: 200, unit: 'ml', category: 'sonstiges'   },
      { item: 'Tomaten',           amount: 100, unit: 'g',  category: 'obst-gemuese'},
    ],
  },

  // ── Abendessen ────────────────────────────────────────────

  {
    id: 'ab-omelett',
    type: 'abendessen',
    name: 'Omelett / Rührei',
    description: '3–4 Eier + 1 Scheibe Vollkornbrot + Gemüse + Olivenöl',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 480, proteinG: 30, carbsG: 24, fatG: 28 },
    ingredients: [
      { item: 'Eier',         amount: 3,   unit: 'Stück', category: 'milch-eier'  },
      { item: 'Vollkornbrot', amount: 50,  unit: 'g',     category: 'getreide'    },
      { item: 'Tomaten',      amount: 100, unit: 'g',     category: 'obst-gemuese'},
      { item: 'Paprika',      amount: 75,  unit: 'g',     category: 'obst-gemuese'},
    ],
  },
  {
    id: 'ab-wrap',
    type: 'abendessen',
    name: 'Vollkorn-Wrap',
    description: '150 g Pute/Hähnchen + Frischkäse + Salat/Paprika in 2 Vollkorn-Wraps',
    workdayFriendly: true,
    isVegetarian: false,
    nutrition: { kcal: 560, proteinG: 40, carbsG: 42, fatG: 16 },
    ingredients: [
      { item: 'Hähnchenbrust',    amount: 150, unit: 'g',     category: 'fleisch-fisch'},
      { item: 'Vollkorn-Wraps',   amount: 2,   unit: 'Stück', category: 'getreide'    },
      { item: 'Frischkäse',       amount: 40,  unit: 'g',     category: 'milch-eier'  },
      { item: 'Paprika',          amount: 75,  unit: 'g',     category: 'obst-gemuese'},
      { item: 'Salat (gemischt)', amount: 50,  unit: 'g',     category: 'obst-gemuese'},
    ],
  },
  {
    id: 'ab-quark',
    type: 'abendessen',
    name: 'Magerquark herzhaft oder süß',
    description: '400 g Magerquark + Beeren/Gemüsesticks — proteinreiche Leichtoption',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 440, proteinG: 56, carbsG: 18, fatG: 6 },
    ingredients: [
      { item: 'Magerquark',  amount: 400, unit: 'g', category: 'milch-eier'  },
      { item: 'Beeren (TK)', amount: 100, unit: 'g', category: 'obst-gemuese'},
    ],
  },
  {
    id: 'ab-brot',
    type: 'abendessen',
    name: 'Belegtes Vollkornbrot',
    description: '2 Scheiben Vollkornbrot + 60 g Käse + 60 g Aufschnitt + Gurke/Tomate',
    workdayFriendly: true,
    isVegetarian: false,
    nutrition: { kcal: 500, proteinG: 34, carbsG: 42, fatG: 14 },
    ingredients: [
      { item: 'Vollkornbrot',       amount: 100, unit: 'g', category: 'getreide'    },
      { item: 'Käse (z.B. Gouda)', amount: 60,  unit: 'g', category: 'milch-eier'  },
      { item: 'Gurke',              amount: 125, unit: 'g', category: 'obst-gemuese'},
      { item: 'Tomaten',            amount: 100, unit: 'g', category: 'obst-gemuese'},
    ],
  },
  {
    id: 'ab-huettenkaese',
    type: 'abendessen',
    name: 'Hüttenkäse + Brot',
    description: '250 g Hüttenkäse + 80 g Vollkornbrot + Gemüse (Gurke, Tomate)',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 460, proteinG: 38, carbsG: 34, fatG: 14 },
    ingredients: [
      { item: 'Hüttenkäse',  amount: 250, unit: 'g', category: 'milch-eier'  },
      { item: 'Vollkornbrot',amount: 80,  unit: 'g', category: 'getreide'    },
      { item: 'Gurke',       amount: 125, unit: 'g', category: 'obst-gemuese'},
      { item: 'Tomaten',     amount: 100, unit: 'g', category: 'obst-gemuese'},
    ],
  },

  // ── Snacks ────────────────────────────────────────────────

  {
    id: 'sn-skyr',
    type: 'snack',
    name: 'Skyr + Nüsse',
    description: '250 g Skyr + 20 g Nüsse – proteinreicher Hauptsnack',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 300, proteinG: 30, carbsG: 12, fatG: 10 },
    ingredients: [
      { item: 'Skyr',            amount: 250, unit: 'g', category: 'milch-eier' },
      { item: 'Nüsse (gemischt)',amount: 20,  unit: 'g', category: 'sonstiges'  },
    ],
  },
  {
    id: 'sn-quark-beeren',
    type: 'snack',
    name: 'Magerquark + Beeren',
    description: '250 g Magerquark + Beeren + 1 TL Honig',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 280, proteinG: 35, carbsG: 20, fatG: 4 },
    ingredients: [
      { item: 'Magerquark',  amount: 250, unit: 'g', category: 'milch-eier'   },
      { item: 'Beeren (TK)', amount: 100, unit: 'g', category: 'obst-gemuese' },
    ],
  },
  {
    id: 'sn-ei',
    type: 'snack',
    name: 'Hartgekochte Eier',
    description: '2–3 hartgekochte Eier – schneller Proteinsnack',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 220, proteinG: 19, carbsG: 1, fatG: 15 },
    ingredients: [
      { item: 'Eier', amount: 3, unit: 'Stück', category: 'milch-eier' },
    ],
  },
  {
    id: 'sn-obst',
    type: 'snack',
    name: 'Obst + Nüsse',
    description: 'Banane oder Apfel + 1 Daumen Nüsse',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 240, proteinG: 5, carbsG: 32, fatG: 12 },
    ingredients: [
      { item: 'Obst (Banane/Apfel)', amount: 1,  unit: 'Stück', category: 'obst-gemuese' },
      { item: 'Nüsse (gemischt)',    amount: 25, unit: 'g',     category: 'sonstiges'    },
    ],
  },
  {
    id: 'sn-nuesse',
    type: 'snack',
    name: 'Nüsse',
    description: '1–2 Daumen gemischte Nüsse',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 185, proteinG: 5, carbsG: 5, fatG: 16 },
    ingredients: [
      { item: 'Nüsse (gemischt)', amount: 25, unit: 'g', category: 'sonstiges' },
    ],
  },
  {
    id: 'sn-gemuese',
    type: 'snack',
    name: 'Gemüsesticks + Quark-Dip',
    description: 'Karotten/Gurke/Paprika + 100 g Magerquark als Dip',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 160, proteinG: 14, carbsG: 14, fatG: 2 },
    ingredients: [
      { item: 'Gemüsesticks (Karotten/Gurke)', amount: 150, unit: 'g', category: 'obst-gemuese' },
      { item: 'Magerquark',                    amount: 100, unit: 'g', category: 'milch-eier'   },
    ],
  },
];

/** Returns all meals of the given type. */
export function getMealsOfType(type: Meal['type']): Meal[] {
  return MEALS.filter(m => m.type === type);
}

/** Returns the default daily meal suggestion (one per slot). */
export function getDefaultDailyMeals(_isWorkday: boolean): {
  fruehstueck: Meal;
  mittagessen: Meal;
  abendessen:  Meal;
  snack:       Meal;
} {
  const breakfast = MEALS.find(m => m.id === 'fr-muesli')!;
  const lunch     = MEALS.find(m => m.id === 'mi-haehnchen-reis')!;
  const dinner    = MEALS.find(m => m.id === 'ab-omelett')!;
  const snack     = MEALS.find(m => m.id === 'sn-skyr')!;
  return { fruehstueck: breakfast, mittagessen: lunch, abendessen: dinner, snack };
}
