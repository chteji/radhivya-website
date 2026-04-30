const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

function requireAdmin(req, res, next) {
  const role = req.headers["x-user-role"];

  if (role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Only admin can perform this action.",
      received_role: role || "missing",
    });
  }

  next();
}

function requireAdminOrStaff(req, res, next) {
  const role = req.headers["x-user-role"];

  if (role !== "admin" && role !== "staff") {
    return res.status(403).json({
      success: false,
      message: "Only admin or staff can perform this action.",
      received_role: role || "missing",
    });
  }

  next();
}

function normalizeDiscountType(value) {
  const text = String(value || "fixed").toLowerCase();

  if (text.includes("percent")) return "percentage";
  if (text.includes("percentage")) return "percentage";
  if (text.includes("fixed")) return "fixed";

  return "fixed";
}

function normalizeStatus(body) {
  if (body.status === "active" || body.status === "inactive") {
    return body.status;
  }

  if (body.active === true || body.is_active === true) return "active";
  if (body.active === false || body.is_active === false) return "inactive";

  return "active";
}

router.post("/coupons", requireAdmin, async (req, res) => {
  try {
    const {
      code,
      title,
      description,
      discount_type,
      discount_value,
      max_discount,
      min_order_value,
      usage_limit,
      start_date,
      end_date,
      created_by,
    } = req.body;

    if (!code || !title || discount_value === "" || discount_value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code, title, and discount value are required.",
        received_body: req.body,
      });
    }

    const payload = {
      code: String(code).trim().toUpperCase(),
      title: String(title).trim(),
      description: description || "",
      discount_type: normalizeDiscountType(discount_type),
      discount_value: Number(discount_value || 0),
      max_discount: Number(max_discount || 0),
      min_order_value: Number(min_order_value || 0),
      usage_limit: Number(usage_limit || 100),
      status: normalizeStatus(req.body),
      start_date: start_date || null,
      end_date: end_date || null,
      created_by: created_by || "Radhivya Admin",
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("coupons")
      .upsert([payload], {
        onConflict: "code",
      })
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Supabase failed to create/update coupon.",
        error: error.message,
        details: error.details,
        hint: error.hint,
        sent_payload: payload,
      });
    }

    res.status(201).json({
      success: true,
      message: "Coupon saved successfully.",
      coupon: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create coupon.",
      error: error.message,
    });
  }
});

router.get("/coupons", requireAdminOrStaff, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      coupons: data || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load coupons.",
      error: error.message,
    });
  }
});

router.post("/coupons/validate", async (req, res) => {
  try {
    const { code, subtotal } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    const cleanCode = String(code).trim().toUpperCase();

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", cleanCode)
      .eq("status", "active")
      .single();

    if (error || !coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid or inactive coupon code.",
      });
    }

    const today = new Date().toISOString().slice(0, 10);

    if (coupon.start_date && today < coupon.start_date) {
      return res.status(400).json({
        success: false,
        message: "Coupon is not active yet.",
      });
    }

    if (coupon.end_date && today > coupon.end_date) {
      return res.status(400).json({
        success: false,
        message: "Coupon has expired.",
      });
    }

    if (Number(coupon.used_count || 0) >= Number(coupon.usage_limit || 0)) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached.",
      });
    }

    if (Number(subtotal || 0) < Number(coupon.min_order_value || 0)) {
      return res.status(400).json({
        success: false,
        message: `Minimum order value is ₹${coupon.min_order_value}.`,
      });
    }

    let discount = 0;

    if (coupon.discount_type === "percentage") {
      discount = Math.round(
        (Number(subtotal || 0) * Number(coupon.discount_value || 0)) / 100
      );

      if (Number(coupon.max_discount || 0) > 0) {
        discount = Math.min(discount, Number(coupon.max_discount));
      }
    } else {
      discount = Number(coupon.discount_value || 0);
    }

    discount = Math.min(discount, Number(subtotal || 0));

    res.json({
      success: true,
      message: "Coupon applied successfully.",
      coupon,
      discount,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to validate coupon.",
      error: error.message,
    });
  }
});

router.get("/customers", requireAdminOrStaff, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      customers: data || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load customers.",
      error: error.message,
    });
  }
});

router.post("/tracking", requireAdminOrStaff, async (req, res) => {
  try {
    const {
      order_id,
      order_number,
      status,
      location,
      tracking_date,
      tracking_time,
      note,
      updated_by,
    } = req.body;

    if (!order_number || !status) {
      return res.status(400).json({
        success: false,
        message: "Order number and status are required.",
      });
    }

    const { data, error } = await supabase
      .from("order_tracking")
      .insert([
        {
          order_id: order_id || null,
          order_number,
          status,
          location: location || "",
          tracking_date: tracking_date || new Date().toISOString().slice(0, 10),
          tracking_time:
            tracking_time ||
            new Date().toLocaleTimeString("en-GB", { hour12: false }),
          note: note || "",
          completed: true,
          updated_by: updated_by || "Staff",
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Tracking update added successfully.",
      tracking: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add tracking update.",
      error: error.message,
    });
  }
});

router.get("/tracking/:orderNumber", async (req, res) => {
  try {
    const { orderNumber } = req.params;

    const { data, error } = await supabase
      .from("order_tracking")
      .select("*")
      .eq("order_number", orderNumber)
      .order("created_at", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      tracking: data || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load tracking.",
      error: error.message,
    });
  }
});

module.exports = router;