"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Cpu,
  Database,
  GitBranch,
  Globe2,
  HardDrive,
  LockKeyhole,
  Mail,
  Radio,
  Rocket,
  Search,
  Server,
  ShieldCheck,
  TerminalSquare,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type StatusLevel = "operational" | "degraded" | "outage" | "maintenance";
type Service = {
  name: string;
  desc: string;
  status: StatusLevel;
  uptime: string;
  latency: string;
  icon: ReactNode;
};

const SERVICES: Service[] = [
  { name: "API Gateway", desc: "Versioned REST surface and auth handshake", status: "operational", uptime: "99.98%", latency: "84 ms", icon: <Globe2 size={18} /> },
  { name: "Campaign Service", desc: "Creation, discovery, funding and updates", status: "operational", uptime: "99.95%", latency: "112 ms", icon: <Rocket size={18} /> },
  { name: "Payments", desc: "Razorpay orders, verification and receipts", status: "operational", uptime: "99.99%", latency: "148 ms", icon: <Zap size={18} /> },
  { name: "KYC Review", desc: "Creator verification and document workflow", status: "operational", uptime: "99.90%", latency: "126 ms", icon: <ShieldCheck size={18} /> },
  { name: "Notifications", desc: "Email, push delivery and read state", status: "operational", uptime: "99.87%", latency: "132 ms", icon: <Mail size={18} /> },
  { name: "Media Pipeline", desc: "Campaign gallery assets and CDN delivery", status: "operational", uptime: "99.99%", latency: "72 ms", icon: <HardDrive size={18} /> },
  { name: "Search Index", desc: "Explore filters, ranking and category lookup", status: "operational", uptime: "99.93%", latency: "96 ms", icon: <Search size={18} /> },
  { name: "Admin Console", desc: "Operations queues and payout controls", status: "operational", uptime: "99.80%", latency: "118 ms", icon: <LockKeyhole size={18} /> },
];

const INCIDENTS = [
  {
    date: "8 May 2025",
    title: "Intermittent email delivery delays",
    status: "Resolved",
    duration: "43 min",
    updates: [
      { time: "14:32 IST", msg: "Investigating reports of delayed transactional emails." },
      { time: "14:51 IST", msg: "Switched email traffic to the secondary relay after upstream throttling." },
      { time: "15:15 IST", msg: "Delayed messages drained and normal delivery confirmed." },
    ],
  },
  {
    date: "22 April 2025",
    title: "Payment webhook processing lag",
    status: "Resolved",
    duration: "18 min",
    updates: [
      { time: "09:14 IST", msg: "Detected increased latency in the payment webhook queue." },
      { time: "09:32 IST", msg: "Queue cleared and payment confirmations reconciled." },
    ],
  },
  {
    date: "5 March 2025",
    title: "Planned database maintenance",
    status: "Completed",
    duration: "2 hr",
    updates: [
      { time: "02:00 IST", msg: "Maintenance window started with platform safeguards enabled." },
      { time: "03:47 IST", msg: "PostgreSQL migration completed and full service restored." },
    ],
  },
];

const PERF_DATA = [
  { time: "00:00", latency: 92, api: 1210 },
  { time: "04:00", latency: 78, api: 1040 },
  { time: "08:00", latency: 106, api: 1780 },
  { time: "12:00", latency: 132, api: 2140 },
  { time: "16:00", latency: 118, api: 1980 },
  { time: "20:00", latency: 88, api: 1420 },
  { time: "Now", latency: 84, api: 1550 },
];

const DEPLOYMENTS = [
  { env: "Production", version: "web-2026.08.05", commit: "f3a91c7", status: "Healthy", duration: "3m 18s" },
  { env: "API", version: "spring-boot-4.x", commit: "8c20ad2", status: "Healthy", duration: "5m 42s" },
  { env: "Workers", version: "notifications-queue", commit: "91be104", status: "Healthy", duration: "1m 09s" },
];

const LOGS = [
  { level: "info", time: "12:18", msg: "Funding stream heartbeat acknowledged for active campaigns" },
  { level: "info", time: "12:12", msg: "Project explore cache warmed for trending and ending soon feeds" },
  { level: "warn", time: "11:58", msg: "Payment webhook latency crossed watch threshold and recovered" },
  { level: "info", time: "11:43", msg: "Admin review queues synchronized with latest creator submissions" },
];

