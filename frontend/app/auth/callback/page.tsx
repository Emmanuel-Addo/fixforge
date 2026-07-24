"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

// Google redirects the user here after they log in.
// We check if the login was successful, then send them to /dashboard.
export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();

      if (data.session) {
        // User is logged in — go to dashboard
        router.push("/dashboard");
      } else {
        // Something went wrong — go back to signup
        router.push("/signup");
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Signing you in...</p>
    </div>
  );
}
