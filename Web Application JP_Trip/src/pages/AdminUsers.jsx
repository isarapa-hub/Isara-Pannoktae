import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  Trash2,
  ShieldCheck,
  ShieldOff,
  Users,
  Shield,
  CheckCircle2,
  AlertTriangle,
  X,
  Sparkles,
  Heart,
  Compass,
  Activity,
  Filter,
  User,
  UserCheck,
  Lock,
  KeyRound,
  Copy,
  Check,
  Mail,
  FileText,
  HelpCircle,
  RefreshCw,
  Clock,
  Send,
} from 'lucide-react';
import api, { errMsg } from '../connectAPI/axios';
import AdminLayout from '../components/AdminLayout';
import { getUser } from '../utils/auth';

// สี Avatar ตามชื่อผู้ใช้
const getAvatarGradient = (name = '') => {
  const gradients = [
    'from-rose-500 to-pink-600',
    'from-blue-500 to-indigo-600',
    'from-emerald-500 to-teal-600',
    'from-amber-500 to-orange-600',
    'from-purple-500 to-violet-600',
    'from-cyan-500 to-blue-600',
  ];
  const charCode = (name.charCodeAt(0) || 0) + (name.charCodeAt(name.length - 1) || 0);
  return gradients[charCode % gradients.length];
};

