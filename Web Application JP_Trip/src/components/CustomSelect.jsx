import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * CustomSelect - โมเดิร์นดรอปดาวน์สไตล์ญี่ปุ่นสวยหรู
 * ปรับแต่งเพื่อแทนที่ Native Select ที่หน้าตาไม่สวยงาม
 * รองรับทั้ง Form Input และ Filter ทั่วไป
 */
export default function CustomSelect({
  name,
  value,
  onChange,
  options = [],
  placeholder = 'เลือกรายการ...',
  icon: Icon,
  className = '',
  size = 'md', // 'sm' | 'md'
  disabled = false,
  required = false,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef(null);

  // แปลง options ให้เป็นรูปแบบมาตรฐาน { value, label, icon, badge }
  const normalizedOptions = options.map((opt) => {
    if (typeof opt === 'object' && opt !== null) {
      return {
        value: opt.value !== undefined ? opt.value : opt.label,
        label: opt.label !== undefined ? opt.label : opt.value,
        icon: opt.icon,
        badge: opt.badge,
      };
    }
    return { value: opt, label: opt };
  });

  const selectedOption = normalizedOptions.find(
    (o) => String(o.value) === String(value)
  );

  // ปิด Dropdown เมื่อคลิกนอกพื้นที่หรือกดปุ่ม Escape
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const handleSelect = (optionValue) => {
    if (disabled) return;
    setIsOpen(false);
    if (onChange) {
      onChange({
        target: {
          name,
          value: optionValue,
        },
      });
    }
  };

  const isSmall = size === 'sm';

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      {/* Hidden input สำหรับ HTML Form Validation */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={value || ''}
          required={required}
        />
      )}

      {/* Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full flex items-center justify-between text-left transition-all duration-200 cursor-pointer shadow-sm ${
          isSmall
            ? 'px-3.5 py-2.5 rounded-2xl text-xs font-bold'
            : 'px-4 py-3 rounded-2xl text-sm font-medium'
        } ${
          isOpen
            ? 'bg-white border-pink-500 ring-2 ring-pink-100 shadow-md'
            : 'bg-slate-50 hover:bg-white border-slate-200 hover:border-slate-300'
        } border ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5 min-w-0 pr-2">
          {Icon && (
            <Icon
              size={isSmall ? 14 : 16}
              className={`shrink-0 transition-colors ${
                isOpen ? 'text-pink-600' : 'text-slate-400'
              }`}
            />
          )}

          {selectedOption && selectedOption.value !== '' ? (
            <span className="truncate flex items-center gap-1.5 text-slate-800 font-bold">
              {selectedOption.icon && (
                <span className="shrink-0">{selectedOption.icon}</span>
              )}
              <span>{selectedOption.label}</span>
              {selectedOption.badge && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-pink-100 text-pink-700 font-extrabold">
                  {selectedOption.badge}
                </span>
              )}
            </span>
          ) : (
            <span className="truncate text-slate-400 font-medium">
              {placeholder}
            </span>
          )}
        </div>

        <ChevronDown
          size={isSmall ? 14 : 16}
          className={`shrink-0 text-slate-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-pink-600' : ''
          }`}
        />
      </button>

      {/* Dropdown Menu Popup */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-[100010] bg-white/95 backdrop-blur-xl border border-slate-200/90 rounded-2xl shadow-2xl shadow-slate-900/15 p-1.5 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
          <ul role="listbox" className="space-y-1">
            {normalizedOptions.map((opt) => {
              const isSelected = String(opt.value) === String(value);
              return (
                <li
                  key={String(opt.value)}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => handleSelect(opt.value)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-sm shadow-pink-500/25'
                      : 'text-slate-700 hover:bg-pink-50 hover:text-pink-600'
                  }`}
                >
                  <div className="flex items-center gap-2 truncate">
                    {opt.icon && <span className="shrink-0">{opt.icon}</span>}
                    <span className="truncate">{opt.label}</span>
                    {opt.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                          isSelected
                            ? 'bg-white/20 text-white'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {opt.badge}
                      </span>
                    )}
                  </div>

                  {isSelected && (
                    <Check size={14} className="shrink-0 ml-2 text-white stroke-[2.5]" />
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
