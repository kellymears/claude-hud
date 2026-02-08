export declare const PRICE_INPUT = 15;
export declare const PRICE_OUTPUT = 75;
export declare const PRICE_CACHE_WRITE = 18.75;
export declare const PRICE_CACHE_READ = 1.875;
interface TokenUsage {
    input_tokens?: number;
    output_tokens?: number;
    cache_creation_input_tokens?: number;
    cache_read_input_tokens?: number;
}
/** Compute dollar cost from token usage counts */
export declare function computeCost(usage: TokenUsage | null | undefined): number;
/**
 * Get estimated total cost for the rolling 5-hour usage window.
 * Accumulates cost across context compressions and session restarts.
 *
 * When a context compression is detected (cost drops) or the session changes
 * (different transcript path), the previous cost is "banked" as a historical
 * entry. Entries older than 5 hours are expired on each render.
 */
export declare function getWindowCost(currentUsage: TokenUsage | null | undefined, transcriptPath: string): number;
/** Format cost for display */
export declare function formatCost(cost: number): string;
export {};
//# sourceMappingURL=cost-tracker.d.ts.map