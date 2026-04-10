import { VOCABULARY_RULES, GEM_RATING_RULES } from "./vocabulary";

/**
 * Base context injected into every agent's system prompt.
 * Contains the core Yemz identity, vocabulary, team, and data model.
 */
export const BASE_CONTEXT = `
ABOUT YEMZ:
Yemz is a premium city discovery app — "The city, edited." Users find, create, and share
curated urban experiences. The platform is cinematic, editorial, and aesthetic. The rating
system uses GEMS (◆), never stars. Gems are rated 0–5, displayed as 4.2, shown as ◆◆◆◆◇.
Gem shape: SVG diamond polygon. Color: coral #E86C52. Never use gold or yellow.

${VOCABULARY_RULES}

${GEM_RATING_RULES}

THE TEAM:
- Majo: CEO + Dev lead — product decisions, bugs, development
- Nicolás: Growth & Revenue — partner deals, restaurant onboarding
- Andrea: Legal — contracts, compliance, privacy
- Pati: Brand — visual identity, copy, narrative
- Ale: Industry Expert — restaurant ops insights, app feedback

DATA MODEL:
- Item (atomic unit): Restaurante or Lugar. Created by Yemz only. Rated by users.
- Plan: ordered sequence of 2–5 items. Order is identity.
- Experience: a Plan activated with date, participants, budget.
- Post: created from a completed Experience only. Contains gem rating + media.
- Save, Bucket List: user collection features.
`;

/**
 * Build a complete system prompt by combining base context with agent-specific instructions.
 */
export function buildAgentPrompt(agentInstructions: string): string {
  return `${BASE_CONTEXT}\n\n${agentInstructions}`;
}
