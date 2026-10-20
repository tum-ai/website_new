import { createHmac } from "node:crypto";
import { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";
import { POST } from "./route";

const revalidateTag = vi.hoisted(() => vi.fn());
vi.mock("next/cache", () => ({ revalidateTag }));

const secret = "test-secret";

/** A header as Sanity signs a webhook: `t=<ms>,v1=<base64url HMAC-SHA256>`. */
function sign(body: string, key = secret, timestamp = Date.now()) {
  const digest = createHmac("sha256", key)
    .update(`${timestamp}.${body}`)
    .digest("base64url");
  return `t=${timestamp},v1=${digest}`;
}

function webhook(body: string, signature?: string) {
  return new NextRequest("https://tum-ai.com/api/revalidate", {
    method: "POST",
    body,
    headers: signature ? { "sanity-webhook-signature": signature } : {},
  });
}

beforeEach(() => {
  vi.stubEnv("SANITY_REVALIDATE_SECRET", secret);
  // parseBody waits 3 s for the API CDN after a valid signature.
  vi.spyOn(globalThis, "setTimeout").mockImplementation(((
    callback: () => void,
  ) => {
    callback();
    return 0;
  }) as typeof setTimeout);
  vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.restoreAllMocks();
  revalidateTag.mockClear();
});

describe("POST /api/revalidate", () => {
  test("a signed content change expires its content tag", async () => {
    const body = JSON.stringify({ _type: "homeCopy" });
    const response = await POST(webhook(body, sign(body)));
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toStrictEqual({
      revalidated: true,
      tags: ["content:homeCopy"],
    });
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("content:homeCopy", {
      expire: 0,
    });
  });

  test("a signed live change expires the live getters' tags", async () => {
    const body = JSON.stringify({ _type: "event" });
    const response = await POST(webhook(body, sign(body)));
    expect(response.status).toBe(200);
    expect(revalidateTag).toHaveBeenCalledExactlyOnceWith("events", {
      expire: 0,
    });
  });

  test("a wrong signature is 401 and expires nothing", async () => {
    const body = JSON.stringify({ _type: "homeCopy" });
    const response = await POST(webhook(body, sign(body, "another-secret")));
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  test("a tampered body is 401", async () => {
    const signed = JSON.stringify({ _type: "homeCopy" });
    const response = await POST(
      webhook(JSON.stringify({ _type: "siteSettings" }), sign(signed)),
    );
    expect(response.status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  test("a missing or malformed signature is 401", async () => {
    const body = JSON.stringify({ _type: "homeCopy" });
    expect((await POST(webhook(body))).status).toBe(401);
    expect((await POST(webhook(body, "not-a-signature"))).status).toBe(401);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  test("without the secret on the deployment it is 503", async () => {
    vi.stubEnv("SANITY_REVALIDATE_SECRET", "");
    const body = JSON.stringify({ _type: "homeCopy" });
    const response = await POST(webhook(body, sign(body)));
    expect(response.status).toBe(503);
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  test("a signed body without a type is 400", async () => {
    const body = JSON.stringify({ _id: "homeCopy" });
    expect((await POST(webhook(body, sign(body)))).status).toBe(400);
    const broken = "{not json";
    expect((await POST(webhook(broken, sign(broken)))).status).toBe(400);
    expect(revalidateTag).not.toHaveBeenCalled();
  });
});
