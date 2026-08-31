"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  UserPlus,
  Info,
  IdCard,
  Building2,
  ChevronDown,
  ArrowRight,
  ArrowLeft,
  User,
  Lock,
  Eye,
  EyeOff,
  Check,
  LoaderCircle,
} from "lucide-react";
import { registerUser } from "../lib/auth";

function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    employeeId: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    department: "",
  });

  const departments = ["FDE PE ROLL SUPPORT", "FDE1 PE ROLL 1", "FDE2 PE ROLL 2", "FDE3 PE ROLL 3"];
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    if (error) setError("");
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const nextStep = () => {
    if (!formData.employeeId || !formData.firstName || !formData.lastName || !formData.department) {
      setError("กรุณากรอกข้อมูลให้ครบถ้วน");
      return;
    }
    setError("");
    setCurrentStep(2);
  };

  const prevStep = () => {
    setError("");
    setCurrentStep(1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (formData.password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);
    try {
      const result = await registerUser({
        employeeId: formData.employeeId.trim(),
        username: formData.username.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        department: formData.department,
      });

      if (!result.ok) {
        setError(result.error || "เกิดข้อผิดพลาด");
        return;
      }

      router.push("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-100 p-4 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-xl">
          <div className="mb-4 text-center">
            <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-xl bg-green-100">
              <UserPlus className="h-6 w-6 text-green-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">สมัครสมาชิก</h1>
            <p className="text-sm text-gray-500">สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน</p>
          </div>

          <div className="mb-4 flex items-center justify-center">
            <div className="flex items-center">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  currentStep >= 1 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                1
              </div>
              <div className={`h-1 w-12 transition-all ${currentStep >= 2 ? "bg-green-500" : "bg-gray-200"}`} />
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  currentStep >= 2 ? "bg-green-500 text-white" : "bg-gray-200 text-gray-500"
                }`}
              >
                2
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {currentStep === 1 && (
              <div className="space-y-3">
                <p className="text-center text-xs text-gray-500">
                  <Info className="mr-1 inline h-3.5 w-3.5" />
                  ขั้นตอนที่ 1: ข้อมูลส่วนตัว
                </p>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">รหัสพนักงาน</label>
                  <div className="group relative">
                    <input
                      type="number"
                      name="employeeId"
                      value={formData.employeeId}
                      onChange={handleChange}
                      placeholder="เช่น 10001"
                      className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 pl-10 text-sm transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 focus:outline-none"
                      required
                    />
                    <div className="absolute top-1/2 left-3 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded bg-gray-200 transition-all group-focus-within:bg-green-500">
                      <IdCard className="h-3.5 w-3.5 text-gray-500 group-focus-within:text-white" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">ชื่อ</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="ชื่อจริง"
                      className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-medium text-gray-700">นามสกุล</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="นามสกุล"
                      className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 text-sm transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 focus:outline-none"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">แผนก</label>
                  <div className="group relative">
                    <select
                      name="department"
                      value={formData.department}
                      onChange={handleChange}
                      className="w-full appearance-none rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 pl-10 text-sm transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 focus:outline-none"
                      required
                    >
                      <option value="">-- เลือกแผนก --</option>
                      {departments.map((section) => (
                        <option key={section} value={section}>
                          {section}
                        </option>
                      ))}
                    </select>
                    <div className="absolute top-1/2 left-3 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded bg-gray-200 transition-all group-focus-within:bg-green-500">
                      <Building2 className="h-3.5 w-3.5 text-gray-500 group-focus-within:text-white" />
                    </div>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={nextStep}
                  className="mt-2 flex w-full items-center justify-center gap-2 rounded-lg bg-linear-to-r from-green-600 to-green-700 py-3 font-medium text-white shadow-lg transition-all hover:from-green-700 hover:to-green-800 hover:shadow-xl"
                >
                  <span>ถัดไป</span>
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-3">
                <p className="text-center text-xs text-gray-500">
                  <Info className="mr-1 inline h-3.5 w-3.5" />
                  ขั้นตอนที่ 2: ข้อมูลบัญชี
                </p>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">ชื่อผู้ใช้</label>
                  <div className="group relative">
                    <input
                      type="text"
                      name="username"
                      value={formData.username}
                      onChange={handleChange}
                      placeholder="ชื่อสำหรับเข้าสู่ระบบ"
                      className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 pl-10 text-sm transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 focus:outline-none"
                      required
                    />
                    <div className="absolute top-1/2 left-3 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded bg-gray-200 transition-all group-focus-within:bg-green-500">
                      <User className="h-3.5 w-3.5 text-gray-500 group-focus-within:text-white" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">รหัสผ่าน</label>
                  <div className="group relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="อย่างน้อย 6 ตัวอักษร"
                      className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 pl-10 pr-10 text-sm transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 focus:outline-none"
                      required
                    />
                    <div className="absolute top-1/2 left-3 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded bg-gray-200 transition-all group-focus-within:bg-green-500">
                      <Lock className="h-3.5 w-3.5 text-gray-500 group-focus-within:text-white" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-all hover:text-green-500"
                      aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="mb-1 block text-sm font-medium text-gray-700">ยืนยันรหัสผ่าน</label>
                  <div className="group relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="กรอกรหัสผ่านอีกครั้ง"
                      className="w-full rounded-lg border-2 border-gray-200 bg-gray-50 px-3 py-2.5 pl-10 pr-10 text-sm transition-all focus:border-green-500 focus:bg-white focus:ring-2 focus:ring-green-100 focus:outline-none"
                      required
                    />
                    <div className="absolute top-1/2 left-3 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded bg-gray-200 transition-all group-focus-within:bg-green-500">
                      <Lock className="h-3.5 w-3.5 text-gray-500 group-focus-within:text-white" />
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute top-1/2 right-3 -translate-y-1/2 text-gray-400 transition-all hover:text-green-500"
                      aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg border-2 border-gray-200 px-3 py-3 font-medium text-gray-700 transition-all hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4" />
                    <span>ย้อนกลับ</span>
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-linear-to-r from-green-600 to-green-700 py-3 font-medium text-white shadow-lg transition-all hover:from-green-700 hover:to-green-800 disabled:from-gray-400 disabled:to-gray-500"
                  >
                    {loading ? (
                      <>
                        <LoaderCircle className="h-4 w-4 animate-spin" />
                        <span>กำลังสมัคร...</span>
                      </>
                    ) : (
                      <>
                        <Check className="h-4 w-4" />
                        <span>สมัคร</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="my-4 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-xs text-gray-400">หรือ</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              มีบัญชีอยู่แล้ว?{" "}
              <Link href="/login" className="font-semibold text-green-600 hover:text-green-700 hover:underline">
                เข้าสู่ระบบ
              </Link>
            </p>
          </div>
        </div>

        <p className="mt-4 text-center text-xs text-gray-400">© 2025 INOAC Industries (Thailand) Co., Ltd.</p>
      </div>
    </main>
  );
}

export default RegisterPage;
