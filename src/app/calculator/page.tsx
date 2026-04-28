"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Calculator, Moon, CalendarDays, DollarSign, ArrowRight, ShieldCheck } from "lucide-react";

export default function SingleShiftCalculator() {
  const [data, setData] = useState({
    baseRate: "45",
    hoursWorked: "12",
    isNight: false,
    nightDiff: "6",
    isWeekend: false,
    weekendDiff: "4",
    isHoliday: false,
    holidayMultiplier: "1.5"
  });

  const [result, setResult] = useState<number | null>(null);
  const [breakdown, setBreakdown] = useState<{label: string; hours: number; rate: number; amount: number}[]>([]);

  const calculate = () => {
    const base = parseFloat(data.baseRate) || 0;
    const hours = parseFloat(data.hoursWorked) || 0;
    const items: typeof breakdown = [];
    
    let hourlyRate = base;
    
    if (data.isHoliday) {
      hourlyRate = base * (parseFloat(data.holidayMultiplier) || 1.5);
    }
    
    if (data.isNight) {
      hourlyRate += (parseFloat(data.nightDiff) || 0);
    }
    
    if (data.isWeekend) {
      hourlyRate += (parseFloat(data.weekendDiff) || 0);
    }

    // Build line items
    items.push({ label: `Base rate${data.isHoliday ? ' × ' + data.holidayMultiplier + ' holiday' : ''}`, hours, rate: data.isHoliday ? base * (parseFloat(data.holidayMultiplier) || 1.5) : base, amount: hours * (data.isHoliday ? base * (parseFloat(data.holidayMultiplier) || 1.5) : base) });
    
    if (data.isNight) {
      const nd = parseFloat(data.nightDiff) || 0;
      items.push({ label: 'Night differential', hours, rate: nd, amount: hours * nd });
    }
    if (data.isWeekend) {
      const wd = parseFloat(data.weekendDiff) || 0;
      items.push({ label: 'Weekend differential', hours, rate: wd, amount: hours * wd });
    }

    setBreakdown(items);
    setResult(hourlyRate * hours);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans selection:bg-[#0066cc] selection:text-white pb-32">
      
      {/* Navigation */}
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
        
        <h1 className="text-[40px] font-semibold tracking-tight mb-4 text-center">
          Shift Calculator
        </h1>
        <p className="text-[#86868b] text-[19px] text-center mb-12 max-w-md leading-relaxed tracking-tight">
          Quickly verify your pay for a single shift. Check if your differentials stacked correctly.
        </p>

        <div className="w-full bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#e5e5ea] mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-10">
            <div className="space-y-3">
              <label className="text-[15px] font-medium text-[#1d1d1f]">Base Hourly Rate</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] font-medium">$</span>
                <input 
                  type="number"
                  inputMode="decimal"
                  pattern="[0-9]*"
                  value={data.baseRate}
                  onChange={(e) => setData({...data, baseRate: e.target.value})}
                  className="w-full bg-[#f5f5f7] border-none rounded-[16px] pl-8 pr-4 py-3.5 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-[15px] font-medium text-[#1d1d1f]">Hours Worked</label>
              <input 
                type="number"
                inputMode="decimal"
                pattern="[0-9]*"
                value={data.hoursWorked}
                onChange={(e) => setData({...data, hoursWorked: e.target.value})}
                className="w-full bg-[#f5f5f7] border-none rounded-[16px] px-4 py-3.5 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3 mb-10">
            <h3 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-widest mb-4">Differentials</h3>
            
            {/* Night Diff */}
            <div className="flex items-center gap-4 bg-[#f5f5f7] rounded-[20px] p-4 transition-colors">
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={data.isNight}
                  onChange={(e) => setData({...data, isNight: e.target.checked})}
                  className="w-[20px] h-[20px] accent-[#0066cc] rounded cursor-pointer"
                />
                <div className="flex items-center gap-2 text-[#1d1d1f]">
                  <Moon className="w-[18px] h-[18px]" />
                  <span className="text-[17px]">Night Shift</span>
                </div>
              </label>
              {data.isNight && (
                <div className="flex items-center gap-1 w-24">
                  <span className="text-[#86868b]">+$</span>
                  <input 
                    type="number" 
                    value={data.nightDiff}
                    onChange={(e) => setData({...data, nightDiff: e.target.value})}
                    className="w-full bg-transparent border-b border-[#d2d2d7] text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] px-1 text-center text-[17px]"
                  />
                </div>
              )}
            </div>

            {/* Weekend Diff */}
            <div className="flex items-center gap-4 bg-[#f5f5f7] rounded-[20px] p-4 transition-colors">
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={data.isWeekend}
                  onChange={(e) => setData({...data, isWeekend: e.target.checked})}
                  className="w-[20px] h-[20px] accent-[#0066cc] rounded cursor-pointer"
                />
                <div className="flex items-center gap-2 text-[#1d1d1f]">
                  <CalendarDays className="w-[18px] h-[18px]" />
                  <span className="text-[17px]">Weekend Shift</span>
                </div>
              </label>
              {data.isWeekend && (
                <div className="flex items-center gap-1 w-24">
                  <span className="text-[#86868b]">+$</span>
                  <input 
                    type="number" 
                    value={data.weekendDiff}
                    onChange={(e) => setData({...data, weekendDiff: e.target.value})}
                    className="w-full bg-transparent border-b border-[#d2d2d7] text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] px-1 text-center text-[17px]"
                  />
                </div>
              )}
            </div>
            
            {/* Holiday */}
            <div className="flex items-center gap-4 bg-[#f5f5f7] rounded-[20px] p-4 transition-colors">
              <label className="flex items-center gap-3 flex-1 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={data.isHoliday}
                  onChange={(e) => setData({...data, isHoliday: e.target.checked})}
                  className="w-[20px] h-[20px] accent-[#0066cc] rounded cursor-pointer"
                />
                <span className="text-[17px] text-[#1d1d1f]">Holiday</span>
              </label>
              {data.isHoliday && (
                <div className="flex items-center gap-1 w-24 text-[17px] text-[#86868b]">
                  <input 
                    type="number" 
                    value={data.holidayMultiplier}
                    onChange={(e) => setData({...data, holidayMultiplier: e.target.value})}
                    className="w-12 bg-transparent border-b border-[#d2d2d7] text-[#1d1d1f] focus:outline-none focus:border-[#0066cc] px-1 text-center"
                  />
                  <span>x</span>
                </div>
              )}
            </div>
          </div>

          <button 
            onClick={calculate}
            className="w-full bg-[#0066cc] text-white text-[17px] font-medium py-4 rounded-full hover:bg-[#0055b3] transition-colors"
          >
            Calculate Shift Gross
          </button>
        </div>

        {/* Results section */}
        {result !== null && (
          <div className="w-full bg-[#f5f5f7] rounded-[32px] p-10 text-center animate-in slide-in-from-bottom-8 fade-in duration-500 border border-[#e5e5ea]">
            <p className="text-[#86868b] mb-4 text-[13px] font-medium uppercase tracking-widest">Estimated Gross (Before Taxes)</p>
            <div className="flex items-start justify-center gap-1 mb-8">
              <span className="text-[32px] text-[#1d1d1f] font-medium mt-1">$</span>
              <span className="text-[64px] font-semibold text-[#1d1d1f] tracking-tight leading-none">
                {result.toFixed(2)}
              </span>
            </div>
            
            {/* Line-by-line math breakdown — FREE */}
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

            {/* Soft upsell */}
            <div className="bg-white border border-[#e5e5ea] rounded-2xl p-5 mb-6 text-left">
              <p className="text-[15px] text-[#1d1d1f] leading-relaxed">
                <span className="font-semibold">This looks like a single shift.</span> To audit a full pay period with 8/80 overtime, Baylor, and stacking across multiple shifts, start a full audit and get an HR Dispute Report.
              </p>
            </div>
            
            <Link 
              href="/login" 
              className="inline-flex items-center justify-center gap-2 bg-[#1d1d1f] text-white px-8 py-4 rounded-full text-[17px] font-medium hover:bg-[#000000] transition-colors w-full sm:w-auto"
            >
              Audit full pay period
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
