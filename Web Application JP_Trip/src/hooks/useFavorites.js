import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../connectAPI/axios";
import { getUser } from "../utils/auth";

// จัดการรายการโปรดของผู้ใช้ที่ล็อกอิน: โหลด / สลับสถานะหัวใจ
export default function useFavorites() {
  const navigate = useNavigate();
  const [keys, setKeys] = useState(new Set());

  useEffect(() => {
    if (!getUser()) return;
    api.get("/favorites").then((r) => setKeys(new Set(r.data.map((f) => `${f.category}-${f.id}`)))).catch(() => {});
  }, []);

  const isFav = useCallback((p) => keys.has(`${p.category}-${p.id}`), [keys]);

  const toggle = useCallback(
    async (p) => {
      if (!getUser()) {
        window.dispatchEvent(
          new CustomEvent('open-login-prompt', {
            detail: { place: p, reason: 'favorite' },
          })
        );
        return;
      }
      const key = `${p.category}-${p.id}`;
      const had = keys.has(key);
      setKeys((prev) => {
        const next = new Set(prev);
        had ? next.delete(key) : next.add(key);
        return next;
      });
      try {
        if (had) await api.delete(`/favorites/${p.category}/${p.id}`);
        else await api.post("/favorites", { category: p.category, id: p.id });
      } catch {
        setKeys((prev) => {
          const next = new Set(prev);
          had ? next.add(key) : next.delete(key);
          return next;
        });
        alert("ไม่สามารถอัปเดตรายการโปรดได้");
      }
    },
    [keys, navigate]
  );

  return { isFav, toggle };
}
