-- รันไฟล์นี้บนฐานข้อมูล project_jp (phpMyAdmin > SQL) เพื่อสร้างตารางจัดการหมวดหมู่ข้อมูล (ข้อ 4.1)
SET NAMES utf8mb4;

CREATE TABLE IF NOT EXISTS `categories` (
  `category_id` INT AUTO_INCREMENT PRIMARY KEY,
  `category_key` VARCHAR(50) NOT NULL UNIQUE,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `icon` VARCHAR(50) DEFAULT 'MapPin',
  `color` VARCHAR(50) DEFAULT 'pink',
  `is_system` TINYINT(1) DEFAULT 0,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

INSERT IGNORE INTO `categories` (`category_key`, `name`, `description`, `icon`, `color`, `is_system`, `sort_order`) VALUES
('attractions', 'สถานที่ท่องเที่ยว', 'สถานที่ท่องเที่ยว จุดเช็คอิน และแลนด์มาร์กสำคัญทั่วภูมิภาคคันโต', 'MapPin', 'pink', 1, 1),
('restaurants', 'ร้านอาหาร', 'ร้านอาหาร คาเฟ่ ขนมหวาน และของอร่อยประจำย่านยอดนิยม', 'Utensils', 'amber', 1, 2),
('accommodations', 'ที่พัก', 'โรงแรม เรียวกัง โฮสเทล และที่พักผ่อนสบายใจในญี่ปุ่น', 'BedDouble', 'emerald', 1, 3);
