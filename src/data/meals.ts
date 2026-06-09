import type { Meal } from '../types';

// ─────────────────────────────────────────────────────────────
// Source: content/ernaehrung-baukasten.md
// Portionslogik: Handmaß (kein Kalorienzählen)
// Nährwerte: grobe Schätzwerte – immer mit "ca." ausweisen
// ─────────────────────────────────────────────────────────────

export const MEALS: Meal[] = [

  // ── Frühstück ─────────────────────────────────────────────

  {
    id: 'fr-muesli',
    type: 'fruehstueck',
    name: 'Protein-Müsli',
    description: '1 hohle Hand Haferflocken + 250 g Magerquark/Skyr + Beeren + 1 Daumen Nüsse',
    workdayFriendly: true,
    nutrition: { kcal: 450, proteinG: 36, carbsG: 48, fatG: 11 },
  },
  {
    id: 'fr-ruehrei',
    type: 'fruehstueck',
    name: 'Rührei mit Brot',
    description: '3–4 Eier + 1 Scheibe Vollkornbrot + Gemüse (Tomate/Paprika)',
    workdayFriendly: false,
    nutrition: { kcal: 390, proteinG: 28, carbsG: 22, fatG: 21 },
  },
  {
    id: 'fr-shake',
    type: 'fruehstueck',
    name: 'Stressmorgen-Shake',
    description: 'Skyr + Beeren + Haferflocken gemixt – oder Proteinpulver + Banane + Haferflocken',
    workdayFriendly: true,
    nutrition: { kcal: 370, proteinG: 30, carbsG: 44, fatG: 5 },
  },

  // ── Mittagessen ───────────────────────────────────────────

  {
    id: 'mi-haehnchen-reis',
    type: 'mittagessen',
    name: 'Hähnchen + Reis + Pfannengemüse',
    description: 'Hähnchen-/Putenbrust + Reis + Brokkoli-Paprika-Pfanne',
    workdayFriendly: false,
    nutrition: { kcal: 550, proteinG: 48, carbsG: 55, fatG: 8 },
  },
  {
    id: 'mi-hack-kartoffel',
    type: 'mittagessen',
    name: 'Hackfleisch-Kartoffel-Pfanne',
    description: 'Mageres Rinderhack + Kartoffeln + Zucchini/Tomate',
    workdayFriendly: false,
    nutrition: { kcal: 580, proteinG: 38, carbsG: 42, fatG: 24 },
  },
  {
    id: 'mi-lachs-kartoffel',
    type: 'mittagessen',
    name: 'Lachs mit Kartoffeln',
    description: 'Lachsfilet + Kartoffeln + Erbsen/Bohnen',
    workdayFriendly: false,
    nutrition: { kcal: 520, proteinG: 38, carbsG: 38, fatG: 18 },
  },
  {
    id: 'mi-pute-nudeln',
    type: 'mittagessen',
    name: 'Putengeschnetzeltes + Nudeln',
    description: 'Putenbrust + Vollkornnudeln + Spinat/Paprika',
    workdayFriendly: false,
    nutrition: { kcal: 540, proteinG: 44, carbsG: 52, fatG: 10 },
  },
  {
    id: 'mi-linsen-curry',
    type: 'mittagessen',
    name: 'Linsen-/Tofu-Curry',
    description: 'Rote Linsen oder Tofu + Reis + Curry-Gewürze (fleischfreier Tag)',
    workdayFriendly: false,
    nutrition: { kcal: 480, proteinG: 26, carbsG: 62, fatG: 10 },
  },

  // ── Abendessen ────────────────────────────────────────────

  {
    id: 'ab-omelett',
    type: 'abendessen',
    name: 'Omelett / Rührei',
    description: '3 Eier + 1 Scheibe Brot + Gemüse (Tomate/Paprika)',
    workdayFriendly: true,
    nutrition: { kcal: 390, proteinG: 26, carbsG: 22, fatG: 22 },
  },
  {
    id: 'ab-wrap',
    type: 'abendessen',
    name: 'Vollkorn-Wrap',
    description: 'Pute/Hähnchen + Frischkäse + Salat/Paprika im Vollkorn-Wrap',
    workdayFriendly: true,
    nutrition: { kcal: 420, proteinG: 32, carbsG: 38, fatG: 14 },
  },
  {
    id: 'ab-quark',
    type: 'abendessen',
    name: 'Magerquark herzhaft oder süß',
    description: '250–500 g Magerquark + Kräuter + Gemüsesticks — oder Beeren',
    workdayFriendly: true,
    nutrition: { kcal: 280, proteinG: 38, carbsG: 14, fatG: 4 },
  },
  {
    id: 'ab-brot',
    type: 'abendessen',
    name: 'Belegtes Vollkornbrot',
    description: '2 Scheiben + Käse/Pute/Ei + Gurke/Tomate',
    workdayFriendly: true,
    nutrition: { kcal: 350, proteinG: 22, carbsG: 38, fatG: 10 },
  },
  {
    id: 'ab-huettenkaese',
    type: 'abendessen',
    name: 'Hüttenkäse + Brot',
    description: 'Hüttenkäse + Vollkornbrot + Gemüse (Gurke, Tomate)',
    workdayFriendly: true,
    nutrition: { kcal: 330, proteinG: 28, carbsG: 30, fatG: 10 },
  },

  // ── Snacks ────────────────────────────────────────────────

  {
    id: 'sn-skyr',
    type: 'snack',
    name: 'Skyr / Magerquark',
    description: 'Kleiner Becher Skyr oder Magerquark',
    workdayFriendly: true,
    nutrition: { kcal: 130, proteinG: 18, carbsG: 8, fatG: 2 },
  },
  {
    id: 'sn-obst',
    type: 'snack',
    name: 'Obst',
    description: 'Banane, Apfel oder Beeren',
    workdayFriendly: true,
    nutrition: { kcal: 100, proteinG: 1, carbsG: 23, fatG: 0 },
  },
  {
    id: 'sn-nuesse',
    type: 'snack',
    name: 'Nüsse (1 Daumen)',
    description: 'Kleine Portion gemischte Nüsse – kalorienreich, Menge beachten',
    workdayFriendly: true,
    nutrition: { kcal: 160, proteinG: 4, carbsG: 4, fatG: 14 },
  },
  {
    id: 'sn-gemuese',
    type: 'snack',
    name: 'Gemüsesticks',
    description: 'Karotten, Gurke oder Paprika in Sticks geschnitten',
    workdayFriendly: true,
    nutrition: { kcal: 50, proteinG: 2, carbsG: 8, fatG: 0 },
  },
  {
    id: 'sn-ei',
    type: 'snack',
    name: 'Hartgekochte Eier',
    description: '1–2 hartgekochte Eier',
    workdayFriendly: true,
    nutrition: { kcal: 155, proteinG: 13, carbsG: 1, fatG: 11 },
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
