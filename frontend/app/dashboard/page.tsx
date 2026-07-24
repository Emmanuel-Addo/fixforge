"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import type { User } from "@supabase/supabase-js";

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data } = await supabase.auth.getSession();

      if (!data.session) {
        // Not logged in — send back to signup
        router.push("/signup");
        return;
      }

      setUser(data.session.user);
    };

    getUser();
  }, [router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/signup");
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-500 text-sm">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="bg-white max-w-sm w-full p-8 rounded-2xl shadow-sm border border-gray-100 text-center">
        {/* User Avatar */}
        {user.user_metadata?.avatar_url && (
          <img
            src={user.user_metadata.avatar_url}
            alt="Profile"
            className="w-16 h-16 rounded-full mx-auto mb-4"
          />
        )}

        <h1 className="text-xl font-bold text-gray-900 mb-1">
          Welcome, {user.user_metadata?.full_name || user.email}!
        </h1>
        <p className="text-sm text-gray-500 mb-6">{user.email}</p>

        <p className="text-sm text-gray-400 mb-6">
          You're now logged in to FixForge. More features coming soon!
        </p>

        <button
          onClick={handleLogout}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
        >
          Log Out
        </button>
      </div>
    </div>
  );
}
