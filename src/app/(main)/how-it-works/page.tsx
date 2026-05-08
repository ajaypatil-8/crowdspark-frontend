"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  ArrowRight,
  BadgeCheck,
  Bell,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  Gift,
  HeartHandshake,
  IndianRupee,
  Lightbulb,
  LockKeyhole,
  Megaphone,
  Rocket,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  Users,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { useTheme } from "@/contexts/ThemeContext";

gsap.registerPlugin(ScrollTrigger);

type FlowKey = "creator" | "backer";

type JourneyStep = {
  title: string;
  eyebrow: string;
  body: string;
  detail: string;
  color: string;
  Icon: LucideIcon;
};

type FeatureCard = {
  title: string;
  body: string;
  color: string;
  Icon: LucideIcon;
};

const CREATOR_STEPS: JourneyStep[] = [
  {
    title: "Shape your idea",
    eyebrow: "Start with a story",
    body: "Turn your plan into a clear campaign with a goal, deadline, category, location, and a reason people can believe in.",
    detail: "Add photos, videos, and the details that make your project feel real.",
    color: "#ff7a00",
    Icon: Lightbulb,
  },
  {
    title: "Get creator-ready",
    eyebrow: "Build trust first",
    body: "Complete the creator checks in your dashboard so backers know there is a real person behind the campaign.",
    detail: "You will be guided through the required identity and payout information.",
    color: "#00b89c",
    Icon: ShieldCheck,
  },
  {
    title: "Design rewards",
    eyebrow: "Give backers a reason",
    body: "Create simple pledge tiers, thank-you perks, early access, credits, invites, or product rewards that match your idea.",
    detail: "Each reward can have its own pledge amount and description.",
    color: "#8b5cf6",
    Icon: Gift,
  },
  {
    title: "Submit for review",
    eyebrow: "Quality check",
    body: "CrowdSpark reviews campaigns before they appear publicly, helping keep the platform safer and more trustworthy.",
    detail: "If anything needs work, you can improve it and come back stronger.",
    color: "#60a5fa",
    Icon: ClipboardCheck,
  },
  {
    title: "Launch and rally support",
    eyebrow: "Go live",
    body: "Share your campaign, answer questions, post updates, and keep your community close as pledges come in.",
    detail: "Your dashboard helps you follow progress and backer activity.",
    color: "#ec4899",
    Icon: Megaphone,
  },
];

const BACKER_STEPS: JourneyStep[] = [
  {
    title: "Explore fresh ideas",
    eyebrow: "Find your spark",
    body: "Browse live campaigns across categories and discover creators building products, causes, art, tools, and local ideas.",
    detail: "Use Explore to scan progress, time left, goals, and featured campaigns.",
    color: "#00b89c",
    Icon: Compass,
  },
  {
    title: "Read before you back",
    eyebrow: "Know the story",
    body: "Open a campaign to understand the creator, their plan, funding goal, media, timeline, and available rewards.",
    detail: "A strong campaign page should answer what is being built and why it matters.",
    color: "#60a5fa",
    Icon: Search,
  },
  {
    title: "Choose your pledge",
    eyebrow: "Support your way",
    body: "Back the project with any eligible amount or select a reward tier that fits how you want to participate.",
    detail: "You can include a message to cheer on the creator.",
    color: "#f59e0b",
    Icon: IndianRupee,
  },
  {
    title: "Follow the journey",
    eyebrow: "Stay connected",
    body: "After backing, keep track of the campaigns you supported and watch the creator share progress over time.",
    detail: "Your dashboard keeps your backed projects in one place.",
    color: "#ff6b00",
    Icon: Bell,
  },
  {
    title: "Celebrate the outcome",
    eyebrow: "Community wins",
    body: "When a campaign grows, every backer becomes part of the momentum that helped an idea leave the notebook.",
    detail: "Rewards and updates help keep the connection alive after the pledge.",
    color: "#ec4899",
    Icon: Star,
  },
];

const TRUST_CARDS: FeatureCard[] = [
  {
    title: "Creators are guided before launch",
    body: "Creator checks, campaign review, and structured campaign fields help make every public page easier to trust.",
    color: "#00b89c",
    Icon: BadgeCheck,
  },
  {
    title: "Backers see the important details",
    body: "Goal, progress, story, media, deadline, creator information, and rewards are presented before a pledge is made.",
    color: "#60a5fa",
    Icon: Search,
  },
  {
    title: "Pledges stay clear",
    body: "Reward amounts and campaign limits are shown clearly so supporters understand what they are choosing.",
    color: "#f59e0b",
    Icon: LockKeyhole,
  },
  {
    title: "Progress is easy to follow",
    body: "Creators and backers get dashboard views that keep campaign activity, backed projects, and updates close at hand.",
    color: "#a78bfa",
    Icon: TrendingUp,
  },
];

const PREP_ITEMS = [
  "A crisp title and one-line promise",
  "A realistic funding goal",
  "Photos or videos that show the idea clearly",
  "Reward tiers that are simple to fulfill",
  "A launch message for friends, fans, and early supporters",
];

