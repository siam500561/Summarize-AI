"use client";

import { Cpu, FileCheck, Upload } from "lucide-react";
import { motion } from "motion/react";

const steps = [
  {
    icon: Upload,
    step: "01",
    title: "Paste or Upload",
    description:
      "Drop your text, paste a URL, or upload a document. We accept PDFs, articles, and raw text.",
  },
  {
    icon: Cpu,
    step: "02",
    title: "AI Processing",
    description:
      "Our advanced AI analyzes the content, identifies key points, and understands context.",
  },
  {
    icon: FileCheck,
    step: "03",
    title: "Get Your Summary",
    description:
      "Receive a clear, concise summary in seconds. Copy, share, or export as needed.",
  },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 bg-background">
      <div className="container mx-auto px-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="text-sm font-semibold text-primary uppercase tracking-wider">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-foreground">
            Three Simple Steps to{" "}
            <span className="text-primary">Clear Summaries</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            No complicated setup. Just paste your content and let our AI do the
            heavy lifting.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {/* Connection Line */}
          <div className="hidden md:block absolute top-24 left-1/4 right-1/4 h-0.5 bg-border" />

          {steps.map((item, index) => (
            <motion.div
              key={item.step}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative text-center"
            >
              {/* Step Number Background */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                className="relative mx-auto w-20 h-20 rounded-2xl bg-primary flex items-center justify-center mb-8 shadow-lg"
              >
                <item.icon className="w-9 h-9 text-primary-foreground" />
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-lg bg-background border-2 border-primary flex items-center justify-center text-sm font-bold text-primary">
                  {item.step}
                </div>
              </motion.div>

              <h3 className="text-2xl font-semibold mb-4 text-foreground">
                {item.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
                {item.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
