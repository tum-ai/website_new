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

/* Sycophancy: a measuring scale along the bottom, the true value a tall
   tick at the left and the user's stated belief ringed in the accent at
   the right. The model's answers travel along a wide arc over the tile
   from the truth to the belief, framing the logos; the answers that have
   given way are drawn in the accent. */
function BeliefDrift() {
  const baseline = 266;
  const truth: Point = [48, 228];
  const belief: Point = [352, 236];
  const ticks = Array.from({ length: 23 }, (_, index) => 24 + index * 16);
  /* The arc as a cubic Bézier over the top of the tile. */
  const c1: Point = [44, 36];
  const c2: Point = [356, 36];
  const along = (t: number): Point => {
    const u = 1 - t;
    const mix = (a: number, b: number, c: number, d: number) =>
      u * u * u * a + 3 * u * u * t * b + 3 * u * t * t * c + t * t * t * d;
    return [
      mix(truth[0], c1[0], c2[0], belief[0]),
      mix(truth[1], c1[1], c2[1], belief[1]),
    ];
  };
  const answers = [0.1, 0.22, 0.36, 0.5, 0.64, 0.78, 0.9].map((t, index) => ({
    key: index,
    at: along(t),
    given: t > 0.45,
  }));
  return (
    <>
      <g className={FAINT}>
        {ticks.map((x, index) => (
          <line
            key={x}
            x1={x}
            y1={baseline}
            x2={x}
            y2={baseline - (index % 4 === 0 ? 10 : 5)}
          />
        ))}
        <path
          d={`M${truth[0]} ${truth[1]}C${c1[0]} ${c1[1]} ${c2[0]} ${c2[1]} ${belief[0]} ${belief[1]}`}
          strokeDasharray="2 4"
        />
      </g>
      <g className={STRUCTURE}>
        <line x1={16} y1={baseline} x2={384} y2={baseline} />
        <line x1={truth[0]} y1={baseline} x2={truth[0]} y2={truth[1]} />
        <Node at={truth} radius={3} filled />
        {answers
          .filter(({ given }) => !given)
          .map(({ key, at }) => (
            <Node key={key} at={at} radius={3} filled />
          ))}
      </g>
      <g className={ACCENT}>
        {answers
          .filter(({ given }) => given)
          .map(({ key, at }) => (
            <Node key={key} at={at} radius={3} filled />
          ))}
        <line x1={belief[0]} y1={baseline} x2={belief[0]} y2={belief[1]} />
        <circle cx={belief[0]} cy={belief[1]} r={10} strokeDasharray="2 2.5" />
        <Node at={belief} radius={3} filled />
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

/* Magnet circuits: a quadrupole's cross-section (four coil blocks round
   the beam pipe) over the circuit its magnets sit in, six coils in series
   with a power supply, an extraction resistor and a switch. At the top
   right a solver's residual falls towards its tolerance: slowly as it is,
   in a few steps in the accent, with a learned preconditioner. */
function MagnetCircuit() {
  const centre: Point = [84, 84];
  const polar = (radius: number, angle: number): Point => [
    centre[0] + Math.cos(angle) * radius,
    centre[1] + Math.sin(angle) * radius,
  ];
  const coils = [0, 1, 2, 3].map((quarter) => {
    const mid = Math.PI / 4 + (quarter * Math.PI) / 2;
    const [inner, outer] = [22, 34];
    const [from, to] = [mid - 0.52, mid + 0.52];
    return [
      `M${points([polar(outer, from)])}`,
      `A${outer} ${outer} 0 0 1 ${points([polar(outer, to)])}`,
      `L${points([polar(inner, to)])}`,
      `A${inner} ${inner} 0 0 0 ${points([polar(inner, from)])}Z`,
    ].join("");
  });
  const [top, bottom, left, right] = [206, 266, 28, 372];
  const magnets = Array.from({ length: 6 }, (_, index) => 52 + index * 52);
  const coil = (x: number) =>
    `L${x} ${bottom}a5 5 0 0 1 10 0a5 5 0 0 1 10 0a5 5 0 0 1 10 0`;
  const resistor = Array.from(
    { length: 7 },
    (_, index): Point => [index % 2 ? right + 6 : right - 6, 248 - index * 4],
  );
  const tolerance = 116;
  const slow = Array.from(
    { length: 17 },
    (_, index): Point => [
      240 + index * 8,
      36 + 66 * (1 - Math.exp(-index / 8)),
    ],
  );
  const steps = [36, 62, 84, 100, 110, tolerance];
  const fast = steps
    .map((y, index) => `${index ? `H${240 + index * 10}V` : "M240 "}${y}`)
    .join("");
  return (
    <>
      <g className={FAINT}>
        <circle cx={centre[0]} cy={centre[1]} r={52} />
        <line
          x1={centre[0]}
          y1={centre[1] + 52}
          x2={magnets[0] ?? left}
          y2={bottom - 10}
          strokeDasharray="2 3"
        />
        <path d={`M236 28V124H${right}`} />
        <line
          x1={236}
          y1={tolerance}
          x2={right}
          y2={tolerance}
          strokeDasharray="2 3"
        />
      </g>
      <g className={STRUCTURE}>
        <circle cx={centre[0]} cy={centre[1]} r={8} />
        {coils.map((d) => (
          <path key={d} d={d} />
        ))}
        <path
          d={`M${left} ${bottom}${magnets.map(coil).join("")}L${right} ${bottom}`}
        />
        <polyline
          points={points([
            [right, bottom],
            [right, 252],
            ...resistor,
            [right, 220],
            [right, top],
            [320, top],
          ])}
        />
        <line x1={320} y1={top} x2={302} y2={top - 9} />
        <polyline
          points={points([
            [298, top],
            [left, top],
            [left, 230],
          ])}
        />
        <line x1={left - 10} y1={230} x2={left + 10} y2={230} />
        <line x1={left - 5} y1={236} x2={left + 5} y2={236} />
        <line x1={left} y1={236} x2={left} y2={bottom} />
        <polyline points={points(slow)} strokeDasharray="1.5 3" />
      </g>
      <g className={ACCENT}>
        <path d={fast} />
        <circle cx={290} cy={tolerance} r={7} />
        <Node at={[290, tolerance]} radius={2.5} filled />
      </g>
    </>
  );
}

/* A wireframe head on its shoulders, turned by `yaw` (radians, positive to
   the viewer's right): the meridians on the side it faces and three
   parallels, seen a little from above. Returns the head's size, the
   wireframe, the bust's outline and the point the face looks out from. */
function wireframeHead(centre: Point, yaw: number) {
  const [cx, cy] = centre;
  const [rx, ry] = [34, 44];
  const neck = cy + ry - 4;
  const bust = [
    `M${cx - 62} ${neck + 52}C${cx - 58} ${neck + 26} ${cx - 34} ${neck + 18} ${cx - 13} ${neck + 14}V${neck}`,
    `M${cx + 62} ${neck + 52}C${cx + 58} ${neck + 26} ${cx + 34} ${neck + 18} ${cx + 13} ${neck + 14}V${neck}`,
  ];
  const meridians = [-60, -30, 0, 30, 60].flatMap((degrees) => {
    const longitude = (degrees * Math.PI) / 180 + yaw;
    if (Math.cos(longitude) <= 0) return [];
    const width = Math.abs(rx * Math.sin(longitude));
    const sweep = Math.sin(longitude) > 0 ? 1 : 0;
    return [
      width < 0.5
        ? `M${cx} ${cy - ry}V${cy + ry}`
        : `M${cx} ${cy - ry}A${r1(width)} ${ry} 0 0 ${sweep} ${cx} ${cy + ry}`,
    ];
  });
  const parallels = [-0.55, 0, 0.55].map((latitude) => {
    const y = r1(cy - ry * Math.sin(latitude));
    const half = r1(rx * Math.cos(latitude));
    const depth = r1(ry * Math.cos(latitude) * 0.2);
    return `M${r1(cx - half)} ${y}A${half} ${depth} 0 0 0 ${r1(cx + half)} ${y}`;
  });
  const face: Point = [cx + rx * Math.sin(yaw), cy + 4];
  return { centre, rx, ry, paths: [...meridians, ...parallels], bust, face };
}

/* Conversational avatars: two wireframe heads turned towards each other,
   each over the waveform of its voice (the partner speaks, the avatar
   listens). The avatar's gaze to its partner and the rhythm of its nods
   are the accent. */
function TalkingHeads() {
  const random = seeded(31);
  const avatar = wireframeHead([84, 92], 0.7);
  const partner = wireframeHead([316, 92], -0.7);
  const axis = 260;
  const waveform = (cx: number, loudness: number) =>
    Array.from({ length: 17 }, (_, index) => {
      const x = cx - 48 + index * 6;
      const envelope = Math.sin(((index + 1) / 18) * Math.PI);
      return { x, height: 2 + envelope * loudness * (0.35 + random() * 0.65) };
    });
  const voices = [...waveform(84, 5), ...waveform(316, 20)];
  const nods = Array.from({ length: 9 }, (_, index): Point => {
    const x = 40 + index * 11;
    return [x, 24 + Math.sin(index * 1.1) * 5];
  });
  return (
    <>
      <g className={FAINT}>
        {[avatar, partner].flatMap(({ paths }) =>
          paths.map((d) => <path key={d} d={d} />),
        )}
        <line x1={24} y1={axis} x2={376} y2={axis} strokeDasharray="2 4" />
      </g>
      <g className={STRUCTURE}>
        {[avatar, partner].map(({ centre, rx, ry, bust }) => (
          <g key={`${centre}`}>
            <ellipse cx={centre[0]} cy={centre[1]} rx={rx} ry={ry} />
            {bust.map((d) => (
              <path key={d} d={d} />
            ))}
          </g>
        ))}
        {voices.map(({ x, height }) => (
          <line
            key={x}
            x1={x}
            y1={r1(axis - height)}
            x2={x}
            y2={r1(axis + height)}
          />
        ))}
      </g>
      <g className={ACCENT}>
        <line
          x1={r1(avatar.face[0])}
          y1={r1(avatar.face[1])}
          x2={r1(partner.face[0])}
          y2={r1(partner.face[1])}
          strokeDasharray="2 4"
        />
        <Node at={avatar.face} radius={2.5} filled />
        <circle
          cx={r1(partner.face[0])}
          cy={r1(partner.face[1])}
          r={7}
          strokeDasharray="2 2.5"
        />
        <polyline points={points(nods)} strokeOpacity={0.7} />
        {nods.map((nod) => (
          <Node key={`${nod}`} at={nod} radius={2} />
        ))}
      </g>
    </>
  );
}

/* Learning from demonstration: an arm over a bin of parts and a kitting
   tray. The demonstrations it learns from are faint dashed paths; its own
   path is the accent, with the point where a person corrected it (the
   dashed stub shows where it was heading). */
function RobotArm() {
  const random = seeded(17);
  const shoulder: Point = [40, 246];
  const elbow: Point = [60, 140];
  const wrist: Point = [112, 150];
  const grip: Point = [112, 200];
  const link = (a: Point, b: Point, width: number) => {
    const length = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const nx = ((a[1] - b[1]) / length) * (width / 2);
    const ny = ((b[0] - a[0]) / length) * (width / 2);
    return points([
      [a[0] + nx, a[1] + ny],
      [b[0] + nx, b[1] + ny],
      [b[0] - nx, b[1] - ny],
      [a[0] - nx, a[1] - ny],
    ]);
  };
  const parts = Array.from(
    { length: 8 },
    (): Point => [80 + random() * 62, 252 + random() * 12],
  );
  const columns = [301, 331, 361];
  const rows = [232, 252];
  const kitted: Point[] = [
    [301, 232],
    [331, 232],
    [301, 252],
  ];
  const target: Point = [361, 232];
  const demos = kitted.map(([x, y], index): string => {
    const from: Point = [96 + index * 16, 246];
    return `M${from[0]} ${from[1]}C${from[0] + 30} ${60 + index * 10} ${x - 40} ${64 + index * 12} ${x} ${y}`;
  });
  const correction: Point = [280, 84];
  return (
    <>
      <g className={FAINT}>
        {demos.map((d) => (
          <path key={d} d={d} strokeDasharray="2 3" />
        ))}
        <line x1={16} y1={274} x2={384} y2={274} />
      </g>
      <g className={STRUCTURE}>
        <rect x={22} y={260} width={36} height={14} rx={2} />
        <polygon points={link(shoulder, elbow, 14)} className="fill-sunken" />
        <polygon points={link(elbow, wrist, 11)} className="fill-sunken" />
        <polygon
          points={link([40, 260], shoulder, 18)}
          className="fill-sunken"
        />
        {[shoulder, elbow, wrist].map((joint) => (
          <circle
            key={`${joint}`}
            cx={joint[0]}
            cy={joint[1]}
            r={7}
            className="fill-sunken"
          />
        ))}
        <line x1={wrist[0]} y1={wrist[1] + 7} x2={grip[0]} y2={grip[1] - 14} />
        <polyline
          points={points([
            [grip[0] - 10, grip[1]],
            [grip[0] - 10, grip[1] - 14],
            [grip[0] + 10, grip[1] - 14],
            [grip[0] + 10, grip[1]],
          ])}
        />
        <path d="M72 232V270H150V232" />
        {parts.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={r1(x)} cy={r1(y)} r={3} />
        ))}
        <rect x={286} y={222} width={90} height={40} rx={1.5} />
        {columns.slice(1).map((x) => (
          <line key={x} x1={x - 15} y1={222} x2={x - 15} y2={262} />
        ))}
        <line x1={286} y1={rows[0] + 10} x2={376} y2={rows[0] + 10} />
        {kitted.map(([x, y]) => (
          <rect key={`${x}-${y}`} x={x - 4} y={y - 4} width={8} height={8} />
        ))}
      </g>
      <g className={ACCENT}>
        <path
          d={`M${grip[0]} ${grip[1] + 4}C126 96 236 52 ${correction[0]} ${correction[1]}`}
        />
        <path
          d={`M${correction[0]} ${correction[1]}L300 140`}
          strokeDasharray="2 3"
          strokeOpacity={0.6}
        />
        <path
          d={`M${correction[0]} ${correction[1]}C322 80 362 140 ${target[0]} ${target[1]}`}
        />
        <circle cx={correction[0]} cy={correction[1]} r={7} />
        <Node at={correction} radius={2.5} filled />
        <rect
          x={target[0] - 4}
          y={target[1] - 4}
          width={8}
          height={8}
          className="fill-sunken"
        />
      </g>
    </>
  );
}

