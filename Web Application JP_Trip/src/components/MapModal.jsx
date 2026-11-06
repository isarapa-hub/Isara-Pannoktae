import React from 'react';
import { X, Navigation, MapPin, Compass } from 'lucide-react';
import { categoryLabel, mapsEmbedUrl, mapsDirectionUrl } from '../utils/constants';

// หน้าต่างแสดงแผนที่ Google Maps สไตล์โมเดิร์น สวยงาม ตัวหนังสือขนาดพอดี
const MapModal = ({ place, onClose }) => {
  if (!place) return null;

  return (
    <div
      className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-6 bg-slate-950/75 backdrop-blur-md animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[2rem] sm:rounded-[2.5rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[720px] border border-slate-100 animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Section - ปรับขนาดตัวหนังสือให้อ่านง่าย ชัดเจน สวยงาม */}
        <div className="px-6 py-5 border-b border-slate-100 shrink-0 bg-white flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-left">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-red-600 to-rose-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-rose-600/25">
              <Compass size={24} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 font-black text-xs uppercase tracking-wider">
                  {categoryLabel(place.category)}
                </span>
                {place.province && (
                  <span className="text-xs sm:text-sm font-bold text-slate-500 flex items-center gap-1">
                    <MapPin size={14} className="text-rose-600" />
                    <span>{place.province}</span>
                  </span>
                )}
              </div>
              <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
                {place.name}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors shrink-0"
            title="ปิด"
          >
            <X size={20} />
          </button>
        </div>

        {/* Map iframe Container - แสดงตำแหน่งของสถานที่บน Google Maps */}
        <div className="flex-1 bg-slate-100 relative">
          <iframe
            title={`Map of ${place.name}`}
            src={mapsEmbedUrl(place)}
            className="w-full h-full border-0 absolute inset-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />

          {/* ป้ายบอกพิกัดลอยมุมบนซ้าย */}
          <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-md px-4 py-2.5 rounded-2xl shadow-md border border-slate-200/80 text-left space-y-0.5">
            <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider">ตำแหน่งที่ตั้ง</div>
            <div className="text-xs sm:text-sm font-extrabold text-slate-800 flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span>{place.name}</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 sm:py-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3.5 shrink-0">
          <div className="text-xs sm:text-sm text-slate-500 text-left font-medium">
            {place.latitude && place.longitude ? (
              <span>
                พิกัด GPS: <strong className="text-slate-800">{place.latitude}, {place.longitude}</strong>
              </span>
            ) : (
              <span>ภูมิภาคคันโต ประเทศญี่ปุ่น</span>
            )}
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl border border-slate-200 text-slate-700 hover:bg-slate-50 font-bold text-xs sm:text-sm transition-colors"
            >
              ปิดหน้าต่าง
            </button>
            <a
              href={mapsDirectionUrl(place)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 sm:flex-none px-7 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-xs sm:text-sm shadow-md shadow-rose-600/25 transition-all flex items-center justify-center gap-2 hover:scale-[1.01]"
            >
              <Navigation size={16} />
              <span>นำทางด้วย Google Maps ↗</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;
