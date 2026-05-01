const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

function isAdminOrStaff(req) {
  const role = req.headers["x-user-role"];
  return role === "admin" || role === "staff";
}

function normalizeCouponCode(code) {
  return String(code || "").trim().toUpperCase();
}

/* =========================
   COUPONS
========================= */

router.get("/coupons", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to load coupons.",
        error: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    res.json({
      success: true,
      coupons: data || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Coupons load failed.",
      error: error.message,
    });
  }
});

router.post("/coupons", async (req, res) => {
  try {
    if (!isAdminOrStaff(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin or staff can create coupons.",
        received_role: req.headers["x-user-role"] || "missing",
      });
    }

    const {
      code,
      title,
      discount_type,
      discount_value,
      min_order,
      max_discount,
      usage_limit,
      start_date,
      end_date,
      is_active,
    } = req.body;

    const normalizedCode = normalizeCouponCode(code);

    if (!normalizedCode) {
      return res.status(400).json({
        success: false,
        message: "Coupon code is required.",
      });
    }

    const { data, error } = await supabase
      .from("coupons")
      .insert([
        {
          code: normalizedCode,
          title: title || normalizedCode,
          discount_type: discount_type || "percentage",
          discount_value: Number(discount_value || 0),
          min_order: Number(min_order || 0),
          max_discount: Number(max_discount || 0),
          usage_limit: Number(usage_limit || 100),
          used_count: 0,
          start_date: start_date || null,
          end_date: end_date || null,
          is_active: is_active === false ? false : true,
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to create coupon.",
        error: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
      coupon: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Coupon creation failed.",
      error: error.message,
    });
  }
});

router.patch("/coupons/:id", async (req, res) => {
  try {
    if (!isAdminOrStaff(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin or staff can update coupons.",
        received_role: req.headers["x-user-role"] || "missing",
      });
    }

    const { id } = req.params;

    const updateData = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    if (updateData.code) {
      updateData.code = normalizeCouponCode(updateData.code);
    }

    if (updateData.discount_value !== undefined) {
      updateData.discount_value = Number(updateData.discount_value || 0);
    }

    if (updateData.min_order !== undefined) {
      updateData.min_order = Number(updateData.min_order || 0);
    }

    if (updateData.max_discount !== undefined) {
      updateData.max_discount = Number(updateData.max_discount || 0);
    }

    if (updateData.usage_limit !== undefined) {
      updateData.usage_limit = Number(updateData.usage_limit || 100);
    }

    const { data, error } = await supabase
      .from("coupons")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to update coupon.",
        error: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    res.json({
      success: true,
      message: "Coupon updated successfully.",
      coupon: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Coupon update failed.",
      error: error.message,
    });
  }
});

router.delete("/coupons/:id", async (req, res) => {
  try {
    if (!isAdminOrStaff(req)) {
      return res.status(403).json({
        success: false,
        message: "Only admin or staff can delete coupons.",
        received_role: req.headers["x-user-role"] || "missing",
      });
    }

    const { id } = req.params;

    const { error } = await supabase.from("coupons").delete().eq("id", id);

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to delete coupon.",
        error: error.message,
      });
    }

    res.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Coupon delete failed.",
      error: error.message,
    });
  }
});

router.post("/coupons/validate", async (req, res) => {
  try {
    const { code, order_total } = req.body;

    const normalizedCode = normalizeCouponCode(code);
    const orderTotal = Number(order_total || 0);

    if (!normalizedCode) {
      return res.status(400).json({
        success: false,
        message: "Please enter coupon code.",
      });
    }

    const { data: coupon, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", normalizedCode)
      .maybeSingle();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Failed to validate coupon.",
        error: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    if (!coupon) {
      return res.status(404).json({
        success: false,
        message: "Invalid coupon code.",
      });
    }

    if (coupon.is_active === false) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not active.",
      });
    }

    const today = new Date();
    const startDate = coupon.start_date ? new Date(coupon.start_date) : null;
    const endDate = coupon.end_date ? new Date(coupon.end_date) : null;

    if (startDate && today < startDate) {
      return res.status(400).json({
        success: false,
        message: "This coupon is not active yet.",
      });
    }

    if (endDate && today > endDate) {
      return res.status(400).json({
        success: false,
        message: "This coupon has expired.",
      });
    }

    if (Number(coupon.min_order || 0) > orderTotal) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount should be ₹${coupon.min_order}.`,
      });
    }

    if (Number(coupon.used_count || 0) >= Number(coupon.usage_limit || 100)) {
      return res.status(400).json({
        success: false,
        message: "Coupon usage limit reached.",
      });
    }

    let discount = 0;

    if (coupon.discount_type === "percentage") {
      discount = Math.round((orderTotal * Number(coupon.discount_value || 0)) / 100);

      if (Number(coupon.max_discount || 0) > 0) {
        discount = Math.min(discount, Number(coupon.max_discount));
      }
    } else {
      discount = Number(coupon.discount_value || 0);
    }

    discount = Math.min(discount, orderTotal);

    res.json({
      success: true,
      message: "Coupon applied successfully.",
      coupon,
      discount,
      discount_amount: discount,
      final_total: Math.max(orderTotal - discount, 0),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Coupon validation failed.",
      error: error.message,
    });
  }
});

module.exports = router;