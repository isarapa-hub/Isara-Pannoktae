const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });
const express = require("express");
const router = express.Router();
const pool = require("../db");
const bcrypt = require("bcryptjs");
const { signToken, requireAuth, requireAdmin } = require("../middleware");
const { OAuth2Client } = require("google-auth-library");
const { sendPasswordResetApprovedEmail } = require("../emailService");

// OAuth2 Client สำหรับ Google Login
const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID || "835024398017-pqbc272voobi6vc2jilhf8cf1hd0rds3.apps.googleusercontent.com";
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

/* ------------------------------------------------------------------ */
/*  ค่าคงที่ / ตัวช่วย                                                 */
/* ------------------------------------------------------------------ */

const CATS = {
  attractions: { table: "attractions", pk: "attraction_id", img: "attraction_images", label: "สถานที่ท่องเที่ยว" },
  restaurants: { table: "restaurants", pk: "restaurant_id", img: "restaurant_images", label: "ร้านอาหาร" },
  accommodations: { table: "accommodations", pk: "accommodation_id", img: "accommodation_images", label: "ที่พัก" },
};
const LABEL_TO_CAT = { "สถานที่ท่องเที่ยว": "attractions", "ร้านอาหาร": "restaurants", "ที่พัก": "accommodations" };

const PROVINCES = ["โตเกียว", "คานางาวะ", "ชิบะ", "ไซตามะ", "อิบารากิ", "โทจิงิ", "กุนมะ"];
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// สร้างตาราง categories อัตโนมัติ (สำหรับระบบจัดการหมวดหมู่ข้อมูล 4.1)
(async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        category_id INT AUTO_INCREMENT PRIMARY KEY,
        category_key VARCHAR(50) NOT NULL UNIQUE,
        name VARCHAR(100) NOT NULL,
        description TEXT DEFAULT NULL,
        icon VARCHAR(50) DEFAULT 'MapPin',
        color VARCHAR(50) DEFAULT 'pink',
        is_system TINYINT(1) DEFAULT 0,
        sort_order INT DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    const [rows] = await pool.query("SELECT COUNT(*) as count FROM categories");
    if (rows[0].count === 0) {
      await pool.query(`
        INSERT INTO categories (category_key, name, description, icon, color, is_system, sort_order) VALUES
        ('attractions', 'สถานที่ท่องเที่ยว', 'สถานที่ท่องเที่ยว จุดเช็คอิน และแลนด์มาร์กสำคัญทั่วภูมิภาคคันโต', 'MapPin', 'pink', 1, 1),
        ('restaurants', 'ร้านอาหาร', 'ร้านอาหาร คาเฟ่ ขนมหวาน และของอร่อยประจำย่านยอดนิยม', 'Utensils', 'amber', 1, 2),
        ('accommodations', 'ที่พัก', 'โรงแรม เรียวกัง โฮสเทล และที่พักผ่อนสบายใจในญี่ปุ่น', 'BedDouble', 'emerald', 1, 3);
      `);
    }
  } catch (err) {
    console.error("Auto init categories failed:", err);
  }
})();

// ตรวจสอบและสร้างคอลัมน์ is_deleted อัตโนมัติ (สำหรับ Soft Delete ป้องกันข้อมูลในแผนการเดินทางของผู้ใช้สูญหาย)
(async () => {
  try {
    for (const tbl of ["attractions", "restaurants", "accommodations"]) {
      const [cols] = await pool.query(
        "SELECT COLUMN_NAME FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = ? AND COLUMN_NAME = ?",
        [tbl, "is_deleted"]
      );
      if (cols.length === 0) {
        await pool.query(`ALTER TABLE ${tbl} ADD COLUMN is_deleted TINYINT(1) DEFAULT 0`);
      }
    }

    // สร้างตารางสำหรับหมวดหมู่สถานที่เพิ่มเติมแบบไดนามิก (TC 4.1)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_places (
        place_id INT AUTO_INCREMENT PRIMARY KEY,
        category_key VARCHAR(50) NOT NULL,
        name VARCHAR(255) NOT NULL,
        description TEXT DEFAULT NULL,
        province VARCHAR(100) DEFAULT NULL,
        open_time TIME DEFAULT NULL,
        close_time TIME DEFAULT NULL,
        starting_price DECIMAL(10,2) DEFAULT NULL,
        type VARCHAR(100) DEFAULT NULL,
        latitude DOUBLE DEFAULT NULL,
        longitude DOUBLE DEFAULT NULL,
        image_url TEXT DEFAULT NULL,
        view_count INT DEFAULT 0,
        is_deleted TINYINT(1) DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_custom_category (category_key),
        INDEX idx_custom_is_deleted (is_deleted)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS custom_place_images (
        image_id INT AUTO_INCREMENT PRIMARY KEY,
        place_id INT NOT NULL,
        file_name VARCHAR(255) NOT NULL,
        INDEX idx_custom_place_img (place_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);
  } catch (err) {
    console.error("Auto init tables / columns failed:", err);
  }
})();

// SELECT มาตรฐานดึงข้อมูลทุกหมวด (รวม view_count, is_deleted, category_name และ plan_count จากแผนการเดินทาง)
const selectFor = (cat) => {
  const c = CATS[cat];
  const hasTime = cat !== "accommodations";
  return `SELECT t.${c.pk} AS id, '${cat}' AS category,
    COALESCE(cat.name, '${c.label}') AS category_name,
    t.name, t.description, t.province,
    ${cat === "accommodations" ? "t.type" : "NULL"} AS type,
    ${hasTime ? "t.open_time, t.close_time" : "NULL AS open_time, NULL AS close_time"},
    t.starting_price, t.latitude, t.longitude, t.image_url, COALESCE(t.view_count, 0) AS view_count,
    COALESCE(t.is_deleted, 0) AS is_deleted,
    COALESCE((SELECT COUNT(DISTINCT pd.plan_id) FROM plan_details pd JOIN travel_plans tp ON pd.plan_id = tp.plan_id WHERE pd.${c.pk} = t.${c.pk}), 0) AS plan_count
  FROM ${c.table} t
  LEFT JOIN categories cat ON cat.category_key = '${cat}'`;
};
const SELECT_CUSTOM = `SELECT p.place_id AS id, p.category_key AS category,
  COALESCE(cat.name, p.category_key) AS category_name,
  p.name, p.description, p.province,
  p.type, p.open_time, p.close_time, p.starting_price, p.latitude, p.longitude, p.image_url,
  COALESCE(p.view_count, 0) AS view_count, COALESCE(p.is_deleted, 0) AS is_deleted,
  COALESCE((SELECT COUNT(DISTINCT pd.plan_id) FROM plan_details pd JOIN travel_plans tp ON pd.plan_id = tp.plan_id WHERE pd.custom_place_id = p.place_id), 0) AS plan_count
FROM custom_places p
LEFT JOIN categories cat ON cat.category_key = p.category_key`;
const UNION_ALL = `${Object.keys(CATS).map(selectFor).join(" UNION ALL ")} UNION ALL ${SELECT_CUSTOM}`;

const toNull = (v) => (v === undefined || v === null || String(v).trim() === "" ? null : v);
const toNum = (v) => (toNull(v) === null || isNaN(Number(v)) ? null : Number(v));

const serverError = (res, err, msg = "เกิดข้อผิดพลาดภายในระบบ") => {
  console.error(msg, err);
  res.status(500).json({ message: msg });
};

const publicUser = (u) => ({
  id: u.member_id,
  name: u.name,
  email: u.email,
  role: u.role,
  profile_picture: u.profile_picture || null,
  google_id: u.google_id || null,
  is_google_user: Boolean(u.google_id),
});

/* ------------------------------------------------------------------ */
/*  1. สมาชิก: สมัคร / เข้าสู่ระบบ / Google Auth / โปรไฟล์               */
/* ------------------------------------------------------------------ */

router.post("/register", async (req, res) => {
  const fullname = (req.body.fullname || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";

  if (!fullname || !email || !password) return res.status(400).json({ message: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });
  if (password.length < 8) return res.status(400).json({ message: "รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร" });

  try {
    const hashed = await bcrypt.hash(password, 10);
    await pool.query("INSERT INTO members (name, email, password, role) VALUES (?, ?, ?, 'user')", [fullname, email, hashed]);
    res.status(201).json({ message: "สมัครสมาชิกสำเร็จ!" });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "อีเมลนี้ถูกใช้ไปแล้ว" });
    serverError(res, err, "สมัครสมาชิกไม่สำเร็จ");
  }
});

