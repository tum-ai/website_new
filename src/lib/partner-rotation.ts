/** Pure scheduler: callers commit one completed replacement before requesting another. */
export interface PartnerRotation {
  visible: string[];
  appearances: Record<string, number>;
  lastSlot: Record<string, number>;
  slots: number[];
  previousSlot: number;
}

export function createPartnerRotation(keys: string[]): PartnerRotation {
  const unique = [...new Set(keys)];
  const visible = unique.slice(0, 3);
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
) {
  const hidden = Object.keys(state.appearances).filter(
    (key) => !state.visible.includes(key),
  );
  if (!hidden.length) return null;
  const slots = [...state.slots];
  if (!slots.length) {
    slots.push(...state.visible.map((_, index) => index));
    for (let i = slots.length - 1; i > 0; i--) {
      const j = Math.floor(random() * (i + 1));
      [slots[i], slots[j]] = [slots[j], slots[i]];
    }
    if (slots[0] === state.previousSlot)
      [slots[0], slots[1]] = [slots[1], slots[0]];
  }
  const slot = slots.shift() as number;
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
