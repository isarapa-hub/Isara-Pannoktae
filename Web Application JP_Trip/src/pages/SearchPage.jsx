import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  Loader2,
  X,
  RotateCcw,
  Sparkles,
  MapPin,
  Building,
  UtensilsCrossed,
  Landmark,
  Coffee,
  Camera,
  ShoppingBag,
  Mountain,
  Ticket,
  Compass,
  Bike,
  Heart,
  Star,
  Check,
  AlertCircle
} from 'lucide-react';
import api, { errMsg } from '../connectAPI/axios';
import PlaceCard from '../components/PlaceCard';
import MapModal from '../components/MapModal';
import useFavorites from '../hooks/useFavorites';
import { PROVINCES, CATEGORIES, setDynamicCategories } from '../utils/constants';

// Placeholder Skeleton Cards สำหรับสถานะกำลังโหลด
const SkeletonCard = () => (
  <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col h-full animate-pulse">
    <div className="h-56 bg-gradient-to-br from-gray-100 to-gray-200 relative" />
    <div className="p-6 flex flex-col flex-1 justify-between">
      <div>
        <div className="h-6 bg-gray-200 rounded-lg w-3/4 mb-3" />
        <div className="h-3.5 bg-gray-100 rounded-lg w-full mb-2" />
        <div className="h-3.5 bg-gray-100 rounded-lg w-2/3 mb-6" />
        <div className="h-4 bg-gray-100 rounded-lg w-1/2 mb-2" />
        <div className="h-4 bg-gray-100 rounded-lg w-1/3 mb-4" />
      </div>
      <div className="pt-4 border-t border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <div className="h-4 bg-gray-100 rounded-lg w-1/4" />
          <div className="h-6 bg-gray-200 rounded-lg w-1/3" />
        </div>
        <div className="h-11 bg-gray-200 rounded-xl w-full" />
      </div>
    </div>
  </div>
);

const MAX_PRICE = 210000;

