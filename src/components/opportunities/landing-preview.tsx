"use client";

import { AlertTriangle, Copy, Layout, Loader2 } from "lucide-react";
import { type FormEvent, useState } from "react";
import type { LandingPageData } from "@/app/api/landing/route";

function buildFullHTML(data: LandingPageData): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${data.companyName}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box;}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#0a0a0f;color:#e8e8f0;}
.hero{background:linear-gradient(135deg,#1a0533 0%,#0d1a3a 50%,#0a0a1a 100%);padding:80px 20px;text-align:center;}
.hero h1{font-size:2.8rem;font-weight:800;background:linear-gradient(90deg,#f472b6,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;line-height:1.2;margin-bottom:16px;}
.hero p{font-size:1.1rem;color:#a0a0c0;max-width:600px;margin:0 auto 32px;line-height:1.7;}
.cta-btn{display:inline-block;padding:14px 36px;border-radius:50px;background:linear-gradient(90deg,#ec4899,#8b5cf6);color:#fff;font-weight:700;font-size:1rem;text-decoration:none;cursor:pointer;border:none;}
.tagline-badge{display:inline-block;margin-bottom:20px;padding:6px 18px;border-radius:50px;background:rgba(236,72,153,0.15);border:1px solid rgba(236,72,153,0.3);color:#f472b6;font-size:0.85rem;font-weight:600;}
.features{padding:70px 20px;background:#0d0d18;}
.features h2{text-align:center;font-size:1.8rem;font-weight:700;margin-bottom:10px;color:#f0f0ff;}
.features-subtitle{text-align:center;color:#6b7280;margin-bottom:48px;font-size:0.95rem;}
.features-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:24px;max-width:900px;margin:0 auto;}
.feature-card{background:rgba(255,255,255,0.04);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:28px 24px;}
.feature-icon{font-size:2rem;margin-bottom:14px;}
.feature-card h3{font-size:1rem;font-weight:700;margin-bottom:8px;color:#e8e8f0;}
.feature-card p{font-size:0.875rem;color:#7878a0;line-height:1.6;}
.how-it-works{padding:70px 20px;background:#080810;}
.how-it-works h2{text-align:center;font-size:1.8rem;font-weight:700;margin-bottom:48px;color:#f0f0ff;}
.steps{display:flex;flex-direction:column;gap:24px;max-width:700px;margin:0 auto;}
.step{display:flex;align-items:flex-start;gap:20px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.07);border-radius:14px;padding:24px;}
.step-num{flex-shrink:0;width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#ec4899,#8b5cf6);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:1rem;color:#fff;}
.step-content h3{font-size:1rem;font-weight:700;margin-bottom:6px;color:#e8e8f0;}
.step-content p{font-size:0.875rem;color:#7878a0;line-height:1.6;}
.social-proof{padding:48px 20px;background:linear-gradient(135deg,rgba(236,72,153,0.12),rgba(139,92,246,0.12));border-top:1px solid rgba(255,255,255,0.06);border-bottom:1px solid rgba(255,255,255,0.06);text-align:center;}
.social-proof p{font-size:1.3rem;font-weight:700;color:#f0f0ff;max-width:700px;margin:0 auto;line-height:1.5;}
.faq{padding:70px 20px;background:#0d0d18;}
.faq h2{text-align:center;font-size:1.8rem;font-weight:700;margin-bottom:48px;color:#f0f0ff;}
.faq-list{max-width:700px;margin:0 auto;display:flex;flex-direction:column;gap:16px;}
.faq-item{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px 24px;}
.faq-item h4{font-size:0.95rem;font-weight:700;margin-bottom:10px;color:#e8e8f0;}
.faq-item p{font-size:0.875rem;color:#7878a0;line-height:1.6;}
footer{padding:40px 20px;background:#060609;text-align:center;border-top:1px solid rgba(255,255,255,0.06);}
footer .logo{font-size:1.2rem;font-weight:800;background:linear-gradient(90deg,#f472b6,#a78bfa);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:10px;}
footer p{font-size:0.85rem;color:#4a4a6a;}
</style>
</head>
<body>
<div class="hero">
  <div class="tagline-badge">${data.tagline}</div>
  <h1>${data.heroHeadline}</h1>
  <p>${data.heroSubtext}</p>
  <button class="cta-btn">${data.ctaButton}</button>
</div>
<div class="features">
  <h2>Everything you need</h2>
  <p class="features-subtitle">Powerful features built for modern teams</p>
  <div class="features-grid">
    ${data.features
      .map(
        (f) => `<div class="feature-card">
      <div class="feature-icon">${f.icon}</div>
      <h3>${f.title}</h3>
      <p>${f.description}</p>
    </div>`
      )
      .join("")}
  </div>
</div>
<div class="how-it-works">
  <h2>How it works</h2>
  <div class="steps">
    ${data.howItWorks
      .map(
        (s) => `<div class="step">
      <div class="step-num">${s.step}</div>
      <div class="step-content">
        <h3>${s.title}</h3>
        <p>${s.description}</p>
      </div>
    </div>`
      )
      .join("")}
  </div>
</div>
<div class="social-proof">
  <p>"${data.socialProof}"</p>
</div>
<div class="faq">
  <h2>Frequently Asked Questions</h2>
  <div class="faq-list">
    ${data.faqItems
      .map(
        (faq) => `<div class="faq-item">
      <h4>${faq.question}</h4>
      <p>${faq.answer}</p>
    </div>`
      )
      .join("")}
  </div>
</div>
<footer>
  <div class="logo">${data.companyName}</div>
  <p>${data.footerTagline}</p>
</footer>
</body>
</html>`;
}

function LandingPreviewContent({ data }: { data: LandingPageData }) {
  const [copied, setCopied] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleCopyHTML = async () => {
    try {
      const html = buildFullHTML(data);
      await navigator.clipboard.writeText(html);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: create textarea
      const html = buildFullHTML(data);
      const textarea = document.createElement("textarea");
      textarea.value = html;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand("copy");
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-3">
      {/* Header bar with copy button */}
      <div className="flex items-center justify-between">
        <p className="text-[11px] text-muted-foreground">
          Live preview — generated landing page
        </p>
        <button
          onClick={handleCopyHTML}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] text-foreground/80 transition-colors hover:bg-white/[0.08]"
        >
          <Copy className="h-3 w-3" />
          {copied ? "Copied!" : "Copy HTML"}
        </button>
      </div>

      {/* Browser-like frame */}
      <div className="overflow-hidden rounded-xl border border-white/10 shadow-2xl">
        {/* Browser chrome */}
        <div className="flex items-center gap-3 border-b border-white/10 bg-white/[0.04] px-4 py-2.5">
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/70" />
            <div className="h-3 w-3 rounded-full bg-yellow-500/70" />
            <div className="h-3 w-3 rounded-full bg-green-500/70" />
          </div>
          {/* URL bar */}
          <div className="flex flex-1 items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-3 py-1">
            <span className="text-2xs text-green-400">&#9679;</span>
            <span className="text-[11px] text-muted-foreground">
              {data.companyName.toLowerCase().replace(/\s+/g, "")}.com
            </span>
          </div>
        </div>

        {/* Page content — scrollable */}
        <div
          className="overflow-y-auto max-h-[600px]"
          style={{ background: "#0a0a0f" }}
        >
          {/* Hero */}
          <div
            style={{
              background:
                "linear-gradient(135deg,#1a0533 0%,#0d1a3a 50%,#0a0a1a 100%)",
              padding: "60px 32px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                display: "inline-block",
                marginBottom: "16px",
                padding: "5px 16px",
                borderRadius: "50px",
                background: "rgba(236,72,153,0.15)",
                border: "1px solid rgba(236,72,153,0.3)",
                color: "#f472b6",
                fontSize: "12px",
                fontWeight: 600,
              }}
            >
              {data.tagline}
            </div>
            <h1
              style={{
                fontSize: "clamp(1.4rem,4vw,2.2rem)",
                fontWeight: 800,
                background: "linear-gradient(90deg,#f472b6,#a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                lineHeight: 1.2,
                marginBottom: "14px",
              }}
            >
              {data.heroHeadline}
            </h1>
            <p
              style={{
                fontSize: "13px",
                color: "#a0a0c0",
                maxWidth: "520px",
                margin: "0 auto 24px",
                lineHeight: 1.7,
              }}
            >
              {data.heroSubtext}
            </p>
            <button
              style={{
                padding: "11px 30px",
                borderRadius: "50px",
                background: "linear-gradient(90deg,#ec4899,#8b5cf6)",
                color: "#fff",
                fontWeight: 700,
                fontSize: "13px",
                border: "none",
                cursor: "default",
              }}
            >
              {data.ctaButton}
            </button>
          </div>

          {/* Features */}
          <div style={{ padding: "52px 32px", background: "#0d0d18" }}>
            <h2
              style={{
                textAlign: "center",
                fontSize: "1.4rem",
                fontWeight: 700,
                marginBottom: "8px",
                color: "#f0f0ff",
              }}
            >
              Everything you need
            </h2>
            <p
              style={{
                textAlign: "center",
                color: "#6b7280",
                marginBottom: "36px",
                fontSize: "12px",
              }}
            >
              Powerful features built for modern teams
            </p>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3,1fr)",
                gap: "16px",
                maxWidth: "860px",
                margin: "0 auto",
              }}
            >
              {data.features.map((f, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.04)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: "14px",
                    padding: "22px 18px",
                  }}
                >
                  <div style={{ fontSize: "1.6rem", marginBottom: "12px" }}>
                    {f.icon}
                  </div>
                  <h3
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      marginBottom: "6px",
                      color: "#e8e8f0",
                    }}
                  >
                    {f.title}
                  </h3>
                  <p
                    style={{ fontSize: "12px", color: "#7878a0", lineHeight: 1.6 }}
                  >
                    {f.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* How it works */}
          <div style={{ padding: "52px 32px", background: "#080810" }}>
            <h2
              style={{
                textAlign: "center",
                fontSize: "1.4rem",
                fontWeight: 700,
                marginBottom: "36px",
                color: "#f0f0ff",
              }}
            >
              How it works
            </h2>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "16px",
                maxWidth: "660px",
                margin: "0 auto",
              }}
            >
              {data.howItWorks.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "16px",
                    background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    borderRadius: "12px",
                    padding: "20px",
                  }}
                >
                  <div
                    style={{
                      flexShrink: 0,
                      width: "36px",
                      height: "36px",
                      borderRadius: "50%",
                      background: "linear-gradient(135deg,#ec4899,#8b5cf6)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 800,
                      fontSize: "13px",
                      color: "#fff",
                    }}
                  >
                    {s.step}
                  </div>
                  <div>
                    <h3
                      style={{
                        fontSize: "13px",
                        fontWeight: 700,
                        marginBottom: "5px",
                        color: "#e8e8f0",
                      }}
                    >
                      {s.title}
                    </h3>
                    <p
                      style={{ fontSize: "12px", color: "#7878a0", lineHeight: 1.6 }}
                    >
                      {s.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Social proof */}
          <div
            style={{
              padding: "40px 32px",
              background:
                "linear-gradient(135deg,rgba(236,72,153,0.10),rgba(139,92,246,0.10))",
              borderTop: "1px solid rgba(255,255,255,0.06)",
              borderBottom: "1px solid rgba(255,255,255,0.06)",
              textAlign: "center",
            }}
          >
            <p
              style={{
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#f0f0ff",
                maxWidth: "620px",
                margin: "0 auto",
                lineHeight: 1.5,
              }}
            >
              &ldquo;{data.socialProof}&rdquo;
            </p>
          </div>

          {/* FAQ */}
          <div style={{ padding: "52px 32px", background: "#0d0d18" }}>
            <h2
              style={{
                textAlign: "center",
                fontSize: "1.4rem",
                fontWeight: 700,
                marginBottom: "36px",
                color: "#f0f0ff",
              }}
            >
              Frequently Asked Questions
            </h2>
            <div
              style={{
                maxWidth: "660px",
                margin: "0 auto",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              {data.faqItems.map((faq, i) => (
                <div
                  key={i}
                  style={{
                    background: "rgba(255,255,255,0.03)",
                    border: `1px solid ${openFaq === i ? "rgba(236,72,153,0.35)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "12px",
                    overflow: "hidden",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      width: "100%",
                      textAlign: "left",
                      padding: "16px 20px",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      color: "#e8e8f0",
                      fontSize: "13px",
                      fontWeight: 700,
                    }}
                  >
                    {faq.question}
                    <span
                      style={{
                        fontSize: "18px",
                        color: "#f472b6",
                        flexShrink: 0,
                        marginLeft: "12px",
                        display: "inline-block",
                        transform: openFaq === i ? "rotate(45deg)" : "rotate(0deg)",
                        transition: "transform 0.2s",
                      }}
                    >
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div
                      style={{
                        padding: "0 20px 16px",
                        fontSize: "12px",
                        color: "#7878a0",
                        lineHeight: 1.7,
                        borderTop: "1px solid rgba(255,255,255,0.06)",
                      }}
                    >
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Footer */}
          <div
            style={{
              padding: "32px",
              background: "#060609",
              textAlign: "center",
              borderTop: "1px solid rgba(255,255,255,0.06)",
            }}
          >
            <div
              style={{
                fontSize: "1rem",
                fontWeight: 800,
                background: "linear-gradient(90deg,#f472b6,#a78bfa)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                marginBottom: "8px",
              }}
            >
              {data.companyName}
            </div>
            <p style={{ fontSize: "12px", color: "#4a4a6a" }}>
              {data.footerTagline}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function LandingPreview() {
  const [idea, setIdea] = useState("");
  const [name, setName] = useState("");
  const [result, setResult] = useState<LandingPageData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async (e: FormEvent) => {
    e.preventDefault();
    if (!idea.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          name: name.trim() || undefined,
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
      setError(err instanceof Error ? err.message : "Landing page generation failed. Check your API key or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Input Section */}
      <div className="glass gradient-border rounded-xl p-5">
        <div className="flex items-center gap-2 mb-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-rose-600">
            <Layout className="h-4 w-4 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold">Landing Page Generator</h2>
            <p className="text-2xs text-muted-foreground">
              Describe your startup idea — get a fully designed landing page
              preview in seconds
            </p>
          </div>
        </div>

        <form onSubmit={handleGenerate} className="space-y-3">
          <textarea
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            placeholder="e.g. An AI tool that automatically rewrites job descriptions to attract more diverse candidates..."
            rows={3}
            className="w-full rounded-lg border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-pink-500/30 focus:outline-none resize-none"
          />

          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Company name (optional — AI will generate one)"
            className="w-full h-9 rounded-lg border border-white/10 bg-white/[0.03] px-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-pink-500/30 focus:outline-none"
          />

          <button
            type="submit"
            disabled={!idea.trim() || isLoading}
            className="flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-pink-500 to-rose-600 px-5 text-sm font-medium text-white transition-opacity disabled:opacity-40"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Crafting your landing page...
              </>
            ) : (
              <>
                <Layout className="h-4 w-4" />
                Generate Landing Page
              </>
            )}
          </button>
        </form>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-red-500/10 px-3 py-2 text-[11px] text-red-400">
            <AlertTriangle className="h-3.5 w-3.5" />
            {error}
          </div>
        )}
      </div>

      {/* Preview Section */}
      {result && (
        <div className="animate-fade-in-up">
          <LandingPreviewContent data={result} />
        </div>
      )}
    </div>
  );
}
