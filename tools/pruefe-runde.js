// Prüft eine Runden-Datei, bevor sie veröffentlicht wird.
// Aufruf: node tools/pruefe-runde.js runden/<id>.json
// Bricht mit Fehlerliste ab, wenn etwas nicht stimmt.
const fs = require('fs');
const file = process.argv[2];
const fehler = [];
const warn = [];
let d;
try { d = JSON.parse(fs.readFileSync(file, 'utf8')); } catch (e) { console.error('Kein gültiges JSON:', e.message); process.exit(1); }

const TYPEN = ['info', 'choice', 'build', 'split', 'mark', 'write', 'multi'];
const words = s => s.split(' ');
const uniq = a => new Set(a).size === a.length;
const sameBag = (a, b) => a.length === b.length && a.slice().sort().join('\u0001') === b.slice().sort().join('\u0001');

for (const k of ['titel', 'fach', 'ort', 'intro', 'start', 'sieg']) if (!d[k] || typeof d[k] !== 'string') fehler.push(`Feld "${k}" fehlt`);
if (!Array.isArray(d.lernt)) fehler.push('Feld "lernt" muss eine Liste sein');
if (!Array.isArray(d.module) || d.module.length < 1) fehler.push('Mindestens ein Modul nötig');
if (!d.boss || !Array.isArray(d.boss.steps) || !d.boss.steps.length) fehler.push('Boss mit Aufgaben nötig');

const ids = new Set();
function pruefeSchritt(st, wo) {
  if (!TYPEN.includes(st.t)) { fehler.push(`${wo}: unbekannter Typ "${st.t}"`); return; }
  if (st.t === 'info') { if (!st.html) fehler.push(`${wo}: info ohne html`); return; }
  if (st.t !== 'write' && !st.explain) fehler.push(`${wo}: Erklärung (explain) fehlt`);
  if (!st.q) fehler.push(`${wo}: Frage (q) fehlt`);
  if (!st.tip && !st.help && st.t !== 'write') warn.push(`${wo}: weder Tipp noch Hilfe`);
  if (st.t === 'choice') {
    if (!Array.isArray(st.o) || st.o.length < 2) fehler.push(`${wo}: mindestens 2 Antworten nötig`);
    else {
      if (!st.o.includes(st.a)) fehler.push(`${wo}: richtige Antwort "${st.a}" steht nicht in den Antworten`);
      if (!uniq(st.o)) fehler.push(`${wo}: doppelte Antworten`);
    }
    if (!st.s && !st.raw && !st.chat) fehler.push(`${wo}: Satz fehlt (s, raw oder chat)`);
    if (st.chat && !st.from) fehler.push(`${wo}: chat ohne Absender (from)`);
    if (st.s && st.s.includes('___') && st.a && st.a.length > 25) warn.push(`${wo}: Lücke mit langer Antwort, wirklich gewollt?`);
  }
  if (st.t === 'build') {
    if (!st.base || !Array.isArray(st.tiles) || !Array.isArray(st.sol) || !st.sol.length) fehler.push(`${wo}: build braucht base, tiles, sol`);
    else st.sol.forEach((s, i) => { if (!sameBag(s, st.tiles)) fehler.push(`${wo}: Lösung ${i + 1} benutzt andere Bausteine als tiles`); });
  }
  if (st.t === 'split') {
    const w = words(st.s || '');
    if (!Array.isArray(st.cuts) || !st.cuts.length) fehler.push(`${wo}: cuts fehlen`);
    else st.cuts.forEach(c => { if (!Number.isInteger(c) || c < 0 || c >= w.length - 1) fehler.push(`${wo}: Strich ${c} liegt außerhalb (0 bis ${w.length - 2})`); });
  }
  if (st.t === 'mark') {
    const w = words(st.s || '');
    if (!Array.isArray(st.sol) || !st.sol.length) fehler.push(`${wo}: sol fehlt`);
    else st.sol.forEach(i => { if (!Number.isInteger(i) || i < 0 || i >= w.length) fehler.push(`${wo}: Wort ${i} gibt es nicht`); });
  }
  if (st.t === 'multi') {
    if (!Array.isArray(st.pool) || !Array.isArray(st.a) || !st.a.length) fehler.push(`${wo}: multi braucht pool und a`);
    else { st.a.forEach(x => { if (!st.pool.includes(x)) fehler.push(`${wo}: "${x}" fehlt im pool`); }); if (!uniq(st.pool)) fehler.push(`${wo}: doppelte Einträge im pool`); }
  }
  if (st.t === 'write') {
    if (!st.s || !st.model || !Array.isArray(st.check) || !st.check.length) fehler.push(`${wo}: write braucht s, model, check`);
  }
}
(d.module || []).forEach((m, mi) => {
  const wo = `Modul ${mi + 1}`;
  for (const k of ['id', 'name', 'ico', 'reward', 'teaser']) if (!m[k]) fehler.push(`${wo}: Feld "${k}" fehlt`);
  if (m.id === 'X') fehler.push(`${wo}: id "X" ist für den Boss reserviert`);
  if (ids.has(m.id)) fehler.push(`${wo}: id doppelt`); ids.add(m.id);
  if (!Array.isArray(m.steps) || !m.steps.length) fehler.push(`${wo}: keine Aufgaben`);
  else {
    if (m.steps[0].t !== 'info') warn.push(`${wo}: beginnt nicht mit einer Erklärung (info) – erst lernen, dann üben`);
    m.steps.forEach((st, i) => pruefeSchritt(st, `${wo} (${m.name}) Schritt ${i + 1}`));
  }
});
((d.boss && d.boss.steps) || []).forEach((st, i) => {
  pruefeSchritt(st, `Boss Schritt ${i + 1}`);
  if (st.help) warn.push(`Boss Schritt ${i + 1}: Hilfe im Boss (sollte ohne Hilfe sein)`);
});

warn.forEach(w => console.log('Hinweis:', w));
if (fehler.length) { fehler.forEach(f => console.error('FEHLER:', f)); process.exit(1); }
const n = (d.module || []).reduce((s, m) => s + m.steps.length, 0) + d.boss.steps.length;
console.log(`OK: ${d.module.length} Module, ${n} Schritte`);
