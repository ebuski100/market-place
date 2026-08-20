"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Search, ShoppingCart, Heart, User } from "lucide-react";

const Footer = () => {
  const pathname = usePathname();
  const footerItems = [
    { name: "Home", href: "/", icon: Home },
    { name: "WishList", href: "/wishlist", icon: Heart },
    { name: "Shop", href: "/shop", icon: Search, isCenter: true },
    { name: "Cart", href: "/cart", icon: ShoppingCart },
    { name: "Account", href: "/account", icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full bg-white  shadow-[0_-4px_10px_rgba(0,0,0,0.1)]">
      <div className="flex flex-row justify-between p-4">
        {footerItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex- items-center justify-center  text-xs ${isActive ? "text-green-600" : "text-gray-500"}`}
            >
              {item.isCenter ? (
                <div
                  className={`text-white p-3 rounded-4xl hover:scale-105 hover:bg-green-600  shadow  w-[120px]  flex flex-row items-center ${isActive ? "bg-green-500" : "bg-gray-400"} `}
                >
                  <Icon className="mr-2" size={24} />
                  {item.name}...
                </div>
              ) : (
                <div className="relative hover:text-green-500">
                  <Icon
                    size={22}
                    className={isActive ? "text-green-600" : ""}
                  />
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
