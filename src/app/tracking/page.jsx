"use client";
import React, { useState, useMemo, useEffect } from "react";
import Link from "next/link";
import Sidebar from "../components/AppNavbar";
import {
  ArrowLeft,
  Search,
  Calendar,
  ChevronDown,
  ChevronUp,
  User,
  Cpu,
  Clock,
  CheckCircle2,
  AlertCircle,
  PlayCircle,
  XCircle,
  Trash2,
  SlidersHorizontal,
  TrendingDown,
  ClipboardList,
  MessageSquare,
  PenLine,
  RefreshCw,
  FileText,
  RotateCcw,
  Layers,
  Plus,
} from "lucide-react";

const LS_KEY = "emboss_records";
const TEMP_STD = 390;

// ─────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "–";
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear() + 543;
  return `${dd}/${mm}/${yy}`;
}

function formatDateTime(iso) {
  if (!iso) return { date: "–", time: "" };
  const d = new Date(iso);
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = d.getFullYear() + 543;
  const hh = String(d.getHours()).padStart(2, "0");
  const mn = String(d.getMinutes()).padStart(2, "0");
  return { date: `${dd}/${mm}/${yy}`, time: `${hh}:${mn}` };
}

function toLocalDate(str) {
  if (!str) return null;
  const [y, m, d] = str.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function hasTempAnomaly(data) {
  if (!data) return false;
  for (let n = 1; n <= 6; n++) {
    if (data[`temp${n}Top`] !== undefined && Number(data[`temp${n}Top`]) !== TEMP_STD) return true;
    if (data[`temp${n}Bot`] !== undefined && Number(data[`temp${n}Bot`]) !== TEMP_STD) return true;
  }
  return false;
}

// ─────────────────────────────────────────────────────────────────
// Status Badge
// ─────────────────────────────────────────────────────────────────
const getBadgeStyle = (statusVal) => {
  switch (statusVal) {
    // 🟢 1. สิ้นสุดการผลิต
    case 'Completed':
    case 'FINISHED':
    case 'สิ้นสุดการผลิต':
    case 'เสร็จสิ้น':
      return {
        label: 'สิ้นสุดการผลิต',
        icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200/80'
      };

    // 🔵 2. กำลังผลิต
    case 'In Progress':
    case 'IN_PROGRESS':
    case 'กำลังผลิต':
      return {
        label: 'กำลังผลิต',
        icon: <PlayCircle className="w-3.5 h-3.5 text-blue-600 animate-pulse" />,
        className: 'bg-blue-50 text-blue-700 border-blue-200/80'
      };

    // 🟡 3. รอผลิต (Default)
    case 'Pending':
    case 'WAITING':
    case 'รอผลิต':
    case 'รอดำเนินการ':
    default:
      return {
        label: 'รอผลิต',
        icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
        className: 'bg-amber-50 text-amber-700 border-amber-200/80'
      };
  }
};

function StatusBadge({ status }) {
  const style = getBadgeStyle(status);

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-all shadow-sm ${style.className}`}>
      {style.icon}
      <span>{style.label}</span>
    </span>
  );
}


// ─────────────────────────────────────────────────────────────────
// Expanded Detail — แสดงรายการทุก record ใน Job เดียวกัน
// ─────────────────────────────────────────────────────────────────
function JobExpandedDetail({ recs, onDelete }) {
  const totalGood = recs.reduce((s, r) => s + Number(r.data?.goodQty || 0), 0);
  const totalNG = recs.reduce((s, r) => s + Number(r.data?.ngQty || 0), 0);
  const totalProd = recs.reduce((s, r) => s + Number(r.data?.finishProdQty || 0), 0);

  return (
    <tr className="bg-linear-to-b from-blue-50/60 to-slate-50/30 border-y border-blue-100">
      <td colSpan={8} className="px-4 py-4">

        {/* Summary KPI strip */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-4 py-2.5 flex items-center gap-3">
            <Layers className="w-4 h-4 text-blue-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">รายการใน Job</p>
              <p className="text-lg font-extrabold text-blue-800">{recs.length}</p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-emerald-100 shadow-sm px-4 py-2.5 flex items-center gap-3">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">งานดี (Good)</p>
              <p className="text-lg font-extrabold text-emerald-800">{totalGood.toLocaleString()} <span className="text-xs font-normal text-slate-400">ชิ้น</span></p>
            </div>
          </div>
          <div className="bg-white rounded-xl border border-rose-100 shadow-sm px-4 py-2.5 flex items-center gap-3">
            <XCircle className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <p className="text-[10px] text-slate-400 font-semibold uppercase">งานเสีย (NG)</p>
              <p className="text-lg font-extrabold text-rose-700">{totalNG.toLocaleString()} <span className="text-xs font-normal text-slate-400">ชิ้น</span></p>
            </div>
          </div>
          {totalProd > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-4 py-2.5 flex items-center gap-3">
              <TrendingDown className="w-4 h-4 text-slate-400 shrink-0" />
              <div>
                <p className="text-[10px] text-slate-400 font-semibold uppercase">Yield Rate</p>
                <p className="text-lg font-extrabold text-slate-800">{((totalGood / totalProd) * 100).toFixed(1)}%</p>
              </div>
            </div>
          )}
        </div>

        {/* Sub-table: รายการแต่ละ record */}
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <div className="px-4 py-2.5 bg-blue-100 text-blue-900 text-[11px] uppercase tracking-wider flex items-center gap-2">
            <ClipboardList className="w-3.5 h-3.5 text-blue-800" />
            รายละเอียดรายการทั้งหมดใน Job
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[11px] font-semibold text-slate-500">
                  <th className="px-3 py-2 text-center w-8">ลำดับ</th>
                  <th className="px-3 py-2">วันที่บันทึก</th>
                  <th className="px-3 py-2">ผู้ผลิต / เครื่อง</th>
                  <th className="px-3 py-2">Part No. / ชิ้นงาน</th>
                  <th className="px-3 py-2 text-center">เวลา</th>
                  <th className="px-3 py-2 text-right">ผลิต</th>
                  <th className="px-3 py-2 text-right">ชิ้นงานดี</th>
                  <th className="px-3 py-2 text-right">ชิ้นงานเสีย</th>
                  <th className="px-3 py-2 text-center">สถานะ</th>
                  <th className="px-3 py-2">หมายเหตุ</th>
                  <th className="px-3 py-2 text-center w-10">ลบ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recs.map((rec, i) => {
                  const d = rec.data || {};
                  const h = rec.header || {};
                  const dt = formatDateTime(rec.savedAt);
                  const anomaly = hasTempAnomaly(d);
                  return (
                    <tr key={rec.id} className="hover:bg-slate-50 group">
                      <td className="px-3 py-2.5 text-center text-slate-400 font-semibold">{i + 1}</td>
                      <td className="px-3 py-2.5">
                        <div className="font-semibold text-slate-700">{dt.date}</div>
                        <div className="text-slate-400 ">{dt.time}</div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <div className="w-6 h-6 rounded-full bg-linear-to-br from-blue-400 to-indigo-500 flex items-center justify-center text-white text-[10px] font-bold shrink-0">
                            {(h.employeeName || "?")[0]}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-800">{h.employeeName || "–"}</div>
                            <div className="text-slate-400 ">{h.machineNo || "–"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">
                        <div className="font-bold text-slate-900">{d.finishPartNo || "–"}</div>
                        <div className="text-slate-500 truncate max-w-35">{d.finishMaterial || "–"}</div>
                        {d.finishColor && <div className="text-slate-400">{d.finishColor}</div>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        {d.startTime && d.endTime ? (
                          <div className=" font-semibold text-slate-700">{d.startTime}–{d.endTime}</div>
                        ) : <span className="text-slate-300">–</span>}
                        {d.usedTime && <div className="text-slate-400">{d.usedTime} น.</div>}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-slate-800">
                        {Number(d.finishProdQty || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-emerald-700">
                        {Number(d.goodQty || 0).toLocaleString()}
                      </td>
                      <td className="px-3 py-2.5 text-right font-semibold text-rose-600">
                        {Number(d.ngQty || 0) > 0 ? Number(d.ngQty).toLocaleString() : <span className="text-slate-300">0</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <StatusBadge status={d.status} />
                        {anomaly && (
                          <div className="mt-0.5 text-[10px] text-orange-500 font-semibold flex items-center gap-0.5 justify-center">
                            <AlertCircle className="w-2.5 h-2.5" /> Temp!
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-2.5 text-slate-500 italic max-w-30 truncate">
                        {d.remark || <span className="text-slate-300 not-italic">–</span>}
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <button
                          onClick={() => onDelete(rec.id)}
                          title="ลบรายการนี้"
                          className="p-1 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Signature area */}
          <div className="px-4 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-4">
            <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3 h-3" />
              หมายเหตุ Foreman:
              <span className="italic text-slate-300 ml-1">— ยังไม่มี —</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
                <PenLine className="w-3 h-3" /> ลายเซ็น:
              </div>
              <div className="h-8 w-32 border border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-200 text-[10px]">
                — รอลงนาม —
              </div>
            </div>
          </div>
        </div>
      </td>
    </tr>
  );
}

// ─────────────────────────────────────────────────────────────────
// Job Row — 1 แถว = 1 Job (group ของ records)
// ─────────────────────────────────────────────────────────────────
function JobRow({ jobKey, recs, idx, onDelete }) {
  const [expanded, setExpanded] = useState(false);

  // ใช้ record ล่าสุด (sorted newest) เป็นตัวแทนแถว
  const rep = recs[0];
  const d = rep.data || {};
  const h = rep.header || {};
  const dt = formatDateTime(rep.savedAt);

  const totalProd = recs.reduce((s, r) => s + Number(r.data?.finishProdQty || 0), 0);
  const totalGood = recs.reduce((s, r) => s + Number(r.data?.goodQty || 0), 0);
  const totalNG = recs.reduce((s, r) => s + Number(r.data?.ngQty || 0), 0);

  // สถานะรวม: ถ้ามี NG ใดก็แสดง NG, มี HOLD แสดง HOLD, ปกติ OK
  const overallStatus = recs.some((r) => r.data?.status === "NG")
    ? "NG"
    : recs.some((r) => r.data?.status === "HOLD")
      ? "HOLD"
      : "OK";

  const labelBadge = h.machineNo
    ? h.machineNo.includes("01") ? "ไลน์ 1" : h.machineNo.includes("02") ? "ไลน์ 2" : "EMBOSS"
    : "EMBOSS";

  return (
    <>
      <tr
        className={`border-b border-slate-100 transition-colors group ${expanded ? "bg-blue-50/30" : "hover:bg-slate-50/80"} cursor-pointer`}
        onClick={() => setExpanded((v) => !v)}
      >
        {/* # */}
        <td className="px-4 py-3.5 text-center text-xs font-semibold text-slate-400 w-12">
          {idx + 1}
        </td>

        {/* วันที่สร้าง Form */}
        <td className="px-4 py-3.5">
          <div className="text-sm font-semibold text-slate-800">{dt.date}</div>
          <div className="text-[11px] text-slate-400  mt-0.5">{dt.time}</div>
          <div className="mt-1 flex items-center gap-1 flex-wrap">
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">{labelBadge}</span>
            {recs.length > 1 && (
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-200 text-slate-600">
                {recs.length} รายการ
              </span>
            )}
          </div>
        </td>

        {/* ชื่อสินค้า */}
        <td className="px-4 py-3.5">
          <div className="font-extrabold text-slate-900 text-sm leading-tight">{d.job || "–"}</div>
          <div className="text-xs font-semibold text-blue-700 mt-0.5">{d.finishPartNo || "–"}</div>
          <div className="text-[11px] text-slate-500 mt-0.5 max-w-45 truncate">{d.finishMaterial || "–"}</div>
          {d.finishColor && <div className="text-[10px] text-slate-400">{d.finishColor}</div>}
        </td>

        <td className="px-4 py-3.5 text-center align-middle">
          {d.startTime && d.endTime ? (
            <div className="flex flex-col items-center justify-center space-y-1">

              {/* เช็กว่าเป็น Job วันเดียวกัน หรือ ข้ามวัน */}
              {d.startDate === d.endDate || !d.endDate ? (
                /* 1.1 กรณีจบภายในวันเดียวกัน */
                <div className="space-y-0.5">
                  <div className="text-[11px] font-semibold text-slate-400 leading-tight">
                    {d.startDate}
                  </div>
                  <div className="text-sm font-bold text-slate-700  tracking-tight">
                    {d.startTime} – {d.endTime}
                  </div>
                </div>
              ) : (
                /* 1.2 กรณี Job ข้ามวัน (Multi-day Job) */
                <div className="text-xs  text-slate-700 flex flex-col items-center gap-0.5 bg-slate-50/80 px-2 py-1.5 rounded-lg border border-slate-200/70 shadow-none">
                  {/* วันเวลาเริ่มต้น */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-sans font-medium">เริ่ม:</span>
                    <span className="font-semibold text-slate-800">{d.startDate}</span>
                    <span className="text-blue-600 font-bold">{d.startTime}</span>
                  </div>

                  <div className="text-[10px] text-slate-300 leading-none">↓</div>

                  {/* วันเวลาสิ้นสุด */}
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-slate-400 font-sans font-medium">เสร็จ:</span>
                    <span className="font-semibold text-slate-800">{d.endDate}</span>
                    <span className="text-emerald-600 font-bold">{d.endTime}</span>
                  </div>
                </div>
              )}

              {/* สรุปเวลาที่ใช้รวม */}
              {d.usedTime && (
                <div className="text-[11px] text-slate-400 font-medium pt-0.5">
                  ใช้เวลา <span className=" text-slate-600 font-semibold">{d.usedTime}</span> น.
                </div>
              )}

            </div>
          ) : (
            <span className="text-slate-300 text-xs ">–</span>
          )}
        </td>

        {/* 📦 2. จำนวนผลิตรวม (รวมทุก record ใน job) */}
        <td className="px-4 py-3.5 text-right align-middle">
          <div className="inline-flex flex-col items-end">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-extrabold text-slate-800  tracking-tight">
                {totalProd ? totalProd.toLocaleString() : 0}
              </span>
              <span className="text-[11px] font-medium text-slate-400">ชิ้น</span>
            </div>

            {/* แสดงยอด NG หากมีค่า > 0 */}
            {totalNG > 0 && (
              <div className="text-[11px] text-rose-500 font-semibold  mt-0.5 bg-rose-50 px-1.5 py-0.2 rounded border border-rose-100">
                NG {totalNG.toLocaleString()} ม.
              </div>
            )}
          </div>
        </td>

        {/* 🏷️ 3. สถานะภาพรวม*/}
        <td className="px-4 py-3.5 text-center align-middle">
          <div className="flex flex-col items-center justify-center gap-1.5">

            {/* 🏷️ Component แสดงสถานะหลัก (รอผลิต / กำลังผลิต / สิ้นสุดการผลิต) */}
            <StatusBadge status={overallStatus} />



          </div>
        </td>

        {/* จัดการ */}
        <td className="px-4 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center gap-1">
            <button
              title="ลบทั้ง Job"
              onClick={() => { if (confirm(`ลบ Job "${d.job}" ทั้งหมด ${recs.length} รายการ?`)) recs.forEach((r) => onDelete(r.id)); }}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </td>

        {/* Expand */}
        <td className="px-4 py-3.5 text-center w-28">
          <button
            onClick={(e) => { e.stopPropagation(); setExpanded((v) => !v); }}
            className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${expanded
              ? "bg-blue-100 text-blue-700"
              : "bg-slate-100 hover:bg-blue-100 text-slate-700 hover:text-blue-700"}`}
          >
            {expanded
              ? <><ChevronUp className="w-3.5 h-3.5" /></>
              : <><ChevronDown className="w-3.5 h-3.5" /></>}
          </button>
        </td>
      </tr>

      {expanded && <JobExpandedDetail recs={recs} onDelete={onDelete} />}
    </>
  );
}

