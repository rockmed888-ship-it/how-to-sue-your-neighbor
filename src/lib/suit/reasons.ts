export type Happened = {
  situation: string;
  story: string;
  state: string;
  place: string;
  caption: string;
  court: string;
  year: string;
  href: string;
  result: string;
};

/** Appeals left a judgment for the person who filed. Amounts are from the opinion, not a forecast. */
export const HAPPENED: Happened[] = [
  {
    situation: "The neighbor built over the line",
    story:
      "My neighbor built into the strip by my fence and will not put it back.",
    state: "CT",
    place: "Cheshire",
    caption: "Gancsos v. Israel",
    court: "Connecticut Appellate Court",
    year: "2025",
    href: "https://www.courtlistener.com/opinion/10623616/gancsos-v-israel/",
    result:
      "Next-door owners in Cheshire sued for trespass after curbing and stone walls went into a shared strip by a fence. The trial court entered judgment for the owner who filed: $45,400, and an order to put the strip back. The appeals court affirmed.",
  },
  {
    situation: "The landlord kept the deposit",
    story: "My landlord kept my security deposit and will not return what I am owed.",
    state: "CT",
    place: "",
    caption: "Herron v. Daniels",
    court: "Connecticut Appellate Court",
    year: "2021",
    href: "https://www.courtlistener.com/opinion/5287230/herron-v-daniels/",
    result:
      "A tenant sued for the security deposit. The trial court found for him, including double the deposit under Connecticut’s statute, and the appeals court affirmed.",
  },
  {
    situation: "What they did next door kept spilling over",
    story: "My neighbor’s animals and mess keep coming onto my property and they will not stop.",
    state: "OH",
    place: "Jackson Township",
    caption: "Lantz v. Smith",
    court: "Ohio Court of Appeals",
    year: "2025",
    href: "https://www.courtlistener.com/opinion/10626852/lantz-v-smith/",
    result:
      "Neighbors in Stark County sued over squirrels drawn by daily feeding next door. The court found a private nuisance. The appeals court affirmed that judgment.",
  },
];

export type PublicExample = {
  caption: string;
  court: string;
  year: string;
  href: string;
  line: string;
};

export type Reason = {
  title: string;
  claim: string;
  about: string;
  story: string;
  cases: PublicExample[];
};