const AdminUsers = () => {
  const me = getUser();
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') === 'requests' ? 'requests' : 'members';
  const [activeTab, setActiveTab] = useState(initialTab);

  const [users, setUsers] = useState([]);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [term, setTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all'); // 'all' | 'admin' | 'user'
  const [requestFilter, setRequestFilter] = useState('all'); // 'all' | 'pending' | 'approved' | 'rejected'

  // Modal States
  const [roleModal, setRoleModal] = useState({ isOpen: false, user: null, targetRole: '' });
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, user: null });
  const [deleteRequestModal, setDeleteRequestModal] = useState({ isOpen: false, request: null });
  const [rejectRequestModal, setRejectRequestModal] = useState({ isOpen: false, request: null });
  const [successModal, setSuccessModal] = useState({ isOpen: false, message: '' });
  const [isProcessing, setIsProcessing] = useState(false);

  // Modal ดูข้อมูลกรณีลืมรหัสผ่าน (ตารางที่ 4-14 / TC: N-001)
  const [recoveryModal, setRecoveryModal] = useState({ isOpen: false, user: null });
  const [tempPassword, setTempPassword] = useState('');
  const [copiedField, setCopiedField] = useState(null); // 'id' | 'email' | 'password' | 'all'
  const [resettingPw, setResettingPw] = useState(false);
  const [pwResetSuccess, setPwResetSuccess] = useState(false);

  // Modal อนุมัติคำขอรีเซ็ตรหัสผ่าน (TC: N-001)
  const [approveModal, setApproveModal] = useState({ isOpen: false, request: null });
  const [approving, setApproving] = useState(false);

  const handleOpenRecoveryModal = (u) => {
    setRecoveryModal({ isOpen: true, user: u });
    setTempPassword('');
    setPwResetSuccess(false);
    setCopiedField(null);
  };

  const handleGenerateTempPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setTempPassword(`JP@${code}`);
    setPwResetSuccess(false);
  };

  const handleResetPassword = async () => {
    if (!recoveryModal.user || !tempPassword) return;
    setResettingPw(true);
    try {
      await api.put(`/admin/users/${recoveryModal.user.member_id}/reset-password`, {
        new_password: tempPassword,
      });
      setPwResetSuccess(true);
      setSuccessModal({
        isOpen: true,
        message: `ตั้งรหัสผ่านชั่วคราวให้ ${recoveryModal.user.name} สำเร็จ`,
      });
      await load();
      setTimeout(() => {
        setSuccessModal({ isOpen: false, message: '' });
      }, 2500);
    } catch (err) {
      alert(errMsg(err, 'ไม่สามารถรีเซ็ตรหัสผ่านได้'));
    } finally {
      setResettingPw(false);
    }
  };

  const handleCopyText = (text, fieldName) => {
    navigator.clipboard?.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const load = async () => {
    try {
      setLoading(true);
      const [usersRes, reqsRes] = await Promise.all([
        api.get('/admin/users'),
        api.get('/admin/password-resets'),
      ]);
      setUsers(usersRes.data || []);
      setRequests(reqsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // เปิด Modal อนุมัติคำขอรีเซ็ตรหัสผ่าน (อนุมัติให้สมาชิกตั้งรหัสผ่านใหม่)
  const handleOpenApproveModal = (reqItem) => {
    setApproveModal({
      isOpen: true,
      request: reqItem,
    });
  };

  const handleConfirmApprove = async () => {
    if (!approveModal.request) return;
    setApproving(true);
    try {
      await api.put(`/admin/password-resets/${approveModal.request.request_id}/approve`);
      setSuccessModal({
        isOpen: true,
        message: `อนุมัติให้ ${approveModal.request.name || approveModal.request.email} ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว`,
      });
      setApproveModal({ isOpen: false, request: null });
      await load();
      setTimeout(() => {
        setSuccessModal({ isOpen: false, message: '' });
      }, 2500);
    } catch (err) {
      alert(errMsg(err, 'ไม่สามารถอนุมัติคำขอได้'));
    } finally {
      setApproving(false);
    }
  };

  const handleConfirmRejectRequest = async () => {
    if (!rejectRequestModal.request) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/password-resets/${rejectRequestModal.request.request_id}/reject`);
      setRejectRequestModal({ isOpen: false, request: null });
      setSuccessModal({ isOpen: true, message: 'ปฏิเสธคำขอรีเซ็ตรหัสผ่านเรียบร้อยแล้ว' });
      await load();
      setTimeout(() => setSuccessModal({ isOpen: false, message: '' }), 2000);
    } catch (err) {
      alert(errMsg(err, 'ไม่สามารถปฏิเสธคำขอได้'));
    } finally {
      setIsProcessing(false);
    }
  };

  const handleConfirmDeleteRequest = async () => {
    if (!deleteRequestModal.request) return;
    setIsProcessing(true);
    try {
      await api.delete(`/admin/password-resets/${deleteRequestModal.request.request_id}`);
      setDeleteRequestModal({ isOpen: false, request: null });
      setSuccessModal({ isOpen: true, message: 'ลบประวัติคำขอสำเร็จแล้ว' });
      await load();
      setTimeout(() => setSuccessModal({ isOpen: false, message: '' }), 2000);
    } catch (err) {
      alert(errMsg(err, 'ไม่สามารถลบประวัติคำขอได้'));
    } finally {
      setIsProcessing(false);
    }
  };

  // ดูข้อมูลสมาชิกเพื่อตรวจสอบตัวตน (TC: N-001) จากแถวคำขอ
  const handleInspectRequestUser = (reqItem) => {
    const target = users.find((u) => u.member_id === reqItem.member_id) || {
      member_id: reqItem.member_id,
      name: reqItem.name || 'User',
      email: reqItem.email,
      role: reqItem.role || 'user',
      favorites_count: reqItem.favorites_count || 0,
      plans_count: reqItem.plans_count || 0,
    };
    handleOpenRecoveryModal(target);
  };

  // เปิด Modal ยืนยันเปลี่ยนสิทธิ์
  const handleOpenRoleModal = (u) => {
    const target = u.role === 'admin' ? 'user' : 'admin';
    setRoleModal({ isOpen: true, user: u, targetRole: target });
  };

  // ยืนยันเปลี่ยนสิทธิ์
  const handleConfirmChangeRole = async () => {
    if (!roleModal.user) return;
    setIsProcessing(true);
    try {
      await api.put(`/admin/users/${roleModal.user.member_id}/role`, {
        role: roleModal.targetRole,
      });
      const targetLabel = roleModal.targetRole === 'admin' ? 'ผู้ดูแลระบบ (Admin)' : 'สมาชิกทั่วไป (User)';
      setRoleModal({ isOpen: false, user: null, targetRole: '' });
      await load();
      // แสดงป๊อปอัปสำเร็จสไตล์ ภาพที่ ก-83
      setSuccessModal({
        isOpen: true,
        message: `เปลี่ยนสิทธิ์เป็น ${targetLabel} สำเร็จ`,
      });
      setTimeout(() => {
        setSuccessModal({ isOpen: false, message: '' });
      }, 2400);
    } catch (err) {
      alert(errMsg(err, 'ไม่สามารถเปลี่ยนสิทธิ์ได้'));
    } finally {
      setIsProcessing(false);
    }
  };

  // เปิด Modal ยืนยันลบสมาชิก
  const handleOpenDeleteModal = (u) => {
    setDeleteModal({ isOpen: true, user: u });
  };

  // ยืนยันลบสมาชิก
  const handleConfirmDelete = async () => {
    if (!deleteModal.user) return;
    setIsProcessing(true);
    try {
      await api.delete(`/admin/users/${deleteModal.user.member_id}`);
      const deletedName = deleteModal.user.name;
      setDeleteModal({ isOpen: false, user: null });
      await load();
      // แสดงป๊อปอัปสำเร็จสไตล์ ภาพที่ ก-83
      setSuccessModal({
        isOpen: true,
        message: `ลบบัญชี ${deletedName} สำเร็จ`,
      });
      setTimeout(() => {
        setSuccessModal({ isOpen: false, message: '' });
      }, 2400);
    } catch (err) {
      alert(errMsg(err, 'ไม่สามารถลบข้อมูลสมาชิกได้'));
    } finally {
      setIsProcessing(false);
    }
  };

  // คำนวณสถิติ KPI
  const adminCount = useMemo(() => users.filter((u) => u.role === 'admin').length, [users]);
  const regularUserCount = useMemo(() => users.filter((u) => u.role !== 'admin').length, [users]);
  const totalActivities = useMemo(
    () => users.reduce((acc, u) => acc + (Number(u.favorites_count) || 0) + (Number(u.plans_count) || 0), 0),
    [users]
  );

  // กรองรายการสมาชิก
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        (u.name || '').toLowerCase().includes(term.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(term.toLowerCase()) ||
        String(u.member_id).includes(term);
      const matchRole =
        roleFilter === 'all'
          ? true
          : roleFilter === 'admin'
          ? u.role === 'admin'
          : u.role !== 'admin';
      return matchSearch && matchRole;
    });
  }, [users, term, roleFilter]);

  // จำนวนคำขอรีเซ็ตรหัสผ่านที่รออนุมัติ
  const pendingRequestsCount = useMemo(
    () => (Array.isArray(requests) ? requests.filter((r) => r.status === 'pending').length : 0),
    [requests]
  );

  // กรองรายการคำขอรีเซ็ตรหัสผ่าน
  const filteredRequests = useMemo(() => {
    if (!Array.isArray(requests)) return [];
    return requests.filter((r) => {
      const matchSearch =
        (r.name || '').toLowerCase().includes(term.toLowerCase()) ||
        (r.email || '').toLowerCase().includes(term.toLowerCase()) ||
        (r.reason || '').toLowerCase().includes(term.toLowerCase()) ||
        String(r.request_id).includes(term) ||
        String(r.member_id).includes(term);
      const matchStatus =
        requestFilter === 'all' ? true : r.status === requestFilter;
      return matchSearch && matchStatus;
    });
  }, [requests, term, requestFilter]);

  return (
    <AdminLayout maxWidth="max-w-7xl">
      {/* Header Banner */}
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 md:p-10 text-white shadow-2xl mb-8 border border-slate-700/50">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-16 w-72 h-72 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              จัดการข้อมูลบัญชีผู้ใช้และระบบ
            </h1>
            <p className="text-slate-300 text-sm md:text-base font-normal">
              จัดการบัญชีผู้ใช้งานสำหรับผู้ดูแลระบบ กำหนดสิทธิ์ Admin/User และควบคุมสถานะการใช้งาน
            </p>
          </div>
        </div>
      </header>

      {/* 4 KPI Summary Cards (ตามภาพอ้างอิง) */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shrink-0 border border-rose-100">
            <Users size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ผู้ใช้งานทั้งหมด</p>
            <div className="text-3xl font-black text-slate-900 mt-0.5">
              {users.length} <span className="text-sm font-bold text-slate-400">คน</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1">บัญชีในระบบทั้งหมด</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center shrink-0 border border-pink-100">
            <ShieldCheck size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">ผู้ดูแลระบบ</p>
            <div className="text-3xl font-black text-slate-900 mt-0.5">
              {adminCount} <span className="text-sm font-bold text-slate-400">คน</span>
            </div>
            <p className="text-[11px] text-pink-500 font-bold mt-1">สิทธิ์ระดับ Admin</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0 border border-indigo-100">
            <UserCheck size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">สมาชิกทั่วไป</p>
            <div className="text-3xl font-black text-slate-900 mt-0.5">
              {regularUserCount} <span className="text-sm font-bold text-slate-400">คน</span>
            </div>
            <p className="text-[11px] text-indigo-500 font-bold mt-1">สิทธิ์ระดับ User</p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm flex items-center gap-4 hover:shadow-md transition-shadow">
          <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
            <Activity size={26} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">กิจกรรมรวมในระบบ</p>
            <div className="text-3xl font-black text-slate-900 mt-0.5">
              {totalActivities} <span className="text-sm font-bold text-slate-400">รายการ</span>
            </div>
            <p className="text-[11px] text-emerald-500 font-bold mt-1">บันทึกโปรด & แผนเที่ยว</p>
          </div>
        </div>
      </section>

      {/* Feature Scope Highlight Banner: การดูข้อมูลสมาชิกกรณีลืมรหัสผ่าน (TC: N-001) */}
      <section className="bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-indigo-500/10 border border-amber-200/80 rounded-[2rem] p-5 sm:p-6 mb-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/25">
            <KeyRound size={24} />
          </div>
          <div>
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              ฟังก์ชันการจัดการดูข้อมูลสมาชิกกรณีลืมรหัสผ่าน
            </h3>
          </div>
        </div>

        {pendingRequestsCount > 0 && activeTab !== 'requests' && (
          <button
            type="button"
            onClick={() => {
              setActiveTab('requests');
              setSearchParams({ tab: 'requests' });
            }}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-amber-600 to-rose-600 text-white font-black text-xs shadow-md shadow-amber-500/25 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 shrink-0 animate-bounce"
          >
            <KeyRound size={15} />
            <span>มี {pendingRequestsCount} คำขอรออนุมัติ</span>
          </button>
        )}
      </section>

      {/* Tabs Navigation: สมาชิกทั้งหมด / คำขอรีเซ็ตรหัสผ่าน */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <button
          type="button"
          onClick={() => {
            setActiveTab('members');
            setSearchParams({});
          }}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2.5 shadow-sm ${
            activeTab === 'members'
              ? 'bg-slate-900 text-white shadow-slate-900/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Users size={17} />
          <span>รายชื่อสมาชิกทั้งหมด</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'members' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {users.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => {
            setActiveTab('requests');
            setSearchParams({ tab: 'requests' });
          }}
          className={`px-5 py-3 rounded-2xl font-black text-xs sm:text-sm transition-all flex items-center gap-2.5 shadow-sm relative ${
            activeTab === 'requests'
              ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-pink-600 text-white shadow-rose-500/20'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <KeyRound size={17} className={activeTab === 'requests' ? 'text-white' : 'text-amber-500'} />
          <span>คำขอรีเซ็ตรหัสผ่านจากสมาชิก</span>
          <span
            className={`px-2 py-0.5 rounded-full text-xs font-bold ${
              activeTab === 'requests' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
            }`}
          >
            {requests.length}
          </span>
          {pendingRequestsCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-rose-500 text-white text-[10px] font-black animate-pulse shadow-sm">
              {pendingRequestsCount} รออนุมัติ
            </span>
          )}
        </button>
      </div>

      {/* Main Table Container: TAB 1 - สมาชิกทั้งหมด */}
      {activeTab === 'members' && (
        <section className="bg-white rounded-[2.5rem] shadow-md border border-slate-200/80 overflow-hidden mb-12">
          {/* Table Top Controls & Search Bar */}
          <div className="p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Users size={22} className="text-pink-600" />
              <h2 className="text-xl font-black text-slate-800">รายชื่อบัญชีผู้ใช้</h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 ml-1">
                พบ {filteredUsers.length} คน
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Filter Pills */}
              <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
                <button
                  onClick={() => setRoleFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    roleFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ทั้งหมด ({users.length})
                </button>
                <button
                  onClick={() => setRoleFilter('admin')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    roleFilter === 'admin'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ผู้ดูแล ({adminCount})
                </button>
                <button
                  onClick={() => setRoleFilter('user')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    roleFilter === 'user'
                      ? 'bg-indigo-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  สมาชิก ({regularUserCount})
                </button>
              </div>

              {/* Search Input with Clear Button */}
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="ค้นหาชื่อ อีเมล หรือ ID..."
                  className="pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all w-full sm:w-64 shadow-sm"
                />
                {term && (
                  <button
                    onClick={() => setTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/40 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6 font-bold">รหัส (ID)</th>
                  <th className="py-4 px-6 font-bold">ชื่อ - นามสกุล</th>
                  <th className="py-4 px-6 font-bold">อีเมลผู้ใช้งาน</th>
                  <th className="py-4 px-6 font-bold text-center">กิจกรรม (โปรด / แผน)</th>
                  <th className="py-4 px-6 font-bold text-center">ระดับสิทธิ์</th>
                  <th className="py-4 px-6 font-bold text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  [...Array(5)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-5 w-12 bg-slate-200 rounded-lg animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-5 w-36 bg-slate-200 rounded animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-5 w-44 bg-slate-200 rounded animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-5 w-24 mx-auto bg-slate-200 rounded animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-6 w-20 mx-auto bg-slate-200 rounded-full animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-8 w-20 mx-auto bg-slate-200 rounded-xl animate-shimmer" /></td>
                    </tr>
                  ))
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="py-12 text-center text-slate-400 font-bold">
                      ไม่พบข้อมูลสมาชิกที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((u) => {
                    const isCurrentAdmin = u.member_id === me?.id;
                    const isAdmin = u.role === 'admin';
                    const hasPendingReset = Number(u.pending_reset_requests) > 0;

                    return (
                      <tr key={u.member_id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* ID */}
                        <td className="py-4 px-6 font-mono text-slate-400 font-bold text-xs">
                          <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 font-black">
                            #{String(u.member_id).padStart(4, '0')}
                          </span>
                        </td>

                        {/* Name & Avatar */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                                u.name || 'User'
                              )} text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0`}
                            >
                              {(u.name || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-2 flex-wrap">
                                <span>{u.name}</span>
                                {hasPendingReset && (
                                  <span
                                    onClick={() => {
                                      setActiveTab('requests');
                                      setSearchParams({ tab: 'requests' });
                                    }}
                                    className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-800 border border-amber-300 animate-pulse flex items-center gap-1 cursor-pointer hover:bg-amber-200 transition-colors"
                                    title="คลิกเพื่อดูคำขอรีเซ็ตรหัสผ่าน"
                                  >
                                    <KeyRound size={10} /> แจ้งลืมรหัสผ่าน
                                  </span>
                                )}
                                {isCurrentAdmin && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-pink-100 text-pink-700 border border-pink-200">
                                    คุณ (ปัจจุบัน)
                                  </span>
                                )}
                              </div>
                              <div className="text-xs text-slate-400 sm:hidden">{u.email}</div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 text-slate-500 font-medium">{u.email}</td>

                        {/* Engagement */}
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                            <span className="flex items-center gap-1 text-pink-600" title="รายการโปรด">
                              <Heart size={13} fill="currentColor" /> {u.favorites_count || 0}
                            </span>
                            <span className="text-slate-300">|</span>
                            <span className="flex items-center gap-1 text-indigo-600" title="แผนการเดินทาง">
                              <Compass size={13} /> {u.plans_count || 0}
                            </span>
                          </div>
                        </td>

                        {/* Role Badge */}
                        <td className="py-4 px-6 text-center">
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                              isAdmin
                                ? 'bg-pink-100 text-pink-700 border border-pink-200 shadow-sm'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {isAdmin ? <Shield size={12} className="text-pink-600" /> : null}
                            {isAdmin ? 'ADMIN' : 'USER'}
                          </span>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-2">
                            {/* ปุ่มดูข้อมูลสมาชิก (TC: N-001) */}
                            <button
                              onClick={() => handleOpenRecoveryModal(u)}
                              title="ดูข้อมูลสมาชิก (TC: N-001)"
                              className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm"
                            >
                              <User size={16} />
                            </button>

                            <button
                              disabled={isCurrentAdmin}
                              onClick={() => handleOpenRoleModal(u)}
                              title={
                                isCurrentAdmin
                                  ? 'ไม่สามารถเปลี่ยนสิทธิ์บัญชีของตนเองได้'
                                  : isAdmin
                                  ? 'เปลี่ยนเป็นสมาชิกทั่วไป (User)'
                                  : 'แต่งตั้งเป็นผู้ดูแลระบบ (Admin)'
                              }
                              className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none"
                            >
                              {isAdmin ? <ShieldOff size={16} /> : <ShieldCheck size={16} />}
                            </button>

                            <button
                              disabled={isCurrentAdmin}
                              onClick={() => handleOpenDeleteModal(u)}
                              title={isCurrentAdmin ? 'ไม่สามารถลบบัญชีของตนเองได้' : 'ลบบัญชีสมาชิกนี้'}
                              className="p-2.5 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm disabled:opacity-30 disabled:pointer-events-none"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer info bar */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>แสดง {filteredUsers.length} จากสมาชิกทั้งหมด {users.length} คน</span>
            <span>ระบบรักษาความปลอดภัยฐานข้อมูล JP Trip</span>
          </div>
        </section>
      )}

      {/* Main Table Container: TAB 2 - คำขอรีเซ็ตรหัสผ่านจากสมาชิก (TC: N-001) */}
      {activeTab === 'requests' && (
        <section className="bg-white rounded-[2.5rem] shadow-md border border-slate-200/80 overflow-hidden mb-12">
          {/* Table Top Controls & Search Bar */}
          <div className="p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <KeyRound size={22} className="text-amber-600" />
              <h2 className="text-xl font-black text-slate-800">คำขอรีเซ็ตรหัสผ่านจากสมาชิก</h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 ml-1">
                พบ {filteredRequests.length} คำขอ
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              {/* Status Filter Pills */}
              <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
                <button
                  onClick={() => setRequestFilter('all')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    requestFilter === 'all'
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ทั้งหมด ({requests.length})
                </button>
                <button
                  onClick={() => setRequestFilter('pending')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all flex items-center gap-1 ${
                    requestFilter === 'pending'
                      ? 'bg-amber-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <Clock size={12} />
                  <span>รออนุมัติ ({pendingRequestsCount})</span>
                </button>
                <button
                  onClick={() => setRequestFilter('approved')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    requestFilter === 'approved'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  อนุมัติแล้ว
                </button>
                <button
                  onClick={() => setRequestFilter('completed')}
                  className={`px-3.5 py-1.5 rounded-xl transition-all ${
                    requestFilter === 'completed'
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  ตั้งรหัสใหม่แล้ว
                </button>
              </div>

              {/* Search Input with Clear Button */}
              <div className="relative">
                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                />
                <input
                  type="text"
                  value={term}
                  onChange={(e) => setTerm(e.target.value)}
                  placeholder="ค้นหาชื่อ อีเมล หรือข้อความ..."
                  className="pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all w-full sm:w-64 shadow-sm"
                />
                {term && (
                  <button
                    onClick={() => setTerm('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Requests Table Content */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/40 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6 font-bold">รหัสคำขอ</th>
                  <th className="py-4 px-6 font-bold">สมาชิกผู้แจ้ง</th>
                  <th className="py-4 px-6 font-bold">อีเมลผู้ใช้งาน</th>
                  <th className="py-4 px-6 font-bold">เหตุผล / ข้อความแจ้ง</th>
                  <th className="py-4 px-6 font-bold text-center">วันที่แจ้งเรื่อง</th>
                  <th className="py-4 px-6 font-bold text-center">สถานะ</th>
                  <th className="py-4 px-6 font-bold text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {loading ? (
                  [...Array(3)].map((_, i) => (
                    <tr key={i} className="animate-pulse">
                      <td className="py-4 px-6"><div className="h-5 w-16 bg-slate-200 rounded animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-5 w-36 bg-slate-200 rounded animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-5 w-40 bg-slate-200 rounded animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-5 w-48 bg-slate-200 rounded animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-5 w-24 mx-auto bg-slate-200 rounded animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-6 w-20 mx-auto bg-slate-200 rounded-full animate-shimmer" /></td>
                      <td className="py-4 px-6"><div className="h-8 w-24 mx-auto bg-slate-200 rounded-xl animate-shimmer" /></td>
                    </tr>
                  ))
                ) : filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="py-12 text-center text-slate-400 font-bold">
                      ไม่พบรายการคำขอรีเซ็ตรหัสผ่านในระบบ
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((r) => {
                    const isPending = r.status === 'pending';
                    const isApproved = r.status === 'approved';
                    const isCompleted = r.status === 'completed';

                    return (
                      <tr key={r.request_id} className="hover:bg-slate-50/80 transition-colors group">
                        {/* Request ID */}
                        <td className="py-4 px-6 font-mono text-slate-400 font-bold text-xs">
                          <span className="px-2 py-1 rounded-md bg-amber-50 text-amber-800 border border-amber-200 font-black">
                            #REQ-{String(r.request_id).padStart(4, '0')}
                          </span>
                        </td>

                        {/* Member */}
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                                r.name || 'User'
                              )} text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0`}
                            >
                              {(r.name || 'U')[0].toUpperCase()}
                            </div>
                            <div>
                              <div className="font-bold text-slate-900 flex items-center gap-1.5">
                                <span>{r.name || 'ไม่ระบุชื่อ'}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Email */}
                        <td className="py-4 px-6 text-slate-600 font-mono text-xs">{r.email}</td>

                        {/* Reason */}
                        <td className="py-4 px-6 text-slate-600 max-w-xs">
                          <p className="line-clamp-2 text-xs leading-relaxed">
                            {r.reason || 'แจ้งลืมรหัสผ่าน ขอให้ผู้ดูแลระบบช่วยเหลือ'}
                          </p>
                        </td>

                        {/* Created At */}
                        <td className="py-4 px-6 text-center text-slate-500 text-xs">
                          {r.created_at
                            ? new Date(r.created_at).toLocaleString('th-TH', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })
                            : '-'}
                        </td>

                        {/* Status */}
                        <td className="py-4 px-6 text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <span
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase ${
                                isCompleted
                                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                                  : isApproved
                                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200 shadow-sm'
                                  : isPending
                                  ? 'bg-amber-100 text-amber-800 border border-amber-300 animate-pulse'
                                  : 'bg-rose-100 text-rose-700 border border-rose-200'
                              }`}
                            >
                              {isCompleted && <CheckCircle2 size={12} />}
                              {isApproved && <CheckCircle2 size={12} />}
                              {isPending && <Clock size={12} />}
                              {!isCompleted && !isApproved && !isPending && <X size={12} />}
                              {isCompleted
                                ? 'ตั้งรหัสใหม่แล้ว'
                                : isApproved
                                ? 'อนุมัติแล้ว (รอตั้งรหัส)'
                                : isPending
                                ? 'รออนุมัติ'
                                : 'ถูกปฏิเสธ'}
                            </span>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="py-4 px-6 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* ปุ่มดูข้อมูลสมาชิกเพื่อยืนยันตัวตน (TC: N-001) */}
                            <button
                              onClick={() => handleInspectRequestUser(r)}
                              title="ดูข้อมูลสมาชิกเพื่อตรวจสอบ / ยืนยันตัวตน (TC: N-001)"
                              className="p-2 rounded-xl bg-amber-50 text-amber-700 hover:bg-amber-600 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
                            >
                              <FileText size={15} />
                              <span className="hidden xl:inline">ดูข้อมูล</span>
                            </button>

                            {/* ปุ่มอนุมัติคำขอ */}
                            {isPending && (
                              <button
                                onClick={() => handleOpenApproveModal(r)}
                                title="อนุมัติให้สมาชิกตั้งรหัสผ่านใหม่"
                                className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-sm flex items-center gap-1 text-xs font-bold"
                              >
                                <CheckCircle2 size={15} />
                                <span className="hidden xl:inline">อนุมัติ</span>
                              </button>
                            )}

                            {/* ปุ่มปฏิเสธ */}
                            {isPending && (
                              <button
                                onClick={() => setRejectRequestModal({ isOpen: true, request: r })}
                                title="ปฏิเสธคำขอนี้"
                                className="p-2 rounded-xl bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-600 transition-all shadow-sm"
                              >
                                <X size={15} />
                              </button>
                            )}

                            {/* ปุ่มลบประวัติ */}
                            {!isPending && (
                              <button
                                onClick={() => setDeleteRequestModal({ isOpen: true, request: r })}
                                title="ลบประวัติคำขอนี้"
                                className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                              >
                                <Trash2 size={15} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Footer info bar */}
          <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>แสดง {filteredRequests.length} จากคำขอทั้งหมด {requests.length} รายการ</span>
            <span>ระบบบริการช่วยเหลือกรณีลืมรหัสผ่าน (TC: N-001)</span>
          </div>
        </section>
      )}

      {/* ============================================================== */}
      {/* MODAL: อนุมัติให้สมาชิกตั้งรหัสผ่านใหม่ (TC: N-001)           */}
      {/* ============================================================== */}
      {approveModal.isOpen && approveModal.request && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-slate-100 text-left space-y-5 animate-scaleUp">
            <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
              <div className="flex items-center gap-3.5">
                <div className="w-13 h-13 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center font-bold shrink-0">
                  <KeyRound size={26} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">อนุมัติให้ตั้งรหัสผ่านใหม่</h3>
                  <p className="text-xs sm:text-sm text-slate-500 mt-0.5">อนุมัติให้สมาชิกตั้งรหัสผ่านใหม่ด้วยตนเอง (TC: N-001)</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setApproveModal({ isOpen: false, request: null })}
                className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Request Summary Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-slate-50 border border-slate-200/80 text-sm space-y-2.5">
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">สมาชิก:</span>
                <span className="font-bold text-slate-900 text-sm sm:text-base">{approveModal.request.name || 'ไม่ระบุชื่อ'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">อีเมล:</span>
                <span className="font-mono font-bold text-slate-900 text-sm">{approveModal.request.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-medium">รหัสสมาชิก:</span>
                <span className="font-mono font-black text-pink-600 text-sm sm:text-base">
                  #JP-{String(approveModal.request.member_id).padStart(4, '0')}
                </span>
              </div>
              {approveModal.request.reason && (
                <div className="pt-2.5 border-t border-slate-200 text-slate-700">
                  <span className="text-slate-500 block text-xs font-semibold mb-0.5">ข้อความแจ้งจากสมาชิก:</span>
                  <span className="italic font-medium">"{approveModal.request.reason}"</span>
                </div>
              )}
            </div>

            {/* Approval Info Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-2">
              <div className="font-bold flex items-center gap-2 text-emerald-800 text-sm sm:text-base">
                <CheckCircle2 size={18} className="shrink-0" /> สมาชิกจะได้รับสิทธิ์ตั้งรหัสผ่านใหม่
              </div>
              <p className="text-emerald-800 leading-relaxed text-xs sm:text-sm">
                เมื่อผู้ดูแลระบบกดอนุมัติ สมาชิกจะสามารถไปที่หน้าเข้าสู่ระบบ &gt; แท็บ <strong>"ตรวจสอบสถานะการอนุมัติ"</strong> เพื่อกำหนดรหัสผ่านใหม่ด้วยตนเองและเข้าสู่ระบบได้ทันที
              </p>
            </div>

            {/* Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setApproveModal({ isOpen: false, request: null })}
                className="flex-1 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                disabled={approving}
                onClick={handleConfirmApprove}
                className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-bold text-sm transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {approving ? <RefreshCw size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                <span>ยืนยันอนุมัติคำขอ</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 1. MODAL: ยืนยันการเปลี่ยนสิทธิ์ (สไตล์ ภาพที่ ก-85)            */}
      {/* ============================================================== */}
      {roleModal.isOpen && roleModal.user && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-slate-100 text-center space-y-5 animate-scaleUp">
            {/* Warning Icon Circle เหมือนภาพที่ ก-85 */}
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-amber-300 flex items-center justify-center text-amber-500 bg-amber-50 shadow-inner">
              <span className="text-4xl font-black font-serif leading-none">!</span>
            </div>

            <div>
              <h3 className="text-2xl font-black text-rose-600">
                ยืนยันการเปลี่ยนสิทธิ์?
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                คุณต้องการเปลี่ยนสิทธิ์ของ{' '}
                <span className="font-black text-amber-600">{roleModal.user.name}</span>
                <br />
                จาก{' '}
                <span className="font-bold text-slate-700">
                  {roleModal.user.role?.toUpperCase()}
                </span>{' '}
                เป็น{' '}
                <span className="font-black text-pink-600 underline">
                  {roleModal.targetRole?.toUpperCase()}
                </span>{' '}
                หรือไม่?
              </p>
              <p className="text-xs text-slate-400 mt-2">
                (การเปลี่ยนสิทธิ์จะมีผลต่อการเข้าถึงระบบ Admin ทันที)
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmChangeRole}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all disabled:opacity-60"
              >
                {isProcessing ? 'กำลังดำเนินการ...' : 'เปลี่ยนสิทธิ์'}
              </button>
              <button
                type="button"
                onClick={() => setRoleModal({ isOpen: false, user: null, targetRole: '' })}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2. MODAL: ยืนยันการลบสมาชิก (สไตล์ ภาพที่ ก-85 สีแดง)            */}
      {/* ============================================================== */}
      {deleteModal.isOpen && deleteModal.user && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-slate-100 text-center space-y-5 animate-scaleUp">
            {/* Warning Icon Circle */}
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-rose-300 flex items-center justify-center text-rose-500 bg-rose-50 shadow-inner">
              <Trash2 size={36} className="stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-rose-600">
                ยืนยันการลบบัญชีสมาชิก?
              </h3>
              <p className="text-sm text-slate-600 mt-2 leading-relaxed">
                บัญชีของคุณ{' '}
                <span className="font-black text-slate-800">{deleteModal.user.name}</span>{' '}
                ({deleteModal.user.email})
                <br />
                จะไม่สามารถกู้คืนได้ และข้อมูลรายการโปรดรวมถึงแผนการเดินทางทั้งหมดจะถูกลบถาวร
              </p>
              <p className="text-xs text-rose-500 font-bold mt-2">
                ⚠️ การกระทำนี้ไม่สามารถย้อนกลับได้
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all disabled:opacity-60"
              >
                {isProcessing ? 'กำลังลบข้อมูล...' : 'ยืนยันการลบ'}
              </button>
              <button
                type="button"
                onClick={() => setDeleteModal({ isOpen: false, user: null })}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2.1 MODAL: ยืนยันการลบประวัติคำขอรีเซ็ตรหัสผ่าน                   */}
      {/* ============================================================== */}
      {deleteRequestModal.isOpen && deleteRequestModal.request && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-slate-100 text-center space-y-5 animate-scaleUp">
            {/* Warning Icon Circle */}
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-rose-300 flex items-center justify-center text-rose-500 bg-rose-50 shadow-inner">
              <Trash2 size={36} className="stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-rose-600">
                ยืนยันการลบประวัติคำขอ?
              </h3>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmDeleteRequest}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>กำลังลบข้อมูล...</span>
                  </>
                ) : (
                  <span>ยืนยันการลบ</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setDeleteRequestModal({ isOpen: false, request: null })}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 2.2 MODAL: ยืนยันการปฏิเสธคำขอรีเซ็ตรหัสผ่าน                     */}
      {/* ============================================================== */}
      {rejectRequestModal.isOpen && rejectRequestModal.request && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-md p-8 shadow-2xl border border-slate-100 text-center space-y-5 animate-scaleUp">
            {/* Warning Icon Circle */}
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-amber-300 flex items-center justify-center text-amber-500 bg-amber-50 shadow-inner">
              <X size={36} className="stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-2xl font-black text-slate-800">
                ยืนยันการปฏิเสธคำขอ?
              </h3>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleConfirmRejectRequest}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow-lg shadow-slate-900/25 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <RefreshCw size={16} className="animate-spin" />
                    <span>กำลังดำเนินการ...</span>
                  </>
                ) : (
                  <span>ยืนยันปฏิเสธ</span>
                )}
              </button>
              <button
                type="button"
                onClick={() => setRejectRequestModal({ isOpen: false, request: null })}
                disabled={isProcessing}
                className="flex-1 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
              >
                ยกเลิก
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 3. MODAL: ป๊อปอัปแจ้งเตือนเมื่อสำเร็จ (เหมือน ภาพที่ ก-83 เป๊ะๆ)   */}
      {/* ============================================================== */}
      {successModal.isOpen && (
        <div
          onClick={() => setSuccessModal({ isOpen: false, message: '' })}
          className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm cursor-pointer animate-fadeIn"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-[2rem] w-full max-w-sm p-8 shadow-2xl border border-slate-100 text-center space-y-4 animate-scaleUp cursor-default"
          >
            {/* วงกลมเครื่องหมายถูกสีเขียว เหมือนภาพที่ ก-83 */}
            <div className="w-20 h-20 mx-auto rounded-full border-4 border-emerald-400 flex items-center justify-center text-emerald-500 bg-emerald-50 shadow-inner">
              <CheckCircle2 size={44} className="stroke-[2.5]" />
            </div>

            <h3 className="text-xl font-black text-slate-800">
              {successModal.message}
            </h3>
            <p className="text-xs text-slate-400">
              ระบบบันทึกและอัปเดตข้อมูลลงฐานข้อมูลเรียบร้อยแล้ว
            </p>

            <button
              onClick={() => setSuccessModal({ isOpen: false, message: '' })}
              className="mt-2 px-6 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              ตกลง
            </button>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL: ดูข้อมูลสมาชิกกรณีลืมรหัสผ่าน (ตารางที่ 4-14 / TC: N-001) */}
      {/* ============================================================== */}
      {recoveryModal.isOpen && recoveryModal.user && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 sm:p-8 shadow-2xl border border-slate-100 text-left relative max-h-[92vh] overflow-y-auto animate-scaleUp">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => setRecoveryModal({ isOpen: false, user: null })}
              className="absolute top-6 right-6 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="ปิดหน้าต่าง"
            >
              <X size={20} />
            </button>

            {/* Modal Header */}
            <div className="flex items-center gap-4 mb-6">
              <div className="w-14 h-14 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center shrink-0 shadow-sm">
                <User size={28} />
              </div>
              <div className="pr-6">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                  ดูข้อมูลสมาชิก
                </h3>
                <p className="text-xs sm:text-sm text-slate-500 mt-1">
                  ระบบสำหรับผู้ดูแลระบบเพื่อเข้าค้นหาและดูข้อมูลบัญชีสำหรับช่วยเหลือ/ยืนยันตัวตน
                </p>
              </div>
            </div>

            {/* Profile Bento Summary Card */}
            <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 mb-6">
              <div className="flex items-center gap-4 mb-4 pb-4 border-b border-slate-200/60">
                <div
                  className={`w-14 h-14 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                    recoveryModal.user.name || 'User'
                  )} text-white flex items-center justify-center font-black text-xl shadow-sm shrink-0`}
                >
                  {(recoveryModal.user.name || 'U')[0].toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="text-base sm:text-lg font-black text-slate-900 truncate">
                      {recoveryModal.user.name}
                    </h4>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full uppercase ${
                        recoveryModal.user.role === 'admin'
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {recoveryModal.user.role}
                    </span>
                  </div>
                </div>
              </div>

              {/* Data Rows for Identity Check */}
              <div className="space-y-3 text-xs sm:text-sm">
                {/* Email with copy */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white border border-slate-200">
                  <span className="text-slate-600 font-semibold flex items-center gap-2">
                    <Mail size={16} className="text-slate-400" /> อีเมลในระบบ:
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 font-mono text-xs sm:text-sm">
                      {recoveryModal.user.email}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleCopyText(recoveryModal.user.email, 'email')}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors"
                      title="คัดลอกอีเมล"
                    >
                      {copiedField === 'email' ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification Checkpoints (เกณฑ์ยืนยันตัวตน) */}
            <div className="mb-6">
              <h5 className="text-xs sm:text-sm font-black text-slate-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                <HelpCircle size={16} className="text-amber-500" /> จุดตรวจสอบเพื่อยืนยันตัวตนสมาชิก:
              </h5>
              <div className="grid grid-cols-2 gap-3 text-xs sm:text-sm">
                <div className="p-3.5 rounded-xl bg-pink-50/70 border border-pink-100 flex items-center justify-between">
                  <span className="text-slate-700 font-semibold">สถานที่โปรดในบัญชี:</span>
                  <span className="font-black text-pink-600 text-sm sm:text-base">
                    {recoveryModal.user.favorites_count || 0} แห่ง
                  </span>
                </div>
                <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                  <span className="text-slate-700 font-semibold">แผนเที่ยวที่สร้างไว้:</span>
                  <span className="font-black text-indigo-600 text-sm sm:text-base">
                    {recoveryModal.user.plans_count || 0} แผน
                  </span>
                </div>
              </div>
            </div>

            {/* Close Button */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setRecoveryModal({ isOpen: false, user: null })}
                className="w-full sm:w-auto px-7 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-colors shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminUsers;
