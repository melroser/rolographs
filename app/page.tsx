"use client";

import { FormEvent, PointerEvent as ReactPointerEvent, useEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BrainCircuit,
  CalendarClock,
  CircleDotDashed,
  Crosshair,
  ExternalLink,
  FileSearch,
  Mail,
  MapPin,
  MousePointer2,
  Network,
  Play,
  RadioTower,
  Sparkles,
  Square,
  UserPlus,
} from "lucide-react";

type NodeKind = "person" | "org" | "event" | "artifact" | "team";
type Confidence = "High" | "Medium" | "Observed" | "Verified";

type Evidence = {
  claim: string;
  source: string;
};

type GraphNode = {
  id: string;
  label: string;
  kicker: string;
  role: string;
  kind: NodeKind;
  x: number;
  y: number;
  basePriority: number;
  confidence: Confidence;
  summary: string;
  opener: string;
  desiredEdge: string;
  tags: string[];
  evidence: Evidence[];
  gap?: string;
};

type GraphEdge = {
  id: string;
  source: string;
  target: string;
  label: string;
  weight: number;
};

type Capture = {
  id: string;
  nodeId: string;
  note: string;
  at: number;
};

const OPERATOR_ID = "you";
const CAPTURE_EDGE_WEIGHT = 5;
const MAX_RENDERED_CAPTURES = 4;

