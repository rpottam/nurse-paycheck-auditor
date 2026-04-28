export type UserProfile = {
  hospitalTemplateId: string;
  employmentType: 'full-time' | 'part-time' | 'per-diem' | 'travel';
  baseRate: number;
  nightDiff: number;
  weekendDiff: number;
  overtimeRule: '8_80' | 'weekly_40' | 'daily_8' | 'daily_12';
  baylorEnabled?: boolean;
};

export type Shift = {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  role: 'regular' | 'charge' | 'preceptor';
  isHoliday: boolean;
  isBaylorWeekend?: boolean;
  breakDeductionMinutes: number;
};

export type PayPeriod = {
  id: string;
  startDate: string;
  endDate: string;
  shifts: Shift[];
  actualGrossEntered?: number;
};

export type CBATemplate = {
  id: string;
  name: string;
  region: string;
  union: string;
  basePay?: number;
  nightDiff?: number;
  weekendDiff?: number;
  overtimeRule?: '8_80' | 'weekly_40' | 'daily_8' | 'daily_12';
};
