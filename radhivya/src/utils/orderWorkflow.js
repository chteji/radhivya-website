export const TRACKING_STAGES = [
  {
    key: "order_placed",
    status: "Order Placed",
    dayOffset: 0,
    location: "Radhivya Online Store",
    note: "Your order has been placed successfully.",
  },
  {
    key: "order_confirmed",
    status: "Order Confirmed",
    dayOffset: 0,
    location: "Radhivya Operations",
    note: "Your order is waiting for admin confirmation.",
  },
  {
    key: "packed",
    status: "Packed",
    dayOffset: 1,
    location: "Radhivya Warehouse",
    note: "Your products will be packed carefully.",
  },
  {
    key: "shipped",
    status: "Shipped",
    dayOffset: 3,
    location: "Courier Partner",
    note: "Your order will be handed over to courier.",
  },
  {
    key: "out_for_delivery",
    status: "Out for Delivery",
    dayOffset: 6,
    location: "Local Delivery Hub",
    note: "Your order will be out for delivery.",
  },
  {
    key: "delivered",
    status: "Delivered",
    dayOffset: 7,
    location: "Customer Address",
    note: "Your order should be delivered within 7 days.",
  },
];

export function addDays(dateInput, days) {
  const date = new Date(dateInput);
  date.setDate(date.getDate() + Number(days || 0));
  return date;
}

export function formatDate(dateInput) {
  return new Date(dateInput).toLocaleDateString();
}

export function formatTime(dateInput) {
  return new Date(dateInput).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function createTrackingTimeline(orderDate = new Date(), customerCity = "") {
  return TRACKING_STAGES.map((stage, index) => {
    const plannedDate = addDays(orderDate, stage.dayOffset);

    return {
      ...stage,
      location:
        stage.key === "delivered" && customerCity
          ? customerCity
          : stage.location,
      planned_date: plannedDate.toISOString(),
      date: formatDate(plannedDate),
      time: index === 0 ? formatTime(orderDate) : "Expected",
      completed: index === 0,
      approved_at: index === 0 ? new Date(orderDate).toISOString() : null,
      approved_by: index === 0 ? "System" : "",
      admin_note: index === 0 ? "Order received successfully." : "",
    };
  });
}

export function normalizeTracking(tracking = [], orderDate = new Date(), customerCity = "") {
  const fixedTimeline = createTrackingTimeline(orderDate, customerCity);

  return fixedTimeline.map((stage) => {
    const matches = tracking.filter(
      (item) =>
        item.key === stage.key ||
        item.step_key === stage.key ||
        String(item.status || "").toLowerCase() === stage.status.toLowerCase()
    );

    const latest = matches[matches.length - 1];

    if (!latest) return stage;

    return {
      ...stage,
      ...latest,
      key: stage.key,
      status: stage.status,
      planned_date: latest.planned_date || stage.planned_date,
      date: latest.date || stage.date,
      time: latest.time || stage.time,
      location: latest.location || stage.location,
      note: latest.note || stage.note,
      completed: Boolean(latest.completed),
    };
  });
}

export function getNextPendingStage(order) {
  const tracking = normalizeTracking(
    order.tracking || [],
    order.created_at,
    order.customer?.city
  );

  return tracking.find((step) => !step.completed);
}

export function approveTrackingStage(order, stageKey, adminNote = "", adminName = "Admin") {
  const tracking = normalizeTracking(
    order.tracking || [],
    order.created_at,
    order.customer?.city
  );

  const updatedTracking = tracking.map((step) => {
    if (step.key !== stageKey) return step;

    const now = new Date();

    return {
      ...step,
      completed: true,
      approved_at: now.toISOString(),
      approved_by: adminName,
      admin_note: adminNote || `${step.status} approved by admin.`,
      date: formatDate(now),
      time: formatTime(now),
    };
  });

  const latestCompleted = [...updatedTracking].reverse().find((step) => step.completed);

  return {
    ...order,
    order_status: latestCompleted?.status || order.order_status,
    tracking: updatedTracking,
  };
}

export function readOrders() {
  try {
    return JSON.parse(localStorage.getItem("radhivyaOrders") || "[]");
  } catch {
    return [];
  }
}

export function saveOrders(orders) {
  localStorage.setItem("radhivyaOrders", JSON.stringify(orders));
}

export function saveInvoice(order) {
  localStorage.setItem("radhivyaInvoice", JSON.stringify(order));
  localStorage.setItem("radhivyaLastOrder", JSON.stringify(order));
}