router.post("/login", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const password = req.body.password || "";
  try {
    const [rows] = await pool.query("SELECT * FROM members WHERE email = ?", [email]);
    if (rows.length === 0) return res.status(401).json({ message: "ไม่พบอีเมลนี้ในระบบ" });
    const user = rows[0];
    if (!(await bcrypt.compare(password, user.password))) return res.status(401).json({ message: "รหัสผ่านไม่ถูกต้อง" });
    res.json({ message: "เข้าสู่ระบบสำเร็จ", token: signToken(user), user: publicUser(user) });
  } catch (err) {
    serverError(res, err, "เข้าสู่ระบบไม่สำเร็จ");
  }
});

router.post("/auth/google", async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "ไม่พบ Token สำหรับยืนยันตัวตน" });

  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { sub: google_id, email, name, picture } = payload;

    const [rows] = await pool.query("SELECT * FROM members WHERE email = ?", [email]);
    let user;

    if (rows.length > 0) {
      user = rows[0];
      if (!user.google_id || user.profile_picture !== picture) {
        await pool.query(
          "UPDATE members SET google_id = ?, profile_picture = ? WHERE member_id = ?",
          [google_id, picture, user.member_id]
        );
        user.google_id = google_id;
        user.profile_picture = picture;
      }
    } else {
      const randomPassword = Math.random().toString(36).slice(-8);
      const hashed = await bcrypt.hash(randomPassword, 10);

      const [insertResult] = await pool.query(
        "INSERT INTO members (name, email, password, role, google_id, profile_picture) VALUES (?, ?, ?, 'user', ?, ?)",
        [name, email, hashed, google_id, picture]
      );

      const [newRows] = await pool.query("SELECT * FROM members WHERE member_id = ?", [insertResult.insertId]);
      user = newRows[0];
    }

    res.json({
      message: "เข้าสู่ระบบด้วย Google สำเร็จ",
      token: signToken(user),
      user: publicUser(user),
    });
  } catch (err) {
    console.error("Google Auth Error:", err);
    res.status(401).json({ message: "Token ยืนยันตัวตนไม่ถูกต้องหรือหมดอายุ" });
  }
});

/* สมาชิกแจ้งลืมรหัสผ่าน (ส่งคำขอให้ Admin ตรวจสอบและอนุมัติ TC: N-001) */
router.post("/auth/forgot-password", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const reason = (req.body.reason || "").trim();

  if (!email) return res.status(400).json({ message: "กรุณากรอกอีเมลที่ลงทะเบียนไว้" });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });

  try {
    const [users] = await pool.query("SELECT member_id, name, email FROM members WHERE email = ?", [email]);
    if (users.length === 0) {
      return res.status(404).json({ message: "ไม่พบบัญชีผู้ใช้งานที่ใช้อีเมลนี้ในระบบ" });
    }
    const user = users[0];

    // ตรวจสอบว่ามีคำขอที่ยังรอดำเนินการ (pending) อยู่แล้วหรือไม่
    const [pending] = await pool.query(
      "SELECT request_id FROM password_reset_requests WHERE member_id = ? AND status = 'pending'",
      [user.member_id]
    );

    let requestId;
    const requestReason = reason || "แจ้งลืมรหัสผ่าน ขอให้ผู้ดูแลระบบช่วยเหลือรีเซ็ตรหัสผ่าน";
    if (pending.length > 0) {
      requestId = pending[0].request_id;
      await pool.query(
        "UPDATE password_reset_requests SET reason = ?, updated_at = NOW() WHERE request_id = ?",
        [requestReason, requestId]
      );
    } else {
      const [insert] = await pool.query(
        "INSERT INTO password_reset_requests (member_id, email, reason, status) VALUES (?, ?, ?, 'pending')",
        [user.member_id, email, requestReason]
      );
      requestId = insert.insertId;
    }

    res.json({
      message: "ส่งคำขอแจ้งลืมรหัสผ่านไปยังผู้ดูแลระบบเรียบร้อยแล้ว!",
      request_id: requestId,
      email: user.email,
      name: user.name,
    });
  } catch (err) {
    serverError(res, err, "ไม่สามารถส่งคำขอแจ้งลืมรหัสผ่านได้");
  }
});

/* ตรวจสอบสถานะคำขอรีเซ็ตรหัสผ่าน (สำหรับสมาชิก) */
router.get("/auth/forgot-password/status", async (req, res) => {
  const email = (req.query.email || "").trim().toLowerCase();
  if (!email) return res.status(400).json({ message: "กรุณาระบุอีเมลเพื่อตรวจสอบ" });

  try {
    const [rows] = await pool.query(
      `SELECT r.request_id, r.member_id, r.email, r.reason, r.status, r.temp_password, r.created_at, r.updated_at,
              m.name
       FROM password_reset_requests r
       JOIN members m ON r.member_id = m.member_id
       WHERE r.email = ?
       ORDER BY r.request_id DESC LIMIT 1`,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({ message: "ยังไม่พบคำขอแจ้งลืมรหัสผ่านสำหรับอีเมลนี้" });
    }

    res.json(rows[0]);
  } catch (err) {
    serverError(res, err, "ไม่สามารถตรวจสอบสถานะคำขอได้");
  }
});

/* สมาชิกตั้งรหัสผ่านใหม่หลังจากได้รับการอนุมัติจากแอดมิน (TC: N-001) */
router.post("/auth/reset-password", async (req, res) => {
  const email = (req.body.email || "").trim().toLowerCase();
  const newPassword = (req.body.new_password || "").trim();

  if (!email) return res.status(400).json({ message: "กรุณาระบุอีเมล" });
  if (!newPassword || newPassword.length < 8) {
    return res.status(400).json({ message: "รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 8 ตัวอักษร" });
  }

  try {
    const [requests] = await pool.query(
      "SELECT * FROM password_reset_requests WHERE email = ? AND status = 'approved' ORDER BY request_id DESC LIMIT 1",
      [email]
    );

    if (requests.length === 0) {
      return res.status(403).json({
        message: "ไม่พบคำขอที่ได้รับการอนุมัติ หรือคำขอนี้อาจถูกใช้งานไปแล้ว กรุณาส่งคำขอใหม่",
      });
    }

    const resetReq = requests[0];
    const hashed = await bcrypt.hash(newPassword, 10);

    // อัปเดตรหัสผ่านใหม่ของสมาชิก
    await pool.query("UPDATE members SET password = ? WHERE member_id = ?", [hashed, resetReq.member_id]);

    // ปรับสถานะคำขอเป็น completed (ตั้งรหัสผ่านใหม่เสร็จสมบูรณ์แล้ว)
    await pool.query(
      "UPDATE password_reset_requests SET status = 'completed', updated_at = NOW() WHERE request_id = ?",
      [resetReq.request_id]
    );

    res.json({
      message: "ตั้งรหัสผ่านใหม่สำเร็จแล้ว! คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้ทันที",
      email: resetReq.email,
    });
  } catch (err) {
    serverError(res, err, "ไม่สามารถตั้งรหัสผ่านใหม่ได้");
  }
});

