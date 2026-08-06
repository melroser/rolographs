# Rolograph

Rolograph is a kinetic recruitment demo for Cursor Miami Ship Night. It turns the event into an interactive relationship graph, then uses that graph to show who matters, what to say, what was captured live, and how Rob should recruit a founding build team.

## What is in the demo

- Next.js App Router with TypeScript
- Tailwind CSS visual system
- GSAP entrance and 75-second presenter timeline
- Interactive SVG relationship graph with animated edges
- Cursor-reactive field, scanlines, chromatic type, glitch transitions, and node burst effects
- Official Cursor Miami schedule, live platform check-in, venue, deadline, team-matching, and partner data
- Graph nodes for Ben Milshtein, QuickNode, Amy Street, Jen Stein, Tatenda Mahaka, The LAB, Superteam USA, OKX, Palma Labs, Rob, and the Rolograph MVP
- Live interaction capture state that unlocks new relationship edges
- Recruitment section with roles needed and a Netlify Forms interest capture

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Build

```bash
npm run build
```

## Deploy on Netlify

The repo includes `netlify.toml`:

```toml
[build]
command = "npm run build"
publish = ".next"
```

The build script runs `next build --webpack` so local and Netlify builds avoid the current Turbopack CSS compiler crash. Netlify detects Next.js automatically. Enable Forms in the Netlify UI so the `join-interest` form stores recruitment leads.

## Presenter mode

Click `Run 75s Demo`. The sequence:

1. Boots the Cursor Miami event graph.
2. Opens the organizer node.
3. Opens the sponsor infrastructure node.
4. Records a live interaction.
5. Shows new verified follow-up edges.
6. Ends on the build-team recruitment pitch.
