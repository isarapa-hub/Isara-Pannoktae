const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const express = require("express");
const cors = require("cors");
const project_jpRoute = require("./routes/project_jp");

const app = express();

app.use(cors());
app.use(express.json({ limit: "10mb" })); // รองรับรูปภาพ base64 จากเครื่องผู้ใช้ (4.5MB ไฟล์ → ~6MB base64)
app.use((req, res, next) => { req.body = req.body || {}; next(); }); // Express 5: body เป็น undefined ถ้าไม่มี JSON

app.use("/api", project_jpRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
