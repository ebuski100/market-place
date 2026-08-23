//

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import type { OrderStatus } from "@/lib/generated/prisma/client";

const validStatuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const statusOrder: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
];

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    // 1. Make sure the requester is an admin
    await requireAdmin();

    // 2. Get order ID
    const { orderId } = await params;

    const id = Number(orderId);

    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // 3. Read request body
    const body = await request.json();

    const newStatus = body.status as OrderStatus;

    // 4. Validate status
    if (!validStatuses.includes(newStatus)) {
      return Response.json({ error: "Invalid order status" }, { status: 400 });
    }

    // 5. Find order
    const order = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // 6. Don't change anything if status is already the same
    if (order.status === newStatus) {
      return Response.json({
        message: "Order already has this status",
        order,
      });
    }

    // 7. Don't allow changes to a cancelled order
    if (order.status === "CANCELLED") {
      return Response.json(
        {
          error: "A cancelled order cannot be updated",
        },
        { status: 400 },
      );
    }

    // 8. Don't allow a cancelled order to be delivered
    if (newStatus === "DELIVERED" && order.paymentStatus !== "PAID") {
      return Response.json(
        {
          error:
            "An order cannot be marked as delivered before payment is confirmed",
        },
        { status: 400 },
      );
    }

    // 9. Don't allow fulfillment of unpaid orders
    const fulfillmentStatuses: OrderStatus[] = [
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
    ];

    if (
      fulfillmentStatuses.includes(newStatus) &&
      order.paymentStatus !== "PAID"
    ) {
      return Response.json(
        {
          error: "Payment must be confirmed before fulfilling this order",
        },
        { status: 400 },
      );
    }

    // 10. Prevent skipping forward through the workflow
    //
    // Example:
    //
    // PROCESSING → DELIVERED ❌
    //
    // Instead:
    //
    // PROCESSING → SHIPPED
    // SHIPPED → OUT_FOR_DELIVERY
    // OUT_FOR_DELIVERY → DELIVERED

    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(newStatus);

    if (currentIndex !== -1 && newIndex !== -1 && newIndex > currentIndex + 1) {
      return Response.json(
        {
          error: `You cannot move an order directly from ${order.status} to ${newStatus}`,
        },
        { status: 400 },
      );
    }

    // 11. Update order
    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status: newStatus,
      },
    });

    // 12. Return updated order
    return Response.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Admin order status update error:", error);

    return Response.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to update order status",
      },
      { status: 500 },
    );
  }
}
