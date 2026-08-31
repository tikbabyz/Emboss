"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { User, Lock, Eye, EyeOff, LogIn, LoaderCircle } from "lucide-react";
import { loginUser } from "../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({ username: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await loginUser(formData.username, formData.password);
      if (!result.ok) {
        setError(result.error || "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง");
        return;
      }

      if (result.user.role === "admin") {
        router.push("/admin");
      } else {
        router.push("/");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-linear-to-br from-blue-50 via-white to-blue-100 px-4">
      <div className="w-full max-w-md">
        <div className="overflow-hidden rounded-2xl bg-white shadow-xl">
          <div className="bg-linear-to-r from-blue-600 to-blue-700 px-8 py-10 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-white shadow-lg">
              <Image
                src="/logo.png"
                alt="Logo"
                width={100}
                height={100}
                className="h-12 w-auto object-contain"
                priority
              />
            </div>
            <h1 className="text-2xl font-bold text-white">ยินดีต้อนรับ</h1>
            <p className="mt-2 text-blue-100">เข้าสู่ระบบเพื่อดำเนินการต่อ</p>
          </div>

          <div className="px-8 py-8">
            {error && (
              <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div className="mb-5">
                <label className="mb-2 block font-medium text-gray-700">ชื่อผู้ใช้</label>
                <div className="relative">
                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    placeholder="กรอกชื่อผู้ใช้"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-11 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                    autoFocus
                  />
                  <User className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                </div>
              </div>

              <div className="mb-6">
                <label className="mb-2 block font-medium text-gray-700">รหัสผ่าน</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="กรอกรหัสผ่าน"
                    className="w-full rounded-lg border border-gray-300 px-4 py-3 pl-11 pr-11 transition focus:border-transparent focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <Lock className="absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-400 transition hover:text-gray-600"
                    aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-blue-600 to-blue-700 py-3 font-medium text-white shadow-lg transition hover:from-blue-700 hover:to-blue-800 hover:shadow-xl disabled:from-gray-400 disabled:to-gray-500"
              >
                {loading ? (
                  <>
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                    <span>กำลังดำเนินการ...</span>
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    <span>เข้าสู่ระบบ</span>
                  </>
                )}
              </button>
            </form>

            <div className="my-6 flex items-center">
              <div className="flex-1 border-t border-gray-200" />
              <span className="px-4 text-sm text-gray-400">หรือ</span>
              <div className="flex-1 border-t border-gray-200" />
            </div>

            <p className="text-center text-gray-600">
              ยังไม่มีบัญชี?{" "}
              <Link href="/register" className="font-medium text-blue-600 transition hover:text-blue-700 hover:underline">
                สมัครสมาชิก
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-sm text-gray-400">
          © 2025 INOAC Industries (Thailand) Co., Ltd.
        </p>
      </div>
    </main>
  );
}
