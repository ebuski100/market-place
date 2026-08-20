import type { Product } from "./product";

export type CartItem = {
  id: number;
  quantity: number;
  product: Product;
};

export type Cart = {
  id: number | null;
  items: CartItem[];
};
