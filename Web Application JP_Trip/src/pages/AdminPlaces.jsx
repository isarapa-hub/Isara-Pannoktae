import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  MapPin,
  List,
  Plus,
  Edit3,
  Trash2,
  Search,
  X,
  Save,
  LayoutGrid,
  Table as TableIcon,
  Filter,
  ArrowUpDown,
  ExternalLink,
  Clock,
  Sparkles,
  Eye,
  Image as ImageIcon,
  Navigation,
  CheckCircle2,
  AlertCircle,
  ChevronRight,
  Utensils,
  BedDouble,
  Compass,
  Upload,
  Trash as TrashIcon,
  Layers,
  Camera,
  Landmark,
  Coffee,
  ShoppingBag,
  Mountain,
  Ticket,
  Bike,
  Heart,
  Star,
  Tag,
  RefreshCw,
  Lock,
} from 'lucide-react';
import { useSearchParams, Link } from 'react-router-dom';
import api, { errMsg } from '../connectAPI/axios';
import AdminLayout from '../components/AdminLayout';
import MapPickerModal from '../components/MapPickerModal';
import CustomSelect from '../components/CustomSelect';
import {
  PROVINCES,
  CATEGORIES,
  FALLBACK_IMG,
  formatTime,
  mapsDirectionUrl,
} from '../utils/constants';

const emptyForm = {
  name: '',
  description: '',
  province: '',
  starting_price: '',
  open_time: '',
  close_time: '',
  type: '',
  latitude: '',
  longitude: '',
  image_url: '',
  gallery: [],
};

const AVAILABLE_ICONS = {
  MapPin,
  Utensils,
  BedDouble,
  Camera,
  Landmark,
  Coffee,
  ShoppingBag,
  Mountain,
  Ticket,
  Compass,
  Bike,
  Heart,
  Star,
  Sparkles,
  Tag,
  Layers,
};

const COLOR_THEMES = {
  pink: {
    bg: 'from-pink-500 to-rose-600',
    light: 'bg-pink-50 text-pink-700 border-pink-200',
    accent: 'text-pink-600',
    glow: 'shadow-pink-500/25',
  },
  amber: {
    bg: 'from-amber-500 to-orange-600',
    light: 'bg-amber-50 text-amber-700 border-amber-200',
    accent: 'text-amber-600',
    glow: 'shadow-amber-500/25',
  },
  emerald: {
    bg: 'from-emerald-500 to-teal-600',
    light: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    accent: 'text-emerald-600',
    glow: 'shadow-emerald-500/25',
  },
  indigo: {
    bg: 'from-indigo-500 to-blue-600',
    light: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    accent: 'text-indigo-600',
    glow: 'shadow-indigo-500/25',
  },
  purple: {
    bg: 'from-purple-500 to-fuchsia-600',
    light: 'bg-purple-50 text-purple-700 border-purple-200',
    accent: 'text-purple-600',
    glow: 'shadow-purple-500/25',
  },
  cyan: {
    bg: 'from-cyan-500 to-blue-500',
    light: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    accent: 'text-cyan-600',
    glow: 'shadow-cyan-500/25',
  },
};

