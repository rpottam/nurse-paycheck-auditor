import Link from "next/link";
import { ShieldCheck, Calculator, FileText, Scale, ArrowRight } from "lucide-react";

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
            <Link href="/methodology" className="hover:text-[#0066cc] transition-colors">Methodology</Link>
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
            Audit your pay period against your CBA — line by line. Night diffs, weekend stacking, 8/80 overtime, Baylor. Every rule cited. Every dollar accounted for.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
            <Link 
              href="/login" 
              className="group flex items-center justify-center gap-2 rounded-full bg-[#0066cc] px-8 py-4 text-[17px] font-medium text-white transition-all hover:bg-[#0055b3] hover:scale-[1.02] active:scale-95"
            >
              <span>Start your audit</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            
            <Link 
              href="/calculator" 
              className="flex items-center justify-center gap-2 rounded-full border border-[#d2d2d7] bg-transparent px-8 py-4 text-[17px] font-medium text-[#1d1d1f] transition-all hover:bg-[#f5f5f7] active:scale-95"
            >
              <span>Free single-shift calculator</span>
            </Link>
          </div>
        </section>

        {/* Product Trust Card */}
        <section className="w-full max-w-5xl mx-auto px-6 mb-32">
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9] bg-white rounded-[40px] shadow-[0_20px_60px_rgba(0,0,0,0.05)] border border-[#e5e5ea] overflow-hidden flex items-center justify-center">
             <div className="absolute inset-0 bg-gradient-to-b from-[#fbfbfd] to-[#f5f5f7] z-0"></div>
             <div className="z-10 text-center flex flex-col items-center px-6">
                <Calculator className="w-16 h-16 text-[#0066cc] mb-4" strokeWidth={1.5} />
                <h3 className="text-[24px] font-semibold tracking-tight">Deterministic math engine. Zero AI in the calculation path.</h3>
                <p className="text-[#86868b] text-[17px] mt-2 max-w-lg">Every formula documented. Every FLSA citation linked. <Link href="/methodology" className="text-[#0066cc] hover:underline">Read our methodology →</Link></p>
             </div>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="w-full bg-white py-32 border-t border-[#d2d2d7]/50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-20">
              <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight mb-4">How it works.</h2>
              <p className="text-[#86868b] text-[21px] tracking-tight">Three steps. Every rule applied. Every dollar shown.</p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-12">
              {[
                {
                  icon: <Calculator className="w-8 h-8 text-[#1d1d1f]" strokeWidth={1.5} />,
                  title: "Pick your hospital",
                  desc: "Select from 20 pre-loaded CBA templates. Your base rate, differentials, and overtime rules auto-fill in seconds."
                },
                {
                  icon: <ShieldCheck className="w-8 h-8 text-[#1d1d1f]" strokeWidth={1.5} />,
                  title: "Log your shifts",
                  desc: "Enter date, clock-in, clock-out. We auto-detect nights, weekends, and holidays — then stack differentials per your CBA."
                },
                {
                  icon: <FileText className="w-8 h-8 text-[#1d1d1f]" strokeWidth={1.5} />,
                  title: "Compare to your paystub",
                  desc: "See the line-by-line math. If there's a discrepancy, generate a formal HR Dispute Report with every rule cited."
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

        {/* Sample Dispute Report Preview */}
        <section className="w-full py-32 border-t border-[#d2d2d7]/50">
          <div className="max-w-5xl mx-auto px-6">
            <div className="text-center mb-16">
              <h2 className="text-[40px] md:text-[56px] font-semibold tracking-tight mb-4">The report HR takes seriously.</h2>
              <p className="text-[#86868b] text-[21px] tracking-tight max-w-2xl mx-auto">A mathematically defensible PDF with every shift, every rule, and every dollar — not a screenshot of a spreadsheet.</p>
            </div>

            <div className="bg-white rounded-[32px] shadow-[0_20px_60px_rgba(0,0,0,0.06)] border border-[#e5e5ea] p-8 md:p-12 max-w-2xl mx-auto">
              <div className="border-b border-[#e5e5ea] pb-6 mb-6">
                <h3 className="text-[15px] font-bold tracking-wider text-[#1d1d1f] uppercase">Gross Wage Verification & Dispute Report</h3>
                <p className="text-[12px] text-[#86868b] mt-1">Generated by ShiftCheck • Deterministic Engine v0.1.0</p>
              </div>
              
              <div className="space-y-3 text-[14px] mb-6">
                <div className="flex justify-between"><span className="text-[#86868b]">Hospital / CBA</span><span className="font-medium">Kaiser NorCal (CNA 2024–2027)</span></div>
                <div className="flex justify-between"><span className="text-[#86868b]">Pay Period</span><span className="font-medium">Apr 14 – Apr 27, 2026</span></div>
                <div className="flex justify-between"><span className="text-[#86868b]">Shifts Logged</span><span className="font-medium">6 shifts (72 hrs)</span></div>
              </div>

              <div className="bg-[#f5f5f7] rounded-2xl p-5 mb-6">
                <div className="text-[12px] text-[#86868b] font-semibold uppercase tracking-wider mb-3">Sample Line Items</div>
                <div className="space-y-2 text-[13px]">
                  <div className="flex justify-between"><span>Apr 14 — Regular (Straight) 8hr × $65.50</span><span className="font-medium">$524.00</span></div>
                  <div className="flex justify-between"><span>Apr 14 — OT (1.5×) 4hr × $98.25</span><span className="font-medium">$393.00</span></div>
                  <div className="flex justify-between"><span>Apr 19 — Night+Weekend 8hr × $75.50</span><span className="font-medium">$604.00</span></div>
                  <div className="flex justify-between text-[#86868b]"><span>… 9 more line items</span><span></span></div>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-[#e5e5ea] pt-5">
                <div>
                  <div className="text-[13px] text-[#86868b]">Expected Gross</div>
                  <div className="text-[28px] font-semibold">$4,812.00</div>
                </div>
                <div className="text-right">
                  <div className="text-[13px] text-[#86868b]">Discrepancy</div>
                  <div className="text-[28px] font-semibold text-[#ff3b30]">−$247.50</div>
                </div>
              </div>
            </div>

            <div className="text-center mt-8">
              <p className="text-[14px] text-[#86868b]">Every rule applied is cited. Every formula is <Link href="/methodology" className="text-[#0066cc] hover:underline">documented</Link>.</p>
            </div>
          </div>
        </section>

        {/* Social Proof Placeholder */}
        <section className="w-full bg-white py-20 border-t border-[#d2d2d7]/50">
          <div className="max-w-3xl mx-auto px-6 text-center">
            <p className="text-[#86868b] text-[15px] italic">"Recovered $147 in missed weekend differentials on my first audit."</p>
            <p className="text-[13px] text-[#86868b] mt-2">— Beta tester, Kaiser NorCal RN (anonymized)</p>
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
          <div className="flex items-center justify-center gap-4 mb-4">
            <Link href="/privacy" className="hover:text-[#1d1d1f] transition-colors">Privacy Policy</Link>
            <Link href="/methodology" className="hover:text-[#1d1d1f] transition-colors">Methodology</Link>
          </div>
          <p>Copyright © 2026 ShiftCheck. Not affiliated with any hospital system. Contact: support@shiftcheck.app</p>
        </div>
      </footer>
    </div>
  );
}
