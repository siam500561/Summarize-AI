"use client";

import { Button } from "@/components/ui/button";
import { useSession } from "@/lib/auth-client";
import { Menu, Sparkles, X, Zap } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How it Works" },
  { href: "#pricing", label: "Pricing" },
];

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { data: session, isPending } = useSession();

  const isLoggedIn = !!session?.user;

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <div className="mx-auto max-w-7xl px-6 py-4">
        <div className="flex items-center justify-between rounded-2xl bg-background/80 backdrop-blur-xl border border-border/50 px-6 py-3 shadow-lg shadow-black/5">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              SummarizeAI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {isPending ? (
              // Skeleton loader while session is loading - prevents flash
              <div className="flex items-center gap-3">
                <div className="h-8 w-16 rounded-md bg-muted animate-pulse" />
                <div className="h-8 w-24 rounded-lg bg-muted animate-pulse" />
              </div>
            ) : isLoggedIn ? (
              // Logged in - show Summarize button
              <Button
                size="sm"
                className="rounded-lg font-medium gap-2"
                asChild
              >
                <Link href="/summarize">
                  <Zap className="w-4 h-4" />
                  Summarize
                </Link>
              </Button>
            ) : (
              // Not logged in - show auth buttons
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="font-medium"
                  asChild
                >
                  <Link href="/login">Log In</Link>
                </Button>
                <Button size="sm" className="rounded-lg font-medium" asChild>
                  <Link href="/signup">Sign Up Free</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-secondary transition-colors"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="md:hidden mt-2 rounded-2xl bg-background/95 backdrop-blur-xl border border-border/50 p-6 shadow-lg"
          >
            <nav className="flex flex-col gap-4 mb-6">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <div className="flex flex-col gap-3">
              {isPending ? (
                // Skeleton loader while session is loading
                <>
                  <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
                  <div className="h-10 w-full rounded-md bg-muted animate-pulse" />
                </>
              ) : isLoggedIn ? (
                // Logged in - show Summarize button
                <Button className="w-full font-medium gap-2" asChild>
                  <Link href="/summarize">
                    <Zap className="w-4 h-4" />
                    Summarize Now
                  </Link>
                </Button>
              ) : (
                // Not logged in - show auth buttons
                <>
                  <Button
                    variant="outline"
                    className="w-full font-medium"
                    asChild
                  >
                    <Link href="/login">Log In</Link>
                  </Button>
                  <Button className="w-full font-medium" asChild>
                    <Link href="/signup">Sign Up Free</Link>
                  </Button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.header>
  );
}
