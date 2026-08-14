"use client";
import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import AppNavbar from "../components/AppNavbar";
import {
  Send,
  Check,
  CircleX,
  Save,
  Package,
  Layers,
  Settings2,
  CalendarDays,
  User,
  Cpu,
  Clock3,
  ClipboardCheck,
  ScanBarcode,
  ListChecks,
  BadgeCheck,
  Thermometer,
  CirclePile,
  BrickWall,
} from "lucide-react";
import { findEmployee } from "../lib/employeeMaster";

const TEMP_STD = 390;
const TODAY = new Date().toISOString().split("T")[0];
const LS_KEY = "emboss_records";

const getTempClass = (val) => {
  if (val === "" || val === null || val === undefined)
    return "bg-white border-slate-300 text-slate-800";
  if (Number(val) !== TEMP_STD)
    return "bg-rose-100 border-rose-500 text-rose-900 font-black";
  return "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
};

const parseTime = (t) => {
  const parts = String(t || "")
    .replace(":", ".")
    .split(".");
  return parseInt(parts[0] || 0) * 60 + parseInt(parts[1] || 0);
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return "";
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
};

const EMPTY_FORM = () => ({

  job: "",
  finishPartNo: "",
  finishMaterial: "",
  finishColor: "",
  finishThick: "",
  finishWidth: "",
  finishLength: "",
  finishProdQty: 0,
  goodQty: 0,
  ngQty: 0,
  ngReason: "-",
  startTime: "",
  endTime: "",
  usedTime: "",
  prodCode: "",
  finishLot: TODAY,
  rawPartNo: "",
  rawMaterial: "",
  rawColor: "",
  rawThick: "",
  rawWidth: "",
  rawLength: "",
  rawUsedQty: "",
  rawLot: TODAY,
  rawRollNo: "",
  speed: "",
  temp1Top: 390,
  temp1Bot: 390,
  temp2Top: 390,
  temp2Bot: 390,
  temp3Top: 390,
  temp3Bot: 390,
  temp4Top: 390,
  temp4Bot: 390,
  temp5Top: 390,
  temp5Bot: 390,
  temp6Top: 390,
  temp6Bot: 390,
  waterfallTemp: "",
  status: "OK",
  remark: "",
});

