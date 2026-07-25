"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2 } from "lucide-react";
import { getSupabase } from "@/lib/supabase";

export default function Signup() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await getSupabase().auth.getSession();
      if (data.session) {
        router.replace("/dashboard");
      }
    };
    checkUser();

    const { data: listener } = getSupabase().auth.onAuthStateChange((_, session) => {
      if (session) {
        router.replace("/dashboard");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  // When user clicks "Continue with Google":
  // Supabase opens the Google login page for us.
  // After login, Google redirects back to /auth/callback.
  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);

    const { error } = await getSupabase().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    }
    // If no error, Supabase redirects the browser to Google automatically.
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 relative py-12 px-4">
      {/* Back button */}
      <Link
        href="/"
        className="absolute top-6 left-6 md:top-10 md:left-10 flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
      >
        <ArrowLeft size={18} />
        Back to Home
      </Link>

      {/* Card */}
      <div className="bg-white max-w-sm w-full md:p-8 p-6 text-center rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome to FixForge</h2>
        <p className="text-sm text-gray-500 mb-8">Log in or sign up to automate your bug fixes.</p>

        {/* Error message */}
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl py-2 px-3">
            {error}
          </p>
        )}

        {/* Google Sign In Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={loading}
          className="w-full flex items-center gap-3 justify-center bg-white border border-gray-300 hover:bg-gray-50 transition-colors py-3 rounded-xl text-gray-800 font-medium cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <img
              className="h-4 w-4"
              src="https://raw.githubusercontent.com/prebuiltui/prebuiltui/main/assets/login/googleFavicon.png"
              alt="Google"
            />
          )}
          {loading ? "Redirecting to Google..." : "Continue with Google"}
        </button>

        <p className="text-center mt-6 text-xs text-gray-400">
          By continuing, you agree to our{" "}
          <Link href="#" className="underline hover:text-gray-600 transition-colors">
            Terms of Service
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline hover:text-gray-600 transition-colors">
            Privacy Policy
          </Link>.
        </p>
      </div>
    </div>
  );
}