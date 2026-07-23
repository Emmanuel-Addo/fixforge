"use client";
import React, { useState, useEffect, useRef } from "react";

interface FeatureSlide {
  id: string;
  number: string;
  tag: string;
  title: string;
  description: string;
  bullets: string[];
  mockup: React.ReactNode;
}

const features: FeatureSlide[] = [
  {
    id: "github-integration",
    number: "01 / 05",
    tag: "DISCOVER",
    title: "Import issues directly from GitHub.",
    description:
      "FixForge automatically indexes your repository issues, maps codebase dependencies, and triages bugs into an actionable resolution queue.",
    bullets: [
      "OAuth 2.0 instant repository integration",
      "Automatic issue categorization & indexing",
      "Skip the manual codebase navigation grind",
    ],
    mockup: (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left font-mono shadow-xl text-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 tracking-widest uppercase font-sans border-b border-gray-100 pb-3">
          <span>GITHUB DIGEST · 5 OF 24 MATCHED</span>
          <span>MAY 18</span>
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <p className="font-sans font-bold text-gray-900 text-sm">Anthropic / sdk-js</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">ISSUE #142 · 2H AGO</p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">MATCH 92</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <p className="font-sans font-bold text-gray-900 text-sm">Vercel / next.js</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">ISSUE #891 · 1D AGO</p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">MATCH 88</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <p className="font-sans font-bold text-gray-900 text-sm">Stripe / stripe-node</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">ISSUE #304 · 1D AGO</p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">MATCH 84</span>
          </div>
          <div className="flex justify-between items-center border-b border-gray-100 pb-3">
            <div>
              <p className="font-sans font-bold text-gray-900 text-sm">Linear / client</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">ISSUE #512 · 2D AGO</p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">MATCH 81</span>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <p className="font-sans font-bold text-gray-900 text-sm">Notion / api</p>
              <p className="text-[11px] text-gray-400 uppercase tracking-wider">ISSUE #119 · 3D AGO</p>
            </div>
            <span className="text-xs font-mono text-emerald-700 font-bold bg-emerald-50 px-2 py-1 rounded border border-emerald-200">MATCH 77</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "ai-analysis",
    number: "02 / 05",
    tag: "DIAGNOSE",
    title: "AI analysis of error stack traces.",
    description:
      "FixForge inspects deep call-graphs, traces broken variable references, and isolates the precise line of code breaking your production environment.",
    bullets: [
      "Deep AST & call-graph dependency analysis",
      "Empirical root-cause verification",
      "No superficial fallback patches",
    ],
    mockup: (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left font-mono shadow-xl text-gray-800">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 tracking-widest uppercase font-sans border-b border-gray-100 pb-3">
          <span>AI DIAGNOSTIC REPORT</span>
          <span className="text-rose-600 font-semibold">ROOT CAUSE FOUND</span>
        </div>
        <div className="space-y-4 font-mono text-xs">
          <div className="p-3 bg-rose-50/60 rounded-lg border border-rose-200">
            <p className="text-rose-700 font-bold">TypeError: Cannot read property 'owner' of null</p>
            <p className="text-gray-500 text-[11px] mt-1">at resolveAuthContext (src/auth/session.ts:142)</p>
          </div>
          <div className="p-3 bg-gray-50 rounded-lg border border-gray-200 space-y-2">
            <p className="text-blue-700 font-sans font-semibold">Diagnosis</p>
            <p className="text-gray-600 text-xs leading-relaxed">
              Unchecked null dereference during asynchronous session token refresh when third-party provider times out.
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "patch-generation",
    number: "03 / 05",
    tag: "GENERATE",
    title: "Surgical code patch creation.",
    description:
      "FixForge generates minimal, production-ready code diffs that conform strictly to your existing codebase architecture and typing rules.",
    bullets: [
      "Minimal line changes with zero unintended side effects",
      "Preserves docstrings, comments, and structure",
      "Adheres strictly to project style guidelines",
    ],
    mockup: (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left font-mono shadow-xl">
        <div className="flex justify-between items-center text-xs text-gray-400 mb-4 font-sans uppercase tracking-widest border-b border-gray-100 pb-3">
          <span>src/auth/session.ts</span>
          <span className="text-emerald-600 font-bold">+4 / -1 LINES</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-xs space-y-1.5 overflow-x-auto border border-gray-200">
          <p className="text-gray-400">@@ -140,4 +140,7 @@</p>
          <p className="text-rose-600 bg-rose-50 p-1 rounded border border-rose-200">- return user.session.owner;</p>
          <p className="text-emerald-700 bg-emerald-50 p-1 rounded border border-emerald-200">+ if (!user?.session) {"{"}</p>
          <p className="text-emerald-700 bg-emerald-50 p-1 rounded border border-emerald-200">+   throw new AuthSessionError("Invalid session payload");</p>
          <p className="text-emerald-700 bg-emerald-50 p-1 rounded border border-emerald-200">+ {"}"}</p>
          <p className="text-emerald-700 bg-emerald-50 p-1 rounded border border-emerald-200">+ return user.session.owner;</p>
        </div>
      </div>
    ),
  },
  {
    id: "docker-validation",
    number: "04 / 05",
    tag: "VALIDATE",
    title: "Isolated Docker sandbox testing.",
    description:
      "Every generated fix is automatically executed and validated inside an isolated Docker container running your unit and integration tests.",
    bullets: [
      "Zero risk of breaking production or local environment",
      "Empirical runtime test execution & verification",
      "Automated regression suite validation",
    ],
    mockup: (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left font-mono shadow-xl">
        <div className="flex items-center justify-between text-xs text-gray-400 mb-4 font-sans uppercase tracking-widest border-b border-gray-100 pb-3">
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            DOCKER CONTAINER #DF892A
          </span>
          <span className="text-emerald-600 font-bold">PASSED</span>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg text-xs space-y-2 border border-gray-200">
          <p className="text-gray-500">$ docker run --rm fixforge-runner npm test</p>
          <p className="text-gray-800">PASS src/auth/__tests__/session.test.ts</p>
          <p className="text-emerald-600 font-bold">✓ 28 tests passed (100% success rate)</p>
          <p className="text-gray-400 text-[11px]">Execution time: 3.42s · Memory: 124MB</p>
        </div>
      </div>
    ),
  },
  {
    id: "pr-automation",
    number: "05 / 05",
    tag: "RESOLVE",
    title: "Automatic Pull Request creation.",
    description:
      "Once validated, FixForge opens a GitHub Pull Request complete with explanations, reproduction steps, and full test evidence for team review.",
    bullets: [
      "Auto-generated PR summaries and rationale",
      "1-click developer review and merge",
      "Complete transparency with developer oversight",
    ],
    mockup: (
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-left font-sans shadow-xl">
        <div className="flex items-center justify-between mb-4 border-b border-gray-100 pb-3">
          <span className="bg-blue-50 text-blue-700 border border-blue-200 text-xs px-2.5 py-1 rounded-full font-mono font-semibold">PR #84 OPEN</span>
          <span className="text-xs text-gray-400">2 MIN AGO</span>
        </div>
        <h4 className="text-gray-900 font-bold text-base mb-2">fix(auth): handle null session owner error</h4>
        <p className="text-xs text-gray-600 mb-5 leading-relaxed">
          FixForge verified 28 unit tests inside Docker sandbox. Fixes issue #142 with null session handling.
        </p>
        <button className="w-full bg-gray-950 text-white font-medium text-xs py-2.5 rounded-lg hover:bg-gray-900 transition-colors duration-300 cursor-pointer mt-2">
          Review & Merge Pull Request →
        </button>
      </div>
    ),
  },
];

export default function FeatureStack() {
  const [activeIndex, setActiveIndex] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const totalHeight = containerRef.current.clientHeight - window.innerHeight;
      if (totalHeight <= 0) return;

      const scrolled = Math.max(0, -rect.top);
      const progress = scrolled / totalHeight;
      const index = Math.min(
        features.length - 1,
        Math.floor(progress * features.length)
      );
      setActiveIndex(index);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative bg-white text-gray-900 min-h-[500vh] border-t border-gray-200"
    >
      <div className="sticky top-0 h-screen flex flex-col justify-center overflow-hidden px-6 md:px-16 lg:px-24">
        
        {/* Top Header Row with prominent top border and section labels */}
        <div className="max-w-6xl mx-auto w-full flex items-center justify-between mb-8 text-xs font-mono text-gray-500 border-b border-gray-200 pb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="uppercase tracking-widest text-gray-600 font-semibold">THE LOOP</span>
          </div>
          <div>
            <span className="text-blue-700 font-bold">{features[activeIndex].number}</span>
          </div>
        </div>

        {/* Main Content Grid matching ResuMax layout */}
        <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Side: Numbering, Title & Copy */}
          <div className="lg:col-span-6 space-y-6">
            
            {/* Slide step counter with line accent */}
            <div className="flex items-center gap-4 text-xs font-mono text-gray-400">
              <span className="text-gray-500 font-bold">{features[activeIndex].number}</span>
              <span className="w-12 h-[1px] bg-gray-300"></span>
              <span className="text-blue-700 uppercase tracking-widest font-semibold">{features[activeIndex].tag}</span>
            </div>

            <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-gray-900 leading-[1.1] min-h-[120px]">
              {features[activeIndex].title}
            </h2>

            <p className="text-gray-600 text-base md:text-lg leading-relaxed max-w-lg min-h-[70px]">
              {features[activeIndex].description}
            </p>

            <ul className="space-y-3 pt-2 text-sm text-gray-700">
              {features[activeIndex].bullets.map((bullet, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="text-blue-600 font-bold">•</span>
                  <span>{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Right Side: ResuMax-style Card Mockup */}
          <div className="lg:col-span-6">
            {features[activeIndex].mockup}
          </div>

        </div>

      </div>
    </div>
  );
}