const nodes: GraphNode[] = [
  {
    id: "event",
    label: "Cursor Miami Ship Night",
    kicker: "Live // Aug 6",
    role: "4:00 PM to 11:30 PM at The DOCK, 400 NW 26th St, Miami",
    kind: "event",
    x: 50,
    y: 49,
    basePriority: 100,
    confidence: "High",
    summary:
      "The room this graph is built from: hosts, sponsors, partners, and venue, plus the two hard deadlines that shape every conversation in it.",
    opener: "Open the room map and work down the priority list before the night runs out.",
    desiredEdge: "You -> Cursor Miami: builder who ships under pressure",
    tags: ["PRD lock", "9:30 submission", "3 minute demos"],
    evidence: [
      { claim: "Aug 6, 4:00 PM to 11:30 PM at The DOCK, 400 NW 26th St", source: "Official Luma event page" },
      { claim: "6:30 PRD lock, 9:30 submission, 10:00 finalists, 3 minute live demos", source: "Ship Night criteria page + host blast, Aug 4" },
      { claim: "$10,000 single-team prize", source: "Ship Night track description" },
    ],
  },
  {
    id: "you",
    label: "You",
    kicker: "Operator",
    role: "The person working the room and capturing what actually happened",
    kind: "team",
    x: 22,
    y: 48,
    basePriority: 98,
    confidence: "High",
    summary:
      "Every relationship in the graph is measured from here. Captured conversations attach to this node and become the follow-up queue.",
    opener: "Start from the highest-priority unmet node and work outward.",
    desiredEdge: "You -> the room: verified relationships instead of forgotten names",
    tags: ["operator", "capture", "follow-up"],
    evidence: [{ claim: "Registered attendee, checked in on the platform", source: "Your Luma ticket" }],
  },
  {
    id: "ben",
    label: "Ben Milshtein",
    kicker: "Priority 1",
    role: "Cursor Miami host and Cursor ecosystem connector",
    kind: "person",
    x: 48,
    y: 18,
    basePriority: 96,
    confidence: "High",
    summary:
      "The organizer node. Ben is directing check-in, registration, and the two hard deadlines. A strong conversation here anchors you inside the Miami Cursor builder graph.",
    opener: "What's the most interesting thing you've seen somebody attempt so far tonight?",
    desiredEdge: "You -> Ben: technical peer building with agents",
    tags: ["Cursor", "AI coding", "host"],
    evidence: [
      { claim: "Listed as event host", source: "Luma event page, Hosted By" },
      { claim: "Ex-Microsoft engineer, cybersecurity and AI, startup cofounder, Cursor Ambassador leading the official Miami community", source: "Cursor Miami community bio" },
      { claim: "Authored both attendee blasts and directs check-in and deadlines", source: "Luma blasts, Aug 4 and Aug 6" },
    ],
    gap: "No prior contact on record. This is a cold first conversation, not a warm one.",
  },
  {
    id: "quicknode",
    label: "QuickNode",
    kicker: "Sponsor",
    role: "Infrastructure sponsor and the cleanest technical lane in the room",
    kind: "org",
    x: 78,
    y: 31,
    basePriority: 91,
    confidence: "High",
    summary:
      "A clean technical lane for backend, infra, agents, wallets, and data flows without pretending to be a crypto maximalist.",
    opener: "Where are you seeing agents intersect with infrastructure tonight?",
    desiredEdge: "You -> QuickNode engineer: technical contact",
    tags: ["infra", "APIs", "sponsor"],
    evidence: [
      { claim: "Listed as host and sponsor", source: "Luma event page, Hosted By" },
      { claim: "Described by organizers as the infrastructure builders actually run on", source: "Luma event description" },
    ],
    gap: "The individual QuickNode representative in the room is unidentified. Organization is confirmed; the person is not.",
  },
  {
    id: "amy",
    label: "Amy Street",
    kicker: "Host",
    role: "Host node with identity intentionally left for live enrichment",
    kind: "person",
    x: 31,
    y: 24,
    basePriority: 76,
    confidence: "Observed",
    summary:
      "Useful because she is attached to the event graph. Rolograph keeps uncertainty visible instead of hallucinating a title.",
    opener: "What role are you playing in tonight's build ecosystem?",
    desiredEdge: "You -> Amy: verified host relationship after live context",
    tags: ["host", "needs enrichment", "local graph"],
    evidence: [{ claim: "Listed as an event host", source: "Luma event page, Hosted By" }],
    gap: "Company, title, and role in the event are all unresolved. No confident public match was found, so none was invented. Resolve this in person before recording anything.",
  },
  {
    id: "jen",
    label: "Jen Stein",
    kicker: "OKX",
    role: "BD @ OKX and partner-side event node",
    kind: "person",
    x: 70,
    y: 64,
    basePriority: 73,
    confidence: "High",
    summary:
      "Business development and partner signal. Useful if the demo crosses wallets, developer APIs, or event sponsorship workflows.",
    opener: "What kind of projects are you hoping people actually build with OKX tonight?",
    desiredEdge: "You -> Jen: partner-aware product conversation",
    tags: ["OKX", "BD", "partner"],
    evidence: [
      { claim: "Listed as an event host, described as BD @ OKX", source: "Luma event page, Hosted By" },
      { claim: "OKX is a named event partner", source: "Luma event description" },
    ],
    gap: "Whether she is here for partnerships, recruiting, or developer relations is unknown. Ask before pitching.",
  },
  {
    id: "tatenda",
    label: "Tatenda Mahaka",
    kicker: "Miami EdTech",
    role: "Program manager and local CS education connector",
    kind: "person",
    x: 24,
    y: 73,
    basePriority: 82,
    confidence: "High",
    summary:
      "A community connector for AI coding education, interviewing, and how people learn to build with agentic tools.",
    opener: "What should AI coding education feel like when the learner can ship on day one?",
    desiredEdge: "You -> Tatenda: education and local community bridge",
    tags: ["education", "Miami", "community"],
    evidence: [
      { claim: "Listed as an event host", source: "Luma event page, Hosted By" },
      { claim: "Program Manager at Miami EdTech, working on technology, ethics, and access to computer science", source: "Miami EdTech team page, independently confirmed" },
      { claim: "FIU engineering and computing background, active in Miami CS education", source: "Public professional profile" },
    ],
  },
  {
    id: "lab",
    label: "The LAB / The DOCK",
    kicker: "Venue",
    role: "Miami startup hub and persistent builder graph",
    kind: "org",
    x: 47,
    y: 82,
    basePriority: 86,
    confidence: "High",
    summary:
      "The persistent local network underneath the event. Winning the room matters; staying in this graph matters more.",
    opener: "Who in this building should see a relationship intelligence tool for live events?",
    desiredEdge: "You -> The LAB: recurring Miami founder access",
    tags: ["venue", "founders", "Miami"],
    evidence: [
      { claim: "Listed as an event host; venue is The DOCK, 400 NW 26th St", source: "Luma event page" },
      { claim: "Self-described Miami tech hub connecting founders, engineers, operators and investors; The DOCK is its workspace for early-stage startups", source: "The LAB Miami site" },
      { claim: "Described by the organizer as Wynwood's original tech home", source: "Luma event description" },
    ],
  },
  {
    id: "superteam",
    label: "Superteam USA",
    kicker: "Prize",
    role: "$10K one-team prize sponsor",
    kind: "org",
    x: 58,
    y: 9,
    basePriority: 68,
    confidence: "High",
    summary:
      "Prize sponsor and ecosystem bridge. Relevant because the room is optimized for shipping, which changes what people want to talk about.",
    opener: "What would make a non-crypto relationship graph useful to Superteam builders?",
    desiredEdge: "You -> Superteam: prize-room product feedback",
    tags: ["sponsor", "prize", "builders"],
    evidence: [
      { claim: "Funds the $10,000 single-team prize", source: "Ship Night track description" },
      { claim: "Accelerator for early-stage founders taking zero equity, powered by Solana", source: "Luma event description" },
    ],
    gap: "No named Superteam representative confirmed for tonight.",
  },
  {
    id: "okx",
    label: "OKX",
    kicker: "Partner",
    role: "Fintech, wallet, marketplace, and infrastructure partner",
    kind: "org",
    x: 87,
    y: 72,
    basePriority: 63,
    confidence: "High",
    summary:
      "Useful if Rolograph becomes a sponsor intelligence layer for events, APIs, and developer relations.",
    opener: "How do you decide which event builders are worth follow-up after a ship night?",
    desiredEdge: "You -> OKX: sponsor analytics conversation",
    tags: ["wallet", "developer relations", "partner"],
    evidence: [
      { claim: "Named event partner, described as a global fintech covering crypto trading, wallet, marketplace and infrastructure", source: "Luma event description" },
      { claim: "Connected to the room through Jen Stein", source: "Luma event page, Hosted By" },
    ],
  },
  {
    id: "palma",
    label: "Palma Labs",
    kicker: "Studio",
    role: "Miami builder studio and Ship Night partner",
    kind: "org",
    x: 70,
    y: 88,
    basePriority: 75,
    confidence: "High",
    summary:
      "Palma Labs is part of the event's persistent local builder layer: put Miami builders in one room, give them a deadline, and create a reason to stay connected afterward.",
    opener: "What would make this useful as the relationship layer across every room Palma runs?",
    desiredEdge: "You -> Palma Labs: repeat event intelligence pilot",
    tags: ["studio", "Miami", "partner"],
    evidence: [
      { claim: "Described by the organizer as \"our studio\" — puts Miami builders in one room and gives them a reason to stay", source: "Luma event description" },
    ],
    gap: "Not listed in the Hosted By block, so the working relationship to the event is stated but not structurally confirmed.",
  },
  {
    id: "product",
    label: "Rolograph MVP",
    kicker: "Ship",
    role: "Event -> graph -> interaction capture -> follow-up engine",
    kind: "artifact",
    x: 52,
    y: 63,
    basePriority: 99,
    confidence: "High",
    summary:
      "The graph is visible and editable while the event is still happening, which is the only window where the context is still accurate.",
    opener: "Click a node, capture a conversation, watch the graph rewrite the next move.",
    desiredEdge: "Product -> operator: the follow-up you would otherwise forget",
    tags: ["GSAP", "graph UX", "follow-ups"],
    evidence: [
      { claim: "Fourth Rolograph built; earlier ones covered a July 21 two-event night, a Base44 room of 120 profiles, and a Frontdoor recruiter screen", source: "Prior deployed Rolographs" },
      { claim: "Scope locked at 6:30 PM in PRD.md and not edited since", source: "Public repo git history" },
    ],
  },
  {
    id: "team",
    label: "Build Team",
    kicker: "Open roles",
    role: "AI product engineers, graph systems builders, motion engineers, event operators",
    kind: "team",
    x: 82,
    y: 50,
    basePriority: 97,
    confidence: "High",
    summary:
      "Rolograph needs people to build the next version: entity resolution, edge confidence, real-time graph state, and the rooms to test it in.",
    opener: "Anyone who wants to work on this can leave a signal on the site.",
    desiredEdge: "Contributor -> Rolograph: commits, taste, velocity",
    tags: ["open roles", "contribute", "next version"],
    evidence: [
      { claim: "Roles derived from the gaps in this build: entity resolution, edge confidence, real-time graph state", source: "Known limitations in README" },
    ],
    gap: "Nobody is committed yet. This node is an intent, not a roster, and is scored that way.",
  },
];

