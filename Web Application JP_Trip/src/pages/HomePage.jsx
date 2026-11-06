import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  MapPin,
  Heart,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Utensils,
  BedDouble,
  Compass,
  Coffee,
  Camera,
  ShoppingBag,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../connectAPI/axios';
import useFavorites from '../hooks/useFavorites';
import { FALLBACK_IMG, formatPrice, setDynamicCategories } from '../utils/constants';
import Footer from '../components/Footer';

// รายการรูปภาพประเทศญี่ปุ่น คมชัดระดับ Ultra HD / 4K สำหรับ Hero Slideshow
const HERO_IMAGES = [
  // 1. ภูเขาไฟฟูจิกับเจดีย์ชูเรโตะ
  "https://images.unsplash.com/photo-1526481280693-3bfa7568e0f3?auto=format&fit=crop&w=2070&q=80",
  // 2. วัดเซนโซจิ อาซากุสะ
  "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?auto=format&fit=crop&w=2070&q=80",
  // 3. วิวชายหาดคามาคุระและภูเขาไฟฟูจิยามพระอาทิตย์ตก
  "https://artralux.co.th/wp-content/uploads/2024/01/%E0%B9%80%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%A7%E0%B8%8D%E0%B8%B5%E0%B9%88%E0%B8%9B%E0%B8%B8%E0%B9%88%E0%B8%99-1.jpg",
  // 4. ย่านชินจูกุ/ชิบูย่ายามค่ำคืน
  "https://artralux.co.th/wp-content/uploads/2024/01/%E0%B9%80%E0%B8%97%E0%B8%B5%E0%B9%88%E0%B8%A2%E0%B8%A7%E0%B8%8D%E0%B8%B5%E0%B9%88%E0%B8%9B%E0%B8%B8%E0%B9%88%E0%B8%99.jpg",
];

const CATEGORY_THEMES = {
  attractions: {
    icon: Compass,
    accent: 'text-rose-600',
    bgLight: 'bg-rose-50 text-rose-600 border-rose-200/80',
    gradient: 'from-rose-500 to-pink-500',
    badge: 'bg-rose-500 text-white',
  },
  restaurants: {
    icon: Utensils,
    accent: 'text-amber-600',
    bgLight: 'bg-amber-50 text-amber-600 border-amber-200/80',
    gradient: 'from-amber-500 to-orange-500',
    badge: 'bg-amber-500 text-white',
  },
  accommodations: {
    icon: BedDouble,
    accent: 'text-indigo-600',
    bgLight: 'bg-indigo-50 text-indigo-600 border-indigo-200/80',
    gradient: 'from-indigo-500 to-blue-500',
    badge: 'bg-indigo-600 text-white',
  },
  cafes: {
    icon: Coffee,
    accent: 'text-pink-600',
    bgLight: 'bg-pink-50 text-pink-600 border-pink-200/80',
    gradient: 'from-pink-500 to-rose-500',
    badge: 'bg-pink-600 text-white',
  },
};

