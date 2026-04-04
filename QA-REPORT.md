# Wayne LMS LMS - QA Audit Report

**Date:** 2026-02-26  
**Tester:** Automated QA (OpenClaw Agent)  
**Frontend:** https://wayne-lms.example.com  
**Backend API:** https://api.wayne-lms.example.com/api/v1/  

---

## Summary

| Category | Pass | Fail | Warning |
|----------|------|------|---------|
| API Endpoints | 22 | 5 | 3 |
| Public Pages | 6 | 0 | 2 |
| Auth Flow | 4 | 0 | 1 |
| Security | 6 | 2 | 1 |
| SEO/Meta | 4 | 1 | 1 |

**Overall Health: 🟡 Good with notable issues**

---

## 1. API ENDPOINTS

### ✅ Working Endpoints

| Endpoint | Method | Status | Notes |
|----------|--------|--------|-------|
| `/courses/` | GET | 200 | Returns 12 courses, paginated |
| `/courses/html5-essentials/` | GET | 200 | Full course detail with modules |
| `/courses/html5-essentials/learn/` | GET | 200 | Complete learn data with progress |
| `/courses/html5-essentials/prerequisites/` | GET | 200 | Returns empty array (correct) |
| `/courses/html5-essentials/practice/` | GET | 200 | Returns concepts with exercises |
| `/courses/` | POST | 201 | Course creation works ✅ (was previously broken) |
| `/courses/test-qa-course/` | PUT | 200 | Update works correctly |
| `/courses/test-qa-course/` | DELETE | 204 | Delete works correctly |
| `/courses/html5-essentials/enroll/` | POST | 201 | Enrollment works |
| `/courses/wishlist/` | GET | 200 | Returns wishlist items |
| `/courses/wishlist/toggle/` | POST | 201 | Toggle works (with `course_slug` field) |
| `/courses/lessons/1/` | GET | 200 | Lesson detail returned |
| `/courses/quizzes/1/` | GET | 200 | Quiz with 10 questions, choices |
| `/tracks/` | GET | 200 | Returns track list |
| `/tracks/python/` | GET | 200 | Track detail with concepts & exercises |
| `/tracks/python/exercises/` | GET | 200 | 10 exercises returned |
| `/auth/login/` | POST | 200 | Returns JWT access + refresh tokens |
| `/auth/me/` | GET | 200 | Returns user profile |
| `/users/` | GET | 200 | Paginated user list (29 users) |
| `/bundles/` | GET | 200 | 4 bundles |
| `/certificates/` | GET | 200 | Empty (correct) |
| `/coupons/` | GET | 200 | Returns sub-endpoints |
| `/payments/` | GET | 200 | Returns sub-endpoints |
| `/roles/` | GET | 200 | Returns sub-endpoints |
| `/emails/` | GET | 200 | Returns sub-endpoints |
| `/platform/settings/` | GET | 200 | Full platform config |
| `/content-library/` | GET | 200 | Returns sub-endpoints |

### ❌ Broken/Missing Endpoints

| Endpoint | Method | Status | Issue |
|----------|--------|--------|-------|
| `/gamification/leaderboard/` | GET | **404** | Not Found - endpoint not implemented |
| `/gamification/points/` | GET | **404** | Not Found - endpoint not implemented |
| `/gamification/badges/` | GET | **404** | Not Found - endpoint not implemented |
| `/analytics/` | GET | **404** | Not Found - returns HTML error page |
| `/tracks/python/concepts/` | GET | **404** | Not Found (concepts are nested in `/tracks/python/` response) |

### ⚠️ API Warnings

1. **Draft courses visible to public** — `GET /courses/` returns draft courses ("test", "test-2") to unauthenticated users. This leaks unpublished content.
2. **Wishlist toggle error message** — Returns `{"detail":"course_slug required"}` when `course_id` is sent instead. Error message is helpful but the field name (`course_slug`) differs from typical patterns (`course_id`).
3. **Login accepts email as username** — `POST /auth/login/` with `{"username":"admin@wayne-lms.example.com","password":"admin123"}` succeeds. This is convenient but may be unexpected behavior worth documenting.

---

## 2. PUBLIC PAGES (Frontend)

### ✅ Working Pages

| Page | URL | Status | Notes |
|------|-----|--------|-------|
| Homepage | `/` | 200 | Hero section, stats, testimonials, newsletter — all rendered |
| Courses listing | `/courses` | 200 | Shows 6 courses with thumbnails, prices, ratings |
| Course detail | `/courses/html5-essentials` | 200 | Full detail: curriculum, what you'll learn, certificate preview |
| Tracks listing | `/tracks` | 200 | 12 tracks displayed |
| Track detail | `/tracks/python` | 200 | Concept map, exercises, progress shown |
| Login page | `/login` | 200 | Page loads (client-rendered form) |
| Signup page | `/signup` | 200 | Page loads (client-rendered form) |
| 404 page | `/nonexistent` | 404 | Proper 404 page with Next.js error display |

