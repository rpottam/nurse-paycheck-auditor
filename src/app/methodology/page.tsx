import Link from "next/link";
import { ArrowLeft, ShieldCheck, Scale, BookOpen } from "lucide-react";

export default function Methodology() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans selection:bg-[#0066cc] selection:text-white pb-32">
      <nav className="w-full px-6 py-6 flex items-center justify-between max-w-3xl mx-auto border-b border-[#d2d2d7]/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-[#0066cc] hover:underline text-[15px]">
          <ArrowLeft className="w-4 h-4" />
          <span>Home</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[#1d1d1f] font-medium text-[15px]">
          <Scale className="w-4 h-4" />
          Open Methodology
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-8 border border-[#e5e5ea]">
          <BookOpen className="w-8 h-8 text-[#1d1d1f]" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-[40px] font-semibold tracking-tight mb-4">Calculation Methodology</h1>
        <p className="text-[#86868b] text-[19px] mb-4 tracking-tight">
          ShiftCheck Engine v0.1.0 • Last updated April 2026
        </p>
        <p className="text-[17px] text-[#1d1d1f] leading-relaxed mb-12 max-w-2xl">
          Every formula used in ShiftCheck is documented below. If you find an error, we want to hear about it — our credibility depends on mathematical precision, not marketing.
        </p>

        <div className="space-y-10">

          {/* 1. Base Rate */}
          <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5ea]">
            <h2 className="text-[21px] font-semibold tracking-tight mb-4">1. Base Rate Calculation</h2>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed mb-4">
              For each shift, hours are computed as: <code className="bg-[#f5f5f7] px-2 py-1 rounded-lg text-[15px]">hours = (endTime − startTime − breakMinutes) / 60</code>
            </p>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed">
              Overnight shifts (end time &lt; start time) are automatically detected and 24 hours are added to the end time. Break deduction defaults to 30 minutes unless "No Lunch" is toggled.
            </p>
          </section>

          {/* 2. Differentials */}
          <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5ea]">
            <h2 className="text-[21px] font-semibold tracking-tight mb-4">2. Shift Differentials</h2>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed mb-4">
              Differentials are <strong>additive</strong> and <strong>stack</strong>. The effective hourly rate for any shift is:
            </p>
            <div className="bg-[#f5f5f7] rounded-2xl p-5 mb-4 font-mono text-[14px]">
              effectiveRate = (baseRate + chargeDiff + preceptorDiff + nightDiff + weekendDiff) × holidayMultiplier
            </div>
            <div className="space-y-3 text-[15px]">
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[140px]">Night differential</span>
                <span className="text-[#86868b]">Applied when shift starts between 19:00–06:59. Flat $/hr addition. Source: CBA template or user-entered value.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[140px]">Weekend differential</span>
                <span className="text-[#86868b]">Applied when shift date falls on Saturday (day 6) or Sunday (day 0). Flat $/hr addition. Computed via <code className="bg-white px-1 rounded">getDay()</code>.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[140px]">Holiday premium</span>
                <span className="text-[#86868b]">Applied as a 1.5× multiplier to the full effective rate (base + all differentials). This matches CBA standard where holiday pay covers the entire compensation package. User-toggled per shift.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[140px]">Charge RN</span>
                <span className="text-[#86868b]">Configurable $/hr addition (default $2.00). Applied before all other calculations.</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="font-semibold min-w-[140px]">Preceptor RN</span>
                <span className="text-[#86868b]">Configurable $/hr addition (default $1.50). Applied before all other calculations.</span>
              </div>
            </div>
          </section>

          {/* 3. Overtime */}
          <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5ea]">
            <h2 className="text-[21px] font-semibold tracking-tight mb-4">3. Overtime Rules</h2>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed mb-6">
              ShiftCheck supports four overtime configurations. The applicable rule is determined by your CBA template or manual selection during onboarding.
            </p>
            <div className="space-y-4">
              <div className="bg-[#f5f5f7] rounded-2xl p-5">
                <h3 className="font-semibold text-[15px] mb-1">Daily &gt;8 hours</h3>
                <p className="text-[14px] text-[#86868b]">Straight time for first 8 hours. 1.5× effective rate for hours 8+. Common in California CNA contracts.</p>
                <p className="text-[12px] text-[#86868b] mt-2">Authority: Cal. Lab. Code §510</p>
              </div>
              <div className="bg-[#f5f5f7] rounded-2xl p-5">
                <h3 className="font-semibold text-[15px] mb-1">Daily &gt;12 hours (AWS)</h3>
                <p className="text-[14px] text-[#86868b]">Straight time for first 12 hours. 1.5× for hours 12+. Used for Alternative Workweek Schedules.</p>
                <p className="text-[12px] text-[#86868b] mt-2">Authority: Cal. Lab. Code §511</p>
              </div>
              <div className="bg-[#f5f5f7] rounded-2xl p-5">
                <h3 className="font-semibold text-[15px] mb-1">Weekly &gt;40 hours</h3>
                <p className="text-[14px] text-[#86868b]">Standard FLSA overtime. All hours above 40 in a workweek are paid at 1.5× base rate.</p>
                <p className="text-[12px] text-[#86868b] mt-2">Authority: 29 USC §207(a)(1); 29 CFR §778.110</p>
              </div>
              <div className="bg-[#f5f5f7] rounded-2xl p-5">
                <h3 className="font-semibold text-[15px] mb-1">FLSA 8/80 Rule</h3>
                <p className="text-[14px] text-[#86868b]">Hospital-specific exception. OT after 8 hours/day OR 80 hours in a 14-day period. Currently implemented as daily &gt;8 with period-level tracking planned for v0.2.</p>
                <p className="text-[12px] text-[#86868b] mt-2">Authority: 29 USC §207(j); 29 CFR §553.50</p>
              </div>
            </div>
          </section>

          {/* 4. Baylor */}
          <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5ea]">
            <h2 className="text-[21px] font-semibold tracking-tight mb-4">4. Baylor Pay</h2>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed mb-4">
              If Baylor is enabled and total regular hours are between 36 and 40, the engine adds "ghost hours" at the base rate to bring the total to 40 hours of pay.
            </p>
            <div className="bg-[#f5f5f7] rounded-2xl p-5 font-mono text-[14px]">
              baylorBonus = (40 − totalRegularHours) × baseRate
            </div>
            <p className="text-[14px] text-[#86868b] mt-3">Source: Employer-specific weekend program agreements. Not FLSA-mandated.</p>
          </section>

          {/* 5. Known Limitations */}
          <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5ea]">
            <h2 className="text-[21px] font-semibold tracking-tight mb-4">5. Known Limitations (v0.1.0)</h2>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed mb-4">
              We believe in transparency. These are scenarios the engine does not yet fully support:
            </p>
            <ul className="space-y-3 text-[15px]">
              <li className="flex items-start gap-2">
                <span className="text-[#ff9500] mt-1">⚠</span>
                <span><strong>Blended-rate OT:</strong> When multiple pay rates apply in one week, FLSA requires a weighted-average rate for OT calculation (29 CFR §778.115). We currently use 1.5× base rate. The engine warns users when this scenario is detected.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff9500] mt-1">⚠</span>
                <span><strong>True 14-day 8/80:</strong> The full 8/80 rule requires tracking two 7-day windows within a 14-day period. Currently implemented as daily &gt;8 within the pay period boundary.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff9500] mt-1">⚠</span>
                <span><strong>Float pool / per-shift rates:</strong> Per-shift rate overrides are supported via the <code className="bg-white px-1 rounded">rateOverride</code> field. UI for setting per-shift rates from the shift logger is planned for v0.2.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff9500] mt-1">⚠</span>
                <span><strong>Travel nurse stipends:</strong> Housing, meal, and travel stipends are not modeled. Deferred to v2 per product roadmap.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#ff9500] mt-1">⚠</span>
                <span><strong>On-call / callback pay:</strong> Not yet supported.</span>
              </li>
            </ul>
          </section>

          {/* 6. References */}
          <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5ea]">
            <h2 className="text-[21px] font-semibold tracking-tight mb-4">6. Legal References</h2>
            <ul className="space-y-2 text-[15px] text-[#86868b]">
              <li>29 USC §207 — Maximum hours; overtime compensation</li>
              <li>29 USC §207(j) — Hospital 8/80 exception</li>
              <li>29 CFR §553.50 — Application of §207(j) to hospitals</li>
              <li>29 CFR §778.108–§778.119 — Blended rate / regular rate of pay</li>
              <li>29 CFR §778.110 — Regular rate for single-rate employees</li>
              <li>29 CFR §778.115 — Regular rate for employees with fluctuating hours</li>
              <li>Cal. Lab. Code §510 — California daily overtime</li>
              <li>Cal. Lab. Code §511 — Alternative Workweek Schedules</li>
            </ul>
            <p className="text-[13px] text-[#86868b] mt-4">
              CBA template data is sourced from publicly available collective bargaining agreements. Template accuracy is verified against the source document but may lag contract amendments.
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
