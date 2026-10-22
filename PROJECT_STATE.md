# PROJECT_STATE.md
> The persistent brain of FinSight. Updated at the end of every session.
> **Last Updated:** October 15, 2026

---

## 1. PROJECT IDENTITY

**Project Name:** FinSight
**Tagline:** Smart Finance Tracking
**Full Title:** FinSight — An Intelligent Hybrid Regex-NER Email Parsing Framework for Automated Bank Alert Aggregation and Personal Finance Tracking System
**Repository:** https://github.com/Valxntne/FINSIGHT
**Live Frontend:** https://finsight-ng.vercel.app
**Live Backend:** https://finsight-bankend.onrender.com
**Swagger Docs:** https://finsight-bankend.onrender.com/docs

---

## 2. VISION & BUSINESS MODEL

### Vision
Build Nigeria's most accessible personal finance tracking platform — one that works without open banking APIs by harnessing bank alert emails.

### Target Market
Mass market — every Nigerian bank account holder.

### Business Model
**Freemium.** Free forever with basic features; premium tier unlocks advanced capabilities.

### Monetization Strategy
Premium features will include:
- Multiple Gmail accounts
- Unlimited bank connections
- Advanced analytics & custom reports
- Budget goal tracking
- PDF/Excel export
- Shared family accounts
- Priority support
- Ad-free experience

### Launch Plan
- **Phase 1 (Current):** Polish the core product. Launch-ready as free.
- **Phase 2:** Add premium features. Introduce billing (Paystack/Flutterwave).
- **Phase 3:** Advanced AI insights, mobile app, referral system.
- **Phase 4:** Business accounts, white-label, API access.

### Pricing (Planned)
| Plan | Price | Features |
|------|-------|----------|
| Free | ₦0 | 1 Gmail, 5 banks, basic analytics |
| Premium | ₦2,500/mo or ₦25,000/yr | Multi-Gmail, unlimited banks, budget goals, PDF export |
| Business | ₦10,000/mo | Team accounts, invoicing, advanced reports |

---

## 3. CORE VALUE PROPOSITION

1. **No open banking required** — works via email bank alerts.
2. **Multi-bank aggregation** — one dashboard for GTB, Zenith, Access, UBA, First Bank, and more.
3. **Hybrid Regex-NER parser** — technically superior to pure regex or pure ML.
4. **Zero-cost deployment** — sustainable on free-tier infrastructure.
5. **Real-time awareness** — auto-sync every 2 minutes while user is active.

---

## 4. PROJECT STATUS

| Category | Status |
|----------|--------|
| **Frontend** | ✅ Deployed on Vercel |
| **Backend** | ✅ Deployed on Render |
| **Database** | ✅ Supabase (PostgreSQL) |
| **Authentication** | ✅ Working (email/password) |
| **Gmail Integration** | ✅ Working (OAuth 2.0 with refresh tokens) |
| **Hybrid Parser** | ✅ Working (supports 12+ banks) |
| **Sync System** | ✅ Working (auto-sync, cross-page reactivity) |
| **Thesis Document** | ✅ Complete (submitted for supervisor review) |
| **Phase 1 (Launch Prep)** | 🚧 Starting now |

---

## 5. OWNERSHIP

**Founder & Developer:** Obishai Valentine Onyemaechi
**Matric Number:** PG/25/26/221003
**Institution:** Admiralty University of Nigeria, Ibusa, Delta State
**Supervisor:** Dr. O. K. Akputu
**Programme:** M.Sc. Computer Science

---

---

## 6. TECH STACK (FULL INVENTORY)

### Frontend
| Technology | Version | Purpose |
|------------|---------|---------|
| React.js | 18.x | UI library |
| Vite | 5.x | Build tool & dev server |
| Tailwind CSS | 4.x | Styling (utility-first) |
| Framer Motion | 11.x | Animations |
| Recharts | 2.x | Charts & data visualization |
| Axios | 1.x | HTTP client |
| Lucide React | Latest | Icon library |
| React Router DOM | 6.x | Client-side routing |
| clsx | Latest | Conditional className |
| tailwind-merge | Latest | Tailwind class merging |
| shadcn/ui | Latest | Component primitives (Radix UI based) |

### Backend
| Technology | Version | Purpose |
|------------|---------|---------|
| FastAPI | 0.115 | REST API framework |
| Python | 3.11 | Runtime |
| Uvicorn | 0.32 | ASGI server |
| spaCy | 3.7.5 | Named Entity Recognition |
| Google API Client | 2.149 | Gmail API integration |
| Pydantic | 2.9 | Request/response validation |
| python-jose | 3.3 | JWT handling |
| passlib | 1.7.4 | Password hashing (fallback) |
| python-multipart | 0.0.12 | File uploads |

### Database & Auth
| Service | Purpose |
|---------|---------|
| Supabase (PostgreSQL) | Primary database |
| Supabase Auth | User authentication |
| Supabase Storage | Avatar storage |
| Row-Level Security (RLS) | Data isolation per user |

### DevOps & Deployment
| Tool | Purpose |
|------|---------|
| Git + GitHub | Version control |
| Vercel | Frontend hosting |
| Render | Backend hosting |
| GitHub Actions | (Not yet configured) CI/CD |

### Development Environment
| Tool | Purpose |
|------|---------|
| VS Code | Primary IDE |
| Chrome DevTools | Frontend debugging |
| Postman / Swagger UI | API testing |
| draw.io / Mermaid | Diagram creation |

---

## 7. SYSTEM ARCHITECTURE

### High-Level Layers

