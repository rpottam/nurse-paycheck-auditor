"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, UserCircle, FileText, ShieldCheck } from "lucide-react";
import { UserProfile } from "../../types";

export default function Profile() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const savedProfile = localStorage.getItem("user_profile");
    if (savedProfile) {
      setProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleClearData = () => {
    if (confirm("Are you sure? This will delete all your shifts and profile data from this browser.")) {
      localStorage.removeItem("user_profile");
      localStorage.removeItem("user_shifts");
      router.push("/");
    }
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans selection:bg-[#0066cc] selection:text-white pb-32">
      {/* Navigation */}
      <nav className="w-full px-6 py-6 flex items-center justify-between max-w-3xl mx-auto border-b border-[#d2d2d7]/50 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <Link href="/shifts" className="flex items-center gap-2 text-[#0066cc] hover:underline text-[15px]">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Shifts</span>
        </Link>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-6 mb-12">
          <div className="w-[88px] h-[88px] rounded-full bg-[#f5f5f7] border border-[#e5e5ea] flex items-center justify-center">
            <UserCircle className="w-[56px] h-[56px] text-[#86868b]" strokeWidth={1} />
          </div>
          <div>
            <h1 className="text-[32px] font-semibold tracking-tight">My Profile</h1>
            <p className="text-[#86868b] text-[17px]">Stored locally in your browser</p>
          </div>
        </div>

        <div className="space-y-8">
          <section className="bg-white border border-[#e5e5ea] rounded-3xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h2 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-widest mb-6 flex items-center gap-2">
              <FileText className="w-4 h-4" /> Pay Rules
            </h2>
            
            {profile ? (
              <div className="space-y-5 text-[17px]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#e5e5ea] pb-5 gap-1">
                  <span className="text-[#1d1d1f] font-medium">Hospital</span>
                  <span className="text-[#86868b]">{profile.hospitalTemplateId}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#e5e5ea] pb-5 gap-1">
                  <span className="text-[#1d1d1f] font-medium">Employment Type</span>
                  <span className="text-[#86868b] capitalize">{profile.employmentType?.replace('-', ' ')}</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#e5e5ea] pb-5 gap-1">
                  <span className="text-[#1d1d1f] font-medium">Base Rate</span>
                  <span className="text-[#86868b]">${profile.baseRate.toFixed(2)}/hr</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#e5e5ea] pb-5 gap-1">
                  <span className="text-[#1d1d1f] font-medium">Charge Nurse Premium</span>
                  <span className="text-[#86868b]">+${(profile.chargeDiff ?? 2).toFixed(2)}/hr</span>
                </div>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center border-b border-[#e5e5ea] pb-5 gap-1">
                  <span className="text-[#1d1d1f] font-medium">Preceptor Premium</span>
                  <span className="text-[#86868b]">+${(profile.preceptorDiff ?? 1.5).toFixed(2)}/hr</span>
                </div>
                <div className="pt-2">
                  <Link href="/onboarding" className="text-[#0066cc] hover:underline font-medium">
                    Edit Pay Rules
                  </Link>
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-[#86868b] text-[17px] mb-6">No profile configured yet.</p>
                <Link href="/onboarding" className="bg-[#f5f5f7] hover:bg-[#e8e8ed] px-6 py-3 rounded-full text-[15px] font-medium transition-colors">
                  Set up profile
                </Link>
              </div>
            )}
          </section>
          
          <section className="bg-white border border-[#e5e5ea] rounded-3xl p-8 shadow-[0_2px_12px_rgba(0,0,0,0.02)]">
            <h2 className="text-[13px] font-semibold text-[#86868b] uppercase tracking-widest mb-4 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4" /> Privacy & Data
            </h2>
            <p className="text-[15px] text-[#86868b] mb-8 leading-relaxed max-w-xl">
              Your data is stored exclusively in this browser's local storage. We do not track your shifts, rates, or any personally identifiable information.
            </p>
            <button 
              onClick={handleClearData}
              className="text-[#ff3b30] font-medium hover:underline flex items-center gap-2 text-[15px]"
            >
              Clear All Data
            </button>
          </section>
        </div>
      </main>
    </div>
  );
}
