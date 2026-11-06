import React from "react";
import { Link } from "react-router-dom";
import { MapPin, Clock, Map, Heart } from "lucide-react";
import { categoryLabel, FALLBACK_IMG, formatPrice, formatTime } from "../utils/constants";

const categoryTheme = {
  attractions: {
    badge: "bg-rose-500 text-white shadow-rose-500/30",
    text: "text-rose-600",
    bgLight: "bg-rose-50",
  },
  restaurants: {
    badge: "bg-amber-500 text-white shadow-amber-500/30",
    text: "text-amber-600",
    bgLight: "bg-amber-50",
  },
  accommodations: {
    badge: "bg-emerald-600 text-white shadow-emerald-600/30",
    text: "text-emerald-600",
    bgLight: "bg-emerald-50",
  },
  cafes: {
    badge: "bg-indigo-600 text-white shadow-indigo-600/30",
    text: "text-indigo-600",
    bgLight: "bg-indigo-50",
  },
};

// การ์ดสถานที่ใช้ร่วมกันในหน้าค้นหา และรายการโปรด
const PlaceCard = ({ place, isFav, onToggleFav, onOpenMap }) => {
  const theme = categoryTheme[place.category] || {
    badge: "bg-pink-600 text-white shadow-pink-600/30",
    text: "text-pink-600",
    bgLight: "bg-pink-50",
  };

  const isFree = Number(place.starting_price) === 0 || place.starting_price == null;

  return (
    <div className="bg-white rounded-3xl border border-gray-100/80 shadow-sm hover:shadow-xl hover:shadow-gray-200/50 transition-all duration-300 flex flex-col h-full overflow-hidden group hover:-translate-y-1">
      {/* Cover Image */}
      <div className="relative h-56 overflow-hidden bg-gray-100 shrink-0">
        <Link to={`/place/${place.category}/${place.id}`} className="block w-full h-full">
          <img
            src={place.image_url || FALLBACK_IMG}
            onError={(e) => (e.currentTarget.src = FALLBACK_IMG)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            alt={place.name}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
        </Link>

        {/* Category Badge */}
        <div className={`absolute top-4 left-4 px-3.5 py-1.5 rounded-full text-[11px] font-black uppercase tracking-wider shadow-md backdrop-blur-sm ${theme.badge}`}>
          {place.category_name || categoryLabel(place.category)}
        </div>

        {/* Top Right: Favorite Button */}
        {onToggleFav && (
          <button
            onClick={() => onToggleFav(place)}
            aria-label="รายการโปรด"
            className={`absolute top-4 right-4 p-2.5 rounded-full shadow-md backdrop-blur-md transition-all duration-200 active:scale-90 ${
              isFav
                ? "bg-rose-50 text-rose-500 scale-105 shadow-rose-200"
                : "bg-white/90 text-gray-500 hover:text-rose-500 hover:bg-white"
            }`}
          >
            <Heart size={18} fill={isFav ? "currentColor" : "none"} className={isFav ? "animate-pulse" : ""} />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="p-6 flex flex-col flex-1 justify-between">
        <div>
          <Link to={`/place/${place.category}/${place.id}`}>
            <h3 className="text-xl font-black text-gray-900 group-hover:text-pink-600 transition-colors line-clamp-1 mb-2">
              {place.name}
            </h3>
          </Link>
          <p className="text-gray-500 text-xs font-medium line-clamp-2 leading-relaxed mb-4">
            {place.description || "ไม่มีคำอธิบายรายละเอียดสำหรับสถานที่นี้"}
          </p>

          <div className="space-y-2 mb-6">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-700">
              <span className={`p-1.5 rounded-lg ${theme.bgLight} ${theme.text}`}>
                <MapPin size={14} />
              </span>
              <span>{place.province || "ไม่ระบุจังหวัด"}</span>
              {place.type && (
                <>
                  <span className="text-gray-300">•</span>
                  <span className="text-gray-500 font-semibold">{place.type}</span>
                </>
              )}
            </div>

            {place.open_time && place.close_time && (
              <div className="flex items-center gap-2 text-xs font-semibold text-gray-500">
                <span className="p-1.5 bg-gray-50 rounded-lg text-gray-400">
                  <Clock size={14} />
                </span>
                <span>{formatTime(place.open_time)} - {formatTime(place.close_time)} น.</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer info & action */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-baseline justify-between mb-4">
            <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wide">ราคาเริ่มต้น</span>
            {isFree ? (
              <span className="bg-emerald-50 text-emerald-600 font-black text-xs px-2.5 py-1 rounded-full border border-emerald-100">
                เข้าชมฟรี
              </span>
            ) : (
              <span className="text-lg font-black text-gray-900">
                {formatPrice(place.starting_price)}
              </span>
            )}
          </div>

          <button
            onClick={() => onOpenMap?.(place)}
            className="w-full py-3 bg-gray-900 hover:bg-pink-600 active:scale-[0.99] text-white rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2 text-xs shadow-sm hover:shadow-pink-500/25"
          >
            <Map size={15} /> ดูแผนที่และการเดินทาง
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlaceCard;
