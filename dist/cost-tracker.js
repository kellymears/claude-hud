import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
// Pricing per million tokens (USD) — Claude Opus 4
export const PRICE_INPUT = 15;
export const PRICE_OUTPUT = 75;
export const PRICE_CACHE_WRITE = 18.75;
export const PRICE_CACHE_READ = 1.875;
const WINDOW_MS = 5 * 60 * 60 * 1000; // 5 hours
function getStatePath() {
    return path.join(os.homedir(), '.claude', 'plugins', 'claude-hud', '.cost-state.json');
}
function readState() {
    try {
        const raw = fs.readFileSync(getStatePath(), 'utf8');
        return JSON.parse(raw);
    }
    catch {
        return null;
    }
}
function writeState(state) {
    try {
        fs.writeFileSync(getStatePath(), JSON.stringify(state), 'utf8');
    }
    catch {
        // Ignore write failures
    }
}
/** Compute dollar cost from token usage counts */
export function computeCost(usage) {
    if (!usage)
        return 0;
    const inputTokens = usage.input_tokens ?? 0;
    const outputTokens = usage.output_tokens ?? 0;
    const cacheWrite = usage.cache_creation_input_tokens ?? 0;
    const cacheRead = usage.cache_read_input_tokens ?? 0;
    const plainInput = Math.max(0, inputTokens - cacheWrite - cacheRead);
    return ((plainInput / 1_000_000) * PRICE_INPUT +
        (outputTokens / 1_000_000) * PRICE_OUTPUT +
        (cacheWrite / 1_000_000) * PRICE_CACHE_WRITE +
        (cacheRead / 1_000_000) * PRICE_CACHE_READ);
}
/**
 * Get estimated total cost for the rolling 5-hour usage window.
 * Accumulates cost across context compressions and session restarts.
 *
 * When a context compression is detected (cost drops) or the session changes
 * (different transcript path), the previous cost is "banked" as a historical
 * entry. Entries older than 5 hours are expired on each render.
 */
export function getWindowCost(currentUsage, transcriptPath) {
    const now = Date.now();
    const currentCost = computeCost(currentUsage);
    const state = readState() ?? {
        entries: [],
        currentSession: transcriptPath,
        lastCost: 0,
        lastUpdate: now,
    };
    // Expire entries outside the 5-hour window
    state.entries = state.entries.filter(e => now - e.timestamp < WINDOW_MS);
    const sessionChanged = transcriptPath !== '' &&
        state.currentSession !== '' &&
        transcriptPath !== state.currentSession;
    const costDecreased = currentCost < state.lastCost - 0.001;
    // Bank previous cost on session change or compression
    if ((sessionChanged || costDecreased) && state.lastCost > 0) {
        state.entries.push({ timestamp: state.lastUpdate, cost: state.lastCost });
        state.lastCost = 0;
    }
    state.currentSession = transcriptPath;
    state.lastCost = currentCost;
    state.lastUpdate = now;
    writeState(state);
    const bankedTotal = state.entries.reduce((sum, e) => sum + e.cost, 0);
    return bankedTotal + currentCost;
}
/** Format cost for display */
export function formatCost(cost) {
    if (cost < 0.005)
        return '';
    return cost < 1
        ? `~$${cost.toFixed(2)}`
        : `~$${cost.toFixed(1)}`;
}
//# sourceMappingURL=cost-tracker.js.map