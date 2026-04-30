const express = require("express");
const supabase = require("../config/supabase");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.use(requireAdmin);

// =========================
// ADMIN ANALYTICS
// =========================

router.get("/analytics", async (req, res) => {
  try {
    const { data: products } = await supabase.from("products").select("*");
    const { data: orders } = await supabase.from("orders").select("*");
    const { data: payments } = await supabase.from("payments").select("*");
    const { data: customers } = await supabase.from("customers").select("*");
    const { data: coupons } = await supabase.from("coupons").select("*");
    const { data: staff } = await supabase.from("staff_accounts").select("*");

    const totalRevenue = (orders || []).reduce((sum, order) => {
      return sum + Number(order.total_amount || order.amount || 0);
    }, 0);

    const paidPayments = (payments || []).filter(
      (payment) => payment.status === "paid" || payment.status === "captured"
    );

    res.json({
      success: true,
      analytics: {
        total_products: products?.length || 0,
        available_products:
          products?.filter((product) => product.is_available !== false).length || 0,
        unavailable_products:
          products?.filter((product) => product.is_available === false).length || 0,
        new_arrivals:
          products?.filter((product) => product.is_new_arrival === true).length || 0,

        total_orders: orders?.length || 0,
        pending_orders:
          orders?.filter((order) => order.status === "pending").length || 0,
        completed_orders:
          orders?.filter((order) => order.status === "completed").length || 0,

        total_payments: payments?.length || 0,
        successful_payments: paidPayments.length,

        total_customers: customers?.length || 0,
        active_customers:
          customers?.filter((customer) => customer.status === "active").length || 0,

        total_coupons: coupons?.length || 0,
        active_coupons:
          coupons?.filter((coupon) => coupon.is_active === true).length || 0,

        total_staff: staff?.length || 0,
        active_staff:
          staff?.filter((member) => member.status === "active").length || 0,

        total_revenue: totalRevenue,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load analytics.",
      error: error.message,
    });
  }
});

// =========================
// ORDERS
// =========================

router.get("/orders", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      orders: data || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load orders.",
      error: error.message,
    });
  }
});

router.put("/orders/:id", async (req, res) => {
  try {
    const {
      status,
      payment_status,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      state,
      pincode,
      total_amount,
      razorpay_order_id,
      razorpay_payment_id,
    } = req.body;

    const payload = {
      status,
      payment_status,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      state,
      pincode,
      total_amount,
      razorpay_order_id,
      razorpay_payment_id,
      updated_at: new Date().toISOString(),
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    const { data, error } = await supabase
      .from("orders")
      .update(payload)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Order updated successfully.",
      order: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order.",
      error: error.message,
    });
  }
});

// =========================
// PAYMENTS
// =========================

router.get("/payments", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      payments: data || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load payments.",
      error: error.message,
    });
  }
});

// =========================
// CUSTOMERS
// =========================

router.get("/customers", async (req, res) => {
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

router.post("/customers", async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      status,
    } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Customer email is required.",
      });
    }

    const { data, error } = await supabase
      .from("customers")
      .insert([
        {
          full_name,
          email,
          phone,
          address,
          city,
          state,
          pincode,
          status: status || "active",
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Customer created successfully.",
      customer: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create customer.",
      error: error.message,
    });
  }
});

router.put("/customers/:id", async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      address,
      city,
      state,
      pincode,
      status,
    } = req.body;

    const { data, error } = await supabase
      .from("customers")
      .update({
        full_name,
        email,
        phone,
        address,
        city,
        state,
        pincode,
        status,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Customer updated successfully.",
      customer: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update customer.",
      error: error.message,
    });
  }
});

// =========================
// COUPONS
// =========================

