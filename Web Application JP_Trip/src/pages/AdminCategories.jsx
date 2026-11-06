import React, { useState, useEffect, useMemo } from 'react';
import {
  Layers,
  Plus,
  Edit3,
  Trash2,
  Search,
  X,
  Save,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  ShieldCheck,
  Sparkles,
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
  Tag,
  LayoutGrid,
  Table as TableIcon,
  RefreshCw,
  ArrowUpDown,
  Lock,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../connectAPI/axios';
import AdminLayout from '../components/AdminLayout';

// รายการไอคอนที่รองรับสำหรับหมวดหมู่
const AVAILABLE_ICONS = [
  { id: 'MapPin', label: 'หมุดสถานที่', icon: MapPin },
  { id: 'Utensils', label: 'ร้านอาหาร', icon: Utensils },
  { id: 'BedDouble', label: 'ที่พัก/โรงแรม', icon: BedDouble },
  { id: 'Camera', label: 'จุดถ่ายรูป', icon: Camera },
  { id: 'Landmark', label: 'โบราณสถาน/วัด', icon: Landmark },
  { id: 'Coffee', label: 'คาเฟ่/เครื่องดื่ม', icon: Coffee },
  { id: 'ShoppingBag', label: 'ช้อปปิ้ง/ตลาด', icon: ShoppingBag },
  { id: 'Mountain', label: 'ธรรมชาติ/ภูเขา', icon: Mountain },
  { id: 'Ticket', label: 'สวนสนุก/กิจกรรม', icon: Ticket },
  { id: 'Compass', label: 'นำทาง/สำรวจ', icon: Compass },
  { id: 'Bike', label: 'ปั่นจักรยาน/ทัวร์', icon: Bike },
  { id: 'Heart', label: 'ยอดนิยม/ไฮไลท์', icon: Heart },
  { id: 'Star', label: 'แนะนำพิเศษ', icon: Star },
  { id: 'Sparkles', label: 'พรีเมียม/อีเวนต์', icon: Sparkles },
];

// โทนสีสำหรับแต่ละหมวดหมู่
const COLOR_THEMES = {
  pink: {
    id: 'pink',
    label: 'ชมพู-กุหลาบ',
    badge: 'bg-pink-50 text-pink-700 border-pink-200',
    gradient: 'from-pink-500 to-rose-600',
    iconBg: 'bg-pink-500/10 text-pink-600',
    border: 'border-pink-200',
    glow: 'shadow-pink-500/20',
  },
  amber: {
    id: 'amber',
    label: 'ส้ม-ทองอำพัน',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    gradient: 'from-amber-500 to-orange-600',
    iconBg: 'bg-amber-500/10 text-amber-600',
    border: 'border-amber-200',
    glow: 'shadow-amber-500/20',
  },
  emerald: {
    id: 'emerald',
    label: 'เขียวมรกต',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    gradient: 'from-emerald-500 to-teal-600',
    iconBg: 'bg-emerald-500/10 text-emerald-600',
    border: 'border-emerald-200',
    glow: 'shadow-emerald-500/20',
  },
  indigo: {
    id: 'indigo',
    label: 'น้ำเงินคราม',
    badge: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    gradient: 'from-indigo-500 to-blue-600',
    iconBg: 'bg-indigo-500/10 text-indigo-600',
    border: 'border-indigo-200',
    glow: 'shadow-indigo-500/20',
  },
  purple: {
    id: 'purple',
    label: 'ม่วงไวโอเล็ต',
    badge: 'bg-purple-50 text-purple-700 border-purple-200',
    gradient: 'from-purple-500 to-fuchsia-600',
    iconBg: 'bg-purple-500/10 text-purple-600',
    border: 'border-purple-200',
    glow: 'shadow-purple-500/20',
  },
  cyan: {
    id: 'cyan',
    label: 'ฟ้าครามทะเล',
    badge: 'bg-cyan-50 text-cyan-800 border-cyan-200',
    gradient: 'from-cyan-500 to-blue-500',
    iconBg: 'bg-cyan-500/10 text-cyan-600',
    border: 'border-cyan-200',
    glow: 'shadow-cyan-500/20',
  },
};

const getCategoryIconComponent = (iconId) => {
  const found = AVAILABLE_ICONS.find((item) => item.id === iconId);
  return found ? found.icon : MapPin;
};

const emptyCategoryForm = {
  category_id: null,
  name: '',
  category_key: '',
  description: '',
  icon: 'MapPin',
  color: 'pink',
  sort_order: 1,
};

const AdminCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'system' | 'custom'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'

  // Modal State
  const [modalMode, setModalMode] = useState(null); // 'add' | 'edit' | null
  const [formData, setFormData] = useState(emptyCategoryForm);
  const [saving, setSaving] = useState(false);

  // Delete Confirmation Modal
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
  };

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  // โหลดรายการหมวดหมู่
  const fetchCategories = async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    try {
      const res = await api.get('/admin/categories');
      setCategories(res.data || []);
    } catch (err) {
      showToast('error', 'โหลดข้อมูลไม่สำเร็จ', errMsg(err, 'ไม่สามารถดึงข้อมูลหมวดหมู่ได้'));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // กรองข้อมูลตามคำค้นหาและประเภท
  const filteredCategories = useMemo(() => {
    return categories.filter((c) => {
      const matchSearch =
        c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.category_key.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (c.description || '').toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchSearch) return false;

      if (typeFilter === 'system') return Boolean(c.is_system);
      if (typeFilter === 'custom') return !c.is_system;
      return true;
    });
  }, [categories, searchTerm, typeFilter]);

  // สถิติรวม
  const stats = useMemo(() => {
    const total = categories.length;
    const systemCount = categories.filter((c) => c.is_system).length;
    const customCount = total - systemCount;
    const totalPlaces = categories.reduce((sum, c) => sum + (Number(c.place_count) || 0), 0);
    return { total, systemCount, customCount, totalPlaces };
  }, [categories]);

  // เปิดหน้าต่างเพิ่มหมวดหมู่ใหม่
  const handleOpenAddModal = () => {
    const nextSort = categories.length > 0 ? Math.max(...categories.map((c) => c.sort_order || 0)) + 1 : 1;
    setFormData({
      ...emptyCategoryForm,
      sort_order: nextSort,
    });
    setModalMode('add');
  };

  // เปิดหน้าต่างแก้ไขหมวดหมู่
  const handleOpenEditModal = (cat) => {
    setFormData({
      category_id: cat.category_id,
      name: cat.name,
      category_key: cat.category_key,
      description: cat.description || '',
      icon: cat.icon || 'MapPin',
      color: cat.color || 'pink',
      sort_order: cat.sort_order || 0,
      is_system: cat.is_system,
    });
    setModalMode('edit');
  };

  // บันทึกข้อมูลหมวดหมู่ (เพิ่มหรือแก้ไข)
  const handleSubmitForm = async (e) => {
    e.preventDefault();

    const name = formData.name.trim();
    if (!name) {
      showToast('error', 'ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อหมวดหมู่');
      return;
    }

    setSaving(true);
    try {
      if (modalMode === 'add') {
        const payload = {
          name,
          category_key: formData.category_key.trim(),
          description: formData.description.trim(),
          icon: formData.icon,
          color: formData.color,
          sort_order: Number(formData.sort_order) || 0,
        };
        const res = await api.post('/admin/categories', payload);
        showToast('success', 'เพิ่มหมวดหมู่สำเร็จ!', res.data.message || `เพิ่มหมวดหมู่ "${name}" เรียบร้อย`);
      } else if (modalMode === 'edit') {
        const payload = {
          name,
          description: formData.description.trim(),
          icon: formData.icon,
          color: formData.color,
          sort_order: Number(formData.sort_order) || 0,
        };
        const res = await api.put(`/admin/categories/${formData.category_id}`, payload);
        showToast('success', 'แก้ไขหมวดหมู่สำเร็จ!', res.data.message || `แก้ไขหมวดหมู่ "${name}" เรียบร้อย`);
      }

      setModalMode(null);
      await fetchCategories(true);
    } catch (err) {
      showToast('error', 'บันทึกไม่สำเร็จ', errMsg(err, 'ไม่สามารถบันทึกข้อมูลหมวดหมู่ได้'));
    } finally {
      setSaving(false);
    }
  };

  // ดำเนินการลบหมวดหมู่
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;

    setDeleting(true);
    try {
      const res = await api.delete(`/admin/categories/${deleteTarget.category_id}`);
      showToast('success', 'ลบหมวดหมู่สำเร็จ!', res.data.message || `ลบหมวดหมู่ "${deleteTarget.name}" เรียบร้อย`);
      setDeleteTarget(null);
      await fetchCategories(true);
    } catch (err) {
      showToast('error', 'ลบหมวดหมู่ไม่สำเร็จ', errMsg(err, 'ไม่สามารถลบหมวดหมู่นี้ได้'));
    } finally {
      setDeleting(false);
    }
  };

  return (
    <AdminLayout maxWidth="max-w-7xl">
      {/* Toast Notification Layer */}
      {toast && (
        <div className="fixed top-24 right-4 sm:right-8 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div
            className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-start gap-3.5 ${
              toast.type === 'success'
                ? 'bg-emerald-50/95 border-emerald-200/80 text-emerald-900 shadow-emerald-500/10'
                : 'bg-rose-50/95 border-rose-200/80 text-rose-900 shadow-rose-500/10'
            }`}
          >
            <div
              className={`p-2 rounded-xl shrink-0 ${
                toast.type === 'success' ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'
              }`}
            >
              {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            </div>
            <div className="flex-1 min-w-0 pr-1">
              <h4 className="text-sm font-bold leading-tight">{toast.title}</h4>
              <p className="text-xs text-slate-600 mt-1 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => setToast(null)}
              className="p-1 rounded-lg hover:bg-black/5 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Header Banner Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-pink-50 text-pink-600 border border-pink-100">
              <Layers size={13} /> ระบบจัดการหมวดหมู่ข้อมูล
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
            จัดการหมวดหมู่ข้อมูล
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            เพิ่ม ลบ หรือแก้ไขหมวดหมู่ของสถานที่ เช่น สถานที่ท่องเที่ยว ร้านอาหาร ที่พัก และหมวดหมู่อื่น ๆ
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchCategories(true)}
            disabled={refreshing || loading}
            className="p-3 bg-white border border-slate-200 hover:border-slate-300 text-slate-600 hover:text-slate-800 rounded-2xl shadow-xs transition-all active:scale-95 disabled:opacity-50"
            title="รีเฟรชข้อมูล"
          >
            <RefreshCw size={18} className={refreshing ? 'animate-spin text-pink-600' : ''} />
          </button>

          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>เพิ่มหมวดหมู่ใหม่</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-pink-50 text-pink-600 flex items-center justify-center font-black">
            <Layers size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">หมวดหมู่ทั้งหมด</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.total} <span className="text-xs font-normal text-slate-400">หมวด</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center font-black">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">หมวดหมู่หลัก (ระบบ)</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.systemCount} <span className="text-xs font-normal text-slate-400">หมวด</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-black">
            <Sparkles size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">หมวดหมู่เพิ่มเติม</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.customCount} <span className="text-xs font-normal text-slate-400">หมวด</span></h3>
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
            <MapPin size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">สถานที่ทั้งหมด</p>
            <h3 className="text-2xl font-black text-slate-900 mt-0.5">{stats.totalPlaces} <span className="text-xs font-normal text-slate-400">แห่ง</span></h3>
          </div>
        </div>
      </div>

      {/* Filter and View Mode Toolbar */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/80 shadow-xs mb-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="ค้นหาชื่อหมวดหมู่ หรือคำอธิบาย..."
              className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X size={14} />
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100/80 rounded-2xl border border-slate-200/60 w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-800 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              ทั้งหมด ({categories.length})
            </button>
            <button
              onClick={() => setTypeFilter('system')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === 'system'
                  ? 'bg-white text-indigo-700 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              หมวดหมู่หลัก ({stats.systemCount})
            </button>
            <button
              onClick={() => setTypeFilter('custom')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                typeFilter === 'custom'
                  ? 'bg-white text-amber-700 shadow-xs font-black'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              หมวดหมู่เพิ่มเติม ({stats.customCount})
            </button>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-2 self-end md:self-auto">
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl border border-slate-200/60">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'grid' ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="มุมมองการ์ด (Bento Cards)"
            >
              <LayoutGrid size={18} />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-xl transition-all ${
                viewMode === 'table' ? 'bg-white text-pink-600 shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="มุมมองตาราง (Table)"
            >
              <TableIcon size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-16 text-center shadow-xs">
          <div className="w-10 h-10 border-4 border-pink-500/20 border-t-pink-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm font-bold text-slate-500">กำลังโหลดรายการหมวดหมู่ข้อมูล...</p>
        </div>
      ) : filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-300 p-16 text-center shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto mb-4 border border-slate-200">
            <Layers size={32} />
          </div>
          <h3 className="text-lg font-bold text-slate-800 mb-1">ไม่พบหมวดหมู่ที่ตรงกับเงื่อนไข</h3>
          <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
            {searchTerm
              ? `ไม่พบหมวดหมู่ที่ตรงกับคำค้นหา "${searchTerm}" กรุณาลองใช้คำค้นหาใหม่อีกครั้ง`
              : 'ยังไม่มีหมวดหมู่เพิ่มเติมในระบบ คุณสามารถคลิกเพิ่มหมวดหมู่ใหม่ได้ทันที'}
          </p>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-pink-600 hover:bg-pink-700 text-white font-bold text-sm shadow-md transition-all active:scale-95"
          >
            <Plus size={16} /> เพิ่มหมวดหมู่ใหม่
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Bento Cards Grid View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map((cat) => {
            const IconComp = getCategoryIconComponent(cat.icon);
            const theme = COLOR_THEMES[cat.color] || COLOR_THEMES.pink;

            return (
              <div
                key={cat.category_id}
                className="bg-white rounded-3xl border border-slate-200/80 hover:border-slate-300 shadow-xs hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300 flex flex-col overflow-hidden group relative"
              >
                {/* Top Banner Accent */}
                <div className={`h-2.5 bg-gradient-to-r ${theme.gradient}`} />

                <div className="p-6 flex-1 flex flex-col">
                  {/* Category Header */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border ${theme.badge} shadow-xs transition-transform group-hover:scale-105 duration-300`}
                      >
                        <IconComp size={28} />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-black text-slate-900 group-hover:text-pink-600 transition-colors">
                            {cat.name}
                          </h3>
                        </div>
                        <span className="text-[11px] font-mono font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md mt-0.5 inline-block">
                          {cat.category_key}
                        </span>
                      </div>
                    </div>

                    {/* Status Pill */}
                    {cat.is_system ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200 shrink-0">
                        <Lock size={12} className="text-slate-400" /> หมวดหมู่หลัก
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                        <Sparkles size={12} className="text-amber-500" /> หมวดหมู่เพิ่มเติม
                      </span>
                    )}
                  </div>

                  {/* Description */}
                  <p className="text-xs sm:text-sm text-slate-500 leading-relaxed mb-6 line-clamp-2 flex-1">
                    {cat.description || 'ไม่มีคำอธิบายสำหรับหมวดหมู่นี้'}
                  </p>

                  {/* Metadata & Place Count Bar */}
                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500 mb-5">
                    <div className="flex items-center gap-1.5">
                      <span className="text-slate-400">จำนวนสถานที่:</span>
                      <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded-md">
                        {cat.place_count || 0} แห่ง
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      <span className="text-slate-400">ลำดับ:</span>
                      <span className="font-bold text-slate-800">{cat.sort_order || 0}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2 pt-1">
                    {/* View Places Button (เชื่อมต่อไปยังหน้าจัดการสถานที่) */}
                    <Link
                      to={`/admin/manage-places?tab=${cat.category_key}`}
                      className="flex-1 py-2.5 px-3 rounded-xl bg-slate-50 hover:bg-pink-50 hover:text-pink-700 text-slate-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-slate-200/60 hover:border-pink-200"
                      title={`ไปที่หน้าจัดการสถานที่หมวด ${cat.name}`}
                    >
                      <MapPin size={14} className="text-pink-600" /> จัดการสถานที่ ({cat.place_count || 0})
                    </Link>

                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEditModal(cat)}
                      className="py-2.5 px-3.5 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border border-indigo-100 active:scale-95"
                      title="แก้ไขข้อมูลหมวดหมู่"
                    >
                      <Edit3 size={14} /> แก้ไข
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => !cat.is_system && setDeleteTarget(cat)}
                      disabled={Boolean(cat.is_system)}
                      className={`py-2.5 px-3.5 rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 border ${
                        cat.is_system
                          ? 'bg-slate-50 text-slate-300 border-slate-100 cursor-not-allowed'
                          : 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-100 active:scale-95'
                      }`}
                      title={cat.is_system ? 'หมวดหมู่หลักของระบบไม่สามารถลบได้' : 'ลบหมวดหมู่นี้'}
                    >
                      <Trash2 size={14} /> ลบ
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Structured Table View */
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-black uppercase tracking-wider text-slate-500">
                  <th className="py-4 px-6">ลำดับ</th>
                  <th className="py-4 px-6">หมวดหมู่</th>
                  <th className="py-4 px-6">รหัสหมวดหมู่ (Key)</th>
                  <th className="py-4 px-6">คำอธิบาย</th>
                  <th className="py-4 px-6 text-center">จำนวนสถานที่</th>
                  <th className="py-4 px-6 text-center">ประเภท</th>
                  <th className="py-4 px-6 text-right">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                {filteredCategories.map((cat) => {
                  const IconComp = getCategoryIconComponent(cat.icon);
                  const theme = COLOR_THEMES[cat.color] || COLOR_THEMES.pink;

                  return (
                    <tr key={cat.category_id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-400">{cat.sort_order || 0}</td>
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${theme.badge}`}
                          >
                            <IconComp size={20} />
                          </div>
                          <div>
                            <span className="font-bold text-slate-900 block">{cat.name}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                          {cat.category_key}
                        </span>
                      </td>
                      <td className="py-4 px-6 max-w-xs truncate text-slate-500">
                        {cat.description || '-'}
                      </td>
                      <td className="py-4 px-6 text-center">
                        <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded-full text-xs">
                          {cat.place_count || 0} แห่ง
                        </span>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {cat.is_system ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                            <Lock size={11} className="text-slate-400" /> หมวดหมู่หลัก
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-black px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                            <Sparkles size={11} className="text-amber-500" /> เพิ่มเติม
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            to={`/admin/manage-places?tab=${cat.category_key}`}
                            className="p-2 rounded-xl bg-slate-50 hover:bg-pink-50 text-slate-600 hover:text-pink-600 border border-slate-200/80 hover:border-pink-200 transition-colors"
                            title={`ไปที่หน้าจัดการสถานที่ในหมวด "${cat.name}"`}
                          >
                            <MapPin size={15} />
                          </Link>
                          <button
                            onClick={() => handleOpenEditModal(cat)}
                            className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-600 transition-colors"
                            title="แก้ไขหมวดหมู่"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => !cat.is_system && setDeleteTarget(cat)}
                            disabled={Boolean(cat.is_system)}
                            className={`p-2 rounded-xl transition-colors ${
                              cat.is_system
                                ? 'bg-slate-50 text-slate-300 cursor-not-allowed'
                                : 'bg-rose-50 hover:bg-rose-100 text-rose-600'
                            }`}
                            title={cat.is_system ? 'หมวดหมู่หลักไม่สามารถลบได้' : 'ลบหมวดหมู่'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Category Modal */}
      {modalMode && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            {/* Close Button */}
            <button
              onClick={() => !saving && setModalMode(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600">
                <Layers size={24} />
              </div>
              <div>
                <h3 className="text-xl font-black text-slate-900 tracking-tight">
                  {modalMode === 'add' ? 'เพิ่มหมวดหมู่ใหม่' : 'แก้ไขข้อมูลหมวดหมู่'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {modalMode === 'add'
                    ? 'กรอกข้อมูลหมวดหมู่สถานที่เพื่อเพิ่มเข้าสู่ระบบ'
                    : `แก้ไขรายละเอียดของหมวดหมู่ "${formData.name}"`}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmitForm} className="space-y-4">
              {/* Field: Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  ชื่อหมวดหมู่ <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="เช่น จุดชมวิว, คาเฟ่, บ่อน้ำพุร้อน"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all"
                />
              </div>

              {/* Field: Category Key */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1 flex items-center justify-between">
                  <span>รหัสหมวดหมู่ (Category Key)</span>
                  {modalMode === 'edit' && (
                    <span className="text-[10px] font-normal text-slate-400 lowercase">
                      (ไม่สามารถเปลี่ยนรหัสได้)
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  readOnly={modalMode === 'edit'}
                  disabled={modalMode === 'edit'}
                  value={formData.category_key}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      category_key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '_'),
                    })
                  }
                  placeholder="เช่น cafes, scenic_spots (เว้นว่างไว้เพื่อสร้างอัตโนมัติ)"
                  className={`w-full px-4 py-3 border rounded-2xl text-sm font-mono transition-all ${
                    modalMode === 'edit'
                      ? 'bg-slate-100 text-slate-500 border-slate-200 cursor-not-allowed'
                      : 'bg-slate-50 border-slate-200 focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none'
                  }`}
                />
                <p className="text-[11px] text-slate-400 mt-1 ml-1">
                  ใช้อักษรภาษาอังกฤษตัวพิมพ์เล็กและตัวเลขสำหรับอ้างอิงในระบบ
                </p>
              </div>

              {/* Field: Description */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                  คำอธิบายหมวดหมู่
                </label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="ระบุคำอธิบายสั้น ๆ เกี่ยวกับหมวดหมู่นี้..."
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 outline-none transition-all resize-none"
                />
              </div>

              {/* Field: Choose Icon */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 ml-1">
                  เลือกไอคอนประจำหมวดหมู่
                </label>
                <div className="grid grid-cols-7 gap-2 p-3 bg-slate-50 rounded-2xl border border-slate-200 max-h-36 overflow-y-auto">
                  {AVAILABLE_ICONS.map((item) => {
                    const IconC = item.icon;
                    const isSelected = formData.icon === item.id;
                    return (
                      <button
                        type="button"
                        key={item.id}
                        onClick={() => setFormData({ ...formData, icon: item.id })}
                        className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
                          isSelected
                            ? 'bg-pink-600 text-white shadow-md shadow-pink-500/30 scale-105'
                            : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                        }`}
                        title={item.label}
                      >
                        <IconC size={20} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Field: Color Theme & Sort Order */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                    โทนสีของหมวดหมู่
                  </label>
                  <select
                    value={formData.color}
                    onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-pink-500 outline-none transition-all"
                  >
                    {Object.values(COLOR_THEMES).map((thm) => (
                      <option key={thm.id} value={thm.id}>
                        {thm.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-1.5 ml-1">
                    ลำดับการแสดงผล
                  </label>
                  <input
                    type="number"
                    min={0}
                    value={formData.sort_order}
                    onChange={(e) => setFormData({ ...formData, sort_order: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-sm font-medium focus:bg-white focus:border-pink-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* Live Preview Card */}
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5 ml-1">
                  ตัวอย่างการแสดงผล
                </span>
                <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center gap-3">
                  {(() => {
                    const PreviewIcon = getCategoryIconComponent(formData.icon);
                    const pTheme = COLOR_THEMES[formData.color] || COLOR_THEMES.pink;
                    return (
                      <>
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 border ${pTheme.badge}`}
                        >
                          <PreviewIcon size={22} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-slate-900 truncate">
                            {formData.name || 'ตัวอย่างชื่อหมวดหมู่'}
                          </p>
                          <p className="text-xs text-slate-500 truncate">
                            {formData.description || 'คำอธิบายหมวดหมู่สั้น ๆ'}
                          </p>
                        </div>
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalMode(null)}
                  disabled={saving}
                  className="flex-1 py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all active:scale-95 disabled:opacity-50"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>กำลังบันทึก...</span>
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      <span>{modalMode === 'add' ? 'เพิ่มหมวดหมู่' : 'บันทึกการแก้ไข'}</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-100 text-center relative animate-in zoom-in-95 duration-200">
            <button
              onClick={() => !deleting && setDeleteTarget(null)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-16 h-16 rounded-3xl bg-rose-50 border border-rose-100 flex items-center justify-center text-rose-600 mx-auto mb-4 shadow-sm">
              <Trash2 size={30} />
            </div>

            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
              ยืนยันการลบหมวดหมู่?
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-6 leading-relaxed">
              คุณแน่ใจหรือไม่ว่าต้องการลบหมวดหมู่{' '}
              <span className="font-bold text-rose-600">"{deleteTarget.name}"</span>?
              การกระทำนี้ไม่สามารถย้อนกลับได้
            </p>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={deleting}
                className="flex-1 py-3 px-5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs sm:text-sm shadow-lg shadow-rose-600/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              >
                {deleting ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังลบ...</span>
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    <span>ยืนยันการลบ</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminCategories;
