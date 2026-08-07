# Rolograph

Turn an event into a live relationship graph: who matters, how everyone connects, what was actually said, and what to do next.

Built at Cursor Miami: Ship Night, August 6 2026. Live at [rolographs.netlify.app](https://rolographs.netlify.app).

## What it is

A Rolograph is a generated intelligence dossier for one specific encounter you are about to walk into — an event, a room, a recruiter screen. It maps what you have against what the other side needs, grades every claim by the evidence behind it, names its own blind spots, and hands you a plan with the words to say.

Rolodex plus graph. A rolodex is a stack of static cards. A Rolograph is the cards, plus the edges between them, plus the receipts.

This one is built for Cursor Miami Ship Night. Earlier ones covered a two-event night in Wynwood on July 21, a Base44 room of 120 profiles, and a Frontdoor recruiter screen — same object each time, different encounter.

You meet thirty people at an event and remember four names by Monday. The context that made those people worth meeting — why they mattered, who introduced you, what they said they needed — decays within hours, and flat contact tools capture none of it.

Rolograph models a room as a graph instead of a list. People, organizations, the event itself, the product, and open roles are all nodes. Hosting, sponsorship, venue, and partnership are edges. Selecting any node shows why it matters right now, a conversation opener, the relationship you are trying to create, and how confident the data behind it is.

The demo is loaded with the real Cursor Miami Ship Night room: Ben Milshtein, QuickNode, Amy Street, Jen Stein, Tatenda Mahaka, The LAB / The DOCK, Superteam USA, OKX, and Palma Labs, plus the official schedule and deadlines.

## What it does

- **Interactive relationship graph** — animated SVG with pulsing, flowing edges. Selecting a node dims everything it is not connected to.
- **Node intelligence panel** — priority, confidence, role, why it matters, a live conversation opener, the desired edge, and tags.
- **A visible objective** — priority is meaningless without something to be a priority *for*. Every score is computed against a stated objective, shown above the number. Change the objective and the ranking changes.
- **An evidence ledger** — every claim on every node carries its source. Ben Milshtein's bio traces to the Cursor Miami community page, Jen Stein's role to the Luma host block, Tatenda Mahaka's title to Miami EdTech's own site. Nothing is asserted without a receipt.
- **Stated known gaps** — the product publishes its own ignorance. Amy Street's company and title are unresolved, so the node says so instead of inventing one. QuickNode is confirmed as an organization but the individual in the room is not identified. Five nodes carry an open gap.
- **Honest uncertainty** — confidence is a first-class field with four levels, and capture is the only thing that promotes a node to `Verified`. The product does not hallucinate identities.
- **Live interaction capture** — record a conversation and the graph promotes researched context into verified relationship history, opening follow-up edges.
- **Presenter mode** — a 75-second automatic GSAP timeline that boots the graph, opens the organizer node, moves through the sponsor lane, records an interaction, shows the graph rewire, and lands on open roles. Designed for a three-minute live demo with no slides.
- **Event layer** — the real run of show, venue, and hard deadlines.
- **Interest capture** — a Netlify Forms signal for people who want to work on the next version.

## How it was built

Next.js 16 App Router, TypeScript, Tailwind CSS, GSAP, and a hand-rolled SVG graph engine. No backend, no database, no auth — all client state by design, so the whole thing deploys as static output on Netlify.

The graph is deliberately not a force-directed layout library. Node positions are art-directed percentages because a 75-second stage demo needs choreography more than general-purpose layout, and a physics simulation would fight the camera moves.

Built in Cursor throughout. `.cursorrules` documents the rules the agent worked under — scope discipline against the locked PRD, the no-invented-identity rule, motion that carries meaning rather than decorating, and the typography direction after the first treatment was rejected for looking like generic hackathon filler.

## What's next

- **Persistence** — captured interactions currently live in React state and reset on refresh. Local-first storage, then sync.
- **Real capture fields** — full note, person, timestamp, and follow-up date per interaction, with the follow-up queue derived from them.
- **Computed priority** — priority is currently authored. It should fall out of edge weight, recency, unmet-but-high-value status, and captured signal.
- **Entity resolution** — the hard problem. Merging the same human across an attendee list, a badge scan, and a business card without inventing relationships.
- **Import** — build a graph from any attendee list rather than hand-authored data.
- **Multi-event** — the persistent graph across rooms is where this stops being an event tool and starts being a relationship layer.

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

The build script runs `next build --webpack` because Next.js 16 Turbopack hits a CSS compiler crash in this environment. The webpack build is stable and passes TypeScript validation.

## Deploy

`netlify.toml` is committed and Netlify detects Next.js automatically. Enable Forms in the Netlify UI so the `join-interest` form records submissions.

## Project

- `PRD.md` — the mission locked at 6:30 PM. Not edited after the lock.
- `.cursorrules` — AI rules that governed the build.
- `app/page.tsx` — graph data, presenter timeline, interaction state, and UI.
- `app/globals.css` — the complete visual system, graph motion, and reduced-motion behavior.
