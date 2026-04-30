const express = require("express");
const supabase = require("../config/supabase");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// ADMIN ONLY: Get all orders with order items
router.get("/", requireAdmin, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("orders")
      .select(`
        *,
        order_items(*),
        payments(*)
      `)
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({
      success: true,
      orders: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
      error: error.message,
    });
  }
});

// ADMIN ONLY: Update order status
router.put("/:id/status", requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const allowedStatuses = [
      "pending",
      "paid",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
      "failed",
    ];

    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const { data, error } = await supabase
      .from("orders")
      .update({ status })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    await supabase.from("activity_logs").insert([
      {
        action: "ORDER_STATUS_UPDATED",
        entity_type: "order",
        entity_id: req.params.id,
        metadata: { status },
      },
    ]);

    res.json({
      success: true,
      message: "Order status updated successfully",
      order: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update order status",
      error: error.message,
    });
  }
});

module.exports = router;