export declare const RESET = "\u001B[0m";
export declare function green(text: string): string;
export declare function yellow(text: string): string;
export declare function red(text: string): string;
export declare function cyan(text: string): string;
export declare function magenta(text: string): string;
export declare function dim(text: string): string;
export declare function getContextColor(percent: number): string;
export declare function getQuotaColor(percent: number): string;
export declare function quotaBar(percent: number, width?: number): string;
/**
 * Renders a single unified bar showing two usage percentages with different textures.
 * periodicPct (5h) uses solid blocks █, longerPct (7d) uses medium shade ▓.
 * The higher of the two determines the bar fill, with the lower one overlaid.
 */
export declare function dualQuotaBar(periodicPct: number, longerPct: number, width?: number): string;
export declare function coloredBar(percent: number, width?: number): string;
//# sourceMappingURL=colors.d.ts.map