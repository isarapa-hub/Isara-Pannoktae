import React, { useState, useEffect, useMemo } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import {
  Calendar,
  Plus,
  Trash2,
  Edit,
  X,
  Save,
  Search,
  Heart,
  MapPin,
  Minus,
  Clock,
  ArrowUp,
  ArrowDown,
  Check,
  Compass,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Eye,
  Filter,
  Loader2,
  Share2,
  Navigation,
  ChevronRight,
  Info,
} from 'lucide-react';
import api, { errMsg } from '../connectAPI/axios';
import {
  categoryLabel,
  CATEGORIES,
  PROVINCES,
  FALLBACK_IMG,
  formatPrice,
  formatTime,
  mapsDirectionUrl,
  setDynamicCategories,
} from '../utils/constants';
import MapModal from '../components/MapModal';
import Footer from '../components/Footer';
import CustomSelect from '../components/CustomSelect';

// ฟังก์ชันแปลงวันที่ให้อยู่ในรูปแบบ YYYY-MM-DD สำหรับ <input type="date"> โดยไม่เลื่อนวันจาก Timezone
const toInputDate = (d) => {
  if (!d) return '';
  if (d instanceof Date) {
    if (isNaN(d.getTime())) return '';
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
  const s = String(d).trim();
  // ถ้าเป็น YYYY-MM-DD อยู่แล้ว ให้ใช้ค่านั้นได้ทันที
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // ถ้าเป็น ISO string เช่น 2026-10-09T17:00:00.000Z ให้แปลงเป็น local date ตามเครื่องผู้ใช้
  const dt = new Date(s);
  if (isNaN(dt.getTime())) return s.substring(0, 10);
  const year = dt.getFullYear();
  const month = String(dt.getMonth() + 1).padStart(2, '0');
  const day = String(dt.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// ฟังก์ชันดึงวันที่ปัจจุบันในรูปแบบ YYYY-MM-DD ตามเวลาเครื่องผู้ใช้
const getTodayStr = () => toInputDate(new Date());

// ฟังก์ชันคำนวณจำนวนวันจากวันเริ่มต้นถึงวันสิ้นสุด
const dayCount = (start, end) => {
  if (!start || !end) return null;
  const sStr = toInputDate(start);
  const eStr = toInputDate(end);
  if (!sStr || !eStr) return null;
  const [sY, sM, sD] = sStr.split('-').map(Number);
  const [eY, eM, eD] = eStr.split('-').map(Number);
  const dt1 = new Date(sY, sM - 1, sD);
  const dt2 = new Date(eY, eM - 1, eD);
  const diffTime = dt2.getTime() - dt1.getTime();
  const n = Math.round(diffTime / 86400000) + 1;
  return n > 0 ? Math.min(n, 30) : null;
};

// รูปแบบแสดงวันที่แบบไทย เช่น "15 ต.ค. 2026"
const fmtDate = (d) => {
  if (!d) return null;
  const s = toInputDate(d);
  if (!s || !/^\d{4}-\d{2}-\d{2}$/.test(s)) return null;
  const [y, m, day] = s.split('-').map(Number);
  const dateObj = new Date(y, m - 1, day);
  if (isNaN(dateObj.getTime())) return null;
  return dateObj.toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
};

const emptyPlan = {
  plan_id: null,
  plan_name: '',
  start_date: '',
  end_date: '',
  days: 1,
  items: [],
};

// ธีมสีประจำหมวดหมู่สถานที่
const categoryStyles = {
  attractions: {
    badge: 'bg-rose-50 text-rose-600 border-rose-200',
    dot: 'bg-rose-500',
    icon: '⛩️',
    label: 'สถานที่ท่องเที่ยว',
  },
  restaurants: {
    badge: 'bg-amber-50 text-amber-600 border-amber-200',
    dot: 'bg-amber-500',
    icon: '🍜',
    label: 'ร้านอาหาร',
  },
  accommodations: {
    badge: 'bg-indigo-50 text-indigo-600 border-indigo-200',
    dot: 'bg-indigo-500',
    icon: '🏨',
    label: 'ที่พัก',
  },
  cafes: {
    badge: 'bg-pink-50 text-pink-600 border-pink-200',
    dot: 'bg-pink-500',
    icon: '☕',
    label: 'คาเฟ่',
  },
};

const PlanPage = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal สร้าง / แก้ไขแผน
  const [editing, setEditing] = useState(null);

  // Modal ดูรายละเอียดกำหนดการเต็ม
  const [viewingPlan, setViewingPlan] = useState(null);

  // Modal ยืนยันลบแผน
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Modal แผนที่
  const [mapPlace, setMapPlace] = useState(null);

  // Toast แจ้งเตือน
  const [toast, setToast] = useState(null);
  const showToast = (title, description) => {
    setToast({ title, description });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    try {
      setLoading(true);
      const res = await api.get('/plans');
      setPlans(res.data || []);
    } catch (err) {
      alert(errMsg(err, 'ไม่สามารถดึงข้อมูลแผนการเดินทางได้'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get('/categories')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategoriesList(res.data);
          setDynamicCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  // กรณีผู้ใช้กด "เพิ่มลงแผนการเดินทาง" มาจากหน้ารายละเอียดสถานที่
  useEffect(() => {
    const place = location.state?.add;
    if (place) {
      setEditing({
        ...emptyPlan,
        items: [{ ...place, day: 1 }],
      });
      navigate('/plan', { replace: true, state: null });
      showToast('เลือกสถานที่ให้แล้ว', `เพิ่ม "${place.name}" ลงในแผนใหม่วันที่ 1 เรียบร้อย`);
    }
  }, [location.state, navigate]);

  const openEdit = (p) => {
    const calculatedDays = dayCount(toInputDate(p.start_date), toInputDate(p.end_date));
    const maxDayFromItems = p.items?.length
      ? Math.max(...p.items.map((i) => i.day_sequence || 1))
      : 1;

    setEditing({
      plan_id: p.plan_id,
      plan_name: p.plan_name,
      start_date: toInputDate(p.start_date),
      end_date: toInputDate(p.end_date),
      days: Math.max(calculatedDays || 1, maxDayFromItems),
      items: (p.items || []).map((i) => ({ ...i, day: i.day_sequence || 1 })),
    });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setDeleting(true);
    try {
      await api.delete(`/plans/${deleteConfirm.plan_id}`);
      setPlans((prev) => prev.filter((x) => x.plan_id !== deleteConfirm.plan_id));
      showToast('ลบแผนเรียบร้อย', `ลบแผน "${deleteConfirm.plan_name}" สำเร็จ`);
      if (viewingPlan?.plan_id === deleteConfirm.plan_id) {
        setViewingPlan(null);
      }
      setDeleteConfirm(null);
    } catch (err) {
      alert(errMsg(err, 'ไม่สามารถลบแผนการเดินทางได้'));
    } finally {
      setDeleting(false);
    }
  };

  const handleSaved = (savedPlanName) => {
    setEditing(null);
    showToast('บันทึกแผนสำเร็จ', `ระบบบันทึกแผน "${savedPlanName || 'แผนการเดินทาง'}" เรียบร้อยแล้ว`);
    load();
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-28 pb-24 font-sans text-slate-800">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-24 right-6 md:right-10 z-[10002] bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-pink-500/40 backdrop-blur-xl animate-bounce">
          <CheckCircle2 size={20} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-black">{toast.title}</p>
            <p className="text-[11px] text-slate-300">{toast.description}</p>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ============================================================== */}
        {/* HERO SECTION: สไตล์โมเดิร์น ธีมญี่ปุ่นพร้อม Bento สถิติ          */}
        {/* ============================================================== */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 p-8 sm:p-12 text-white shadow-2xl mb-10 border border-slate-800">
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-pink-500/20 blur-3xl pointer-events-none" />
          <div className="absolute right-1/3 -bottom-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight">
                วางแผนการเดินทางในแบบของคุณ
              </h1>
            </div>

            <button
              onClick={() => setEditing({ ...emptyPlan })}
              className="px-8 py-4 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 hover:from-pink-500 hover:to-red-500 text-white font-black text-sm shadow-xl shadow-pink-600/30 hover:shadow-pink-600/50 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 shrink-0"
            >
              <Plus size={20} className="stroke-[3]" />
              <span>สร้างแผนการเดินทางใหม่</span>
            </button>
          </div>
        </section>

        {/* ============================================================== */}
        {/* PLAN LIST GRID: รายการแผนการเดินทาง                           */}
        {/* ============================================================== */}
        {loading ? (
          <div className="py-24 text-center">
            <Loader2 size={36} className="animate-spin text-pink-600 mx-auto mb-3" />
            <p className="font-bold text-slate-500 text-sm">กำลังโหลดแผนการเดินทางของคุณ...</p>
          </div>
        ) : plans.length === 0 ? (
          <div className="bg-white rounded-[2.5rem] p-12 sm:p-16 text-center border border-slate-100 shadow-sm">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-pink-50 text-pink-500 flex items-center justify-center mb-5 shadow-inner">
              <Calendar size={36} />
            </div>
            <h3 className="text-xl font-black text-slate-800 mb-2">
              คุณยังไม่มีแผนการเดินทาง
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm max-w-md mx-auto mb-6 leading-relaxed">
              เริ่มต้นสร้างแผนการเดินทางแรกของคุณได้ทันที กำหนดวัน และเลือกสถานที่ท่องเที่ยว ร้านอาหาร ที่พัก ลงในตารางได้ตามใจชอบ
            </p>
            <button
              onClick={() => setEditing({ ...emptyPlan })}
              className="px-8 py-3.5 rounded-full bg-pink-600 hover:bg-pink-700 text-white font-black text-xs shadow-lg shadow-pink-600/30 transition-all inline-flex items-center gap-2"
            >
              <Plus size={16} />
              <span>เริ่มสร้างแผนแรก</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {plans.map((p) => (
              <PlanCard
                key={p.plan_id}
                plan={p}
                onView={() => setViewingPlan(p)}
                onEdit={() => openEdit(p)}
                onDelete={() => setDeleteConfirm(p)}
                onOpenMap={(place) => setMapPlace(place)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* 1. MODAL: สร้าง / แก้ไขแผนการเดินทาง (PLAN BUILDER)              */}
      {/* ============================================================== */}
      {editing && (
        <PlanEditor
          initial={editing}
          categoriesList={categoriesList}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
          onOpenMap={(place) => setMapPlace(place)}
        />
      )}

      {/* ============================================================== */}
      {/* 2. MODAL: ดูรายละเอียดกำหนดการเต็ม (ITINERARY DETAIL MODAL)      */}
      {/* ============================================================== */}
      {viewingPlan && (
        <PlanDetailModal
          plan={viewingPlan}
          onClose={() => setViewingPlan(null)}
          onEdit={() => {
            const target = viewingPlan;
            setViewingPlan(null);
            openEdit(target);
          }}
          onOpenMap={(place) => setMapPlace(place)}
        />
      )}

      {/* ============================================================== */}
      {/* 3. MODAL: ยืนยันการลบแผนการเดินทาง                               */}
      {/* ============================================================== */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-4 bg-slate-950/65 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2rem] w-full max-w-sm p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-4 animate-scaleUp">
            <div className="w-16 h-16 mx-auto rounded-full bg-rose-50 text-rose-500 border-4 border-rose-100 flex items-center justify-center">
              <Trash2 size={28} className="stroke-[2.5]" />
            </div>

            <div>
              <h3 className="text-xl font-black text-rose-600">ยืนยันการลบแผนเดินทาง?</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                คุณต้องการลบแผน <span className="font-black text-slate-800">"{deleteConfirm.plan_name}"</span>{' '}
                ใช่หรือไม่? กำหนดการทั้งหมดในแผนนี้จะถูกลบถาวร
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteConfirm(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-md shadow-rose-600/30 transition-all flex items-center justify-center gap-1.5 disabled:opacity-60"
              >
                {deleting ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                <span>ยืนยันลบแผน</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. MODAL: แผนที่ Google Maps                                     */}
      {/* ============================================================== */}
      {mapPlace && <MapModal place={mapPlace} onClose={() => setMapPlace(null)} />}

      <Footer />
    </div>
  );
};

/* ==================================================================== */
/* COMPONENT: การ์ดแผนการเดินทาง (PLAN CARD)                            */
/* ==================================================================== */
const PlanCard = ({ plan, onView, onEdit, onDelete, onOpenMap }) => {
  const [activePreviewDay, setActivePreviewDay] = useState(1);

  // แยกสถานที่ตามวัน
  const byDay = useMemo(() => {
    const m = {};
    (plan.items || []).forEach((i) => {
      const d = i.day_sequence || 1;
      (m[d] = m[d] || []).push(i);
    });
    return m;
  }, [plan.items]);

  const daysList = Object.keys(byDay).sort((a, b) => Number(a) - Number(b));
  const autoDays = dayCount(toInputDate(plan.start_date), toInputDate(plan.end_date));
  const totalDays = autoDays || (daysList.length ? Math.max(...daysList.map(Number)) : 1);

  const range = plan.start_date
    ? `${fmtDate(plan.start_date)}${plan.end_date ? ` - ${fmtDate(plan.end_date)}` : ''}`
    : 'ยังไม่กำหนดวันเดินทาง';

  // รูปภาพพรีวิวจากการ์ด (ดึงได้สูงสุด 3 รูป)
  const previewImages = useMemo(() => {
    return (plan.items || [])
      .map((it) => it.image_url)
      .filter(Boolean)
      .slice(0, 3);
  }, [plan.items]);

  // นับแยกหมวดหมู่
  const categoryCounts = useMemo(() => {
    const c = { attractions: 0, restaurants: 0, accommodations: 0 };
    (plan.items || []).forEach((it) => {
      if (c[it.category] !== undefined) c[it.category]++;
    });
    return c;
  }, [plan.items]);

  const activePlaces = byDay[activePreviewDay] || [];

  return (
    <div className="bg-white rounded-[2.2rem] border border-slate-200/80 shadow-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1">
      {/* Cover Collage Preview */}
      <div className="relative h-44 overflow-hidden bg-gradient-to-tr from-slate-900 to-indigo-950">
        {previewImages.length > 0 ? (
          <div
            className={`grid w-full h-full ${previewImages.length === 1
              ? 'grid-cols-1'
              : previewImages.length === 2
                ? 'grid-cols-2'
                : 'grid-cols-3'
              }`}
          >
            {previewImages.map((img, idx) => (
              <img
                key={idx}
                src={img}
                alt="Destination thumbnail"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              />
            ))}
          </div>
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-white/50 space-y-2 p-4 text-center">
            <span className="text-3xl">🎌</span>
            <span className="text-xs font-medium text-slate-300">ยังไม่มีสถานที่ในแผน</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none" />

        {/* Top Badges */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-1.5 flex-wrap">
          <span className="px-3 py-1 rounded-full bg-white/90 backdrop-blur-md text-slate-900 font-black text-[11px] shadow-sm flex items-center gap-1">
            <Calendar size={12} className="text-pink-600" />
            <span>{totalDays} วัน {totalDays > 1 ? `${totalDays - 1} คืน` : ''}</span>
          </span>
          <span className="px-2.5 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white font-bold text-[11px] shadow-sm">
            📍 {plan.items?.length || 0} สถานที่
          </span>
        </div>

        {/* Top Right Quick Actions */}
        <div className="absolute top-3.5 right-3.5 flex items-center gap-1">
          <button
            onClick={onEdit}
            className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-indigo-600 hover:bg-white transition-all shadow-sm"
            title="แก้ไขแผน"
          >
            <Edit size={14} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 rounded-xl bg-white/90 backdrop-blur-md text-slate-700 hover:text-rose-600 hover:bg-white transition-all shadow-sm"
            title="ลบแผน"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {/* Date string on cover */}
        <div className="absolute bottom-3 left-4 text-white text-xs font-bold flex items-center gap-1.5">
          <Clock size={13} className="text-pink-400" />
          <span className="drop-shadow">{range}</span>
        </div>
      </div>

      {/* Body Section */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3
            onClick={onView}
            className="text-lg font-black text-slate-900 hover:text-pink-600 transition-colors cursor-pointer line-clamp-1 mb-2"
          >
            {plan.plan_name}
          </h3>

          {/* Category Chips */}
          <div className="flex items-center gap-2 text-[11px] font-bold text-slate-500 mb-4 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-lg bg-rose-50 text-rose-700 border border-rose-100">
              ⛩️ {categoryCounts.attractions} ที่เที่ยว
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-100">
              🍜 {categoryCounts.restaurants} ร้านอาหาร
            </span>
            <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-100">
              🏨 {categoryCounts.accommodations} ที่พัก
            </span>
          </div>

          {/* Day Tabs Switcher for In-Card Preview */}
          {daysList.length > 0 && (
            <div className="border-t border-slate-100 pt-3 mb-3">
              <div className="flex items-center gap-1 overflow-x-auto pb-1 mb-2.5 scrollbar-none">
                {daysList.map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setActivePreviewDay(Number(d))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all shrink-0 ${activePreviewDay === Number(d)
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    วัน {d} ({byDay[d]?.length || 0})
                  </button>
                ))}
              </div>

              {/* Items for Active Day */}
              {activePlaces.length === 0 ? (
                <p className="text-xs text-slate-400 italic">ไม่มีสถานที่ในวันนี้</p>
              ) : (
                <ul className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {activePlaces.map((it, idx) => {
                    const style = categoryStyles[it.category] || categoryStyles.attractions;
                    return (
                      <li
                        key={it.detail_id || `${it.category}-${it.id}`}
                        className="flex items-center justify-between text-xs p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                          <span className="w-5 h-5 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center text-[10px] font-black shrink-0 font-mono">
                            {idx + 1}
                          </span>
                          <span className={`w-1.5 h-1.5 rounded-full ${style.dot} shrink-0`} />
                          <Link
                            to={`/place/${it.category}/${it.id}`}
                            className="font-bold text-slate-800 hover:text-pink-600 truncate text-[12px]"
                          >
                            {it.name}
                          </Link>
                        </div>
                        <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                          {it.province}
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          )}

          {daysList.length === 0 && (
            <div className="py-6 text-center text-slate-400 text-xs border border-dashed rounded-2xl border-slate-200">
              กดปุ่มแก้ไขด้านล่างเพื่อเริ่มเพิ่มสถานที่ในทริปนี้
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-4 border-t border-slate-100 flex items-center gap-2 mt-3">
          <button
            onClick={onView}
            className="flex-1 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
          >
            <Eye size={14} />
            <span>ดูแผนเต็มรูปแบบ</span>
          </button>
          <button
            onClick={onEdit}
            className="px-4 py-2.5 rounded-xl bg-pink-50 hover:bg-pink-100 text-pink-700 font-bold text-xs flex items-center justify-center gap-1 transition-colors"
          >
            <Edit size={14} />
            <span>แก้ไข</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==================================================================== */
/* COMPONENT: หน้าต่างแสดงรายละเอียดกำหนดการเต็ม (ITINERARY DETAIL MODAL)   */
/* ==================================================================== */
const PlanDetailModal = ({ plan, onClose, onEdit, onOpenMap }) => {
  const [selectedDay, setSelectedDay] = useState('all');

  const byDay = useMemo(() => {
    const m = {};
    (plan.items || []).forEach((i) => {
      const d = i.day_sequence || 1;
      (m[d] = m[d] || []).push(i);
    });
    return m;
  }, [plan.items]);

  const daysList = Object.keys(byDay).sort((a, b) => Number(a) - Number(b));
  const autoDays = dayCount(toInputDate(plan.start_date), toInputDate(plan.end_date));
  const totalDays = autoDays || (daysList.length ? Math.max(...daysList.map(Number)) : 1);

  const range = plan.start_date
    ? `${fmtDate(plan.start_date)}${plan.end_date ? ` - ${fmtDate(plan.end_date)}` : ''}`
    : 'ยังไม่กำหนดวันเดินทาง';

  const displayedDays = selectedDay === 'all' ? daysList : [selectedDay];

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/70 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-scaleUp">
        {/* Header */}
        <div className="p-6 sm:p-8 border-b border-slate-100 bg-slate-50/70 flex items-start justify-between gap-4 shrink-0">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap mb-1.5">
              <span className="px-3.5 py-1 rounded-full bg-pink-100 text-pink-700 font-black text-xs sm:text-sm">
                ทริป {totalDays} วัน
              </span>
              <span className="text-xs sm:text-sm font-bold text-slate-500">{range}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
              {plan.plan_name}
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-2.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors"
            title="ปิด"
          >
            <X size={22} />
          </button>
        </div>

        {/* Summary Strip (นำค่าใช้จ่ายเริ่มต้นออก และปรับตัวหนังสือใหญ่ขึ้น) */}
        <div className="px-6 sm:px-8 py-3.5 bg-white border-b border-slate-100 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-slate-700">
            <span className="p-1 rounded-lg bg-pink-50 text-pink-600">
              <MapPin size={18} />
            </span>
            <span>
              สถานที่ทั้งหมด:{' '}
              <strong className="text-slate-900 font-black">{plan.items?.length || 0} แห่ง</strong>
            </span>
          </div>

          {/* Filter Day Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none py-1">
            <button
              onClick={() => setSelectedDay('all')}
              className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${selectedDay === 'all'
                ? 'bg-slate-900 text-white shadow-sm'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
            >
              ดูทุกวัน
            </button>
            {daysList.map((d) => (
              <button
                key={d}
                onClick={() => setSelectedDay(d)}
                className={`px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${selectedDay === d
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/25'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
              >
                วันที่ {d}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Content */}
        <div className="overflow-y-auto p-6 sm:p-8 flex-1 space-y-8">
          {displayedDays.length === 0 || plan.items?.length === 0 ? (
            <div className="py-16 text-center text-slate-400 text-base font-bold">
              ยังไม่มีสถานที่ในแผนนี้
            </div>
          ) : (
            displayedDays.map((d) => {
              const places = byDay[d] || [];
              return (
                <div key={d} className="space-y-4">
                  {/* Day Header */}
                  <div className="flex items-center gap-3.5 mb-2">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white flex items-center justify-center font-black text-base shadow-md shadow-pink-600/30 font-mono shrink-0">
                      D{d}
                    </div>
                    <div>
                      <h4 className="text-lg sm:text-xl font-black text-slate-900">กำหนดการวันที่ {d}</h4>
                      <p className="text-xs sm:text-sm text-slate-500 font-semibold">รวม {places.length} สถานที่</p>
                    </div>
                  </div>

                  {/* Connecting Timeline List */}
                  <div className="relative pl-6 sm:pl-7 ml-5 sm:ml-6 border-l-2 border-slate-200 space-y-4">
                    {places.map((it, idx) => {
                      const style = categoryStyles[it.category] || categoryStyles.attractions;
                      return (
                        <div
                          key={it.detail_id || `${it.category}-${it.id}`}
                          className="relative bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                        >
                          {/* Timeline Dot Node */}
                          <div className="absolute -left-[31px] sm:-left-[35px] top-6 w-4 h-4 rounded-full bg-white border-4 border-pink-600 shadow-sm" />

                          {/* Left: Thumbnail & Details */}
                          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
                            <img
                              src={it.image_url || FALLBACK_IMG}
                              alt={it.name}
                              className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover shrink-0 border border-slate-100 shadow-sm"
                              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                            />
                            <div className="min-w-0 space-y-1.5">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span
                                  className={`px-3 py-0.5 rounded-full text-xs font-black border uppercase ${style.badge}`}
                                >
                                  {style.icon} {categoryLabel(it.category)}
                                </span>
                                <span className="text-xs sm:text-sm text-slate-500 font-bold flex items-center gap-1">
                                  <MapPin size={14} className="text-rose-500" />
                                  <span>{it.province || 'ญี่ปุ่น'}</span>
                                </span>
                              </div>
                              <h5 className="text-base sm:text-lg font-black text-slate-900 truncate">
                                {idx + 1}. {it.name}
                              </h5>
                              {it.open_time && it.close_time && (
                                <div className="flex items-center gap-1.5 text-xs sm:text-sm text-slate-500 font-medium font-mono">
                                  <Clock size={13} className="text-slate-400" />
                                  <span>เวลาเปิด-ปิด: {formatTime(it.open_time)} - {formatTime(it.close_time)}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Actions */}
                          <div className="flex items-center gap-2.5 shrink-0 self-end sm:self-center">
                            <Link
                              to={`/place/${it.category}/${it.id}`}
                              className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold transition-colors shadow-sm"
                            >
                              ดูข้อมูล
                            </Link>
                            <button
                              type="button"
                              onClick={() => onOpenMap(it)}
                              className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <Navigation size={14} />
                              <span>แผนที่</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-5 sm:p-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs sm:text-sm transition-colors"
          >
            ปิดหน้าต่าง
          </button>
          <button
            onClick={onEdit}
            className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-xs sm:text-sm flex items-center gap-2 shadow-md shadow-pink-600/30 transition-all"
          >
            <Edit size={16} />
            <span>แก้ไขแผนนี้</span>
          </button>
        </div>
      </div>
    </div>
  );
};

/* ==================================================================== */
/* COMPONENT: หน้าต่างสร้าง / แก้ไขแผนการเดินทาง (PLAN BUILDER EDITOR)      */
/* ==================================================================== */
const PlanEditor = ({ initial, onClose, onSaved, onOpenMap, categoriesList = [] }) => {
  const [plan, setPlan] = useState(() => ({
    ...initial,
    start_date: toInputDate(initial?.start_date),
    end_date: toInputDate(initial?.end_date),
  }));
  const [activeDay, setActiveDay] = useState(1);
  const [source, setSource] = useState('search'); // 'search' | 'favorites'

  // ฟิลเตอร์ค้นหาฝั่งขวา
  const [query, setQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [provinceFilter, setProvinceFilter] = useState('all');

  const [results, setResults] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [loadingResults, setLoadingResults] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showConfirmSave, setShowConfirmSave] = useState(false);
  const [validationError, setValidationError] = useState('');

  // หาวันที่ปัจจุบัน (วันนี้) ในรูปแบบ YYYY-MM-DD
  const todayStr = useMemo(() => getTodayStr(), []);

  // กำหนดวันที่ต่ำสุดสำหรับวันเริ่มต้น (ไม่ให้เลือกวันที่ผ่านมาแล้ว)
  // หากเป็นแผนที่มีอยู่แล้วและเริ่มในอดีต จะอนุญาตให้ใช้วันเริ่มต้นเดิมได้
  const minStartDate = useMemo(() => {
    if (plan.plan_id && initial?.start_date) {
      const initStart = toInputDate(initial.start_date);
      if (initStart && initStart < todayStr) return initStart;
    }
    return todayStr;
  }, [plan.plan_id, initial?.start_date, todayStr]);

  // คำนวณจำนวนวันอัตโนมัติจากวันที่
  const autoDays = dayCount(plan.start_date, plan.end_date);
  const days = autoDays || plan.days || 1;

  useEffect(() => {
    if (activeDay > days) setActiveDay(days);
  }, [days, activeDay]);

  // โหลดรายการโปรด
  useEffect(() => {
    api
      .get('/favorites')
      .then((r) => setFavorites(r.data || []))
      .catch(() => { });
  }, []);

  // ค้นหาสถานที่ทั้งหมดแบบ debounce
  useEffect(() => {
    if (source !== 'search') return;
    setLoadingResults(true);
    const t = setTimeout(() => {
      api
        .get('/all-places', {
          params: {
            search: query || undefined,
            category: categoryFilter === 'all' ? undefined : categoryFilter,
            province: provinceFilter === 'all' ? undefined : provinceFilter,
            limit: 30,
          },
        })
        .then((r) => setResults(r.data || []))
        .catch(() => { })
        .finally(() => setLoadingResults(false));
    }, 250);

    return () => clearTimeout(t);
  }, [query, categoryFilter, provinceFilter, source]);

  const patchPlan = (patch) => setPlan((p) => ({ ...p, ...patch }));

  // ตรวจสอบว่าสถานที่นี้ถูกเพิ่มในวันปัจจุบันหรือยัง
  const isAddedInDay = (p, d = activeDay) =>
    plan.items.some((i) => i.id === p.id && i.category === p.category && i.day === d);

  // เพิ่มสถานที่ลงในวันปัจจุบัน
  const addItem = (p) => {
    if (isAddedInDay(p, activeDay)) return;
    patchPlan({
      items: [
        ...plan.items,
        {
          ...p,
          day: activeDay,
        },
      ],
    });
  };

  // ลบสถานที่
  const removeItem = (item) => {
    patchPlan({ items: plan.items.filter((i) => i !== item) });
  };

  // สลับลำดับสถานที่ในวันเดียวกัน (ขึ้น / ลง)
  const moveItemSequence = (indexInDay, direction) => {
    const dayItems = plan.items.filter((i) => i.day === activeDay);
    const targetIdx = indexInDay + direction;
    if (targetIdx < 0 || targetIdx >= dayItems.length) return;

    const newDayItems = [...dayItems];
    const temp = newDayItems[indexInDay];
    newDayItems[indexInDay] = newDayItems[targetIdx];
    newDayItems[targetIdx] = temp;

    const otherItems = plan.items.filter((i) => i.day !== activeDay);
    patchPlan({ items: [...otherItems, ...newDayItems] });
  };

  // ย้ายสถานที่ไปวันอื่น
  const moveItemToDay = (item, newDay) => {
    patchPlan({
      items: plan.items.map((i) => (i === item ? { ...i, day: Number(newDay) } : i)),
    });
  };

  // ตรวจสอบข้อมูลก่อนเปิด Modal ยืนยันการบันทึก
  const handleRequestSave = () => {
    if (!plan.plan_name.trim()) {
      setValidationError('กรุณาระบุชื่อแผนการเดินทางก่อนทำการบันทึก');
      return;
    }
    if (plan.start_date && plan.start_date < minStartDate) {
      setValidationError('วันเริ่มต้นการเดินทางต้องไม่เป็นวันที่ผ่านมาแล้ว');
      return;
    }
    if (plan.start_date && plan.end_date && plan.end_date < plan.start_date) {
      setValidationError('วันสิ้นสุดการเดินทางต้องไม่เกิดขึ้นก่อนวันเริ่มต้น');
      return;
    }
    setValidationError('');
    setShowConfirmSave(true);
  };

  // บันทึกแผนจริงเมื่อยืนยันใน Modal
  const handleConfirmSave = async () => {
    setSaving(true);
    const body = {
      plan_name: plan.plan_name.trim(),
      start_date: plan.start_date || null,
      end_date: plan.end_date || null,
      items: plan.items
        .filter((i) => i.day <= days)
        .map((i) => ({ category: i.category, id: i.id, day: i.day })),
    };

    try {
      if (plan.plan_id) {
        await api.put(`/plans/${plan.plan_id}`, body);
      } else {
        await api.post('/plans', body);
      }
      setShowConfirmSave(false);
      onSaved(plan.plan_name.trim());
    } catch (err) {
      alert(errMsg(err, 'ไม่สามารถบันทึกแผนได้'));
    } finally {
      setSaving(false);
    }
  };

  const currentDayItems = plan.items.filter((i) => i.day === activeDay);

  // รายการที่จะแสดงฝั่งขวา (ค้นหา vs รายการโปรด)
  const rightList = useMemo(() => {
    if (source === 'favorites') {
      return favorites.filter((it) => {
        const matchCat = categoryFilter === 'all' || it.category === categoryFilter;
        const matchProv = provinceFilter === 'all' || it.province === provinceFilter;
        const matchQuery =
          !query.trim() ||
          it.name?.toLowerCase().includes(query.toLowerCase()) ||
          it.province?.toLowerCase().includes(query.toLowerCase());
        return matchCat && matchProv && matchQuery;
      });
    }
    return results;
  }, [source, favorites, results, categoryFilter, provinceFilter, query]);

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-2 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-fadeIn">
      <div className="bg-white rounded-[2.2rem] sm:rounded-[2.7rem] w-full max-w-6xl h-[92vh] max-h-[880px] shadow-2xl flex flex-col overflow-hidden border border-slate-100 animate-scaleUp">
        {/* ============================================================== */}
        {/* TOP BAR: ชื่อแผนและกำหนดการเดินทาง                                */}
        {/* ============================================================== */}
        <div className="p-5 sm:p-6 border-b border-slate-100 bg-slate-50/90 shrink-0">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-600 to-rose-600 text-white flex items-center justify-center font-black shadow-md shadow-pink-600/25">
                <Calendar size={20} />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-black text-slate-900">
                  {plan.plan_id ? 'แก้ไขแผนการเดินทาง' : 'สร้างแผนการเดินทางใหม่'}
                </h2>
                <p className="text-xs text-slate-400">
                  เลือกสถานที่ลงในตารางทีละวัน และปรับเปลี่ยนลำดับได้ตามต้องการ
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full text-slate-400 hover:bg-slate-200 transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form Inputs Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4 items-center">
            {/* Plan Name */}
            <div className="md:col-span-5">
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                ชื่อแผนการเดินทาง *
              </label>
              <input
                type="text"
                value={plan.plan_name}
                onChange={(e) => {
                  patchPlan({ plan_name: e.target.value });
                  if (validationError) setValidationError('');
                }}
                placeholder="เช่น โตเกียวและคานางาวะ 5 วัน 4 คืน"
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 shadow-sm"
              />
            </div>

            {/* Start Date */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                วันเริ่มต้น
              </label>
              <input
                type="date"
                value={plan.start_date}
                min={minStartDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  patchPlan({
                    start_date: newStart,
                    // หากวันสิ้นสุดที่เคยเลือกไว้ เกิดขึ้นก่อนวันเริ่มต้นใหม่ ให้ปรับวันสิ้นสุดให้เท่ากับวันเริ่มต้น
                    end_date: plan.end_date && plan.end_date < newStart ? newStart : plan.end_date,
                  });
                  if (validationError) setValidationError('');
                }}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-pink-500 shadow-sm"
              />
            </div>

            {/* End Date */}
            <div className="md:col-span-3">
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1">
                วันสิ้นสุด
              </label>
              <input
                type="date"
                value={plan.end_date}
                min={plan.start_date || minStartDate}
                onChange={(e) => {
                  patchPlan({ end_date: e.target.value });
                  if (validationError) setValidationError('');
                }}
                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 outline-none focus:border-pink-500 shadow-sm"
              />
            </div>

            {/* Total Days Indicator / Adjustment */}
            <div className="md:col-span-1 flex flex-col justify-end">
              <label className="block text-[11px] font-black text-slate-700 uppercase tracking-wider mb-1 text-center">
                จำนวนวัน
              </label>
              <div className="h-10 px-2 rounded-xl bg-pink-50 border border-pink-200 text-pink-700 font-mono font-black text-xs flex items-center justify-center">
                {days} วัน
              </div>
            </div>
          </div>

          {/* แถบแจ้งเตือนเมื่อเกิดข้อผิดพลาดในการตรวจสอบข้อมูล */}
          {validationError && (
            <div className="mt-3.5 px-4 py-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-bold text-rose-700 flex items-center gap-2 animate-fadeIn">
              <AlertTriangle size={16} className="text-rose-500 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* ============================================================== */}
        {/* MAIN SPLIT-PANE BUILDER                                        */}
        {/* ============================================================== */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          {/* ------------------------------------------------------------ */}
          {/* LEFT COLUMN: กำหนดการประจำวัน (DAILY SCHEDULE) - 6 COLS      */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-6 border-b lg:border-b-0 lg:border-r border-slate-200 flex flex-col bg-slate-50/50 overflow-hidden">
            {/* Days Tab Strip */}
            <div className="p-3 bg-white border-b border-slate-200/80 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {Array.from({ length: days }, (_, i) => i + 1).map((d) => {
                const count = plan.items.filter((it) => it.day === d).length;
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setActiveDay(d)}
                    className={`px-3.5 py-2 rounded-xl font-bold text-xs transition-all shrink-0 flex items-center gap-1.5 ${activeDay === d
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                  >
                    <span>วันที่ {d}</span>
                    <span
                      className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${activeDay === d ? 'bg-white/25 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}

              {/* Adjust day buttons if no date range is set */}
              {!autoDays && (
                <div className="flex items-center gap-1 ml-auto shrink-0 pl-2">
                  <button
                    type="button"
                    onClick={() => patchPlan({ days: Math.max(1, (plan.days || 1) - 1) })}
                    className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                    title="ลดจำนวนวัน"
                  >
                    <Minus size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => patchPlan({ days: Math.min(30, (plan.days || 1) + 1) })}
                    className="p-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200"
                    title="เพิ่มจำนวนวัน"
                  >
                    <Plus size={14} />
                  </button>
                </div>
              )}
            </div>

            {/* Daily Header */}
            <div className="px-5 py-3 border-b border-slate-200/60 bg-white/70 flex items-center justify-between text-xs">
              <span className="font-black text-slate-800 flex items-center gap-1.5">
                <Clock size={14} className="text-pink-600" />
                <span>กำหนดการวันที่ {activeDay}</span>
              </span>
              <span className="text-[11px] text-slate-500 font-semibold">
                มี {currentDayItems.length} สถานที่ในวันนี้
              </span>
            </div>

            {/* Timeline Item List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {currentDayItems.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center p-8 text-center text-slate-400">
                  <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
                    <Plus size={28} />
                  </div>
                  <h5 className="font-bold text-slate-700 text-sm mb-1">
                    ยังไม่มีสถานที่ในวันที่ {activeDay}
                  </h5>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                    ค้นหาหรือเลือกจากรายการโปรดในฝั่งขวา แล้วกดปุ่ม <strong>"+ เพิ่ม"</strong>{' '}
                    เพื่อนำมาจัดตารางสำหรับวันนี้
                  </p>
                </div>
              ) : (
                currentDayItems.map((it, idx) => {
                  const style = categoryStyles[it.category] || categoryStyles.attractions;
                  return (
                    <div
                      key={it.detail_id || `${it.category}-${it.id}-${idx}`}
                      className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-sm hover:border-pink-300 transition-all flex items-center gap-3 group"
                    >
                      {/* Order Index */}
                      <span className="w-7 h-7 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center font-black text-xs font-mono shrink-0">
                        {idx + 1}
                      </span>

                      {/* Thumbnail */}
                      <img
                        src={it.image_url || FALLBACK_IMG}
                        alt={it.name}
                        className="w-12 h-12 rounded-xl object-cover shrink-0 border border-slate-100"
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                      />

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-black border ${style.badge}`}
                          >
                            {style.icon} {categoryLabel(it.category)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{it.province}</span>
                        </div>
                        <h5 className="font-black text-xs text-slate-900 truncate">{it.name}</h5>
                        <p className="text-[10px] text-slate-400 truncate">
                          {it.open_time && it.close_time
                            ? `เปิด ${formatTime(it.open_time)} - ${formatTime(it.close_time)}`
                            : formatPrice(it.starting_price)}
                        </p>
                      </div>

                      {/* Actions: Reorder, Move Day, Delete */}
                      <div className="flex items-center gap-1 shrink-0">
                        {/* Move Up */}
                        <button
                          type="button"
                          disabled={idx === 0}
                          onClick={() => moveItemSequence(idx, -1)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="เลื่อนลำดับขึ้น"
                        >
                          <ArrowUp size={13} />
                        </button>
                        {/* Move Down */}
                        <button
                          type="button"
                          disabled={idx === currentDayItems.length - 1}
                          onClick={() => moveItemSequence(idx, 1)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 disabled:opacity-30 disabled:hover:bg-transparent"
                          title="เลื่อนลำดับลง"
                        >
                          <ArrowDown size={13} />
                        </button>

                        {/* Move Day Selector */}
                        <select
                          value={it.day}
                          onChange={(e) => moveItemToDay(it, e.target.value)}
                          className="text-[10px] font-bold bg-slate-100 text-slate-700 px-1.5 py-1 rounded-lg border border-slate-200 outline-none"
                          title="ย้ายไปวันอื่น"
                        >
                          {Array.from({ length: days }, (_, i) => i + 1).map((d) => (
                            <option key={d} value={d}>
                              วัน {d}
                            </option>
                          ))}
                        </select>

                        {/* Remove button */}
                        <button
                          type="button"
                          onClick={() => removeItem(it)}
                          className="p-1.5 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="ลบออกจากแผน"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ------------------------------------------------------------ */}
          {/* RIGHT COLUMN: คลังสถานที่ (DESTINATION EXPLORER) - 6 COLS     */}
          {/* ------------------------------------------------------------ */}
          <div className="lg:col-span-6 flex flex-col bg-white overflow-hidden">
            {/* Source Switcher (Search vs Favorites) */}
            <div className="p-3 border-b border-slate-100 bg-slate-50/60 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setSource('search')}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${source === 'search'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                <Search size={14} />
                <span>ค้นหาสถานที่ทั้งหมด</span>
              </button>
              <button
                type="button"
                onClick={() => setSource('favorites')}
                className={`flex-1 py-2 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all ${source === 'favorites'
                  ? 'bg-pink-600 text-white shadow-sm'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
              >
                <Heart size={14} />
                <span>รายการโปรดของคุณ ({favorites.length})</span>
              </button>
            </div>

            {/* Filter Bar (Search Query, Category, Province) */}
            <div className="p-3.5 border-b border-slate-100 space-y-2">
              <div className="relative">
                <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="ค้นหาชื่อสถานที่ หรือคำอธิบาย..."
                  className="w-full pl-9 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold outline-none focus:border-pink-500 focus:bg-white"
                />
                {query && (
                  <button
                    onClick={() => setQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                {/* Category Selector */}
                <CustomSelect
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  placeholder="ทุกหมวดหมู่"
                  size="sm"
                  options={[
                    { value: 'all', label: 'ทุกหมวดหมู่' },
                    ...(categoriesList.length > 0
                      ? categoriesList.map((c) => ({ value: c.category_key, label: c.name }))
                      : CATEGORIES.map((c) => ({ value: c.id, label: c.label }))),
                  ]}
                />

                {/* Province Selector */}
                <CustomSelect
                  value={provinceFilter}
                  onChange={(e) => setProvinceFilter(e.target.value)}
                  placeholder="ทุกจังหวัดในคันโต"
                  icon={MapPin}
                  size="sm"
                  options={[
                    { value: 'all', label: 'ทุกจังหวัดในคันโต' },
                    ...PROVINCES.map((p) => ({ value: p, label: p, icon: '📍' })),
                  ]}
                />
              </div>
            </div>

            {/* Places Results List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {loadingResults ? (
                <div className="py-12 text-center text-slate-400 text-xs font-bold flex items-center justify-center gap-2">
                  <Loader2 size={16} className="animate-spin text-pink-600" />
                  <span>กำลังค้นหาสถานที่...</span>
                </div>
              ) : rightList.length === 0 ? (
                <div className="py-16 text-center text-slate-400 text-xs font-bold">
                  {source === 'favorites' && favorites.length === 0
                    ? 'คุณยังไม่มีสถานที่ในรายการโปรด สามารถค้นหาจากแท็บ "ค้นหาสถานที่ทั้งหมด" ได้'
                    : 'ไม่พบสถานที่ที่ตรงกับเงื่อนไขการค้นหา'}
                </div>
              ) : (
                rightList.map((p) => {
                  const style = categoryStyles[p.category] || categoryStyles.attractions;
                  const alreadyInActiveDay = isAddedInDay(p, activeDay);

                  return (
                    <div
                      key={`${p.category}-${p.id}`}
                      className="p-3 rounded-2xl border border-slate-200 hover:border-pink-300 transition-all flex items-center justify-between gap-3 bg-white hover:bg-pink-50/20"
                    >
                      {/* Image Thumbnail */}
                      <img
                        src={p.image_url || FALLBACK_IMG}
                        alt={p.name}
                        className="w-13 h-13 rounded-xl object-cover shrink-0 border border-slate-100"
                        onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                      />

                      {/* Detail */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span
                            className={`px-2 py-0.2 rounded-full text-[9px] font-black border ${style.badge}`}
                          >
                            {style.icon} {categoryLabel(p.category)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold">{p.province}</span>
                        </div>
                        <h5 className="font-black text-xs text-slate-900 truncate">{p.name}</h5>
                        <p className="text-[10px] text-slate-500 font-medium">
                          {p.open_time && p.close_time
                            ? `เวลา ${formatTime(p.open_time)} - ${formatTime(p.close_time)}`
                            : formatPrice(p.starting_price)}
                        </p>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => onOpenMap(p)}
                          className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 transition-colors"
                          title="ดูบนแผนที่"
                        >
                          <Compass size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => addItem(p)}
                          disabled={alreadyInActiveDay}
                          className={`px-3 py-1.5 rounded-xl font-black text-xs transition-all flex items-center gap-1 ${alreadyInActiveDay
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200 cursor-default'
                            : 'bg-pink-600 hover:bg-pink-700 text-white shadow-sm shadow-pink-600/30 active:scale-95'
                            }`}
                        >
                          {alreadyInActiveDay ? (
                            <>
                              <Check size={12} className="stroke-[3]" />
                              <span>อยู่ในวัน {activeDay} แล้ว</span>
                            </>
                          ) : (
                            <>
                              <Plus size={12} className="stroke-[3]" />
                              <span>เพิ่มลงวัน {activeDay}</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* ============================================================== */}
        {/* BOTTOM ACTION BAR                                              */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-5 border-t border-slate-100 bg-white flex items-center justify-between gap-4 shrink-0">
          <div className="text-xs text-slate-500 font-bold hidden sm:block">
            <span>รวมทั้งหมด: </span>
            <strong className="text-pink-600">{plan.items.length} สถานที่</strong>
            <span> ใน </span>
            <strong className="text-slate-900">{days} วัน</strong>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-6 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleRequestSave}
              disabled={saving}
              className="flex-1 sm:flex-initial px-8 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs shadow-lg shadow-pink-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95"
            >
              <Save size={15} />
              <span>บันทึกแผนการเดินทาง</span>
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* MODAL: ยืนยันการบันทึกแผนการเดินทาง (CONFIRM SAVE MODAL)           */}
        {/* ============================================================== */}
        {showConfirmSave && (
          <div className="fixed inset-0 z-[10010] bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.2rem] p-6 sm:p-8 max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-100 text-center relative animate-in zoom-in-95 duration-200">
              <button
                type="button"
                onClick={() => !saving && setShowConfirmSave(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="ปิดหน้าต่าง"
              >
                <X size={18} />
              </button>

              {/* Icon Banner */}
              <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 mx-auto mb-4 shadow-sm">
                <Calendar size={32} />
              </div>

              {/* Title & Description */}
              <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
                ยืนยันการบันทึกแผนการเดินทาง?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
                กรุณาตรวจสอบข้อมูลแผนการเดินทางของคุณก่อนกดยืนยันการบันทึก
              </p>

              {/* Details Card */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-100 text-left space-y-2.5 mb-6 text-xs sm:text-sm">
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    ชื่อแผน:
                  </span>
                  <span className="font-black text-slate-800 text-right truncate max-w-[200px]">
                    {plan.plan_name.trim()}
                  </span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-200/60 pb-2">
                  <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    ระยะเวลา:
                  </span>
                  <span className="font-bold text-slate-700">
                    {days} วัน {plan.start_date ? `(${fmtDate(plan.start_date)}${plan.end_date ? ` - ${fmtDate(plan.end_date)}` : ''})` : '(ไม่ระบุวันที่)'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-400 font-bold text-[11px] uppercase tracking-wider">
                    สถานที่ทั้งหมด:
                  </span>
                  <span className="font-black text-pink-600">
                    {plan.items.length} สถานที่
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowConfirmSave(false)}
                  disabled={saving}
                  className="flex-1 py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSave}
                  disabled={saving}
                  className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-700 hover:to-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      <span>ยืนยันบันทึก</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL: แจ้งเตือนข้อผิดพลาดการกรอกข้อมูล (VALIDATION ALERT)          */}
        {/* ============================================================== */}
        {validationError && (
          <div className="fixed inset-0 z-[10010] bg-slate-950/65 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-[2rem] p-6 sm:p-7 max-w-sm w-full shadow-2xl border border-slate-100 text-center space-y-4 animate-in zoom-in-95 duration-200">
              <div className="w-16 h-16 mx-auto rounded-full bg-amber-50 text-amber-500 border-4 border-amber-100 flex items-center justify-center">
                <AlertTriangle size={28} className="stroke-[2.5]" />
              </div>
              <div className="space-y-1">
                <h3 className="text-lg font-black text-slate-900">ไม่สามารถบันทึกได้</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{validationError}</p>
              </div>
              <button
                type="button"
                onClick={() => setValidationError('')}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm transition-colors"
              >
                ตกลง
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlanPage;
