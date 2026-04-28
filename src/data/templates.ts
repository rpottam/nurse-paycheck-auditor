import { CBATemplate } from '../types';

export const CBA_TEMPLATES: CBATemplate[] = [
  {
    id: 'kaiser-norcal-cna',
    name: 'Kaiser Permanente Northern California (CNA)',
    region: 'CA',
    union: 'California Nurses Association',
    basePay: 65.5,
    nightDiff: 6.0,
    weekendDiff: 4.0,
    overtimeRule: '8_80',
  },
  {
    id: 'providence-oregon-ona',
    name: 'Providence Oregon (ONA)',
    region: 'OR',
    union: 'Oregon Nurses Association',
    basePay: 58.0,
    nightDiff: 5.5,
    weekendDiff: 3.5,
    overtimeRule: 'weekly_40',
  },
  {
    id: 'hca-standard',
    name: 'HCA Healthcare (Standard Non-Union)',
    region: 'National',
    union: 'None',
    basePay: 45.0,
    nightDiff: 4.0,
    weekendDiff: 3.0,
    overtimeRule: 'weekly_40',
  },
  {
    id: 'mass-general-mna',
    name: 'Mass General Brigham (MNA)',
    region: 'MA',
    union: 'Massachusetts Nurses Association',
    basePay: 55.0,
    nightDiff: 5.0,
    weekendDiff: 4.0,
    overtimeRule: 'weekly_40',
  },
];
