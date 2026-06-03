"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function Home() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (user) {
        if (user.role === "ADMIN") {
          router.push("/admin/inventory");
        } else {
          router.push("/sales");
        }
      } else {
        router.push("/login");
      }
    }
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <span className="material-symbols-outlined text-4xl text-primary animate-spin">
          sync
        </span>
        <p className="font-label text-sm text-primary neon-text-primary tracking-widest uppercase animate-pulse">
          INITIALIZING...
        </p>
      </div>
    </div>
  );
}