/** Published opinions opened from CourtListener. Lines track the public syllabus, not a prediction. */
export const REASONS: Reason[] = [
  {
    title: "A fence, a tree, or other property damage",
    claim: "Trespass to land, or damage to property",
    about:
      "This is the usual civil claim when someone breaks, cuts, or hauls away something on your land and will not pay to put it back. The papers ask for the cost of repair or replacement. A boundary fight is often filed the same way.",
    story: "My neighbor tore my fence down and will not pay to rebuild it.",
    cases: [
      {
        caption: "Robinson v. Tindill",
        court: "Connecticut Appellate Court",
        year: "2021",
        href: "https://www.courtlistener.com/opinion/5288603/robinson-v-tindill/",
        line: "Owners of adjoining houses went to court over the boundary and asked the court to declare who had which rights.",
      },
      {
        caption: "In re Fence Viewing Petition of Bailey",
        court: "Minnesota Court of Appeals",
        year: "2001",
        href: "https://www.courtlistener.com/opinion/1612422/in-re-the-june-9-2000-fence-viewing-petition-of-bailey/",
        line: "A fence-viewing petition between neighbors. The opinion is the public record of how that fence dispute was handled.",
      },
    ],
  },
  {
    title: "Someone came onto the land",
    claim: "Trespass",
    about:
      "Trespass is the name for entering or staying on land without permission, or leaving something there. If they also broke a fence or a gate while they were on it, property damage is often pleaded beside it.",
    story: "Someone came onto my property without permission and damaged it.",
    cases: [
      {
        caption: "Robinson v. Tindill",
        court: "Connecticut Appellate Court",
        year: "2021",
        href: "https://www.courtlistener.com/opinion/5288603/robinson-v-tindill/",
        line: "A published fight between next-door owners about the line between the two parcels.",
      },
    ],
  },
  {
    title: "A fall in a store",
    claim: "Premises liability",
    about:
      "A wet floor, a spill, or a missing warning is usually pleaded as negligence: the business had a duty to keep the place reasonably safe for shoppers. The published fights often turn on whether the store knew about the hazard, or should have.",
    story: "I fell on a wet floor in a store. There was no warning sign and I was hurt.",
    cases: [
      {
        caption: "Trout v. Shani DEV8, L.L.C.",
        court: "Ohio Court of Appeals",
        year: "2025",
        href: "https://www.courtlistener.com/opinion/10356142/trout-v-shani-dev8-llc/",
        line: "A shopper slipped on liquid. The opinion says the business did not have constructive notice, and the shopper could not prove how long the liquid had been there.",
      },
      {
        caption: "Alcantar v. Dolgencorp, LLC",
        court: "Tennessee Court of Appeals",
        year: "2024",
        href: "https://www.courtlistener.com/opinion/10106636/tezozomoc-alcantar-v-dolgencorp-llc/",
        line: "A shopper slipped on liquid in a convenience store and sued the owner. The trial court threw the case out. The appeals court reversed.",
      },
      {
        caption: "Navetta v. Onondaga Galleries LLC",
        court: "New York Appellate Division",
        year: "2013",
        href: "https://www.courtlistener.com/opinion/6064931/navetta-v-onondaga-galleries-ltd-liability-co/",
        line: "A published New York slip-and-fall opinion. Open it for the result. The short report did not include a syllabus.",
      },
    ],
  },
  {
    title: "Water, noise, animals, or smoke",
    claim: "Private nuisance",
    about:
      "Nuisance is the claim when a neighbor's use of their own land substantially interferes with yours: flooding, constant noise, smoke, or animals that damage your place. It can sit next to trespass when they also come onto the land.",
    story: "My neighbor's water floods my yard and they will not stop it.",
    cases: [
      {
        caption: "Lantz v. Smith",
        court: "Ohio Court of Appeals",
        year: "2025",
        href: "https://www.courtlistener.com/opinion/10626852/lantz-v-smith/",
        line: "Homeowners who fed squirrels and other wildlife were held to have created a private nuisance and could be liable for the damage that followed.",
      },
    ],
  },
  {
    title: "A landlord kept the deposit",
    claim: "Security-deposit statute, and the lease",
    about:
      "States write their own rules for how long a landlord may hold a residential deposit and what they must put in writing. The suit usually names that statute and the lease. The amount, the deadline, and the penalty are in that state's code, not in a national rule.",
    story: "My landlord kept my security deposit and will not say what it was kept for.",
    cases: [
      {
        caption: "Opinion search: security deposit and tenant",
        court: "CourtListener",
        year: "Index",
        href: "https://www.courtlistener.com/?type=o&q=%22security+deposit%22+tenant&order_by=score+desc",
        line: "A public index of published opinions that use those words. Open a case from the list and read that court's result. It is not one lawsuit.",
      },
    ],
  },
  {
    title: "You paid, and the work never happened",
    claim: "Breach of contract",
    about:
      "When money changed hands for work that was not done, the claim is usually breach of contract. The papers name the agreement, what was paid, and what was not delivered. A handshake can still be a contract. Proving the terms is the hard part.",
    story: "I paid a contractor a deposit to redo the kitchen. They never started the work.",
    cases: [
      {
        caption: "Opinion search: contractor and breach of contract",
        court: "CourtListener",
        year: "Index",
        href: "https://www.courtlistener.com/?type=o&q=%22breach+of+contract%22+contractor+deposit&order_by=score+desc",
        line: "A public index of published contract opinions. Pick a case and read who sued, and how that court ruled. It is not a result in your dispute.",
      },
    ],
  },
];

export type LetterPath = {
  label: string;
  story: string;
  claim: string;
  demand: string;
  basis: string;
};

const fence = REASONS.find((item) => item.title.startsWith("A fence"));
const deposit = REASONS.find((item) => item.title.startsWith("A landlord"));
const contractor = REASONS.find((item) => item.title.startsWith("You paid"));

/** Short paths into the letter. Stories and claim names are the ones already on the desk. */
export const LETTER_PATHS: LetterPath[] = [
  {
    label: "Fence torn down",
    story: fence?.story ?? "",
    claim: fence?.claim ?? "",
    demand: "the cost to repair or replace the fence",
    basis:
      "The amount is the repair or replacement cost on the written estimate attached to this letter.",
  },
  {
    label: "Security deposit kept",
    story: deposit?.story ?? "",
    claim: deposit?.claim ?? "",
    demand: "the security deposit that was not returned",
    basis:
      "The amount is the deposit I paid, minus any deduction you listed in writing. The lease page and proof of payment are attached.",
  },
  {
    label: "Contractor took the money",
    story: contractor?.story ?? "",
    claim: contractor?.claim ?? "",
    demand: "the deposit I paid for work that was not started",
    basis:
      "The amount is what I paid, shown on the receipt or transfer attached to this letter. The work was not started.",
  },
];


