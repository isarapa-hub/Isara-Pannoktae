-- Migration: เพิ่มคอลัมน์ is_deleted สำหรับระบบ Soft Delete สถานที่
-- เพื่อไม่ให้การลบสถานที่ของแอดมินส่งผลกระทบต่อแผนการเดินทางที่ผู้ใช้งานบันทึกไว้

ALTER TABLE attractions ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) DEFAULT 0;
ALTER TABLE restaurants ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) DEFAULT 0;
ALTER TABLE accommodations ADD COLUMN IF NOT EXISTS is_deleted TINYINT(1) DEFAULT 0;
