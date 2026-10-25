export type Theory = {
  name: string;
  plain: string;
  reaches: string;
};

export type Statute = {
  citation: string;
  heading: string;
  text: string;
  sourceUrl: string;
};

export type PublicCase = {
  caption: string;
  court: string;
  year: string;
  citation: string;
  summary: string;
  sourceUrl: string;
  sameState: boolean;
};

export type Paper = {
  name: string;
  purpose: string;
  sourceUrl: string | null;
};

export type Step = {
  title: string;
  detail: string;
};

export type Briefing = {
  givesAdvice: false;
  claimTitle: string;
  plainTitle: string;
  terminology: string;
  theories: Theory[];
  statutes: Statute[];
  cases: PublicCase[];
  forumLine: string;
  forumDetail: string;
  forumSourceUrl: string | null;
  papers: Paper[];
  steps: Step[];
  note: string | null;
};

export type BriefingResponse =
  | { ok: true; briefing: Briefing }
  | { ok: false; error: string };

export const NOTICE_TITLE = "Not legal advice";

export const NOTICE = [
  "This desk is not a lawyer, not a law firm, and not your lawyer. Nothing here is legal advice. Using it does not create an attorney-client relationship. What you type is not confidential and not privileged.",
  "Laws, court rules, forms, fees, and deadlines differ by state and county and change. A statute, a form name, a step, or a case on this page can be incomplete, outdated, or wrong.",
  "Published opinions are other people's cases. They are not your case and not a prediction of what a court will do to you.",
  "You are responsible for what you file, serve, and say in court. Before you rely on this desk or pay a filing fee, check the current code, the clerk's written instructions, and a lawyer licensed in your state.",
  "The people who operate this desk are not liable for your use of it, including a missed deadline, a court fee, a ruling, or any other loss. There is no warranty that any information is accurate, complete, or fit for your situation.",
];

export const DISCLAIMER = NOTICE.join(" ");