const HomePage = () => {
  const navigate = useNavigate();
  const [popular, setPopular] = useState([]);
  const [categoriesList, setCategoriesList] = useState([]);
  const [allPlaces, setAllPlaces] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const { isFav, toggle } = useFavorites();

  // 🚀 ดึงข้อมูลสถานที่ยอดนิยมที่ผ่านการประมวลผลด้วย Weighted Popularity Score จาก Backend
  useEffect(() => {
    api.get('/popular', { params: { limit: 4 } })
      .then((res) => {
        setPopular(res.data || []);
      })
      .catch((err) => {
        console.error("เกิดข้อผิดพลาดในการดึงสถานที่ยอดนิยม:", err);
      });
  }, []);

  // 📦 ดึงข้อมูลหมวดหมู่และสถานที่ทั้งหมดแบบไดนามิกจาก Database
  useEffect(() => {
    setLoadingCategories(true);
    Promise.all([
      api.get('/categories').catch(() => ({ data: [] })),
      api.get('/all-places').catch(() => ({ data: [] })),
    ])
      .then(([catRes, placesRes]) => {
        const cats = Array.isArray(catRes.data) && catRes.data.length > 0 ? catRes.data : [
          { category_key: 'attractions', name: 'สถานที่ท่องเที่ยว', description: 'สถานที่ท่องเที่ยวยอดนิยมในภูมิภาคคันโต' },
          { category_key: 'restaurants', name: 'ร้านอาหาร', description: 'ร้านอาหารยอดนิยมในภูมิภาคคันโต' },
          { category_key: 'accommodations', name: 'ที่พัก', description: 'ที่พักยอดนิยมในภูมิภาคคันโต' },
        ];
        setCategoriesList(cats);
        setDynamicCategories(cats);
        setAllPlaces(placesRes.data || []);
      })
      .catch((err) => {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่สถานที่:", err);
      })
      .finally(() => {
        setLoadingCategories(false);
      });
  }, []);

  // 🔄 ระบบสลับรูปภาพพื้นหลังอัตโนมัติทุกๆ 5 วินาที
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImgIndex((prevIndex) => (prevIndex + 1) % HERO_IMAGES.length);
    }, 5000);

    return () => clearInterval(timer);
  }, []);

  const CATEGORY_SECTIONS = useMemo(() => {
    return categoriesList.map((cat) => ({
      id: cat.category_key,
      title: cat.name,
      subtitle: cat.description || `${cat.name}ยอดนิยมในภูมิภาคคันโต`,
      searchCategory: cat.category_key,
      items: allPlaces.filter((p) => p.category === cat.category_key),
    })).filter((sec) => sec.items.length > 0 || ['attractions', 'restaurants', 'accommodations'].includes(sec.id));
  }, [categoriesList, allPlaces]);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      
      {/* --- Hero Section (Background Slideshow) --- */}
      <section className="relative h-[560px] md:h-[600px] flex items-center justify-center overflow-hidden">
        
        {/* รูปพื้นหลังพร้อมเอฟเฟกต์ Fade Transition */}
        {HERO_IMAGES.map((imgUrl, index) => (
          <img 
            key={index}
            src={imgUrl} 
            alt="Japan Landscape"
            className={`absolute inset-0 w-full h-full object-cover scale-105 transition-opacity duration-1000 ease-in-out ${
              index === currentImgIndex ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}

        {/* Overlay ไล่เฉดสีเพื่อให้ข้อความอ่านง่าย มีมิติ Cinematic Depth */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/25 to-black/60"></div>
        
        <div className="relative z-10 w-full max-w-5xl px-6 text-center mt-12">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold text-white mb-4 tracking-tight drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]">
            ภูมิภาคคันโต ประเทศญี่ปุ่น
          </h1>
          <p className="text-lg sm:text-xl md:text-2xl text-white/90 font-normal drop-shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            ค้นพบสถานที่ท่องเที่ยว ร้านอาหาร และที่พักที่น่าสนใจ
          </p>

          {/* จุด Indicator สำหรับบอกตำแหน่งรูปภาพ/คลิกสลับรูปได้ */}
          <div className="flex justify-center gap-2 mt-8">
            {HERO_IMAGES.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentImgIndex(idx)}
                aria-label={`Slide ${idx + 1}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  idx === currentImgIndex ? 'w-8 bg-white shadow-md' : 'w-2 bg-white/45 hover:bg-white/80'
                }`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* --- Popular Places Section (ส่วนแสดงสถานที่ยอดนิยมจากอัลกอริทึม) --- */}
      <section className="max-w-7xl mx-auto px-6 py-14 md:py-18 text-left">
        <div className="flex justify-between items-end mb-8 md:mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">สถานที่ยอดนิยม</h2>
            <p className="text-gray-500 text-sm md:text-base font-normal">สถานที่ที่ได้รับความนิยมสูงสุดในภูมิภาคคันโต</p>
          </div>
          <button 
            onClick={() => navigate('/search?category=attractions')} 
            className="text-red-600 hover:text-red-700 font-semibold text-sm md:text-base flex items-center gap-1 group transition-colors cursor-pointer"
          >
            ดูทั้งหมด <ChevronRight size={18} className="transition-transform group-hover:translate-x-1"/>
          </button>
        </div>

        {/* การ์ดแสดงสถานที่ยอดนิยม 4 อันดับแรก */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-7">
          {popular.map((p) => (
            <PlaceCard 
              key={p.id} 
              place={p} 
              fav={isFav(p)} 
              onToggleFav={() => toggle(p)} 
            />
          ))}
          {popular.length === 0 && (
            <div className="col-span-full py-12 text-center text-gray-400 font-medium">
              กำลังโหลดข้อมูลสถานที่ยอดนิยม...
            </div>
          )}
        </div>
      </section>

      {/* --- Horizontal Category Sliders (สถานที่ท่องเที่ยว, ร้านอาหาร, ที่พัก เลื่อนข้างไปมาได้) --- */}
      {CATEGORY_SECTIONS.map((sec) => (
        <HorizontalCategorySection
          key={sec.id}
          section={sec}
          loading={loadingCategories}
          isFav={isFav}
          onToggleFav={toggle}
        />
      ))}

      {/* --- Footer --- */}
      <Footer />
    </div>
  );
};

// --- Horizontal Category Slider Component ---
const HorizontalCategorySection = ({
  section,
  loading,
  isFav,
  onToggleFav,
}) => {
  const navigate = useNavigate();
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [scrollProgress, setScrollProgress] = useState(0);

  const theme = CATEGORY_THEMES[section.id] || {
    icon: Sparkles,
    accent: 'text-pink-600',
    bgLight: 'bg-pink-50 text-pink-600 border-pink-200/80',
    gradient: 'from-pink-500 to-rose-500',
    badge: 'bg-pink-600 text-white',
  };

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
    const maxScroll = scrollWidth - clientWidth;
    if (maxScroll > 0) {
      setScrollProgress(Math.min(100, Math.max(0, (scrollLeft / maxScroll) * 100)));
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [section.items, checkScroll]);

  const scroll = (direction) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = Math.max(300, el.clientWidth * 0.75);
    el.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <section className="max-w-7xl mx-auto px-6 pb-16 md:pb-20 text-left">
      {/* Header with Title and Modern Navigation Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6 md:mb-8">
        <div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
            {section.title}
          </h2>
          <p className="text-gray-500 text-sm md:text-base font-normal">
            {section.subtitle}
          </p>
        </div>

        {/* Right side: 'ดูทั้งหมด' & Navigation Arrow Buttons */}
        <div className="flex items-center gap-3 self-end sm:self-auto">
          <button
            onClick={() => navigate(`/search?category=${section.searchCategory}`)}
            className="text-red-600 hover:text-red-700 font-semibold text-sm md:text-base flex items-center gap-1 group transition-colors cursor-pointer mr-1"
          >
            ดูทั้งหมด <ChevronRight size={18} className="transition-transform group-hover:translate-x-1" />
          </button>

          {/* Sleek Pill Controls */}
          <div className="flex items-center gap-1.5 bg-gray-50 p-1 rounded-full border border-gray-200 shadow-xs">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft}
              aria-label="เลื่อนไปทางซ้าย"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                canScrollLeft
                  ? 'bg-white text-gray-800 shadow-xs hover:bg-gray-900 hover:text-white active:scale-90 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed opacity-40'
              }`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight}
              aria-label="เลื่อนไปทางขวา"
              className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                canScrollRight
                  ? 'bg-white text-gray-800 shadow-xs hover:bg-gray-900 hover:text-white active:scale-90 cursor-pointer'
                  : 'text-gray-300 cursor-not-allowed opacity-40'
              }`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Slider Carousel Container */}
      <div className="relative group/slider">
        {/* Horizontal Scroll list */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex gap-5 md:gap-6 overflow-x-auto scroll-smooth no-scrollbar py-3 px-1 snap-x snap-mandatory"
        >
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="shrink-0 w-[270px] sm:w-[290px] md:w-[310px] animate-pulse"
              >
                <div className="h-64 md:h-72 bg-gray-200 rounded-3xl mb-3.5" />
                <div className="h-5 bg-gray-200 rounded-md w-3/4 mb-2" />
                <div className="h-4 bg-gray-100 rounded-md w-1/2 mb-2" />
                <div className="h-6 bg-gray-100 rounded-md w-1/4" />
              </div>
            ))
          ) : section.items.length > 0 ? (
            section.items.map((p) => (
              <div
                key={`${p.category}-${p.id}`}
                className="shrink-0 w-[270px] sm:w-[290px] md:w-[310px] snap-start"
              >
                <PlaceCard
                  place={p}
                  fav={isFav(p)}
                  onToggleFav={() => onToggleFav(p)}
                />
              </div>
            ))
          ) : (
            <div className="w-full py-12 text-center text-gray-400 font-medium bg-gray-50 rounded-3xl border border-dashed border-gray-200">
              ยังไม่มีข้อมูล{section.title}ในขณะนี้
            </div>
          )}
        </div>

        {/* Floating Side Arrow Buttons on Desktop */}
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            aria-label="เลื่อนซ้าย"
            className="hidden lg:flex absolute -left-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-gray-800 shadow-xl border border-gray-200/80 items-center justify-center hover:bg-gray-900 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md opacity-0 group-hover/slider:opacity-100"
          >
            <ChevronLeft size={22} />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            aria-label="เลื่อนขวา"
            className="hidden lg:flex absolute -right-5 top-1/2 -translate-y-1/2 z-20 w-11 h-11 rounded-full bg-white text-gray-800 shadow-xl border border-gray-200/80 items-center justify-center hover:bg-gray-900 hover:text-white hover:scale-105 active:scale-95 transition-all cursor-pointer backdrop-blur-md opacity-0 group-hover/slider:opacity-100"
          >
            <ChevronRight size={22} />
          </button>
        )}
      </div>

      {/* Scroll Progress Bar & Drag Tip */}
      {section.items.length > 3 && (
        <div className="flex items-center justify-between mt-3 px-1">
          <div className="h-1.5 bg-gray-100 rounded-full w-28 sm:w-36 overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${theme.gradient} rounded-full transition-all duration-150`}
              style={{ width: `${Math.max(18, scrollProgress)}%` }}
            />
          </div>
          <p className="text-[12px] font-medium text-gray-400 hidden sm:block">
            เลื่อนซ้าย-ขวา เพื่อดูเพิ่มเติม
          </p>
        </div>
      )}
    </section>
  );
};

