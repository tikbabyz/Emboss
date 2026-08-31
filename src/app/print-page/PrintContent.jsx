"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import {
  PDFViewer,
  PDFDownloadLink,
} from "@react-pdf/renderer";
import { ArrowLeft, Download, FileText } from "lucide-react";

import ReportDocument from "../components/ReportDocument";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

function formatTime(value) {
  if (!value) return "-";

  return String(value).slice(0, 5);
}

export default function PrintContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const job = searchParams.get("job");

  const [loading, setLoading] = useState(true);
  const [header, setHeader] = useState({});
  const [rows, setRows] = useState([]);
  const [summary, setSummary] = useState({});
  const [error, setError] = useState("");

  useEffect(() => {
    if (!job) {
      setLoading(false);
      return;
    }

    const loadReport = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await axios.get(
          `${API_BASE_URL}/api/product/report/summary/${encodeURIComponent(job)}`
        );

        const data = response.data;

        const head = data.head || {};
        const fgList = data.fg || [];

        setHeader({
          jobNo: head.jobNumber || job,
          partNo: head.partNo || "",
          description: head.description || "",
          color: head.color || "",

          productionDate: head.recordDate
            ? new Date(head.recordDate).toLocaleDateString("en-GB")
            : "",

          section: "PE ROLL",
          machine: "Emboss Machine",
        });

        const reportRows = fgList.map((fg) => {
          const materials = (fg.materials || []).map(
            (detail, index) => ({
              rawSeq: index + 1,
              partNo: detail.materialPartNo || "",
              name: detail.materialDescription || "",
              qtyUsed: detail.materialUse ?? "",
              lot: detail.materialLotNumber || "",
              rollNumber: detail.rollNumber ?? "",
              judgment:
                detail.judgement === true
                  ? "OK"
                  : detail.judgement === false
                    ? "NG"
                    : "-",
            })
          );

          const machine = fg.machines?.[0] || {};

          return {
            rollNo: fg.rollNo,
            fgThick: fg.thickness,
            fgWidth: fg.width,
            fgLength: fg.length,
            fgDefectQty: fg.productNg,
            fgDefectCause: fg.problemNote || "-",
            fgStartTime: formatTime(fg.startTime),
            fgEndTime: formatTime(fg.finishTime),
            operator: fg.prodName || "-",
            smMaterials: materials,
            machineSetting: {
              productCode: head.partNo || "",
              speed: machine.speed,
              temp1: machine.temperature1,
              temp2: machine.temperature2,
              temp3: machine.temperature3,
              temp4: machine.temperature4,
              temp5: machine.temperature5,
              temp6: machine.temperature6,
              coolWaterTemp: machine.temperatureCooler,
              adhesion: machine.adhesiveCheck,
              remark: machine.remarks,
            },
          };
        });

        setRows(reportRows);

        const totalNg = fgList.reduce(
          (sum, item) => sum + (Number(item.productNg) || 0),
          0
        );
        const totalGood = fgList.reduce(
          (sum, item) => sum + (Number(item.length) || 0),
          0
        );
        const totalProduction = totalGood + totalNg;

        const operatorNames = Array.from(
          new Set(fgList.map((fg) => fg.prodName).filter(Boolean))
        ).join(", ");

        setSummary({
          ngQty: totalNg > 0 ? String(totalNg) : "0",
          goodQty: totalGood > 0 ? String(totalGood) : "0",
          totalQty: totalProduction > 0 ? String(totalProduction) : "0",
          operatorSign: operatorNames || "",
          foremanSign: "",
          managerSign: "",
        });
      } catch (error) {
        console.error("โหลดข้อมูล Report ไม่สำเร็จ:", error);
        setError(
          error.response?.data?.message ||
            "โหลดข้อมูล Report ไม่สำเร็จ"
        );
        setRows([]);
        setSummary({});
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, [job]);

  const handleBack = () => {
    router.push("/tracking");
  };

  if (!job) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <FileText className="h-12 w-12 text-slate-300" />
        <p className="text-slate-500">ไม่พบ Job</p>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปหน้า Tracking
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-blue-900" />
          <p className="text-sm text-slate-500">กำลังโหลด Report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4 bg-slate-50">
        <p className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          กลับไปหน้า Tracking
        </button>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-100">
      {/* Toolbar */}
      <div className="flex items-center justify-between border-b bg-white px-5 py-3 shadow-sm">
        <div className="flex items-center gap-4">
          <button
            onClick={handleBack}
            className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 transition hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            กลับ
          </button>

          <div className="h-8 w-px bg-slate-200" />

          <div>
            <p className="font-bold text-slate-800">
              EMBOSS Production Report
            </p>
            <p className="text-xs text-slate-500">
              Job: <span className="font-medium text-slate-700">{job}</span>
            </p>
          </div>
        </div>

        <PDFDownloadLink
          document={
            <ReportDocument
              header={header}
              rows={rows}
              summary={summary}
            />
          }
          fileName={`EMBOSS_${job}_${header.partNo}.pdf`}
          className="flex items-center gap-2 rounded-lg bg-blue-900 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-blue-800"
        >
          {({ loading }) => (
            <>
              <Download className="h-4 w-4" />
              {loading ? "กำลังสร้าง PDF..." : "Download PDF"}
            </>
          )}
        </PDFDownloadLink>
      </div>

      {/* PDF Preview */}
      <div className="flex-1">
        <PDFViewer
          width="100%"
          height="100%"
          showToolbar
        >
          <ReportDocument
            header={header}
            rows={rows}
            summary={summary}
          />
        </PDFViewer>
      </div>
    </div>
  );
}