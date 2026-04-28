"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowLeft, Building2, UserCircle, DollarSign, Moon, CalendarDays, Clock } from "lucide-react";
import { UserProfile } from "../../types";
import { CBA_TEMPLATES } from "../../data/templates";

export default function Onboarding() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [data, setData] = useState<Partial<UserProfile>>({
    hospitalTemplateId: "",
    employmentType: undefined,
    baseRate: 0,
    nightDiff: 0,
    weekendDiff: 0,
    overtimeRule: undefined,
  });

  // Temporary string states for inputs to avoid number parsing issues while typing
  const [rateStr, setRateStr] = useState("");
  const [nightStr, setNightStr] = useState("");
  const [weekendStr, setWeekendStr] = useState("");

  const totalSteps = 6;

  const updateData = (fields: Partial<UserProfile>) => {
    setData((prev) => ({ ...prev, ...fields }));
  };

  const handleTemplateSelection = (templateId: string) => {
    updateData({ hospitalTemplateId: templateId });
    if (templateId !== "custom") {
      const template = CBA_TEMPLATES.find(t => t.id === templateId);
      if (template) {
        if (template.basePay !== undefined) setRateStr(template.basePay.toString());
        if (template.nightDiff !== undefined) setNightStr(template.nightDiff.toString());
        if (template.weekendDiff !== undefined) setWeekendStr(template.weekendDiff.toString());
        if (template.overtimeRule) updateData({ overtimeRule: template.overtimeRule });
      }
    }
  };

  const handleNext = () => {
    if (step === 3) updateData({ baseRate: parseFloat(rateStr) || 0 });
    if (step === 4) updateData({ nightDiff: parseFloat(nightStr) || 0 });
    if (step === 5) updateData({ weekendDiff: parseFloat(weekendStr) || 0 });

    if (step < totalSteps) {
      setStep((prev) => prev + 1);
    } else {
      localStorage.setItem("user_profile", JSON.stringify({
        ...data,
        baseRate: parseFloat(rateStr) || 0,
        nightDiff: parseFloat(nightStr) || 0,
        weekendDiff: parseFloat(weekendStr) || 0,
      }));
      router.push("/shifts");
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep((prev) => prev - 1);
    } else {
      router.push("/");
    }
  };

  const isNextDisabled = () => {
    switch(step) {
      case 1: return !data.hospitalTemplateId;
      case 2: return !data.employmentType;
      case 3: return !rateStr;
      case 6: return !data.overtimeRule;
      default: return false;
    }
  };

  const steps = [
    {
      title: "Where do you work?",
      description: "Select your hospital or health system to load known pay rules.",
      icon: <Building2 className="w-10 h-10 text-[#0066cc]" strokeWidth={1.5} />,
      content: (
        <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
          <select 
            className="w-full bg-[#f5f5f7] border-none rounded-[18px] p-5 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none appearance-none cursor-pointer"
            value={data.hospitalTemplateId}
            onChange={(e) => handleTemplateSelection(e.target.value)}
          >
            <option value="" disabled>Select a hospital...</option>
            {CBA_TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>{t.name}</option>
            ))}
            <option value="custom">My hospital isn't listed (Custom)</option>
          </select>
        </div>
      )
    },
    {
      title: "Employment Type",
      description: "Are you staff, travel, or per diem?",
      icon: <UserCircle className="w-10 h-10 text-[#0066cc]" strokeWidth={1.5} />,
      content: (
        <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
          {[
            { id: 'full-time', label: "Staff RN (Full-time)" },
            { id: 'part-time', label: "Staff RN (Part-time)" },
            { id: 'travel', label: "Travel RN" },
            { id: 'per-diem', label: "Per Diem / PRN" }
          ].map((type) => (
            <button
              key={type.id}
              onClick={() => updateData({ employmentType: type.id as any })}
              className={`p-5 rounded-[18px] text-left text-[17px] transition-all border-2 ${
                data.employmentType === type.id 
                  ? 'border-[#0066cc] bg-[#0066cc]/5 font-medium' 
                  : 'border-transparent bg-[#f5f5f7] hover:bg-[#e8e8ed]'
              }`}
            >
              {type.label}
            </button>
          ))}
          {data.employmentType === 'travel' && (
            <div className="mt-2 p-4 bg-[#f5f5f7] rounded-xl text-[13px] text-[#86868b]">
              <strong className="text-[#1d1d1f]">Note:</strong> ShiftCheck V1 calculates hourly wages and differentials only. Non-taxable travel stipends are not yet included in the PDF report.
            </div>
          )}
        </div>
      )
    },
    {
      title: "Base Hourly Rate",
      description: "What is your straight-time hourly rate? (Do not include differentials yet)",
      icon: <DollarSign className="w-10 h-10 text-[#0066cc]" strokeWidth={1.5} />,
      content: (
        <div className="flex items-center justify-center gap-2 w-full max-w-md mx-auto">
          <span className="text-[56px] font-semibold text-[#86868b] -mt-2">$</span>
          <input 
            type="number" 
            inputMode="decimal"
            pattern="[0-9]*"
            placeholder="0.00"
            className="w-full max-w-[200px] bg-transparent text-[64px] font-semibold text-[#1d1d1f] tracking-tight border-b-2 border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-center pb-2 transition-colors"
            value={rateStr}
            onChange={(e) => setRateStr(e.target.value)}
          />
        </div>
      )
    },
    {
      title: "Night Differential",
      description: "How much extra per hour do you make on night shifts?",
      icon: <Moon className="w-10 h-10 text-[#0066cc]" strokeWidth={1.5} />,
      content: (
        <div className="flex items-center justify-center gap-2 w-full max-w-md mx-auto">
          <span className="text-[56px] font-semibold text-[#86868b] -mt-2">+$</span>
          <input 
            type="number" 
            inputMode="decimal"
            pattern="[0-9]*"
            placeholder="0.00"
            className="w-full max-w-[200px] bg-transparent text-[64px] font-semibold text-[#1d1d1f] tracking-tight border-b-2 border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-center pb-2 transition-colors"
            value={nightStr}
            onChange={(e) => setNightStr(e.target.value)}
          />
        </div>
      )
    },
    {
      title: "Weekend Differential",
      description: "How much extra per hour do you make on weekends?",
      icon: <CalendarDays className="w-10 h-10 text-[#0066cc]" strokeWidth={1.5} />,
      content: (
        <div className="flex items-center justify-center gap-2 w-full max-w-md mx-auto">
          <span className="text-[56px] font-semibold text-[#86868b] -mt-2">+$</span>
          <input 
            type="number" 
            inputMode="decimal"
            pattern="[0-9]*"
            placeholder="0.00"
            className="w-full max-w-[200px] bg-transparent text-[64px] font-semibold text-[#1d1d1f] tracking-tight border-b-2 border-[#d2d2d7] focus:border-[#0066cc] focus:outline-none text-center pb-2 transition-colors"
            value={weekendStr}
            onChange={(e) => setWeekendStr(e.target.value)}
          />
        </div>
      )
    },
    {
      title: "Overtime Rule",
      description: "When does your overtime kick in?",
      icon: <Clock className="w-10 h-10 text-[#0066cc]" strokeWidth={1.5} />,
      content: (
        <div className="flex flex-col gap-3 w-full max-w-md mx-auto">
          {[
            { id: "weekly_40", label: "> 40 hours per week" },
            { id: "daily_8", label: "> 8 hours per day" },
            { id: "daily_12", label: "> 12 hours per day" },
            { id: "8_80", label: "8/80 Rule (Bi-weekly 80hrs)" }
          ].map((rule) => (
            <button
              key={rule.id}
              onClick={() => updateData({ overtimeRule: rule.id as any })}
              className={`p-5 rounded-[18px] text-left text-[17px] transition-all border-2 ${
                data.overtimeRule === rule.id 
                  ? 'border-[#0066cc] bg-[#0066cc]/5 font-medium' 
                  : 'border-transparent bg-[#f5f5f7] hover:bg-[#e8e8ed]'
              }`}
            >
              {rule.label}
            </button>
          ))}
          
          <div className="mt-4 pt-4 border-t border-[#e5e5ea]">
            <label className="flex items-center gap-3 cursor-pointer p-2 hover:bg-[#f5f5f7] rounded-xl transition-colors">
              <input 
                type="checkbox" 
                checked={data.baylorEnabled || false}
                onChange={(e) => updateData({ baylorEnabled: e.target.checked })}
                className="w-5 h-5 accent-[#0066cc]"
              />
              <span className="text-[15px] font-medium text-[#1d1d1f]">Baylor Plan (Work 36, Paid 40)</span>
            </label>
          </div>
        </div>
      )
    }
  ];

  const currentStep = steps[step - 1];

  return (
    <div className="min-h-screen bg-white text-[#1d1d1f] font-sans flex flex-col relative selection:bg-[#0066cc] selection:text-white">
      
      {/* Header */}
      <header className="p-6 w-full max-w-3xl mx-auto flex items-center justify-between z-10 sticky top-0 bg-white/80 backdrop-blur-md">
        <button 
          onClick={handleBack}
          className="w-10 h-10 rounded-full bg-[#f5f5f7] flex items-center justify-center hover:bg-[#e8e8ed] transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-[#1d1d1f]" strokeWidth={2} />
        </button>
        <div className="flex gap-2">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div 
              key={i} 
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i + 1 <= step ? 'w-8 bg-[#0066cc]' : 'w-4 bg-[#e5e5ea]'
              }`}
            />
          ))}
        </div>
        <div className="text-[13px] font-medium text-[#86868b]">
          Step {step} of {totalSteps}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-3xl mx-auto z-10 pb-32">
        <div className="w-full flex flex-col items-center text-center animate-in fade-in slide-in-from-bottom-8 duration-500">
          
          <div className="mb-8 flex justify-center">
             {currentStep.icon}
          </div>
          
          <h1 className="text-[40px] font-semibold tracking-tight mb-4">{currentStep.title}</h1>
          <p className="text-[#86868b] text-[19px] mb-12 max-w-lg mx-auto">{currentStep.description}</p>
          
          <div className="w-full min-h-[200px] flex flex-col justify-center">
            {currentStep.content}
          </div>
          
          <div className="mt-16 w-full max-w-md mx-auto pt-8 border-t border-[#e5e5ea]">
            <button
              disabled={isNextDisabled()}
              onClick={handleNext}
              className={`w-full flex h-14 items-center justify-center gap-2 rounded-full text-[17px] font-medium transition-all ${
                isNextDisabled() 
                  ? 'bg-[#f5f5f7] text-[#86868b] cursor-not-allowed' 
                  : 'bg-[#0066cc] hover:bg-[#0055b3] text-white shadow-[0_4px_14px_rgba(0,102,204,0.3)]'
              }`}
            >
              <span>{step === totalSteps ? "Complete Profile" : "Continue"}</span>
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
