import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  Check,
  ExternalLink,
  FileText,
  Lock,
  MapPin,
  Printer,
  Scale,
} from "lucide-react";
import { PresuitLetter } from "@/components/presuit-letter";
import { CartButton } from "@/components/cart-button";
import { openBriefing } from "@/lib/suit/open-briefing";
import { PLANS, STATES, clearUnlock, hasUnlock, saveUnlock, type PlanId } from "@/lib/suit/plans";
import { NOTICE, NOTICE_TITLE, type Briefing, type BriefingResponse } from "@/lib/suit/types";
import { HAPPENED, REASONS } from "@/lib/suit/reasons";

const EXAMPLES = [
  {
    label: "The fence",
    story: "My neighbor tore my fence down and hauled the boards away. They will not pay to rebuild it.",
    state: "AL",
    place: "Birmingham",
  },
  {
    label: "The store",
    story: "I fell at Walmart. The floor was wet and there was no wet floor sign. I was hurt.",
    state: "TX",
    place: "Houston",
  },
  {
    label: "The deposit",
    story: "My landlord kept my security deposit and will not say what it was kept for.",
    state: "OH",
    place: "Columbus",
  },
  {
    label: "The contractor",
    story: "I paid a contractor a deposit to redo the kitchen. They never started the work.",
    state: "AZ",
    place: "Phoenix",
  },
];

function LegalNotice() {
  return (
    <section className="rounded-2xl bg-oxblood-soft px-4 py-4 sm:px-5">
      <h2 className="font-display text-xl text-ink">{NOTICE_TITLE}</h2>
      <div className="mt-2 grid gap-2">
        {NOTICE.map((line) => (
          <p key={line} className="text-sm leading-relaxed text-pretty text-ink">
            {line}
          </p>
        ))}
      </div>
    </section>
  );
}

const WORKSHEET = [
  "Your full legal name and an address where the court can reach you.",
  "The other side's legal name — a person, or the company name on the store — and an address where papers can be delivered.",
  "The date, the city, and what happened, in a few plain sentences.",
  "What you want paid: a repair estimate, medical bills, or the deposit. You write the number. The desk does not pick it.",
  "Photos, messages, receipts, and the names of people who saw it.",
];

