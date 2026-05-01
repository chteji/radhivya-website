const express = require("express");
const nodemailer = require("nodemailer");
const supabase = require("../config/supabase");

const router = express.Router();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: Number(process.env.EMAIL_PORT || 465),
    secure: Number(process.env.EMAIL_PORT || 465) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function createOtpEmailHtml({ name, otp }) {
  return `
  <!doctype html>
  <html>
    <body style="margin:0;background:#f8f1e7;font-family:Arial,Helvetica,sans-serif;color:#15110d;">
      <div style="max-width:680px;margin:0 auto;padding:30px 16px;">
        <div style="background:linear-gradient(135deg,#080705,#15110d 60%,#2a2118);border-radius:32px 32px 0 0;padding:38px;text-align:center;">
          <div style="font-size:42px;font-weight:900;color:#f2d6a3;">Radhivya</div>
          <div style="margin-top:8px;color:#fffaf3;letter-spacing:3px;text-transform:uppercase;font-size:13px;">Premium Indian Skincare</div>
        </div>

        <div style="background:#fffaf3;padding:34px;text-align:center;border-left:1px solid rgba(200,155,92,.28);border-right:1px solid rgba(200,155,92,.28);">
          <h1 style="margin:0;color:#15110d;font-size:32px;">Verify your account</h1>

          <p style="color:#7a6a58;font-size:16px;line-height:1.8;">
            Hello <strong>${name || "Customer"}</strong>, use this OTP to verify your Radhivya account.
            This OTP is valid for <strong>2 minutes</strong>.
          </p>

          <div style="margin:28px auto;padding:20px;border-radius:22px;background:#f8f1e7;border:1px solid rgba(200,155,92,.35);font-size:42px;font-weight:900;letter-spacing:10px;color:#15110d;">
            ${otp}
          </div>

          <p style="color:#9b6b3f;font-size:14px;">
            Do not share this OTP with anyone.
          </p>
        </div>

        <div style="background:#15110d;color:#fffaf3;text-align:center;padding:22px;border-radius:0 0 32px 32px;">
          <div style="color:#f2d6a3;font-weight:900;">Radhivya</div>
          <div style="color:rgba(255,250,243,.7);font-size:13px;margin-top:8px;">
            Premium skincare rituals for your everyday glow.
          </div>
        </div>
      </div>
    </body>
  </html>
  `;
}

router.post("/send", async (req, res) => {
  try {
    const { full_name, email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email credentials missing in backend .env.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const otp = generateOtp();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000).toISOString();

    await supabase
      .from("email_otps")
      .delete()
      .eq("email", normalizedEmail);

    const { error: insertError } = await supabase.from("email_otps").insert([
      {
        email: normalizedEmail,
        otp,
        expires_at: expiresAt,
        verified: false,
      },
    ]);

    if (insertError) {
      return res.status(500).json({
        success: false,
        message: "Failed to save OTP in database.",
        error: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
    }

    const transporter = makeTransporter();

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Radhivya"}" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: `Your Radhivya OTP Code - ${otp}`,
      html: createOtpEmailHtml({
        name: full_name,
        otp,
      }),
    });

    res.json({
      success: true,
      message: "OTP sent successfully to email.",
    });
  } catch (error) {
    console.error("OTP email error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send OTP email.",
      error: error.message,
    });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data, error } = await supabase
      .from("email_otps")
      .select("*")
      .eq("email", normalizedEmail)
      .eq("otp", otp)
      .eq("verified", false)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to verify OTP.",
        error: error.message,
      });
    }

    if (!data) {
      return res.status(400).json({
        success: false,
        message: "Wrong OTP.",
      });
    }

    if (new Date(data.expires_at).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please generate a new OTP.",
      });
    }

    await supabase
      .from("email_otps")
      .update({ verified: true })
      .eq("id", data.id);

    res.json({
      success: true,
      message: "OTP verified successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to verify OTP.",
      error: error.message,
    });
  }
});

router.get("/test-email-login", async (req, res) => {
  try {
    const transporter = makeTransporter();

    await transporter.verify();

    res.json({
      success: true,
      message: "Gmail SMTP login successful.",
      email_user: process.env.EMAIL_USER,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Gmail SMTP login failed.",
      error: error.message,
      email_user: process.env.EMAIL_USER,
    });
  }
});

module.exports = router;4