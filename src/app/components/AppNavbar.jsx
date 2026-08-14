"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { LayoutDashboard, ClipboardList, Activity, LogOut, Menu, X, ShieldCheck, Folder } from "lucide-react";
import { getSession, logout } from "../lib/auth";

const NAV = [
  { href: "/welcome", label: "Home", icon: LayoutDashboard },
  { href: "/dashboard", label: "Dashboard", icon: Activity },
  { href: "/form", label: "Report", icon: ClipboardList },
  { href: "/tracking", label: "Production tracking", icon: Folder },
];

export default function AppNavbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const [session, setSession] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setSession(getSession());
  // eslint-disable-next-line react-compiler/react-compiler
  }, []);

  const handleLogout = () => setConfirmOpen(true);
  const confirmLogout = () => {
    logout();
    router.push("/login");
  };

  const isActive = (href) => pathname === href || (href !== "/welcome" && pathname.startsWith(href));

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
          
          {/* Logo - 🎯 2. เรียกใช้รูปจาก /public สดๆ ได้เลย ไม่ต้องย้อนโฟลเดอร์ import */}
          <Link href="/welcome" className="flex items-center gap-2 shrink-0">
            <Image 
              src="/Inoac.png" 
              width={64} 
              height={64} 
              quality={100} 
              alt="Inoac Logo" 
              className="w-auto h-8 " 
              priority
            />
           
          </Link>

          {/* Desktop: เมนูแนวนอน */}
          <nav className="hidden lg:flex items-center gap-1 flex-1 justify-center">
            {NAV.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${isActive(href) ? "bg-blue-50 text-blue-500" : "text-blue-950 hover:bg-blue-50 hover:text-blue-900"}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {label}
              </Link>
            ))}
            {mounted && session?.role === "admin" && (
              <Link
                href="/admin"
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors
                  ${pathname === "/admin" ? "bg-blue-50 text-blue-500" : "text-blue-950 hover:bg-blue-50 hover:text-blue-900"}`}
              >
                <ShieldCheck className="w-4 h-4 shrink-0" />
                Admin
              </Link>
            )}
          </nav>

          {/* Desktop: ผู้ใช้งาน + ออกจากระบบ */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {mounted && session && (
              <span className="text-xs text-[#00B4D8] truncate max-w-40">
                {session.firstName} {session.lastName}
              </span>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-rose-400 hover:bg-red-100/40 hover:text-rose-350  transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              ออกจากระบบ
            </button>
          </div>

          {/* Tablet/Mobile: ปุ่มเปิด Sidebar */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="lg:hidden hover:bg-blue-50 hover:text-blue-500 text-blue-950 p-2 rounded-lg transition-colors shrink-0"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* เว้นที่ว่างด้านบนให้เนื้อหาเนื่องจาก navbar เป็น fixed */}
      <div className="h-16" />

      {/* Overlay + Sidebar drawer สำหรับ Tablet/Mobile */}
      {drawerOpen && (
        <div className="fixed inset-0 bg-black/40 z-40 lg:hidden" onClick={() => setDrawerOpen(false)} />
      )}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-blue-950 text-white flex flex-col z-50 transition-transform duration-200 lg:hidden
          ${drawerOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-blue-800">
          <div>
            <p className="text-xs text-blue-300 uppercase tracking-widest font-semibold">EMBOSS</p>
            <p className="text-sm font-bold text-white leading-tight mt-0.5">Production Report</p>
          </div>
          <button onClick={() => setDrawerOpen(false)} className="text-blue-300 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mounted && session && (
          <div className="px-5 py-3 border-b border-blue-800 bg-blue-900/40">
            <p className="text-xs text-blue-300">ผู้ใช้งาน</p>
            <p className="text-sm font-semibold text-white truncate">
              {session.firstName} {session.lastName}
            </p>
            <p className="text-xs text-blue-400 truncate">{session.department}</p>
          </div>
        )}

        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive(href) ? "bg-blue-700 text-white" : "text-blue-200 hover:bg-blue-800 hover:text-white"}`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {label}
            </Link>
          ))}
          {mounted && session?.role === "admin" && (
            <Link
              href="/admin"
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${pathname === "/admin" ? "bg-amber-600 text-white" : "text-amber-300 hover:bg-blue-800 hover:text-white"}`}
            >
              <ShieldCheck className="w-4 h-4 shrink-0" />
              Admin Panel
            </Link>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-blue-800">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-50/40 hover:text-rose-500 transition-colors"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            ออกจากระบบ
          </button>
        </div>
      </aside>

      {/* 🎯 3. แก้ไข z-9999 -> z-[9999] สำหรับ Modal ออกจากระบบ */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setConfirmOpen(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-80 p-6 flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
              <LogOut className="w-6 h-6 text-red-500" />
            </div>
            <div className="text-center">
              <p className="text-base font-bold text-slate-800">ออกจากระบบ</p>
              <p className="text-sm text-slate-500 mt-1">ต้องการออกจากระบบหรือไม่?</p>
            </div>
            <div className="flex gap-3 w-full">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-600 hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white text-sm font-bold transition-colors"
              >
                ตกลง
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}