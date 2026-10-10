import { pathToFileURL } from "node:url";
import { sanityApiVersion } from "../../src/lib/sanity-config";
import {
  assertHomeQuotesTarget,
  type HomeQuotesCompletion,
  type HomeQuotesTarget,
  PLAN_QUERY,
  type PlanInput,
  planHomeQuotes,
  type QuotesPatch,
  readHomeQuotesCompletion,
} from "./home-quotes-plan";

export type HomeQuotesClient = {
  read(): Promise<PlanInput>;
  /** Target mutation and durable receipt commit in one revision-guarded transaction. */
  convert(patch: QuotesPatch, completion: HomeQuotesCompletion): Promise<void>;
  /** Final handoff also preserves initially existing arrays and absent drafts after later edits. */
  finish(completion: HomeQuotesCompletion): Promise<void>;
};

/** Replan from raw CMS data, preserve editor values, and finalize only a successful migration. */
export async function applyHomeQuotes(
  target: HomeQuotesTarget,
  client: HomeQuotesClient,
): Promise<{ converted: number; failures: string[] }> {
  assertHomeQuotesTarget(target);
  const input = await client.read();
  const plan = planHomeQuotes(input, target, { draftVisibility: "verified" });
  const result = { converted: 0, failures: [...plan.blocked] };
  if (
    result.failures.length ||
    readHomeQuotesCompletion(input, target).complete
  )
    return result;
  for (const patch of plan.patches) {
    try {
      const current = await client.read();
      const completion = readHomeQuotesCompletion(current, target);
      if (completion.complete || completion.completed.includes(patch.id))
        continue;
      const latest = planHomeQuotes(current, target, {
        draftVisibility: "verified",
      });
      if (latest.blocked.length) throw new Error(latest.blocked.join("; "));
      const fresh = latest.patches.find(({ id }) => id === patch.id);
      if (!fresh) continue; // A newly editor-set array always wins.
      if (fresh.rev !== patch.rev)
        throw new Error("Revision changed; rerun the dry run");
      await client.convert(patch, {
        ...completion,
        completed: [...completion.completed, patch.id],
      });
      result.converted++;
    } catch (error) {
      result.failures.push(
        patch.id +
          ": " +
          (error instanceof Error ? error.message : String(error)),
      );
    }
  }
  if (!result.failures.length) {
    try {
      const current = await client.read();
      const completion = readHomeQuotesCompletion(current, target);
      const remaining = planHomeQuotes(current, target, {
        draftVisibility: "verified",
      });
      if (remaining.blocked.length || remaining.patches.length)
        throw new Error(
          "Home quote prerequisites changed; rerun the dry run before finalizing",
        );
      if (!completion.complete)
        await client.finish({ ...completion, complete: true });
    } catch (error) {
      result.failures.push(
        error instanceof Error ? error.message : String(error),
      );
    }
  }
  return result;
}

async function main() {
  const target = {
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID?.trim() ?? "",
    dataset: process.env.MIGRATE_DATASET ?? "",
  };
  assertHomeQuotesTarget(target);
  if (process.env.HOME_QUOTES_APPLY !== "1")
    throw new Error(
      "Run through sanity:migrate-home-quotes --dataset redesign --apply",
    );
  const { getCliClient } = await import("sanity/cli");
  const client = getCliClient({
    ...target,
    apiVersion: sanityApiVersion,
    useCdn: false,
    perspective: "raw",
  });
  const receipt = (completion: HomeQuotesCompletion) => {
    const { _rev, ...document } = completion;
    return { revision: _rev, document };
  };
  const result = await applyHomeQuotes(target, {
    read: () => client.fetch<PlanInput>(PLAN_QUERY),
    convert: async (patch, completion) => {
      const transaction = client.transaction().patch(patch.id, (update) =>
        update
          .ifRevisionId(patch.rev)
          .set({ "join.quotes": [patch.quote] })
          .unset(["join.quote"]),
      );
      const { revision, document } = receipt(completion);
      if (revision)
        transaction.patch(completion._id, (update) =>
          update
            .ifRevisionId(revision)
            .set({ completed: completion.completed }),
        );
      else transaction.create(document);
      await transaction.commit();
    },
    finish: async (completion) => {
      const transaction = client.transaction();
      const { revision, document } = receipt(completion);
      if (revision)
        transaction.patch(completion._id, (update) =>
          update.ifRevisionId(revision).set({ complete: true }),
        );
      else transaction.create(document);
      await transaction.commit();
    },
  });
  process.stdout.write(
    `Converted ${result.converted} homepage quote document(s).\n`,
  );
  if (result.failures.length) {
    process.stderr.write(
      result.failures.join("\n") +
        "\nRerun the dry run after resolving blockers.\n",
    );
    process.exitCode = 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href)
  await main();
