"use client";

import React from "react";
import Link from "next/link";
import NeonTrail from "@/components/NeonTrail";

export default function UnauthorizedPage() {
  return (
    <div className="bg-background text-on-surface font-body overflow-hidden h-screen w-screen relative select-none">
      <NeonTrail />
      {/* CRT Scanline effect */}
      <div className="scanlines absolute inset-0 z-10 w-full h-full opacity-40 mix-blend-overlay pointer-events-none" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-15" style={{
        backgroundImage: "linear-gradient(rgba(255, 45, 120, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 45, 120, 0.4) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      {/* Main warning card */}
      <main className="relative z-20 flex items-center justify-center h-full w-full p-4">
        <div className="glass-panel w-full max-w-lg rounded-xl p-8 border-error/50 shadow-[0_0_40px_rgba(255,68,68,0.25)] text-center relative overflow-hidden group">
          
          {/* Neon warning accents */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-error/50 m-2 pointer-events-none group-hover:border-error transition-all" />
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-error/50 m-2 pointer-events-none group-hover:border-error transition-all" />

          {/* Glowing Warning Shield Icon */}
          <div className="mx-auto w-20 h-20 rounded-full border border-error bg-error/10 flex items-center justify-center shadow-[0_0_20px_rgba(255,68,68,0.3)] animate-pulse mb-6">
            <span className="material-symbols-outlined text-error text-5xl">gpp_bad</span>
          </div>

          {/* Heading */}
          <h1 className="font-headline font-bold text-4xl text-error tracking-tighter uppercase mb-2 drop-shadow-[0_0_10px_rgba(255,68,68,0.6)]">
            ACCESS DENIED
          </h1>
          <p className="font-label text-tertiary text-xs tracking-widest uppercase mb-6 font-bold">
            SECURITY BREACH / POLICY ENFORCEMENT
          </p>

          <div className="h-[1px] w-full bg-outline-variant/40 mb-6" />

          {/* Description */}
          <p className="font-body text-sm text-on-surface-variant leading-relaxed max-w-md mx-auto mb-8">
            ขออภัย บัญชีผู้ใช้ประเภท <span className="text-tertiary font-bold font-label">STAFF</span> ของคุณไม่มีสิทธิ์ในการเข้าถึงหน้านี้ สิทธิ์การใช้งานของคุณถูกจำกัดเฉพาะหน้าระบบการขาย (POS Terminal) เท่านั้น
          </p>

          {/* Tech specs block */}
          <div className="bg-surface-dim border border-outline-variant/60 rounded p-4 font-mono text-left text-xs mb-8 space-y-2 opacity-80">
            <div className="flex justify-between">
              <span className="text-on-surface-variant">HTTP ERROR:</span>
              <span className="text-error font-bold">403 Forbidden</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">POLICY:</span>
              <span className="text-tertiary">RoleBasedAccessControl (RBAC)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-on-surface-variant">GATE:</span>
              <span className="text-primary">Next.js Edge Middleware Guard</span>
            </div>
          </div>

          {/* Actions */}
          <Link
            href="/sales"
            className="inline-flex py-3.5 px-8 bg-surface-dim border border-secondary text-secondary font-headline font-bold uppercase tracking-widest text-xs rounded hover:shadow-[0_0_16px_rgba(0,255,204,0.5)] hover:text-white transition-all duration-300 items-center gap-2"
          >
            <span className="material-symbols-outlined text-sm">point_of_sale</span>
            <span>กลับสู่หน้าระบบขาย (Go to POS)</span>
          </Link>
        </div>
      </main>
    </div>
  );
}
