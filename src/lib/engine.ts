import { Shift, UserProfile, PayPeriod } from '../types';
import { differenceInMinutes, parse, format, isAfter, isBefore, getDay } from 'date-fns';

export type LineItem = {
  description: string;
  hours: number;
  rate: number;
  amount: number;
};

export type AuditResult = {
  expectedGross: number;
  lineItems: LineItem[];
  rulesApplied: string[];
  warnings: string[];
};

export function calculatePayPeriod(profile: UserProfile, payPeriod: PayPeriod): AuditResult {
  let totalGross = 0;
  const lineItems: LineItem[] = [];
  const rulesApplied = new Set<string>();
  const warnings: string[] = [];

  let totalRegularHours = 0;

  for (const shift of payPeriod.shifts) {
    const start = parse(`${shift.date} ${shift.startTime}`, 'yyyy-MM-dd HH:mm', new Date());
    let end = parse(`${shift.date} ${shift.endTime}`, 'yyyy-MM-dd HH:mm', new Date());
    
    if (isBefore(end, start)) {
      // Crosses midnight
      end = new Date(end.getTime() + 24 * 60 * 60 * 1000);
    }

    let minutes = differenceInMinutes(end, start) - shift.breakDeductionMinutes;
    let hours = minutes / 60;
    
    if (hours <= 0) {
      warnings.push(`Shift on ${shift.date} has zero or negative hours after break deduction. Skipped.`);
      continue;
    }

    // Apply base rate (per-shift override for float pool, else profile base)
    let baseRate = shift.rateOverride ?? profile.baseRate;
    let shiftMultiplier = 1;

    // Check holiday
    if (shift.isHoliday) {
      shiftMultiplier = 1.5;
      rulesApplied.add('holiday_premium');
    }

    // Charge nurse differential (configurable, defaults to $2)
    if (shift.role === 'charge') {
      baseRate += profile.chargeDiff ?? 2.0;
      rulesApplied.add('charge_differential');
    }

    // Preceptor differential (configurable, defaults to $1.50)
    if (shift.role === 'preceptor') {
      baseRate += profile.preceptorDiff ?? 1.5;
      rulesApplied.add('preceptor_differential');
    }

    // Determine night differential based on shift start time
    const startHour = parseInt(shift.startTime.split(':')[0]);
    const isNight = startHour >= 19 || startHour < 7;
    let effectiveRate = baseRate * shiftMultiplier;

    if (isNight && profile.nightDiff) {
      effectiveRate += profile.nightDiff;
      rulesApplied.add('night_differential');
    }

    // Weekend differential — check day of week (0=Sun, 6=Sat)
    const shiftDate = parse(shift.date, 'yyyy-MM-dd', new Date());
    const dayOfWeek = getDay(shiftDate);
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6; // Sunday or Saturday

    if (isWeekend && profile.weekendDiff) {
      effectiveRate += profile.weekendDiff;
      rulesApplied.add('weekend_differential');
    }

    // Calculate daily overtime
    let straightHours = hours;
    let otHours = 0;

    if (profile.overtimeRule === 'daily_8' && hours > 8) {
      straightHours = 8;
      otHours = hours - 8;
      rulesApplied.add('daily_8_overtime');
    } else if (profile.overtimeRule === 'daily_12' && hours > 12) {
      straightHours = 12;
      otHours = hours - 12;
      rulesApplied.add('daily_12_overtime');
    } else if (profile.overtimeRule === '8_80' && hours > 8) {
      straightHours = 8;
      otHours = hours - 8;
      rulesApplied.add('8_80_overtime');
    }

    // Straight time line item
    const straightAmount = straightHours * effectiveRate;
    totalGross += straightAmount;
    totalRegularHours += straightHours;

    lineItems.push({
      description: `${format(start, 'MMM dd')} — ${shift.role} (Straight)`,
      hours: straightHours,
      rate: effectiveRate,
      amount: straightAmount
    });

    // Overtime line item
    if (otHours > 0) {
      const otRate = effectiveRate * 1.5;
      const otAmount = otHours * otRate;
      totalGross += otAmount;
      lineItems.push({
        description: `${format(start, 'MMM dd')} — OT (1.5×)`,
        hours: otHours,
        rate: otRate,
        amount: otAmount
      });
    }
  }

  // Weekly Overtime Calculation (>40 hrs)
  if (profile.overtimeRule === 'weekly_40' && totalRegularHours > 40) {
     const weeklyOtHours = totalRegularHours - 40;
     const weeklyOtRate = profile.baseRate * 1.5;
     const weeklyOtAmount = weeklyOtHours * weeklyOtRate;
     
     totalGross -= (weeklyOtHours * profile.baseRate);
     totalGross += weeklyOtAmount;
     
     rulesApplied.add('weekly_40_overtime');
     lineItems.push({
       description: `Weekly OT (>40 hrs)`,
       hours: weeklyOtHours,
       rate: weeklyOtRate,
       amount: weeklyOtAmount - (weeklyOtHours * profile.baseRate)
     });

     // Refuse-rather-than-mislead: blended rate warning
     if (rulesApplied.has('night_differential') || rulesApplied.has('weekend_differential') || rulesApplied.has('charge_differential')) {
       warnings.push(
         "⚠️ Blended-rate OT: Your overtime was calculated at 1.5× your base rate. FLSA requires a weighted-average (blended) rate when multiple pay rates apply in the same week. Your actual OT premium may be slightly higher. We are adding full blended-rate support in a future update."
       );
     }
  }

  // Baylor Pay Logic — work 36, get paid 40
  if (profile.baylorEnabled && totalRegularHours >= 36 && totalRegularHours < 40) {
    const baylorHours = 40 - totalRegularHours;
    const baylorAmount = baylorHours * profile.baseRate;
    totalGross += baylorAmount;
    
    rulesApplied.add('baylor_bonus');
    lineItems.push({
      description: `Baylor Weekend Bonus (36 → 40)`,
      hours: baylorHours,
      rate: profile.baseRate,
      amount: baylorAmount
    });
  }

  return {
    expectedGross: totalGross,
    lineItems,
    rulesApplied: Array.from(rulesApplied),
    warnings
  };
}
