import React, { useState } from "react";
import { Users, MapPin, LogOut, LayoutDashboard, Settings, Globe, Shield, ExternalLink, Layers } from "lucide-react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { clearSession, getUser } from "../utils/auth";
import LogoutConfirmModal from "./LogoutConfirmModal";

const MENU = [
  { to: "/admin/dashboard", label: "แดชบอร์ด", icon: LayoutDashboard },
  { to: "/admin/manage-places", label: "จัดการสถานที่", icon: MapPin },
  { to: "/admin/categories", label: "จัดการหมวดหมู่", icon: Layers },
  { to: "/admin/users", label: "จัดการสมาชิก", icon: Users },
];

// Sidebar + พื้นที่เนื้อหาของหน้า Admin ใช้ร่วมกันทุกหน้า
const AdminLayout = ({ children, maxWidth = "max-w-6xl" }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const user = getUser();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    clearSession();
    window.location.href = "/login";
  };

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-rose-50/30">
      <aside className="w-64 bg-slate-900/95 backdrop-blur-xl text-white flex flex-col fixed top-[76px] md:top-[82px] bottom-0 left-0 z-40 border-r border-slate-800 shadow-2xl">
        {/* Header Section */}
        <div className="p-4 sm:p-5 border-b border-slate-800/80">
          <Link to="/admin/dashboard" className="flex items-center gap-3.5 group">
            <div className="relative shrink-0">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-pink-500 via-rose-500 to-indigo-600 p-[2px] shadow-lg shadow-pink-500/25 group-hover:shadow-pink-500/50 transition-all duration-300">
                <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center p-1 overflow-hidden">
                  <img
                    src="/logo.png"
                    alt="JP Trip Logo"
                    className="w-full h-full object-contain filter drop-shadow group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 leading-none">
                <span className="text-xl font-black tracking-tight text-white group-hover:text-pink-400 transition-colors whitespace-nowrap">
                  JP TRIP
                </span>
                <span className="text-[11px] font-bold text-pink-400 bg-pink-500/15 px-2 py-0.5 rounded-full border border-pink-500/30 whitespace-nowrap">
                  Admin
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wide mt-1.5 truncate">
                ระบบจัดการข้อมูลท่องเที่ยว
              </p>
            </div>
          </Link>
        </div>

        {/* Navigation Menu */}
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto">
          <p className="px-3 pt-2 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-500">เมนูจัดการระบบ</p>
          {MENU.map(({ to, label, icon: Icon }) => {
            const isActive = pathname === to;
            return (
              <button
                key={to}
                onClick={() => navigate(to)}
                className={`w-full flex items-center gap-3.5 px-4 py-3 rounded-xl font-bold text-sm transition-all duration-200 group relative ${isActive
                    ? "bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg shadow-pink-600/30 font-black"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/70"
                  }`}
              >
                <Icon size={19} className={`transition-transform duration-200 group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-pink-400"}`} />
                <span>{label}</span>
                {isActive && (
                  <span className="ml-auto w-1.5 h-4 bg-white/80 rounded-full" />
                )}
              </button>
            );
          })}

          <div className="pt-4">
            <p className="px-3 pb-1 text-[11px] font-black uppercase tracking-wider text-slate-500">ทางลัดเว็บไซต์</p>
            <Link
              to="/"
              className="w-full flex items-center gap-3.5 px-4 py-2.5 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 font-medium text-sm transition-all group"
            >
              <Globe size={18} className="text-slate-400 group-hover:text-blue-400 transition-colors" />
              <span>ดูหน้าเว็บไซต์หลัก</span>
              <ExternalLink size={14} className="ml-auto opacity-50 group-hover:opacity-100" />
            </Link>
          </div>
        </nav>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
          {user && (
            <div className="px-3 py-2 mb-2 rounded-xl bg-slate-800/40 border border-slate-700/50 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-pink-500 to-indigo-500 flex items-center justify-center text-xs font-black text-white">
                {user.name ? user.name[0].toUpperCase() : "A"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-slate-200 truncate">{user.name}</p>
                <p className="text-[10px] text-pink-400 font-medium">Administrator</p>
              </div>
            </div>
          )}

          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center justify-center gap-2 p-2.5 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-xl font-bold text-sm transition-all"
          >
            <LogOut size={18} /> ออกจากระบบ
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 pt-24 p-8 transition-all">
        <div className={`${maxWidth} mx-auto`}>{children}</div>
      </main>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={user?.name}
      />
    </div>
  );
};

export default AdminLayout;
