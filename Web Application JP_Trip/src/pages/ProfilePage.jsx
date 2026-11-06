import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Save, 
  Mail, 
  User, 
  Trash2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  ArrowLeft,
  RotateCcw,
  UserCheck,
  Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api, { errMsg } from '../connectAPI/axios';
import { getUser, setSession } from '../utils/auth';

// บีบอัดและย่อรูปที่อัปโหลด (300px JPEG) ก่อนบันทึกลงฐานข้อมูลเพื่อความเร็ว
const resizeImage = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = reject;
    reader.onload = () => {
      const img = new Image();
      img.onerror = reject;
      img.onload = () => {
        const size = 300;
        const scale = Math.max(size / img.width, size / img.height);
        const w = img.width * scale;
        const h = img.height * scale;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, (size - w) / 2, (size - h) / 2, w, h);
        resolve(canvas.toDataURL('image/jpeg', 0.88));
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  });

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ProfilePage = () => {
  const [currentUser, setCurrentUser] = useState(getUser());
  const fileRef = useRef(null);

  // Form State (เฉพาะข้อมูลส่วนตัว ตัดการเปลี่ยนรหัสผ่านออกตามขอบเขต)
  const [name, setName] = useState(currentUser?.name || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [profilePicture, setProfilePicture] = useState(currentUser?.profile_picture || '');
  const [saving, setSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // In-app Notification Toast State
  const [toast, setToast] = useState(null); // { type: 'success' | 'error' | 'info', title: '', message: '' }

  const showToast = (type, title, message) => {
    setToast({ type, title, message });
  };

  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);
    return () => clearTimeout(timer);
  }, [toast]);

  const isGoogleUser = Boolean(currentUser?.google_id || currentUser?.is_google_user);

  // Sync state if user changes externally or on page mount
  useEffect(() => {
    const localUser = getUser();
    if (localUser) {
      setCurrentUser(localUser);
      setName(localUser.name || '');
      setEmail(localUser.email || '');
      setProfilePicture(localUser.profile_picture || '');
    }

    // ซิงค์ข้อมูลล่าสุดจากเซิร์ฟเวอร์เพื่อให้ได้สถานะ google_id ที่เป็นปัจจุบันเสมอ
    const fetchLatestProfile = async () => {
      try {
        const res = await api.get('/me');
        if (res.data) {
          const freshUser = { ...(localUser || {}), ...res.data };
          setSession(freshUser);
          setCurrentUser(freshUser);
          setName(freshUser.name || '');
          setEmail(freshUser.email || '');
          setProfilePicture(freshUser.profile_picture || '');
        }
      } catch (err) {
        // หากต่อ API ไม่ได้ ใช้ข้อมูลในเซสชันเดิม
      }
    };

    fetchLatestProfile();
  }, []);

  const isDirty = 
    name.trim() !== (currentUser?.name || '') ||
    (!isGoogleUser && email.trim().toLowerCase() !== (currentUser?.email || '').toLowerCase()) ||
    profilePicture !== (currentUser?.profile_picture || '');

  // จัดการอัปโหลดรูปภาพ
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('error', 'ไฟล์ไม่ถูกต้อง', 'กรุณาเลือกไฟล์รูปภาพ (JPG, PNG หรือ WebP)');
      return;
    }

    try {
      const data = await resizeImage(file);
      setProfilePicture(data);
      showToast('info', 'อัปโหลดรูปภาพแล้ว', 'อย่าลืมกด "บันทึกการเปลี่ยนแปลง" เพื่อบันทึกรูปใหม่');
    } catch {
      showToast('error', 'เกิดข้อผิดพลาด', 'ไม่สามารถประมวลผลไฟล์รูปภาพได้');
    } finally {
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  // ลบรูปโปรไฟล์
  const handleRemovePhoto = () => {
    setProfilePicture('');
    showToast('info', 'นำรูปโปรไฟล์ออกแล้ว', 'กด "บันทึกการเปลี่ยนแปลง" เพื่อยืนยันการใช้รูปตัวอักษรเริ่มต้น');
  };

  // คืนค่าเดิม
  const handleReset = () => {
    setName(currentUser?.name || '');
    setEmail(currentUser?.email || '');
    setProfilePicture(currentUser?.profile_picture || '');
    showToast('info', 'คืนค่าเดิมแล้ว', 'ข้อมูลในแบบฟอร์มถูกรีเซ็ตกลับเป็นค่าปัจจุบัน');
  };

  // เปิด Modal แจ้งเตือนยืนยันการเปลี่ยนข้อมูล
  const handleSave = (e) => {
    e.preventDefault();

    const trimmedName = name.trim();
    const trimmedEmail = isGoogleUser ? (currentUser?.email || email).trim().toLowerCase() : email.trim().toLowerCase();

    if (!trimmedName) {
      showToast('error', 'ข้อมูลไม่ครบถ้วน', 'กรุณาระบุชื่อผู้ใช้งาน');
      return;
    }

    if (!isGoogleUser && (!trimmedEmail || !EMAIL_RE.test(trimmedEmail))) {
      showToast('error', 'รูปแบบอีเมลไม่ถูกต้อง', 'กรุณาระบุอีเมลที่ถูกต้อง เช่น user@example.com');
      return;
    }

    setShowConfirmModal(true);
  };

  // ดำเนินการบันทึกข้อมูลเมื่อกดยืนยันใน Modal
  const confirmSave = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = isGoogleUser ? (currentUser?.email || email).trim().toLowerCase() : email.trim().toLowerCase();

    setSaving(true);
    try {
      const res = await api.put(`/members/${currentUser.id}`, {
        name: trimmedName,
        email: trimmedEmail,
        profile_picture: profilePicture || null,
      });

      // อัปเดตข้อมูลเซสชัน
      const updatedUser = res.data.user || {
        ...currentUser,
        name: trimmedName,
        email: trimmedEmail,
        profile_picture: profilePicture || null,
      };

      setSession(updatedUser);
      setCurrentUser(updatedUser);
      setEmail(updatedUser.email || trimmedEmail);
      setShowConfirmModal(false);

      showToast(
        'success',
        'บันทึกข้อมูลสำเร็จ!',
        'ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตเรียบร้อยแล้ว'
      );
    } catch (err) {
      showToast('error', 'บันทึกไม่สำเร็จ', errMsg(err, 'ไม่สามารถบันทึกข้อมูลส่วนตัวได้'));
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = currentUser?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-b from-rose-50/40 via-white to-slate-50 pt-28 pb-20 px-4 sm:px-6 md:px-8 font-sans selection:bg-pink-500 selection:text-white relative">
      
      {/* Toast Notification Layer (ระบบแจ้งเตือนแบบ In-App สวยงามทันสมัย) */}
      {toast && (
        <div className="fixed top-24 right-4 sm:right-8 z-[9999] max-w-sm w-full animate-in fade-in slide-in-from-top-4 duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-start gap-3.5 ${
            toast.type === 'success' 
              ? 'bg-emerald-50/95 border-emerald-200/80 text-emerald-900 shadow-emerald-500/10'
              : toast.type === 'error'
              ? 'bg-rose-50/95 border-rose-200/80 text-rose-900 shadow-rose-500/10'
              : 'bg-indigo-50/95 border-indigo-200/80 text-indigo-900 shadow-indigo-500/10'
          }`}>
            <div className={`p-2 rounded-xl shrink-0 ${
              toast.type === 'success' 
                ? 'bg-emerald-500 text-white'
                : toast.type === 'error'
                ? 'bg-rose-500 text-white'
                : 'bg-indigo-500 text-white'
            }`}>
              {toast.type === 'success' && <CheckCircle2 size={20} />}
              {toast.type === 'error' && <AlertCircle size={20} />}
              {toast.type === 'info' && <Sparkles size={20} />}
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

      <div className="max-w-2xl mx-auto">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between mb-6">
          <Link 
            to="/" 
            className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-pink-600 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/80"
          >
            <ArrowLeft size={16} /> กลับสู่หน้าหลัก
          </Link>
          
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-400">
            <span>หน้าหลัก</span>
            <span>/</span>
            <span className="text-pink-600 font-bold">ข้อมูลโปรไฟล์</span>
          </div>
        </div>

        {/* Main Profile Bento Card */}
        <div className="bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
          
          {/* Decorative Gradient Banner */}
          <div className="h-28 bg-gradient-to-r from-pink-500 via-rose-500 to-red-500 relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.25),transparent_60%)]" />
            <div className="absolute top-4 right-6 flex items-center gap-2">
              {isAdmin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-sm">
                  <ShieldCheck size={14} /> ผู้ดูแลระบบ (Admin)
                </span>
              )}
              {isGoogleUser ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" />
                  บัญชี Google
                </span>
              ) : !isAdmin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-white/20 text-white backdrop-blur-md border border-white/20 shadow-sm">
                  <Sparkles size={14} /> สมาชิกทั่วไป
                </span>
              )}
            </div>
          </div>

          <form onSubmit={handleSave} className="px-6 sm:px-10 pb-10">
            
            {/* Avatar Section (Floating over banner) */}
            <div className="flex flex-col items-center -mt-14 mb-8">
              <div className="relative group">
                <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full p-1 bg-white shadow-xl shadow-slate-200">
                  {profilePicture ? (
                    <img 
                      src={profilePicture} 
                      alt="Profile Avatar" 
                      className="w-full h-full rounded-full object-cover transition-transform group-hover:scale-105 duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center text-white text-4xl sm:text-5xl font-black shadow-inner">
                      {name ? name.charAt(0).toUpperCase() : 'U'}
                    </div>
                  )}
                </div>

                {/* Upload Button overlay */}
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="absolute bottom-1 right-1 bg-slate-900 hover:bg-pink-600 text-white p-2.5 rounded-full shadow-lg transition-all hover:scale-110 active:scale-95 border-2 border-white"
                  title="เปลี่ยนรูปโปรไฟล์"
                  aria-label="เปลี่ยนรูปโปรไฟล์"
                >
                  <Camera size={18} />
                </button>
                <input 
                  ref={fileRef} 
                  type="file" 
                  accept="image/*" 
                  onChange={handleFileChange} 
                  className="hidden" 
                />
              </div>

              {/* Photo Actions */}
              <div className="flex items-center gap-3 mt-3">
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className="text-xs font-bold text-slate-500 hover:text-pink-600 transition-colors px-2 py-1"
                >
                  อัปโหลดรูปใหม่
                </button>

                {profilePicture && (
                  <>
                    <span className="text-slate-300">•</span>
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="text-xs font-bold text-rose-500 hover:text-rose-700 flex items-center gap-1 transition-colors px-2 py-1"
                    >
                      <Trash2 size={13} /> ลบรูปภาพ
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Section Title */}
            <div className="border-b border-slate-100 pb-4 mb-6">
              <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
                <User className="text-pink-500" size={22} /> ข้อมูลส่วนตัว
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                จัดการชื่อที่แสดงและอีเมลที่ใช้สำหรับเข้าสู่ระบบ JP TRIP
              </p>
            </div>

            {/* Form Fields: Only Personal Info (No Password Fields) */}
            <div className="space-y-5">
              
              {/* Field: Name */}
              <div>
                <label className="block text-xs font-black text-slate-700 uppercase tracking-wider mb-2 ml-1">
                  ชื่อผู้ใช้งาน <span className="text-rose-500">*</span>
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-pink-500 transition-colors">
                    <User size={19} />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="เช่น สมชาย ใจดี หรือ Sam"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50/70 hover:bg-slate-50 border border-slate-200 rounded-2xl text-slate-800 text-sm font-medium outline-none focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {/* Field: Email */}
              <div>
                <div className="flex items-center justify-between mb-2 ml-1">
                  <label className="text-xs font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    อีเมลเข้าสู่ระบบ {!isGoogleUser && <span className="text-rose-500">*</span>}
                  </label>
                  {isGoogleUser && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200/80 shadow-xs">
                      <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                      </svg>
                      เข้าสู่ระบบด้วย Google (ล็อกอีเมล)
                    </span>
                  )}
                </div>
                <div className="relative group">
                  <div className={`absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none transition-colors ${isGoogleUser ? 'text-slate-400' : 'text-slate-400 group-focus-within:text-pink-500'}`}>
                    <Mail size={19} />
                  </div>
                  <input
                    type="email"
                    required
                    readOnly={isGoogleUser}
                    disabled={isGoogleUser}
                    value={email}
                    onChange={(e) => !isGoogleUser && setEmail(e.target.value)}
                    placeholder="name@example.com"
                    className={`w-full pl-11 pr-11 py-3.5 border rounded-2xl text-sm font-medium transition-all ${
                      isGoogleUser
                        ? 'bg-slate-100/90 border-slate-200 text-slate-500 cursor-not-allowed select-none shadow-inner'
                        : 'bg-slate-50/70 hover:bg-slate-50 border-slate-200 text-slate-800 outline-none focus:bg-white focus:border-pink-500 focus:ring-4 focus:ring-pink-500/10 placeholder:text-slate-400'
                    }`}
                  />
                  {isGoogleUser && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-400" title="บัญชี Google ไม่สามารถแก้ไขอีเมลได้">
                      <Lock size={17} className="text-amber-600/70" />
                    </div>
                  )}
                </div>
                {isGoogleUser ? (
                  <p className="text-[11px] text-amber-700/90 font-medium mt-1.5 ml-1 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block shrink-0" />
                    บัญชีนี้เข้าสู่ระบบผ่าน Google ไม่สามารถแก้ไขอีเมลได้ เพื่อความปลอดภัยและการเชื่อมต่อบัญชี
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400 mt-1.5 ml-1">
                    ใช้อีเมลนี้ในการเข้าสู่ระบบและรับข้อมูลข่าวสารการท่องเที่ยว
                  </p>
                )}
              </div>

            </div>

            {/* Bottom Action Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center gap-3">
              
              {isDirty && (
                <button
                  type="button"
                  onClick={handleReset}
                  disabled={saving}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl border border-slate-200 hover:bg-slate-50 text-slate-600 text-sm font-bold transition-all flex items-center justify-center gap-2 active:scale-95"
                >
                  <RotateCcw size={16} /> คืนค่าเดิม
                </button>
              )}

              <button
                type="submit"
                disabled={saving || !isDirty}
                className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 hover:from-pink-500 hover:to-rose-600 text-white font-bold text-sm shadow-lg shadow-pink-500/25 hover:shadow-pink-500/40 transition-all active:scale-[0.98] flex items-center justify-center gap-2.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังบันทึกข้อมูล...</span>
                  </>
                ) : (
                  <>
                    <Save size={18} />
                    <span>บันทึกการเปลี่ยนแปลง</span>
                  </>
                )}
              </button>

            </div>

          </form>

        </div>

      </div>

      {/* Confirmation Modal: แจ้งเตือนยืนยันการเปลี่ยนชื่อและข้อมูลส่วนตัว */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-[10000] bg-slate-950/60 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 sm:p-8 max-w-sm sm:max-w-md w-full shadow-2xl border border-slate-100 text-center relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              type="button"
              onClick={() => !saving && setShowConfirmModal(false)}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label="ปิดหน้าต่าง"
            >
              <X size={18} />
            </button>

            {/* Icon Banner */}
            <div className="w-16 h-16 rounded-3xl bg-pink-50 border border-pink-100 flex items-center justify-center text-pink-600 mx-auto mb-4 shadow-sm">
              <UserCheck size={32} />
            </div>

            {/* Title & Description */}
            <h3 className="text-xl font-black text-slate-900 tracking-tight mb-2">
              {name.trim() !== currentUser?.name ? 'ยืนยันการเปลี่ยนชื่อผู้ใช้งาน?' : 'ยืนยันการบันทึกข้อมูล?'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mb-5 leading-relaxed">
              กรุณาตรวจสอบการเปลี่ยนแปลงข้อมูลส่วนตัวของคุณก่อนกดยืนยัน
            </p>

            {/* Change Summary Card */}
            <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 text-left space-y-3 mb-6 text-xs sm:text-sm">
              {name.trim() !== currentUser?.name && (
                <div>
                  <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider mb-1">
                    ชื่อผู้ใช้งาน:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 line-through bg-slate-200/60 px-2 py-0.5 rounded-lg text-xs">
                      {currentUser?.name || '-'}
                    </span>
                    <span className="text-slate-400 text-xs">➔</span>
                    <span className="font-bold text-pink-600 bg-pink-50 px-2.5 py-0.5 rounded-lg border border-pink-100 text-xs">
                      {name.trim()}
                    </span>
                  </div>
                </div>
              )}

              {!isGoogleUser && email.trim().toLowerCase() !== currentUser?.email?.toLowerCase() && (
                <div>
                  <span className="text-slate-400 font-bold block text-[11px] uppercase tracking-wider mb-1">
                    อีเมล:
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-slate-400 line-through bg-slate-200/60 px-2 py-0.5 rounded-lg text-xs">
                      {currentUser?.email || '-'}
                    </span>
                    <span className="text-slate-400 text-xs">➔</span>
                    <span className="font-bold text-slate-800 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200 text-xs">
                      {email.trim().toLowerCase()}
                    </span>
                  </div>
                </div>
              )}

              {profilePicture !== (currentUser?.profile_picture || '') && (
                <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                  <span className="text-slate-500 text-xs font-semibold">รูปภาพโปรไฟล์:</span>
                  <span className="text-xs font-bold text-pink-600">
                    {profilePicture ? 'อัปเดตรูปใหม่' : 'ใช้รูปเริ่มต้น'}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={saving}
                className="flex-1 py-3 px-5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all active:scale-95 disabled:opacity-50"
              >
                ยกเลิก
              </button>

              <button
                type="button"
                onClick={confirmSave}
                disabled={saving}
                className="flex-1 py-3 px-5 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-red-500 hover:from-pink-500 hover:to-rose-600 text-white font-black text-xs sm:text-sm shadow-lg shadow-pink-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>กำลังบันทึก...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 size={16} />
                    <span>ยืนยันการเปลี่ยน</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;
