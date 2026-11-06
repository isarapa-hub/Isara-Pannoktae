import React, { useState, useEffect, useRef } from 'react';
import { X, MapPin, Search, Check, Navigation, Loader2, Globe, Layers } from 'lucide-react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ไอคอนหมุดปักแผนที่สไตล์ Google Maps สีแดงสวยงามเด่นชัด
const pinIcon = L.divIcon({
  className: 'custom-map-marker',
  html: `
    <div style="position: relative; width: 42px; height: 42px; transform: translate(-50%, -100%);">
      <div style="
        background: linear-gradient(135deg, #ef4444, #dc2626);
        width: 42px;
        height: 42px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 8px 20px rgba(220, 38, 38, 0.45);
        border: 3px solid #ffffff;
      ">
        <div style="background: #ffffff; width: 12px; height: 12px; border-radius: 50%;"></div>
      </div>
    </div>
  `,
  iconSize: [42, 42],
  iconAnchor: [21, 42],
});

// พิกัดเริ่มต้น: โตเกียว (คันโต ประเทศญี่ปุ่น)
const DEFAULT_LAT = 35.6895;
const DEFAULT_LNG = 139.6917;

// ตัวเลือกเลเยอร์แผนที่จาก Google Maps โดยตรง (พร้อมตัวเลือกรองรับภาษาอังกฤษและไทย)
const MAP_STYLES = {
  google_en: {
    id: 'google_en',
    label: 'Google Maps (English)',
    shortLabel: 'Google (EN)',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=en',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps',
  },
  google_th: {
    id: 'google_th',
    label: 'Google Maps (ไทย)',
    shortLabel: 'Google (ไทย)',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=th',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps',
  },
  google_hybrid: {
    id: 'google_hybrid',
    label: 'Google ดาวเทียม',
    shortLabel: 'ดาวเทียม',
    url: 'https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}&hl=en',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps',
  },
  google_ja: {
    id: 'google_ja',
    label: 'Google Maps (日本語)',
    shortLabel: '日本語',
    url: 'https://mt1.google.com/vt/lyrs=m&x={x}&y={y}&z={z}&hl=ja',
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3'],
    maxZoom: 20,
    attribution: '&copy; Google Maps',
  },
};

