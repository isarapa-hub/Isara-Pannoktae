const mysql = require("mysql2/promise");

// ตั้งค่าได้ผ่าน environment variable (ถ้าไม่ตั้ง จะใช้ค่าเดิมของ XAMPP)
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "project_jp",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: "utf8mb4",
  dateStrings: true,
});

module.exports = pool;
