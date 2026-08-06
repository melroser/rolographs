# Rolograph Handoff Context

## Status at Handoff

- Local repository: `/Users/tatiana/Documents/Codex/rolographs`
- GitHub: `https://github.com/melroser/rolographs`
- Branch: `main`
- Current application checkpoint: `b706376` (`Redesign Rolograph typography`)
- Working tree at handoff: clean
- Public app: `https://rolographs.netlify.app`
- Netlify project: `https://app.netlify.com/projects/rolographs`
- PRD: `https://github.com/melroser/rolographs/blob/main/PRD.md`

The GitHub source is current. Netlify was created and deployed manually rather than connected to Git CI. The production site was last deployed before commit `b706376`, so deploy once more to publish the latest typography revision:

```bash
npx netlify-cli deploy --prod --build
```

## Product Goal

Rolograph is a live event-intelligence and recruiting demo for Cursor Miami Ship Night. It turns a room full of people, companies, hosts, sponsors, and opportunities into an interactive relationship graph.

The immediate objective is not to build a generic CRM. It is to show programmers a technically sharp product that makes them want to join Rob's founding team. The product itself is the recruiting mechanism.

Core flow:

```text
Event -> relationship graph -> inspect node -> record interaction -> unlock edges -> prioritized follow-up -> join the build
```

## What Has Been Built

- Next.js App Router application with TypeScript
- Tailwind CSS visual system
- GSAP entrance motion and 75-second presenter timeline
- Art-directed SVG relationship graph with animated, pulsing, and flowing edges
- Clickable people, company, event, product, and team nodes
- Node detail panel with priority, confidence, role, relevance, opener, desired edge, and tags
- Interaction capture that unlocks new Rob-to-network edges
- Cursor-reactive light field, scanlines, noise, glitch transitions, dramatic graph zooms, and node bursts
- Official Cursor Miami event schedule, check-in link, venue, deadlines, hosts, sponsors, and partners
- Recruitment section with roles needed, stack, GitHub link, and interest form
- Netlify Forms integration with a honeypot and static detection skeleton
- Responsive layout and reduced-motion support
- README and PRD aligned with the shipped MVP

## Current Visual Direction

The first title treatment was rejected because it looked like a generic hackathon graphic: an oversized lime slab, heavy black all-caps text, duplicated chromatic layers, and clipping at narrower widths.

Commit `b706376` replaces it with:

- A restrained `Rolo` sans-serif line
- A high-contrast italic serif `graph` line
- A small monospaced product serial and descriptor
- Sentence-case supporting copy
- A calmer editorial hierarchy across metrics, selected nodes, recruitment copy, and form headings

Keep the interface visually aggressive through color, graph density, and motion. Do not return to indiscriminate ultra-bold uppercase typography.

## Event Data in the Graph

The graph currently includes:

- Cursor Miami Ship Night
- Rob
- Ben Milshtein
- QuickNode
- Amy Street
- Jen Stein
- Tatenda Mahaka
- The LAB / The DOCK
- Superteam USA
- OKX
- Palma Labs
- Rolograph MVP
- Founding Build Team

Official event facts included in the UI:

- Thursday, August 6, 4:00 PM to 11:30 PM
- The DOCK, 400 NW 26th St, Miami
- Check-in and team registration: `https://app.cursormiami.com`
- 6:30 PM PRD lock
- 9:30 PM final submission lock
- 10:00 PM finalists and live demos
- Three-minute live product demos with no slides
- $10,000 one-team prize from Superteam USA
- Solo builders can use the platform or check-in process to find teammates

Do not invent uncertain identity data. Amy Street intentionally remains a host node requiring live enrichment instead of being assigned an unverified title.

## Presenter Mode

`Run 75s Demo` starts a GSAP timeline that:

1. Boots the event graph.
2. Focuses the Cursor Miami event node.
3. Zooms to Ben Milshtein as the priority organizer.
4. Moves to QuickNode as the infrastructure lane.
5. Moves to Rob and records an interaction.
6. Unlocks verified follow-up edges.
7. Opens the Rolograph MVP node.
8. Ends on the Founding Build Team recruitment pitch.

The sequence is implemented in `app/page.tsx` inside `startPresenter`. Timing and graph transforms are hard-coded for an art-directed demo rather than a general graph-layout engine.

## Recruitment Layer

The current roles are:

- AI Product Engineer
- Graph Systems Builder
- Motion / UI Killer
- Event Operator

The `join-interest` form posts to `/__forms.html` so requests reach Netlify's form middleware instead of the Next.js catch-all handler. Form detection has been enabled on the Netlify project and the form registration was verified after deployment.

Netlify stores submissions, but no email or Slack notification has been configured. Add notifications in Netlify if Rob needs immediate alerts during the event.

## File Map

- `app/page.tsx`: graph data, presenter timeline, interactions, recruitment UI, and form submission
- `app/globals.css`: complete visual system, graph motion, typography, responsive layout, and reduced-motion behavior
- `app/layout.tsx`: metadata and viewport settings
- `public/__forms.html`: static Netlify form detection skeleton
- `tailwind.config.ts`: fonts, colors, and utility extensions
- `netlify.toml`: production build and Node version
- `PRD.md`: locked MVP definition and success criteria
- `README.md`: project overview, local setup, build, deploy, and presenter instructions

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

Production verification:

```bash
npm run build
```

The production build intentionally uses `next build --webpack`. Next.js 16 Turbopack hit a CSS compiler/port issue in this environment, while the webpack build is stable and passes TypeScript validation.

## Known Limitations

- Graph data is static and lives in `app/page.tsx`.
- Recorded interactions live only in React state and reset on refresh.
- There is no authentication, database, CRM integration, LinkedIn scraping, or automated identity resolution.
- The graph is art-directed SVG rather than force-directed layout.
- Presenter transforms are tuned primarily for desktop and should be checked after major layout changes.
- The interest form stores submissions only on Netlify; local development shows a graceful fallback state.
- The site has no configured recruitment notification destination yet.

## Recommended Next Actions

1. Deploy commit `b706376` to production.
2. Test the full 75-second presenter sequence at the actual presentation viewport.
3. Test one Netlify form submission and configure an email or Slack notification.
4. Replace or enrich any event identity data learned in the room, preserving confidence and provenance.
5. Tighten the three-minute spoken demo around one sentence per presenter step.
6. Only after the event, consider extracting graph data and interaction state into a persistence layer.

## Recent Commits

```text
b706376 Redesign Rolograph typography
d74cda5 Add official Ship Night event layer
bf8ebd6 Build Cursor Miami Rolograph demo
4eee36e Initial Rolograph hackathon submission
```

## Suggested Cursor Handoff Prompt

```text
Open /Users/tatiana/Documents/Codex/rolographs and read HANDOFF.md, PRD.md, and README.md. Continue from commit b706376. Preserve the current product scope, verified event data, Netlify Forms flow, and the new editorial Rolo/graph typography. Start the existing dev server, inspect the current interface, and focus next on presenter-mode reliability and the live three-minute demo. Do not replace the art-directed graph with a generic dashboard or force-graph library unless it materially improves the presentation.
```
