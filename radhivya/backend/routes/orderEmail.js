const express = require("express");
const nodemailer = require("nodemailer");
const PDFDocument = require("pdfkit");

const router = express.Router();

/* =========================
   EMAIL TRANSPORT
========================= */

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

function money(value) {
  return `₹${Number(value || 0).toFixed(0)}`;
}

function safeText(value, fallback = "N/A") {
  return value ? String(value) : fallback;
}

function getCustomerEmail(order, bodyEmail) {
  return (
    bodyEmail ||
    order?.customer?.email ||
    order?.customer_email ||
    order?.email ||
    ""
  );
}

function getCustomerName(order) {
  return (
    order?.customer?.full_name ||
    order?.customer?.name ||
    order?.full_name ||
    "Radhivya Customer"
  );
}

/* =========================
   PREMIUM PDF INVOICE
========================= */

function createInvoicePdfBuffer(order) {
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      const doc = new PDFDocument({
        size: "A4",
        margin: 42,
      });

      doc.on("data", (chunk) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));

      const customer = order.customer || {};
      const items = Array.isArray(order.items) ? order.items : [];
      const invoiceDate = order.created_at
        ? new Date(order.created_at).toLocaleString()
        : new Date().toLocaleString();

      doc.rect(0, 0, 595, 132).fill("#15110d");

      doc
        .circle(525, 24, 105)
        .fillOpacity(0.18)
        .fill("#c89b5c")
        .fillOpacity(1);

      doc
        .circle(70, 120, 70)
        .fillOpacity(0.1)
        .fill("#f2d6a3")
        .fillOpacity(1);

      doc
        .fillColor("#f2d6a3")
        .fontSize(36)
        .font("Helvetica-Bold")
        .text("Radhivya", 42, 35);

      doc
        .fillColor("#fffaf3")
        .fontSize(9)
        .font("Helvetica")
        .text("PREMIUM INDIAN SKINCARE", 44, 76);

      doc
        .fillColor("#f2d6a3")
        .fontSize(22)
        .font("Helvetica-Bold")
        .text("INVOICE", 390, 38, {
          width: 160,
          align: "right",
        });

      doc
        .fillColor("#fffaf3")
        .fontSize(9)
        .font("Helvetica")
        .text(order.order_number || order.id || "RADHIVYA-INVOICE", 300, 72, {
          width: 250,
          align: "right",
        });

      doc
        .fillColor("#15110d")
        .fontSize(16)
        .font("Helvetica-Bold")
        .text("Billing Details", 42, 162);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#4f4336")
        .text(`Name: ${safeText(customer.full_name || getCustomerName(order))}`, 42, 190)
        .text(`Email: ${safeText(customer.email || order.customer_email)}`, 42, 208)
        .text(`Phone: ${safeText(customer.phone)}`, 42, 226)
        .text(
          `Address: ${safeText(customer.address)}, ${safeText(customer.city, "")}, ${safeText(customer.state, "")}, ${safeText(customer.pincode, "")}`,
          42,
          244,
          { width: 260 }
        );

      doc
        .fontSize(16)
        .font("Helvetica-Bold")
        .fillColor("#15110d")
        .text("Order Details", 350, 162);

      doc
        .fontSize(10)
        .font("Helvetica")
        .fillColor("#4f4336")
        .text(`Order No: ${safeText(order.order_number)}`, 350, 190)
        .text(`Date: ${invoiceDate}`, 350, 208)
        .text(`Payment: ${safeText(order.payment_status)}`, 350, 226)
        .text(`Status: ${safeText(order.order_status, "Order Placed")}`, 350, 244);

      let y = 315;

      doc.roundedRect(42, y, 511, 36, 8).fill("#f2d6a3");

      doc
        .fillColor("#15110d")
        .font("Helvetica-Bold")
        .fontSize(10)
        .text("Product", 56, y + 13)
        .text("Qty", 320, y + 13)
        .text("Price", 370, y + 13)
        .text("Total", 455, y + 13);

      y += 52;

      if (items.length === 0) {
        doc
          .fillColor("#7a6a58")
          .font("Helvetica")
          .fontSize(10)
          .text("No products found in this order.", 56, y);

        y += 34;
      } else {
        items.forEach((item) => {
          const qty = Number(item.quantity || 1);
          const price = Number(item.price || 0);
          const lineTotal = qty * price;

          if (y > 650) {
            doc.addPage();
            y = 60;
          }

          doc
            .fillColor("#15110d")
            .font("Helvetica-Bold")
            .fontSize(10)
            .text(safeText(item.name, "Product"), 56, y, { width: 240 });

          doc
            .fillColor("#4f4336")
            .font("Helvetica")
            .text(String(qty), 323, y)
            .text(money(price), 370, y)
            .text(money(lineTotal), 455, y);

          y += 34;

          doc
            .moveTo(42, y - 10)
            .lineTo(553, y - 10)
            .strokeColor("#ead9bf")
            .stroke();
        });
      }

      y += 18;

      const totalBoxX = 340;
      const totalBoxY = y;

      doc
        .roundedRect(totalBoxX, totalBoxY, 213, 136, 16)
        .fill("#fff7ea")
        .strokeColor("#ead9bf")
        .stroke();

      doc
        .fillColor("#4f4336")
        .font("Helvetica")
        .fontSize(11)
        .text("Subtotal", totalBoxX + 18, totalBoxY + 20)
        .text(money(order.subtotal), totalBoxX + 130, totalBoxY + 20)
        .text("Shipping", totalBoxX + 18, totalBoxY + 46)
        .text(money(order.shipping), totalBoxX + 130, totalBoxY + 46)
        .text("Discount", totalBoxX + 18, totalBoxY + 72)
        .text(`-${money(order.discount)}`, totalBoxX + 130, totalBoxY + 72);

      doc
        .fillColor("#15110d")
        .font("Helvetica-Bold")
        .fontSize(14)
        .text("Grand Total", totalBoxX + 18, totalBoxY + 104)
        .text(money(order.total), totalBoxX + 130, totalBoxY + 104);

      doc
        .fillColor("#15110d")
        .font("Helvetica-Bold")
        .fontSize(15)
        .text("Thank you for shopping with Radhivya.", 42, 700, {
          align: "center",
        });

      doc
        .fillColor("#7a6a58")
        .font("Helvetica")
        .fontSize(9)
        .text(
          "This invoice was generated automatically after successful order placement.",
          42,
          724,
          { align: "center" }
        );

      doc
        .fillColor("#9b6b3f")
        .font("Helvetica-Bold")
        .fontSize(9)
        .text("Premium skincare rituals for your everyday glow.", 42, 742, {
          align: "center",
        });

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
}

