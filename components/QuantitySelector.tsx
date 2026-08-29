// "use client";

// type QuantitySelectorProps = {
//   quantity: number;
//   stock: number;
//   onQuantityChange: (quantity: number) => void;
// };

// export default function QuantitySelector({
//   quantity,
//   stock,
//   onQuantityChange,
// }: QuantitySelectorProps) {
//   function decreaseQuantity() {
//     onQuantityChange(Math.max(1, quantity - 1));
//   }

//   function increaseQuantity() {
//     onQuantityChange(Math.min(stock, quantity + 1));
//   }

//   return (
//     <div>
//       <p className="mb-2 text-sm font-semibold text-gray-700">Quantity</p>

//       <div className="flex w-fit items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
//         <button
//           type="button"
//           onClick={decreaseQuantity}
//           disabled={quantity <= 1}
//           className="flex h-12 w-12 items-center justify-center text-lg transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
//           aria-label="Decrease quantity"
//         >
//           −
//         </button>

//         <span className="flex h-12 w-14 items-center justify-center border-x border-gray-200 font-semibold">
//           {quantity}
//         </span>

//         <button
//           type="button"
//           onClick={increaseQuantity}
//           disabled={quantity >= stock}
//           className="flex h-12 w-12 items-center justify-center text-lg transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
//           aria-label="Increase quantity"
//         >
//           +
//         </button>
//       </div>
//     </div>
//   );
// }

"use client";

type QuantitySelectorProps = {
  quantity: number;
  stock: number;
  onQuantityChange: (quantity: number) => void;
  disabled?: boolean;
};

const QuantitySelector = ({
  quantity,
  stock,
  onQuantityChange,
  disabled = false,
}: QuantitySelectorProps) => {
  function decreaseQuantity() {
    const newQuantity = Math.max(1, quantity - 1);

    if (newQuantity !== quantity) {
      onQuantityChange(newQuantity);
    }
  }

  function increaseQuantity() {
    const newQuantity = Math.min(stock, quantity + 1);

    if (newQuantity !== quantity) {
      onQuantityChange(newQuantity);
    }
  }

  return (
    <div className="flex items-center">
      <div className="flex w-fit items-center overflow-hidden rounded-xl border border-gray-200 bg-white">
        <button
          type="button"
          onClick={decreaseQuantity}
          disabled={disabled || quantity <= 1}
          className="flex h-10 w-10 items-center justify-center text-lg transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          −
        </button>

        <span className="flex h-10 w-12 items-center justify-center border-x border-gray-200 font-semibold">
          {quantity}
        </span>

        <button
          type="button"
          onClick={increaseQuantity}
          disabled={disabled || quantity >= stock}
          className="flex h-10 w-10 items-center justify-center text-lg transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default QuantitySelector;
