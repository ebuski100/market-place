// "use client";

// import React from "react";
// import Link from "next/link";
// import { usePathname } from "next/navigation";
// import { Home, Search, ShoppingCart, Heart, ShoppingBag } from "lucide-react";

// const Footer = () => {
//   const pathname = usePathname();
//   const footerItems = [
//     { name: "Home", href: "/", icon: Home },
//     { name: "WishList", href: "/wishlist", icon: Heart },
//     { name: "Shop", href: "/shop", icon: Search, isCenter: true },
//     { name: "Cart", href: "/cart", icon: ShoppingCart },

//     { name: "Orders", href: "/orders", icon: ShoppingBag },
//   ];

//   return (
//     <nav className="fixed bottom-0 left-0 w-full bg-white  shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
//       <div className="flex flex-row justify-between p-4">
//         {footerItems.map((item) => {
//           const isActive = pathname === item.href;
//           const Icon = item.icon;

//           return (
//             <Link
//               key={item.name}
//               href={item.href}
//               className={`flex flex- items-center justify-center  text-xs ${isActive ? "text-green-600" : "text-gray-500"}`}
//             >
//               {item.isCenter ? (
//                 <div
//                   className={`text-white p-3 rounded-4xl hover:scale-105 hover:bg-green-600  shadow  w-[120px]  flex flex-row items-center ${isActive ? "bg-green-500" : "bg-gray-400"} `}
//                 >
//                   <Icon className="mr-2" size={24} />
//                   {item.name}...
//                 </div>
//               ) : (
//                 <div className="relative hover:text-green-500">
//                   <Icon
//                     size={22}
//                     className={isActive ? "text-green-600" : ""}
//                   />
//                   <span className={isActive ? "text-green-600" : ""}>
//                     {item.name}
//                   </span>
//                 </div>
//               )}
//             </Link>
//           );
//         })}
//       </div>
//     </nav>
//   );
// };

// export default Footer;

"use client";

import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, Heart, ShoppingBag } from "lucide-react";

import { useStoreCounts } from "@/lib/store/useStoreCounts";

const Footer = () => {
  const pathname = usePathname();

  const { cartCount, wishlistCount } = useStoreCounts();

  const footerItems = [
    {
      name: "Home",
      href: "/",
      icon: Home,
    },
    {
      name: "WishList",
      href: "/wishlist",
      icon: Heart,
      count: wishlistCount,
    },
    {
      name: "Shop",
      href: "/shop",
      icon: Search,
      isCenter: true,
    },
    {
      name: "Cart",
      href: "/cart",
      icon: ShoppingCart,
      count: cartCount,
    },
    {
      name: "Orders",
      href: "/orders",
      icon: ShoppingBag,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full bg-white shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      <div className="flex flex-row justify-between p-4">
        {footerItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-1 items-center justify-center text-xs ${
                isActive ? "text-green-600" : "text-gray-500"
              }`}
            >
              {item.isCenter ? (
                <div
                  className={`flex w-[120px] flex-row items-center rounded-4xl p-3 text-white shadow transition hover:scale-105 hover:bg-green-600 ${
                    isActive ? "bg-green-500" : "bg-gray-400"
                  }`}
                >
                  <Icon className="mr-2" size={24} />
                  {item.name}...
                </div>
              ) : (
                <div className="relative flex flex-col items-center hover:text-green-500">
                  {/* Icon + badge */}
                  <div className="relative">
                    <Icon
                      size={22}
                      className={isActive ? "text-green-600" : ""}
                    />

                    {item.count !== undefined && item.count > 0 && (
                      <span className="absolute -right-3 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                        {item.count > 99 ? "99+" : item.count}
                      </span>
                    )}
                  </div>

                  <span className={isActive ? "text-green-600" : ""}>
                    {item.name}
                  </span>
                </div>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export default Footer;
