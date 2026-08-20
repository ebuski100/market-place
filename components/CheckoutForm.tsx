"use client";

import { useState } from "react";
import type { CheckoutInput } from "@/lib/validations/checkout";
import { deliveryOptions } from "@/lib/delivery";
type CheckoutFormProps = {
  initialValues?: Partial<CheckoutInput>;
};

export default function CheckoutForm({ initialValues }: CheckoutFormProps) {
  const [formData, setFormData] = useState<CheckoutInput>({
    fullName: initialValues?.fullName ?? "",
    phone: initialValues?.phone ?? "",
    address: initialValues?.address ?? "",
    city: initialValues?.city ?? "",
    state: initialValues?.state ?? "",
    country: initialValues?.country ?? "Nigeria",
    deliveryMethod: initialValues?.deliveryMethod ?? "free",
  });

  const [error, setError] = useState("");

  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = event.target;

    setFormData((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to create order");
        return;
      }

      console.log("Order created:", data.order);

      // Temporary
      alert("Order created successfully!");
    } catch (error) {
      console.error(error);

      setError("Something went wrong. Please try again.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="fullName" className="mb-2 block font-medium">
          Full name
        </label>

        <input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Enter your full name"
          className="w-full rounded-md border p-3 outline-none focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="phone" className="mb-2 block font-medium">
          Phone number
        </label>

        <input
          id="phone"
          name="phone"
          type="tel"
          value={formData.phone}
          onChange={handleChange}
          placeholder="08012345678"
          className="w-full rounded-md border p-3 outline-none focus:ring-2"
        />
      </div>

      <div>
        <label htmlFor="address" className="mb-2 block font-medium">
          Delivery address
        </label>

        <input
          id="address"
          name="address"
          type="text"
          value={formData.address}
          onChange={handleChange}
          placeholder="Enter your delivery address"
          className="w-full rounded-md border p-3 outline-none focus:ring-2"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="city" className="mb-2 block font-medium">
            City
          </label>

          <input
            id="city"
            name="city"
            type="text"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="w-full rounded-md border p-3 outline-none focus:ring-2"
          />
        </div>

        <div>
          <label htmlFor="state" className="mb-2 block font-medium">
            State
          </label>

          <input
            id="state"
            name="state"
            type="text"
            value={formData.state}
            onChange={handleChange}
            placeholder="State"
            className="w-full rounded-md border p-3 outline-none focus:ring-2"
          />
        </div>
      </div>

      <div>
        <label htmlFor="country" className="mb-2 block font-medium">
          Country
        </label>

        <input
          id="country"
          name="country"
          type="text"
          value={formData.country}
          onChange={handleChange}
          className="w-full rounded-md border p-3 outline-none focus:ring-2"
        />
      </div>

      <div>
        <h3 className="mb-4 text-lg font-semibold">Delivery Method</h3>

        <div className="space-y-3">
          {deliveryOptions.map((option) => (
            <label
              key={option.id}
              className="flex cursor-pointer items-start gap-3 rounded-lg border p-4"
            >
              <input
                type="radio"
                name="deliveryMethod"
                value={option.id}
                checked={formData.deliveryMethod === option.id}
                onChange={(event) =>
                  setFormData((current) => ({
                    ...current,
                    deliveryMethod: event.target
                      .value as CheckoutInput["deliveryMethod"],
                  }))
                }
                className="mt-1"
              />

              <div className="flex-1">
                <div className="flex justify-between gap-4">
                  <span className="font-medium">{option.name}</span>

                  <span className="font-semibold">
                    ₦{option.price.toLocaleString()}
                  </span>
                </div>

                <p className="mt-1 text-sm text-gray-500">
                  {option.description}
                </p>
              </div>
            </label>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error}</p>}

      <button
        type="submit"
        className="w-full rounded-md bg-black py-3 text-white"
      >
        Continue
      </button>
    </form>
  );
}