┌─────────────────────────────────────────────────────────┐
│ PRESENTATION LAYER │
│ React + Vite + Tailwind + Framer Motion (Vercel) │
└─────────────────────────────────────────────────────────┘
│
▼ (HTTPS + JWT)
┌─────────────────────────────────────────────────────────┐
│ APPLICATION LAYER │
│ FastAPI (Render) │
│ ├── Auth Service (Supabase Auth) │
│ ├── Gmail Service (Google API Client) │
│ ├── Hybrid Regex-NER Parser (spaCy) │
│ ├── Account Service │
│ ├── Transaction Service │
│ └── Category Service │
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ DATA LAYER │
│ Supabase (PostgreSQL + Storage + RLS) │
│ Tables: users, accounts, transactions, deleted_gmail_ids│
└─────────────────────────────────────────────────────────┘
│
▼
┌─────────────────────────────────────────────────────────┐
│ EXTERNAL SYSTEMS │
│ Gmail API (Google OAuth 2.0) │
└─────────────────────────────────────────────────────────┘


### Key Architectural Decisions

1. **Monolithic backend** — Simpler to deploy and maintain than microservices for now. Can split later if needed.
2. **Supabase for everything data** — Auth, database, storage in one platform. Reduces vendor complexity.
3. **Global SyncContext** — Sync state is shared across all pages. One sync triggers UI updates everywhere.
4. **Hybrid parsing at backend** — Regex + NER runs server-side. Frontend only sends alerts and receives structured data.
5. **Zero-cost first** — All infrastructure on free tier. Upgrade when revenue justifies it.

---

## 8. DATABASE SCHEMA

