import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);

    const reference = searchParams.get("reference");

    if (!reference) {
      redirect("/checkout?payment=failed");
    }

    // Verify transaction directly with Paystack
    const response = await fetch(
      `https://api.paystack.co/transaction/verify/${encodeURIComponent(
        reference,
      )}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      },
    );

    const data = await response.json();

    if (!response.ok || !data.status) {
      console.error("Paystack verification failed:", data);

      redirect("/checkout?payment=failed");
    }

    const transaction = data.data;

    // Paystack should report a successful transaction
    if (transaction.status !== "success") {
      redirect("/checkout?payment=failed");
    }

    // Find the order using the reference
    const order = await prisma.order.findUnique({
      where: {
        payStackReference: reference,
      },
    });

    if (!order) {
      redirect("/checkout?payment=failed");
    }

    // Verify the amount independently
    const expectedAmount = Math.round(order.total * 100);

    if (transaction.amount !== expectedAmount) {
      console.error("Payment amount mismatch", {
        orderId: order.id,
        expectedAmount,
        receivedAmount: transaction.amount,
      });

      redirect("/checkout?payment=failed");
    }

    // Don't process an already-paid order again
    if (order.paymentStatus !== "PAID") {
      await prisma.order.update({
        where: {
          id: order.id,
        },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
          paidAt: new Date(),
        },
      });
    }

    // Redirect customer to their order
    redirect(`/orders/${order.id}`);
  } catch (error) {
    console.error("Payment callback error:", error);

    redirect("/checkout?payment=failed");
  }
}