const ENVIRONMENT = [
  { label: "Runtime", value: "Spring Boot API", icon: <Server size={17} /> },
  { label: "Database", value: "PostgreSQL + Flyway", icon: <Database size={17} /> },
  { label: "Cache", value: "Redis", icon: <Cpu size={17} /> },
  { label: "Frontend", value: "Next.js 16", icon: <Activity size={17} /> },
];

const STATUS_CONFIG: Record<StatusLevel, { label: string; color: string; bg: string; border: string }> = {
  operational: { label: "Operational", color: "var(--success)", bg: "var(--success-dim)", border: "var(--success-dim)" },
  degraded: { label: "Degraded", color: "var(--warning)", bg: "var(--warning-dim)", border: "var(--warning-dim)" },
  outage: { label: "Outage", color: "var(--danger)", bg: "var(--danger-dim)", border: "var(--danger-dim)" },
  maintenance: { label: "Maintenance", color: "var(--info)", bg: "var(--info-dim)", border: "var(--info-dim)" },
};

const formatStatusTime = () =>
  new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    dateStyle: "medium",
    timeStyle: "short",
  });

function StatusBadge({ status }: { status: StatusLevel }) {
  const cfg = STATUS_CONFIG[status];
  return (
    <span className="backend-badge" style={{ color: cfg.color, background: cfg.bg, borderColor: cfg.border }}>
      <span className="backend-badge-dot" style={{ background: cfg.color }} />
      {cfg.label}
    </span>
  );
}

function MetricCard({
  icon,
  label,
  value,
  sub,
  delay,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  sub: string;
  delay: number;
}) {
  return (
    <motion.div
      className="backend-card backend-metric"
      initial={{ opacity: 0, y: 18, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.45, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={{ y: -4 }}
    >
      <div className="backend-icon">{icon}</div>
      <div>
        <p className="backend-metric-value">{value}</p>
        <p className="backend-muted">{label}</p>
      </div>
      <span className="backend-chip">{sub}</span>
    </motion.div>
  );
}

function ServiceRow({ service, index }: { service: Service; index: number }) {
  return (
    <motion.div
      className="service-row"
      initial={{ opacity: 0, x: -14 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.36, delay: 0.18 + index * 0.04 }}
    >
      <div className="backend-icon">{service.icon}</div>
      <div className="service-main">
        <div className="service-title-row">
          <strong>{service.name}</strong>
          <StatusBadge status={service.status} />
        </div>
        <p>{service.desc}</p>
      </div>
      <div className="service-meta">
        <strong>{service.uptime}</strong>
        <span>{service.latency}</span>
      </div>
    </motion.div>
  );
}

function DeploymentRow({ item, index }: { item: (typeof DEPLOYMENTS)[number]; index: number }) {
  return (
    <motion.div
      className="deployment-row"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
    >
      <div className="backend-icon">
        <GitBranch size={16} />
      </div>
      <div>
        <strong>{item.env}</strong>
        <p>{item.version}</p>
      </div>
      <code>{item.commit}</code>
      <span className="backend-chip">{item.duration}</span>
      <StatusBadge status="operational" />
    </motion.div>
  );
}

function LogRow({ log, index }: { log: (typeof LOGS)[number]; index: number }) {
  const isWarning = log.level === "warn";
  return (
    <motion.div
      className="log-row"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.04 }}
    >
      <span className="log-time">{log.time}</span>
      <span className={isWarning ? "log-level warn" : "log-level"}>{log.level}</span>
      <p>{log.msg}</p>
    </motion.div>
  );
}

function UptimeBars() {
  const bars = useMemo(
    () =>
      Array.from({ length: 90 }, (_, i) => ({
        day: i,
        ok: i % 37 !== 0,
      })),
    []
  );

  return (
    <div className="uptime-bars" aria-label="90 day uptime history">
      {bars.map((bar) => (
        <span
          key={bar.day}
          title={bar.ok ? "Operational" : "Incident"}
          className={bar.ok ? "uptime-bar ok" : "uptime-bar incident"}
        />
      ))}
    </div>
  );
}