function FractionTempBox({ topVal, onTopChange, botVal, onBotChange }) {
  return (
    <div className="flex gap-2 justify-center">
      {[
        { val: topVal, onChange: onTopChange, label: "TOP" },
        { val: botVal, onChange: onBotChange, label: "BOT" },
      ].map((item, i) => (
        <div
          key={i}
          className="flex flex-col items-center w-16 border border-slate-200 rounded-lg p-1 bg-white shadow-sm"
        >
          <div className="text-[9px] font-bold text-slate-400 mb-0.5">{item.label}</div>
          <input
            type="number"
            value={item.val}
            onChange={item.onChange}
            placeholder="390"
            className={`w-full text-center text-sm font-mono rounded-md p-1 border focus:outline-none transition-colors ${getTempClass(item.val)}`}
          />
          <div className="w-full border-b border-slate-200 my-1" />
          <div className="text-[10px] font-bold text-slate-400 w-full text-center">
            {TEMP_STD}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── TimeInput Component ────────────────────────────────────────
// กรอก HH แล้ว focus กระโดดไป MM อัตโนมัติเมื่อครบ 2 หลัก
function TimeInput({ value = "", onChange }) {
  const hhRef = React.useRef(null);
  const mmRef = React.useRef(null);
  const [hh, mm] = React.useMemo(() => {
    if (value && value.includes(":")) {
      const [h, m] = value.split(":");
      return [h ?? "", m ?? ""];
    }
    return ["", ""];
  }, [value]);

  const emit = (newHH, newMM) => {
    // ส่ง "HH:MM" เสมอ — ไม่ใช้ empty เพื่อหลีก controlled/uncontrolled warning
    onChange(`${newHH}:${newMM}`);
  };

  const handleHHChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    emit(v, mm);
    // กระโดด focus ไป MM เมื่อครบ 2 หลัก
    if (v.length === 2) {
      mmRef.current?.focus();
      mmRef.current?.select();
    }
  };

  const handleMMChange = (e) => {
    const v = e.target.value.replace(/\D/g, "").slice(0, 2);
    emit(hh, v);
  };

  // Backspace จาก MM → กลับ HH โดยใช้ ref
  const handleMMKeyDown = (e) => {
    if (e.key === "Backspace" && mm === "") {
      e.preventDefault();
      hhRef.current?.focus();
    }
  };

  return (
    <div className="flex items-center bg-slate-50 border border-slate-200 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-400 focus-within:border-blue-400 transition">
      <input
        ref={hhRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        placeholder="HH"
        value={hh}
        onChange={handleHHChange}
        className="w-10 py-2 bg-transparent text-sm text-center font-mono focus:outline-none text-slate-700 placeholder-slate-400"
      />
      <span className="text-slate-500 font-bold select-none px-0.5">:</span>
      <input
        ref={mmRef}
        type="text"
        inputMode="numeric"
        maxLength={2}
        placeholder="MM"
        value={mm}
        onChange={handleMMChange}
        onKeyDown={handleMMKeyDown}
        className="w-10 py-2 bg-transparent text-sm text-center font-mono focus:outline-none text-slate-700 placeholder-slate-400"
      />
    </div>
  );
}
// ─── HeaderSelect: Custom dropdown ใน header bar (smooth, no native select) ────
function HeaderSelect({ value, onChange, options }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  // Close when clicking outside
  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-1  text-blue-900 py-0.5 focus:outline-none cursor-pointer hover:border-blue-200 transition-colors"
      >
        <span>{selected?.label ?? value}</span>
        <svg
          className={`w-3 h-3 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown panel */}
      <div
        className={`absolute right-0 top-full mt-1.5 min-w-28 bg-white rounded-lg shadow-lg border border-slate-100 overflow-hidden z-50
          transition-all duration-200 origin-top
          ${open ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"}`}
        style={{ transformOrigin: "top" }}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors
              ${value === opt.value
                ? "bg-blue-50 text-blue-700 font-semibold"
                : "text-slate-700 hover:bg-slate-50"}`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── FormSelect: Custom dropdown ใน form body (white card style) ───────────
function FormSelect({ value, onChange, options, colorMap }) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef(null);

  React.useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const triggerCls = colorMap?.[value] ?? "bg-slate-50 border-slate-200 text-slate-800";

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm  focus:outline-none transition-colors ${triggerCls}`}
      >
        <span>{selected?.label ?? value}</span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <div
        className={`absolute left-0 right-0 top-full mt-1 bg-white rounded-lg shadow-xl border border-slate-100 overflow-hidden z-50
          transition-all duration-200
          ${open ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"}`}
      >
        {options.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => { onChange(opt.value); setOpen(false); }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2
              ${value === opt.value ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
          >
            {colorMap && (
              <span className={`w-2 h-2 rounded-full shrink-0 ${opt.dot ?? "bg-slate-300"}`} />
            )}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function EmbossFormPage() {
  const [form, setForm] = useState(EMPTY_FORM());
  const [header, setHeader] = useState({
    reportDate: TODAY,
    shift: "Day",
    machineNo: "EMBOSS-01",
    employeeId: "",
    employeeName: "",
    foremanName: "",
  });
  const [empError, setEmpError] = useState("");
  const [errors, setErrors] = useState({});
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [recordCount, setRecordCount] = useState(0);
  const [mounted, setMounted] = useState(false);

  // eslint-disable-next-line react-compiler/react-compiler
  useEffect(() => {
    setMounted(true);
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        setRecordCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    } catch {
      setRecordCount(0);
    }
  }, []);
  const jobRef = useRef(null);

  const handleHeaderChange = (field, value) => {
    setHeader((prev) => ({ ...prev, [field]: value }));
    if (field === "employeeId") {
      setEmpError("");
      setHeader((prev) => ({ ...prev, employeeId: value, employeeName: "" }));
    }
  };

  const handleEmployeeIdBlur = () => {
    // TODO: เปลี่ยนเป็น API call: fetch(`/api/employees/${header.employeeId}`)
    if (!header.employeeId) return;
    const emp = findEmployee(header.employeeId);
    if (emp) {
      setHeader((prev) => ({ ...prev, employeeName: emp.name }));
      setEmpError("");
    } else {
      setEmpError("ไม่พบรหัสพนักงาน");
    }
  };

  const setField = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };
      const st = field === "startTime" ? value : prev.startTime;
      const et = field === "endTime" ? value : prev.endTime;
      if ((field === "startTime" || field === "endTime") && st && et) {
        const diff = parseTime(et) - parseTime(st);
        if (diff > 0) updated.usedTime = String(diff);
      }
      if (field === "goodQty" || field === "ngQty") {
        const g = field === "goodQty" ? Number(value) : Number(prev.goodQty);
        const n = field === "ngQty" ? Number(value) : Number(prev.ngQty);
        updated.finishProdQty = g + n;
      }
      return updated;
    });
    if (errors[field])
      setErrors((e) => {
        const c = { ...e };
        delete c[field];
        return c;
      });
  };

  const validate = () => {
    const errs = {};
    if (!header.employeeId) errs.employeeId = "กรุณากรอกรหัสพนักงาน";
    if (!header.employeeName) errs.employeeName = "รหัสพนักงานไม่ถูกต้อง";
    if (!form.finishPartNo) errs.finishPartNo = "กรุณากรอก Part No. ชิ้นงาน";
    const timeOk = (t) => t && t.includes(":") && t.split(":")[0].length >= 1 && t.split(":")[1].length >= 1;
    if (!timeOk(form.startTime) || !timeOk(form.endTime))
      errs.startTime = "กรุณากรอกเวลาเริ่ม-จบ";
    if (!form.rawPartNo) errs.rawPartNo = "กรุณากรอก Part No. วัตถุดิบ";
    if (!form.rawUsedQty || Number(form.rawUsedQty) <= 0)
      errs.rawUsedQty = "กรุณากรอกจำนวนที่ใช้";
    if (!form.rawRollNo) errs.rawRollNo = "กรุณากรอก Roll No.";
    return errs;
  };

  const handleSave = () => {
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const record = {
      id: Date.now(),
      savedAt: new Date().toISOString(),
      header: { ...header },
      data: { ...form },
    };
    // TODO: เปลี่ยนเป็น API call:
    // await fetch("/api/records", { method:"POST", body: JSON.stringify(record) })
    const stored = localStorage.getItem(LS_KEY);
    const existing = stored ? JSON.parse(stored) : [];
    const updated = [...existing, record];
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
    setRecordCount(updated.length);
    setForm(EMPTY_FORM());
    setErrors({});
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
    setTimeout(() => jobRef.current?.focus(), 100);
  };

  const hasError = Object.keys(errors).length > 0;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800 ">
      <AppNavbar />
      <div className="bg-linear-to-r from-[#03045E] via-[#023E8A] to-[#00B4D8] text-white  shadow-md px-4 py-4">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              รายงานการผลิต EMBOSS
            </h1>
            
          </div>
          
          <Link
            href="/form/records"
            className="relative flex items-center gap-2 px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            รายการที่บันทึก
            {mounted && recordCount > 0 && (
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {recordCount}
              </span>
            )}
          </Link>
        </div>
      </div>

      <div className="px-3  my-2">
  <div className="max-w-screen-2xl mx-auto flex flex-wrap justify-end items-center gap-x-4 gap-y-2 text-xs">
    
    {/* 1. วันที่ */}
    <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
      <span className="text-slate-500 font-medium">วันที่:</span>
      <input
        type="text"
        value={header.reportDate}
        readOnly
        disabled
        className="bg-transparent focus:outline-none text-slate-800 font-semibold w-24 cursor-default"
      />
    </div>

    {/* 2. กะ */}
    <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
      <span className="text-slate-500 font-medium">กะ:</span>
      <HeaderSelect
        value={header.shift}
        onChange={(v) => handleHeaderChange("shift", v)}
        options={[
          { value: "Day", label: "เช้า" },
          { value: "Night", label: "ดึก" },
        ]}
      />
    </div>

    {/* 3. เครื่อง */}
    <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
      <span className="text-slate-500 font-medium">เครื่อง:</span>
      <HeaderSelect
        value={header.machineNo}
        onChange={(v) => handleHeaderChange("machineNo", v)}
        options={[
          { value: "EMBOSS-01", label: "EMBOSS-01" },
          { value: "EMBOSS-02", label: "EMBOSS-02" },
        ]}
      />
    </div>

    {/* 4. รหัสพนักงาน */}
    <div className="flex items-center gap-2 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
      <span className="text-slate-500 font-medium">รหัสพนักงาน:</span>
      
      <div className="relative flex items-center">
        <input
          type="text"
          placeholder="ระบุรหัส"
          value={header.employeeId}
          onChange={(e) =>
            handleHeaderChange("employeeId", e.target.value.toUpperCase())
          }
          onBlur={handleEmployeeIdBlur}
          className={`bg-white px-2 py-0.5 rounded-md border text-xs text-slate-800 font-semibold uppercase transition-all duration-150 focus:outline-none focus:ring-2 w-22 placeholder:text-slate-300 placeholder:font-normal ${
            errors.employeeId || empError
              ? "border-rose-400 focus:ring-rose-200 bg-rose-50/30"
              : "border-slate-300 focus:border-blue-500 focus:ring-blue-100"
          }`}
        />
      </div>

      {/* Tag ชื่อพนักงานเมื่อยืนยันผ่าน */}
      {header.employeeName && (
        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-medium text-[11px] border border-emerald-200/60 animate-fade-in">
          <Check className="w-3 h-3 text-emerald-600 stroke-[2.5]" />
          {header.employeeName}
        </span>
      )}

      {/* ข้อความแสดง Error */}
      {(empError || errors.employeeId) && (
        <span className="text-rose-500 font-medium text-[11px] flex items-center gap-1 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200/60">
          ⚠️ {empError || errors.employeeId}
        </span>
      )}
    </div>

  </div>
</div>

      {(hasError || saveSuccess) && (
        <div className="max-w-screen-2xl mx-auto px-4 mt-3 space-y-2">
          {hasError && (
            <div className="bg-rose-50 border border-rose-200 rounded-lg p-3 flex items-start gap-2.5 shadow-sm">
              <CircleX className="w-4 h-4 text-rose-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-rose-700">
                  กรุณากรอกข้อมูลให้ครบถ้วน
                </p>
                <p className="text-xs text-rose-600 mt-0.5">
                  {Object.values(errors)[0]}
                </p>
              </div>
            </div>
          )}
          {saveSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center gap-2.5">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <p className="text-sm font-semibold text-emerald-700">
                บันทึกรายการเรียบร้อย! กรอกรายการต่อไปได้เลย
              </p>
            </div>
          )}
        </div>
      )}

      <div className="max-w-screen-2xl mx-auto px-4 py-4 pb-24 space-y-4">
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
          <div className="flex items-center gap-2 px-5 py-3 bg-blue-50 border-b border-blue-100">
            <BrickWall className="w-4 h-4 text-slate-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                ส่วนที่ 1 — รายละเอียดชิ้นงานที่ผลิต
              </h2>
              <p className=" text-xs text-slate-500">
                <span className="text-red-500">*</span>กรอกข้อมูลชิ้นงาน
                งานดี-งานเสีย และเวลาการผลิต
              </p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-4">
            <div className="sm:col-span-2 lg:col-span-1">
              <label className="flex text-xs font-semibold text-slate-600 mb-1 items-center gap-1">
                <ScanBarcode className="w-3.5 h-3.5" />
                Job (สแกน Barcode)
              </label>
              <input
                ref={jobRef}
                type="text"
                value={form.job}
                placeholder="สแกนหรือพิมพ์ Job No."
                onChange={(e) => setField("job", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-400 focus:outline-none transition font-mono"
              />
            </div>
            <div
              className={
                errors.finishPartNo ? "ring-1 ring-rose-400 rounded-lg p-1" : ""
              }
            >
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Part No. <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.finishPartNo}
                onChange={(e) => setField("finishPartNo", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ชื่อชิ้นงาน
              </label>
              <input
                type="text"
                value={form.finishMaterial}
                onChange={(e) => setField("finishMaterial", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                สี
              </label>
              <input
                type="text"
                value={form.finishColor}
                onChange={(e) => setField("finishColor", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center focus:bg-white focus:border-blue-400 focus:outline-none transition"
              />
            </div>
            <div className="grid grid-cols-3 gap-2 sm:col-span-2 lg:col-span-1">
              {[
                ["finishThick", "หนา (mm.)"],
                ["finishWidth", "กว้าง (mm.)"],
                ["finishLength", "ยาว (m.)"],
              ].map(([f, l]) => (
                <div key={f}>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    {l}
                  </label>
                  <input
                    type="text"
                    value={form[f]}
                    onChange={(e) => setField(f, e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-right focus:bg-white focus:border-blue-400 focus:outline-none transition"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-emerald-700 mb-1">
                งานดี (M.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.goodQty}
                onChange={(e) => setField("goodQty", Number(e.target.value))}
                className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-lg text-sm text-right font-bold text-emerald-800 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-rose-700 mb-1">
                งานเสีย (M.) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={form.ngQty}
                onChange={(e) => setField("ngQty", Number(e.target.value))}
                className="w-full px-3 py-2 bg-rose-50 border border-rose-300 rounded-lg text-sm text-right font-bold text-rose-800 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-blue-700 mb-1">
                จำนวนที่ผลิต
              </label>
              <input
                type="number"
                value={form.finishProdQty}
                readOnly
                className="w-full px-3 py-2 bg-blue-100 border border-blue-200 rounded-lg text-sm text-right font-bold text-blue-900 cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                สาเหตุงานเสีย
              </label>
              <FormSelect
                value={form.ngReason}
                onChange={(v) => setField("ngReason", v)}
                options={[
                  { value: "-", label: "- ไม่มีงานเสีย -" },
                  { value: "เปลี่ยนม้วน", label: "เปลี่ยนม้วน" },
                  { value: "ท่ออุดตัน", label: "ท่ออุดตัน" },
                  { value: "ไม่เรียบ", label: "ไม่เรียบ" },
                  { value: "ปรับระดับ", label: "ปรับระดับ" },
                ]}
              />
            </div>
            <div
              className={`${errors.startTime ? "ring-1 ring-rose-400 rounded-lg p-1" : ""} sm:col-span-2 lg:col-span-1`}
            >
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                เวลา (เริ่ม – จบ) <span className="text-red-500">*</span>
              </label>
              <div className="flex items-center gap-2">
                <TimeInput className='text-slate-600'
                  value={form.startTime}
                  onChange={(v) => setField("startTime", v)}
                />
                <span className="text-slate-600 shrink-0 font-semibold">–</span>
                <TimeInput className='text-slate-600'
                  value={form.endTime}
                  onChange={(v) => setField("endTime", v)}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                ใช้เวลา (นาที)
              </label>
              <input
                type="text"
                value={form.usedTime}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-center text-slate-600 cursor-default"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-1">
                Product Code
              </label>
              <input
                type="text"
                value={form.prodCode}
                onChange={(e) => setField("prodCode", e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center font-mono focus:bg-white focus:border-blue-400 focus:outline-none transition"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                LOT No.
              </label>
              <input
                type="text"
                value={form.finishLot || ""}
                disabled
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed outline-none select-none"
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-b border-amber-100">
            <CirclePile className="w-4 h-4 text-slate-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                ส่วนที่ 2 — รายละเอียดวัตถุดิบที่ใช้
              </h2>
              <p className="text-xs text-slate-400">ข้อมูลอ้างอิงจากระบบ — ไม่สามารถแก้ไขได้</p>
            </div>
          </div>
          <div className="p-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-5 gap-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Job No.</label>
              <input
                type="text"
                value={form.job}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm font-mono text-slate-600 cursor-not-allowed outline-none select-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Part No.</label>
              <input
                type="text"
                value={form.rawPartNo}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed outline-none select-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">ชื่อวัตถุดิบ</label>
              <input
                type="text"
                value={form.rawMaterial}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed outline-none select-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">สี</label>
              <input
                type="text"
                value={form.rawColor}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-center text-slate-600 cursor-not-allowed outline-none select-none"
              />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ["rawThick", "หนา (mm.)"],
                ["rawWidth", "กว้าง (mm.)"],
                ["rawLength", "ยาว (m.)"],
              ].map(([f, l]) => (
                <div key={f}>
                  <label className="block text-xs font-semibold text-slate-500 mb-1">{l}</label>
                  <input
                    type="text"
                    value={form[f]}
                    readOnly
                    className="w-full px-2 py-2 bg-slate-100 border border-slate-200 rounded-lg text-xs text-right text-slate-600 cursor-not-allowed outline-none select-none"
                  />
                </div>
              ))}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">จำนวนที่ใช้ (M.)</label>
              <input
                type="text"
                value={form.rawUsedQty}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-right text-slate-600 cursor-not-allowed outline-none select-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">LOT No.</label>
              <input
                type="text"
                value={form.rawLot || ""}
                disabled
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-slate-600 cursor-not-allowed outline-none select-none"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">Roll No.</label>
              <input
                type="text"
                value={form.rawRollNo}
                readOnly
                className="w-full px-3 py-2 bg-slate-100 border border-slate-200 rounded-lg text-sm text-center text-slate-600 cursor-not-allowed outline-none select-none"
              />
            </div>
          </div>
        </div>


        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-slate-50 border-b border-slate-200">
            <Thermometer className="w-4 h-4 text-slate-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                ส่วนที่ 3 — การตั้งค่าเครื่องจักร
              </h2>
              <p className="text-xs text-slate-400">
                <span className="text-red-500">*</span>อุณหภูมิ(Standard ={" "}
                {TEMP_STD}){" "}
              </p>
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Speed (m/min)
                </label>
                <input
                  type="text"
                  value={form.speed}
                  placeholder="เช่น 3.0"
                  onChange={(e) => setField("speed", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center focus:bg-white focus:border-blue-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  อุณหภูมิน้ำหล่อเย็น (°C)
                </label>
                <input
                  type="text"
                  value={form.waterfallTemp}
                  placeholder="เช่น 20"
                  onChange={(e) => setField("waterfallTemp", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center focus:bg-white focus:border-blue-400 focus:outline-none transition"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  การติดกันของโฟมกับฟิล์ม
                </label>
                <FormSelect
                  value={form.status}
                  onChange={(v) => setField("status", v)}
                  colorMap={{
                    OK: "bg-emerald-100 border-emerald-300 text-emerald-800",
                    NG: "bg-rose-100 border-rose-300 text-rose-800",
                    HOLD: "bg-amber-100 border-amber-300 text-amber-800",
                  }}
                  options={[
                    { value: "OK", label: "OK", dot: "bg-emerald-500" },
                    { value: "NG", label: "NG", dot: "bg-rose-500" },
                    { value: "HOLD", label: "HOLD", dot: "bg-amber-500" },
                  ]}
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  หมายเหตุ
                </label>
                <input
                  type="text"
                  value={form.remark}
                  placeholder="หมายเหตุ..."
                  onChange={(e) => setField("remark", e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-400 focus:outline-none transition"
                />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-3 mb-3 text-xs flex-wrap">
                <span className="font-semibold text-slate-600">อุณหภูมิ Heater:</span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-emerald-100 border border-emerald-400 inline-block"></span>
                  <span className="text-emerald-700">= {TEMP_STD} ปกติ</span>
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-3 h-3 rounded bg-rose-100 border border-rose-400 inline-block"></span>
                  <span className="text-rose-700">ผิดปกติ</span>
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                {[
                  { n: 1, pos: "บนซ้าย" },
                  { n: 2, pos: "บนกลาง" },
                  { n: 3, pos: "บนขวา" },
                  { n: 4, pos: "ล่างซ้าย" },
                  { n: 5, pos: "ล่างขวา" },
                  { n: 6, pos: "กลางล่าง" },
                ].map(({ n, pos }) => {
                  const val = form[`temp${n}Top`];
                  return (
                    <div key={n} className="text-center">
                      <p className="text-[11px] font-bold text-slate-700 mb-0.5">อุณหภูมิ {n}</p>
                      <p className="text-[10px] text-slate-500 mb-1.5">{pos}</p>
                      <div className="w-14 mx-auto border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                        <input
                          type="number"
                          value={val}
                          onChange={(e) => setField(`temp${n}Top`, e.target.value)}
                          placeholder={String(TEMP_STD)}
                          className={`w-full text-center text-sm font-mono py-2.5 border-0 focus:outline-none transition-colors ${getTempClass(val)}`}
                        />
                        <div className="border-t border-slate-200 py-0.5 text-[10px] font-bold text-slate-400 text-center">
                          {TEMP_STD} (°C)
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-20">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {mounted && recordCount > 0 ? (
              <span>
                บันทึกแล้ว{" "}
                <span className="font-bold text-blue-800">{recordCount}</span>{" "}
                รายการในกะนี้
              </span>
            ) : (
              <span className="text-slate-400">ยังไม่มีรายการที่บันทึก</span>
            )}
          </div>
          <button
            type="button"
            onClick={handleSave}
            className="flex items-center gap-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            บันทึกรายการนี้
          </button>
        </div>
      </div>
    </div>
  );
}
