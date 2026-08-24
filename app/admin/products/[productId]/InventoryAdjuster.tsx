"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

type InventoryAdjusterProps = {
  productId: number;
  currentStock: number;
};

type TransactionType = "RESTOCK" | "ADJUSTMENT" | "DAMAGED" | "RETURN";

const transactionOptions: {
  value: TransactionType;
  label: string;
}[] = [
  {
    value: "RESTOCK",
    label: "Restock",
  },
  {
    value: "ADJUSTMENT",
    label: "Manual Adjustment",
  },
  {
    value: "DAMAGED",
    label: "Damaged",
  },
  {
    value: "RETURN",
    label: "Customer Return",
  },
];

export default function InventoryAdjuster({
  productId,
  currentStock,
}: InventoryAdjusterProps) {
  const router = useRouter();

  const [type, setType] = useState<TransactionType>("RESTOCK");

  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const numericQuantity = Number(quantity);

  const isValidQuantity =
    Number.isInteger(numericQuantity) && numericQuantity > 0;

  const signedQuantity =
    type === "DAMAGED"
      ? -numericQuantity
      : type === "RESTOCK" || type === "RETURN"
        ? numericQuantity
        : numericQuantity;

  const newStock = isValidQuantity
    ? currentStock + signedQuantity
    : currentStock;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    if (!isValidQuantity) {
      setError("Enter a valid quantity greater than 0.");
      return;
    }

    if (newStock < 0) {
      setError("Stock cannot be negative.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(
        `/api/admin/products/${productId}/inventory`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            quantity: signedQuantity,
            type,
            reason,
          }),
        },
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to update inventory");
      }

      setQuantity("");
      setReason("");

      router.refresh();
      window.dispatchEvent(
        new CustomEvent("inventory-updated", {
          detail: {
            productId,
          },
        }),
      );
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Something went wrong.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-lg border bg-white p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold">Inventory</h2>

        <p className="mt-1 text-sm text-gray-500">
          Manage the available stock for this product.
        </p>
      </div>

      <div className="mb-6 rounded-lg bg-gray-50 p-5">
        <p className="text-sm text-gray-500">Current stock</p>

        <p className="mt-1 text-3xl font-bold">{currentStock}</p>

        <p className="mt-1 text-sm text-gray-500">
          {currentStock === 1 ? "unit" : "units"} available
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="inventory-type"
            className="mb-2 block text-sm font-medium"
          >
            Action
          </label>

          <select
            id="inventory-type"
            value={type}
            onChange={(event) => setType(event.target.value as TransactionType)}
            className="w-full rounded-md border px-3 py-2"
          >
            {transactionOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="inventory-quantity"
            className="mb-2 block text-sm font-medium"
          >
            Quantity
          </label>

          <input
            id="inventory-quantity"
            type="number"
            min="1"
            step="1"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
            placeholder="Enter quantity"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div>
          <label
            htmlFor="inventory-reason"
            className="mb-2 block text-sm font-medium"
          >
            Reason
          </label>

          <input
            id="inventory-reason"
            type="text"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            placeholder="e.g. New supplier shipment"
            className="w-full rounded-md border px-3 py-2"
          />
        </div>

        <div className="rounded-md border bg-gray-50 p-4">
          <p className="text-sm text-gray-500">New stock</p>

          <p className="mt-1 text-xl font-semibold">{newStock} units</p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || !isValidQuantity}
          className="w-full rounded-md bg-black px-4 py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {loading ? "Updating..." : "Update Stock"}
        </button>
      </form>
    </div>
  );
}
