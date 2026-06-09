import type { Meal } from '../types';

// ─────────────────────────────────────────────────────────────
// Source: content/ernaehrung-baukasten.md
// Portionslogik: Handmaß (kein Kalorienzählen)
// ─────────────────────────────────────────────────────────────

export const MEALS: Meal[] = [

  // ── Frühstück ─────────────────────────────────────────────

  {
    id: 'fr-muesli',
    type: 'fruehstueck',
    name: 'Protein-Müsli',
    description: '1 hohle Hand Haferflocken + 250 g Magerquark/Skyr + Beeren + 1 Daumen Nüsse',
    workdayFriendly: true,
  },
  {
    id: 'fr-ruehrei',
    type: 'fruehstueck',
    name: 'Rührei mit Brot',
    description: '3–4 Eier + 1 Scheibe Vollkornbrot + Gemüse (Tomate/Paprika)',
    workdayFriendly: false,
  },
  {
    id: 'fr-shake',
    type: 'fruehstueck',
    name: 'Stressmorgen-Shake',
    description: 'Skyr + Beeren + Haferflocken gemixt – oder Proteinpulver + Banane + Haferflocken',
    workdayFriendly: true,
  },

  // ── Mittagessen ───────────────────────────────────────────

  {
    id: 'mi-haehnchen-reis',
    type: 'mittagessen',
    name: 'Hähnchen + Reis + Pfannengemüse',
    description: 'Hähnchen-/Putenbrust + Reis + Brokkoli-Paprika-Pfanne',
    workdayFriendly: false,
  },
  {
    id: 'mi-hack-kartoffel',
    type: 'mittagessen',
    name: 'Hackfleisch-Kartoffel-Pfanne',
    description: 'Mageres Rinderhack + Kartoffeln + Zucchini/Tomate',
    workdayFriendly: false,
  },
  {
    id: 'mi-lachs-kartoffel',
    type: 'mittagessen',
    name: 'Lachs mit Kartoffeln',
    description: 'Lachsfilet + Kartoffeln + Erbsen/Bohnen',
    workdayFriendly: false,
  },
  {
    id: 'mi-pute-nudeln',
    type: 'mittagessen',
    name: 'Putengeschnetzeltes + Nudeln',
    description: 'Putenbrust + Vollkornnudeln + Spinat/Paprika',
    workdayFriendly: false,
  },
  {
    id: 'mi-linsen-curry',
    type: 'mittagessen',
    name: 'Linsen-/Tofu-Curry',
    description: 'Rote Linsen oder Tofu + Reis + Curry-Gewürze (fleischfreier Tag)',
    workdayFriendly: false,
  },

  // ── Abendessen ────────────────────────────────────────────

  {
    id: 'ab-omelett',
    type: 'abendessen',
    name: 'Omelett / Rührei',
    description: '3 Eier + 1 Scheibe Brot + Gemüse (Tomate/Paprika)',
    workdayFriendly: true,
  },
  {
    id: 'ab-wrap',
    type: 'abendessen',
    name: 'Vollkorn-Wrap',
    description: 'Pute/Hähnchen + Frischkäse + Salat/Paprika im Vollkorn-Wrap',
    workdayFriendly: true,
  },
  {
    id: 'ab-quark',
    type: 'abendessen',
    name: 'Magerquark herzhaft oder süß',
    description: '250–500 g Magerquark + Kräuter + Gemüsesticks — oder Beeren',
    workdayFriendly: true,
  },
  {
    id: 'ab-brot',
    type: 'abendessen',
    name: 'Belegtes Vollkornbrot',
    description: '2 Scheiben + Käse/Pute/Ei + Gurke/Tomate',
    workdayFriendly: true,
  },
  {
    id: 'ab-huettenkaese',
    type: 'abendessen',
    name: 'Hüttenkäse + Brot',
    description: 'Hüttenkäse + Vollkornbrot + Gemüse (Gurke, Tomate)',
    workdayFriendly: true,
  },

  // ── Snacks ────────────────────────────────────────────────

  {
    id: 'sn-skyr',
    type: 'snack',
    name: 'Skyr / Magerquark',
    description: 'Kleiner Becher Skyr oder Magerquark',
    workdayFriendly: true,
  },
  {
    id: 'sn-obst',
    type: 'snack',
    name: 'Obst',
    description: 'Banane, Apfel oder Beeren',
    workdayFriendly: true,
  },
  {
    id: 'sn-nuesse',
    type: 'snack',
    name: 'Nüsse (1 Daumen)',
    description: 'Kleine Portion gemischte Nüsse – kalorienreich, Menge beachten',
    workdayFriendly: true,
  },
  {
    id: 'sn-gemuese',
    type: 'snack',
    name: 'Gemüsesticks',
    description: 'Karotten, Gurke oder Paprika in Sticks geschnitten',
    workdayFriendly: true,
  },
  {
    id: 'sn-ei',
    type: 'snack',
    name: 'Hartgekochte Eier',
    description: '1–2 hartgekochte Eier',
    workdayFriendly: true,
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
    ? MEALS.find(m => m.id === 'mi-haehnchen-reis')!   // placeholder; user can override
    : MEALS.find(m => m.id === 'mi-haehnchen-reis')!;

  const dinner = MEALS.find(m => m.id === 'ab-omelett')!;

  return { fruehstueck: breakfast, mittagessen: lunch, abendessen: dinner };
}
