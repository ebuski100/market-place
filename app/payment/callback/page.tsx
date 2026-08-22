import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type PaymentCallbackPageProps = {
  searchParams: Promise<{
    reference?: string;
  }>;
};

export default async function PaymentCallbackPage({
  searchParams,
}: PaymentCallbackPageProps) {
  const params = await searchParams;

  const reference = params.reference;

  if (!reference) {
    redirect("/orders");
  }

  const user = await getCurrentUser();

  if (!user) {
    redirect("/login");
  }

  const order = await prisma.order.findFirst({
    where: {
      payStackReference: reference,
      userId: user.id,
    },
  });

  if (!order) {
    redirect("/orders");
  }

  /*
   * The webhook is responsible for final payment confirmation.
   *
   * We check the current order state here and then take
   * the customer to their order.
   */

  redirect(`/orders/${order.id}`);
}