/* Crash simulation: a car's side as a structured mesh driven into a rigid
   barrier. The crumple zone buckles in the accent; the dashed outline is
   where the undeformed front would have been. */
function CrashMesh() {
  const outline: Point[] = [
    [24, 214],
    [28, 196],
    [64, 188],
    [100, 184],
    [138, 148],
    [230, 146],
    [266, 180],
    [322, 188],
    [348, 200],
    [352, 216],
  ];
  const floor = 234;
  const roof = (x: number) => {
    for (let index = 1; index < outline.length; index++) {
      const [a, b] = [outline[index - 1], outline[index]];
      if (a && b && x <= b[0])
        return a[1] + ((b[1] - a[1]) * (x - a[0])) / (b[0] - a[0]);
    }
    return outline.at(-1)?.[1] ?? floor;
  };
  const crumple = 292;
  /* A point of the mesh at `x`, `fraction` of the way from roof to floor,
     after the impact: the front squashed to half its length and buckled. */
  const deform = (x: number, fraction: number): Point => {
    const y = roof(x) + (floor - roof(x)) * fraction;
    if (x <= crumple) return [x, y];
    const depth = (x - crumple) / 60;
    const wave = Math.sin(depth * Math.PI * 3);
    return [
      crumple + (x - crumple) * 0.5 + wave * 4 * (fraction - 0.5),
      y + wave * 5 * depth,
    ];
  };
  const columns = [
    ...Array.from({ length: 28 }, (_, index) => 24 + index * 12),
    352,
  ];
  const fractions = [0, 0.25, 0.5, 0.75, 1];
  const mesh = (xs: number[]) => [
    ...xs.map((x) => points(fractions.map((fraction) => deform(x, fraction)))),
    ...fractions.map((fraction) => points(xs.map((x) => deform(x, fraction)))),
  ];
  const body = mesh(columns.filter((x) => x <= crumple));
  const front = mesh(columns.filter((x) => x >= crumple));
  const ghost: Point[] = [
    [crumple, roof(crumple)],
    ...outline.filter(([x]) => x > crumple),
    [352, floor],
  ];
  return (
    <>
      <g className={FAINT}>
        <line x1={16} y1={254} x2={384} y2={254} />
        <polyline points={points(ghost)} strokeDasharray="2 3" />
        {[0, 1, 2, 3, 4, 5].map((index) => (
          <line
            key={index}
            x1={326}
            y1={164 + index * 16}
            x2={340}
            y2={150 + index * 16}
          />
        ))}
      </g>
      <g className={STRUCTURE}>
        {body.map((list) => (
          <polyline key={list} points={list} />
        ))}
        <rect x={326} y={150} width={14} height={104} />
        {[84, 258].map((x) => (
          <g key={x}>
            <circle cx={x} cy={238} r={16} className="fill-sunken" />
            <circle cx={x} cy={238} r={4} />
          </g>
        ))}
      </g>
      <g className={ACCENT}>
        {front.map((list) => (
          <polyline key={list} points={list} />
        ))}
      </g>
    </>
  );
}

