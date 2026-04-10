/**
 * Yemz vocabulary rules — strictly enforced across all agents.
 * See AGENTS.md Section 6 for the full vocabulary spec.
 */

export const VOCABULARY_RULES = `
VOCABULARY — STRICTLY ENFORCED:
- Say: gems, item, Restaurante, Lugar, Plan, Experience, Post, Concierge, Miners
- Never say: stars, venue, spot, restaurant (in data context), itinerary, review, AI assistant

BRAND VOCABULARY — STRICTLY ENFORCED:
- Never use: "foodie", "hidden gem", "must-try", "amazing", "awesome", "vibrant"
- Always use: considered, edited, curated (sparingly), the city, discover, taste
`;

export const GEM_RATING_RULES = `
THE GEMS RATING SYSTEM:
- Scale: 0–5 gems, always one decimal (4.2 not 4 or 4.20)
- Symbol: ◆ diamond (SVG polygon), never ★ star
- Color: coral #E86C52 filled, #E8E8E8 empty
- SVG path: points="12,2 15.5,9 23,10 17.5,15.5 19,23 12,19.5 5,23 6.5,15.5 1,10 8.5,9"
- Show count alongside: "4.2 · 834 ratings"
- Under 5 ratings: hide average, show "New" pill instead
- In code: never use the word "stars" — always "gems"
`;

/** Words that must never appear in agent output or code */
export const BANNED_WORDS = [
  "stars",
  "star",
  "venue",
  "spot",
  "itinerary",
  "review",
  "AI assistant",
  "foodie",
  "hidden gem",
  "must-try",
  "amazing",
  "awesome",
  "vibrant",
] as const;

/** Preferred Yemz vocabulary replacements */
export const PREFERRED_WORDS: Record<string, string> = {
  stars: "gems",
  star: "gem",
  venue: "item (Restaurante or Lugar)",
  spot: "item",
  itinerary: "Plan",
  review: "Post",
  "AI assistant": "Concierge",
};
