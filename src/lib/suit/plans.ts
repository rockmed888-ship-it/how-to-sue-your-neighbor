export const STATES: { code: string; name: string }[] = [
  { code: "AL", name: "Alabama" },
  { code: "AK", name: "Alaska" },
  { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" },
  { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" },
  { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" },
  { code: "DC", name: "District of Columbia" },
  { code: "FL", name: "Florida" },
  { code: "GA", name: "Georgia" },
  { code: "HI", name: "Hawaii" },
  { code: "ID", name: "Idaho" },
  { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" },
  { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" },
  { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" },
  { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" },
  { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" },
  { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" },
  { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" },
  { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" },
  { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" },
  { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" },
  { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" },
  { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" },
  { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" },
  { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" },
  { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" },
  { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" },
  { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" },
  { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" },
  { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

export const PLANS = {
  letter_exam: {
    id: "letter_exam" as const,
    price: 19,
    cadence: "one-time",
    title: "Payment #1: Command Letter & Examination",
    detail: "One-time payment for your Pre-Suit Command Letter and Who/What/Why Situation Examination.",
  },
  once: {
    id: "once" as const,
    price: 45,
    cadence: "one-time",
    title: "Payment #2: Official Court Files & Suing Guide",
    detail: "One-time payment for your Free Official Court Forms Finder, Filing Deadlines, Good vs. Bad Suing Process Guide & Email Literature.",
  },
};

export const LETTER = {
  id: "letter" as const,
  price: 19,
  cadence: "one-time",
  title: "Pre-suit Command Letter & Examination",
  detail: "One-time payment for your formal Command Letter and situation examination. No monthly subscription.",
};

export type PlanId = keyof typeof PLANS;

const STORAGE_KEY = "neighbor-suit-unlock";

type Stored = { monthly: boolean; once: string[]; letters: string[] };

function empty(): Stored {
  return { monthly: false, once: [], letters: [] };
}

export function matterKey(story: string, state: string, place: string): string {
  return `${state}|${place}|${story}`.toLowerCase().replace(/\s+/g, " ").slice(0, 420);
}

export function readUnlock(): Stored {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as Partial<Stored>;
    return {
      monthly: Boolean(parsed.monthly),
      once: Array.isArray(parsed.once) ? parsed.once.filter((item) => typeof item === "string") : [],
      letters: Array.isArray(parsed.letters)
        ? parsed.letters.filter((item) => typeof item === "string")
        : [],
    };
  } catch {
    return empty();
  }
}

export function hasUnlock(story: string, state: string, place: string): boolean {
  const stored = readUnlock();
  if (stored.monthly) return true;
  return stored.once.includes(matterKey(story, state, place));
}

export function saveUnlock(plan: PlanId, story: string, state: string, place: string): Stored {
  const stored = readUnlock();
  const key = matterKey(story, state, place);
  if (plan === "letter_exam") {
    if (!stored.letters.includes(key)) stored.letters.push(key);
  } else {
    if (!stored.once.includes(key)) stored.once.push(key);
  }
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return stored;
}

export function hasLetter(story: string, state: string, place: string): boolean {
  if (hasUnlock(story, state, place)) return true;
  return readUnlock().letters.includes(matterKey(story, state, place));
}

export function saveLetter(story: string, state: string, place: string): Stored {
  const stored = readUnlock();
  const key = matterKey(story, state, place);
  if (!stored.letters.includes(key)) stored.letters.push(key);
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
  return stored;
}

export function clearUnlock(): void {
  window.localStorage.removeItem(STORAGE_KEY);
}