router.get("/me", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM members WHERE member_id = ?", [req.user.id]);
    if (!rows.length) return res.status(404).json({ message: "ไม่พบสมาชิก" });
    res.json(publicUser(rows[0]));
  } catch (err) {
    serverError(res, err);
  }
});
//
router.put("/members/:id", requireAuth, async (req, res) => {
  const id = Number(req.params.id);
  if (req.user.id !== id && req.user.role !== "admin") return res.status(403).json({ message: "ไม่มีสิทธิ์แก้ไขข้อมูลนี้" });

  const name = (req.body.name || "").trim();
  const email = (req.body.email || "").trim().toLowerCase();
  const { profile_picture, current_password, new_password } = req.body;

  if (!name) return res.status(400).json({ message: "กรุณากรอกชื่อ" });
  if (!EMAIL_RE.test(email)) return res.status(400).json({ message: "รูปแบบอีเมลไม่ถูกต้อง" });

  try {
    const [rows] = await pool.query("SELECT * FROM members WHERE member_id = ?", [id]);
    if (!rows.length) return res.status(404).json({ message: "ไม่พบสมาชิก" });

    const member = rows[0];
    const isGoogleAccount = Boolean(member.google_id);

    // ตรวจสอบกรณีบัญชีที่เข้าสู่ระบบด้วย Google: ไม่อนุญาตให้แก้ไขอีเมล
    if (isGoogleAccount && email !== member.email.toLowerCase()) {
      return res.status(400).json({
        message: "บัญชีที่เข้าสู่ระบบด้วย Google ไม่สามารถแก้ไขอีเมลได้",
      });
    }

    // กรณีเป็นบัญชี Google ให้คงค่าอีเมลเดิมไว้เสมอ
    const targetEmail = isGoogleAccount ? member.email : email;

    let passwordSql = "";
    const params = [name, targetEmail, toNull(profile_picture)];
    if (new_password) {
      if (new_password.length < 8) return res.status(400).json({ message: "รหัสผ่านใหม่ต้องมีอย่างน้อย 8 ตัวอักษร" });
      if (req.user.id === id && !(await bcrypt.compare(current_password || "", member.password)))
        return res.status(400).json({ message: "รหัสผ่านปัจจุบันไม่ถูกต้อง" });
      passwordSql = ", password = ?";
      params.push(await bcrypt.hash(new_password, 10));
    }
    params.push(id);
    await pool.query(`UPDATE members SET name = ?, email = ?, profile_picture = ?${passwordSql} WHERE member_id = ?`, params);
    const [updated] = await pool.query("SELECT * FROM members WHERE member_id = ?", [id]);
    res.json({ message: "บันทึกข้อมูลสำเร็จ", user: publicUser(updated[0]) });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") return res.status(400).json({ message: "อีเมลนี้ถูกใช้ไปแล้ว" });
    serverError(res, err, "บันทึกข้อมูลไม่สำเร็จ");
  }
});

/* ------------------------------------------------------------------ */
/*  2. สถานที่ (สาธารณะ): ค้นหา / รายการ / รายรายละเอียด / จัดอันดับ      */
/* ------------------------------------------------------------------ */

const searchAll = async (req, res) => {
  try {
    const { search, province, maxPrice, category, limit, sort } = req.query;
    let sql = `SELECT * FROM (${UNION_ALL}) AS all_places WHERE is_deleted = 0`;
    const params = [];

    if (search && search.trim()) {
      const words = search.trim().split(/\s+/).filter(Boolean);
      for (const word of words) {
        sql += " AND (name LIKE ? OR description LIKE ? OR province LIKE ? OR (type IS NOT NULL AND type LIKE ?))";
        const kw = `%${word}%`;
        params.push(kw, kw, kw, kw);
      }
    }
    if (province && province.trim()) {
      const list = province.split(",").map(p => p.trim()).filter(Boolean);
      if (list.length > 0) {
        sql += ` AND province IN (${list.map(() => "?").join(",")})`;
        params.push(...list);
      }
    }
    if (maxPrice !== undefined && maxPrice !== "" && !isNaN(Number(maxPrice))) {
      sql += " AND (starting_price IS NULL OR starting_price <= ?)";
      params.push(Number(maxPrice));
    }
    const cat = CATS[category] ? category : LABEL_TO_CAT[category] || category;
    if (cat) {
      sql += " AND category = ?";
      params.push(cat);
    }

    if (sort === "price_asc") {
      sql += " ORDER BY (starting_price IS NULL) ASC, starting_price ASC, id DESC";
    } else if (sort === "price_desc") {
      sql += " ORDER BY starting_price DESC, id DESC";
    } else if (sort === "popular") {
      sql += " ORDER BY view_count DESC, id DESC";
    } else if (sort === "name") {
      sql += " ORDER BY name ASC, id DESC";
    } else {
      sql += " ORDER BY category, id DESC";
    }

    if (limit && Number(limit) > 0) {
      sql += " LIMIT ?";
      params.push(Number(limit));
    }
    const [rows] = await pool.query(sql, params);
    res.json(rows);
  } catch (err) {
    serverError(res, err, "เกิดข้อผิดพลาดในการค้นหาข้อมูล");
  }
};
router.get("/all-places", searchAll);
router.get("/places", searchAll);



router.get("/popular", async (req, res) => {
  try {
    // 1. อ่านค่า limit จาก query string (ค่าเริ่มต้น = 4 รายการ, สูงสุดไม่เกิน 12 รายการ)
    const limit = Math.min(Number(req.query.limit) || 4, 12);

    // 2. คำสั่ง SQL คัดเลือกสถานที่ยอดนิยม:
    //    - a.* คือ ดึงข้อมูลสถานที่ทั้งหมดจาก UNION_ALL (สถานที่ท่องเที่ยว, ร้านอาหาร, ที่พัก)
    //    - popularity_score คือ การนำค่า view_count (จำนวนครั้งที่ถูกคลิกดู) มาเป็นคะแนนความนิยม
    //    - ORDER BY COALESCE(a.view_count, 0) DESC เรียงจากยอดคลิกมากที่สุดลงไปหาน้อยที่สุด
    const sql = `
      SELECT a.*, 
             COALESCE(a.view_count, 0) AS popularity_score
      FROM (${UNION_ALL}) AS a 
      WHERE a.is_deleted = 0
      ORDER BY COALESCE(a.view_count, 0) DESC, id DESC
      LIMIT ?
    `;

    // 3. รันคำสั่ง SQL ผ่าน Connection Pool และส่งข้อมูลผลลัพธ์กลับไปยัง Frontend รูปแบบ JSON
    const [rows] = await pool.query(sql, [limit]);
    res.json(rows);
  } catch (err) {
    serverError(res, err, "เกิดข้อผิดพลาดในการคำนวณสถานที่ยอดนิยม");
  }
});

