"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, ArrowRight, Lock } from "lucide-react";

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;

    setIsAuthenticating(true);
    
    // Simulate network delay for premium feel
    setTimeout(() => {
      // Local-first mock auth
      localStorage.setItem("shiftcheck_auth", "true");

      const savedProfile = localStorage.getItem("user_profile");
      if (savedProfile) {
        router.push("/shifts");
      } else {
        router.push("/onboarding");
      }
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#fbfbfd] text-[#1d1d1f] font-sans selection:bg-[#0066cc] selection:text-white flex flex-col items-center justify-center p-6 relative">
      
      {/* Top Banner */}
      <div className="absolute top-0 left-0 w-full p-4 flex justify-center bg-white border-b border-[#e5e5ea] shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <Link href="/" className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#1d1d1f]" strokeWidth={2} />
          <span className="text-[17px] font-semibold tracking-tight">ShiftCheck</span>
        </Link>
      </div>

      <div className="w-full max-w-md bg-white rounded-[32px] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.08)] border border-[#e5e5ea] animate-in fade-in slide-in-from-bottom-8 duration-500">
        
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-16 h-16 rounded-full bg-[#f5f5f7] flex items-center justify-center mb-6">
            <Lock className="w-8 h-8 text-[#1d1d1f]" strokeWidth={1.5} />
          </div>
          <h1 className="text-[28px] font-semibold tracking-tight mb-2">Secure Login</h1>
          <p className="text-[15px] text-[#86868b]">Protecting your local financial data.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="text-[13px] font-medium text-[#86868b] block mb-1.5 ml-1">Email Address</label>
            <input 
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-[#f5f5f7] border-none rounded-[16px] px-5 py-4 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none focus:bg-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#86868b] block mb-1.5 ml-1">Password</label>
            <input 
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-[#f5f5f7] border-none rounded-[16px] px-5 py-4 text-[17px] text-[#1d1d1f] focus:ring-2 focus:ring-[#0066cc] focus:outline-none focus:bg-white transition-colors"
              required
            />
          </div>

          <button 
            type="submit"
            disabled={isAuthenticating}
            className={`w-full flex h-14 items-center justify-center gap-2 rounded-full text-[17px] font-medium transition-all mt-4 ${
              isAuthenticating 
                ? 'bg-[#0066cc]/70 text-white cursor-wait' 
                : 'bg-[#0066cc] hover:bg-[#0055b3] text-white shadow-[0_4px_14px_rgba(0,102,204,0.3)]'
            }`}
          >
            {isAuthenticating ? "Verifying..." : "Continue"}
            {!isAuthenticating && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-[13px] text-[#86868b]">
            Your data is stored locally. <br/>
            <Link href="/privacy" className="text-[#0066cc] hover:underline font-medium">Read our Privacy Policy</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
