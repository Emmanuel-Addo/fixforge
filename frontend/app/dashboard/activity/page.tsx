"use client";

import { Activity, GitPullRequest, Container, Sparkles, AlertCircle, CheckCircle2, User } from "lucide-react";

export default function ActivityPage() {
  const events = [
    {
      id: 1,
      type: "pr_merge",
      title: "Pull Request #12 merged to main branch",
      desc: "Automatically closed issue #89 (NullPointerException safeguard in database).",
      user: "FixForge AI",
      time: "2 hours ago"
    },
    {
      id: 2,
      type: "sandbox_success",
      title: "Docker Sandbox JOB-412 execution finished successfully",
      desc: "Ran 128 tests for branch fix/auth-login-handling. Status: passed.",
      user: "FixForge Runner",
      time: "2 hours ago"
    },
    {
      id: 3,
      type: "fix_generated",
      title: "AI patch generated for auth.py (Issue #42)",
      desc: "Added exception-raising logic and corrected session token duration.",
      user: "FixForge AI",
      time: "3 hours ago"
    },
    {
      id: 4,
      type: "issue_imported",
      title: "GitHub issue #42 indexed and triaged",
      desc: "Title: Login fails after password reset. Assignee match confidence: 92%.",
      user: "Emmanuel Addo",
      time: "2 days ago"
    },
    {
      id: 5,
      type: "repo_connected",
      title: "GitHub Repository connected: Emmanuel-Addo/fixforge",
      desc: "Imported issue definitions and indexed file tree structure.",
      user: "Emmanuel Addo",
      time: "3 days ago"
    }
  ];

  const getIcon = (type: string) => {
    switch (type) {
      case "pr_merge":
        return <GitPullRequest className="text-violet-600" size={16} />;
      case "sandbox_success":
        return <Container className="text-emerald-600" size={16} />;
      case "fix_generated":
        return <Sparkles className="text-blue-600" size={16} />;
      case "issue_imported":
        return <AlertCircle className="text-amber-600" size={16} />;
      default:
        return <CheckCircle2 className="text-slate-600" size={16} />;
    }
  };

  const getBgColor = (type: string) => {
    switch (type) {
      case "pr_merge":
        return "bg-violet-50 border-violet-100";
      case "sandbox_success":
        return "bg-emerald-50 border-emerald-100";
      case "fix_generated":
        return "bg-blue-50 border-blue-100";
      case "issue_imported":
        return "bg-amber-50 border-amber-100";
      default:
        return "bg-slate-50 border-slate-100";
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
          <Activity className="text-blue-600" size={20} />
          <span>7. Activity Timeline</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Historical log of analysis triggers, patch suggestions, sandbox test runs, and merges.
        </p>
      </div>

      {/* Activity Timeline List */}
      <div className="relative border-l border-slate-200 pl-6 ml-4 space-y-6 text-xs">
        {events.map((event) => (
          <div key={event.id} className="relative">
            {/* Timeline bullet icon */}
            <span className={`absolute -left-10 top-0.5 w-8 h-8 rounded-xl border flex items-center justify-center shadow-sm shrink-0 ${getBgColor(event.type)}`}>
              {getIcon(event.type)}
            </span>

            {/* Event Description Card */}
            <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-sm hover:shadow-xs transition">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                <h4 className="text-slate-950 font-bold text-sm leading-snug">{event.title}</h4>
                <span className="text-[10px] text-slate-400 font-medium whitespace-nowrap">{event.time}</span>
              </div>
              <p className="text-slate-500 mt-1 text-[11px] leading-relaxed">{event.desc}</p>
              
              <div className="flex items-center gap-1.5 mt-3 text-[10px] text-slate-400 font-medium">
                <User size={10} />
                <span>Triggered by: <span className="font-bold text-slate-700">{event.user}</span></span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
