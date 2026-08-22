import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(request: Request) {
  try {
    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      return Response.json(
        {
          error: "PAYSTACK_SECRET_KEY is not configured",
        },
        { status: 500 },
      );
    }

    // Authenticate user
    const user = await getCurrentUser();

    if (!user) {
      return Response.json(
        {
          error: "Unauthorized",
        },
        { status: 401 },
      );
    }

    // Get reference from URL
    const { searchParams } = new URL(request.url);
    const reference = searchParams.get("reference");

    if (!reference) {
      return Response.json(
        {
          error: "Payment reference is required",
        },
        { status: 400 },
      );
    }

    // Find the order belonging to this user
    const order = await prisma.order.findFirst({
      where: {
        payStackReference: reference,
        userId: user.id,
      },
    });

    if (!order) {
      return Response.json(
        {
          error: "Order not found",
        },
        { status: 404 },
      );
    }

    // Ask Paystack to verify the transaction
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference,
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${secretKey}`,
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack verification failed:", data);

      return Response.json(
        {
          error: data.message || "Unable to verify payment",
        },
        { status: 400 },
      );
    }

    const transaction = data.data;

    // Verify that the transaction belongs to this order
    if (transaction.reference !== order.payStackReference) {
      return Response.json(
        {
          error: "Payment reference mismatch",
        },
        { status: 400 },
      );
    }

    // Paystack amounts are represented in the currency subunit.
    const expectedAmount = Math.round(order.total * 100);

    if (transaction.amount !== expectedAmount) {
      console.error("Payment amount mismatch", {
        orderId: order.id,
        expectedAmount,
        receivedAmount: transaction.amount,
      });

      return Response.json(
        {
          error: "Payment amount mismatch",
        },
        { status: 400 },
      );
    }

    // Only successful transactions should be treated as paid.
    if (transaction.status !== "success") {
      return Response.json({
        success: false,
        paymentStatus: transaction.status,
        message:
          transaction.gateway_response ||
          transaction.message ||
          "Payment was not successful",
        orderId: order.id,
      });
    }

    /*
     * IMPORTANT:
     *
     * We do not reduce stock here.
     *
     * The webhook is responsible for final fulfillment.
     *
     * This endpoint simply tells the callback whether
     * Paystack considers the transaction successful.
     */

    return Response.json({
      success: true,
      paymentStatus: "success",
      orderId: order.id,
    });
  } catch (error) {
    console.error("Payment verification error:", error);

    return Response.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to verify payment",
      },
      { status: 500 },
    );
  }
}
