const crypto = require("crypto");

const JWT_SECRET = process.env.JWT_SECRET || "jp-trip-dev-secret-change-me";
const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
const sign = (data) => crypto.createHmac("sha256", JWT_SECRET).update(data).digest("base64url");

// สร้าง JWT (HS256) โดยไม่ต้องติดตั้งแพ็กเกจเพิ่ม
const signToken = (user) => {
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ id: user.member_id, role: user.role, exp: Math.floor(Date.now() / 1000) + 7 * 86400 });
  return `${head}.${body}.${sign(`${head}.${body}`)}`;
};

const verifyToken = (token) => {
  const [head, body, sig] = (token || "").split(".");
  if (!head || !body || !sig) throw new Error("bad token");
  const expected = Buffer.from(sign(`${head}.${body}`));
  const given = Buffer.from(sig);
  if (expected.length !== given.length || !crypto.timingSafeEqual(expected, given)) throw new Error("bad sig");
  const payload = JSON.parse(Buffer.from(body, "base64url").toString());
  if (payload.exp < Date.now() / 1000) throw new Error("expired");
  return payload;
};

const requireAuth = (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ message: "กรุณาเข้าสู่ระบบ" });
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: "เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่" });
  }
};

const requireAdmin = (req, res, next) =>
  requireAuth(req, res, () => {
    if (req.user.role !== "admin") return res.status(403).json({ message: "เฉพาะผู้ดูแลระบบเท่านั้น" });
    next();
  });

module.exports = { signToken, requireAuth, requireAdmin };
