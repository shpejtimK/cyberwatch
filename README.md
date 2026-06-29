# BriefSec

A personal cybersecurity news dashboard that aggregates the most trusted security sources into a single, fast, always-fresh feed. Built for daily use by security analysts and anyone who needs to stay current with vulnerabilities, breaches, malware, and threat intelligence.

![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)
![SQLite](https://img.shields.io/badge/SQLite-3-lightblue?logo=sqlite)

---

## What it does

- Pulls from **12 top cybersecurity RSS feeds** automatically every 15 minutes
- Detects and labels articles by threat category: `CVE`, `Zero-Day`, `Malware`, `Ransomware`, `Phishing`, `Breach`, `Vulnerability`, `APT`, `Nation-State`, `Supply Chain`, `Cloud`, `Privacy`, `ICS/OT`, and more
- Extracts **CVE numbers** (e.g. `CVE-2024-12345`) and highlights them as red badges
- Lets you **filter by source and tag**, and **search** across titles, descriptions, and CVE IDs
- No manual refresh needed — open the app and the data is always current

## Sources

| Source | Focus |
|--------|-------|
| [Krebs on Security](https://krebsonsecurity.com) | Investigative security journalism |
| [The Hacker News](https://thehackernews.com) | Breaking cybersecurity news |
| [BleepingComputer](https://www.bleepingcomputer.com) | Ransomware, malware, vulnerabilities |
| [Schneier on Security](https://www.schneier.com) | Policy, cryptography, deep analysis |
| [SANS Internet Storm Center](https://isc.sans.edu) | Daily threat diary from practitioners |
| [CISA](https://www.cisa.gov) | US government advisories & alerts |
| [Graham Cluley](https://grahamcluley.com) | Accessible security commentary |
| [Ars Technica Security](https://arstechnica.com/security) | In-depth technical reporting |
| [Naked Security (Sophos)](https://nakedsecurity.sophos.com) | Threat research and awareness |
| [Troy Hunt](https://www.troyhunt.com) | Data breaches, Have I Been Pwned |
| [SecurityWeek](https://www.securityweek.com) | Enterprise security news |
| [Dark Reading](https://www.darkreading.com) | Threat intelligence and research |

## Tech stack

- **Next.js 14** (App Router) — server-side API route + React client UI
- **SQLite** via `better-sqlite3` — lightweight local article cache
- **rss-parser** — RSS/Atom feed parsing
- **Pure CSS** — no Tailwind, no UI library; dark security-analyst aesthetic

## Getting started

### Prerequisites

- Node.js 18+
- npm

### Install and run

```bash
git clone https://github.com/shpejtimK/cyberwatch.git
cd cyberwatch
npm install
npm run dev
```

Open [http://localhost:63337](http://localhost:63337).

On first load the app fetches all 12 feeds live (takes ~5–10 seconds). After that, articles are cached in SQLite and responses are near-instant. The cache refreshes automatically every 15 minutes.

### Optional: pre-populate the database

```bash
npm run worker:rss        # fetch once
npm run worker:rss:watch  # fetch every 15 min continuously
```

### Production

```bash
npm run build
npm start
```

## How the auto-refresh works

The API route (`/api/news`) checks how old the most recent data in SQLite is. If it's older than 15 minutes, it fetches all feeds live before responding — no separate daemon or cron job needed. The browser page also auto-refreshes every 15 minutes.

```
Browser → GET /api/news
              ↓
         Check SQLite age
              ↓
     [stale?] → fetch all RSS feeds → upsert to SQLite
              ↓
         Return articles
```

## Project structure

```
briefsec/
├── app/
│   ├── api/news/route.ts   # RSS fetch, SQLite read/write, auto-refresh logic
│   ├── page.tsx            # Main dashboard UI (filters, search, cards)
│   ├── layout.tsx
│   └── globals.css         # Dark theme CSS
├── scripts/
│   └── rss-worker.js       # Standalone ingestion script (optional)
├── db/
│   └── briefsec.sqlite     # Auto-created on first run (gitignored)
└── package.json
```

## License

MIT
