import { Clock, BookOpen, Bug, ArrowRight } from "lucide-react";

const problems = [
  {
    icon: Clock,
    title: "Debugging eats hours",
    description:
      "Developers lose hours tracing stack traces, reading logs, and manually isolating the root cause of a single bug.",
    link: "Why it slows you down",
  },
  {
    icon: BookOpen,
    title: "Unfamiliar codebases take time",
    description:
      "Onboarding into a new codebase or revisiting old code means spending days just understanding what does what.",
    link: "The hidden cost",
  },
  {
    icon: Bug,
    title: "Fixing one bug creates another",
    description:
      "Patching code without full context often introduces regressions, turning one issue into a chain of problems.",
    link: "How it compounds",
  },
];

export default function ProblemSection() {
  return (
    <div className="w-full py-20 px-6 flex flex-col items-center bg-gray-50 border-t border-gray-100">
      <div className="text-center mx-auto max-w-2xl">
        <span className="inline-flex items-center justify-center px-4 py-1.5 rounded-full bg-white border border-blue-500 text-sm text-blue-700 font-medium">
          The Problem
        </span>
        <h2 className="text-4xl md:text-5xl font-medium text-slate-900 mt-6 leading-tight">
          Software bugs slow development.
        </h2>
        <p className="text-sm md:text-base text-slate-600 mt-4 max-w-[530px] mx-auto">
          Every team hits the same walls debugging, context switching, and
          risky fixes that break something else. Here is where time disappears.
        </p>
      </div>

      <div className="flex flex-col md:flex-row max-w-6xl mx-auto w-full mt-16">
        {problems.map(({ title, description }) => (
          <div
            key={title}
            className="group border border-slate-200 px-8 py-8 sm:py-16 flex flex-col gap-5 text-[15px] hover:bg-blue-600 hover:text-white transition-all duration-300 text-gray-600 cursor-pointer flex-1 bg-white"
          >
            <b className="text-gray-900 group-hover:text-white transition-colors">{title}:</b>
            <p className="group-hover:text-white transition-colors">{description}</p>
          </div>
        ))}
      </div>

      {/* Transition CTA */}
      {/* <div className="mt-16 text-center max-w-xl mx-auto">
        <p className="text-lg md:text-xl font-medium text-slate-800">
          FixForge automates the repetitive parts — while developers stay in
          control.
        </p>
        <a
          href="#"
          className="mt-6 inline-flex items-center gap-2 bg-gray-950 hover:bg-gray-900 text-white text-sm font-medium px-6 py-2.5 rounded-lg transition-colors duration-300"
        >
          See How It Works
          <ArrowRight size={15} />
        </a>
      </div> */}
    </div>
  );
}