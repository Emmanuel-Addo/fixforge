"use client";

import { GitPullRequest, GitMerge, ExternalLink, RefreshCw, AlertCircle, Check } from "lucide-react";

export default function PullRequestsPage() {
  const prs = [
    {
      number: 14,
      title: "fix: resolve authentication endpoints error codes and token validation duration",
      branch: "fix/auth-login-handling",
      repo: "FixForge API",
      status: "ready", // ready, merged, draft
      commits: 2,
      changedFiles: 1,
      additions: 7,
      deletions: 4,
      time: "2 hours ago"
    },
    {
      number: 12,
      title: "fix: handle null values gracefully in database routing manager lookup",
      branch: "fix/null-pointer-profile-lookup",
      repo: "FixForge API",
      status: "merged",
      commits: 1,
      changedFiles: 1,
      additions: 12,
      deletions: 2,
      time: "1 day ago"
    },
    {
      number: 9,
      title: "perf: refactor outline visualization engine loading times",
      branch: "perf/visualization-sparkline-render",
      repo: "fixforge-dashboard",
      status: "merged",
      commits: 3,
      changedFiles: 4,
      additions: 45,
      deletions: 18,
      time: "1 week ago"
    }
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
          <GitPullRequest className="text-blue-600" size={20} />
          <span>5. Pull Requests Queue</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor branches, commit diff stats, and tracking statuses for your codebase fixes.
        </p>
      </div>

      {/* PR Cards */}
      <div className="space-y-4">
        {prs.map((pr) => (
          <div
            key={pr.number}
            className="bg-white border border-slate-200 rounded-2xl p-5 hover:shadow-sm transition-all space-y-4"
          >
            {/* PR Title row */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-start gap-2.5">
                <span className="mt-0.5">
                  {pr.status === "merged" ? (
                    <GitMerge className="text-violet-600" size={18} />
                  ) : (
                    <GitPullRequest className="text-emerald-600" size={18} />
                  )}
                </span>
                <div>
                  <h3 className="text-sm font-bold text-slate-950 leading-snug">
                    {pr.title}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span className="font-mono text-slate-500">#{pr.number}</span>
                    <span>•</span>
                    <span>{pr.repo}</span>
                    <span>•</span>
                    <span>{pr.time}</span>
                  </div>
                </div>
              </div>

              {/* Status Badge */}
              <div className="shrink-0 self-start sm:self-center">
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                  pr.status === "ready"
                    ? "bg-blue-50 text-blue-700 border-blue-100"
                    : "bg-violet-50 text-violet-700 border-violet-100"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${pr.status === "ready" ? "bg-blue-500" : "bg-violet-500"}`} />
                  <span>{pr.status}</span>
                </span>
              </div>
            </div>

            {/* PR Details details */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-3 border-t border-slate-100 text-xs">
              <div className="flex flex-wrap items-center gap-4 text-slate-500">
                {/* Branch name */}
                <div className="flex items-center gap-1.5 bg-slate-50 border border-slate-200/80 px-2 py-1 rounded-xl text-[10px] font-mono text-slate-900 font-bold">
                  <span>git branch</span>
                  <span className="text-slate-300">/</span>
                  <span>{pr.branch}</span>
                </div>

                {/* Diff stats */}
                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span>{pr.changedFiles} file changed</span>
                  <span className="text-slate-300">|</span>
                  <span className="text-emerald-600 font-bold">+{pr.additions}</span>
                  <span className="text-rose-600 font-bold">-{pr.deletions}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-50 border border-slate-200 hover:bg-slate-100 text-slate-700 text-[11px] font-semibold rounded-lg transition cursor-pointer">
                  <RefreshCw size={11} />
                  <span>Validate</span>
                </button>
                <button className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-semibold rounded-lg shadow-sm hover:shadow transition cursor-pointer">
                  <span>Open PR</span>
                  <ExternalLink size={11} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
