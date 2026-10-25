import { LETTER } from "@/lib/suit/plans";

const CART_KEY = "neighbor-suit-cart";
export const CART_EVENT = "neighbor-cart";
export const OPEN_LETTER_EVENT = "neighbor-open-letter";

export type CartLine = {
  id: "letter";
  title: string;
  price: number;
  detail: string;
};

function empty(): CartLine[] {
  return [];
}

export function readCart(): CartLine[] {
  if (typeof window === "undefined") return empty();
  try {
    const raw = window.localStorage.getItem(CART_KEY);
    if (!raw) return empty();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return empty();
    return parsed.filter(
      (item): item is CartLine =>
        Boolean(item) &&
        typeof item === "object" &&
        (item as CartLine).id === "letter" &&
        typeof (item as CartLine).price === "number",
    );
  } catch {
    return empty();
  }
}

function write(lines: CartLine[]): CartLine[] {
  window.localStorage.setItem(CART_KEY, JSON.stringify(lines));
  window.dispatchEvent(new Event(CART_EVENT));
  return lines;
}

export function letterInCart(): boolean {
  return readCart().some((item) => item.id === "letter");
}

export function addLetterToCart(): CartLine[] {
  const lines = readCart();
  if (lines.some((item) => item.id === "letter")) return lines;
  return write([
    ...lines,
    {
      id: "letter",
      title: LETTER.title,
      price: LETTER.price,
      detail: LETTER.detail,
    },
  ]);
}

export function removeLetterFromCart(): CartLine[] {
  return write(readCart().filter((item) => item.id !== "letter"));
}

export function cartTotal(lines: CartLine[]): number {
  return lines.reduce((sum, item) => sum + item.price, 0);
}
