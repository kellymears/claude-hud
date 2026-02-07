import { isLimitReached } from '../../types.js';
import { getProviderLabel } from '../../stdin.js';
import { red, yellow, dim, getContextColor, dualQuotaBar, RESET } from '../colors.js';
// Pricing per million tokens (USD) — Claude Opus 4
const PRICE_INPUT = 15;
const PRICE_OUTPUT = 75;
const PRICE_CACHE_WRITE = 18.75;
const PRICE_CACHE_READ = 1.875;
export function renderUsageLine(ctx) {
    const display = ctx.config?.display;
    if (display?.showUsage === false) {
        return null;
    }
    if (!ctx.usageData?.planName) {
        return null;
    }
    if (getProviderLabel(ctx.stdin)) {
        return null;
    }
    const label = dim('Usage');
    if (ctx.usageData.apiUnavailable) {
        const errorHint = formatUsageError(ctx.usageData.apiError);
        return `${label} ${yellow(`⚠${errorHint}`)}`;
    }
    if (isLimitReached(ctx.usageData)) {
        const resetTime = ctx.usageData.fiveHour === 100
            ? formatResetTime(ctx.usageData.fiveHourResetAt)
            : formatResetTime(ctx.usageData.sevenDayResetAt);
        return `${label} ${red(`⚠ Limit reached${resetTime ? ` (resets ${resetTime})` : ''}`)}`;
    }
    const threshold = display?.usageThreshold ?? 0;
    const fiveHour = ctx.usageData.fiveHour ?? 0;
    const sevenDay = ctx.usageData.sevenDay ?? 0;
    const effectiveUsage = Math.max(fiveHour, sevenDay);
    if (effectiveUsage < threshold) {
        return null;
    }
    const usageBarEnabled = display?.usageBarEnabled ?? true;
    // Session cost estimate from token counts
    const costStr = formatSessionCost(ctx);
    if (usageBarEnabled) {
        // Unified dual-texture bar: █ = 5h periodic, ▓ = 7d longer-term
        const bar = dualQuotaBar(fiveHour, sevenDay);
        const fiveHourDisplay = formatUsagePercent(fiveHour);
        const sevenDayDisplay = formatUsagePercent(sevenDay);
        const legend = dim('5h:') + fiveHourDisplay + dim('/7d:') + sevenDayDisplay;
        const parts = [label, bar, legend];
        if (costStr)
            parts.push(dim(costStr));
        return parts.join(' ');
    }
    // Text-only fallback
    const fiveHourDisplay = formatUsagePercent(fiveHour);
    const sevenDayDisplay = formatUsagePercent(sevenDay);
    const parts = [label, `5h:${fiveHourDisplay} 7d:${sevenDayDisplay}`];
    if (costStr)
        parts.push(dim(costStr));
    return parts.join(' ');
}
function formatSessionCost(ctx) {
    const usage = ctx.stdin.context_window?.current_usage;
    if (!usage)
        return '';
    const inputTokens = usage.input_tokens ?? 0;
    const outputTokens = usage.output_tokens ?? 0;
    const cacheWrite = usage.cache_creation_input_tokens ?? 0;
    const cacheRead = usage.cache_read_input_tokens ?? 0;
    // Subtract cache tokens from input to avoid double-counting
    const plainInput = Math.max(0, inputTokens - cacheWrite - cacheRead);
    const cost = (plainInput / 1_000_000) * PRICE_INPUT +
        (outputTokens / 1_000_000) * PRICE_OUTPUT +
        (cacheWrite / 1_000_000) * PRICE_CACHE_WRITE +
        (cacheRead / 1_000_000) * PRICE_CACHE_READ;
    if (cost < 0.005)
        return '';
    return cost < 1
        ? `~$${cost.toFixed(2)}`
        : `~$${cost.toFixed(1)}`;
}
function formatUsagePercent(percent) {
    if (percent === null) {
        return dim('--');
    }
    const color = getContextColor(percent);
    return `${color}${percent}%${RESET}`;
}
function formatUsageError(error) {
    if (!error)
        return '';
    if (error.startsWith('http-')) {
        return ` (${error.slice(5)})`;
    }
    return ` (${error})`;
}
function formatResetTime(resetAt) {
    if (!resetAt)
        return '';
    const now = new Date();
    const diffMs = resetAt.getTime() - now.getTime();
    if (diffMs <= 0)
        return '';
    const diffMins = Math.ceil(diffMs / 60000);
    if (diffMins < 60)
        return `${diffMins}m`;
    const hours = Math.floor(diffMins / 60);
    const mins = diffMins % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
//# sourceMappingURL=usage.js.map