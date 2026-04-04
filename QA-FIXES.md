# QA Fixes Summary — 2026-02-26

## Bug 1: Analytics Charts — Hardcoded Data ✅
**Problem**: Charts (Enrollment Trend, Revenue, Top Courses, Completion Rate) used hardcoded arrays.
**Fix**:
- **Backend**: Added `AdminChartDataView` in `backend/apps/analytics/views.py` — queries real enrollment, revenue, top courses, and completion rate data from DB
- **Backend**: Added route `analytics/charts/` in `backend/apps/analytics/urls.py`
- **Frontend**: Added `getAdminChartData()` to `src/lib/api.ts`
- **Frontend**: Rewrote `src/app/admin/analytics/page.tsx` to fetch chart data from API. Shows "No data yet" for empty charts.

## Bug 2: Homepage Empty Sections ✅
**Problem**: Category counts showed 0 for some categories due to `categorySlug` mismatch (`web-development` vs `web-dev`).
**Fix**:
- **Data**: Fixed `src/data/courses.json` — normalized `categorySlug: "web-development"` → `"web-dev"` for consistency with homepage filters.
- Homepage already had categories, featured courses, stats, tracks, testimonials, newsletter sections — they were rendering but category counts were wrong.

## Bug 3: Student Dashboard Mock Data ✅
**Problem**: Dashboard showed hardcoded mockUser data (12-day streak, 2,840 reputation, 4 badges, fake activity feed, fake enrolled courses).
**Fix**:
- **Frontend**: Rewrote `src/app/dashboard/page.tsx` — removed `mockUser.json` import, fetches real data from API (`getMe()`, `getMyBadges()`, `getCertificates()`, `getTracks()`).
- Shows real zeros/empty states when no data exists. Empty enrolled courses shows "Browse Courses" CTA. No mock data.

## Bug 4: Course Rating Hardcoded 4.5 ✅
**Problem**: Every course showed 4.5 stars with fallback `rating: c.rating || 4.5`.
**Fix**:
- **Frontend**: Changed `src/app/courses/page.tsx` — `rating: c.rating ?? 0` (no fake fallback)
- **Frontend**: Updated `src/components/courses/CourseCard.tsx` — shows "New" badge when `rating === 0` or no `reviewCount`, shows real stars only when reviews exist
- **Data**: Set all ratings to 0 and reviewCount to 0 in `src/data/courses.json`

## Bug 5: co_instructor Roles Wrong ✅
**Problem**: co_instructor1 and co_instructor2 had `is_staff=False` (treated as students).
**Fix**:
- **Server**: Ran Django shell on DO server to set `is_staff=True` for both co_instructor1 and co_instructor2. They are now recognized as instructors.

## Bug 6: Broken API Endpoints ✅
**Problem**: `/api/v1/gamification/*` returned 404; `/api/v1/tracks/{slug}/concepts/` didn't exist.
**Fix**:
- **Backend**: Added `path('gamification/', include('apps.gamification.urls'))` alias in `backend/config/urls.py` (existing routes were only under `points/`)
- **Backend**: Added `ConceptListView` in `backend/apps/tracks/views.py`
- **Backend**: Added `<slug:track_slug>/concepts/` route in `backend/apps/tracks/urls.py`
- **Backend**: Added `analytics/charts/` route (see Bug 1)

## Bug 7: Admin Dashboard "Total Students = 0" ✅
**Problem**: Frontend expected `userStats.total_users` but API returned `total`.
**Fix**:
- **Backend**: Added `total_users` alias field to `AdminUserStatsView` response in `backend/apps/users/views.py`
- **Frontend**: Updated `src/app/admin/page.tsx` to use `userStats.students ?? userStats.total ?? userStats.total_users` for robustness

---

## Files Changed

### Backend
- `backend/config/urls.py` — added gamification alias route
- `backend/apps/analytics/urls.py` — added charts endpoint
- `backend/apps/analytics/views.py` — added AdminChartDataView
- `backend/apps/tracks/urls.py` — added concepts endpoint
- `backend/apps/tracks/views.py` — added ConceptListView
- `backend/apps/users/views.py` — added total_users alias

### Frontend
- `src/app/admin/analytics/page.tsx` — full rewrite, real API data
- `src/app/admin/page.tsx` — fixed student count field name
- `src/app/dashboard/page.tsx` — full rewrite, removed mock data
- `src/app/courses/page.tsx` — removed rating fallback
- `src/components/courses/CourseCard.tsx` — "New" badge instead of fake rating
- `src/lib/api.ts` — added getAdminChartData()

### Data
- `src/data/courses.json` — ratings set to 0, categorySlug normalized

### Server (DO)
- co_instructor1, co_instructor2: `is_staff` set to `True`
