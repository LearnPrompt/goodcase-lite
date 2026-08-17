export type BoundedJsonResult =
  | { ok: true; value: Record<string, unknown> }
  | { ok: false; status: 400 | 413; error: "invalid json body" | "payload too large" };

const textEncoder = new TextEncoder();

export async function readBoundedJsonObject(
  request: Request,
  maxBytes: number
): Promise<BoundedJsonResult> {
  const contentLength = Number(request.headers.get("content-length") || "0");
  if (Number.isFinite(contentLength) && contentLength > maxBytes) {
    return { ok: false, status: 413, error: "payload too large" };
  }

  let text: string;
  try {
    text = await request.text();
  } catch {
    return { ok: false, status: 400, error: "invalid json body" };
  }

  if (textEncoder.encode(text).byteLength > maxBytes) {
    return { ok: false, status: 413, error: "payload too large" };
  }

  try {
    const value = JSON.parse(text) as unknown;
    if (!value || typeof value !== "object" || Array.isArray(value)) {
      return { ok: false, status: 400, error: "invalid json body" };
    }
    return { ok: true, value: value as Record<string, unknown> };
  } catch {
    return { ok: false, status: 400, error: "invalid json body" };
  }
}