// ─────────────────────────────────────────────────────────────────
// Main Page
// ─────────────────────────────────────────────────────────────────
export default function TrackingPage() {
  const [records, setRecords] = useState([]);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [selectedLabel, setSelectedLabel] = useState("ALL");
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [lastRefresh, setLastRefresh] = useState(null);

  const loadRecords = () => {
    try {
      const stored = localStorage.getItem(LS_KEY);
      setRecords(stored ? JSON.parse(stored) : []);
    } catch {
      setRecords([]);
    }
    setLastRefresh(new Date());
  };

  useEffect(() => {
    loadRecords();
  }, []);

  const handleDelete = (id) => {
    setRecords((prev) => {
      const updated = prev.filter((r) => r.id !== id);
      localStorage.setItem(LS_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const handleSearch = () => { setSearchQuery(searchInput.trim()); };

  // ─── Filter records ───
  const filtered = useMemo(() => {
    let list = [...records];

    if (startDate) {
      const start = toLocalDate(startDate);
      list = list.filter((r) => r.savedAt && new Date(r.savedAt) >= start);
    }
    if (endDate) {
      const end = toLocalDate(endDate);
      end.setHours(23, 59, 59, 999);
      list = list.filter((r) => r.savedAt && new Date(r.savedAt) <= end);
    }
    if (selectedLabel !== "ALL") {
      list = list.filter((r) => {
        const machine = r.header?.machineNo || "";
        if (selectedLabel === "LINE1") return machine.includes("01");
        if (selectedLabel === "LINE2") return machine.includes("02");
        if (selectedLabel === "DAY") return r.header?.shift === "Day";
        if (selectedLabel === "NIGHT") return r.header?.shift === "Night";
        if (selectedLabel === "OK") return r.data?.status === "OK";
        if (selectedLabel === "NG") return r.data?.status === "NG";
        return true;
      });
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter((r) => {
        const d = r.data || {};
        const h = r.header || {};
        return (
          (d.job || "").toLowerCase().includes(q) ||
          (d.finishPartNo || "").toLowerCase().includes(q) ||
          (d.finishMaterial || "").toLowerCase().includes(q) ||
          (h.employeeName || "").toLowerCase().includes(q)
        );
      });
    }

    list.sort((a, b) => (b.savedAt || "").localeCompare(a.savedAt || ""));
    return list;
  }, [records, startDate, endDate, selectedLabel, searchQuery]);

  // ─── Group by Job ───
  const jobGroups = useMemo(() => {
    const map = new Map();
    filtered.forEach((rec) => {
      const key = rec.data?.job || `__no_job_${rec.id}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(rec);
    });
    return Array.from(map.entries()); // [[jobKey, [rec, ...]], ...]
  }, [filtered]);

  const totalGood = filtered.reduce((s, r) => s + Number(r.data?.goodQty || 0), 0);
  const totalNG = filtered.reduce((s, r) => s + Number(r.data?.ngQty || 0), 0);
  const totalProd = filtered.reduce((s, r) => s + Number(r.data?.finishProdQty || 0), 0);

  const clearFilters = () => { setStartDate(""); setEndDate(""); setSelectedLabel("ALL"); setSearchInput(""); setSearchQuery(""); };
  const hasFilter = startDate || endDate || selectedLabel !== "ALL" || searchQuery;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      <Sidebar />
      <div>

      {/* ─── HEADER ─── */}
      <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#00B4D8] text-white  shadow-md px-4 py-4">
        <div className="max-w-7xl mx-auto px-5 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-2xl font-bold text-slate-50 leading-tight">ติดตามและจัดการการผลิต EMBOSS</h1>
              <p className="text-[11px] text-slate-50">PE ROLL · EMBOSS · Production Tracking</p>
            </div>
            {jobGroups?.length > 0 && (
  <span className="bg-blue-700 text-white text-xs px-2.5 py-0.5 rounded-full font-bold">
    {jobGroups.length} Job
  </span>
)}
          </div>
          <div className="flex items-center gap-2">
           
            <Link href="/form" className="flex items-center gap-1.5 px-4 py-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold rounded-lg transition-colors">
              <Plus className="w-4 h-4" />
              รายงาน
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-5 py-5 space-y-4">

        {/* ─── FILTER BAR ─── */}
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-sm space-y-3">
          <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">

            {/* 📅 ฝั่งซ้าย: ตัวกรองวันที่ และ Label */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">

              {/* วันที่เริ่มต้น */}
              <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2 text-sm transition-all shadow-sm">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-500 shrink-0">เริ่ม:</span>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-transparent focus:outline-none text-slate-700 text-xs font-medium cursor-pointer"
                />
              </div>

              <span className="text-slate-300 font-bold hidden sm:inline">-</span>

              {/* วันที่สิ้นสุด */}
              <div className="flex items-center gap-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 rounded-xl px-3 py-2 text-sm transition-all shadow-sm">
                <Calendar className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs font-semibold text-slate-500 shrink-0">สิ้นสุด:</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-transparent focus:outline-none text-slate-700 text-xs font-medium cursor-pointer"
                />
              </div>

              {/* Label Dropdown */}
              <div className="relative flex-1 sm:flex-none min-w-40">
                <select
                  value={selectedLabel}
                  onChange={(e) => setSelectedLabel(e.target.value)}
                  className="w-full appearance-none bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-xl pl-3 pr-8 py-2 text-xs font-medium text-slate-700 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 cursor-pointer shadow-sm transition-all"
                >
                  <option value="ALL">Label ทั้งหมด</option>
                  <optgroup label="ไลน์ผลิต">
                    <option value="LINE1">⚙️ EMBOSS ไลน์ 1</option>
                    <option value="LINE2">⚙️ EMBOSS ไลน์ 2</option>
                  </optgroup>
                  <optgroup label="สถานะคุณภาพ">
                    <option value="OK">✅ สถานะ OK</option>
                    <option value="NG">❌ สถานะ NG</option>
                  </optgroup>
                </select>
                <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>

            </div>

            {/* 🔍 ฝั่งขวา: ช่องค้นหา + ปุ่มค้นหา + ปุ่ม Reset */}
            <div className="flex items-center gap-2 w-full lg:w-auto">

              {/* Search Input Box */}
              <div className="relative flex-1 lg:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  placeholder="ค้นหา Job / Part No. / ชื่อสินค้า..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 text-xs font-medium text-slate-700 rounded-xl focus:outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200 shadow-sm transition-all placeholder:text-slate-400 "
                />
              </div>

              {/* Search Button */}
              <button
                onClick={handleSearch}
                className="flex items-center justify-center p-2 bg-blue-900 hover:bg-blue-700 active:scale-95 text-white rounded-3xl transition-all shadow-sm shadow-blue-200 shrink-0 h-9 w-9 cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>

              {/* Reset Filter Button */}
              {hasFilter && (
                <button
                  onClick={clearFilters}
                  title="ล้างตัวกรอง"
                  className="flex items-center gap-1.5 active:scale-95 text-rose-600 rounded-xl text-xs font-semibold transition-all shrink-0 h-8.5 "
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline"></span>
                </button>
              )}

            </div>

          </div>


          {/* Summary strip */}
          {(hasFilter || records.length > 0) && (
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs py-1 text-slate-400 pt-1 border-t border-slate-100">
              <span>แสดง <strong className="text-slate-600">{jobGroups.length}</strong> Job ({filtered.length} รายการ) / ทั้งหมด {records.length}</span>
              {filtered.length > 0 && (
                <>
                  <span>ผลิตรวม: <strong className="text-slate-600">{totalProd.toLocaleString()} ชิ้น</strong></span>
                  <span className="text-emerald-600">งานดี: <strong>{totalGood.toLocaleString()} ชิ้น</strong></span>
                  {totalNG > 0 && <span className="text-rose-500">NG: <strong>{totalNG.toLocaleString()} ชิ้น</strong></span>}
                  {totalProd > 0 && <span>Yield: <strong className="text-emerald-600">{((totalGood / totalProd) * 100).toFixed(1)}%</strong></span>}
                </>
              )}

            </div>
          )}
        </div>

        {/* ─── EMPTY STATE ─── */}
        {records.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-14 text-center">
            <FileText className="w-14 h-14 text-slate-200 mx-auto mb-4" />
            <h2 className="text-base font-bold text-slate-400">ยังไม่มีรายการรายงาน</h2>
            <p className="text-sm text-slate-400 mt-1">พนักงานยังไม่ได้กรอกรายงานการผลิต</p>
            <Link href="/form" className="inline-flex items-center gap-2 mt-5 px-5 py-2.5 bg-blue-700 text-white text-sm rounded-xl hover:bg-blue-600 transition-colors font-semibold">
              ไปกรอกรายงาน
            </Link>
          </div>
        )}

        {/* ─── NO RESULTS ─── */}
        {records.length > 0 && jobGroups.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-10 text-center">
            <Search className="w-10 h-10 text-slate-200 mx-auto mb-3" />
            <p className="text-sm font-semibold text-slate-400">ไม่พบรายการที่ตรงกับการค้นหา</p>
            <button onClick={clearFilters} className="mt-3 text-xs text-blue-600 hover:underline">ล้างตัวกรองทั้งหมด</button>
          </div>
        )}

        {/* ─── TABLE ─── */}
        {jobGroups.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-blue-900 text-white text-[11px] uppercase tracking-wider">
                    
                    <th className="px-4 py-3 text-center w-12 text-white">ลำดับ</th>
                    <th className="px-4 py-3"><div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-blue-400" />วันที่สร้าง</div></th>
                    <th className="px-4 py-3"><div className="flex items-center gap-1.5"><ClipboardList className="w-3.5 h-3.5 text-blue-400" />Job / Part No. / ชิ้นงาน</div></th>
                    <th className="px-4 py-3 text-center"><div className="flex items-center justify-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-400" />เวลาเริ่ม – สิ้นสุด</div></th>
                    <th className="px-4 py-3 text-right">จำนวนชิ้นงาน</th>
                    <th className="px-4 py-3 text-center">สถานะ</th>
                    <th className="px-4 py-3 text-center w-20">จัดการ</th>
                    <th className="px-4 py-3 text-center w-28">รายละเอียด</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {jobGroups.map(([jobKey, recs], idx) => (
                    <JobRow key={jobKey} jobKey={jobKey} recs={recs} idx={idx} onDelete={handleDelete} />
                  ))}
                </tbody>
                <tfoot>
                  <tr className="bg-slate-50 border-t-2 border-slate-200 text-xs font-bold">
                    <td colSpan={4} className="px-4 py-3 text-right text-slate-500">รวมทั้งหมด ({jobGroups.length} Job)</td>
                    <td className="px-4 py-3 text-right">
                      <div className="text-slate-800">{totalProd.toLocaleString()} ชิ้น</div>
                      {totalNG > 0 && <div className="text-rose-500 text-[11px]">NG {totalNG.toLocaleString()}</div>}
                    </td>
                    <td className="px-4 py-3 text-center text-emerald-600">
                      {totalProd > 0 ? `Yield ${((totalGood / totalProd) * 100).toFixed(1)}%` : "–"}
                    </td>
                    <td colSpan={2} />
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        )}

      </div>
      </div>
    </div >
  );
}
