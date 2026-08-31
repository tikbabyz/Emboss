"use client";
import React, {
  Suspense,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import Link from "next/link";
import axios from "axios";
import AppNavbar from "../components/AppNavbar";
import {
  Save,
  Pencil,
  ScanBarcode,
  Thermometer,
  CirclePile,
  BrickWall,
  LoaderCircle,
} from "lucide-react";
import { getSession } from "../lib/auth";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useSearchParams } from "next/navigation";

const TEMP_STD = 390;
const THICKNESS_SPEC = { min: 5, max: 6 };
const WIDTH_SPEC_TOLERANCE = { minus: 0, plus: 50 };
const LENGTH_SPEC_TOLERANCE = { minus: 0, plus: 5 };
const TODAY = new Date().toISOString().split("T")[0];
const LS_KEY = "emboss_records";
const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");
const PRODUCT_API = `${API_BASE_URL}/api/Product`;
const PRODUCT_API_ROUTES = {
  product: `${PRODUCT_API}/records/product`,
  fg: `${PRODUCT_API}/records/fg`,
  rawMaterial: `${PRODUCT_API}/records/rawmaterial`,
  machine: `${PRODUCT_API}/records/machine`,
};

// ─────────────────────────────────────────────────────────────────────────
const PRODUCT_API_UPDATE_ROUTES = {
  fg: (jobNumber, rollNumber) =>
    `${PRODUCT_API_ROUTES.fg}/${encodeURIComponent(jobNumber)}/${rollNumber}`,

  rawMaterial: (jobNumber, rollNumber, partNoMaterial) =>
    `${PRODUCT_API_ROUTES.rawMaterial}/${encodeURIComponent(jobNumber)}/${rollNumber}/${encodeURIComponent(partNoMaterial)}`,

  machine: (jobNumber, rollNumber) =>
    `${PRODUCT_API_ROUTES.machine}/${encodeURIComponent(jobNumber)}/${rollNumber}`,
};

