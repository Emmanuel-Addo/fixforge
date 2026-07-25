"use client";

import { useState } from "react";
import { Settings, Lock, Shield, Eye, CreditCard, ChevronRight, Check } from "lucide-react";

export default function SettingsPage() {
  const [activeSubTab, setActiveSubTab] = useState<"profile" | "integrations" | "billing">("profile");

  const [githubConnected, setGithubConnected] = useState(true);

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
          <Settings className="text-blue-600" size={20} />
          <span>8. Settings Manager</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Configure project parameters, manage connected GitHub repository access, and check subscription status.
        </p>
      </div>

      {/* Tab selectors */}
      <div className="flex border-b border-slate-200 gap-6 text-xs font-semibold">
        <button
          onClick={() => setActiveSubTab("profile")}
          className={`pb-2 border-b-2 transition cursor-pointer ${
            activeSubTab === "profile" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Profile Settings
        </button>
        <button
          onClick={() => setActiveSubTab("integrations")}
          className={`pb-2 border-b-2 transition cursor-pointer ${
            activeSubTab === "integrations" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Integrations
        </button>
        <button
          onClick={() => setActiveSubTab("billing")}
          className={`pb-2 border-b-2 transition cursor-pointer ${
            activeSubTab === "billing" ? "border-blue-600 text-blue-600 font-bold" : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Billing & Usage
        </button>
      </div>

      {/* Tab Contents */}
      <div className="space-y-4">
        {activeSubTab === "profile" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-4 max-w-xl">
            <h3 className="text-sm font-bold text-slate-950">Personal Details</h3>
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-500 font-bold mb-1">Full Name</label>
                <input
                  type="text"
                  defaultValue="Emmanuel Addo"
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-slate-500 font-bold mb-1">Email Address</label>
                <input
                  type="email"
                  defaultValue="emmanuel@example.com"
                  disabled
                  className="w-full p-2.5 bg-slate-100 border border-slate-200 text-slate-500 rounded-xl"
                />
              </div>
              <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-xl shadow-sm hover:shadow transition cursor-pointer mt-2 text-xs">
                Save Profile
              </button>
            </div>
          </div>
        )}

        {activeSubTab === "integrations" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Code Repositories</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Integrate FixForge with code versioning tools.</p>
            </div>

            <div className="flex items-center justify-between border border-slate-200 p-4 rounded-2xl">
              <div className="flex items-center gap-3">
                <svg className="w-8 h-8 text-slate-950" viewBox="0 0 16 16" fill="currentColor">
                  <path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
                </svg>
                <div>
                  <h4 className="text-xs font-bold text-slate-900">GitHub Connector</h4>
                  <p className="text-[10px] text-slate-400">Sync pull requests and issue tracking automatically.</p>
                </div>
              </div>

              {githubConnected ? (
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                    <Check size={10} />
                    <span>Connected</span>
                  </span>
                  <button
                    onClick={() => setGithubConnected(false)}
                    className="text-[11px] text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    Disconnect
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setGithubConnected(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-1.5 px-3 rounded-lg shadow-sm hover:shadow transition cursor-pointer text-xs"
                >
                  Connect GitHub
                </button>
              )}
            </div>
          </div>
        )}

        {activeSubTab === "billing" && (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-950">Billing Details</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Check current token counts and pricing details.</p>
            </div>

            {/* Current details */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50">
                <div className="text-[10px] text-slate-400 uppercase font-bold">Current Plan</div>
                <div className="text-slate-900 font-bold text-lg mt-1 flex items-center gap-1.5">
                  <span>Starter Sandbox</span>
                  <span className="text-[9px] bg-slate-100 px-1.5 py-0.5 rounded border text-slate-600 font-bold uppercase">
                    Free
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-2">Up to 3 open repositories, 100 AI tokens/month.</p>
              </div>

              <div className="border border-slate-100 p-4 rounded-xl bg-slate-50/50">
                <div className="text-[10px] text-slate-400 uppercase font-bold">AI Token Usage</div>
                <div className="text-slate-950 font-bold text-lg mt-1 font-mono">
                  84 <span className="text-xs text-slate-400 font-sans font-medium">/ 100 tokens used</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 mt-2.5 overflow-hidden">
                  <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: "84%" }} />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