export function SueDesk() {
  const [story, setStory] = useState(EXAMPLES[0].story);
  const [state, setState] = useState(EXAMPLES[0].state);
  const [place, setPlace] = useState(EXAMPLES[0].place);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<Briefing | null>(null);
  const [asked, setAsked] = useState<{ story: string; state: string; place: string } | null>(null);
  const [open, setOpen] = useState(false);
  const [plan, setPlan] = useState<PlanId>("once");
  const [accepted, setAccepted] = useState(false);
  const [epoch, setEpoch] = useState(0);

  useEffect(() => {
    if (!asked) return;
    setOpen(hasUnlock(asked.story, asked.state, asked.place));
  }, [asked]);

  const stateName = useMemo(
    () => STATES.find((item) => item.code === state)?.name ?? "",
    [state],
  );

  async function onRead() {
    setPending(true);
    setError(null);
    setResult(null);
    try {
      const response: BriefingResponse = await openBriefing({ data: { story, state, place } });
      if (!response.ok) {
        setError(response.error);
        return;
      }
      setAsked({ story, state, place });
      setResult(response.briefing);
      setOpen(hasUnlock(story, state, place));
    } catch {
      setError("The books could not be opened just now. Try again.");
    } finally {
      setPending(false);
    }
  }

  function choose(next: PlanId) {
    if (!asked) return;
    saveUnlock(next, asked.story, asked.state, asked.place);
    setPlan(next);
    setOpen(true);
    setEpoch((value) => value + 1);
  }

  return (
    <main className="min-h-screen bg-paper text-ink">
      <header className="no-print mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-5 sm:px-6">
        <p className="font-display text-sm tracking-wide text-ink">How to Sue Your Neighbor</p>
        <div className="flex items-center gap-3">
          <p className="text-sm font-semibold text-oxblood">Not legal advice</p>
          <CartButton />
        </div>
      </header>

      <div className="no-print mx-auto max-w-5xl px-4 pb-6 sm:px-6">
        <LegalNotice />
      </div>

      <section className="no-print mx-auto grid max-w-5xl gap-8 px-4 pb-8 sm:px-6 lg:grid-cols-12 lg:gap-10">
        <div className="lg:col-span-7">
          <p className="text-sm font-semibold tracking-wide text-oxblood">Civil filing desk</p>
          <h1 className="mt-2 font-display text-5xl leading-none text-balance text-ink sm:text-6xl">
            How to Sue
            <span className="block italic text-oxblood">Your Neighbor</span>
          </h1>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-pretty text-ink">
            Send a letter before you file. If they pay, it can end. If they refuse, you kept the letter.
          </p>
        </div>

        <form
          className="shadow-border rounded-card bg-sheet p-4 sm:p-5 lg:col-span-5"
          onSubmit={(event) => {
            event.preventDefault();
            void onRead();
          }}
        >
          <label className="block text-sm font-semibold" htmlFor="story">
            What happened
          </label>
          <textarea
            id="story"
            value={story}
            onChange={(event) => setStory(event.target.value)}
            rows={5}
            required
            className="mt-2 w-full resize-y rounded-xl border border-line bg-paper px-3 py-3 text-base leading-relaxed text-ink outline-none focus:border-oxblood"
          />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-semibold" htmlFor="state">
                State
              </label>
              <select
                id="state"
                value={state}
                onChange={(event) => setState(event.target.value)}
                required
                className="mt-2 h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink outline-none focus:border-oxblood"
              >
                <option value="">Choose</option>
                {STATES.map((item) => (
                  <option key={item.code} value={item.code}>
                    {item.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold" htmlFor="place">
                City or county
              </label>
              <input
                id="place"
                value={place}
                onChange={(event) => setPlace(event.target.value)}
                placeholder="Birmingham"
                className="mt-2 h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink outline-none focus:border-oxblood"
              />
            </div>
          </div>
          <label className="mt-3 flex items-start gap-3 text-sm leading-relaxed text-ink" htmlFor="accept">
            <input
              id="accept"
              type="checkbox"
              required
              checked={accepted}
              onChange={(event) => setAccepted(event.target.checked)}
              className="mt-1 size-5 shrink-0 accent-oxblood"
            />
            <span>
              I understand this is not legal advice, that no attorney-client relationship is formed,
              and that I must verify it myself before I file.
            </span>
          </label>
          <button
            type="submit"
            disabled={pending || story.trim().length < 12 || !state || !accepted}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-oxblood px-4 text-base font-semibold text-oxblood-ink disabled:opacity-50"
          >
            {pending ? "Reading the books…" : "Read the books"}
          </button>
          <ul className="mt-3 flex flex-wrap gap-2">
            {EXAMPLES.map((example) => (
              <li key={example.label}>
                <button
                  type="button"
                  className="h-10 rounded-full bg-chip px-3 text-sm font-semibold text-ink"
                  onClick={() => {
                    setStory(example.story);
                    setState(example.state);
                    setPlace(example.place);
                  }}
                >
                  {example.label}
                </button>
              </li>
            ))}
          </ul>
        </form>
      </section>

      <section className="no-print mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <h2 className="font-display text-3xl text-balance text-ink">Has this happened to you?</h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-pretty text-ink">
          A line crossed. A deposit that never came back. The mess from next door. In each
          published opinion below, the person who filed won, and an appeals court left that
          judgment standing. The desk can name the claim, the papers, and where to file.
          Someone else’s result is not yours.
        </p>
        <ul className="mt-5 grid gap-4 lg:grid-cols-3">
          {HAPPENED.map((item) => (
            <li key={item.caption} className="shadow-border flex flex-col rounded-2xl bg-sheet p-4">
              <p className="text-sm font-semibold text-oxblood">Plaintiff judgment stood</p>
              <h3 className="mt-1 font-display text-2xl text-balance text-ink">{item.situation}</h3>
              <p className="mt-2 text-base leading-relaxed text-pretty text-ink">{item.result}</p>
              <p className="mt-3 text-sm text-muted">
                {item.caption} · {item.court} · {item.year}
              </p>
              <a
                className="mt-1 inline-flex h-11 items-center gap-1 text-sm font-semibold text-oxblood"
                href={item.href}
                target="_blank"
                rel="noreferrer"
              >
                Read the opinion
                <ExternalLink className="size-4" aria-hidden="true" />
              </a>
              <button
                type="button"
                className="mt-auto h-11 rounded-xl bg-oxblood px-4 text-sm font-semibold text-oxblood-ink"
                onClick={() => {
                  setStory(item.story);
                  setState(item.state);
                  setPlace(item.place);
                  document.getElementById("story")?.scrollIntoView({ block: "center" });
                }}
              >
                Start from this
              </button>
            </li>
          ))}
        </ul>
      </section>

      <PresuitLetter
        story={story}
        stateCode={state}
        place={place}
        claim={
          asked && asked.story === story && asked.state === state && result ? result.claimTitle : ""
        }
        epoch={epoch}
        onStory={setStory}
        onSteps={() => {
          setPlan("once");
          const trail = document.getElementById("packet");
          (trail ?? document.getElementById("story"))?.scrollIntoView({ block: "center" });
        }}
      />

      <section className="no-print mx-auto max-w-5xl px-4 pb-12 sm:px-6">
        <h2 className="font-display text-3xl text-ink">Common reasons for a lawsuit</h2>
        <p className="mt-2 max-w-2xl text-base leading-relaxed text-muted">
          What the claim is called, and published cases other people already filed. Another state's
          opinion is not your rule, and it is not a forecast. Read the opinion before you treat it
          as similar.
        </p>
        <ul className="mt-5 grid gap-4">
          {REASONS.map((reason) => (
            <li key={reason.title} className="shadow-border rounded-2xl bg-sheet p-4 sm:p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="max-w-2xl">
                  <h3 className="font-display text-2xl text-balance text-ink">{reason.title}</h3>
                  <p className="mt-1 text-sm font-semibold text-oxblood">{reason.claim}</p>
                  <p className="mt-2 text-base leading-relaxed text-pretty text-ink">{reason.about}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setStory(reason.story)}
                  className="h-11 shrink-0 rounded-xl border border-line bg-paper px-4 text-sm font-semibold text-ink"
                >
                  Use this reason
                </button>
              </div>
              <ul className="mt-4 grid gap-3 sm:grid-cols-2">
                {reason.cases.map((item) => (
                  <li key={item.href} className="rounded-xl bg-paper p-3">
                    <p className="font-display text-lg leading-snug text-ink">{item.caption}</p>
                    <p className="mt-1 text-sm text-muted">
                      {item.court} · {item.year}
                    </p>
                    <p className="mt-2 text-sm leading-relaxed text-pretty text-ink">{item.line}</p>
                    <a
                      className="mt-2 inline-flex h-11 items-center gap-1 text-sm font-semibold text-oxblood"
                      href={item.href}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open the public record
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>
      </section>

      {error ? (
        <p className="no-print mx-auto mb-8 max-w-5xl rounded-2xl bg-oxblood-soft px-4 py-3 text-base text-ink sm:px-6" role="alert">
          {error}
        </p>
      ) : null}

      {pending ? (
        <p className="no-print mx-auto mb-10 max-w-5xl px-4 text-base text-muted sm:px-6" role="status">
          Opening the code and the public case reports for {stateName || "that state"}. This usually
          takes under a minute.
        </p>
      ) : null}

      {result && asked ? (
        <article className="mx-auto max-w-5xl px-4 pb-16 sm:px-6">
          <header className="border-t border-line pt-6">
            <p className="text-sm font-semibold tracking-wide text-oxblood">
              {asked.place ? `${asked.place}, ` : ""}
              {STATES.find((item) => item.code === asked.state)?.name}
            </p>
            <h2 className="mt-1 font-display text-4xl text-balance text-ink">{result.plainTitle}</h2>
            <p className="mt-3 max-w-3xl text-lg leading-relaxed text-pretty text-ink">{result.terminology}</p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-ink">
              This reading is general public information. It is not legal advice about your facts.
            </p>
          </header>

          <section className="mt-8">
            <div className="flex items-center gap-2">
              <Scale className="size-5 text-oxblood" aria-hidden="true" />
              <h3 className="font-display text-2xl">What this suit is called</h3>
            </div>
            <p className="mt-2 text-sm text-muted">
              Court names, not a recommendation to file. {result.claimTitle}.
            </p>
            <ul className="mt-4 grid gap-3">
              {result.theories.map((theory) => (
                <li key={theory.name} className="shadow-border rounded-2xl bg-sheet p-4">
                  <h4 className="font-display text-xl">{theory.name}</h4>
                  <p className="mt-1 text-base leading-relaxed text-ink">{theory.plain}</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{theory.reaches}</p>
                </li>
              ))}
            </ul>
            {result.theories.length === 0 ? (
              <p className="mt-3 text-base text-muted">The claim name did not come back. Try again with the state and what was damaged or how you were hurt.</p>
            ) : null}
          </section>

          <section className="mt-10">
            <div className="flex items-center gap-2">
              <BookOpen className="size-5 text-oxblood" aria-hidden="true" />
              <h3 className="font-display text-2xl">What the book says</h3>
            </div>
            {result.note ? <p className="mt-2 text-sm text-muted">{result.note}</p> : null}
            <ul className="mt-4 grid gap-4">
              {result.statutes.map((statute) => (
                <li key={statute.citation} className="shadow-border rounded-2xl bg-sheet p-4 sm:p-5">
                  <p className="text-sm font-semibold text-oxblood">{statute.citation}</p>
                  <h4 className="font-display text-xl">{statute.heading}</h4>
                  <p className="paper-rule mt-3 font-display text-base leading-7 whitespace-pre-wrap text-ink">
                    {statute.text}
                  </p>
                  <a
                    className="mt-3 inline-flex h-11 items-center gap-1 text-sm font-semibold text-oxblood"
                    href={statute.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open the section
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-10">
            <h3 className="font-display text-2xl">Public cases that look similar</h3>
            <p className="mt-1 max-w-3xl text-sm leading-relaxed text-muted">
              Other people's published opinions. Who sued, in which court, and what the syllabus says
              happened. Not your case, and not a forecast.
            </p>
            <ul className="mt-4 grid gap-3">
              {result.cases.map((item) => (
                <li key={item.sourceUrl} className="shadow-border rounded-2xl bg-sheet p-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <h4 className="font-display text-xl text-balance">{item.caption}</h4>
                    <span className="text-sm font-semibold text-muted">
                      {item.sameState ? "This state's courts" : "Another court"}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {item.court}
                    {item.year ? ` · ${item.year}` : ""}
                    {item.citation ? ` · ${item.citation}` : ""}
                  </p>
                  <p className="mt-2 text-base leading-relaxed text-pretty text-ink">{item.summary}</p>
                  <a
                    className="mt-2 inline-flex h-11 items-center gap-1 text-sm font-semibold text-oxblood"
                    href={item.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Read the opinion
                    <ExternalLink className="size-4" aria-hidden="true" />
                  </a>
                </li>
              ))}
            </ul>
            {result.cases.length === 0 ? (
              <p className="mt-3 text-base text-muted">
                No published opinion turned up for that search. The code sections above are still the book.
              </p>
            ) : null}
          </section>

          <section className="sheet-print mt-10" id="packet">
            <div className="mb-4">
              <LegalNotice />
            </div>
            <div className="flex items-center gap-2">
              <FileText className="size-5 text-oxblood" aria-hidden="true" />
              <h3 className="font-display text-2xl">The paper trail</h3>
            </div>
            <p className="mt-1 flex items-start gap-2 text-base text-ink">
              <MapPin className="mt-1 size-4 shrink-0 text-oxblood" aria-hidden="true" />
              <span>{result.forumLine}</span>
            </p>

            {open ? (
              <div className="mt-4">
                <div className="no-print mb-4 flex flex-wrap items-center justify-between gap-3">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-oxblood">
                    <Check className="size-4" aria-hidden="true" />
                    {hasUnlock(asked.story, asked.state, asked.place)
                      ? "Paper trail open on this device"
                      : "Paper trail open"}
                  </p>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-sheet px-4 text-sm font-semibold"
                  >
                    <Printer className="size-4" aria-hidden="true" />
                    Print the packet
                  </button>
                </div>

                <div className="shadow-border rounded-2xl bg-sheet p-4 sm:p-5">
                  <h4 className="font-display text-xl">Where to take it</h4>
                  <p className="mt-2 text-base leading-relaxed text-pretty text-ink">{result.forumDetail}</p>
                  {result.forumSourceUrl ? (
                    <a
                      className="mt-2 inline-flex h-11 items-center gap-1 text-sm font-semibold text-oxblood"
                      href={result.forumSourceUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Court or code page
                      <ExternalLink className="size-4" aria-hidden="true" />
                    </a>
                  ) : (
                    <p className="mt-2 text-sm text-muted">
                      Confirm the courthouse and the current money limit with the clerk. A single official page was not locked in.
                    </p>
                  )}

                  <h4 className="mt-6 font-display text-xl">Have these facts on the table</h4>
                  <p className="mt-1 text-sm text-muted">
                    A worksheet, not a court form. Copy it onto the official paper the clerk gives you.
                  </p>
                  <ol className="mt-3 grid gap-2">
                    {WORKSHEET.map((line, index) => (
                      <li key={line} className="flex gap-3 text-base leading-relaxed">
                        <span className="font-display text-lg text-oxblood tabular-nums">{index + 1}</span>
                        <span>{line}</span>
                      </li>
                    ))}
                  </ol>

                  <h4 className="mt-6 font-display text-xl">Papers</h4>
                  <ul className="mt-3 grid gap-3">
                    {result.papers.map((paper) => (
                      <li key={paper.name} className="rounded-xl bg-paper p-3">
                        <p className="font-semibold">{paper.name}</p>
                        <p className="mt-1 text-sm leading-relaxed text-ink">{paper.purpose}</p>
                        {paper.sourceUrl ? (
                          <a
                            className="mt-1 inline-flex h-10 items-center gap-1 text-sm font-semibold text-oxblood"
                            href={paper.sourceUrl}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Official page
                            <ExternalLink className="size-4" aria-hidden="true" />
                          </a>
                        ) : (
                          <p className="mt-1 text-sm text-muted">Ask the clerk for the current form. Do not invent a form number.</p>
                        )}
                      </li>
                    ))}
                  </ul>
                  {result.papers.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">
                      The official form name did not come back. Ask the clerk for the complaint or statement of claim used in this court.
                    </p>
                  ) : null}

                  <h4 className="mt-6 font-display text-xl">Steps</h4>
                  <ol className="mt-3 grid gap-4">
                    {result.steps.map((step, index) => (
                      <li key={step.title} className="flex gap-3">
                        <span className="font-display text-2xl text-oxblood tabular-nums">{index + 1}</span>
                        <div>
                          <p className="font-semibold">{step.title}</p>
                          <p className="mt-1 text-base leading-relaxed text-pretty text-ink">{step.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  {result.steps.length === 0 ? (
                    <p className="mt-2 text-sm text-muted">
                      State-specific steps did not come back. Use the worksheet, then follow the clerk's written instructions for filing and service.
                    </p>
                  ) : null}
                </div>

                <button
                  type="button"
                  className="no-print mt-3 text-sm text-muted underline"
                  onClick={() => {
                    clearUnlock();
                    setOpen(false);
                    setEpoch((value) => value + 1);
                  }}
                >
                  Lock the packet on this device
                </button>
              </div>
            ) : (
              <div className="no-print shadow-border mt-4 rounded-card bg-sheet p-4 sm:p-5">
                <p className="inline-flex items-center gap-2 text-sm font-semibold text-oxblood">
                  <Lock className="size-4" aria-hidden="true" />
                  Deadline passed? Here are the filing steps
                </p>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-ink">
                  {`$${PLANS.once.price}`} once for this dispute. The books above stay open. These
                  are the papers, the order, and where to take them. Not the letter.
                </p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {(["letter_exam", "once"] as PlanId[]).map((id) => {
                    const item = PLANS[id];
                    const selected = plan === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setPlan(id)}
                        className={`rounded-2xl border p-4 text-left ${selected ? "border-oxblood bg-oxblood-soft" : "border-line bg-paper"}`}
                      >
                        <span className="block text-sm font-semibold tracking-wide text-muted">{item.title}</span>
                        <span className="mt-1 block font-display text-4xl tabular-nums">
                          ${item.price}
                          <span className="ml-1 font-sans text-base text-muted">{item.cadence}</span>
                        </span>
                        <span className="mt-1 block text-sm text-ink">{item.detail}</span>
                      </button>
                    );
                  })}
                </div>
                <button
                  type="button"
                  onClick={() => choose(plan)}
                  className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-oxblood px-4 text-base font-semibold text-oxblood-ink"
                >
                  Unlock {plan === "letter_exam" ? "Payment #1 ($19 Once — Command Letter & Examination)" : "Payment #2 ($45 Once — Court Files & Suing Process Guide)"}
                </button>
                <p className="mt-2 text-sm leading-relaxed text-muted">
                  Choosing a plan opens the packet on this device. A card is not charged here. Connect
                  billing before customers pay.
                </p>
              </div>
            )}
          </section>
        </article>
      ) : null}

      <footer className="no-print px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <LegalNotice />
        </div>
      </footer>
    </main>
  );
}
