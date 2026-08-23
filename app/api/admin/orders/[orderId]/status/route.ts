import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";

const allowedStatuses = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
] as const;

type OrderStatus = (typeof allowedStatuses)[number];

export async function PATCH(
  request: Request,
  {
    params,
  }: {
    params: Promise<{
      orderId: string;
    }>;
  },
) {
  try {
    // Only admins can reach this operation.
    await requireAdmin();

    const { orderId } = await params;

    const id = Number(orderId);

    if (!Number.isInteger(id)) {
      return Response.json({ error: "Invalid order ID" }, { status: 400 });
    }

    const body = await request.json();

    const newStatus = body.status as OrderStatus;

    if (!allowedStatuses.includes(newStatus)) {
      return Response.json({ error: "Invalid order status" }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    // Do not allow an unpaid order to move
    // into fulfillment stages.
    if (
      order.paymentStatus !== "PAID" &&
      ["PROCESSING", "SHIPPED", "OUT_FOR_DELIVERY", "DELIVERED"].includes(
        newStatus,
      )
    ) {
      return Response.json(
        {
          error: "A paid order is required before fulfillment can continue.",
        },
        { status: 400 },
      );
    }

    const updatedOrder = await prisma.order.update({
      where: {
        id,
      },
      data: {
        status: newStatus,
      },
    });

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
