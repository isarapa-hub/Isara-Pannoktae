const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const nodemailer = require("nodemailer");

/**
 * ฟังก์ชันสร้าง Transporter สำหรับส่งอีเมล
 * - หากมีการระบุ EMAIL_USER และ EMAIL_PASS ใน .env จะใช้ Gmail SMTP หรือ SMTP ที่ตั้งไว้
 * - หากยังไม่ได้ตั้งค่า จะสร้าง Ethereal Test Account สำหรับจำลองการส่ง และสร้าง Preview URL
 */
const getTransporter = async () => {
  const user = process.env.EMAIL_USER || process.env.SMTP_USER;
  const pass = process.env.EMAIL_PASS || process.env.SMTP_PASS;

  if (user && pass) {
    const host = process.env.SMTP_HOST;
    const port = Number(process.env.SMTP_PORT);

    if (host) {
      return {
        transporter: nodemailer.createTransport({
          host,
          port: port || 587,
          secure: port === 465,
          auth: { user, pass },
        }),
        isReal: true,
        sender: process.env.EMAIL_FROM || user,
      };
    }

    // ค่าเริ่มต้นเป็น Gmail SMTP
    return {
      transporter: nodemailer.createTransport({
        service: "gmail",
        auth: { user, pass },
      }),
      isReal: true,
      sender: process.env.EMAIL_FROM || `"JP Trip Support" <${user}>`,
    };
  }

  // หากยังไม่ได้ตั้งค่าจริงใน .env ให้ใช้ Ethereal Test Account สำหรับการทดสอบ
  try {
    const testAccount = await nodemailer.createTestAccount();
    return {
      transporter: nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass,
        },
      }),
      isReal: false,
      sender: `"JP Trip Support (Test)" <${testAccount.user}>`,
    };
  } catch (err) {
    console.warn("[EmailService] ไม่สามารถสร้าง Test Account ได้:", err.message);
    return null;
  }
};

/**
 * ส่งอีเมลแจ้งเตือนเมื่อแอดมินอนุมัติคำขอรีเซ็ตรหัสผ่าน
 */
