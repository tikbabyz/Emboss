"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Check, X, EyeClosed } from "lucide-react";
import Container from "../components/Container";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { registerUser } from "../lib/auth";

function RegisterPage() {
  const [formData, setFormData] = useState({
    employeeId: "",
    username: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    department: "",
  });

  const departments = ["PE ROLL"];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const isConfirmFilled = formData.confirmPassword.length > 0;
  const isMatch = isConfirmFilled && formData.password === formData.confirmPassword;
  const isMismatch = isConfirmFilled && formData.password !== formData.confirmPassword;

  const getPasswordInputClass = () => {
    if (isMatch) {
      return "w-full bg-green-50 border-2 border-green-500 text-green-900 focus:ring-1 focus:ring-green-100 py-2 pl-3 pr-10 rounded text-sm outline-none transition-colors font-medium";
    }
    if (isMismatch) {
      return "w-full bg-rose-50 border-2 border-rose-500 text-rose-900 focus:ring-1 focus:ring-rose-100 py-2 pl-3 pr-10 rounded text-sm outline-none transition-colors font-medium";
    }
    return "w-full bg-gray-200 border-2 border-transparent py-2 pl-3 pr-10 rounded text-sm outline-none focus:ring-2 focus:ring-blue-400 transition-colors";
  };

  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = (e) => {
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

    const result = registerUser(formData);
    if (!result.ok) { setError(result.error); return; }
    router.push("/login");
  };

  return (
    <main className="min-h-screen bg-linear-to-br from-[#03045E] via-[#023E8A] to-[#00B4D8] flex items-center justify-center px-4 py-10">
      <div className="w-200 max-w-full shadow-2xl p-8 rounded-2xl bg-white">
        <h3 className="text-3xl font-bold text-gray-800">สมัครสมาชิก</h3>
        <hr className="my-3 border-gray-200" />

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Employee ID
              </label>
              <input
                type="text"
                name="employeeId"
                value={formData.employeeId}
                onChange={handleChange}
                placeholder="Employee ID ex 10001"
                className="w-full bg-gray-200 py-2 px-3 rounded text-sm outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                First Name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First Name"
                className="w-full bg-gray-200 py-2 px-3 rounded text-sm outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1 text-sm">
                Last Name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last Name"
                className="w-full bg-gray-200 py-2 px-3 rounded text-sm outline-none"
                required
              />
            </div>
          </div>

          {/* แผนก */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Department
            </label>
            <select
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full bg-gray-200 py-2 px-3 rounded  text-sm outline-none"
              required
            >
              <option value="">--Select Department--</option>
              {departments.map((section, index) => (
                <option key={index} value={section}>
                  {section}
                </option>
              ))}
            </select>
          </div>
          {/* ชื่อผู้ใช้ */}
          <label className="block text-gray-700 font-medium mb-1 text-sm">
            Username
          </label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="Username"
            className="w-full bg-gray-200 py-2 px-3 rounded  text-sm outline-none"
            required
          />

          {/* รหัสผ่าน */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                className={getPasswordInputClass()}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showPassword ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* ยืนยันรหัสผ่าน */}
          <div>
            <label className="block text-gray-700 font-medium mb-1 text-sm">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm Password"
                className={getPasswordInputClass()}
                required
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 p-1"
                aria-label={showConfirmPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showConfirmPassword ? <EyeClosed className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
            {isConfirmFilled && (
              <div className="mt-1">
                {isMatch ? (
                  <p className="text-xs text-green-600 font-semibold flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> รหัสผ่านตรงกัน
                  </p>
                ) : (
                  <p className="text-xs text-rose-600 font-semibold flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> รหัสผ่านไม่ตรงกัน
                  </p>
                )}
              </div>
            )}
          </div>

          {/* ปุ่มสมัคร */}
          <button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-3 rounded text-lg font-medium transition duration-200 mt-2"
          >
            Sign Up
          </button>
        </form>

        <hr className="my-4 border-gray-200" />

        <p className="text-xs text-gray-600 text-center">
          มีบัญชีแล้ว?{" "}
          <Link href="/login" className="text-xs text-[#023E8A] hover:underline">
            เข้าสู่ระบบ
          </Link>
        </p>
        <p className="text-xs text-center text-slate-400 mt-2">
          <Link href="/" className="hover:underline">กลับหน้าแรก</Link>
        </p>
      </div>
    </main>
  );
}

export default RegisterPage;
