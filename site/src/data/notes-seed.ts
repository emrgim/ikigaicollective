// Phase 1 seed copied from the mockups. Phase 2 replaces this with the `notes` content collection.
const rows: [string, string][] = [
  ['A Container for Experiments', '22 April'], ['Start From What You Are Good At', '29 April'], ['The Lab Is the Work', '6 May'],
  ['The Freedom and the Burden', '14 May'], ['What Is the Question We Should Be Asking?', '21 May'], ['An Evening in Italian', '28 May'],
  ['One Human, Five AIs', '4 June'], ['First Draft of Our Values', '11 June'], ['A Studio of Artists', '18 June'],
  ['Agency, Not Meaning', '25 June'], ['Curiosity, Agency, Compassion', '2 July'], ['The Doors Are Open', '4 July'],
  ['Who Walked In', '9 July'], ['The Baton Passes', '16 July'], ['Luminaries', '23 July'], ['Hiding What You Know', '30 July'],
  ['Proof of Continuity', '6 August'], ['Immodest and Humble', '13 August'], ['Nothing New Under the Sun', '20 August'],
  ['Nobody Makes a Toaster', '27 August'], ['The Millicorn', '3 September'], ['Gods of Sand', '10 September'],
  ['Ten Thousand Agents', '17 September'], ['One Chopstick', '24 September'], ['Between Ice and Gas', '1 October'], ['Sundoku', '8 October'],
];
export const slugify = (t: string) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
export const notes = rows.map(([title, date], i) => ({ week: i + 1, title, date: `${date} 2026`, short: date, slug: slugify(title) }));
export type Note = (typeof notes)[number];
const tints = ['#af7845', '#8b5f37', '#cea783', '#664629', '#c29266'];
/** Generated cover gradient, same recipe as the Lab Notes mockup. */
export const cover = (i: number) =>
  `radial-gradient(circle at ${30 + ((i * 37) % 50)}% ${30 + ((i * 23) % 40)}%, ${tints[i % 5]} 0%, var(--copper-100) 40%, var(--card) 78%)`;
