"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import PromoBanner from "@/components/PromoBanner";
import { promotions, type Promotion } from "@/data/promotion";

export default function PromoCarousel() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const [isPaused, setIsPaused] = useState(false);

  const totalSlides = promotions.length;

  const nextSlide = useCallback(() => {
    setCurrentIndex((current) =>
      current === totalSlides - 1 ? 0 : current + 1,
    );
  }, [totalSlides]);

  const previousSlide = useCallback(() => {
    setCurrentIndex((current) =>
      current === 0 ? totalSlides - 1 : current - 1,
    );
  }, [totalSlides]);

  /*
   * Automatic slideshow
   */
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 5000);

    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  /*
   * Keyboard navigation
   */
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "ArrowRight") {
        nextSlide();
      }

      if (event.key === "ArrowLeft") {
        previousSlide();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [nextSlide, previousSlide]);

  const currentPromotion: Promotion = promotions[currentIndex];

  return (
    <section
      className="mx-auto w-full max-w-7xl px-4 py-4"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="relative">
        {/* Banner */}
        <PromoBanner promotion={currentPromotion} />

        {/* Previous button */}
        <button
          type="button"
          onClick={previousSlide}
          aria-label="Previous promotion"
          className="absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95 sm:left-5"
        >
          <ChevronLeft size={20} />
        </button>

        {/* Next button */}
        <button
          type="button"
          onClick={nextSlide}
          aria-label="Next promotion"
          className="absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95 sm:right-5"
        >
          <ChevronRight size={20} />
        </button>

        {/* Dots */}
        <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2">
          {promotions.map((promotion, index) => {
            const isActive = index === currentIndex;

            return (
              <button
                key={promotion.id}
                type="button"
                onClick={() => setCurrentIndex(index)}
                aria-label={`Go to promotion ${index + 1}`}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive
                    ? "w-6 bg-white"
                    : "w-2 bg-white/50 hover:bg-white/80"
                }`}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import { ChevronLeft, ChevronRight } from "lucide-react";

// import PromoBanner from "@/components/PromoBanner";
// import { promotions } from "@/data/promotion";
// import type { Product } from "@/types/product";

// type PromoCarouselProps = {
//   products: Product[];
// };

// export default function PromoCarousel({ products }: PromoCarouselProps) {
//   const [currentIndex, setCurrentIndex] = useState(0);
//   const [isPaused, setIsPaused] = useState(false);

//   const mobileSliderRef = useRef<HTMLDivElement>(null);

//   const totalSlides = promotions.length;

//   const nextSlide = useCallback(() => {
//     setCurrentIndex((current) =>
//       current === totalSlides - 1 ? 0 : current + 1,
//     );
//   }, [totalSlides]);

//   const previousSlide = useCallback(() => {
//     setCurrentIndex((current) =>
//       current === 0 ? totalSlides - 1 : current - 1,
//     );
//   }, [totalSlides]);

//   useEffect(() => {
//     if (isPaused) return;

//     const timer = setInterval(nextSlide, 5000);

//     return () => clearInterval(timer);
//   }, [isPaused, nextSlide]);

//   function scrollToSlide(index: number) {
//     setCurrentIndex(index);

//     const slider = mobileSliderRef.current;

//     if (!slider) return;

//     const slide = slider.children[index] as HTMLElement;

//     slide?.scrollIntoView({
//       behavior: "smooth",
//       block: "nearest",
//       inline: "center",
//     });
//   }

//   function handleMobileScroll() {
//     const slider = mobileSliderRef.current;

//     if (!slider) return;

//     const slides = Array.from(slider.children) as HTMLElement[];

//     if (!slides.length) return;

//     const sliderCenter = slider.scrollLeft + slider.clientWidth / 2;

//     let closestIndex = 0;
//     let closestDistance = Infinity;

//     slides.forEach((slide, index) => {
//       const slideCenter = slide.offsetLeft + slide.offsetWidth / 2;

//       const distance = Math.abs(sliderCenter - slideCenter);

//       if (distance < closestDistance) {
//         closestDistance = distance;
//         closestIndex = index;
//       }
//     });

//     setCurrentIndex(closestIndex);
//   }

//   /*
//    * Get the product associated with each promotion.
//    */
//   const slides = promotions
//     .map((promotion) => {
//       const product = products.find(
//         (product) => product.id === promotion.productId,
//       );

//       if (!product) return null;

//       return {
//         promotion,
//         product,
//       };
//     })
//     .filter(
//       (
//         slide,
//       ): slide is {
//         promotion: (typeof promotions)[number];
//         product: Product;
//       } => slide !== null,
//     );

//   if (slides.length === 0) {
//     return null;
//   }

//   return (
//     <section
//       className="mx-auto w-full max-w-7xl py-4"
//       onMouseEnter={() => setIsPaused(true)}
//       onMouseLeave={() => setIsPaused(false)}
//     >
//       {/* Mobile */}
//       <div
//         ref={mobileSliderRef}
//         onScroll={handleMobileScroll}
//         className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 scrollbar-hide md:hidden"
//       >
//         {slides.map(({ promotion, product }) => (
//           <div
//             key={promotion.id}
//             className="w-[calc(100vw-2rem)] shrink-0 snap-center"
//           >
//             <PromoBanner promotion={promotion} product={product} />
//           </div>
//         ))}
//       </div>

//       {/* Desktop */}
//       <div className="relative hidden px-4 md:block">
//         <PromoBanner
//           promotion={slides[currentIndex].promotion}
//           product={slides[currentIndex].product}
//         />

//         <button
//           type="button"
//           onClick={previousSlide}
//           aria-label="Previous promotion"
//           className="absolute left-7 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95"
//         >
//           <ChevronLeft size={22} />
//         </button>

//         <button
//           type="button"
//           onClick={nextSlide}
//           aria-label="Next promotion"
//           className="absolute right-7 top-1/2 z-20 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-800 shadow-md backdrop-blur transition hover:scale-105 hover:bg-white active:scale-95"
//         >
//           <ChevronRight size={22} />
//         </button>
//       </div>

//       {/* Dots */}
//       <div className="mt-3 flex items-center justify-center gap-2">
//         {slides.map(({ promotion }, index) => (
//           <button
//             key={promotion.id}
//             type="button"
//             onClick={() => scrollToSlide(index)}
//             aria-label={`Go to promotion ${index + 1}`}
//             className={`h-2 rounded-full transition-all duration-300 ${
//               index === currentIndex
//                 ? "w-6 bg-black"
//                 : "w-2 bg-gray-300 hover:bg-gray-400"
//             }`}
//           />
//         ))}
//       </div>
//     </section>
//   );
// }
