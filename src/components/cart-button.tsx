import { useEffect, useState } from "react";
import { ShoppingCart } from "lucide-react";
import {
  CART_EVENT,
  OPEN_LETTER_EVENT,
  cartTotal,
  readCart,
  removeLetterFromCart,
  type CartLine,
} from "@/lib/suit/cart";

export function CartButton() {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const sync = () => setLines(readCart());
    sync();
    window.addEventListener(CART_EVENT, sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener(CART_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  const count = lines.length;
  const total = cartTotal(lines);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-label={count ? `Cart, ${count} item` : "Cart, empty"}
        onClick={() => setOpen((value) => !value)}
        className="inline-flex h-11 items-center gap-2 rounded-xl border border-line bg-sheet px-3 text-sm font-semibold text-ink"
      >
        <ShoppingCart className="size-4" aria-hidden="true" />
        Cart
        <span className="tabular-nums">{count}</span>
      </button>
      {open ? (
        <div className="shadow-border fixed inset-x-4 top-20 z-30 max-h-[70vh] overflow-auto rounded-2xl bg-sheet p-4 sm:absolute sm:inset-x-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80">
          <p className="font-display text-xl text-ink">Cart</p>
          {lines.length === 0 ? (
            <p className="mt-2 text-sm leading-relaxed text-muted">Nothing in the cart yet.</p>
          ) : (
            <ul className="mt-3 grid gap-3">
              {lines.map((item) => (
                <li key={item.id} className="border-b border-line pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="font-semibold text-ink">{item.title}</p>
                      <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
                    </div>
                    <p className="font-display text-2xl tabular-nums">${item.price}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLines(removeLetterFromCart())}
                    className="mt-2 text-sm text-muted underline"
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
          <p className="mt-3 flex items-baseline justify-between text-ink">
            <span className="text-sm font-semibold">Total</span>
            <span className="font-display text-3xl tabular-nums">${total}</span>
          </p>
          <button
            type="button"
            disabled={count === 0}
            onClick={() => {
              setOpen(false);
              window.dispatchEvent(new Event(OPEN_LETTER_EVENT));
              document.getElementById("presuit")?.scrollIntoView({ block: "start" });
            }}
            className="mt-3 flex h-11 w-full items-center justify-center rounded-xl bg-oxblood px-4 text-sm font-semibold text-oxblood-ink disabled:opacity-50"
          >
            Open the letter
          </button>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            A card is not charged here. Connect billing before customers pay.
          </p>
        </div>
      ) : null}
    </div>
  );
}
