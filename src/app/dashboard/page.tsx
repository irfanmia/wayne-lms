'use client';
import { useState, useEffect } from 'react';
import TrackProgress from '@/components/dashboard/TrackProgress';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import StreakCounter from '@/components/dashboard/StreakCounter';
import ProgressBar from '@/components/ui/ProgressBar';
import AnimatedSection from '@/components/ui/AnimatedSection';
import GridBackground from '@/components/ui/GridBackground';
import Link from 'next/link';
import { useI18n, tContent } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

type EnrolledCourse = {
  slug: string;
  title: string;
  category: string;
  progress: number;
  lessonsCompleted: number;
  totalLessons: number;
};

type TrackItem = {
  slug: string;
  name: string;
  icon: string;
  progress: number;
  exercisesCompleted: number;
  totalExercises: number;
};

type ActivityItem = {
  type: string;
  exercise: string;
  track: string;
  time: unknown;
};

export default function DashboardPage() {
  const { t, locale } = useI18n();
  const { user, isAuthenticated } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState<EnrolledCourse[]>([]);
  const [activeTracks, setActiveTracks] = useState<TrackItem[]>([]);
  const [recentActivity] = useState<ActivityItem[]>([]);
  const [streak, setStreak] = useState(0);
  const [reputation, setReputation] = useState(0);
  const [badgeCount, setBadgeCount] = useState(0);
  const [certCount, setCertCount] = useState(0);
  const [joinedDate, setJoinedDate] = useState('');
  const [loading, setLoading] = useState(true);
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    const promises = [
      api.getMe().catch(() => null),
      api.getMyBadges().catch(() => []),
      api.getCertificates().catch(() => []),
      api.getTracks().catch(() => []),
    ];

    Promise.all(promises).then(([me, badges, certs, tracks]) => {
      if (me) {
        setDisplayName(me.username || me.display_name || '');
        setStreak(me.streak || 0);
        setReputation(me.reputation || 0);
        setJoinedDate(me.date_joined || '');
      }
      if (Array.isArray(badges)) setBadgeCount(badges.length);
      if (Array.isArray(certs)) setCertCount(certs.length);
      if (Array.isArray(tracks)) {
        setActiveTracks(tracks.slice(0, 3).map((t: Record<string, unknown>) => ({
          slug: t.slug as string,
          name: typeof t.title === 'object' && t.title !== null ? (t.title as Record<string, string>).en || String(t.slug) : String(t.title || t.slug),
          icon: (t.icon_url as string) || '',
          progress: 0,
          exercisesCompleted: 0,
          totalExercises: 0,
        })));
      }
    }).finally(() => setLoading(false));
  }, [isAuthenticated]);

  const name = user?.username || displayName || 'Student';

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" />
    </div>
  );

  return (
    <GridBackground className="min-h-screen">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <AnimatedSection><div className="mb-10">
        <h1 className="text-4xl font-medium text-gray-900 mb-1 font-heading">{t('dashboard.welcomeBack')} {name} 👋</h1>
        <p className="text-gray-500">
          {streak > 0
            ? <>{t('dashboard.streakMessage')} {streak}-{t('dashboard.dayStreak')}</>
            : <>Start your learning streak today!</>
          }
        </p>
      </div></AnimatedSection>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-medium text-gray-900 font-heading">{t('dashboard.enrolledCourses')}</h2>
              <Link href="/courses" className="text-sm text-orange-600 hover:text-orange-700 font-medium">{t('dashboard.browseMore')}</Link>
            </div>
            {enrolledCourses.length > 0 ? (
              <div className="space-y-4">
                {enrolledCourses.map(c => (
                  <Link key={c.slug} href={`/courses/${c.slug}/learn`}>
                    <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-300 transition-colors">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-gray-900 line-clamp-1">{c.title}</h3>
                        <span className="text-xs text-gray-400 shrink-0 ml-2">{c.category}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1"><ProgressBar value={c.progress} /></div>
                        <span className="text-xs text-gray-500">{c.progress}%</span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">{c.lessonsCompleted}/{c.totalLessons} {t('dashboard.lessonsCompleted')}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-200 rounded-xl p-8 text-center">
                <p className="text-gray-400 mb-3">You haven&apos;t enrolled in any courses yet.</p>
                <Link href="/courses" className="text-orange-600 font-medium hover:text-orange-700">Browse Courses →</Link>
              </div>
            )}
          </section>

          {activeTracks.length > 0 && (
            <section>
              <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('dashboard.activeTracks')}</h2>
              <div className="space-y-4">
                {activeTracks.map(tr => (
                  <TrackProgress key={tr.slug} {...tr} />
                ))}
              </div>
            </section>
          )}

          {recentActivity.length > 0 && (
            <section>
              <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('dashboard.recentActivity')}</h2>
              <ActivityFeed activities={recentActivity.map(a => ({ ...a, time: tContent(a.time, locale) }))} />
            </section>
          )}

          {recentActivity.length === 0 && enrolledCourses.length === 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-xl p-8 text-center">
              <p className="text-gray-600 mb-2 text-lg font-medium">Ready to start learning?</p>
              <p className="text-gray-400 text-sm mb-4">Explore our courses and coding tracks to begin your journey.</p>
              <div className="flex items-center justify-center gap-3">
                <Link href="/courses" className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600">Browse Courses</Link>
                <Link href="/tracks" className="bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-50">Coding Tracks</Link>
              </div>
            </div>
          )}
        </div>

        <div className="space-y-6">
          <StreakCounter streak={streak} />

          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <h3 className="text-gray-900 font-semibold mb-3">{t('dashboard.stats')}</h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('dashboard.reputation')}</span>
                <span className="text-gray-900 font-medium">{reputation.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('dashboard.badges')}</span>
                <span className="text-gray-900 font-medium">{badgeCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('dashboard.certificates')}</span>
                <span className="text-gray-900 font-medium">{certCount}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">{t('dashboard.coursesEnrolled')}</span>
                <span className="text-gray-900 font-medium">{enrolledCourses.length}</span>
              </div>
              {joinedDate && (
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">{t('dashboard.memberSince')}</span>
                  <span className="text-gray-900 font-medium">{new Date(joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </GridBackground>
  );
}
