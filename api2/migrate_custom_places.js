const pool = require("./db");

async function migrate() {
  console.log("Creating custom_places and custom_place_images tables...");
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

  console.log("custom_places tables created successfully!");
  process.exit(0);
}

migrate().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});

