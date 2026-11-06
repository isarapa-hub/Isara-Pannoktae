import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  MapPin,
  Clock,
  Heart,
  Calendar,
  ArrowLeft,
  Loader2,
  Tag,
  Share2,
  Navigation,
  ExternalLink,
  ChevronLeft,
  ChevronRight,
  X,
  Sparkles,
  Maximize2,
  CheckCircle2,
  Compass,
  Coins,
  ShieldCheck,
  Eye,
} from 'lucide-react';
import api, { errMsg } from '../connectAPI/axios';
import MapModal from '../components/MapModal';
import PlaceCard from '../components/PlaceCard';
import Footer from '../components/Footer';
import useFavorites from '../hooks/useFavorites';
import {
  categoryLabel,
  FALLBACK_IMG,
  formatPrice,
  formatTime,
  mapsEmbedUrl,
  mapsDirectionUrl,
} from '../utils/constants';
import { getUser } from '../utils/auth';

const categoryThemes = {
  attractions: {
    label: 'สถานที่ท่องเที่ยว',
    gradient: 'from-rose-500 to-red-600',
    badge: 'bg-rose-500 text-white shadow-rose-500/25',
    accent: 'text-rose-600',
    bgLight: 'bg-rose-50',
    border: 'border-rose-100',
    glow: 'shadow-rose-500/30',
  },
  restaurants: {
    label: 'ร้านอาหาร',
    gradient: 'from-amber-500 to-orange-600',
    badge: 'bg-amber-500 text-white shadow-amber-500/25',
    accent: 'text-amber-600',
    bgLight: 'bg-amber-50',
    border: 'border-amber-100',
    glow: 'shadow-amber-500/30',
  },
  accommodations: {
    label: 'ที่พัก',
    gradient: 'from-emerald-500 to-teal-600',
    badge: 'bg-emerald-600 text-white shadow-emerald-500/25',
    accent: 'text-emerald-600',
    bgLight: 'bg-emerald-50',
    border: 'border-emerald-100',
    glow: 'shadow-emerald-500/30',
  },
  cafes: {
    label: 'คาเฟ่',
    gradient: 'from-indigo-500 to-purple-600',
    badge: 'bg-indigo-600 text-white shadow-indigo-500/25',
    accent: 'text-indigo-600',
    bgLight: 'bg-indigo-50',
    border: 'border-indigo-100',
    glow: 'shadow-indigo-500/30',
  },
};

