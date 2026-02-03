"use client";

import { Brain, Clock, FileText, Globe, Shield, Zap } from "lucide-react";
import { motion } from "motion/react";

const features = [
  {
    icon: Brain,
    title: "Advanced AI Understanding",
    description:
      "Our AI comprehends context, tone, and nuance to deliver summaries that capture the essence of your content.",
  },
  {
    icon: Zap,
    title: "Lightning Fast",
    description:
      "Get your summaries in seconds, not minutes. Process thousands of words instantly with our optimized engine.",
  },
  {
    icon: Shield,
    title: "Privacy First",
    description:
      "Your data is encrypted and never stored. We process your content securely and forget it immediately.",
  },
  {
    icon: Globe,
    title: "Multi-Language Support",
    description:
      "Summarize content in 50+ languages. Break down language barriers with accurate translations.",
  },
  {
    icon: Clock,
    title: "Save Hours Daily",
    description:
      "Cut through information overload. Read summaries instead of full documents and reclaim your time.",
  },
  {
    icon: FileText,
    title: "Multiple Formats",
    description:
      "Upload PDFs, paste URLs, or type directly. We handle all your content formats seamlessly.",
  },
];

export function Features() {
  return (
    <section id="features" className="py-24 bg-secondary/30">
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
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold mt-4 mb-6 text-foreground">
            Everything You Need to{" "}
            <span className="text-primary">Summarize Smarter</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Powerful features designed to help you extract insights from any
            content in seconds.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="group p-8 rounded-2xl bg-background border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center mb-6 group-hover:bg-primary/10 transition-colors">
                <feature.icon className="w-7 h-7 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-muted-foreground leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
