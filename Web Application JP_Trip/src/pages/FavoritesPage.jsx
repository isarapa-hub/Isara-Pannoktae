import React, { useState, useEffect, useMemo } from 'react';
import {
  Heart,
  Sparkles,
  MapPin,
  Calendar,
  Compass,
  Loader2,
  X,
  Trash2,
  CheckCircle2,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api, { errMsg } from '../connectAPI/axios';
import PlaceCard from '../components/PlaceCard';
import MapModal from '../components/MapModal';
import Footer from '../components/Footer';
import { CATEGORIES, categoryLabel, FALLBACK_IMG, setDynamicCategories } from '../utils/constants';

const defaultCategoryTabs = [
  { id: 'all', label: 'ทั้งหมด' },
  ...CATEGORIES,
];

const FavoritesPage = () => {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');
  const [mapPlace, setMapPlace] = useState(null);

  // Modal ยืนยันการลบรายการโปรด
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast แจ้งเตือนสถานะ
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    fetchFavorites();
    api.get('/categories')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategoriesList(res.data);
          setDynamicCategories(res.data);
        }
      })
      .catch(() => {});
  }, []);

  const categoryTabs = useMemo(() => {
    if (categoriesList.length > 0) {
      return [
        { id: 'all', label: 'ทั้งหมด' },
        ...categoriesList.map((c) => ({ id: c.category_key, label: c.name })),
      ];
    }
    return defaultCategoryTabs;
  }, [categoriesList]);

  const fetchFavorites = () => {
    setLoading(true);
    api.get('/favorites')
      .then((res) => setFavorites(res.data || []))
      .catch((err) => setError(errMsg(err, 'ไม่สามารถโหลดข้อมูลรายการโปรดได้')))
      .finally(() => setLoading(false));
  };

  // ยืนยันการนำออกจากรายการโปรดใน Modal
  const confirmRemoveFavorite = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await api.delete(`/favorites/${deleteTarget.category}/${deleteTarget.id}`);
      setFavorites((prev) =>
        prev.filter((f) => !(f.id === deleteTarget.id && f.category === deleteTarget.category))
      );
      showToast(`นำ "${deleteTarget.name}" ออกจากรายการโปรดเรียบร้อย`);
      setDeleteTarget(null);
    } catch (err) {
      alert(errMsg(err, 'เกิดข้อผิดพลาดในการนำออกจากรายการโปรด'));
    } finally {
      setIsDeleting(false);
    }
  };

  // นับจำนวนรายการในแต่ละหมวดหมู่แบบไดนามิก
  const counts = useMemo(() => {
    const c = { all: favorites.length };
    favorites.forEach((f) => {
      if (f.category) {
        c[f.category] = (c[f.category] || 0) + 1;
      }
    });
    return c;
  }, [favorites]);

  // กรองตามแท็บหมวดหมู่
  const filteredPlaces = useMemo(() => {
    if (activeTab === 'all') return favorites;
    return favorites.filter((item) => item.category === activeTab);
  }, [favorites, activeTab]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/20 via-white to-slate-50/50 pt-28 pb-20 flex flex-col justify-between">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-6 z-[10001] px-5 py-3 rounded-2xl bg-slate-900 text-white text-xs sm:text-sm font-bold shadow-2xl flex items-center gap-2.5 backdrop-blur-md border border-slate-700/50 animate-bounce">
          <CheckCircle2 size={18} className="text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 w-full flex-1">
        {/* Header Hero Section */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 sm:p-10 text-white shadow-xl mb-8 border border-slate-700/50 text-left">
          <div className="absolute -right-16 -top-16 w-80 h-80 rounded-full bg-rose-500/15 blur-3xl pointer-events-none" />
          <div className="absolute left-1/3 -bottom-20 w-80 h-80 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-3 max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-black uppercase tracking-wider">
                <Sparkles size={14} className="text-rose-400" />
                <span>My Saved Places</span>
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-white flex items-center gap-3">
                <span>รายการโปรดของคุณ</span>
                <span className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-lg shadow-rose-500/30 text-base">
                  <Heart size={20} className="fill-white" />
                </span>
              </h1>
              <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
                รวบรวมสถานที่ท่องเที่ยว ร้านอาหาร และที่พักที่คุณสนใจ พร้อมสำหรับจัดตารางทริปญี่ปุ่นในแบบที่คุณต้องการ
              </p>
            </div>

            {/* Quick Action to Plan Page */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              <div className="px-5 py-3 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-left sm:text-right">
                <div className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">บันทึกไว้แล้ว</div>
                <div className="text-2xl font-black text-white font-mono">
                  {favorites.length} <span className="text-xs font-bold text-rose-300">แห่ง</span>
                </div>
              </div>
              <Link
                to="/plan"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Calendar size={17} />
                <span>ไปวางแผนการเดินทาง</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          </div>
        </section>

        {/* Filter Toolbar (Category Tabs) */}
        <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm overflow-x-auto scrollbar-none w-fit mb-8">
          {categoryTabs.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveTab(t.id)}
              className={`px-4 sm:px-5 py-2.5 rounded-xl font-bold text-xs sm:text-sm transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === t.id
                  ? 'bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-rose-600/25'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <span>{t.label}</span>
              <span
                className={`px-2 py-0.5 rounded-full text-[11px] font-mono font-black ${
                  activeTab === t.id
                    ? 'bg-white/20 text-white'
                    : 'bg-slate-100 text-slate-500'
                }`}
              >
                {counts[t.id] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Error State */}
        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-5 rounded-2xl font-bold text-sm text-center mb-8">
            {error}
          </div>
        )}

        {/* Main Content: Loading | Cards Grid | Empty State */}
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 size={40} className="animate-spin text-rose-600" />
            <p className="text-sm font-bold text-slate-400">กำลังโหลดรายการโปรดของคุณ...</p>
          </div>
        ) : filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
            {filteredPlaces.map((item) => (
              <PlaceCard
                key={`${item.category}-${item.id}`}
                place={item}
                isFav
                onToggleFav={() => setDeleteTarget(item)}
                onOpenMap={setMapPlace}
              />
            ))}
          </div>
        ) : (
          /* Empty State สวยงาม ทันสมัย */
          <div className="bg-white rounded-[2.5rem] p-12 sm:p-16 text-center shadow-sm border border-slate-100 max-w-xl mx-auto my-8 space-y-5">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-inner">
              <Heart size={38} className="fill-rose-500/20 stroke-rose-500 stroke-2" />
            </div>

            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900">
                {activeTab !== 'all'
                  ? `ยังไม่มีรายการโปรดในหมวด${categoryTabs.find((t) => t.id === activeTab)?.label}`
                  : 'คุณยังไม่มีรายการโปรดที่บันทึกไว้'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium max-w-md mx-auto">
                เริ่มต้นสำรวจสถานที่ท่องเที่ยว ร้านอาหาร และที่พักในคันโต แล้วกดไอคอนหัวใจเพื่อบันทึกไว้ที่นี่
              </p>
            </div>

            <div className="pt-2">
              <Link
                to="/search"
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all hover:scale-[1.02]"
              >
                <Compass size={17} />
                <span>ไปสำรวจสถานที่ท่องเที่ยวญี่ปุ่น 🎌</span>
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* CUSTOM IN-APP CONFIRMATION MODAL (แทนที่ window.confirm เดิมอย่างสวยงาม) */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
          onClick={() => !isDeleting && setDeleteTarget(null)}
        >
          <div
            className="bg-white rounded-[2.5rem] w-full max-w-md p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden animate-scaleUp"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Accent Decor */}
            <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-inner mb-4">
              <Trash2 size={30} />
            </div>

            <div className="space-y-2 mb-5">
              <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                นำออกจากรายการโปรด?
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                คุณแน่ใจหรือไม่ว่าต้องการนำสถานที่นี้ออกจากรายการโปรดของคุณ
              </p>
            </div>

            {/* Preview Mini Card ของสถานที่ที่จะลบ */}
            <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3 text-left">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 shadow-xs">
                <img
                  src={deleteTarget.image_url || FALLBACK_IMG}
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                  alt={deleteTarget.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[10px] font-black text-rose-600 uppercase tracking-wider truncate">
                  {categoryLabel(deleteTarget.category)}
                </div>
                <h4 className="text-sm font-black text-slate-800 truncate">
                  {deleteTarget.name}
                </h4>
                {deleteTarget.province && (
                  <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                    <MapPin size={11} className="text-rose-500" />
                    <span>{deleteTarget.province}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
                className="flex-1 py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmRemoveFavorite}
                disabled={isDeleting}
                className="flex-1 py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>กำลังนำออก...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>ยืนยันนำออก</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Map Modal */}
      {mapPlace && <MapModal place={mapPlace} onClose={() => setMapPlace(null)} />}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default FavoritesPage;