// --- Modern PlaceCard Component ---
const PlaceCard = ({ place, fav, onToggleFav }) => {
  const isFree = Number(place.starting_price) === 0 || place.starting_price == null;

  return (
    <div className="group transition-all duration-300 hover:-translate-y-1.5 h-full flex flex-col">
      <div className="relative h-64 md:h-72 rounded-2xl md:rounded-3xl overflow-hidden mb-3.5 shadow-sm group-hover:shadow-xl transition-all duration-500 bg-gray-100">
        <Link to={`/place/${place.category}/${place.id}`} className="block w-full h-full">
          <img
            src={place.image_url || FALLBACK_IMG}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            alt={place.name}
            loading="lazy"
          />
          {/* Subtle bottom shadow gradient on image */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </Link>

        {/* Floating Heart Button */}
        <button
          onClick={onToggleFav}
          aria-label="รายการโปรด"
          className={`absolute top-3.5 right-3.5 p-2.5 rounded-full backdrop-blur-md shadow-md transition-all duration-200 active:scale-90 cursor-pointer ${
            fav
              ? 'bg-white text-red-500 shadow-red-200 scale-105'
              : 'bg-white/85 text-gray-500 hover:text-red-500 hover:bg-white hover:scale-105'
          }`}
        >
          <Heart size={17} fill={fav ? 'currentColor' : 'none'} className={fav ? 'animate-pulse' : ''} />
        </button>

        {/* Floating Province Tag on Image */}
        {place.province && (
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full text-[11px] font-bold text-gray-800 shadow-sm flex items-center gap-1 border border-white/60">
            <MapPin size={12} className="text-red-500" />
            <span>{place.province}</span>
          </div>
        )}
      </div>

      {/* Place Details */}
      <Link to={`/place/${place.category}/${place.id}`}>
        <h3 className="font-bold text-base md:text-lg text-gray-900 group-hover:text-red-600 transition-colors line-clamp-1 mb-1">
          {place.name}
        </h3>
      </Link>
      <p className="text-gray-500 text-xs md:text-sm font-normal flex items-center gap-1 mb-2.5">
        <MapPin size={13} className="text-gray-400" /> {place.province}
        {place.type && (
          <>
            <span className="text-gray-300">•</span>
            <span className="text-gray-500 font-medium">{place.type}</span>
          </>
        )}
      </p>

      {/* Price Badge */}
      <div className="flex items-center mt-auto">
        {isFree ? (
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-100/80">
            เข้าชมฟรี
          </span>
        ) : (
          <span className="text-xs font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-md">
            {formatPrice(place.starting_price)}
          </span>
        )}
      </div>
    </div>
  );
};

export default HomePage;