router.get("/places/:category", async (req, res) => {
  const { category } = req.params;
  try {
    if (CATS[category]) {
      const [rows] = await pool.query(`${selectFor(category)} WHERE COALESCE(is_deleted, 0) = 0 ORDER BY ${CATS[category].pk} DESC`);
      return res.json(rows);
    }

    // ตรวจสอบกับหมวดหมู่เพิ่มเติมในตาราง categories (TC 4.1)
    const [catRows] = await pool.query("SELECT * FROM categories WHERE category_key = ?", [category]);
    if (!catRows.length) return res.status(400).json({ message: "ไม่พบหมวดข้อมูลที่ระบุ" });

    const [rows] = await pool.query(
      `SELECT p.place_id AS id, p.category_key AS category, COALESCE(cat.name, p.category_key) AS category_name,
       p.name, p.description, p.province, p.type, p.open_time, p.close_time, p.starting_price,
       p.latitude, p.longitude, p.image_url, COALESCE(p.view_count, 0) AS view_count,
       COALESCE(p.is_deleted, 0) AS is_deleted,
       COALESCE((SELECT COUNT(DISTINCT pd.plan_id) FROM plan_details pd JOIN travel_plans tp ON pd.plan_id = tp.plan_id WHERE pd.custom_place_id = p.place_id), 0) AS plan_count
       FROM custom_places p
       LEFT JOIN categories cat ON cat.category_key = p.category_key
       WHERE p.category_key = ? AND COALESCE(p.is_deleted, 0) = 0 ORDER BY p.place_id DESC`,
      [category]
    );
    res.json(rows);
  } catch (err) {
    serverError(res, err, "เกิดข้อผิดพลาดในการดึงข้อมูลจากตาราง");
  }
});

// ป้องกันการนับคะแนน view_count ซ้ำซ้อนจากการส่ง Request ซ้ำ (เช่น React StrictMode, Fast Refresh หรือ Double Click)
const recentViews = new Map();
const VIEW_DEBOUNCE_MS = 5000; // ภายใน 5 วินาที สำหรับผู้ใช้/IP เดิม จะนับเป็น 1 ครั้ง

const shouldCountView = (req, category, id) => {
  if (req.query.no_count === "1" || req.query.no_count === "true") return false;
  const ip = req.headers["x-forwarded-for"] || req.socket?.remoteAddress || req.ip || "client";
  const key = `${ip}:${category}:${id}`;
  const now = Date.now();
  const lastTime = recentViews.get(key);
  if (lastTime && now - lastTime < VIEW_DEBOUNCE_MS) {
    return false;
  }
  recentViews.set(key, now);
  if (recentViews.size > 2000) {
    for (const [k, t] of recentViews.entries()) {
      if (now - t > VIEW_DEBOUNCE_MS * 2) recentViews.delete(k);
    }
  }
  return true;
};

// ดึงรายละเอียดสถานที่ + อัปเดตการเข้าชม (view_count)
router.get("/places/:category/:id", async (req, res) => {
  const { category, id } = req.params;
  const doCount = shouldCountView(req, category, id);
  try {
    if (CATS[category]) {
      const c = CATS[category];
      if (doCount) {
        await pool.query(`UPDATE ${c.table} SET view_count = COALESCE(view_count, 0) + 1 WHERE ${c.pk} = ?`, [id]); /*ทุกครั้งที่มีคนคลิกเข้ามาดูรายละเอียดของสถานที่ใดๆ ระบบจะบวกคะแนนเพิ่มทันที 1 คะแนน*/
      }

      const [rows] = await pool.query(`${selectFor(category)} WHERE t.${c.pk} = ?`, [id]);
      if (!rows.length) return res.status(404).json({ message: "ไม่พบข้อมูลสถานที่นี้" });
      const [imgs] = await pool.query(`SELECT file_name FROM ${c.img} WHERE ${c.pk} = ? ORDER BY image_id`, [id]);
      return res.json({ ...rows[0], gallery: imgs.map((i) => i.file_name) });
    }

    // ตรวจสอบกับหมวดหมู่เพิ่มเติมในตาราง categories (TC 4.1)
    const [catRows] = await pool.query("SELECT * FROM categories WHERE category_key = ?", [category]);
    if (!catRows.length) return res.status(400).json({ message: "ไม่พบหมวดข้อมูลที่ระบุ" });

    if (doCount) {
      await pool.query(`UPDATE custom_places SET view_count = COALESCE(view_count, 0) + 1 WHERE place_id = ? AND category_key = ?`, [id, category]);
    }
    const [rows] = await pool.query(
      `SELECT p.place_id AS id, p.category_key AS category, COALESCE(cat.name, p.category_key) AS category_name,
       p.name, p.description, p.province, p.type, p.open_time, p.close_time, p.starting_price,
       p.latitude, p.longitude, p.image_url, COALESCE(p.view_count, 0) AS view_count
       FROM custom_places p
       LEFT JOIN categories cat ON cat.category_key = p.category_key
       WHERE p.place_id = ? AND p.category_key = ?`,
      [id, category]
    );
    if (!rows.length) return res.status(404).json({ message: "ไม่พบข้อมูลสถานที่นี้" });
    const [imgs] = await pool.query(`SELECT file_name FROM custom_place_images WHERE place_id = ? ORDER BY image_id`, [id]);
    res.json({ ...rows[0], gallery: imgs.map((i) => i.file_name) });
  } catch (err) {
    serverError(res, err);
  }
});

/* ------------------------------------------------------------------ */
/*  3. [ADMIN] เพิ่ม / แก้ไข / ลบ สถานที่                                 */
/* ------------------------------------------------------------------ */

const placeFields = (category, b) => {
  if (category === "accommodations") {
    return {
      name: String(b.name || "").trim(), type: toNull(b.type), description: toNull(b.description),
      province: toNull(b.province), starting_price: toNum(b.starting_price) ?? 0,
      latitude: toNum(b.latitude), longitude: toNum(b.longitude), image_url: toNull(b.image_url),
    };
  }
  return {
    name: String(b.name || "").trim(), description: toNull(b.description), province: toNull(b.province),
    open_time: toNull(b.open_time), close_time: toNull(b.close_time), starting_price: toNum(b.starting_price) ?? 0,
    type: toNull(b.type), latitude: toNum(b.latitude), longitude: toNum(b.longitude), image_url: toNull(b.image_url),
  };
};

const saveGallery = async (conn, category, id, gallery) => {
  if (!Array.isArray(gallery)) return;
  const c = CATS[category];
  if (c) {
    await conn.query(`DELETE FROM ${c.img} WHERE ${c.pk} = ?`, [id]);
    const urls = gallery.map((u) => String(u).trim()).filter(Boolean);
    for (const u of urls) await conn.query(`INSERT INTO ${c.img} (${c.pk}, file_name) VALUES (?, ?)`, [id, u]);
  } else {
    await conn.query("DELETE FROM custom_place_images WHERE place_id = ?", [id]);
    const urls = gallery.map((u) => String(u).trim()).filter(Boolean);
    for (const u of urls) await conn.query("INSERT INTO custom_place_images (place_id, file_name) VALUES (?, ?)", [id, u]);
  }
};

