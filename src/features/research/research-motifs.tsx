import type { ReactNode } from "react";
import type { ResearchMotif } from "./data/research-motifs";

/*
 * Research tile motifs: one small figure per subject, redrawn as hairline
 * line work in a 400 × 300 box (the tile's 4:3). Each keeps the house
 * figure grammar: structure in a faint ink, one element in the accent
 * (`text-highlight`, the band's AA accent, so every motif shares one colour
 * and the subject is told by form alone), no text. `research.css` fades
 * every motif out towards the centre, where the logos sit, and keeps the
 * strokes one pixel at any size. All geometry is computed from fixed
 * numbers, so server and client render the same markup.
 */

type Point = readonly [number, number];

const STRUCTURE = "text-fg/30";
const FAINT = "text-fg/15";
const ACCENT = "text-highlight";

/** Rounds to a tenth, so the markup stays short and stable. */
const r1 = (value: number) => Math.round(value * 10) / 10;

const points = (list: readonly Point[]) =>
  list.map(([x, y]) => `${r1(x)},${r1(y)}`).join(" ");

/** A small deterministic generator (an LCG), so scatter is the same on every render. */
function seeded(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

/** A horizontal S-curve from `a` to `b`, as a tree's edges are drawn. */
const branch = ([x1, y1]: Point, [x2, y2]: Point) => {
  const mid = r1((x1 + x2) / 2);
  return `M${r1(x1)} ${r1(y1)}C${mid} ${r1(y1)} ${mid} ${r1(y2)} ${r1(x2)} ${r1(y2)}`;
};

/** A node: a dot that masks the lines it ends. */
function Node({
  at: [x, y],
  radius = 3,
  filled = false,
}: {
  at: Point;
  radius?: number;
  filled?: boolean;
}) {
  return (
    <circle
      cx={r1(x)}
      cy={r1(y)}
      r={radius}
      className={filled ? "fill-current" : "fill-sunken"}
    />
  );
}

/* Aerial localization: a block of city in axonometric wireframe, a drone's
   flight path (dashed) and its camera frustum looking down on the blocks,
   the footprint dashed on the ground. */
function CameraFrustum() {
  const project = (x: number, y: number, z: number): Point => [
    292 + (x - y) * 12.5,
    200 + (x + y) * 6.25 - z * 9,
  ];
  const random = seeded(7);
  const blocks = Array.from({ length: 25 }, (_, index) => {
    const i = index % 5;
    const j = Math.floor(index / 5);
    return { i, j, height: 0.5 + random() * random() * 4 };
  }).sort((a, b) => a.i + a.j - (b.i + b.j));
  const footprint: Point[] = [
    project(1.6, 0.8, 0),
    project(5.6, 0.8, 0),
    project(5.6, 4.8, 0),
    project(1.6, 4.8, 0),
  ];
  const camera: Point = [306, 40];
  const plane = footprint.map(
    ([x, y]): Point => [
      camera[0] + (x - camera[0]) * 0.18,
      camera[1] + (y - camera[1]) * 0.18,
    ],
  );
  return (
    <>
      <g className={STRUCTURE}>
        {blocks.map(({ i, j, height }) => {
          const [x0, y0] = [i * 1.4, j * 1.4];
          const [x1, y1] = [x0 + 1, y0 + 1];
          return (
            <g key={`${i}-${j}`} className="fill-sunken">
              <polygon
                points={points([
                  project(x1, y0, 0),
                  project(x1, y1, 0),
                  project(x1, y1, height),
                  project(x1, y0, height),
                ])}
              />
              <polygon
                points={points([
                  project(x0, y1, 0),
                  project(x1, y1, 0),
                  project(x1, y1, height),
                  project(x0, y1, height),
                ])}
              />
              <polygon
                points={points([
                  project(x0, y0, height),
                  project(x1, y0, height),
                  project(x1, y1, height),
                  project(x0, y1, height),
                ])}
              />
            </g>
          );
        })}
      </g>
      <g className={ACCENT}>
        <path
          d={`M16 92C96 30 214 22 ${camera[0]} ${camera[1]}`}
          strokeDasharray="1.5 4"
          strokeOpacity={0.7}
        />
        <polygon points={points(footprint)} strokeDasharray="3 3" />
        {footprint.map(([x, y], index) => (
          <line
            // biome-ignore lint/suspicious/noArrayIndexKey: four fixed rays
            key={index}
            x1={camera[0]}
            y1={camera[1]}
            x2={r1(x)}
            y2={r1(y)}
            strokeOpacity={0.6}
          />
        ))}
        <polygon points={points(plane)} className="fill-sunken" />
        <Node at={camera} radius={2.5} filled />
      </g>
    </>
  );
}

/* Sycophancy: a field of needles that should all point to true north,
   bent off it the closer they sit to a pull in one corner (the user's
   stated belief). The needles that give way are drawn in the accent. */
function VectorField() {
  const pull: Point = [324, 58];
  const needles = Array.from({ length: 12 * 9 }, (_, index) => {
    const x = 22 + (index % 12) * 32;
    const y = 22 + Math.floor(index / 12) * 32;
    const distance = Math.hypot(pull[0] - x, pull[1] - y);
    const towards = Math.atan2(pull[1] - y, pull[0] - x);
    const north = -Math.PI / 2;
    let turn = towards - north;
    if (turn > Math.PI) turn -= 2 * Math.PI;
    if (turn < -Math.PI) turn += 2 * Math.PI;
    const angle = north + turn * Math.exp(-distance / 120);
    const [dx, dy] = [Math.cos(angle) * 8, Math.sin(angle) * 8];
    return {
      key: index,
      from: [x - dx, y - dy] as Point,
      to: [x + dx, y + dy] as Point,
      bent: Math.abs(angle - north) > 0.32,
      skip: distance < 18,
    };
  }).filter(({ skip }) => !skip);
  const draw = (list: typeof needles) =>
    list.map(({ key, from, to }) => (
      <g key={key}>
        <line x1={r1(from[0])} y1={r1(from[1])} x2={r1(to[0])} y2={r1(to[1])} />
        <circle
          cx={r1(to[0])}
          cy={r1(to[1])}
          r={1.8}
          className="fill-current"
          stroke="none"
        />
      </g>
    ));
  return (
    <>
      <g className={STRUCTURE}>{draw(needles.filter(({ bent }) => !bent))}</g>
      <g className={ACCENT}>
        {draw(needles.filter(({ bent }) => bent))}
        <circle cx={pull[0]} cy={pull[1]} r={9} strokeDasharray="2 2.5" />
        <Node at={pull} radius={2.5} filled />
      </g>
    </>
  );
}

/* Tool calling: a decision tree read left to right. The chosen path is the
   accent; one call fails (dashed, a dead end) and the path recovers
   through the call beside it to the goal. */
function DecisionTree() {
  const root: Point = [36, 150];
  const level1: Point[] = [
    [118, 62],
    [118, 150],
    [118, 238],
  ];
  const level2: Point[][] = [
    [
      [204, 40],
      [204, 92],
    ],
    [
      [204, 132],
      [204, 172],
    ],
    [
      [204, 214],
      [204, 264],
    ],
  ];
  const failed: Point = [290, 24];
  const retried: Point = [290, 66];
  const goal: Point = [368, 52];
  const leaves: [Point, Point][] = [
    [level2[0]?.[1] ?? root, [290, 108]],
    [level2[1]?.[0] ?? root, [290, 132]],
    [level2[1]?.[1] ?? root, [290, 160]],
    [level2[2]?.[0] ?? root, [290, 200]],
    [level2[2]?.[0] ?? root, [290, 228]],
    [level2[2]?.[1] ?? root, [290, 266]],
    [
      [290, 160],
      [368, 172],
    ],
    [
      [290, 228],
      [368, 236],
    ],
  ];
  const chosen = level2[0]?.[0] ?? root;
  const first = level1[0] ?? root;
  const structureEdges: [Point, Point][] = [
    ...level1.slice(1).map((node): [Point, Point] => [root, node]),
    ...level1.flatMap((node, index) =>
      (level2[index] ?? [])
        .filter((child) => child !== chosen)
        .map((child): [Point, Point] => [node, child]),
    ),
    ...leaves,
  ];
  const structureNodes = [
    ...level1.slice(1),
    ...level2.flat().filter((node) => node !== chosen),
    ...leaves.map(([, leaf]) => leaf),
  ];
  return (
    <>
      <g className={STRUCTURE}>
        {structureEdges.map(([a, b]) => (
          <path key={`${a}-${b}`} d={branch(a, b)} />
        ))}
        {structureNodes.map((node) => (
          <Node key={`${node}`} at={node} />
        ))}
      </g>
      <g className={ACCENT}>
        <path d={branch(root, first)} />
        <path d={branch(first, chosen)} />
        <path
          d={branch(chosen, failed)}
          strokeDasharray="2 3"
          strokeOpacity={0.7}
        />
        <path d={branch(chosen, retried)} />
        <path d={branch(retried, goal)} />
        <Node at={root} />
        <Node at={first} />
        <Node at={chosen} />
        <Node at={failed} />
        <Node at={retried} />
        <circle cx={goal[0]} cy={goal[1]} r={8} />
        <Node at={goal} radius={3} filled />
      </g>
    </>
  );
}

/* Cell embeddings: an embedding scatter with its hierarchy drawn in, coarse
   groups (dashed) holding finer subtypes; one subtype is the accent. */
function NestedClusters() {
  const random = seeded(23);
  const groups: { at: Point; radius: number; subtypes: [Point, number][] }[] = [
    {
      at: [92, 84],
      radius: 64,
      subtypes: [
        [[70, 66], 24],
        [[118, 74], 18],
        [[92, 116], 20],
      ],
    },
    {
      at: [322, 222],
      radius: 62,
      subtypes: [
        [[300, 206], 22],
        [[346, 214], 16],
        [[318, 250], 18],
      ],
    },
    {
      at: [332, 66],
      radius: 42,
      subtypes: [
        [[320, 58], 16],
        [[346, 80], 14],
      ],
    },
    {
      at: [74, 240],
      radius: 40,
      subtypes: [
        [[62, 232], 15],
        [[90, 250], 14],
      ],
    },
  ];
  const dots = (at: Point, radius: number, count: number) =>
    Array.from({ length: count }, () => {
      const angle = random() * 2 * Math.PI;
      const distance = Math.sqrt(random()) * radius * 0.72;
      return [
        at[0] + Math.cos(angle) * distance,
        at[1] + Math.sin(angle) * distance,
      ] as Point;
    });
  const subtypes = groups.flatMap(({ subtypes: list }) =>
    list.map(([at, radius]) => ({
      at,
      radius,
      dots: dots(at, radius, Math.round(radius * 0.7)),
    })),
  );
  const [accent, ...rest] = subtypes;
  return (
    <>
      <g className={FAINT}>
        {groups.map(({ at, radius }) => (
          <circle
            key={`${at}`}
            cx={at[0]}
            cy={at[1]}
            r={radius}
            strokeDasharray="2 3"
          />
        ))}
      </g>
      <g className={STRUCTURE}>
        {rest.map(({ at, radius, dots: list }) => (
          <g key={`${at}`}>
            <circle cx={at[0]} cy={at[1]} r={radius} />
            {list.map(([x, y]) => (
              <circle
                key={`${x}-${y}`}
                cx={r1(x)}
                cy={r1(y)}
                r={1.5}
                className="fill-current"
                stroke="none"
              />
            ))}
          </g>
        ))}
      </g>
      {accent ? (
        <g className={ACCENT}>
          <circle cx={accent.at[0]} cy={accent.at[1]} r={accent.radius} />
          {accent.dots.map(([x, y]) => (
            <circle
              key={`${x}-${y}`}
              cx={r1(x)}
              cy={r1(y)}
              r={1.6}
              className="fill-current"
              stroke="none"
            />
          ))}
        </g>
      ) : null}
    </>
  );
}

/* Long surgical video: a strip of frames along the top and the hours as a
   ruler along the bottom; arcs link moments far apart, and the accent arc
   ties two frames hours from each other. */
function LongTimeline() {
  const axis = 254;
  const start = 24;
  const end = 376;
  const frames = Array.from({ length: 15 }, (_, index) => start + index * 24);
  const ticks = Array.from(
    { length: Math.floor((end - start) / 6) + 1 },
    (_, index) => start + index * 6,
  );
  const arc = (a: number, b: number) => {
    const height = (b - a) * 0.42;
    return `M${a} ${axis}C${a} ${axis - height * 1.33} ${b} ${axis - height * 1.33} ${b} ${axis}`;
  };
  const linked: [number, number] = [frames[1] ?? start, frames[13] ?? end];
  const centre = (x: number) => x + 10;
  return (
    <>
      <g className={STRUCTURE}>
        {frames.map((x) => (
          <rect key={x} x={x} y={26} width={20} height={14} rx={1.5} />
        ))}
        <line x1={start} y1={axis} x2={end} y2={axis} />
        {ticks.map((x, index) => (
          <line
            key={x}
            x1={x}
            y1={axis}
            x2={x}
            y2={axis - (index % 10 === 0 ? 12 : 5)}
          />
        ))}
        <path d={arc(centre(frames[3] ?? 0), centre(frames[7] ?? 0))} />
        <path d={arc(centre(frames[6] ?? 0), centre(frames[12] ?? 0))} />
        <path d={arc(centre(frames[9] ?? 0), centre(frames[11] ?? 0))} />
      </g>
      <g className={ACCENT}>
        {linked.map((x) => (
          <g key={x}>
            <rect
              x={x}
              y={26}
              width={20}
              height={14}
              rx={1.5}
              className="fill-current"
              fillOpacity={0.12}
            />
            <line
              x1={centre(x)}
              y1={44}
              x2={centre(x)}
              y2={axis - 4}
              strokeDasharray="1.5 3"
              strokeOpacity={0.6}
            />
            <Node at={[centre(x), axis]} radius={2.5} filled />
          </g>
        ))}
        <path d={arc(centre(linked[0]), centre(linked[1]))} />
      </g>
    </>
  );
}

/* 4D Gaussians: objects reconstructed as clumps of splats (oriented
   ellipses), one moving clump with a dashed twin a moment later, and the
   scene graph linking the objects in the accent. */
function SplatGraph() {
  const random = seeded(41);
  const objects: Point[] = [
    [62, 62],
    [176, 38],
    [334, 54],
    [352, 186],
    [282, 258],
    [84, 236],
  ];
  const moving = 3;
  /* Each object is a short run of splats along one surface direction. */
  const splats = objects.flatMap(([cx, cy], object) => {
    const surface = random() * Math.PI;
    return Array.from({ length: 4 }, (_, index) => {
      const along = (index - 1.5) * 13 + (random() - 0.5) * 4;
      const across = (random() - 0.5) * 8;
      const rx = 9 + random() * 7;
      return {
        key: `${object}-${index}`,
        x: cx + Math.cos(surface) * along - Math.sin(surface) * across,
        y: cy + Math.sin(surface) * along + Math.cos(surface) * across,
        rx,
        ry: rx * (0.34 + random() * 0.2),
        angle: (surface * 180) / Math.PI + (random() - 0.5) * 30,
        moves: object === moving,
      };
    });
  });
  const edges: [number, number][] = [
    [0, 1],
    [1, 2],
    [2, 3],
    [3, 4],
    [0, 5],
  ];
  return (
    <>
      <g className={STRUCTURE}>
        {splats.map(({ key, x, y, rx, ry, angle, moves }) => (
          <g key={key} transform={`rotate(${r1(angle)} ${r1(x)} ${r1(y)})`}>
            <ellipse cx={r1(x)} cy={r1(y)} rx={r1(rx)} ry={r1(ry)} />
            {moves ? (
              <ellipse
                cx={r1(x - 14)}
                cy={r1(y + 6)}
                rx={r1(rx)}
                ry={r1(ry)}
                strokeDasharray="2 2.5"
                strokeOpacity={0.6}
              />
            ) : null}
          </g>
        ))}
      </g>
      <g className={ACCENT}>
        {edges.map(([a, b]) => {
          const [from, to] = [objects[a], objects[b]];
          if (!from || !to) return null;
          return (
            <line
              key={`${a}-${b}`}
              x1={from[0]}
              y1={from[1]}
              x2={to[0]}
              y2={to[1]}
              strokeOpacity={0.55}
            />
          );
        })}
        {objects.map((node) => (
          <rect
            key={`${node}`}
            x={node[0] - 3.5}
            y={node[1] - 3.5}
            width={7}
            height={7}
            className="fill-sunken"
          />
        ))}
      </g>
    </>
  );
}

/* Synthesizability: a ternary phase diagram, its composition grid faint,
   the known phases tied into triangles; one candidate and the tie lines
   its prediction passes messages along are the accent. */
function PhaseDiagram() {
  const corners: [Point, Point, Point] = [
    [200, 22],
    [50, 282],
    [350, 282],
  ];
  const at = (a: number, b: number, c: number): Point => [
    a * corners[0][0] + b * corners[1][0] + c * corners[2][0],
    a * corners[0][1] + b * corners[1][1] + c * corners[2][1],
  ];
  const grid = [1, 2, 3, 4, 5].flatMap((step) => {
    const t = step / 6;
    return [
      [at(t, 1 - t, 0), at(t, 0, 1 - t)],
      [at(1 - t, t, 0), at(0, t, 1 - t)],
      [at(1 - t, 0, t), at(0, 1 - t, t)],
    ] as [Point, Point][];
  });
  const phase = {
    top: at(1, 0, 0),
    left: at(0, 1, 0),
    right: at(0, 0, 1),
    leftEdge: at(0.5, 0.5, 0),
    rightEdge: at(0.4, 0, 0.6),
    baseLeft: at(0, 0.6, 0.4),
    baseRight: at(0, 0.25, 0.75),
    inner: at(0.45, 0.3, 0.25),
    lower: at(0.2, 0.55, 0.25),
    candidate: at(0.12, 0.3, 0.58),
  };
  const ties: [Point, Point][] = [
    [phase.top, phase.inner],
    [phase.leftEdge, phase.inner],
    [phase.rightEdge, phase.inner],
    [phase.inner, phase.lower],
    [phase.leftEdge, phase.lower],
    [phase.left, phase.lower],
    [phase.lower, phase.baseLeft],
    [phase.rightEdge, phase.baseRight],
  ];
  const messages = [
    phase.lower,
    phase.inner,
    phase.rightEdge,
    phase.baseLeft,
    phase.baseRight,
  ];
  const known = Object.values(phase).filter(
    (point) => point !== phase.candidate,
  );
  return (
    <>
      <g className={FAINT}>
        {grid.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={r1(a[0])}
            y1={r1(a[1])}
            x2={r1(b[0])}
            y2={r1(b[1])}
          />
        ))}
      </g>
      <g className={STRUCTURE}>
        <polygon points={points(corners)} />
        {ties.map(([a, b]) => (
          <line
            key={`${a}-${b}`}
            x1={r1(a[0])}
            y1={r1(a[1])}
            x2={r1(b[0])}
            y2={r1(b[1])}
          />
        ))}
        {known.map((point) => (
          <Node key={`${point}`} at={point} />
        ))}
      </g>
      <g className={ACCENT}>
        {messages.map((point) => (
          <line
            key={`${point}`}
            x1={r1(phase.candidate[0])}
            y1={r1(phase.candidate[1])}
            x2={r1(point[0])}
            y2={r1(point[1])}
          />
        ))}
        {messages.map((point) => (
          <Node key={`${point}`} at={point} />
        ))}
        <circle cx={r1(phase.candidate[0])} cy={r1(phase.candidate[1])} r={8} />
        <Node at={phase.candidate} radius={3} filled />
      </g>
    </>
  );
}

