# Lesson data (one file per phase)

`before.json` (GoodWheel), `during.json` (McDonkey), `after.json` (Jabili). The game reads these at runtime, so the
client's real lessons can replace the PLACEHOLDER text without code changes (in a built game, edit `dist/data/lessons/`).
Keep every line short: it is shown in small pixel panels on phones (about 90 characters of situation text, about 60
per choice).

| Field | Meaning |
|---|---|
| `placeholder` | `true` while the content is not the client's. The on-screen badge is switched by `SHOW_PLACEHOLDER_BADGE` in `src/config/phases.js`. |
| `title`, `learningObjectives[]` | Shown on the phase intro panel. |
| `intro.situation`, `intro.goal` | Intro panel text. |
| `items[]` (before) | Go-bag items on the store crates: `id` (matches the map object name), `name`, `correct`, `feedback`, `source`. `bagLimit` = correct items needed to finish the bag. |
| `hazards[]` | `id` (map object name), `name`, `damage` (health lost), `feedback` (shown the first time), `source`. |
| `questions[]` | Decision points: `id` (the map zone or NPC that opens it), `objective`, `speaker` (player / staff / official), `situation`, `choices[]` (`text`, `correct`, `feedback`), `source`. |
| `tasks[]` (after) | Clean-up tasks: `id`, `prompt` (action text), `needs` (task that must be done first), `needsFeedback`, `feedback`, `source`. |
| `npcs` (after) | NPC names and lines. |
| `timeLimitSec`, `risingDamagePerSec` (during) | Rising-water timer (timers are allowed, R10). When it runs out the water costs a little health each second (no instant loss); the difficulty setting scales it. `timeLimitSec: 0` turns the meter off. |
| `takeaways[]` | 1–3 lines on the result panel. |
| `scoring.mistakePenalty` | Health lost per wrong choice. `scoring.stars` = the most mistakes allowed for 3 and for 2 stars (otherwise 1 star). `scoring.hintWeight` (optional, default 0.5) = how much one hint used counts as a mistake for the stars. |
| `source` | Where the fact comes from. Every entry is a placeholder until the client sends references. |