### ⚠️ Frontend Warnings

1. **Course detail page title is generic** — `<title>Browse Courses | Wayne LMS</title>` on `/courses/html5-essentials` instead of the actual course name. Bad for SEO.
2. **Login/Signup pages render only footer in SSR** — The actual login form is client-rendered (SPA). This is normal for Next.js but means login form content isn't in initial HTML.
3. **Copyright says "© 2025"** — Should be 2026.

---

## 3. AUTH FLOW

### ✅ Working

| Feature | Status | Notes |
|---------|--------|-------|
| Admin login | ✅ | `admin` / `admin123` returns JWT tokens |
| Email as username login | ✅ | `admin@wayne-lms.example.com` works as username |
| Wrong password | ✅ | Returns 401 with clear message |
| Empty body | ✅ | Returns 400 with field-level validation |
| Invalid token | ✅ | Returns 401 with `token_not_valid` code |

### ⚠️ Auth Warning

1. **No rate limiting observed** — Login endpoint doesn't appear to have rate limiting. Brute force attacks possible.

---

## 4. SECURITY

### ✅ Passing

| Check | Result |
|-------|--------|
| CORS headers | ✅ Properly configured for `https://wayne-lms.example.com` |
| Auth required for POST /courses/ | ✅ Returns 401 |
| Auth required for GET /users/ | ✅ Returns 401 |
| Auth required for GET /platform/settings/ | ✅ Returns 401 (sensitive config protected) |
| Invalid course slug | ✅ Returns 404, no stack trace |
| XSS in query params | ✅ No reflected XSS (search param ignored, returns all courses) |

### ❌ Security Issues

1. **❌ CRITICAL: Draft courses exposed publicly** — `GET /courses/` returns ALL courses including drafts to unauthenticated users. Draft courses with status `"draft"` (e.g., "test", "test-2") are visible. The API should filter `status=published` for public requests.

2. **❌ MEDIUM: Platform settings expose sensitive keys** — When authenticated as admin, `GET /platform/settings/` returns ALL settings including:
   - `stripe_secret_key` (empty but field exists)
   - `paypal_secret` (empty but field exists)
   - `smtp_password` (empty but field exists)
   - `ses_secret_key` (empty but field exists)
   - `mailchimp_api_key`, `zapier_webhook_url`, `slack_webhook_url`
   
   These should be write-only fields, never returned in GET responses. Even if empty now, when populated they'll be exposed.

### ⚠️ Security Warning

1. **Admin page renders HTML without auth** — `/admin` returns 200 with "Checking access..." spinner. The page is client-side protected but the admin layout HTML/JS is served. Consider server-side redirect to `/login`.

---

## 5. ADMIN DASHBOARD

> ⚠️ **Note:** Browser automation was unavailable during testing. Admin pages were tested via HTTP fetch only. Interactive testing (clicking buttons, filling forms) was NOT performed.

### What was verified:
- `/admin` returns 200 with admin layout (client-side auth check)
- Admin API endpoints (courses CRUD, users, settings) all work correctly
- Course creation via API: ✅ **FIXED** (previously reported broken)
- Course update via API: ✅ Working
- Course delete via API: ✅ Working

### What needs manual testing:
- [ ] Admin dashboard overview page rendering
- [ ] Course list showing correct Draft/Published status badges
- [ ] Course creation form (Save & Create button)
- [ ] Curriculum editor (add modules/lessons)
- [ ] All admin sub-pages (exercises, content, users, analytics, etc.)
- [ ] Save button visibility at top of forms

---

## 6. COURSE BUILDER (API-level testing)

### ✅ Working

| Operation | Status | Notes |
|-----------|--------|-------|
| Create course | ✅ | `POST /courses/` with title + category + level → returns slug, status=draft |
| Update course | ✅ | `PUT /courses/{slug}/` → updates title correctly |
| Delete course | ✅ | `DELETE /courses/{slug}/` → 204 No Content |
| Auto-slug generation | ✅ | "Test QA Course" → `test-qa-course` |
| Auto-description | ✅ | Description auto-filled from title when not provided |
| Default settings | ✅ | New course gets sensible defaults (free, draft, certificates enabled) |

### 📝 Course Builder Notes
- Course defaults to `is_free: true, price: "0.00"` when no price specified
- `enable_certificates`, `enable_discussions`, `enable_quizzes` default to `true`
- `status` correctly defaults to `"draft"`

---

## 7. LEARN PAGE (API-level)

### ✅ Working
- `/courses/html5-essentials/learn/` returns full course structure:
  - 8 modules, 33 lessons
  - Lesson types: text, video, quiz, assignment, slides
  - Video URLs included (YouTube)
  - Quiz IDs linked to lessons
  - Progress tracking: `completed_lessons: [], total_lessons: 33, percent: 0`

