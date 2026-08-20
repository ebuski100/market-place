import type { CartItem } from "@/types/cart";

type CartItemControlsProps = {
  updateQuantity: (itemId: number, newQuantity: number) => void;
  removeItem: (itemId: number) => void;
  loadingItem: number | null;
  item: CartItem;
};

const CartItemControls = ({
  updateQuantity,
  loadingItem,
  removeItem,
  item,
}: CartItemControlsProps) => {
  return (
    <div className="flex items-center gap-3 mt-3 ">
      <button
        type="button"
        disabled={loadingItem === item.id || item.quantity <= 1}
        onClick={() => updateQuantity(item.id, item.quantity - 1)}
        className="w-8 h-8 border rounded disabled:opacity-40"
      >
        -
      </button>

      <span className="min-w-5 text-center mx-5">{item.quantity}</span>

      <button
        type="button"
        disabled={loadingItem === item.id}
        onClick={() => updateQuantity(item.id, item.quantity + 1)}
        className="w-8 h-8 border rounded disabled:opacity-40"
      >
        +
      </button>

      <button
        type="button"
        disabled={loadingItem === item.id}
        onClick={() => removeItem(item.id)}
        className="ml-4 text-red-500"
      >
        Remove
      </button>
    </div>
  );
};

export default CartItemControls;
