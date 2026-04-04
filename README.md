# Wayne LMS

A full-featured Learning Management System combining Exercism-style coding exercises with MasterStudy-style course management. Built with Next.js 16 and Django 5.

## 🚀 Live

- **Platform**: [https://wayne-lms.vercel.app](https://wayne-lms.vercel.app)
- **API**: [https://waynelmsapi.fiveniners.com/api/v1/](https://waynelmsapi.fiveniners.com/api/v1/)
- **Admin Dashboard**: [https://wayne-lms.vercel.app/admin/](https://wayne-lms.vercel.app/admin/)
- **Django Admin**: [https://waynelmsapi.fiveniners.com/admin/](https://waynelmsapi.fiveniners.com/admin/)

## 🏗️ Architecture

```
┌─────────────────┐     ┌─────────────────────┐     ┌────────────┐
│  Next.js 16     │────▶│  Django 5 + DRF      │────▶│ PostgreSQL │
│  (Vercel)       │     │  (DigitalOcean)      │     └────────────┘
│  App Router     │     │  JWT Auth            │     ┌────────────┐
│  Tailwind CSS 4 │     │  Celery Workers      │────▶│   Redis    │
└─────────────────┘     └─────────────────────┘     └────────────┘
```

- **Frontend**: Next.js 16 (App Router) — deployed on Vercel
- **Backend**: Django 5 + Django REST Framework — deployed on DigitalOcean (Bangalore)
- **Database**: PostgreSQL (production), SQLite (development)
- **Auth**: JWT (SimpleJWT) + GitHub OAuth (NextAuth.js)
- **Storage**: Cloudflare R2 (S3-compatible)
- **SSL**: Let's Encrypt (auto-renew)
- **Task Queue**: Celery + Redis
- **Code Execution**: Docker-sandboxed containers

## ✨ Features

### Learning
- 📚 Course catalog with filtering by category, level, and price
- 🎥 Video lessons (YouTube, Vimeo, MP4, embeds)
- 📝 Text lessons with rich HTML content & syntax-highlighted code blocks
- 📊 Slide-based lessons
- 🔴 Live stream lessons (YouTube/Vimeo/Zoom integration)
- ✅ Lesson progress tracking with completion percentage
- 📋 5 Assignment types (essay, code, file upload, URL, mixed) with auto-grading
- 💬 Per-lesson discussion threads (slide-in panel with nested replies)
- 🔒 Drip content (sequential, date-based, timed)
- 🔑 Prerequisites system with rich banner cards
- 🆓 Trial/free lesson previews

### Live Classes
- 📡 Schedule and manage live sessions
- 🟢 Google Meet / 🔵 Zoom / 🟣 Microsoft Teams support
- ⏱️ Countdown timers for upcoming sessions
- 🔴 Live status indicators (animated pulse)
- 📹 Recording links for completed sessions
- 👥 Attendance tracking

### Assessment
- ❓ 6 quiz question types (single choice, multi choice, true/false, fill-blank, matching, short answer)
- 📊 Course assessments with pass/fail and score tracking
- 🔗 Public/shareable standalone quizzes
- ⏱️ Quiz time limits, randomization, and retry settings
- 📈 Student gradebook

### Practice & Exercises
- 💻 Interactive code exercises with in-browser editor
- 🐍 Multi-language support (Python, JavaScript, TypeScript, 50+ languages)
- 🐳 Docker-sandboxed code execution
- 🗺️ Dynamic concept maps with auto-layout (topological sort)
- 🏆 Course-specific badges (first exercise, all easy, streak, perfect run, etc.)
- 🔄 Learning ↔ Practice mode toggle

### Kids Coding Module
- 🧒 Age-appropriate visual coding education
- 🧩 Blockly block editor with 30+ custom block types
- 🎮 PixiJS game stage with per-challenge-type visuals
- 👨‍👩‍👧 Parent & teacher dashboards
- 🏫 Classroom management

### Gamification
- 🏅 Points system and badges
- 🔥 Streak tracking
- 🏆 Leaderboard
- 📜 Certificates with unique verification UIDs

### Pricing & Monetization
- 💰 9 pricing models: Free, One-time, Offline/Institute, Membership/Subscription, Installment, Bundle, Pay What You Want, Waitlist, Scholarship
- 📦 Course bundles with discount pricing
- 🎟️ Coupon system (manual + smart coupons: Birthday, Welcome, Referral, Abandoned Cart)
- 📅 Seasonal coupon templates

### Course Management (Admin)
- 📝 Full course builder with curriculum editor (MasterStudy-matching UX)
- 📦 Course bundles
- 📅 Drip content scheduling
- ❓ FAQ editor per course
- 📢 Course notices/announcements
- 👥 Multi-instructor support
- 🔒 Prerequisites system
- 🎛️ All features optional per course via toggle flags

### Admin Dashboard (12 pages)
- 📊 Dashboard with real-time analytics charts
- 📚 Course management (CRUD, status, builder)
- 💻 Exercise management
- 📁 Content library
- 👤 User management (CRUD, roles, suspend/activate)
- 📈 Analytics & revenue charts
- 🎟️ Coupon management (manual + bulk generate)
- 📦 Bundle management
- 📡 Live classes management
- 🎓 Certificate management
- 💳 Payment/order management with refunds
- 📧 Email templates and bulk email
- 🎨 Platform settings

### Other
- 🌍 i18n — English (default), Arabic (RTL), Spanish
- 🔍 SEO with JSON-LD structured data, sitemap, robots.txt
- ❤️ Course wishlist
- 🔗 Share button
- 👤 User profiles with customizable bios
- 🎓 Instructor dashboard with student management
- 📱 Fully responsive (mobile, tablet, desktop)
- 🔒 Security headers, rate limiting, CORS

## 📁 Project Structure

```
wayne-lms/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard (12 pages)
│   │   ├── courses/            # Course catalog & learning view
│   │   ├── tracks/             # Exercise tracks & practice
│   │   ├── kids/               # Kids coding module
│   │   ├── instructor/         # Instructor dashboard
│   │   ├── dashboard/          # Student dashboard
│   │   ├── login/ & signup/    # Authentication
│   │   └── ...
│   ├── components/             # 50+ React components
│   │   ├── admin/              # Admin UI components
│   │   ├── auth/               # Auth guards & forms
│   │   ├── course-builder/     # Course creation (MasterStudy UX)
│   │   ├── learn/              # Learning view components
│   │   ├── practice/           # Exercise/practice components
│   │   ├── kids/               # Blockly + PixiJS components
│   │   ├── ui/                 # Shared UI primitives
│   │   └── layout/             # Navbar, Footer, Sidebar
│   ├── lib/                    # Core utilities
│   │   ├── api.ts              # API client (100+ endpoints)
│   │   ├── auth.tsx            # Auth context & JWT management
│   │   ├── kids-api.ts         # Kids module API client
│   │   └── i18n.tsx            # Internationalization
│   └── locales/                # Translation files (en, ar, es)
├── backend/
│   ├── config/                 # Django settings, URLs, WSGI/ASGI
│   ├── apps/                   # 26 Django apps
│   │   ├── users/              # User model & auth
│   │   ├── courses/            # Courses, modules, lessons, quizzes
│   │   ├── tracks/             # Exercise tracks
│   │   ├── progress/           # Learning progress
│   │   ├── certificates/       # Certificate generation
│   │   ├── executor/           # Docker code execution
│   │   ├── gamification/       # Points, badges, leaderboard
│   │   ├── assignments/        # 5 assignment types + auto-grading
│   │   ├── bundles/            # Course bundles
│   │   ├── coupons/            # Coupon & discount system
│   │   ├── payments/           # Orders, 9 pricing models
│   │   ├── live_classes/       # Live sessions (Meet/Zoom/Teams)
│   │   ├── analytics/          # Charts & reporting
│   │   ├── emails/             # Email templates & bulk sending
│   │   ├── notifications/      # In-app notifications
│   │   ├── roles/              # RBAC
│   │   ├── groups/             # Student groups
│   │   ├── platform/           # Platform settings
│   │   ├── content_library/    # Shared content
│   │   ├── kids_profiles/      # Kids user profiles
│   │   ├── kids_curriculum/    # Kids courses & challenges
│   │   ├── kids_progress/      # Kids progress tracking
│   │   ├── kids_classroom/     # Classroom management
│   │   └── ...
│   └── manage.py
└── public/                     # Static assets
```

## 🛠️ Tech Stack

### Frontend
| Technology | Purpose |
|---|---|
| Next.js 16 | React framework (App Router) |
| React 19 | UI library |
| TypeScript 5 | Type safety |
| Tailwind CSS 4 | Styling |
| Framer Motion | Animations |
| NextAuth.js 4 | GitHub OAuth |
| Blockly | Visual block editor (kids) |
| PixiJS | Game stage rendering (kids) |

### Backend
| Technology | Purpose |
|---|---|
| Django 5 | Web framework |
| Django REST Framework | API layer |
| SimpleJWT | JWT authentication |
| Celery | Async task queue |
| PostgreSQL | Production database |
| Redis | Cache & message broker |
| Docker | Sandboxed code execution |
| Gunicorn | WSGI server |
| Nginx | Reverse proxy |
| Cloudflare R2 | Media storage |

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL (production) or SQLite (dev)
- Redis (for Celery)

### Frontend Setup
```bash
npm install
cp .env.example .env.local
# Edit .env.local with your API URL
npm run dev
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate

pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Seed data
python manage.py seed              # Core data (tracks, courses, etc.)
python manage.py seed_practice     # Practice exercises & badges
python manage.py seed_features     # All feature data
python manage.py seed_users        # 28 sample users
python manage.py seed_coupons      # Coupon data
python manage.py seed_live_classes # Live class sessions

# Run server
python manage.py runserver
```

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXTAUTH_SECRET` | NextAuth.js secret |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth credentials |
| `DJANGO_SECRET_KEY` | Django secret key |
| `DB_NAME`, `DB_USER`, `DB_PASSWORD`, `DB_HOST`, `DB_PORT` | PostgreSQL connection |
| `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET_NAME` | Cloudflare R2 storage |

## 📡 API Endpoints (100+)

Base URL: `https://waynelmsapi.fiveniners.com/api/v1/`

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/login/` | Login → JWT tokens |
| POST | `/auth/token/refresh/` | Refresh access token |
| POST | `/auth/register/` | Register new user |
| GET | `/auth/me/` | Current user profile |

### Courses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/courses/` | List courses (filterable) |
| GET | `/courses/{slug}/` | Course details |
| POST | `/courses/` | Create course (staff) |
| GET | `/courses/{slug}/learn/` | Learning view with progress |
| POST | `/courses/{slug}/enroll/` | Enroll in course |
| GET | `/courses/lessons/{id}/` | Lesson content |
| POST | `/courses/lessons/{id}/complete/` | Mark complete |
| GET/POST | `/courses/lessons/{id}/comments/` | Discussions |

### Live Classes
| Method | Endpoint | Description |
|---|---|---|
| GET | `/live-classes/` | List all live classes |
| POST | `/live-classes/` | Create live class (staff) |
| POST | `/live-classes/{id}/start/` | Start session |
| POST | `/live-classes/{id}/end/` | End session |
| GET | `/live-classes/upcoming/` | Upcoming sessions |

### Tracks & Exercises
| Method | Endpoint | Description |
|---|---|---|
| GET | `/tracks/` | List exercise tracks |
| GET | `/tracks/{slug}/exercises/` | Track exercises |
| POST | `/execute/` | Execute code in sandbox |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/users/` | User management |
| GET | `/users/stats/` | User statistics |
| GET/POST | `/bundles/` | Bundles |
| GET/POST | `/coupons/coupons/` | Coupons |
| GET/POST | `/payments/orders/` | Orders |
| GET | `/analytics/charts/` | Dashboard charts |
| GET/PATCH | `/platform/settings/` | Platform settings |

## 🎨 Design System

- **Primary Accent**: Orange `#F97316`
- **Background**: White
- **Text**: Black / Grey scale
- **Headings Font**: Manrope
- **Body Font**: Inter
- **Design Reference**: exercism.org clean layout
- **Animations**: Framer Motion (fade-in, stagger, count-up)

## 🌍 Internationalization

| Language | Direction | Status |
|---|---|---|
| 🇬🇧 English | LTR | Default |
| 🇸🇦 Arabic | RTL | Full support |
| 🇪🇸 Spanish | LTR | Full support |

Course content stored as multilingual JSON: `{"en": "...", "ar": "...", "es": "..."}`

## 🖥️ Deployment

### Frontend (Vercel)
- Auto-deploys from `main` branch
- Environment variables in Vercel dashboard

### Backend (DigitalOcean — Bangalore BLR1)
- **Server**: 2GB RAM, 1 CPU, 50GB SSD
- **Stack**: Nginx → Gunicorn (3 workers) → Django → PostgreSQL
- **SSL**: Let's Encrypt (auto-renew)
- **API**: `https://waynelmsapi.fiveniners.com/api/v1/`

## 📊 Current Data

| Entity | Count |
|---|---|
| Courses | 9 (published) |
| Practice Tracks | 12 |
| Exercises | 27+ |
| Users | 28 |
| Live Classes | 15 |
| Course Bundles | 4 |
| Coupons | Active |
| Leaderboard | 11 entries |

## 🔒 Security

- JWT authentication with token rotation
- CORS restricted to allowed origins
- CSRF protection
- Security headers (XSS, Content-Type, HSTS, X-Frame-Options)
- Rate limiting (100/hr anonymous, 1000/hr authenticated)
- Docker-sandboxed code execution with timeout & memory limits
- Environment-based secrets (no hardcoded keys)

## 📄 License

Private project — Wayne LMS © 2026
