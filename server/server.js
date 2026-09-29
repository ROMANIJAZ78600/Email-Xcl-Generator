const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");
require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_SERVER,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.EMAIL_ADDRESS,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

app.get("/", (req, res) => {
  res.json({
    message: "Finovo Email API is running",
  });
});

app.get("/api/test-smtp", async (req, res) => {
  try {
    await transporter.verify();

    res.json({
      success: true,
      message: "SMTP connection successful",
    });
  } catch (error) {
    console.error("SMTP verify error:", error);

    res.status(500).json({
      success: false,
      message: error.message,
      code: error.code,
      command: error.command,
    });
  }
});

const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