router.post("/places/:category", requireAdmin, async (req, res) => {
  const { category } = req.params;
  const isStandard = Boolean(CATS[category]);

  if (!isStandard) {
    const [catRows] = await pool.query("SELECT * FROM categories WHERE category_key = ?", [category]);
    if (!catRows.length) return res.status(400).json({ message: "ไม่พบหมวดข้อมูลที่ระบุในระบบ" });
  }

  const f = placeFields(category, req.body);
  if (!f.name) return res.status(400).json({ message: "กรุณากรอกชื่อ" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (isStandard) {
      const cols = Object.keys(f).filter((k) => k !== 'type' || category === 'accommodations');
      const [r] = await conn.query(
        `INSERT INTO ${CATS[category].table} (${cols.join(",")}) VALUES (${cols.map(() => "?").join(",")})`,
        cols.map((k) => f[k])
      );
      await saveGallery(conn, category, r.insertId, req.body.gallery);
      await conn.commit();
      return res.status(201).json({ message: "เพิ่มข้อมูลสำเร็จแล้ว!", id: r.insertId });
    } else {
      const [r] = await conn.query(
        `INSERT INTO custom_places (category_key, name, description, province, open_time, close_time, starting_price, type, latitude, longitude, image_url)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          category,
          f.name,
          toNull(req.body.description),
          toNull(req.body.province),
          toNull(req.body.open_time),
          toNull(req.body.close_time),
          toNum(req.body.starting_price) ?? 0,
          toNull(req.body.type),
          toNum(req.body.latitude),
          toNum(req.body.longitude),
          toNull(req.body.image_url),
        ]
      );
      await saveGallery(conn, category, r.insertId, req.body.gallery);
      await conn.commit();
      return res.status(201).json({ message: "เพิ่มข้อมูลสำเร็จแล้ว!", id: r.insertId });
    }
  } catch (err) {
    await conn.rollback();
    serverError(res, err, "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
  } finally {
    conn.release();
  }
});

router.put("/places/:category/:id", requireAdmin, async (req, res) => {
  const { category, id } = req.params;
  const isStandard = Boolean(CATS[category]);

  if (!isStandard) {
    const [catRows] = await pool.query("SELECT * FROM categories WHERE category_key = ?", [category]);
    if (!catRows.length) return res.status(400).json({ message: "ไม่พบหมวดข้อมูลที่ระบุในระบบ" });
  }

  const f = placeFields(category, req.body);
  if (!f.name) return res.status(400).json({ message: "กรุณากรอกชื่อ" });

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    if (isStandard) {
      const c = CATS[category];
      const cols = Object.keys(f).filter((k) => k !== 'type' || category === 'accommodations');
      const [r] = await conn.query(
        `UPDATE ${c.table} SET ${cols.map((k) => `${k} = ?`).join(", ")} WHERE ${c.pk} = ?`,
        [...cols.map((k) => f[k]), id]
      );
      if (!r.affectedRows) {
        await conn.rollback();
        return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการแก้ไข" });
      }
      await saveGallery(conn, category, id, req.body.gallery);
      await conn.commit();
      return res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
    } else {
      const [r] = await conn.query(
        `UPDATE custom_places SET
           name = ?, description = ?, province = ?, open_time = ?, close_time = ?,
           starting_price = ?, type = ?, latitude = ?, longitude = ?, image_url = ?
         WHERE place_id = ? AND category_key = ?`,
        [
          f.name,
          toNull(req.body.description),
          toNull(req.body.province),
          toNull(req.body.open_time),
          toNull(req.body.close_time),
          toNum(req.body.starting_price) ?? 0,
          toNull(req.body.type),
          toNum(req.body.latitude),
          toNum(req.body.longitude),
          toNull(req.body.image_url),
          id,
          category,
        ]
      );
      if (!r.affectedRows) {
        await conn.rollback();
        return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการแก้ไข" });
      }
      await saveGallery(conn, category, id, req.body.gallery);
      await conn.commit();
      return res.json({ message: "แก้ไขข้อมูลสำเร็จ" });
    }
  } catch (err) {
    await conn.rollback();
    serverError(res, err, "แก้ไขข้อมูลไม่สำเร็จ");
  } finally {
    conn.release();
  }
});

router.delete("/places/:category/:id", requireAdmin, async (req, res) => {
  const { category, id } = req.params;
  const isStandard = Boolean(CATS[category]);
  try {
    if (isStandard) {
      const c = CATS[category];
      const [r] = await pool.query(`UPDATE ${c.table} SET is_deleted = 1 WHERE ${c.pk} = ?`, [id]);
      if (!r.affectedRows) return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการลบ" });
      return res.json({ message: "ลบข้อมูลสำเร็จ" });
    } else {
      const [r] = await pool.query(`UPDATE custom_places SET is_deleted = 1 WHERE place_id = ? AND category_key = ?`, [id, category]);
      if (!r.affectedRows) return res.status(404).json({ message: "ไม่พบข้อมูลที่ต้องการลบ" });
      return res.json({ message: "ลบข้อมูลสำเร็จ" });
    }
  } catch (err) {
    serverError(res, err, "ลบข้อมูลไม่สำเร็จ");
  }
});

/* ------------------------------------------------------------------ */
/*  3.1 [ADMIN] จัดการหมวดหมู่ข้อมูล (เพิ่ม / ลบ / แก้ไข ข้อ 4.1)          */
/* ------------------------------------------------------------------ */

// ฟังก์ชันนับจำนวนสถานที่ในแต่ละหมวดหมู่
const getCategoryPlaceCount = async (catKey) => {
  try {
    if (CATS[catKey]) {
      const [r] = await pool.query(`SELECT COUNT(*) AS total FROM ${CATS[catKey].table} WHERE COALESCE(is_deleted, 0) = 0`);
      return Number(r[0].total) || 0;
    }
    const [r] = await pool.query(`SELECT COUNT(*) AS total FROM custom_places WHERE category_key = ? AND COALESCE(is_deleted, 0) = 0`, [catKey]);
    return Number(r[0].total) || 0;
  } catch {
    return 0;
  }
};

// ดึงรายการหมวดหมู่ทั้งหมด (สาธารณะ / เมนูหน้าเว็บ)
router.get("/categories", async (req, res) => {
  try {
    const [cats] = await pool.query("SELECT * FROM categories ORDER BY sort_order ASC, category_id ASC");
    const result = await Promise.all(
      cats.map(async (c) => ({
        ...c,
        place_count: await getCategoryPlaceCount(c.category_key),
      }))
    );
    res.json(result);
  } catch (err) {
    serverError(res, err, "ไม่สามารถดึงข้อมูลหมวดหมู่ได้");
  }
});

// [ADMIN] ดึงรายการหมวดหมู่ทั้งหมดพร้อมสถิติสถานที่
router.get("/admin/categories", requireAdmin, async (req, res) => {
  try {
    const [cats] = await pool.query("SELECT * FROM categories ORDER BY sort_order ASC, category_id ASC");
    const result = await Promise.all(
      cats.map(async (c) => ({
        ...c,
        place_count: await getCategoryPlaceCount(c.category_key),
      }))
    );
    res.json(result);
  } catch (err) {
    serverError(res, err, "ไม่สามารถดึงรายการหมวดหมู่ได้");
  }
});

// [ADMIN] เพิ่มหมวดหมู่สถานที่ (TC 4.1)
router.post("/admin/categories", requireAdmin, async (req, res) => {
  const name = (req.body.name || "").trim();
  let category_key = (req.body.category_key || "").trim().toLowerCase().replace(/[^a-z0-9_]/g, "_");
  const description = (req.body.description || "").trim();
  const icon = (req.body.icon || "MapPin").trim();
  const color = (req.body.color || "pink").trim();
  const sort_order = Number(req.body.sort_order) || 0;

  if (!name) return res.status(400).json({ message: "กรุณาระบุชื่อหมวดหมู่" });

  if (!category_key) {
    category_key = `cat_${Date.now()}`;
  }

  try {
    const [existingKey] = await pool.query("SELECT category_id FROM categories WHERE category_key = ?", [category_key]);
    if (existingKey.length > 0) {
      return res.status(400).json({ message: "รหัสหมวดหมู่นี้มีอยู่ในระบบแล้ว กรุณาใช้รหัสอื่น" });
    }

    const [existingName] = await pool.query("SELECT category_id FROM categories WHERE name = ?", [name]);
    if (existingName.length > 0) {
      return res.status(400).json({ message: "ชื่อหมวดหมู่นี้มีอยู่ในระบบแล้ว" });
    }

    const [result] = await pool.query(
      "INSERT INTO categories (category_key, name, description, icon, color, is_system, sort_order) VALUES (?, ?, ?, ?, ?, 0, ?)",
      [category_key, name, description || null, icon, color, sort_order]
    );

    res.status(201).json({
      message: `เพิ่มหมวดหมู่ "${name}" สำเร็จเรียบร้อยแล้ว`,
      category_id: result.insertId,
      category_key,
    });
  } catch (err) {
    serverError(res, err, "ไม่สามารถเพิ่มหมวดหมู่ได้");
  }
});

// [ADMIN] แก้ไขหมวดหมู่สถานที่ (TC 4.1)
router.put("/admin/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const name = (req.body.name || "").trim();
  const description = (req.body.description || "").trim();
  const icon = (req.body.icon || "MapPin").trim();
  const color = (req.body.color || "pink").trim();
  const sort_order = Number(req.body.sort_order) || 0;

  if (!name) return res.status(400).json({ message: "กรุณาระบุชื่อหมวดหมู่" });

  try {
    const [rows] = await pool.query("SELECT * FROM categories WHERE category_id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "ไม่พบหมวดหมู่ที่ต้องการแก้ไข" });

    // ตรวจสอบชื่อซ้ำกับหมวดหมู่อื่น
    const [dup] = await pool.query("SELECT category_id FROM categories WHERE name = ? AND category_id != ?", [name, id]);
    if (dup.length > 0) {
      return res.status(400).json({ message: "ชื่อหมวดหมู่นี้ถูกใช้ไปแล้ว กรุณาระบุชื่ออื่น" });
    }

    await pool.query(
      "UPDATE categories SET name = ?, description = ?, icon = ?, color = ?, sort_order = ? WHERE category_id = ?",
      [name, description || null, icon, color, sort_order, id]
    );

    res.json({ message: `แก้ไขหมวดหมู่ "${name}" สำเร็จเรียบร้อยแล้ว` });
  } catch (err) {
    serverError(res, err, "ไม่สามารถแก้ไขหมวดหมู่ได้");
  }
});

// [ADMIN] ลบหมวดหมู่สถานที่ (TC 4.1)
router.delete("/admin/categories/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);

  try {
    const [rows] = await pool.query("SELECT * FROM categories WHERE category_id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "ไม่พบหมวดหมู่ที่ต้องการลบ" });

    const cat = rows[0];

    // ป้องกันการลบหมวดหมู่หลักของระบบ
    if (cat.is_system === 1 || ["attractions", "restaurants", "accommodations"].includes(cat.category_key)) {
      return res.status(400).json({
        message: `หมวดหมู่ "${cat.name}" เป็นหมวดหมู่หลักของระบบ ไม่สามารถลบได้ (แต่สามารถแก้ไขชื่อหรือรายละเอียดได้)`,
      });
    }

    // ตรวจสอบว่ายังมีสถานที่ในหมวดหมู่นี้หรือไม่
    const placeCount = await getCategoryPlaceCount(cat.category_key);
    if (placeCount > 0) {
      return res.status(400).json({
        message: `ไม่สามารถลบหมวดหมู่ "${cat.name}" ได้ เนื่องจากยังมีข้อมูลสถานที่อยู่ ${placeCount} แห่ง`,
      });
    }

    await pool.query("DELETE FROM categories WHERE category_id = ?", [id]);
    res.json({ message: `ลบหมวดหมู่ "${cat.name}" สำเร็จเรียบร้อยแล้ว` });
  } catch (err) {
    serverError(res, err, "ไม่สามารถลบหมวดหมู่ได้");
  }
});

/* ------------------------------------------------------------------ */
/*  4. [ADMIN] สถิติ / สมาชิก                                            */
/* ------------------------------------------------------------------ */

router.get("/admin/stats", requireAdmin, async (req, res) => {
  try {
    const count = async (t) => {
      const isPlace = ["attractions", "restaurants", "accommodations"].includes(t);
      const where = isPlace ? " WHERE COALESCE(is_deleted, 0) = 0" : "";
      return (await pool.query(`SELECT COUNT(*) AS total FROM ${t}${where}`))[0][0].total;
    };
    const pendingResets = (await pool.query("SELECT COUNT(*) AS total FROM password_reset_requests WHERE status = 'pending'"))[0][0].total;
    const [customRows] = await pool.query("SELECT COUNT(*) AS total FROM custom_places WHERE COALESCE(is_deleted, 0) = 0");
    const totalCustomPlaces = Number(customRows[0]?.total) || 0;

    res.json({
      totalUsers: await count("members"),
      totalAttractions: await count("attractions"),
      totalRestaurants: await count("restaurants"),
      totalAccommodations: await count("accommodations"),
      totalCustomPlaces,
      totalCategories: await count("categories"),
      totalPlans: await count("travel_plans"),
      pendingResets,
    });
  } catch (err) {
    serverError(res, err, "ไม่สามารถดึงข้อมูลสถิติได้");
  }
});

router.get("/admin/users", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT m.member_id, m.name, m.email, m.role, m.google_id,
        (SELECT COUNT(*) FROM favorites f WHERE f.member_id = m.member_id) AS favorites_count,
        (SELECT COUNT(*) FROM travel_plans p WHERE p.member_id = m.member_id) AS plans_count,
        (SELECT COUNT(*) FROM password_reset_requests r WHERE r.member_id = m.member_id AND r.status = 'pending') AS pending_reset_requests
       FROM members m ORDER BY m.member_id DESC`
    );
    res.json(rows);
  } catch (err) {
    serverError(res, err, "ไม่สามารถดึงรายชื่อสมาชิกได้");
  }
});

/* [ADMIN] ดึงรายการคำขอรีเซ็ตรหัสผ่านทั้งหมด (TC: N-001) */
router.get("/admin/password-resets", requireAdmin, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.request_id, r.member_id, r.email, r.reason, r.status, r.temp_password, r.created_at, r.updated_at,
              m.name, m.role, m.profile_picture,
              (SELECT COUNT(*) FROM favorites f WHERE f.member_id = m.member_id) AS favorites_count,
              (SELECT COUNT(*) FROM travel_plans p WHERE p.member_id = m.member_id) AS plans_count
       FROM password_reset_requests r
       LEFT JOIN members m ON r.member_id = m.member_id
       ORDER BY 
         CASE WHEN r.status = 'pending' THEN 0 ELSE 1 END,
         r.request_id DESC`
    );
    res.json(rows);
  } catch (err) {
    serverError(res, err, "ไม่สามารถดึงรายการคำขอรีเซ็ตรหัสผ่านได้");
  }
});

/* [ADMIN] อนุมัติคำขอรีเซ็ตรหัสผ่าน ให้สมาชิกตั้งรหัสผ่านใหม่ (TC: N-001) */
router.put("/admin/password-resets/:id/approve", requireAdmin, async (req, res) => {
  const requestId = Number(req.params.id);

  try {
    const [requests] = await pool.query("SELECT * FROM password_reset_requests WHERE request_id = ?", [requestId]);
    if (requests.length === 0) return res.status(404).json({ message: "ไม่พบคำขอนี้ในระบบ" });

    const reqData = requests[0];

    // อัปเดตสถานะคำขอเป็น approved ให้สิทธิ์สมาชิกตั้งรหัสผ่านใหม่
    await pool.query(
      "UPDATE password_reset_requests SET status = 'approved', updated_at = NOW() WHERE request_id = ?",
      [requestId]
    );

    // ดึงชื่อสมาชิกเพื่อนำไปใส่ในอีเมลแจ้งเตือน
    const [members] = await pool.query("SELECT name FROM members WHERE member_id = ?", [reqData.member_id]);
    const memberName = members.length > 0 ? members[0].name : "สมาชิก";

    // ส่งอีเมลแจ้งเตือนไปยังอีเมลของสมาชิก
    const emailResult = await sendPasswordResetApprovedEmail({
      to: reqData.email,
      name: memberName,
      tempPassword: reqData.temp_password || null,
    });

    let messageText = `อนุมัติให้สมาชิก (${reqData.email}) ตั้งรหัสผ่านใหม่เรียบร้อยแล้ว`;
    if (emailResult.sent) {
      if (emailResult.isReal) {
        messageText += " และส่งอีเมลแจ้งเตือนไปยังสมาชิกเรียบร้อยแล้ว";
      } else {
        messageText += " (โหมดทดสอบ: ส่งเข้า Ethereal Sandbox แล้ว กรุณาตั้งค่า EMAIL_USER/PASS ใน api2/.env หากต้องการส่งเข้า Gmail จริง)";
      }
    } else if (emailResult.error) {
      messageText += ` (การส่งอีเมลไม่สำเร็จ: ${emailResult.error})`;
    }

    res.json({
      message: messageText,
      member_id: reqData.member_id,
      email: reqData.email,
      email_sent: emailResult.sent,
      is_real: emailResult.isReal,
      email_preview: emailResult.previewUrl || null,
    });
  } catch (err) {
    serverError(res, err, "ไม่สามารถอนุมัติคำขอรีเซ็ตรหัสผ่านได้");
  }
});

/* [ADMIN] ปฏิเสธคำขอรีเซ็ตรหัสผ่าน (TC: N-001) */
router.put("/admin/password-resets/:id/reject", requireAdmin, async (req, res) => {
  const requestId = Number(req.params.id);
  try {
    const [r] = await pool.query(
      "UPDATE password_reset_requests SET status = 'rejected' WHERE request_id = ?",
      [requestId]
    );
    if (!r.affectedRows) return res.status(404).json({ message: "ไม่พบคำขอนี้ในระบบ" });
    res.json({ message: "ปฏิเสธคำขอรีเซ็ตรหัสผ่านเรียบร้อยแล้ว" });
  } catch (err) {
    serverError(res, err, "ไม่สามารถปฏิเสธคำขอได้");
  }
});

/* [ADMIN] ลบประวัติคำขอรีเซ็ตรหัสผ่าน */
router.delete("/admin/password-resets/:id", requireAdmin, async (req, res) => {
  const requestId = Number(req.params.id);
  try {
    const [r] = await pool.query("DELETE FROM password_reset_requests WHERE request_id = ?", [requestId]);
    if (!r.affectedRows) return res.status(404).json({ message: "ไม่พบคำขอนี้" });
    res.json({ message: "ลบประวัติคำขอสำเร็จ" });
  } catch (err) {
    serverError(res, err, "ไม่สามารถลบประวัติคำขอได้");
  }
});

router.put("/admin/users/:id/role", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { role } = req.body;
  if (!["user", "admin"].includes(role)) return res.status(400).json({ message: "สิทธิ์ไม่ถูกต้อง" });
  if (id === req.user.id) return res.status(400).json({ message: "ไม่สามารถเปลี่ยนสิทธิ์ของตัวเองได้" });
  try {
    await pool.query("UPDATE members SET role = ? WHERE member_id = ?", [role, id]);
    res.json({ message: "เปลี่ยนสิทธิ์สำเร็จ" });
  } catch (err) {
    serverError(res, err);
  }
});

// รีเซ็ตรหัสผ่านชั่วคราวให้สมาชิก (กรณีสมาชิกแจ้งลืมรหัสผ่าน TC: N-001)
router.put("/admin/users/:id/reset-password", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const newPassword = (req.body.new_password || "").trim();
  if (!newPassword || newPassword.length < 6) {
    return res.status(400).json({ message: "รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร" });
  }
  try {
    const hashed = await bcrypt.hash(newPassword, 10);
    const [r] = await pool.query("UPDATE members SET password = ? WHERE member_id = ?", [hashed, id]);
    if (!r.affectedRows) return res.status(404).json({ message: "ไม่พบสมาชิก" });

    // ดึงข้อมูลสมาชิกเพื่อนำไปส่งอีเมล
    const [userRows] = await pool.query("SELECT name, email FROM members WHERE member_id = ?", [id]);
    const user = userRows[0];

    // ซิงค์คำขอที่ค้างอยู่ของสมาชิกคนนี้ให้เป็น approved ด้วย
    await pool.query(
      "UPDATE password_reset_requests SET status = 'approved', temp_password = ? WHERE member_id = ? AND status = 'pending'",
      [newPassword, id]
    );

    // ส่งอีเมลแจ้งเตือนพร้อมรหัสผ่านชั่วคราว
    let emailSent = false;
    let isReal = false;
    let emailPreview = null;
    if (user && user.email) {
      const emailResult = await sendPasswordResetApprovedEmail({
        to: user.email,
        name: user.name,
        tempPassword: newPassword,
      });
      emailSent = emailResult.sent;
      isReal = emailResult.isReal;
      emailPreview = emailResult.previewUrl || null;
    }

    let messageText = "ตั้งรหัสผ่านชั่วคราวให้สมาชิกสำเร็จ";
    if (emailSent) {
      if (isReal) {
        messageText += ` และส่งอีเมลแจ้งรหัสผ่านชั่วคราวไปยัง ${user.email} เรียบร้อยแล้ว`;
      } else {
        messageText += ` (โหมดทดสอบ: ส่งเข้า Ethereal Sandbox แล้ว กรุณาตั้งค่า EMAIL_USER/PASS ใน api2/.env หากต้องการส่งเข้า Gmail จริง)`;
      }
    }

    res.json({
      message: messageText,
      new_password: newPassword,
      email_sent: emailSent,
      is_real: isReal,
      email_preview: emailPreview,
    });
  } catch (err) {
    serverError(res, err, "ไม่สามารถรีเซ็ตรหัสผ่านได้");
  }
});

router.delete("/admin/users/:id", requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (id === req.user.id) return res.status(400).json({ message: "ไม่สามารถลบบัญชีของตัวเองได้" });
  try {
    await pool.query("DELETE FROM members WHERE member_id = ?", [id]);
    res.json({ message: "ลบสมาชิกสำเร็จ" });
  } catch (err) {
    serverError(res, err);
  }
});

/* ------------------------------------------------------------------ */
/*  5. รายการโปรด (ต้องล็อกอิน)                                           */
/* ------------------------------------------------------------------ */

router.get("/favorites", requireAuth, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT f.favorite_id, p.* FROM favorites f
       JOIN (${UNION_ALL}) AS p
         ON (f.attraction_id = p.id AND p.category = 'attractions')
         OR (f.restaurant_id = p.id AND p.category = 'restaurants')
         OR (f.accommodation_id = p.id AND p.category = 'accommodations')
       WHERE f.member_id = ? AND p.is_deleted = 0 ORDER BY f.favorite_id DESC`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    serverError(res, err, "ไม่สามารถดึงรายการโปรดได้");
  }
});

