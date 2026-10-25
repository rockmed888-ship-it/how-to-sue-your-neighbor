import { searchPublicCases } from "@/lib/suit/cases.server";
import { STATES } from "@/lib/suit/plans";
import type { Briefing, BriefingResponse, Paper, Statute, Step, Theory } from "@/lib/suit/types";

const WINDOW_MS = 10 * 60 * 1000;
const MAX_PER_WINDOW = 8;
const CACHE_TTL_MS = 6 * 60 * 60 * 1000;

const hits = new Map<string, number[]>();
const cache = new Map<string, { at: number; value: Briefing }>();

const TRUSTED = [
  "justia.com",
  "law.cornell.edu",
  "cornell.edu",
  "findlaw.com",
  "openlegalcodes.org",
  "public.law",
  "courtlistener.com",
  "uscourts.gov",
];

const SLIP =
  /\b(you (can|should|may|must|cannot|can't|will win)|you have a (strong|good|winning) case|i (recommend|advise)|you ought)\b/i;

const SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: [
    "claimTitle",
    "plainTitle",
    "terminology",
    "theories",
    "statutes",
    "forumLine",
    "forumDetail",
    "forumSourceUrl",
    "papers",
    "steps",
  ],
  properties: {
    claimTitle: { type: "string" },
    plainTitle: { type: "string" },
    terminology: { type: "string" },
    theories: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "plain", "reaches"],
        properties: {
          name: { type: "string" },
          plain: { type: "string" },
          reaches: { type: "string" },
        },
      },
    },
    statutes: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["citation", "heading", "text", "sourceUrl"],
        properties: {
          citation: { type: "string" },
          heading: { type: "string" },
          text: { type: "string" },
          sourceUrl: { type: "string" },
        },
      },
    },
    forumLine: { type: "string" },
    forumDetail: { type: "string" },
    forumSourceUrl: { type: "string" },
    papers: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["name", "purpose", "sourceUrl"],
        properties: {
          name: { type: "string" },
          purpose: { type: "string" },
          sourceUrl: { type: "string" },
        },
      },
    },
    steps: {
      type: "array",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["title", "detail"],
        properties: {
          title: { type: "string" },
          detail: { type: "string" },
        },
      },
    },
  },
} as const;

function allowRate(ip: string): boolean {
  const now = Date.now();
  const prev = (hits.get(ip) ?? []).filter((stamp) => now - stamp < WINDOW_MS);
  if (prev.length >= MAX_PER_WINDOW) {
    hits.set(ip, prev);
    return false;
  }
  prev.push(now);
  hits.set(ip, prev);
  return true;
}

function trusted(raw: string): boolean {
  try {
    const url = new URL(raw);
    if (url.protocol !== "https:" && url.protocol !== "http:") return false;
    const host = url.hostname.toLowerCase();
    if (host.endsWith(".gov") || host.endsWith(".mil")) return true;
    if (/\.state\.[a-z]{2}\.us$/.test(host)) return true;
    return TRUSTED.some((domain) => host === domain || host.endsWith(`.${domain}`));
  } catch {
    return false;
  }
}

function scrub(line: string, fallback: string): string {
  const clean = line.replace(/\s+/g, " ").trim();
  if (!clean || SLIP.test(clean)) return fallback;
  return clean;
}

function clip(text: string): string {
  const clean = text.replace(/\r\n/g, "\n").trim();
  if (clean.length <= 7000) return clean;
  return `${clean.slice(0, 7000).trim()}\n\n[The section continues in the source.]`;
}

function stateName(code: string): string {
  return STATES.find((item) => item.code === code)?.name ?? "";
}

