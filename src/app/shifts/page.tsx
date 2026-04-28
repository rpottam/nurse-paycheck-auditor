"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { Plus, Calculator, Calendar, Clock, Download, FileText, Trash2, X, Share, ShieldCheck, Lock, AlertTriangle, Info } from "lucide-react";
import { calculatePayPeriod, AuditResult } from "../../lib/engine";
import { generateDisputeReport } from "../../lib/pdfGenerator";
import { Shift, UserProfile, PayPeriod } from "../../types";
import html2canvas from "html2canvas";

export default function Shifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [auditResult, setAuditResult] = useState<AuditResult | null>(null);
  const [isPremium, setIsPremium] = useState(false);
  const [showGrossToast, setShowGrossToast] = useState(false);
  const [grossToastDismissed, setGrossToastDismissed] = useState(false);

  // Pay Period Boundaries
  const today = new Date().toISOString().split('T')[0];
  const [periodStart, setPeriodStart] = useState<string>("");
  const [periodEnd, setPeriodEnd] = useState<string>("");

  // Modals & PDF State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showMathModal, setShowMathModal] = useState(false);
  const [actualGross1, setActualGross1] = useState("");
  const [actualGross2, setActualGross2] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Ref for viral PNG capture
  const viralCardRef = useRef<HTMLDivElement>(null);

  // Load state on mount
  useEffect(() => {
    setIsPremium(!!localStorage.getItem("shiftcheck_premium"));
    setGrossToastDismissed(!!localStorage.getItem("shiftcheck_gross_toast_dismissed"));

    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    const savedShifts = localStorage.getItem("user_shifts");
    if (savedShifts) {
      const parsedShifts = JSON.parse(savedShifts);
      setShifts(parsedShifts);
    }
    const savedStart = localStorage.getItem("pay_period_start");
    const savedEnd = localStorage.getItem("pay_period_end");
    if (savedStart) setPeriodStart(savedStart);
    if (savedEnd) setPeriodEnd(savedEnd);
  }, []);

  const getPayPeriod = (): PayPeriod => {
    return {
      id: "current",
      startDate: periodStart || (shifts[0]?.date) || today,
      endDate: periodEnd || (shifts[shifts.length - 1]?.date) || today,
      shifts: shifts
    };
  };

  // Recalculate whenever shifts, boundaries, or profile changes
  useEffect(() => {
    if (profile && shifts.length > 0 && periodStart && periodEnd) {
      const result = calculatePayPeriod(profile, getPayPeriod());
      setAuditResult(result);
      if (!grossToastDismissed) setShowGrossToast(true);
    } else {
      setAuditResult(null);
    }
  }, [shifts, profile, periodStart, periodEnd]);

  const [newShift, setNewShift] = useState<Partial<Shift> & { missedMealBreak: boolean }>({
    date: today,
    startTime: "07:00",
    endTime: "19:30",
    role: "regular",
    isHoliday: false,
    missedMealBreak: false,
  });

  const handleSaveShift = () => {
    if (!newShift.date || !newShift.startTime || !newShift.endTime) return;
    
    const shiftToAdd: Shift = {
      id: Math.random().toString(36).substr(2, 9),
      date: newShift.date,
      startTime: newShift.startTime,
      endTime: newShift.endTime,
      role: (newShift.role as 'regular' | 'charge' | 'preceptor') || "regular",
      isHoliday: newShift.isHoliday || false,
      breakDeductionMinutes: newShift.missedMealBreak ? 0 : 30
    };
    
    const updatedShifts = [...shifts, shiftToAdd].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setShifts(updatedShifts);
    localStorage.setItem("user_shifts", JSON.stringify(updatedShifts));
    
    if (!periodStart) {
      setPeriodStart(updatedShifts[0].date);
      localStorage.setItem("pay_period_start", updatedShifts[0].date);
    }
    if (!periodEnd) {
      setPeriodEnd(updatedShifts[updatedShifts.length - 1].date);
      localStorage.setItem("pay_period_end", updatedShifts[updatedShifts.length - 1].date);
    }

    setIsAdding(false);
  };

  const deleteShift = (id: string) => {
    const updated = shifts.filter(s => s.id !== id);
    setShifts(updated);
    localStorage.setItem("user_shifts", JSON.stringify(updated));
  };

  const handleGeneratePdf = async () => {
    setPdfError("");
    if (!actualGross1 || !actualGross2) {
      setPdfError("Please enter the gross amount twice.");
      return;
    }
    if (actualGross1 !== actualGross2) {
      setPdfError("Amounts do not match. Please verify.");
      return;
    }
    
    const actual = parseFloat(actualGross1);
    if (isNaN(actual) || actual < 0) {
      setPdfError("Invalid amount.");
      return;
    }

    // 25% delta sanity warning
    if (auditResult) {
      const delta = Math.abs(auditResult.expectedGross - actual);
      const pct = delta / auditResult.expectedGross;
      if (pct > 0.25 && !confirm(`The difference between your expected gross ($${auditResult.expectedGross.toFixed(2)}) and what you entered ($${actual.toFixed(2)}) is ${(pct*100).toFixed(0)}%. This seems unusually large. Are you sure you entered your GROSS pay (not net take-home)?`)) {
        return;
      }
    }

    if (!profile || shifts.length === 0) return;

    setIsGenerating(true);
    try {
      const pdfBytes = await generateDisputeReport(profile, getPayPeriod(), actual);
      const blob = new Blob([pdfBytes as any], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Dispute_Report_${today}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
      setShowPdfModal(false);
    } catch (e) {
      console.error(e);
      setPdfError("Failed to generate PDF.");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateViralGraphic = async () => {
    if (!viralCardRef.current) return;
    try {
      const canvas = await html2canvas(viralCardRef.current, { scale: 3, backgroundColor: null });
      const image = canvas.toDataURL("image/png");
      const link = document.createElement('a');
      link.href = image;
      link.download = `ShiftCheck_Audit_${today}.png`;
      link.click();
    } catch (err) {
      console.error("Failed to generate graphic", err);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#0066CC] selection:text-white pb-32">
      {/* Top Navbar with Trust Banner */}
      <header className="sticky top-0 z-50 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-[#D2D2D7]/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[21px] font-semibold tracking-tight text-[#1D1D1F]">Pay Period</h1>
            <span className="hidden sm:flex items-center gap-1 text-[11px] text-[#86868B] bg-[#E5E5EA] px-2 py-0.5 rounded-full"><ShieldCheck className="w-3 h-3" /> Local only</span>
          </div>
          <div className="flex items-center gap-4">
            {!isPremium && <Link href="/upgrade" className="text-[#0066CC] text-[13px] font-semibold hover:underline">Upgrade</Link>}
            <Link href="/profile" className="text-[#0066CC] text-[15px] hover:underline font-medium">Profile</Link>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        
        {/* Pay Period Bounds */}
        <div className="bg-white rounded-[24px] p-5 mb-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#E5E5EA] flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="w-full sm:w-auto">
             <label className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 block">Start Date</label>
             <input 
                type="date"
                value={periodStart}
                onChange={(e) => {
                  setPeriodStart(e.target.value);
                  localStorage.setItem("pay_period_start", e.target.value);
                }}
                className="bg-[#F5F5F7] border border-transparent rounded-xl px-3 py-2 text-[15px] focus:outline-none focus:border-[#0066CC] w-full"
             />
          </div>
          <div className="hidden sm:block text-[#86868B]">to</div>
          <div className="w-full sm:w-auto">
             <label className="text-[12px] font-semibold text-[#86868B] uppercase tracking-wider mb-1 block">End Date</label>
             <input 
                type="date"
                value={periodEnd}
                onChange={(e) => {
                  setPeriodEnd(e.target.value);
                  localStorage.setItem("pay_period_end", e.target.value);
                }}
                className="bg-[#F5F5F7] border border-transparent rounded-xl px-3 py-2 text-[15px] focus:outline-none focus:border-[#0066CC] w-full"
             />
          </div>
        </div>

        {/* Viral Card (Hidden until exported, but rendered for html2canvas) */}
        {auditResult && (
          <div className="absolute top-[-9999px] left-[-9999px]">
            <div ref={viralCardRef} className="bg-gradient-to-br from-[#1d1d1f] to-[#000000] text-white p-10 rounded-[40px] w-[500px] shadow-2xl flex flex-col items-center text-center">
              <h2 className="text-[28px] font-semibold tracking-tight text-[#f5f5f7] mb-2 opacity-80">My Expected Gross</h2>
              <div className="flex items-start justify-center gap-2 mb-8">
                <span className="text-[40px] font-semibold text-[#86868b] mt-2">$</span>
                <span className="text-[96px] font-semibold tracking-tight leading-none text-white">
                  {auditResult.expectedGross.toFixed(2)}
                </span>
              </div>
              <div className="w-full bg-white/10 rounded-2xl p-6 mb-8 text-left">
                <p className="text-[17px] font-medium text-white mb-2">Hospital: {profile?.hospitalTemplateId === 'custom' ? 'Custom' : 'Pre-loaded CBA'}</p>
                <p className="text-[15px] text-[#a1a1a6]">Shifts logged: {shifts.length}</p>
                <p className="text-[15px] text-[#a1a1a6]">Base rate: ${profile?.baseRate}/hr</p>
              </div>
              <p className="text-[24px] font-semibold mb-2">Did HR underpay me?</p>
              <p className="text-[15px] text-[#a1a1a6] tracking-widest uppercase mt-4 opacity-50">Audited via ShiftCheck</p>
            </div>
          </div>
        )}

        {/* Gross Card */}
        <div className="bg-white rounded-[32px] p-8 mb-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] border border-[#E5E5EA]">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <p className="text-[13px] font-medium text-[#86868B] uppercase tracking-widest mb-2">Estimated Gross</p>
            <div className="flex items-start justify-center gap-1">
              <span className="text-[32px] font-medium text-[#1D1D1F] mt-2">$</span>
              <span className="text-[64px] font-semibold tracking-tight leading-none text-[#1D1D1F]">
                {(!periodStart || !periodEnd || !auditResult) ? "0.00" : auditResult.expectedGross.toFixed(2)}
              </span>
            </div>
            {(!periodStart || !periodEnd) && (
              <p className="text-[13px] text-[#ff3b30] mt-3 font-medium">Please select Pay Period Start and End Dates above.</p>
            )}
            {(periodStart && periodEnd) && (
              <p className="text-[13px] text-[#86868B] mt-3">Before taxes and deductions</p>
            )}
          </div>

          {/* Engine Warnings */}
          {auditResult && auditResult.warnings && auditResult.warnings.length > 0 && (
            <div className="mb-4 space-y-2">
              {auditResult.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-2 bg-[#FFF8E1] border border-[#FFE082] rounded-2xl p-3 text-[13px] text-[#5D4037]">
                  <AlertTriangle className="w-4 h-4 text-[#F9A825] mt-0.5 flex-shrink-0" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button 
              onClick={() => { if (!isPremium) { window.location.href = '/upgrade'; return; } shifts.length > 0 && periodStart && periodEnd && setShowMathModal(true); }}
              className={`flex-1 rounded-2xl py-3.5 flex justify-center items-center gap-2 text-[15px] font-medium transition-colors ${(shifts.length > 0 && periodStart && periodEnd) ? 'bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F]' : 'bg-[#e5e5ea] text-[#86868b] cursor-not-allowed'}`}
            >
              {!isPremium && <Lock className="w-4 h-4" />}
              <Calculator className="w-5 h-5" />
              Show the Math
            </button>
            <button 
              onClick={() => { if (!isPremium) { window.location.href = '/upgrade'; return; } shifts.length > 0 && periodStart && periodEnd && setShowPdfModal(true); }}
              className={`flex-1 rounded-2xl py-3.5 flex justify-center items-center gap-2 text-[15px] font-medium transition-colors ${(shifts.length > 0 && periodStart && periodEnd) ? 'bg-[#0066CC] hover:bg-[#0055B3] text-white' : 'bg-[#e5e5ea] text-[#86868b] cursor-not-allowed'}`}
            >
              {!isPremium && <Lock className="w-4 h-4" />}
              <Download className="w-5 h-5" />
              HR Dispute Report
            </button>
          </div>
          
          {/* Share Button — FREE for viral growth */}
          <div className="mt-4 flex justify-center">
             <button 
                onClick={generateViralGraphic}
                disabled={!auditResult}
                className="flex items-center gap-1.5 text-[14px] font-medium text-[#0066cc] hover:underline disabled:opacity-50 disabled:cursor-not-allowed"
             >
                <Share className="w-4 h-4" /> Share my Audit
             </button>
          </div>
        </div>

        {/* Shifts List */}
        <div className="mb-4 flex items-center justify-between px-2">
          <h2 className="text-[21px] font-semibold text-[#1D1D1F] tracking-tight">Shifts ({shifts.length})</h2>
          {shifts.length > 0 && (
            <button onClick={() => setIsAdding(true)} className="text-[#0066CC] text-[15px] flex items-center gap-1 hover:underline">
              <Plus className="w-4 h-4" /> Add
            </button>
          )}
        </div>

        {shifts.length === 0 && !isAdding ? (
          <div className="bg-white rounded-[32px] p-12 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#E5E5EA]">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-5">
              <Calendar className="w-8 h-8 text-[#86868B]" />
            </div>
            <h3 className="text-[19px] font-semibold text-[#1D1D1F] mb-2 tracking-tight">No shifts logged</h3>
            <p className="text-[15px] text-[#86868B] mb-8 max-w-xs leading-relaxed">
              Log your shifts to calculate your expected gross earnings.
            </p>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#0066CC] text-white px-6 py-3 rounded-full text-[15px] font-medium hover:bg-[#0055B3] transition-colors shadow-[0_4px_14px_rgba(0,102,204,0.3)]"
            >
              Add first shift
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shifts.map((shift) => (
              <div key={shift.id} className="bg-white border border-[#E5E5EA] rounded-[24px] p-5 flex items-center justify-between group hover:shadow-[0_4px_12px_rgba(0,0,0,0.04)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-[52px] h-[52px] rounded-[14px] bg-[#F5F5F7] flex flex-col items-center justify-center text-center">
                    <span className="text-[11px] font-semibold text-[#86868B] uppercase tracking-wider">
                      {new Date(shift.date).toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-[19px] font-semibold text-[#1D1D1F] leading-tight">
                      {new Date(shift.date).getDate()}
                    </span>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[17px] font-medium text-[#1D1D1F]">{shift.startTime} - {shift.endTime}</span>
                      {shift.isHoliday && (
                        <span className="px-1.5 py-0.5 rounded-md text-[10px] font-semibold bg-[#FCECD9] text-[#E58215]">
                          HOLIDAY
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-[#86868B] flex items-center gap-1 capitalize">
                      <Clock className="w-3.5 h-3.5" />
                      {shift.role}
                      {shift.breakDeductionMinutes === 0 && " • No Lunch"}
                    </div>
                  </div>
                </div>
                
                <button onClick={() => deleteShift(shift.id)} className="w-8 h-8 rounded-full text-[#FF3B30] flex items-center justify-center hover:bg-[#FF3B30]/10 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add Shift Inline Form */}
        {isAdding && (
          <div className="mt-4 bg-white border border-[#E5E5EA] rounded-[32px] p-6 shadow-[0_12px_40px_rgba(0,0,0,0.08)] animate-in fade-in slide-in-from-top-4 duration-300">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-[19px] font-semibold text-[#1D1D1F] tracking-tight">New Shift</h3>
              <button onClick={() => setIsAdding(false)} className="text-[15px] text-[#0066CC] hover:underline">Cancel</button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-5">
              <div className="col-span-2">
                <label className="text-[13px] text-[#86868B] font-medium mb-1.5 block">Date</label>
                <input 
                  type="date" 
                  value={newShift.date}
                  onChange={(e) => setNewShift({...newShift, date: e.target.value})}
                  className="w-full bg-[#F5F5F7] border border-transparent rounded-xl px-4 py-3 text-[15px] text-[#1D1D1F] focus:outline-none focus:border-[#0066CC] focus:bg-white transition-colors"
                />
              </div>
              
              <div>
                <label className="text-[13px] text-[#86868B] font-medium mb-1.5 block">Start Time</label>
                <input 
                  type="time" 
                  value={newShift.startTime}
                  onChange={(e) => setNewShift({...newShift, startTime: e.target.value})}
                  className="w-full bg-[#F5F5F7] border border-transparent rounded-xl px-4 py-3 text-[15px] text-[#1D1D1F] focus:outline-none focus:border-[#0066CC] focus:bg-white transition-colors"
                />
              </div>
              
              <div>
                <label className="text-[13px] text-[#86868B] font-medium mb-1.5 block">End Time</label>
                <input 
                  type="time" 
                  value={newShift.endTime}
                  onChange={(e) => setNewShift({...newShift, endTime: e.target.value})}
                  className="w-full bg-[#F5F5F7] border border-transparent rounded-xl px-4 py-3 text-[15px] text-[#1D1D1F] focus:outline-none focus:border-[#0066CC] focus:bg-white transition-colors"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-8">
              <label className="flex items-center gap-2 bg-[#F5F5F7] px-4 py-3 rounded-xl cursor-pointer hover:bg-[#E8E8ED] transition-colors col-span-1">
                <input 
                  type="checkbox" 
                  checked={newShift.isHoliday}
                  onChange={(e) => setNewShift({...newShift, isHoliday: e.target.checked})}
                  className="accent-[#0066CC] w-[18px] h-[18px]"
                />
                <span className="text-[15px] text-[#1D1D1F]">Holiday</span>
              </label>

              <label className="flex items-center gap-2 bg-[#F5F5F7] px-4 py-3 rounded-xl cursor-pointer hover:bg-[#E8E8ED] transition-colors col-span-1">
                <input 
                  type="checkbox" 
                  checked={newShift.missedMealBreak}
                  onChange={(e) => setNewShift({...newShift, missedMealBreak: e.target.checked})}
                  className="accent-[#0066CC] w-[18px] h-[18px]"
                />
                <span className="text-[15px] text-[#1D1D1F]">No Lunch</span>
              </label>
              
              <select 
                value={newShift.role}
                onChange={(e) => setNewShift({...newShift, role: e.target.value as "regular" | "charge" | "preceptor"})}
                className="col-span-2 bg-[#F5F5F7] px-4 py-3 rounded-xl text-[15px] text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-[#0066CC] appearance-none cursor-pointer"
              >
                <option value="regular">Regular RN</option>
                <option value="charge">Charge RN</option>
                <option value="preceptor">Preceptor RN</option>
              </select>
            </div>
            
            <button 
              onClick={handleSaveShift}
              className="w-full bg-[#0066CC] text-white text-[17px] font-medium py-3.5 rounded-full shadow-[0_4px_14px_rgba(0,102,204,0.3)] hover:bg-[#0055B3] transition-colors"
            >
              Add Shift
            </button>
          </div>
        )}
      </main>

      {/* Floating Action Button */}
      {!isAdding && shifts.length > 0 && (
        <button 
          onClick={() => setIsAdding(true)}
          className="fixed bottom-8 right-6 w-14 h-14 bg-[#0066CC] rounded-full shadow-[0_4px_16px_rgba(0,102,204,0.3)] flex items-center justify-center text-white hover:scale-105 transition-transform z-40"
        >
          <Plus className="w-6 h-6" strokeWidth={2.5} />
        </button>
      )}

      {/* Show Math Modal */}
      {showMathModal && auditResult && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm sm:p-4">
          <div className="bg-white rounded-t-[32px] sm:rounded-[32px] w-full max-w-lg p-6 sm:p-8 shadow-2xl relative animate-in slide-in-from-bottom-full sm:zoom-in duration-300 max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[21px] font-semibold tracking-tight text-[#1d1d1f]">Math Breakdown</h3>
              <button 
                onClick={() => setShowMathModal(false)}
                className="w-8 h-8 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {auditResult.lineItems.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-[#f5f5f7] pb-3">
                  <div className="flex flex-col">
                    <span className="text-[15px] font-medium text-[#1d1d1f]">{item.description}</span>
                    <span className="text-[13px] text-[#86868b]">{item.hours.toFixed(2)} hrs @ ${item.rate.toFixed(2)}/hr</span>
                  </div>
                  <span className="text-[17px] font-semibold text-[#1d1d1f]">${item.amount.toFixed(2)}</span>
                </div>
              ))}
            </div>
            
            <div className="mt-6 pt-4 border-t border-[#e5e5ea] flex justify-between items-center bg-[#f5f5f7] p-4 rounded-[16px]">
              <span className="text-[17px] font-medium text-[#1d1d1f]">Expected Gross</span>
              <span className="text-[24px] font-semibold text-[#1d1d1f]">${auditResult.expectedGross.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}

      {/* PDF Generation Modal */}
      {showPdfModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[32px] w-full max-w-md p-8 shadow-2xl relative animate-in fade-in zoom-in duration-200">
            <button 
              onClick={() => setShowPdfModal(false)}
              className="absolute top-6 right-6 w-8 h-8 bg-[#f5f5f7] rounded-full flex items-center justify-center text-[#86868b] hover:text-[#1d1d1f] transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            
            <div className="w-16 h-16 rounded-full bg-[#0066cc]/10 flex items-center justify-center mb-6">
              <FileText className="w-8 h-8 text-[#0066cc]" />
            </div>
            
            <h3 className="text-[24px] font-semibold tracking-tight text-[#1d1d1f] mb-2">Verify Actual Gross</h3>
            <p className="text-[15px] text-[#86868b] mb-8 leading-relaxed">
              Before generating the dispute report, please enter the actual gross pay from your hospital's paystub. Do not enter net take-home pay.
            </p>

            <div className="space-y-4 mb-8">
              <div>
                <label className="text-[13px] text-[#86868b] font-medium mb-1.5 block">Actual Gross on Paystub</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] font-medium">$</span>
                  <input 
                    type="number" 
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={actualGross1}
                    onChange={(e) => setActualGross1(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#f5f5f7] border-none rounded-[16px] pl-8 pr-4 py-3.5 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none focus:bg-white transition-colors"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-[13px] text-[#86868b] font-medium mb-1.5 block">Confirm Actual Gross</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[#86868b] font-medium">$</span>
                  <input 
                    type="number" 
                    inputMode="decimal"
                    pattern="[0-9]*"
                    value={actualGross2}
                    onChange={(e) => setActualGross2(e.target.value)}
                    placeholder="0.00"
                    className="w-full bg-[#f5f5f7] border-none rounded-[16px] pl-8 pr-4 py-3.5 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none focus:bg-white transition-colors"
                  />
                </div>
              </div>
              
              {pdfError && (
                <p className="text-[13px] text-[#ff3b30] font-medium mt-2">{pdfError}</p>
              )}
            </div>

            <button 
              onClick={handleGeneratePdf}
              disabled={isGenerating}
              className={`w-full text-white text-[17px] font-medium py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 ${isGenerating ? 'bg-[#0066cc]/50 cursor-not-allowed' : 'bg-[#0066cc] hover:bg-[#0055b3] shadow-[0_4px_14px_rgba(0,102,204,0.3)]'}`}
            >
              {isGenerating ? "Generating..." : "Generate Dispute Report"}
            </button>
          </div>
        </div>
      )}

      {/* Gross vs. Net Educational Toast */}
      {showGrossToast && !grossToastDismissed && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] w-[90%] max-w-md bg-white rounded-[24px] p-5 shadow-[0_12px_40px_rgba(0,0,0,0.12)] border border-[#e5e5ea] animate-in slide-in-from-bottom-8 duration-300">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 bg-[#0066cc]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Info className="w-4 h-4 text-[#0066cc]" />
            </div>
            <div className="flex-1">
              <p className="text-[15px] font-semibold text-[#1d1d1f] mb-1">Gross ≠ Net</p>
              <p className="text-[13px] text-[#86868b] leading-relaxed">ShiftCheck calculates your <strong>gross</strong> pay — the total before taxes, insurance, retirement, and other deductions. Compare this number to the gross line on your paystub, not your direct deposit.</p>
            </div>
            <button onClick={() => { setShowGrossToast(false); setGrossToastDismissed(true); localStorage.setItem('shiftcheck_gross_toast_dismissed', 'true'); }} className="text-[#86868b] hover:text-[#1d1d1f] flex-shrink-0">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
