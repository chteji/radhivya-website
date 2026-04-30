const express = require("express");
const crypto = require("crypto");
const razorpay = require("../config/razorpay");
const supabase = require("../config/supabase");

const router = express.Router();

// Create Razorpay order
router.post("/create-order", async (req, res) => {
  try {
    const {
      amount,
      customer_name,
      customer_email,
      customer_phone,
      shipping_address,
      city,
      state,
      pincode,
      items,
    } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: "Invalid amount",
      });
    }

    const receipt = `radhivya_${Date.now()}`;

    const razorpayOrder = await razorpay.orders.create({
      amount: Math.round(amount * 100),
      currency: "INR",
      receipt,
    });

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert([
        {
          order_number: receipt,
          total_amount: amount,
          currency: "INR",
          status: "pending",
          payment_status: "unpaid",
          customer_name,
          customer_email,
          customer_phone,
          shipping_address,
          city,
          state,
          pincode,
          razorpay_order_id: razorpayOrder.id,
        },
      ])
      .select()
      .single();

    if (orderError) throw orderError;

    if (items && items.length > 0) {
      const orderItems = items.map((item) => ({
        order_id: order.id,
        product_id: item.product_id || null,
        product_name: item.product_name,
        product_image: item.product_image || null,
        quantity: item.quantity,
        price: item.price,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;
    }

    const { error: paymentError } = await supabase.from("payments").insert([
      {
        order_id: order.id,
        razorpay_order_id: razorpayOrder.id,
        amount,
        currency: "INR",
        status: "created",
      },
    ]);

    if (paymentError) throw paymentError;

    res.json({
      success: true,
      message: "Razorpay order created",
      order_id: order.id,
      razorpay_order_id: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      key: process.env.RAZORPAY_KEY_ID,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create Razorpay order",
      error: error.message,
    });
  }
});

// Verify Razorpay payment
router.post("/verify", async (req, res) => {
  try {
    const {
      order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (generatedSignature !== razorpay_signature) {
      await supabase
        .from("payments")
        .update({
          razorpay_payment_id,
          razorpay_signature,
          status: "failed",
        })
        .eq("razorpay_order_id", razorpay_order_id);

      return res.status(400).json({
        success: false,
        message: "Payment verification failed",
      });
    }

    await supabase
      .from("payments")
      .update({
        razorpay_payment_id,
        razorpay_signature,
        status: "verified",
      })
      .eq("razorpay_order_id", razorpay_order_id);

    await supabase
      .from("orders")
      .update({
        razorpay_payment_id,
        payment_status: "paid",
        status: "paid",
      })
      .eq("id", order_id);

    res.json({
      success: true,
      message: "Payment verified successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Payment verification error",
      error: error.message,
    });
  }
});

module.exports = router;