function lastJson(payload: unknown): Record<string, unknown> | null {
  if (!payload || typeof payload !== "object") return null;
  const output = (payload as { output?: unknown }).output;
  if (!Array.isArray(output)) return null;
  let parsed: Record<string, unknown> | null = null;
  for (const item of output) {
    if (!item || typeof item !== "object" || (item as { type?: string }).type !== "message") continue;
    const content = (item as { content?: unknown }).content;
    if (!Array.isArray(content)) continue;
    for (const block of content) {
      if (!block || typeof block !== "object" || (block as { type?: string }).type !== "output_text") {
        continue;
      }
      const text = (block as { text?: string }).text;
      if (!text) continue;
      try {
        const value = JSON.parse(text) as unknown;
        if (value && typeof value === "object" && !Array.isArray(value)) {
          parsed = value as Record<string, unknown>;
        }
      } catch {
        // Tool turns are not always JSON.
      }
    }
  }
  return parsed;
}

function asTheories(raw: unknown): Theory[] {
  if (!Array.isArray(raw)) return [];
  const out: Theory[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!name) continue;
    out.push({
      name,
      plain: scrub(typeof row.plain === "string" ? row.plain : "", "A name courts use for this kind of dispute."),
      reaches: scrub(
        typeof row.reaches === "string" ? row.reaches : "",
        "Money for the harm described, if a court agrees. Not a promise of any amount.",
      ),
    });
    if (out.length >= 3) break;
  }
  return out;
}

function asStatutes(raw: unknown): Statute[] {
  if (!Array.isArray(raw)) return [];
  const out: Statute[] = [];
  const seen = new Set<string>();
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const citation = typeof row.citation === "string" ? row.citation.trim() : "";
    const text = typeof row.text === "string" ? clip(row.text) : "";
    const sourceUrl = typeof row.sourceUrl === "string" ? row.sourceUrl.trim() : "";
    if (!citation || text.length < 40 || !trusted(sourceUrl)) continue;
    const key = citation.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      citation,
      heading: typeof row.heading === "string" && row.heading.trim() ? row.heading.trim() : "Section",
      text,
      sourceUrl,
    });
    if (out.length >= 4) break;
  }
  return out;
}

function asPapers(raw: unknown): Paper[] {
  if (!Array.isArray(raw)) return [];
  const out: Paper[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const name = typeof row.name === "string" ? row.name.trim() : "";
    if (!name) continue;
    const source = typeof row.sourceUrl === "string" ? row.sourceUrl.trim() : "";
    out.push({
      name,
      purpose: scrub(
        typeof row.purpose === "string" ? row.purpose : "",
        "A paper the court uses in this kind of filing. Confirm the current version with the clerk.",
      ),
      sourceUrl: source && trusted(source) ? source : null,
    });
    if (out.length >= 6) break;
  }
  return out;
}

function asSteps(raw: unknown): Step[] {
  if (!Array.isArray(raw)) return [];
  const out: Step[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const row = item as Record<string, unknown>;
    const title = typeof row.title === "string" ? scrub(row.title, "") : "";
    const detail = typeof row.detail === "string" ? scrub(row.detail, "") : "";
    if (!title || !detail) continue;
    out.push({ title, detail });
    if (out.length >= 8) break;
  }
  return out;
}

async function askBooks(story: string, state: string, place: string): Promise<Record<string, unknown> | null> {
  const apiKey = process.env.XAI_API_KEY;
  if (!apiKey) return null;
  const name = stateName(state);
  const response = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    signal: AbortSignal.timeout(85_000),
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "grok-4.5",
      temperature: 0.2,
      reasoning: { effort: "low" },
      max_output_tokens: 3800,
      max_tool_calls: 4,
      instructions: [
        "You prepare a public-information briefing for a civil filing desk titled How to Sue Your Neighbor.",
        "You are not a lawyer. Never say the person will win, should sue, has a strong case, or what a court will do to them.",
        "Name the civil claims the way a complaint names them. Quote the state code verbatim. Describe the usual court and the papers.",
        "Use at most 3 web searches. Prefer official court and legislature pages, Justia code pages, or Cornell LII.",
        "Do not invent a statute, a form number, a filing fee, or a dollar limit. If you did not open a page, leave that source empty.",
        "forumSourceUrl and statute sourceUrl must be real https links you opened, or an empty string.",
        "papers.sourceUrl is the official form or instructions page, or an empty string.",
        "steps are the order a person follows to file on their own in that state. If you are not sure of a service rule, say to follow the clerk's written instructions.",
        "terminology explains the proper name for this dispute in one short paragraph, as description, not advice.",
        "Do not include case captions. Another system supplies published opinions.",
      ].join(" "),
      input: `State: ${name} (${state})\nCity or county: ${place || "not given"}\nWhat happened:\n${story}`,
      tools: [{ type: "web_search" }],
      text: { format: { type: "json_schema", name: "suit_briefing", strict: true, schema: SCHEMA } },
    }),
  });
  if (!response.ok) return null;
  return lastJson(await response.json());
}

