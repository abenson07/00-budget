/**
 * Maps known real-world merchants to their brand domain, used to pull a logo
 * from Clearbit's logo API (https://logo.clearbit.com/{domain}). Merchants not
 * present here are treated as generic/fabricated line items (fees, transfers,
 * fictional payers) and never get a logo fetch attempt.
 */
const MERCHANT_DOMAINS: Record<string, string> = {
  "asos": "asos.com",
  "at&t fiber": "att.com",
  "late fee - at&t fiber": "att.com",
  "airbnb": "airbnb.com",
  "amazon": "amazon.com",
  "beasley's": "ac-restaurants.com",
  "black & white coffee": "blackwhiteroasters.com",
  "cava": "cava.com",
  "cvs pharmacy": "cvs.com",
  "chipotle": "chipotle.com",
  "circle k": "circlek.com",
  "cook out": "cookout.com",
  "costco wholesale": "costco.com",
  "crawford and son": "crawfordandsonrestaurant.com",
  "discover card payment - minimum due": "discover.com",
  "doordash": "doordash.com",
  "duke energy center box office": "dukeenergycenterraleigh.com",
  "geico": "geico.com",
  "harris teeter": "harristeeter.com",
  "hulu": "hulu.com",
  "jersey mike's": "jerseymikes.com",
  "jubala coffee": "jubalacoffee.com",
  "lemonade insurance": "lemonade.com",
  "lidl": "lidl.com",
  "lyft": "lyft.com",
  "nelnet student loans": "nelnet.com",
  "neomonde": "neomonde.com",
  "netflix": "netflix.com",
  "overdraft fee - bank of america": "bankofamerica.com",
  "peloton app": "onepeloton.com",
  "planet fitness": "planetfitness.com",
  "publix": "publix.com",
  "sephora": "sephora.com",
  "sheetz": "sheetz.com",
  "shell": "shell.com",
  "sola coffee cafe": "solacoffee.com",
  "spotify premium": "spotify.com",
  "starbucks": "starbucks.com",
  "sweetgreen": "sweetgreen.com",
  "t-mobile": "t-mobile.com",
  "tj maxx": "tjmaxx.tjx.com",
  "target": "target.com",
  "the cortez": "grubhub.com",
  "ticketmaster - red hat amphitheater": "ticketmaster.com",
  "toyota financial services": "toyotafinancial.com",
  "transfer to ally savings": "ally.com",
  "trophy brewing": "trophybrewing.com",
  "uber": "uber.com",
  "uber eats": "ubereats.com",
  "ulta beauty": "ulta.com",
  "wakemed physician practices": "wakemed.org",
  "walgreens": "walgreens.com",
  "whole foods": "wholefoodsmarket.com",
  "zara": "zara.com",
};

export function merchantLogoUrl(merchant: string | null | undefined): string | null {
  const key = (merchant ?? "").trim().toLowerCase();
  if (!key) return null;
  const domain = MERCHANT_DOMAINS[key];
  if (!domain) return null;
  // Clearbit's logo API has been shut down; DuckDuckGo's favicon service is
  // free, keyless, and still live.
  return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
}
