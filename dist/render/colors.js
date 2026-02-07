export const RESET = '\x1b[0m';
const DIM = '\x1b[2m';
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const MAGENTA = '\x1b[35m';
const CYAN = '\x1b[36m';
const BRIGHT_BLUE = '\x1b[94m';
const BRIGHT_MAGENTA = '\x1b[95m';
const BRIGHT_MAGENTA_RAW = '\x1b[95m';
export function green(text) {
    return `${GREEN}${text}${RESET}`;
}
export function yellow(text) {
    return `${YELLOW}${text}${RESET}`;
}
export function red(text) {
    return `${RED}${text}${RESET}`;
}
export function cyan(text) {
    return `${CYAN}${text}${RESET}`;
}
export function magenta(text) {
    return `${MAGENTA}${text}${RESET}`;
}
export function dim(text) {
    return `${DIM}${text}${RESET}`;
}
export function getContextColor(percent) {
    if (percent >= 85)
        return RED;
    if (percent >= 70)
        return YELLOW;
    return GREEN;
}
export function getQuotaColor(percent) {
    if (percent >= 90)
        return RED;
    if (percent >= 75)
        return BRIGHT_MAGENTA;
    return BRIGHT_BLUE;
}
export function quotaBar(percent, width = 10) {
    const safeWidth = Number.isFinite(width) ? Math.max(0, Math.round(width)) : 0;
    const safePercent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
    const filled = Math.round((safePercent / 100) * safeWidth);
    const empty = safeWidth - filled;
    const color = getQuotaColor(safePercent);
    return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}
/**
 * Renders a single unified bar showing two usage percentages with different textures.
 * periodicPct (5h) uses solid blocks █, longerPct (7d) uses medium shade ▓.
 * The higher of the two determines the bar fill, with the lower one overlaid.
 */
export function dualQuotaBar(periodicPct, longerPct, width = 16) {
    const safeWidth = Number.isFinite(width) ? Math.max(0, Math.round(width)) : 0;
    const safePeriodic = Number.isFinite(periodicPct) ? Math.min(100, Math.max(0, periodicPct)) : 0;
    const safeLonger = Number.isFinite(longerPct) ? Math.min(100, Math.max(0, longerPct)) : 0;
    const periodicFill = Math.round((safePeriodic / 100) * safeWidth);
    const longerFill = Math.round((safeLonger / 100) * safeWidth);
    const periodicColor = getQuotaColor(safePeriodic);
    const longerColor = DIM + BRIGHT_MAGENTA_RAW;
    let bar = '';
    for (let i = 0; i < safeWidth; i++) {
        if (i < periodicFill && i < longerFill) {
            // Both — show solid block in periodic color
            bar += `${periodicColor}█`;
        }
        else if (i < periodicFill) {
            // Only periodic — solid block
            bar += `${periodicColor}█`;
        }
        else if (i < longerFill) {
            // Only longer-term — medium shade
            bar += `${longerColor}▓`;
        }
        else {
            // Empty
            bar += `${DIM}░`;
        }
    }
    return `${bar}${RESET}`;
}
export function coloredBar(percent, width = 10) {
    const safeWidth = Number.isFinite(width) ? Math.max(0, Math.round(width)) : 0;
    const safePercent = Number.isFinite(percent) ? Math.min(100, Math.max(0, percent)) : 0;
    const filled = Math.round((safePercent / 100) * safeWidth);
    const empty = safeWidth - filled;
    const color = getContextColor(safePercent);
    return `${color}${'█'.repeat(filled)}${DIM}${'░'.repeat(empty)}${RESET}`;
}
//# sourceMappingURL=colors.js.map