import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Heart, Calendar, X, LogIn, UserPlus, MapPin, Sparkles, ShieldAlert } from 'lucide-react';
import { categoryLabel, FALLBACK_IMG } from '../utils/constants';

const LoginPromptModal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [promptData, setPromptData] = useState(null);

  useEffect(() => {
    const handlePrompt = (e) => {
      setPromptData(e.detail || {});
    };

    window.addEventListener('open-login-prompt', handlePrompt);
    return () => window.removeEventListener('open-login-prompt', handlePrompt);
  }, []);

  if (!promptData) return null;

  const { place, reason = 'favorite' } = promptData;

  const handleClose = () => {
    setPromptData(null);
  };

  const handleLogin = () => {
    handleClose();
    navigate('/login', { state: { from: location.pathname } });
  };

  const handleRegister = () => {
    handleClose();
    navigate('/register', { state: { from: location.pathname } });
  };

  const isFavorite = reason === 'favorite';

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-[2.5rem] w-full max-w-md p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Decorative Top Accent Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 rounded-full bg-rose-500/15 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full bg-pink-500/15 blur-2xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          title="ปิด"
        >
          <X size={20} />
        </button>

        {/* Floating Icon with Soft Glow */}
        <div className="mx-auto mb-5 w-16 h-16 rounded-3xl bg-gradient-to-tr from-rose-500 to-pink-500 text-white flex items-center justify-center shadow-xl shadow-rose-500/30">
          {isFavorite ? (
            <Heart size={32} className="fill-white" />
          ) : (
            <Calendar size={30} />
          )}
        </div>

        {/* Header Text - ตัวหนังสือชัดเจน ขนาดกำลังพอดี สบายตา */}
        <div className="space-y-2 mb-6">
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            {isFavorite ? 'เข้าสู่ระบบเพื่อบันทึกรายการโปรด' : 'เข้าสู่ระบบเพื่อวางแผนทริป'}
          </h3>
          <p className="text-sm text-slate-500 leading-relaxed font-medium px-2">
            {isFavorite
              ? 'คุณต้องเข้าสู่ระบบสมาชิกก่อน จึงจะสามารถกดบันทึกสถานที่ลงในรายการโปรดและซิงก์ข้อมูลทริปได้'
              : 'เข้าสู่ระบบเพื่อจัดสรรสถานที่ท่องเที่ยวลงในตารางการเดินทางของคุณ'}
          </p>
        </div>

        {/* Mini Preview of the Place (ถ้ามีสถานที่ส่งมา) */}
        {place && (
          <div className="mb-6 p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center gap-3.5 text-left">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 shadow-xs">
              <img
                src={place.image_url || FALLBACK_IMG}
                onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
                alt={place.name}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-black text-rose-600 uppercase tracking-wider truncate">
                {categoryLabel(place.category)}
              </div>
              <h4 className="text-sm font-black text-slate-800 truncate">
                {place.name}
              </h4>
              {place.province && (
                <div className="text-xs text-slate-400 font-medium flex items-center gap-1 mt-0.5">
                  <MapPin size={11} className="text-rose-500" />
                  <span>{place.province}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2.5">
          {/* Button 1: เข้าสู่ระบบ */}
          <button
            type="button"
            onClick={handleLogin}
            className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm shadow-lg shadow-rose-500/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01] active:scale-[0.99]"
          >
            <LogIn size={18} />
            <span>เข้าสู่ระบบทันที</span>
          </button>

          {/* Button 2: สมัครสมาชิกใหม่ */}
          <button
            type="button"
            onClick={handleRegister}
            className="w-full py-3 px-6 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-sm transition-all flex items-center justify-center gap-2"
          >
            <UserPlus size={17} />
            <span>ยังไม่มีบัญชี? สมัครสมาชิก</span>
          </button>

          {/* Button 3: ปิดหน้าต่าง */}
          <button
            type="button"
            onClick={handleClose}
            className="w-full py-2.5 text-xs text-slate-400 hover:text-slate-600 font-bold transition-colors"
          >
            ไว้คราวหน้า (ปิดหน้าต่าง)
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPromptModal;