router.post("/favorites", requireAuth, async (req, res) => {
  const { category, id } = req.body;
  const c = CATS[category];
  if (!c || !id) return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
  try {
    const [exists] = await pool.query(`SELECT favorite_id FROM favorites WHERE member_id = ? AND ${c.pk} = ?`, [req.user.id, id]);
    if (exists.length) return res.json({ message: "มีอยู่ในรายการโปรดแล้ว" });
    await pool.query(`INSERT INTO favorites (member_id, ${c.pk}) VALUES (?, ?)`, [req.user.id, id]);
    res.status(201).json({ message: "เพิ่มในรายการโปรดแล้ว" });
  } catch (err) {
    serverError(res, err, "เพิ่มรายการโปรดไม่สำเร็จ");
  }
});

router.delete("/favorites/:category/:id", requireAuth, async (req, res) => {
  const c = CATS[req.params.category];
  if (!c) return res.status(400).json({ message: "ข้อมูลไม่ถูกต้อง" });
  try {
    await pool.query(`DELETE FROM favorites WHERE member_id = ? AND ${c.pk} = ?`, [req.user.id, req.params.id]);
    res.json({ message: "ลบออกจากรายการโปรดแล้ว" });
  } catch (err) {
    serverError(res, err, "ลบรายการโปรดไม่สำเร็จ");
  }
});

