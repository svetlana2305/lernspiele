# Format einer Runde

Eine Runde ist eine Datei `runden/<id>.json`. Das Spielgerüst `spiel.html?r=<id>` lädt sie. Neue Runden kommen in `runden/liste.json` **ganz nach oben** (die oberste gilt als „Neu für dich“).

Vorlage mit allen Aufgabentypen: `runden/2026-10-14-baustelle.json`. Vor jeder Veröffentlichung prüfen:

```
node tools/pruefe-runde.js runden/<id>.json
```

## Kopf

| Feld | Inhalt |
|---|---|
| `titel` | Name der Runde, z. B. „Blockdorf: Die Rückkehr des Golems“ |
| `fach` | z. B. „Deutsch · Klasse 7“ |
| `ort` | Überschrift der Karte, z. B. „Das Dorf“ |
| `intro` | 1 bis 3 Sätze Geschichte, darf einfaches HTML enthalten |
| `start` | Text des Startknopfs |
| `sieg` | Überschrift am Ende |
| `lernt` | Liste kurzer Merksätze für den Abschluss |
| `module` | Liste der Orte (meist 2 bis 3) |
| `boss` | `{ "name": "…", "steps": [ … ] }`, alles gemischt, ohne `help` |
| `klareZahlen` | optional `true`: Antworten, Tabellenköpfe und Regelüberschriften in gut lesbarer Schrift statt Pixelschrift (für Mathe) |

Ein Modul: `{ "id": "A", "name": "…", "ico": "🔨", "reward": "…", "teaser": "…", "steps": [ … ] }`. `id` ist ein Buchstabe, nicht `X`.

## Aufgabentypen (`t`)

| Typ | Felder | Zweck |
|---|---|---|
| `info` | `html` | Erklären: Spielfigur (`<div class="npc"><span class="face">🦉</span><div class="say">…</div></div>`), Regelkästen (`<div class="rule"><div><b class="h">…</b><span>…</span></div></div>`), Tabellen (`<div class="tbl"><table>…</table></div>`), Merksätze (`<div class="merk">…</div>`) |
| `choice` | `s` oder `raw` (HTML) oder `chat` + `from`, `q`, `o` (Antworten), `a` (richtige), `help` oder `tip`, `explain` | Auswählen. In `s`: `[n]…[/n]` unterstreicht, `[v]…[/v]` markiert das Verb (sichtbar mit `help` und nach der Lösung), `___` ist eine Lücke |
| `build` | `base`, `q`, `tiles`, `sol` (Liste gültiger Reihenfolgen), `wrong`, `tip`, `explain` | Satz aus Bausteinen bauen, Komma als eigener Baustein `","` |
| `split` | `s`, `q`, `cuts` (Strich nach Wort-Index, 0-basiert, Wörter per Leerzeichen getrennt), `help`/`tip`, `explain` | Satzglieder abteilen |
| `mark` | `s`, `q`, `sol` (Wort-Indizes), `help`/`tip`, `explain` | Wörter anklicken, z. B. Prädikat |
| `multi` | optional `s`, `q`, `pool`, `a` (alle richtigen), `tip`, `explain` | Mehrere richtige anklicken, z. B. alle Zeit-Wörter |
| `write` | `s`, `q`, `model`, `check` (Liste) | Selbst schreiben, dann mit Musterlösung vergleichen |

Antworten werden im Spiel gemischt. Trotzdem `o` und `pool` nicht nach Lösung sortieren.