const toInt = (value) => {
  const parsed = parseInt(String(value ?? "").replace(/[^0-9-]/g, ""), 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

const toFloat = (value) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const getTempClass = (val) => {
  if (val === "" || val === null || val === undefined)
    return "bg-white border-slate-300 text-slate-800";
  if (Number(val) !== TEMP_STD)
    return "bg-rose-100 border-rose-500 text-rose-900 font-black";
  return "bg-emerald-50 border-emerald-400 text-emerald-900 font-bold";
};

const parseSpecNum = (val) => {
  if (val === "" || val === null || val === undefined) return NaN;
  const clean = String(val).replace(/,/g, "").trim();
  const num = parseFloat(clean);
  return Number.isFinite(num) ? num : NaN;
};

const isThicknessOutOfSpec = (value) => {
  const num = parseSpecNum(value);
  if (Number.isNaN(num)) return false;
  return num < THICKNESS_SPEC.min || num > THICKNESS_SPEC.max;
};

const isWidthOutOfSpec = (value, stdWidth) => {
  const num = parseSpecNum(value);
  const std = parseSpecNum(stdWidth);
  if (Number.isNaN(num) || Number.isNaN(std) || std <= 0) return false;
  return (
    num < std - WIDTH_SPEC_TOLERANCE.minus ||
    num > std + WIDTH_SPEC_TOLERANCE.plus
  );
};

const isLengthOutOfSpec = (value, stdLength) => {
  const num = parseSpecNum(value);
  const std = parseSpecNum(stdLength);
  if (Number.isNaN(num) || Number.isNaN(std) || std <= 0) return false;
  return (
    num < std - LENGTH_SPEC_TOLERANCE.minus ||
    num > std + LENGTH_SPEC_TOLERANCE.plus
  );
};

const parseTime = (t) => {
  const parts = String(t || "")
    .replace(":", ".")
    .split(".");
  return parseInt(parts[0] || 0) * 60 + parseInt(parts[1] || 0);
};

const splitTimeValue = (timeValue) => {
  if (!timeValue) return { hh: "", mm: "" };
  const [hh = "", mm = ""] = String(timeValue).split(":");
  return {
    hh: hh.replace(/\D/g, "").slice(0, 2),
    mm: mm.replace(/\D/g, "").slice(0, 2),
  };
};

const normalizeTimeForInput = (value) => {
  if (!value) return "";

  const text = String(value);
  const match = text.match(/(\d{1,2}):(\d{2})/);

  if (!match) return "";

  return `${String(match[1]).padStart(2, "0")}:${match[2]}`;
};

const HHMMInput = React.forwardRef(
  ({ value, onChange, disabled, containerClassName, inputClassName }, ref) => {
    const hhRef = useRef(null);
    const mmRef = useRef(null);
    const { hh, mm } = splitTimeValue(value);

    const defaultContainerClassName =
      "flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-400 transition-colors";
    const defaultInputClassName =
      "w-9 bg-transparent px-0 py-1.5 text-center text-xs font-mono text-slate-700 outline-none placeholder-slate-400 disabled:text-slate-500";

    useImperativeHandle(ref, () => ({
      focusHH: () => {
        hhRef.current?.focus();
        hhRef.current?.select();
      },
    }));

    const emitTime = (nextHh, nextMm) => {
      if (!nextHh && !nextMm) {
        onChange?.("");
        return;
      }
      onChange?.(`${nextHh}:${nextMm}`);
    };

    const handleHHChange = (e) => {
      const nextHh = e.target.value.replace(/\D/g, "").slice(0, 2);
      emitTime(nextHh, mm);

      if (nextHh.length === 2) {
        mmRef.current?.focus();
        mmRef.current?.select();
      }
    };

    const handleMMChange = (e) => {
      const nextMm = e.target.value.replace(/\D/g, "").slice(0, 2);
      emitTime(hh, nextMm);
    };

    const handleMMKeyDown = (e) => {
      if (e.key === "Backspace" && mm.length === 0) {
        hhRef.current?.focus();
        hhRef.current?.select();
      }
    };

    return (
      <div
        className={`${containerClassName || defaultContainerClassName} ${
          disabled ? "bg-slate-100 border-slate-300" : ""
        }`}
      >
        <input
          ref={hhRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="HH"
          value={hh}
          onChange={handleHHChange}
          disabled={disabled}
          className={inputClassName || defaultInputClassName}
        />
        <span className="select-none px-0.5 font-bold text-slate-500">:</span>
        <input
          ref={mmRef}
          type="text"
          inputMode="numeric"
          maxLength={2}
          placeholder="MM"
          value={mm}
          onChange={handleMMChange}
          onKeyDown={handleMMKeyDown}
          disabled={disabled}
          className={inputClassName || defaultInputClassName}
        />
      </div>
    );
  },
);

HHMMInput.displayName = "HHMMInput";

const toTimeOnlyString = (t) => {
  const [rawH, rawM] = String(t || "").split(":");
  const h = String(Math.max(0, Math.min(23, Number(rawH) || 0))).padStart(
    2,
    "0",
  );
  const m = String(Math.max(0, Math.min(59, Number(rawM) || 0))).padStart(
    2,
    "0",
  );
  return `${h}:${m}:00`;
};

const minutesToTimeOnly = (minutesValue) => {
  const totalMinutes = Math.max(0, Number(minutesValue) || 0);
  const hours = Math.floor(totalMinutes / 60) % 24;
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:00`;
};

const EMPTY_FORM = () => ({
  JobNumber: "",
  PartNo: "",
  Description: "",
  Color: "",
  stdThickness: "",
  stdWidth: "",
  stdLength: "",
  Thickness: "",
  Width: "",
  Length: "",
  ProductQty: 0,
  OkQty: 0,
  NgQty: 0,
  ProblemNote: "-",
  StartTime: "",
  FinishTime: "",
  TotalTime: "",
  ProductCode: "",
  LotNumber: TODAY,
  PartNoMaterial: "",
  DescriptionMaterial: "",
  MaterialUse: "",
  LotNumberMaterial: TODAY,
  RollNumber: "",
  Speed: "",
  Temperature1: String(TEMP_STD),
  Temperature2: String(TEMP_STD),
  Temperature3: String(TEMP_STD),
  Temperature4: String(TEMP_STD),
  Temperature5: String(TEMP_STD),
  Temperature6: String(TEMP_STD),
  TemperatureCooler: "",
  AdhesiveCheck: "OK",
  Remarks: "",
});

let inspectionRowSeed = 1;

// แต่ละแถว = ม้วนที่ผลิต 1 ม้วน แบ่งเป็น 2 ส่วน:
// - FG Part: ข้อมูลชิ้นงานที่ผลิตได้ (เวลาเริ่ม/หนา/กว้าง/ยาว/งานเสีย/สาเหตุ/เวลาสิ้นสุด)
// - SM Part: ข้อมูลวัตถุดิบที่ใช้ (จำนวนที่ใช้/Lot/Roll Number/ผลตรวจ OK-NG)
//
// status: "new" -> ยังไม่เคยบันทึก (กดปุ่ม "บันทึก" -> POST -> "locked")
//         "locked" -> บันทึกแล้ว, ช่องกรอกถูกล็อก (กดปุ่ม "แก้ไข" -> "editing")
//         "editing" -> ปลดล็อกให้แก้ไข (กดปุ่ม "อัพเดท" -> PUT -> "locked")
const createInspectionRow = () => ({
  id: inspectionRowSeed++,
  status: "new",
  // FG Part
  startTime: "",
  thickness: "",
  width: "",
  length: "",
  defectQty: "",
  reason: "",
  finishTime: "",
  prodName: "",
  // SM Part
  materials: [],
  // Machine Part
  machine: null,
});

// ─── HeaderSelect: Custom dropdown ใน header bar (smooth, no native select) ────
function HeaderSelect({ value, onChange, options, disabled = false }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
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
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
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
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors
              ${
                value === opt.value
                  ? "bg-blue-50 text-blue-700 font-semibold"
                  : "text-slate-700 hover:bg-slate-50"
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── FormSelect: Custom dropdown ใน form body (white card style) ───────────
function FormSelect({ value, onChange, options, colorMap, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((o) => o.value === value);
  const triggerCls =
    colorMap?.[value] ?? "bg-slate-50 border-slate-200 text-slate-800";

  return (
    <div ref={ref} className="relative w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => {
          if (!disabled) {
            setOpen((v) => !v);
          }
        }}
        className={`w-full flex items-center justify-between px-3 py-2 border rounded-lg text-sm  focus:outline-none transition-colors ${triggerCls} ${
          disabled ? "opacity-60 cursor-not-allowed" : ""
        }`}
      >
        <span>{selected?.label ?? value}</span>
        <svg
          className={`w-3.5 h-3.5 shrink-0 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2.5}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
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
            onClick={() => {
              onChange(opt.value);
              setOpen(false);
            }}
            className={`w-full text-left px-3 py-2 text-sm transition-colors flex items-center gap-2
              ${value === opt.value ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-700 hover:bg-slate-50"}`}
          >
            {colorMap && (
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${opt.dot ?? "bg-slate-300"}`}
              />
            )}
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const normalizeBomRows = (rows = []) => {
  return rows
    .map((row, index) => {
      const materialItem =
        row?.MaterialItem ??
        row?.materialItem ??
        row?.PartNoMaterial ??
        row?.partNoMaterial ??
        "";
      const materialDescription =
        row?.MaterialDescription ??
        row?.materialDescription ??
        row?.DescriptionMaterial ??
        row?.descriptionMaterial ??
        "";
      const materialColor = row?.MaterialColor ?? row?.materialColor ?? "";
      const materialThickness = row?.Thickness ?? row?.thickness ?? "";
      const materialWidth = row?.Width ?? row?.width ?? "";
      const materialLength = row?.Length ?? row?.length ?? "";
      const matlQty = Number(
        row?.MatlQty ??
          row?.matlQty ??
          row?.MaterialUse ??
          row?.materialUse ??
          0,
      );
      const sequence = Number(row?.Sequence ?? row?.sequence ?? index + 1);
      const operateNumber = Number(
        row?.OperateNumber ??
          row?.operateNumber ??
          row?.OperNum ??
          row?.operNum ??
          0,
      );

      return {
        materialItem: String(materialItem || ""),
        materialDescription: String(materialDescription || ""),
        materialColor: String(materialColor || ""),
        materialThickness: String(materialThickness ?? ""),
        materialWidth: String(materialWidth ?? ""),
        materialLength: String(materialLength ?? ""),
        matlQty: Number.isNaN(matlQty) ? 0 : matlQty,
        sequence: Number.isNaN(sequence) ? index + 1 : sequence,
        operateNumber: Number.isNaN(operateNumber) ? 0 : operateNumber,
        lotNumber: row?.LotNumberMaterial ?? row?.lotNumberMaterial ?? TODAY,
        rollNumber: row?.RollNumber ?? row?.rollNumber ?? "",
        // ผลตรวจวัตถุดิบต่อรายการ (OK / NG) — แก้ไขได้โดยพนักงาน
        status:
          row?.status ??
          (typeof row?.Judgement === "boolean"
            ? row.Judgement
              ? "OK"
              : "NG"
            : "OK"),
      };
    })
    .filter((row) => row.materialItem || row.materialDescription);
};

function EmbossFormContent() {
  const [form, setForm] = useState(EMPTY_FORM());
  const [header, setHeader] = useState({
    reportDate: TODAY,
    shift: "Day",
    machineNo: "EMBOSS-01",
    employeeId: "",
    employeeName: "",
  });
  const [recordCount, setRecordCount] = useState(0);
  const [jobLoading, setJobLoading] = useState(false);
  const [bomLoading, setBomLoading] = useState(false);
  const [rawMaterials, setRawMaterials] = useState([]);
  const [inspectionRows, setInspectionRows] = useState([createInspectionRow()]);
  const jobRef = useRef(null);
  const latestJobRequestedRef = useRef("");
  const latestBomRequestedRef = useRef("");

  const searchParams = useSearchParams();

  const job = searchParams.get("job");
  const mode = searchParams.get("mode");
  const from = searchParams.get("from");

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";

  const backHref = from === "tracking" ? "/tracking" : "/emboss-list";

  useEffect(() => {
    queueMicrotask(() => {
      const session = getSession();
      setHeader((prev) => ({
        ...prev,
        employeeId: String(session?.employeeId || ""),
        employeeName:
          `${session?.firstName || ""} ${session?.lastName || ""}`.trim(),
      }));

      try {
        const stored = localStorage.getItem(LS_KEY);
        if (!stored) {
          setRecordCount(0);
          return;
        }
        const parsed = JSON.parse(stored);
        setRecordCount(Array.isArray(parsed) ? parsed.length : 0);
      } catch {
        setRecordCount(0);
      }
    });
  }, []);

  const loadProductByJob = async (jobNumber) => {
    if (!jobNumber) return;

    try {
      const response = await axios.get(
        `${PRODUCT_API}/get/job/${encodeURIComponent(jobNumber)}`,
      );

      const data = response.data;

      const head = data?.HEAD ?? data?.Head ?? data?.head ?? null;

      const fgRows = data?.FG ?? data?.Fg ?? data?.fg ?? [];

      if (!head) {
        toast.error(`ไม่พบข้อมูล Job ${jobNumber}`);
        return;
      }

      const partNo = head.PartNo ?? head.partNo ?? "";

      // HEAD
      setForm((prev) => ({
        ...prev,
        JobNumber: head.JobNumber ?? head.jobNumber ?? jobNumber,

        PartNo: partNo,

        Description: head.Description ?? head.description ?? "",

        Color: head.Color ?? head.color ?? "",

        stdThickness: String(
          head.Thickness ?? head.thickness ?? prev.stdThickness ?? "",
        ),

        stdWidth: String(head.Width ?? head.width ?? prev.stdWidth ?? ""),

        stdLength: String(head.Length ?? head.length ?? prev.stdLength ?? ""),
      }));

      const allMachines =
        data?.MACHINE ?? data?.Machine ?? data?.machine ?? [];

      // Machine Setting (if available)
      const firstMachine =
        fgRows[0]?.Machines?.[0] ??
        fgRows[0]?.machines?.[0] ??
        (Array.isArray(allMachines) ? allMachines[0] : allMachines) ??
        null;

      if (firstMachine) {
        setForm((prev) => ({
          ...prev,
          Speed: String(
            firstMachine.Speed ?? firstMachine.speed ?? prev.Speed ?? "",
          ),
          Temperature1: String(
            firstMachine.Temperature1 ??
              firstMachine.temperature1 ??
              prev.Temperature1 ??
              TEMP_STD,
          ),
          Temperature2: String(
            firstMachine.Temperature2 ??
              firstMachine.temperature2 ??
              prev.Temperature2 ??
              TEMP_STD,
          ),
          Temperature3: String(
            firstMachine.Temperature3 ??
              firstMachine.temperature3 ??
              prev.Temperature3 ??
              TEMP_STD,
          ),
          Temperature4: String(
            firstMachine.Temperature4 ??
              firstMachine.temperature4 ??
              prev.Temperature4 ??
              TEMP_STD,
          ),
          Temperature5: String(
            firstMachine.Temperature5 ??
              firstMachine.temperature5 ??
              prev.Temperature5 ??
              TEMP_STD,
          ),
          Temperature6: String(
            firstMachine.Temperature6 ??
              firstMachine.temperature6 ??
              prev.Temperature6 ??
              TEMP_STD,
          ),
          TemperatureCooler: String(
            firstMachine.TemperatureCooler ??
              firstMachine.temperatureCooler ??
              prev.TemperatureCooler ??
              "",
          ),
          AdhesiveCheck:
            firstMachine.AdhesiveCheck ??
            firstMachine.adhesiveCheck ??
            prev.AdhesiveCheck ??
            "OK",
          Remarks:
            firstMachine.Remarks ?? firstMachine.remarks ?? prev.Remarks ?? "",
        }));
      }

      // BOM
      if (partNo) {
        try {
          const bomResponse = await axios.get(
            `${API_BASE_URL}/api/jobs/bom/${encodeURIComponent(partNo)}`,
          );

          const bomPayload = Array.isArray(bomResponse.data)
            ? bomResponse.data
            : bomResponse.data
              ? [bomResponse.data]
              : [];

          const bomMaterials = normalizeBomRows(bomPayload);

          setRawMaterials(bomMaterials);
          syncFirstRawMaterialToForm(bomMaterials);
        } catch (error) {
          console.error("Load BOM error:", error);
          setRawMaterials([]);
        }
      }

      // FG + Materials + Machines ที่ Backend จัดมาให้แล้ว
      const rows = fgRows.map((fg, index) => {
        const rollNo = fg.RollNo ?? fg.rollNo ?? index + 1;
        const rollNoNum = Number(rollNo);

        const materials = fg.Materials ?? fg.materials ?? [];

        const rollMachine =
          fg.Machines?.[0] ??
          fg.machines?.[0] ??
          (Array.isArray(allMachines)
            ? allMachines.find(
                (m) =>
                  Number(
                    m.FgRoll ??
                      m.fgRoll ??
                      m.RollNo ??
                      m.rollNo ??
                      m.RollNumber ??
                      m.rollNumber,
                  ) === rollNoNum,
              )
            : null) ??
          null;

        return {
          id: inspectionRowSeed++,
          rollNumber: rollNoNum,
          status: "locked",

          startTime: normalizeTimeForInput(fg.StartTime ?? fg.startTime),

          thickness: String(fg.Thickness ?? fg.thickness ?? ""),

          width: String(fg.Width ?? fg.width ?? ""),

          length: String(fg.Length ?? fg.length ?? ""),

          defectQty: String(fg.ProductNg ?? fg.productNg ?? ""),

          reason: fg.ProblemNote ?? fg.problemNote ?? "",

          finishTime: normalizeTimeForInput(fg.FinishTime ?? fg.finishTime),

          prodName: fg.ProdName ?? fg.prodName ?? "",

          materials: materials.map((detail) => ({
            materialItem: detail.MaterialPartNo ?? detail.materialPartNo ?? "",

            description:
              detail.MaterialDescription ?? detail.materialDescription ?? "",

            qtyUsed: String(detail.MaterialUse ?? detail.materialUse ?? ""),

            lot: detail.MaterialLotNumber ?? detail.materialLotNumber ?? "",

            rollNumber: String(detail.RollNumber ?? detail.rollNumber ?? ""),

            judgment:
              (detail.Judgement ?? detail.judgement) === true ||
              (detail.Judgement ?? detail.judgement) === 1
                ? "OK"
                : "NG",

            detailId: detail.DetailId ?? detail.detailId ?? null,
          })),

          machine: rollMachine
            ? {
                speed: String(rollMachine.Speed ?? rollMachine.speed ?? ""),
                temperature1: String(
                  rollMachine.Temperature1 ??
                    rollMachine.temperature1 ??
                    TEMP_STD,
                ),
                temperature2: String(
                  rollMachine.Temperature2 ??
                    rollMachine.temperature2 ??
                    TEMP_STD,
                ),
                temperature3: String(
                  rollMachine.Temperature3 ??
                    rollMachine.temperature3 ??
                    TEMP_STD,
                ),
                temperature4: String(
                  rollMachine.Temperature4 ??
                    rollMachine.temperature4 ??
                    TEMP_STD,
                ),
                temperature5: String(
                  rollMachine.Temperature5 ??
                    rollMachine.temperature5 ??
                    TEMP_STD,
                ),
                temperature6: String(
                  rollMachine.Temperature6 ??
                    rollMachine.temperature6 ??
                    TEMP_STD,
                ),
                temperatureCooler: String(
                  rollMachine.TemperatureCooler ??
                    rollMachine.temperatureCooler ??
                    "",
                ),
                adhesiveCheck:
                  rollMachine.AdhesiveCheck ??
                  rollMachine.adhesiveCheck ??
                  "OK",
                remarks: rollMachine.Remarks ?? rollMachine.remarks ?? "",
              }
            : null,
        };
      });

      setInspectionRows(rows.length > 0 ? rows : [createInspectionRow()]);
    } catch (error) {
      console.error("loadProductByJob error:", error);

      const status = error?.response?.status;

      if (status === 404) {
        toast.error(`ไม่พบข้อมูล Job ${jobNumber}`);
      } else {
        toast.error("ไม่สามารถโหลดข้อมูลการผลิตได้");
      }
    }
  };

  useEffect(() => {
    if (!job) return;

    if (isViewMode || isEditMode) {
      loadProductByJob(job);
    }
  }, [job, mode]);

  // ปลดล็อกแถวเพื่อแก้ไขได้ทีละแถว / แถวอื่นที่กำลังแก้ไขอยู่จะกลับไปเป็น locked
  const toggleEditRow = (rowId) => {
    const targetRow = inspectionRows.find((r) => r.id === rowId);
    if (!targetRow) return;

    const isOpening = targetRow.status !== "editing";

    if (isOpening && targetRow.machine) {
      setForm((prev) => ({
        ...prev,
        Speed: targetRow.machine.speed,
        Temperature1: targetRow.machine.temperature1,
        Temperature2: targetRow.machine.temperature2,
        Temperature3: targetRow.machine.temperature3,
        Temperature4: targetRow.machine.temperature4,
        Temperature5: targetRow.machine.temperature5,
        Temperature6: targetRow.machine.temperature6,
        TemperatureCooler: targetRow.machine.temperatureCooler,
        AdhesiveCheck: targetRow.machine.adhesiveCheck,
        Remarks: targetRow.machine.remarks,
      }));
    }

    setInspectionRows((prev) =>
      prev.map((r) => {
        if (r.id === rowId) {
          return { ...r, status: isOpening ? "editing" : "locked" };
        }
        // หากมีแถวอื่นที่อยู่ในสถานะ editing อยู่ ให้กลับไปเป็น locked อัตโนมัติ
        if (r.status === "editing") {
          return { ...r, status: "locked" };
        }
        return r;
      }),
    );
  };

  const handleSaveInspectionRow = async (row, rowIndex) => {
    // แถวที่ยังล็อกอยู่ไม่ควรบันทึกซ้ำ (ปุ่มจะโชว์ "แก้ไข" อยู่แล้ว แต่กันไว้อีกชั้น)
    if (row.status === "locked") return;

    const isUpdate = row.status === "editing";

    if (!form.JobNumber?.trim()) {
      toast.warning("กรุณากรอกหรือค้นหา Job ก่อนบันทึก");
      return;
    }

    if (!form.PartNo?.trim()) {
      toast.warning("กรุณาระบุ Part No.");
      return;
    }

    if (!row.startTime) {
      toast.warning(`กรุณากรอกเวลาเริ่ม ม้วนที่ ${rowIndex + 1}`);
      return;
    }

    if (!row.finishTime) {
      toast.warning(`กรุณากรอกเวลาสิ้นสุด ม้วนที่ ${rowIndex + 1}`);
      return;
    }

    if (!row.thickness) {
      toast.warning(`กรุณากรอกความหนา ม้วนที่ ${rowIndex + 1}`);
      return;
    }

    if (!row.width) {
      toast.warning(`กรุณากรอกความกว้าง ม้วนที่ ${rowIndex + 1}`);
      return;
    }

    if (!row.length) {
      toast.warning(`กรุณากรอกความยาว ม้วนที่ ${rowIndex + 1}`);
      return;
    }

    if (!row.prodName?.trim() && !header.employeeName) {
      toast.warning(`กรุณากรอกชื่อพนักงานผลิต ม้วนที่ ${rowIndex + 1}`);
      return;
    }

    const incompleteMaterial = row.materials.find(
      (material) =>
        !material.qtyUsed ||
        !material.lot ||
        !material.rollNumber ||
        !material.judgment,
    );

    if (incompleteMaterial) {
      toast.warning(`กรุณากรอกข้อมูลวัตถุดิบของม้วนที่ ${rowIndex + 1} ให้ครบ`);
      return;
    }

    if (toInt(row.defectQty) > 0 && !row.reason?.trim()) {
      toast.warning(`กรุณาระบุสาเหตุงานเสีย ม้วนที่ ${rowIndex + 1}`);
      return;
    }

    if (
      row.startTime &&
      row.finishTime &&
      parseTime(row.finishTime) < parseTime(row.startTime)
    ) {
      toast.warning(
        `เวลาสิ้นสุดของม้วนที่ ${rowIndex + 1} ต้องไม่น้อยกว่าเวลาเริ่ม`,
      );
      return;
    }

    if (
      form.Speed === "" ||
      form.Speed === null ||
      form.Speed === undefined ||
      isNaN(Number(form.Speed))
    ) {
      toast.warning("กรุณากรอก Speed (m/min)");
      return;
    }

    if (
      form.TemperatureCooler === "" ||
      form.TemperatureCooler === null ||
      form.TemperatureCooler === undefined ||
      isNaN(Number(form.TemperatureCooler))
    ) {
      toast.warning("กรุณากรอกอุณหภูมิน้ำหล่อเย็น (°C)");
      return;
    }

    if (!form.AdhesiveCheck?.trim()) {
      toast.warning("กรุณาเลือกการติดกันของโฟมกับฟิล์ม");
      return;
    }

    const heaterTemps = [
      { n: 1, pos: "บนซ้าย", val: form.Temperature1 },
      { n: 2, pos: "บนกลาง", val: form.Temperature2 },
      { n: 3, pos: "บนขวา", val: form.Temperature3 },
      { n: 4, pos: "ล่างซ้าย", val: form.Temperature4 },
      { n: 5, pos: "ล่างขวา", val: form.Temperature5 },
      { n: 6, pos: "กลางล่าง", val: form.Temperature6 },
    ];
    const invalidTemp = heaterTemps.find(
      (t) =>
        t.val === "" ||
        t.val === null ||
        t.val === undefined ||
        isNaN(Number(t.val)),
    );
    if (invalidTemp) {
      toast.warning(
        `กรุณากรอกอุณหภูมิ Heater ${invalidTemp.n} (${invalidTemp.pos})`,
      );
      return;
    }

    const rollNumber = row.rollNumber ?? rowIndex + 1;

    try {
      if (rowIndex === 0 && !isUpdate) {
        const productPayload = {
          JobNumber: form.JobNumber,
          PartNo: form.PartNo,
          Description: form.Description,
          Color: form.Color,
          EmployeeName: row.prodName || header.employeeName,
          RecordDate: header.reportDate,
        };

        await axios.post(PRODUCT_API_ROUTES.product, productPayload);
      }

      const fgPayload = {
        JobNumber: form.JobNumber,
        PartNo: form.PartNo,
        Description: form.Description,
        RollNumber: rollNumber,
        Thickness: toFloat(row.thickness),
        Width: toFloat(row.width),
        Length: toFloat(row.length),
        ProductNg: toInt(row.defectQty),
        ProblemNote: row.reason || "-",
        StartTime: toTimeOnlyString(row.startTime),
        FinishTime: toTimeOnlyString(row.finishTime),
        TotalTime: minutesToTimeOnly(
          row.startTime && row.finishTime
            ? Math.max(0, parseTime(row.finishTime) - parseTime(row.startTime))
            : 0,
        ),
        LotNumber: form.LotNumber,
        ProdName: row.prodName || header.employeeName,
        Shift: header.shift,
      };

      if (isUpdate) {
        // DRAFT: confirm this endpoint/shape with backend
        await axios.put(
          PRODUCT_API_UPDATE_ROUTES.fg(form.JobNumber, rollNumber),
          fgPayload,
        );
      } else {
        await axios.post(PRODUCT_API_ROUTES.fg, fgPayload);
      }

      const rawMaterialPayloads = row.materials.map((material) => ({
        JobNumber: form.JobNumber,
        PartNoMaterial: material.materialItem,
        DescriptionMaterial: material.description || "",
        FgRoll: rollNumber,
        MaterialUse: toInt(material.qtyUsed),
        LotNumberMaterial: material.lot || TODAY,
        RollNumber: toInt(material.rollNumber),
        Judgement: material.judgment === "OK",
      }));

      if (isUpdate) {
        // DRAFT: confirm this endpoint/shape with backend
        await Promise.all(
          rawMaterialPayloads.map((payload) =>
            axios.put(
              PRODUCT_API_UPDATE_ROUTES.rawMaterial(
                form.JobNumber,
                rollNumber,
                payload.PartNoMaterial,
              ),
              payload,
            ),
          ),
        );
      } else {
        await Promise.all(
          rawMaterialPayloads.map((payload) =>
            axios.post(PRODUCT_API_ROUTES.rawMaterial, payload),
          ),
        );
      }

      const machinePayload = {
        JobNumber: form.JobNumber,
        RollNumber: rollNumber,
        Speed: toFloat(form.Speed),
        Temperature1: toFloat(form.Temperature1),
        Temperature2: toFloat(form.Temperature2),
        Temperature3: toFloat(form.Temperature3),
        Temperature4: toFloat(form.Temperature4),
        Temperature5: toFloat(form.Temperature5),
        Temperature6: toFloat(form.Temperature6),
        TemperatureCooler: toFloat(form.TemperatureCooler),
        AdhesiveCheck: form.AdhesiveCheck,
        Remarks: form.Remarks || "",
      };

      if (isUpdate) {
        await axios.put(
          PRODUCT_API_UPDATE_ROUTES.machine(form.JobNumber, rollNumber),
          machinePayload,
        );
      } else {
        await axios.post(PRODUCT_API_ROUTES.machine, machinePayload);
      }

      // บันทึก/อัพเดทสำเร็จ -> ล็อกแถวและอัพเดทค่า machine ประจำม้วน
      const currentMachineState = {
        speed: String(form.Speed),
        temperature1: String(form.Temperature1),
        temperature2: String(form.Temperature2),
        temperature3: String(form.Temperature3),
        temperature4: String(form.Temperature4),
        temperature5: String(form.Temperature5),
        temperature6: String(form.Temperature6),
        temperatureCooler: String(form.TemperatureCooler),
        adhesiveCheck: form.AdhesiveCheck,
        remarks: form.Remarks || "",
      };

      setInspectionRows((prev) =>
        prev.map((r) =>
          r.id === row.id
            ? { ...r, status: "locked", machine: currentMachineState }
            : r,
        ),
      );

      toast.success(
        isUpdate
          ? `อัพเดทม้วนที่ ${rowIndex + 1} เรียบร้อยแล้ว`
          : `บันทึกม้วนที่ ${rowIndex + 1} เรียบร้อยแล้ว`,
      );
    } catch (error) {
      const apiMessage =
        error?.response?.data?.message ||
        (typeof error?.response?.data === "string"
          ? error.response.data
          : "") ||
        error?.message ||
        "บันทึกข้อมูลไม่สำเร็จ";

      toast.error(`${isUpdate ? "อัพเดท" : "บันทึก"}ไม่สำเร็จ: ${apiMessage}`);
    }
  };

  const syncInspectionRowsSmDefaults = (materials) => {
    setInspectionRows((prev) =>
      prev.map((row) => ({
        ...row,
        materials: materials.map((material) => ({
          materialItem: material.materialItem,
          description: material.materialDescription,
          qtyUsed: "",
          lot: TODAY,
          rollNumber: "",
          judgment: "",
        })),
      })),
    );
  };

  const syncFirstRawMaterialToForm = (rows) => {
    const first = rows?.[0];
    setForm((prev) => ({
      ...prev,
      PartNoMaterial: first?.materialItem || "",
      DescriptionMaterial: first?.materialDescription || "",
      MaterialUse: first ? String(first?.matlQty ?? "") : "",
      RollNumber: first ? String(first?.rollNumber ?? "") : "",
      LotNumberMaterial: first?.lotNumber || TODAY,
      stdThickness:
        prev.stdThickness ||
        (first?.materialThickness ? String(first.materialThickness) : ""),
      stdWidth:
        prev.stdWidth || (first?.materialWidth ? String(first.materialWidth) : ""),
      stdLength:
        prev.stdLength ||
        (first?.materialLength ? String(first.materialLength) : ""),
    }));
  };

  const fetchBomDetails = async (partNoValue) => {
    const partNo = String(partNoValue || "").trim();

    if (!partNo) {
      latestBomRequestedRef.current = "";
      setRawMaterials([]);
      syncInspectionRowsSmDefaults([]);
      setBomLoading(false);
      syncFirstRawMaterialToForm([]);
      return;
    }

    latestBomRequestedRef.current = partNo;
    setBomLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/jobs/bom/${encodeURIComponent(partNo)}`,
      );

      if (latestBomRequestedRef.current !== partNo) return;

      const payload = Array.isArray(response.data)
        ? response.data
        : response.data
          ? [response.data]
          : [];

      const materials = normalizeBomRows(payload);

      setRawMaterials(materials);
      syncInspectionRowsSmDefaults(materials);
      syncFirstRawMaterialToForm(materials);

      if (materials.length === 0) {
        toast.warning(`ไม่พบวัตถุดิบของ Part No. ${partNo}`);
      }
    } catch (error) {
      if (latestBomRequestedRef.current !== partNo) return;

      setRawMaterials([]);
      syncInspectionRowsSmDefaults([]);
      syncFirstRawMaterialToForm([]);

      const status = error?.response?.status;

      if (status === 404) {
        toast.warning(`ไม่พบ BOM ของ Part No. ${partNo}`);
      } else if (status >= 500) {
        toast.error("เกิดข้อผิดพลาดจาก API ข้อมูล BOM");
      } else {
        toast.error("ไม่สามารถดึงข้อมูลวัตถุดิบได้");
      }
    } finally {
      if (latestBomRequestedRef.current === partNo) {
        setBomLoading(false);
      }
    }
  };

  const handleHeaderChange = (field, value) => {
    setHeader((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "employeeId" ? { employeeName: "" } : {}),
    }));
  };

  const setField = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const updateInspectionRow = (rowId, field, value) => {
    setInspectionRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;

        const nextRow = { ...row, [field]: value };

        if (field === "length" || field === "defectQty") {
          const rawLength = field === "length" ? value : row.length;
          const rawDefect = field === "defectQty" ? value : row.defectQty;

          if (rawLength !== "" || rawDefect !== "") {
            const l = parseFloat(rawLength) || 0;
            const d = parseFloat(rawDefect) || 0;
            const sum = Math.round((l + d) * 10000) / 10000;
            const computedQty = String(sum);

            nextRow.materials = nextRow.materials.map((m) => ({
              ...m,
              qtyUsed: computedQty,
            }));
          } else {
            nextRow.materials = nextRow.materials.map((m) => ({
              ...m,
              qtyUsed: "",
            }));
          }
        }

        return nextRow;
      }),
    );
  };

  const addInspectionRow = () => {
    setInspectionRows((prev) => {
      const previousRow = prev[prev.length - 1];

      return [
        ...prev,
        {
          ...createInspectionRow(),
          status: "new",
          startTime: previousRow?.finishTime || "",
          prodName: previousRow?.prodName || header.employeeName,
          materials: rawMaterials.map((material) => ({
            materialItem: material.materialItem,
            description: material.materialDescription,
            qtyUsed: "",
            lot: TODAY,
            rollNumber: "",
            judgment: "",
          })),
        },
      ];
    });
  };

  const updateInspectionMaterial = (rowId, materialIndex, field, value) => {
    setInspectionRows((prev) =>
      prev.map((row) => {
        if (row.id !== rowId) return row;

        return {
          ...row,
          materials: row.materials.map((material, index) => {
            if (index === materialIndex) {
              return {
                ...material,
                [field]: value,
              };
            }

            return material;
          }),
        };
      }),
    );
  };

  const fetchJobDetails = async () => {
    const jobNumber = String(form.JobNumber || "").trim();

    if (!jobNumber) {
      toast.warning("กรุณากรอก Job No.");
      return;
    }

    if (jobLoading) return;

    latestJobRequestedRef.current = jobNumber;
    setJobLoading(true);

    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/jobs/get/${encodeURIComponent(jobNumber)}`,
      );

      const payload = Array.isArray(response.data)
        ? response.data[0]
        : response.data;

      if (!payload) {
        setForm((prev) => ({
          ...prev,
          stdThickness: "",
          stdWidth: "",
          stdLength: "",
        }));

        setRawMaterials([]);
        syncFirstRawMaterialToForm([]);

        toast.error(`ไม่พบข้อมูล Job ${jobNumber}`);
        return;
      }

      if (latestJobRequestedRef.current !== jobNumber) return;

      const thickness = payload.Thickness ?? payload.thickness ?? "";
      const width = payload.Width ?? payload.width ?? "";
      const length = payload.Length ?? payload.length ?? "";
      const finishPartNo = payload.item || payload.Item || "";

      setForm((prev) => ({
        ...prev,
        JobNumber: payload.job || payload.JobNumber || jobNumber,
        PartNo: finishPartNo || prev.PartNo,
        Description:
          payload.description || payload.Description || prev.Description,
        Color:
          payload.colorName ||
          payload.pvcColor ||
          payload.colorCode ||
          payload.Color ||
          prev.Color,
        stdThickness: String(thickness),
        stdWidth: String(width),
        stdLength: String(length),
      }));

      toast.success(`พบข้อมูล Job ${jobNumber}`);

      await fetchBomDetails(finishPartNo || form.PartNo);
    } catch (error) {
      setForm((prev) => ({
        ...prev,
        stdThickness: "",
        stdWidth: "",
        stdLength: "",
      }));

      setRawMaterials([]);
      syncFirstRawMaterialToForm([]);

      const status = error?.response?.status;

      if (status === 404) {
        toast.error(`ไม่พบข้อมูล Job ${jobNumber}`);
      } else if (status >= 500) {
        toast.error("เกิดข้อผิดพลาดจาก API กรุณาลองใหม่อีกครั้ง");
      } else {
        toast.error("ไม่สามารถเชื่อมต่อ API ได้");
      }
    } finally {
      setJobLoading(false);
    }
  };

  const handleFormKeyDown = (e) => {
    if (e.key !== "Enter") return;

    const target = e.target;
    if (!target) return;

    // ไม่ดักจับถ้าเป็น textarea (เพื่อให้ขึ้นบรรทัดใหม่ได้ตามปกติ)
    if (target.tagName === "TEXTAREA") return;

    // ถ้าเป็นปุ่มหรือลิงก์ ให้ Enter ทำงานตามค่าเริ่มต้นของปุ่ม (เช่น ปุ่มบันทึก)
    if (target.tagName === "BUTTON" || target.tagName === "A") return;

    // จัดการเฉพาะ input และ select
    if (target.tagName !== "INPUT" && target.tagName !== "SELECT") return;

    const focusableSelector = [
      'input:not([disabled]):not([type="hidden"]):not([readonly]):not([tabindex="-1"])',
      'select:not([disabled]):not([tabindex="-1"])',
      'textarea:not([disabled]):not([readonly]):not([tabindex="-1"])',
      'button:not([disabled]):not([tabindex="-1"])',
    ].join(", ");

    const allElements = Array.from(
      document.querySelectorAll(focusableSelector),
    ).filter((el) => {
      return (
        el.offsetWidth > 0 ||
        el.offsetHeight > 0 ||
        el.getClientRects().length > 0 ||
        el === target
      );
    });

    const currentIndex = allElements.indexOf(target);
    if (currentIndex === -1) return;

    e.preventDefault();

    if (e.shiftKey) {
      // Shift + Enter: ไปช่องก่อนหน้า
      for (let i = currentIndex - 1; i >= 0; i--) {
        const prevElement = allElements[i];
        if (prevElement) {
          prevElement.focus();
          if (
            prevElement.tagName === "INPUT" &&
            typeof prevElement.select === "function"
          ) {
            try {
              prevElement.select();
            } catch {}
          }
          break;
        }
      }
    } else {
      // Enter: ไปช่องถัดไป
      for (let i = currentIndex + 1; i < allElements.length; i++) {
        const nextElement = allElements[i];
        if (nextElement) {
          nextElement.focus();
          if (
            nextElement.tagName === "INPUT" &&
            typeof nextElement.select === "function"
          ) {
            try {
              nextElement.select();
            } catch {}
          }
          break;
        }
      }
    }
  };

  return (
    <div
      className="min-h-screen bg-slate-100 text-slate-800 "
      onKeyDown={handleFormKeyDown}
    >
      <ToastContainer
        position="top-right"
        autoClose={2500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        theme="light"
        style={{ zIndex: 99999 }}
      />
      <AppNavbar />
      <div className="bg-linear-to-r from-[#03045E] via-[#023E8A] to-[#00B4D8] text-white  shadow-md px-4 py-4">
        <div className="max-w-screen-2xl mx-auto">
          <div>
            <h1 className="text-2xl font-bold text-slate-100">
              รายงานการผลิต EMBOSS
            </h1>
          </div>
        </div>
      </div>

      <div className="px-3 my-2">
        <div className="max-w-screen-2xl mx-auto flex flex-wrap justify-between items-center gap-x-4 gap-y-2 text-xs">
          {/* ปุ่มกลับ */}
          <Link
            href={backHref}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-600 shadow-sm transition-colors hover:bg-slate-50 hover:text-blue-700"
          >
            ← กลับ
          </Link>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
            {/* วันที่ */}
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

            {/* กะ */}
            <div className="flex items-center gap-1.5 bg-white/80 px-2.5 py-1 rounded-lg border border-slate-200/60 shadow-2xs">
              <span className="text-slate-500 font-medium">กะ:</span>
              <HeaderSelect
                value={header.shift}
                disabled={isViewMode}
                onChange={(v) => handleHeaderChange("shift", v)}
                options={[
                  { value: "Day", label: "เช้า" },
                  { value: "Night", label: "ดึก" },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-screen-2xl mx-auto px-4 py-4 space-y-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-visible">
            <div className="flex items-center gap-2 px-5 py-3 bg-blue-50 border-b border-blue-100">
              <BrickWall className="w-4 h-4 text-slate-600" />
              <div>
                <h2 className="text-sm font-bold text-slate-800">
                  ส่วนที่ 1 — ข้อมูล Item และ BOM
                </h2>
                <p className="text-xs text-slate-500">
                  แสดงข้อมูลชิ้นงานและ BOM (Part No. / Description / Color)
                </p>
              </div>
            </div>
            <div className="p-5 space-y-4">
              <div>
                <label className="flex text-xs font-semibold text-slate-600 mb-1 items-center gap-1">
                  <ScanBarcode className="w-3.5 h-3.5" />
                  Job (สแกน Barcode)
                </label>
                <input
                  ref={jobRef}
                  type="text"
                  value={form.JobNumber}
                  disabled={isViewMode}
                  placeholder="สแกนหรือพิมพ์ Job No."
                  onChange={(e) => {
                    setField("JobNumber", e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      fetchJobDetails();
                    }
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-400 focus:outline-none transition font-mono"
                />
                {jobLoading && (
                  <div className="mt-1.5 min-h-4 text-[11px]">
                    <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                      <LoaderCircle className="w-3 h-3 animate-spin" />
                      กำลังค้นหา Job...
                    </span>
                  </div>
                )}
              </div>

              <div className="space-y-3">
                {/* Item */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-3">
                  <div className="lg:col-span-3">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Part No. <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={form.PartNo}
                      disabled={isViewMode}
                      onChange={(e) => {
                        setField("PartNo", e.target.value);
                      }}
                      onBlur={() => fetchBomDetails(form.PartNo)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          fetchBomDetails(form.PartNo);
                        }
                      }}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="lg:col-span-5">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Description
                    </label>

                    <input
                      type="text"
                      value={form.Description}
                      disabled={isViewMode}
                      onChange={(e) => setField("Description", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Color
                    </label>

                    <input
                      type="text"
                      value={form.Color}
                      disabled={isViewMode}
                      onChange={(e) => setField("Color", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm text-center focus:border-blue-400 focus:outline-none"
                    />
                  </div>

                  <div className="lg:col-span-2">
                    <label className="block text-xs font-semibold text-slate-600 mb-1">
                      Standard
                    </label>
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="กว้าง"
                        value={form.stdWidth}
                        disabled={isViewMode}
                        onChange={(e) => setField("stdWidth", e.target.value)}
                        className="w-1/2 px-1.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-mono focus:bg-white focus:border-blue-400 focus:outline-none"
                      />
                      <span className="text-slate-400 text-xs">×</span>
                      <input
                        type="text"
                        placeholder="ยาว"
                        value={form.stdLength}
                        disabled={isViewMode}
                        onChange={(e) => setField("stdLength", e.target.value)}
                        className="w-1/2 px-1.5 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-center font-mono focus:bg-white focus:border-blue-400 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* BOM Loading / Error */}
                {bomLoading && (
                  <div className="text-[11px]">
                    <span className="inline-flex items-center gap-1 text-blue-600 font-medium">
                      <LoaderCircle className="w-3 h-3 animate-spin" />
                      กำลังค้นหาวัตถุดิบ...
                    </span>
                  </div>
                )}

                {/* BOM rows */}
                {!bomLoading && rawMaterials.length > 0 && (
                  <div className="space-y-1">
                    {rawMaterials.map((row, index) => (
                      <div
                        key={`${row.materialItem}-${index}`}
                        className="grid grid-cols-1 lg:grid-cols-12 gap-3 text-xs"
                      >
                        <div className="lg:col-span-3 px-3 py-1.5 text-slate-600">
                          {row.materialItem || "-"}
                        </div>

                        <div className="lg:col-span-7 px-3 py-1.5 text-slate-600">
                          {row.materialDescription || "-"}
                        </div>

                        <div className="lg:col-span-2 px-3 py-1.5 text-slate-600 text-center">
                          {row.materialColor || "-"}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
                    Speed (m/min) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.Speed}
                    disabled={isViewMode}
                    placeholder="เช่น 3.0"
                    onChange={(e) => setField("Speed", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center focus:bg-white focus:border-blue-400 focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    อุณหภูมิน้ำหล่อเย็น (°C) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.TemperatureCooler}
                    disabled={isViewMode}
                    placeholder="เช่น 20"
                    onChange={(e) =>
                      setField("TemperatureCooler", e.target.value)
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-center focus:bg-white focus:border-blue-400 focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">
                    การติดกันของโฟมกับฟิล์ม <span className="text-red-500">*</span>
                  </label>
                  <FormSelect
                    value={form.AdhesiveCheck}
                    disabled={isViewMode}
                    onChange={(v) => setField("AdhesiveCheck", v)}
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
                    value={form.Remarks}
                    disabled={isViewMode}
                    placeholder="หมายเหตุ..."
                    onChange={(e) => setField("Remarks", e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:border-blue-400 focus:outline-none transition disabled:cursor-not-allowed disabled:opacity-60"
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-3 text-xs flex-wrap">
                  <span className="font-semibold text-slate-600">
                    อุณหภูมิ Heater:
                  </span>
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
                    const fieldKey = `Temperature${n}`;
                    const val = form[fieldKey];
                    return (
                      <div key={n} className="text-center">
                        <p className="text-[11px] font-bold text-slate-700 mb-0.5">
                          อุณหภูมิ {n}
                        </p>
                        <p className="text-[10px] text-slate-500 mb-1.5">
                          {pos}
                        </p>
                        <div className="w-14 mx-auto border border-slate-200 rounded-lg bg-white shadow-sm overflow-hidden">
                          <input
                            type="text"
                            value={val}
                            disabled={isViewMode}
                            onChange={(e) => setField(fieldKey, e.target.value)}
                            placeholder={String(TEMP_STD)}
                            className={`w-full text-center text-sm font-mono py-2.5 border-0 focus:outline-none transition-colors disabled:cursor-not-allowed disabled:opacity-60 ${getTempClass(val)}`}
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

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3 bg-amber-50 border-b border-amber-100">
            <CirclePile className="w-4 h-4 text-slate-600" />
            <div>
              <h2 className="text-sm font-bold text-slate-800">
                ส่วนที่ 2 — ตารางกรอกข้อมูลหน้างาน
              </h2>
              <p className="text-xs text-slate-500">
                แบ่งเป็น FG Part (ข้อมูลชิ้นงาน) และ SM Part
                (ข้อมูลวัตถุดิบที่ใช้) ต่อม้วน
              </p>
            </div>
          </div>

          <div className="p-4 sm:p-5">

            <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white">
              <table className="w-full min-w-7xl border-collapse text-xs sm:text-sm">
                <thead>
                  <tr className="bg-sky-50 text-[11px] font-semibold text-slate-600 sm:text-xs">
                    <th
                      rowSpan={2}
                      className="sticky left-0 z-10 border-b border-r border-slate-200 bg-sky-50 px-3 py-2.5 text-center"
                    >
                      ม้วนที่
                    </th>
                    <th
                      colSpan={8}
                      className="border-b border-r border-slate-200 bg-blue-50 px-3 py-1.5 text-center text-slate-700"
                    >
                      FG Part
                    </th>
                    <th
                      colSpan={5}
                      className="border-b border-r border-slate-200 bg-emerald-50 px-3 py-1.5 text-center text-slate-700"
                    >
                      SM Part
                    </th>
                    <th
                      rowSpan={2}
                      className="border-b border-slate-200 px-3 py-2.5 text-center"
                    >
                      บันทึก
                    </th>
                  </tr>
                  <tr className="bg-sky-50 text-[11px] font-semibold text-slate-600 sm:text-xs">
                    {/* FG Part */}
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      เวลาเริ่ม
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      หนา 
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      กว้าง 
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      ยาว 
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      งานเสีย
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      สาเหตุ
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      เวลาสิ้นสุด
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      พนักงานผลิต
                    </th>
                    {/* SM Part */}
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      วัตถุดิบ
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      จำนวนที่ใช้
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      Lot
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      Roll Number
                    </th>
                    <th className="border-b border-r border-slate-200 px-2 py-2.5 text-center">
                      Judgment
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {inspectionRows.map((row, index) => {
                    const activeStdWidth =
                      form.stdWidth || rawMaterials[0]?.materialWidth || "";
                    const activeStdLength =
                      form.stdLength || rawMaterials[0]?.materialLength || "";

                    const outOfSpec = isThicknessOutOfSpec(row.thickness);
                    const widthOutOfSpec = isWidthOutOfSpec(
                      row.width,
                      activeStdWidth,
                    );
                    const lengthOutOfSpec = isLengthOutOfSpec(
                      row.length,
                      activeStdLength,
                    );
                    const isLocked = row.status === "locked";
                    return (
                      <tr
                        key={row.id}
                        className={`group transition-colors ${
                          isLocked ? "bg-slate-100/70" : "hover:bg-sky-50/40"
                        }`}
                      >
                        <td
                          className={`sticky left-0 z-10 border-b border-r border-slate-100 px-3 py-2 text-center font-semibold text-slate-700 ${
                            isLocked
                              ? "bg-slate-100"
                              : "bg-white group-hover:bg-sky-50/40"
                          }`}
                        >
                          {index + 1}
                        </td>

                        {/* FG Part */}
                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <HHMMInput
                            value={row.startTime}
                            disabled={isLocked}
                            onChange={(value) =>
                              updateInspectionRow(row.id, "startTime", value)
                            }
                            containerClassName="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-400"
                            inputClassName="w-8 bg-transparent px-0 py-1.5 text-center text-xs font-mono text-slate-700 outline-none placeholder-slate-400 disabled:cursor-not-allowed disabled:text-slate-400 disabled:opacity-60"
                          />
                        </td>

                        <td className="border-b border-r border-slate-100 px-1.5 py-1.5">
                          <input
                            type="text"
                            value={row.thickness}
                            disabled={isLocked}
                            onChange={(e) =>
                              updateInspectionRow(
                                row.id,
                                "thickness",
                                e.target.value,
                              )
                            }
                            className={`w-20 rounded-lg border px-2 py-1.5 text-center text-xs outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                              outOfSpec
                                ? "border-rose-300 bg-rose-50 text-rose-700 focus:border-rose-400 focus:ring-rose-100 font-semibold"
                                : "border-slate-200 bg-white text-slate-800 focus:border-sky-400 focus:ring-sky-100"
                            }`}
                          />
                        </td>

                        <td className="border-b border-r border-slate-100 px-1.5 py-1.5">
                          <input
                            type="text"
                            value={row.width}
                            disabled={isLocked}
                            onChange={(e) =>
                              updateInspectionRow(
                                row.id,
                                "width",
                                e.target.value,
                              )
                            }
                            className={`w-20 rounded-lg border px-2 py-1.5 text-center text-xs outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                              widthOutOfSpec
                                ? "border-rose-300 bg-rose-50 text-rose-700 focus:border-rose-400 focus:ring-rose-100 font-semibold"
                                : "border-slate-200 bg-white text-slate-800 focus:border-sky-400 focus:ring-sky-100"
                            }`}
                          />
                        </td>

                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <input
                            type="text"
                            value={row.length}
                            disabled={isLocked}
                            onChange={(e) =>
                              updateInspectionRow(
                                row.id,
                                "length",
                                e.target.value,
                              )
                            }
                            className={`w-24 rounded-lg border px-2 py-1.5 text-center text-xs outline-none transition-colors focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                              lengthOutOfSpec
                                ? "border-rose-300 bg-rose-50 text-rose-700 focus:border-rose-400 focus:ring-rose-100 font-semibold"
                                : "border-slate-200 bg-white text-slate-800 focus:border-sky-400 focus:ring-sky-100"
                            }`}
                          />
                        </td>

                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <input
                            type="text"
                            value={row.defectQty}
                            disabled={isLocked}
                            onChange={(e) =>
                              updateInspectionRow(
                                row.id,
                                "defectQty",
                                e.target.value,
                              )
                            }
                            className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-xs outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </td>

                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <input
                            type="text"
                            value={row.reason}
                            disabled={isLocked}
                            placeholder="สาเหตุงานเสีย"
                            onChange={(e) =>
                              updateInspectionRow(
                                row.id,
                                "reason",
                                e.target.value,
                              )
                            }
                            className="w-32 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-xs outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </td>

                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <HHMMInput
                            value={row.finishTime}
                            disabled={isLocked}
                            onChange={(value) =>
                              updateInspectionRow(row.id, "finishTime", value)
                            }
                            containerClassName="flex items-center rounded-lg border border-slate-200 bg-white overflow-hidden focus-within:ring-2 focus-within:ring-sky-100 focus-within:border-sky-400"
                            inputClassName="w-8 bg-transparent px-0 py-1.5 text-center text-xs font-mono text-slate-700 outline-none placeholder-slate-400 disabled:cursor-not-allowed disabled:text-slate-400 disabled:opacity-60"
                          />
                        </td>

                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <input
                            type="text"
                            value={row.prodName}
                            disabled={isLocked}
                            onChange={(e) =>
                              updateInspectionRow(
                                row.id,
                                "prodName",
                                e.target.value,
                              )
                            }
                            placeholder="ชื่อพนักงาน"
                            className="w-28 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-xs outline-none transition-colors focus:border-sky-400 focus:ring-2 focus:ring-sky-100 disabled:cursor-not-allowed disabled:opacity-60"
                          />
                        </td>

                        {/* SM Part */}
                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <div className="space-y-1">
                            {row.materials.map((material, materialIndex) => (
                              <div
                                key={materialIndex}
                                className="py-1.5 text-center text-xs font-semibold text-slate-700"
                              >
                                {materialIndex + 1}
                              </div>
                            ))}
                          </div>
                        </td>

                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <div className="space-y-1">
                            {row.materials.map((material, materialIndex) => (
                              <input
                                key={materialIndex}
                                type="text"
                                value={material.qtyUsed}
                                disabled={isLocked}
                                onChange={(e) =>
                                  updateInspectionMaterial(
                                    row.id,
                                    materialIndex,
                                    "qtyUsed",
                                    e.target.value,
                                  )
                                }
                                className="w-20 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-xs disabled:cursor-not-allowed disabled:opacity-60"
                              />
                            ))}
                          </div>
                        </td>

                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <div className="space-y-1">
                            {row.materials.map((material, materialIndex) => (
                              <input
                                key={materialIndex}
                                type="text"
                                value={material.lot}
                                disabled={isLocked}
                                onChange={(e) =>
                                  updateInspectionMaterial(
                                    row.id,
                                    materialIndex,
                                    "lot",
                                    e.target.value,
                                  )
                                }
                                className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-xs disabled:cursor-not-allowed disabled:opacity-60"
                              />
                            ))}
                          </div>
                        </td>

                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <div className="space-y-1">
                            {row.materials.map((material, materialIndex) => (
                              <input
                                key={materialIndex}
                                type="text"
                                value={material.rollNumber}
                                disabled={isLocked}
                                onChange={(e) =>
                                  updateInspectionMaterial(
                                    row.id,
                                    materialIndex,
                                    "rollNumber",
                                    e.target.value,
                                  )
                                }
                                className="w-24 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-center text-xs disabled:cursor-not-allowed disabled:opacity-60"
                              />
                            ))}
                          </div>
                        </td>

                        <td className="border-b border-r border-slate-100 px-2 py-1.5">
                          <div className="space-y-1">
                            {row.materials.map((material, materialIndex) => (
                              <select
                                key={materialIndex}
                                value={material.judgment}
                                disabled={isLocked}
                                onChange={(e) =>
                                  updateInspectionMaterial(
                                    row.id,
                                    materialIndex,
                                    "judgment",
                                    e.target.value,
                                  )
                                }
                                className={`w-20 rounded-lg border px-2 py-1.5 text-xs font-semibold outline-none focus:ring-2 disabled:cursor-not-allowed disabled:opacity-60 ${
                                  material.judgment === "OK"
                                    ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                    : material.judgment === "NG"
                                      ? "border-rose-200 bg-rose-50 text-rose-700"
                                      : "border-slate-200 bg-white text-slate-500"
                                }`}
                              >
                                <option value="">เลือก</option>
                                <option value="OK">OK</option>
                                <option value="NG">NG</option>
                              </select>
                            ))}
                          </div>
                        </td>

                        <td className="border-b border-slate-100 px-2 py-1.5 text-center">
                          {isLocked ? (
                            isViewMode ? (
                              <span className="inline-flex items-center rounded-lg bg-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500">
                                ดูข้อมูล
                              </span>
                            ) : (
                              <button
                                type="button"
                                onClick={() => toggleEditRow(row.id)}
                                className="inline-flex items-center gap-1 rounded-lg bg-amber-500 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-amber-400"
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                แก้ไข
                              </button>
                            )
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleSaveInspectionRow(row, index)
                              }
                              className="inline-flex items-center gap-1 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-500"
                            >
                              <Save className="w-3.5 h-3.5" />

                              {row.status === "editing" ? "อัพเดท" : "บันทึก"}
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {!isViewMode && (
              <div className="mt-4">
                <button
                  type="button"
                  onClick={addInspectionRow}
                  className="inline-flex items-center gap-2 rounded-xl border border-dashed border-sky-200 bg-sky-50/60 px-4 py-2 text-xs font-semibold text-sky-700 transition-colors hover:bg-sky-100"
                >
                  + เพิ่มม้วน
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EmbossFormPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <LoaderCircle className="h-6 w-6 animate-spin" />
        </div>
      }
    >
      <EmbossFormContent />
    </Suspense>
  );
}