### `users` table
```sql
id                uuid (PK)   -- references auth.users
email             text        -- unique
full_name         text
phone             text
avatar_url        text
plan              text        -- 'free' | 'premium' | 'business'
currency          text        -- default 'NGN'
language          text        -- default 'en'
-- Gmail OAuth
gmail_email            text
gmail_connected        boolean
gmail_access_token     text
gmail_refresh_token    text
gmail_token_expiry     timestamptz
-- Notifications
notification_email        boolean
notification_push         boolean
notification_transactions boolean
notification_marketing    boolean
created_at        timestamptz
updated_at        timestamptz

accounts table
sql
id                uuid (PK)
user_id           uuid (FK → users.id)
bank_name         text
account_number    text
account_type      text        -- 'savings' | 'current' | 'domiciliary'
balance           numeric
currency          text        -- default 'NGN'
notes             text
is_active         boolean     -- true = active, false = archived
created_at        timestamptz
updated_at        timestamptz
transactions table
sql
id                uuid (PK)
user_id           uuid (FK → users.id)
account_id        uuid (FK → accounts.id, nullable)
amount            numeric
transaction_type  text        -- 'credit' | 'debit'
merchant          text
account_number    text
balance_after     numeric
transaction_date  timestamptz
confidence        float       -- parser confidence 0.0 – 1.0
category          text
bank_name         text
raw_text          text        -- original email or 'gmail_id:xxx'
created_at        timestamptz
deleted_gmail_ids table
sql
id                uuid (PK)
user_id           uuid (FK → users.id)
gmail_id          text
deleted_at        timestamptz
RLS Policies
All tables have RLS enabled with policies restricting access to auth.uid() = user_id.

9. API ENDPOINTS (CURRENT)
Auth (/api/auth)
Method	Endpoint	Purpose
POST	/signup	Register new user
POST	/login	Login
GET	/me	Get current user
PATCH	/profile	Update profile
PATCH	/preferences	Update preferences
PATCH	/notifications	Update notification settings
POST	/avatar	Upload avatar
POST	/change-password	Change password
DELETE	/account	Delete account
Accounts (/api/accounts)
Method	Endpoint	Purpose
GET	/	List active accounts
POST	/	Create account
GET	/{id}	Get single account
PATCH	/{id}	Update account
DELETE	/{id}	Soft-delete (archive)
GET	/archived	List archived accounts
POST	/{id}/restore	Restore archived account
Transactions (/api/transactions)
Method	Endpoint	Purpose
GET	/	List (paginated, filterable)
GET	/stats	Dashboard stats
GET	/analytics	Analytics for charts
GET	/{id}	Get single transaction
PATCH	/{id}	Update (category)
DELETE	/{id}	Delete + track gmail_id
POST	/parse-and-save	Parse and persist alert
Parser (/api/parser)
Method	Endpoint	Purpose
POST	/parse	Parse a single alert
POST	/parse-batch	Parse multiple alerts
GET	/samples	Get sample alerts
GET	/parse-sample/{id}	Parse a sample
Gmail (/api/gmail)
Method	Endpoint	Purpose
GET	/connect	Get OAuth URL
GET	/callback	Handle OAuth callback
GET	/status	Check connection
GET	/fetch	Fetch alerts (no save)
POST	/sync	Sync + parse + save
POST	/disconnect	Disconnect Gmail
text

---

markdown
---

## 10. PROJECT FILE STRUCTURE

### Repository Root
finsight/
├── PROJECT_STATE.md ← THIS FILE (the brain)
├── README.md ← Public-facing project readme
├── .gitignore
├── frontend/ ← React app (Vercel)
└── backend/ ← FastAPI app (Render)

text

### Frontend Structure
frontend/
├── public/
│ ├── favicon.svg
│ └── (other static assets)
├── src/
│ ├── components/ ← Reusable UI components
│ │ ├── AuroraBackground.jsx
│ │ ├── AuthInput.jsx
│ │ ├── BankLogo.jsx
│ │ ├── ConnectEmailButton.jsx
│ │ ├── Layout.jsx
│ │ ├── SearchDropdown.jsx
│ │ ├── ThemeToggle.jsx
│ │ └── (more components as we build)
│ ├── context/ ← React Context providers
│ │ ├── AuthContext.jsx
│ │ ├── AuthProvider.jsx
│ │ ├── NavigationContext.jsx
│ │ ├── NavigationProvider.jsx
│ │ ├── SearchContext.jsx
│ │ ├── SearchProvider.jsx
│ │ ├── SyncContext.js ← Context object only
│ │ ├── SyncContext.jsx ← Provider only
│ │ └── ThemeContext.jsx
│ ├── hooks/ ← Custom hooks
│ │ ├── useAuth.js
│ │ ├── useNavigation.js
│ │ ├── useSearch.js
│ │ └── useSync.js
│ ├── lib/ ← Utilities
│ │ └── utils.js ← cn() helper
│ ├── pages/ ← Page-level components
│ │ ├── Accounts.jsx
│ │ ├── Analytics.jsx
│ │ ├── Dashboard.jsx
│ │ ├── Login.jsx
│ │ ├── Parser.jsx
│ │ ├── Settings.jsx
│ │ ├── Signup.jsx
│ │ └── Transactions.jsx
│ ├── services/ ← API clients
│ │ ├── accountService.js
│ │ ├── api.js ← Axios instance
│ │ ├── authService.js
│ │ ├── autoSyncService.js
│ │ ├── gmailService.js
│ │ ├── parserService.js
│ │ └── transactionService.js
│ ├── utils/ ← Helpers & constants
│ │ ├── banks.js
│ │ └── settingsData.js
│ ├── App.jsx
│ ├── main.jsx
│ └── index.css
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── vercel.json ← SPA routing config
└── jsconfig.json ← Path aliases

text

### Backend Structure
backend/
├── app/
│ ├── api/
│ │ ├── deps.py ← Dependencies (get_current_user)
│ │ ├── router.py ← Master router
│ │ └── endpoints/
│ │ ├── auth.py
│ │ ├── accounts.py
│ │ ├── transactions.py
│ │ ├── parser.py
│ │ └── gmail.py
│ ├── core/
│ │ ├── config.py ← Settings (env vars)
│ │ └── supabase_client.py
│ ├── models/ ← (Not heavily used; Pydantic in schemas)
│ ├── schemas/
│ │ ├── auth.py
│ │ ├── account.py
│ │ ├── transaction.py
│ │ └── parser.py
│ ├── services/
│ │ ├── account_service.py
│ │ ├── auth_service.py
│ │ ├── category_service.py
│ │ ├── gmail_service.py
│ │ ├── gmail_sync_service.py
│ │ ├── transaction_service.py
│ │ └── parsers/
│ │ ├── init.py
│ │ ├── hybrid_parser.py
│ │ ├── regex_parser.py
│ │ ├── ner_parser.py
│ │ └── bank_patterns.py
│ ├── utils/
│ │ └── (helpers as needed)
│ └── main.py ← FastAPI app entry
├── tests/
├── requirements.txt
├── render.yaml
└── .env.example

text

---

## 11. FEATURE STATUS MAP

### ✅ COMPLETE (Launch-Ready)

| Feature | Frontend | Backend | Notes |
|---------|----------|---------|-------|
| Email/password signup | ✅ | ✅ | Supabase Auth |
| Email/password login | ✅ | ✅ | JWT-based |
| Session persistence | ✅ | ✅ | Token in localStorage |
| Auto-logout on 401 | ✅ | ✅ | Axios interceptor |
| Dashboard UI | ✅ | ✅ | Cash flow, stats, recent tx |
| Accounts CRUD | ✅ | ✅ | Create, edit, delete, archive, restore |
| Transactions list | ✅ | ✅ | Paginated, filterable |
| Transaction detail modal | ✅ | ✅ | Copy, hide, delete, edit category |
| Analytics dashboard | ✅ | ✅ | Area/bar/donut charts |
| Parser playground | ✅ | ✅ | Test parser with samples |
| Gmail OAuth connect | ✅ | ✅ | Refresh token with prompt=consent |
| Gmail auto-sync | ✅ | ✅ | Every 2 min + on visibility |
| Hybrid Regex-NER parser | — | ✅ | 12+ bank formats |
| Auto-categorization | — | ✅ | Keyword-based |
| Dark/Light theme toggle | ✅ | — | Persisted in localStorage |
| Cross-page sync reactivity | ✅ | — | SyncContext broadcast |
| Delete persistence | — | ✅ | deleted_gmail_ids table |
| Row-Level Security | — | ✅ | All tables protected |
| Mobile responsive | ✅ | — | Tested on Chrome DevTools |
| Vercel deployment | ✅ | — | Auto-deploy from main |
| Render deployment | ✅ | — | Free tier |

### 🚧 IN PROGRESS

| Feature | Status | Priority |
|---------|--------|----------|
| Landing page (marketing) | Not started | Phase 1 |

### 📋 PLANNED (Phase 1 — Launch Prep)

| Feature | Priority | Est. Effort |
|---------|----------|-------------|
| Landing page (marketing site) | 🔴 High | 3-5 days |
| Onboarding tour for new users | 🔴 High | 2-3 days |
| Password reset flow | 🔴 High | 1-2 days |
| Email notifications (transaction alerts) | 🟡 Medium | 2-3 days |
| Google Sign-In (OAuth) | 🟡 Medium | 1 day |
| PWA (installable on mobile) | 🟡 Medium | 2 days |
| Privacy Policy + Terms of Service | 🔴 High (legal) | 1 day writing |

### 🎯 PLANNED (Phase 2 — Monetization)

| Feature | Notes |
|---------|-------|
| Budget goals | Per-category monthly limits |
| Multi-account Gmail | Connect 2+ accounts |
| Custom categories | User-defined |
| Recurring transaction detection | Auto-flag subscriptions |
| PDF export | Professional reports |
| Billing (Paystack/Flutterwave) | Premium tier |
| Premium tier gating | Feature flags |

### 🔮 PLANNED (Phase 3+ — Scale)

| Feature | Notes |
|---------|-------|
| AI-powered insights | "You spent 30% more on X" |
| Anomaly detection | Flag unusual transactions |
| Shared family accounts | Multi-user household |
| Mobile native app | React Native |
| Referral system | Invite friends, get rewards |
| Bank direct integration | Mono / direct APIs |

---

## 12. KNOWN ISSUES & TECH DEBT

### 🔴 Critical (Fix Before Public Launch)

| Issue | Impact | Notes |
|-------|--------|-------|
| No password reset flow | Users cannot recover accounts | Must add before launch |
| No rate limiting on parser endpoint | Abuse possible | Add middleware |
| No input sanitization on parser | Potential XSS via merchant names | Sanitize all outputs |
| Gmail tokens stored in plaintext | Security risk if DB compromised | Encrypt at rest |
| No 2FA | Optional but recommended | Post-launch |
| No Terms/Privacy Policy | Legal requirement | Draft before launch |

### 🟡 Important (Fix Soon After Launch)

| Issue | Impact | Notes |
|-------|--------|-------|
| Render free tier sleeps after 15 min | 60s cold start | Upgrade when revenue allows |
| No analytics tracking | Cannot measure user behavior | Add Plausible/PostHog |
| No error monitoring | Blind to production bugs | Add Sentry |
| No automated tests | Regression risk | Add pytest + Vitest |
| No CI/CD | Manual deploys | GitHub Actions |

### 🟢 Minor (Nice to Have)

| Issue | Impact | Notes |
|-------|--------|-------|
| jsconfig.json shows deprecation warning | Cosmetic | Silence with ignoreDeprecations |
| Tailwind lint warnings | Cosmetic | Auto-fixable |
| Bundle size could be smaller | Performance | Code splitting |
| No SEO metadata | Marketing | Add meta tags to landing page |

### 🐛 Known Bugs

| Bug | Status | Notes |
|-----|--------|-------|
| (None currently tracked) | — | Add here as we discover them |

### Pricing Strategy (Phase 2 Blocker)
- **Current State:** The pricing section on the landing page is a UI placeholder.
- **Action Required:** Before launching paid tiers, we must audit the actual feature list. Do NOT promise features that are not built (e.g., invoicing, team accounts, API access). Revise the Starter, Premium, and Business tiers to reflect only what is currently shipped or guaranteed to ship in the immediate update.

---

## 13. DEPLOYMENT CONFIGURATION

### Vercel (Frontend)
- **Framework:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Node Version:** 18+
- **Auto-Deploy:** On push to `main` branch
- **Environment Variables:**
  - `VITE_API_URL` → `https://finsight-bankend.onrender.com/api`

