"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Search,
  ShoppingCart,
  Heart,
  User,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
} from "lucide-react";

type User = {
  id: number;
  name: string;
  email: string;
};

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    async function getUser() {
      try {
        const response = await fetch("/api/auth/me");

        if (!response.ok) {
          setUser(null);
          return;
        }

        const data = await response.json();
        setUser(data.user);
      } catch (error) {
        console.error("Failed to fetch user:", error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    getUser();
  }, []);

  async function handleLogout() {
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Failed to logout");
      }

      setUser(null);
      setMobileMenuOpen(false);

      window.location.href = "/";
    } catch (error) {
      console.error("Logout error:", error);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Logo */}
        <Link href="/" className="text-2xl font-bold tracking-tight">
          E-Commerce
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/"
            className="text-sm font-medium text-gray-700 transition hover:text-green-600"
          >
            Home
          </Link>

          <Link
            href="/shop"
            className="text-sm font-medium text-gray-700 transition hover:text-green-600"
          >
            Shop
          </Link>

          <Link
            href="/wishlist"
            className="flex items-center gap-1 text-sm font-medium text-gray-700 transition hover:text-green-600"
          >
            <Heart size={18} />
            Wishlist
          </Link>
        </nav>

        {/* Search */}
        <div className="mx-6 hidden max-w-md flex-1 md:block">
          <div className="flex items-center rounded-full border bg-gray-50 px-4">
            <Search size={18} className="text-gray-400" />

            <input
              type="search"
              placeholder="Search products..."
              className="w-full bg-transparent px-3 py-2 text-sm outline-none"
            />
          </div>
        </div>

        {/* Desktop Right Side */}
        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/cart"
            className="relative text-gray-700 transition hover:text-green-600"
            aria-label="Cart"
          >
            <ShoppingCart size={22} />
          </Link>

          {!loading && !user && (
            <>
              <Link
                href="/login"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition hover:bg-gray-100"
              >
                <LogIn size={18} />
                Login
              </Link>

              <Link
                href="/register"
                className="flex items-center gap-2 rounded-md bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-gray-800"
              >
                <UserPlus size={18} />
                Register
              </Link>
            </>
          )}

          {!loading && user && (
            <div className="flex items-center gap-3">
              <Link
                href="/account"
                className="flex items-center gap-2 text-sm font-medium transition hover:text-green-600"
              >
                <User size={20} />
                {user.name}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-red-500 transition hover:bg-red-50"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          type="button"
          onClick={() => setMobileMenuOpen((open) => !open)}
          className="rounded-md p-2 md:hidden"
          aria-label="Toggle menu"
        >
          {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="border-t bg-white px-4 py-5 md:hidden">
          <nav className="flex flex-col gap-4">
            <Link
              href="/"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium"
            >
              Home
            </Link>

            <Link
              href="/shop"
              onClick={() => setMobileMenuOpen(false)}
              className="font-medium"
            >
              Shop
            </Link>

            <Link
              href="/wishlist"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 font-medium"
            >
              <Heart size={18} />
              Wishlist
            </Link>

            <Link
              href="/cart"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2 font-medium"
            >
              <ShoppingCart size={18} />
              Cart
            </Link>

            {!loading && !user && (
              <>
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 font-medium"
                >
                  <LogIn size={18} />
                  Login
                </Link>

                <Link
                  href="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 font-medium"
                >
                  <UserPlus size={18} />
                  Register
                </Link>
              </>
            )}

            {!loading && user && (
              <>
                <Link
                  href="/account"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-2 font-medium"
                >
                  <User size={18} />
                  {user.name}
                </Link>

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex items-center gap-2 text-left font-medium text-red-500"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
