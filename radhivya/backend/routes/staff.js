const express = require("express");
const supabase = require("../config/supabase");

const router = express.Router();

function requireStaff(req, res, next) {
  const role = req.headers["x-user-role"];

  if (role !== "staff" && role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Staff only.",
    });
  }

  next();
}

// STAFF LOGIN USING ADMIN-CREATED ACCOUNT
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required.",
      });
    }

    const { data, error } = await supabase
      .from("staff_accounts")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !data) {
      return res.status(401).json({
        success: false,
        message: "Invalid staff email or password.",
      });
    }

    if (data.status === "disabled") {
      return res.status(403).json({
        success: false,
        message: "This staff account is disabled by admin.",
      });
    }

    if (data.password !== password) {
      return res.status(401).json({
        success: false,
        message: "Invalid staff email or password.",
      });
    }

    res.json({
      success: true,
      message: "Staff login successful.",
      staff: {
        id: data.id,
        full_name: data.full_name,
        email: data.email,
        role: data.role,
        department: data.department,
        status: data.status,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Staff login failed.",
      error: error.message,
    });
  }
});

// SUPPORT TICKETS
router.get("/support", requireStaff, async (req, res) => {
  try {
    const { data: tickets, error } = await supabase
      .from("support_tickets")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    const { data: replies } = await supabase
      .from("support_replies")
      .select("*")
      .order("created_at", { ascending: true });

    const ticketsWithReplies = (tickets || []).map((ticket) => ({
      ...ticket,
      replies: (replies || []).filter((reply) => reply.ticket_id === ticket.id),
    }));

    res.json({
      success: true,
      tickets: ticketsWithReplies,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load support tickets.",
      error: error.message,
    });
  }
});

router.put("/support/:id/status", requireStaff, async (req, res) => {
  try {
    const { status } = req.body;

    const { data, error } = await supabase
      .from("support_tickets")
      .update({ status })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Ticket status updated.",
      ticket: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update ticket.",
      error: error.message,
    });
  }
});

router.post("/support/:id/reply", requireStaff, async (req, res) => {
  try {
    const { staff_id, staff_name, reply_message } = req.body;

    if (!reply_message) {
      return res.status(400).json({
        success: false,
        message: "Reply message is required.",
      });
    }

    const { data, error } = await supabase
      .from("support_replies")
      .insert([
        {
          ticket_id: req.params.id,
          staff_id,
          staff_name,
          reply_message,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("support_tickets")
      .update({ status: "in_progress" })
      .eq("id", req.params.id);

    res.status(201).json({
      success: true,
      message: "Reply added successfully.",
      reply: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add reply.",
      error: error.message,
    });
  }
});

// CUSTOMERS WITH BASIC INSIGHTS
router.get("/customers", requireStaff, async (req, res) => {
  try {
    const { data: customers, error: customersError } = await supabase
      .from("customers")
      .select("*")
      .order("created_at", { ascending: false });

    if (customersError) throw customersError;

    const { data: orders } = await supabase.from("orders").select("*");

    const customerInsights = (customers || []).map((customer) => {
      const customerOrders = (orders || []).filter(
        (order) =>
          order.customer_email === customer.email ||
          order.email === customer.email ||
          order.customer_phone === customer.phone
      );

      const totalSpent = customerOrders.reduce((sum, order) => {
        return sum + Number(order.total_amount || order.amount || 0);
      }, 0);

      const lastOrder = customerOrders.sort(
        (a, b) => new Date(b.created_at) - new Date(a.created_at)
      )[0];

      return {
        ...customer,
        total_orders: customerOrders.length,
        total_spent: totalSpent,
        last_purchase_date: lastOrder?.created_at || null,
        last_purchase_amount: lastOrder?.total_amount || lastOrder?.amount || 0,
      };
    });

    res.json({
      success: true,
      customers: customerInsights,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load customer data.",
      error: error.message,
    });
  }
});

// MARKETING TASKS
router.get("/marketing-tasks", requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("marketing_tasks")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, tasks: data || [] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load marketing tasks.",
      error: error.message,
    });
  }
});

router.post("/marketing-tasks", requireStaff, async (req, res) => {
  try {
    const { title, description, platform, priority, status, due_date, assigned_to } =
      req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Task title is required.",
      });
    }

    const { data, error } = await supabase
      .from("marketing_tasks")
      .insert([
        {
          title,
          description,
          platform,
          priority: priority || "medium",
          status: status || "pending",
          due_date: due_date || null,
          assigned_to,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Marketing task created.",
      task: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to create marketing task.",
      error: error.message,
    });
  }
});

router.put("/marketing-tasks/:id", requireStaff, async (req, res) => {
  try {
    const payload = {
      ...req.body,
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("marketing_tasks")
      .update(payload)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      message: "Marketing task updated.",
      task: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to update marketing task.",
      error: error.message,
    });
  }
});

// INFLUENCERS
router.get("/influencers", requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("influencers")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, influencers: data || [] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load influencers.",
      error: error.message,
    });
  }
});

router.post("/influencers", requireStaff, async (req, res) => {
  try {
    const {
      full_name,
      instagram_id,
      email,
      phone,
      product_focus,
      campaign_name,
      budget,
      start_date,
      end_date,
      status,
      notes,
    } = req.body;

    if (!full_name) {
      return res.status(400).json({
        success: false,
        message: "Influencer name is required.",
      });
    }

    const { data, error } = await supabase
      .from("influencers")
      .insert([
        {
          full_name,
          instagram_id,
          email,
          phone,
          product_focus,
          campaign_name,
          budget: Number(budget || 0),
          start_date: start_date || null,
          end_date: end_date || null,
          status: status || "planned",
          notes,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Influencer added.",
      influencer: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add influencer.",
      error: error.message,
    });
  }
});

// SOCIAL POSTS / BANNERS
router.get("/social-posts", requireStaff, async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("social_posts")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) throw error;

    res.json({ success: true, posts: data || [] });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to load social posts.",
      error: error.message,
    });
  }
});

router.post("/social-posts", requireStaff, async (req, res) => {
  try {
    const { title, platform, banner_url, caption, schedule_date, status, created_by } =
      req.body;

    if (!title) {
      return res.status(400).json({
        success: false,
        message: "Post title is required.",
      });
    }

    const { data, error } = await supabase
      .from("social_posts")
      .insert([
        {
          title,
          platform,
          banner_url,
          caption,
          schedule_date: schedule_date || null,
          status: status || "draft",
          created_by,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({
      success: true,
      message: "Social post plan added.",
      post: data,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to add social post.",
      error: error.message,
    });
  }
});

module.exports = router;