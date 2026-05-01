const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

router.post("/tickets", async (req, res) => {
  try {
    const {
      customer_name,
      customer_email,
      customer_phone,
      subject,
      message,
    } = req.body;

    if (!customer_email || !subject || !message) {
      return res.status(400).json({
        success: false,
        message: "Email, subject, and message are required.",
      });
    }

    const { data, error } = await supabase
      .from("support_tickets")
      .insert([
        {
          customer_name: customer_name || "Customer",
          customer_email,
          customer_phone: customer_phone || "",
          subject,
          message,
          status: "open",
        },
      ])
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Supabase failed to create support ticket.",
        error: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    res.status(201).json({
      success: true,
      message: "Support ticket created successfully.",
      ticket: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create support ticket.",
      error: error.message,
    });
  }
});

router.get("/tickets", async (req, res) => {
  try {
    const { email } = req.query;

    let query = supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (email) {
      query = query.eq("customer_email", email);
    }

    const { data, error } = await query;

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Supabase failed to load tickets.",
        error: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    res.json({
      success: true,
      tickets: data || [],
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load support tickets.",
      error: error.message,
    });
  }
});

router.patch("/tickets/:id/reply", async (req, res) => {
  try {
    const { id } = req.params;
    const { staff_reply, replied_by } = req.body;

    if (!staff_reply) {
      return res.status(400).json({
        success: false,
        message: "Reply is required.",
      });
    }

    const { data, error } = await supabase
      .from("support_tickets")
      .update({
        staff_reply,
        replied_by: replied_by || "Staff",
        replied_at: new Date().toISOString(),
        status: "replied",
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (error) {
      return res.status(500).json({
        success: false,
        message: "Supabase failed to send reply.",
        error: error.message,
        details: error.details,
        hint: error.hint,
      });
    }

    res.json({
      success: true,
      message: "Reply sent successfully.",
      ticket: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to reply to ticket.",
      error: error.message,
    });
  }
});

module.exports = router;