// Priority is meaningless without something to be a priority for. Every score below
// is computed against this objective; change the objective and the ranking changes.
const objective = {
  statement: "Ship by 9:30 and leave with three verified relationships in the Miami builder graph.",
  weights: [
    { label: "Ship leverage", detail: "Does this node help a working product exist by 9:30?" },
    { label: "Persistence", detail: "Does the relationship outlast tonight?" },
    { label: "Technical depth", detail: "Can the conversation go past small talk?" },
  ],
};

const edges: GraphEdge[] = [
  { id: "event-ben", source: "event", target: "ben", label: "host", weight: 5 },
  { id: "event-amy", source: "event", target: "amy", label: "host", weight: 3 },
  { id: "event-quicknode", source: "event", target: "quicknode", label: "sponsor", weight: 5 },
  { id: "event-superteam", source: "event", target: "superteam", label: "prize", weight: 4 },
  { id: "event-lab", source: "event", target: "lab", label: "venue", weight: 4 },
  { id: "event-product", source: "event", target: "product", label: "demo target", weight: 5 },
  { id: "product-you", source: "product", target: "you", label: "operator", weight: 5 },
  { id: "product-team", source: "product", target: "team", label: "open roles", weight: 5 },
  { id: "quicknode-team", source: "quicknode", target: "team", label: "infra talent", weight: 3 },
  { id: "jen-okx", source: "jen", target: "okx", label: "BD", weight: 4 },
  { id: "okx-event", source: "okx", target: "event", label: "partner", weight: 3 },
  { id: "event-palma", source: "event", target: "palma", label: "studio partner", weight: 3 },
  { id: "palma-lab", source: "palma", target: "lab", label: "Miami builders", weight: 3 },
  { id: "tatenda-lab", source: "tatenda", target: "lab", label: "community", weight: 3 },
];

const baseEdgeWeightByNode = nodes.reduce<Record<string, number>>((totals, node) => {
  totals[node.id] = edges
    .filter((edge) => edge.source === node.id || edge.target === node.id)
    .reduce((sum, edge) => sum + edge.weight, 0);
  return totals;
}, {});

const presenterSteps = [
  "Booting event graph",
  "Priority organizer node",
  "Sponsor infrastructure lane",
  "Capturing live interaction",
  "Graph rewiring follow-ups",
  "Open roles on the next version",
];

const totalSources = nodes.reduce((sum, node) => sum + node.evidence.length, 0);
const unresolvedCount = nodes.filter((node) => node.gap).length;

const metrics = [
  { label: "Nodes", value: String(nodes.length), detail: "people, orgs, event, product" },
  { label: "Sources", value: String(totalSources), detail: "every claim is attributed" },
  { label: "Open gaps", value: String(unresolvedCount), detail: "unknowns, stated not guessed" },
  { label: "Hard deadline", value: "9:30", detail: "final submission tonight" },
];

const schedule = [
  { time: "4:00", label: "Doors + platform check-in", tone: "cyan" },
  { time: "4:30", label: "Tutorials + onboarding", tone: "cyan" },
  { time: "5:00", label: "Kickoff", tone: "pink" },
  { time: "6:30", label: "PRD locked", tone: "acid" },
  { time: "9:30", label: "Final submission", tone: "acid" },
  { time: "10:00", label: "Finalists + live demos", tone: "pink" },
  { time: "10:30", label: "Winner", tone: "volt" },
];

const roles = [
  {
    title: "AI Product Engineer",
    detail: "Turn messy event context into agents, summaries, rankings, and fast UX primitives.",
  },
  {
    title: "Graph Systems Builder",
    detail: "Own entity resolution, edge confidence, data provenance, and real-time graph state.",
  },
  {
    title: "Motion / UI Killer",
    detail: "Make intelligence feel alive without burying the signal under expensive animation.",
  },
  {
    title: "Event Operator",
    detail: "Run rooms, collect feedback, chase intros, and convert the graph into actual outcomes.",
  },
];

const howItWorks = [
  {
    step: "01",
    title: "Give it whatever you have",
    detail:
      "Screenshots of a guest list. The event page. A recruiter's InMail. Your inbox and calendar. Attendee lists are not available through an API — the real artifact is a blurry crop on your phone, so that is what it takes. No integrations, no clean data, no setup.",
  },
  {
    step: "02",
    title: "It reads, resolves, and grades",
    detail:
      "Cross-references public signal against your own history, then marks what is confirmed, what is only a warm lead, and what it could not read at all. The grading exists because the inputs are unreliable: you cannot promise certainty from a low-res crop, so every claim carries its evidence level and every unknown is stated instead of guessed.",
  },
  {
    step: "03",
    title: "You get the brief",
    detail:
      "Who to find and in what order. The exact words to open with. What each claim rests on. What to do next — and after the encounter, what you captured is folded back in.",
  },
];

const buildStack = ["Next.js App Router", "TypeScript", "Tailwind CSS", "GSAP timeline", "SVG graph engine", "Netlify Forms"];

function getNode(id: string) {
  const node = nodes.find((item) => item.id === id);
  if (!node) {
    throw new Error(`Missing graph node: ${id}`);
  }
  return node;
}

// Quadratic arc between two nodes. The control point is pushed perpendicular to the
// chord by a per-index offset so edges sharing a pair of endpoints fan out instead of
// collapsing onto one line. Offset is small because the viewBox is only 100 units wide.
function edgePath(sx: number, sy: number, tx: number, ty: number, index: number) {
  const lift = ((index % 5) - 2) * 3;
  const mx = (sx + tx) / 2;
  const my = (sy + ty) / 2;
  const dx = tx - sx;
  const dy = ty - sy;
  const length = Math.max(Math.sqrt(dx * dx + dy * dy), 1);
  return `M ${sx} ${sy} Q ${mx + (-dy / length) * lift} ${my + (dx / length) * lift} ${tx} ${ty}`;
}