router.get("/coupons", async (req, res) => {
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

router.post("/coupons", async (req, res) => {
  try {
    const {
      code,
      title,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
      is_active,
    } = req.body;

    if (!code || discount_value === undefined) {
      return res.status(400).json({
        success: false,
        message: "Coupon code and discount value are required.",
      });
    }

    const { data, error } = await supabase
      .from("coupons")
      .insert([
        {
          code: String(code).toUpperCase(),
          title,
          discount_type: discount_type || "percentage",
          discount_value: Number(discount_value),
          min_order_amount: Number(min_order_amount || 0),
          max_discount_amount: max_discount_amount
            ? Number(max_discount_amount)
            : null,
          start_date: start_date || null,
          end_date: end_date || null,
          usage_limit: usage_limit ? Number(usage_limit) : null,
          is_active: is_active === false ? false : true,
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Coupon created successfully.",
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

router.put("/coupons/:id", async (req, res) => {
  try {
    const {
      code,
      title,
      discount_type,
      discount_value,
      min_order_amount,
      max_discount_amount,
      start_date,
      end_date,
      usage_limit,
      is_active,
    } = req.body;

    const { data, error } = await supabase
      .from("coupons")
      .update({
        code: code ? String(code).toUpperCase() : undefined,
        title,
        discount_type,
        discount_value:
          discount_value !== undefined ? Number(discount_value) : undefined,
        min_order_amount:
          min_order_amount !== undefined ? Number(min_order_amount) : undefined,
        max_discount_amount:
          max_discount_amount !== undefined && max_discount_amount !== ""
            ? Number(max_discount_amount)
            : null,
        start_date: start_date || null,
        end_date: end_date || null,
        usage_limit:
          usage_limit !== undefined && usage_limit !== ""
            ? Number(usage_limit)
            : null,
        is_active,
        updated_at: new Date().toISOString(),
      })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Coupon updated successfully.",
      coupon: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update coupon.",
      error: error.message,
    });
  }
});

router.delete("/coupons/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("coupons")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Coupon deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete coupon.",
      error: error.message,
    });
  }
});

// =========================
// STAFF ACCOUNTS
// =========================

router.get("/staff", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("staff_accounts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      staff: data || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load staff accounts.",
      error: error.message,
    });
  }
});

router.post("/staff", async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      department,
      status,
      created_by,
    } = req.body;

    if (!full_name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Staff name, email, and password are required.",
      });
    }

    const { data, error } = await supabase
      .from("staff_accounts")
      .insert([
        {
          full_name,
          email,
          password,
          role: role || "staff",
          department: department || "support",
          status: status || "active",
          created_by: created_by || "admin",
          updated_at: new Date().toISOString(),
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Staff account created successfully.",
      staff: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create staff account.",
      error: error.message,
    });
  }
});

router.put("/staff/:id", async (req, res) => {
  try {
    const { full_name, email, password, role, department, status } = req.body;

    const payload = {
      full_name,
      email,
      role,
      department,
      status,
      updated_at: new Date().toISOString(),
    };

    if (password) {
      payload.password = password;
    }

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined) delete payload[key];
    });

    const { data, error } = await supabase
      .from("staff_accounts")
      .update(payload)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Staff account updated successfully.",
      staff: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update staff account.",
      error: error.message,
    });
  }
});

router.delete("/staff/:id", async (req, res) => {
  try {
    const { error } = await supabase
      .from("staff_accounts")
      .delete()
      .eq("id", req.params.id);

    if (error) throw error;

    res.json({
      success: true,
      message: "Staff account deleted successfully.",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to delete staff account.",
      error: error.message,
    });
  }
});

// =========================
// SETTINGS
// =========================

router.get("/settings", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("site_settings")
      .select("*")
      .order("setting_key", { ascending: true });

    if (error) throw error;

    res.json({
      success: true,
      settings: data || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load settings.",
      error: error.message,
    });
  }
});

router.post("/settings", async (req, res) => {
  try {
    const { setting_key, setting_value } = req.body;

    if (!setting_key) {
      return res.status(400).json({
        success: false,
        message: "Setting key is required.",
      });
    }

    const { data, error } = await supabase
      .from("site_settings")
      .upsert(
        [
          {
            setting_key,
            setting_value,
            updated_at: new Date().toISOString(),
          },
        ],
        { onConflict: "setting_key" }
      )
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Setting saved successfully.",
      setting: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to save setting.",
      error: error.message,
    });
  }
});

module.exports = router;