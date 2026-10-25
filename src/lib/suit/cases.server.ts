import { STATES } from "@/lib/suit/plans";
import type { PublicCase } from "@/lib/suit/types";

const STOP = new Set([
  "want",
  "sue",
  "suing",
  "sued",
  "neighbor",
  "neighbour",
  "because",
  "their",
  "them",
  "that",
  "this",
  "with",
  "from",
  "have",
  "they",
  "were",
  "been",
  "into",
  "over",
  "about",
  "would",
  "could",
  "should",
  "there",
  "where",
  "when",
  "what",
  "your",
  "yours",
  "mine",
  "down",
  "tore",
  "torn",
  "will",
  "wont",
  "not",
  "pay",
  "paid",
  "someone",
  "person",
  "people",
  "after",
  "before",
  "them",
  "just",
  "like",
  "does",
  "didnt",
  "didn't",
]);

function stateName(code: string): string {
  return STATES.find((item) => item.code === code)?.name ?? code;
}

function inState(court: string, name: string): boolean {
  if (name === "District of Columbia") {
    return /\b(d\.c\.|district of columbia)\b/i.test(court);
  }
  if (name === "Virginia") {
    return /\bvirginia\b/i.test(court) && !/west virginia/i.test(court);
  }
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`\\b${escaped}\\b`, "i").test(court);
}

function keywords(story: string): string {
  const text = story.toLowerCase();
  const extras: string[] = [];
  if (/fence|gate|wall|tree|driveway|yard|boundary|shed/.test(text)) {
    extras.push("trespass", "property damage", "fence");
  }
  if (/fall|fell|slip|wet floor|store|walmart|grocery|market/.test(text)) {
    extras.push("premises liability", "slip and fall");
  }
  if (/deposit|landlord|lease|tenant|rent/.test(text)) {
    extras.push("security deposit", "landlord");
  }
  if (/contract|contractor|refund|never (started|finished|did)|didn't do the work/.test(text)) {
    extras.push("breach of contract");
  }
  if (/dog|bit|bite/.test(text)) extras.push("dog bite");
  if (/car|vehicle|accident|wreck|rear/.test(text)) extras.push("negligence automobile");
  if (/noise|water|flood|smoke|smell|encroach/.test(text)) extras.push("nuisance");
  const words = text
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !STOP.has(word))
    .slice(0, 6);
  return [...extras, ...words].join(" ");
}

type Hit = {
  caseName?: string;
  court?: string;
  dateFiled?: string;
  citation?: string[] | string;
  syllabus?: string;
  absolute_url?: string;
};

export async function searchPublicCases(story: string, state: string): Promise<PublicCase[]> {
  const name = stateName(state);
  const q = `${name} ${keywords(story)}`.replace(/\s+/g, " ").trim().slice(0, 280);
  const url = `https://www.courtlistener.com/api/rest/v4/search/?type=o&order_by=score+desc&q=${encodeURIComponent(q)}`;
  let payload: { results?: Hit[] };
  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(20_000),
      headers: { Accept: "application/json", "User-Agent": "HowToSueNeighbor/1.0" },
    });
    if (!response.ok) return [];
    payload = (await response.json()) as { results?: Hit[] };
  } catch {
    return [];
  }

  const rows = Array.isArray(payload.results) ? payload.results : [];
  const mapped: PublicCase[] = [];
  for (const row of rows) {
    const caption = (row.caseName ?? "").trim();
    const court = (row.court ?? "").trim();
    const path = (row.absolute_url ?? "").trim();
    if (!caption || !court || !path) continue;
    const year = (row.dateFiled ?? "").slice(0, 4);
    const citation = Array.isArray(row.citation)
      ? row.citation.filter(Boolean).join(", ")
      : typeof row.citation === "string"
        ? row.citation
        : "";
    const summary = (row.syllabus ?? "").replace(/\s+/g, " ").trim();
    mapped.push({
      caption,
      court,
      year,
      citation,
      summary: summary || "Published opinion. The search report did not include a syllabus.",
      sourceUrl: path.startsWith("http") ? path : `https://www.courtlistener.com${path}`,
      sameState: inState(court, name),
    });
  }

  mapped.sort((a, b) => {
    if (a.sameState !== b.sameState) return a.sameState ? -1 : 1;
    const aRich = a.summary.startsWith("Published opinion") ? 1 : 0;
    const bRich = b.summary.startsWith("Published opinion") ? 1 : 0;
    return aRich - bRich;
  });

  const seen = new Set<string>();
  const unique: PublicCase[] = [];
  for (const item of mapped) {
    const key = item.caption.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    unique.push(item);
    if (unique.length >= 4) break;
  }
  return unique;
}
