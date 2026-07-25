"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Hero from '@/components/Hero';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // If URL has access_token fragment or user is logged in, redirect to dashboard
    const checkAuth = async () => {
      const hasTokenHash = window.location.hash.includes("access_token=");
      const { data } = await supabase.auth.getSession();
      
      if (hasTokenHash || data.session) {
        router.replace("/dashboard");
      }
    };

    checkAuth();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        router.replace("/dashboard");
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [router]);

  return (
    <main>
      <Hero />
    </main>
  );
}
