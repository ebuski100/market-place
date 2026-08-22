export function getOrderStatus(order: {
  paymentStatus: string;
  paidAt: Date | null;
  estimatedDeliveryAt: Date | null;
}) {
  //   if (order.paymentStatus !== "PAID") {
  //     return "PENDING";
  //   }

  if (!order.paidAt) {
    return "PENDING";
  }

  const now = Date.now();
  const paidAt = order.paidAt.getTime();

  const thirtyMinutes = 30 * 60 * 1000;
  const twoHours = 2 * 60 * 60 * 1000;
  const oneDay = 24 * 60 * 60 * 1000;

  const elapsed = now - paidAt;

  if (elapsed < thirtyMinutes) {
    return "CONFIRMED";
  }

  if (elapsed < twoHours) {
    return "PROCESSING";
  }

  if (elapsed < oneDay) {
    return "SHIPPED";
  }

  if (order.estimatedDeliveryAt && now < order.estimatedDeliveryAt.getTime()) {
    return "IN_TRANSIT";
  }

  return "DELIVERED";
}
