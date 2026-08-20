// import type { Product } from "./product";

// export type CartItem = {
//   id: number;
//   quantity: number;
//   product: Product;
// };

// export type Cart = {
//   id: number | null;
//   items: CartItem[];
// };

import type { Prisma } from "@/lib/generated/prisma/client";

export type Cart = Prisma.CartGetPayload<{
  include: {
    items: {
      include: {
        product: true;
      };
    };
  };
}>;

export type CartItem = Cart["items"][number];
