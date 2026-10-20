/** Read-only checks invoke the same getters and parsers used by rendered pages. */
export type ReadinessCheck = { label: string; read: () => Promise<unknown> };
export type ReadinessResult = {
  label: string;
  ready: boolean;
  detail?: string;
};
export async function checkReadiness(
  checks: readonly ReadinessCheck[],
): Promise<ReadinessResult[]> {
  const results: ReadinessResult[] = [];
  for (const { label, read } of checks) {
    try {
      await read();
      results.push({ label, ready: true });
    } catch (error) {
      results.push({
        label,
        ready: false,
        detail: error instanceof Error ? error.message : String(error),
      });
    }
  }
  return results;
}