/* ------------------------------------------------------------------ */
/*  6. แผนการเดินทาง (ต้องล็อกอิน)                                        */
/* ------------------------------------------------------------------ */

const loadPlanItems = async (planIds) => {
  if (!planIds.length) return {};
  const [rows] = await pool.query(
    `SELECT d.detail_id, d.plan_id, d.day_sequence, p.*
     FROM plan_details d
     JOIN (${UNION_ALL}) AS p
       ON (d.attraction_id = p.id AND p.category = 'attractions')
       OR (d.restaurant_id = p.id AND p.category = 'restaurants')
       OR (d.accommodation_id = p.id AND p.category = 'accommodations')
     WHERE d.plan_id IN (?) ORDER BY d.day_sequence, d.detail_id`,
    [planIds]
  );
  const map = {};
  rows.forEach((r) => (map[r.plan_id] = map[r.plan_id] || []).push(r));
  return map;
};

const normalizeItems = (items) =>
  (Array.isArray(items) ? items : [])
    .filter((i) => CATS[i.category] && Number(i.id) > 0)
    .map((i) => ({ category: i.category, id: Number(i.id), day: Math.max(1, Number(i.day) || 1) }));

const writeItems = async (conn, planId, items) => {
  await conn.query("DELETE FROM plan_details WHERE plan_id = ?", [planId]);
  for (const it of items) {
    await conn.query(`INSERT INTO plan_details (plan_id, ${CATS[it.category].pk}, day_sequence) VALUES (?, ?, ?)`, [planId, it.id, it.day]);
  }
};

