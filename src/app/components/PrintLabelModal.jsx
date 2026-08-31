"use client";

import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { PDFDownloadLink, pdf } from "@react-pdf/renderer";
import {
  Tag,
  X,
  Search,
  Printer,
  Download,
  Loader2,
  AlertCircle,
  CheckCircle2,
  FileText,
  Copy,
  Layers,
  ArrowRight,
} from "lucide-react";
import JobLabelDocument from "./JobLabelDocument";
import createQRCodeDataURL from "../lib/qr-generator";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export default function PrintLabelModal({ isOpen, onClose, initialJobNo = "" }) {
  const [jobNo, setJobNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [tagData, setTagData] = useState(null);
  const [allRollsData, setAllRollsData] = useState([]);

  // Selection
  const [selectedMode, setSelectedMode] = useState("all"); // 'all' | 'specific'
  const [selectedRolls, setSelectedRolls] = useState([]); // array of roll numbers (numbers)
  const [copies, setCopies] = useState(1);

  // QR Code preview cache
  const [qrCodeUrl, setQrCodeUrl] = useState("");
  const [isPrinting, setIsPrinting] = useState(false);

  const inputRef = useRef(null);

  // When modal opens or initialJobNo changes
  useEffect(() => {
    if (isOpen) {
      setError("");
      if (initialJobNo) {
        setJobNo(initialJobNo);
        fetchJobTag(initialJobNo);
      } else {
        setJobNo("");
        setTagData(null);
        setAllRollsData([]);
        setSelectedRolls([]);
        setTimeout(() => inputRef.current?.focus(), 150);
      }
    } else {
      setTagData(null);
      setError("");
      setAllRollsData([]);
    }
  }, [isOpen, initialJobNo]);

  const fetchJobTag = async (targetJob) => {
    const cleanJob = String(targetJob || "").trim();
    if (!cleanJob) return;

    try {
      setLoading(true);
      setError("");

      if (!API_BASE_URL) {
        throw new Error("NEXT_PUBLIC_API_URL is not defined");
      }

      // 1. Fetch primary tag info from the tag endpoint
      let data = null;
      try {
        const res = await axios.get(
          `${API_BASE_URL}/api/product/tag/${encodeURIComponent(cleanJob)}`
        );
        data = res.data;
      } catch (firstErr) {
        // Fallback endpoint if needed
        try {
          const fallbackRes = await axios.get(
            `${API_BASE_URL}/api/emboss/tag/${encodeURIComponent(cleanJob)}`
          );
          data = fallbackRes.data;
        } catch {
          throw firstErr;
        }
      }

      if (!data) {
        setError(`ไม่พบข้อมูล Job Tag สำหรับ: ${cleanJob}`);
        setTagData(null);
        return;
      }

      setTagData(data);

      // 2. Fetch full report rows to get all rolls details if available
      let rollsList = [];
      try {
        const summaryRes = await axios.get(
          `${API_BASE_URL}/api/product/report/summary/${encodeURIComponent(cleanJob)}`
        );
        const fgList = summaryRes.data?.fg || [];
        if (Array.isArray(fgList) && fgList.length > 0) {
          rollsList = fgList.map((fg, i) => ({
            roll: Number(fg.rollNo || i + 1),
            productGood: fg.length ?? data.qty ?? 0,
            lotNo: data.lotNo,
            partNo: data.partNo,
            description: data.description,
            job: data.job,
          }));
        }
      } catch {
        // Ignore summary error and fallback to min/max roll range
      }

      // Fallback: create array from minRoll to maxRoll
      if (rollsList.length === 0) {
        const min = parseInt(data.minRoll, 10) || 1;
        const max =
          parseInt(data.maxRoll, 10) ||
          parseInt(data.totalRolls, 10) ||
          parseInt(data.rollNo, 10) ||
          1;
        for (let r = min; r <= max; r++) {
          rollsList.push({
            roll: r,
            productGood: data.qty,
            lotNo: data.lotNo,
            partNo: data.partNo,
            description: data.description,
            job: data.job,
          });
        }
      }

      setAllRollsData(rollsList);
      // Select all rolls by default
      setSelectedRolls(rollsList.map((r) => r.roll));

      // Generate preview QR code
      const maxLabel =
        data.maxRoll || data.totalRolls || rollsList.length || 1;
      const previewRoll = data.rollNo || (rollsList[0] ? rollsList[0].roll : 1);
      const qrPayload = `${data.job}|${data.partNo}|${data.lotNo}|${previewRoll}|${maxLabel}|EMBOSS|`;
      const qrDataUrl = createQRCodeDataURL(qrPayload, 180);
      setQrCodeUrl(qrDataUrl);
    } catch (err) {
      console.error("Fetch Tag Error:", err);
      setError(
        err.response?.data?.message ||
          `ไม่สามารถดึงข้อมูล Job: ${cleanJob} ได้`
      );
      setTagData(null);
      setAllRollsData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e?.preventDefault();
    fetchJobTag(jobNo);
  };

  // Toggle single roll selection
  const toggleRoll = (rollNumber) => {
    setSelectedRolls((prev) =>
      prev.includes(rollNumber)
        ? prev.filter((r) => r !== rollNumber)
        : [...prev, rollNumber].sort((a, b) => a - b)
    );
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (selectedRolls.length === allRollsData.length) {
      setSelectedRolls([]);
    } else {
      setSelectedRolls(allRollsData.map((r) => r.roll));
    }
  };

  // Prepare label items array for PDF generation
  const printableItems = useMemo(() => {
    if (!tagData || allRollsData.length === 0) return [];

    const targetRolls =
      selectedMode === "all"
        ? allRollsData
        : allRollsData.filter((r) => selectedRolls.includes(r.roll));

    const maxLabel =
      tagData.maxRoll || tagData.totalRolls || allRollsData.length || 1;

    const items = [];
    targetRolls.forEach((r) => {
      const qrPayload = `${tagData.job}|${tagData.partNo}|${tagData.lotNo}|${r.roll}|${maxLabel}|EMBOSS|`;
      const qr = createQRCodeDataURL(qrPayload, 180);
      for (let c = 0; c < Math.max(1, copies); c++) {
        items.push({
          data: {
            job: tagData.job,
            partNo: tagData.partNo,
            description: tagData.description,
            lotNo: tagData.lotNo,
            qty: r.productGood || tagData.qty,
            rollNo: r.roll,
            totalRolls: maxLabel,
          },
          qrCodeUrl: qr,
        });
      }
    });

    return items;
  }, [tagData, allRollsData, selectedMode, selectedRolls, copies]);

  // Direct print via blob URL & iframe
  const handleDirectPrint = async () => {
    if (printableItems.length === 0) return;
    try {
      setIsPrinting(true);
      const doc = <JobLabelDocument items={printableItems} />;
      const blob = await pdf(doc).toBlob();
      const blobUrl = URL.createObjectURL(blob);

      // Open hidden iframe for direct print
      const iframe = document.createElement("iframe");
      iframe.style.position = "fixed";
      iframe.style.right = "0";
      iframe.style.bottom = "0";
      iframe.style.width = "0";
      iframe.style.height = "0";
      iframe.style.border = "0";
      iframe.src = blobUrl;
      document.body.appendChild(iframe);

      iframe.onload = () => {
        setTimeout(() => {
          iframe.contentWindow?.focus();
          iframe.contentWindow?.print();
          setTimeout(() => {
            document.body.removeChild(iframe);
            URL.revokeObjectURL(blobUrl);
          }, 60000);
        }, 300);
      };
    } catch (err) {
      console.error("Direct print failed:", err);
      // Fallback: open in new tab
      const doc = <JobLabelDocument items={printableItems} />;
      const blob = await pdf(doc).toBlob();
      const blobUrl = URL.createObjectURL(blob);
      window.open(blobUrl, "_blank");
    } finally {
      setIsPrinting(false);
    }
  };

  if (!isOpen) return null;

  const totalMaxRoll =
    tagData?.maxRoll || tagData?.totalRolls || allRollsData.length || 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs transition-opacity animate-fade-in">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-sky-100 flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-sky-50 via-white to-blue-50/50 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-md shadow-sky-200">
              <Tag className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                พิมพ์ฉลากสินค้า (Print Roll Label)
              </h2>
              <p className="text-xs text-slate-500">
                สติ๊กเกอร์ขนาด 100 x 45 มม. สำหรับติดม้วน EMBOSS
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          
          {/* Search Job Number Form */}
          <form onSubmit={handleSearchSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input
                ref={inputRef}
                type="text"
                value={jobNo}
                onChange={(e) => setJobNo(e.target.value)}
                placeholder="กรอก Job No. (เช่น 260829001)"
                className="w-full rounded-2xl border border-sky-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 outline-none transition-all focus:border-sky-500 focus:ring-3 focus:ring-sky-100"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !jobNo.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowRight className="h-4 w-4" />
              )}
              ค้นหา
            </button>
          </form>

          {/* Error Message */}
          {error && (
            <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700 flex items-center gap-2.5">
              <AlertCircle className="h-5 w-5 text-rose-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex flex-col items-center justify-center py-10 text-slate-400">
              <Loader2 className="h-8 w-8 text-sky-500 animate-spin mb-2" />
              <p className="text-sm">กำลังโหลดข้อมูล Tag...</p>
            </div>
          )}

          {/* Content When Tag Data is Loaded */}
          {!loading && tagData && (
            <div className="space-y-5 animate-fade-in">
              
              {/* Job Summary Banner */}
              <div className="rounded-2xl border border-sky-100 bg-sky-50/50 p-4 text-xs sm:text-sm">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Job No.</span>
                    <span className="font-bold text-sky-900">{tagData.job}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Part No.</span>
                    <span className="font-bold text-slate-800">{tagData.partNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Lot No. (Date)</span>
                    <span className="font-semibold text-slate-700">{tagData.lotNo}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">จำนวนม้วนทั้งหมด</span>
                    <span className="font-bold text-emerald-600">{allRollsData.length} ม้วน</span>
                  </div>
                </div>
                <div className="mt-2 pt-2 border-t border-sky-100 text-slate-600">
                  <span className="text-slate-400 text-[11px] block">Description</span>
                  <span className="font-medium text-slate-800">{tagData.description}</span>
                </div>
              </div>

              {/* Tag Preview Box (100 x 45 mm simulated look) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    ตัวอย่างฉลาก (Sticker Preview 100 x 45 mm)
                  </span>
                  <span className="text-[11px] text-slate-400">
                    ขนาดสติ๊กเกอร์ 100 x 45 มม.
                  </span>
                </div>

                <div className="flex justify-center p-3 bg-slate-100 rounded-2xl border border-slate-200">
                  <div className="w-[320px] bg-white border-2 border-black flex text-black font-sans shadow-md">
                    {/* Left Section: QR Code + Roll Box */}
                    <div className="w-[95px] border-r-2 border-black flex flex-col bg-white">
                      <div className="flex-1 flex items-center justify-center p-1.5 min-h-[82px]">
                        {qrCodeUrl ? (
                          <img
                            src={qrCodeUrl}
                            alt="QR Code"
                            className="w-[76px] h-[76px] object-contain"
                          />
                        ) : (
                          <div className="text-[10px] text-slate-400">QR Code</div>
                        )}
                      </div>
                      <div className="h-[22px] border-t-2 border-black flex items-center justify-center font-bold text-[10px] bg-white">
                        Roll : {tagData.rollNo || 1}/{totalMaxRoll}
                      </div>
                    </div>

                    {/* Right Section: 5 Data Rows */}
                    <div className="flex-1 flex flex-col text-[10px]">
                      {/* Row 1: Job */}
                      <div className="h-[20px] border-b border-black flex font-bold">
                        <div className="w-[66px] border-r border-black flex items-center px-1.5">
                          Job :
                        </div>
                        <div className="flex-1 flex items-center px-1.5 truncate text-[9.5px]">
                          {tagData.job}
                        </div>
                      </div>

                      {/* Row 2: Part No. */}
                      <div className="h-[20px] border-b border-black flex font-bold">
                        <div className="w-[66px] border-r border-black flex items-center px-1.5">
                          Part No. :
                        </div>
                        <div className="flex-1 flex items-center px-1.5 truncate text-[9.5px]">
                          {tagData.partNo}
                        </div>
                      </div>

                      {/* Row 3: Description */}
                      <div className="h-[38px] border-b border-black flex font-bold">
                        <div className="w-[66px] border-r border-black flex items-center px-1.5 leading-tight">
                          Description :
                        </div>
                        <div className="flex-1 flex items-center px-1.5 text-[8.5px] leading-tight line-clamp-2">
                          {tagData.description}
                        </div>
                      </div>

                      {/* Row 4: Lot No. */}
                      <div className="h-[20px] border-b border-black flex font-bold">
                        <div className="w-[66px] border-r border-black flex items-center px-1.5">
                          Lot No. :
                        </div>
                        <div className="flex-1 flex items-center px-1.5 text-[9.5px]">
                          {tagData.lotNo}
                        </div>
                      </div>

                      {/* Row 5: Qty */}
                      <div className="h-[20px] flex font-bold">
                        <div className="w-[66px] border-r border-black flex items-center px-1.5">
                          Qty :
                        </div>
                        <div className="flex-1 flex items-center px-1.5 text-[9.5px]">
                          {tagData.qty} M.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Options: Mode Selection */}
              <div className="space-y-3 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-600">
                    เลือกม้วนที่ต้องการพิมพ์:
                  </span>

                  <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs">
                    <button
                      type="button"
                      onClick={() => setSelectedMode("all")}
                      className={`rounded-lg px-3 py-1 font-medium transition-all ${
                        selectedMode === "all"
                          ? "bg-white text-sky-700 shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      พิมพ์ทุกม้วน ({allRollsData.length})
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedMode("specific")}
                      className={`rounded-lg px-3 py-1 font-medium transition-all ${
                        selectedMode === "specific"
                          ? "bg-white text-sky-700 shadow-xs font-bold"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      เลือกเฉพาะม้วน
                    </button>
                  </div>
                </div>

                {/* Specific Roll Checkboxes */}
                {selectedMode === "specific" && (
                  <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-3 space-y-2">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 text-xs">
                      <span className="text-slate-500 font-medium">
                        เลือกม้วน ({selectedRolls.length}/{allRollsData.length} ม้วน)
                      </span>
                      <button
                        type="button"
                        onClick={toggleSelectAll}
                        className="text-sky-600 font-semibold hover:underline"
                      >
                        {selectedRolls.length === allRollsData.length
                          ? "ยกเลิกทั้งหมด"
                          : "เลือกทั้งหมด"}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-36 overflow-y-auto pr-1">
                      {allRollsData.map((item) => {
                        const isChecked = selectedRolls.includes(item.roll);
                        return (
                          <label
                            key={item.roll}
                            className={`flex items-center gap-2 rounded-xl border p-2 text-xs font-medium cursor-pointer transition-all ${
                              isChecked
                                ? "border-sky-400 bg-sky-50 text-sky-900 shadow-xs"
                                : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleRoll(item.roll)}
                              className="rounded text-sky-600 focus:ring-sky-400"
                            />
                            <span>Roll {item.roll}</span>
                            <span className="ml-auto text-[10px] text-slate-400">
                              {item.productGood}M
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Copies Per Label */}
                <div className="flex items-center justify-between pt-2 text-xs sm:text-sm">
                  <span className="text-slate-600 font-medium">
                    จำนวนพิมพ์ต่อม้วน:
                  </span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setCopies(num)}
                        className={`h-8 w-12 rounded-xl border text-xs font-bold transition-all ${
                          copies === num
                            ? "border-sky-600 bg-sky-600 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {num} แผ่น
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            ปิด
          </button>

          <div className="flex items-center gap-2">
            {tagData && printableItems.length > 0 && (
              <>
                {/* Download PDF button */}
                <PDFDownloadLink
                  document={<JobLabelDocument items={printableItems} />}
                  fileName={`Tag_Emboss_${tagData.job}_${tagData.partNo}.pdf`}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm font-semibold text-sky-700 hover:bg-sky-100 transition-colors"
                >
                  {({ loading: pdfLoading }) => (
                    <>
                      {pdfLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Download className="h-4 w-4" />
                      )}
                      <span>โหลด PDF</span>
                    </>
                  )}
                </PDFDownloadLink>

                {/* Direct Print Button */}
                <button
                  type="button"
                  onClick={handleDirectPrint}
                  disabled={isPrinting}
                  className="inline-flex items-center gap-2 rounded-xl bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-sky-200 hover:bg-sky-700 disabled:opacity-50 transition-all cursor-pointer"
                >
                  {isPrinting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Printer className="h-4 w-4" />
                  )}
                  <span>พิมพ์ฉลาก ({printableItems.length} ดวง)</span>
                </button>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
