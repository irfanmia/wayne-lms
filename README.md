# Wayne LMS LMS

A full-featured Learning Management System built with Next.js 16 and Django 5. Features course management, interactive exercises, quizzes, gamification, certificates, and a complete admin dashboard.

## 🚀 Live Demo

- **Platform**: https://wayne-lms.example.com
- **API**: https://api.wayne-lms.example.com/api/v1/
- **Admin Dashboard**: https://wayne-lms.example.com/admin/

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
- **Backend**: Django 5 + Django REST Framework — deployed on DigitalOcean
- **Database**: PostgreSQL (production), SQLite (development)
- **Auth**: JWT (SimpleJWT) + GitHub OAuth (NextAuth.js)
- **Task Queue**: Celery + Redis
- **Code Execution**: Docker-sandboxed containers

## ✨ Features

### Learning
- 📚 Course catalog with filtering by category, level, and price
- 🎥 Video lessons (YouTube, Vimeo, MP4, embeds)
- 📝 Text lessons with rich content
- 📊 Slide-based lessons
- 🔴 Live stream lessons (YouTube/Vimeo/Zoom integration)
- ✅ Lesson progress tracking with completion percentage
- 📋 Assignments with submission and grading
- 💬 Per-lesson discussion threads with nested replies

### Assessment
- ❓ Module quizzes with multiple question types (single/multi choice, true/false, fill-blank)
- 📊 Course assessments with pass/fail and score tracking
- 🔗 Public/shareable standalone quizzes
- ⏱️ Quiz time limits, randomization, and retry settings
- 📈 Student gradebook

### Practice & Exercises
- 💻 Interactive code exercises with in-browser editor
- 🐍 Multi-language support (Python, JavaScript, TypeScript)
- 🐳 Docker-sandboxed code execution
- 🗺️ Concept maps linking exercises to learning objectives
- 🏆 Course-specific badges (first exercise, all easy, streak, etc.)

### Gamification
- 🏅 Points system and badges
- 🔥 Streak tracking
- 🏆 Leaderboard
- 📜 Certificates with unique verification UIDs

### Course Management (Admin)
- 📝 Full course builder with curriculum editor
- 📦 Course bundles
- 💰 Pricing (free, paid, membership)
- 🎟️ Coupon system with smart coupons
- 📅 Drip content scheduling (sequential, date-based, timed)
- ❓ FAQ editor per course
- 📢 Course notices/announcements
- 👥 Multi-instructor support
- 🔒 Prerequisites system

### Admin Dashboard
- 👤 User management (CRUD, roles, suspend/activate)
- 📊 Analytics and revenue charts
- 💳 Payment/order management with refunds
- 📧 Email templates and bulk email
- 🎨 Platform settings
- 📁 Media manager
- 📋 Forms builder
- 🔐 Role-based access control

### Other
- 🌍 i18n — English (default), Arabic (RTL), Spanish
- 🔍 SEO with JSON-LD structured data, sitemap, robots.txt
- ❤️ Course wishlist
- 👤 User profiles with customizable bios
- 🎓 Instructor dashboard with student management
- 📱 Responsive design

## 📁 Project Structure

```
wayne-lms/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── admin/              # Admin dashboard pages
│   │   ├── courses/            # Course catalog & learning
│   │   ├── tracks/             # Exercise tracks
│   │   ├── instructor/         # Instructor dashboard
│   │   ├── login/ & signup/    # Authentication
│   │   └── ...
│   ├── components/             # React components
│   │   ├── admin/              # Admin UI components
│   │   ├── auth/               # Auth guards & forms
│   │   ├── course-builder/     # Course creation components
│   │   ├── learn/              # Learning view components
│   │   ├── practice/           # Exercise/practice components
│   │   ├── ui/                 # Shared UI primitives
│   │   └── ...
│   ├── data/                   # Static data & mock data
│   │   ├── courses.json        # Offline fallback course data
│   │   └── ...
│   ├── hooks/                  # Custom React hooks
│   ├── lib/                    # Core utilities
│   │   ├── api.ts              # API client (fetch wrapper)
│   │   ├── auth.tsx            # Auth context & provider
│   │   └── i18n.tsx            # Internationalization
│   └── locales/                # Translation files (en, ar, es)
├── backend/
│   ├── config/                 # Django settings, URLs, WSGI/ASGI
│   ├── apps/
│   │   ├── users/              # User model & auth endpoints
│   │   ├── courses/            # Courses, modules, lessons, quizzes
│   │   ├── tracks/             # Exercise tracks
│   │   ├── progress/           # Learning progress tracking
│   │   ├── certificates/       # Certificate generation & verification
│   │   ├── executor/           # Docker code execution engine
│   │   ├── gamification/       # Points, badges, leaderboard
│   │   ├── assignments/        # Assignment submission & grading
│   │   ├── bundles/            # Course bundles
│   │   ├── coupons/            # Coupon & discount system
│   │   ├── payments/           # Orders, pricing plans
│   │   ├── analytics/          # Instructor & admin analytics
│   │   ├── emails/             # Email templates & bulk sending
│   │   ├── notifications/      # In-app notifications
│   │   ├── roles/              # RBAC roles & permissions
│   │   ├── groups/             # Student groups
│   │   ├── lmsforms/           # Dynamic forms
│   │   ├── media_manager/      # File uploads
│   │   ├── platform/           # Platform settings
│   │   └── content_library/    # Shared content library
│   └── manage.py
├── public/                     # Static assets
├── QA-REPORT.md                # QA test results
├── QA-FIXES.md                 # QA fix log
└── docker-compose.yml          # Dev environment (DB, Redis)
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

## 🚀 Getting Started

### Prerequisites
- Node.js 20+
- Python 3.11+
- PostgreSQL (production) or SQLite (dev)
- Redis (for Celery)
- Docker (for code execution)

### Frontend Setup
```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local
# Edit .env.local with your values