const SearchPage = () => {
  const [params, setSearchParams] = useSearchParams();
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mapPlace, setMapPlace] = useState(null);
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const { isFav, toggle } = useFavorites();

  // Search filter states
  const [searchTerm, setSearchTerm] = useState(params.get('q') || '');
  const [debouncedSearch, setDebouncedSearch] = useState(searchTerm);

  const [selectedProvinces, setSelectedProvinces] = useState(
    params.get('province') ? params.get('province').split(',').map((p) => p.trim()).filter(Boolean) : []
  );

  const initialPrice = params.get('maxPrice') ? Number(params.get('maxPrice')) : MAX_PRICE;
  const [maxPrice, setMaxPrice] = useState(isNaN(initialPrice) ? MAX_PRICE : initialPrice);
  const [debouncedPrice, setDebouncedPrice] = useState(maxPrice);

  const [category, setCategory] = useState(params.get('category') || 'all');
  const [categoriesList, setCategoriesList] = useState([]);

  // โหลดรายการหมวดหมู่แบบไดนามิกจาก Database
  useEffect(() => {
    api.get('/categories')
      .then((res) => {
        if (Array.isArray(res.data) && res.data.length > 0) {
          setCategoriesList(res.data);
          setDynamicCategories(res.data);
        }
      })
      .catch((err) => {
        console.error('ไม่สามารถโหลดรายการหมวดหมู่ได้:', err);
      });
  }, []);

  const displayCategories = useMemo(() => {
    if (categoriesList.length > 0) {
      return categoriesList.map((c) => ({
        id: c.category_key,
        label: c.name,
        icon: c.icon,
      }));
    }
    return CATEGORIES;
  }, [categoriesList]);

  const abortControllerRef = useRef(null);

  // Debounce search term
  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchTerm), 300);
    return () => clearTimeout(t);
  }, [searchTerm]);

  // Debounce price slider
  useEffect(() => {
    const t = setTimeout(() => setDebouncedPrice(maxPrice), 250);
    return () => clearTimeout(t);
  }, [maxPrice]);

  // Sync state to URL search parameters without page reload
  useEffect(() => {
    const next = new URLSearchParams();
    if (debouncedSearch.trim()) next.set('q', debouncedSearch.trim());
    if (selectedProvinces.length > 0) next.set('province', selectedProvinces.join(','));
    if (category !== 'all') next.set('category', category);
    if (debouncedPrice < MAX_PRICE) next.set('maxPrice', String(debouncedPrice));
    setSearchParams(next, { replace: true });
  }, [debouncedSearch, selectedProvinces, category, debouncedPrice, setSearchParams]);

  // Fetch places with AbortController for rock-solid stability and zero race-conditions
  const fetchPlaces = useCallback(async () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await api.get('/all-places', {
        signal: controller.signal,
        params: {
          search: debouncedSearch.trim() || undefined,
          province: selectedProvinces.length > 0 ? selectedProvinces.join(',') : undefined,
          maxPrice: debouncedPrice >= MAX_PRICE ? undefined : debouncedPrice,
          category: category === 'all' ? undefined : category,
        },
      });
      setPlaces(res.data || []);
      setError(null);
    } catch (err) {
      if (err.name === 'CanceledError' || err.code === 'ERR_CANCELED') {
        return; // Ignore canceled request
      }
      setError(errMsg(err, 'ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์หลังบ้านได้ (ตรวจสอบการเชื่อมต่อ Backend)'));
    } finally {
      if (abortControllerRef.current === controller) {
        setLoading(false);
      }
    }
  }, [debouncedSearch, selectedProvinces, debouncedPrice, category]);

  useEffect(() => {
    fetchPlaces();
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchPlaces]);

  const handleProvinceToggle = (prov) => {
    setSelectedProvinces((prev) =>
      prev.includes(prov) ? prev.filter((p) => p !== prov) : [...prev, prov]
    );
  };

  const handleSelectAllProvinces = () => setSelectedProvinces([...PROVINCES]);
  const handleClearProvinces = () => setSelectedProvinces([]);

  const clearFilters = () => {
    setSearchTerm('');
    setDebouncedSearch('');
    setSelectedProvinces([]);
    setMaxPrice(MAX_PRICE);
    setDebouncedPrice(MAX_PRICE);
    setCategory('all');
  };

  const activeFiltersCount =
    (debouncedSearch.trim() ? 1 : 0) +
    selectedProvinces.length +
    (category !== 'all' ? 1 : 0) +
    (debouncedPrice < MAX_PRICE ? 1 : 0);

  const getCategoryIcon = (iconOrKey) => {
    switch (iconOrKey) {
      case 'attractions':
      case 'Landmark':
        return <Landmark size={15} />;
      case 'restaurants':
      case 'Utensils':
      case 'UtensilsCrossed':
        return <UtensilsCrossed size={15} />;
      case 'accommodations':
      case 'BedDouble':
      case 'Building':
        return <Building size={15} />;
      case 'cafes':
      case 'Coffee':
        return <Coffee size={15} />;
      case 'Camera':
        return <Camera size={15} />;
      case 'ShoppingBag':
        return <ShoppingBag size={15} />;
      case 'Mountain':
        return <Mountain size={15} />;
      case 'Ticket':
        return <Ticket size={15} />;
      case 'Compass':
        return <Compass size={15} />;
      case 'Bike':
        return <Bike size={15} />;
      case 'Heart':
        return <Heart size={15} />;
      case 'Star':
        return <Star size={15} />;
      case 'MapPin':
        return <MapPin size={15} />;
      default:
        return <Sparkles size={15} />;
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] pt-28 pb-16 px-4 sm:px-6 md:px-12 font-sans selection:bg-pink-500 selection:text-white">
      <div className="max-w-7xl mx-auto">
        {/* Top Header & Search Hero */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-50 text-pink-600 text-xs font-black mb-2 tracking-wide uppercase">
                <Sparkles size={13} /> ค้นพบญี่ปุ่นในแบบคุณ
              </div>
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight">
                ค้นหาสถานที่
              </h1>
            </div>

            {/* Quick Category Tabs (ดึงหมวดหมู่แบบไดนามิกจากฐานข้อมูล) */}
            <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200/80 rounded-2xl shadow-sm overflow-x-auto max-w-full">
              <button
                onClick={() => setCategory('all')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                  category === 'all'
                    ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <Sparkles size={14} /> ทั้งหมด
              </button>
              {displayCategories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setCategory(c.id)}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap ${
                    category === c.id
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-500/25'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  {getCategoryIcon(c.icon || c.id)} {c.label}
                </button>
              ))}
            </div>
          </div>

          {/* Search Input Bar */}
          <div className="relative bg-white rounded-2xl md:rounded-3xl border border-gray-200 shadow-sm hover:shadow-md focus-within:shadow-xl focus-within:border-pink-500 focus-within:ring-4 focus-within:ring-pink-500/10 transition-all">
            <div className="flex items-center px-4 md:px-6 py-3.5 md:py-4">
              <Search
                size={22}
                className={`mr-3.5 transition-colors shrink-0 ${
                  searchTerm ? 'text-pink-600' : 'text-gray-400'
                }`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="ค้นหาสถานที่ท่องเที่ยว ร้านอาหาร ที่พัก หรือจังหวัด..."
                className="w-full bg-transparent text-gray-800 placeholder-gray-400 font-medium text-base md:text-lg outline-none"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  aria-label="ล้างคำค้นหา"
                  className="p-1.5 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all shrink-0 ml-2"
                >
                  <X size={18} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Filter Toggle */}
        <div className="flex lg:hidden items-center justify-between mb-6">
          <button
            onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
            className="w-full flex items-center justify-center gap-2 py-3.5 px-4 bg-white border border-gray-200 rounded-2xl font-black text-sm text-gray-800 shadow-sm active:scale-95 transition-all"
          >
            <SlidersHorizontal size={17} className="text-pink-600" />
            ตัวกรองค้นหา
            {activeFiltersCount > 0 && (
              <span className="bg-pink-600 text-white text-[11px] font-black px-2 py-0.5 rounded-full ml-1">
                {activeFiltersCount}
              </span>
            )}
          </button>
        </div>

        {/* Main Content Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          {/* Filter Sidebar */}
          <aside
            className={`w-full lg:w-80 shrink-0 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm lg:sticky lg:top-28 space-y-7 transition-all ${
              mobileFilterOpen ? 'block' : 'hidden lg:block'
            }`}
          >
            {/* Filter Header */}
            <div className="flex items-center justify-between pb-4 border-b border-gray-100">
              <div className="flex items-center gap-2 font-black text-gray-900 text-base">
                <div className="p-1.5 bg-pink-50 text-pink-600 rounded-xl">
                  <SlidersHorizontal size={18} />
                </div>
                <span>ตัวกรอง</span>
                {activeFiltersCount > 0 && (
                  <span className="bg-pink-100 text-pink-700 text-xs px-2 py-0.5 rounded-full font-black">
                    {activeFiltersCount}
                  </span>
                )}
              </div>
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  className="flex items-center gap-1 text-xs font-bold text-gray-400 hover:text-pink-600 transition-colors"
                >
                  <RotateCcw size={13} /> ล้างค่า
                </button>
              )}
            </div>

            {/* Provinces Multi-Select */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="flex items-center gap-1.5 font-black text-xs text-gray-500 uppercase tracking-wider">
                  <MapPin size={14} className="text-gray-400" /> จังหวัด (Kanto)
                </label>
                <div className="flex items-center gap-2 text-[11px] font-bold">
                  <button
                    onClick={handleSelectAllProvinces}
                    className="text-gray-400 hover:text-pink-600 transition-colors"
                  >
                    ทั้งหมด
                  </button>
                  <span className="text-gray-200">|</span>
                  <button
                    onClick={handleClearProvinces}
                    className="text-gray-400 hover:text-pink-600 transition-colors"
                  >
                    ล้าง
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                {PROVINCES.map((prov) => {
                  const isChecked = selectedProvinces.includes(prov);
                  return (
                    <button
                      key={prov}
                      type="button"
                      onClick={() => handleProvinceToggle(prov)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                        isChecked
                          ? 'bg-pink-50/80 border-pink-200 text-pink-700 shadow-sm'
                          : 'bg-gray-50/60 border-transparent text-gray-600 hover:bg-gray-100/70 hover:text-gray-900'
                      }`}
                    >
                      <span>{prov}</span>
                      <div
                        className={`w-4 h-4 rounded-md flex items-center justify-center transition-all ${
                          isChecked
                            ? 'bg-pink-600 text-white'
                            : 'border border-gray-300 bg-white'
                        }`}
                      >
                        {isChecked && <Check size={11} strokeWidth={3} />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Budget Range Filter */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <label className="font-black text-xs text-gray-500 uppercase tracking-wider">
                  งบประมาณสูงสุด
                </label>
                <span className="text-pink-600 font-black text-xs">
                  {maxPrice >= MAX_PRICE
                    ? 'ไม่จำกัด'
                    : maxPrice === 0
                    ? 'เข้าชมฟรี'
                    : `¥${Number(maxPrice).toLocaleString()}`}
                </span>
              </div>
              <input
                type="range"
                min="0"
                max={MAX_PRICE}
                step="500"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full h-2 bg-gray-100 rounded-lg appearance-none cursor-pointer accent-pink-600"
              />
              <div className="flex justify-between text-[10px] font-bold text-gray-400 mt-2">
                <span>¥0</span>
                <span>¥{Number(MAX_PRICE).toLocaleString()}</span>
              </div>
            </div>

            {/* Close Button on Mobile */}
            <div className="lg:hidden pt-2">
              <button
                onClick={() => setMobileFilterOpen(false)}
                className="w-full py-3 bg-pink-600 text-white rounded-xl font-black text-xs shadow-md shadow-pink-500/20"
              >
                ดูผลการค้นหา ({places.length} รายการ)
              </button>
            </div>
          </aside>

          {/* Results Main Section */}
          <main className="flex-1 w-full min-w-0">
            {/* Results Status Header */}
            <div className="flex items-center justify-between gap-3 mb-6 bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-gray-100">
              <div className="flex items-center gap-2">
                <span className="font-black text-gray-900 text-sm md:text-base">
                  {loading ? 'กำลังค้นหาสถานที่...' : `พบ ${places.length} สถานที่น่าสนใจ`}
                </span>
                {loading && <Loader2 size={16} className="animate-spin text-pink-600 ml-1" />}
              </div>
            </div>

            {/* Active Filters Pills */}
            {activeFiltersCount > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-6">
                <span className="text-xs font-bold text-gray-400">ตัวกรองปัจจุบัน:</span>
                {debouncedSearch.trim() && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700 shadow-2xs">
                    คำค้น: "{debouncedSearch}"
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setDebouncedSearch('');
                      }}
                      className="hover:text-pink-600"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}
                {category !== 'all' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700 shadow-2xs">
                    หมวดหมู่: {displayCategories.find((c) => c.id === category)?.label || category}
                    <button onClick={() => setCategory('all')} className="hover:text-pink-600">
                      <X size={13} />
                    </button>
                  </span>
                )}
                {selectedProvinces.map((prov) => (
                  <span
                    key={prov}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 border border-pink-100 text-pink-700 shadow-2xs"
                  >
                    {prov}
                    <button onClick={() => handleProvinceToggle(prov)} className="hover:text-pink-900">
                      <X size={13} />
                    </button>
                  </span>
                ))}
                {debouncedPrice < MAX_PRICE && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white border border-gray-200 text-gray-700 shadow-2xs">
                    {debouncedPrice === 0 ? 'เฉพาะเข้าชมฟรี' : `งบ ≤ ¥${Number(debouncedPrice).toLocaleString()}`}
                    <button
                      onClick={() => {
                        setMaxPrice(MAX_PRICE);
                        setDebouncedPrice(MAX_PRICE);
                      }}
                      className="hover:text-pink-600"
                    >
                      <X size={13} />
                    </button>
                  </span>
                )}
                <button
                  onClick={clearFilters}
                  className="text-xs font-black text-pink-600 hover:underline ml-2"
                >
                  ล้างทั้งหมด
                </button>
              </div>
            )}

            {/* Error Message with Retry */}
            {error && (
              <div className="bg-red-50 text-red-600 p-6 rounded-3xl font-bold border border-red-100 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <AlertCircle size={24} className="shrink-0 text-red-500" />
                  <div>
                    <p className="font-black text-sm">{error}</p>
                    <p className="text-xs text-red-400 mt-0.5">กรุณาตรวจสอบว่าเซิร์ฟเวอร์ Backend ทำงานอยู่</p>
                  </div>
                </div>
                <button
                  onClick={fetchPlaces}
                  className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black transition-all shrink-0"
                >
                  ลองใหม่อีกครั้ง
                </button>
              </div>
            )}

            {/* Results Grid or Skeleton Loading */}
            {loading && places.length === 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1, 2, 3, 4, 5, 6].map((idx) => (
                  <SkeletonCard key={idx} />
                ))}
              </div>
            ) : places.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {places.map((place) => (
                  <PlaceCard
                    key={`${place.category}-${place.id}`}
                    place={place}
                    isFav={isFav(place)}
                    onToggleFav={toggle}
                    onOpenMap={setMapPlace}
                  />
                ))}
              </div>
            ) : !error ? (
              /* Modern Empty State */
              <div className="py-20 px-6 text-center bg-white rounded-3xl border border-dashed border-gray-200 shadow-sm max-w-xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-pink-50 text-pink-600 mx-auto flex items-center justify-center mb-4">
                  <Search size={28} />
                </div>
                <h3 className="text-xl font-black text-gray-800 mb-2">ไม่พบสถานที่ที่ตรงตามเงื่อนไข</h3>
                <p className="text-gray-400 text-sm font-medium mb-6 leading-relaxed max-w-sm mx-auto">
                  ลองปรับคำค้นหา หรือเลือกจังหวัดเพิ่มเติม เพื่อค้นพบสถานที่ท่องเที่ยวและร้านอาหารที่น่าสนใจ
                </p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={clearFilters}
                    className="px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-pink-500/20"
                  >
                    ล้างตัวกรองทั้งหมด
                  </button>
                </div>
              </div>
            ) : null}
          </main>
        </div>
      </div>

      {/* Map Modal */}
      <MapModal place={mapPlace} onClose={() => setMapPlace(null)} />
    </div>
  );
};

export default SearchPage;
