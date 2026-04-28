import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { Shift, UserProfile, PayPeriod } from '../types';
import { calculatePayPeriod, AuditResult } from './engine';

export async function generateDisputeReport(
  profile: UserProfile, 
  payPeriod: PayPeriod,
  actualGross: number
): Promise<Uint8Array> {
  const auditResult = calculatePayPeriod(profile, payPeriod);
  const delta = auditResult.expectedGross - actualGross;

  // Create a new PDF document
  const pdfDoc = await PDFDocument.create();
  const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
  const timesRomanBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const page = pdfDoc.addPage([612, 792]); // Standard US Letter size
  const { width, height } = page.getSize();
  
  let y = height - 50;
  const leftMargin = 50;

  // Draw Header
  page.drawText('GROSS WAGE VERIFICATION & DISPUTE REPORT', {
    x: leftMargin,
    y,
    size: 16,
    font: helveticaBold,
    color: rgb(0, 0, 0),
  });
  
  y -= 25;
  page.drawText('This document is a mathematical audit of expected gross wages based on applied hospital pay rules.', {
    x: leftMargin,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  y -= 15;
  page.drawText('Disclaimer: This calculates expected GROSS pay before taxes and standard deductions.', {
    x: leftMargin,
    y,
    size: 10,
    font: helveticaFont,
    color: rgb(0.3, 0.3, 0.3),
  });

  // Pay Period & Profile Summary
  y -= 40;
  page.drawText('EMPLOYEE PROFILE', { x: leftMargin, y, size: 12, font: helveticaBold });
  y -= 20;
  page.drawText(`Hospital / CBA: ${profile.hospitalTemplateId}`, { x: leftMargin, y, size: 11, font: helveticaFont });
  y -= 15;
  page.drawText(`Base Hourly Rate: $${profile.baseRate.toFixed(2)}`, { x: leftMargin, y, size: 11, font: helveticaFont });
  y -= 15;
  const otLabels: Record<string, string> = { 'weekly_40': 'Weekly >40 (29 USC §207(a)(1))', 'daily_8': 'Daily >8 (Cal. Lab. Code §510)', 'daily_12': 'Daily >12 AWS (Cal. Lab. Code §511)', '8_80': 'FLSA 8/80 (29 USC §207(j); 29 CFR §553.50)' };
  page.drawText(`Overtime Rule: ${otLabels[profile.overtimeRule] || profile.overtimeRule}`, { x: leftMargin, y, size: 11, font: helveticaFont });
  y -= 15;
  page.drawText(`Pay Period: ${payPeriod.startDate} to ${payPeriod.endDate}`, { x: leftMargin, y, size: 11, font: helveticaFont });
  
  // Financial Summary
  y -= 40;
  page.drawText('AUDIT SUMMARY', { x: leftMargin, y, size: 12, font: helveticaBold });
  y -= 20;
  page.drawText(`Expected Gross Pay (Calculated):`, { x: leftMargin, y, size: 11, font: helveticaFont });
  page.drawText(`$${auditResult.expectedGross.toFixed(2)}`, { x: 300, y, size: 11, font: helveticaBold });
  y -= 15;
  page.drawText(`Actual Gross Pay (Reported):`, { x: leftMargin, y, size: 11, font: helveticaFont });
  page.drawText(`$${actualGross.toFixed(2)}`, { x: 300, y, size: 11, font: helveticaBold });
  y -= 20;
  
  const isOwed = delta > 0;
  page.drawText(`DISCREPANCY (Amount Owed):`, { x: leftMargin, y, size: 12, font: helveticaBold });
  page.drawText(`$${Math.max(0, delta).toFixed(2)}`, { 
    x: 300, 
    y, 
    size: 14, 
    font: helveticaBold,
    color: isOwed ? rgb(0.8, 0, 0) : rgb(0, 0.5, 0)
  });

  // Shifts Log
  y -= 40;
  page.drawText('LOGGED SHIFTS', { x: leftMargin, y, size: 12, font: helveticaBold });
  y -= 20;
  
  // Table header
  page.drawText('Date', { x: leftMargin, y, size: 10, font: helveticaBold });
  page.drawText('Time', { x: leftMargin + 80, y, size: 10, font: helveticaBold });
  page.drawText('Role', { x: leftMargin + 200, y, size: 10, font: helveticaBold });
  page.drawText('Holiday?', { x: leftMargin + 300, y, size: 10, font: helveticaBold });
  
  y -= 15;
  payPeriod.shifts.forEach(shift => {
    page.drawText(shift.date, { x: leftMargin, y, size: 10, font: helveticaFont });
    page.drawText(`${shift.startTime} - ${shift.endTime}`, { x: leftMargin + 80, y, size: 10, font: helveticaFont });
    page.drawText(shift.role, { x: leftMargin + 200, y, size: 10, font: helveticaFont });
    page.drawText(shift.isHoliday ? 'Yes' : 'No', { x: leftMargin + 300, y, size: 10, font: helveticaFont });
    y -= 15;
  });

  // Math Breakdown
  y -= 25;
  page.drawText('MATHEMATICAL BREAKDOWN', { x: leftMargin, y, size: 12, font: helveticaBold });
  y -= 20;
  
  page.drawText('Description', { x: leftMargin, y, size: 10, font: helveticaBold });
  page.drawText('Hours', { x: leftMargin + 250, y, size: 10, font: helveticaBold });
  page.drawText('Rate', { x: leftMargin + 320, y, size: 10, font: helveticaBold });
  page.drawText('Total', { x: leftMargin + 400, y, size: 10, font: helveticaBold });
  
  y -= 15;
  auditResult.lineItems.forEach(item => {
    page.drawText(item.description, { x: leftMargin, y, size: 10, font: helveticaFont });
    page.drawText(item.hours.toFixed(2), { x: leftMargin + 250, y, size: 10, font: helveticaFont });
    page.drawText(`$${item.rate.toFixed(2)}`, { x: leftMargin + 320, y, size: 10, font: helveticaFont });
    page.drawText(`$${item.amount.toFixed(2)}`, { x: leftMargin + 400, y, size: 10, font: helveticaFont });
    y -= 15;
  });

  // FLSA References
  y -= 25;
  page.drawText('LEGAL BASIS', { x: leftMargin, y, size: 10, font: helveticaBold, color: rgb(0.4, 0.4, 0.4) });
  y -= 14;
  page.drawText('Overtime: 29 USC §207; 29 CFR §778.110–§778.119. Hospital 8/80: 29 CFR §553.50.', { x: leftMargin, y, size: 8, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });
  y -= 11;
  page.drawText('Methodology: shiftcheck.app/methodology • Engine v0.1.0 • Deterministic (zero AI in calculation path)', { x: leftMargin, y, size: 8, font: helveticaFont, color: rgb(0.5, 0.5, 0.5) });

  // Footer
  const dateStr = new Date().toLocaleString();
  page.drawText(`Generated by ShiftCheck • ${dateStr}`, {
    x: leftMargin,
    y: 30,
    size: 9,
    font: helveticaFont,
    color: rgb(0.5, 0.5, 0.5),
  });

  return await pdfDoc.save();
}
