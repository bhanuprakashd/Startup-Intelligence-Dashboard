"use client";

import {
  Brain,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Loader2,
  Sparkles,
  AlertTriangle,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

// ─── Constants ────────────────────────────────────────────────────────────────

const SKILLS = [
  "Python",
  "JavaScript",
  "Marketing",
  "Sales",
  "Design",
  "Data Science",
  "Finance",
  "Operations",
  "Legal",
  "Healthcare",
  "Engineering",
  "None/Learning",
];

const INTERESTS = [
  "AI/ML",
  "FinTech",
  "HealthTech",
  "CleanTech",
  "EdTech",
  "E-Commerce",
  "SaaS",
  "BioTech",
  "Cybersecurity",
  "Gaming",
  "Web3",
  "Robotics",
  "SpaceTech",
  "Food/AgriTech",
];

const BUDGET_OPTIONS = [
  { value: "$0-1K", label: "$0 – $1K" },
  { value: "$1K-10K", label: "$1K – $10K" },
  { value: "$10K-50K", label: "$10K – $50K" },
  { value: "$50K+", label: "$50K+" },
];

const EXPERIENCE_OPTIONS = [
  { value: "first-time", label: "First-time founder" },
  { value: "side-project", label: "Side project" },
  { value: "corporate", label: "Leaving corporate" },
  { value: "serial", label: "Serial entrepreneur" },
];

const STEP_LABELS = ["Skills", "Interests", "Resources", "Results"];

// ─── Types ────────────────────────────────────────────────────────────────────

interface ProfileMatchResult {
  profile: {
    skills: string[];
    interests: string[];
    budget: string;
    location: string;
    experience: string;
  };
  aiAnalysis: string;
  signalsSummary: string;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ step }: { step: number }) {
  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-2">
        {STEP_LABELS.map((label, index) => (
          <div key={label} className="flex items-center gap-1">
            <div
              className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold transition-colors",
                index < step
                  ? "bg-indigo-500 text-white"
                  : index === step
                  ? "bg-indigo-500/20 border border-indigo-500 text-indigo-400"
                  : "bg-white/5 text-muted-foreground"
              )}
            >
              {index + 1}
            </div>
            <span
              className={cn(
                "hidden sm:block text-[10px] font-medium transition-colors",
                index <= step ? "text-indigo-400" : "text-muted-foreground"
              )}
            >
              {label}
            </span>
            {index < STEP_LABELS.length - 1 && (
              <div
                className={cn(
                  "h-px w-6 sm:w-12 mx-1 transition-colors",
                  index < step ? "bg-indigo-500" : "bg-white/10"
                )}
              />
            )}
          </div>
        ))}
      </div>
      <div className="h-1 rounded-full bg-white/10 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-500"
          style={{ width: `${(step / (STEP_LABELS.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}

function TagGrid({
  options,
  selected,
  onToggle,
}: {
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((option) => {
        const isSelected = selected.includes(option);
        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border",
              isSelected
                ? "bg-indigo-500/20 border-indigo-500 text-indigo-300"
                : "glass border-white/10 text-muted-foreground hover:border-white/25 hover:text-foreground"
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}

function IdeaCard({ content, index }: { content: string; index: number }) {
  const [expanded, setExpanded] = useState(index === 0);

  // Parse the idea name from the first bold section
  const nameMatch = content.match(/\*\*([^*]+)\*\*/);
  const ideaName = nameMatch ? nameMatch[1] : `Idea ${index + 1}`;


  return (
    <div className="glass gradient-border rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-xs font-bold text-white shrink-0">
            {index + 1}
          </div>
          <span className="text-sm font-semibold text-foreground">
            {ideaName}
          </span>
        </div>
        {expanded ? (
          <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && (
        <div className="px-4 pb-4 border-t border-white/5">
          <div className="pt-3 text-xs text-muted-foreground leading-relaxed [&_p]:mb-2 [&_p:last-child]:mb-0 [&_ul]:mb-2 [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:mb-2 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:mb-0.5 [&_strong]:font-semibold [&_strong]:text-foreground [&_h3]:text-[12px] [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mb-1">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {content}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function FounderQuiz() {
  const [step, setStep] = useState(0);
  const [skills, setSkills] = useState<string[]>([]);
  const [interests, setInterests] = useState<string[]>([]);
  const [budget, setBudget] = useState("$1K-10K");
  const [location, setLocation] = useState("");
  const [experience, setExperience] = useState("first-time");
  const [result, setResult] = useState<ProfileMatchResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleSkill = (skill: string) =>
    setSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill]
    );

  const toggleInterest = (interest: string) =>
    setInterests((prev) =>
      prev.includes(interest)
        ? prev.filter((i) => i !== interest)
        : [...prev, interest]
    );

  const handleSubmit = async () => {
    if (!location.trim()) return;
    setIsLoading(true);
    setError(null);
    setStep(3);

    try {
      const res = await fetch("/api/profile-match", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          skills,
          interests,
          budget,
          location: location.trim(),
          experience,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        let errMsg: string;
        try { errMsg = JSON.parse(errText).error ?? errText; } catch { errMsg = errText; }
        throw new Error(errMsg.slice(0, 200));
      }

      const json = await res.json();
      setResult(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  // Split AI analysis into individual idea blocks
  const parseIdeas = (text: string): string[] => {
    // Split on numbered items like "1.", "2.", etc. followed by bold text
    const blocks = text
      .split(/\n(?=\d+\.\s)/m)
      .map((b) => b.trim())
      .filter(Boolean);

    // Fallback: split on double newlines if numbered parsing fails
    if (blocks.length <= 1) {
      return text
        .split(/\n{2,}/)
        .map((b) => b.trim())
        .filter(Boolean);
    }

    return blocks;
  };

  const handleReset = () => {
    setResult(null);
    setStep(0);
    setSkills([]);
    setInterests([]);
    setBudget("$1K-10K");
    setLocation("");
    setExperience("first-time");
    setError(null);
  };

  return (
    <div className="space-y-5">
      {/* Header card */}
      <div className="glass gradient-border rounded-xl p-5">
        {/* Title */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600">
            <Brain className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Founder Profile Match</h2>
            <p className="text-[10px] text-muted-foreground">
              Answer 3 quick questions — AI matches you with your best startup opportunities
            </p>
          </div>
        </div>

        <ProgressBar step={step} />

        {/* Step 1: Skills */}
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">What are your skills?</h3>
              <p className="text-[10px] text-muted-foreground mb-3">
                Select all that apply — this helps us match ideas you can actually execute.
              </p>
              <TagGrid options={SKILLS} selected={skills} onToggle={toggleSkill} />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 text-white text-xs font-semibold transition-colors"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Interests */}
        {step === 1 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">What sectors excite you?</h3>
              <p className="text-[10px] text-muted-foreground mb-3">
                Pick the areas you&apos;d be passionate about building in.
              </p>
              <TagGrid
                options={INTERESTS}
                selected={interests}
                onToggle={toggleInterest}
              />
            </div>
            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(0)}
                className="px-4 py-2 rounded-lg glass border border-white/10 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={interests.length === 0}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-colors"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Resources */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-semibold mb-1">Your resources &amp; background</h3>
              <p className="text-[10px] text-muted-foreground mb-3">
                Helps us recommend realistic opportunities given your constraints.
              </p>
              <div className="space-y-3">
                {/* Budget */}
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Available Budget
                  </label>
                  <select
                    value={budget}
                    onChange={(e) => setBudget(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {BUDGET_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Your Location
                  </label>
                  <input
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. India, US, Germany"
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-indigo-500 transition-colors"
                  />
                </div>

                {/* Experience */}
                <div>
                  <label className="mb-1 block text-[10px] font-medium text-muted-foreground uppercase tracking-wide">
                    Founder Experience
                  </label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-xs text-foreground focus:outline-none focus:border-indigo-500 transition-colors"
                  >
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-4 py-2 rounded-lg glass border border-white/10 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!location.trim()}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-semibold transition-all"
              >
                <Sparkles className="h-3.5 w-3.5" />
                Find My Ideas
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Results */}
        {step === 3 && (
          <div className="space-y-4">
            {isLoading && (
              <div className="flex flex-col items-center gap-3 py-8">
                <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                <p className="text-sm text-muted-foreground">
                  Analyzing your profile &amp; live market signals…
                </p>
                <p className="text-[10px] text-muted-foreground/60">
                  This can take up to 30 seconds
                </p>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 rounded-lg bg-red-500/10 border border-red-500/20 p-3">
                <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-medium text-red-400">Match failed</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">{error}</p>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="mt-2 text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Go back and try again
                  </button>
                </div>
              </div>
            )}

            {result && !isLoading && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold">Your Top 5 Startup Ideas</h3>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="text-[10px] text-indigo-400 hover:text-indigo-300 underline"
                  >
                    Start over
                  </button>
                </div>

                {/* Profile summary pills */}
                <div className="flex flex-wrap gap-1.5">
                  {[
                    result.profile.budget,
                    result.profile.location,
                    result.profile.experience,
                  ].map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] text-indigo-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Idea cards */}
                <div className="space-y-2">
                  {parseIdeas(result.aiAnalysis).map((idea, index) => (
                    <IdeaCard key={index} content={idea} index={index} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
