// "use client";

// import Link from "next/link";
// import { useSearchParams } from "next/navigation";

// export default function Categories() {
//   const searchParams = useSearchParams();
//   const activeCategory = searchParams.get("category") ?? "";

//   return (
//     <section className="w-full py-4">
//       <div className="mx-auto max-w-7xl">
//         <div className="flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide">
//           {categories.map((category) => {
//             const isActive = activeCategory === category.value;

//             const params = new URLSearchParams(searchParams.toString());

//             if (category.value) {
//               params.set("category", category.value);
//             } else {
//               params.delete("category");
//             }

//             params.delete("page");

//             const href = params.toString() ? `/?${params.toString()}` : "/";

//             return (
//               <Link
//                 key={category.value || "all"}
//                 href={href}
//                 className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
//                   isActive
//                     ? "bg-black text-white shadow-sm"
//                     : "bg-gray-100 text-gray-700 hover:bg-gray-200"
//                 }`}
//               >
//                 {category.name}
//               </Link>
//             );
//           })}
//         </div>
//       </div>
//     </section>
//   );
// }

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";

type CategoriesProps = {
  categories: string[];
};

export default function Categories({ categories }: CategoriesProps) {
  const searchParams = useSearchParams();

  const activeCategory = searchParams.get("category") ?? "";

  return (
    <section className="w-full py-4">
      <div className="mx-auto max-w-7xl">
        <div className="flex gap-3 overflow-x-auto px-1 pb-2 scrollbar-hide">
          {/* All */}
          <Link
            href="/"
            className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
              activeCategory === ""
                ? "bg-black text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            All
          </Link>

          {/* Database categories */}
          {categories.map((category) => {
            const params = new URLSearchParams(searchParams.toString());

            params.set("category", category);
            params.delete("page");

            const href = `/?${params.toString()}`;

            const isActive = activeCategory === category;

            return (
              <Link
                key={category}
                href={href}
                className={`shrink-0 rounded-full px-5 py-2.5 text-sm font-medium capitalize transition-all duration-200 ${
                  isActive
                    ? "bg-black text-white shadow-sm"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
