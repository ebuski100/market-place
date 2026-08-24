"use client";

import { useCallback, useEffect, useState } from "react";

type InventoryTransaction = {
  id: number;
  quantity: number;
  type: string;
  reason: string | null;
  createdAt: string;
};

type InventoryHistoryProps = {
  productId: number;
};

export default function InventoryHistory({ productId }: InventoryHistoryProps) {
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadTransactions = useCallback(async () => {
    try {
      setError("");

      const response = await fetch(
        `/api/admin/products/${productId}/inventory`,
        {
          method: "GET",
          cache: "no-store",
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to load inventory history");
      }

      setTransactions(data.transactions ?? []);
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load inventory history",
      );
    } finally {
      setLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    // Initial load
    const timeoutId = window.setTimeout(() => {
      loadTransactions();
    }, 0);
    // Listen for successful inventory updates
    function handleInventoryUpdated(event: Event) {
      const customEvent = event as CustomEvent<{
        productId?: number;
      }>;

      // Only refresh if the event belongs to this product
      if (
        customEvent.detail?.productId === undefined ||
        customEvent.detail.productId === productId
      ) {
        loadTransactions();
      }
    }

    window.addEventListener("inventory-updated", handleInventoryUpdated);

    return () => {
      window.clearTimeout(timeoutId);

      window.removeEventListener("inventory-updated", handleInventoryUpdated);
    };
  }, [productId, loadTransactions]);

  return (
    <section className="mt-8 rounded-lg border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Inventory History</h2>

        <p className="mt-1 text-sm text-gray-500">
          Track every stock movement for this product.
        </p>
      </div>

      {loading && (
        <p className="text-sm text-gray-500">Loading inventory history...</p>
      )}

      {error && (
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && transactions.length === 0 && (
        <div className="rounded-md border border-dashed p-8 text-center">
          <p className="text-sm text-gray-500">
            No inventory transactions yet.
          </p>
        </div>
      )}

      {!loading && !error && transactions.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Date
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Type
                </th>

                <th className="px-4 py-3 text-right text-sm font-semibold">
                  Quantity
                </th>

                <th className="px-4 py-3 text-left text-sm font-semibold">
                  Reason
                </th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {transactions.map((transaction) => {
                const isIncrease = transaction.quantity > 0;

                return (
                  <tr key={transaction.id} className="hover:bg-gray-50">
                    <td className="px-4 py-4 text-sm text-gray-500">
                      {new Date(transaction.createdAt).toLocaleString("en-NG")}
                    </td>

                    <td className="px-4 py-4">
                      <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
                        {transaction.type.replaceAll("_", " ")}
                      </span>
                    </td>

                    <td
                      className={`px-4 py-4 text-right font-semibold ${
                        isIncrease ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {isIncrease ? "+" : ""}
                      {transaction.quantity}
                    </td>

                    <td className="px-4 py-4 text-sm text-gray-600">
                      {transaction.reason || "—"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