const PlaceDetailPage = () => {
  const { category, id } = useParams();
  const navigate = useNavigate();
  const { isFav, toggle } = useFavorites();

  const [place, setPlace] = useState(null);
  const [error, setError] = useState(null);
  const [activePhoto, setActivePhoto] = useState(0);
  const [showMapModal, setShowMapModal] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [relatedPlaces, setRelatedPlaces] = useState([]);

  // โหลดข้อมูลสถานที่เดี่ยว
  useEffect(() => {
    setPlace(null);
    setError(null);
    setActivePhoto(0);

    api.get(`/places/${category}/${id}`)
      .then((res) => {
        setPlace(res.data);
      })
      .catch((err) => setError(errMsg(err, 'ไม่สามารถโหลดข้อมูลสถานที่นี้ได้')));
  }, [category, id]);

  // โหลดสถานที่ใกล้เคียง/หมวดหมู่เดียวกันสำหรับส่วนแนะนำ
  useEffect(() => {
    if (!category) return;
    api.get(`/places/${category}`)
      .then((res) => {
        const others = (res.data || [])
          .filter((p) => String(p.id) !== String(id))
          .slice(0, 3);
        setRelatedPlaces(others);
      })
      .catch(() => setRelatedPlaces([]));
  }, [category, id]);

  // คัดลอกลิงก์
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const addToPlan = () => {
    if (!getUser()) {
      window.dispatchEvent(
        new CustomEvent('open-login-prompt', {
          detail: { place, reason: 'plan' },
        })
      );
      return;
    }
    navigate('/plan', { state: { add: place } });
  };

  if (error) {
    return (
      <div className="min-h-screen pt-40 text-center px-6 bg-slate-50">
        <div className="max-w-md mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
          <p className="text-slate-700 font-bold text-lg mb-4">{error}</p>
          <Link
            to="/search"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-rose-600 text-white font-bold text-sm shadow-md hover:bg-rose-700 transition-all"
          >
            <ArrowLeft size={16} /> กลับไปหน้าค้นหาสถานที่
          </Link>
        </div>
      </div>
    );
  }

  if (!place) {
    return (
      <div className="min-h-screen pt-40 flex flex-col items-center justify-center bg-slate-50 gap-4">
        <Loader2 size={48} className="animate-spin text-rose-600" />
        <p className="text-sm font-bold text-slate-500">กำลังโหลดข้อมูลสถานที่จากฐานข้อมูล...</p>
      </div>
    );
  }

  // รวมรูปหน้าปกและแกลเลอรีที่แอดมินอัปโหลด
  const allImages = [place.image_url, ...(place.gallery || [])].filter(Boolean);
  if (allImages.length === 0) allImages.push(FALLBACK_IMG);

  const theme = categoryThemes[place.category] || {
    label: place.category_name || categoryLabel(place.category),
    gradient: 'from-pink-500 to-rose-600',
    badge: 'bg-pink-600 text-white shadow-pink-500/25',
    accent: 'text-pink-600',
    bgLight: 'bg-pink-50',
    border: 'border-pink-100',
    glow: 'shadow-pink-500/30',
  };
  const isFree = Number(place.starting_price) === 0 || place.starting_price == null;
  const estimatedBaht = Math.round(Number(place.starting_price || 0) * 0.24);

  // ฟังก์ชันควบคุม Lightbox
  const openLightbox = (index) => {
    setLightboxIndex(index);
    setIsLightboxOpen(true);
  };
  const nextLightbox = () => {
    setLightboxIndex((prev) => (prev + 1) % allImages.length);
  };
  const prevLightbox = () => {
    setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50 pt-28 pb-16 flex flex-col justify-between">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 md:px-8 w-full">

        {/* 1. Header & Navigation Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-sm transition-all border border-slate-200/80 shadow-xs hover:-translate-x-0.5"
            >
              <ArrowLeft size={16} /> ย้อนกลับ
            </button>

            {/* Breadcrumb Path */}
            <div className="hidden sm:flex items-center gap-2 text-xs font-semibold text-slate-400">
              <Link to="/" className="hover:text-slate-700 transition-colors">หน้าหลัก</Link>
              <span>/</span>
              <Link to={`/search?category=${place.category}`} className="hover:text-slate-700 transition-colors">
                {place.category_name || categoryLabel(place.category)}
              </Link>
              <span>/</span>
              <span className="text-slate-800 font-bold truncate max-w-[200px]">{place.name}</span>
            </div>
          </div>

          {/* Quick Action (Fav) */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => toggle(place)}
              className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs md:text-sm border shadow-xs transition-all ${isFav(place)
                  ? 'bg-rose-50 border-rose-200 text-rose-600'
                  : 'bg-white border-slate-200/80 text-slate-700 hover:text-rose-600 hover:bg-rose-50/50'
                }`}
            >
              <Heart size={15} fill={isFav(place) ? 'currentColor' : 'none'} />
              <span className="hidden xs:inline">{isFav(place) ? 'บันทึกแล้ว' : 'บันทึก'}</span>
            </button>
          </div>
        </div>

        {/* 2. Modern Photo Showcase & Gallery (ดึงจาก image_url และ gallery) */}
        <div className="mb-10">
          {/* Main Photo Layout */}
          <div className="relative rounded-[2.5rem] overflow-hidden bg-slate-900 shadow-xl border border-slate-100 group aspect-[16/9] md:aspect-[21/9] max-h-[480px]">
            <img
              src={allImages[activePhoto]}
              onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
              alt={place.name}
              className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105 cursor-pointer"
              onClick={() => openLightbox(activePhoto)}
            />

            {/* Gradient Overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent pointer-events-none" />

            {/* Badges Floating on Top Left */}
            <div className="absolute top-5 left-5 flex flex-wrap items-center gap-2 z-10">
              <span className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider backdrop-blur-md shadow-lg ${theme.badge}`}>
                {place.category_name || categoryLabel(place.category)}
              </span>
              {place.province && (
                <span className="px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md text-slate-800 text-xs font-bold shadow-md flex items-center gap-1">
                  <MapPin size={13} className="text-rose-600" />
                  <span>{place.province}</span>
                </span>
              )}
            </div>

            {/* Bottom Floating Bar on Hero */}
            <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4 z-10 text-white">
              <div className="max-w-2xl">
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-black drop-shadow-md tracking-tight">
                  {place.name}
                </h1>
                {place.type && (
                  <p className="text-white/80 text-xs md:text-sm font-semibold mt-1 flex items-center gap-1.5">
                    <Tag size={14} className="text-rose-400" />
                    <span>{place.type}</span>
                  </p>
                )}
              </div>

              {/* View Fullscreen Button */}
              <button
                onClick={() => openLightbox(activePhoto)}
                className="px-4 py-2 rounded-2xl bg-black/60 hover:bg-black/80 backdrop-blur-md text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-md shrink-0"
              >
                <Maximize2 size={14} />
                <span>ดูรูปขนาดใหญ่ ({allImages.length} รูป)</span>
              </button>
            </div>
          </div>

          {/* Gallery Thumbnails Strip (ถ้าแอดมินอัปโหลดรูปมาหลายรูป) */}
          {allImages.length > 1 && (
            <div className="flex items-center gap-3 mt-4 overflow-x-auto pb-2 scrollbar-none">
              {allImages.map((src, idx) => (
                <button
                  key={idx}
                  onClick={() => setActivePhoto(idx)}
                  className={`relative shrink-0 w-24 sm:w-28 h-18 sm:h-20 rounded-2xl overflow-hidden transition-all duration-200 border-2 ${activePhoto === idx
                    ? 'border-rose-600 ring-4 ring-rose-600/20 scale-105'
                    : 'border-transparent opacity-70 hover:opacity-100 hover:scale-102'
                    }`}
                >
                  <img
                    src={src}
                    onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                    alt={`thumb-${idx}`}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded-md bg-black/70 text-white text-[9px] font-bold">
                    {idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 3. Main Content & Sidebar Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-10">

          {/* Left Column: ข้อมูลรายละเอียดและไฮไลต์ (7 / 12) */}
          <div className="lg:col-span-7 xl:col-span-8 space-y-8">

            {/* Quick Stats Bento Grid (อ้างอิงข้อมูลหลังบ้าน: เวลาเปิดปิด, ราคา, ประเภท, พิกัด) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Box 1: เวลาทำการ */}
              <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-sm text-left">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mb-3">
                  <Clock size={20} className="text-rose-600" />
                </div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">เวลาทำการ</div>
                <div className="text-sm md:text-base font-black text-slate-800 mt-1">
                  {place.open_time && place.close_time
                    ? `${formatTime(place.open_time)} - ${formatTime(place.close_time)} น.`
                    : 'เปิดตลอด / เช็กเวลา'}
                </div>
              </div>

              {/* Box 2: ราคาเริ่มต้น */}
              <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-sm text-left">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mb-3">
                  <Coins size={20} className="text-amber-500" />
                </div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">ราคาเริ่มต้น</div>
                <div className="text-sm md:text-base font-black text-slate-800 mt-1 truncate">
                  {formatPrice(place.starting_price)}
                </div>
              </div>

              {/* Box 3: ประเภทสถานที่ */}
              <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-sm text-left">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mb-3">
                  <Tag size={20} className="text-emerald-600" />
                </div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">ประเภท</div>
                <div className="text-sm md:text-base font-black text-slate-800 mt-1 truncate">
                  {place.type || categoryLabel(place.category)}
                </div>
              </div>

              {/* Box 4: พิกัดที่ตั้ง */}
              <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-100 shadow-sm text-left">
                <div className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-700 flex items-center justify-center mb-3">
                  <Compass size={20} className="text-blue-600" />
                </div>
                <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider">จังหวัด</div>
                <div className="text-sm md:text-base font-black text-slate-800 mt-1 truncate">
                  {place.province || 'คันโต'}
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="bg-white rounded-[2.5rem] p-7 md:p-9 border border-slate-100 shadow-sm text-left space-y-4">
              <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
                <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                  <Sparkles size={20} />
                </div>
                <div>
                  <h2 className="text-xl md:text-2xl font-black text-slate-900">รายละเอียดและจุดเด่น</h2>
                  <p className="text-xs text-slate-400">ข้อมูลแนะนำสำหรับการเดินทางและท่องเที่ยว</p>
                </div>
              </div>

              <div className="text-slate-600 leading-relaxed md:text-lg whitespace-pre-line font-normal pt-2">
                {place.description || 'ยังไม่มีรายละเอียดสำหรับสถานที่นี้ แอดมินกำลังอัปเดตข้อมูลเพิ่มเติม'}
              </div>
            </div>

            {/* 4. Interactive Embedded Google Map Section (อ้างอิงจาก latitude และ longitude ที่แอดมินปักหมุด) */}
            <div className="bg-white rounded-[2.5rem] p-7 md:p-9 border border-slate-100 shadow-sm text-left space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <h2 className="text-xl md:text-2xl font-black text-slate-900">ตำแหน่งที่ตั้งบนแผนที่</h2>
                    <p className="text-xs text-slate-400 font-mono mt-0.5">
                      {place.latitude && place.longitude
                        ? `GPS: ${place.latitude}, ${place.longitude}`
                        : `${place.province} ประเทศญี่ปุ่น`}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowMapModal(true)}
                    className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors"
                  >
                    ขยายเต็มจอ
                  </button>
                  <a
                    href={mapsDirectionUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs transition-colors shadow-sm"
                  >
                    <Navigation size={13} />
                    <span>เปิดแอปฯ Google Maps ↗</span>
                  </a>
                </div>
              </div>

              {/* Embedded Google Maps Container */}
              <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden border border-slate-200/80 shadow-inner bg-slate-100 relative">
                <iframe
                  title={`Map of ${place.name}`}
                  src={mapsEmbedUrl(place)}
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-1 text-xs text-slate-400">
                <div className="flex items-center gap-1.5">
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span>ตำแหน่งได้รับการยืนยันและปักหมุดแล้วโดยทีมงาน JP TRIP</span>
                </div>
                <span>ภูมิภาคคันโต ประเทศญี่ปุ่น</span>
              </div>
            </div>

          </div>

          {/* Right Column: Sticky Action & Planning Card (5 / 12) */}
          <div className="lg:col-span-5 xl:col-span-4">
            <div className="sticky top-28 space-y-6">

              {/* Booking & Planning Card */}
              <div className="bg-white rounded-[2.5rem] p-7 md:p-8 shadow-xl shadow-slate-200/60 border border-slate-100 text-left space-y-6">

                {/* Price Header */}
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                    อัตราค่าบริการ / ราคาเริ่มต้น
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl md:text-4xl font-black text-slate-900">
                      {formatPrice(place.starting_price)}
                    </span>
                    {!isFree && (
                      <span className="text-xs md:text-sm font-bold text-slate-400">
                        (~{estimatedBaht.toLocaleString()} บาท)
                      </span>
                    )}
                  </div>
                  {isFree && (
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold mt-2">
                      <CheckCircle2 size={13} />
                      <span>ไม่มีค่าใช้จ่ายในการเข้าชม</span>
                    </div>
                  )}
                </div>

                {/* Main Action Buttons */}
                <div className="space-y-3 pt-2">
                  {/* Primary: เพิ่มลงแผนการเดินทาง */}
                  <button
                    type="button"
                    onClick={addToPlan}
                    className={`w-full py-4 px-6 rounded-2xl bg-gradient-to-r ${theme.gradient} hover:opacity-95 text-white font-black text-sm md:text-base shadow-xl ${theme.glow} transition-all duration-300 flex items-center justify-center gap-2.5 hover:scale-[1.02] active:scale-[0.98]`}
                  >
                    <Calendar size={19} />
                    <span>เพิ่มลงแผนการเดินทาง (Trip Plan)</span>
                  </button>

                  {/* Secondary: เพิ่มในรายการโปรด */}
                  <button
                    type="button"
                    onClick={() => toggle(place)}
                    className={`w-full py-3.5 px-6 rounded-2xl font-bold text-sm md:text-base transition-all duration-200 flex items-center justify-center gap-2 border-2 ${isFav(place)
                      ? 'border-rose-300 bg-rose-50 text-rose-600 shadow-sm'
                      : 'border-slate-200 bg-white text-slate-700 hover:border-rose-200 hover:text-rose-600 hover:bg-rose-50/30'
                      }`}
                  >
                    <Heart size={18} fill={isFav(place) ? 'currentColor' : 'none'} />
                    <span>{isFav(place) ? 'บันทึกในรายการโปรดแล้ว' : 'เพิ่มในรายการโปรด'}</span>
                  </button>

                  {/* Tertiary: นำทาง Google Maps */}
                  <a
                    href={mapsDirectionUrl(place)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-md hover:scale-[1.01]"
                  >
                    <Navigation size={17} />
                    <span>นำทางด้วย Google Maps</span>
                  </a>
                </div>

              </div>

              {/* Quick Info Box: เวลาทำการ */}
              <div className="bg-slate-50/80 rounded-3xl p-6 border border-slate-200/80 text-left text-xs space-y-3">
                <div className="flex items-center gap-2 font-black text-slate-700 text-sm">
                  <Clock size={16} className="text-rose-600" />
                  <span>สรุปข้อมูลการเดินทาง</span>
                </div>
                <div className="text-slate-600 space-y-1.5 leading-relaxed">
                  <p>• <strong>จังหวัด:</strong> {place.province || 'คันโต ประเทศญี่ปุ่น'}</p>
                  <p>• <strong>เวลาเปิดทำการ:</strong> {place.open_time && place.close_time ? `${formatTime(place.open_time)} - ${formatTime(place.close_time)} น.` : 'กรุณาตรวจสอบเวลาทำการอีกครั้ง'}</p>
                  <p>• <strong>หมวดหมู่:</strong> {categoryLabel(place.category)} ({place.type || 'ทั่วไป'})</p>
                </div>
              </div>

            </div>
          </div>

        </div>

        {/* 5. Related Recommendations Section */}
        {relatedPlaces.length > 0 && (
          <div className="mt-16 pt-12 border-t border-slate-200/80 text-left">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                  สถานที่น่าสนใจอื่นๆ ในหมวด{categoryLabel(place.category)}
                </h3>
                <p className="text-sm text-slate-500 mt-1">
                  คัดสรรสถานที่ยอดนิยมเพื่อเติมเต็มทริปท่องเที่ยวญี่ปุ่นของคุณ
                </p>
              </div>
              <Link
                to={`/search?category=${place.category}`}
                className="hidden sm:inline-flex items-center gap-1 text-sm font-bold text-rose-600 hover:text-rose-700 hover:underline"
              >
                <span>ดูทั้งหมด</span>
                <ChevronRight size={16} />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {relatedPlaces.map((item) => (
                <PlaceCard
                  key={item.id}
                  place={item}
                  isFav={isFav(item)}
                  onToggleFav={() => toggle(item)}
                  onOpenMap={() => setShowMapModal(true)}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* Lightbox Modal (ดูรูปแกลเลอรีแบบเต็มจอ) */}
      {isLightboxOpen && (
        <div
          className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
          onClick={() => setIsLightboxOpen(false)}
        >
          <div
            className="relative max-w-5xl w-full flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="w-full flex items-center justify-between text-white mb-4 px-2">
              <span className="font-bold text-sm">
                รูปภาพที่ {lightboxIndex + 1} จาก {allImages.length}
              </span>
              <button
                type="button"
                onClick={() => setIsLightboxOpen(false)}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Photo Display */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center">
              <img
                src={allImages[lightboxIndex]}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                alt={`lightbox-${lightboxIndex}`}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl"
              />

              {allImages.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={prevLightbox}
                    className="absolute left-3 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all shadow-lg"
                    title="รูปก่อนหน้า"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={nextLightbox}
                    className="absolute right-3 p-3 rounded-full bg-black/50 hover:bg-black/80 text-white transition-all shadow-lg"
                    title="รูปถัดไป"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Map Modal (ขยายแผนที่เต็มจอเมื่อคลิก) */}
      {showMapModal && <MapModal place={place} onClose={() => setShowMapModal(false)} />}

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default PlaceDetailPage;