const validPlan = (b) => {
  if (!String(b.plan_name || "").trim()) return "กรุณาตั้งชื่อแผนการเดินทาง";
  if (b.start_date && b.end_date && b.end_date < b.start_date) return "วันสิ้นสุดต้องไม่ก่อนวันเริ่มต้น";
  return null;
};

router.get("/plans", requireAuth, async (req, res) => {
  try {
    const [plans] = await pool.query("SELECT * FROM travel_plans WHERE member_id = ? ORDER BY plan_id DESC", [req.user.id]);
    const items = await loadPlanItems(plans.map((p) => p.plan_id));
    res.json(plans.map((p) => ({ ...p, items: items[p.plan_id] || [] })));
  } catch (err) {
    serverError(res, err, "ไม่สามารถดึงแผนการเดินทางได้");
  }
});

router.post("/plans", requireAuth, async (req, res) => {
  const err = validPlan(req.body);
  if (err) return res.status(400).json({ message: err });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      "INSERT INTO travel_plans (member_id, plan_name, start_date, end_date) VALUES (?, ?, ?, ?)",
      [req.user.id, req.body.plan_name.trim(), toNull(req.body.start_date), toNull(req.body.end_date)]
    );
    await writeItems(conn, r.insertId, normalizeItems(req.body.items));
    await conn.commit();
    res.status(201).json({ message: "บันทึกแผนการเดินทางสำเร็จ", plan_id: r.insertId });
  } catch (e) {
    await conn.rollback();
    serverError(res, e, "บันทึกแผนไม่สำเร็จ");
  } finally {
    conn.release();
  }
});

router.put("/plans/:id", requireAuth, async (req, res) => {
  const err = validPlan(req.body);
  if (err) return res.status(400).json({ message: err });
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const [r] = await conn.query(
      "UPDATE travel_plans SET plan_name = ?, start_date = ?, end_date = ? WHERE plan_id = ? AND member_id = ?",
      [req.body.plan_name.trim(), toNull(req.body.start_date), toNull(req.body.end_date), req.params.id, req.user.id]
    );
    if (!r.affectedRows) {
      await conn.rollback();
      return res.status(404).json({ message: "ไม่พบแผนการเดินทาง" });
    }
    await writeItems(conn, req.params.id, normalizeItems(req.body.items));
    await conn.commit();
    res.json({ message: "แก้ไขแผนการเดินทางสำเร็จ" });
  } catch (e) {
    await conn.rollback();
    serverError(res, e, "แก้ไขแผนไม่สำเร็จ");
  } finally {
    conn.release();
  }
});

router.delete("/plans/:id", requireAuth, async (req, res) => {
  try {
    const [r] = await pool.query("DELETE FROM travel_plans WHERE plan_id = ? AND member_id = ?", [req.params.id, req.user.id]);
    if (!r.affectedRows) return res.status(404).json({ message: "ไม่พบแผนการเดินทาง" });
    res.json({ message: "ลบแผนการเดินทางสำเร็จ" });
  } catch (err) {
    serverError(res, err, "ลบแผนไม่สำเร็จ");
  }
});

router.get("/provinces", (req, res) => res.json(PROVINCES));

module.exports = router;