export default function StatusPage() {
  const [openIncident, setOpenIncident] = useState<number | null>(0);
  const [now, setNow] = useState(formatStatusTime);
  const allOperational = SERVICES.every((service) => service.status === "operational");

  useEffect(() => {
    const timer = window.setInterval(() => setNow(formatStatusTime()), 10000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <main className="backend-page">
      <section className="backend-shell">
        <motion.div
          className="backend-hero"
          initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <span className="backend-eyebrow">
              <Radio size={14} />
              Backend control center
            </span>
            <h1>CrowdSpark System Status</h1>
            <p>
              API health, deployment state, data layer performance and operational events in one production-ready surface.
            </p>
          </div>

          <div className="backend-status-card" aria-live="polite">
            <motion.div
              className="backend-status-ring"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            >
              {allOperational ? <CheckCircle2 size={30} /> : <AlertTriangle size={30} />}
            </motion.div>
            <strong>{allOperational ? "All systems operational" : "Attention required"}</strong>
            <span>Last checked: {now || "Loading"}</span>
          </div>
        </motion.div>

        <div className="backend-metrics-grid">
          <MetricCard icon={<Activity size={18} />} label="API latency" value="84 ms" sub="-12 ms today" delay={0.06} />
          <MetricCard icon={<Database size={18} />} label="Database health" value="99.96%" sub="Postgres ready" delay={0.12} />
          <MetricCard icon={<TerminalSquare size={18} />} label="Error rate" value="0.03%" sub="Below SLO" delay={0.18} />
          <MetricCard icon={<Clock3 size={18} />} label="Uptime average" value="99.94%" sub="90 days" delay={0.24} />
        </div>

        <div className="backend-main-grid">
          <motion.section
            className="backend-card backend-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.18 }}
          >
            <div className="backend-panel-head">
              <div>
                <span>System health</span>
                <h2>Services</h2>
              </div>
              <StatusBadge status="operational" />
            </div>
            <div className="service-list">
              {SERVICES.map((service, index) => (
                <ServiceRow key={service.name} service={service} index={index} />
              ))}
            </div>
          </motion.section>

          <aside className="backend-side">
            <motion.section
              className="backend-card backend-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.24 }}
            >
              <div className="backend-panel-head">
                <div>
                  <span>Environment</span>
                  <h2>Runtime</h2>
                </div>
                <Cpu size={18} />
              </div>
              <div className="env-grid">
                {ENVIRONMENT.map((item) => (
                  <div className="env-tile" key={item.label}>
                    <span>{item.icon}</span>
                    <p>{item.label}</p>
                    <strong>{item.value}</strong>
                  </div>
                ))}
              </div>
            </motion.section>

            <motion.section
              className="backend-card backend-panel"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.3 }}
            >
              <div className="backend-panel-head">
                <div>
                  <span>Database</span>
                  <h2>Storage</h2>
                </div>
                <Database size={18} />
              </div>
              <div className="database-ring">
                <motion.div
                  className="database-fill"
                  initial={{ width: 0 }}
                  animate={{ width: "68%" }}
                  transition={{ duration: 1.1, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
              <div className="database-meta">
                <span>Pool usage</span>
                <strong>68%</strong>
              </div>
              <p className="backend-muted">Read replicas healthy. Flyway migrations current.</p>
            </motion.section>
          </aside>
        </div>

        <div className="backend-grid-2">
          <motion.section
            className="backend-card backend-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.28 }}
          >
            <div className="backend-panel-head">
              <div>
                <span>Performance</span>
                <h2>Latency and API volume</h2>
              </div>
              <Activity size={18} />
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={PERF_DATA} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <defs>
                    <linearGradient id="latencyFill" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="0%" stopColor="var(--accent)" stopOpacity={0.32} />
                      <stop offset="100%" stopColor="var(--accent)" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--card-bg-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} labelStyle={{ color: "var(--text-muted)" }} />
                  <Area type="monotone" dataKey="latency" stroke="var(--accent)" strokeWidth={2} fill="url(#latencyFill)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.section>

          <motion.section
            className="backend-card backend-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.34 }}
          >
            <div className="backend-panel-head">
              <div>
                <span>Traffic</span>
                <h2>Requests by window</h2>
              </div>
              <Zap size={18} />
            </div>
            <div className="chart-wrap">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={PERF_DATA} margin={{ top: 8, right: 8, bottom: 0, left: -18 }}>
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: "var(--text-muted)", fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "var(--card-bg-2)", border: "1px solid var(--border)", borderRadius: 8, color: "var(--text)" }} labelStyle={{ color: "var(--text-muted)" }} />
                  <Bar dataKey="api" fill="var(--cta)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </motion.section>
        </div>

        <div className="backend-grid-2">
          <motion.section
            className="backend-card backend-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.36 }}
          >
            <div className="backend-panel-head">
              <div>
                <span>Deployments</span>
                <h2>Latest releases</h2>
              </div>
              <GitBranch size={18} />
            </div>
            <div className="deployment-list">
              {DEPLOYMENTS.map((item, index) => (
                <DeploymentRow item={item} index={index} key={item.env} />
              ))}
            </div>
          </motion.section>

          <motion.section
            className="backend-card backend-panel"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.4 }}
          >
            <div className="backend-panel-head">
              <div>
                <span>Logs</span>
                <h2>Operational feed</h2>
              </div>
              <TerminalSquare size={18} />
            </div>
            <div className="log-list">
              {LOGS.map((log, index) => (
                <LogRow key={`${log.time}-${log.msg}`} log={log} index={index} />
              ))}
            </div>
          </motion.section>
        </div>

        <motion.section
          className="backend-card backend-panel"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.44 }}
        >
          <div className="backend-panel-head">
            <div>
              <span>Reliability</span>
              <h2>90-day uptime and incidents</h2>
            </div>
            <span className="backend-chip">99.94% avg</span>
          </div>
          <UptimeBars />
          <div className="uptime-labels">
            <span>90 days ago</span>
            <span>Today</span>
          </div>

          <div className="incident-list">
            {INCIDENTS.map((incident, index) => (
              <div className="incident" key={incident.title}>
                <button type="button" onClick={() => setOpenIncident(openIncident === index ? null : index)}>
                  <CheckCircle2 size={16} />
                  <span>
                    <strong>{incident.title}</strong>
                    <small>{incident.date} - {incident.status} in {incident.duration}</small>
                  </span>
                  <motion.span animate={{ rotate: openIncident === index ? 180 : 0 }}>
                    <ChevronDown size={16} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {openIncident === index && (
                    <motion.div
                      className="incident-updates"
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.24 }}
                    >
                      {incident.updates.map((update) => (
                        <p key={`${update.time}-${update.msg}`}>
                          <span>{update.time}</span>
                          {update.msg}
                        </p>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </motion.section>
      </section>

      <style>{`
        .backend-page {
          min-height: 100vh;
          background: var(--bg);
          color: var(--text);
          position: relative;
          overflow: hidden;
        }
        .backend-page::before {
          content: "";
          position: fixed;
          inset: 0;
          pointer-events: none;
          background:
            linear-gradient(var(--border-2) 1px, transparent 1px),
            linear-gradient(90deg, var(--border-2) 1px, transparent 1px),
            radial-gradient(ellipse at 50% 0%, var(--accent-dim), transparent 48%);
          background-size: 52px 52px, 52px 52px, 100% 100%;
          opacity: 0.72;
        }
        .backend-shell {
          width: min(1180px, calc(100% - 32px));
          margin: 0 auto;
          padding: 72px 0 96px;
          position: relative;
          z-index: 1;
        }
        .backend-hero {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 320px;
          gap: 24px;
          align-items: stretch;
          margin-bottom: 18px;
        }
        .backend-eyebrow,
        .backend-chip,
        .backend-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          border: 1px solid var(--border);
          border-radius: 999px;
          background: var(--bg-ghost);
          color: var(--text-muted);
          font: 700 11px "DM Sans", sans-serif;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .backend-eyebrow { padding: 7px 11px; margin-bottom: 18px; }
        .backend-chip { padding: 5px 9px; letter-spacing: 0; text-transform: none; }
        .backend-badge { padding: 5px 10px; letter-spacing: 0; text-transform: none; }
        .backend-badge-dot {
          width: 7px;
          height: 7px;
          border-radius: 999px;
          box-shadow: 0 0 0 4px var(--success-dim);
          animation: backendPulse 1.8s ease-in-out infinite;
        }
        .backend-hero h1 {
          font: 900 clamp(34px, 6vw, 72px) "Syne", sans-serif;
          line-height: 0.98;
          letter-spacing: 0;
          max-width: 760px;
          margin: 0 0 18px;
        }
        .backend-hero p,
        .backend-muted {
          color: var(--text-muted);
          font: 500 14px/1.7 "DM Sans", sans-serif;
          margin: 0;
        }
        .backend-hero > div:first-child p {
          max-width: 640px;
          font-size: 16px;
        }
        .backend-status-card,
        .backend-card {
          background: var(--card-bg);
          border: 1px solid var(--card-border);
          border-radius: 8px;
          box-shadow: var(--card-shadow);
          backdrop-filter: blur(20px);
        }
        .backend-status-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          min-height: 220px;
          overflow: hidden;
          position: relative;
        }
        .backend-status-card::after,
        .backend-card::after {
          content: "";
          position: absolute;
          left: 12%;
          right: 12%;
          top: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent, var(--accent-dim), transparent);
        }
        .backend-status-ring {
          width: 68px;
          height: 68px;
          display: grid;
          place-items: center;
          color: var(--success);
          border: 1px solid var(--success-dim);
          border-radius: 999px;
          background: var(--success-dim);
        }
        .backend-status-card strong {
          font: 800 24px "Syne", sans-serif;
          letter-spacing: 0;
        }
        .backend-status-card span {
          color: var(--text-muted);
          font: 600 12px "DM Sans", sans-serif;
        }
        .backend-metrics-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 12px;
          margin-bottom: 12px;
        }
        .backend-card {
          position: relative;
          overflow: hidden;
        }
        .backend-metric {
          min-height: 150px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
        }
        .backend-icon {
          width: 38px;
          height: 38px;
          display: grid;
          place-items: center;
          color: var(--accent);
          border: 1px solid var(--border);
          border-radius: 8px;
          background: var(--bg-ghost);
          flex: 0 0 auto;
        }
        .backend-metric-value {
          font: 900 30px "Syne", sans-serif;
          letter-spacing: 0;
          margin: 0 0 2px;
        }
        .backend-main-grid,
        .backend-grid-2 {
          display: grid;
          gap: 12px;
          margin-bottom: 12px;
        }
        .backend-main-grid { grid-template-columns: minmax(0, 1fr) 340px; }
        .backend-grid-2 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .backend-panel { padding: 18px; }
        .backend-panel-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 16px;
        }
        .backend-panel-head > div > span:first-child {
          color: var(--text-muted);
          font: 700 11px "DM Sans", sans-serif;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .backend-panel-head h2 {
          color: var(--text);
          font: 800 20px "Syne", sans-serif;
          margin: 3px 0 0;
          letter-spacing: 0;
        }
        .service-list,
        .deployment-list,
        .log-list,
        .incident-list {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .service-row,
        .deployment-row,
        .log-row,
        .incident button {
          display: flex;
          align-items: center;
          gap: 12px;
          width: 100%;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg-ghost);
          color: var(--text);
        }
        .service-row:hover,
        .deployment-row:hover,
        .log-row:hover,
        .incident button:hover {
          border-color: var(--card-border-hover);
          background: var(--bg-hover);
        }
        .service-main {
          min-width: 0;
          flex: 1;
        }
        .service-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
          margin-bottom: 4px;
        }
        .service-row strong,
        .deployment-row strong,
        .incident strong {
          font: 800 14px "Syne", sans-serif;
        }
        .service-row p,
        .deployment-row p,
        .log-row p {
          color: var(--text-muted);
          font: 500 12.5px/1.5 "DM Sans", sans-serif;
          margin: 0;
        }
        .service-meta {
          min-width: 84px;
          text-align: right;
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .service-meta strong {
          color: var(--success);
          font-size: 13px;
        }
        .service-meta span {
          color: var(--text-muted);
          font: 600 12px "DM Sans", sans-serif;
        }
        .backend-side {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .env-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .env-tile {
          min-height: 116px;
          padding: 12px;
          border-radius: 8px;
          border: 1px solid var(--border);
          background: var(--bg-ghost);
        }
        .env-tile span {
          color: var(--accent);
        }
        .env-tile p {
          color: var(--text-muted);
          font: 700 11px "DM Sans", sans-serif;
          margin: 12px 0 4px;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }
        .env-tile strong {
          font: 800 13px/1.3 "Syne", sans-serif;
        }
        .database-ring {
          height: 10px;
          border-radius: 999px;
          background: var(--bg-ghost);
          border: 1px solid var(--border);
          overflow: hidden;
          margin-bottom: 10px;
        }
        .database-fill {
          height: 100%;
          background: linear-gradient(90deg, var(--accent), var(--cta));
          box-shadow: 0 0 20px var(--accent-glow);
        }
        .database-meta,
        .uptime-labels {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: var(--text-muted);
          font: 600 12px "DM Sans", sans-serif;
          margin-bottom: 8px;
        }
        .database-meta strong {
          color: var(--text);
          font: 900 18px "Syne", sans-serif;
        }
        .chart-wrap {
          width: 100%;
          height: 260px;
        }
        .deployment-row {
          display: grid;
          grid-template-columns: 38px minmax(0, 1fr) auto auto auto;
        }
        .deployment-row code {
          color: var(--text-sub);
          font: 700 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 5px 8px;
          background: var(--bg-ghost);
        }
        .log-row {
          align-items: flex-start;
        }
        .log-time,
        .log-level {
          flex: 0 0 auto;
          color: var(--text-muted);
          font: 700 12px ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
        }
        .log-level {
          color: var(--success);
          text-transform: uppercase;
        }
        .log-level.warn {
          color: var(--warning);
        }
        .uptime-bars {
          display: grid;
          grid-template-columns: repeat(90, minmax(2px, 1fr));
          gap: 2px;
          align-items: end;
          height: 42px;
          margin-bottom: 10px;
        }
        .uptime-bar {
          display: block;
          min-width: 2px;
          border-radius: 2px;
          background: var(--success);
        }
        .uptime-bar.ok {
          height: 30px;
          opacity: 0.76;
        }
        .uptime-bar.incident {
          height: 16px;
          background: var(--warning);
        }
        .incident {
          overflow: hidden;
          border-radius: 8px;
        }
        .incident button {
          cursor: pointer;
          text-align: left;
          justify-content: flex-start;
        }
        .incident button > svg {
          color: var(--success);
          flex: 0 0 auto;
        }
        .incident button > span:nth-child(2) {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .incident small {
          color: var(--text-muted);
          font: 600 12px "DM Sans", sans-serif;
          margin-top: 2px;
        }
        .incident-updates {
          border: 1px solid var(--border);
          border-top: 0;
          background: var(--bg-ghost);
        }
        .incident-updates p {
          display: flex;
          gap: 12px;
          margin: 0;
          padding: 10px 14px;
          color: var(--text-sub);
          font: 500 13px/1.6 "DM Sans", sans-serif;
          border-top: 1px solid var(--border-2);
        }
        .incident-updates span {
          color: var(--success);
          font-weight: 800;
          white-space: nowrap;
        }
        @keyframes backendPulse {
          0%, 100% { opacity: 0.55; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.35); }
        }
        @media (max-width: 980px) {
          .backend-hero,
          .backend-main-grid,
          .backend-grid-2 {
            grid-template-columns: 1fr;
          }
          .backend-metrics-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (max-width: 620px) {
          .backend-shell {
            width: min(100% - 24px, 1180px);
            padding-top: 46px;
          }
          .backend-hero h1 {
            font-size: clamp(32px, 12vw, 48px);
          }
          .backend-status-card {
            min-height: 180px;
          }
          .backend-metrics-grid,
          .env-grid {
            grid-template-columns: 1fr;
          }
          .service-row,
          .deployment-row {
            grid-template-columns: 38px minmax(0, 1fr);
          }
          .service-row {
            align-items: flex-start;
          }
          .service-title-row {
            align-items: flex-start;
            flex-direction: column;
          }
          .service-meta,
          .deployment-row code,
          .deployment-row .backend-chip,
          .deployment-row .backend-badge {
            grid-column: 2;
            justify-self: start;
            text-align: left;
          }
          .log-row {
            display: grid;
            grid-template-columns: auto 1fr;
          }
          .log-row p {
            grid-column: 1 / -1;
          }
          .chart-wrap {
            height: 220px;
          }
        }
      `}</style>
    </main>
  );
}
