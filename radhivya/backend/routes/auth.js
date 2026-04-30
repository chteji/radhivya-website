const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function getOtpExpiry() {
  return new Date(Date.now() + 2 * 60 * 1000).toISOString();
}

// CUSTOMER LOGIN
router.post("/customer-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        message: "Invalid customer email or password.",
      });
    }

    if (data.status === "disabled") {
      return res.status(403).json({
        success: false,
        message: "This customer account is disabled.",
      });
    }

    if (data.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid customer email or password.",
      });
    }

    res.json({
      success: true,
      message: "Customer login successful.",
      customer: {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        phone: data.phone,
        age: data.age,
        dob: data.dob,
        role: "customer",
        status: data.status,
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

// ADMIN LOGIN
router.post("/admin-login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const { data, error } = await supabase
      .from("admin_accounts")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    if (data.status === "disabled") {
      return res.status(403).json({
        success: false,
        message: "This admin account is disabled.",
      });
    }

    if (data.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid admin email or password.",
      });
    }

    res.json({
      success: true,
      message: "Admin login successful.",
      admin: {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        role: "admin",
        status: data.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Admin login failed.",
      error: error.message,
    });
  }
});

// SEND CUSTOMER SIGNUP OTP
router.post("/customer-signup/send-otp", async (req, res) => {
  try {
    const { full_name, age, dob, mobile, email, password } = req.body;

    if (!full_name || !mobile || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, mobile, email, and password are required.",
      });
    }

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id,email,phone")
      .or(`email.eq.${email},phone.eq.${mobile}`)
      .maybeSingle();

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer already exists with this email or mobile number.",
      });
    }

    const otpCode = generateOtp();
    const expiresAt = getOtpExpiry();

    await supabase
      .from("customer_otps")
      .update({ verified: true })
      .eq("email", email)
      .eq("verified", false);

    const { data, error } = await supabase
      .from("customer_otps")
      .insert([
        {
          full_name,
          age: age ? Number(age) : null,
          dob: dob || null,
          mobile,
          email,
          password,
          otp_code: otpCode,
          expires_at: expiresAt,
          verified: false,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    // Later we will connect real Email/SMS provider here.
    // For testing, OTP is returned in response.
    res.status(201).json({
      success: true,
      message: "OTP generated successfully. OTP is valid for 2 minutes.",
      otp_request_id: data.id,
      dev_otp_for_testing: otpCode,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to generate OTP.",
      error: error.message,
    });
  }
});

// VERIFY OTP AND CREATE CUSTOMER ACCOUNT
router.post("/customer-signup/verify-otp", async (req, res) => {
  try {
    const { otp_request_id, otp_code } = req.body;

    if (!otp_request_id || !otp_code) {
      return res.status(400).json({
        success: false,
        message: "OTP request ID and OTP code are required.",
      });
    }

    const { data: otpData, error: otpError } = await supabase
      .from("customer_otps")
      .select("*")
      .eq("id", otp_request_id)
      .single();

    if (otpError || !otpData) {
      return res.status(404).json({
        success: false,
        message: "OTP request not found.",
      });
    }

    if (otpData.verified) {
      return res.status(400).json({
        success: false,
        message: "This OTP is already used or cancelled.",
      });
    }

    const now = new Date();
    const expiry = new Date(otpData.expires_at);

    if (now > expiry) {
      return res.status(400).json({
        success: false,
        message: "OTP expired. Please generate a new OTP.",
      });
    }

    if (String(otpData.otp_code) !== String(otp_code)) {
      return res.status(400).json({
        success: false,
        message: "Wrong OTP. Please enter the correct code.",
      });
    }

    const { data: existingCustomer } = await supabase
      .from("customers")
      .select("id,email,phone")
      .or(`email.eq.${otpData.email},phone.eq.${otpData.mobile}`)
      .maybeSingle();

    if (existingCustomer) {
      return res.status(409).json({
        success: false,
        message: "Customer already exists.",
      });
    }

    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .insert([
        {
          full_name: otpData.full_name,
          age: otpData.age,
          dob: otpData.dob,
          phone: otpData.mobile,
          email: otpData.email,
          password: otpData.password,
          role: "customer",
          status: "active",
          email_verified: true,
          mobile_verified: true,
        },
      ])
      .select()
      .single();

    if (customerError) throw customerError;

    await supabase
      .from("customer_otps")
      .update({ verified: true })
      .eq("id", otp_request_id);

    res.status(201).json({
      success: true,
      message: "OTP verified. Customer account created successfully.",
      customer: {
        id: customer.id,
        full_name: customer.full_name,
        email: customer.email,
        phone: customer.phone,
        age: customer.age,
        dob: customer.dob,
        role: "customer",
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "OTP verification failed.",
      error: error.message,
    });
  }
});

module.exports = router;