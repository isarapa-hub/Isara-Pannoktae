import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Eye, EyeOff, Loader2, ArrowLeft, ArrowRight, AlertCircle, CheckCircle2 } from 'lucide-react';
import api, { errMsg } from '../connectAPI/axios';

const RegisterPage = () => {
  const [formData, setFormData] = useState({
    fullname: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError(null);

    if (formData.password.length < 8) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 8 ตัวอักษร');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/register', {
        fullname: formData.fullname,
        email: formData.email,
        password: formData.password,
      });

      if (response.status === 201) {
        setToast({
          title: 'สมัครสมาชิกสำเร็จแล้ว!',
          description: 'สร้างบัญชีผู้ใช้งานเรียบร้อย กำลังพาไปหน้าเข้าสู่ระบบ...',
        });
        setTimeout(() => {
          navigate('/login');
        }, 1300);
      }
    } catch (err) {
      setError(errMsg(err, 'การสมัครสมาชิกไม่สำเร็จ กรุณาลองใหม่อีกครั้ง'));
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#270815] to-[#17050d] px-4 py-12 relative overflow-hidden font-sans">
      {/* Toast แจ้งเตือนเมื่อสมัครสมาชิกสำเร็จ */}
      {toast && (
        <div className="fixed top-24 right-6 md:right-8 z-[200] bg-slate-900/95 text-white px-5 py-3.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-pink-500/40 backdrop-blur-xl animate-bounce">
          <CheckCircle2 size={22} className="text-emerald-400 shrink-0" />
          <div>
            <p className="text-xs font-bold">{toast.title}</p>
            <p className="text-[11px] text-slate-400">{toast.description}</p>
          </div>
        </div>
      )}
      {/* Floating Ambient Glow Orbs */}
      <div className="absolute top-[-12%] left-[-10%] w-96 h-96 bg-pink-600/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-[-12%] right-[-10%] w-96 h-96 bg-rose-600/25 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-red-500/10 rounded-full blur-[150px] pointer-events-none" />

      {/* Back to Home Button */}
      <Link
        to="/"
        className="absolute top-6 left-6 md:top-8 md:left-8 flex items-center gap-2 text-white/80 hover:text-white transition-colors text-xs font-bold bg-white/10 hover:bg-white/15 backdrop-blur-md px-4 py-2 rounded-full border border-white/10 z-20 shadow-sm"
      >
        <ArrowLeft size={15} /> กลับหน้าหลัก
      </Link>

      {/* Card Register */}
      <div className="bg-white/95 backdrop-blur-2xl p-8 sm:p-10 md:p-11 rounded-[2.5rem] shadow-[0_25px_60px_rgba(0,0,0,0.4)] w-full max-w-md z-10 border border-white/40 relative">
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-block transition-transform hover:scale-105 mb-4 group">
            <img
              src="/logo.png"
              alt="JP TRIP Logo"
              className="h-24 sm:h-28 w-auto mx-auto object-contain drop-shadow-md group-hover:brightness-105 transition-all"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            สร้างบัญชีใหม่
          </h1>
          <p className="text-gray-500 text-xs sm:text-sm font-semibold mt-1.5">
            เริ่มต้นวางแผนการท่องเที่ยวญี่ปุ่นของคุณได้ทันที
          </p>
        </div>

        {/* Inline Feedback Alerts */}
        {error && (
          <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold mb-5">
            <AlertCircle size={16} className="shrink-0 text-rose-500" />
            <span>{error}</span>
          </div>
        )}

        {/* Register Form */}
        <form onSubmit={handleRegister} className="space-y-4">
          {/* Input: Full Name */}
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
              ชื่อผู้ใช้งาน
            </label>
            <div className="relative group">
              <User
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors"
                size={19}
              />
              <input
                type="text"
                name="fullname"
                required
                value={formData.fullname}
                onChange={handleChange}
                placeholder="ชื่อของคุณ"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-2xl outline-none focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 transition-all font-semibold text-sm text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Input: Email */}
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
              อีเมล
            </label>
            <div className="relative group">
              <Mail
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors"
                size={19}
              />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-2xl outline-none focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 transition-all font-semibold text-sm text-gray-800 placeholder-gray-400"
              />
            </div>
          </div>

          {/* Input: Password */}
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
              รหัสผ่าน
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors"
                size={19}
              />
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                required
                value={formData.password}
                onChange={handleChange}
                placeholder="อย่างน้อย 8 ตัวอักษร"
                className="w-full pl-11 pr-11 py-3.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-2xl outline-none focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 transition-all font-semibold text-sm text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                tabIndex={-1}
                aria-label="สลับการมองเห็นรหัสผ่าน"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Input: Confirm Password */}
          <div>
            <label className="block text-xs font-black text-gray-700 uppercase tracking-wider mb-1.5 ml-1">
              ยืนยันรหัสผ่าน
            </label>
            <div className="relative group">
              <Lock
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors"
                size={19}
              />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                name="confirmPassword"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="ยืนยันรหัสผ่านอีกครั้ง"
                className="w-full pl-11 pr-11 py-3.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-2xl outline-none focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 transition-all font-semibold text-sm text-gray-800 placeholder-gray-400"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 transition-colors"
                tabIndex={-1}
                aria-label="สลับการมองเห็นยืนยันรหัสผ่าน"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || Boolean(toast)}
            className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 hover:from-pink-500 hover:to-red-500 text-white py-3.5 px-6 rounded-2xl font-black text-sm shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>กำลังลงทะเบียน...</span>
              </>
            ) : (
              <>
                <span>สมัครสมาชิก</span>
                <ArrowRight size={17} />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-8 text-center text-xs font-semibold text-gray-500">
          มีบัญชีผู้ใช้งานแล้ว?{' '}
          <Link
            to="/login"
            className="text-pink-600 font-black hover:text-rose-700 transition-colors ml-1"
          >
            เข้าสู่ระบบที่นี่
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;