// Next Lab Night: Thursday 21:00 to 22:00 Europe/Rome. Always computed in the Rome zone
// so the summer/winter change is correct, then shown to the visitor in their own zone.
const TZ = 'Europe/Rome';
const DAY = 86_400_000;

function romeParts(t: number) {
  const p = Object.fromEntries(
    new Intl.DateTimeFormat('en-GB', {
      timeZone: TZ, hourCycle: 'h23', year: 'numeric', month: '2-digit',
      day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', weekday: 'short',
    }).formatToParts(new Date(t)).map((x) => [x.type, x.value]),
  );
  return { y: +p.year, mo: +p.month, d: +p.day, h: +p.hour, mi: +p.minute, s: +p.second, wd: p.weekday };
}

/** UTC ms of a wall-clock time in Rome. Two passes cover the DST edge. */
function romeToUtc(y: number, mo: number, d: number, h: number, mi = 0) {
  const want = Date.UTC(y, mo - 1, d, h, mi);
  let guess = want;
  for (let i = 0; i < 2; i++) {
    const r = romeParts(guess);
    guess += want - Date.UTC(r.y, r.mo - 1, r.d, r.h, r.mi);
  }
  return guess;
}

/** Start (UTC ms) of the Lab Night that is live now or next. */
export function nextLabNight(now = Date.now()) {
  const r = romeParts(now);
  const idx = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].indexOf(r.wd);
  let ahead = (3 - idx + 7) % 7;
  for (let i = 0; i < 2; i++) {
    const day = romeParts(now + (ahead + i * 7) * DAY);
    const start = romeToUtc(day.y, day.mo, day.d, 21);
    if (now < start + 3_600_000) return start;
  }
  return romeToUtc(r.y, r.mo, r.d + ahead + 7, 21);
}

export function pillText(start: number, locale = 'en-GB', tz?: string) {
  const date = new Intl.DateTimeFormat(locale, { timeZone: TZ, weekday: 'long', day: 'numeric', month: 'long' }).format(start);
  const local = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(start);
  return { date, local };
}

export type Phase = 'idle' | 'tonight' | 'live';
const HOUR = 3_600_000;
/** idle: any other time. tonight: from 18:00 Rome on the day, until start. live: 21:00 to 22:00 Rome. */
export function labNightPhase(now = Date.now()): { phase: Phase; start: number; msToStart: number } {
  const start = nextLabNight(now);
  const msToStart = start - now;
  const phase: Phase = msToStart <= 0 ? 'live' : msToStart <= 3 * HOUR ? 'tonight' : 'idle';
  return { phase, start, msToStart };
}
