// "use client";

// import { useState } from "react";
// import { useRouter } from "next/navigation";

// const statuses = [
//   {
//     value: "CONFIRMED",
//     label: "Order confirmed",
//   },
//   {
//     value: "PROCESSING",
//     label: "Processing",
//   },
//   {
//     value: "SHIPPED",
//     label: "Shipped",
//   },
//   {
//     value: "OUT_FOR_DELIVERY",
//     label: "Out for delivery",
//   },
//   {
//     value: "DELIVERED",
//     label: "Delivered",
//   },
//   {
//     value: "CANCELLED",
//     label: "Cancelled",
//   },
// ];

// type StatusUpdaterProps = {
//   orderId: number;
//   currentStatus: string;
//   paymentStatus: string;
// };

// export default function StatusUpdater({
//   orderId,
//   currentStatus,
//   paymentStatus,
// }: StatusUpdaterProps) {
//   const router = useRouter();

//   const [status, setStatus] = useState(currentStatus);
//   const [loading, setLoading] = useState(false);
//   const [message, setMessage] = useState("");

//   async function updateStatus() {
//     setLoading(true);
//     setMessage("");

//     try {
//       const response = await fetch(`/api/admin/orders/${orderId}/status`, {
//         method: "PATCH",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           status,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         throw new Error(data.error || "Failed to update order status");
//       }

//       setMessage("Order status updated successfully.");

//       router.refresh();
//     } catch (error) {
//       setMessage(
//         error instanceof Error ? error.message : "Something went wrong",
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div>
//       <div className="mb-5 rounded-lg bg-gray-50 p-4">
//         <p className="text-sm text-gray-500">Current status</p>

//         <p className="mt-1 text-lg font-semibold">{currentStatus}</p>
//       </div>

//       {paymentStatus !== "PAID" && (
//         <div className="mb-5 rounded-lg bg-yellow-50 p-4 text-sm text-yellow-800">
//           Payment has not been confirmed yet. Be careful about processing or
//           shipping this order.
//         </div>
//       )}

//       <label className="mb-2 block text-sm font-medium">Change status</label>

//       <select
//         value={status}
//         onChange={(event) => setStatus(event.target.value)}
//         disabled={loading}
//         className="w-full rounded-md border px-4 py-3 outline-none focus:ring-2 focus:ring-black"
//       >
//         <option value="PENDING">Order placed</option>

//         {statuses.map((item) => (
//           <option key={item.value} value={item.value}>
//             {item.label}
//           </option>
//         ))}
//       </select>

//       <button
//         type="button"
//         onClick={updateStatus}
//         disabled={loading || status === currentStatus}
//         className="mt-4 rounded-md bg-black px-6 py-3 font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
//       >
//         {loading ? "Updating..." : "Update status"}
//       </button>

//       {message && <p className="mt-4 text-sm text-gray-600">{message}</p>}
//     </div>
//   );
// }

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import type { OrderStatus, PaymentStatus } from "@/lib/generated/prisma/client";

type StatusUpdaterProps = {
  orderId: number;
  currentStatus: OrderStatus;
  paymentStatus: PaymentStatus;
};

const statuses: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "OUT_FOR_DELIVERY",
  "DELIVERED",
  "CANCELLED",
];

const statusLabels: Record<OrderStatus, string> = {
  PENDING: "Order placed",
  CONFIRMED: "Order confirmed",
  PROCESSING: "Processing",
  SHIPPED: "Shipped",
  OUT_FOR_DELIVERY: "Out for delivery",
  DELIVERED: "Delivered",
  CANCELLED: "Cancelled",
};

export default function StatusUpdater({
  orderId,
  currentStatus,
  paymentStatus,
}: StatusUpdaterProps) {
  const router = useRouter();

  const [status, setStatus] = useState<OrderStatus>(currentStatus);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  async function updateStatus() {
    if (status === currentStatus) {
      return;
    }

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`/api/admin/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update order status");
      }

      setSuccess("Order status updated successfully.");

      router.refresh();
    } catch (error) {
      setError(error instanceof Error ? error.message : "Something went wrong");

      // Put the select back to the actual database value
      setStatus(currentStatus);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Current status */}
      <div>
        <p className="text-sm text-gray-500">Current status</p>

        <p className="mt-1 text-lg font-semibold">
          {statusLabels[currentStatus]}
        </p>
      </div>

      {/* Payment warning */}
      {paymentStatus !== "PAID" && currentStatus !== "CANCELLED" && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <p className="text-sm font-medium text-yellow-800">
            Payment has not been confirmed.
          </p>

          <p className="mt-1 text-sm text-yellow-700">
            This order should normally remain pending until payment is
            successful.
          </p>
        </div>
      )}

      {/* Status selector */}
      <div>
        <label
          htmlFor="order-status"
          className="mb-2 block text-sm font-medium"
        >
          Change status
        </label>

        <select
          id="order-status"
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          disabled={loading}
          className="w-full rounded-md border bg-white px-4 py-3 outline-none focus:ring-2 focus:ring-black"
        >
          {statuses.map((statusOption) => (
            <option key={statusOption} value={statusOption}>
              {statusLabels[statusOption]}
            </option>
          ))}
        </select>
      </div>

      {/* Update button */}
      <button
        type="button"
        onClick={updateStatus}
        disabled={loading || status === currentStatus}
        className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:bg-gray-300"
      >
        {loading ? "Updating..." : "Update Status"}
      </button>

      {/* Messages */}
      {success && (
        <p className="text-sm font-medium text-green-600">{success}</p>
      )}

      {error && <p className="text-sm font-medium text-red-600">{error}</p>}
    </div>
  );
}