/* Cell fate: time-lapse frames as ticks, cells tracked from left to right
   and one dividing on the way. Most stay the progenitors they were (the
   rings at the end); the accent track, called early (the dashed ring),
   ends as a neuron. */
function CellFate() {
  const random = seeded(59);
  const frames = Array.from({ length: 8 }, (_, index) => 40 + index * 44);
  const track = (start: number, from = 0) => {
    let y = start;
    return frames.slice(from).map((x, index): Point => {
      if (index) y = Math.min(272, Math.max(28, y + (random() - 0.5) * 12));
      return [x, y];
    });
  };
  const tracks = [44, 104, 160, 212].map((start) => track(start));
  const dividing = tracks[3] ?? [];
  const split = 4;
  /* The daughter leaves the mother at the division and drifts down. */
  const daughter = dividing.map(
    ([x, y], index): Point => [x, y + Math.max(0, index - split) * 10],
  );
  const fated = tracks[1] ?? [];
  const others = [...tracks.filter((list) => list !== fated), daughter];
  const called = 2;
  const end = (list: Point[]): Point => list.at(-1) ?? [0, 0];
  const neuron = end(fated);
  const dendrites: Point[][] = [
    [
      [0, 0],
      [10, -9],
      [20, -12],
    ],
    [
      [10, -9],
      [14, -20],
    ],
    [
      [0, 0],
      [12, 7],
      [22, 13],
    ],
    [
      [12, 7],
      [14, 18],
    ],
    [
      [0, 0],
      [-3, 14],
    ],
  ];
  return (
    <>
      <g className={FAINT}>
        {frames.map((x) => (
          <g key={x}>
            <line x1={x} y1={14} x2={x} y2={22} />
            <line x1={x} y1={278} x2={x} y2={286} />
          </g>
        ))}
      </g>
      <g className={STRUCTURE}>
        {others.map((list) => (
          <g key={`${list[0]}-${end(list)}`}>
            <polyline points={points(list)} />
            {list.map((at) => (
              <Node key={`${at}`} at={at} radius={2.5} />
            ))}
            <circle cx={r1(end(list)[0] + 14)} cy={r1(end(list)[1])} r={6} />
            <line
              x1={r1(end(list)[0] + 2.5)}
              y1={r1(end(list)[1])}
              x2={r1(end(list)[0] + 8)}
              y2={r1(end(list)[1])}
            />
          </g>
        ))}
        <polyline points={points(fated.slice(0, called + 1))} />
        {fated.slice(0, called).map((at) => (
          <Node key={`${at}`} at={at} radius={2.5} />
        ))}
      </g>
      <g className={ACCENT}>
        <polyline points={points(fated.slice(called))} />
        {fated.slice(called).map((at) => (
          <Node key={`${at}`} at={at} radius={2.5} />
        ))}
        {fated[called] ? (
          <circle
            cx={r1(fated[called][0])}
            cy={r1(fated[called][1])}
            r={8}
            strokeDasharray="2 2.5"
          />
        ) : null}
        <g transform={`translate(${r1(neuron[0] + 14)} ${r1(neuron[1])})`}>
          <line x1={-11.5} y1={0} x2={-4} y2={0} />
          {dendrites.map((branch) => (
            <polyline key={`${branch}`} points={points(branch)} />
          ))}
          <circle r={4} className="fill-current" />
        </g>
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
 * - `belief-drift`: sycophancy, alignment, bias, calibration
 * - `decision-tree`: agents, planning, tool use, reinforcement learning
 * - `nested-clusters`: embeddings, representation learning, clustering
 * - `long-timeline`: video, time series, long context
 * - `splat-graph`: 3D and 4D reconstruction, scene understanding
 * - `phase-diagram`: materials, chemistry, structured prediction
 * - `magnet-circuit`: physics simulation, numerical solvers, emulators
 * - `talking-heads`: avatars, faces, human motion, dialogue
 * - `robot-arm`: robot learning, manipulation, imitation
 * - `crash-mesh`: structural and crash simulation, mesh-based learning
 * - `cell-fate`: cell tracking, microscopy, fate and lineage
 */
const motifs: Record<ResearchMotif, () => ReactNode> = {
  "camera-frustum": CameraFrustum,
  "belief-drift": BeliefDrift,
  "decision-tree": DecisionTree,
  "nested-clusters": NestedClusters,
  "long-timeline": LongTimeline,
  "splat-graph": SplatGraph,
  "phase-diagram": PhaseDiagram,
  "magnet-circuit": MagnetCircuit,
  "talking-heads": TalkingHeads,
  "robot-arm": RobotArm,
  "crash-mesh": CrashMesh,
  "cell-fate": CellFate,
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
