// ชื่อจังหวัดใช้ชุดเดียวกันทั้งระบบ (ตรงกับเอกสารและฐานข้อมูล)
export const PROVINCES = ["โตเกียว", "คานางาวะ", "ชิบะ", "ไซตามะ", "อิบารากิ", "โทจิงิ", "กุนมะ"];

export const CATEGORIES = [
  { id: "attractions", label: "สถานที่ท่องเที่ยว" },
  { id: "restaurants", label: "ร้านอาหาร" },
  { id: "accommodations", label: "ที่พัก" },
  { id: "cafes", label: "คาเฟ่" },
];

let _dynamicCategories = [...CATEGORIES];

export const setDynamicCategories = (cats) => {
  if (Array.isArray(cats) && cats.length > 0) {
    _dynamicCategories = cats.map((c) => ({
      id: c.category_key || c.id,
      label: c.name || c.label,
      ...c,
    }));
  }
};

export const getDynamicCategories = () => _dynamicCategories;

export const categoryLabel = (cat) => {
  const found = _dynamicCategories.find((c) => c.id === cat || c.category_key === cat);
  if (found) return found.label || found.name;
  if (cat === "cafes") return "คาเฟ่";
  return "ทั่วไป";
};

export const FALLBACK_IMG = "https://images.unsplash.com/photo-1528164344705-47542687990d?q=80&w=800";

export const formatPrice = (p) => (Number(p) === 0 || p == null ? "เข้าชมฟรี" : `¥${Number(p).toLocaleString()}`);

export const formatTime = (t) => (t ? String(t).substring(0, 5) : "");

export const mapsEmbedUrl = (p) => {
  const q = p.latitude && p.longitude ? `${p.latitude},${p.longitude}` : encodeURIComponent(`${p.name} ${p.province || "Japan"}`);
  return `https://www.google.com/maps?q=${q}&z=15&output=embed`;
};

export const mapsDirectionUrl = (p) => {
  const dest = p.latitude && p.longitude ? `${p.latitude},${p.longitude}` : encodeURIComponent(`${p.name} ${p.province || "Japan"}`);
  return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
};
