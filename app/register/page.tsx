// "use client";

// import { FormEvent, useState } from "react";

// import { useRouter } from "next/navigation";
// import { mergeGuestCart } from "@/lib/guestCart";

// export default function RegisterPage() {
//   const router = useRouter();

//   const [name, setName] = useState("");
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState("");

//   async function handleSubmit(event: FormEvent<HTMLFormElement>) {
//     event.preventDefault();

//     setLoading(true);
//     setError("");

//     try {
//       const response = await fetch("/api/auth/register", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//         },
//         body: JSON.stringify({
//           name,
//           email,
//           password,
//         }),
//       });

//       const data = await response.json();

//       if (!response.ok) {
//         setError(data.error || "Failed to register");
//         return;
//       }

//       try {
//         await mergeGuestCart();
//       } catch (error) {
//         console.error("Guest cart merge failed:", error);
//       }

//       router.push("/");
//       router.refresh();
//     } catch (error) {
//       console.error(error);
//       setError("Something went wrong. Please try again.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <main className="flex min-h-screen items-center justify-center p-6">
//       <div className="w-full max-w-md rounded-xl border p-8 shadow-sm">
//         <h1 className="mb-6 text-3xl font-bold">Create Account</h1>

//         <form onSubmit={handleSubmit} className="space-y-5">
//           <div>
//             <label htmlFor="name" className="mb-2 block font-medium">
//               Name
//             </label>

//             <input
//               id="name"
//               type="text"
//               value={name}
//               onChange={(event) => setName(event.target.value)}
//               required
//               className="w-full rounded-md border p-3 outline-none"
//               placeholder="Your name"
//             />
//           </div>

//           <div>
//             <label htmlFor="email" className="mb-2 block font-medium">
//               Email
//             </label>

//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(event) => setEmail(event.target.value)}
//               required
//               className="w-full rounded-md border p-3 outline-none"
//               placeholder="you@example.com"
//             />
//           </div>

//           <div>
//             <label htmlFor="password" className="mb-2 block font-medium">
//               Password
//             </label>

//             <input
//               id="password"
//               type="password"
//               value={password}
//               onChange={(event) => setPassword(event.target.value)}
//               required
//               minLength={6}
//               className="w-full rounded-md border p-3 outline-none"
//               placeholder="••••••••"
//             />
//           </div>

//           {error && <p className="text-sm text-red-500">{error}</p>}

//           <button
//             type="submit"
//             disabled={loading}
//             className="w-full rounded-md bg-black py-3 text-white disabled:opacity-50"
//           >
//             {loading ? "Creating account..." : "Create Account"}
//           </button>
//         </form>
//       </div>
//     </main>
//   );
// }

"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { mergeGuestCart } from "@/lib/guestCart";
import GoBack from "@/components/GoBack";

export default function RegisterPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [socialLoading, setSocialLoading] = useState<
    "google" | "github" | null
  >(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Failed to register");
        return;
      }

      // ---------------------------------------
      // Merge guest cart after registration
      // ---------------------------------------

      try {
        await mergeGuestCart();
      } catch (error) {
        console.error("Guest cart merge failed:", error);
      }

      // ---------------------------------------
      // Redirect after successful registration
      // ---------------------------------------

      router.push("/");
      router.refresh();
    } catch (error) {
      console.error(error);

      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleSocialLogin(provider: "google" | "github") {
    setError("");
    setSocialLoading(provider);

    window.location.href = `/api/auth/${provider}`;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6">
      {/* Header */}

      <div className="mb-2 flex w-full max-w-md items-center gap-2">
        <GoBack />

        <h1 className="mb-2 text-3xl font-bold">Create Account</h1>
      </div>

      {/* Register Card */}

      <div className="w-full max-w-md rounded-xl border border-gray-200 bg-gray-100/30 p-8 shadow-xs">
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Name */}

          <div>
            <label htmlFor="name" className="mb-2 block font-medium">
              Name
            </label>

            <input
              id="name"
              type="text"
              value={name}
              onChange={(event) => setName(event.target.value)}
              required
              autoComplete="name"
              className="w-full rounded-md border border-gray-200 bg-white p-3 outline-none focus:ring-1"
              placeholder="Your name"
            />
          </div>

          {/* Email */}

          <div>
            <label htmlFor="email" className="mb-2 block font-medium">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-md border border-gray-200 bg-white p-3 outline-none focus:ring-1"
              placeholder="you@example.com"
            />
          </div>

          {/* Password */}

          <div>
            <label htmlFor="password" className="mb-2 block font-medium">
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full rounded-md border border-gray-200 bg-white p-3 outline-none focus:ring-1"
              placeholder="••••••••"
            />
          </div>

          {/* Error */}

          {error && <p className="text-sm text-red-500">{error}</p>}

          {/* Create Account */}

          <button
            type="submit"
            disabled={loading || socialLoading !== null}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-black py-3 font-medium text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Divider */}

        <div className="my-6 flex items-center gap-4">
          <div className="h-px flex-1 bg-gray-200" />

          <span className="text-sm text-gray-500">OR</span>

          <div className="h-px flex-1 bg-gray-200" />
        </div>

        {/* Social Login */}

        <div className="space-y-3">
          {/* Google */}

          <button
            type="button"
            disabled={loading || socialLoading !== null}
            onClick={() => handleSocialLogin("google")}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {socialLoading === "google" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting to Google...
              </>
            ) : (
              <>
                <img src="/google.png" alt="" height={25} width={25} />
                Continue with Google
              </>
            )}
          </button>

          {/* GitHub */}

          <button
            type="button"
            disabled={loading || socialLoading !== null}
            onClick={() => handleSocialLogin("github")}
            className="flex w-full items-center justify-center gap-3 rounded-md border border-gray-300 bg-white py-3 font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {socialLoading === "github" ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Connecting to GitHub...
              </>
            ) : (
              <>
                <img src="/Github.png" alt="" height={25} width={25} />
                Continue with GitHub
              </>
            )}
          </button>
        </div>
      </div>

      {/* Login Link */}

      <div className="mt-2 pt-2 text-center">
        <p className="text-sm text-gray-500">Already have an account?</p>

        <a
          href="/login"
          className="mt-1 inline-block font-semibold text-green-600 transition hover:text-green-700 hover:underline"
        >
          Login
        </a>
      </div>
    </main>
  );
}
