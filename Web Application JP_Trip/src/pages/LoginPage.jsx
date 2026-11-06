import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  HelpCircle,
  X,
  ExternalLink,
  Send,
  Clock,
  KeyRound,
  Copy,
  Check,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import api, { errMsg } from '../connectAPI/axios';
import { setSession } from '../utils/auth';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [toast, setToast] = useState(null);

  // Modal สมาชิกแจ้งลืมรหัสผ่าน & อนุมัติโดยตรง (TC: N-001)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotTab, setForgotTab] = useState('request'); // 'request' | 'status'
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotReason, setForgotReason] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState(null);
  const [requestStatusData, setRequestStatusData] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  // สมาชิกตั้งรหัสผ่านใหม่หลังจากแอดมินอนุมัติ
  const [resetNewPassword, setResetNewPassword] = useState('');
  const [resetConfirmPassword, setResetConfirmPassword] = useState('');
  const [showResetPass, setShowResetPass] = useState(false);
  const [showResetConfirmPass, setShowResetConfirmPass] = useState(false);
  const [resetSubmitting, setResetSubmitting] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/login', { email, password });
      const userData = res.data.user;
      setSession(userData, res.data.token);

      setToast({
        title: 'เข้าสู่ระบบสำเร็จแล้ว!',
        description: `ยินดีต้อนรับคุณ ${userData.name || ''} เข้าสู่ระบบเรียบร้อย`,
      });

      const from = location.state?.from;
      setTimeout(() => {
        navigate(userData.role === 'admin' ? '/admin/dashboard' : from || '/', { replace: true });
      }, 1200);
    } catch (err) {
      setError(errMsg(err, 'อีเมลหรือรหัสผ่านไม่ถูกต้อง'));
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    setLoading(true);
    setError(null);

    try {
      const res = await api.post('/auth/google', {
        token: credentialResponse.credential,
      });

      const userData = res.data.user;
      setSession(userData, res.data.token || credentialResponse.credential);

      setToast({
        title: 'เข้าสู่ระบบด้วย Google สำเร็จแล้ว!',
        description: `ยินดีต้อนรับคุณ ${userData.name || ''} เข้าสู่ระบบเรียบร้อย`,
      });

      const from = location.state?.from;
      setTimeout(() => {
        navigate(userData.role === 'admin' ? '/admin/dashboard' : from || '/', { replace: true });
      }, 1200);
    } catch (err) {
      setError(errMsg(err, 'เข้าสู่ระบบด้วย Google ไม่สำเร็จ'));
      console.error(err);
      setLoading(false);
    }
  };

  const handleOpenForgot = () => {
    setForgotEmail(email || '');
    setForgotReason('');
    setForgotMsg(null);
    setRequestStatusData(null);
    setForgotTab('request');
    setShowForgotModal(true);
  };

  const handleSendForgotRequest = async (e) => {
    e.preventDefault();
    if (!forgotEmail) return;
    setForgotLoading(true);
    setForgotMsg(null);
    try {
      const res = await api.post('/auth/forgot-password', {
        email: forgotEmail,
        reason: forgotReason,
      });
      setForgotMsg({
        type: 'success',
        text: res.data.message || 'ส่งคำขอแจ้งลืมรหัสผ่านไปยังผู้ดูแลระบบเรียบร้อยแล้ว!',
      });
      // ดึงสถานะทันทีเพื่อแสดงให้ผู้ใช้ทราบ
      try {
        const statusRes = await api.get('/auth/forgot-password/status', {
          params: { email: forgotEmail },
        });
        setRequestStatusData(statusRes.data);
      } catch (_) { }
      setForgotTab('status');
    } catch (err) {
      setForgotMsg({
        type: 'error',
        text: errMsg(err, 'ไม่สามารถส่งคำขอได้ กรุณาตรวจสอบอีเมลอีกครั้ง'),
      });
    } finally {
      setForgotLoading(false);
    }
  };

  const handleCheckForgotStatus = async (lookupEmail) => {
    const targetEmail = (lookupEmail || forgotEmail || '').trim();
    if (!targetEmail) {
      setForgotMsg({ type: 'error', text: 'กรุณากรอกอีเมลเพื่อตรวจสอบสถานะ' });
      return;
    }
    setCheckingStatus(true);
    setForgotMsg(null);
    try {
      const res = await api.get('/auth/forgot-password/status', {
        params: { email: targetEmail },
      });
      setRequestStatusData(res.data);
    } catch (err) {
      setRequestStatusData(null);
      setForgotMsg({
        type: 'error',
        text: errMsg(err, 'ยังไม่พบคำขอแจ้งลืมรหัสผ่านสำหรับอีเมลนี้'),
      });
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleUseTempPassword = (emailVal, passVal) => {
    setEmail(emailVal);
    setPassword(passVal);
    setShowForgotModal(false);
    setToast({
      title: 'กรอกรหัสผ่านชั่วคราวแล้ว',
      description: 'กดปุ่มเข้าสู่ระบบเพื่อใช้งานได้ทันที',
    });
  };

  const handleCopyTempPass = (text) => {
    navigator.clipboard?.writeText(text);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 2000);
  };

  const handleResetPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!resetNewPassword || resetNewPassword.length < 8) {
      setForgotMsg({ type: 'error', text: 'รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร' });
      return;
    }
    if (resetNewPassword !== resetConfirmPassword) {
      setForgotMsg({ type: 'error', text: 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน' });
      return;
    }

    setResetSubmitting(true);
    setForgotMsg(null);
    try {
      await api.post('/auth/reset-password', {
        email: requestStatusData.email,
        new_password: resetNewPassword,
      });

      setEmail(requestStatusData.email);
      setPassword(resetNewPassword);
      setShowForgotModal(false);
      setResetNewPassword('');
      setResetConfirmPassword('');
      setToast({
        title: 'ตั้งรหัสผ่านใหม่สำเร็จแล้ว!',
        description: 'ระบบกรอกข้อมูลให้เรียบร้อย กรุณากดปุ่ม "เข้าสู่ระบบ"',
      });
    } catch (err) {
      setForgotMsg({
        type: 'error',
        text: errMsg(err, 'ไม่สามารถตั้งรหัสผ่านใหม่ได้ กรุณาลองใหม่อีกครั้ง'),
      });
    } finally {
      setResetSubmitting(false);
    }
  };

  return (
    <GoogleOAuthProvider clientId="835024398017-pqbc272voobi6vc2jilhf8cf1hd0rds3.apps.googleusercontent.com">
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-[#270815] to-[#17050d] px-4 py-12 relative overflow-hidden font-sans">
        {/* Toast แจ้งเตือนเมื่อเข้าสู่ระบบสำเร็จ */}
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

        {/* Card Login */}
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
              เข้าสู่ระบบ
            </h1>
            <p className="text-gray-500 text-xs sm:text-sm font-semibold mt-1.5">
              ยินดีต้อนรับกลับ! เข้าสู่ระบบเพื่อเริ่มวางแผนทริป
            </p>
          </div>

          {/* Inline Error Message */}
          {error && (
            <div className="flex items-center gap-2.5 p-3.5 bg-rose-50 border border-rose-200 text-rose-600 rounded-2xl text-xs font-bold mb-5">
              <AlertCircle size={16} className="shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleLogin} className="space-y-4">
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
                  placeholder="your@email.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-gray-50/80 hover:bg-gray-50 border border-gray-200/80 rounded-2xl outline-none focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 transition-all font-semibold text-sm text-gray-800 placeholder-gray-400"
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5 ml-1">
                <label className="text-xs font-black text-gray-700 uppercase tracking-wider">
                  รหัสผ่าน
                </label>
                <button
                  type="button"
                  onClick={handleOpenForgot}
                  className="text-xs font-bold text-pink-600 hover:text-rose-700 hover:underline transition-colors cursor-pointer"
                >
                  ลืมรหัสผ่าน?
                </button>
              </div>
              <div className="relative group">
                <Lock
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-pink-600 transition-colors"
                  size={19}
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 hover:from-pink-500 hover:to-red-500 text-white py-3.5 px-6 rounded-2xl font-black text-sm shadow-lg shadow-pink-500/30 hover:shadow-pink-500/50 hover:scale-[1.01] active:scale-95 transition-all flex items-center justify-center gap-2 mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>กำลังเข้าสู่ระบบ...</span>
                </>
              ) : (
                <>
                  <span>เข้าสู่ระบบ</span>
                  <ArrowRight size={17} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6 gap-3">
            <div className="flex-1 h-[1px] bg-gray-200" />
            <span className="text-gray-400 text-[11px] font-bold uppercase tracking-wider">
              หรือเข้าสู่ระบบด้วย
            </span>
            <div className="flex-1 h-[1px] bg-gray-200" />
          </div>

          {/* Google Login Button */}
          <div className="flex justify-center w-full [&>div]:w-full">
            <GoogleLogin
              onSuccess={handleGoogleSuccess}
              onError={() => setError('การเข้าสู่ระบบด้วย Google ผิดพลาด')}
              text="signin_with"
              shape="pill"
              size="large"
            />
          </div>

          {/* Footer Link */}
          <div className="mt-8 text-center text-xs font-semibold text-gray-500">
            ยังไม่เป็นสมาชิก?{' '}
            <Link
              to="/register"
              className="text-pink-600 font-black hover:text-rose-700 transition-colors ml-1"
            >
              สมัครสมาชิกตอนนี้
            </Link>
          </div>
        </div>

        {/* Modal: สมาชิกแจ้งลืมรหัสผ่าน & อนุมัติโดยตรง (ตารางที่ 4-14 / TC: N-001) */}
        {showForgotModal && (
          <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
            <div className="bg-white rounded-[2.5rem] p-6 sm:p-8 max-w-lg w-full shadow-2xl border border-slate-100 text-left relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label="ปิดหน้าต่าง"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 text-amber-600 flex items-center justify-center shrink-0 shadow-sm">
                  <KeyRound size={26} />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                    บริการช่วยเหลือกรณีลืมรหัสผ่าน
                  </h3>
                </div>
              </div>

              {/* Tabs Switcher */}
              <div className="flex p-1 bg-slate-100 rounded-2xl mb-5">
                <button
                  type="button"
                  onClick={() => {
                    setForgotTab('request');
                    setForgotMsg(null);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${forgotTab === 'request'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <Send size={15} /> ส่งคำขอถึงผู้ดูแลระบบ
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setForgotTab('status');
                    setForgotMsg(null);
                    if (forgotEmail) handleCheckForgotStatus(forgotEmail);
                  }}
                  className={`flex-1 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 ${forgotTab === 'status'
                      ? 'bg-white text-slate-900 shadow-sm'
                      : 'text-slate-500 hover:text-slate-800'
                    }`}
                >
                  <Clock size={15} /> ตรวจสอบสถานะการอนุมัติ
                </button>
              </div>

              {/* Alert message if any */}
              {forgotMsg && (
                <div
                  className={`mb-4 p-4 rounded-2xl text-xs sm:text-sm font-bold flex items-center gap-2.5 ${forgotMsg.type === 'success'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                >
                  {forgotMsg.type === 'success' ? (
                    <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
                  ) : (
                    <AlertCircle size={18} className="shrink-0 text-rose-600" />
                  )}
                  <span>{forgotMsg.text}</span>
                </div>
              )}

              {/* TAB 1: ส่งคำขอถึงผู้ดูแลระบบ */}
              {forgotTab === 'request' && (
                <form onSubmit={handleSendForgotRequest} className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    กรอกอีเมลที่ท่านใช้ลงทะเบียนในระบบเพื่อส่งคำขอแจ้งลืมรหัสผ่าน ทางผู้ดูแลระบบจะเข้าค้นหา ตรวจสอบข้อมูลบัญชี และอนุมัติรหัสผ่านใหม่ให้ท่านโดยตรง
                  </p>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      อีเมลบัญชีของคุณ <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative group">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-pink-600 transition-colors"
                        size={19}
                      />
                      <input
                        type="email"
                        required
                        placeholder="your@email.com"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 font-semibold text-sm text-slate-800"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-800 mb-1.5">
                      เหตุผลหรือข้อความเพิ่มเติม (ถ้ามี)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="เช่น จำรหัสผ่านเดิมไม่ได้, ขอรับรหัสผ่านชั่วคราวทางระบบ"
                      value={forgotReason}
                      onChange={(e) => setForgotReason(e.target.value)}
                      className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl outline-none focus:border-pink-500 focus:bg-white focus:ring-4 focus:ring-pink-500/10 font-medium text-sm text-slate-800 resize-none"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 via-rose-600 to-red-600 hover:from-pink-500 hover:to-red-500 text-white font-bold text-sm shadow-md shadow-pink-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    {forgotLoading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        <span>กำลังส่งคำขอ...</span>
                      </>
                    ) : (
                      <>
                        <Send size={16} />
                        <span>ส่งคำขอแจ้งลืมรหัสผ่านให้ผู้ดูแลระบบ</span>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* TAB 2: ตรวจสอบสถานะการอนุมัติ */}
              {forgotTab === 'status' && (
                <div className="space-y-4">
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    ตรวจสอบสถานะคำขอแจ้งลืมรหัสผ่านของคุณ หากผู้ดูแลระบบอนุมัติแล้ว คุณจะได้รับรหัสผ่านชั่วคราวเพื่อเข้าสู่ระบบ
                  </p>

                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Mail
                        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
                        size={19}
                      />
                      <input
                        type="email"
                        placeholder="กรอกอีเมลเพื่อตรวจสอบ"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        className="w-full pl-11 pr-3 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold outline-none focus:border-pink-500"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCheckForgotStatus(forgotEmail)}
                      disabled={checkingStatus}
                      className="px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-sm font-bold flex items-center gap-1.5 transition-colors shrink-0 disabled:opacity-60"
                    >
                      {checkingStatus ? <Loader2 size={16} className="animate-spin" /> : <RefreshCw size={16} />}
                      <span>ตรวจสอบ</span>
                    </button>
                  </div>

                  {requestStatusData && (
                    <div className="p-4 rounded-2xl border bg-slate-50/70 border-slate-200 space-y-3">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
                        <div>
                          <p className="text-sm font-bold text-slate-800">{requestStatusData.name}</p>
                          <p className="text-xs text-slate-400 font-mono">{requestStatusData.email}</p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 ${requestStatusData.status === 'completed'
                              ? 'bg-blue-100 text-blue-700 border border-blue-300'
                              : requestStatusData.status === 'approved'
                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-300'
                                : requestStatusData.status === 'rejected'
                                  ? 'bg-rose-100 text-rose-700 border border-rose-300'
                                  : 'bg-amber-100 text-amber-800 border border-amber-300'
                            }`}
                        >
                          {requestStatusData.status === 'completed' && <CheckCircle2 size={14} />}
                          {requestStatusData.status === 'approved' && <CheckCircle2 size={14} />}
                          {requestStatusData.status === 'rejected' && <AlertCircle size={14} />}
                          {requestStatusData.status === 'pending' && <Clock size={14} />}
                          {requestStatusData.status === 'completed'
                            ? 'ตั้งรหัสใหม่แล้ว'
                            : requestStatusData.status === 'approved'
                              ? 'อนุมัติแล้ว'
                              : requestStatusData.status === 'rejected'
                                ? 'ถูกปฏิเสธ'
                                : 'รอผู้ดูแลระบบอนุมัติ'}
                        </span>
                      </div>

                      {requestStatusData.status === 'approved' ? (
                        <form
                          onSubmit={handleResetPasswordSubmit}
                          className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-slate-800 space-y-3"
                        >
                          <div className="flex items-center gap-2 text-sm font-bold text-emerald-800">
                            <ShieldCheck size={18} className="text-emerald-600" />
                            <span>ผู้ดูแลระบบอนุมัติแล้ว! กำหนดรหัสผ่านใหม่ของคุณ:</span>
                          </div>

                          {/* รหัสผ่านใหม่ */}
                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                              รหัสผ่านใหม่ (อย่างน้อย 8 ตัวอักษร):
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input
                                type={showResetPass ? 'text' : 'password'}
                                required
                                minLength={8}
                                placeholder="กรอกรหัสผ่านใหม่อย่างน้อย 8 ตัวอักษร"
                                value={resetNewPassword}
                                onChange={(e) => setResetNewPassword(e.target.value)}
                                className="w-full pl-9 pr-9 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-400 text-slate-900"
                              />
                              <button
                                type="button"
                                onClick={() => setShowResetPass(!showResetPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showResetPass ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </div>

                          {/* ยืนยันรหัสผ่านใหม่ */}
                          <div>
                            <label className="block text-xs sm:text-sm font-bold text-slate-700 mb-1">
                              ยืนยันรหัสผ่านใหม่อีกครั้ง:
                            </label>
                            <div className="relative">
                              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                              <input
                                type={showResetConfirmPass ? 'text' : 'password'}
                                required
                                minLength={8}
                                placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                                value={resetConfirmPassword}
                                onChange={(e) => setResetConfirmPassword(e.target.value)}
                                className="w-full pl-9 pr-9 py-2.5 bg-white border border-emerald-300 rounded-xl text-sm font-semibold outline-none focus:ring-2 focus:ring-emerald-400 text-slate-900"
                              />
                              <button
                                type="button"
                                onClick={() => setShowResetConfirmPass(!showResetConfirmPass)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                              >
                                {showResetConfirmPass ? <EyeOff size={15} /> : <Eye size={15} />}
                              </button>
                            </div>
                          </div>

                          <button
                            type="submit"
                            disabled={resetSubmitting}
                            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all disabled:opacity-60"
                          >
                            {resetSubmitting ? (
                              <>
                                <Loader2 size={16} className="animate-spin" />
                                <span>กำลังบันทึกรหัสผ่านใหม่...</span>
                              </>
                            ) : (
                              <>
                                <CheckCircle2 size={16} />
                                <span>บันทึกรหัสผ่านใหม่และไปที่หน้าเข้าสู่ระบบ</span>
                              </>
                            )}
                          </button>
                        </form>
                      ) : requestStatusData.status === 'completed' ? (
                        <div className="p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 space-y-2.5">
                          <div className="flex items-center gap-2 text-sm font-bold text-blue-800">
                            <CheckCircle2 size={18} className="text-blue-600" />
                            <span>คุณได้ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว!</span>
                          </div>
                          <p className="text-xs sm:text-sm text-blue-700 leading-relaxed">
                            คำขอนี้ได้รับการตั้งรหัสผ่านใหม่เสร็จสมบูรณ์ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ของคุณได้ทันที
                          </p>
                          <button
                            type="button"
                            onClick={() => {
                              setEmail(requestStatusData.email);
                              setShowForgotModal(false);
                            }}
                            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center gap-1.5 shadow-sm transition-colors"
                          >
                            <span>ไปที่หน้าเข้าสู่ระบบ</span>
                            <ArrowRight size={16} />
                          </button>
                        </div>
                      ) : requestStatusData.status === 'rejected' ? (
                        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm">
                          <p className="font-bold">คำขอแจ้งลืมรหัสผ่านถูกปฏิเสธ</p>
                          <p className="text-xs sm:text-sm text-rose-600 mt-1">
                            ข้อมูลบัญชีไม่ตรงกับฐานข้อมูล กรุณาตรวจสอบอีเมลหรือติดต่อผู้ดูแลระบบโดยตรง
                          </p>
                        </div>
                      ) : (
                        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-1">
                          <p className="font-bold flex items-center gap-1.5">
                            <Clock size={16} className="text-amber-600" />
                            <span>คำขอของคุณอยู่ระหว่างรอผู้ดูแลระบบตรวจสอบและอนุมัติ</span>
                          </p>
                          <p className="text-xs sm:text-sm text-amber-700 leading-relaxed">
                            ระบบได้บันทึกคำขอของคุณแล้ว เมื่อผู้ดูแลระบบอนุมัติ คุณจะสามารถกลับมากำหนดรหัสผ่านใหม่ได้ที่หน้านี้
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    </GoogleOAuthProvider>
  );
};

export default LoginPage;