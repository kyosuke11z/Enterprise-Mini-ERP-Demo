"use client";

import React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    await logout();
    router.push("/login");
  };

  const getProfileImage = () => {
    if (user?.role === "ADMIN") {
      // Cyberpunk admin avatar
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuBR-kapJV-Zk4ET2uSfZtu2WziFqGpdphucqA4wEinuoNkyXobusd2IS56KLzCa0ruKGqnT6fciitjRj_niWVAkfEQSjr-rwNuTyDTfDSN2ZjWDGfiXgd7el_KjnzQEuPB45ApZa6AeeTlZ2sP-EjkbyKEFJVpEJ-6vK5a74B_YhYl6ETtgpMSMfzOa-aIfTt2L3MGjaOjF402ibyWaGJRC3X11ju2K4WmP0BLTH68fl-H9xLIrw-QN4Br_47eXVTMYumy4XpvC2PI";
    }
    // Cyberpunk staff avatar
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuARJv4g0NRaGQPPP5zXWi8rsREG-TVgfNSvEBTkXlD7HDFzp5tPgR2WZmLo5jOM2QpeZcvI5gqiiaJQ6K4zq_sh19k4Y_YnPB_Yik8sBX854hTvfKV0HWE6NCk0wyPnrT5ekVtwZpZoponEg_YvpLh4XW5DsHUqdlcZvDXlVz72pdFN3yOjbjdTAwCvTsQw9qdZ9wnCBTP8nQq-TKiKCv32EvEG7Oq4VrciR-Vi4_QuK_V6xua19WoS8hLBdw76yzT7y0lqHZ_V5XM";
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const linkClass = (path: string) => {
    if (isActive(path)) {
      return "flex items-center gap-4 px-4 py-3 rounded-lg bg-primary/10 text-primary border-r-4 border-primary font-label uppercase tracking-widest text-xs neon-text-primary translate-x-1 duration-200";
    }
    return "flex items-center gap-4 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-secondary transition-colors font-label uppercase tracking-widest text-xs group";
  };

  const iconClass = (path: string) => {
    if (isActive(path)) return "material-symbols-outlined text-lg";
    return "material-symbols-outlined text-lg group-hover:drop-shadow-[0_0_8px_currentColor]";
  };

  return (
    <>
      {/* Drawer Overlay for Mobile */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/60 md:hidden backdrop-blur-sm"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 h-full flex flex-col pt-20 pb-6 w-64 bg-surface-container border-r border-primary/20 shadow-[inset_-10px_0_20px_rgba(0,0,0,0.5)] z-40 transition-transform duration-300 md:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="px-6 mb-8 border-b border-primary/10 pb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full overflow-hidden border border-primary/30 p-1 flex items-center justify-center bg-surface-dim shadow-[0_0_10px_rgba(255,45,120,0.2)]">
              <img
                alt="Avatar"
                className="w-full h-full rounded-full object-cover grayscale opacity-80"
                src={getProfileImage()}
              />
            </div>
            <div>
              <div className="font-headline font-bold text-on-surface text-sm truncate max-w-[120px]">
                {user?.name || "User"}
              </div>
              <div className="font-label text-[10px] text-on-surface-variant uppercase tracking-widest">
                {user?.role || "GUEST"}
              </div>
            </div>
          </div>
          <Link
            href="/sales"
            onClick={onClose}
            className="mt-6 w-full py-2 bg-background border border-primary text-primary font-label text-xs uppercase tracking-widest rounded neon-border-primary neon-btn-primary transition-all duration-300 flex items-center justify-center gap-2 group active:scale-95"
          >
            <span className="material-symbols-outlined text-sm group-hover:neon-text-primary transition-all">
              add
            </span>
            New Sale
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {/* Inventory Link (Admin only, but visible to all. Middleware guards access) */}
          <Link
            href="/admin/inventory"
            onClick={onClose}
            className={linkClass("/admin/inventory")}
          >
            <span className={iconClass("/admin/inventory")}>inventory_2</span>
            <span>Inventory</span>
          </Link>

          {/* Sales POS Link (Visible to all) */}
          <Link
            href="/sales"
            onClick={onClose}
            className={linkClass("/sales")}
          >
            <span className={iconClass("/sales")}>point_of_sale</span>
            <span>Sales / POS</span>
          </Link>

          {/* Staff List Link (Admin only, visible to all, guarded) */}
          <Link
            href="/admin/users"
            onClick={onClose}
            className={linkClass("/admin/users")}
          >
            <span className={iconClass("/admin/users")}>badge</span>
            <span>Staff</span>
          </Link>
        </nav>

        <div className="px-4 mt-auto">
          <a
            href="#logout"
            onClick={handleLogout}
            className="flex items-center gap-4 px-4 py-3 rounded-lg text-on-surface-variant hover:bg-error-container/20 hover:text-error transition-colors font-label uppercase tracking-widest text-xs group"
          >
            <span className="material-symbols-outlined text-lg group-hover:drop-shadow-[0_0_8px_currentColor]">
              logout
            </span>
            <span>Logout</span>
          </a>
        </div>
      </aside>
    </>
  );
}