# Run development server
npm run dev
```

### Backend Setup
```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Install dependencies
pip install -r requirements.txt

# Set environment variables (or create backend/.env)
export DJANGO_SECRET_KEY=your-secret-key
export DJANGO_DEBUG=True

# Run migrations
python manage.py migrate

# Seed data (optional)
python manage.py seed

# Run development server
python manage.py runserver
```

### Environment Variables

See `.env.example` for all required variables. Key ones:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXTAUTH_SECRET` | NextAuth.js secret |
| `GITHUB_ID` / `GITHUB_SECRET` | GitHub OAuth credentials |
| `DJANGO_SECRET_KEY` | Django secret key |
| `DB_*` | PostgreSQL connection |
| `REDIS_URL` | Redis connection for Celery |

## 📡 API Documentation

Base URL: `/api/v1/`

### Authentication
| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/token/` | Login (email or username + password) → JWT |
| POST | `/auth/token/refresh/` | Refresh access token |
| POST | `/auth/register/` | Register new user |
| GET | `/auth/me/` | Get current user profile |
| POST | `/users/auth/github/` | GitHub OAuth exchange |

### Courses
| Method | Endpoint | Description |
|---|---|---|
| GET | `/courses/` | List courses (filterable) |
| GET | `/courses/{slug}/` | Course details |
| POST | `/courses/` | Create course (staff) |
| GET | `/courses/{slug}/learn/` | Learning view with progress |
| POST | `/courses/{slug}/enroll/` | Enroll in course |
| GET | `/courses/lessons/{id}/` | Get lesson content |
| POST | `/courses/lessons/{id}/complete/` | Mark lesson complete |
| GET/POST | `/courses/lessons/{id}/comments/` | Lesson discussions |
| GET | `/courses/quizzes/{id}/` | Get quiz questions |
| POST | `/courses/quizzes/{id}/submit/` | Submit quiz answers |

### Tracks & Exercises
| Method | Endpoint | Description |
|---|---|---|
| GET | `/tracks/` | List exercise tracks |
| GET | `/tracks/{slug}/exercises/` | List exercises for track |
| POST | `/tracks/{slug}/exercises/{slug}/submit/` | Submit code solution |
| POST | `/execute/` | Execute code in sandbox |

### Admin
| Method | Endpoint | Description |
|---|---|---|
| GET/POST | `/users/` | Admin user management |
| GET | `/users/stats/` | User statistics |
| GET/POST | `/bundles/` | Bundle management |
| GET/POST | `/coupons/coupons/` | Coupon management |
| GET/POST | `/payments/orders/` | Order management |
| GET | `/analytics/charts/` | Dashboard analytics |

## 🎨 Design System

- **Primary Accent**: Orange `#F97316`
- **Background**: White
- **Text**: Black / Grey scale
- **Headings Font**: Manrope
- **Body Font**: Inter
- **Design Reference**: exercism.org clean layout
- **Animations**: Framer Motion (fade-in, stagger, count-up)

## 🌍 Internationalization

Supported languages:
- 🇬🇧 English (default)
- 🇸🇦 Arabic (with full RTL support)
- 🇪🇸 Spanish

Translation files in `src/locales/`. Course titles and descriptions are stored as JSON objects `{"en": "...", "ar": "...", "es": "..."}` for per-field translation.

## 📊 Admin Dashboard

Full-featured admin panel at `/admin/` with:
- User management (search, filter by role/status, CRUD)
- Course management with visual course builder
- Analytics dashboard with enrollment/revenue charts
- Payment & order management
- Coupon & discount management
- Email template editor and bulk sending
- Platform settings configuration
- Content library for reusable materials
- Role-based access control

## 🔒 Security

- JWT authentication with token rotation
- CORS restricted to allowed origins
- CSRF protection enabled
- Security headers (XSS, Content-Type sniffing, HSTS, X-Frame-Options)
- Rate limiting (100/hr anonymous, 1000/hr authenticated)
- Password validation
- Secure cookies in production
- Docker-sandboxed code execution with timeout & memory limits
- Input validation on all API endpoints

## 📦 Deployment

### Frontend (Vercel)
- Auto-deploys from `main` branch
- Environment variables set in Vercel dashboard
- Static generation for public pages

### Backend (DigitalOcean)
- Gunicorn + Nginx
- PostgreSQL database
- Redis for Celery
- `DEBUG=False` in production
- Allowed hosts: `api.wayne-lms.example.com`

## 🗺️ Roadmap

- [ ] Real-time notifications (WebSockets)
- [ ] Video upload & transcoding
- [ ] AI-powered code review
- [ ] Mobile app (React Native)
- [ ] Payment gateway integration (Stripe)
- [ ] Advanced analytics & reporting
- [ ] Course reviews & ratings
- [ ] Social learning features
- [ ] SCORM/xAPI compliance

## 📄 License

Private project — Wayne LMS © 2025
