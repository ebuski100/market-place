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

const fulfillmentStatuses: OrderStatus[] = [
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
    // --------------------------------------------------
    // 1. Make sure the requester is an admin
    // --------------------------------------------------

    await requireAdmin();

    // --------------------------------------------------
    // 2. Get order ID
    // --------------------------------------------------

    const { orderId } = await params;

    const id = Number(orderId);

    if (!Number.isInteger(id)) {
      return Response.json(
        {
          error: "Invalid order ID",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 3. Read request body
    // --------------------------------------------------

    const body = await request.json();

    const newStatus = body.status as OrderStatus;

    // --------------------------------------------------
    // 4. Validate requested status
    // --------------------------------------------------

    if (!validStatuses.includes(newStatus)) {
      return Response.json(
        {
          error: "Invalid order status",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 5. Find order
    // --------------------------------------------------

    const order = await prisma.order.findUnique({
      where: {
        id,
      },
      include: {
        items: true,
      },
    });

    if (!order) {
      return Response.json(
        {
          error: "Order not found",
        },
        {
          status: 404,
        },
      );
    }

    // --------------------------------------------------
    // 6. Don't update if status is already the same
    // --------------------------------------------------

    if (order.status === newStatus) {
      return Response.json({
        message: "Order already has this status",
        order,
      });
    }

    // --------------------------------------------------
    // 7. Don't modify cancelled orders
    // --------------------------------------------------

    if (order.status === "CANCELLED") {
      return Response.json(
        {
          error: "A cancelled order cannot be updated",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 8. Don't modify delivered orders
    // --------------------------------------------------

    if (order.status === "DELIVERED") {
      return Response.json(
        {
          error: "A delivered order cannot be updated",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 9. Payment protection
    // --------------------------------------------------

    if (
      fulfillmentStatuses.includes(newStatus) &&
      order.paymentStatus !== "PAID"
    ) {
      return Response.json(
        {
          error: "Payment must be confirmed before fulfilling this order",
        },
        {
          status: 400,
        },
      );
    }

    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(newStatus);

    if (currentIndex !== -1 && newIndex !== -1 && newIndex > currentIndex + 1) {
      return Response.json(
        {
          error: `You cannot move an order directly from ${order.status} to ${newStatus}`,
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 11. Update order inside a transaction
    // --------------------------------------------------

    const updatedOrder = await prisma.$transaction(async (tx) => {
      // ----------------------------------------------
      // Cancellation
      // ----------------------------------------------

      if (newStatus === "CANCELLED") {
        /*
         * Restore the stock that was reserved for
         * this order.
         */

        for (const item of order.items) {
          await tx.product.update({
            where: {
              id: item.productId,
            },
            data: {
              stock: {
                increment: item.quantity,
              },
            },
          });

          /*
           * Record the inventory change.
           */

          await tx.inventoryTransaction.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: "RETURN",
              reason: `Cancelled order #${order.id}`,
            },
          });
        }
      }

      // ----------------------------------------------
      // Update order status
      // ----------------------------------------------

      return tx.order.update({
        where: {
          id,
        },
        data: {
          status: newStatus,
        },
      });
    });

    // --------------------------------------------------
    // 12. Return updated order
    // --------------------------------------------------

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
      {
        status: 500,
      },
    );
  }
}