function countCapturesFor(captures: Capture[], nodeId: string) {
  return captures.reduce((total, capture) => (capture.nodeId === nodeId ? total + 1 : total), 0);
}

// Live edge weight = authored graph weight plus every capture edge this node now carries.
// The operator node accumulates one capture edge per distinct node it has talked to.
function liveEdgeWeight(nodeId: string, capturedNodeIds: Set<string>) {
  const base = baseEdgeWeightByNode[nodeId] ?? 0;
  const captureEdges = nodeId === OPERATOR_ID ? capturedNodeIds.size : Number(capturedNodeIds.has(nodeId));
  return base + captureEdges * CAPTURE_EDGE_WEIGHT;
}

function computePriority(node: GraphNode, captures: Capture[], capturedNodeIds: Set<string>) {
  const noteCount = countCapturesFor(captures, node.id);
  const captureBonus = noteCount > 0 ? 8 + Math.min(noteCount - 1, 3) * 2 : 0;
  const score = Math.round(node.basePriority * 0.72) + liveEdgeWeight(node.id, capturedNodeIds) * 1.5 + captureBonus;
  return Math.min(100, Math.round(score));
}

function formatRelativeTime(at: number, now: number) {
  const seconds = Math.max(0, Math.round((now - at) / 1000));
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function toUrlEncoded(formData: FormData) {
  return new URLSearchParams(
    Array.from(formData.entries()).map(([key, value]) => [key, String(value)]),
  ).toString();
}

export default function Home() {
  const [selectedId, setSelectedId] = useState("event");
  const [captures, setCaptures] = useState<Capture[]>([]);
  const [noteOpen, setNoteOpen] = useState(false);
  const [noteDraft, setNoteDraft] = useState("");
  const [noteError, setNoteError] = useState(false);
  const [clockTick, setClockTick] = useState(0);
  const [demoActive, setDemoActive] = useState(false);
  const [demoStep, setDemoStep] = useState(presenterSteps[0]);
  const [joinStatus, setJoinStatus] = useState<"idle" | "sending" | "captured" | "local">("idle");
  const shellRef = useRef<HTMLElement | null>(null);
  const graphRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const captureSeqRef = useRef(0);

  const selected = useMemo(() => getNode(selectedId), [selectedId]);
  const interactionCaptured = captures.length > 0;

  const capturedNodeIds = useMemo(() => new Set(captures.map((capture) => capture.nodeId)), [captures]);

  // One derived edge per distinct captured node, drawn from the operator outward.
  const captureEdges = useMemo<GraphEdge[]>(
    () =>
      Array.from(capturedNodeIds).map((nodeId) => ({
        id: `capture-${nodeId}`,
        source: OPERATOR_ID,
        target: nodeId,
        label: "captured interaction",
        weight: CAPTURE_EDGE_WEIGHT,
      })),
    [capturedNodeIds],
  );

  const connectedIds = useMemo(() => {
    const ids = new Set<string>([selectedId]);
    [...edges, ...captureEdges].forEach((edge) => {
      if (edge.source === selectedId) ids.add(edge.target);
      if (edge.target === selectedId) ids.add(edge.source);
    });
    return ids;
  }, [selectedId, captureEdges]);

  const selectedPriority = computePriority(selected, captures, capturedNodeIds);
  const selectedVerified = capturedNodeIds.has(selected.id);
  const selectedConfidence: Confidence = selectedVerified ? "Verified" : selected.confidence;
  const selectedNoteCount = countCapturesFor(captures, selected.id);
  const canCapture = selected.id !== OPERATOR_ID;

  const recentCaptures = useMemo(() => [...captures].reverse(), [captures]);

  useEffect(() => {
    if (captures.length === 0) return;
    setClockTick(Date.now());
    const interval = window.setInterval(() => setClockTick(Date.now()), 15000);
    return () => window.clearInterval(interval);
  }, [captures.length]);

  useEffect(() => {
    setNoteOpen(false);
    setNoteDraft("");
    setNoteError(false);
  }, [selectedId]);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // These groups used to fire together and finish in about 1.5 seconds, which read as
    // one simultaneous flash. Same tweens, spaced out: the definition lands, then the room
    // populates a node at a time, then the read on it. Roughly 4.7 seconds end to end.
    const ctx = gsap.context(() => {
      gsap.from(".hero-line", {
        y: 34,
        opacity: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.18,
      });
      gsap.from(".graph-node", {
        scale: 0.2,
        opacity: 0,
        duration: 0.82,
        ease: "back.out(2.4)",
        stagger: 0.12,
        delay: 1.8,
      });
      gsap.to(".graph-node", {
        y: "random(-5, 5)",
        x: "random(-4, 4)",
        duration: "random(2.5, 4.6)",
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        stagger: 0.06,
        delay: 4.2,
      });
      gsap.from(".metric-tile", {
        x: -18,
        opacity: 0,
        duration: 0.7,
        ease: "power2.out",
        stagger: 0.14,
        delay: 3.7,
      });
    }, shellRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    return () => {
      timelineRef.current?.kill();
    };
  }, []);

  const handlePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const x = `${Math.round((event.clientX / window.innerWidth) * 100)}%`;
    const y = `${Math.round((event.clientY / window.innerHeight) * 100)}%`;
    document.documentElement.style.setProperty("--cursor-x", x);
    document.documentElement.style.setProperty("--cursor-y", y);
  };

  const addCapture = (nodeId: string, note: string) => {
    const trimmed = note.trim();
    if (!trimmed || nodeId === OPERATOR_ID) return false;
    captureSeqRef.current += 1;
    const id = `cap-${captureSeqRef.current}`;
    setCaptures((current) => [...current, { id, nodeId, note: trimmed, at: Date.now() }]);
    return true;
  };

  const stopPresenter = () => {
    timelineRef.current?.kill();
    timelineRef.current = null;
    setDemoActive(false);
    setDemoStep("Manual control");
    if (graphRef.current) {
      gsap.to(graphRef.current, { scale: 1, x: 0, y: 0, duration: 0.45, ease: "power2.out" });
    }
    gsap.set(".demo-progress-fill", { width: "0%" });
  };

  const startPresenter = () => {
    timelineRef.current?.kill();
    setDemoActive(true);
    setCaptures([]);
    setNoteOpen(false);
    setNoteDraft("");
    setNoteError(false);
    setSelectedId("event");

    const tl = gsap.timeline({
      defaults: { ease: "power3.inOut" },
      onComplete: () => {
        setDemoActive(false);
        setDemoStep("Open roles live");
      },
    });

    timelineRef.current = tl;
    gsap.set(".demo-progress-fill", { width: "0%" });
    tl.to(".demo-progress-fill", { width: "100%", duration: 75, ease: "none" }, 0);

    const move = (nodeId: string, step: string, transform: { scale: number; x: number; y: number }, hold: number) => {
      tl.call(() => {
        setSelectedId(nodeId);
        setDemoStep(step);
      });
      tl.to(graphRef.current, { ...transform, duration: 2.3 }, "<");
      tl.to(".graph-canvas", { filter: "saturate(150%) contrast(112%)", duration: 0.38 }, "<");
      tl.to(".graph-canvas", { filter: "saturate(100%) contrast(100%)", duration: 0.55 });
      tl.to({}, { duration: hold });
    };

    move("event", presenterSteps[0], { scale: 1, x: 0, y: 0 }, 7);
    move("ben", presenterSteps[1], { scale: 1.2, x: 64, y: 82 }, 10);
    move("quicknode", presenterSteps[2], { scale: 1.16, x: -92, y: 44 }, 10);

    tl.call(() => {
      setSelectedId("jen");
      setDemoStep(presenterSteps[3]);
    });
    tl.to(graphRef.current, { scale: 1.14, x: -66, y: -34, duration: 2.1 });
    tl.to({}, { duration: 5 });
    tl.call(() => {
      addCapture("jen", "Talked through partner-side follow-up. Wants to see the graph run on a room OKX sponsors next.");
    });
    tl.to(".capture-flash", { opacity: 1, scale: 1, duration: 0.4, ease: "back.out(2)" });
    tl.to(".capture-flash", { opacity: 0, scale: 1.24, duration: 1.15, ease: "power2.out" });
    tl.to({}, { duration: 7 });

    move("product", presenterSteps[4], { scale: 1.12, x: -8, y: -42 }, 11);
    move("team", presenterSteps[5], { scale: 1.18, x: -118, y: 4 }, 12);
    tl.to(graphRef.current, { scale: 1, x: 0, y: 0, duration: 2.4 });
    tl.call(() => setSelectedId("team"));
  };

  const handleNodeClick = (id: string) => {
    if (demoActive) stopPresenter();
    setSelectedId(id);
  };

  const handleRecordClick = () => {
    if (demoActive) stopPresenter();
    setNoteError(false);
    setNoteOpen((open) => !open);
  };

  const handleNoteSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!addCapture(selectedId, noteDraft)) {
      setNoteError(true);
      return;
    }

    setNoteDraft("");
    setNoteError(false);
    setNoteOpen(false);

    if (!prefersReducedMotion()) {
      gsap.fromTo(
        ".capture-flash",
        { opacity: 0, scale: 0.82 },
        { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(2)", yoyo: true, repeat: 1 },
      );
    }
  };

  const handleJoinSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setJoinStatus("sending");

    try {
      const response = await fetch("/__forms.html", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: toUrlEncoded(new FormData(event.currentTarget)),
      });

      setJoinStatus(response.ok ? "captured" : "local");
      if (response.ok) {
        event.currentTarget.reset();
      }
    } catch {
      setJoinStatus("local");
    }
  };

  return (
    <main className="app-shell" ref={shellRef} onPointerMove={handlePointerMove}>
      <div className="cursor-reactor" />
      <div className="noise-field" />
      <div className="scanline-field" />

      <div className="layout-grid">
        <section className="chrome-panel flex min-h-[calc(100vh-2rem)] flex-col justify-between p-5 md:p-6">
          <div>
            <div className="hero-line mb-5 inline-flex items-center gap-2 border border-white/15 bg-white/[0.06] px-3 py-2 font-mono text-xs uppercase text-white/75">
              <RadioTower size={15} />
              Cursor Miami Ship Night // live event intelligence
            </div>

            <h1 className="hero-line title-lockup" aria-label="Rolograph">
              <span className="title-serial">R/01 // relationship operating layer</span>
              <span className="title-piece title-rolo">Rolo</span>
              <span className="title-piece title-graph">graph</span>
              <span className="title-subline">Live room intelligence</span>
            </h1>

            <p className="hero-line hero-lede mt-6 max-w-xl">
              Rolograph is a generated intelligence dossier for what you&apos;re about to walk into.
            </p>

            <p className="hero-line mt-4 max-w-xl text-base leading-7 text-white/78">
              An event, a room, a recruiter screen. Who&apos;s there, why they matter to you, what to say, and what it&apos;s grounded in.
            </p>

            <p className="hero-line mt-4 max-w-xl text-sm leading-6 text-white/62">
              You meet thirty people at an event and remember four names by Monday. Give Rolograph whatever you already have — a screenshot of the guest list, the event page, an InMail — and it hands back the brief.
            </p>

            <div className="hero-line mt-6 flex flex-wrap gap-3">
              <button className="neon-button" type="button" onClick={startPresenter} aria-label="Run presenter mode">
                <Play size={18} />
                Run 75s Demo
              </button>
              <a className="ghost-button" href="#join-build">
                <UserPlus size={18} />
                Get One
              </a>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-3">
            {metrics.map((metric) => (
              <div className="metric-tile p-3" key={metric.label}>
                <div className="metric-value">{metric.value}</div>
                <div className="mt-1 text-xs font-black uppercase text-white">{metric.label}</div>
                <div className="mt-1 text-xs text-white/56">{metric.detail}</div>
              </div>
            ))}
          </div>

          <div className="hero-line mt-6 border border-white/15 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-sm font-black uppercase text-cyanpop">
              <BrainCircuit size={17} />
              Why it matters
            </div>
            <p className="text-sm leading-6 text-white/72">
              Context decays fastest in the hour after you meet someone. Rolograph captures it while it is still true.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a className="signal-link" href="https://app.cursormiami.com" rel="noreferrer" target="_blank">
                <ExternalLink size={14} /> Live check-in
              </a>
              <span className="signal-link text-white/68">
                <MapPin size={14} /> The DOCK // Wynwood
              </span>
            </div>
          </div>
        </section>

        <section className="chrome-panel graph-stage">
          <div className="ticker">
            <div className="ticker-track">
              {Array.from({ length: 2 }).map((_, index) => (
                <span key={index} className="flex gap-5">
                  <span className="marquee-word">ship</span>
                  <span>graph the room</span>
                  <span className="marquee-word">capture edge</span>
                  <span>verify relationships</span>
                  <span className="marquee-word">zoom node</span>
                  <span>submit before 9:30</span>
                  <span>no slides</span>
                </span>
              ))}
            </div>
          </div>

          <div className="graph-canvas" aria-label="Interactive Rolograph relationship graph">
            <div className="capture-flash pointer-events-none absolute left-1/2 top-1/2 z-10 grid h-44 w-44 -translate-x-1/2 -translate-y-1/2 place-items-center border border-acid/70 bg-acid/15 text-center font-mono text-sm font-bold uppercase text-acid opacity-0 shadow-hyper">
              Edge Captured
            </div>

            <div className="graph-map" ref={graphRef}>
              <svg className="edge-layer" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
                <defs>
                  <linearGradient id="hot-flow" x1="0%" x2="100%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#ff2bd6" />
                    <stop offset="48%" stopColor="#20f6ff" />
                    <stop offset="100%" stopColor="#d7ff2f" />
                  </linearGradient>
                  <linearGradient id="acid-flow" x1="100%" x2="0%" y1="0%" y2="100%">
                    <stop offset="0%" stopColor="#fff34a" />
                    <stop offset="55%" stopColor="#d7ff2f" />
                    <stop offset="100%" stopColor="#ff2bd6" />
                  </linearGradient>
                </defs>
                {[...edges, ...captureEdges].map((edge, index) => {
                  const source = getNode(edge.source);
                  const target = getNode(edge.target);
                  const isHot = selectedId === edge.source || selectedId === edge.target;
                  const isCaptured = capturedNodeIds.has(edge.target) && edge.source === OPERATOR_ID;

                  return (
                    <path
                      className={`graph-edge ${isHot ? "is-hot" : ""} ${isCaptured ? "is-unlocked" : ""}`}
                      key={edge.id}
                      d={edgePath(source.x, source.y, target.x, target.y, index)}
                      fill="none"
                      opacity={0.95}
                      vectorEffect="non-scaling-stroke"
                    />
                  );
                })}
              </svg>

              {nodes.map((node) => {
                const isSelected = selectedId === node.id;
                const isConnected = connectedIds.has(node.id);

                return (
                  <button
                    className={`graph-node kind-${node.kind} ${isSelected ? "is-selected" : ""}`}
                    key={node.id}
                    onClick={() => handleNodeClick(node.id)}
                    style={{
                      left: `${node.x}%`,
                      top: `${node.y}%`,
                      opacity: isConnected || selectedId === "event" ? 1 : 0.58,
                    }}
                    type="button"
                    aria-pressed={isSelected}
                    aria-label={`Open ${node.label}`}
                  >
                    <span className="node-chip">{node.label.slice(0, 2)}</span>
                    <span>
                      <span className="node-label">{node.label}</span>
                      <span className="node-meta">{node.kicker}</span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="border-t border-white/15 bg-black/30 p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-mono text-xs uppercase text-white/54">Presenter Mode</div>
                <div className="glitch-cut text-sm font-black uppercase text-white">{demoStep}</div>
              </div>
              <button className="ghost-button min-h-10 px-3 py-2 text-xs" type="button" onClick={demoActive ? stopPresenter : startPresenter}>
                {demoActive ? <Square size={15} /> : <Play size={15} />}
                {demoActive ? "Stop" : "Start"}
              </button>
            </div>
            <div className="demo-bar">
              <div className="demo-progress-fill" />
            </div>
          </div>
        </section>

        <aside className="chrome-panel flex min-h-[calc(100vh-2rem)] flex-col p-5 md:p-6">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div>
              <div className="font-mono text-xs uppercase text-white/54">Selected Node</div>
              <h2 className="panel-title mt-1">{selected.label}</h2>
            </div>
            <div className="grid h-14 w-14 place-items-center border border-white/20 bg-white/10 text-acid">
              <Network size={28} />
            </div>
          </div>

          <div className="mb-3 border border-acid/30 bg-acid/[0.07] p-3">
            <div className="flex items-center gap-2 font-mono text-[0.62rem] uppercase text-acid">
              <Crosshair size={13} />
              Scored against your objective
            </div>
            <p className="mt-1.5 text-xs leading-5 text-white/82">{objective.statement}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {objective.weights.map((weight) => (
                <span
                  className="border border-white/12 bg-black/25 px-2 py-0.5 font-mono text-[0.6rem] uppercase text-white/58"
                  key={weight.label}
                  title={weight.detail}
                >
                  {weight.label}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="signal-tile p-3">
              <div className="font-mono text-xs uppercase text-white/50">Priority</div>
              <div className="metric-value mt-1">{selectedPriority}</div>
              <div className="mt-1 font-mono text-[0.62rem] uppercase text-white/45">
                base {selected.basePriority} + edges {liveEdgeWeight(selected.id, capturedNodeIds)}
                {selectedNoteCount > 0 ? ` + ${selectedNoteCount} note${selectedNoteCount > 1 ? "s" : ""}` : ""}
              </div>
            </div>
            <div className="signal-tile p-3">
              <div className="font-mono text-xs uppercase text-white/50">Confidence</div>
              <div className={`mt-2 text-sm font-black uppercase ${selectedVerified ? "text-acid" : "text-cyanpop"}`}>
                {selectedConfidence}
              </div>
              <div className="mt-1 font-mono text-[0.62rem] uppercase text-white/45">
                {selectedVerified ? "verified by capture" : "researched, not verified"}
              </div>
            </div>
          </div>

          <div className="mt-4 border border-white/15 bg-black/20 p-4">
            <div className="mb-2 text-xs font-black uppercase text-hotpink">Role</div>
            <p className="text-sm leading-6 text-white/74">{selected.role}</p>
          </div>

          <div className="mt-4 border border-white/15 bg-black/20 p-4">
            <div className="mb-2 text-xs font-black uppercase text-acid">Why it matters</div>
            <p className="text-sm leading-6 text-white/74">{selected.summary}</p>
          </div>

          <div className="mt-4 border border-white/15 bg-black/20 p-4">
            <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-cyanpop">
              <MousePointer2 size={14} />
              Live Opener
            </div>
            <p className="text-sm leading-6 text-white/84">&quot;{selected.opener}&quot;</p>
          </div>

          <div className="mt-4 border border-white/15 bg-black/20 p-4">
            <div className="mb-2 text-xs font-black uppercase text-white/60">Desired Edge</div>
            <p className="font-mono text-xs leading-5 text-white/74">{selected.desiredEdge}</p>
          </div>

          <div className="mt-4 border border-white/15 bg-black/20 p-4">
            <div className="mb-3 flex items-center gap-2 text-xs font-black uppercase text-white/60">
              <FileSearch size={14} />
              Evidence
              <span className="ml-auto font-mono text-[0.62rem] font-normal text-white/40">
                {selected.evidence.length} source{selected.evidence.length === 1 ? "" : "s"}
              </span>
            </div>
            <ul className="space-y-2.5">
              {selected.evidence.map((item) => (
                <li key={item.claim}>
                  <p className="text-xs leading-5 text-white/76">{item.claim}</p>
                  <p className="mt-1 font-mono text-[0.62rem] uppercase leading-4 text-white/42">{item.source}</p>
                </li>
              ))}
            </ul>
          </div>

          {selected.gap ? (
            <div className="mt-4 border border-hotpink/35 bg-hotpink/[0.08] p-4">
              <div className="mb-2 flex items-center gap-2 text-xs font-black uppercase text-hotpink">
                <AlertTriangle size={14} />
                Known gap
              </div>
              <p className="text-sm leading-6 text-white/76">{selected.gap}</p>
            </div>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            {selected.tags.map((tag) => (
              <span className="border border-white/15 bg-white/[0.06] px-2.5 py-1 font-mono text-[0.68rem] uppercase text-white/70" key={tag}>
                {tag}
              </span>
            ))}
          </div>

          <div className="mt-auto pt-6">
            {canCapture ? (
              <>
                <button className="neon-button w-full" type="button" onClick={handleRecordClick} aria-expanded={noteOpen}>
                  <CircleDotDashed size={18} />
                  {noteOpen ? "Cancel note" : "Record Interaction"}
                </button>
                {!noteOpen && (
                  <p className="mt-2 font-mono text-[0.62rem] uppercase text-white/45">Records against {selected.label}</p>
                )}
              </>
            ) : (
              <p className="border border-white/15 bg-black/20 p-3 font-mono text-[0.68rem] uppercase leading-5 text-white/54">
                This is you. Select someone else in the graph to record a conversation.
              </p>
            )}

            {canCapture && noteOpen && (
              <form className="mt-3 border border-acid/40 bg-black/28 p-4" onSubmit={handleNoteSubmit}>
                <label className="mb-2 block text-xs font-black uppercase text-acid" htmlFor="capture-note">
                  What was actually said
                </label>
                <textarea
                  autoFocus
                  className="field-input min-h-20 resize-y text-sm"
                  id="capture-note"
                  onChange={(event) => {
                    setNoteDraft(event.target.value);
                    if (noteError) setNoteError(false);
                  }}
                  placeholder={`Note from the conversation with ${selected.label}`}
                  value={noteDraft}
                />
                {noteError && (
                  <p className="mt-2 font-mono text-[0.66rem] uppercase text-hotpink">
                    A note is required. Empty captures are not recorded.
                  </p>
                )}
                <button className="neon-button mt-3 w-full" type="submit">
                  <Activity size={16} />
                  Capture edge
                </button>
              </form>
            )}

            <div className="mt-3 border border-white/15 bg-black/20 p-4">
              <div className="flex items-center justify-between gap-2 text-xs font-black uppercase text-acid">
                <span className="flex items-center gap-2">
                  <Activity size={14} />
                  {interactionCaptured ? "Captured interactions" : "Ready for live note"}
                </span>
                {interactionCaptured && <span className="font-mono text-white/54">{captures.length}</span>}
              </div>

              {interactionCaptured ? (
                <ul className="mt-3 space-y-2">
                  {recentCaptures.slice(0, MAX_RENDERED_CAPTURES).map((capture) => (
                    <li className="border border-white/12 bg-black/25 p-2.5" key={capture.id}>
                      <div className="flex items-baseline justify-between gap-2">
                        <span className="text-xs font-black uppercase text-cyanpop">{getNode(capture.nodeId).label}</span>
                        <span className="font-mono text-[0.62rem] uppercase text-white/45">
                          {formatRelativeTime(capture.at, Math.max(clockTick, capture.at))}
                        </span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-white/70">{capture.note}</p>
                    </li>
                  ))}
                  {recentCaptures.length > MAX_RENDERED_CAPTURES && (
                    <li className="font-mono text-[0.62rem] uppercase text-white/45">
                      + {recentCaptures.length - MAX_RENDERED_CAPTURES} earlier captures
                    </li>
                  )}
                </ul>
              ) : (
                <p className="mt-2 text-xs leading-5 text-white/64">
                  Record a conversation to turn researched context into a verified edge, a higher priority, and a follow-up you will
                  actually keep.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>

      <section className="px-4 pb-6" aria-label="How Rolograph works">
        <div className="chrome-panel mx-auto max-w-[1440px] p-5 md:p-7">
          <div className="mb-3 inline-flex items-center gap-2 border border-cyanpop/40 bg-cyanpop/10 px-3 py-2 text-xs font-black uppercase text-cyanpop">
            <BrainCircuit size={15} />
            How it works
          </div>
          <h2 className="recruit-title max-w-4xl">
            Put messy input in. Get a <em>researched brief</em> back.
          </h2>

          <div className="mt-6 grid gap-3 md:grid-cols-3">
            {howItWorks.map((item) => (
              <div className="role-tile p-4" key={item.step}>
                <div className="font-mono text-xs uppercase text-white/45">{item.step}</div>
                <div className="mt-1 text-sm font-black uppercase text-acid">{item.title}</div>
                <p className="mt-2 text-sm leading-6 text-white/64">{item.detail}</p>
              </div>
            ))}
          </div>

          <p className="mt-6 max-w-3xl text-base leading-7 text-white/80">
            Like a personal assistant who actually did the research before you walked in.
          </p>
        </div>
      </section>

      <section className="event-clock" aria-label="Cursor Miami Ship Night schedule">
        <div className="event-clock-heading">
          <CalendarClock size={19} />
          <span>Hard clocks</span>
          <span className="font-mono text-[0.66rem] text-white/52">Thursday, August 6 // live products only</span>
        </div>
        <div className="event-clock-track">
          {schedule.map((item) => (
            <div className={`clock-stop tone-${item.tone}`} key={`${item.time}-${item.label}`}>
              <span className="clock-time">{item.time}</span>
              <span className="clock-label">{item.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="px-4 pb-6" id="join-build">
        <div className="chrome-panel mx-auto grid max-w-[1440px] gap-6 p-5 md:grid-cols-[1fr_0.85fr] md:p-7">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 border border-hotpink/40 bg-hotpink/10 px-3 py-2 text-xs font-black uppercase text-hotpink">
              <Sparkles size={15} />
              Front door
            </div>
            <h2 className="recruit-title max-w-4xl">
              Tell me what you&apos;re <em>walking into.</em>
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-7 text-white/70">
              This one was built for tonight. Earlier ones covered a two-event night in Wynwood, a room of 120 people, and a recruiter screen. Every Rolograph starts the same way: someone says where they are going and what they want out of it.
            </p>
            <p className="mt-4 max-w-3xl text-sm leading-6 text-white/58">
              You do not need clean data or an integration. A screenshot of the guest list and the name of the company is enough to start.
            </p>
          </div>

          <form
            className="border border-white/15 bg-black/28 p-4 md:p-5"
            data-netlify="true"
            name="join-interest"
            netlify-honeypot="bot-field"
            onSubmit={handleJoinSubmit}
          >
            <input type="hidden" name="form-name" value="join-interest" />
            <p className="hidden">
              <label>
                Do not fill this out: <input name="bot-field" />
              </label>
            </p>
            <input type="hidden" name="signal" value="Cursor Miami Ship Night" />

            <div className="mb-4">
              <div className="font-mono text-xs uppercase text-white/54">Request a Rolograph</div>
              <h3 className="form-title mt-1">Get one for your next encounter.</h3>
            </div>

            <label className="mb-3 block text-xs font-black uppercase text-white/62" htmlFor="name">
              Name
            </label>
            <input className="field-input mb-4" id="name" name="name" placeholder="Your name" required />

            <label className="mb-3 block text-xs font-black uppercase text-white/62" htmlFor="email">
              Email
            </label>
            <input className="field-input mb-4" id="email" name="email" placeholder="you@wherever.dev" required />

            <label className="mb-3 block text-xs font-black uppercase text-white/62" htmlFor="role">
              The next event or meeting you&apos;re walking into
            </label>
            <input
              className="field-input mb-4"
              id="role"
              name="role"
              placeholder="Interview at Frontdoor, Tuesday. Or: AI Collective meetup, next Thursday."
              required
            />

            <label className="mb-3 block text-xs font-black uppercase text-white/62" htmlFor="message">
              What you&apos;re trying to get out of it
            </label>
            <textarea
              className="field-input mb-4 min-h-28 resize-y"
              id="message"
              name="message"
              placeholder="A senior engineering role. Or: three people worth staying in touch with. Or: honest feedback on what I'm building."
            />

            <button className="neon-button w-full" disabled={joinStatus === "sending"} type="submit">
              <Mail size={18} />
              {joinStatus === "sending" ? "Sending" : "Request Rolograph"}
            </button>

            <div className="mt-4 border border-white/15 bg-white/[0.05] p-3 text-sm leading-6 text-white/68">
              {joinStatus === "captured" && "Got it. Send whatever you have — screenshots, a link, a forwarded email — and you'll get the brief back."}
              {joinStatus === "local" && "Staged locally. If Netlify Forms is not active yet, open an issue on the repo instead."}
              {joinStatus === "idle" && "Recorded through Netlify Forms, no backend and no account required."}
              <a className="mt-3 inline-flex items-center gap-2 font-black uppercase text-acid" href="https://github.com/melroser/rolographs" rel="noreferrer" target="_blank">
                Open repo <ArrowRight size={15} />
              </a>
            </div>
          </form>
        </div>

        <div className="chrome-panel mx-auto mt-6 max-w-[1440px] p-5 md:p-7">
          <div className="mb-3 inline-flex items-center gap-2 border border-acid/40 bg-acid/10 px-3 py-2 text-xs font-black uppercase text-acid">
            <UserPlus size={15} />
            Open roles
          </div>
          <h2 className="recruit-title max-w-4xl">
            Who&apos;s needed to <em>build it.</em>
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-7 text-white/70">
            Tonight is one room generated by hand. Making it generate itself from a calendar, an inbox, and a pile of screenshots is the actual engineering.
          </p>

          <div className="mt-6 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {roles.map((role) => (
              <div className="role-tile p-4" key={role.title}>
                <div className="text-sm font-black uppercase text-acid">{role.title}</div>
                <p className="mt-2 text-sm leading-6 text-white/64">{role.detail}</p>
              </div>
            ))}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {buildStack.map((item) => (
              <span className="border border-cyanpop/30 bg-cyanpop/10 px-3 py-1.5 font-mono text-xs uppercase text-cyanpop" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
