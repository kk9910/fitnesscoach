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
    description: '1 hohle Hand Haferflocken + 250 g Magerquark/Skyr + Beeren + 1 Daumen Nüsse',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 450, proteinG: 36, carbsG: 48, fatG: 11 },
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
    description: '3–4 Eier + 1 Scheibe Vollkornbrot + Gemüse (Tomate/Paprika)',
    workdayFriendly: false,
    isVegetarian: true,
    nutrition: { kcal: 390, proteinG: 28, carbsG: 22, fatG: 21 },
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
    description: 'Skyr + Beeren + Haferflocken gemixt – oder Proteinpulver + Banane + Haferflocken',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 370, proteinG: 30, carbsG: 44, fatG: 5 },
    ingredients: [
      { item: 'Skyr',        amount: 200, unit: 'g', category: 'milch-eier'  },
      { item: 'Beeren (TK)', amount: 100, unit: 'g', category: 'obst-gemuese'},
      { item: 'Haferflocken',amount: 40,  unit: 'g', category: 'getreide'    },
    ],
  },

  // ── Mittagessen ───────────────────────────────────────────

  {
    id: 'mi-haehnchen-reis',
    type: 'mittagessen',
    name: 'Hähnchen + Reis + Pfannengemüse',
    description: 'Hähnchen-/Putenbrust + Reis + Brokkoli-Paprika-Pfanne',
    workdayFriendly: false,
    isVegetarian: false,
    nutrition: { kcal: 550, proteinG: 48, carbsG: 55, fatG: 8 },
    ingredients: [
      { item: 'Hähnchenbrust', amount: 200, unit: 'g', category: 'fleisch-fisch'},
      { item: 'Reis (trocken)',amount: 75,  unit: 'g', category: 'getreide'     },
      { item: 'Brokkoli',      amount: 150, unit: 'g', category: 'obst-gemuese' },
      { item: 'Paprika',       amount: 75,  unit: 'g', category: 'obst-gemuese' },
    ],
  },
  {
    id: 'mi-hack-kartoffel',
    type: 'mittagessen',
    name: 'Hackfleisch-Kartoffel-Pfanne',
    description: 'Mageres Rinderhack + Kartoffeln + Zucchini/Tomate',
    workdayFriendly: false,
    isVegetarian: false,
    nutrition: { kcal: 580, proteinG: 38, carbsG: 42, fatG: 24 },
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
    description: 'Lachsfilet + Kartoffeln + Erbsen/Bohnen',
    workdayFriendly: false,
    isVegetarian: false,
    nutrition: { kcal: 520, proteinG: 38, carbsG: 38, fatG: 18 },
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
    description: 'Putenbrust + Vollkornnudeln + Spinat/Paprika',
    workdayFriendly: false,
    isVegetarian: false,
    nutrition: { kcal: 540, proteinG: 44, carbsG: 52, fatG: 10 },
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
    description: 'Rote Linsen oder Tofu + Reis + Curry-Gewürze (fleischfreier Tag)',
    workdayFriendly: false,
    isVegetarian: true,
    nutrition: { kcal: 480, proteinG: 26, carbsG: 62, fatG: 10 },
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
    description: '3 Eier + 1 Scheibe Brot + Gemüse (Tomate/Paprika)',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 390, proteinG: 26, carbsG: 22, fatG: 22 },
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
    description: 'Pute/Hähnchen + Frischkäse + Salat/Paprika im Vollkorn-Wrap',
    workdayFriendly: true,
    isVegetarian: false,
    nutrition: { kcal: 420, proteinG: 32, carbsG: 38, fatG: 14 },
    ingredients: [
      { item: 'Hähnchenbrust',    amount: 120, unit: 'g',     category: 'fleisch-fisch'},
      { item: 'Vollkorn-Wraps',   amount: 2,   unit: 'Stück', category: 'getreide'    },
      { item: 'Frischkäse',       amount: 30,  unit: 'g',     category: 'milch-eier'  },
      { item: 'Paprika',          amount: 75,  unit: 'g',     category: 'obst-gemuese'},
      { item: 'Salat (gemischt)', amount: 50,  unit: 'g',     category: 'obst-gemuese'},
    ],
  },
  {
    id: 'ab-quark',
    type: 'abendessen',
    name: 'Magerquark herzhaft oder süß',
    description: '250–500 g Magerquark + Kräuter + Gemüsesticks — oder Beeren',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 280, proteinG: 38, carbsG: 14, fatG: 4 },
    ingredients: [
      { item: 'Magerquark',  amount: 350, unit: 'g', category: 'milch-eier'  },
      { item: 'Beeren (TK)', amount: 100, unit: 'g', category: 'obst-gemuese'},
    ],
  },
  {
    id: 'ab-brot',
    type: 'abendessen',
    name: 'Belegtes Vollkornbrot',
    description: '2 Scheiben + Käse/Pute/Ei + Gurke/Tomate',
    workdayFriendly: true,
    isVegetarian: false,
    nutrition: { kcal: 350, proteinG: 22, carbsG: 38, fatG: 10 },
    ingredients: [
      { item: 'Vollkornbrot',       amount: 100, unit: 'g', category: 'getreide'    },
      { item: 'Käse (z.B. Gouda)', amount: 50,  unit: 'g', category: 'milch-eier'  },
      { item: 'Gurke',              amount: 125, unit: 'g', category: 'obst-gemuese'},
      { item: 'Tomaten',            amount: 100, unit: 'g', category: 'obst-gemuese'},
    ],
  },
  {
    id: 'ab-huettenkaese',
    type: 'abendessen',
    name: 'Hüttenkäse + Brot',
    description: 'Hüttenkäse + Vollkornbrot + Gemüse (Gurke, Tomate)',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 330, proteinG: 28, carbsG: 30, fatG: 10 },
    ingredients: [
      { item: 'Hüttenkäse',  amount: 200, unit: 'g', category: 'milch-eier'  },
      { item: 'Vollkornbrot',amount: 50,  unit: 'g', category: 'getreide'    },
      { item: 'Gurke',       amount: 125, unit: 'g', category: 'obst-gemuese'},
      { item: 'Tomaten',     amount: 100, unit: 'g', category: 'obst-gemuese'},
    ],
  },

  // ── Snacks ────────────────────────────────────────────────

  {
    id: 'sn-skyr',
    type: 'snack',
    name: 'Skyr / Magerquark',
    description: 'Kleiner Becher Skyr oder Magerquark',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 130, proteinG: 18, carbsG: 8, fatG: 2 },
    ingredients: [
      { item: 'Skyr', amount: 150, unit: 'g', category: 'milch-eier' },
    ],
  },
  {
    id: 'sn-obst',
    type: 'snack',
    name: 'Obst',
    description: 'Banane, Apfel oder Beeren',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 100, proteinG: 1, carbsG: 23, fatG: 0 },
    ingredients: [
      { item: 'Obst (Banane/Apfel)', amount: 1, unit: 'Stück', category: 'obst-gemuese' },
    ],
  },
  {
    id: 'sn-nuesse',
    type: 'snack',
    name: 'Nüsse (1 Daumen)',
    description: 'Kleine Portion gemischte Nüsse – kalorienreich, Menge beachten',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 160, proteinG: 4, carbsG: 4, fatG: 14 },
    ingredients: [
      { item: 'Nüsse (gemischt)', amount: 20, unit: 'g', category: 'sonstiges' },
    ],
  },
  {
    id: 'sn-gemuese',
    type: 'snack',
    name: 'Gemüsesticks',
    description: 'Karotten, Gurke oder Paprika in Sticks geschnitten',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 50, proteinG: 2, carbsG: 8, fatG: 0 },
    ingredients: [
      { item: 'Gemüsesticks (Karotten/Gurke)', amount: 150, unit: 'g', category: 'obst-gemuese' },
    ],
  },
  {
    id: 'sn-ei',
    type: 'snack',
    name: 'Hartgekochte Eier',
    description: '1–2 hartgekochte Eier',
    workdayFriendly: true,
    isVegetarian: true,
    nutrition: { kcal: 155, proteinG: 13, carbsG: 1, fatG: 11 },
    ingredients: [
      { item: 'Eier', amount: 2, unit: 'Stück', category: 'milch-eier' },
    ],
  },
];

/** Returns all meals of the given type. */
export function getMealsOfType(type: Meal['type']): Meal[] {
  return MEALS.filter(m => m.type === type);
}

/** Returns the default daily meal suggestion (one per slot). */
export function getDefaultDailyMeals(isWorkday: boolean): {
  fruehstueck: Meal;
  mittagessen: Meal;
  abendessen: Meal;
} {
  const breakfast = isWorkday
    ? MEALS.find(m => m.id === 'fr-muesli')!
    : MEALS.find(m => m.id === 'fr-muesli')!;

  const lunch = isWorkday
    ? MEALS.find(m => m.id === 'mi-haehnchen-reis')!
    : MEALS.find(m => m.id === 'mi-haehnchen-reis')!;

  const dinner = MEALS.find(m => m.id === 'ab-omelett')!;

  return { fruehstueck: breakfast, mittagessen: lunch, abendessen: dinner };
}
