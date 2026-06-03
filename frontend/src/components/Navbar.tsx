"use client";

import React from "react";
import { useAuth } from "@/hooks/useAuth";

interface NavbarProps {
  onMenuClick?: () => void;
  onSearchChange?: (val: string) => void;
}

export default function Navbar({ onMenuClick, onSearchChange }: NavbarProps) {
  const { user } = useAuth();

  const getRoleColorClass = (role?: string) => {
    if (role === "ADMIN") return "text-primary neon-text-primary";
    return "text-tertiary neon-text-tertiary";
  };

  const getProfileImage = () => {
    if (user?.role === "ADMIN") {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuAijYLk4ji1OzWVj2WPP5sqMC7TBWvBdpC8_VwtJu52_9_YLre7KdyQTq4rrsb0HYo1MkRhrE0LLKjyCFiCzJvknVqOi7RaRxyumYZtOTFabooUhsFsY752oKDuwIwr0uezZTL4EVG84nZNLNZkSFeGp_9cX_XFnElSIr4UlX8VzyPRCvtPRk7dovgjRXUb5eBSlJ8bHkLSPybF499bQefAdRZAQRyoUISnbFBIqGAYRrfxd9zlBNo9ezcyQs1XWpuCmUfXVOQcypk";
    }
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuCjhSxqJNgDLSozXmoQsYnN2Ww6UXFgAwtqiReBkQmsjzO9dXWjGjDi_x9WJiLwsEBJxb6xdPQatasqTp-lFX1VKizHANyPgc8zKEYqRgXRMwbUan0mYTHY6u9hwZikbbL5Mk_rQ6pt3y9dX2meGj9OIBbP0XPzKvWhQk0afnCWU5XOo7RZ02kQ01b3deoXoukPZziAWrujbpse2OXC-s8bJXek91TPQEsfw6Z-7JplTJUo151fkueInaozhwU8DDm0j4r1Z6uy8iQ";
  };

  return (
    <nav className="bg-surface/80 backdrop-blur-md fixed top-0 left-0 right-0 w-full z-50 flex justify-between items-center px-6 py-3 border-b border-primary/30 shadow-[0_0_15px_rgba(255,45,120,0.1)]">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuClick}
          className="md:hidden text-primary p-2 hover:text-secondary transition-colors"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <span className="text-xl font-headline font-bold text-primary italic tracking-tighter neon-text-primary">
          Demo 2: Mini ERP
        </span>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden md:block relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">
          search
        </span>
        <input
          type="text"
          onChange={(e) => onSearchChange?.(e.target.value)}
          className="w-full bg-surface-container-high border-b border-outline-variant focus:border-secondary focus:ring-0 text-on-surface placeholder-on-surface-variant pl-10 pr-4 py-1.5 font-label text-sm transition-all focus:shadow-[0_1px_8px_rgba(0,255,204,0.3)] outline-none rounded-t-DEFAULT"
          placeholder="ค้นหา..."
        />
      </div>

      <div className="flex items-center gap-6">
        <div className="flex items-center gap-4">
          <button className="text-on-surface-variant hover:text-secondary hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-300 active:scale-95">
            <span className="material-symbols-outlined">notifications</span>
          </button>
          <button className="text-on-surface-variant hover:text-secondary hover:drop-shadow-[0_0_8px_currentColor] transition-all duration-300 active:scale-95 group">
            <span className="material-symbols-outlined group-hover:rotate-90 transition-transform duration-300">
              settings
            </span>
          </button>
        </div>

        <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
          <div className="text-right hidden sm:block">
            <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-wider">
              {user?.name || "User"}
            </div>
            <div className={`font-headline text-sm font-bold uppercase tracking-wider ${getRoleColorClass(user?.role)}`}>
              {user?.role || "GUEST"}
            </div>
          </div>
          <div className="h-8 w-8 rounded-full bg-primary/20 border border-primary/50 flex items-center justify-center overflow-hidden shadow-[0_0_10px_rgba(255,45,120,0.2)]">
            <img
              alt="User profile"
              className="h-full w-full object-cover"
              src={getProfileImage()}
            />
          </div>
        </div>
      </div>
    </nav>
  );
}
