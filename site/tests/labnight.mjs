import { nextLabNight, labNightPhase } from '../src/lib/labnight.ts';
const iso = (t) => new Date(t).toISOString();
let bad = 0; const eq = (name, got, want) => { const ok = got === want; if (!ok) bad++; console.log(ok ? 'PASS' : 'FAIL', name, ok ? '' : `got ${got} want ${want}`); };
// summer (CEST, UTC+2): Thu 22 Oct 2026
eq('summer start 19:00Z', iso(nextLabNight(Date.parse('2026-10-20T10:00:00Z'))), '2026-10-22T19:00:00.000Z');
eq('Thu 17:59 Rome = idle', labNightPhase(Date.parse('2026-10-22T15:59:00Z')).phase, 'idle');
eq('Thu 18:00 Rome = tonight', labNightPhase(Date.parse('2026-10-22T16:00:00Z')).phase, 'tonight');
eq('Thu 20:59:59 = tonight', labNightPhase(Date.parse('2026-10-22T18:59:59Z')).phase, 'tonight');
eq('Thu 21:00 = live', labNightPhase(Date.parse('2026-10-22T19:00:00Z')).phase, 'live');
eq('Thu 21:59:59 = live', labNightPhase(Date.parse('2026-10-22T19:59:59Z')).phase, 'live');
eq('Thu 22:00 = idle, next week', iso(labNightPhase(Date.parse('2026-10-22T20:00:00Z')).start), '2026-10-29T20:00:00.000Z');
eq('Thu 22:00 = idle', labNightPhase(Date.parse('2026-10-22T20:00:00Z')).phase, 'idle');
// DST ends Sun 25 Oct 2026: next Thu 29 Oct is CET (UTC+1) -> 20:00Z
eq('after DST end: 21:00 Rome = 20:00Z', iso(nextLabNight(Date.parse('2026-10-23T09:00:00Z'))), '2026-10-29T20:00:00.000Z');
eq('Thu 29 Oct 20:30 Rome (19:30Z) = tonight', labNightPhase(Date.parse('2026-10-29T19:30:00Z')).phase, 'tonight');
eq('Thu 29 Oct 21:00 Rome (20:00Z) = live', labNightPhase(Date.parse('2026-10-29T20:00:00Z')).phase, 'live');
// DST starts Sun 29 Mar 2026: Thu 26 Mar is CET (20:00Z), Thu 2 Apr is CEST (19:00Z)
eq('before DST start: Thu 26 Mar 20:00Z', iso(nextLabNight(Date.parse('2026-03-24T09:00:00Z'))), '2026-03-26T20:00:00.000Z');
eq('after DST start: Thu 2 Apr 19:00Z', iso(nextLabNight(Date.parse('2026-03-27T09:00:00Z'))), '2026-04-02T19:00:00.000Z');
// from a Friday morning in Tokyo the next session is still Thursday Rome time
eq('Fri 05:00 Tokyo (Thu 22:00 Rome... 20:00Z) idle', labNightPhase(Date.parse('2026-10-22T20:00:00Z')).phase, 'idle');
console.log(bad ? `${bad} FAILED` : 'all pass');
