export const deliveryOptions = [
  {
    id: "free",
    name: "Free Delivery",
    description: "Delivery within 7–14 business days",
    price: 0,
  },
  {
    id: "standard",
    name: "Standard Delivery",
    description: "Delivery within 3–5 business days",
    price: 2000,
  },
  {
    id: "express",
    name: "Express Delivery",
    description: "Delivery within 1–2 business days",
    price: 5000,
  },
] as const;

export type DeliveryMethod = (typeof deliveryOptions)[number]["id"];
