import { Shift, UserProfile, PayPeriod } from '../types';
import { differenceInMinutes, parse, format, isAfter, isBefore } from 'date-fns';

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
};

export function calculatePayPeriod(profile: UserProfile, payPeriod: PayPeriod): AuditResult {
  let totalGross = 0;
  const lineItems: LineItem[] = [];
  const rulesApplied = new Set<string>();

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
    
    if (hours <= 0) continue;

    // Apply base rate
    let baseRate = profile.baseRate;
    let shiftMultiplier = 1;

    // Check holiday
    if (shift.isHoliday) {
      shiftMultiplier = 1.5;
      rulesApplied.add('holiday_multiplier');
    }

    // Charge nurse differential
    if (shift.role === 'charge') {
      baseRate += 2.0; // Mock charge diff
      rulesApplied.add('charge_differential');
    }

    // Preceptor differential
    if (shift.role === 'preceptor') {
      baseRate += 1.5; // Mock preceptor diff
      rulesApplied.add('preceptor_differential');
    }

    // Determine differentials based on shift times (simplified for MVP)
    const isNight = parseInt(shift.startTime.split(':')[0]) >= 19 || parseInt(shift.startTime.split(':')[0]) < 7;
    let effectiveRate = baseRate * shiftMultiplier;

    if (isNight && profile.nightDiff) {
      effectiveRate += profile.nightDiff;
      rulesApplied.add('night_differential');
    }

    // Calculate daily overtime
    let straightHours = hours;
    let otHours = 0;

    if (profile.overtimeRule === 'daily_8' && hours > 8) {
      straightHours = 8;
      otHours = hours - 8;
      rulesApplied.add('daily_overtime');
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
      description: `${format(start, 'MMM dd')} - ${shift.role} shift (Straight)`,
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
        description: `${format(start, 'MMM dd')} - OT (1.5x)`,
        hours: otHours,
        rate: otRate,
        amount: otAmount
      });
    }
  }

  // Weekly Overtime Calculation
  if (profile.overtimeRule === 'weekly_40' && totalRegularHours > 40) {
     const weeklyOtHours = totalRegularHours - 40;
     const weeklyOtRate = profile.baseRate * 1.5; // Simplified blended rate logic
     const weeklyOtAmount = weeklyOtHours * weeklyOtRate;
     
     // Deduct the straight pay for those hours and add OT pay
     totalGross -= (weeklyOtHours * profile.baseRate);
     totalGross += weeklyOtAmount;
     
     rulesApplied.add('weekly_40_overtime');
     lineItems.push({
       description: `Weekly OT (>40 hrs)`,
       hours: weeklyOtHours,
       rate: weeklyOtRate,
       amount: weeklyOtAmount - (weeklyOtHours * profile.baseRate)
     });
  }

  return {
    expectedGross: totalGross,
    lineItems,
    rulesApplied: Array.from(rulesApplied)
  };
}
