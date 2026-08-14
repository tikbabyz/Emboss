// src/app/lib/employeeMaster.js
// ─────────────────────────────────────────────────────────────────
// Mock Employee Master Data
// TODO: เปลี่ยนจาก array นี้เป็น API call เมื่อมี backend จริง
// ตัวอย่าง API call:
//   const res = await fetch(`/api/employees/${employeeId}`)
//   const data = await res.json()
//   return data  // { id, name, department }
// ─────────────────────────────────────────────────────────────────

export const EMPLOYEE_MASTER = [
  { id: "EMP001", name: "ชุติมา ชัยยา", department: "PE ROLL" },
  { id: "EMP002", name: "สมชาย มั่นคง", department: "PE ROLL" },
  { id: "EMP003", name: "วิชัย ใจดี", department: "PE ROLL" },
  { id: "EMP004", name: "สมศักดิ์ ขยัน", department: "PE ROLL" },
  { id: "EMP005", name: "นิดา รักงาน", department: "PE ROLL" },
  { id: "EMP006", name: "ประยุทธ์ ตั้งใจ", department: "PE ROLL" },
];

export function findEmployee(id) {
  if (!id) return null;
  return EMPLOYEE_MASTER.find(
    (e) => e.id.toUpperCase() === id.toUpperCase()
  ) || null;
}
