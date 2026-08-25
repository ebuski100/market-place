import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { OrderStatus } from "@/lib/generated/prisma/client";

const validStatuses: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
  OrderStatus.CANCELLED,
];

const statusOrder: OrderStatus[] = [
  OrderStatus.PENDING,
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

const fulfillmentStatuses: OrderStatus[] = [
  OrderStatus.CONFIRMED,
  OrderStatus.PROCESSING,
  OrderStatus.SHIPPED,
  OrderStatus.OUT_FOR_DELIVERY,
  OrderStatus.DELIVERED,
];

type RouteContext = {
  params: Promise<{
    orderId: string;
  }>;
};

export async function PATCH(request: Request, { params }: RouteContext) {
  try {
    // --------------------------------------------------
    // 1. Authenticate admin
    // --------------------------------------------------

    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        },
      );
    }

    if (user.role !== "ADMIN") {
      return Response.json(
        {
          error: "Forbidden",
        },
        {
          status: 403,
        },
      );
    }

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
    // 4. Validate status
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
    // 5. Perform everything inside one transaction
    // --------------------------------------------------

    const updatedOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: {
          id,
        },
        include: {
          items: true,
        },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      // ----------------------------------------------
      // Same status
      // ----------------------------------------------

      if (order.status === newStatus) {
        return order;
      }

      // ----------------------------------------------
      // Cancelled orders cannot be modified
      // ----------------------------------------------

      if (order.status === OrderStatus.CANCELLED) {
        throw new Error("CANCELLED_ORDER");
      }

      // ----------------------------------------------
      // Delivered orders cannot be modified
      // ----------------------------------------------

      if (order.status === OrderStatus.DELIVERED) {
        throw new Error("DELIVERED_ORDER");
      }

      // ----------------------------------------------
      // Payment protection
      // ----------------------------------------------

      if (
        fulfillmentStatuses.includes(newStatus) &&
        order.paymentStatus !== "PAID"
      ) {
        throw new Error("PAYMENT_REQUIRED");
      }

      // ----------------------------------------------
      // Prevent skipping fulfillment stages
      // ----------------------------------------------

      const currentIndex = statusOrder.indexOf(order.status);
      const newIndex = statusOrder.indexOf(newStatus);

      if (
        currentIndex !== -1 &&
        newIndex !== -1 &&
        newIndex > currentIndex + 1
      ) {
        throw new Error("INVALID_STATUS_TRANSITION");
      }

      // ----------------------------------------------
      // Cancellation
      // ----------------------------------------------

      if (newStatus === OrderStatus.CANCELLED) {
        for (const item of order.items) {
          // Restore stock
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

          // Record inventory transaction
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
      // Update order
      // ----------------------------------------------

      return tx.order.update({
        where: {
          id,
        },
        data: {
          status: newStatus,
        },
        include: {
          items: true,
        },
      });
    });

    return Response.json({
      message: "Order status updated successfully",
      order: updatedOrder,
    });
  } catch (error) {
    console.error("Admin order status update error:", error);

    if (error instanceof Error) {
      switch (error.message) {
        case "ORDER_NOT_FOUND":
          return Response.json({ error: "Order not found" }, { status: 404 });

        case "CANCELLED_ORDER":
          return Response.json(
            {
              error: "A cancelled order cannot be updated.",
            },
            { status: 400 },
          );

        case "DELIVERED_ORDER":
          return Response.json(
            {
              error: "A delivered order cannot be updated.",
            },
            { status: 400 },
          );

        case "PAYMENT_REQUIRED":
          return Response.json(
            {
              error: "Payment must be confirmed before fulfilling this order.",
            },
            { status: 400 },
          );

        case "INVALID_STATUS_TRANSITION":
          return Response.json(
            {
              error: "You cannot skip order fulfillment stages.",
            },
            { status: 400 },
          );
      }
    }

    return Response.json(
      {
        error: "Failed to update order status",
      },
      {
        status: 500,
      },
    );
  }
}