export async function buildBriefing(
  input: { story: string; state: string; place: string },
  ip: string,
): Promise<BriefingResponse> {
  const story = input.story.replace(/\s+/g, " ").trim();
  const state = input.state.toUpperCase();
  const place = input.place.replace(/\s+/g, " ").trim();
  if (story.length < 12) {
    return { ok: false, error: "Say what happened, in a sentence or two." };
  }
  if (story.length > 1500) {
    return { ok: false, error: "That is too long for one reading. Keep it to what happened and who did it." };
  }
  if (!STATES.some((item) => item.code === state)) {
    return { ok: false, error: "Pick the state. The court and the papers depend on it." };
  }

  const cacheKey = `${state}|${place.toLowerCase()}|${story.toLowerCase()}`;
  const cached = cache.get(cacheKey);
  if (cached && Date.now() - cached.at < CACHE_TTL_MS) {
    return { ok: true, briefing: cached.value };
  }

  if (!allowRate(ip || "unknown")) {
    return { ok: false, error: "The desk has opened as many files as it can for the moment. Try again shortly." };
  }

  let books: Record<string, unknown> | null = null;
  let cases: Briefing["cases"] = [];
  try {
    const [bookResult, caseResult] = await Promise.all([
      askBooks(story, state, place).catch(() => null),
      searchPublicCases(story, state).catch(() => []),
    ]);
    books = bookResult;
    cases = caseResult;
  } catch {
    return { ok: false, error: "The books could not be opened just now. Try again." };
  }

  if (!books && cases.length === 0) {
    return { ok: false, error: "The books could not be opened just now. Try again." };
  }

  const theories = asTheories(books?.theories);
  const statutes = asStatutes(books?.statutes);
  const papers = asPapers(books?.papers);
  const steps = asSteps(books?.steps);
  const forumSource = typeof books?.forumSourceUrl === "string" ? books.forumSourceUrl.trim() : "";
  const name = stateName(state);

  const briefing: Briefing = {
    givesAdvice: false,
    claimTitle: scrub(
      typeof books?.claimTitle === "string" ? books.claimTitle : "",
      "Civil claim",
    ),
    plainTitle: scrub(
      typeof books?.plainTitle === "string" ? books.plainTitle : "",
      `A civil filing over what you described in ${name}.`,
    ),
    terminology: scrub(
      typeof books?.terminology === "string" ? books.terminology : "",
      "Courts give this kind of dispute a claim name, then ask for a complaint, a filing fee, and proof of service.",
    ),
    theories,
    statutes,
    cases,
    forumLine: scrub(
      typeof books?.forumLine === "string" ? books.forumLine : "",
      `Where this is filed in ${name} depends on the amount and the county. The paper trail has the route.`,
    ),
    forumDetail: scrub(
      typeof books?.forumDetail === "string" ? books.forumDetail : "",
      `File where ${name} says this kind of civil case belongs — often the county where the other person lives or where it happened. Confirm the court and the current money limit with the clerk before you pay a fee.`,
    ),
    forumSourceUrl: forumSource && trusted(forumSource) ? forumSource : null,
    papers,
    steps,
    note:
      statutes.length === 0
        ? "A quotable code section did not come back. Do not rely on a section number you have not opened yourself."
        : null,
  };

  if (theories.length || statutes.length || cases.length) {
    cache.set(cacheKey, { at: Date.now(), value: briefing });
    if (cache.size > 60) {
      const oldest = cache.keys().next().value;
      if (oldest) cache.delete(oldest);
    }
  }

  return { ok: true, briefing };
}
