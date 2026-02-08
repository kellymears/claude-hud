import type { RenderContext } from '../../types.js';
import { isLimitReached } from '../../types.js';
import { getProviderLabel } from '../../stdin.js';
import { formatCost } from '../../cost-tracker.js';
import { red, yellow, dim, getContextColor, dualQuotaBar, RESET } from '../colors.js';

export function renderUsageLine(ctx: RenderContext): string | null {
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

  // Window cost estimate (accumulated across compressions/sessions)
  const costStr = formatCost(ctx.windowCost);

  if (usageBarEnabled) {
    // Unified dual-texture bar: █ = 5h periodic, ▓ = 7d longer-term
    const bar = dualQuotaBar(fiveHour, sevenDay);
    const fiveHourDisplay = formatUsagePercent(fiveHour);
    const sevenDayDisplay = formatUsagePercent(sevenDay);
    const legend = dim('5h:') + fiveHourDisplay + dim('/7d:') + sevenDayDisplay;
    const parts = [label, bar, legend];
    if (costStr) parts.push(dim(costStr));
    return parts.join(' ');
  }

  // Text-only fallback
  const fiveHourDisplay = formatUsagePercent(fiveHour);
  const sevenDayDisplay = formatUsagePercent(sevenDay);
  const parts = [label, `5h:${fiveHourDisplay} 7d:${sevenDayDisplay}`];
  if (costStr) parts.push(dim(costStr));
  return parts.join(' ');
}

function formatUsagePercent(percent: number | null): string {
  if (percent === null) {
    return dim('--');
  }
  const color = getContextColor(percent);
  return `${color}${percent}%${RESET}`;
}

function formatUsageError(error?: string): string {
  if (!error) return '';
  if (error.startsWith('http-')) {
    return ` (${error.slice(5)})`;
  }
  return ` (${error})`;
}

function formatResetTime(resetAt: Date | null): string {
  if (!resetAt) return '';
  const now = new Date();
  const diffMs = resetAt.getTime() - now.getTime();
  if (diffMs <= 0) return '';

  const diffMins = Math.ceil(diffMs / 60000);
  if (diffMins < 60) return `${diffMins}m`;

  const hours = Math.floor(diffMins / 60);
  const mins = diffMins % 60;
  return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
}
