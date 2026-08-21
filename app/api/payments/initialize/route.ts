import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const orderId = Number(body.orderId);

    if (!Number.isInteger(orderId)) {
      return Response.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Find the order and make sure it belongs to this user
    const order = await prisma.order.findFirst({
      where: {
        id: orderId,
        userId: user.id,
      },
    });

    if (!order) {
      return Response.json({ error: "Order not found" }, { status: 404 });
    }

    if (order.paymentStatus !== "PENDING") {
      return Response.json(
        { error: "This order cannot be paid for" },
        { status: 400 },
      );
    }

    if (order.status === "CANCELLED") {
      return Response.json(
        { error: "This order has been cancelled" },
        { status: 400 },
      );
    }

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured");

      return Response.json(
        { error: "Payment service is not configured" },
        { status: 500 },
      );
    }

    // Paystack expects the amount in kobo.
    const amountInKobo = Math.round(order.total * 100);

    const response = await fetch(
      "https://api.paystack.co/transaction/initialize",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${secretKey}`,
          "Content-Type": "application/json",
        },
        // body: JSON.stringify({
        //   email: user.email,
        //   amount: amountInKobo,
        //   reference: `order_${order.id}_${Date.now()}`,
        //   metadata: {
        //     orderId: order.id,
        //     userId: user.id,
        //   },
        // }),
        body: JSON.stringify({
          email: user.email,
          amount: amountInKobo,
          reference: `order_${order.id}_${Date.now()}`,

          callback_url: `${process.env.NEXT_PUBLIC_APP_URL}/payment/callback`,

          metadata: {
            orderId: order.id,
            userId: user.id,
          },
        }),
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack initialization failed:", data);

      return Response.json(
        {
          error: data.message || "Failed to initialize payment",
        },
        { status: 400 },
      );
    }

    const reference = data.data.reference;

    // Save Paystack reference against our order
    await prisma.order.update({
      where: {
        id: order.id,
      },
      data: {
        payStackReference: reference,
      },
    });

    return Response.json({
      message: "Payment initialized",
      authorizationUrl: data.data.authorization_url,
      reference,
      accessCode: data.data.access_code,
    });
  } catch (error) {
    console.error("Payment initialization error:", error);

    return Response.json(
      {
        error: "Failed to initialize payment",
      },
      { status: 500 },
    );
  }
}
