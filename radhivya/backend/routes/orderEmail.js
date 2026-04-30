const express = require("express");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

const router = express.Router();

function makeTransporter() {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT || 465),
    secure: Number(process.env.EMAIL_PORT || 465) === 465,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function createInvoicePdfBuffer(order) {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({
        size: "A4",
        margin: 50,
      });

      const buffers = [];

      doc.on("data", buffers.push.bind(buffers));
      doc.on("end", () => resolve(Buffer.concat(buffers)));

      const customer = order.customer || {};
      const items = Array.isArray(order.items) ? order.items : [];

      doc.rect(0, 0, 595, 150).fill("#15110d");

      doc.fillColor("#f2d6a3").fontSize(34).text("Radhivya", 50, 38);
      doc.fillColor("#fffaf3").fontSize(12).text("Premium Indian Skincare", 50, 80);

      doc.fillColor("#f2d6a3").fontSize(20).text("INVOICE", 430, 40);
      doc.fillColor("#fffaf3").fontSize(10);
      doc.text(`Order: ${order.order_number || "N/A"}`, 430, 72);
      doc.text(`Date: ${new Date(order.created_at || Date.now()).toLocaleDateString()}`, 430, 90);

      doc.fillColor("#15110d").fontSize(17).text("Bill To", 50, 185);
      doc.fillColor("#7a6a58").fontSize(11);
      doc.text(customer.full_name || "Customer", 50, 212);
      doc.text(customer.email || "", 50, 230);
      doc.text(customer.phone || "", 50, 248);
      doc.text(customer.address || "", 50, 266, { width: 230 });
      doc.text(`${customer.city || ""} ${customer.state || ""} ${customer.pincode || ""}`, 50, 302);

      doc.fillColor("#15110d").fontSize(17).text("Order Details", 340, 185);
      doc.fillColor("#7a6a58").fontSize(11);
      doc.text(`Payment: ${order.payment_status || "confirmed"}`, 340, 212);
      doc.text(`Status: ${order.order_status || "confirmed"}`, 340, 230);
      doc.text(`Coupon: ${order.coupon_code || "None"}`, 340, 248);
      doc.text(`Delivery Estimate: 7 days`, 340, 266);

      let y = 350;

      doc.rect(50, y, 495, 32).fill("#15110d");

      doc.fillColor("#f2d6a3").fontSize(11);
      doc.text("Product", 60, y + 11);
      doc.text("Qty", 320, y + 11);
      doc.text("Price", 380, y + 11);
      doc.text("Total", 465, y + 11);

      y += 48;

      items.forEach((item) => {
        const qty = Number(item.quantity || 1);
        const price = Number(item.price || 0);
        const total = qty * price;

        doc.fillColor("#15110d").fontSize(10).text(item.name || "Product", 60, y, {
          width: 230,
        });

        doc.fillColor("#7a6a58");
        doc.text(String(qty), 325, y);
        doc.text(`Rs. ${price}`, 380, y);
        doc.text(`Rs. ${total}`, 465, y);

        y += 34;
      });

      y += 18;

      doc.moveTo(340, y).lineTo(545, y).strokeColor("#c89b5c").stroke();
      y += 18;

      const totalRows = [
        ["Subtotal", order.subtotal || 0],
        ["Shipping", order.shipping || 0],
        ["Discount", `-${order.discount || 0}`],
        ["Grand Total", order.total || 0],
      ];

      totalRows.forEach(([label, value], index) => {
        const isGrand = index === totalRows.length - 1;

        doc.fillColor(isGrand ? "#15110d" : "#7a6a58").fontSize(isGrand ? 14 : 11);
        doc.text(label, 350, y);
        doc.text(`Rs. ${value}`, 460, y);

        y += isGrand ? 28 : 22;
      });

      doc.rect(0, 760, 595, 82).fill("#15110d");

      doc.fillColor("#f2d6a3").fontSize(14).text("Thank you for shopping with Radhivya", 50, 785);
      doc.fillColor("#fffaf3").fontSize(10).text(
        "Premium skincare rituals designed for your everyday glow.",
        50,
        808
      );

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

function createEmailHtml(order) {
  const customer = order.customer || {};
  const items = Array.isArray(order.items) ? order.items : [];

  const rows = items
    .map((item) => {
      const qty = Number(item.quantity || 1);
      const price = Number(item.price || 0);

      return `
        <tr>
          <td style="padding:14px;border-bottom:1px solid rgba(200,155,92,.22);color:#15110d;font-weight:800;">
            ${item.name || "Product"}
          </td>
          <td style="padding:14px;border-bottom:1px solid rgba(200,155,92,.22);color:#7a6a58;text-align:center;">
            ${qty}
          </td>
          <td style="padding:14px;border-bottom:1px solid rgba(200,155,92,.22);color:#15110d;text-align:right;font-weight:900;">
            ₹${price * qty}
          </td>
        </tr>
      `;
    })
    .join("");

  return `
  <!doctype html>
  <html>
    <body style="margin:0;background:#f8f1e7;font-family:Arial,Helvetica,sans-serif;">
      <div style="max-width:760px;margin:0 auto;padding:30px 16px;">
        <div style="background:linear-gradient(135deg,#080705,#15110d 60%,#2a2118);border-radius:34px 34px 0 0;padding:42px 34px;text-align:center;">
          <div style="font-size:46px;font-weight:900;color:#f2d6a3;">Radhivya</div>
          <div style="margin-top:10px;color:#fffaf3;font-size:14px;letter-spacing:4px;text-transform:uppercase;">
            Premium Indian Skincare
          </div>
        </div>

        <div style="background:#fffaf3;border-left:1px solid rgba(200,155,92,.28);border-right:1px solid rgba(200,155,92,.28);padding:36px 34px;">
          <h1 style="margin:0;color:#15110d;font-size:34px;line-height:1.1;">
            Your order is confirmed ✨
          </h1>

          <p style="color:#7a6a58;font-size:16px;line-height:1.8;margin:18px 0 0;">
            Hi <strong style="color:#15110d;">${customer.full_name || "Customer"}</strong>,
            your Radhivya order has been placed successfully. Your invoice PDF is attached with this email.
          </p>

          <div style="margin:28px 0;padding:20px;border-radius:22px;background:#f8f1e7;border:1px solid rgba(200,155,92,.25);">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#7a6a58;">Order Number</td>
                <td style="padding:8px 0;text-align:right;color:#15110d;font-weight:900;">${order.order_number}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#7a6a58;">Payment Status</td>
                <td style="padding:8px 0;text-align:right;color:#15110d;font-weight:900;">${order.payment_status}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#7a6a58;">Delivery Estimate</td>
                <td style="padding:8px 0;text-align:right;color:#15110d;font-weight:900;">Within 7 days</td>
              </tr>
            </table>
          </div>

          <h2 style="font-size:22px;color:#15110d;margin:0 0 14px;">Order Summary</h2>

          <table style="width:100%;border-collapse:collapse;background:white;border-radius:18px;overflow:hidden;border:1px solid rgba(200,155,92,.22);">
            <thead>
              <tr style="background:#15110d;">
                <th style="padding:14px;color:#f2d6a3;text-align:left;">Product</th>
                <th style="padding:14px;color:#f2d6a3;text-align:center;">Qty</th>
                <th style="padding:14px;color:#f2d6a3;text-align:right;">Total</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>

          <div style="margin-top:26px;padding:22px;border-radius:22px;background:linear-gradient(135deg,#15110d,#2a2118);">
            <table style="width:100%;border-collapse:collapse;">
              <tr>
                <td style="padding:8px 0;color:#f8f1e7;">Subtotal</td>
                <td style="padding:8px 0;text-align:right;color:#f8f1e7;">₹${order.subtotal || 0}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#f8f1e7;">Shipping</td>
                <td style="padding:8px 0;text-align:right;color:#f8f1e7;">₹${order.shipping || 0}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#f8f1e7;">Discount</td>
                <td style="padding:8px 0;text-align:right;color:#f8f1e7;">-₹${order.discount || 0}</td>
              </tr>
              <tr>
                <td style="padding:14px 0 0;color:#f2d6a3;font-size:20px;font-weight:900;">Grand Total</td>
                <td style="padding:14px 0 0;text-align:right;color:#f2d6a3;font-size:20px;font-weight:900;">₹${order.total || 0}</td>
              </tr>
            </table>
          </div>

          <div style="margin-top:30px;text-align:center;">
            <a href="${process.env.FRONTEND_URL || "http://localhost:5173"}/profile"
              style="display:inline-block;background:#15110d;color:#f2d6a3;text-decoration:none;padding:15px 24px;border-radius:16px;font-weight:900;">
              Track Your Order
            </a>
          </div>
        </div>

        <div style="background:#15110d;color:#fffaf3;text-align:center;padding:24px;border-radius:0 0 34px 34px;">
          <div style="color:#f2d6a3;font-weight:900;font-size:18px;">Radhivya</div>
          <div style="color:rgba(255,250,243,.7);font-size:13px;margin-top:8px;">
            Premium skincare rituals for your everyday glow.
          </div>
        </div>
      </div>
    </body>
  </html>`;
}

router.post("/send-order-confirmation", async (req, res) => {
  try {
    const { order } = req.body;

    if (!order || !order.customer || !order.customer.email) {
      return res.status(400).json({
        success: false,
        message: "Order and customer email are required.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email credentials missing. Add EMAIL_USER and EMAIL_PASS in backend/.env.",
      });
    }

    const transporter = makeTransporter();
    const pdfBuffer = await createInvoicePdfBuffer(order);

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Radhivya"}" <${process.env.EMAIL_USER}>`,
      to: order.customer.email,
      subject: `Your Radhivya Order is Confirmed - ${order.order_number}`,
      html: createEmailHtml(order),
      attachments: [
        {
          filename: `Radhivya-Invoice-${order.order_number}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.json({
      success: true,
      message: "Order confirmation email sent successfully.",
    });
  } catch (error) {
    console.error("Email send error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send order confirmation email.",
      error: error.message,
    });
  }
});

module.exports = router;