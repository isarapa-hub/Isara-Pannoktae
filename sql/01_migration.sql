-- รันไฟล์นี้ 1 ครั้งบนฐานข้อมูล project_jp (phpMyAdmin > SQL)
SET NAMES utf8mb4;

-- 1) ที่พักต้องมีจังหวัด เพื่อให้กรองตามจังหวัดได้เหมือนหมวดอื่น
ALTER TABLE accommodations ADD COLUMN province VARCHAR(100) DEFAULT NULL AFTER description;

-- 2) รูปโปรไฟล์ (รองรับทั้งลิงก์และรูปที่อัปโหลดแบบ base64)
ALTER TABLE members MODIFY profile_picture MEDIUMTEXT DEFAULT NULL;

-- 3) ชื่อรูปในตารางแกลเลอรีเก็บเป็นลิงก์ภาพ
ALTER TABLE attraction_images MODIFY file_name TEXT NOT NULL;
ALTER TABLE restaurant_images MODIFY file_name TEXT NOT NULL;
ALTER TABLE accommodation_images MODIFY file_name TEXT NOT NULL;

-- 4) รายการโปรด: กันเพิ่มซ้ำ และบังคับให้ระบุสถานที่เพียง 1 ประเภทต่อแถว
ALTER TABLE favorites
  ADD UNIQUE KEY uq_fav_attraction (member_id, attraction_id),
  ADD UNIQUE KEY uq_fav_restaurant (member_id, restaurant_id),
  ADD UNIQUE KEY uq_fav_accommodation (member_id, accommodation_id),
  ADD CONSTRAINT chk_fav_one_target CHECK (
    (attraction_id IS NOT NULL) + (restaurant_id IS NOT NULL) + (accommodation_id IS NOT NULL) = 1
  );

-- 5) ที่พักที่มีอยู่เดิมให้ระบุจังหวัด
UPDATE accommodations SET province = 'โตเกียว' WHERE province IS NULL;
