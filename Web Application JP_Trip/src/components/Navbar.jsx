import React, { useState, useEffect } from 'react';
import { ChevronDown, User, LogOut, LayoutDashboard, Home, Search, Heart, Calendar, Menu, X, PhoneCall } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { getUser, clearSession } from '../utils/auth';
import LogoutConfirmModal from './LogoutConfirmModal';

const Navbar = () => {
  const [user, setUser] = useState(getUser());
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const checkUser = () => setUser(getUser());
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('storage', checkUser);
    window.addEventListener('userchange', checkUser);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('storage', checkUser);
      window.removeEventListener('userchange', checkUser);
    };
  }, []);

  useEffect(() => {
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
  }, [location.pathname]);

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    clearSession();
    setUser(null);
    navigate('/');
  };

  const isHomePage = location.pathname === '/';
  const solid = !isHomePage || isScrolled || isMobileOpen;

  const navbarStyle = solid
    ? `bg-white/90 backdrop-blur-xl shadow-xs border-b border-gray-100/80 ${isMobileOpen ? 'py-3' : 'min-h-[76px] md:min-h-[82px] py-2'}`
    : 'bg-gradient-to-b from-black/50 via-black/20 to-transparent py-4 text-white';
  const textStyle = solid ? 'text-gray-800' : 'text-white';
  const path = location.pathname;

  const items = [
    { to: '/', icon: <Home />, label: 'หน้าหลัก', active: path === '/' },
    { to: '/search', icon: <Search />, label: 'ค้นหา', active: path === '/search' || path === '/searchpage' },
    { to: '/favorites', icon: <Heart />, label: 'รายการโปรด', active: path === '/favorites' },
    { to: '/plan', icon: <Calendar />, label: 'วางแผนการเดินทาง', active: path === '/plan' },
    { to: '/contact', icon: <PhoneCall />, label: 'ติดต่อเรา', active: path === '/contact' || path === '/contace' },
  ];

  return (
    <>
      <nav className={`fixed w-full top-0 z-[100] transition-all duration-300 ${navbarStyle} px-6 md:px-12 flex flex-col justify-center`}>
      <div className="max-w-7xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center gap-8">

          <Link to="/" className="flex items-center transition-transform hover:scale-105 shrink-0 py-1 group">
            {/* ขนาดโลโก้ขยายใหญ่ โดดเด่น คมชัด */}
            <img
              src="/logo.png"
              alt="JP TRIP Logo"
              className="h-14 sm:h-16 md:h-20 w-auto object-contain drop-shadow-md group-hover:brightness-105 transition-all"
            />
          </Link>

          <div className="hidden lg:flex items-center gap-2">
            {items.map((it) => (
              <NavItem key={it.to} {...it} isScrolled={isScrolled} isHomePage={isHomePage} />
            ))}
          </div>
        </div>

        <div className="flex items-center gap-5">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className={`flex items-center gap-3 p-1.5 pr-5 rounded-full border transition-all ${solid ? 'bg-gray-50 border-gray-200 text-gray-800' : 'bg-white/20 border-white/20 text-white'
                  } hover:shadow-md`}
              >
                <Avatar user={user} />
                <span className="font-semibold text-base hidden sm:inline">{user.name}</span>
                <ChevronDown size={18} className={`transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-3 w-60 bg-white rounded-2xl shadow-2xl py-2 border border-gray-100 overflow-hidden">
                  <div className="px-5 py-3 border-b border-gray-50 bg-gray-50/50">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest">สถานะสมาชิก</p>
                      {(user.google_id || user.is_google_user) && (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-100/90 px-2 py-0.5 rounded-full flex items-center gap-1 border border-amber-200/60">
                          Google
                        </span>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-gray-800 truncate">{user.email}</p>
                  </div>
                  {user.role === 'admin' && (
                    <Link to="/admin/dashboard" className="flex items-center gap-3 px-5 py-3.5 text-indigo-600 hover:bg-indigo-50 font-semibold text-base border-b border-gray-50">
                      <LayoutDashboard size={20} /> จัดการข้อมูล
                    </Link>
                  )}
                  <Link to="/profile" className="flex items-center gap-3 px-5 py-3.5 text-gray-600 hover:bg-gray-50 font-semibold text-base">
                    <User size={20} /> โปรไฟล์ส่วนตัว
                  </Link>
                  <button
                    onClick={() => {
                      setIsDropdownOpen(false);
                      setShowLogoutModal(true);
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3.5 text-red-500 hover:bg-red-50 font-semibold text-base text-left transition-colors"
                  >
                    <LogOut size={20} /> ออกจากระบบ
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-6">
              <Link to="/login" className={`font-semibold text-[15px] transition-colors ${textStyle} hover:text-red-500`}>เข้าสู่ระบบ</Link>
              <Link to="/register" className="bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white px-7 py-2.5 rounded-full font-semibold shadow-md shadow-red-500/25 hover:shadow-red-500/40 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 text-[15px] hidden sm:block">
                สมัครสมาชิก
              </Link>
            </div>
          )}

          <button onClick={() => setIsMobileOpen(!isMobileOpen)} className={`lg:hidden p-2 rounded-xl ${textStyle}`} aria-label="เมนู">
            {isMobileOpen ? <X size={26} /> : <Menu size={26} />}
          </button>
        </div>
      </div>

      {isMobileOpen && (
        <div className="lg:hidden max-w-7xl mx-auto mt-4 pb-2 flex flex-col gap-1">
          {items.map((it) => (
            <NavItem key={it.to} {...it} isScrolled={true} isHomePage={false} />
          ))}
        </div>
      )}
      </nav>

      {/* Logout Confirmation Modal */}
      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={handleConfirmLogout}
        userName={user?.name}
      />
    </>
  );
};

const Avatar = ({ user }) =>
  user.profile_picture ? (
    <img src={user.profile_picture} alt={user.name} className="w-9 h-9 rounded-full object-cover border-2 border-white shadow-sm" />
  ) : (
    <div className="w-9 h-9 bg-red-600 rounded-full flex items-center justify-center text-white font-semibold border-2 border-white shadow-sm">
      {user.name?.charAt(0).toUpperCase()}
    </div>
  );

const NavItem = ({ to, icon, label, active, isScrolled, isHomePage }) => {
  let isActiveStyle = '';
  if (isHomePage && !isScrolled) {
    isActiveStyle = active
      ? 'bg-white text-gray-900 shadow-md shadow-black/10 ring-1 ring-white/60 font-semibold'
      : 'text-white/90 hover:text-white hover:bg-white/15 backdrop-blur-xs font-medium';
  } else {
    isActiveStyle = active
      ? 'bg-red-50 text-red-600 shadow-xs ring-1 ring-red-100 font-semibold'
      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/80 font-medium';
  }

  return (
    <Link to={to} className={`flex items-center gap-2 px-4 py-2 rounded-full text-[15px] transition-all duration-200 ${isActiveStyle}`}>
      {React.cloneElement(icon, { size: 18, className: active && isHomePage && !isScrolled ? 'text-red-600' : '' })}
      <span>{label}</span>
    </Link>
  );
};

export default Navbar;