### Render (Backend)
- **Runtime:** Python 3.11
- **Build Command:**
pip install --upgrade pip && pip install -r requirements.txt && python -m spacy download en_core_web_sm

text
- **Start Command:**
uvicorn app.main:app --host 0.0.0.0 --port $PORT

text
- **Plan:** Free (upgrade when needed)
- **Environment Variables:**
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_KEY`
- `JWT_SECRET`
- `JWT_ALGORITHM=HS256`
- `JWT_EXPIRY_MINUTES=1440`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI`
- `FRONTEND_URL`
- `APP_NAME=FinSight`
- `APP_VERSION=0.1.0`
- `DEBUG=False`
- `API_PREFIX=/api`

### Supabase (Database + Auth)
- **Region:** (whatever you chose)
- **Plan:** Free
- **Tables:** users, accounts, transactions, deleted_gmail_ids
- **RLS:** Enabled on all tables

---

WORKFLOW, HANDOFF PROTOCOL & SESSION LOG
markdown
---

## 14. DEVELOPMENT WORKFLOW & AI HANDOFF PROTOCOL

### The Golden Rules (Read Every Session)

1. **One feature per response.** No AI sends 5 files at once. Small chunks only.
2. **No rewriting existing code** unless necessary. Diffs or new files only.
3. **Update this file** (`PROJECT_STATE.md`) every 2–3 features.
4. **Commit after every feature:**
   ```bash
   git add .
   git commit -m "Feature: <short description>"
   git push
If AI cuts off mid-response: say "continue from where you stopped" — the AI picks up immediately.

If new chat needed: paste this file. AI is instantly synced.

Session Startup Checklist
Before every session, the human (Valentine) does:

□ Paste PROJECT_STATE.md into the AI chat (if new chat or long context)
□ State the current task clearly (one feature at a time)
□ Confirm the AI knows where we stopped
The AI (DeepSeek / Claude / ChatGPT) does:

□ Reads the current state
□ Confirms the current task
□ Produces one feature in small, focused output
□ Ends with an updated PROJECT_STATE.md section if state changed
Which AI Does What
Task	Best Tool	Why
Backend logic, API design	DeepSeek	Strong at Python + architecture
Database schema, SQL	DeepSeek	Strong at SQL and relational thinking
Frontend architecture	DeepSeek	Strong at React patterns
Landing page copywriting	Claude.ai	Better prose
Long-form document styling	Claude.ai	Better formatting passes
Debugging tricky bugs	Either	Try both if stuck
Thesis/document editing	Claude.ai	Longer context, better prose
Design feedback / UX critique	Either	Try both
Diagram generation (Mermaid)	DeepSeek	Cleaner Mermaid output
Emergency backup	ChatGPT	If both others hit limits
The Handoff Loop (What We Do Every Time)
text
┌──────────────────────────────────────────────┐
│  1. Human: State the one task for this turn  │
└──────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  2. AI: Produce focused output for that task │
│     (small enough to fit response limit)     │
└──────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  3. Human: Paste into project, test locally  │
└──────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  4. Human: Commit and push                   │
└──────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  5. AI: Update PROJECT_STATE.md if needed    │
└──────────────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────┐
│  6. Move to next task (repeat)               │
└──────────────────────────────────────────────┘
Emergency Recovery Protocol
Situation	What To Do
AI cuts off mid-message	Say "continue from where you stopped"
AI forgets context	Paste PROJECT_STATE.md again
AI starts hallucinating	Stop. Paste PROJECT_STATE.md. Restart task.
Stuck on a bug for 30+ min	Switch AI tool. Fresh perspective.
Chat window too long / context lost	Start new chat. Paste PROJECT_STATE.md.
15. SESSION LOG (CHRONOLOGICAL HISTORY)
Legend
🟢 Session completed successfully

🟡 Session had issues but recovered

🔴 Session was blocked / abandoned

Session 001 — Initial Setup (Early October 2026) 🟢
Set up Node.js, npm, Git

Created Vite + React project

Set up VS Code with extensions

Fixed Tailwind CSS v4 setup

Built responsive Layout with sidebar

Added Framer Motion animations

Set up Theme Context (dark/light mode)

Built Dashboard with stat cards

Built Login + Signup pages with aurora background

Built Accounts page with CRUD modals

Built Transactions page

Built Analytics page with Recharts

Built Parser Playground

Built Settings page

Session 002 — Sync & Gmail (Mid October 2026) 🟢
Set up Supabase (PostgreSQL + Auth)

Set up FastAPI backend

Deployed backend to Render

Deployed frontend to Vercel

Built Gmail OAuth integration

Fixed refresh token issue (prompt=consent)

Built Hybrid Regex-NER parser

Built Gmail sync service

Built deleted_gmail_ids table

Implemented RLS policies

Built SyncContext with broadcast

Wired Dashboard, Accounts, Transactions, Analytics to sync events

Fixed auto-sync across tabs

Fixed delete persistence

Session 003 — Thesis Writing (Mid October 2026) 🟢
Wrote full thesis (Front Matter, Ch 1–5, References, Appendices)

Created Mermaid diagrams (Architecture, ERD, Pipeline)

Compiled References (APA 7th)

Reviewed and fixed typos

Prepared for supervisor submission

Session 004 — Project Handoff System (October 15, 2026) 🟢
Agreed on PROJECT_STATE.md system

Built this file

Ready to begin Phase 1 (Launch Prep)

Session 005+ — Phase 1 Build (Starting soon) 🚧
(This section will be updated after every session)

16. CURRENT SPRINT — PHASE 1 (LAUNCH PREP)
Sprint Goal
Polish FinSight to launch-ready quality as a free product.

Sprint Backlog (Ordered by Priority)
#	Task	Status	Owner	Notes
1	Build landing page	📋 Planned	Human + AI	Marketing site at /
2	Build onboarding tour	📋 Planned	Human + AI	For first-time users
3	Build password reset flow	📋 Planned	Human + AI	Critical missing
4	Add email notifications	📋 Planned	Human + AI	Transaction alerts
5	Add Google Sign-In	📋 Planned	Human + AI	Faster signup
6	Add PWA support	📋 Planned	Human + AI	Installable
7	Write Privacy Policy + ToS	📋 Planned	Human	Legal docs
8	Add error monitoring (Sentry)	📋 Planned	Human + AI	Production visibility
9	Add basic rate limiting	📋 Planned	Human + AI	Security
10	Set up CI/CD	📋 Planned	Human + AI	GitHub Actions
Definition of Done (For Each Task)
□ Code is written and committed
□ Tested locally (frontend + backend)
□ Deployed to production (Vercel + Render)
□ Tested on live URL
□ Tested on mobile simulator
□ No console errors
□ PROJECT_STATE.md updated
17. NEXT SESSION INSTRUCTIONS
For the Human (Valentine)
When you start the next session:

Open the AI tool (DeepSeek for backend/logic, Claude for styling/docs)

Paste this entire PROJECT_STATE.md into the chat

State the ONE task for the session

Example starter message:

"Resuming FinSight Phase 1. Here's the PROJECT_STATE.md. Today I want to build the landing page hero section only. Step by step."

For the AI
When you receive this file:

Read it fully before responding

Acknowledge the current state in 1–2 sentences

Ask for the specific task (or confirm it if stated)

Produce ONE feature — small, focused, production-quality

Do not rewrite existing code unless asked

End with a note if PROJECT_STATE.md needs updating

The Very Next Task (When Ready)
Build the Landing Page. It's the highest priority for launch because:

New users need to know what FinSight is

It's the first impression

It sets up the signup flow

It's SEO-discoverable

Landing page sections (in order):

Hero (headline, subheadline, CTA buttons, hero image)

Features (3–4 key benefits)

How It Works (3 steps)

Screenshots / Product preview

Trust signals (security, privacy)

Pricing (Free vs Premium teaser)

FAQ

Final CTA

Footer

18. HOW TO CREATE AND USE THIS FILE
Step 1: Create the File
Location: Repo root, alongside README.md

text
finsight/
├── PROJECT_STATE.md    ← Create here
├── README.md
├── frontend/
├── backend/
└── .gitignore
How to create in VS Code:

Open VS Code at C:\Users\hp\Desktop\finsight

Right-click the root folder in Explorer

Click New File

Name it: PROJECT_STATE.md

Paste all 4 parts (this and previous responses)

Save (Ctrl + S)

Step 2: Commit and Push
bash
cd C:\Users\hp\Desktop\finsight
git add PROJECT_STATE.md
git commit -m "Add PROJECT_STATE.md — project brain for AI handoff"
git push
Step 3: Use Every Session
At the START of a session (especially new chat):

Copy the entire PROJECT_STATE.md content

Paste into AI chat

Say: "Here's the current state. Today I want to work on [task]."

At the END of a session:

If state changed, ask AI: "Update PROJECT_STATE.md with the changes we made today."

Copy the updated version back into the file

Commit and push

Step 4: Keep It Clean
This file should always be:

Accurate (reflect the truth of the project)

Current (updated after every session)

Complete (no missing sections)

If it grows too long, we split into:

PROJECT_STATE.md — current state only

PROJECT_HISTORY.md — session log archive

Step 5: Never Delete It
Even after Phase 1, Phase 2, Phase 3... this file lives on. It's the source of truth for anyone (including future you) picking up the project.

19. QUICK REFERENCE CARD
Keep this cheat sheet handy:

Situation	Action
Starting a new session	Paste PROJECT_STATE.md into AI
AI cuts off mid-response	Say "continue from where you stopped"
AI forgets context	Paste PROJECT_STATE.md again
Finished a feature	Commit + push + update state file
Stuck on a bug	Switch AI tools
Chat window too long	Start new chat + paste state file
Need styling/copy help	Use Claude.ai
Need backend/logic help	Use DeepSeek (me)
Need emergency backup	Use ChatGPT
20. VERSION HISTORY
Date	Version	Changes
Oct 15, 2026	v1.0	Initial PROJECT_STATE.md created — full project brain

## 21. CODE CONVENTIONS & PATTERNS

### Frontend Patterns
- **Component style:** Functional components with named exports
- **Styling:** Tailwind v4 (use `bg-linear-to-br`, not `bg-gradient-to-br`)
- **Animations:** Framer Motion (`motion.div`, `AnimatePresence`)
- **State:** React Context for global, useState for local
- **API calls:** Via service modules in `src/services/`
- **Icons:** Lucide React only
- **Class helper:** `cn()` from `src/lib/utils.js`

### Backend Patterns
- **Framework:** FastAPI with dependency injection
- **Auth:** `Depends(get_current_user)` on protected routes
- **DB client:** `supabase` (service role) for admin ops
- **Validation:** Pydantic schemas
- **Error handling:** Raise `HTTPException` with `status_code` + `detail`

### Naming Conventions
- **React components:** `PascalCase.jsx`
- **Hooks:** `useCamelCase.js`
- **Services:** `camelCaseService.js`
- **Python modules:** `snake_case.py`
- **Python classes:** `PascalCase`

### Key Component APIs (quick reference)
- `useSync()` → `{ isConnected, gmailEmail, isSyncing, syncNow, connect, disconnect, subscribe, broadcastRefresh }`
- `useAuth()` → `{ user, isAuthenticated, login, signup, logout, refreshUser }`
- `useNavigation()` → `{ activePage, setActivePage }`
- `transactionService.getTransactions({ page, pageSize, transactionType, bankName })`
- `gmailService.syncEmails(maxResults)`

## 22. RECENT FILE CHANGES

### Session 004 (October 15, 2026)
- `PROJECT_STATE.md` — Created (this file)

### Session 005 (Next)
- Files to be added as we build

---

AI CODE ACCESS PERMISSION

### Permission Granted
The AI assistant has **permission to request** any code file(s) from the human when needed to:
- Understand existing patterns before building new features
- Debug issues that span multiple files
- Refactor or upgrade existing code
- Ensure consistency with the current codebase

### How It Works
When the AI needs to see a file, it will ask:
> "Please paste `frontend/src/components/Layout.jsx` so I can match its patterns."

The human pastes the file content. The AI reads it. The AI then produces code that fits.

### When AI Should Request Files
- **Before building new components** that should match existing ones
- **Before refactoring** any existing code
- **When debugging** bugs that might come from other files
- **Before adding new dependencies** (to check what's already installed)
- **When the AI is uncertain** about a pattern

### When AI Should NOT Request Files
- **If it already saw the file in this session** — use the existing knowledge
- **If it's a fresh build** with no existing precedent — just build cleanly
- **If the file is trivially standardized** (e.g., simple config files) — use best practices

### Anti-Hoarding Rule
If the AI has already seen a file **in the current chat**, it should NOT ask for it again. It should reference it from memory.

---

CODE CONVENTIONS & PATTERNS

### Frontend Patterns
- **Component style:** Functional components with named exports
- **Styling:** Tailwind v4 (use `bg-linear-to-br`, NOT `bg-gradient-to-br`)
- **Animations:** Framer Motion (`motion.div`, `AnimatePresence`)
- **State:** React Context for global, useState for local
- **API calls:** Via service modules in `src/services/`
- **Icons:** Lucide React only
- **Class helper:** `cn()` from `src/lib/utils.js`
- **Routing:** `activePage` via `useNavigation()` (no react-router for app pages, yet)
- **Theming:** `useTheme()` returns `{ theme, toggleTheme }` — dark/light

### Backend Patterns
- **Framework:** FastAPI with dependency injection
- **Auth:** `Depends(get_current_user)` on protected routes
- **DB client:** `supabase` (service role) for admin ops
- **Validation:** Pydantic schemas
- **Error handling:** Raise `HTTPException` with `status_code` + `detail`
- **Modules:** Service layer wraps Supabase + business logic
- **CORS:** Handled in `app/main.py`

### Naming Conventions
- **React components:** `PascalCase.jsx`
- **Hooks:** `useCamelCase.js`
- **Services:** `camelCaseService.js`
- **Python modules:** `snake_case.py`
- **Python classes:** `PascalCase`
- **DB columns:** `snake_case`

### Custom Tailwind Utilities (from `index.css`)
- `.glass` — Glassmorphism background + border
- `.gradient-text` — Blue → cyan gradient text

### Key Context APIs
- `useSync()` → `{ isConnected, gmailEmail, isSyncing, statusLoading, lastSyncTime, lastResult, refreshStatus, syncNow, connect, disconnect, subscribe, broadcastRefresh }`
- `useAuth()` → `{ user, isLoading, isAuthenticated, login, signup, logout, refreshUser }`
- `useNavigation()` → `{ activePage, setActivePage }`
- `useSearch()` → `{ searchQuery, setSearchQuery }`
- `useTheme()` → `{ theme, toggleTheme }`

### Key Service Modules
- `api.js` — Axios instance with JWT interceptor + 401 auto-logout
- `authService.js` — signup, login, profile, password, delete account
- `accountService.js` — account CRUD + archive/restore
- `transactionService.js` — list, stats, analytics, parse, delete, category update
- `parserService.js` — parse, parse-batch, samples
- `gmailService.js` — connect, status, sync, disconnect
- `autoSyncService.js` — background auto-sync orchestration

---

## 23. RECENT FILE CHANGES

### Session 004 (October 15, 2026)
- `PROJECT_STATE.md` — Created (project brain)

### Session 005 (October 16, 2026)
- `PROJECT_STATE.md` — Added sections 21–23 (AI code access, conventions, file changes)

### Session 006+ (Coming up)
- Files to be added as we build the landing page
- Will be logged here after each session

---

## 24. SESSION LOG UPDATE

### Session 005 — Landing Page (Hero, Features, Mobile Showcase) 🟢
- **Routing & App.jsx:** Updated `App.jsx` to include Landing page logic. If unauthenticated, users see the Landing page before Auth.
- **LandingNav:** Created a sticky, scroll-aware navigation bar with mobile menu and theme toggle.
- **Hero Section:** Built a premium Hero with animated aurora backgrounds. 
- **Stacked Previews:** Implemented an interactive stacked-carousel for the desktop preview. Includes 3 synced screenshots (Dashboard, Analytics, Accounts). 
- **Hidden Controls:** Replaced visible arrows with invisible left/right click zones on the preview to change stacks.
- **Features Section:** Built the Features section with 4 alternating rows (Auto-Parse, Multi-Bank, Insights, Security) using the AI-generated images (now correctly linking `.jpg`).
- **Mobile Showcase Section:** Created a dedicated section for mobile. Removed the messy overlap and used the newly generated transparent phone mockup image (`Phone-mockup.png`) floating cleanly.
- **Theme Support:** Wired the entire Landing page to `useTheme()` so light/dark mode works perfectly across all new components.

---

## 25. NEXT SESSION INSTRUCTIONS

### The Immediate Next Task
**Build the "How It Works" section for the Landing Page.**

### Design Plan for "How It Works"
- **Section Header:** "How FinSight Works" with a brief subtitle.
- **3-Step Flow:** 
  1. *Connect your Gmail* (Secure OAuth)
  2. *Auto-Parse* (Hybrid Regex-NER engine extracts data)
  3. *Track & Save* (See real-time insights and dashboards)
- **Visuals:** Use icons, connecting lines (Framer Motion animated), and alternating light/dark mode cards.
- **Components:** Create `frontend/src/components/landing/HowItWorks.jsx` and add it to `Landing.jsx`.

### Remaining Landing Page Sections (After How It Works)
- Security & Privacy
- Pricing
- FAQ
- Final CTA
- Footer

---

## 26. SESSION LOG UPDATE

### Session 006 — Landing Page Completion 🟢
- **Landing Page Complete:** Hero, Mobile Showcase, Features, How It Works, Pricing, FAQ, Final CTA, and Footer are all built and responsive.
- **Pricing Section:** Built a 3-tier pricing table (Starter, Premium, Business) with a monthly/yearly toggle. *Note: Pricing tiers are placeholders and need auditing before real monetization.*
- **FAQ Section:** Built an animated accordion for frequently asked questions.
- **Footer:** Created a responsive footer with links and custom SVG icons for social media (replaced removed Lucide brand icons).
- **Fixes:** Resolved `window.location` ESLint warning in Pricing. Resolved blank-screen crash caused by Lucide removing brand icons by creating custom SVG components.

---

## 27. NEXT SESSION INSTRUCTIONS

### The Immediate Next Tasks (Phase 1)
Now that the Landing Page is done, we need to focus on the actual application routing and user flow.

1. **Landing Page Session Logic:** Update `App.jsx` to implement the 15-minute session logic. If a user is logged in but hasn't been active for >15 mins, show the landing page first. If they just logged in or refreshed recently, take them straight to the Dashboard.
2. **Auth Back to Home:** Add a "Back to Home" button on the Login and Signup pages so users can return to the landing page if they change their mind.
3. **Password Reset Flow:** Build the "Forgot Password" page and wire up the Supabase password reset functionality. (Critical for launch).
4. **Onboarding Tour:** Build the step-by-step tutorial for first-time users.

### Notes for Future (Phase 2+)
- **Footer:** Add real social media links (X, GitHub, LinkedIn) and real legal pages (Privacy Policy, Terms of Service).
- **Pricing:** Audit the actual built features and revise the pricing tiers before launching paid plans.

---

## 28. SESSION LOG UPDATE

### Session 007 — App Routing & Navigation Polish 🟢
- **Session Logic (App.jsx):** Implemented the 15-minute inactivity logic. Users who have been away for >15 mins are shown the Landing Page first, while active users go straight to the Dashboard. Wrapped in a `setTimeout` to satisfy React 19 strict mode warnings.
- **Auth Pages:** Replaced the clunky "Back to Home" button on Login and Signup with clickable brand logos (desktop and mobile versions). Much cleaner, modern SaaS pattern.
- **Sidebar Logo:** Updated `Layout.jsx` to make the "FinSight" branding in the sidebar clickable. Clicking it now resets the view back to the Landing Page (`onGoHome`).
- **Fixes:** Replaced broken Lucide brand icons (Twitter/GitHub) with custom inline SVGs in the Footer to prevent Vite build crashes.

---

## 29. NEXT SESSION INSTRUCTIONS

### The Immediate Next Task
**Build the Password Reset Flow.**

### Design Plan for Password Reset
1. **Forgot Password UI:** Add a "Forgot Password?" view or modal triggered from the Login page. It should just ask for the user's email.
2. **Supabase Trigger:** Wire the submit button to call `supabase.auth.resetPasswordForEmail(email)`.
3. **Update Password UI:** Create a page/route where users land after clicking the email link (Supabase redirects them with a token). This page will have two fields: "New Password" and "Confirm Password".
4. **Update logic:** Call `supabase.auth.updateUser({ password: new_password })` and redirect them to the dashboard with a success toast.

### Remaining Tasks (Phase 1)
- Onboarding Tour for new users
- Email notifications (transaction alerts)
- Google Sign-In (OAuth)
- PWA (installable on mobile)
- Error monitoring (Sentry)
- Basic rate limiting on backend
- Set up CI/CD (GitHub Actions)
---

---

## 30. SESSION LOG UPDATE

### Session 008 — Dashboard Upgrades & Data Integrity 🟢
- **Dashboard UX Overhaul:** Replaced the generic "Total Transactions" card with a highly actionable **"Today Cash Flow"** card. It dynamically calculates money in/out for the current day (WAT timezone) and displays a `+` or `-` sign with color coding (Green for positive, Red for negative).
- **Empty State Fix:** The "Today Cash Flow" card now hides the Positive/Negative badge if `today_income` and `today_expenses` are both 0.
- **Timezone Fix:** Updated backend `get_stats()` to calculate "Today" using West Africa Time (UTC+1) instead of UTC, ensuring transactions sync to the correct calendar day for Nigerian users.
- **Duplicate Data Fix (Self-Healing):** 
  - Added a `deduplicate_transactions()` function to the backend.
  - Hooked it into the `gmail_sync_service` so that every time a sync runs, it cleans up any exact duplicates (based on `raw_text`) before finishing.
  - Updated `create_transaction` to use `upsert` (on conflict ignore) for Gmail IDs.
  - Added a SQL `UNIQUE(user_id, raw_text)` constraint to the Supabase `transactions` table.
- **Landing Page Polish:** Added a "Back to Home" link via the clickable brand logo on Login, Signup, and Sidebar. Fixed Vercel build errors by replacing broken Lucide brand icons with custom inline SVGs.

---

## 31. NEXT SESSION INSTRUCTIONS

### The Immediate Next Tasks (Phase 1)
Now that the Dashboard is solid and duplicates are handled, we need to focus on account recovery and user onboarding.

1. **Password Reset Flow (Critical):** 
   - Create the UI for "Forgot Password" on the Login page.
   - Wire up Supabase `resetPasswordForEmail`.
   - Create the "Update Password" screen that users land on after clicking the email link.
2. **Onboarding Tour:** Build the step-by-step tutorial for first-time users (can use `react-joyride` or a custom Framer Motion overlay).
3. **Email Notifications:** Backend cron job or Supabase edge function to send transaction alerts via email.

### Notes for Future (Phase 2+)
- **Pricing Tier Audit:** Do not launch paid plans until we verify exactly which features are built vs. promised.
- **Footer Links:** Replace `#` placeholders with real URLs (X, GitHub, LinkedIn, Privacy Policy, Terms of Service).

