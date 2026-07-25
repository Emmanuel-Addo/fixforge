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
        router.replace("/dashboard");
      }
    };

    checkSession();

    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      if (session) {
        router.replace("/dashboard");
      }
    });

    return () => {
      listener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <p className="text-gray-500 text-sm">Signing you in...</p>
    </div>
  );
}