const AdminManagePlaces = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'attractions';

  const [categoriesList, setCategoriesList] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [currentTab, setCurrentTab] = useState(initialTab);
  const [formCategory, setFormCategory] = useState(initialTab);

  const [placesData, setPlacesData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('');
  const [sortBy, setSortBy] = useState('default');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef(null);
  const [galleryUploading, setGalleryUploading] = useState(false);
  const [isGalleryDragOver, setIsGalleryDragOver] = useState(false);
  const galleryInputRef = useRef(null);

  // Delete Confirm Modal State
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Save Confirm Modal State
  const [showSaveConfirm, setShowSaveConfirm] = useState(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (message, type = 'success') => {
    setToastMessage({ message, type });
    setTimeout(() => setToastMessage(null), 3500);
  };

  // โหลดรายการหมวดหมู่แบบไดนามิกจากฐานข้อมูล (TC 4.1)
  const fetchCategoriesList = async () => {
    try {
      setLoadingCategories(true);
      const res = await api.get('/admin/categories');
      const data = Array.isArray(res.data) && res.data.length > 0 ? res.data : CATEGORIES.map((c, i) => ({
        category_id: i + 1,
        category_key: c.id,
        name: c.label,
        icon: c.id === 'attractions' ? 'MapPin' : c.id === 'restaurants' ? 'Utensils' : 'BedDouble',
        color: c.id === 'attractions' ? 'pink' : c.id === 'restaurants' ? 'amber' : 'emerald',
        is_system: 1,
        sort_order: i + 1,
        place_count: 0,
      }));
      setCategoriesList(data);
      return data;
    } catch (err) {
      console.error('ไม่สามารถโหลดหมวดหมู่ได้:', err);
      const fallback = CATEGORIES.map((c, i) => ({
        category_id: i + 1,
        category_key: c.id,
        name: c.label,
        icon: c.id === 'attractions' ? 'MapPin' : c.id === 'restaurants' ? 'Utensils' : 'BedDouble',
        color: c.id === 'attractions' ? 'pink' : c.id === 'restaurants' ? 'amber' : 'emerald',
        is_system: 1,
        sort_order: i + 1,
        place_count: 0,
      }));
      setCategoriesList(fallback);
      return fallback;
    } finally {
      setLoadingCategories(false);
    }
  };

  useEffect(() => {
    fetchCategoriesList().then((cats) => {
      const tabParam = searchParams.get('tab');
      if (tabParam && cats.some((c) => c.category_key === tabParam)) {
        setCurrentTab(tabParam);
      } else if (cats.length > 0 && !cats.some((c) => c.category_key === currentTab)) {
        setCurrentTab(cats[0].category_key);
      }
    });
  }, []);

  const currentCategory = useMemo(() => {
    const found = categoriesList.find((c) => c.category_key === currentTab);
    if (found) return found;
    return {
      category_key: currentTab,
      name: currentTab === 'restaurants' ? 'ร้านอาหาร' : currentTab === 'accommodations' ? 'ที่พัก' : 'สถานที่ท่องเที่ยว',
      icon: currentTab === 'restaurants' ? 'Utensils' : currentTab === 'accommodations' ? 'BedDouble' : 'MapPin',
      color: currentTab === 'restaurants' ? 'amber' : currentTab === 'accommodations' ? 'emerald' : 'pink',
    };
  }, [categoriesList, currentTab]);

  const tabLabel = currentCategory.name || currentCategory.label || 'หมวดหมู่';
  const ActiveIcon = AVAILABLE_ICONS[currentCategory.icon] || MapPin;
  const currentTheme = COLOR_THEMES[currentCategory.color] || COLOR_THEMES.pink;

  // Sync tab with URL
  const changeTab = (tabId) => {
    setCurrentTab(tabId);
    setSearchTerm('');
    setSelectedProvince('');
    setSearchParams({ tab: tabId });
  };

  const fetchPlacesData = async (tabToFetch = currentTab) => {
    if (!tabToFetch) return;
    try {
      setLoading(true);
      const response = await api.get(`/places/${tabToFetch}`);
      setPlacesData(response.data || []);
    } catch (error) {
      console.error(`เกิดข้อผิดพลาดในการโหลดตาราง ${tabToFetch}:`, error);
      setPlacesData([]);
      showToast('ไม่สามารถโหลดข้อมูลสถานที่ได้', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentTab) {
      fetchPlacesData(currentTab);
    }
  }, [currentTab]);

  // Handle URL action=create
  useEffect(() => {
    if (searchParams.get('action') === 'create') {
      openCreate();
      // ลบ action ออกจาก params หลังเปิด modal
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('action');
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams]);

  const closeModal = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setIsModalOpen(false);
    setIsDragOver(false);
    setShowSaveConfirm(false);
  };

  const handleImageFile = (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      showToast('กรุณาเลือกไฟล์รูปภาพเท่านั้น (JPG, PNG, WEBP, GIF)', 'error');
      return;
    }
    if (file.size > 4.5 * 1024 * 1024) {
      showToast('ขนาดไฟล์ต้องไม่เกิน 4.5 MB', 'error');
      return;
    }
    setImageUploading(true);
    const reader = new FileReader();
    reader.onload = (ev) => {
      setFormData((prev) => ({ ...prev, image_url: ev.target.result }));
      setImageUploading(false);
    };
    reader.onerror = () => {
      showToast('เกิดข้อผิดพลาดในการอ่านไฟล์', 'error');
      setImageUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileInputChange = (e) => {
    handleImageFile(e.target.files?.[0]);
    e.target.value = '';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    handleImageFile(e.dataTransfer.files?.[0]);
  };

  // ---- Gallery multi-upload handlers ----
  const readFileAsBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (ev) => resolve(ev.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  const handleGalleryFiles = async (files) => {
    if (!files || files.length === 0) return;
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    const oversized = Array.from(files).filter((f) => f.size > 4.5 * 1024 * 1024);
    if (oversized.length > 0) {
      showToast(`${oversized.length} ไฟล์มีขนาดเกิน 4.5 MB จะถูกข้ามไป`, 'error');
    }
    const okFiles = validFiles.filter((f) => f.size <= 4.5 * 1024 * 1024);
    if (okFiles.length === 0) return;
    setGalleryUploading(true);
    try {
      const base64List = await Promise.all(okFiles.map(readFileAsBase64));
      setFormData((prev) => ({
        ...prev,
        gallery: [...(Array.isArray(prev.gallery) ? prev.gallery : []), ...base64List],
      }));
    } catch {
      showToast('เกิดข้อผิดพลาดในการอ่านไฟล์แกลเลอรี', 'error');
    } finally {
      setGalleryUploading(false);
    }
  };

  const handleGalleryInputChange = (e) => {
    handleGalleryFiles(e.target.files);
    e.target.value = '';
  };

  const removeGalleryImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      gallery: prev.gallery.filter((_, i) => i !== index),
    }));
  };

  const openCreate = () => {
    setFormData(emptyForm);
    setEditingId(null);
    setFormCategory(currentTab);
    setIsModalOpen(true);
  };

  const openEdit = async (place) => {
    try {
      const { data } = await api.get(`/places/${currentTab}/${place.id}?no_count=1`);
      setFormData({
        name: data.name || '',
        description: data.description || '',
        province: data.province || '',
        starting_price: data.starting_price ?? '',
        open_time: formatTime(data.open_time),
        close_time: formatTime(data.close_time),
        type: data.type || '',
        latitude: data.latitude ?? '',
        longitude: data.longitude ?? '',
        image_url: data.image_url || '',
        gallery: data.gallery || [],
      });
      setFormCategory(data.category || currentTab);
      setEditingId(place.id);
      setIsModalOpen(true);
    } catch (err) {
      showToast(errMsg(err, 'ไม่สามารถดึงข้อมูลรายการเพื่อแก้ไขได้'), 'error');
    }
  };

  const handleInputChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // ดึงพิกัดอัตโนมัติเมื่อวางลิงก์ Google Maps หรือข้อความพิกัด
  const handlePasteCoordinates = (e) => {
    const text = e.target.value;
    if (!text) return;

    // 1. @lat,lng ใน Google Maps URL เช่น https://www.google.com/maps/place/.../@35.7147651,139.7940804,17z
    const atMatch = text.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    // 2. q=lat,lng หรือ query=lat,lng หรือ ll=lat,lng หรือ destination=lat,lng
    const qMatch = text.match(/(?:q|query|ll|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    // 3. !3dlat!4dlng (Google Maps share embed format)
    const embedMatch = text.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    // 4. พิมพ์หรือวางพิกัดตรงๆ เช่น 35.7148, 139.7967
    const directMatch = text.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);

    const match = atMatch || qMatch || embedMatch || directMatch;
    if (match) {
      const lat = parseFloat(match[1]);
      const lng = parseFloat(match[2]);
      if (!isNaN(lat) && !isNaN(lng)) {
        setFormData((prev) => ({
          ...prev,
          latitude: lat,
          longitude: lng,
        }));
        showToast(`ตรวจพบและใส่พิกัดอัตโนมัติ: ${lat}, ${lng}`, 'success');
        e.target.value = '';
      }
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return showToast('กรุณากรอกชื่อสถานที่', 'error');
    if (!formData.province) return showToast('กรุณาเลือกจังหวัดในญี่ปุ่น', 'error');

    // เปิดหน้าต่างยืนยันก่อนบันทึกข้อมูล
    setShowSaveConfirm(true);
  };

  const confirmSave = async () => {
    const body = {
      ...formData,
      gallery: Array.isArray(formData.gallery) ? formData.gallery : [],
    };

    setSaving(true);
    const targetCategory = formCategory || currentTab;
    try {
      const res = editingId
        ? await api.put(`/places/${currentTab}/${editingId}`, body)
        : await api.post(`/places/${targetCategory}`, body);

      showToast(res.data.message || (editingId ? 'แก้ไขข้อมูลสำเร็จแล้ว!' : 'เพิ่มข้อมูลใหม่สำเร็จแล้ว!'), 'success');
      setShowSaveConfirm(false);
      closeModal();
      if (targetCategory !== currentTab) {
        changeTab(targetCategory);
      } else {
        fetchPlacesData();
      }
      fetchCategoriesList();
    } catch (error) {
      showToast(errMsg(error, 'เกิดข้อผิดพลาดในการบันทึกข้อมูล'), 'error');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    if (Number(deleteTarget.plan_count) > 0) {
      showToast(`ไม่สามารถลบ "${deleteTarget.name}" ได้ เนื่องจากถูกนำไปใช้ในแผนการท่องเที่ยวของสมาชิก (${deleteTarget.plan_count} แผน)`, 'error');
      setDeleteTarget(null);
      return;
    }
    setDeleting(true);
    try {
      await api.delete(`/places/${currentTab}/${deleteTarget.id}`);
      showToast(`ลบข้อมูล "${deleteTarget.name}" สำเร็จเรียบร้อย`);
      setDeleteTarget(null);
      fetchPlacesData();
      fetchCategoriesList();
    } catch (error) {
      showToast(errMsg(error, 'ไม่สามารถลบข้อมูลได้'), 'error');
      setDeleteTarget(null);
    } finally {
      setDeleting(false);
    }
  };

  // กรองและเรียงลำดับข้อมูล
  const filteredAndSortedPlaces = useMemo(() => {
    let result = placesData.filter((p) => {
      const matchSearch =
        `${p.name} ${p.province || ''} ${p.type || ''}`
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
      const matchProvince = selectedProvince ? p.province === selectedProvince : true;
      return matchSearch && matchProvince;
    });

    if (sortBy === 'price-asc') {
      result.sort((a, b) => Number(a.starting_price || 0) - Number(b.starting_price || 0));
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => Number(b.starting_price || 0) - Number(a.starting_price || 0));
    } else if (sortBy === 'name-asc') {
      result.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    }

    return result;
  }, [placesData, searchTerm, selectedProvince, sortBy]);

  const isAcc = currentTab === 'accommodations';
  const inputCls =
    'w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-pink-500 focus:bg-white focus:ring-2 focus:ring-pink-100 font-medium text-sm transition-all shadow-sm';
  const labelCls = 'block text-xs font-black uppercase tracking-wider text-slate-700 mb-1.5';

  return (
    <AdminLayout maxWidth="max-w-7xl">
      {/* Toast Notification - ยก z-index ให้อยู่เหนือ Modal ทุกตัวเพื่อไม่ให้โดน Backdrop เบลอทับ */}
      {toastMessage && (
        <div
          className={`fixed top-8 right-6 md:right-8 z-[100005] px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3.5 backdrop-blur-xl border animate-bounce transition-all ${
            toastMessage.type === 'error'
              ? 'bg-rose-600 text-white border-white/20 shadow-rose-600/40'
              : 'bg-slate-900/95 text-white border-white/10 shadow-slate-900/40'
          }`}
        >
          {toastMessage.type === 'error' ? (
            <AlertCircle size={22} className="text-white shrink-0" />
          ) : (
            <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
          )}
          <div>
            <p className="text-sm font-black tracking-wide">{toastMessage.message}</p>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <header className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 p-8 md:p-10 text-white shadow-2xl mb-8 border border-slate-700/50">
        <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-pink-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/4 -bottom-16 w-72 h-72 rounded-full bg-amber-500/15 blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black tracking-wide bg-pink-500/20 text-pink-300 border border-pink-500/30">
                <Sparkles size={14} className="text-pink-400" /> จัดการฐานข้อมูลการท่องเที่ยว 🎌
              </span>
              <span className="text-xs font-medium text-slate-400">
                อัปเดตล่าสุด: ทันที (Real-time Sync)
              </span>
            </div>

            <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
              จัดการข้อมูลสถานที่ & แหล่งท่องเที่ยว
            </h1>
            <p className="text-slate-300 text-sm md:text-base font-normal">
              ควบคุม เพิ่มพิกัด แก้ไขรูปภาพ รายละเอียดราคา และเวลาเปิด-ปิดของสถานที่ท่องเที่ยว ร้านอาหาร และที่พักทั่วญี่ปุ่น
            </p>
          </div>

          <button
            onClick={openCreate}
            className={`w-full sm:w-auto px-7 py-4 rounded-2xl font-black text-sm text-white bg-gradient-to-r ${currentTheme.bg} shadow-xl hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2.5`}
          >
            <Plus size={20} className="stroke-[2.5]" />
            <span>เพิ่มข้อมูลใหม่ ({tabLabel})</span>
          </button>
        </div>
      </header>

      {/* Category Tabs Switcher (เชื่อมโยงแบบไดนามิกกับตารางหมวดหมู่ TC 4.1) */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center p-1.5 bg-white/90 backdrop-blur-md rounded-3xl border border-slate-200/90 shadow-sm gap-1.5 overflow-x-auto max-w-full scrollbar-none">
          {categoriesList.map((tab) => {
            const Icon = AVAILABLE_ICONS[tab.icon] || MapPin;
            const isActive = currentTab === tab.category_key;
            const theme = COLOR_THEMES[tab.color] || COLOR_THEMES.pink;
            const count = isActive ? placesData.length : (tab.place_count ?? 0);

            return (
              <button
                key={tab.category_key}
                onClick={() => changeTab(tab.category_key)}
                className={`flex items-center gap-2.5 px-5 py-3 rounded-2xl font-black text-sm whitespace-nowrap transition-all duration-300 ${isActive
                    ? `bg-gradient-to-r ${theme.bg} text-white shadow-lg ${theme.glow}`
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                  }`}
              >
                <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400'} />
                <span>{tab.name}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold transition-all ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-500'
                }`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* View Mode Toggle and Manage Categories Link */}
        <div className="flex items-center gap-2">
          <Link
            to="/admin/categories"
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-white border border-pink-200 text-pink-600 hover:bg-pink-50 font-bold text-xs shadow-xs transition-all active:scale-95"
            title="ไปที่ระบบจัดการหมวดหมู่ข้อมูล"
          >
            <Layers size={15} className="text-pink-600" />
            <span className="hidden sm:inline">จัดการหมวดหมู่</span>
            <span className="w-2 h-2 rounded-full bg-pink-500 animate-pulse ml-0.5" />
          </Link>

          <div className="flex items-center bg-white p-1.5 rounded-2xl border border-slate-200 shadow-sm gap-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'grid'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700'
                }`}
              title="มุมมองการ์ด (Card Grid)"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${viewMode === 'table'
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-700'
                }`}
              title="มุมมองตาราง (Table View)"
            >
              <TableIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar Toolbar */}
      <div className="bg-white rounded-3xl p-4 md:p-5 border border-slate-200/80 shadow-sm mb-6 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder={`ค้นหาชื่อ${tabLabel}, จังหวัด, หรือประเภท...`}
              className="w-full pl-11 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-medium outline-none focus:border-pink-500 focus:bg-white transition-all shadow-inner"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X size={15} />
              </button>
            )}
          </div>

          {/* Province Filter */}
          <div className="w-full sm:w-48">
            <CustomSelect
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              placeholder="ทุกจังหวัด (All)"
              icon={Filter}
              size="sm"
              options={[
                { value: '', label: 'ทุกจังหวัด (All)' },
                ...PROVINCES.map((p) => ({ value: p, label: p, icon: '📍' })),
              ]}
            />
          </div>

          {/* Sort Dropdown */}
          <div className="w-full sm:w-44">
            <CustomSelect
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              placeholder="เรียงตาม..."
              icon={ArrowUpDown}
              size="sm"
              options={[
                { value: 'default', label: 'เรียงตาม: ล่าสุด' },
                { value: 'price-asc', label: 'ราคา: น้อย → มาก' },
                { value: 'price-desc', label: 'ราคา: มาก → น้อย' },
                { value: 'name-asc', label: 'ชื่อ: ก-ฮ (A-Z)' },
              ]}
            />
          </div>
        </div>

        {/* Counter Badge */}
        <div className="text-xs font-bold text-slate-400 px-3 py-1 flex items-center justify-between md:justify-end gap-2">
          <span>พบ {filteredAndSortedPlaces.length} จาก {placesData.length} รายการ</span>
          {(searchTerm || selectedProvince) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedProvince('');
              }}
              className="text-pink-600 hover:underline font-bold"
            >
              ล้างตัวกรอง
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Loading / Empty / Grid / Table */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-3xl p-5 border border-slate-200 shadow-sm space-y-4 animate-pulse">
              <div className="h-44 w-full bg-slate-200 rounded-2xl animate-shimmer" />
              <div className="h-5 w-3/4 bg-slate-200 rounded-lg animate-shimmer" />
              <div className="h-4 w-1/2 bg-slate-200 rounded-lg animate-shimmer" />
              <div className="h-9 w-full bg-slate-200 rounded-xl animate-shimmer" />
            </div>
          ))}
        </div>
      ) : filteredAndSortedPlaces.length === 0 ? (
        <div className="bg-white rounded-[2.5rem] p-16 text-center border border-slate-200/80 shadow-md mb-12">
          <div className="max-w-md mx-auto space-y-4">
            <div className="w-20 h-20 mx-auto rounded-3xl bg-pink-50 text-pink-500 flex items-center justify-center shadow-inner">
              <ActiveIcon size={36} />
            </div>
            <h3 className="text-xl font-black text-slate-800">ไม่พบรายการข้อมูลที่ค้นหา</h3>
            <p className="text-sm text-slate-400">
              ไม่มีข้อมูลที่ตรงกับคำค้นหาหรือตัวกรองที่เลือกไว้ กรุณาลองปรับคำค้นหา หรือกดปุ่มเพิ่มข้อมูลใหม่
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => {
                  setSearchTerm('');
                  setSelectedProvince('');
                }}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all"
              >
                ล้างการค้นหา
              </button>
              <button
                onClick={openCreate}
                className="px-5 py-2.5 rounded-xl text-xs font-bold bg-pink-600 hover:bg-pink-700 text-white shadow-md shadow-pink-600/30 transition-all flex items-center gap-1.5"
              >
                <Plus size={16} /> เพิ่มข้อมูลใหม่
              </button>
            </div>
          </div>
        </div>
      ) : viewMode === 'grid' ? (
        // CARD GRID VIEW
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredAndSortedPlaces.map((place) => (
            <div
              key={place.id}
              className="group bg-white rounded-3xl border border-slate-200/80 shadow-sm hover:shadow-2xl transition-all duration-300 hover:-translate-y-1.5 flex flex-col overflow-hidden"
            >
              {/* Card Image Cover */}
              <div className="relative h-52 w-full overflow-hidden bg-slate-100">
                <img
                  src={place.image_url || FALLBACK_IMG}
                  alt={place.name}
                  onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-black/20" />

                {/* Floating Category & Province Badges */}
                <div className="absolute top-4 left-4 flex flex-wrap gap-1.5">
                  <span className="px-3 py-1 rounded-full text-[11px] font-black bg-white/90 backdrop-blur-md text-slate-800 shadow-md">
                    📍 {place.province || 'ญี่ปุ่น'}
                  </span>
                  {place.type && (
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-black/60 backdrop-blur-md text-white shadow-md">
                      {place.type}
                    </span>
                  )}
                  {Number(place.plan_count) > 0 && (
                    <span
                      className="px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-500/95 backdrop-blur-md text-white shadow-md flex items-center gap-1"
                      title={`สถานที่นี้ถูกสมาชิกนำไปจัดในแผนการท่องเที่ยวแล้ว (${place.plan_count} แผน)`}
                    >
                      <Lock size={12} /> {place.plan_count} แผน
                    </span>
                  )}
                </div>

                {/* Price Tag Floating */}
                <div className="absolute bottom-3 right-4">
                  <span className="px-3 py-1.5 rounded-xl font-black text-sm bg-gradient-to-r from-pink-600 to-rose-600 text-white shadow-lg">
                    {Number(place.starting_price) > 0
                      ? `¥${Number(place.starting_price).toLocaleString()}`
                      : 'ฟรี / ไม่มีค่าเข้า'}
                  </span>
                </div>
              </div>

              {/* Card Details */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-black text-slate-900 group-hover:text-pink-600 transition-colors line-clamp-1">
                    {place.name}
                  </h3>

                  <p className="text-xs text-slate-500 font-medium mt-1 line-clamp-2 leading-relaxed">
                    {place.description || 'ยังไม่มีคำอธิบายรายละเอียด'}
                  </p>

                  {/* Time info if available */}
                  {!isAcc && (place.open_time || place.close_time) && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl w-fit">
                      <Clock size={14} className="text-pink-500" />
                      <span>
                        {formatTime(place.open_time)} - {formatTime(place.close_time)} น.
                      </span>
                    </div>
                  )}
                </div>

                {/* Action Bar Footer */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <a
                    href={mapsDirectionUrl(place)}
                    target="_blank"
                    rel="noreferrer"
                    className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors text-xs font-bold flex items-center gap-1.5"
                    title="เปิดแผนที่ Google Maps"
                  >
                    <Navigation size={15} />
                    <span>แผนที่</span>
                  </a>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(place)}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 font-bold text-xs transition-all flex items-center gap-1.5 shadow-sm"
                    >
                      <Edit3 size={14} /> แก้ไข
                    </button>
                    {Number(place.plan_count) > 0 ? (
                      <button
                        type="button"
                        onClick={() => {
                          showToast(`สถานที่ "${place.name}" ถูกสมาชิกนำไปจัดในแผนการท่องเที่ยวแล้ว (${place.plan_count} แผน) แอดมินไม่สามารถลบได้ เพื่อรักษาข้อมูลแผนของสมาชิก`, 'error');
                        }}
                        className="p-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all shadow-sm border border-amber-200 cursor-not-allowed"
                        title={`สถานที่นี้ถูกนำไปใช้ในแผนการเดินทางของสมาชิกแล้ว (${place.plan_count} แผน) ไม่สามารถลบได้`}
                      >
                        <Lock size={16} />
                      </button>
                    ) : (
                      <button
                        onClick={() => setDeleteTarget(place)}
                        className="p-2 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-all shadow-sm"
                        title="ลบรายการนี้"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // TABLE VIEW
        <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-200/80 overflow-hidden mb-12">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/70 text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                  <th className="py-4 px-6 font-bold">ข้อมูลสถานที่ (Name & Info)</th>
                  <th className="py-4 px-6 font-bold">จังหวัด / ประเภท</th>
                  <th className="py-4 px-6 font-bold">เวลาทำการ / ชนิด</th>
                  <th className="py-4 px-6 font-bold">ราคาเริ่มต้น</th>
                  <th className="py-4 px-6 font-bold text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {filteredAndSortedPlaces.map((place) => (
                  <tr key={place.id} className="hover:bg-slate-50/80 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-4">
                        <img
                          src={place.image_url || FALLBACK_IMG}
                          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                          className="w-14 h-14 rounded-2xl object-cover shrink-0 shadow-sm border border-slate-100"
                          alt=""
                        />
                        <div className="max-w-xs">
                          <div className="font-bold text-slate-900 group-hover:text-pink-600 transition-colors text-base line-clamp-1">
                            {place.name}
                          </div>
                          <div className="text-slate-400 text-xs truncate mt-0.5">
                            {place.description || 'ไม่มีคำอธิบาย'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-6">
                      <div className="flex flex-col gap-1 items-start">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-100 text-slate-700">
                          📍 {place.province || '-'}
                        </span>
                        {place.type && (
                          <span className="text-[11px] font-semibold text-slate-400">
                            หมวด: {place.type}
                          </span>
                        )}
                        {Number(place.plan_count) > 0 && (
                          <span
                            className="px-2 py-0.5 rounded-lg text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200/80 flex items-center gap-1 shadow-xs"
                            title={`สถานที่นี้ถูกสมาชิกนำไปจัดในแผนการท่องเที่ยวแล้ว (${place.plan_count} แผน)`}
                          >
                            <Lock size={10} className="text-amber-600" /> ในแผนสมาชิก ({place.plan_count})
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-4 px-6 text-slate-600 font-medium text-xs">
                      {!isAcc ? (
                        place.open_time || place.close_time ? (
                          <span className="flex items-center gap-1.5">
                            <Clock size={13} className="text-pink-500" />
                            {formatTime(place.open_time)} - {formatTime(place.close_time)} น.
                          </span>
                        ) : (
                          <span className="text-slate-400">-</span>
                        )
                      ) : (
                        <span className="text-slate-600">{place.type || 'ที่พักทั่วไป'}</span>
                      )}
                    </td>

                    <td className="py-4 px-6 font-black text-pink-600 text-base">
                      {Number(place.starting_price) > 0
                        ? `¥${Number(place.starting_price).toLocaleString()}`
                        : 'ฟรี'}
                    </td>

                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <a
                          href={mapsDirectionUrl(place)}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2.5 rounded-xl bg-slate-50 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="ดูพิกัดบนแผนที่"
                        >
                          <Navigation size={15} />
                        </a>
                        <button
                          onClick={() => openEdit(place)}
                          className="p-2.5 rounded-xl bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 transition-all shadow-sm"
                          title="แก้ไข"
                        >
                          <Edit3 size={15} />
                        </button>
                        {Number(place.plan_count) > 0 ? (
                          <button
                            type="button"
                            onClick={() => {
                              showToast(`สถานที่ "${place.name}" ถูกสมาชิกนำไปจัดในแผนการท่องเที่ยวแล้ว (${place.plan_count} แผน) แอดมินไม่สามารถลบได้ เพื่อรักษาข้อมูลแผนของสมาชิก`, 'error');
                            }}
                            className="p-2.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-700 transition-all shadow-sm border border-amber-200 cursor-not-allowed"
                            title={`สถานที่นี้ถูกนำไปใช้ในแผนการเดินทางของสมาชิกแล้ว (${place.plan_count} แผน) ไม่สามารถลบได้`}
                          >
                            <Lock size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => setDeleteTarget(place)}
                            className="p-2.5 rounded-xl bg-rose-50 hover:bg-rose-600 hover:text-white text-rose-600 transition-all shadow-sm"
                            title="ลบ"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CREATE & EDIT MODAL DRAWER */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] w-full max-w-3xl p-6 md:p-8 shadow-2xl border border-slate-100 relative flex flex-col max-h-[92vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-tr ${currentTheme.bg} text-white shadow-md`}>
                  <ActiveIcon size={24} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800">
                    {editingId ? 'แก้ไขข้อมูล' : 'เพิ่มข้อมูลใหม่'}
                  </h2>
                  <p className="text-xs font-bold text-pink-600 flex items-center gap-1.5">
                    <span>หมวดหมู่:</span>
                    <span className="px-2 py-0.5 rounded-full bg-pink-100 text-pink-700 font-extrabold text-[11px]">
                      {categoriesList.find((c) => c.category_key === formCategory)?.name || tabLabel}
                    </span>
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-5">
              {/* Image Upload Section */}
              <div className="bg-slate-50 p-4 rounded-3xl border border-slate-200/80 space-y-3">
                <label className={labelCls}>รูปภาพหน้าปกหลัก *</label>

                {/* Drop Zone / Preview Area */}
                <div
                  className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 overflow-hidden ${
                    isDragOver
                      ? 'border-pink-400 bg-pink-50 scale-[1.01]'
                      : formData.image_url
                      ? 'border-slate-200 bg-slate-100'
                      : 'border-slate-300 bg-white hover:border-pink-300 hover:bg-pink-50/40'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => !formData.image_url && fileInputRef.current?.click()}
                  style={{ cursor: formData.image_url ? 'default' : 'pointer' }}
                >
                  {formData.image_url ? (
                    /* --- มีรูปแล้ว: แสดง preview --- */
                    <div className="flex flex-col sm:flex-row gap-4 p-3 items-center">
                      <div className="w-36 h-28 rounded-xl overflow-hidden shrink-0 shadow-md border border-slate-200">
                        <img
                          src={formData.image_url}
                          alt="Preview"
                          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 space-y-2">
                        <p className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                          <CheckCircle2 size={14} className="text-emerald-500" />
                          อัปโหลดรูปภาพสำเร็จแล้ว
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {formData.image_url.startsWith('data:') ? 'รูปภาพจากเครื่องของคุณ (Base64)' : 'รูปภาพ URL'}
                        </p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-pink-100 hover:bg-pink-200 text-pink-700 transition-all flex items-center gap-1"
                          >
                            <Upload size={12} /> เปลี่ยนรูป
                          </button>
                          <button
                            type="button"
                            onClick={() => setFormData((prev) => ({ ...prev, image_url: '' }))}
                            className="px-3 py-1.5 rounded-xl text-[11px] font-bold bg-rose-100 hover:bg-rose-200 text-rose-700 transition-all flex items-center gap-1"
                          >
                            <TrashIcon size={12} /> ลบรูป
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : imageUploading ? (
                    /* --- กำลังโหลด --- */
                    <div className="h-32 flex flex-col items-center justify-center gap-2 text-pink-500">
                      <div className="w-8 h-8 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                      <span className="text-xs font-bold">กำลังโหลดรูปภาพ...</span>
                    </div>
                  ) : (
                    /* --- ยังไม่มีรูป: Drop Zone --- */
                    <div className="h-36 flex flex-col items-center justify-center gap-2 text-slate-400 select-none">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
                        isDragOver ? 'bg-pink-100 text-pink-500' : 'bg-slate-100'
                      }`}>
                        <Upload size={28} />
                      </div>
                      <div className="text-center">
                        <p className="text-sm font-bold text-slate-600">
                          {isDragOver ? 'วางรูปภาพที่นี่ได้เลย!' : 'คลิกเพื่อเลือกรูปภาพ'}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-0.5">หรือลากและวางไฟล์รูปมาที่นี่</p>
                        <p className="text-[10px] text-slate-300 mt-1">รองรับ JPG, PNG, WEBP, GIF • ขนาดสูงสุด 4.5 MB</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Hidden file input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileInputChange}
                />
              </div>

              {/* Name */}
              <div>
                <label className={labelCls}>ชื่อสถานที่ / ร้านอาหาร / ที่พัก *</label>
                <input
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className={inputCls}
                  placeholder="เช่น โตเกียวสกายทรี, ร้าน Ichiran Ramen, โรงแรม Hoshinoya..."
                />
              </div>

              {/* Category & Province */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>หมวดหมู่ข้อมูล (Category) *</label>
                  <CustomSelect
                    name="formCategory"
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    placeholder="เลือกหมวดหมู่"
                    icon={Layers}
                    required
                    options={categoriesList.map((c) => ({
                      value: c.category_key,
                      label: c.name,
                      icon: c.category_key === 'attractions' ? '🗼' : c.category_key === 'restaurants' ? '🍜' : c.category_key === 'accommodations' ? '🏨' : '☕',
                    }))}
                  />
                </div>
                <div>
                  <label className={labelCls}>จังหวัดในญี่ปุ่น *</label>
                  <CustomSelect
                    name="province"
                    value={formData.province}
                    onChange={handleInputChange}
                    placeholder="เลือกจังหวัด"
                    icon={MapPin}
                    required
                    options={[
                      { value: '', label: 'เลือกจังหวัด' },
                      ...PROVINCES.map((p) => ({
                        value: p,
                        label: p,
                        icon: '📍',
                      })),
                    ]}
                  />
                </div>
              </div>

              {/* Price & Optional Sub-type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className={labelCls}>ราคาเริ่มต้น (เยน ¥)</label>
                  <input
                    type="number"
                    min="0"
                    name="starting_price"
                    value={formData.starting_price}
                    onChange={handleInputChange}
                    className={inputCls}
                    placeholder="0 = ฟรี หรือไม่มีค่าเข้า"
                  />
                </div>
                {formCategory === 'accommodations' ? (
                  <div>
                    <label className={labelCls}>ประเภทที่พัก *</label>
                    <input
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="เช่น โรงแรมหรู, เรียวกัง, โฮสเทล"
                    />
                  </div>
                ) : (
                  <div>
                    <label className={labelCls}>ประเภทย่อย / ลักษณะร้าน (ไม่บังคับ)</label>
                    <input
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="เช่น คาเฟ่ริมทะเล, ราเมงข้อสอบ, สวนสนุกกลางแจ้ง"
                    />
                  </div>
                )}
              </div>

              {/* Hours (สำหรับสถานที่, ร้านอาหาร, คาเฟ่ ฯลฯ) */}
              {formCategory !== 'accommodations' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className={labelCls}>เวลาเปิดทำการ</label>
                    <input
                      type="time"
                      name="open_time"
                      value={formData.open_time}
                      onChange={handleInputChange}
                      className={inputCls}
                    />
                  </div>
                  <div>
                    <label className={labelCls}>เวลาปิดทำการ</label>
                    <input
                      type="time"
                      name="close_time"
                      value={formData.close_time}
                      onChange={handleInputChange}
                      className={inputCls}
                    />
                  </div>
                </div>
              )}

              {/* Coordinates Section with Map Picker & Google Maps Link Support */}
              <div className="p-4 bg-slate-50/80 rounded-3xl border border-slate-200/80 space-y-3.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <label className={labelCls + ' mb-0'}>พิกัดที่ตั้ง (Coordinates)</label>
                    <p className="text-[11px] text-slate-400 font-medium">
                      ปักหมุดบนแผนที่ หรือวางลิงก์ Google Maps เพื่อให้ระบบดึงพิกัดอัตโนมัติ
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMapPickerOpen(true)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white font-bold text-xs shadow-md shadow-rose-500/20 transition-all hover:scale-[1.02] shrink-0"
                  >
                    <MapPin size={15} />
                    <span>ปักหมุดบนแผนที่</span>
                  </button>
                </div>

                {/* Quick Paste Field */}
                <div>
                  <input
                    type="text"
                    onChange={handlePasteCoordinates}
                    placeholder="⚡ หรือวางลิงก์ Google Maps / พิกัดที่นี่ (เช่น https://maps.app.goo.gl/... หรือ 35.7148, 139.7967)"
                    className="w-full px-3.5 py-2.5 bg-white border border-dashed border-rose-300 rounded-xl outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 font-medium text-xs text-slate-700 placeholder:text-slate-400 transition-all"
                  />
                </div>

                {/* Inputs for Lat / Lng */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-slate-600">ละติจูด (Latitude)</span>
                      {formData.latitude && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">ระบุแล้ว</span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="any"
                      name="latitude"
                      value={formData.latitude}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="เช่น 35.7148 (โตเกียว)"
                    />
                  </div>
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[11px] font-bold text-slate-600">ลองจิจูด (Longitude)</span>
                      {formData.longitude && (
                        <span className="text-[10px] text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded">ระบุแล้ว</span>
                      )}
                    </div>
                    <input
                      type="number"
                      step="any"
                      name="longitude"
                      value={formData.longitude}
                      onChange={handleInputChange}
                      className={inputCls}
                      placeholder="เช่น 139.7967 (โตเกียว)"
                    />
                  </div>
                </div>

                {/* Google Maps External Test Link */}
                {formData.latitude && formData.longitude && (
                  <div className="flex items-center justify-between pt-1 text-[11px]">
                    <span className="text-slate-500">
                      พิกัดปัจจุบัน: <strong className="text-slate-700">{formData.latitude}, {formData.longitude}</strong>
                    </span>
                    <a
                      href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-pink-600 hover:text-pink-700 font-bold hover:underline"
                    >
                      <ExternalLink size={12} />
                      <span>ตรวจสอบบน Google Maps จริง</span>
                    </a>
                  </div>
                )}
              </div>

              {/* Gallery Multi-Upload */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className={labelCls}>
                    รูปภาพแกลเลอรีเพิ่มเติม
                    {Array.isArray(formData.gallery) && formData.gallery.length > 0 && (
                      <span className="ml-2 px-2 py-0.5 rounded-full bg-pink-100 text-pink-600 text-[10px] font-black normal-case">
                        {formData.gallery.length} รูป
                      </span>
                    )}
                  </label>
                  {Array.isArray(formData.gallery) && formData.gallery.length > 0 && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, gallery: [] }))}
                      className="text-[11px] font-bold text-rose-500 hover:text-rose-700 transition-colors"
                    >
                      ลบทั้งหมด
                    </button>
                  )}
                </div>

                {/* Thumbnails Grid */}
                {Array.isArray(formData.gallery) && formData.gallery.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                    {formData.gallery.map((src, idx) => (
                      <div key={idx} className="relative group aspect-square rounded-xl overflow-hidden bg-slate-100 shadow-sm border border-slate-200">
                        <img
                          src={src}
                          alt={`gallery-${idx}`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            type="button"
                            onClick={() => removeGalleryImage(idx)}
                            className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center hover:bg-rose-700 transition-colors shadow-lg"
                          >
                            <X size={14} />
                          </button>
                        </div>
                        <span className="absolute top-1 left-1 px-1.5 py-0.5 rounded-md bg-black/60 text-white text-[9px] font-bold">
                          {idx + 1}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Drop Zone */}
                <div
                  className={`rounded-2xl border-2 border-dashed transition-all duration-200 ${
                    isGalleryDragOver
                      ? 'border-pink-400 bg-pink-50 scale-[1.01]'
                      : 'border-slate-300 bg-white hover:border-pink-300 hover:bg-pink-50/40'
                  }`}
                  onDragOver={(e) => { e.preventDefault(); setIsGalleryDragOver(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setIsGalleryDragOver(false); }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsGalleryDragOver(false);
                    handleGalleryFiles(e.dataTransfer.files);
                  }}
                  onClick={() => galleryInputRef.current?.click()}
                  style={{ cursor: 'pointer' }}
                >
                  {galleryUploading ? (
                    <div className="h-20 flex items-center justify-center gap-2 text-pink-500">
                      <div className="w-6 h-6 border-4 border-pink-300 border-t-pink-600 rounded-full animate-spin" />
                      <span className="text-xs font-bold">กำลังโหลดรูปภาพ...</span>
                    </div>
                  ) : (
                    <div className="h-20 flex flex-col items-center justify-center gap-1 text-slate-400 select-none">
                      <div className={`flex items-center gap-2 ${ isGalleryDragOver ? 'text-pink-500' : '' }`}>
                        <Upload size={20} />
                        <span className="text-sm font-bold text-slate-600">
                          {isGalleryDragOver ? 'วางรูปที่นี่ได้เลย!' : 'คลิกหรือลากรูปมาวาง (เลือกได้หลายรูปพร้อมกัน)'}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-300">รองรับ JPG, PNG, WEBP, GIF • สูงสุดรูปละ 4.5 MB</p>
                    </div>
                  )}
                </div>

                {/* Hidden multi-file input */}
                <input
                  ref={galleryInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleGalleryInputChange}
                />
              </div>

              {/* Description */}
              <div>
                <label className={labelCls}>คำอธิบายข้อมูลและจุดเด่น</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  rows="4"
                  className={`${inputCls} resize-none`}
                  placeholder="เขียนจุดเด่น ไฮไลต์ หรือประวัติของสถานที่..."
                />
              </div>

              {/* Modal Buttons */}
              <div className="flex gap-3 pt-5 border-t border-slate-100 mt-6">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-2xl transition-all text-sm"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className={`flex-1 py-3.5 bg-gradient-to-r ${currentTheme.bg} hover:opacity-95 text-white font-black rounded-2xl shadow-xl ${currentTheme.glow} flex items-center justify-center gap-2 transition-all text-sm disabled:opacity-60`}
                >
                  <Save size={18} />
                  <span>{saving ? 'กำลังบันทึกข้อมูล...' : 'บันทึกข้อมูลลงฐานข้อมูล'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CUSTOM IN-APP DELETE CONFIRMATION MODAL */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl border border-slate-100 text-center space-y-4 animate-scaleUp">
            <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center shadow-inner ${
              Number(deleteTarget.plan_count) > 0 ? 'bg-amber-100 text-amber-600' : 'bg-rose-100 text-rose-600'
            }`}>
              {Number(deleteTarget.plan_count) > 0 ? <Lock size={32} /> : <Trash2 size={32} />}
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                {Number(deleteTarget.plan_count) > 0 ? 'ไม่อนุญาตให้ลบข้อมูลนี้' : 'ยืนยันการลบข้อมูล'}
              </h3>
              <p className="text-sm text-slate-500 mt-2">
                รายการ <span className="font-bold text-slate-800">"{deleteTarget.name}"</span>
              </p>
              {Number(deleteTarget.plan_count) > 0 ? (
                <div className="mt-3 p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5 text-left">
                  <AlertCircle size={18} className="text-amber-600 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>ไม่สามารถลบสถานที่นี้ได้:</strong> เนื่องจากสถานที่นี้ถูกสมาชิกนำไปจัดในแผนการท่องเที่ยวแล้ว ({deleteTarget.plan_count} แผน) ระบบจึงไม่อนุญาตให้แอดมินลบ เพื่อป้องกันข้อมูลในแผนการเดินทางของสมาชิกสูญหาย
                  </span>
                </div>
              ) : (
                <div className="mt-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-xs flex items-start gap-2.5 text-left">
                  <AlertCircle size={18} className="text-slate-500 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">
                    <strong>คำเตือน:</strong> การลบข้อมูลจะเป็นการลบออกจากระบบ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all"
              >
                {Number(deleteTarget.plan_count) > 0 ? 'รับทราบและปิด' : 'ยกเลิก'}
              </button>
              {Number(deleteTarget.plan_count || 0) === 0 && (
                <button
                  onClick={confirmDelete}
                  disabled={deleting}
                  className="flex-1 py-3 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {deleting ? 'กำลังลบ...' : 'ยืนยันลบ'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM IN-APP SAVE CONFIRMATION MODAL */}
      {showSaveConfirm && (
        <div className="fixed inset-0 z-[10010] flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2.2rem] w-full max-w-md p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-4 animate-scaleUp">
            {/* Top Icon */}
            <div className={`w-16 h-16 mx-auto rounded-3xl bg-gradient-to-tr ${currentTheme.bg} text-white flex items-center justify-center shadow-lg ${currentTheme.glow}`}>
              <ActiveIcon size={32} />
            </div>

            <div>
              <h3 className="text-xl font-black text-slate-900">
                {editingId ? 'ยืนยันการบันทึกการแก้ไขข้อมูล?' : 'ยืนยันการบันทึกข้อมูลใหม่?'}
              </h3>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                คุณแน่ใจหรือไม่ว่าต้องการบันทึกข้อมูล{' '}
                <strong className="text-slate-800">"{formData.name}"</strong> ลงสู่ฐานข้อมูล?
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSaveConfirm(false)}
                disabled={saving}
                className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all text-xs disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={confirmSave}
                disabled={saving}
                className={`flex-1 py-3 bg-gradient-to-r ${currentTheme.bg} hover:opacity-95 text-white font-black rounded-xl shadow-lg ${currentTheme.glow} transition-all text-xs flex items-center justify-center gap-2 disabled:opacity-60 active:scale-95`}
              >
                {saving ? (
                  <>
                    <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={15} />
                    <span>ยืนยันการบันทึก</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* MAP PICKER MODAL */}
      {isMapPickerOpen && (
        <MapPickerModal
          initialLat={formData.latitude}
          initialLng={formData.longitude}
          placeName={formData.name}
          province={formData.province}
          onClose={() => setIsMapPickerOpen(false)}
          onSelect={({ lat, lng }) => {
            setFormData((prev) => ({
              ...prev,
              latitude: lat,
              longitude: lng,
            }));
            showToast(`อัปเดตพิกัดเรียบร้อย (${lat}, ${lng})`, 'success');
          }}
        />
      )}
    </AdminLayout>
  );
};

export default AdminManagePlaces;