const BACKER_PREVIEW = [
  { label: "Campaign story", value: "What is being built and why it matters", color: "#00b89c" },
  { label: "Funding progress", value: "Goal, amount raised, and time left", color: "#ff7a00" },
  { label: "Reward choices", value: "Ways to support and what each pledge unlocks", color: "#8b5cf6" },
  { label: "Creator updates", value: "Signals that the project is active and moving", color: "#60a5fa" },
];

function FlowStepCard({ step, index, active }: { step: JourneyStep; index: number; active: boolean }) {
  const Icon = step.Icon;

  return (
    <motion.article
      className="hiw-step-card"
      style={{ "--step-color": step.color } as CSSProperties}
      initial={{ opacity: 0, y: 26, scale: 0.96 }}
      whileInView={{ opacity: 1, y: 0, scale: 1 }}
      viewport={{ once: true, margin: "-90px" }}
      transition={{ duration: 0.55, delay: index * 0.06, ease: [0.22, 1, 0.36, 1] }}
    >
      <span className="hiw-step-number">{String(index + 1).padStart(2, "0")}</span>
      <div className="hiw-step-icon">
        <Icon size={22} strokeWidth={2.3} />
      </div>
      <div>
        <p className="hiw-eyebrow">{step.eyebrow}</p>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
      </div>
      <div className="hiw-step-detail">
        <CheckCircle2 size={15} />
        <span>{step.detail}</span>
      </div>
      {active && <motion.span layoutId="active-step-glow" className="hiw-card-glow" />}
    </motion.article>
  );
}

function TrustCard({ item, index }: { item: FeatureCard; index: number }) {
  const Icon = item.Icon;

  return (
    <motion.article
      className="hiw-trust-card hiw-reveal-card"
      style={{ "--trust-color": item.color } as CSSProperties}
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.05 }}
    >
      <div className="hiw-trust-icon">
        <Icon size={20} />
      </div>
      <h3>{item.title}</h3>
      <p>{item.body}</p>
    </motion.article>
  );
}

