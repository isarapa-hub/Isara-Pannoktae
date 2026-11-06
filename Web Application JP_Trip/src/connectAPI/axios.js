import axios from "axios";

// ที่อยู่ของ Backend (เปลี่ยนได้ผ่านไฟล์ .env: VITE_API_URL=http://localhost:5000/api)
const instance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});

// แนบ token ทุกคำขอ
instance.interceptors.request.use((config) => {
  const token = sessionStorage.getItem("token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// token หมดอายุ -> ล้างเซสชันแล้วพาไปหน้าเข้าสู่ระบบ
instance.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401 && sessionStorage.getItem("token")) {
      sessionStorage.clear();
      window.location.href = "/login";
    }
    return Promise.reject(err);
  }
);

export const errMsg = (err, fallback = "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง") =>
  err?.response?.data?.message || (err?.request ? "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้" : fallback);

export default instance;