const MapPickerModal = ({ initialLat, initialLng, placeName, province, onClose, onSelect }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const tileLayerRef = useRef(null);

  const startLat = initialLat && !isNaN(Number(initialLat)) ? Number(initialLat) : DEFAULT_LAT;
  const startLng = initialLng && !isNaN(Number(initialLng)) ? Number(initialLng) : DEFAULT_LNG;

  const [currentLat, setCurrentLat] = useState(startLat);
  const [currentLng, setCurrentLng] = useState(startLng);
  const [mapStyle, setMapStyle] = useState('google_en');
  const [searchQuery, setSearchQuery] = useState(placeName ? `${placeName} ${province || ''}`.trim() : '');
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  // เริ่มต้นแผนที่
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // สร้าง Leaflet Map
    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: initialLat && initialLng ? 16 : 12,
      zoomControl: false,
    });
    mapInstanceRef.current = map;

    // ปุ่มซูมที่มุมขวาล่าง
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // เลเยอร์แผนที่เริ่มต้น: Google Maps ภาษาอังกฤษ
    const initialConfig = MAP_STYLES.google_en;
    const tileLayer = L.tileLayer(initialConfig.url, {
      subdomains: initialConfig.subdomains,
      maxZoom: initialConfig.maxZoom,
      attribution: initialConfig.attribution,
    }).addTo(map);
    tileLayerRef.current = tileLayer;

    // ปักหมุดเริ่มต้น
    const marker = L.marker([startLat, startLng], {
      icon: pinIcon,
      draggable: true,
    }).addTo(map);
    markerRef.current = marker;

    // เมื่อลากหมุดไปปล่อย
    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setCurrentLat(Number(pos.lat.toFixed(6)));
      setCurrentLng(Number(pos.lng.toFixed(6)));
    });

    // เมื่อคลิกบนแผนที่ เพื่อย้ายหมุดมาปักตรงจุดที่คลิกทันที
    map.on('click', (e) => {
      const { lat, lng } = e.latlng;
      marker.setLatLng([lat, lng]);
      setCurrentLat(Number(lat.toFixed(6)));
      setCurrentLng(Number(lng.toFixed(6)));
    });

    // Force map invalidateSize หลังจาก mount เพื่อให้แผนที่แสดงผลเต็มพื้นที่ 100%
    setTimeout(() => {
      map.invalidateSize();
    }, 250);

    return () => {
      map.remove();
    };
  }, []);

  // สลับเลเยอร์แผนที่ / ภาษา
  const switchMapStyle = (styleKey) => {
    setMapStyle(styleKey);
    if (!mapInstanceRef.current) return;

    const cfg = MAP_STYLES[styleKey] || MAP_STYLES.google_en;

    if (tileLayerRef.current) {
      mapInstanceRef.current.removeLayer(tileLayerRef.current);
    }

    const newLayer = L.tileLayer(cfg.url, {
      subdomains: cfg.subdomains,
      maxZoom: cfg.maxZoom,
      attribution: cfg.attribution,
    }).addTo(mapInstanceRef.current);

    if (markerRef.current) {
      markerRef.current.bringToFront();
    }

    tileLayerRef.current = newLayer;
  };

  // ฟังก์ชันแยกพิกัดจากลิงก์ Google Maps หรือข้อความพิกัด
  const tryExtractCoords = (text) => {
    if (!text || typeof text !== 'string') return null;
    const str = text.trim();
    // 1. @lat,lng ใน Google Maps URL
    const atMatch = str.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (atMatch) return { lat: parseFloat(atMatch[1]), lng: parseFloat(atMatch[2]) };
    // 2. q=lat,lng หรือ query=lat,lng หรือ ll=lat,lng
    const qMatch = str.match(/(?:q|query|ll|destination)=(-?\d+\.\d+),(-?\d+\.\d+)/);
    if (qMatch) return { lat: parseFloat(qMatch[1]), lng: parseFloat(qMatch[2]) };
    // 3. !3dlat!4dlng (Google Maps share embed format)
    const embedMatch = str.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
    if (embedMatch) return { lat: parseFloat(embedMatch[1]), lng: parseFloat(embedMatch[2]) };
    // 4. พิมพ์หรือวางพิกัดตรงๆ เช่น 35.7148, 139.7967
    const directMatch = str.match(/^(-?\d+(?:\.\d+)?)[,\s]+(-?\d+(?:\.\d+)?)$/);
    if (directMatch) {
      const lat = parseFloat(directMatch[1]);
      const lng = parseFloat(directMatch[2]);
      if (!isNaN(lat) && !isNaN(lng)) return { lat, lng };
    }
    return null;
  };

  // ฟังก์ชันค้นหาสถานที่ (Geocoding ด้วย OpenStreetMap Nominatim ฟรี หรือถอดพิกัดถ้าเป็นลิงก์ Google Maps)
  const handleSearch = async (e) => {
    e?.preventDefault();
    if (!searchQuery.trim()) return;

    // ตรวจสอบว่าเป็นลิงก์ Google Maps หรือพิกัดโดยตรงหรือไม่
    const directCoords = tryExtractCoords(searchQuery);
    if (directCoords) {
      const lat = Number(directCoords.lat.toFixed(6));
      const lng = Number(directCoords.lng.toFixed(6));
      setCurrentLat(lat);
      setCurrentLng(lng);
      if (markerRef.current && mapInstanceRef.current) {
        markerRef.current.setLatLng([lat, lng]);
        mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
      }
      setSearchError('');
      return;
    }

    setSearching(true);
    setSearchError('');

    try {
      const query = searchQuery.includes('japan') || searchQuery.includes('ญี่ปุ่น')
        ? searchQuery
        : `${searchQuery}, Japan`;

      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`,
        { headers: { 'Accept-Language': 'en,ja,th' } }
      );
      const data = await res.json();

      if (data && data.length > 0) {
        const found = data[0];
        const lat = Number(Number(found.lat).toFixed(6));
        const lng = Number(Number(found.lon).toFixed(6));

        setCurrentLat(lat);
        setCurrentLng(lng);

        if (markerRef.current && mapInstanceRef.current) {
          markerRef.current.setLatLng([lat, lng]);
          mapInstanceRef.current.flyTo([lat, lng], 16, { duration: 1.2 });
        }
      } else {
        setSearchError('ไม่พบสถานที่ กรุณาลองพิมพ์ชื่อภาษาอังกฤษหรือคลิกปักหมุดบนแผนที่แทน');
      }
    } catch (err) {
      console.error('Search error:', err);
      setSearchError('เกิดข้อผิดพลาดในการค้นหา');
    } finally {
      setSearching(false);
    }
  };

  const handleConfirm = () => {
    if (typeof onSelect === 'function') {
      onSelect({ lat: currentLat, lng: currentLng }, currentLat, currentLng);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-sm" onClick={onClose}>
      <div
        className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl overflow-hidden flex flex-col h-[92vh] max-h-[820px] border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Modal - ขยายตัวหนังสือให้ใหญ่และอ่านง่าย */}
        <div className="flex items-center justify-between px-6 py-4 md:px-8 md:py-5 border-b border-slate-100 shrink-0 bg-white">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center font-bold shadow-xs">
              <MapPin size={24} />
            </div>
            <div className="text-left">
              <h3 className="font-black text-slate-900 text-xl md:text-2xl tracking-tight">
                ปักหมุดตำแหน่งด้วย Google Maps
              </h3>
              <p className="text-sm md:text-base text-slate-500 font-medium mt-0.5">
                คลิกบนแผนที่เพื่อย้ายหมุด หรือพิมพ์ค้นหาชื่อสถานที่ (แสดงภาษาอังกฤษตาม Google Maps)
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
            title="ปิดหน้าต่าง"
          >
            <X size={20} />
          </button>
        </div>

        {/* Search Bar - ขยายตัวหนังสือและช่องค้นหาให้ใหญ่ ชัดเจน */}
        <div className="px-6 py-3.5 md:px-8 md:py-4 bg-slate-50/90 border-b border-slate-200/80 shrink-0 text-left">
          <form onSubmit={handleSearch} className="flex gap-2.5">
            <div className="relative flex-1">
              <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="พิมพ์ชื่อสถานที่เพื่อค้นหา เช่น Tokyo Skytree, Shibuya, Senso-ji (หรือวางลิงก์ Google Maps)..."
                className="w-full pl-12 pr-4 py-3 bg-white rounded-2xl text-sm md:text-base font-medium text-slate-800 border border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all shadow-xs"
              />
            </div>
            <button
              type="submit"
              disabled={searching}
              className="px-6 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm md:text-base transition-all flex items-center gap-2 shrink-0 shadow-sm"
            >
              {searching ? <Loader2 size={18} className="animate-spin" /> : <Navigation size={18} />}
              <span>ค้นหา</span>
            </button>
          </form>
          {searchError && (
            <p className="text-xs md:text-sm text-red-600 font-semibold mt-2">{searchError}</p>
          )}
        </div>

        {/* Map Container */}
        <div className="flex-1 relative bg-slate-100">
          <div ref={mapContainerRef} className="w-full h-full" />

          {/* Badge แสดงพิกัดลอยมุมบนซ้าย - ตัวหนังสือขยายชัดเจน */}
          <div className="absolute top-4 left-4 z-[1000] bg-white/95 backdrop-blur-md px-4 py-3 rounded-2xl shadow-lg border border-slate-200/80 text-left space-y-1">
            <div className="font-extrabold text-slate-800 text-xs md:text-sm flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-pulse" />
              <span>พิกัดหมุดปัจจุบัน</span>
            </div>
            <div className="text-xs md:text-sm text-slate-600 font-mono font-bold">
              Lat: <span className="text-red-600 font-black">{currentLat}</span>, Lng: <span className="text-red-600 font-black">{currentLng}</span>
            </div>
          </div>

          {/* แถบเลือกสลับรูปแบบ Google Maps (ภาษาอังกฤษ / ภาษาไทย / ดาวเทียม) */}
          <div className="absolute top-4 right-4 z-[1000] flex items-center bg-white/95 backdrop-blur-md p-1.5 rounded-2xl shadow-lg border border-slate-200/80 gap-1">
            <div className="hidden sm:flex items-center gap-1 pl-2 pr-1 text-slate-500 font-extrabold text-xs">
              <Globe size={14} className="text-red-600" />
              <span>แผนที่:</span>
            </div>
            {Object.values(MAP_STYLES).map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => switchMapStyle(s.id)}
                className={`px-3.5 py-2 rounded-xl font-bold transition-all text-xs md:text-sm flex items-center gap-1 ${
                  mapStyle === s.id
                    ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                }`}
              >
                <span>{s.shortLabel}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Footer Modal: ยืนยันพิกัด - ขยายตัวหนังสือและปุ่ม */}
        <div className="px-6 py-4 md:px-8 md:py-5 bg-white border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4 shrink-0">
          <div className="text-left text-sm md:text-base text-slate-600">
            <span>คลิกที่แผนที่หรือลากหมุด แล้วกด </span>
            <span className="font-bold text-red-600">"ยืนยันใช้พิกัดนี้"</span>
            <span> เพื่อบันทึกพิกัดลงฟอร์ม</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-6 py-3 rounded-2xl border border-slate-300 text-slate-700 hover:bg-slate-50 font-bold text-sm md:text-base transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="flex-1 sm:flex-none px-8 py-3 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-black text-sm md:text-base shadow-lg shadow-red-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Check size={18} />
              <span>ยืนยันใช้พิกัดนี้</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapPickerModal;
