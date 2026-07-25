"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import Hero from '@/components/Hero';
import FeatureStack from '@/components/FeatureStack';
import ProblemSection from '@/components/ProblemSession';
import Footer from '@/components/Footer';
import TestimonialCards from '@/components/TestimonialCards';

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
    <div>
        <Hero/>
        <FeatureStack/>
        <ProblemSection/>
        <TestimonialCards/>
        <Footer/>
    </div>
  );
}
