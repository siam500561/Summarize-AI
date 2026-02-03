"use client";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  Copy,
  FileText,
  RotateCcw,
  Sparkles,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

interface SummaryStats {
  originalWords: number;
  summaryWords: number;
  reductionPercent: number;
  estimatedReadingTimeSaved: number;
}

export default function SummarizePage() {
  const [inputText, setInputText] = useState("");
  const [summary, setSummary] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SummaryStats | null>(null);
  const [summaryLength, setSummaryLength] = useState<
    "short" | "medium" | "long"
  >("medium");

  const handleSummarize = async () => {
    if (!inputText.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_URL}/api/summarize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          text: inputText.trim(),
          length: summaryLength,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to summarize text");
      }

      if (!data.success) {
        throw new Error(data.error || "Failed to summarize text");
      }

      setSummary(data.data.summary);
      setStats(data.data.stats);
    } catch (err) {
      console.error("Summarization error:", err);
      setError(
        err instanceof Error ? err.message : "An unexpected error occurred",
      );
      setSummary("");
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    setInputText("");
    setSummary("");
    setError(null);
    setStats(null);
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;

  return (
    <div className="h-screen bg-background flex flex-col overflow-hidden">
      {/* Subtle Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_-20%,#000_70%,transparent_110%)]" />
        <motion.div
          animate={{
            scale: [1, 1.1, 1],
            opacity: [0.15, 0.25, 0.15],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute top-0 left-1/3 w-150 h-150 bg-primary/10 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.1, 1, 1.1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 12,
            repeat: Infinity,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 right-1/3 w-125 h-125 bg-primary/10 rounded-full blur-3xl"
        />
      </div>

      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="shrink-0 backdrop-blur-xl bg-background/80 border-b border-border/50"
      >
        <div className="container mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/">
            <Button variant="ghost" size="sm" className="gap-2">
              <ArrowLeft className="size-4" />
              <span className="hidden sm:inline">Back to Home</span>
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
              <Sparkles className="size-5 text-primary" />
            </motion.div>
            <span className="font-semibold">AI Summarizer</span>
          </div>
          <div className="w-25" />
        </div>
      </motion.header>

      {/* Main Content - Flex container */}
      <main className="flex-1 flex flex-col container mx-auto px-6 py-6 min-h-0">
        {/* Title Section */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-center shrink-0 mb-4"
        >
          <h1 className="text-2xl sm:text-3xl font-bold">
            Transform Your Text Into{" "}
            <span className="text-primary">Concise Summaries</span>
          </h1>
        </motion.div>

        {/* Summary Length Selector */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="flex justify-center shrink-0 mb-5"
        >
          <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/50">
            {(["short", "medium", "long"] as const).map((length) => (
              <motion.button
                key={length}
                onClick={() => setSummaryLength(length)}
                className={`relative px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  summaryLength === length
                    ? "text-primary-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {summaryLength === length && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-primary rounded-lg"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}
                <span className="relative z-10 capitalize">{length}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Main Grid - Takes remaining space */}
        <div className="flex-1 grid lg:grid-cols-2 gap-5 min-h-0">
          {/* Input Section */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="relative group flex flex-col min-h-0"
          >
            <div className="absolute -inset-0.5 bg-primary/30 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative bg-card border border-border/50 rounded-2xl p-5 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="size-3.5 text-primary" />
                  </div>
                  <span className="font-medium text-sm">Your Text</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {wordCount} words • {charCount} chars
                </div>
              </div>

              <Textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Paste your article, document, or any text you want to summarize..."
                className="flex-1 resize-none bg-transparent border-0 focus-visible:ring-0 focus-visible:border-0 shadow-none p-0 text-sm leading-relaxed min-h-0"
              />

              <div className="flex items-center gap-2 mt-3 pt-3 border-t border-border/50 shrink-0">
                <Button
                  onClick={handleSummarize}
                  disabled={!inputText.trim() || isLoading}
                  className="flex-1 h-10 gap-2"
                >
                  {isLoading ? (
                    <>
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          ease: "linear",
                        }}
                      >
                        <Sparkles className="size-4" />
                      </motion.div>
                      Summarizing...
                    </>
                  ) : (
                    <>
                      <Zap className="size-4" />
                      Summarize
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleReset}
                  className="h-10 w-10 shrink-0"
                  disabled={!inputText && !summary}
                >
                  <RotateCcw className="size-4" />
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Output Section */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.25 }}
            className="relative group flex flex-col min-h-0"
          >
            <div className="absolute -inset-0.5 bg-primary/30 rounded-2xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500" />
            <div className="relative bg-card border border-border/50 rounded-2xl p-5 flex-1 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-3 shrink-0">
                <div className="flex items-center gap-2">
                  <div className="size-7 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Sparkles className="size-3.5 text-primary" />
                  </div>
                  <span className="font-medium text-sm">AI Summary</span>
                </div>
                <AnimatePresence>
                  {summary && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.8 }}
                    >
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCopy}
                        className="h-7 gap-1.5 text-xs"
                      >
                        {copied ? (
                          <>
                            <Check className="size-3" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="size-3" />
                            Copy
                          </>
                        )}
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 relative min-h-0 overflow-auto">
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.div
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="text-center">
                        <div className="relative">
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{
                              duration: 1.5,
                              repeat: Infinity,
                              ease: "linear",
                            }}
                            className="size-12 rounded-full border-2 border-primary/20 border-t-primary mx-auto"
                          />
                          <motion.div
                            animate={{ scale: [1, 1.2, 1] }}
                            transition={{ duration: 1, repeat: Infinity }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <Sparkles className="size-5 text-primary" />
                          </motion.div>
                        </div>
                        <motion.p
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="mt-3 text-sm text-muted-foreground"
                        >
                          Analyzing your text...
                        </motion.p>
                      </div>
                    </motion.div>
                  ) : summary ? (
                    <motion.div
                      key="summary"
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -15 }}
                      transition={{ duration: 0.4 }}
                      className="h-full flex flex-col"
                    >
                      <p className="text-foreground text-sm leading-relaxed flex-1">
                        {summary}
                      </p>
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="mt-4 pt-3 border-t border-border/50 flex items-center gap-2 text-muted-foreground shrink-0"
                      >
                        <Check className="size-4 text-primary" />
                        <span className="text-xs">
                          {stats ? (
                            <>
                              Reduced by {stats.reductionPercent}% • Saved ~
                              {stats.estimatedReadingTimeSaved} min reading time
                            </>
                          ) : (
                            "Summary generated successfully"
                          )}
                        </span>
                      </motion.div>
                    </motion.div>
                  ) : error ? (
                    <motion.div
                      key="error"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="text-center">
                        <div className="size-16 rounded-xl bg-destructive/10 mx-auto flex items-center justify-center mb-3">
                          <AlertCircle className="size-8 text-destructive" />
                        </div>
                        <p className="text-sm text-destructive font-medium">
                          {error}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Please try again
                        </p>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="empty"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <div className="text-center">
                        <motion.div
                          animate={{ y: [0, -8, 0] }}
                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut",
                          }}
                          className="size-16 rounded-xl bg-muted/50 mx-auto flex items-center justify-center mb-3"
                        >
                          <FileText className="size-8 text-muted-foreground/40" />
                        </motion.div>
                        <p className="text-sm text-muted-foreground">
                          Your summary will appear here
                        </p>
                        <p className="text-xs text-muted-foreground/60 mt-1">
                          Paste text and click &quot;Summarize&quot;
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        </div>
      </main>
    </div>
  );
}
