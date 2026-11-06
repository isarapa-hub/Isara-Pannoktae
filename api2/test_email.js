require("dotenv").config();
const { sendPasswordResetApprovedEmail } = require("./emailService");

const targetEmail = process.argv[2] || process.env.EMAIL_USER;

if (!targetEmail) {
  console.log("==================================================================");
  console.log(" กรุณาระบุอีเมลปลายทางที่ต้องการทดสอบส่ง เช่น:");
  console.log(" node api2/test_email.js your_email@gmail.com");
  console.log("==================================================================");
  process.exit(1);
}

console.log("------------------------------------------------------------------");
console.log(" กำลังเริ่มทดสอบการส่งอีเมลแจ้งเตือน...");
console.log(" ผู้ส่ง (EMAIL_USER):", process.env.EMAIL_USER || "(ยังไม่ได้ตั้งค่า - จะใช้ Ethereal Sandbox)");
console.log(" ผู้รับ:", targetEmail);
console.log("------------------------------------------------------------------");

(async () => {
  const result = await sendPasswordResetApprovedEmail({
    to: targetEmail,
    name: "คุณสมาชิกทดสอบ",
  });

  console.log("ผลลัพธ์การทดสอบ:", result);

  if (result.sent && result.isReal) {
    console.log(">>> สำเร็จ 100%! ส่งอีเมลแจ้งเตือนไปยังกล่องจดหมายจริงเรียบร้อยแล้ว <<<");
  } else if (result.sent && !result.isReal) {
    console.log(">>> ระบบทำงานสำเร็จในโหมดจำลอง (Ethereal Sandbox) <<<");
    console.log("เปิดดูตัวอย่างหน้าตาอีเมลที่สร้างขึ้นได้ที่ลิงก์นี้:");
    console.log(result.previewUrl);
    console.log("\n* หากต้องการส่งเข้า Gmail จริง กรุณากรอก EMAIL_USER และ EMAIL_PASS ใน api2/.env");
  } else {
    console.log(">>> เกิดข้อผิดพลาดในการส่ง:", result.error);
  }
  process.exit(0);
})();

