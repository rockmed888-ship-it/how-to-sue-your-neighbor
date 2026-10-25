const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function longDate(date: Date): string {
  return `${MONTHS[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
}

export type LetterInput = {
  sender: string;
  address: string;
  defendant: string;
  story: string;
  stateName: string;
  place: string;
  demand: string;
  basis: string;
  days: number;
  claim: string;
};

export function draftPresuitLetter(input: LetterInput, today = new Date()): string {
  const due = new Date(today);
  due.setDate(due.getDate() + input.days);
  const sender = input.sender.trim();
  const defendant = input.defendant.trim();
  const where = [input.place.trim(), input.stateName.trim()].filter(Boolean).join(", ");
  const address = input.address.trim();
  const replyTo = [address, where].filter(Boolean).join(", ") || "the address on this letter";
  const facts = input.story.trim().replace(/\s+/g, " ");
  const claim = input.claim.trim();
  const demand = input.demand.trim();
  const basis =
    input.basis.trim() ||
    "The amount is what the attached repair estimate, receipt, or other papers add up to. I did not add a court award.";
  const dueText = longDate(due);
  const courtPlace = input.stateName.trim() || where || "the proper state";

  const paragraphs = [
    [sender, address, where, longDate(today)].filter(Boolean).join("\n"),
    "Sent by certified mail, return receipt requested",
    [defendant, where].filter(Boolean).join("\n"),
    "Re: Demand to pay before a civil lawsuit is filed",
    `Dear ${defendant}:`,
    "I am writing to state what happened and to give you a chance to pay before I file a lawsuit. If you accept the terms below, this can end here. If you refuse, or if you do not answer, I am keeping this letter, a copy of what I attached, and the certified-mail receipt.",
    where ? `What happened, in ${where}: ${facts}` : `What happened: ${facts}`,
    claim
      ? `If a case is filed, this kind of dispute is commonly called ${claim}. This letter is not a lawsuit. It is the demand that comes before one.`
      : "This letter is not a lawsuit. It is the demand that comes before one.",
    `I demand that you pay ${demand}.`,
    `How that amount was calculated: ${basis}`,
    "Enclosed are copies, not originals, of the papers that show the amount: a repair estimate or a receipt, and photographs. Please use those copies. The number above comes from them.",
    `Answer in writing by ${dueText}. That is ${input.days} days from the date of this letter. A written agreement to pay the amount, and a date you will pay it, resolves this demand. This letter does not say that you will pay, and it is not a court judgment.`,
    `If I do not have that answer by ${dueText}, I may file a civil action in the proper court in ${courtPlace}. I may ask for the compensation the law allows for these facts, and for court costs where the rules allow them. I am not filing that case today.`,
    "Nothing in this letter gives up any claim. I am not accusing you of a crime, and I am not asking a prosecutor to act. This is a civil demand only.",
    `Reply in writing to ${sender} at ${replyTo}.`,
    "Sincerely,",
    [sender, replyTo, "Enclosures: estimate or receipt; photographs", "Copy kept, with the certified-mail receipt"].join("\n"),
  ];

  return paragraphs.join("\n\n");
}

/** Finished sample. Same fence facts as the desk. Not the buyer's letter. */
export function sampleFenceLetter(today = new Date()): string {
  return draftPresuitLetter(
    {
      sender: "Alex Morgan",
      address: "14 Oak Street",
      defendant: "Jordan Lee",
      story: "My neighbor tore my fence down and hauled the boards away. They will not pay to rebuild it.",
      stateName: "Alabama",
      place: "Birmingham",
      demand: "the $1,200 cost to rebuild the fence",
      basis:
        "One written estimate to rebuild the fence is $1,200. I am attaching that estimate. I did not add a court award on top.",
      days: 14,
      claim: "trespass to land, or damage to property",
    },
    today,
  );
}
