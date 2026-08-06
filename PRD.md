# Rolograph: Cursor Miami Ship Night

## Product

Rolograph turns a high-value event into a living relationship graph. The Cursor Miami Ship Night demo is also a recruitment weapon: it shows programmers that Rob is building something technically sharp, visually aggressive, and useful in the exact room where the demo is shown.

## Problem

Events collapse into memory loss. Builders meet hosts, sponsors, engineers, founders, and organizers, but the useful context disappears before follow-up happens.

Flat contact tools do not capture:

- Why a person matters right now
- Which event, company, or introduction connects them
- Whether the relationship is observed, inferred, or verified
- What was discussed live
- What follow-up should happen next
- Which people in the room should be recruited into the build

## Tonight's Objective

Ship a visually extreme, readable, performant recruitment demo for Cursor Miami Ship Night.

The product should feel like hyperpop translated into UI: kinetic type, dense animated graphs, pulsing edges, scanlines, chromatic split effects, reactive cursor fields, glitch transitions, dramatic zooms, node bursts, and a polished automatic demo sequence.

## Target Users

- Rob, using the app to recruit programmers in the room
- Hackathon judges evaluating whether the product is real
- Engineers deciding whether the team has taste and velocity
- Event hosts and sponsors who need better post-event intelligence

## Demo Data

The initial graph is built around:

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
- Founding build team

The event runs Thursday, August 6 from 4:00 PM to 11:30 PM at The DOCK, 400 NW 26th St, Miami. Check-in and team registration happen at `https://app.cursormiami.com`. The two locked deadlines are the 6:30 PM PRD and the 9:30 PM final submission; finalist demos begin at 10:00 PM and must be live products with no slides.

Known uncertainty is part of the product. For example, Amy Street is represented as a host node needing live enrichment rather than being assigned an invented title.

## MVP Scope

The shipped demo must include:

1. A Cursor Miami event graph
2. Person, organization, event, product, and team nodes
3. Animated relationship edges
4. Clickable node detail panels
5. Priority and confidence signals
6. Conversation openers
7. Desired relationship edges
8. Live interaction capture
9. Graph update after capture
10. Recruitment layer with roles needed
11. One-click or lightweight interest capture
12. Presenter mode for a 60 to 90 second automatic demo
13. Exact event run-of-show and platform check-in pathway

## Presenter Mode

Presenter mode runs a roughly 75-second sequence:

1. Boot the Cursor Miami event graph.
2. Zoom into the organizer node.
3. Zoom into the sponsor infrastructure lane.
4. Record a live interaction.
5. Show new verified relationship edges.
6. End on the team recruitment pitch.

The sequence must be understandable without slides.

## Technical Stack

- Next.js App Router
- TypeScript
- Tailwind CSS
- GSAP
- SVG-based interactive graph rendering
- Netlify deployment
- Netlify Forms for interest capture

An external graph library is intentionally not required for this version because the demo needs art-directed motion more than general-purpose graph layout.

## Out of Scope

The hackathon version will not include:

- LinkedIn scraping
- Automatic identity resolution
- CRM integrations
- Multi-user collaboration
- Authentication
- A database
- A general-purpose social network
- Fully autonomous relationship management

## Success Criteria

By final submission, users must be able to:

- Open the deployed application
- Understand what Rolograph does in under 20 seconds
- Explore the Cursor Miami graph
- Inspect people and organizations
- Record an interaction
- See the graph change after capture
- Run the presenter mode
- Reach the recruitment pitch
- Submit interest in joining the build
