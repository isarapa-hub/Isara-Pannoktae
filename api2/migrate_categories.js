const pool = require("./db");

async function migrate() {
  console.log("Creating categories table...");
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
    console.log("Seeded initial categories!");
  } else {
    console.log("Categories already exist:", rows[0].count);
  }

  const [cats] = await pool.query("SELECT * FROM categories ORDER BY sort_order ASC, category_id ASC");
  console.log("Current categories:", cats);
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