/**
 * The drawing for each motif key the Studio offers (`motif` on research).
 * Keyed by the schema's union, so a new option needs a drawing here before
 * the typecheck passes. Pick by subject, not by project:
 *
 * - `camera-frustum`: localization, mapping, aerial and 3D vision
 * - `vector-field`: alignment, safety, bias, robustness
 * - `decision-tree`: agents, planning, tool use, reinforcement learning
 * - `nested-clusters`: embeddings, representation learning, clustering
 * - `long-timeline`: video, time series, long context
 * - `splat-graph`: 3D and 4D reconstruction, scene understanding
 * - `phase-diagram`: materials, chemistry, structured prediction
 */
const motifs: Record<ResearchMotif, () => ReactNode> = {
  "camera-frustum": CameraFrustum,
  "vector-field": VectorField,
  "decision-tree": DecisionTree,
  "nested-clusters": NestedClusters,
  "long-timeline": LongTimeline,
  "splat-graph": SplatGraph,
  "phase-diagram": PhaseDiagram,
};

/**
 * A research tile's motif, filling its positioned parent behind the logos.
 * Decorative: hidden from assistive tech, the row's text names the subject.
 */
export function ResearchMotifArt({ motif }: { motif: ResearchMotif }) {
  const Motif = motifs[motif];
  return (
    <svg
      viewBox="0 0 400 300"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      data-motif={motif}
      className="research-motif pointer-events-none absolute inset-0 size-full"
    >
      <Motif />
    </svg>
  );
}
