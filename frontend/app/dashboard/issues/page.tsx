"use client";

import { useState } from "react";
import { AlertCircle, ExternalLink, Play, CheckCircle2, ChevronRight, HelpCircle } from "lucide-react";

export default function IssuesPage() {
  const [filter, setFilter] = useState<"all" | "open" | "closed">("all");

  const issuesList = [
    {
      id: "42",
      title: "Login fails after password reset",
      repo: "FixForge API",
      status: "open",
      severity: "high",
      matchScore: 92,
      created: "2 days ago",
      comments: 3
    },
    {
      id: "145",
      title: "Docker container timeout during dependency installation",
      repo: "FixForge API",
      status: "open",
      severity: "medium",
      matchScore: 88,
      created: "1 day ago",
      comments: 1
    },
    {
      id: "89",
      title: "NullPointerException in user profile routing logic",
      repo: "FixForge API",
      status: "open",
      severity: "high",
      matchScore: 95,
      created: "3 days ago",
      comments: 7
    },
    {
      id: "112",
      title: "Optimize SVG sparkline rendering performance",
      repo: "fixforge-dashboard",
      status: "closed",
      severity: "low",
      matchScore: 78,
      created: "1 week ago",
      comments: 0
    },
    {
      id: "56",
      title: "Supabase authentication callback returns 401 code",
      repo: "FixForge API",
      status: "closed",
      severity: "high",
      matchScore: 90,
      created: "2 weeks ago",
      comments: 4
    }
  ];

  const filteredIssues = issuesList.filter((issue) => {
    if (filter === "all") return true;
    return issue.status === filter;
  });

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
            <AlertCircle className="text-blue-600" size={20} />
            <span>3. Issues Queue</span>
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Browse indexed repository issues, see AI resolution confidence, and trigger fixes.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex bg-slate-100 rounded-xl p-0.5 text-xs font-semibold shrink-0">
          <button
            onClick={() => setFilter("all")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === "all" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("open")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === "open" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Open
          </button>
          <button
            onClick={() => setFilter("closed")}
            className={`px-3 py-1.5 rounded-lg transition cursor-pointer ${
              filter === "closed" ? "bg-white text-slate-950 shadow-sm" : "text-slate-500 hover:text-slate-900"
            }`}
          >
            Closed
          </button>
        </div>
      </div>

      {/* Issues Table list */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-400 font-bold uppercase tracking-wider">
                <th className="py-3.5 px-4 font-semibold">Issue</th>
                <th className="py-3.5 px-4 font-semibold">Repository</th>
                <th className="py-3.5 px-4 font-semibold text-center">Severity</th>
                <th className="py-3.5 px-4 font-semibold text-center">AI Match Score</th>
                <th className="py-3.5 px-4 font-semibold">Age</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredIssues.map((issue) => (
                <tr key={issue.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                    <div className="flex items-start gap-3">
                      <span className="text-slate-400 font-mono text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md mt-0.5 font-bold shrink-0">
                        #{issue.id}
                      </span>
                      <div>
                        <div className="text-slate-950 font-bold text-sm leading-snug">{issue.title}</div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                          <span>{issue.comments} comments</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5 hover:text-slate-600 cursor-pointer">
                            <span>Open on Github</span>
                            <ExternalLink size={10} />
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-600">{issue.repo}</td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                      issue.severity === "high"
                        ? "bg-rose-50 text-rose-700 border-rose-100"
                        : issue.severity === "medium"
                        ? "bg-amber-50 text-amber-700 border-amber-100"
                        : "bg-slate-50 text-slate-600 border-slate-100"
                    }`}>
                      {issue.severity}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-center">
                    <div className="flex items-center justify-center gap-1.5">
                      <div className="w-10 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="bg-blue-600 h-1.5 rounded-full"
                          style={{ width: `${issue.matchScore}%` }}
                        />
                      </div>
                      <span className="text-slate-900 font-mono font-bold">{issue.matchScore}%</span>
                    </div>
                  </td>
                  <td className="py-4 px-4 text-slate-500">{issue.created}</td>
                  <td className="py-4 px-4 text-right">
                    {issue.status === "open" ? (
                      <button className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1 px-3 rounded-lg shadow-sm hover:shadow transition cursor-pointer text-[11px]">
                        <Play size={10} />
                        <span>Run Analysis</span>
                      </button>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-slate-400 font-semibold py-1 px-3 text-[11px]">
                        <CheckCircle2 size={12} className="text-emerald-500" />
                        <span>Fixed</span>
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
