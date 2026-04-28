"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Moon, CalendarDays, Clock, ArrowRight, ShieldCheck, HelpCircle, Sparkles, Mail } from "lucide-react";
import { getDay, parse, differenceInMinutes, isBefore } from "date-fns";

// Tooltip component for jargon
function Tooltip({ term, children }: { term: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);
  return (
    <span className="relative inline-flex items-center gap-0.5">
      <span>{term}</span>
      <button
        onClick={() => setShow(!show)}
        className="text-[#86868b] hover:text-[#0066cc] transition-colors"
        aria-label={`What is ${term}?`}
      >
        <HelpCircle className="w-3.5 h-3.5" />
      </button>
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 bg-[#1d1d1f] text-white text-[12px] leading-relaxed p-3 rounded-xl shadow-xl z-50">
          {children}
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 bg-[#1d1d1f] rotate-45 -mt-1"></div>
        </div>
      )}
    </span>
  );
}

export default function SingleShiftCalculator() {
  const today = new Date().toISOString().split("T")[0];
  const [data, setData] = useState({
    baseRate: "45",
    shiftDate: today,
    startTime: "19:00",
    endTime: "07:00",
    nightDiff: "6",
    weekendDiff: "4",
    isHoliday: false,
    holidayMultiplier: "1.5",
    chargeDiff: "",
    preceptorDiff: "",
    noLunch: false,
  });

  const [result, setResult] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<{label: string; hours: number; rate: number; amount: number}[]>([]);
  const [insight, setInsight] = useState<string>("");
  const [autoDetected, setAutoDetected] = useState<string[]>([]);

  const calculate = () => {
    const base = parseFloat(data.baseRate) || 0;
    const items: typeof breakdown = [];
    const detected: string[] = [];

    // Calculate hours from start/end time
    const startDate = parse(`${data.shiftDate} ${data.startTime}`, "yyyy-MM-dd HH:mm", new Date());
    let endDate = parse(`${data.shiftDate} ${data.endTime}`, "yyyy-MM-dd HH:mm", new Date());
    if (isBefore(endDate, startDate)) {
      endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
    }
    const breakMins = data.noLunch ? 0 : 30;
    const totalMinutes = differenceInMinutes(endDate, startDate) - breakMins;
    const hours = totalMinutes / 60;

    if (hours <= 0) { setResult(0); setBreakdown([]); return; }

    // Auto-detect night
    const startHour = parseInt(data.startTime.split(":")[0]);
    const isNight = startHour >= 19 || startHour < 7;
    if (isNight) detected.push("🌙 Night shift detected");

    // Auto-detect weekend
    const shiftDay = getDay(parse(data.shiftDate, "yyyy-MM-dd", new Date()));
    const isWeekend = shiftDay === 0 || shiftDay === 6;
    if (isWeekend) detected.push("📅 Weekend shift detected");

    setAutoDetected(detected);

    // Build effective rate
    let hourlyRate = base;

    if (data.isHoliday) {
      hourlyRate = base * (parseFloat(data.holidayMultiplier) || 1.5);
    }

    const nd = isNight ? (parseFloat(data.nightDiff) || 0) : 0;
    const wd = isWeekend ? (parseFloat(data.weekendDiff) || 0) : 0;
    const cd = parseFloat(data.chargeDiff) || 0;
    const pd = parseFloat(data.preceptorDiff) || 0;
    hourlyRate += nd + wd + cd + pd;

    // Build line items
    items.push({
      label: `Base rate${data.isHoliday ? " × " + data.holidayMultiplier + " holiday" : ""}`,
      hours,
      rate: data.isHoliday ? base * (parseFloat(data.holidayMultiplier) || 1.5) : base,
      amount: hours * (data.isHoliday ? base * (parseFloat(data.holidayMultiplier) || 1.5) : base),
    });
    if (nd > 0) items.push({ label: "Night differential", hours, rate: nd, amount: hours * nd });
    if (wd > 0) items.push({ label: "Weekend differential", hours, rate: wd, amount: hours * wd });
    if (cd > 0) items.push({ label: "Charge RN premium", hours, rate: cd, amount: hours * cd });
    if (pd > 0) items.push({ label: "Preceptor premium", hours, rate: pd, amount: hours * pd });

    const total = hourlyRate * hours;
    setBreakdown(items);
    setResult(total);

    // Generate "first signal" insight
    const signals: string[] = [];
    if (isNight && isWeekend) signals.push("Your night and weekend differentials are stacking — make sure your paystub reflects both additions, not just one.");
    else if (isNight) signals.push("Night differential detected. Verify your paystub shows the +$" + nd.toFixed(2) + "/hr addition, not just your base rate.");
    else if (isWeekend) signals.push("Weekend differential detected. Many payroll systems miss this — check that your gross is higher than a weekday shift.");
    if (data.isHoliday) signals.push("Holiday premium applied at " + data.holidayMultiplier + "×. Confirm your CBA specifies this multiplier.");
    if (hours > 12) signals.push("This is a " + hours.toFixed(1) + "-hour shift. If your hospital uses daily OT, you may be owed 1.5× after 8 or 12 hours — run a full audit to check.");
    setInsight(signals[0] || "");
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans selection:bg-[#0066cc] selection:text-white pb-32">
      <nav className="w-full px-6 py-6 flex items-center justify-between max-w-3xl mx-auto">
        <Link href="/" className="flex items-center gap-2 text-[#0066cc] hover:underline text-[15px]">
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <div className="px-3 py-1 bg-[#f5f5f7] rounded-full text-[12px] font-medium text-[#86868b] border border-[#d2d2d7]/50">
          Free Tool
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 py-8 flex flex-col items-center">
        <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-6">
          <Calculator className="w-8 h-8 text-[#1d1d1f]" strokeWidth={1.5} />
        </div>
        <h1 className="text-[40px] font-semibold tracking-tight mb-4 text-center">Shift Calculator</h1>
        <p className="text-[#86868b] text-[19px] text-center mb-12 max-w-md leading-relaxed tracking-tight">
          Enter your shift. We auto-detect nights and weekends from the date.
        </p>

        <div className="w-full bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#e5e5ea] mb-8">
          
          {/* Shift Time Entry */}
          <div className="mb-8">
            <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-widest mb-4">Your Shift</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-[15px] font-medium text-[#1d1d1f]">Date</label>
                <input type="date" value={data.shiftDate} onChange={(e) => setData({...data, shiftDate: e.target.value})} className="w-full bg-[#f5f5f7] border-none rounded-[16px] px-4 py-3.5 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none focus:bg-white transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-medium text-[#1d1d1f]">Clock In</label>
                <input type="time" value={data.startTime} onChange={(e) => setData({...data, startTime: e.target.value})} className="w-full bg-[#f5f5f7] border-none rounded-[16px] px-4 py-3.5 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none focus:bg-white transition-colors" />
              </div>
              <div className="space-y-2">
                <label className="text-[15px] font-medium text-[#1d1d1f]">Clock Out</label>
                <input type="time" value={data.endTime} onChange={(e) => setData({...data, endTime: e.target.value})} className="w-full bg-[#f5f5f7] border-none rounded-[16px] px-4 py-3.5 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none focus:bg-white transition-colors" />
              </div>
            </div>
            <label className="flex items-center gap-2 mt-3 cursor-pointer text-[14px] text-[#86868b] hover:text-[#1d1d1f] transition-colors">
              <input type="checkbox" checked={data.noLunch} onChange={(e) => setData({...data, noLunch: e.target.checked})} className="accent-[#0066cc] w-4 h-4" />
              No lunch break (skip 30-min deduction)
            </label>
          </div>

          {/* Pay Rate */}
          <div className="mb-8">
            <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-widest mb-4">Pay Rate</h3>
            <div className="space-y-3">
              <label className="text-[15px] font-medium text-[#1d1d1f]">Base Hourly Rate</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] font-medium">$</span>
                <input type="number" inputMode="decimal" value={data.baseRate} onChange={(e) => setData({...data, baseRate: e.target.value})} className="w-full bg-[#f5f5f7] border-none rounded-[16px] pl-8 pr-4 py-3.5 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none focus:bg-white transition-colors" />
              </div>
            </div>
          </div>

          {/* Differentials */}
          <div className="space-y-3 mb-8">
            <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-widest mb-4">
              <Tooltip term="Differentials">Extra $/hr added to your base rate for specific conditions like nights, weekends, or holidays. These are set by your CBA or hospital policy.</Tooltip>
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#f5f5f7] rounded-[16px] p-4">
                <label className="text-[13px] text-[#86868b] font-medium mb-1.5 block">
                  <Tooltip term="Night Diff">Flat $/hr added when your shift starts between 7pm–7am. Auto-detected from your clock-in time.</Tooltip>
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b]">+$</span>
                  <input type="number" inputMode="decimal" value={data.nightDiff} onChange={(e) => setData({...data, nightDiff: e.target.value})} className="w-full bg-transparent text-[17px] text-[#1d1d1f] focus:outline-none" placeholder="0" />
                </div>
              </div>
              <div className="bg-[#f5f5f7] rounded-[16px] p-4">
                <label className="text-[13px] text-[#86868b] font-medium mb-1.5 block">
                  <Tooltip term="Weekend Diff">Flat $/hr added for Saturday and Sunday shifts. Auto-detected from the date you enter.</Tooltip>
                </label>
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b]">+$</span>
                  <input type="number" inputMode="decimal" value={data.weekendDiff} onChange={(e) => setData({...data, weekendDiff: e.target.value})} className="w-full bg-transparent text-[17px] text-[#1d1d1f] focus:outline-none" placeholder="0" />
                </div>
              </div>
              <div className="bg-[#f5f5f7] rounded-[16px] p-4">
                <label className="text-[13px] text-[#86868b] font-medium mb-1.5 block">Charge RN</label>
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b]">+$</span>
                  <input type="number" inputMode="decimal" value={data.chargeDiff} onChange={(e) => setData({...data, chargeDiff: e.target.value})} className="w-full bg-transparent text-[17px] text-[#1d1d1f] focus:outline-none" placeholder="0" />
                </div>
              </div>
              <div className="bg-[#f5f5f7] rounded-[16px] p-4">
                <label className="text-[13px] text-[#86868b] font-medium mb-1.5 block">Preceptor</label>
                <div className="flex items-center gap-1">
                  <span className="text-[#86868b]">+$</span>
                  <input type="number" inputMode="decimal" value={data.preceptorDiff} onChange={(e) => setData({...data, preceptorDiff: e.target.value})} className="w-full bg-transparent text-[17px] text-[#1d1d1f] focus:outline-none" placeholder="0" />
                </div>
              </div>
            </div>

            {/* Holiday toggle */}
            <label className="flex items-center gap-3 bg-[#f5f5f7] rounded-[16px] p-4 cursor-pointer hover:bg-[#e8e8ed] transition-colors">
              <input type="checkbox" checked={data.isHoliday} onChange={(e) => setData({...data, isHoliday: e.target.checked})} className="w-[20px] h-[20px] accent-[#0066cc]" />
              <span className="text-[17px] text-[#1d1d1f] flex-1">Holiday</span>
              {data.isHoliday && (
                <div className="flex items-center gap-1 text-[17px] text-[#86868b]">
                  <input type="number" value={data.holidayMultiplier} onChange={(e) => setData({...data, holidayMultiplier: e.target.value})} className="w-12 bg-transparent border-b border-[#d2d2d7] text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] text-center" />
                  <span>×</span>
                </div>
              )}
            </label>
          </div>

          {/* Travel Nurse CTA */}
          <div className="bg-[#f5f5f7] rounded-[16px] p-4 mb-8 flex items-center gap-3">
            <Mail className="w-5 h-5 text-[#86868b] flex-shrink-0" />
            <p className="text-[13px] text-[#86868b]">
              <span className="font-semibold text-[#1d1d1f]">Travel nurse?</span> Stipend support is coming soon.{" "}
              <a href="mailto:support@shiftcheck.app?subject=Travel%20Nurse%20Interest" className="text-[#0066cc] hover:underline">Drop your email</a> to be first.
            </p>
          </div>

          <button onClick={calculate} className="w-full bg-[#0066cc] text-white text-[17px] font-medium py-4 rounded-full hover:bg-[#0055b3] transition-colors">
            Calculate Shift Gross
          </button>
        </div>

        {/* Results */}
        {result !== null && (
          <div className="w-full bg-[#f5f5f7] rounded-[32px] p-10 text-center animate-in slide-in-from-bottom-8 fade-in duration-500 border border-[#e5e5ea]">
            
            {/* Auto-detection badges */}
            {autoDetected.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 mb-6">
                {autoDetected.map((d, i) => (
                  <span key={i} className="px-3 py-1 bg-white rounded-full text-[13px] font-medium text-[#1d1d1f] border border-[#e5e5ea]">{d}</span>
                ))}
              </div>
            )}

            <p className="text-[#86868b] mb-4 text-[13px] font-medium uppercase tracking-widest">Estimated Gross (Before Taxes)</p>
            <div className="flex items-start justify-center gap-1 mb-8">
              <span className="text-[32px] text-[#1d1d1f] font-medium mt-1">$</span>
              <span className="text-[64px] font-semibold text-[#1d1d1f] tracking-tight leading-none">{result.toFixed(2)}</span>
            </div>
            
            {/* Line-by-line math — FREE */}
            <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 mb-6 text-left">
              <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-widest mb-4">Show the Math</h3>
              <div className="space-y-3">
                {breakdown.map((item, i) => (
                  <div key={i} className="flex justify-between items-center border-b border-[#f5f5f7] pb-2">
                    <div className="flex flex-col">
                      <span className="text-[15px] font-medium text-[#1d1d1f]">{item.label}</span>
                      <span className="text-[13px] text-[#86868b]">{item.hours.toFixed(1)} hrs × ${item.rate.toFixed(2)}/hr</span>
                    </div>
                    <span className="text-[17px] font-semibold text-[#1d1d1f]">${item.amount.toFixed(2)}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center mt-4 pt-3 border-t border-[#e5e5ea]">
                <span className="font-semibold text-[15px]">Total</span>
                <span className="font-semibold text-[19px]">${result.toFixed(2)}</span>
              </div>
            </div>

            {/* First Signal Insight */}
            {insight && (
              <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 mb-6 text-left flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#0066cc] flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-[14px] font-semibold text-[#1d1d1f] mb-1">Quick check</p>
                  <p className="text-[14px] text-[#86868b] leading-relaxed">{insight}</p>
                </div>
              </div>
            )}

            {/* Soft upsell */}
            <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 mb-6 text-left">
              <p className="text-[15px] text-[#1d1d1f] leading-relaxed">
                <span className="font-semibold">This is a single shift.</span> To audit a full pay period with{" "}
                <Tooltip term="8/80 overtime">An FLSA exception for hospitals: overtime after 8 hrs/day or 80 hrs in a 14-day period (29 USC §207(j)).</Tooltip>
                , <Tooltip term="Baylor">A weekend program where nurses work ~36 hours but are paid for 40. Terms vary by employer.</Tooltip>
                , and multi-shift stacking, start a full audit.
              </p>
            </div>
            
            <Link href="/login" className="inline-flex items-center justify-center gap-2 bg-[#1d1d1f] text-white px-8 py-4 rounded-full text-[17px] font-medium hover:bg-[#000000] transition-colors w-full sm:w-auto">
              Audit full pay period <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
