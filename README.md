# Pokemizer

Build a random Pokémon team through a card-flip game. Pick a generation and game
version, get a random starter, then flip cards to assemble a team of six under
type-overlap rules. Completed teams are saved to local history and can be shared
via a compact, URL-safe code.

Live site: <https://pokemizer.com>

## Tech stack

- **Next.js 16** (App Router, Turbopack) with the **React Compiler** enabled
- **React 19**
- **Tailwind CSS v4** + **shadcn/ui** (Radix primitives)
- **TypeScript**
- **Vercel Analytics**
- Bun as the package manager / script runner

## Getting started

```bash
bun install
bun dev
```

Open <http://localhost:3000>.

### Scripts

| Command | Description |
| --- | --- |
| `bun dev` | Start the dev server |
| `bun run build` | Production build |
| `bun start` | Serve the production build |
| `bun run lint` | Run ESLint |

## Project structure

```
src/
  app/                 App Router routes
    play/[game]/       Game screen (SSG per game version)
    t/[code]/          Shared-team view (resolves a share code)
    history/           Locally-saved team history
  components/          UI + game components
  hooks/               use-game-state (reducer), use-local-storage
  lib/
    games.ts           Game version metadata + lookups
    starters.ts        Generation/starter metadata
    game-logic.ts      Team rules, type coverage
    pokemon-utils.ts   Weighted random card dealing
    share.ts           Client-safe encode/decode of share codes
    share-resolve.ts   Server-only: resolve a code to full data
  data/                Per-game Pokémon JSON (generated) + barrel
scripts/
  generate-pokemon-data.ts   Fetches PokeAPI → src/data/*.json
```

## Pokémon data

Per-game data lives in `src/data/*.json` as `EvolutionLine[]`. It is generated
from [PokeAPI](https://pokeapi.co) by:

```bash
bun scripts/generate-pokemon-data.ts
```

Sprites are served from the PokeAPI sprites CDN (`raw.githubusercontent.com`)
and cached by the service worker (`public/sw.js`).

### Data loading note

`src/data/index.ts` is a barrel that statically imports every game's JSON. It is
**server-only** — importing it from a Client Component pulls the entire dataset
into the browser bundle. Client code must only import `share.ts` (encode/decode);
full-data resolution lives in the server-only `share-resolve.ts`.

## Sharing

Teams are encoded into a compact binary payload (game index + member refs +
attempts + CRC-8), then base64url-encoded into `/t/<code>`. The format is
**append-only** — see the warnings in `src/lib/share.ts` before editing the
game-index maps, as changes break existing shared links.

## Disclaimer

Pokemizer is an unofficial fan project and is not affiliated with, endorsed, or
supported by Nintendo, Game Freak, or The Pokémon Company. Pokémon and Pokémon
character names are trademarks of Nintendo.
