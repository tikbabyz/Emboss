"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import {
  LogOut,
  UserCircle,
  ChevronDown,
} from "lucide-react";
import {
  getSession,
  logout,
  isTokenExpired,
} from "../lib/auth";

export default function AppNavbar() {
  const router = useRouter();
  const dropdownRef = useRef(null);

  const [session, setSession] = useState(null);
  const [mounted, setMounted] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
  setMounted(true);

  const checkAuth = () => {
    const currentSession = getSession();

    if (!currentSession || isTokenExpired()) {
      logout();
      router.replace("/login");
      return;
    }

    setSession(currentSession);
  };

  checkAuth();
}, [router]);

  // กดพื้นที่ด้านนอกแล้วปิด dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const displayName = session
    ? `${session.firstName || ""} ${session.lastName || ""}`.trim()
    : "Guest";

  const handleLogout = () => {
    setShowDropdown(false);
    setConfirmOpen(true);
  };

  const confirmLogout = () => {
    logout();
    setSession(null);
    setConfirmOpen(false);
    router.push("/login");
  };

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 bg-white shadow-md">
        <div className="mx-auto flex h-16 max-w-screen-2xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link
            href="/"
            className="flex shrink-0 items-center gap-3"
          >
            <Image
              src="/Inoac.png"
              width={500}
              height={500}
              alt="Inoac Logo"
              className="h-8 w-auto"
            />

            <div className="hidden leading-tight sm:block">
              <p className="text-sm font-bold tracking-wide text-blue-950">
                EMBOSS
              </p>

              <p className="text-[9px] font-semibold uppercase tracking-[0.18em] text-sky-500">
                Production Report
              </p>
            </div>
          </Link>

          {/* User */}
          <div
            className="relative flex items-center"
            ref={dropdownRef}
          >
            <button
              onClick={() => setShowDropdown((prev) => !prev)}
              className={`flex items-center gap-2.5 rounded-full px-3 py-2 transition-colors duration-200 sm:px-4 ${
                showDropdown
                  ? "bg-blue-100 text-blue-600"
                  : "bg-blue-50 text-blue-950 hover:bg-blue-100"
              }`}
            >
              <UserCircle className="h-5 w-5 text-sky-500 sm:h-6 sm:w-6" />

              {mounted && (
                <span className="hidden max-w-40 truncate text-sm font-medium sm:block">
                  {displayName}
                </span>
              )}

              <ChevronDown
                className={`h-4 w-4 text-slate-400 transition-transform duration-200 ${
                  showDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* สามเหลี่ยม Dropdown */}
            <div
              className={`absolute right-5 top-12 h-3 w-3 rotate-45 bg-white shadow-sm transition-all duration-150 ${
                showDropdown
                  ? "opacity-100"
                  : "pointer-events-none opacity-0"
              }`}
            />

            {/* Dropdown */}
            <div
              className={`absolute right-0 top-14 z-50 min-w-60 origin-top-right overflow-hidden rounded-2xl bg-white text-slate-800 shadow-xl ring-1 ring-slate-200 transition-all duration-150 ${
                showDropdown
                  ? "translate-y-0 scale-100 opacity-100"
                  : "pointer-events-none -translate-y-1 scale-95 opacity-0"
              }`}
            >
              {mounted && session ? (
                <>
                  {/* User Info */}
                  <div className="flex items-center gap-3 bg-blue-50 px-4 py-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
                      {(session.firstName?.[0] || "U").toUpperCase()}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-800">
                        {displayName}
                      </p>

                      {session.department && (
                        <p className="truncate text-xs text-slate-500">
                          {session.department}
                        </p>
                      )}

                      {session.role === "admin" && (
                        <p className="mt-0.5 text-[11px] font-semibold text-blue-500">
                          Administrator
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="h-px bg-slate-200" />

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>ออกจากระบบ</span>
                  </button>
                </>
              ) : (
                <button
                  onClick={() => router.push("/login")}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-blue-600 hover:bg-blue-50"
                >
                  <UserCircle className="h-4 w-4" />
                  เข้าสู่ระบบ
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Navbar fixed เลยต้องเว้นด้านบน */}
      <div className="h-16" />

      {/* Logout Modal */}
      {confirmOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setConfirmOpen(false)}
          />

          <div className="relative flex w-80 flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
              <LogOut className="h-6 w-6 text-red-500" />
            </div>

            <div className="text-center">
              <p className="text-base font-bold text-slate-800">
                ออกจากระบบ
              </p>

              <p className="mt-1 text-sm text-slate-500">
                ต้องการออกจากระบบหรือไม่?
              </p>
            </div>

            <div className="flex w-full gap-3">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 rounded-xl border border-slate-200 py-2 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
              >
                ยกเลิก
              </button>

              <button
                onClick={confirmLogout}
                className="flex-1 rounded-xl bg-red-500 py-2 text-sm font-bold text-white transition-colors hover:bg-red-600"
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