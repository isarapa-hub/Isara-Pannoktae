import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { LogOut, X } from 'lucide-react';

const LogoutConfirmModal = ({ isOpen, onClose, onConfirm, userName }) => {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[10005] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2.2rem] w-full max-w-sm p-6 sm:p-7 shadow-2xl border border-slate-100 text-center space-y-5 animate-scaleUp relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title="ปิด"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 mx-auto rounded-3xl bg-rose-50 text-rose-500 border-4 border-rose-100/80 flex items-center justify-center shadow-inner">
          <LogOut size={28} className="stroke-[2.5] ml-0.5" />
        </div>

        {/* Content */}
        <div className="space-y-1.5">
          <h3 className="text-xl font-black text-slate-900">
            ยืนยันการออกจากระบบ
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 font-medium leading-relaxed">
            {userName ? (
              <>
                คุณต้องการออกจากระบบบัญชี <span className="font-bold text-slate-800">"{userName}"</span> ใช่หรือไม่?
              </>
            ) : (
              'คุณต้องการออกจากระบบใช่หรือไม่? คุณจะต้องเข้าสู่ระบบใหม่อีกครั้งเพื่อเข้าถึงข้อมูลของคุณ'
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs sm:text-sm transition-all"
          >
            ยกเลิก
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-3 px-4 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-lg shadow-rose-600/30 transition-all flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
          >
            <LogOut size={16} />
            <span>ออกจากระบบ</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default LogoutConfirmModal;
