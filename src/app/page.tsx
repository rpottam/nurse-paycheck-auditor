import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ShieldCheck, Calculator, FileText } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans selection:bg-[#0066cc] selection:text-white">
      {/* Navigation */}
      <nav className="w-full px-6 py-4 bg-[rgba(251,251,253,0.8)] backdrop-blur-md sticky top-0 z-50 border-b border-[#d2d2d7]/30">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#1d1d1f]" strokeWidth={2} />
            <span className="text-[19px] font-semibold tracking-tight">ShiftCheck</span>
          </div>
          <div className="hidden sm:flex items-center gap-6 text-[13px] text-[#1d1d1f]">
            <Link href="/calculator" className="hover:text-[#0066cc] transition-colors">Free Calculator</Link>
            <span className="text-[#86868b]">|</span>
            <span className="flex items-center gap-1.5 text-[#86868b]"><ShieldCheck className="w-3.5 h-3.5" /> 100% Local</span>
          </div>
        </div>
      </nav>

      <main className="flex flex-col items-center w-full">
        {/* Hero Section */}
        <section className="w-full max-w-5xl mx-auto px-6 pt-32 pb-20 text-center flex flex-col items-center">
          <h1 className="text-[56px] md:text-[80px] font-semibold tracking-[-0.04em] mb-6 leading-[1.05] max-w-4xl text-[#1d1d1f]">
            Stop guessing your paycheck.
          </h1>
          
          <p className="text-[21px] md:text-[28px] text-[#86868b] mb-12 max-w-3xl font-medium tracking-tight leading-[1.3]">
            Audit your RN pay in 3 taps. Baylor, nights, weekends, and 8/80 overtime. Generate a dispute report they can't ignore.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link 
              href="/onboarding" 
              className="group flex items-center justify-center gap-2 rounded-full bg-[#0066cc] px-8 py-4 text-[17px] font-medium text-white transition-all hover:bg-[#0055b3] hover:scale-[1.02] active:scale-95"
            >
              <span>Start your audit</span>
            </Link>
            
            <Link 
              href="/calculator" 
              className="flex items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-transparent px-8 py-4 text-[17px] font-medium text-[#1d1d1f] transition-all hover:bg-[#f5f5f7] active:scale-95"
            >
              <span>Free single-shift calculator</span>
            </Link>
          </div>
        </section>

        {/* Product Image / UI Mockup placeholder */}
        <section className="w-full max-w-5xl mx-auto px-6 mb-32">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-[#e5e5ea] overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfd] to-[#f5f5f7] z-0"></div>
             <div className="z-10 text-center flex flex-col items-center">
                <Calculator className="w-16 h-16 text-[#0066cc] mb-4" strokeWidth={1.5} />
                <h3 className="text-[24px] font-semibold tracking-tight">The math engine you can trust.</h3>
                <p className="text-[#86868b] text-[17px] mt-2">Zero LLMs in the calculation path. Pure deterministic logic.</p>
             </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full bg-white py-32 border-t border-[#d2d2d7]/50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight mb-4">How it works.</h2>
              <p className="text-[#86868b] text-[21px] tracking-tight">Three steps to recover what you are owed.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Calculator className="w-8 h-8 text-[#1d1d1f]" strokeWidth={1.5} />,
                  title: "Pick your hospital",
                  desc: "Select from our database of union and hospital system pay rules. 8/80 FLSA rules built-in."
                },
                {
                  icon: <ShieldCheck className="w-8 h-8 text-[#1d1d1f]" strokeWidth={1.5} />,
                  title: "Log your shifts",
                  desc: "Three taps to enter your shifts. We calculate complex stacking logic automatically."
                },
                {
                  icon: <FileText className="w-8 h-8 text-[#1d1d1f]" strokeWidth={1.5} />,
                  title: "Compare to paystub",
                  desc: "Get an instant discrepancy report you can hand straight to your payroll department."
                }
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center">
                  <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-6">
                    {step.icon}
                  </div>
                  <h3 className="text-[21px] font-semibold tracking-tight mb-3">{step.title}</h3>
                  <p className="text-[#86868b] text-[17px] leading-relaxed max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      
      {/* Footer */}
      <footer className="bg-[#f5f5f7] pt-12 pb-8 border-t border-[#d2d2d7]">
        <div className="max-w-5xl mx-auto px-6 text-center text-[12px] text-[#86868b]">
          <div className="flex items-center justify-center gap-1.5 mb-4 font-medium">
            <ShieldCheck className="w-4 h-4 text-[#86868b]" />
            <p>Runs in your browser. No account. Nothing uploaded.</p>
          </div>
          <p>Copyright © 2026 ShiftCheck Inc. All rights reserved. Not affiliated with any hospital system.</p>
        </div>
      </footer>
    </div>
  );
}
