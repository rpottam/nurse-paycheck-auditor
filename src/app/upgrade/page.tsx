"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, Check, ArrowRight } from "lucide-react";

export default function Upgrade() {
  const router = useRouter();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleUpgrade = () => {
    setIsProcessing(true);
    
    // Simulate Stripe Checkout delay
    setTimeout(() => {
      localStorage.setItem("shiftcheck_premium", "true");
      const savedProfile = localStorage.getItem("user_profile");
      if (savedProfile) {
        router.push("/shifts");
      } else {
        router.push("/onboarding");
      }
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans flex flex-col items-center p-6 relative">
      
      {/* Top Banner */}
      <div className="absolute top-0 left-0 w-full p-4 flex items-center justify-between bg-white border-b border-[#e5e5ea] shadow-[0_2px_10px_rgba(0,0,0,0.02)] z-10">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#0066cc]" strokeWidth={2} />
          <span className="text-[17px] font-semibold tracking-tight">ShiftCheck</span>
        </Link>
      </div>

      <main className="w-full max-w-4xl mt-24 grid md:grid-cols-2 gap-8 items-center">
        
        {/* Pitch Column */}
        <div className="flex flex-col animate-in fade-in slide-in-from-left-8 duration-700">
          <span className="text-[13px] font-bold tracking-widest text-[#0066cc] uppercase mb-4">Limited Time Offer</span>
          <h1 className="text-[48px] font-semibold tracking-tight leading-[1.1] mb-6">Stop guessing.<br/>Start auditing.</h1>
          <p className="text-[19px] text-[#86868b] leading-relaxed mb-8 max-w-md">
            Hospital payroll systems make mistakes. The free calculator shows you a single shift, but ShiftCheck Premium audits your entire pay period and builds the HR Dispute Report to get your money back.
          </p>
          
          <div className="space-y-4 mb-8">
            {[
              "Audit an entire 80-hour pay period instantly",
              "Save your profile & CBA template",
              "Generate printable PDF HR Dispute Reports",
              "Export viral 'Audit Discrepancy' graphics",
              "100% Local-First privacy (nothing uploaded)"
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-[#0066cc]/10 flex items-center justify-center flex-shrink-0">
                  <Check className="w-3.5 h-3.5 text-[#0066cc]" strokeWidth={3} />
                </div>
                <span className="text-[15px] font-medium text-[#1d1d1f]">{feature}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing Card */}
        <div className="bg-white rounded-[40px] p-8 md:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)] border border-[#e5e5ea] flex flex-col items-center text-center animate-in fade-in slide-in-from-right-8 duration-700 delay-100">
          <h3 className="text-[21px] font-semibold tracking-tight mb-2">Lifetime Access</h3>
          <p className="text-[15px] text-[#86868b] mb-8">Pay once. Audit forever.</p>
          
          <div className="flex items-start justify-center gap-1 mb-8">
            <span className="text-[24px] font-semibold text-[#86868b] mt-2 line-through">$24</span>
            <span className="text-[32px] font-medium text-[#1d1d1f] mt-2 ml-2">$</span>
            <span className="text-[72px] font-semibold tracking-tight leading-none text-[#1d1d1f]">19</span>
          </div>

          <button 
            onClick={handleUpgrade}
            disabled={isProcessing}
            className={`w-full flex h-14 items-center justify-center gap-2 rounded-full text-[17px] font-medium transition-all mb-4 ${
              isProcessing 
                ? 'bg-[#0066cc]/70 text-white cursor-wait' 
                : 'bg-[#0066cc] hover:bg-[#0055b3] text-white shadow-[0_4px_14px_rgba(0,102,204,0.3)] hover:scale-[1.02]'
            }`}
          >
            {isProcessing ? "Processing via Stripe..." : "Upgrade to Premium"}
            {!isProcessing && <ArrowRight className="w-4 h-4" />}
          </button>
          
          <p className="text-[13px] text-[#86868b]">
            Less than the cost of one missed differential.
          </p>
        </div>
        
      </main>
    </div>
  );
}
