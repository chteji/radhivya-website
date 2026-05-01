const express = require("express");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const supabase = require("../config/supabase");

const router = express.Router();

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

function createResetEmailHtml({ name, resetLink }) {
  return `
  <!doctype html>
  <html>
    <body style="margin:0;background:#f8f1e7;font-family:Arial,Helvetica,sans-serif;color:#15110d;">
      <div style="max-width:680px;margin:0 auto;padding:30px 16px;">
        <div style="background:linear-gradient(135deg,#080705,#15110d 60%,#2a2118);border-radius:32px 32px 0 0;padding:38px;text-align:center;">
          <div style="font-size:42px;font-weight:900;color:#f2d6a3;">Radhivya</div>
          <div style="margin-top:8px;color:#fffaf3;letter-spacing:3px;text-transform:uppercase;font-size:13px;">
            Password Reset
          </div>
        </div>

        <div style="background:#fffaf3;border-left:1px solid rgba(200,155,92,.28);border-right:1px solid rgba(200,155,92,.28);padding:34px;text-align:center;">
          <h1 style="margin:0;color:#15110d;font-size:32px;">Reset your password</h1>

          <p style="color:#7a6a58;font-size:16px;line-height:1.8;">
            Hello <strong>${name || "Customer"}</strong>, we received a request to reset your Radhivya account password.
          </p>

          <a href="${resetLink}" style="display:inline-block;background:#15110d;color:#f2d6a3;text-decoration:none;padding:15px 24px;border-radius:16px;font-weight:900;margin:18px 0;">
            Reset Password
          </a>

          <p style="color:#9b6b3f;font-size:14px;line-height:1.7;">
            This link is valid for 15 minutes. If you did not request this, ignore this email.
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

router.post("/signup", async (req, res) => {
  try {
    const { full_name, age, dob, phone, email, password } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data: existingCustomer, error: existingError } = await supabase
      .from("customers")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (existingError) {
      return res.status(500).json({
        success: false,
        message: "Failed to check existing customer.",
        error: existingError.message,
      });
    }

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Account already exists with this email. Please login.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          full_name,
          age: age ? Number(age) : null,
          dob: dob || null,
          phone: phone || "",
          email: normalizedEmail,
          password: hashedPassword,
          status: "active",
        },
      ])
      .select("id, full_name, age, dob, phone, email, status, created_at")
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create customer account.",
        error: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    res.status(201).json({
      success: true,
      message: "Customer account created successfully.",
      customer: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Customer signup failed.",
      error: error.message,
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to login.",
        error: error.message,
      });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No account detected with this email.",
      });
    }

    if (customer.status === "disabled") {
      return res.status(403).json({
        success: false,
        message: "This customer account is disabled.",
      });
    }

    let passwordMatches = false;

    if (String(customer.password || "").startsWith("$2")) {
      passwordMatches = await bcrypt.compare(password, customer.password);
    } else {
      passwordMatches = password === customer.password;
    }

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: "Incorrect password.",
      });
    }

    res.json({
      success: true,
      message: "Customer login successful.",
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        age: customer.age,
        dob: customer.dob,
        phone: customer.phone,
        email: customer.email,
        status: customer.status,
        created_at: customer.created_at,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Customer login failed.",
      error: error.message,
    });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required.",
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const { data: customer, error } = await supabase
      .from("customers")
      .select("*")
      .eq("email", normalizedEmail)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to check customer email.",
        error: error.message,
      });
    }

    if (!customer) {
      return res.status(404).json({
        success: false,
        message: "No account detected with this email.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Business email credentials are missing in backend .env.",
      });
    }

    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await supabase
      .from("customer_password_resets")
      .update({ used: true })
      .eq("email", normalizedEmail)
      .eq("used", false);

    const { error: insertError } = await supabase
      .from("customer_password_resets")
      .insert([
        {
          customer_id: customer.id,
          email: normalizedEmail,
          reset_token: resetToken,
          expires_at: expiresAt,
          used: false,
        },
      ]);

    if (insertError) {
      return res.status(500).json({
        success: false,
        message: "Failed to create password reset token.",
        error: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
      });
    }

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const resetLink = `${frontendUrl}/reset-password/${resetToken}`;

    const transporter = makeTransporter();

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Radhivya"}" <${process.env.EMAIL_USER}>`,
      to: normalizedEmail,
      subject: "Reset your Radhivya password",
      html: createResetEmailHtml({
        name: customer.full_name,
        resetLink,
      }),
    });

    res.json({
      success: true,
      message: "Password reset link sent to your email.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send password reset email.",
      error: error.message,
    });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: "Reset token and new password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters.",
      });
    }

    const { data: resetRecord, error } = await supabase
      .from("customer_password_resets")
      .select("*")
      .eq("reset_token", token)
      .eq("used", false)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to check reset token.",
        error: error.message,
      });
    }

    if (!resetRecord) {
      return res.status(400).json({
        success: false,
        message: "Invalid or already used reset link.",
      });
    }

    if (new Date(resetRecord.expires_at).getTime() < Date.now()) {
      return res.status(400).json({
        success: false,
        message: "Reset link expired. Please request a new one.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const { error: updateCustomerError } = await supabase
      .from("customers")
      .update({
        password: hashedPassword,
        updated_at: new Date().toISOString(),
      })
      .eq("id", resetRecord.customer_id);

    if (updateCustomerError) {
      return res.status(500).json({
        success: false,
        message: "Failed to update password.",
        error: updateCustomerError.message,
      });
    }

    await supabase
      .from("customer_password_resets")
      .update({ used: true })
      .eq("id", resetRecord.id);

    res.json({
      success: true,
      message: "Password reset successfully. Please login again.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Password reset failed.",
      error: error.message,
    });
  }
});

module.exports = router;