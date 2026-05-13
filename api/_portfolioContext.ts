/**
 * Thin API-side wrapper around the shared portfolio knowledge source.
 * Keeping the data in one place avoids ES/EN drift between the UI and chat mode.
 */

export { buildPortfolioKnowledgeContext } from '../src/data/portfolioProfile';
