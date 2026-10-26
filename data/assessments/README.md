# Assessment data (one file per level)

`before.json` (GoodWheel), `during.json` (McDonkey), `after.json` (Jabili). After a level, the player answers its
10 items: 5 multiple choice and 5 true or false. The game reads these files at runtime, so the research team's items
can replace the PLACEHOLDER ones without code changes (in a built game, edit `dist/data/assessments/`).

| Field | Meaning |
|---|---|
| `placeholder` | `true` while the items are not the research team's: shows the PLACEHOLDER badge. |
| `title` | Shown in the assessment header, e.g. "BEFORE the flood". |
| `items[]` | `type`: `"mc"` or `"tf"`. `question`: about 90 characters at most. |
| `choices[]` (mc) | 4 answers, about 60 characters each. `answer` = the number of the correct one, counting from 0 (A = 0, B = 1, C = 2, D = 3). |
| `answer` (tf) | `true` or `false`. |
| `source` | Where the items come from. |

## Teacher settings (`../teacher.json`)

| Field | Meaning |
|---|---|
| `pin` | The 4-digit PIN the teacher shows the class so students can see the correct answers and their score. |
| `allowRetake` | `false`: once submitted, a level's assessment stays locked (playing the level again shows the locked answers). `true`: it can be taken again. |
| `hints.enabled` | `false` turns all hints off. |
| `hints.delaysSec` | Seconds without progress before each hint: sparkle, clue, arrow. |
| `difficulty` (optional) | `"easy"`, `"normal"` or `"hard"` sets the difficulty for the whole class, and students can't change it in the Survival Journal. Leave it out to let each student choose. Easy: hints come sooner, mistakes cost less, more time. Hard: the opposite. |

The timed go-bag challenge (Survival Journal, every disaster page) reads `public/data/challenges/gobag.json`: per disaster, 12 items (`item` = picture, `name`, `correct`, `why`), the seconds lost per wrong item, and the star rules. Its time comes from the difficulty (Easy 45 s, Normal 35 s, Hard 25 s).

The PIN is in a file that ships with the game, so a student who knows how to open the game's files could find it.
That is acceptable for classroom use; the online version (teacher dashboard) will keep it on the server instead.
