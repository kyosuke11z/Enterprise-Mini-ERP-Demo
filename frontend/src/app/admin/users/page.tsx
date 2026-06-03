"use client";

import React, { useState, useEffect } from "react";
import { apiRequest } from "@/services/api";
import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import NeonTrail from "@/components/NeonTrail";

interface User {
  id: number;
  username: string;
  name: string;
  role: "ADMIN" | "STAFF";
  email: string;
  department?: string;
  isActive: boolean;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRoleFilter, setSelectedRoleFilter] = useState("All");

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // Form Fields
  const [formUsername, setFormUsername] = useState("");
  const [formPassword, setFormPassword] = useState("");
  const [formName, setFormName] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formRole, setFormRole] = useState<"ADMIN" | "STAFF">("STAFF");
  const [formDepartment, setFormDepartment] = useState("Sales");
  const [formIsActive, setFormIsActive] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchUsers = async () => {
    try {
      const data = await apiRequest("/api/users");
      if (Array.isArray(data)) {
        setUsers(data);
      }
    } catch (err) {
      console.error("Failed to load user directories", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const openAdd = () => {
    setErrorMsg(null);
    setFormUsername("");
    setFormPassword("");
    setFormName("");
    setFormEmail("");
    setFormRole("STAFF");
    setFormDepartment("Sales");
    setShowAddModal(true);
  };

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const payload = {
      username: formUsername,
      password: formPassword,
      name: formName,
      email: formEmail,
      role: formRole,
      department: formDepartment,
    };

    try {
      await apiRequest("/api/users", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      setShowAddModal(false);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create user account");
    }
  };

  const openEdit = (user: User) => {
    setErrorMsg(null);
    setSelectedUser(user);
    setFormName(user.name);
    setFormEmail(user.email);
    setFormRole(user.role);
    setFormDepartment(user.department || "");
    setFormIsActive(user.isActive);
    setFormPassword(""); // blank means do not change
    setShowEditModal(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setErrorMsg(null);

    const payload = {
      name: formName,
      email: formEmail,
      role: formRole,
      department: formDepartment,
      isActive: formIsActive,
      password: formPassword,
    };

    try {
      await apiRequest(`/api/users/${selectedUser.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      setShowEditModal(false);
      fetchUsers();
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update user account");
    }
  };

  const toggleUserActive = async (user: User) => {
    const payload = {
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || "",
      isActive: !user.isActive,
      password: "",
    };

    try {
      await apiRequest(`/api/users/${user.id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      fetchUsers();
    } catch (err) {
      console.error("Failed to toggle status", err);
    }
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setShowDeleteModal(true);
  };

  const handleDelete = async () => {
    if (!selectedUser) return;
    try {
      await apiRequest(`/api/users/${selectedUser.id}`, {
        method: "DELETE",
      });
      setShowDeleteModal(false);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = selectedRoleFilter === "All" || u.role === selectedRoleFilter;
    const matchesSearch =
      u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
      u.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesRole && matchesSearch;
  });

  const getAvatarImage = (role: string) => {
    if (role === "ADMIN") {
      return "https://lh3.googleusercontent.com/aida-public/AB6AXuARJv4g0NRaGQPPP5zXWi8rsREG-TVgfNSvEBTkXlD7HDFzp5tPgR2WZmLo5jOM2QpeZcvI5gqiiaJQ6K4zq_sh19k4Y_YnPB_Yik8sBX854hTvfKV0HWE6NCk0wyPnrT5ekVtwZpZoponEg_YvpLh4XW5DsHUqdlcZvDXlVz72pdFN3yOjbjdTAwCvTsQw9qdZ9wnCBTP8nQq-TKiKCv32EvEG7Oq4VrciR-Vi4_QuK_V6xua19WoS8hLBdw76yzT7y0lqHZ_V5XM";
    }
    return "https://lh3.googleusercontent.com/aida-public/AB6AXuCy_HD1RFIN-Enuptj_aeDz8Zwt4JRLV1OFcVWbRdisRj0wgGqhBvZ_4aavu8gRVDWAoswrG1ZubB2cT-haLSjC2A257l_QxVWU3OjeDRBe_9FPfH62qVf9UXyNv3HrGwKPeOMjAVuzvXNOA1xvCOjPdSD6JTm6ZqC2769RlL8KPHarQnjQf3Qj2LsXYfmwJB4OvP_hiCvZlhDLG2CLdPyjDs4RVP98VOoEbWVjvkEXzZKJOWSRG_s-s56mefux0SgfgJ2RBJvxmzs";
  };

  return (
    <div className="bg-background text-on-background font-body antialiased min-h-screen relative selection:bg-primary/30 selection:text-primary">
      <NeonTrail />
      {/* CRT Scanline effect */}
      <div className="scanlines fixed inset-0 z-10 w-full h-full opacity-35 mix-blend-overlay pointer-events-none" />

      {/* Cyber Grid Background */}
      <div className="fixed inset-0 opacity-10 pointer-events-none z-0" style={{
        backgroundImage: "linear-gradient(rgba(0, 255, 204, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0, 255, 204, 0.3) 1px, transparent 1px)",
        backgroundSize: "50px 50px"
      }} />

      {/* TopNavBar */}
      <Navbar onMenuClick={() => setSidebarOpen(!sidebarOpen)} onSearchChange={setSearchQuery} />

      <div className="flex pt-[3.75rem]">
        {/* SideNavBar */}
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

        {/* Main User Content */}
        <main className="flex-1 md:ml-64 p-6 md:p-10 z-20 relative flex flex-col gap-8 pb-32">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-outline-variant pb-6">
            <div>
              <h2 className="font-headline font-bold text-3xl text-on-surface tracking-tight mb-1">จัดการผู้ใช้ระบบ</h2>
              <p className="font-label text-sm text-on-surface-variant">
                ระบบจัดการสิทธิ์ผู้ใช้งานและข้อมูลพนักงาน (User Permissions Registry)
              </p>
            </div>
            <button
              onClick={openAdd}
              className="bg-surface-dim border border-primary text-primary font-headline font-bold text-sm tracking-wider uppercase px-6 py-3 rounded hover:shadow-[0_0_16px_rgba(255,45,120,0.4)] hover:text-white transition-all flex items-center justify-center gap-2 group w-full md:w-auto"
            >
              <span className="material-symbols-outlined text-[18px] group-hover:rotate-180 transition-transform duration-500">
                person_add
              </span>
              เพิ่มผู้ใช้ใหม่
            </button>
          </div>

          {/* Filtering bar */}
          <div className="bg-surface-container-high rounded-lg p-4 border border-secondary/30 opacity-90 backdrop-blur-sm flex flex-wrap gap-4 items-center justify-between">
            <div className="flex gap-2">
              {["All Users", "ADMIN", "STAFF"].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRoleFilter(role === "All Users" ? "All" : role)}
                  className={`px-4 py-2 border font-label text-xs uppercase tracking-wider rounded transition-colors ${
                    (role === "All Users" && selectedRoleFilter === "All") || selectedRoleFilter === role
                      ? "bg-secondary/10 border-secondary text-secondary neon-text-secondary"
                      : "bg-surface-dim border-outline-variant text-on-surface-variant hover:text-secondary"
                  }`}
                >
                  {role}
                </button>
              ))}
            </div>
          </div>

          {/* Users Grid */}
          {loading ? (
            <div className="h-64 flex flex-col justify-center items-center gap-4 text-on-surface-variant font-label">
              <span className="material-symbols-outlined text-4xl animate-spin text-primary">sync</span>
              <span className="animate-pulse tracking-widest uppercase text-xs text-primary neon-text-primary">LOADING DIRECTORY...</span>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="h-64 flex flex-col justify-center items-center text-on-surface-variant font-label">
              <span className="material-symbols-outlined text-4xl">person_off</span>
              <span className="mt-2 text-sm uppercase">ไม่พบผู้ใช้งานตามเงื่อนไข</span>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredUsers.map((userObj) => (
                <div
                  key={userObj.id}
                  className={`bg-surface-container rounded-lg p-5 border relative overflow-hidden group hover:shadow-[0_0_20px_rgba(255,45,120,0.15)] transition-all duration-300 ${
                    userObj.role === "ADMIN" ? "border-primary/30" : "border-outline-variant/60"
                  } ${!userObj.isActive && 'opacity-65'}`}
                >
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full overflow-hidden border ${
                        userObj.role === "ADMIN" ? 'border-primary/50 shadow-[0_0_8px_rgba(255,45,120,0.3)]' : 'border-secondary/50'
                      }`}>
                        <img alt="Avatar" className="w-full h-full object-cover grayscale opacity-80" src={getAvatarImage(userObj.role)} />
                      </div>
                      <div>
                        <h3 className="font-headline font-bold text-on-surface text-base group-hover:text-primary transition-colors">
                          {userObj.name}
                        </h3>
                        <p className="font-body text-xs text-on-surface-variant">@{userObj.username}</p>
                      </div>
                    </div>
                    {/* Role Tag */}
                    <span className={`px-2 py-0.5 border text-[10px] font-label uppercase tracking-widest rounded ${
                      userObj.role === "ADMIN"
                        ? "bg-tertiary/10 border-tertiary/40 text-tertiary neon-text-tertiary"
                        : "bg-surface-dim border-outline text-on-surface-variant"
                    }`}>
                      {userObj.role}
                    </span>
                  </div>

                  <div className="space-y-2 mb-6 text-sm border-t border-b border-outline-variant/40 py-3 font-body">
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-label text-xs">Email</span>
                      <span className="text-on-surface text-xs font-semibold">{userObj.email}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-on-surface-variant font-label text-xs">Department</span>
                      <span className="text-on-surface text-xs font-semibold">{userObj.department || "General"}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex justify-between items-center pt-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-label text-[10px] uppercase tracking-wider ${
                        userObj.isActive ? 'text-primary neon-text-primary' : 'text-on-surface-variant'
                      }`}>
                        {userObj.isActive ? 'Active' : 'Inactive'}
                      </span>
                      
                      {/* Active Status Switch */}
                      <button
                        onClick={() => toggleUserActive(userObj)}
                        className={`w-9 h-5 rounded-full relative transition-colors duration-300 border ${
                          userObj.isActive
                            ? "bg-primary border-primary shadow-[0_0_8px_rgba(255,45,120,0.5)]"
                            : "bg-surface-dim border-outline-variant"
                        }`}
                      >
                        <span className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full bg-on-surface transition-transform duration-300 ${
                          userObj.isActive ? 'translate-x-4' : 'translate-x-0'
                        }`} />
                      </button>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => openEdit(userObj)}
                        className="w-8 h-8 rounded bg-surface-dim border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-secondary hover:border-secondary hover:shadow-[0_0_10px_rgba(0,255,204,0.3)] transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">edit</span>
                      </button>
                      <button
                        onClick={() => openDelete(userObj)}
                        className="w-8 h-8 rounded bg-surface-dim border border-outline-variant flex items-center justify-center text-on-surface-variant hover:text-error hover:border-error hover:shadow-[0_0_10px_rgba(255,68,68,0.3)] transition-all"
                      >
                        <span className="material-symbols-outlined text-[16px]">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-xl p-6 border-primary/40 shadow-[0_0_30px_rgba(255,45,120,0.2)]">
            <h3 className="font-headline font-bold text-lg text-primary neon-text-primary uppercase mb-4">เพิ่มผู้ใช้ระบบใหม่</h3>
            {errorMsg && <p className="text-error text-xs font-label mb-3">{errorMsg}</p>}
            <form onSubmit={handleAdd} className="space-y-4 font-label text-sm text-on-surface">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-bold">ชื่อผู้ใช้ (Username)</label>
                  <input required value={formUsername} onChange={(e) => setFormUsername(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" placeholder="เช่น somchai" />
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-bold">รหัสผ่าน (Password)</label>
                  <input required value={formPassword} onChange={(e) => setFormPassword(e.target.value)} type="password" minLength={6} className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" placeholder="อย่างน้อย 6 หลัก" />
                </div>
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-bold">ชื่อ-นามสกุล (Full Name)</label>
                <input required value={formName} onChange={(e) => setFormName(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" placeholder="เช่น สมชาย เข็มกลัด" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-bold">อีเมล (Email)</label>
                <input required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} type="email" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" placeholder="user@company.com" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-bold">บทบาท (Role)</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value as "ADMIN" | "STAFF")} className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface">
                    <option value="STAFF">Staff (ขายหน้าบ้าน)</option>
                    <option value="ADMIN">Admin (จัดการระบบ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-bold">แผนก (Department)</label>
                  <input value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" placeholder="เช่น Sales, IT" />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 border border-outline text-on-surface-variant rounded hover:text-on-surface">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-primary/20 border border-primary text-primary rounded hover:bg-primary/30">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-md rounded-xl p-6 border-secondary/40 shadow-[0_0_30px_rgba(0,255,204,0.2)]">
            <h3 className="font-headline font-bold text-lg text-secondary neon-text-secondary uppercase mb-4">แก้ไขสิทธิ์ผู้ใช้งาน</h3>
            {errorMsg && <p className="text-error text-xs font-label mb-3">{errorMsg}</p>}
            <form onSubmit={handleEdit} className="space-y-4 font-label text-sm text-on-surface">
              <div className="opacity-60">
                <label className="block text-xs text-on-surface-variant mb-1 font-bold">ชื่อผู้ใช้ (Username - ห้ามแก้ไข)</label>
                <input disabled value={selectedUser.username} type="text" className="w-full bg-surface-dim border border-outline-variant rounded p-2 text-on-surface-variant" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-bold">เปลี่ยนรหัสผ่าน (New Password - ปล่อยว่างถ้าไม่ต้องการเปลี่ยน)</label>
                <input value={formPassword} onChange={(e) => setFormPassword(e.target.value)} type="password" minLength={6} className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" placeholder="กรอกรหัสผ่านใหม่" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-bold">ชื่อ-นามสกุล (Full Name)</label>
                <input required value={formName} onChange={(e) => setFormName(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
              </div>
              <div>
                <label className="block text-xs text-on-surface-variant mb-1 font-bold">อีเมล (Email)</label>
                <input required value={formEmail} onChange={(e) => setFormEmail(e.target.value)} type="email" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-bold">บทบาท (Role)</label>
                  <select value={formRole} onChange={(e) => setFormRole(e.target.value as "ADMIN" | "STAFF")} className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface">
                    <option value="STAFF">Staff (ขายหน้าบ้าน)</option>
                    <option value="ADMIN">Admin (จัดการระบบ)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-on-surface-variant mb-1 font-bold">แผนก (Department)</label>
                  <input value={formDepartment} onChange={(e) => setFormDepartment(e.target.value)} type="text" className="w-full bg-surface-dim border border-outline rounded p-2 text-on-surface" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <span className="text-xs text-on-surface-variant font-bold">สถานะบัญชีผู้ใช้งาน (Is Active)</span>
                <button
                  type="button"
                  onClick={() => setFormIsActive(!formIsActive)}
                  className={`w-9 h-5 rounded-full relative border transition-colors duration-300 ${
                    formIsActive ? "bg-secondary border-secondary shadow-[0_0_8px_rgba(0,255,204,0.4)]" : "bg-surface-dim border-outline-variant"
                  }`}
                >
                  <span className={`absolute top-[2px] left-[2px] w-3.5 h-3.5 rounded-full bg-on-surface transition-transform duration-300 ${
                    formIsActive ? 'translate-x-4' : 'translate-x-0'
                  }`} />
                </button>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-4 py-2 border border-outline text-on-surface-variant rounded hover:text-on-surface">ยกเลิก</button>
                <button type="submit" className="px-4 py-2 bg-secondary/20 border border-secondary text-secondary rounded hover:bg-secondary/30">บันทึก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedUser && (
        <div className="fixed inset-0 z-[10000] bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="glass-panel w-full max-w-sm rounded-xl p-6 border-error/50 shadow-[0_0_20px_rgba(255,68,68,0.2)] text-center">
            <span className="material-symbols-outlined text-5xl text-error">person_remove</span>
            <h3 className="font-headline font-bold text-lg text-on-surface mt-3">ยืนยันการลบบัญชี?</h3>
            <p className="font-body text-xs text-on-surface-variant mt-2 leading-relaxed">
              คุณต้องการลบบัญชีผู้ใช้ <span className="text-error font-bold">{selectedUser.name}</span> หรือไม่? พนักงานรายนี้จะไม่สามารถเข้าสู่ระบบได้อีกต่อไป
            </p>
            <div className="flex justify-center gap-2 mt-6 font-label text-xs">
              <button onClick={() => setShowDeleteModal(false)} className="px-4 py-2 border border-outline rounded text-on-surface-variant hover:text-on-surface">ยกเลิก</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-error/20 border border-error text-error rounded hover:bg-error/35">ยืนยันการลบ</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
