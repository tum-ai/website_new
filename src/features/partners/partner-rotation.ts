/** Pure scheduler: callers commit one completed replacement before requesting another. */
export interface PartnerRotation {
  visible: string[];
  appearances: Record<string, number>;
  lastSlot: Record<string, number>;
  slots: number[];
  previousSlot: number;
}

export function createPartnerRotation(
  keys: string[],
  capacity = 3,
): PartnerRotation {
  const unique = [...new Set(keys)];
  const visible = unique.slice(0, Math.max(0, capacity));
  return {
    visible,
    appearances: Object.fromEntries(
      unique.map((key) => [key, Number(visible.includes(key))]),
    ),
    lastSlot: Object.fromEntries(visible.map((key, slot) => [key, slot])),
    slots: [],
    previousSlot: -1,
  };
}

export function nextPartnerRotation(
  state: PartnerRotation,
  random = Math.random,
  reserved: readonly string[] = [],
  blockedSlots: readonly number[] = [],
) {
  const hidden = Object.keys(state.appearances).filter(
    (key) => !state.visible.includes(key) && !reserved.includes(key),
  );
  if (!hidden.length || !state.visible.length) return null;
  const slots = [...state.slots];
  if (!slots.length) {
    slots.push(...state.visible.map((_, index) => index));
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    if (slots.length > 1 && slots[0] === state.previousSlot)
      [slots[0], slots[1]] = [slots[1], slots[0]];
  }
  const nextIndex = slots.findIndex((slot) => !blockedSlots.includes(slot));
  if (nextIndex < 0) return null;
  const [slot] = slots.splice(nextIndex, 1);
  const minimum = Math.min(...hidden.map((key) => state.appearances[key]));
  const eligible = hidden.filter((key) => state.appearances[key] === minimum);
  const differentSlots = eligible.filter((key) => state.lastSlot[key] !== slot);
  const candidates = differentSlots.length ? differentSlots : eligible;
  const incoming = candidates[Math.floor(random() * candidates.length)];
  const outgoing = state.visible[slot];
  const visible = [...state.visible];
  visible[slot] = incoming;
  return {
    slot,
    incoming,
    outgoing,
    state: {
      visible,
      appearances: {
        ...state.appearances,
        [incoming]: state.appearances[incoming] + 1,
      },
      lastSlot: { ...state.lastSlot, [incoming]: slot },
      slots,
      previousSlot: slot,
    } satisfies PartnerRotation,
  };
}

/** Reserve the whole starting wall until a batch finishes dissolving. */
export function nextPartnerBatch(
  state: PartnerRotation,
  count: number,
  random = Math.random,
) {
  let current = state;
  const changes: {
    slot: number;
    incoming: string;
    outgoing: string;
    delay: number;
  }[] = [];
  for (let index = 0; index < count; index++) {
    const next = nextPartnerRotation(
      current,
      random,
      state.visible,
      changes.map((change) => change.slot),
    );
    if (!next) break;
    changes.push({
      slot: next.slot,
      incoming: next.incoming,
      outgoing: next.outgoing,
      delay: index * 90,
    });
    current = next.state;
  }
  return changes.length ? { state: current, changes } : null;
}
