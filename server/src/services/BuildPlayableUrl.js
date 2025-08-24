// --- add to top (near imports), or just above getLatestStateAndBroadcast ---
// Build a playable URL from either a full url or a storage key (filename).

export function buildPlayableUrl(input) {
  if (!input) return "";

  // 1) already absolute? just return
  if (/^https?:\/\//i.test(input)) return input;

  // 2) normalize object key (filename) with single encoding per segment

  const key = String(input)
    .replace(/^\/+/, "")
    .split("/")
    .map((seg) => encodeURIComponent(decodeURIComponent(seg)))
    .join("/");

  // 3) dev: serve from local uploads (do not hardcode 'localhost' in code)
  if (process.env.NODE_ENV !== "production") {
    const prefix = (
      process.env.MEDIA_DEV_PREFIX || "http://localhost:3001/uploads"
    ).replace(/\/+$/, "");

    return `${prefix}/${key}`;
  }

  // 4) prod: serve via Supabase public object URL
  const bucket = process.env.SUPABASE_BUCKET || "songs";
  // prefer explicit host; otherwise derive from SUPABASE_URL

  const host =
    (process.env.SUPABASE_HOST || "").replace(/\/+$/, "") ||
    (process.env.SUPABASE_URL ? new URL(process.env.SUPABASE_URL).host : "");

  return host
    ? `https://${host}/storage/v1/object/public/${bucket}/${key}`
    : "";
}