---

## 32. SESSION LOG UPDATE

### Session 009 — Network Error Fix & Deduplication 🟢
- **Supabase Network Fix:** Resolved the `[Received pseudo-header in trailer]` error that was breaking the Gmail sync. Fixed by forcing the Supabase Python client to use HTTP/1.1 via `httpx.Client(http2=False)` instead of HTTP/2.
- **Dependencies Updated:** Ensured `requirements.txt` uses `supabase>=2.15` and `httpx>=0.26` to support the custom HTTP client configuration.
- **Self-Healing Deduplication:** Confirmed the backend now automatically cleans up duplicate transactions during every sync, and the `UNIQUE(user_id, raw_text)` constraint is active in Supabase.
- **Dashboard UI:** Finalized the "Today's Cash Flow" card with correct `+`/`-` mathematical signs, color coding, and empty states (no badge if ₦0 activity).

---
---

## 33. SESSION LOG UPDATE

### Session 010 — Password Reset Flow 🟢
- **Frontend Setup:** Installed `@supabase/supabase-js` and created `frontend/src/lib/supabase.js` to initialize the client.
- **Forgot Password UI:** Added a clean, animated modal to the Login page that triggers `supabase.auth.resetPasswordForEmail()`.
- **Update Password Page:** Created `ResetPassword.jsx`, which intercepts the `/reset-password` URL path in `App.jsx`. It allows users to securely update their password using `supabase.auth.updateUser()`.
- **Environment Config:** Added Supabase URLs and Anon Keys to Vercel environment variables. Configured Redirect URLs in the Supabase Dashboard.
- **Known Note:** Emails are currently sent via Supabase's default SMTP. Later, we must connect a custom SMTP provider (Resend/SendGrid) to send emails from a `@finsight.app` domain.

---