import { useEffect, useMemo, useState } from "react";
import { Printer } from "lucide-react";
import { draftPresuitLetter, sampleFenceLetter } from "@/lib/suit/letter";
import { LETTER, PLANS, STATES, hasLetter, saveLetter } from "@/lib/suit/plans";
import { LETTER_PATHS } from "@/lib/suit/reasons";
import { CART_EVENT, OPEN_LETTER_EVENT, addLetterToCart, letterInCart } from "@/lib/suit/cart";

type Props = {
  story: string;
  stateCode: string;
  place: string;
  claim: string;
  epoch: number;
  onStory: (story: string) => void;
  onSteps: () => void;
};

export function PresuitLetter({ story, stateCode, place, claim, epoch, onStory, onSteps }: Props) {
  const [sender, setSender] = useState("");
  const [address, setAddress] = useState("");
  const [defendant, setDefendant] = useState("");
  const [demand, setDemand] = useState("");
  const [basis, setBasis] = useState("");
  const [pathClaim, setPathClaim] = useState("");
  const [days, setDays] = useState(14);
  const [open, setOpen] = useState(false);
  const [inCart, setInCart] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const stateName = STATES.find((item) => item.code === stateCode)?.name ?? "";
  const sample = useMemo(() => sampleFenceLetter(), []);

  useEffect(() => {
    setOpen(hasLetter(story, stateCode, place));
  }, [story, stateCode, place, epoch]);

  useEffect(() => {
    const sync = () => setInCart(letterInCart());
    sync();
    window.addEventListener(CART_EVENT, sync);
    return () => window.removeEventListener(CART_EVENT, sync);
  }, []);

  useEffect(() => {
    const onOpen = () => unlock();
    window.addEventListener(OPEN_LETTER_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_LETTER_EVENT, onOpen);
  });

  const ready =
    sender.trim().length > 1 &&
    address.trim().length > 4 &&
    defendant.trim().length > 1 &&
    demand.trim().length > 1 &&
    story.trim().length >= 12 &&
    Boolean(stateCode);

  function unlock() {
    if (!ready) {
      setError("Add your name, a mailing address, their name, what you want paid, and what happened.");
      return;
    }
    setError(null);
    saveLetter(story, stateCode, place);
    setOpen(true);
    document.getElementById("your-letter")?.scrollIntoView({ block: "start" });
  }

  const letter = open
    ? draftPresuitLetter({
        sender,
        address,
        defendant,
        story,
        stateName,
        place,
        demand,
        basis,
        days: Number.isFinite(days) ? Math.min(45, Math.max(7, days)) : 14,
        claim: pathClaim || claim,
      })
    : "";

  async function copyLetter() {
    try {
      await navigator.clipboard.writeText(letter);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return (
    <section id="presuit" className="mx-auto max-w-5xl px-4 pb-12 sm:px-6">
      <p className="no-print text-sm font-semibold tracking-wide text-oxblood">Before you file</p>
      <h2 className="no-print mt-1 font-display text-3xl text-balance text-ink">The pre-suit letter</h2>
      <p className="no-print mt-2 max-w-2xl text-base leading-relaxed text-pretty text-ink">
        Send a letter before you file. If they pay, it can end. If they refuse, you kept the letter.{" "}
        {`$${LETTER.price}`} once. The filing steps come after, at {`$${PLANS.once.price}`} once.
      </p>

      <div className="no-print mt-5">
        <p className="text-sm font-semibold tracking-wide text-oxblood">Sample</p>
        <article className="shadow-border mt-2 max-w-2xl rounded-2xl bg-sheet p-4 font-display text-base leading-7 whitespace-pre-wrap text-ink sm:p-6">
          {sample}
        </article>
      </div>

      <div className="no-print mt-6 max-w-2xl">
        <p className="text-sm font-semibold">Start from what happened</p>
        <ul className="mt-2 flex flex-wrap gap-2">
          {LETTER_PATHS.map((path) => (
            <li key={path.label}>
              <button
                type="button"
                className="h-11 rounded-full bg-chip px-3 text-sm font-semibold text-ink"
                onClick={() => {
                  onStory(path.story);
                  setDemand(path.demand);
                  setBasis(path.basis);
                  setPathClaim(path.claim);
                  setError(null);
                }}
              >
                {path.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="no-print shadow-border mt-4 max-w-2xl rounded-2xl bg-sheet p-4">
        <label className="block text-sm font-semibold" htmlFor="sender">
          Your name
        </label>
        <input
          id="sender"
          value={sender}
          onChange={(event) => setSender(event.target.value)}
          placeholder="Alex Morgan"
          className="mt-2 h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink outline-none focus:border-oxblood"
        />
        <label className="mt-3 block text-sm font-semibold" htmlFor="address">
          Your mailing address
        </label>
        <input
          id="address"
          value={address}
          onChange={(event) => setAddress(event.target.value)}
          placeholder="14 Oak Street"
          className="mt-2 h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink outline-none focus:border-oxblood"
        />
        <label className="mt-3 block text-sm font-semibold" htmlFor="defendant">
          Their name
        </label>
        <input
          id="defendant"
          value={defendant}
          onChange={(event) => setDefendant(event.target.value)}
          placeholder="Jordan Lee"
          className="mt-2 h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink outline-none focus:border-oxblood"
        />
        <label className="mt-3 block text-sm font-semibold" htmlFor="demand">
          What you want paid
        </label>
        <input
          id="demand"
          value={demand}
          onChange={(event) => setDemand(event.target.value)}
          placeholder="the cost to rebuild the fence"
          className="mt-2 h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink outline-none focus:border-oxblood"
        />
        <label className="mt-3 block text-sm font-semibold" htmlFor="basis">
          How you calculated it
        </label>
        <textarea
          id="basis"
          value={basis}
          onChange={(event) => setBasis(event.target.value)}
          rows={3}
          placeholder="One written estimate to rebuild the fence is $1,200."
          className="mt-2 w-full rounded-xl border border-line bg-paper px-3 py-2 text-base text-ink outline-none focus:border-oxblood"
        />
        <label className="mt-3 block text-sm font-semibold" htmlFor="days">
          Days to answer
        </label>
        <input
          id="days"
          type="number"
          min={7}
          max={45}
          value={days}
          onChange={(event) => setDays(Number(event.target.value))}
          className="mt-2 h-11 w-full rounded-xl border border-line bg-paper px-3 text-base text-ink outline-none focus:border-oxblood"
        />
        <p className="mt-3 text-sm leading-relaxed text-muted">
          Uses what you wrote above
          {stateName ? `, in ${place.trim() ? `${place.trim()}, ` : ""}${stateName}` : ""}. The
          letter asks for certified mail and tells them the estimate or photos are attached.
        </p>
        {error ? (
          <p className="mt-3 text-sm text-ink" role="alert">
            {error}
          </p>
        ) : null}
        {open ? (
          <p className="mt-3 text-sm font-semibold text-oxblood">Your letter is open on this device.</p>
        ) : (
          <button
            type="button"
            onClick={() => {
              addLetterToCart();
              setInCart(true);
            }}
            className="mt-4 flex h-12 w-full items-center justify-center rounded-xl bg-oxblood px-4 text-base font-semibold text-oxblood-ink"
          >
            {inCart ? `In the cart — $${LETTER.price}` : `Add the $${LETTER.price} letter to the cart`}
          </button>
        )}
        <p className="mt-2 text-sm leading-relaxed text-muted">
          A draft, not legal advice. Read it before you send it. A card is not charged here.
        </p>
      </div>

      {open ? (
        <div id="your-letter" className="shadow-border mt-4 max-w-2xl rounded-2xl bg-sheet p-4 sm:p-8">
          <div className="no-print mb-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-paper px-4 text-sm font-semibold"
            >
              <Printer className="size-4" aria-hidden="true" />
              Print the letter
            </button>
            <button
              type="button"
              onClick={() => void copyLetter()}
              className="inline-flex h-11 items-center rounded-xl border border-line bg-paper px-4 text-sm font-semibold"
            >
              {copied ? "Copied" : "Copy the letter"}
            </button>
          </div>
          <article
            id="presuit-letter"
            className="font-display text-base leading-7 whitespace-pre-wrap text-ink"
          >
            {letter}
          </article>
        </div>
      ) : null}

      <div className="no-print shadow-border mt-4 max-w-2xl rounded-2xl bg-sheet p-4">
        <h3 className="font-display text-2xl text-balance text-ink">Deadline passed?</h3>
        <p className="mt-2 text-base leading-relaxed text-ink">
          Here are the filing steps. {`$${PLANS.once.price}`} once for this dispute. They name the
          papers and the order for the place you wrote. They are not this letter.
        </p>
        <button
          type="button"
          onClick={onSteps}
          className="mt-3 h-11 rounded-xl border border-line bg-paper px-4 text-sm font-semibold"
        >
          See the filing steps
        </button>
      </div>
    </section>
  );
}