/* =========================
   PREMIUM GRAPHIC EMAIL HTML
========================= */

function createOrderEmailHtml(order) {
  const customerName = getCustomerName(order);
  const orderNumber = order.order_number || order.id || "Radhivya Order";
  const total = money(order.total);

  const itemCount = Array.isArray(order.items)
    ? order.items.reduce((sum, item) => sum + Number(item.quantity || 1), 0)
    : 0;

  const firstProduct =
    Array.isArray(order.items) && order.items.length > 0
      ? order.items[0].name
      : "Radhivya Skincare Ritual";

  const productRows = Array.isArray(order.items)
    ? order.items
        .slice(0, 4)
        .map((item) => {
          const qty = Number(item.quantity || 1);
          const price = Number(item.price || 0);

          return `
            <tr>
              <td style="padding:14px 0;border-bottom:1px solid rgba(200,155,92,0.18);">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="width:54px;">
                      <div style="width:46px;height:46px;border-radius:16px;background:linear-gradient(135deg,#15110d,#2a2118);text-align:center;line-height:46px;color:#f2d6a3;font-size:22px;">
                        ✨
                      </div>
                    </td>

                    <td>
                      <div style="color:#15110d;font-size:15px;font-weight:900;line-height:1.35;">
                        ${item.name || "Radhivya Product"}
                      </div>

                      <div style="color:#7a6a58;font-size:13px;margin-top:4px;">
                        Quantity ${qty}
                      </div>
                    </td>

                    <td style="text-align:right;color:#15110d;font-size:15px;font-weight:900;">
                      ${money(price * qty)}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          `;
        })
        .join("")
    : "";

  return `
  <!doctype html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>

    <body style="margin:0;padding:0;background:#ead8bd;font-family:Arial,Helvetica,sans-serif;color:#15110d;">
      <div style="width:100%;padding:42px 14px;background:linear-gradient(135deg,#fffaf3 0%,#f5ead8 42%,#d7b37a 100%);">

        <div style="max-width:780px;margin:0 auto;border-radius:44px;overflow:hidden;box-shadow:0 45px 120px rgba(21,17,13,0.28);background:#fffaf3;">

          <div style="background:linear-gradient(135deg,#050403 0%,#15110d 56%,#2a2118 100%);padding:48px 34px 42px;text-align:center;">

            <div style="margin:0 auto 22px;width:112px;height:112px;border-radius:36px;background:linear-gradient(145deg,#f2d6a3,#c89b5c 55%,#15110d);border:1px solid rgba(242,214,163,0.32);box-shadow:0 25px 70px rgba(0,0,0,0.34);text-align:center;line-height:112px;">
              <span style="font-size:56px;color:#15110d;font-weight:900;font-family:Georgia,serif;">R</span>
            </div>

            <div style="font-size:54px;line-height:1;font-family:Georgia,serif;font-weight:900;color:#f2d6a3;letter-spacing:-1px;">
              Radhivya
            </div>

            <div style="margin-top:14px;color:rgba(255,250,243,0.72);letter-spacing:5px;text-transform:uppercase;font-size:12px;font-weight:900;">
              Premium Indian Skincare
            </div>

            <div style="margin:34px auto 0;max-width:560px;">
              <div style="display:inline-block;background:rgba(242,214,163,0.15);border:1px solid rgba(242,214,163,0.34);color:#f2d6a3;border-radius:999px;padding:11px 18px;font-size:12px;font-weight:900;letter-spacing:2px;text-transform:uppercase;">
                ✨ Order Successfully Placed ✨
              </div>

              <h1 style="margin:24px 0 14px;color:#fffaf3;font-size:42px;line-height:1.12;font-family:Georgia,serif;font-weight:900;">
                Your luxury glow ritual is confirmed
              </h1>

              <p style="margin:0;color:rgba(255,250,243,0.78);font-size:16px;line-height:1.85;">
                Thank you for choosing Radhivya. Your skincare order is now being prepared with care, elegance, and premium packaging.
              </p>
            </div>

            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin-top:34px;">
              <tr>
                <td align="center">
                  <table role="presentation" cellspacing="0" cellpadding="0">
                    <tr>
                      <td style="padding:0 6px;">
                        <div style="width:56px;height:56px;border-radius:18px;background:rgba(255,250,243,0.09);border:1px solid rgba(242,214,163,0.22);line-height:56px;text-align:center;font-size:26px;">🧴</div>
                      </td>
                      <td style="padding:0 6px;">
                        <div style="width:56px;height:56px;border-radius:18px;background:rgba(255,250,243,0.09);border:1px solid rgba(242,214,163,0.22);line-height:56px;text-align:center;font-size:26px;">💄</div>
                      </td>
                      <td style="padding:0 6px;">
                        <div style="width:56px;height:56px;border-radius:18px;background:rgba(255,250,243,0.09);border:1px solid rgba(242,214,163,0.22);line-height:56px;text-align:center;font-size:26px;">🌸</div>
                      </td>
                      <td style="padding:0 6px;">
                        <div style="width:56px;height:56px;border-radius:18px;background:rgba(255,250,243,0.09);border:1px solid rgba(242,214,163,0.22);line-height:56px;text-align:center;font-size:26px;">✨</div>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </div>

          <div style="padding:40px 34px;background:#fffaf3;">

            <p style="margin:0 0 12px;color:#7a6a58;font-size:17px;line-height:1.8;">
              Hello <strong style="color:#15110d;">${customerName}</strong>,
            </p>

            <p style="margin:0 0 30px;color:#7a6a58;font-size:16px;line-height:1.85;">
              Your order has been placed successfully. We have attached your invoice PDF with this email. You can also track your order and view invoice from your Radhivya customer profile.
            </p>

            <div style="background:linear-gradient(135deg,#15110d,#2a2118);border-radius:34px;padding:30px;margin:0 0 30px;box-shadow:0 28px 80px rgba(21,17,13,0.24);">

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align:top;">
                    <div style="color:#c89b5c;font-size:12px;font-weight:900;letter-spacing:3px;text-transform:uppercase;margin-bottom:9px;">
                      Order Number
                    </div>

                    <div style="color:#fffaf3;font-size:27px;font-weight:900;line-height:1.2;">
                      ${orderNumber}
                    </div>
                  </td>

                  <td style="vertical-align:top;text-align:right;">
                    <div style="display:inline-block;background:#f2d6a3;color:#15110d;border-radius:22px;padding:16px 20px;min-width:125px;text-align:center;">
                      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;font-weight:900;color:#7a4f23;">
                        Grand Total
                      </div>

                      <div style="font-size:28px;font-weight:900;margin-top:5px;">
                        ${total}
                      </div>
                    </div>
                  </td>
                </tr>
              </table>

              <div style="height:1px;background:rgba(242,214,163,0.24);margin:28px 0;"></div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="width:50%;padding:7px;">
                    <div style="background:rgba(255,250,243,0.08);border:1px solid rgba(242,214,163,0.16);border-radius:22px;padding:18px;">
                      <div style="color:#c89b5c;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Payment</div>
                      <div style="color:#fffaf3;font-size:17px;font-weight:900;">${order.payment_status || "Confirmed"}</div>
                    </div>
                  </td>

                  <td style="width:50%;padding:7px;">
                    <div style="background:rgba(255,250,243,0.08);border:1px solid rgba(242,214,163,0.16);border-radius:22px;padding:18px;">
                      <div style="color:#c89b5c;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Items</div>
                      <div style="color:#fffaf3;font-size:17px;font-weight:900;">${itemCount} item${itemCount === 1 ? "" : "s"}</div>
                    </div>
                  </td>
                </tr>

                <tr>
                  <td style="width:50%;padding:7px;">
                    <div style="background:rgba(255,250,243,0.08);border:1px solid rgba(242,214,163,0.16);border-radius:22px;padding:18px;">
                      <div style="color:#c89b5c;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Main Product</div>
                      <div style="color:#fffaf3;font-size:17px;font-weight:900;">${firstProduct}</div>
                    </div>
                  </td>

                  <td style="width:50%;padding:7px;">
                    <div style="background:rgba(255,250,243,0.08);border:1px solid rgba(242,214,163,0.16);border-radius:22px;padding:18px;">
                      <div style="color:#c89b5c;font-size:11px;font-weight:900;text-transform:uppercase;letter-spacing:2px;margin-bottom:8px;">Delivery</div>
                      <div style="color:#fffaf3;font-size:17px;font-weight:900;">Within 7 days</div>
                    </div>
                  </td>
                </tr>
              </table>
            </div>

            <div style="background:#fffaf3;border:1px solid rgba(200,155,92,0.26);border-radius:30px;padding:26px;margin-bottom:30px;box-shadow:0 18px 55px rgba(21,17,13,0.08);">
              <div style="color:#15110d;font-size:28px;line-height:1.2;font-family:Georgia,serif;font-weight:900;margin-bottom:18px;">
                Your selected skincare ritual
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                ${
                  productRows ||
                  `
                  <tr>
                    <td style="color:#7a6a58;font-size:15px;line-height:1.7;">
                      Your Radhivya products are listed in the attached invoice.
                    </td>
                  </tr>
                `
                }
              </table>
            </div>

            <div style="background:linear-gradient(135deg,rgba(242,214,163,0.45),rgba(255,250,243,0.96));border:1px solid rgba(200,155,92,0.3);border-radius:34px;padding:28px;margin-bottom:30px;">

              <div style="text-align:center;margin-bottom:24px;">
                <div style="color:#9b6b3f;font-size:12px;font-weight:900;text-transform:uppercase;letter-spacing:4px;">
                  Delivery Journey
                </div>

                <h2 style="margin:10px 0 0;color:#15110d;font-size:32px;line-height:1.1;font-family:Georgia,serif;">
                  Your 7-day glow delivery path
                </h2>
              </div>

              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  <td align="center" style="padding:8px;">
                    <div style="width:62px;height:62px;border-radius:50%;background:#15110d;color:#f2d6a3;text-align:center;line-height:62px;font-size:24px;font-weight:900;margin:0 auto;">✓</div>
                    <div style="color:#15110d;font-weight:900;font-size:13px;margin-top:10px;">Placed</div>
                  </td>

                  <td align="center" style="padding:8px;">
                    <div style="width:62px;height:62px;border-radius:50%;background:#f2d6a3;color:#15110d;text-align:center;line-height:62px;font-size:22px;font-weight:900;margin:0 auto;">2</div>
                    <div style="color:#15110d;font-weight:900;font-size:13px;margin-top:10px;">Confirmed</div>
                  </td>

                  <td align="center" style="padding:8px;">
                    <div style="width:62px;height:62px;border-radius:50%;background:#f2d6a3;color:#15110d;text-align:center;line-height:62px;font-size:22px;font-weight:900;margin:0 auto;">3</div>
                    <div style="color:#15110d;font-weight:900;font-size:13px;margin-top:10px;">Packed</div>
                  </td>

                  <td align="center" style="padding:8px;">
                    <div style="width:62px;height:62px;border-radius:50%;background:#f2d6a3;color:#15110d;text-align:center;line-height:62px;font-size:22px;font-weight:900;margin:0 auto;">4</div>
                    <div style="color:#15110d;font-weight:900;font-size:13px;margin-top:10px;">Delivered</div>
                  </td>
                </tr>
              </table>
            </div>

            <div style="text-align:center;background:linear-gradient(135deg,#15110d,#2a2118);border-radius:34px;padding:34px 24px;margin-bottom:30px;">

              <div style="width:76px;height:76px;border-radius:24px;background:#f2d6a3;color:#15110d;line-height:76px;text-align:center;font-size:34px;margin:0 auto 18px;">
                🧾
              </div>

              <h2 style="margin:0 0 12px;color:#f2d6a3;font-size:32px;line-height:1.15;font-family:Georgia,serif;">
                Your invoice PDF is attached
              </h2>

              <p style="margin:0 auto 20px;color:rgba(255,250,243,0.76);font-size:15px;line-height:1.75;max-width:560px;">
                Keep this email for your records. You can also access your invoice, order history, tracking, and support inbox inside your Radhivya profile.
              </p>

              <div style="display:inline-block;background:#f2d6a3;color:#15110d;border-radius:999px;padding:14px 24px;font-weight:900;">
                Thank you for shopping with Radhivya
              </div>
            </div>

            <div style="background:#fff8ec;border:1px solid rgba(200,155,92,0.24);border-radius:28px;padding:24px;text-align:center;">
              <div style="font-size:34px;margin-bottom:10px;">🌸</div>

              <div style="color:#15110d;font-size:22px;font-weight:900;font-family:Georgia,serif;margin-bottom:8px;">
                A little note from Radhivya
              </div>

              <p style="margin:0;color:#7a6a58;font-size:15px;line-height:1.75;">
                Your glow journey matters to us. We hope every product feels elegant, calming, and beautifully crafted for your self-care ritual.
              </p>
            </div>
          </div>

          <div style="background:#090705;text-align:center;padding:34px 24px;">
            <div style="color:#f2d6a3;font-size:26px;font-weight:900;font-family:Georgia,serif;">
              Radhivya
            </div>

            <div style="margin:12px auto 0;max-width:520px;color:rgba(255,250,243,0.62);font-size:13px;line-height:1.8;">
              Premium skincare rituals for your everyday glow.<br/>
              This is an automated email. Please do not reply directly to this message.
            </div>

            <div style="margin-top:22px;">
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#f2d6a3;margin:0 5px;"></span>
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#c89b5c;margin:0 5px;"></span>
              <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:#fffaf3;margin:0 5px;"></span>
            </div>
          </div>

        </div>
      </div>
    </body>
  </html>
  `;
}

