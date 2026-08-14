'use client';

import React, { useState } from 'react';
import Sidebar from '../components/AppNavbar';
import { 
  Activity, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  CheckSquare, 
  XSquare, 
  Eye, 
  Filter, 
  RefreshCw,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';

export default function EmbossDashboardPage() {
  // Mock Data สำหรับ KPIs
  const kpiData = {
    totalOutput: '12,450',
    goodOutput: '11,880',
    yieldRate: '95.42%',
    ngQty: '570',
    ngRate: '4.58%',
    downtime: '45 mins',
  };

  // Mock Data รายงานรอ Foreman Approve
  const [pendingReports, setPendingReports] = useState([
    { id: 'REP-001', shift: 'กะเช้า (Day)', operator: 'สมชาย มั่นคง', partNo: 'EMB-NOAH-01', totalQty: 1200, goodQty: 1150, ngQty: 50, status: 'Pending' },
    { id: 'REP-002', shift: 'กะเช้า (Day)', operator: 'วิชัย ใจดี', partNo: 'EMB-FORT-02', totalQty: 850, goodQty: 800, ngQty: 50, status: 'Pending' },
    { id: 'REP-003', shift: 'กะดึก (Night)', operator: 'สมศักดิ์ ขยัน', partNo: 'EMB-YARI-05', totalQty: 1500, goodQty: 1480, ngQty: 20, status: 'Pending' },
  ]);

  const handleApprove = (id) => {
    setPendingReports(pendingReports.filter(report => report.id !== id));
    alert(`อนุมัติรายงาน ${id} เรียบร้อยแล้ว`);
  };

  const handleReject = (id) => {
    const reason = prompt('กรุณาระบุเหตุผลในการตีกลับรายงาน:');
    if (reason) {
      setPendingReports(pendingReports.filter(report => report.id !== id));
      alert(`ส่งคืนรายงาน ${id} เรียบร้อยแล้ว (เหตุผล: ${reason})`);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-800">
      <Sidebar />
     
      
      {/* 🔹 1. HEADER & GLOBAL FILTERS */}
      <div className="bg-gradient-to-r from-[#03045E] via-[#023E8A] to-[#00B4D8] flex flex-col md:flex-row md:items-center justify-between p-10  mb-6 pb-10  gap-4 shadow-lg ">
        <div>
          <h3 className="text-4xl  font-bold  text-slate-100 flex items-center gap-2">            EMBOSS Production Monitoring Dashboard
          </h3>
          <p className="text-sm text-slate-100 p-2">ระบบติดตามสถานะการผลิตและอนุมัติรายงานประจำวัน (PE ROLL)</p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-2xl border border-amber-50 shadow-lg text-sm">
    
            <input type="date" className="outline-none text-slate-700 bg-transparent" defaultValue="2026-08-05" />
          </div>

          <select className="bg-white px-3 py-1.5 rounded-2xl border border-amber-50 shadow-lg text-sm outline-none text-slate-700 font-medium">
            <option value="all">ทุกกะ (All Shifts)</option>
            <option value="day">กะเช้า (Day Shift)</option>
            <option value="night">กะดึก (Night Shift)</option>
          </select>

          <select className="bg-white px-3 py-1.5 rounded-2xl border border-amber-50 shadow-lg text-sm outline-none text-slate-700 font-medium">
            <option value="all">ทุกเครื่องจักร (All Machines)</option>
            <option value="m1">EMBOSS Line 1</option>
            <option value="m2">EMBOSS Line 2</option>
          </select>

        </div>
      </div>
<div className="max-w-7xl mx-auto px-4">
      {/* 🔹 2. KPI SUMMARY CARDS (โทนน้ำเงิน-ขาว) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        
        {/* Total Production */}
        <div className="bg-white p-5 rounded-xl border  border-blue-50 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">ยอดผลิตรวมทั้งหมด</p>
              <h3 className="text-2xl font-extrabold text-blue-950 mt-1">{kpiData.totalOutput} <span className="text-sm font-normal text-slate-500">Pcs</span></h3>
            </div>
            <div className="p-2.5 bg-blue-50 text-blue-800 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">Target: 13,000 Pcs (95.7% of Goal)</p>
        </div>

        {/* Good Output & Yield Rate */}
        <div className="bg-white p-5 rounded-xl border  border-blue-50 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">งานดี (Good Output)</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{kpiData.goodOutput} <span className="text-sm font-semibold text-emerald-600">({kpiData.yieldRate})</span></h3>
            </div>
            <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-emerald-600 font-medium mt-3">↑ +1.2% จากเมื่อวาน</p>
        </div>

        {/* NG Quantity & NG Rate */}
        <div className="bg-white p-5 rounded-xl border  border-blue-50 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">งานเสียสะสม (NG Rate)</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{kpiData.ngQty} <span className="text-sm font-semibold text-rose-600">({kpiData.ngRate})</span></h3>
            </div>
            <div className="p-2.5 bg-rose-50 text-rose-600 rounded-lg">
              <XCircle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-rose-500 font-medium mt-3">เกินเป้าหมาย NG (&lt; 3.0%)</p>
        </div>

        {/* Downtime */}
        <div className="bg-white p-5 rounded-xl border  border-blue-50 shadow-lg">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">เวลาเครื่องหยุด (Downtime)</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">{kpiData.downtime}</h3>
            </div>
            <div className="p-2.5 bg-amber-50 text-amber-600 rounded-lg">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-500 mt-3">สาเหตุหลัก: เปลี่ยนม้วนผ้า/Setup</p>
        </div>

      </div>

      {/* 🔹 3. FOREMAN ACTION CENTER (ตารางรออนุมัติรายงานประจำกะ) */}
      <div className="bg-white rounded-xl shadow-lg border border-blue-50 mb-6 overflow-hidden">
        <div className="bg-blue-100 px-6 py-4 flex justify-between items-center text-gray-700">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-lg">ศูนย์อนุมัติรายงานการผลิต (Foreman Approval Action Center)</h2>
          </div>
          <span className="bg-blue-900 text-slate-200 text-xs px-2.5 py-1 rounded-full font-semibold">
            รออนุมัติ {pendingReports.length} รายการ
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-100 border-b border-slate-200 text-slate-600 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3.5 px-4">เลขที่เอกสาร</th>
                <th className="py-3.5 px-4">กะการทำงาน</th>
                <th className="py-3.5 px-4">Operator</th>
                <th className="py-3.5 px-4">Part No.</th>
                <th className="py-3.5 px-4 text-right">จำนวนผลิต</th>
                <th className="py-3.5 px-4 text-right">งานดี</th>
                <th className="py-3.5 px-4 text-right">งานเสีย</th>
                <th className="py-3.5 px-4 text-center">สถานะ</th>
                <th className="py-3.5 px-4 text-center">การจัดการ (Action)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-sm">
              {pendingReports.length > 0 ? (
                pendingReports.map((report) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-semibold text-blue-900">{report.id}</td>
                    <td className="py-3 px-4 text-slate-600">{report.shift}</td>
                    <td className="py-3 px-4 font-medium text-slate-800">{report.operator}</td>
                    <td className="py-3 px-4 text-slate-600">{report.partNo}</td>
                    <td className="py-3 px-4 text-right font-bold text-slate-800">{report.totalQty.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-emerald-600 font-semibold">{report.goodQty.toLocaleString()}</td>
                    <td className="py-3 px-4 text-right text-rose-600 font-semibold">{report.ngQty.toLocaleString()}</td>
                    <td className="py-3 px-4 text-center">
                      <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-md font-medium border border-amber-200">
                        Pending
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button 
                          title="ดูรายละเอียดฉบับเต็ม"
                          className="p-1.5 text-slate-600 hover:text-blue-900 hover:bg-slate-200 rounded-md transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleApprove(report.id)}
                          className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors shadow-sm"
                        >
                          <CheckSquare className="w-3.5 h-3.5" /> Approve
                        </button>
                        <button 
                          onClick={() => handleReject(report.id)}
                          className="flex items-center gap-1 bg-rose-600 hover:bg-rose-700 text-white text-xs px-2.5 py-1.5 rounded-md font-medium transition-colors shadow-sm"
                        >
                          <XSquare className="w-3.5 h-3.5" /> Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="9" className="text-center py-8 text-slate-400">
                    ✅ ไม่มีรายการรายงานการผลิตค้างอนุมัติในขณะนี้
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 4. VISUAL ANALYTICS & CHARTS PLACEHOLDERS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Pareto Chart Placeholder: NG Causes */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-blue-950 flex items-center gap-2">
              <span className="w-3 h-3 bg-rose-600 rounded-full"></span>
              วิเคราะห์สาเหตุงานเสียหลัก (NG Pareto Chart)
            </h3>
            <span className="text-xs text-slate-400">ประจำสัปดาห์นี้</span>
          </div>
          {/* Chart Graphic Area */}
          <div className="h-56 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2">
            <p className="text-sm font-medium">📊 [พื้นที่แสดงกราฟ NG Pareto - Recharts/Chart.js]</p>
            <p className="text-xs text-slate-400">1. ชิ้นงานย่น/ย้วy (42%) | 2. งานติดแกน (31%) | 3. อุณหภูมิหลุด Spec (18%)</p>
          </div>
        </div>

        {/* Machine Temperature Health Placeholder */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm">
          <div className="flex justify-between items-center mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-bold text-blue-950 flex items-center gap-2">
              <span className="w-3 h-3 bg-blue-600 rounded-full"></span>
              สถานะอุณหภูมิเครื่องจักร (Temp 1-6 Monitoring)
            </h3>
            <span className="text-xs text-emerald-600 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              In-Spec Normal
            </span>
          </div>
          {/* Chart Graphic Area */}
          <div className="h-56 bg-slate-50 border border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center text-slate-400 gap-2">
            <p className="text-sm font-medium">📈 [พื้นที่แสดงกราฟแนวโน้มอุณหภูมิ 6 จุด (Temp Line Chart)]</p>
            <p className="text-xs text-slate-400">Temp Top/Bottom: 380°C - 400°C (Standard Min/Max)</p>
          </div>
        </div>

      </div>

      </div>
   </div>
  );
}
