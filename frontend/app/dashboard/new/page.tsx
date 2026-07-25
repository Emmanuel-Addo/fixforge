"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { getSupabase } from "@/lib/supabase";
import {
  Search,
  ChevronDown,
  Loader2,
  Check,
  ArrowRight,
  Globe,
  MessageSquare,
  Zap,
  Package,
  ArrowLeft,
} from "lucide-react";
import Link from "next/link";

type Repo = {
  name: string;
  updatedAt: string;
  private: boolean;
  importing?: boolean;
  imported?: boolean;
};

// ── Helper: call GitHub API with a token ────────────────────────────────────
async function fetchGitHubRepos(token: string): Promise<Repo[]> {
  const resp = await fetch(
    "https://api.github.com/user/repos?per_page=100&sort=updated&affiliation=owner",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/vnd.github+json",
      },
    }
  );
  if (!resp.ok) throw new Error(`GitHub API ${resp.status}`);
  const data = await resp.json();
  return data.map((r: any) => ({
    name: r.name,
    updatedAt: r.updated_at ? r.updated_at.slice(0, 10) : "Recently",
    private: r.private,
  }));
}

async function fetchGitHubUser(token: string): Promise<string> {
  const resp = await fetch("https://api.github.com/user", {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
    },
  });
  if (!resp.ok) throw new Error(`GitHub /user ${resp.status}`);
  const data = await resp.json();
  return data.login as string;
}

