import Link from "next/link";

export default function PromoBanner() {
  return (
    <section className="mx-auto w-full max-w-7xl px-4 py-4">
      <div className="relative overflow-hidden rounded-2xl bg-black">
        <div className="flex min-h-[220px] items-center justify-between gap-6 px-6 py-8 sm:px-10 md:min-h-[280px] md:px-14">
          {/* Text */}
          <div className="relative z-10 max-w-xl text-white">
            <p className="mb-2 text-sm font-medium uppercase tracking-wider text-green-400">
              Limited Time Offer
            </p>

            <h2 className="text-3xl font-bold leading-tight sm:text-4xl md:text-5xl">
              Big Deals.
              <br />
              Better Prices.
            </h2>

            <p className="mt-3 max-w-md text-sm text-gray-300 sm:text-base">
              Discover amazing products at prices you dont want to miss.
            </p>

            <Link
              href="/"
              className="mt-6 inline-flex rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition-transform duration-200 hover:scale-105 active:scale-95"
            >
              Shop Now
            </Link>
          </div>

          {/* Decorative circles */}
          <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-green-500/20 blur-2xl" />

          <div className="absolute -bottom-24 right-20 h-56 w-56 rounded-full bg-green-400/10 blur-2xl" />
        </div>
      </div>
    </section>
  );
}
