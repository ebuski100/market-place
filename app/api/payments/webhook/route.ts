import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    // --------------------------------------------------
    // 1. Get Paystack secret key
    // --------------------------------------------------

    const secretKey = process.env.PAYSTACK_SECRET_KEY;

    if (!secretKey) {
      console.error("PAYSTACK_SECRET_KEY is not configured");

      return Response.json(
        {
          error: "Server configuration error",
        },
        {
          status: 500,
        },
      );
    }

    // --------------------------------------------------
    // 2. Get the raw request body
    // --------------------------------------------------

    const rawBody = await request.text();

    // --------------------------------------------------
    // 3. Get Paystack signature
    // --------------------------------------------------

    const signature = request.headers.get("x-paystack-signature");

    if (!signature) {
      console.error("Missing Paystack signature");

      return Response.json(
        {
          error: "Missing Paystack signature",
        },
        {
          status: 401,
        },
      );
    }

    // --------------------------------------------------
    // 4. Generate our own signature
    // --------------------------------------------------

    const expectedSignature = crypto
      .createHmac("sha512", secretKey)
      .update(rawBody)
      .digest("hex");

    // --------------------------------------------------
    // 5. Securely compare signatures
    // --------------------------------------------------

    const receivedSignatureBuffer = Buffer.from(signature, "utf8");
    const expectedSignatureBuffer = Buffer.from(expectedSignature, "utf8");

    // timingSafeEqual throws if the buffers have
    // different lengths, so check first.
    if (receivedSignatureBuffer.length !== expectedSignatureBuffer.length) {
      console.error("Invalid Paystack webhook signature length");

      return Response.json(
        {
          error: "Invalid signature",
        },
        {
          status: 401,
        },
      );
    }

    const signaturesMatch = crypto.timingSafeEqual(
      receivedSignatureBuffer,
      expectedSignatureBuffer,
    );

    if (!signaturesMatch) {
      console.error("Invalid Paystack webhook signature");

      return Response.json(
        {
          error: "Invalid signature",
        },
        {
          status: 401,
        },
      );
    }

    // --------------------------------------------------
    // 6. Parse verified webhook payload
    // --------------------------------------------------

    let event: {
      event?: string;
      data?: {
        reference?: string;
        amount?: number;
        status?: string;
      };
    };

    try {
      event = JSON.parse(rawBody);
    } catch {
      console.error("Invalid JSON received from Paystack");

      return Response.json(
        {
          error: "Invalid webhook payload",
        },
        {
          status: 400,
        },
      );
    }

    console.log("Paystack webhook received:", event.event);

    // --------------------------------------------------
    // 7. Ignore events we don't currently handle
    // --------------------------------------------------

    if (event.event !== "charge.success") {
      return Response.json({
        received: true,
      });
    }

    // --------------------------------------------------
    // 8. Get transaction information
    // --------------------------------------------------

    const transaction = event.data;

    if (!transaction) {
      console.error("Webhook has no transaction data");

      return Response.json(
        {
          error: "Missing transaction data",
        },
        {
          status: 400,
        },
      );
    }

    const reference = transaction.reference;

    if (!reference) {
      console.error("Webhook transaction has no reference");

      return Response.json(
        {
          error: "Missing transaction reference",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 9. Find the order using Paystack reference
    // --------------------------------------------------

    const order = await prisma.order.findUnique({
      where: {
        payStackReference: reference,
      },
    });

    if (!order) {
      console.error(`No order found for Paystack reference: ${reference}`);

      // Return 200 so Paystack doesn't repeatedly retry
      // an event we cannot associate with an order.
      return Response.json({
        received: true,
      });
    }

    // --------------------------------------------------
    // 10. Verify payment amount
    // --------------------------------------------------

    // Paystack amounts are represented in kobo.
    //
    // Example:
    // ₦1,800,000 = 180,000,000 kobo
    //
    const expectedAmount = Math.round(order.total * 100);

    if (transaction.amount !== expectedAmount) {
      console.error("Payment amount mismatch", {
        orderId: order.id,
        reference,
        expectedAmount,
        receivedAmount: transaction.amount,
      });

      return Response.json(
        {
          error: "Payment amount mismatch",
        },
        {
          status: 400,
        },
      );
    }

    // --------------------------------------------------
    // 11. Make webhook processing idempotent
    // --------------------------------------------------

    if (order.paymentStatus === "PAID") {
      console.log(`Order #${order.id} has already been marked as PAID`);

      return Response.json({
        received: true,
        message: "Payment already processed",
      });
    }

    // --------------------------------------------------
    // 12. Mark order as paid
    // --------------------------------------------------
    //
    // IMPORTANT:
    //
    // Your /api/orders route already reduces product stock
    // when the order is created.
    //
    // Therefore, DO NOT decrement stock again here.
    //
    // Otherwise:
    //
    // Order created:
    // stock 10 -> 9
    //
    // Payment succeeds:
    // stock 9 -> 8   ❌
    //
    // The webhook should only confirm the payment.
    //

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

    console.log(`Order #${order.id} marked as PAID via Paystack webhook`);

    // --------------------------------------------------
    // 13. Respond to Paystack
    // --------------------------------------------------

    return Response.json({
      received: true,
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return Response.json(
      {
        error: "Webhook processing failed",
      },
      {
        status: 500,
      },
    );
  }
}