export default function NewProjectPage() {
  const router = useRouter();
  const [githubConnected, setGithubConnected] = useState(false);
  const [githubUsername, setGithubUsername] = useState<string>("");
  const [githubToken, setGithubToken] = useState<string>("");
  const [connecting, setConnecting] = useState(false);
  const [reposLoading, setReposLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [repos, setRepos] = useState<Repo[]>([]);

  // ── 1. Subscribe to auth state change ─────────────────────────────────────
  // This fires immediately when the GitHub OAuth redirect lands on this page
  // and Supabase processes the hash fragment — giving us the provider_token.
  useEffect(() => {
    const { data: { subscription } } = getSupabase().auth.onAuthStateChange(
      async (event, session) => {
        if (!session) return;

        // Try to get GitHub token from session or localStorage
        let token = session.provider_token || localStorage.getItem("github_token") || "";

        // On initial sign-in with provider_token, persist it
        if (session.provider_token) {
          localStorage.setItem("github_token", session.provider_token);
        }

        // Find GitHub identity to get username
        const identities = session.user?.identities || [];
        const ghId = identities.find((id: any) => id.provider === "github");
        const login = ghId?.identity_data?.user_name
          || ghId?.identity_data?.preferred_username
          || ghId?.identity_data?.login
          || "";

        if (!login) return;

        setGithubUsername(login);
        setGithubConnected(true);
        localStorage.setItem("github_connected", "true");
        localStorage.setItem("github_owner", login);

        if (token) {
          // We have a GitHub token — use it to call GitHub API directly (gets private repos too)
          setGithubToken(token);
          setReposLoading(true);
          try {
            const repoList = await fetchGitHubRepos(token);
            setRepos(repoList);
          } catch (e) {
            console.error("GitHub API error:", e);
          } finally {
            setReposLoading(false);
          }
        } else {
          // No token — fall back to backend (public repos only)
          setReposLoading(true);
          try {
            const res = await fetch(
              `${API_BASE_URL}/api/projects/list?username=${login}`
            );
            const data = await res.json();
            setRepos(data);
          } catch (e) {
            console.error("Failed to load repos:", e);
          } finally {
            setReposLoading(false);
          }
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // ── On mount: if GitHub already connected, load repos from stored token ──
  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (!session) return;

      const identities = session.user?.identities || [];
      const ghId = identities.find((id: any) => id.provider === "github");
      if (!ghId) return;

      const login = ghId.identity_data?.user_name
        || ghId.identity_data?.preferred_username
        || ghId.identity_data?.login
        || "";
      if (!login) return;

      setGithubUsername(login);
      setGithubConnected(true);
      localStorage.setItem("github_connected", "true");
      localStorage.setItem("github_owner", login);

      const storedToken = localStorage.getItem("github_token") || session.provider_token || "";
      if (storedToken) {
        setGithubToken(storedToken);
        localStorage.setItem("github_token", storedToken);
        setReposLoading(true);
        try {
          const repoList = await fetchGitHubRepos(storedToken);
          setRepos(repoList);
        } catch (e) {
          console.error("Failed to load repos:", e);
        } finally {
          setReposLoading(false);
        }
      } else {
        // No token — load public repos via backend
        setReposLoading(true);
        try {
          const res = await fetch(`${API_BASE_URL}/api/projects/list?username=${login}`);
          const data = await res.json();
          setRepos(data);
        } catch (e) {
          console.error("Failed to load repos:", e);
        } finally {
          setReposLoading(false);
        }
      }
    };
    init();
  }, []);

  // ── 2. Trigger GitHub OAuth ────────────────────────────────────────────────
  const handleGrantPermission = async () => {
    setConnecting(true);
    setShowPermissionModal(false);
    try {
      const { data: { session } } = await getSupabase().auth.getSession();
      if (session) {
        // Try to link GitHub to the existing Google session
        const { error } = await getSupabase().auth.linkIdentity({
          provider: "github",
          options: {
            redirectTo: `${window.location.origin}/dashboard/new?github=connected`,
            scopes: "repo read:user",
          },
        });
        if (error) {
          // linkIdentity not enabled — fall back to a full OAuth sign-in
          await getSupabase().auth.signInWithOAuth({
            provider: "github",
            options: {
              redirectTo: `${window.location.origin}/dashboard/new?github=connected`,
              scopes: "repo read:user",
            },
          });
        }
      } else {
        await getSupabase().auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo: `${window.location.origin}/dashboard/new?github=connected`,
            scopes: "repo read:user",
          },
        });
      }
    } catch (err) {
      console.error("GitHub OAuth error:", err);
      setConnecting(false);
    }
    // Browser redirects — spinner stays
  };

  // ── 3. Disconnect GitHub ───────────────────────────────────────────────────
  const handleLogout = () => {
    setGithubConnected(false);
    setGithubUsername("");
    setGithubToken("");
    setRepos([]);
    localStorage.removeItem("github_token");
    localStorage.removeItem("active_repo");
    router.push("/dashboard");
  };

  const handleImport = async (repoName: string) => {
    setRepos((prev) =>
      prev.map((r) => (r.name === repoName ? { ...r, importing: true } : r))
    );
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/projects/import`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ repo_name: repoName, github_username: githubUsername })
      });
      const data = await response.json();
      localStorage.setItem("active_repo", repoName);
      localStorage.setItem("github_owner", githubUsername);
      setTimeout(() => router.push("/dashboard"), 600);
    } catch (error) {
      console.error("Error importing repository:", error);
      // Fallback
      setRepos((prev) =>
        prev.map((r) =>
          r.name === repoName ? { ...r, importing: false, imported: true } : r
        )
      );
      localStorage.setItem("active_repo", repoName);
      setTimeout(() => router.push("/dashboard"), 600);
    }
  };

  const filteredRepos = repos.filter((r) =>
    r.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const templates = [
    {
      name: "Chat Template",
      desc: "A persisted Next.js chat template for eve, built with shadcn/ui, Tailwind CSS...",
      icon: <MessageSquare size={20} className="text-slate-600" />,
    },
    {
      name: "Slack Agent",
      desc: "An eve template for Slack agents with webhook handling, Vercel Connect, a...",
      icon: <Zap size={20} className="text-violet-600" />,
    },
    {
      name: "Express.js on Vercel",
      desc: "Simple Express.js + Vercel template that serves html content, HTML data and...",
      icon: <Globe size={20} className="text-slate-600" />,
    },
    {
      name: "Next.js Boilerplate",
      desc: "Get started with Next.js and Vercel in seconds.",
      icon: <Package size={20} className="text-slate-950" />,
    },
  ];

  return (
    <div className="min-h-full bg-slate-50 relative">
      {/* Back link */}
      <div className="px-6 pt-6">
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft size={14} />
          Back to Dashboard
        </Link>
      </div>

      {/* Page Heading */}
      <div className="px-6 pt-4 pb-6 max-w-6xl mx-auto">
        <h1 className="text-2xl text-slate-950">
          Let&apos;s build something new
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Connect your GitHub account to import a repository and start auto-fixing bugs.
        </p>
      </div>

      {/* ── STEP 1: GitHub Not Connected ── */}
      {!githubConnected && (
        <div className="max-w-md mx-auto px-6 pb-16 flex flex-col items-center text-center gap-6">
          {/* Big GitHub icon block */}
          <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center justify-center">
            <svg className="w-10 h-10 text-slate-950" viewBox="0 0 16 16" fill="currentColor">
              <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
          </div>

          <div>
            <h2 className="text-lg text-slate-950">Connect your GitHub account</h2>
            <p className="text-sm text-slate-500 mt-2 leading-relaxed max-w-sm">
              Grant FixForge access to your repositories so it can import issues, analyze code, and submit pull requests automatically.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="w-full bg-white border border-slate-200 rounded-2xl p-4 space-y-3 text-left shadow-sm">
            {[
              "Import issues from any repository",
              "AI-powered bug analysis and fixes",
              "Automatic pull request generation",
              "Docker sandbox validation before merge",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5 text-xs text-slate-700">
                <span className="w-4 h-4 rounded-full bg-emerald-100 border border-emerald-200 flex items-center justify-center shrink-0">
                  <Check size={9} className="text-emerald-600" />
                </span>
                {feature}
              </div>
            ))}
          </div>

          <button
            onClick={handleGrantPermission}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-2.5 bg-slate-950 hover:bg-slate-800 disabled:bg-slate-400 text-white py-3 px-6 rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer text-sm"
          >
            {connecting ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                <span>Connecting to GitHub...</span>
              </>
            ) : (
              <>
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <span>Connect GitHub Account</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-slate-400">
            We only request permissions needed for issue analysis and PR creation.
          </p>
        </div>
      )}

      {/* ── STEP 2: GitHub Connected — Import Workspace ── */}
      {githubConnected && (
        <div className="max-w-2xl mx-auto px-6 pb-12">
          {/* URL bar */}
          <div className="relative mb-6">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-sm">+</div>
            <input
              type="text"
              placeholder="Ask v0 to build or enter a Git repository URL..."
              className="w-full pl-9 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm text-slate-600 placeholder:text-slate-400 focus:outline-none focus:border-blue-500 focus:shadow-sm transition-all shadow-sm"
            />
          </div>

          {/* Import Git Repository Card */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-base text-slate-950 font-normal">Import Git Repository</h3>
              <button
                onClick={handleLogout}
                className="text-xs text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 px-3 py-1.5 rounded-xl transition cursor-pointer font-medium font-sans"
              >
                Delete GitHub Account
              </button>
            </div>

            {/* Account + Search Row */}
            <div className="px-4 py-3 flex gap-2 border-b border-slate-100">
              <button className="flex items-center gap-2 border border-slate-200 bg-slate-50 rounded-lg px-3 py-2 text-xs text-slate-800 hover:bg-slate-100 transition cursor-pointer">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <span>{githubUsername || "GitHub"}</span>
                <ChevronDown size={12} className="text-slate-400" />
              </button>
              <div className="flex-1 relative">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-blue-500 transition"
                />
              </div>
            </div>

            {/* Repo List */}
            <div className="divide-y divide-slate-100 max-h-96 overflow-y-auto">
              {reposLoading && (
                <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-500">
                  <Loader2 size={16} className="animate-spin" />
                  Loading repositories...
                </div>
              )}
              {!reposLoading && filteredRepos.length === 0 && (
                <div className="py-8 text-center text-sm text-slate-400">No repositories found</div>
              )}
              {!reposLoading && filteredRepos.map((repo) => (
                <div
                  key={repo.name}
                  className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Repo icon */}
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center border text-[10px] ${
                      repo.private
                        ? "bg-amber-50 border-amber-200 text-amber-600"
                        : "bg-blue-50 border-blue-200 text-blue-600"
                    }`}>
                      {repo.private ? "🔒" : (
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
                          <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-slate-900">{repo.name}</p>
                      <p className="text-[10px] text-slate-400">{repo.updatedAt}</p>
                    </div>
                  </div>

                  {/* Import Button */}
                  {repo.imported ? (
                    <span className="flex items-center gap-1 text-[11px] text-emerald-600 bg-emerald-50 border border-emerald-100 px-2.5 py-1 rounded-lg">
                      <Check size={12} />
                      Imported
                    </span>
                  ) : (
                    <button
                      onClick={() => handleImport(repo.name)}
                      disabled={repo.importing}
                      className="flex items-center gap-1.5 bg-white hover:bg-slate-50 disabled:bg-slate-50 border border-slate-200 text-slate-800 text-xs px-3 py-1.5 rounded-lg transition cursor-pointer disabled:cursor-wait shadow-sm hover:shadow"
                    >
                      {repo.importing ? (
                        <>
                          <Loader2 size={11} className="animate-spin text-blue-600" />
                          <span>Importing...</span>
                        </>
                      ) : (
                        <span>Import</span>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
