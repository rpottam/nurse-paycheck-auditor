"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Calculator, Calendar, Clock, Download, FileText, Trash2, X } from "lucide-react";
import { calculatePayPeriod } from "../../lib/engine";
import { generateDisputeReport } from "../../lib/pdfGenerator";
import { Shift, UserProfile, PayPeriod } from "../../types";

export default function Shifts() {
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [estimatedGross, setEstimatedGross] = useState(0);

  // PDF Generation State
  const [showPdfModal, setShowPdfModal] = useState(false);
  const [actualGross1, setActualGross1] = useState("");
  const [actualGross2, setActualGross2] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Load state on mount
  useEffect(() => {
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
    const savedShifts = localStorage.getItem("user_shifts");
    if (savedShifts) {
      const parsedShifts = JSON.parse(savedShifts);
      setShifts(parsedShifts);
    }
  }, []);

  const getPayPeriod = (): PayPeriod => {
    return {
      id: "current",
      startDate: shifts[0]?.date || new Date().toISOString().split('T')[0],
      endDate: shifts[shifts.length - 1]?.date || new Date().toISOString().split('T')[0],
      shifts: shifts
    };
  };

  // Recalculate whenever shifts or profile changes
  useEffect(() => {
    if (profile && shifts.length > 0) {
      const result = calculatePayPeriod(profile, getPayPeriod());
      setEstimatedGross(result.expectedGross);
    } else {
      setEstimatedGross(0);
    }
  }, [shifts, profile]);

  const [newShift, setNewShift] = useState<Partial<Shift>>({
    date: new Date().toISOString().split('T')[0],
    startTime: "07:00",
    endTime: "19:30",
    role: "regular",
    isHoliday: false
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
      breakDeductionMinutes: 30 // standard lunch break deduction
    };
    
    const updatedShifts = [...shifts, shiftToAdd].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    setShifts(updatedShifts);
    localStorage.setItem("user_shifts", JSON.stringify(updatedShifts));
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

    const diffPercent = Math.abs(actual - estimatedGross) / estimatedGross;
    if (diffPercent > 0.25) {
       // Just a warning log in real app, we will let it proceed for demo
       console.warn("25% Delta Warning: The actual entered gross is implausibly different from expected.");
    }

    if (!profile || shifts.length === 0) return;

    setIsGenerating(true);
    try {
      const pdfBytes = await generateDisputeReport(profile, getPayPeriod(), actual);
      
      // Trigger download
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Dispute_Report_${new Date().toISOString().split('T')[0]}.pdf`;
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

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#1D1D1F] font-sans selection:bg-[#0066CC] selection:text-white pb-32">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-[#F5F5F7]/80 backdrop-blur-xl border-b border-[#D2D2D7]/50">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="text-[21px] font-semibold tracking-tight text-[#1D1D1F]">Pay Period</h1>
          </div>
          <Link href="/profile" className="text-[#0066CC] text-[15px] hover:underline">
            Profile
          </Link>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        {/* Gross Card */}
        <div className="bg-white rounded-3xl p-8 mb-8 shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-[#E5E5EA]">
          <div className="flex flex-col items-center justify-center text-center mb-8">
            <p className="text-[13px] font-medium text-[#86868B] uppercase tracking-widest mb-2">Estimated Gross</p>
            <div className="flex items-start justify-center gap-1">
              <span className="text-[32px] font-medium text-[#1D1D1F] mt-2">$</span>
              <span className="text-[64px] font-semibold tracking-tight leading-none text-[#1D1D1F]">{estimatedGross.toFixed(2)}</span>
            </div>
            <p className="text-[13px] text-[#86868B] mt-3">Before taxes and deductions</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <button className="flex-1 bg-[#F5F5F7] hover:bg-[#E8E8ED] text-[#1D1D1F] rounded-2xl py-3.5 flex justify-center items-center gap-2 text-[15px] font-medium transition-colors">
              <Calculator className="w-5 h-5" />
              Show the Math
            </button>
            <button 
              onClick={() => shifts.length > 0 && setShowPdfModal(true)}
              className={`flex-1 rounded-2xl py-3.5 flex justify-center items-center gap-2 text-[15px] font-medium transition-colors ${shifts.length > 0 ? 'bg-[#0066CC] hover:bg-[#0055B3] text-white' : 'bg-[#e5e5ea] text-[#86868b] cursor-not-allowed'}`}
            >
              <Download className="w-5 h-5" />
              HR Dispute Report
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
          <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#E5E5EA]">
            <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-5">
              <Calendar className="w-8 h-8 text-[#86868B]" />
            </div>
            <h3 className="text-[19px] font-semibold text-[#1D1D1F] mb-2 tracking-tight">No shifts logged</h3>
            <p className="text-[15px] text-[#86868B] mb-8 max-w-xs leading-relaxed">
              Log your shifts to calculate your expected gross earnings.
            </p>
            <button 
              onClick={() => setIsAdding(true)}
              className="bg-[#0066CC] text-white px-6 py-3 rounded-full text-[15px] font-medium hover:bg-[#0055B3] transition-colors"
            >
              Add first shift
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {shifts.map((shift) => (
              <div key={shift.id} className="bg-white border border-[#E5E5EA] rounded-2xl p-4 flex items-center justify-between group hover:shadow-[0_2px_10px_rgba(0,0,0,0.04)] transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-[52px] h-[52px] rounded-xl bg-[#F5F5F7] flex flex-col items-center justify-center text-center">
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
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-[#FCECD9] text-[#E58215]">
                          HOLIDAY
                        </span>
                      )}
                    </div>
                    <div className="text-[13px] text-[#86868B] flex items-center gap-1 capitalize">
                      <Clock className="w-3.5 h-3.5" />
                      {shift.role}
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
          <div className="mt-4 bg-white border border-[#E5E5EA] rounded-3xl p-6 shadow-[0_8px_30px_rgba(0,0,0,0.08)]">
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
            
            <div className="flex gap-3 mb-8">
              <label className="flex items-center gap-2 bg-[#F5F5F7] px-4 py-3 rounded-xl cursor-pointer hover:bg-[#E8E8ED] flex-1 transition-colors">
                <input 
                  type="checkbox" 
                  checked={newShift.isHoliday}
                  onChange={(e) => setNewShift({...newShift, isHoliday: e.target.checked})}
                  className="accent-[#0066CC] w-[18px] h-[18px]"
                />
                <span className="text-[15px] text-[#1D1D1F]">Holiday</span>
              </label>
              
              <select 
                value={newShift.role}
                onChange={(e) => setNewShift({...newShift, role: e.target.value as "regular" | "charge" | "preceptor"})}
                className="bg-[#F5F5F7] px-4 py-3 rounded-xl text-[15px] text-[#1D1D1F] focus:outline-none focus:ring-1 focus:ring-[#0066CC] flex-1 appearance-none cursor-pointer"
              >
                <option value="regular">Regular</option>
                <option value="charge">Charge</option>
                <option value="preceptor">Preceptor</option>
              </select>
            </div>
            
            <button 
              onClick={handleSaveShift}
              className="w-full bg-[#0066CC] text-white text-[17px] font-medium py-3.5 rounded-xl hover:bg-[#0055B3] transition-colors"
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
              className={`w-full text-white text-[17px] font-medium py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 ${isGenerating ? 'bg-[#0066cc]/50 cursor-not-allowed' : 'bg-[#0066cc] hover:bg-[#0055b3]'}`}
            >
              {isGenerating ? "Generating..." : "Generate Dispute Report"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
