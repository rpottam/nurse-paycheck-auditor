import Link from "next/link";
import { ArrowLeft, ShieldCheck, Lock } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans selection:bg-[#0066cc] selection:text-white pb-32">
      {/* Navigation */}
      <nav className="w-full px-6 py-6 flex items-center justify-between max-w-3xl mx-auto border-b border-[#d2d2d7]/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/" className="flex items-center gap-2 text-[#0066cc] hover:underline text-[15px]">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
        <div className="flex items-center gap-1.5 text-[#1d1d1f] font-medium text-[15px]">
          <ShieldCheck className="w-4 h-4" />
          ShiftCheck Security
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-8 border border-[#e5e5ea]">
          <Lock className="w-8 h-8 text-[#1d1d1f]" strokeWidth={1.5} />
        </div>
        
        <h1 className="text-[40px] font-semibold tracking-tight mb-4">Privacy & Security Policy</h1>
        <p className="text-[#86868b] text-[19px] mb-12 tracking-tight">
          Last Updated: April 2026. Your financial data is yours, and we intend to keep it that way.
        </p>

        <div className="space-y-10">
          <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5ea]">
            <h2 className="text-[21px] font-semibold tracking-tight mb-4">1. Local-First Architecture</h2>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed mb-4">
              ShiftCheck is designed with a strict "local-first" architecture. This means that <strong>your hourly rates, logged shifts, union affiliations, and expected gross pay are never uploaded to any server.</strong> 
            </p>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed">
              All of your sensitive financial information is stored exclusively in your browser's local storage (`localStorage`) on the device you are currently using. If you clear your browser data or switch devices, your ShiftCheck data will not follow you.
            </p>
          </section>

          <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5ea]">
            <h2 className="text-[21px] font-semibold tracking-tight mb-4">2. Zero Data Harvesting</h2>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed mb-4">
              We do not track, aggregate, or harvest your pay rates. We do not sell data to hospital networks, recruiting agencies, or third-party advertisers. 
            </p>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed">
              When you generate an "HR Dispute Report," the PDF is rendered entirely client-side using JavaScript running directly on your device. The generated document never touches our servers.
            </p>
          </section>

          <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5ea]">
            <h2 className="text-[21px] font-semibold tracking-tight mb-4">3. Why We Have a Login Page</h2>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed">
              We provide a login interface to ensure that someone casually using your device cannot accidentally navigate to your ShiftCheck dashboard and view your hourly rates. The authentication layer acts as a local security gate for your peace of mind.
            </p>
          </section>

          <section className="bg-white rounded-[32px] p-8 md:p-10 shadow-[0_2px_12px_rgba(0,0,0,0.02)] border border-[#e5e5ea]">
            <h2 className="text-[21px] font-semibold tracking-tight mb-4">4. Right to Delete</h2>
            <p className="text-[17px] text-[#1d1d1f] leading-relaxed">
              Because we do not have a centralized database of your shifts, you have complete control over your data. You can completely wipe all traces of ShiftCheck from your device at any time by navigating to your Profile and clicking "Clear All Data."
            </p>
          </section>
        </div>
      </main>
    </div>
  );
}
