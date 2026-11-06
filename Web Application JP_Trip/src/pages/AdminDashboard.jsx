import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  MapPin,
  List,
  Utensils,
  BedDouble,
  RefreshCw,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  Clock,
  Compass,
  Search,
  ExternalLink,
  ChevronRight,
  PlusCircle,
  BarChart3,
  Heart,
  X,
  Shield,
  Layers,
  CheckCircle2,
  KeyRound,
  User,
  UserCheck,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../connectAPI/axios';
import AdminLayout from '../components/AdminLayout';
import { getUser } from '../utils/auth';

// Component สำหรับแสดงตัวเลขนับขึ้นแบบ Smooth Animated Counter
const AnimatedNumber = ({ value = 0, duration = 1200 }) => {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let start = 0;
    const end = Number(value) || 0;
    if (end === 0) {
      setDisplayValue(0);
      return;
    }

    let startTime = null;
    let animationFrame;

    const animate = (currentTime) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);
      // easeOutExpo function เพื่อความนุ่มนวล
      const ease = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setDisplayValue(Math.floor(start + (end - start) * ease));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setDisplayValue(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [value, duration]);

  return <span>{displayValue.toLocaleString()}</span>;
};

// ฟังก์ชันสร้างสี Avatar ตามชื่อ
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

const AdminDashboard = () => {
  const adminInfo = getUser();
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAttractions: 0,
    totalRestaurants: 0,
    totalAccommodations: 0,
    totalPlans: 0,
    pendingResets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showToast, setShowToast] = useState(false);
  const [hoveredSlice, setHoveredSlice] = useState(null);

  // นาฬิกา Real-time
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ดึงข้อมูลแดชบอร์ด
  const fetchData = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const [s, u] = await Promise.all([api.get('/admin/stats'), api.get('/admin/users')]);
      setStats(s.data || {});
      setUsers(Array.isArray(u.data) ? u.data : []);
      if (isManual) {
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
      }
    } catch (error) {
      console.error('เกิดข้อผิดพลาดในการดึงข้อมูลแดชบอร์ด:', error);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // การคำนวณข้อมูลเพิ่มเติมเชิงวิเคราะห์
  const totalPlaces = (stats.totalAttractions || 0) + (stats.totalRestaurants || 0) + (stats.totalAccommodations || 0);
  const attractionsPct = totalPlaces > 0 ? ((stats.totalAttractions / totalPlaces) * 100).toFixed(1) : 0;
  const restaurantsPct = totalPlaces > 0 ? ((stats.totalRestaurants / totalPlaces) * 100).toFixed(1) : 0;
  const accommodationsPct = totalPlaces > 0 ? ((stats.totalAccommodations / totalPlaces) * 100).toFixed(1) : 0;

  const chartRadius = 68;
  const chartCircumference = 2 * Math.PI * chartRadius;
  const len1 = totalPlaces > 0 ? (Number(stats.totalAttractions || 0) / totalPlaces) * chartCircumference : 0;
  const len2 = totalPlaces > 0 ? (Number(stats.totalRestaurants || 0) / totalPlaces) * chartCircumference : 0;
  const len3 = totalPlaces > 0 ? (Number(stats.totalAccommodations || 0) / totalPlaces) * chartCircumference : 0;

  const adminCount = useMemo(() => users.filter((u) => u.role === 'admin').length, [users]);
  const regularUserCount = useMemo(() => users.filter((u) => u.role !== 'admin').length, [users]);

  // คำทักทายตามช่วงเวลา
  const greeting = useMemo(() => {
    const hour = currentTime.getHours();
    if (hour < 12) return 'อรุณสวัสดิ์ยามเช้า ☀️';
    if (hour < 17) return 'สวัสดีตอนบ่าย ⛅';
    if (hour < 20) return 'สวัสดีตอนเย็น 🌆';
    return 'สวัสดีรอบดึก 🌙';
  }, [currentTime]);

  // การ์ดสถิติ 5 ใบหลัก
  const cards = [
    {
      id: 'users',
      label: 'สมาชิกทั้งหมด',
      value: stats.totalUsers,
      subtext: `ผู้ดูแล ${adminCount} คน • สมาชิกทั่วไป ${regularUserCount} คน`,
      icon: Users,
      gradient: 'from-blue-500 to-indigo-600',
      lightBg: 'bg-blue-50 text-blue-600 border-blue-200/80',
      ringColor: 'hover:border-blue-400 group-hover:shadow-blue-500/20',
      badge: 'Active Users',
      link: '/admin/users',
    },
    {
      id: 'attractions',
      label: 'สถานที่ท่องเที่ยว',
      value: stats.totalAttractions,
      subtext: `คิดเป็น ${attractionsPct}% ของหมวดหมู่ทั้งหมด`,
      icon: MapPin,
      gradient: 'from-pink-500 to-rose-600',
      lightBg: 'bg-pink-50 text-pink-600 border-pink-200/80',
      ringColor: 'hover:border-pink-400 group-hover:shadow-pink-500/20',
      badge: 'Landmarks',
      link: '/admin/manage-places?tab=attractions',
    },
    {
      id: 'restaurants',
      label: 'ร้านอาหาร & คาเฟ่',
      value: stats.totalRestaurants,
      subtext: `คิดเป็น ${restaurantsPct}% ของหมวดหมู่ทั้งหมด`,
      icon: Utensils,
      gradient: 'from-orange-500 to-amber-600',
      lightBg: 'bg-orange-50 text-orange-600 border-orange-200/80',
      ringColor: 'hover:border-orange-400 group-hover:shadow-orange-500/20',
      badge: 'Food & Drinks',
      link: '/admin/manage-places?tab=restaurants',
    },
    {
      id: 'accommodations',
      label: 'ที่พัก & เรียวกัง',
      value: stats.totalAccommodations,
      subtext: `คิดเป็น ${accommodationsPct}% ของหมวดหมู่ทั้งหมด`,
      icon: BedDouble,
      gradient: 'from-emerald-500 to-teal-600',
      lightBg: 'bg-emerald-50 text-emerald-600 border-emerald-200/80',
      ringColor: 'hover:border-emerald-400 group-hover:shadow-emerald-500/20',
      badge: 'Hotels',
      link: '/admin/manage-places?tab=accommodations',
    },
    {
      id: 'plans',
      label: 'ทริปที่ถูกสร้าง',
      value: stats.totalPlans,
      subtext: `เฉลี่ย ${(stats.totalPlans / (stats.totalUsers || 1)).toFixed(1)} แผน / สมาชิก`,
      icon: List,
      gradient: 'from-purple-500 to-violet-600',
      lightBg: 'bg-purple-50 text-purple-600 border-purple-200/80',
      ringColor: 'hover:border-purple-400 group-hover:shadow-purple-500/20',
      badge: 'User Trips',
      link: null,
    },
    {
      id: 'categories',
      label: 'หมวดหมู่ข้อมูล',
      value: stats.totalCategories || 3,
      subtext: 'จัดการหมวดหมู่ท่องเที่ยว',
      icon: Layers,
      gradient: 'from-pink-600 to-rose-600',
      lightBg: 'bg-pink-50 text-pink-600 border-pink-200/80',
      ringColor: 'hover:border-pink-400 group-hover:shadow-pink-500/20',
      badge: 'Categories',
      link: '/admin/categories',
    },
  ];

  // กรองรายชื่อสมาชิก
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const matchSearch =
        (u.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        String(u.member_id).includes(searchTerm);
      const matchRole =
        roleFilter === 'all'
          ? true
          : roleFilter === 'admin'
          ? u.role === 'admin'
          : u.role !== 'admin';
      return matchSearch && matchRole;
    });
  }, [users, searchTerm, roleFilter]);

  return (
    <AdminLayout maxWidth="max-w-7xl">
      {/* Toast แจ้งเตือนเมื่อรีเฟรชสำเร็จ */}
      {showToast && (
        <div className="fixed top-8 right-6 md:right-8 z-[100005] bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-pink-500/40 backdrop-blur-xl animate-bounce">
          <CheckCircle2 size={20} className="text-emerald-400" />
          <div>
            <p className="text-xs font-bold">อัปเดตข้อมูลล่าสุดสำเร็จแล้ว!</p>
            <p className="text-[11px] text-slate-400">ดึงสถิติล่าสุดจากเซิร์ฟเวอร์เรียบร้อย</p>
          </div>
        </div>
      )}

      {/* Hero Welcome Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 md:p-10 text-white shadow-2xl mb-8 border border-slate-700/50">
        {/* Glow & Backdrop Decor */}
        <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl pointer-events-none" />
        <div className="absolute left-10 top-1/2 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 space-y-3 max-w-3xl">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-black tracking-tight text-white">
            Admin
          </h1>
          <p className="text-slate-300 text-sm md:text-base font-normal leading-relaxed">
            ยินดีต้อนรับสู่แดชบอร์ดบริหารจัดการข้อมูลการท่องเที่ยวญี่ปุ่น สรุปตัวเลขสถิติสมาชิก สถานที่ และกิจกรรมของผู้ใช้งานแบบเรียลไทม์
          </p>
        </div>
      </section>

      {/* Alert Banner: คำขอรีเซ็ตรหัสผ่านรออนุมัติ (TC: N-001) */}
      {Number(stats.pendingResets) > 0 && (
        <section className="bg-gradient-to-r from-amber-500/15 via-rose-500/15 to-pink-500/15 border border-amber-300 rounded-[2rem] p-5 sm:p-6 mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-sm animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-lg shadow-amber-500/30">
              <KeyRound size={22} />
            </div>
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <span>มีคำขอแจ้งลืมรหัสผ่านจากสมาชิกที่รออนุมัติ</span>
                <span className="px-2.5 py-0.5 rounded-full bg-rose-600 text-white text-xs font-black shadow-sm">
                  {stats.pendingResets} คำขอใหม่
                </span>
              </h3>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                สมาชิกแจ้งลืมรหัสผ่านเข้ามาในระบบ (TC: N-001) เข้าดูข้อมูลยืนยันตัวตนและกดอนุมัติรหัสผ่านชั่วคราวได้ทันที
              </p>
            </div>
          </div>
          <Link
            to="/admin/users?tab=requests"
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-black shadow-md flex items-center gap-1.5 transition-colors shrink-0"
          >
            <span>ไปที่หน้าอนุมัติคำขอ</span>
            <ChevronRight size={14} />
          </Link>
        </section>
      )}

      {/* 6 KPI Stat Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5 mb-8">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <div
              key={c.id}
              onClick={() => c.link && navigate(c.link)}
              className={`group relative overflow-hidden bg-white/95 rounded-3xl p-6 border border-slate-200/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1.5 ${
                c.link ? 'cursor-pointer' : ''
              }`}
            >
              {/* Top Accent Gradient Bar */}
              <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${c.gradient}`} />

              {/* Background Watermark Icon */}
              <Icon
                size={96}
                className="absolute -right-4 -bottom-4 text-slate-900/[0.03] transition-all duration-300 group-hover:scale-110 group-hover:text-slate-900/[0.06] pointer-events-none"
              />

              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm transition-transform duration-300 group-hover:scale-110 ${c.lightBg}`}>
                  <Icon size={24} />
                </div>
                <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  {c.badge}
                </span>
              </div>

              <div>
                <p className="text-slate-500 font-bold text-xs uppercase tracking-wider">{c.label}</p>
                <div className="text-3xl lg:text-4xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                  {loading ? (
                    <span className="w-16 h-9 rounded-lg animate-shimmer inline-block" />
                  ) : (
                    <AnimatedNumber value={c.value} />
                  )}
                </div>
                <p className="text-slate-400 text-xs font-medium mt-2 line-clamp-1">
                  {c.subtext}
                </p>
              </div>

              {c.link && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold text-slate-400 group-hover:text-pink-600 transition-colors">
                  <span>เปิดดูรายละเอียด</span>
                  <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* Visual Analytics & Data Proportions Section */}
      <section className="mb-8">
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/80 shadow-md">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="text-pink-600" size={22} />
                <h2 className="text-xl font-black text-slate-800">สัดส่วนคลังข้อมูลการท่องเที่ยว</h2>
              </div>
              <p className="text-slate-500 text-xs font-medium mt-1">
                การกระจายตัวของข้อมูลท่องเที่ยวทั้งหมด {totalPlaces.toLocaleString()} แห่งในระบบ
              </p>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <Link
                to="/admin/categories"
                className="inline-flex items-center gap-1.5 text-xs font-black text-slate-700 hover:text-pink-600 bg-slate-100 hover:bg-slate-200/80 px-3.5 py-2 rounded-xl transition-colors"
              >
                <Layers size={14} className="text-pink-600" /> จัดการหมวดหมู่
              </Link>
              <Link
                to="/admin/manage-places"
                className="inline-flex items-center gap-1.5 text-xs font-black text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 px-3.5 py-2 rounded-xl transition-colors"
              >
                จัดการข้อมูลสถานที่ <ChevronRight size={14} />
              </Link>
            </div>
          </div>

          {/* Centered Donut Chart Visual */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative w-64 h-64 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90 drop-shadow-sm" viewBox="0 0 180 180">
                <defs>
                  <linearGradient id="grad-attractions" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#ec4899" />
                    <stop offset="100%" stopColor="#f43f5e" />
                  </linearGradient>
                  <linearGradient id="grad-restaurants" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="100%" stopColor="#ea580c" />
                  </linearGradient>
                  <linearGradient id="grad-accommodations" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#0d9488" />
                  </linearGradient>
                </defs>

                {/* Base Ring Track */}
                <circle
                  cx="90"
                  cy="90"
                  r={chartRadius}
                  className="fill-transparent stroke-slate-100"
                  strokeWidth="16"
                />

                {totalPlaces > 0 ? (
                  <>
                    {/* Attractions Arc */}
                    {Number(stats.totalAttractions) > 0 && (
                      <circle
                        cx="90"
                        cy="90"
                        r={chartRadius}
                        className="fill-transparent transition-all duration-300 cursor-pointer"
                        stroke="url(#grad-attractions)"
                        strokeWidth={hoveredSlice === 'attractions' ? 20 : 16}
                        strokeDasharray={`${len1} ${chartCircumference}`}
                        strokeDashoffset={0}
                        onMouseEnter={() => setHoveredSlice('attractions')}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() => navigate('/admin/manage-places?tab=attractions')}
                      />
                    )}

                    {/* Restaurants Arc */}
                    {Number(stats.totalRestaurants) > 0 && (
                      <circle
                        cx="90"
                        cy="90"
                        r={chartRadius}
                        className="fill-transparent transition-all duration-300 cursor-pointer"
                        stroke="url(#grad-restaurants)"
                        strokeWidth={hoveredSlice === 'restaurants' ? 20 : 16}
                        strokeDasharray={`${len2} ${chartCircumference}`}
                        strokeDashoffset={-len1}
                        onMouseEnter={() => setHoveredSlice('restaurants')}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() => navigate('/admin/manage-places?tab=restaurants')}
                      />
                    )}

                    {/* Accommodations Arc */}
                    {Number(stats.totalAccommodations) > 0 && (
                      <circle
                        cx="90"
                        cy="90"
                        r={chartRadius}
                        className="fill-transparent transition-all duration-300 cursor-pointer"
                        stroke="url(#grad-accommodations)"
                        strokeWidth={hoveredSlice === 'accommodations' ? 20 : 16}
                        strokeDasharray={`${len3} ${chartCircumference}`}
                        strokeDashoffset={-(len1 + len2)}
                        onMouseEnter={() => setHoveredSlice('accommodations')}
                        onMouseLeave={() => setHoveredSlice(null)}
                        onClick={() => navigate('/admin/manage-places?tab=accommodations')}
                      />
                    )}
                  </>
                ) : (
                  <circle
                    cx="90"
                    cy="90"
                    r={chartRadius}
                    className="fill-transparent stroke-slate-200"
                    strokeWidth="16"
                  />
                )}
              </svg>

              {/* Center Metrics Hole */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
                {hoveredSlice === 'attractions' ? (
                  <>
                    <span className="text-[11px] font-bold text-pink-500 uppercase tracking-wider">สถานที่ท่องเที่ยว</span>
                    <span className="text-3xl font-black text-pink-600 leading-tight my-0.5">
                      {Number(stats.totalAttractions).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{attractionsPct}%</span>
                  </>
                ) : hoveredSlice === 'restaurants' ? (
                  <>
                    <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider">ร้านอาหาร & คาเฟ่</span>
                    <span className="text-3xl font-black text-amber-600 leading-tight my-0.5">
                      {Number(stats.totalRestaurants).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{restaurantsPct}%</span>
                  </>
                ) : hoveredSlice === 'accommodations' ? (
                  <>
                    <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider">ที่พัก & เรียวกัง</span>
                    <span className="text-3xl font-black text-emerald-600 leading-tight my-0.5">
                      {Number(stats.totalAccommodations).toLocaleString()}
                    </span>
                    <span className="text-xs font-bold text-slate-500">{accommodationsPct}%</span>
                  </>
                ) : (
                  <>
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">ข้อมูลทั้งหมด</span>
                    <span className="text-3xl font-black text-slate-800 leading-tight my-0.5">
                      {loading ? '...' : <AnimatedNumber value={totalPlaces} />}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">แห่งในระบบ</span>
                  </>
                )}
              </div>
            </div>

            {/* Interactive Category Filter Pills */}
            <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
              <button
                type="button"
                onMouseEnter={() => setHoveredSlice('attractions')}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={() => navigate('/admin/manage-places?tab=attractions')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  hoveredSlice === 'attractions'
                    ? 'bg-pink-100 border-pink-400 text-pink-700 scale-105 shadow'
                    : 'bg-pink-50/70 hover:bg-pink-100 border-pink-200/80 text-pink-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-pink-500 shadow-sm" />
                <span>สถานที่ท่องเที่ยว ({attractionsPct}%)</span>
              </button>

              <button
                type="button"
                onMouseEnter={() => setHoveredSlice('restaurants')}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={() => navigate('/admin/manage-places?tab=restaurants')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  hoveredSlice === 'restaurants'
                    ? 'bg-amber-100 border-amber-400 text-amber-700 scale-105 shadow'
                    : 'bg-amber-50/70 hover:bg-amber-100 border-amber-200/80 text-amber-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm" />
                <span>ร้านอาหาร & คาเฟ่ ({restaurantsPct}%)</span>
              </button>

              <button
                type="button"
                onMouseEnter={() => setHoveredSlice('accommodations')}
                onMouseLeave={() => setHoveredSlice(null)}
                onClick={() => navigate('/admin/manage-places?tab=accommodations')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all cursor-pointer shadow-sm ${
                  hoveredSlice === 'accommodations'
                    ? 'bg-emerald-100 border-emerald-400 text-emerald-700 scale-105 shadow'
                    : 'bg-emerald-50/70 hover:bg-emerald-100 border-emerald-200/80 text-emerald-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm" />
                <span>ที่พัก & เรียวกัง ({accommodationsPct}%)</span>
              </button>
            </div>
          </div>

          {/* 3 Categories Breakdown Interactive Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-4xl mx-auto w-full mt-6 pt-6 border-t border-slate-100">
            <div
              onMouseEnter={() => setHoveredSlice('attractions')}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => navigate('/admin/manage-places?tab=attractions')}
              className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-md ${
                hoveredSlice === 'attractions'
                  ? 'bg-pink-100/90 border-pink-400 ring-2 ring-pink-400/30'
                  : 'bg-pink-50/70 hover:bg-pink-100/80 border-pink-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-pink-700 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-pink-500" /> สถานที่ท่องเที่ยว
                </div>
                <span className="text-xs font-black text-pink-600">{attractionsPct}%</span>
              </div>
              <p className="text-2xl font-black text-slate-800">
                <AnimatedNumber value={stats.totalAttractions} />
                <span className="text-xs font-normal text-slate-500 ml-1">แห่ง</span>
              </p>
              <div className="mt-3 pt-2.5 border-t border-pink-200/60 flex items-center justify-between text-[11px] font-bold text-pink-700">
                <span>จัดการข้อมูล</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredSlice('restaurants')}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => navigate('/admin/manage-places?tab=restaurants')}
              className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-md ${
                hoveredSlice === 'restaurants'
                  ? 'bg-amber-100/90 border-amber-400 ring-2 ring-amber-400/30'
                  : 'bg-amber-50/70 hover:bg-amber-100/80 border-amber-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-amber-700 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> ร้านอาหาร & คาเฟ่
                </div>
                <span className="text-xs font-black text-amber-600">{restaurantsPct}%</span>
              </div>
              <p className="text-2xl font-black text-slate-800">
                <AnimatedNumber value={stats.totalRestaurants} />
                <span className="text-xs font-normal text-slate-500 ml-1">ร้าน</span>
              </p>
              <div className="mt-3 pt-2.5 border-t border-amber-200/60 flex items-center justify-between text-[11px] font-bold text-amber-700">
                <span>จัดการข้อมูล</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>

            <div
              onMouseEnter={() => setHoveredSlice('accommodations')}
              onMouseLeave={() => setHoveredSlice(null)}
              onClick={() => navigate('/admin/manage-places?tab=accommodations')}
              className={`rounded-2xl p-4 border transition-all duration-200 cursor-pointer group hover:-translate-y-1 hover:shadow-md ${
                hoveredSlice === 'accommodations'
                  ? 'bg-emerald-100/90 border-emerald-400 ring-2 ring-emerald-400/30'
                  : 'bg-emerald-50/70 hover:bg-emerald-100/80 border-emerald-200/80'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> ที่พัก & เรียวกัง
                </div>
                <span className="text-xs font-black text-emerald-600">{accommodationsPct}%</span>
              </div>
              <p className="text-2xl font-black text-slate-800">
                <AnimatedNumber value={stats.totalAccommodations} />
                <span className="text-xs font-normal text-slate-500 ml-1">แห่ง</span>
              </p>
              <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-[11px] font-bold text-emerald-700">
                <span>จัดการข้อมูล</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Admin Action Shortcuts */}
      <section className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <Layers size={20} className="text-pink-600" /> แผงทางลัดการจัดการด่วน (Quick Actions)
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link
            to="/admin/manage-places?tab=attractions&action=create"
            className="group p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-pink-300 transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-pink-100 text-pink-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-pink-600 group-hover:text-white transition-all shadow-sm">
              <PlusCircle size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 group-hover:text-pink-600 transition-colors">
                เพิ่มสถานที่ท่องเที่ยว
              </p>
              <p className="text-xs text-slate-400 font-medium">เพิ่มจุดเช็คอินใหม่ในระบบ</p>
            </div>
          </Link>

          <Link
            to="/admin/manage-places?tab=restaurants&action=create"
            className="group p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-amber-600 group-hover:text-white transition-all shadow-sm">
              <Utensils size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 group-hover:text-amber-600 transition-colors">
                เพิ่มร้านอาหาร & คาเฟ่
              </p>
              <p className="text-xs text-slate-400 font-medium">เพิ่มร้านดังทั่วญี่ปุ่น</p>
            </div>
          </Link>

          <Link
            to="/admin/users"
            className="group p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
              <ShieldCheck size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 group-hover:text-blue-600 transition-colors">
                จัดการสิทธิ์สมาชิก
              </p>
              <p className="text-xs text-slate-400 font-medium">ตั้งค่าบทบาท Admin/User</p>
            </div>
          </Link>

          <Link
            to="/search"
            className="group p-5 bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-lg hover:border-purple-300 transition-all duration-200 flex items-center gap-4"
          >
            <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-600 flex items-center justify-center group-hover:scale-110 group-hover:bg-purple-600 group-hover:text-white transition-all shadow-sm">
              <Compass size={24} />
            </div>
            <div>
              <p className="text-sm font-black text-slate-800 group-hover:text-purple-600 transition-colors">
                สำรวจหน้าค้นหาจริง
              </p>
              <p className="text-xs text-slate-400 font-medium">ทดสอบมุมมองผู้ใช้งานทั่วไป</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Upgraded Recent Members Table Section */}
      <section className="bg-white rounded-3xl shadow-md border border-slate-200/80 overflow-hidden mb-12">
        {/* Table Top Controls & Search Bar */}
        <div className="p-6 bg-slate-50/70 border-b border-slate-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Users size={22} className="text-pink-600" />
              <h2 className="text-xl font-black text-slate-800">รายชื่อสมาชิกล่าสุดในระบบ</h2>
              <span className="text-xs font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-700 ml-1">
                {users.length} คน
              </span>
            </div>
            <p className="text-slate-500 text-xs font-medium mt-1">
              ตรวจสอบข้อมูลสมาชิก กิจกรรมการใช้งาน และสถานะสิทธิ์ในระบบ
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Filter Pills */}
            <div className="flex items-center bg-white p-1 rounded-2xl border border-slate-200 shadow-sm text-xs font-bold">
              <button
                onClick={() => setRoleFilter('all')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  roleFilter === 'all'
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ทั้งหมด ({users.length})
              </button>
              <button
                onClick={() => setRoleFilter('admin')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  roleFilter === 'admin'
                    ? 'bg-pink-600 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                ผู้ดูแล ({adminCount})
              </button>
              <button
                onClick={() => setRoleFilter('user')}
                className={`px-3 py-1.5 rounded-xl transition-all ${
                  roleFilter === 'user'
                    ? 'bg-blue-600 text-white shadow-sm'
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
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาชื่อ อีเมล หรือ ID..."
                className="pl-10 pr-9 py-2 bg-white border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-pink-500 focus:ring-2 focus:ring-pink-100 transition-all w-full sm:w-64 shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={15} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/40 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="py-4 px-6 font-bold">รหัสสมาชิก</th>
                <th className="py-4 px-6 font-bold">ข้อมูลสมาชิก</th>
                <th className="py-4 px-6 font-bold">อีเมลติดต่อ</th>
                <th className="py-4 px-6 font-bold text-center">กิจกรรม (โปรด / แผน)</th>
                <th className="py-4 px-6 font-bold text-center">บทบาทสิทธิ์</th>
                <th className="py-4 px-6 font-bold text-right">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {loading ? (
                // Shimmer Loading Skeleton
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="py-4 px-6">
                      <div className="h-5 w-12 bg-slate-200 rounded-lg animate-shimmer" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-200 animate-shimmer" />
                        <div className="h-5 w-32 bg-slate-200 rounded animate-shimmer" />
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-5 w-40 bg-slate-200 rounded animate-shimmer" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-5 w-24 mx-auto bg-slate-200 rounded animate-shimmer" />
                    </td>
                    <td className="py-4 px-6">
                      <div className="h-6 w-20 mx-auto bg-slate-200 rounded-full animate-shimmer" />
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="h-8 w-16 ml-auto bg-slate-200 rounded-xl animate-shimmer" />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                // Empty State
                <tr>
                  <td colSpan="6" className="py-12 text-center">
                    <div className="max-w-xs mx-auto space-y-3">
                      <div className="w-14 h-14 mx-auto rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                        <Users size={28} />
                      </div>
                      <p className="text-slate-700 font-bold text-base">ไม่พบข้อมูลสมาชิกที่ค้นหา</p>
                      <p className="text-slate-400 text-xs">
                        ลองเปลี่ยนคำค้นหา หรือรีเซ็ตตัวกรองสิทธิ์สมาชิก
                      </p>
                      {searchTerm && (
                        <button
                          onClick={() => setSearchTerm('')}
                          className="px-4 py-2 bg-pink-50 text-pink-600 rounded-xl text-xs font-bold hover:bg-pink-100 transition-colors"
                        >
                          ล้างการค้นหา
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                // User Rows
                filteredUsers.slice(0, 8).map((user) => {
                  const isAdmin = user.role === 'admin';
                  return (
                    <tr
                      key={user.member_id}
                      className="hover:bg-slate-50/80 transition-colors group"
                    >
                      {/* ID */}
                      <td className="py-4 px-6 font-bold text-slate-400 font-mono">
                        <span className="px-2 py-1 rounded-md bg-slate-100 text-slate-700 text-xs font-black">
                          #{String(user.member_id).padStart(4, '0')}
                        </span>
                      </td>

                      {/* Name & Avatar */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl bg-gradient-to-tr ${getAvatarGradient(
                              user.name || 'User'
                            )} text-white flex items-center justify-center font-black text-sm shadow-sm shrink-0`}
                          >
                            {(user.name || 'U')[0].toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors">
                              {user.name}
                            </div>
                            <div className="text-xs text-slate-400 sm:hidden">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-6 text-slate-500 font-medium">
                        {user.email}
                      </td>

                      {/* Engagement stats */}
                      <td className="py-4 px-6 text-center">
                        <div className="inline-flex items-center gap-3 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                          <span className="flex items-center gap-1 text-pink-600" title="รายการโปรด">
                            <Heart size={13} fill="currentColor" /> {user.favorites_count || 0}
                          </span>
                          <span className="text-slate-300">|</span>
                          <span className="flex items-center gap-1 text-indigo-600" title="แผนการเดินทาง">
                            <Compass size={13} /> {user.plans_count || 0}
                          </span>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-4 px-6 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black ${
                            isAdmin
                              ? 'bg-pink-100 text-pink-700 border border-pink-200 shadow-sm'
                              : 'bg-blue-50 text-blue-700 border border-blue-200'
                          }`}
                        >
                          {isAdmin ? <Shield size={12} className="text-pink-600" /> : null}
                          {isAdmin ? 'ADMINISTRATOR' : 'MEMBER'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        <Link
                          to={`/admin/users`}
                          title="ดูข้อมูลสมาชิก (TC: N-001)"
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                        >
                          <User size={14} />
                          <span>ดูข้อมูลสมาชิก</span>
                          <ChevronRight size={13} />
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer info bar */}
        <div className="p-4 bg-slate-50/80 border-t border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            แสดง {Math.min(filteredUsers.length, 8)} จากทั้งหมด {filteredUsers.length} คน
            {filteredUsers.length < users.length && ` (กรองจากสมาชิกทั้งหมด ${users.length} คน)`}
          </div>

          <Link
            to="/admin/users"
            className="inline-flex items-center gap-1.5 font-bold text-pink-600 hover:text-pink-700 transition-colors group"
          >
            <span>ดูและจัดการสมาชิกทั้งหมด ({users.length} คน)</span>
            <ChevronRight size={15} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>
    </AdminLayout>
  );
};

export default AdminDashboard;