const sendPasswordResetApprovedEmail = async ({ to, name, tempPassword = null }) => {
  if (!to) return { sent: false, error: "ไม่มีอีเมลผู้รับ" };

  const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
  const resetLink = tempPassword
    ? `${frontendUrl}/login?action=temp&email=${encodeURIComponent(to)}`
    : `${frontendUrl}/login?action=reset&email=${encodeURIComponent(to)}`;

  const recipientName = name || "สมาชิก JP Trip";

  try {
    const transportInfo = await getTransporter();
    if (!transportInfo) {
      console.log(`[EmailService] จำลองการแจ้งเตือนอีเมลถึง ${to}: อนุมัติการรีเซ็ตรหัสผ่านเรียบร้อย`);
      return { sent: false, simulated: true, reason: "ยังไม่ได้ตั้งค่า EMAIL_USER/PASS ใน .env" };
    }

    const { transporter, isReal, sender } = transportInfo;

    const subject = tempPassword
      ? `[JP Trip] แจ้งรหัสผ่านชั่วคราวและการอนุมัติคำขอรีเซ็ตรหัสผ่านของคุณ`
      : `[JP Trip] คำขอแจ้งลืมรหัสผ่านของคุณได้รับการอนุมัติแล้ว - กำหนดรหัสผ่านใหม่`;

    const htmlContent = `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${subject}</title>
  <style>
    body {
      font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif, 'Noto Sans Thai';
      background-color: #f8fafc;
      margin: 0;
      padding: 24px;
      color: #1e293b;
    }
    .container {
      max-width: 580px;
      margin: 0 auto;
      background: #ffffff;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.05);
      border: 1px solid #e2e8f0;
    }
    .header {
      background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #4c0519 100%);
      padding: 36px 32px;
      text-align: center;
      color: #ffffff;
    }
    .brand-title {
      font-size: 24px;
      font-weight: 900;
      letter-spacing: -0.5px;
      margin: 0 0 6px 0;
      color: #ffffff;
    }
    .brand-sub {
      font-size: 13px;
      color: #fbcfe8;
      margin: 0;
      font-weight: 500;
    }
    .content {
      padding: 32px 32px 36px 32px;
    }
    .badge-approved {
      display: inline-block;
      padding: 6px 14px;
      background-color: #ecfdf5;
      color: #059669;
      border: 1px solid #a7f3d0;
      border-radius: 9999px;
      font-size: 12px;
      font-weight: 800;
      margin-bottom: 20px;
    }
    .greeting {
      font-size: 18px;
      font-weight: 800;
      color: #0f172a;
      margin: 0 0 14px 0;
    }
    .text {
      font-size: 14px;
      line-height: 1.65;
      color: #475569;
      margin: 0 0 20px 0;
    }
    .box-info {
      background: #f1f5f9;
      border-radius: 16px;
      padding: 18px 20px;
      margin-bottom: 24px;
      border: 1px solid #e2e8f0;
    }
    .box-info-item {
      display: flex;
      justify-content: space-between;
      margin-bottom: 8px;
      font-size: 13px;
    }
    .box-info-item:last-child {
      margin-bottom: 0;
    }
    .box-info-label {
      color: #64748b;
      font-weight: 500;
    }
    .box-info-value {
      color: #0f172a;
      font-weight: 700;
    }
    .temp-pass-card {
      background: #ecfdf5;
      border: 2px dashed #059669;
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin-bottom: 24px;
    }
    .temp-pass-label {
      font-size: 12px;
      font-weight: 700;
      color: #047857;
      margin-bottom: 6px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .temp-pass-code {
      font-size: 26px;
      font-weight: 900;
      font-family: 'Courier New', monospace;
      color: #065f46;
      letter-spacing: 2px;
      margin: 4px 0 8px 0;
    }
    .btn-container {
      text-align: center;
      margin: 28px 0;
    }
    .btn {
      display: inline-block;
      padding: 14px 32px;
      background: linear-gradient(135deg, #e11d48 0%, #db2777 100%);
      color: #ffffff !important;
      text-decoration: none;
      font-weight: 800;
      font-size: 14px;
      border-radius: 14px;
      box-shadow: 0 10px 20px -5px rgba(225, 29, 72, 0.4);
    }
    .steps {
      background: #faf5ff;
      border: 1px solid #f3e8ff;
      border-radius: 16px;
      padding: 18px 20px;
      margin-bottom: 24px;
      font-size: 13px;
      color: #581c87;
    }
    .steps-title {
      font-weight: 800;
      margin-bottom: 8px;
    }
    .steps ol {
      margin: 0;
      padding-left: 20px;
      line-height: 1.6;
    }
    .footer {
      background: #f8fafc;
      padding: 24px 32px;
      text-align: center;
      border-top: 1px solid #e2e8f0;
      font-size: 12px;
      color: #94a3b8;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="brand-title">🗾 JP TRIP</div>
      <p class="brand-sub">เว็บแอปพลิเคชันวางแผนการท่องเที่ยวญี่ปุ่นในแบบของคุณ</p>
    </div>

    <div class="content">
      <span class="badge-approved">✓ อนุมัติคำขอเรียบร้อยแล้ว</span>

      <h2 class="greeting">เรียนคุณ ${recipientName},</h2>

      <p class="text">
        ตามที่คุณได้ส่งคำขอแจ้งลืมรหัสผ่านสำหรับบัญชี <strong>${to}</strong> เข้ามาในระบบ ผู้ดูแลระบบ (Admin) ได้ทำการตรวจสอบและ <strong>อนุมัติคำขอของคุณเรียบร้อยแล้ว</strong>
      </p>

      <div class="box-info">
        <div class="box-info-item">
          <span class="box-info-label">บัญชีอีเมล:</span>
          <span class="box-info-value">${to}</span>
        </div>
        <div class="box-info-item">
          <span class="box-info-label">สถานะการดำเนินการ:</span>
          <span class="box-info-value" style="color: #059669;">อนุมัติแล้ว (Approved)</span>
        </div>
        <div class="box-info-item">
          <span class="box-info-label">เวลาที่อนุมัติ:</span>
          <span class="box-info-value">${new Date().toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })}</span>
        </div>
      </div>

      ${
        tempPassword
          ? `
      <div class="temp-pass-card">
        <div class="temp-pass-label">รหัสผ่านชั่วคราวของคุณ (Temporary Password)</div>
        <div class="temp-pass-code">${tempPassword}</div>
        <p style="font-size: 12px; color: #047857; margin: 0;">
          กรุณานำรหัสผ่านนี้ไปใช้เข้าสู่ระบบ และแนะนำให้เปลี่ยนรหัสผ่านใหม่ทันทีในหน้าโปรไฟล์เพื่อความปลอดภัย
        </p>
      </div>

      <div class="btn-container">
        <a href="${resetLink}" class="btn">เข้าสู่ระบบด้วยรหัสผ่านชั่วคราว →</a>
      </div>
      `
          : `
      <div class="steps">
        <div class="steps-title">📌 ขั้นตอนการกำหนดรหัสผ่านใหม่:</div>
        <ol>
          <li>คลิกปุ่ม <strong>"กำหนดรหัสผ่านใหม่ตอนนี้"</strong> ด้านล่างนี้</li>
          <li>กรอกรหัสผ่านใหม่ที่คุณต้องการ (ความยาวอย่างน้อย 8 ตัวอักษร)</li>
          <li>กดยืนยันเพื่อบันทึกและเข้าสู่ระบบเพื่อใช้งานวางแผนการเดินทางต่อได้ทันที</li>
        </ol>
      </div>

      <div class="btn-container">
        <a href="${resetLink}" class="btn">กำหนดรหัสผ่านใหม่ตอนนี้ →</a>
      </div>

      <p class="text" style="font-size: 12px; color: #64748b; text-align: center;">
        หรือคัดลอกลิงก์นี้เปิดบนเบราว์เซอร์ของคุณ:<br>
        <a href="${resetLink}" style="color: #e11d48; word-break: break-all;">${resetLink}</a>
      </p>
      `
      }

      <p class="text" style="font-size: 12px; color: #94a3b8; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
        * หมายเหตุ: หากคุณไม่ได้เป็นผู้ส่งคำขอแจ้งลืมรหัสผ่านนี้ กรุณาติดต่อผู้ดูแลระบบ JP Trip โดยทันทีเพื่อความปลอดภัยของบัญชีของคุณ
      </p>
    </div>

    <div class="footer">
      <p style="margin: 0 0 4px 0; font-weight: 700; color: #64748b;">JP Trip - Japan Travel Planning System</p>
      <p style="margin: 0;">อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบ กรุณาอย่าตอบกลับอีเมลนี้โดยตรง</p>
    </div>
  </div>
</body>
</html>
    `;

    const info = await transporter.sendMail({
      from: sender,
      to,
      subject,
      html: htmlContent,
    });

    const previewUrl = !isReal ? nodemailer.getTestMessageUrl(info) : null;
    if (previewUrl) {
      console.log(`[EmailService] ส่งอีเมลทดสอบสำเร็จ! ดูพรีวิวอีเมลได้ที่: ${previewUrl}`);
    } else {
      console.log(`[EmailService] ส่งอีเมลแจ้งเตือนถึง ${to} สำเร็จ (Message ID: ${info.messageId})`);
    }

    return {
      sent: true,
      messageId: info.messageId,
      previewUrl,
      isReal,
    };
  } catch (err) {
    console.error("[EmailService] เกิดข้อผิดพลาดในการส่งอีเมล:", err);
    return {
      sent: false,
      error: err.message,
    };
  }
};

module.exports = {
  sendPasswordResetApprovedEmail,
};

