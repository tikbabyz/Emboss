"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeClosed, EyeOff } from "lucide-react";
import { loginUser } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = loginUser(form.username, form.password);
    setLoading(false);
    if (!result.ok) { setError(result.error); return; }
    if (result.user.role === "admin") {
      router.push("/admin");
    } else {
      router.push("/welcome");
    }
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#03045E] via-[#023E8A] to-[#00B4D8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-2xl p-8">
        <h2 className="text-2xl font-extrabold text-blue-950 mb-1">เข้าสู่ระบบ</h2>
        <p className="text-sm text-slate-500 mb-6">E-Production Report EMBOSS</p>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="กรอก Username"
              className="w-full bg-slate-100 py-2.5 px-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
              required
              autoFocus
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="กรอก Password"
                className="w-full bg-slate-100 py-2.5 pl-3 pr-10 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#ffbb00] hover:bg-yellow-600 text-white py-2.5 rounded-lg text-sm font-bold transition-colors mt-1 disabled:opacity-60"
          >
            {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </button>
        </form>

        <hr className="my-5 border-slate-200" />
        <p className="text-xs text-center text-slate-600">
          ยังไม่มีบัญชี ?{" "}
          <Link href="/register" className="text-[#023E8A] font-semibold hover:underline">
            สมัครสมาชิก
          </Link>
        </p>
        <p className="text-xs text-center text-slate-400 mt-2">
          ลืมรหัสผ่าน กรุณาติดต่อ ผู้ดูแลระบบ
        </p>
        <p className="text-xs text-center text-slate-400 mt-3">
          <Link href="/" className="hover:underline">กลับหน้าแรก</Link>
        </p>
      </div>
    </main>
  );
}
