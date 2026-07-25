"use client";

import { useState } from "react";
import { Container, Play, Terminal, CheckCircle2, AlertCircle, RefreshCw } from "lucide-react";

export default function DockerJobsPage() {
  const [selectedJobId, setSelectedJobId] = useState("JOB-412");

  const jobs = [
    {
      id: "JOB-412",
      issueId: "42",
      repo: "FixForge API",
      status: "success",
      duration: "54s",
      triggeredBy: "auth.py validation",
      time: "2 hours ago",
      logs: [
        "Sending build context to Docker daemon  2.048MB",
        "Step 1/5 : FROM python:3.9-slim",
        " ---> 77a0c64c7e63",
        "Step 2/5 : WORKDIR /app",
        " ---> Running in c6cf640fbcd8",
        "Removing intermediate container c6cf640fbcd8",
        " ---> e1024340d210",
        "Step 3/5 : COPY requirements.txt .",
        " ---> Running in f72b53448a60",
        "Removing intermediate container f72b53448a60",
        " ---> cb6543b59302",
        "Step 4/5 : RUN pip install -r requirements.txt",
        " ---> Running in d251390494cf",
        "Collecting supabase>=2.0.0",
        "Installing collected packages: supabase",
        "Successfully installed supabase-2.1.2",
        "Removing intermediate container d251390494cf",
        " ---> a84910cf94e0",
        "Step 5/5 : COPY . .",
        " ---> e910cf251839",
        "Successfully built e910cf251839",
        "Successfully tagged fixforge-api:latest",
        "Container starting...",
        "Executing test suite: pytest tests/",
        "============================= test session starts ==============================",
        "platform linux -- Python 3.9.16, pytest-7.2.1, pluggy-1.0.0",
        "rootdir: /app",
        "collected 128 items",
        "tests/test_auth.py ..................................................... [ 42%]",
        "tests/test_routes.py ................................................... [ 80%]",
        "tests/test_database.py ................................................. [100%]",
        "============================= 128 passed in 24.12s =============================",
        "Container validation complete. Result: SUCCESS"
      ]
    },
    {
      id: "JOB-411",
      issueId: "89",
      repo: "FixForge API",
      status: "success",
      duration: "48s",
      triggeredBy: "database.py safeguard",
      time: "1 day ago",
      logs: [
        "Sending build context to Docker daemon 1.89MB",
        "Successfully built a84910cf94e0",
        "Container starting...",
        "Executing test suite: pytest tests/test_database.py",
        "collected 32 items",
        "tests/test_database.py ................................ [100%]",
        "============================= 32 passed in 8.4s ==============================",
        "Container validation complete. Result: SUCCESS"
      ]
    },
    {
      id: "JOB-410",
      issueId: "38",
      repo: "fixforge-dashboard",
      status: "failed",
      duration: "1m 15s",
      triggeredBy: "routes/user.py fix",
      time: "3 days ago",
      logs: [
        "Sending build context to Docker daemon 5.21MB",
        "Step 1/5 : FROM node:18-alpine",
        " ---> 20cf94ebcd8a",
        "Step 4/5 : RUN npm run build",
        " ---> Running in f72b53448a60",
        "Error: SyntaxError: Unexpected token in user.py",
        "npm ERR! code ELIFECYCLE",
        "npm ERR! fixforge-dashboard@0.1.0 build: `next build`",
        "npm ERR! Exit status 1",
        "Container validation complete. Result: FAILED"
      ]
    }
  ];

  const selectedJob = jobs.find((j) => j.id === selectedJobId) || jobs[0];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-slate-950 flex items-center gap-2">
          <Container className="text-blue-600" size={20} />
          <span>6. Docker Sandbox Runs</span>
        </h2>
        <p className="text-xs text-slate-500 mt-1">
          Monitor sandboxed containers verifying fix viability through execution testing.
        </p>
      </div>

      {/* Grid containing list and logs console */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left Side: Jobs table list */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-3 border-b border-slate-100 bg-slate-50/50 font-bold uppercase text-[10px] text-slate-400 tracking-wider">
            Docker Jobs History
          </div>
          <div className="divide-y divide-slate-100 text-xs">
            {jobs.map((job) => (
              <div
                key={job.id}
                onClick={() => setSelectedJobId(job.id)}
                className={`p-3.5 flex items-start justify-between gap-3 cursor-pointer hover:bg-slate-50/50 transition-colors ${
                  selectedJobId === job.id ? "bg-blue-50/40 border-l-2 border-blue-500" : ""
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold text-slate-950 mb-0.5">
                    <span>{job.id}</span>
                    <span className="text-[10px] text-slate-400 font-mono">Issue #{job.issueId}</span>
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">{job.triggeredBy}</div>
                  <div className="text-[10px] text-slate-400 mt-1.5">{job.time}</div>
                </div>

                <div className="text-right shrink-0">
                  <span className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${
                    job.status === "success"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-rose-50 text-rose-700"
                  }`}>
                    {job.status === "success" ? <CheckCircle2 size={10} /> : <AlertCircle size={10} />}
                    <span>{job.status}</span>
                  </span>
                  <div className="text-[10px] text-slate-400 mt-1">Duration: {job.duration}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Log console terminal */}
        <div className="lg:col-span-7 flex flex-col bg-slate-950 text-slate-200 border border-slate-900 rounded-2xl overflow-hidden shadow-md h-[450px]">
          {/* Console titlebar */}
          <div className="h-10 px-4 bg-slate-900 flex items-center justify-between border-b border-slate-950/40 text-xs">
            <div className="flex items-center gap-2 font-mono">
              <Terminal size={14} className="text-slate-400" />
              <span className="font-bold">{selectedJob.id} Logs</span>
            </div>
            <div className="flex items-center gap-4 text-[10px] text-slate-400">
              <span>{selectedJob.duration}</span>
              <button className="flex items-center gap-1 hover:text-white transition">
                <RefreshCw size={10} />
                <span>Re-run Job</span>
              </button>
            </div>
          </div>

          {/* Code outputs */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-0.5 bg-slate-950 text-slate-300">
            {selectedJob.logs.map((log, index) => {
              const isHighlight = log.startsWith("Step") || log.startsWith("Successfully") || log.includes("Complete");
              const isError = log.includes("Error") || log.includes("Exit status");
              return (
                <div
                  key={index}
                  className={`${
                    isHighlight
                      ? "text-blue-400 font-bold"
                      : isError
                      ? "text-rose-400 font-bold bg-rose-950/20 py-0.5 px-1 rounded"
                      : log.includes("test session starts") || log.includes("passed in")
                      ? "text-emerald-400 font-bold"
                      : "text-slate-300"
                  }`}
                >
                  {log}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
