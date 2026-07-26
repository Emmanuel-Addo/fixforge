"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabase } from "@/lib/supabase";
import { getUserSettings, clearUserSettings } from "@/lib/user-settings";
import type { User } from "@supabase/supabase-js";
import {
  Plus,
  Bell,
  LogOut,
  Loader2,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [isGithubConnected, setIsGithubConnected] = useState(false);

  useEffect(() => {
    const checkGitHub = async () => {
      const settings = await getUserSettings();
      setIsGithubConnected(settings.github_connected);
    };
    checkGitHub();
  }, []);

  const handleDeleteGitHubConnection = async () => {
    try {
      const { data: { user } } = await getSupabase().auth.getUser();
      const githubIdentity = user?.identities?.find((id) => id.provider === "github");
      if (githubIdentity) {
        await getSupabase().auth.unlinkIdentity(githubIdentity);
      }
    } catch (err) {
      console.error("Error unlinking GitHub identity:", err);
    }
    await clearUserSettings();
    setIsGithubConnected(false);
    router.push("/dashboard");
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await getSupabase().auth.getSession();
      if (!data.session) {
        router.push("/signup");
        return;
      }
      setUser(data.session.user);
      setLoading(false);
    };
    checkUser();
  }, [router]);

  const handleLogout = async () => {
    await getSupabase().auth.signOut();
    router.push("/signup");
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500 text-sm font-medium">Loading...</p>
      </div>
    );
  }

  const userInitials = "EM";

  return (
    <div className="h-screen flex flex-col bg-slate-50">
      {/* ── Top Navbar ── */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-40 sticky top-0">
        {/* Left: Logo */}
          <Link href="/dashboard" className="flex items-center gap-2 shrink-0">
            <span className="font-bold text-base tracking-tight text-slate-950">
              FixForge
            </span>
          </Link>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Add Project Button */}
          <Link
            href="/dashboard/new"
            className="hidden md:flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-sm hover:shadow transition-all cursor-pointer"
          >
            <Plus size={14} />
            <span>Add Project</span>
          </Link>

          {/* Bell */}
          <button className="relative p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer">
            <Bell size={16} />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-blue-600 rounded-full" />
          </button>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-1 py-1 hover:bg-slate-100 rounded-xl transition cursor-pointer"
            >
              {user.user_metadata?.avatar_url ? (
                <img
                  src={user.user_metadata.avatar_url}
                  alt="avatar"
                  className="w-7 h-7 rounded-full border border-slate-200"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold text-xs flex items-center justify-center border border-blue-200">
                  {userInitials}
                </div>
              )}
              <span className="hidden md:block text-xs font-semibold text-slate-800">
                Emmaq
              </span>
              <ChevronDown size={13} className="text-slate-400" />
            </button>

            {userMenuOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="absolute right-0 mt-1 w-52 bg-white border border-slate-200 rounded-2xl shadow-lg py-2 z-50">
                  <div className="px-4 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-950 truncate">
                      Emmaq
                    </p>
                    <p className="text-[10px] text-slate-400 truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setUserMenuOpen(false)}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition flex items-center gap-2"
                  >
                    Settings
                  </Link>
                  {isGithubConnected && (
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        handleDeleteGitHubConnection();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                    >
                      Delete GitHub Connection
                    </button>
                  )}
                  <button
                    onClick={() => { setUserMenuOpen(false); handleLogout(); }}
                    className="w-full text-left px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition flex items-center gap-2 cursor-pointer border-0 bg-transparent"
                  >
                    <LogOut size={13} />
                    <span>Log Out</span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Mobile Hamburger */}
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden p-2 text-slate-500 hover:bg-slate-100 rounded-xl transition"
          >
            <Menu size={18} />
          </button>
        </div>
      </header>

      {/* ── Mobile Menu Drawer ── */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-0 right-0 h-full w-72 bg-white shadow-xl flex flex-col">
            <div className="h-14 flex items-center justify-between px-5 border-b border-slate-100">
              <span className="font-bold text-slate-950">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500"
              >
                <X size={18} />
              </button>
            </div>

            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {/* Nav links removed — use logo to navigate to dashboard */}
            </nav>

            <div className="p-4 border-t border-slate-100 space-y-2">
              <Link
                href="/dashboard/new"
                onClick={() => setMobileOpen(false)}
                className="flex items-center justify-center gap-2 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-xl text-sm transition"
              >
                <Plus size={15} />
                Add Project
              </Link>
              {isGithubConnected && (
                <button
                  onClick={() => {
                    setMobileOpen(false);
                    handleDeleteGitHubConnection();
                  }}
                  className="flex items-center justify-center gap-2 w-full border border-rose-200 text-rose-600 hover:bg-rose-50 font-medium py-2.5 rounded-xl text-sm transition cursor-pointer bg-transparent"
                >
                  Delete GitHub Connection
                </button>
              )}
              <button
                onClick={handleLogout}
                className="flex items-center justify-center gap-2 w-full border border-slate-200 text-slate-600 hover:bg-slate-50 font-medium py-2.5 rounded-xl text-sm transition cursor-pointer bg-transparent"
              >
                <LogOut size={14} />
                Log Out
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Page Content ── */}
      <main className="flex-1 overflow-hidden flex flex-col">
        {children}
      </main>
    </div>
  );
}
