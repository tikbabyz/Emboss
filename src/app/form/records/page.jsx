"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import AppNavbar from "../../components/AppNavbar";
import {
  ArrowLeft, Trash2, Send, FileText, CheckCircle2,
  ChevronDown, ChevronUp, Download,
} from "lucide-react";
import * as XLSX from "xlsx";

const LS_KEY = "emboss_records";
const TEMP_STD = 390;

// แสดงค่าอุณหภูมิพร้อมสีตามมาตรฐาน
function TempCell({ val }) {
  if (val === undefined || val === "") return <span className="text-slate-400">–</span>;
  const isNormal = Number(val) === TEMP_STD;
  return (
    <span className={`font-bold ${isNormal ? "text-emerald-700" : "text-rose-600"}`}>
      {val}
    </span>
  );
}

// แถวที่ขยายดูข้อมูลทั้งหมด
function RecordRow({ rec, idx, onDelete }) {
  const [expanded, setExpanded] = useState(false);
  const d = rec.data || {};
  const h = rec.header || {};

  const statusColor =
    d.status === "OK" ? "bg-emerald-100 text-emerald-800" :
    d.status === "NG" ? "bg-rose-100 text-rose-800" :
    "bg-amber-100 text-amber-800";

  return (
    <>
      {/* แถวหลัก (summary) */}
      <tr className="hover:bg-blue-50/20 transition-colors group border-b border-slate-100">
        <td className="px-3 py-2.5 text-center font-semibold text-slate-400 text-xs">{idx + 1}</td>

        {/* ปุ่ม expand */}
        <td className="px-2 py-2.5 text-center">
          <button onClick={() => setExpanded((v) => !v)}
            className="p-1 text-slate-400 hover:text-blue-700 rounded transition-colors">
            {expanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </td>

        {/* Header info */}
        <td className="px-3 py-2.5 text-xs">
          <div className="font-semibold text-slate-800">{h.employeeId || "–"}</div>
          <div className="text-slate-500">{h.employeeName || "–"}</div>
        </td>
        <td className="px-3 py-2.5 text-xs text-slate-600">{h.reportDate || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-slate-600">{h.shift || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-slate-600">{h.machineNo || "–"}</td>

        {/* ชิ้นงาน */}
        <td className="px-3 py-2.5 text-xs font-mono text-slate-700">{d.job || "–"}</td>
        <td className="px-3 py-2.5 text-xs font-semibold text-blue-900">{d.finishPartNo || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-slate-600 max-w-35 truncate">{d.finishMaterial || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-center text-slate-600">{d.finishColor || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-right text-slate-600">{d.finishThick || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-right text-slate-600">{d.finishWidth || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-right text-slate-600">{d.finishLength || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-center font-bold text-blue-800 bg-blue-50/50">{Number(d.finishProdQty || 0)}</td>
        <td className="px-3 py-2.5 text-xs text-center font-bold text-emerald-700 bg-emerald-50/50">{Number(d.goodQty || 0)}</td>
        <td className="px-3 py-2.5 text-xs text-center font-bold text-rose-700 bg-rose-50/50">{Number(d.ngQty || 0)}</td>
        <td className="px-3 py-2.5 text-xs text-center text-slate-600">{d.ngReason !== "-" ? d.ngReason : "–"}</td>
        <td className="px-3 py-2.5 text-xs text-center text-slate-700">
          {d.startTime && d.endTime ? `${d.startTime}–${d.endTime}` : "–"}
        </td>
        <td className="px-3 py-2.5 text-xs text-center text-slate-600">{d.usedTime ? `${d.usedTime} น.` : "–"}</td>
        <td className="px-3 py-2.5 text-xs text-center font-mono text-slate-700">{d.prodCode || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-center text-slate-600">{d.finishLot || "–"}</td>

        {/* วัตถุดิบ */}
        <td className="px-3 py-2.5 text-xs font-semibold text-slate-700 bg-amber-50/30">{d.rawPartNo || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-slate-600 bg-amber-50/30">{d.rawMaterial || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-center text-slate-600 bg-amber-50/30">{d.rawColor || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-right text-slate-600 bg-amber-50/30">{d.rawThick || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-right text-slate-600 bg-amber-50/30">{d.rawWidth || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-right text-slate-600 bg-amber-50/30">{d.rawLength || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-right font-bold text-slate-700 bg-amber-50/30">{d.rawUsedQty || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-center text-slate-600 bg-amber-50/30">{d.rawLot || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-center font-mono text-slate-700 bg-amber-50/30">{d.rawRollNo || "–"}</td>

        {/* การตั้งค่า */}
        <td className="px-3 py-2.5 text-xs text-center font-bold text-slate-700 bg-slate-50/50">{d.speed || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-center bg-slate-50/50"><span className="text-slate-500">{d.temp1Top}/</span><TempCell val={d.temp1Bot} /></td>
        <td className="px-3 py-2.5 text-xs text-center bg-slate-50/50"><TempCell val={d.temp2Top} /><span className="text-slate-400">/</span><TempCell val={d.temp2Bot} /></td>
        <td className="px-3 py-2.5 text-xs text-center bg-slate-50/50"><TempCell val={d.temp3Top} /><span className="text-slate-400">/</span><TempCell val={d.temp3Bot} /></td>
        <td className="px-3 py-2.5 text-xs text-center bg-slate-50/50"><TempCell val={d.temp4Top} /><span className="text-slate-400">/</span><TempCell val={d.temp4Bot} /></td>
        <td className="px-3 py-2.5 text-xs text-center bg-slate-50/50"><TempCell val={d.temp5Top} /><span className="text-slate-400">/</span><TempCell val={d.temp5Bot} /></td>
        <td className="px-3 py-2.5 text-xs text-center bg-slate-50/50"><TempCell val={d.temp6Top} /><span className="text-slate-400">/</span><TempCell val={d.temp6Bot} /></td>
        <td className="px-3 py-2.5 text-xs text-center text-slate-600 bg-slate-50/50">{d.waterfallTemp || "–"}</td>
        <td className="px-3 py-2.5 text-xs text-center bg-slate-50/50">
          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${statusColor}`}>{d.status || "–"}</span>
        </td>
        <td className="px-3 py-2.5 text-xs text-slate-600">{d.remark || "–"}</td>

        {/* ลบ */}
        <td className="px-2 py-2.5 text-center">
          <button onClick={() => onDelete(rec.id)}
            className="p-1 text-slate-300 hover:text-rose-500 rounded transition-colors opacity-0 group-hover:opacity-100">
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </td>
      </tr>

      {/* แถวขยาย: แสดงข้อมูลแบบ card สวยงาม */}
      {expanded && (
        <tr className="bg-slate-50">
          <td colSpan={100} className="px-4 py-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              {/* ชิ้นงาน */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <p className="font-bold text-blue-800 mb-2 text-[11px] uppercase tracking-wide">ชิ้นงานผลิต</p>
                <div className="space-y-1 text-slate-700">
                  <div className="flex justify-between"><span className="text-slate-500">Job:</span><span className="font-mono">{d.job || "–"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Part No.:</span><span className="font-semibold">{d.finishPartNo || "–"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">ชื่อ:</span><span>{d.finishMaterial || "–"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">สี/หนา/กว้าง/ยาว:</span><span>{d.finishColor} / {d.finishThick} / {d.finishWidth} / {d.finishLength}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">ผลิตรวม:</span><span className="font-bold text-blue-800">{d.finishProdQty} ม.</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">งานดี:</span><span className="font-bold text-emerald-700">{d.goodQty} ม.</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">งานเสีย:</span><span className="font-bold text-rose-600">{d.ngQty} ม. ({d.ngReason})</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">เวลา:</span><span>{d.startTime} – {d.endTime} ({d.usedTime} นาที)</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Product Code:</span><span className="font-mono">{d.prodCode || "–"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">LOT ผลิต:</span><span>{d.finishLot}</span></div>
                </div>
              </div>
              {/* วัตถุดิบ */}
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <p className="font-bold text-amber-800 mb-2 text-[11px] uppercase tracking-wide">วัตถุดิบ</p>
                <div className="space-y-1 text-slate-700">
                  <div className="flex justify-between"><span className="text-slate-500">Part No.:</span><span className="font-semibold">{d.rawPartNo || "–"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">ชื่อ:</span><span>{d.rawMaterial || "–"}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">สี/หนา/กว้าง/ยาว:</span><span>{d.rawColor} / {d.rawThick} / {d.rawWidth} / {d.rawLength}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">จำนวนที่ใช้:</span><span className="font-bold">{d.rawUsedQty} ม.</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">LOT วัตถุดิบ:</span><span>{d.rawLot}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Roll No.:</span><span className="font-mono">{d.rawRollNo || "–"}</span></div>
                </div>
              </div>
              {/* การตั้งค่า */}
              <div className="bg-slate-100 rounded-lg p-3 border border-slate-200">
                <p className="font-bold text-slate-700 mb-2 text-[11px] uppercase tracking-wide">การตั้งค่าเครื่องจักร</p>
                <div className="space-y-1 text-slate-700">
                  <div className="flex justify-between"><span className="text-slate-500">Speed:</span><span className="font-bold">{d.speed} m/min</span></div>
                  {[1,2,3,4,5,6].map(n => (
                    <div key={n} className="flex justify-between">
                      <span className="text-slate-500">Temp {n} (Top/Bot):</span>
                      <span>
                        <TempCell val={d[`temp${n}Top`]} />
                        <span className="text-slate-400 mx-1">/</span>
                        <TempCell val={d[`temp${n}Bot`]} />
                      </span>
                    </div>
                  ))}
                  <div className="flex justify-between"><span className="text-slate-500">น้ำหล่อเย็น:</span><span>{d.waterfallTemp}°C</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">สถานะ:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${d.status === "OK" ? "bg-emerald-100 text-emerald-800" : d.status === "NG" ? "bg-rose-100 text-rose-800" : "bg-amber-100 text-amber-800"}`}>{d.status}</span>
                  </div>
                  <div className="flex justify-between"><span className="text-slate-500">หมายเหตุ:</span><span>{d.remark || "–"}</span></div>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function RecordsPage() {
  const [records, setRecords] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      if (stored) setRecords(JSON.parse(stored));
    } catch {}
  }, []);

  const [submitted, setSubmitted] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const seedSampleData = () => {
    if (!confirm("สร้างข้อมูลตัวอย่างใน localStorage?")) return;
    setSeeding(true);
    const sample = [
      {
        id: Date.now() + 1,
        savedAt: new Date().toISOString(),
        header: { reportDate: new Date().toISOString().split('T')[0], shift: 'Day', machineNo: 'EMBOSS-01', employeeId: 'EMP001', employeeName: 'นายตัวอย่าง' },
        data: {
          job: 'JOB-TEST-001',
          finishPartNo: 'P-100',
          finishMaterial: 'PVC Sample',
          finishColor: 'Clear',
          finishThick: '0.5',
          finishWidth: '1000',
          finishLength: '200',
          finishProdQty: 1000,
          goodQty: 980,
          ngQty: 20,
          ngReason: 'เปลี่ยนม้วน',
          startTime: '08:00',
          endTime: '10:00',
          usedTime: '120',
          prodCode: 'PC-001',
          finishLot: new Date().toISOString().split('T')[0],
          rawPartNo: 'R-50',
          rawMaterial: 'PE Black',
          rawColor: 'Black',
          rawThick: '0.5',
          rawWidth: '1000',
          rawLength: '500',
          rawUsedQty: '200',
          rawLot: new Date().toISOString().split('T')[0],
          rawRollNo: 'RL-001',
          speed: '3.0',
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
          waterfallTemp: '20',
          status: 'OK',
          remark: 'ตัวอย่างทดสอบ'
        }
      }
    ];
    const existing = localStorage.getItem(LS_KEY) ? JSON.parse(localStorage.getItem(LS_KEY)) : [];
    const merged = [...existing, ...sample];
    localStorage.setItem(LS_KEY, JSON.stringify(merged));
    setRecords(merged);
    setSeeding(false);
  };

  const handleDelete = (id) => {
    if (!confirm("ลบรายการนี้?")) return;
    const updated = records.filter((r) => r.id !== id);
    setRecords(updated);
    // TODO: fetch(`/api/records/${id}`, { method: "DELETE" })
    localStorage.setItem(LS_KEY, JSON.stringify(updated));
  };

  const handleExportExcel = () => {
    const rows = records.map((rec, idx) => {
      const d = rec.data || {};
      const h = rec.header || {};
      return {
        "#": idx + 1,
        "รหัสพนักงาน": h.employeeId,
        "ชื่อพนักงาน": h.employeeName,
        "วันที่": h.reportDate,
        "กะ": h.shift,
        "เครื่องจักร": h.machineNo,
        "Job": d.job,
        "Part No. ชิ้นงาน": d.finishPartNo,
        "ชื่อชิ้นงาน": d.finishMaterial,
        "สีชิ้นงาน": d.finishColor,
        "หนาชิ้นงาน": d.finishThick,
        "กว้างชิ้นงาน": d.finishWidth,
        "ยาวชิ้นงาน": d.finishLength,
        "ผลิตรวม (ม.)": Number(d.finishProdQty || 0),
        "งานดี (ม.)": Number(d.goodQty || 0),
        "งานเสีย (ม.)": Number(d.ngQty || 0),
        "สาเหตุ NG": d.ngReason,
        "เวลาเริ่ม": d.startTime,
        "เวลาสิ้นสุด": d.endTime,
        "ใช้เวลา (น.)": d.usedTime,
        "Product Code": d.prodCode,
        "LOT ผลิต": d.finishLot,
        "Part No. วัตถุดิบ": d.rawPartNo,
        "ชื่อวัตถุดิบ": d.rawMaterial,
        "สีวัตถุดิบ": d.rawColor,
        "หนาวัตถุดิบ": d.rawThick,
        "กว้างวัตถุดิบ": d.rawWidth,
        "ยาววัตถุดิบ": d.rawLength,
        "จำนวนใช้ (ม.)": d.rawUsedQty,
        "LOT วัตถุดิบ": d.rawLot,
        "Roll No.": d.rawRollNo,
        "Speed (m/min)": d.speed,
        "T1 Top": d.temp1Top, "T1 Bot": d.temp1Bot,
        "T2 Top": d.temp2Top, "T2 Bot": d.temp2Bot,
        "T3 Top": d.temp3Top, "T3 Bot": d.temp3Bot,
        "T4 Top": d.temp4Top, "T4 Bot": d.temp4Bot,
        "T5 Top": d.temp5Top, "T5 Bot": d.temp5Bot,
        "T6 Top": d.temp6Top, "T6 Bot": d.temp6Bot,
        "น้ำหล่อเย็น (°C)": d.waterfallTemp,
        "สถานะ": d.status,
        "หมายเหตุ": d.remark,
      };
    });
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "รายงานการผลิต");
    const date = new Date().toISOString().split("T")[0];
    XLSX.writeFile(wb, `emboss_report_${date}.xlsx`);
  };

  const handleSubmitAll = () => {
    if (records.length === 0) return alert("ไม่มีรายการที่จะส่ง");
    if (!confirm(`ยืนยันส่งรายงาน ${records.length} รายการ?`)) return;
    // TODO: ส่งข้อมูลทั้งหมดไป API:
    // await fetch("/api/reports/submit", { method: "POST", body: JSON.stringify({ records }) })
    setSubmitted(true);
  };

  const totalGood = records.reduce((s, r) => s + Number(r.data?.goodQty || 0), 0);
  const totalNG = records.reduce((s, r) => s + Number(r.data?.ngQty || 0), 0);
  const totalProd = totalGood + totalNG;

  return (
    <div className="min-h-screen bg-slate-100 text-slate-800">
      <AppNavbar />
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 pt-4 pb-3 sticky top-16 z-10 shadow-sm">
        <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/form" className="flex items-center gap-1.5 text-sm text-slate-600 hover:text-blue-800 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              กลับกรอกข้อมูล
            </Link>
            <span className="text-slate-300">|</span>
            <h1 className="text-lg font-bold text-slate-900">รายการที่บันทึกแล้ว</h1>
            {records.length > 0 && (
              <span className="bg-blue-800 text-white text-xs px-2 py-0.5 rounded-full font-semibold">{records.length} รายการ</span>
            )}
          </div>
          {records.length > 0 && (
            <div className="flex items-center gap-2">
              <button onClick={handleExportExcel}
                className="flex items-center gap-2 px-4 py-2 bg-green-700 hover:bg-green-600 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
                <Download className="w-4 h-4" />
                Export Excel
              </button>
              <button onClick={handleSubmitAll}
                className="flex items-center gap-2 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold rounded-lg shadow-sm transition-colors">
                <Send className="w-4 h-4" />
                ส่งรายงานทั้งหมด
              </button>
            </div>
          )}
        </div>
      </div>

      {submitted && (
        <div className="max-w-screen-2xl mx-auto px-4 mt-4">
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-6 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2" />
            <h2 className="text-lg font-bold text-emerald-700">ส่งรายงานสำเร็จ!</h2>
            <p className="text-sm text-emerald-600 mt-1">รายงานการผลิต EMBOSS ถูกส่งไปยัง Foreman เรียบร้อยแล้ว</p>
            <Link href="/form" className="inline-flex items-center gap-2 mt-4 px-4 py-2 bg-emerald-600 text-white text-sm rounded-lg hover:bg-emerald-500 transition-colors">
              <ArrowLeft className="w-4 h-4" />
              กลับกรอกข้อมูลใหม่
            </Link>
          </div>
        </div>
      )}

      {!submitted && (
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          {records.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-sm">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h2 className="text-base font-semibold text-slate-500">ยังไม่มีรายการที่บันทึก</h2>
              <p className="text-sm text-slate-400 mt-1">กลับไปกรอกข้อมูลแล้วกด &ldquo;บันทึกรายการนี้&rdquo;</p>
              <div className="flex justify-center gap-3 mt-4">
                <Link href="/form" className="inline-flex items-center gap-2 px-4 py-2 bg-blue-800 text-white text-sm rounded-lg hover:bg-blue-700 transition-colors">
                  <ArrowLeft className="w-4 h-4" />
                  ไปกรอกข้อมูล
                </Link>
                <button
                  onClick={seedSampleData}
                  disabled={seeding}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-slate-700 text-white text-sm rounded-lg hover:bg-slate-600 transition-colors"
                >
                  สร้างตัวอย่าง
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* KPI */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm text-center">
                  <p className="text-xs text-slate-500 uppercase font-semibold tracking-wide">ผลิตรวม</p>
                  <p className="text-2xl font-extrabold text-slate-900 mt-1">{totalProd.toLocaleString()}</p>
                  <p className="text-xs text-slate-400">ม.</p>
                </div>
                <div className="bg-white rounded-xl border border-emerald-100 p-4 shadow-sm text-center">
                  <p className="text-xs text-emerald-600 uppercase font-semibold tracking-wide">งานดีรวม</p>
                  <p className="text-2xl font-extrabold text-emerald-700 mt-1">{totalGood.toLocaleString()}</p>
                  <p className="text-xs text-emerald-500">ม. ({totalProd > 0 ? ((totalGood/totalProd)*100).toFixed(1) : 0}%)</p>
                </div>
                <div className="bg-white rounded-xl border border-rose-100 p-4 shadow-sm text-center">
                  <p className="text-xs text-rose-600 uppercase font-semibold tracking-wide">งานเสียรวม</p>
                  <p className="text-2xl font-extrabold text-rose-700 mt-1">{totalNG.toLocaleString()}</p>
                  <p className="text-xs text-rose-500">ม. ({totalProd > 0 ? ((totalNG/totalProd)*100).toFixed(1) : 0}%)</p>
                </div>
              </div>

              {/* คำอธิบาย */}
              <div className="mb-2 flex items-center gap-2 text-xs text-slate-500">
                <ChevronDown className="w-3.5 h-3.5" />
                <span>กดลูกศรที่แถวเพื่อดูข้อมูลทั้งหมด</span>
              </div>

              {/* Table */}
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse" style={{minWidth: "2400px"}}>
                    <thead>
                      {/* Group header row */}
                      <tr className="text-[10px] font-bold uppercase tracking-wider border-b border-slate-200">
                        <th colSpan={2} className="px-3 py-2 bg-slate-100 text-slate-500"></th>
                        <th colSpan={4} className="px-3 py-2 bg-slate-100 text-slate-600 text-center border-x border-slate-200">ข้อมูลการผลิต</th>
                        <th colSpan={15} className="px-3 py-2 bg-blue-100 text-blue-800 text-center border-x border-blue-200">ส่วนที่ 1 — ชิ้นงานผลิต</th>
                        <th colSpan={9} className="px-3 py-2 bg-amber-100 text-amber-800 text-center border-x border-amber-200">ส่วนที่ 2 — วัตถุดิบ</th>
                        <th colSpan={10} className="px-3 py-2 bg-slate-100 text-slate-600 text-center border-x border-slate-200">ส่วนที่ 3 — การตั้งค่า</th>
                        <th className="px-2 py-2 bg-slate-100"></th>
                      </tr>
                      {/* Column headers */}
                      <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase tracking-wide border-b border-slate-200">
                        <th className="px-3 py-2 text-center w-8">#</th>
                        <th className="px-2 py-2 text-center w-8"></th>
                        {/* ข้อมูลการผลิต */}
                        <th className="px-3 py-2 bg-slate-50 border-l border-slate-200">รหัส/ชื่อพนักงาน</th>
                        <th className="px-3 py-2 bg-slate-50">วันที่</th>
                        <th className="px-3 py-2 bg-slate-50">กะ</th>
                        <th className="px-3 py-2 bg-slate-50">เครื่อง</th>
                        {/* ชิ้นงาน */}
                        <th className="px-3 py-2 bg-blue-50 border-l border-blue-200">Job</th>
                        <th className="px-3 py-2 bg-blue-50">Part No.</th>
                        <th className="px-3 py-2 bg-blue-50">ชื่อชิ้นงาน</th>
                        <th className="px-3 py-2 bg-blue-50 text-center">สี</th>
                        <th className="px-3 py-2 bg-blue-50 text-right">หนา</th>
                        <th className="px-3 py-2 bg-blue-50 text-right">กว้าง</th>
                        <th className="px-3 py-2 bg-blue-50 text-right">ยาว</th>
                        <th className="px-3 py-2 bg-blue-50 text-center">ผลิต(ม.)</th>
                        <th className="px-3 py-2 bg-emerald-50 text-center">งานดี(ม.)</th>
                        <th className="px-3 py-2 bg-rose-50 text-center">งานเสีย(ม.)</th>
                        <th className="px-3 py-2 bg-blue-50 text-center">สาเหตุ NG</th>
                        <th className="px-3 py-2 bg-blue-50 text-center">เวลา</th>
                        <th className="px-3 py-2 bg-blue-50 text-center">ใช้เวลา(น.)</th>
                        <th className="px-3 py-2 bg-blue-50 text-center">Prod.Code</th>
                        <th className="px-3 py-2 bg-blue-50 text-center">LOT ผลิต</th>
                        {/* วัตถุดิบ */}
                        <th className="px-3 py-2 bg-amber-50 border-l border-amber-200">Part No. วัตถุดิบ</th>
                        <th className="px-3 py-2 bg-amber-50">ชื่อวัตถุดิบ</th>
                        <th className="px-3 py-2 bg-amber-50 text-center">สี</th>
                        <th className="px-3 py-2 bg-amber-50 text-right">หนา</th>
                        <th className="px-3 py-2 bg-amber-50 text-right">กว้าง</th>
                        <th className="px-3 py-2 bg-amber-50 text-right">ยาว</th>
                        <th className="px-3 py-2 bg-amber-50 text-right">จำนวนใช้(ม.)</th>
                        <th className="px-3 py-2 bg-amber-50 text-center">LOT วัตถุดิบ</th>
                        <th className="px-3 py-2 bg-amber-50 text-center">Roll No.</th>
                        {/* การตั้งค่า */}
                        <th className="px-3 py-2 bg-slate-100 border-l border-slate-200 text-center">Speed</th>
                        <th className="px-3 py-2 bg-slate-100 text-center">T1(T/B)</th>
                        <th className="px-3 py-2 bg-slate-100 text-center">T2(T/B)</th>
                        <th className="px-3 py-2 bg-slate-100 text-center">T3(T/B)</th>
                        <th className="px-3 py-2 bg-slate-100 text-center">T4(T/B)</th>
                        <th className="px-3 py-2 bg-slate-100 text-center">T5(T/B)</th>
                        <th className="px-3 py-2 bg-slate-100 text-center">T6(T/B)</th>
                        <th className="px-3 py-2 bg-slate-100 text-center">น้ำเย็น</th>
                        <th className="px-3 py-2 bg-slate-100 text-center">Status</th>
                        <th className="px-3 py-2 bg-slate-100">หมายเหตุ</th>
                        <th className="px-2 py-2 w-8"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {records.map((rec, idx) => (
                        <RecordRow key={rec.id} rec={rec} idx={idx} onDelete={handleDelete} />
                      ))}
                    </tbody>
                    {/* Footer Summary */}
                    <tfoot>
                      <tr className="bg-slate-50 border-t-2 border-slate-300 font-bold text-xs">
                        <td colSpan={13} className="px-3 py-2.5 text-right text-slate-600">รวมทั้งหมด</td>
                        <td className="px-3 py-2.5 text-center text-blue-800">{totalProd}</td>
                        <td className="px-3 py-2.5 text-center text-emerald-700 bg-emerald-50/50">{totalGood}</td>
                        <td className="px-3 py-2.5 text-center text-rose-700 bg-rose-50/50">{totalNG}</td>
                        <td colSpan={24} className="px-3 py-2.5 text-slate-400 text-[10px]">
                          ({totalProd > 0 ? `งานดี ${((totalGood/totalProd)*100).toFixed(1)}%` : ""})
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