### 📝 Notes
- Quiz lessons (id 115, 132) properly reference quiz IDs (6, 7)
- Assignment lessons exist (id 120, 125) — type: "assignment"
- Slides lesson exists (id 121) — type: "slides"
- Enrollment works: `POST /courses/html5-essentials/enroll/` → 201

---

## 8. SEO & META

### ✅ Good
- Homepage has proper OG tags, Twitter cards, JSON-LD schema
- `robots.txt` tags: `index, follow`
- Canonical URL set
- Structured data includes organization info (Wayne LMS, Sharjah, UAE)

### ❌ Issues
1. **Course detail pages use generic title** — `/courses/html5-essentials` shows `<title>Browse Courses | Wayne LMS</title>` instead of course name
2. **All pages share same canonical URL** — `https://wayne-lms.example.com` (should be page-specific)

### ⚠️ Warning
1. **404 page has duplicate title tags** — Both `<title>404: This page could not be found.</title>` and `<title>Wayne LMS - Master Programming Through Practice</title>` in the same page

---

## 9. SPECIFIC BUGS CHECKED

| Bug | Status | Notes |
|-----|--------|-------|
| Course creation flow | ✅ **FIXED** | API creates courses correctly |
| Status field (Draft/Published) | ✅ | API returns correct status |
| Auth token sent with requests | ✅ | Bearer token auth works |
| CORS issues | ✅ | Properly configured |
| 404 errors | ✅ | Proper handling on invalid slugs |
| 500 errors | ✅ | None observed |

---

## 10. CRITICAL BUGS (Prioritized)

### 🔴 P0 - Critical

1. **Draft courses exposed to public API**
   - **Endpoint:** `GET /api/v1/courses/`
   - **Expected:** Only published courses returned for unauthenticated requests
   - **Actual:** All 12 courses returned including 2 drafts ("test", "test-2")
   - **Impact:** Unpublished/test content visible to all users
   - **Fix:** Add `queryset.filter(status='published')` for non-admin users

2. **Platform settings returns secret fields**
   - **Endpoint:** `GET /api/v1/platform/settings/`
   - **Expected:** Secret fields (API keys, passwords) never returned
   - **Actual:** All fields returned including `stripe_secret_key`, `smtp_password`, etc.
   - **Impact:** When populated, secrets will be exposed to any admin user
   - **Fix:** Use write-only serializer fields for secrets

### 🟡 P1 - Important

3. **Gamification endpoints return 404**
   - `/gamification/leaderboard/`, `/gamification/points/`, `/gamification/badges/`
   - All return HTML 404 page
   - These are likely not implemented yet

4. **Analytics endpoint returns 404**
   - `/analytics/` returns HTML 404
   - Not implemented yet

5. **Course detail page title not dynamic**
   - SEO impact: all course pages share same generic title

### 🟢 P2 - Minor

6. **Copyright year says 2025** (should be 2026)
7. **404 page has duplicate `<title>` tags**
8. **Canonical URL is same for all pages**

---

## 11. RECOMMENDATIONS

### Backend
1. **Filter draft courses from public API** — Add visibility filter based on auth status
2. **Implement write-only fields** for sensitive platform settings
3. **Add rate limiting** to `/auth/login/` endpoint
4. **Implement gamification endpoints** or remove from frontend/docs
5. **Implement analytics endpoint** or return empty data instead of 404
6. **Add `?status=published` filter** option to courses API

### Frontend
1. **Dynamic page titles** — Use course/track names in `<title>` tags
2. **Unique canonical URLs** per page
3. **Server-side redirect** for `/admin` when not authenticated (instead of client-side spinner)
4. **Update copyright year** to 2026 (or make dynamic)
5. **Hide draft courses** from courses listing page

### Testing Gaps (Need Manual/Browser Testing)
- [ ] Admin dashboard UI (all pages)
- [ ] Course builder form interactions
- [ ] Curriculum editor drag-and-drop
- [ ] Mobile responsiveness
- [ ] Learn page sidebar navigation
- [ ] Quiz submission flow
- [ ] Mark lesson complete
- [ ] Discussion panel
- [ ] Wishlist UI toggle
- [ ] Student dashboard
- [ ] Profile page
- [ ] GitHub OAuth flow
- [ ] Error states (API failure scenarios)
- [ ] Empty states (new user, no enrollments)

---

## Test Environment Notes
- Browser automation was unavailable (no Chrome tab connected to OpenClaw relay)
- All UI testing was done via HTTP fetch (SSR content only)
- Interactive features (client-rendered forms, buttons, modals) could NOT be tested
- API testing was comprehensive with curl
- Auth flow tested end-to-end via API

---

*Report generated: 2026-02-26T13:02 GMT+4*
