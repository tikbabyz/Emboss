"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession } from "./lib/auth";
import Sidebar from "./components/AppNavbar";
import { ClipboardList, ArrowRight, Folder } from "lucide-react";

export default function WelcomePage() {
  const router = useRouter();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const currentSession = getSession();

    if (!currentSession) {
      router.replace("/login");
    } else {
      setSession(currentSession);
    }
  }, [router]);

  if (!session) return null;

  const cards = [
    {
      href: "/emboss-list",
      label: "บันทึกการผลิต",
      desc: "บันทึกข้อมูลการผลิต EMBOSS ประจำวัน",
      badge: "DATA ENTRY",
      icon: ClipboardList,
    },
    {
      href: "/tracking",
      label: "ติดตามการผลิต",
      desc: "ตรวจสอบสถานะและประวัติการผลิตย้อนหลัง",
      badge: "TRACKING",
      icon: Folder,
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      <Sidebar />

      <div className="relative bg-linear-to-r from-[#021338] via-[#003B73] to-[#00B4D8] text-white pt-12 pb-28 px-6 md:px-12 overflow-hidden">
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-cyan-400/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-cyan-100 text-xs font-medium mb-4 shadow-sm">
            <span>PE-Roll · Production Management System</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
            สวัสดี,{" "}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-white via-cyan-100 to-amber-300">
              {session.firstName} {session.lastName}
            </span>{" "}
            !
          </h1>

          <p className="text-cyan-100/80 mt-4 text-sm md:text-base max-w-xl leading-relaxed">
            ยินดีต้อนรับเข้าสู่ระบบ
            เลือกเมนูการทำงานที่ต้องการได้จากรายการด้านล่าง
          </p>
        </div>
      </div>

      <main className="max-w-5xl mx-auto px-6 -mt-16 pb-16 relative z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {cards.map(({ href, label, desc, badge, icon: Icon }) => (
            <div
              key={href}
              className="bg-white border border-cyan-100/80 rounded-2xl p-6 flex flex-col justify-between shadow-xl shadow-cyan-950/5 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 group"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-cyan-50 text-cyan-700 border border-cyan-100">
                    {badge}
                  </span>

                  <div className="w-10 h-10 rounded-xl bg-linear-to-br from-blue-900 to-cyan-600 flex items-center justify-center text-white shadow-md shadow-blue-900/20">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-800 group-hover:text-blue-900 transition-colors">
                    {label}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                    {desc}
                  </p>
                </div>
              </div>

              <div className="pt-6 mt-4 border-t border-slate-100">
                <Link
                  href={href}
                  className="w-full inline-flex items-center justify-center gap-2 bg-amber-400 hover:bg-amber-500 active:scale-95 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-all shadow-md shadow-amber-400/20"
                >
                  <span>เข้าใช้งาน</span>
                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
