"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, getAllUsers, resetPassword, deleteUser, updateUser } from "../lib/auth";
import Sidebar from "../components/AppNavbar";
import { ShieldCheck, Search, KeyRound, CheckCircle2, X, Pencil, Trash2 } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [session, setSession] = useState(null);
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(null); // reset password modal
  const [newPwd, setNewPwd] = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [editModal, setEditModal] = useState(null); // edit employee modal
  const [editForm, setEditForm] = useState({});
  const [deleteTarget, setDeleteTarget] = useState(null); // username to delete
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [editErr, setEditErr] = useState("");

  useEffect(() => {
    const currentSession = getSession();
    if (!currentSession || currentSession.role !== "admin") {
      router.replace("/login");
      return;
    }
    queueMicrotask(() => {
      setSession(currentSession);
      setUsers(getAllUsers());
    });
  }, [router]);

  const filtered = users.filter(
    (u) =>
      u.username.toLowerCase().includes(search.toLowerCase()) ||
      (u.firstName + " " + u.lastName).toLowerCase().includes(search.toLowerCase()) ||
      u.employeeId.toLowerCase().includes(search.toLowerCase())
  );

  const openModal = (user) => {
    setModal(user);
    setNewPwd("");
    setConfirmPwd("");
    setErr("");
  };

  const handleReset = () => {
    setErr("");
    if (newPwd.length < 6) { setErr("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร"); return; }
    if (newPwd !== confirmPwd) { setErr("รหัสผ่านไม่ตรงกัน"); return; }
    const result = resetPassword(modal.username, newPwd);
    if (!result.ok) { setErr(result.error); return; }
    setModal(null);
    setMsg(`รีเซ็ตรหัสผ่านของ ${modal.firstName} สำเร็จ`);
    setTimeout(() => setMsg(""), 3000);
  };

  const openEdit = (u) => {
    setEditModal(u);
    setEditForm({ employeeId: u.employeeId, firstName: u.firstName, lastName: u.lastName, department: u.department });
    setEditErr("");
  };

  const handleEdit = () => {
    setEditErr("");
    if (!editForm.employeeId || !editForm.firstName) { setEditErr("กรุณากรอกข้อมูลให้ครบ"); return; }
    const result = updateUser(editModal.username, editForm);
    if (!result.ok) { setEditErr(result.error); return; }
    setUsers(getAllUsers());
    setEditModal(null);
    setMsg(`แก้ไขข้อมูลของ ${editForm.firstName} สำเร็จ`);
    setTimeout(() => setMsg(""), 3000);
  };

  const handleDelete = () => {
    deleteUser(deleteTarget.username);
    setUsers(getAllUsers());
    setDeleteTarget(null);
    setMsg(`ลบผู้ใช้ ${deleteTarget.firstName} สำเร็จ`);
    setTimeout(() => setMsg(""), 3000);
  };

  if (!session) return null;

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      <main className="px-6 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <ShieldCheck className="w-7 h-7 text-blue-900" />
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Admin Panel</h1>
              <p className="text-sm text-slate-500">จัดการรหัสผ่านผู้ใช้งาน</p>
            </div>
          </div>

          {msg && (
            <div className="mb-4 flex items-center gap-2 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm px-4 py-3 rounded-lg">
              <CheckCircle2 className="w-4 h-4 shrink-0" /> {msg}
            </div>
          )}

          {/* Search */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="ค้นหาชื่อ, username, รหัสพนักงาน..."
              className="w-full pl-9 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400 shadow-sm"
            />
          </div>

          {/* User list */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {filtered.length === 0 ? (
              <p className="text-center text-slate-400 py-10 text-sm">ไม่พบผู้ใช้งาน</p>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-slate-50 border-b border-slate-200">
                  <tr className="text-xs uppercase text-slate-500 font-semibold tracking-wide">
                    <th className="px-4 py-3 text-left">รหัสพนักงาน</th>
                    <th className="px-4 py-3 text-left">ชื่อ-นามสกุล</th>
                    <th className="px-4 py-3 text-left">Username</th>
                    <th className="px-4 py-3 text-left">แผนก</th>
                    <th className="px-4 py-3 text-center">จัดการ</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((u, i) => (
                    <tr key={u.username} className={`border-b border-slate-100 ${i % 2 === 0 ? "" : "bg-slate-50/50"}`}>
                      <td className="px-4 py-3 font-mono text-slate-700">{u.employeeId}</td>
                      <td className="px-4 py-3 font-medium text-slate-800">{u.firstName} {u.lastName}</td>
                      <td className="px-4 py-3 text-slate-600">{u.username}</td>
                      <td className="px-4 py-3 text-slate-500">{u.department}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            onClick={() => openEdit(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-blue-100 hover:bg-blue-200 text-blue-800 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                           
                          </button>
                          <button
                            onClick={() => openModal(u)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-800 text-xs font-semibold rounded-lg transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                         
                          </button>
                          {u.username !== "admin" && (
                            <button
                              onClick={() => setDeleteTarget(u)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-700 text-xs font-semibold rounded-lg transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                          
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      {/* Edit Employee Modal */}
      {editModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">แก้ไขข้อมูลพนักงาน</h2>
              <button onClick={() => setEditModal(null)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <p className="text-xs text-slate-400 mb-4">@{editModal.username}</p>
            {editErr && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">{editErr}</div>
            )}
            <div className="space-y-3">
              {[
                { label: "รหัสพนักงาน", key: "employeeId" },
                { label: "ชื่อ", key: "firstName" },
                { label: "นามสกุล", key: "lastName" },
                { label: "แผนก", key: "department" },
              ].map(({ label, key }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
                  <input
                    type="text"
                    value={editForm[key] ?? ""}
                    onChange={(e) => setEditForm((f) => ({ ...f, [key]: e.target.value }))}
                    className="w-full bg-slate-100 py-2 px-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  />
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-5">
              <button onClick={() => setEditModal(null)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button onClick={handleEdit} className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-bold transition-colors">บันทึก</button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h2 className="text-lg font-bold text-slate-900 mb-2">ยืนยันการลบ</h2>
            <p className="text-sm text-slate-600 mb-6">
              ต้องการลบ <span className="font-semibold text-red-600">{deleteTarget.firstName} {deleteTarget.lastName}</span> ออกจากระบบหรือไม่?
            </p>
            <div className="flex gap-2">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors">ยกเลิก</button>
              <button onClick={handleDelete} className="flex-1 py-2 bg-red-500 hover:bg-red-400 text-white rounded-lg text-sm font-bold transition-colors">ลบ</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-slate-900">รีเซ็ตรหัสผ่าน</h2>
              <button onClick={() => setModal(null)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-slate-600 mb-4">
              ผู้ใช้: <span className="font-semibold text-slate-800">{modal.firstName} {modal.lastName}</span>{" "}
              <span className="text-slate-400">(@{modal.username})</span>
            </p>

            {err && (
              <div className="mb-3 bg-red-50 border border-red-200 text-red-700 text-sm px-3 py-2 rounded-lg">
                {err}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">รหัสผ่านใหม่</label>
                <input
                  type="password"
                  value={newPwd}
                  onChange={(e) => setNewPwd(e.target.value)}
                  placeholder="อย่างน้อย 6 ตัวอักษร"
                  className="w-full bg-slate-100 py-2 px-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                  autoFocus
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">ยืนยันรหัสผ่านใหม่</label>
                <input
                  type="password"
                  value={confirmPwd}
                  onChange={(e) => setConfirmPwd(e.target.value)}
                  placeholder="พิมพ์รหัสผ่านอีกครั้ง"
                  className="w-full bg-slate-100 py-2 px-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="flex gap-2 mt-5">
              <button
                onClick={() => setModal(null)}
                className="flex-1 py-2 border border-slate-200 rounded-lg text-sm text-slate-600 hover:bg-slate-50 transition-colors"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleReset}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-white rounded-lg text-sm font-bold transition-colors"
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