function HeroConstellation() {
  const nodes = [
    { label: "Idea", Icon: Lightbulb, color: "#ff7a00", x: "8%", y: "18%" },
    { label: "Trust", Icon: ShieldCheck, color: "#00b89c", x: "67%", y: "13%" },
    { label: "Rewards", Icon: Gift, color: "#8b5cf6", x: "76%", y: "62%" },
    { label: "Backers", Icon: Users, color: "#60a5fa", x: "15%", y: "70%" },
  ];

  return (
    <div className="hiw-hero-art" aria-hidden="true">
      <motion.div
        className="hiw-orbit hiw-orbit-one"
        animate={{ rotate: 360 }}
        transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="hiw-orbit hiw-orbit-two"
        animate={{ rotate: -360 }}
        transition={{ duration: 34, repeat: Infinity, ease: "linear" }}
      />
      <motion.div
        className="hiw-core"
        animate={{ scale: [1, 1.05, 1], y: [0, -8, 0] }}
        transition={{ duration: 4.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <Sparkles size={28} />
        <span>Launch</span>
      </motion.div>
      {nodes.map(({ label, Icon, color, x, y }, index) => (
        <motion.div
          key={label}
          className="hiw-orbit-node"
          style={{ "--node-color": color, left: x, top: y } as CSSProperties}
          animate={{ y: [0, index % 2 ? 12 : -12, 0] }}
          transition={{ duration: 3.6 + index * 0.45, repeat: Infinity, ease: "easeInOut" }}
        >
          <Icon size={18} />
          <span>{label}</span>
        </motion.div>
      ))}
      <motion.div
        className="hiw-mini-card hiw-mini-card-one"
        animate={{ x: [0, 8, 0], y: [0, -8, 0] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
      >
        <Wallet size={16} />
        <div>
          <strong>₹12.4L</strong>
          <span>community pledged</span>
        </div>
      </motion.div>
      <motion.div
        className="hiw-mini-card hiw-mini-card-two"
        animate={{ x: [0, -10, 0], y: [0, 10, 0] }}
        transition={{ duration: 5.6, repeat: Infinity, ease: "easeInOut" }}
      >
        <Rocket size={16} />
        <div>
          <strong>4 steps</strong>
          <span>from draft to launch</span>
        </div>
      </motion.div>
    </div>
  );
}

export default function HowItWorksPage() {
  const { isDark } = useTheme();
  const [activeFlow, setActiveFlow] = useState<FlowKey>("creator");
  const scopeRef = useRef<HTMLDivElement | null>(null);
  const currentSteps = activeFlow === "creator" ? CREATOR_STEPS : BACKER_STEPS;

  useEffect(() => {
    const scope = scopeRef.current;
    if (!scope) return;

    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".hiw-reveal-card").forEach((card) => {
        gsap.fromTo(
          card,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.7,
            ease: "power3.out",
            scrollTrigger: {
              trigger: card,
              start: "top 86%",
            },
          },
        );
      });
    }, scope);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={scopeRef}
      className="hiw-page"
      style={
        {
          "--hiw-bg": isDark ? "#070812" : "#fbfbff",
          "--hiw-surface": isDark ? "rgba(16, 18, 31, 0.78)" : "rgba(255, 255, 255, 0.8)",
          "--hiw-surface-strong": isDark ? "rgba(23, 25, 41, 0.94)" : "rgba(255, 255, 255, 0.94)",
          "--hiw-border": isDark ? "rgba(255, 255, 255, 0.12)" : "rgba(12, 15, 30, 0.1)",
          "--hiw-text": isDark ? "#f8fafc" : "#090a12",
          "--hiw-muted": isDark ? "#aab2c3" : "#667085",
          "--hiw-faint": isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(15, 23, 42, 0.045)",
        } as CSSProperties
      }
    >
      <section className="hiw-hero">
        <div className="hiw-hero-copy">
          <motion.div
            className="hiw-badge"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Sparkles size={16} />
            <span>How CrowdSpark works</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.08 }}
          >
            Ideas meet the people who believe in them.
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.65, delay: 0.16 }}
          >
            CrowdSpark helps creators present meaningful campaigns and gives backers a clear, confident way to support them.
            From the first draft to the final pledge, the experience is built around trust, clarity, and momentum.
          </motion.p>

          <motion.div
            className="hiw-hero-actions"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.24 }}
          >
            <Link href="/dashboard/become-creator" className="hiw-primary-btn">
              <Rocket size={18} />
              Start a campaign
              <ArrowRight size={18} />
            </Link>
            <Link href="/explore" className="hiw-secondary-btn">
              <Compass size={18} />
              Explore projects
            </Link>
          </motion.div>

          <motion.div
            className="hiw-proof-row"
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.55, delay: 0.32 }}
          >
            {[
              ["For creators", "Launch with structure"],
              ["For backers", "Support with confidence"],
              ["For communities", "Turn attention into action"],
            ].map(([label, value]) => (
              <div key={label}>
                <strong>{label}</strong>
                <span>{value}</span>
              </div>
            ))}
          </motion.div>
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 22 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.75, delay: 0.18, ease: [0.22, 1, 0.36, 1] }}
        >
          <HeroConstellation />
        </motion.div>
      </section>

      <section className="hiw-section hiw-path-section">
        <div className="hiw-section-heading">
          <p className="hiw-kicker">Pick your path</p>
          <h2>Two journeys, one shared goal.</h2>
          <p>
            Creators get a guided launch path. Backers get a clean way to discover, understand, and support campaigns that
            feel worth joining.
          </p>
        </div>

        <div className="hiw-flow-switch" role="tablist" aria-label="How CrowdSpark works">
          {[
            { key: "creator" as const, label: "I want to raise funds", Icon: Rocket },
            { key: "backer" as const, label: "I want to support ideas", Icon: HeartHandshake },
          ].map(({ key, label, Icon }) => (
            <button
              key={key}
              type="button"
              role="tab"
              aria-selected={activeFlow === key}
              className={activeFlow === key ? "active" : ""}
              onClick={() => setActiveFlow(key)}
            >
              <Icon size={18} />
              <span>{label}</span>
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={activeFlow}
            className="hiw-steps-grid"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -18 }}
            transition={{ duration: 0.35 }}
          >
            {currentSteps.map((step, index) => (
              <FlowStepCard key={step.title} step={step} index={index} active={index === 0} />
            ))}
          </motion.div>
        </AnimatePresence>
      </section>

      <section className="hiw-section hiw-split-section">
        <motion.div
          className="hiw-launch-panel hiw-reveal-card"
          initial={{ opacity: 0, x: -34 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
        >
          <p className="hiw-kicker">Before you launch</p>
          <h2>A campaign page should make people feel ready to help.</h2>
          <p>
            The best campaigns are specific, visual, honest, and easy to share. CrowdSpark gives creators a structure so
            supporters can quickly understand the idea and decide how they want to join.
          </p>
          <div className="hiw-checklist">
            {PREP_ITEMS.map((item, index) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -18 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: index * 0.05 }}
              >
                <CheckCircle2 size={17} />
                <span>{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div
          className="hiw-preview-stack hiw-reveal-card"
          initial={{ opacity: 0, x: 34 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.65 }}
        >
          <div className="hiw-project-preview">
            <div className="hiw-preview-media">
              <span className="hiw-preview-chip">Live campaign</span>
              <motion.span
                className="hiw-preview-spark"
                animate={{ scale: [1, 1.5, 1], opacity: [0.7, 1, 0.7] }}
                transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
              />
            </div>
            <div className="hiw-preview-body">
              <span>Technology</span>
              <h3>BrainBoost AI Study Partner</h3>
              <p>Helping students turn notes into quizzes, flashcards, and focused revision plans.</p>
              <div className="hiw-progress">
                <span style={{ width: "68%" }} />
              </div>
              <div className="hiw-preview-stats">
                <strong>68% funded</strong>
                <strong>421 backers</strong>
              </div>
            </div>
          </div>
          <div className="hiw-floating-note">
            <Sparkles size={16} />
            <span>Clear stories raise clearer support.</span>
          </div>
        </motion.div>
      </section>

      <section className="hiw-section">
        <div className="hiw-section-heading">
          <p className="hiw-kicker">What backers can expect</p>
          <h2>Everything important, visible before support.</h2>
          <p>
            Backers should not have to guess. Campaign pages are shaped around the information people naturally look for
            before they pledge.
          </p>
        </div>

        <div className="hiw-backer-grid">
          {BACKER_PREVIEW.map((item, index) => (
            <motion.article
              key={item.label}
              className="hiw-backer-card hiw-reveal-card"
              style={{ "--preview-color": item.color } as CSSProperties}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.48, delay: index * 0.05 }}
            >
              <span>{String(index + 1).padStart(2, "0")}</span>
              <h3>{item.label}</h3>
              <p>{item.value}</p>
            </motion.article>
          ))}
        </div>
      </section>

      <section className="hiw-section">
        <div className="hiw-section-heading">
          <p className="hiw-kicker">Trust by design</p>
          <h2>Colorful on the surface. Careful underneath.</h2>
          <p>
            CrowdSpark is designed so creators can ask boldly and backers can support thoughtfully, with the right checks
            and information in the right places.
          </p>
        </div>

        <div className="hiw-trust-grid">
          {TRUST_CARDS.map((item, index) => (
            <TrustCard key={item.title} item={item} index={index} />
          ))}
        </div>
      </section>

      <section className="hiw-cta">
        <motion.div
          className="hiw-cta-inner"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-90px" }}
          transition={{ duration: 0.65 }}
        >
          <p className="hiw-kicker">Ready when you are</p>
          <h2>Start with a spark. Build with a crowd.</h2>
          <p>
            Whether you are raising for a bold new idea or backing one before the world notices, CrowdSpark gives the
            journey a place to begin.
          </p>
          <div className="hiw-cta-actions">
            <Link href="/dashboard/become-creator" className="hiw-primary-btn">
              <Rocket size={18} />
              Start a campaign
              <ArrowRight size={18} />
            </Link>
            <Link href="/explore" className="hiw-secondary-btn hiw-secondary-dark">
              <Compass size={18} />
              Browse campaigns
            </Link>
          </div>
        </motion.div>
      </section>

      <style>{`
        .hiw-page {
          position: relative;
          min-height: 100vh;
          overflow: hidden;
          background:
            linear-gradient(115deg, rgba(255, 122, 0, 0.1), transparent 28%),
            linear-gradient(245deg, rgba(0, 184, 156, 0.12), transparent 32%),
            linear-gradient(180deg, transparent 0%, rgba(139, 92, 246, 0.08) 58%, transparent 100%),
            var(--hiw-bg);
          color: var(--hiw-text);
          padding: 142px 0 80px;
        }

        .hiw-page * {
          box-sizing: border-box;
        }

        .hiw-hero,
        .hiw-section,
        .hiw-cta {
          position: relative;
          z-index: 1;
          width: min(1180px, calc(100% - 40px));
          margin: 0 auto;
        }

        .hiw-hero {
          display: grid;
          grid-template-columns: minmax(0, 1.02fr) minmax(360px, 0.78fr);
          gap: 52px;
          align-items: center;
          min-height: 620px;
        }

        .hiw-badge,
        .hiw-kicker {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          width: fit-content;
          margin: 0 0 18px;
          color: #ff7a00;
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.12em;
          text-transform: uppercase;
        }

        .hiw-badge {
          padding: 10px 14px;
          border: 1px solid rgba(255, 122, 0, 0.18);
          border-radius: 999px;
          background: rgba(255, 122, 0, 0.08);
          box-shadow: 0 16px 50px rgba(255, 122, 0, 0.12);
        }

        .hiw-hero h1,
        .hiw-section-heading h2,
        .hiw-launch-panel h2,
        .hiw-cta h2 {
          font-family: "Syne", sans-serif;
          letter-spacing: 0;
          color: var(--hiw-text);
          margin: 0;
        }

        .hiw-hero h1 {
          max-width: 760px;
          font-size: clamp(52px, 8vw, 108px);
          line-height: 0.9;
          font-weight: 900;
        }

        .hiw-hero h1::first-line {
          color: var(--hiw-text);
        }

        .hiw-hero-copy > p,
        .hiw-section-heading > p,
        .hiw-launch-panel > p,
        .hiw-cta-inner > p {
          font-family: "DM Sans", sans-serif;
          color: var(--hiw-muted);
          font-size: 18px;
          line-height: 1.8;
          margin: 24px 0 0;
        }

        .hiw-hero-copy > p {
          max-width: 670px;
        }

        .hiw-hero-actions,
        .hiw-cta-actions {
          display: flex;
          flex-wrap: wrap;
          gap: 14px;
          align-items: center;
          margin-top: 34px;
        }

        .hiw-primary-btn,
        .hiw-secondary-btn {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 52px;
          padding: 0 22px;
          border-radius: 999px;
          text-decoration: none;
          font-family: "DM Sans", sans-serif;
          font-size: 15px;
          font-weight: 900;
          transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease;
        }

        .hiw-primary-btn {
          color: #fff;
          background: linear-gradient(135deg, #ff6b00, #ffb703);
          box-shadow: 0 22px 55px rgba(255, 107, 0, 0.32);
        }

        .hiw-secondary-btn {
          color: var(--hiw-text);
          background: var(--hiw-surface);
          border: 1px solid var(--hiw-border);
          box-shadow: 0 16px 44px rgba(15, 23, 42, 0.08);
        }

        .hiw-secondary-dark {
          background: rgba(255, 255, 255, 0.14);
          color: #fff;
          border-color: rgba(255, 255, 255, 0.24);
        }

        .hiw-primary-btn:hover,
        .hiw-secondary-btn:hover {
          transform: translateY(-3px);
        }

        .hiw-proof-row {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 12px;
          max-width: 740px;
          margin-top: 38px;
        }

        .hiw-proof-row div {
          min-height: 96px;
          padding: 18px;
          border: 1px solid var(--hiw-border);
          border-radius: 22px;
          background: var(--hiw-surface);
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
        }

        .hiw-proof-row strong,
        .hiw-proof-row span {
          display: block;
          font-family: "DM Sans", sans-serif;
        }

        .hiw-proof-row strong {
          color: var(--hiw-text);
          font-size: 15px;
          margin-bottom: 7px;
        }

        .hiw-proof-row span {
          color: var(--hiw-muted);
          font-size: 13px;
          line-height: 1.45;
        }

        .hiw-hero-art {
          position: relative;
          width: min(480px, 100%);
          aspect-ratio: 1;
          margin-left: auto;
          border-radius: 44px;
          background:
            linear-gradient(135deg, rgba(255, 255, 255, 0.76), rgba(255, 255, 255, 0.18)),
            linear-gradient(160deg, rgba(255, 122, 0, 0.16), rgba(0, 184, 156, 0.12));
          border: 1px solid var(--hiw-border);
          box-shadow: 0 42px 110px rgba(15, 23, 42, 0.16);
          overflow: hidden;
        }

        .hiw-hero-art::before {
          content: "";
          position: absolute;
          inset: 34px;
          border-radius: 38px;
          background:
            radial-gradient(circle, rgba(0, 184, 156, 0.16) 0 2px, transparent 3px),
            linear-gradient(135deg, rgba(255, 122, 0, 0.09), rgba(139, 92, 246, 0.09));
          background-size: 28px 28px, auto;
          opacity: 0.75;
          mask-image: radial-gradient(circle at center, #000 26%, transparent 72%);
        }

        .hiw-orbit {
          position: absolute;
          inset: 74px;
          border: 1px solid rgba(255, 122, 0, 0.3);
          border-radius: 999px;
        }

        .hiw-orbit::after {
          content: "";
          position: absolute;
          top: 22px;
          left: 50%;
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #ff7a00;
          box-shadow: 0 0 24px rgba(255, 122, 0, 0.8);
        }

        .hiw-orbit-two {
          inset: 118px 52px;
          border-color: rgba(0, 184, 156, 0.32);
          transform: rotate(26deg);
        }

        .hiw-orbit-two::after {
          background: #00b89c;
          box-shadow: 0 0 24px rgba(0, 184, 156, 0.75);
        }

        .hiw-core {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          width: 132px;
          height: 132px;
          display: grid;
          place-items: center;
          gap: 6px;
          border-radius: 36px;
          color: #fff;
          background: linear-gradient(135deg, #050712, #111827 42%, #ff7a00);
          box-shadow: 0 30px 70px rgba(255, 107, 0, 0.34);
          font-family: "Syne", sans-serif;
          font-weight: 900;
        }

        .hiw-core span {
          margin-top: -26px;
        }

        .hiw-orbit-node {
          position: absolute;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 10px 12px;
          border-radius: 999px;
          color: var(--node-color);
          background: var(--hiw-surface-strong);
          border: 1px solid color-mix(in srgb, var(--node-color) 32%, transparent);
          box-shadow: 0 20px 50px rgba(15, 23, 42, 0.14);
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          font-weight: 900;
          z-index: 2;
        }

        .hiw-mini-card {
          position: absolute;
          z-index: 3;
          display: flex;
          align-items: center;
          gap: 10px;
          min-width: 178px;
          padding: 14px;
          border-radius: 20px;
          background: var(--hiw-surface-strong);
          border: 1px solid var(--hiw-border);
          box-shadow: 0 22px 62px rgba(15, 23, 42, 0.16);
          font-family: "DM Sans", sans-serif;
        }

        .hiw-mini-card svg {
          color: #ff7a00;
        }

        .hiw-mini-card strong,
        .hiw-mini-card span {
          display: block;
        }

        .hiw-mini-card strong {
          font-size: 16px;
          color: var(--hiw-text);
        }

        .hiw-mini-card span {
          font-size: 12px;
          color: var(--hiw-muted);
          margin-top: 2px;
        }

        .hiw-mini-card-one {
          left: 28px;
          bottom: 44px;
        }

        .hiw-mini-card-two {
          right: 24px;
          top: 44px;
        }

        .hiw-section {
          padding: 76px 0;
        }

        .hiw-section-heading {
          max-width: 760px;
          margin-bottom: 30px;
        }

        .hiw-section-heading h2,
        .hiw-launch-panel h2,
        .hiw-cta h2 {
          font-size: clamp(36px, 5vw, 64px);
          line-height: 1;
          font-weight: 900;
        }

        .hiw-flow-switch {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 28px;
          padding: 8px;
          width: fit-content;
          border: 1px solid var(--hiw-border);
          border-radius: 999px;
          background: var(--hiw-surface);
          box-shadow: 0 18px 50px rgba(15, 23, 42, 0.08);
        }

        .hiw-flow-switch button {
          border: 0;
          border-radius: 999px;
          background: transparent;
          color: var(--hiw-muted);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          min-height: 44px;
          padding: 0 18px;
          cursor: pointer;
          font-family: "DM Sans", sans-serif;
          font-weight: 900;
          transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
        }

        .hiw-flow-switch button.active {
          color: #fff;
          background: linear-gradient(135deg, #ff6b00, #ffb703);
          box-shadow: 0 12px 26px rgba(255, 107, 0, 0.26);
        }

        .hiw-steps-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 14px;
        }

        .hiw-step-card {
          position: relative;
          min-height: 368px;
          display: flex;
          flex-direction: column;
          gap: 18px;
          padding: 22px;
          border-radius: 28px;
          overflow: hidden;
          background:
            linear-gradient(180deg, color-mix(in srgb, var(--step-color) 13%, transparent), transparent 45%),
            var(--hiw-surface-strong);
          border: 1px solid var(--hiw-border);
          box-shadow: 0 22px 70px rgba(15, 23, 42, 0.1);
        }

        .hiw-step-card::before {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          height: 7px;
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--step-color) 58%, transparent), transparent);
          opacity: 0.95;
        }

        .hiw-card-glow {
          position: absolute;
          inset: 0;
          pointer-events: none;
          border-radius: inherit;
          border: 1px solid color-mix(in srgb, var(--step-color) 36%, transparent);
          box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--step-color) 12%, transparent);
        }

        .hiw-step-number {
          position: absolute;
          top: 18px;
          right: 18px;
          color: color-mix(in srgb, var(--step-color) 42%, transparent);
          font-family: "Syne", sans-serif;
          font-size: 34px;
          font-weight: 900;
        }

        .hiw-step-icon,
        .hiw-trust-icon {
          width: 48px;
          height: 48px;
          display: grid;
          place-items: center;
          border-radius: 16px;
          color: var(--step-color);
          background: color-mix(in srgb, var(--step-color) 13%, transparent);
          border: 1px solid color-mix(in srgb, var(--step-color) 24%, transparent);
        }

        .hiw-eyebrow {
          margin: 0 0 10px;
          color: var(--step-color);
          font-family: "DM Sans", sans-serif;
          font-size: 11px;
          font-weight: 900;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .hiw-step-card h3,
        .hiw-trust-card h3,
        .hiw-backer-card h3,
        .hiw-project-preview h3 {
          margin: 0;
          color: var(--hiw-text);
          font-family: "Syne", sans-serif;
          font-weight: 900;
          letter-spacing: 0;
        }

        .hiw-step-card h3 {
          font-size: 24px;
          line-height: 1.05;
        }

        .hiw-step-card p,
        .hiw-trust-card p,
        .hiw-backer-card p,
        .hiw-project-preview p {
          color: var(--hiw-muted);
          font-family: "DM Sans", sans-serif;
          font-size: 14px;
          line-height: 1.7;
          margin: 12px 0 0;
        }

        .hiw-step-detail {
          position: relative;
          z-index: 1;
          display: flex;
          align-items: flex-start;
          gap: 8px;
          margin-top: auto;
          padding-top: 18px;
          border-top: 1px solid var(--hiw-border);
          color: var(--hiw-muted);
          font-family: "DM Sans", sans-serif;
          font-size: 12.5px;
          line-height: 1.5;
        }

        .hiw-step-detail svg {
          flex: 0 0 auto;
          color: var(--step-color);
          margin-top: 2px;
        }

        .hiw-split-section {
          display: grid;
          grid-template-columns: minmax(0, 0.88fr) minmax(340px, 0.72fr);
          gap: 28px;
          align-items: stretch;
        }

        .hiw-launch-panel,
        .hiw-preview-stack,
        .hiw-cta-inner {
          position: relative;
          overflow: hidden;
          border: 1px solid var(--hiw-border);
          border-radius: 34px;
          background: var(--hiw-surface-strong);
          box-shadow: 0 28px 90px rgba(15, 23, 42, 0.12);
        }

        .hiw-launch-panel {
          padding: 34px;
        }

        .hiw-checklist {
          display: grid;
          gap: 12px;
          margin-top: 26px;
        }

        .hiw-checklist div {
          display: flex;
          align-items: center;
          gap: 10px;
          min-height: 48px;
          padding: 12px 14px;
          border-radius: 16px;
          background: var(--hiw-faint);
          border: 1px solid var(--hiw-border);
          color: var(--hiw-text);
          font-family: "DM Sans", sans-serif;
          font-size: 14px;
          font-weight: 700;
        }

        .hiw-checklist svg {
          color: #00b89c;
          flex: 0 0 auto;
        }

        .hiw-preview-stack {
          min-height: 560px;
          display: grid;
          place-items: center;
          padding: 28px;
          background:
            linear-gradient(135deg, rgba(255, 122, 0, 0.18), transparent 38%),
            linear-gradient(315deg, rgba(0, 184, 156, 0.18), transparent 42%),
            var(--hiw-surface-strong);
        }

        .hiw-project-preview {
          position: relative;
          width: min(390px, 100%);
          overflow: hidden;
          border-radius: 30px;
          background: var(--hiw-surface-strong);
          border: 1px solid var(--hiw-border);
          box-shadow: 0 34px 80px rgba(15, 23, 42, 0.2);
        }

        .hiw-preview-media {
          position: relative;
          height: 210px;
          background:
            linear-gradient(135deg, rgba(255, 122, 0, 0.28), rgba(96, 165, 250, 0.22)),
            linear-gradient(135deg, #101827, #4f46e5 56%, #00b89c);
        }

        .hiw-preview-media::before,
        .hiw-preview-media::after {
          content: "";
          position: absolute;
          border-radius: 24px;
          background: rgba(255, 255, 255, 0.82);
        }

        .hiw-preview-media::before {
          width: 148px;
          height: 88px;
          left: 46px;
          bottom: -12px;
          opacity: 0.75;
          transform: rotate(-12deg);
        }

        .hiw-preview-media::after {
          width: 110px;
          height: 54px;
          right: 52px;
          top: 42px;
          opacity: 0.45;
          transform: rotate(18deg);
        }

        .hiw-preview-chip {
          position: absolute;
          z-index: 1;
          top: 16px;
          left: 16px;
          padding: 8px 11px;
          border-radius: 999px;
          color: #fff;
          background: rgba(0, 0, 0, 0.28);
          border: 1px solid rgba(255, 255, 255, 0.24);
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          font-weight: 900;
        }

        .hiw-preview-spark {
          position: absolute;
          z-index: 1;
          right: 22px;
          bottom: 22px;
          width: 18px;
          height: 18px;
          border-radius: 5px;
          background: #ffb703;
          transform: rotate(45deg);
          box-shadow: 0 0 0 12px rgba(255, 183, 3, 0.18), 0 0 42px rgba(255, 183, 3, 0.8);
        }

        .hiw-preview-body {
          padding: 22px;
        }

        .hiw-preview-body > span {
          color: #ff7a00;
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          font-weight: 900;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hiw-project-preview h3 {
          margin-top: 8px;
          font-size: 24px;
          line-height: 1.08;
        }

        .hiw-progress {
          height: 8px;
          border-radius: 999px;
          overflow: hidden;
          background: var(--hiw-faint);
          margin-top: 18px;
        }

        .hiw-progress span {
          display: block;
          height: 100%;
          border-radius: inherit;
          background: linear-gradient(90deg, #ff6b00, #ffb703, #00b89c);
        }

        .hiw-preview-stats {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          margin-top: 14px;
          color: var(--hiw-text);
          font-family: "DM Sans", sans-serif;
          font-size: 13px;
        }

        .hiw-floating-note {
          position: absolute;
          right: 24px;
          bottom: 24px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          max-width: 230px;
          padding: 12px 14px;
          border-radius: 999px;
          color: #fff;
          background: linear-gradient(135deg, #050712, #1f2937);
          box-shadow: 0 22px 52px rgba(15, 23, 42, 0.28);
          font-family: "DM Sans", sans-serif;
          font-size: 12px;
          font-weight: 800;
        }

        .hiw-floating-note svg {
          color: #ffb703;
          flex: 0 0 auto;
        }

        .hiw-backer-grid,
        .hiw-trust-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
        }

        .hiw-backer-card,
        .hiw-trust-card {
          position: relative;
          overflow: hidden;
          min-height: 220px;
          padding: 24px;
          border-radius: 26px;
          background: var(--hiw-surface-strong);
          border: 1px solid var(--hiw-border);
          box-shadow: 0 20px 65px rgba(15, 23, 42, 0.1);
        }

        .hiw-backer-card::before,
        .hiw-trust-card::before {
          content: "";
          position: absolute;
          inset: auto 0 0 0;
          height: 7px;
          background: linear-gradient(90deg, transparent, color-mix(in srgb, var(--preview-color, var(--trust-color)) 58%, transparent), transparent);
        }

        .hiw-backer-card > span {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 44px;
          height: 44px;
          border-radius: 15px;
          color: var(--preview-color);
          background: color-mix(in srgb, var(--preview-color) 12%, transparent);
          border: 1px solid color-mix(in srgb, var(--preview-color) 24%, transparent);
          font-family: "Syne", sans-serif;
          font-size: 16px;
          font-weight: 900;
          margin-bottom: 22px;
        }

        .hiw-backer-card h3,
        .hiw-trust-card h3 {
          font-size: 23px;
          line-height: 1.08;
        }

        .hiw-trust-icon {
          color: var(--trust-color);
          background: color-mix(in srgb, var(--trust-color) 12%, transparent);
          border-color: color-mix(in srgb, var(--trust-color) 24%, transparent);
          margin-bottom: 22px;
        }

        .hiw-cta {
          padding-top: 70px;
        }

        .hiw-cta-inner {
          text-align: center;
          padding: 70px 30px;
          color: #fff;
          background:
            linear-gradient(120deg, rgba(255, 183, 3, 0.32), transparent 34%),
            linear-gradient(300deg, rgba(0, 184, 156, 0.34), transparent 36%),
            linear-gradient(135deg, #080a13, #171827 48%, #111827);
        }

        .hiw-cta-inner .hiw-kicker,
        .hiw-cta-inner h2,
        .hiw-cta-inner > p {
          color: #fff;
        }

        .hiw-cta-inner .hiw-kicker {
          margin-left: auto;
          margin-right: auto;
        }

        .hiw-cta-inner > p {
          max-width: 710px;
          margin-left: auto;
          margin-right: auto;
          opacity: 0.76;
        }

        .hiw-cta-actions {
          justify-content: center;
        }

        @media (max-width: 1100px) {
          .hiw-hero,
          .hiw-split-section {
            grid-template-columns: 1fr;
          }

          .hiw-hero {
            min-height: auto;
          }

          .hiw-hero-art {
            margin: 0 auto;
          }

          .hiw-steps-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .hiw-backer-grid,
          .hiw-trust-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }

        @media (max-width: 720px) {
          .hiw-page {
            padding-top: 116px;
          }

          .hiw-hero,
          .hiw-section,
          .hiw-cta {
            width: min(100% - 24px, 1180px);
          }

          .hiw-hero {
            gap: 30px;
          }

          .hiw-hero h1 {
            font-size: clamp(46px, 14vw, 72px);
          }

          .hiw-hero-copy > p,
          .hiw-section-heading > p,
          .hiw-launch-panel > p,
          .hiw-cta-inner > p {
            font-size: 16px;
            line-height: 1.7;
          }

          .hiw-hero-actions,
          .hiw-cta-actions,
          .hiw-flow-switch {
            width: 100%;
          }

          .hiw-primary-btn,
          .hiw-secondary-btn,
          .hiw-flow-switch button {
            width: 100%;
          }

          .hiw-proof-row,
          .hiw-steps-grid,
          .hiw-backer-grid,
          .hiw-trust-grid {
            grid-template-columns: 1fr;
          }

          .hiw-hero-art {
            border-radius: 30px;
          }

          .hiw-mini-card {
            min-width: 146px;
            padding: 12px;
          }

          .hiw-mini-card-one {
            left: 14px;
            bottom: 18px;
          }

          .hiw-mini-card-two {
            right: 14px;
            top: 18px;
          }

          .hiw-orbit-node {
            padding: 9px 10px;
          }

          .hiw-step-card {
            min-height: auto;
          }

          .hiw-launch-panel,
          .hiw-preview-stack,
          .hiw-cta-inner {
            border-radius: 26px;
          }

          .hiw-launch-panel,
          .hiw-preview-stack {
            padding: 20px;
          }

          .hiw-preview-stack {
            min-height: 500px;
          }

          .hiw-floating-note {
            left: 18px;
            right: 18px;
            justify-content: center;
            max-width: none;
          }

          .hiw-section {
            padding: 54px 0;
          }

          .hiw-cta-inner {
            padding: 52px 18px;
          }
        }

        @media (max-width: 420px) {
          .hiw-hero-art {
            aspect-ratio: 0.92;
          }

          .hiw-core {
            width: 112px;
            height: 112px;
            border-radius: 28px;
          }

          .hiw-orbit {
            inset: 66px;
          }

          .hiw-orbit-two {
            inset: 108px 38px;
          }
        }
      `}</style>
    </main>
  );
}