/* =========================
   SEND ORDER EMAIL
========================= */

router.post("/send", async (req, res) => {
  try {
    const { order, customer_email } = req.body;

    if (!order) {
      return res.status(400).json({
        success: false,
        message: "Order data is required.",
      });
    }

    const toEmail = getCustomerEmail(order, customer_email);

    if (!toEmail) {
      return res.status(400).json({
        success: false,
        message: "Customer email missing. Cannot send invoice email.",
      });
    }

    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: "Email credentials missing in backend .env.",
      });
    }

    const pdfBuffer = await createInvoicePdfBuffer(order);
    const transporter = makeTransporter();

    const orderNumber = order.order_number || order.id || "Radhivya Order";

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Radhivya"}" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Your Radhivya order is confirmed - ${orderNumber}`,
      html: createOrderEmailHtml(order),
      attachments: [
        {
          filename: `Radhivya-Invoice-${orderNumber}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.json({
      success: true,
      message: "Order confirmation email and invoice sent successfully.",
      sent_to: toEmail,
    });
  } catch (error) {
    console.error("Order email error:", error);

    res.status(500).json({
      success: false,
      message: "Failed to send order email.",
      error: error.message,
    });
  }
});

/* =========================
   TEST ORDER EMAIL
========================= */

router.post("/test", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required for test email.",
      });
    }

    const testOrder = {
      id: "TEST-ORDER",
      order_number: "RAD-TEST-ORDER",
      created_at: new Date().toISOString(),
      customer_email: email,
      customer: {
        full_name: "Test Customer",
        email,
        phone: "0000000000",
        address: "Test Address",
        city: "Test City",
        state: "Test State",
        pincode: "000000",
      },
      items: [
        {
          name: "Glow Nectar Vitamin C Serum",
          quantity: 1,
          price: 1299,
        },
        {
          name: "Velvet Hydration Moisturizer",
          quantity: 1,
          price: 899,
        },
      ],
      subtotal: 2198,
      shipping: 0,
      discount: 199,
      total: 1999,
      payment_status: "paid",
      order_status: "Order Confirmed",
    };

    const pdfBuffer = await createInvoicePdfBuffer(testOrder);
    const transporter = makeTransporter();

    await transporter.sendMail({
      from: `"${process.env.EMAIL_FROM_NAME || "Radhivya"}" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Test Radhivya invoice email",
      html: createOrderEmailHtml(testOrder),
      attachments: [
        {
          filename: "Radhivya-Test-Invoice.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    });

    res.json({
      success: true,
      message: "Test order email sent successfully.",
      sent_to: email,
    });
  } catch (error) {
    console.error("Test order email error:", error);

    res.status(500).json({
      success: false,
      message: "Test email failed.",
      error: error.message,
    });
  }
});

module.exports = router;