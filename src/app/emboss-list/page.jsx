"use client";

import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "../components/AppNavbar";
import {
  Plus,
  Search,
  CalendarDays,
  ClipboardList,
  Clock,
  CheckCircle2,
  Package,
  User,
  Eye,
  Pencil,
} from "lucide-react";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function getTodayDate() {
  const now = new Date();

  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function ProductionRow({ item, index, onView, onEdit }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className={`group cursor-pointer transition ${
          expanded ? "bg-blue-50/40" : "hover:bg-slate-50"
        }`}
        onClick={() => setExpanded((prev) => !prev)}
      >
        <td className="px-4 py-4 text-center text-xs font-semibold text-slate-400">
          {index + 1}
        </td>

        <td className="px-4 py-4">
          <div className="font-bold text-slate-900">{item.job}</div>

          <div className="mt-0.5 text-xs font-semibold text-blue-700">
            {item.partNo}
          </div>
        </td>

        <td className="px-4 py-4">
          <div className="text-sm font-semibold text-slate-700">
            {item.description}
          </div>

          <div className="mt-0.5 text-xs text-slate-400">สี: {item.color}</div>
        </td>

        <td className="px-4 py-4">
          <div className="text-sm font-semibold text-slate-700">
            {item.partLotNumber}
          </div>
        </td>

        <td className="px-4 py-4 text-center">
          <div className="flex items-center justify-center gap-2">
            <User className="h-3.5 w-3.5 text-slate-400" />

            <span className="text-xs font-semibold text-slate-700">
              {item.employeeName}
            </span>
          </div>
        </td>

        <td className="px-4 py-4 text-right text-sm font-bold text-emerald-600">
          {Number(item.okQty || 0).toLocaleString()}
        </td>

        <td className="px-4 py-4 text-right text-sm font-bold text-rose-500">
          {Number(item.ngQty || 0).toLocaleString()}
        </td>

        {/* จัดการ */}
        <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-center gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              onClick={() => onView(item)}
              title="ดูรายละเอียด"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-100 hover:text-blue-600"
            >
              <Eye className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => onEdit(item)}
              title="แก้ไข"
              className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-amber-100 hover:text-amber-600"
            >
              <Pencil className="h-4 w-4" />
            </button>
          </div>
        </td>
      </tr>

      {expanded && (
        <tr>
          <td colSpan={8} className="bg-slate-50 px-6 py-4">
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <div className="border-b border-slate-200 bg-blue-50 px-4 py-2.5">
                <p className="text-xs font-bold text-blue-900">
                  Material ที่ใช้ในการผลิต
                </p>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50 text-slate-500">
                      <th className="px-4 py-2.5">Material Part No.</th>

                      <th className="px-4 py-2.5">รายละเอียด</th>

                      <th className="px-4 py-2.5 text-right">Mat Use</th>

                      <th className="px-4 py-2.5">Lot No.</th>

                      <th className="px-4 py-2.5 text-center">OK</th>

                      <th className="px-4 py-2.5 text-center">NG</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {item.materials?.length > 0 ? (
                      item.materials.map((mat, matIndex) => (
                        <tr
                          key={`${mat.materialPartNo}-${mat.materialLotNumber}-${matIndex}`}
                          className="hover:bg-slate-50"
                        >
                          <td className="px-4 py-3 font-bold text-blue-700">
                            {mat.materialPartNo || "-"}
                          </td>

                          <td className="px-4 py-3 text-slate-700">
                            {mat.materialDescription || "-"}
                          </td>

                          <td className="px-4 py-3 text-right font-semibold text-slate-700">
                            {mat.materialUse ?? "-"}
                          </td>

                          <td className="px-4 py-3 font-semibold text-slate-700">
                            {mat.materialLotNumber || "-"}
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 font-bold text-emerald-700">
                              {mat.materialOk ?? 0}
                            </span>
                          </td>

                          <td className="px-4 py-3 text-center">
                            <span
                              className={`rounded-full border px-2.5 py-1 font-bold ${
                                Number(mat.materialNg || 0) > 0
                                  ? "border-rose-200 bg-rose-50 text-rose-700"
                                  : "border-slate-200 bg-slate-50 text-slate-400"
                              }`}
                            >
                              {mat.materialNg ?? 0}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-4 py-8 text-center text-slate-400"
                        >
                          ไม่พบข้อมูล Material
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function EmbossListPage() {
  const router = useRouter();
  const [productions, setProductions] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  const loadProductions = async () => {
    try {
      setLoading(true);

      const dayDate = getTodayDate();

      const response = await axios.get(
        `${API_BASE_URL}/api/product/record/tracking`,
        {
          params: {
            dayDate,
          },
        },
      );

      const rows = response.data || [];
      const map = new Map();

      rows.forEach((row) => {
        const key = `${row.jobNumber}-${row.partLotNumber}`;

        if (!map.has(key)) {
          map.set(key, {
            key,
            job: row.jobNumber,
            partNo: row.partNo,
            description: row.description,
            color: row.color,
            employeeName: row.employeeName,

            okQty: Number(row.okQty || 0),
            ngQty: Number(row.ngQty || 0),

            partLotNumber: row.partLotNumber || "",

            materials: [],
          });
        }

        const production = map.get(key);

        if (row.materialPartNo) {
          const materialKey = [
            row.materialPartNo,
            row.materialLotNumber,
            row.materialUse,
          ].join("|");

          const exists = production.materials.some(
            (mat) => mat.key === materialKey,
          );

          if (!exists) {
            production.materials.push({
              key: materialKey,

              materialPartNo: row.materialPartNo,
              materialDescription: row.materialDescription,
              materialUse: row.materialUse,
              materialLotNumber: row.materialLotNumber,

              materialOk: Number(row.materialOkQty || 0),
              materialNg: Number(row.materialNgQty || 0),
            });
          }
        }
      });

      setProductions(Array.from(map.values()));
    } catch (error) {
      console.error("โหลด Daily Production ไม่สำเร็จ:", error);

      setProductions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProductions();
  }, []);

  const filteredProductions = useMemo(() => {
    let result = [...productions];

    if (search.trim()) {
      const keyword = search.toLowerCase();

      result = result.filter(
        (item) =>
          (item.job || "").toLowerCase().includes(keyword) ||
          (item.partNo || "").toLowerCase().includes(keyword) ||
          (item.description || "").toLowerCase().includes(keyword) ||
          (item.partLotNumber || "").toLowerCase().includes(keyword) ||
          item.materials?.some(
            (mat) =>
              (mat.materialPartNo || "").toLowerCase().includes(keyword) ||
              (mat.materialDescription || "").toLowerCase().includes(keyword) ||
              (mat.materialLotNumber || "").toLowerCase().includes(keyword),
          ),
      );
    }

    if (status !== "ALL") {
      result = result.filter((item) =>
        item.materials?.some((mat) => {
          if (status === "OK") {
            return Number(mat.materialOk || 0) > 0;
          }

          if (status === "NG") {
            return Number(mat.materialNg || 0) > 0;
          }

          return true;
        }),
      );
    }

    return result;
  }, [productions, search, status]);

  const totalJobs = productions.length;

  const totalOk = productions.reduce(
    (sum, item) => sum + Number(item.okQty || 0),
    0,
  );

  const totalNg = productions.reduce(
    (sum, item) => sum + Number(item.ngQty || 0),
    0,
  );

  const materialNgJobs = productions.filter((item) =>
    item.materials?.some((mat) => Number(mat.materialNg || 0) > 0),
  ).length;

  const goToView = (item) => {
    router.push(
      `/form?job=${encodeURIComponent(item.job)}&mode=view&from=list`,
    );
  };

  const goToEdit = (item) => {
    router.push(
      `/form?job=${encodeURIComponent(item.job)}&mode=edit&from=list`,
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800">
      <Sidebar />

      {/* Header */}
      <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#00B4D8] px-4 py-5 text-white shadow-md">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-4 px-5 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold">รายการผลิตประจำวัน</h1>

            <p className="mt-1 text-xs text-blue-100">
              EMBOSS · Daily Production
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="rounded-xl border border-white/30 bg-white/10 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-white hover:text-blue-900"
            >
              ← กลับหน้า Home
            </button>

            <Link
              href="/form"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-blue-900 shadow-sm transition hover:bg-blue-50 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              สร้างการผลิต
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl space-y-5 px-5 py-5">
        {/* Summary */}
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {/* Job ทั้งหมด */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Job ทั้งหมด
                </p>

                <p className="mt-1 text-2xl font-extrabold text-slate-800">
                  {totalJobs}
                </p>
              </div>

              <div className="rounded-xl bg-slate-100 p-3">
                <ClipboardList className="h-5 w-5 text-slate-600" />
              </div>
            </div>
          </div>

          {/* OK ทั้งหมด */}
          <div className="rounded-2xl border border-emerald-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">OK ทั้งหมด</p>

                <p className="mt-1 text-2xl font-extrabold text-emerald-600">
                  {totalOk.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-emerald-50 p-3">
                <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              </div>
            </div>
          </div>

          {/* NG ทั้งหมด */}
          <div className="rounded-2xl border border-rose-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">NG ทั้งหมด</p>

                <p className="mt-1 text-2xl font-extrabold text-rose-600">
                  {totalNg.toLocaleString()}
                </p>
              </div>

              <div className="rounded-xl bg-rose-50 p-3">
                <Package className="h-5 w-5 text-rose-600" />
              </div>
            </div>
          </div>

          {/* Job ที่ Material NG */}
          <div className="rounded-2xl border border-amber-100 bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Material NG
                </p>

                <p className="mt-1 text-2xl font-extrabold text-amber-600">
                  {materialNgJobs}
                </p>
              </div>

              <div className="rounded-xl bg-amber-50 p-3">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-2 text-sm font-bold text-slate-700">
              <CalendarDays className="h-4 w-4 text-blue-600" />
              การผลิตวันนี้
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ค้นหา Job / Part No. / Lot No. / ชิ้นงาน..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-xs outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100 sm:w-72"
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-700 outline-none focus:border-blue-400"
              >
                <option value="ALL">Material Status ทั้งหมด</option>
                <option value="OK">OK</option>
                <option value="NG">NG</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-blue-900 text-[11px] uppercase tracking-wider text-white">
                  <th className="w-14 px-4 py-3 text-center">ลำดับ</th>
                  <th className="px-4 py-3">Job / Part No.</th>
                  <th className="px-4 py-3">รายละเอียดสินค้า</th>
                  <th className="px-4 py-3">Part Lot No.</th>
                  <th className="px-4 py-3 text-center">ผู้ผลิต</th>
                  <th className="px-4 py-3 text-right">OK</th>
                  <th className="px-4 py-3 text-right">NG</th>
                  <th className="w-24 px-4 py-3 text-center">จัดการ</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredProductions.map((item, index) => (
                  <ProductionRow
                    key={item.key}
                    item={item}
                    index={index}
                    onView={goToView}
                    onEdit={goToEdit}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {filteredProductions.length === 0 && (
            <div className="py-16 text-center">
              <Package className="mx-auto mb-3 h-12 w-12 text-slate-200" />

              <p className="text-sm font-semibold text-slate-400">
                ไม่พบรายการผลิต
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
