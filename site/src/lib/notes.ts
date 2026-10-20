import { getCollection } from 'astro:content';

const fmt = (d: Date, o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', ...o }).format(d);

/** All notes, oldest first, with display dates. */
export async function getNotes() {
  const all = (await getCollection('notes')).sort((a, b) => a.data.date.valueOf() - b.data.date.valueOf());
  return all.map((entry, index) => ({
    ...entry.data,
    entry,
    index,
    short: fmt(entry.data.date, { day: 'numeric', month: 'long' }),
    long: fmt(entry.data.date, { day: 'numeric', month: 'long', year: 'numeric' }),
  }));
}
export type Note = Awaited<ReturnType<typeof getNotes>>[number];

const tints = ['#af7845', '#8b5f37', '#cea783', '#664629', '#c29266'];
/** Generated copper gradient: placeholder cover and the note-page hero art. */
export const gradient = (i: number) =>
  `radial-gradient(circle at ${30 + ((i * 37) % 50)}% ${30 + ((i * 23) % 40)}%, ${tints[i % 5]} 0%, var(--copper-100) 40%, var(--card) 78%)`;

const ones = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
/** 22 -> "Twenty-two" (1 to 99). */
export const words = (n: number) => {
  const w = n < 20 ? ones[n] : tens[Math.floor(n / 10)] + (n % 10 ? '-' + ones[n % 10] : '');
  return w[0].toUpperCase() + w.slice(1);
};
