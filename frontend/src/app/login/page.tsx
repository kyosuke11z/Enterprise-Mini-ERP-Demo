"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import CyberCanvas from "@/components/CyberCanvas";
import NeonTrail from "@/components/NeonTrail";

export default function LoginPage() {
  const router = useRouter();
  const { login, error, setError } = useAuth();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setSubmitting(true);
    try {
      const user = await login(username, password);
      if (user.role === "ADMIN") {
        router.push("/admin/inventory");
      } else {
        router.push("/sales");
      }
    } catch (err) {
      // Error handled by AuthContext, displayed locally
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-background text-on-surface font-body overflow-hidden h-screen w-screen relative select-none">
      {/* Background Interactive canvas */}
      <CyberCanvas />
      {/* CRT Scanline effect */}
      <div className="scanlines absolute inset-0 z-10 w-full h-full opacity-50 mix-blend-overlay pointer-events-none" />
      {/* Mouse trail */}
      <NeonTrail />

      {/* Login Container */}
      <main className="relative z-20 flex items-center justify-center h-full w-full p-4 sm:p-8">
        <div className={`glass-panel w-full max-w-md rounded-xl p-8 shadow-[0_0_30px_rgba(0,0,0,0.8)] relative overflow-hidden group transition-all duration-300 ${error ? 'border-error/70 shadow-[0_0_30px_rgba(255,68,68,0.2)]' : 'border-primary/30'}`}>
          {/* Corner highlights */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary/50 opacity-50 m-2 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 group-hover:border-primary" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-secondary/50 opacity-50 m-2 pointer-events-none transition-opacity duration-500 group-hover:opacity-100 group-hover:border-secondary" />

          {/* Header */}
          <div className="text-center mb-10">
            <h1 className="font-headline font-bold text-4xl tracking-tighter text-primary neon-text-primary uppercase mb-2">
              NEON ACCESS
            </h1>
            <p className="font-label text-secondary text-sm tracking-widest uppercase opacity-80">
              Demo 2: Mini ERP
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 px-4 py-3 rounded bg-error-container/20 border border-error/50 text-error text-xs font-label flex items-center gap-2 animate-bounce">
              <span className="material-symbols-outlined text-sm">warning</span>
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form className="space-y-8" onSubmit={handleSubmit}>
            {/* Username */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl transition-colors duration-300 peer-focus:text-secondary">
                person
              </span>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (error) setError(null);
                }}
                className="cyber-input w-full pl-10 pr-4 py-3 text-on-surface font-label placeholder-on-surface-variant/50 peer"
                placeholder="ชื่อผู้ใช้"
                required
              />
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-secondary transition-all duration-300 peer-focus:w-full" />
            </div>

            {/* Password */}
            <div className="relative">
              <span className="material-symbols-outlined absolute left-0 top-1/2 -translate-y-1/2 text-on-surface-variant text-xl transition-colors duration-300 peer-focus:text-secondary">
                lock
              </span>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError(null);
                }}
                className="cyber-input w-full pl-10 pr-12 py-3 text-on-surface font-label placeholder-on-surface-variant/50 peer"
                placeholder="รหัสผ่าน"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-0 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors p-2 focus:outline-none"
              >
                <span className="material-symbols-outlined text-lg">
                  {showPassword ? "visibility" : "visibility_off"}
                </span>
              </button>
              <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-secondary transition-all duration-300 peer-focus:w-full" />
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between mt-6 font-label text-xs">
              <label className="flex items-center space-x-2 cursor-pointer group">
                <div className="relative flex items-center justify-center w-4 h-4 border border-outline rounded bg-surface-dim transition-colors group-hover:border-primary">
                  <input type="checkbox" className="opacity-0 absolute inset-0 cursor-pointer peer" />
                  <span className="material-symbols-outlined text-[12px] text-primary neon-text-primary opacity-0 peer-checked:opacity-100 transition-opacity">
                    check
                  </span>
                </div>
                <span className="text-on-surface-variant group-hover:text-on-surface transition-colors">
                  จดจำฉันไว้
                </span>
              </label>
              <a href="#" className="text-secondary hover:text-primary transition-colors hover:neon-text-primary">
                ลืมรหัสผ่าน?
              </a>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-8 py-4 px-6 bg-surface-dim border border-primary text-primary font-headline font-bold uppercase tracking-widest text-sm rounded transition-all duration-300 hover:bg-primary/10 hover:text-on-primary-container neon-border-glow flex justify-center items-center gap-2 group disabled:opacity-50"
            >
              <span>{submitting ? "กำลังตรวจสอบ..." : "เข้าสู่ระบบ"}</span>
              <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </form>

          <div className="mt-8 text-center border-t border-outline-variant pt-6">
            <p className="font-label text-xs text-on-surface-variant">
              ยังไม่มีบัญชี?
              <a href="#" className="text-primary hover:text-secondary transition-colors font-bold ml-1">
                ลงทะเบียน
              </a>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
