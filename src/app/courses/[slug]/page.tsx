'use client';
import { useState, useEffect, use } from 'react';
import staticCourses from '@/data/courses.json';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import PlatformBadge from '@/components/ui/PlatformBadge';
import CourseCard from '@/components/courses/CourseCard';
import Link from 'next/link';
import { useI18n, tContent, tContentArray } from '@/lib/i18n';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';
import CountdownTimer from '@/components/ui/CountdownTimer';

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t, locale } = useI18n();
  const { isAuthenticated, isDemoMode } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'curriculum' | 'reviews' | 'live'>('overview');
  const [expandedModules, setExpandedModules] = useState<number[]>([0]);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [enrollError, setEnrollError] = useState('');
  const [progress, setProgress] = useState<number | null>(null);
  const [wishlisted, setWishlisted] = useState(false);
  const [wishlistToast, setWishlistToast] = useState('');
  const [shareMsg, setShareMsg] = useState('');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [liveClasses, setLiveClasses] = useState<any[]>([]);

  // Try API, fallback to static
  const staticCourse = staticCourses.find(c => c.slug === slug);
  const [course, setCourse] = useState(staticCourse);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    api.getCourse(slug)
      .then((data) => {
        // Map snake_case API fields to camelCase expected by frontend
        const mapped = {
          ...data,
          whatYouLearn: data.whatYouLearn || data.what_youll_learn || data.what_you_learn || [],
          whoShouldTake: data.whoShouldTake || data.who_should_take || [],
          prerequisites: data.prerequisites || data.course_prerequisites || [],
          rating: data.rating || 4.5,
          reviewCount: data.reviewCount || data.review_count || 0,
          students: data.students || data.student_count || 0,
          lectures: data.lectures || data.module_count || 0,
          lesson_count: data.lesson_count || 0,
          quiz_count: data.quiz_count || 0,
          exercise_count: data.exercise_count || 0,
          video_duration: data.video_duration || '',
          priceType: data.priceType || data.price_type || (data.is_free ? 'free' : 'paid'),
        };
        setCourse(mapped);
        setIsOffline(false);
      })
      .catch(() => { setCourse(staticCourse); setIsOffline(true); });
  }, [slug]);

  // Check enrollment status & wishlist
  useEffect(() => {
    if (!isAuthenticated) return;
    api.getCourseProgress(slug)
      .then((data) => {
        setEnrolled(true);
        if (data?.progress !== undefined) setProgress(data.progress);
      })
      .catch(() => { /* not enrolled */ });
    api.getWishlist()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.results || [];
        setWishlisted(list.some((w: any) => w.course?.slug === slug));
      })
      .catch(() => { /* ignore */ });
  }, [slug, isAuthenticated]);

  // Fetch upcoming live classes for this course
  useEffect(() => {
    api.getLiveClasses(slug)
      .then((data) => {
        const list = Array.isArray(data) ? data : data?.results || [];
        setLiveClasses(list);
      })
      .catch(() => { /* ignore */ });
  }, [slug]);

  const formatLiveDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (!course) {
    return <div className="max-w-7xl mx-auto px-4 py-20 text-center"><h1 className="text-2xl font-bold text-gray-900">{t('courseDetail.notFound')}</h1></div>;
  }

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/courses/${slug}`;
      return;
    }
    setEnrolling(true);
    setEnrollError('');
    try {
      await api.enrollCourse(slug);
      setEnrolled(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Enrollment failed';
      setEnrollError(msg);
    } finally {
      setEnrolling(false);
    }
  };

  const handleWishlist = async () => {
    if (!isAuthenticated) {
      window.location.href = `/login?redirect=/courses/${slug}`;
      return;
    }
    const newState = !wishlisted;
    setWishlisted(newState);
    setWishlistToast(newState ? '❤️ Added to Wishlist' : 'Removed from Wishlist');
    setTimeout(() => setWishlistToast(''), 2500);
    try {
      const res = await api.toggleWishlist(slug);
      // Sync with server response if available
      if (res?.wishlisted !== undefined) setWishlisted(res.wishlisted);
    } catch {
      // Revert on failure
      setWishlisted(!newState);
      setWishlistToast('Failed to update wishlist');
      setTimeout(() => setWishlistToast(''), 2500);
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    const title = typeof course.title === 'object' ? (course.title as Record<string, string>).en || '' : course.title;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch { /* user cancelled or not supported */ }
    }
    // Fallback: copy to clipboard
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 2000);
    } catch {
      // Final fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setShareMsg('Link copied!');
      setTimeout(() => setShareMsg(''), 2000);
    }
  };

  const title = tContent(course.title, locale);
  const description = tContent(course.description, locale);
  const category = tContent(course.category, locale);
  const whatYouLearn = tContentArray(course.whatYouLearn, locale);
  const whoShouldTake = tContentArray(course.whoShouldTake, locale);
  const prerequisites = tContentArray(course.prerequisites, locale);

  const related = staticCourses.filter(c => c.categorySlug === course.categorySlug && c.slug !== course.slug).slice(0, 3);
  const totalLessons = (course.curriculum || []).reduce((sum: number, m: { lessons: unknown[] }) => sum + m.lessons.length, 0);

  const tabLabels: Record<string, string> = {
    overview: t('courseDetail.overview'),
    curriculum: t('courseDetail.curriculum'),
    reviews: t('courseDetail.reviews'),
    live: '📡 Live Classes',
  };

  const toggleModule = (i: number) => {
    setExpandedModules(prev => prev.includes(i) ? prev.filter(x => x !== i) : [...prev, i]);
  };

  return (
    <div>
      {/* Hero */}
      <section className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href="/courses" className="hover:text-orange-600">{t('nav.courses')}</Link>
            <span>/</span>
            <span>{category}</span>
          </div>
          {isOffline && (
            <div className="mb-4 inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Offline mode
            </div>
          )}
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="flex-1">
              <Badge variant="default">{category}</Badge>
              <h1 className="text-3xl sm:text-5xl font-medium text-gray-900 mt-3 mb-4 font-heading">{title}</h1>
              <p className="text-gray-500 text-lg mb-4">{description}</p>
              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                <span className="flex items-center gap-1"><span className="text-orange-500">{'★'.repeat(Math.floor(course.rating))}</span> {course.rating} ({course.reviewCount} {t('courseDetail.reviews_label')})</span>
                <span>{course.students.toLocaleString()} {t('courseDetail.students')}</span>
                <Badge variant={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'purple'}>{course.level}</Badge>
              </div>
              <p className="text-sm text-gray-500">{t('courseDetail.createdBy')} <span className="text-orange-600 font-medium">{course.instructor}</span> · {course.duration}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 min-w-0">
            {/* Tabs */}
            <div className="flex gap-1 border-b border-gray-200 mb-8">
              {(['overview', 'curriculum', 'live', 'reviews'] as const).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)} className={`px-5 py-3 text-sm font-medium transition-colors cursor-pointer whitespace-nowrap ${activeTab === tab ? 'text-orange-600 border-b-2 border-orange-500' : 'text-gray-500 hover:text-gray-700'}`}>
                  {tabLabels[tab]}
                  {tab === 'live' && liveClasses.filter(lc => lc.status === 'live').length > 0 && (
                    <span className="ml-1.5 inline-flex items-center justify-center w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  )}
                </button>
              ))}
            </div>

            {activeTab === 'overview' && (
              <div className="space-y-8">
                {whatYouLearn.length > 0 && (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('courseDetail.whatYouLearn')}</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {whatYouLearn.map((item, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-600">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
                )}

                {whoShouldTake.length > 0 && (
                <div>
                  <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('courseDetail.whoShouldTake')}</h2>
                  <ul className="space-y-2">
                    {whoShouldTake.map((item, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600"><span className="w-1.5 h-1.5 bg-orange-500 rounded-full" />{item}</li>
                    ))}
                  </ul>
                </div>
                )}

                {(course.prerequisites?.length > 0 || prerequisites.length > 0) && (
                <div>
                  <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('courseDetail.prerequisites')}</h2>
                  <div className="space-y-3">
                    {(course.prerequisites || []).map((prereq: any, i: number) => {
                      const prereqSlug = typeof prereq === 'object' ? prereq.slug : null;
                      const prereqTitle = typeof prereq === 'object'
                        ? (typeof prereq.title === 'object' ? prereq.title[locale] || prereq.title.en : prereq.title)
                        : (typeof prereq === 'string' ? prereq : String(prereq));
                      const prereqLevel = typeof prereq === 'object' ? prereq.level : null;

                      return (
                        <Link key={i} href={prereqSlug ? `/courses/${prereqSlug}` : '#'} className="block">
                          <div className="flex items-center gap-4 p-4 bg-amber-50 border border-amber-200 rounded-xl hover:bg-amber-100 transition-colors">
                            <div className="flex-shrink-0 w-10 h-10 bg-amber-200 rounded-lg flex items-center justify-center">
                              <svg className="w-5 h-5 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-0.5">Required Course</p>
                              <p className="text-sm font-semibold text-gray-900 truncate">{prereqTitle}</p>
                              {prereqLevel && <p className="text-xs text-gray-500 mt-0.5">{prereqLevel}</p>}
                            </div>
                            <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                          </div>
                        </Link>
                      );
                    })}
                  </div>
                </div>
                )}

                <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
                  <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('courseDetail.completionTitle')}</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(t('courseDetail.completionItems') as unknown as string[] || []).map((item: string, i: number) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-700">
                        <span className="text-orange-500">🏆</span>{item}
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('courseDetail.certPreview')}</h2>
                  <div className="bg-white border-2 border-orange-200 rounded-xl p-8 text-center max-w-lg mx-auto">
                    <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center text-white font-bold text-lg mx-auto mb-4">M</div>
                    <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">{t('courseDetail.certOfCompletion')}</p>
                    <h3 className="text-lg font-bold text-gray-900 mb-1 font-heading">{title}</h3>
                    <p className="text-gray-400 text-sm mb-3">{t('courseDetail.awardedTo')}</p>
                    <p className="text-xl font-bold text-orange-500 mb-3 font-heading">{t('courseDetail.yourName')}</p>
                    <p className="text-gray-400 text-xs">{t('courseDetail.verifiedCert')}</p>
                    <div className="border-t border-gray-200 mt-4 pt-3">
                      <p className="text-gray-300 text-xs font-mono">CERT-XXXX-XXXX</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'curriculum' && (
              <div className="space-y-3">
                <div className="flex items-center justify-between mb-4">
                  <p className="text-sm text-gray-500">{(course.curriculum || []).length} {t('courseDetail.modules')} · {totalLessons} {t('courseDetail.lessons')} · {course.quizzes} {t('courseDetail.quizzes')}</p>
                  <button onClick={() => setExpandedModules(expandedModules.length === (course.curriculum || []).length ? [] : (course.curriculum || []).map((_: unknown, i: number) => i))} className="text-sm text-orange-600 hover:text-orange-700 font-medium cursor-pointer">
                    {expandedModules.length === (course.curriculum || []).length ? t('courseDetail.collapseAll') : t('courseDetail.expandAll')}
                  </button>
                </div>
                {(course.curriculum || []).map((module: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-xl overflow-hidden">
                    <button onClick={() => toggleModule(i)} className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                      <div className="flex items-center gap-3">
                        <svg className={`w-4 h-4 text-gray-400 transition-transform ${expandedModules.includes(i) ? 'rotate-90' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        <span className="font-medium text-gray-900 text-sm">{tContent(module.title, locale)}</span>
                      </div>
                      <span className="text-xs text-gray-400">{module.lessons.length} {t('courseDetail.lessons')}{module.quiz ? ' · 1 quiz' : ''}</span>
                    </button>
                    {expandedModules.includes(i) && (
                      <div className="divide-y divide-gray-100">
                        {module.lessons.map((lesson: any, j: number) => (
                          <div key={j} className="flex items-center gap-3 px-4 py-3 pl-11">
                            <span className="text-gray-300">
                              {lesson.type === 'video' ? '▶' : lesson.type === 'exercise' ? '💻' : '📄'}
                            </span>
                            <span className="text-sm text-gray-600 flex-1">{tContent(lesson.title, locale)}</span>
                            <span className="text-xs text-gray-400">{lesson.duration}</span>
                          </div>
                        ))}
                        {module.quiz && (
                          <div className="flex items-center gap-3 px-4 py-3 pl-11 bg-orange-50/50">
                            <span className="text-gray-300">📝</span>
                            <span className="text-sm text-gray-600 flex-1">{tContent(module.quiz.title, locale)}</span>
                            <span className="text-xs text-gray-400">{module.quiz.questions} {t('courseDetail.questions')}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'reviews' && (
              <div className="space-y-6">
                {[
                  { name: 'Ahmed K.', rating: 5, text: locale === 'ar' ? 'دورة ممتازة! المنهج منظم جيداً والتمارين عملية.' : locale === 'es' ? '¡Excelente curso! El programa está bien estructurado y los ejercicios son prácticos.' : 'Excellent course! The curriculum is well-structured and the exercises are practical.', date: locale === 'ar' ? 'منذ أسبوعين' : locale === 'es' ? 'hace 2 semanas' : '2 weeks ago' },
                  { name: 'Sarah M.', rating: 5, text: locale === 'ar' ? 'أفضل دورة في هذا الموضوع. المدرب يشرح المفاهيم المعقدة بوضوح.' : locale === 'es' ? 'El mejor curso sobre este tema. El instructor explica conceptos complejos claramente.' : 'Best course on this topic. The instructor explains complex concepts clearly.', date: locale === 'ar' ? 'منذ شهر' : locale === 'es' ? 'hace 1 mes' : '1 month ago' },
                  { name: 'David L.', rating: 4, text: locale === 'ar' ? 'محتوى جيد جداً. أتمنى المزيد من التمارين العملية لكنه رائع بشكل عام.' : locale === 'es' ? 'Muy buen contenido. Me gustaría más ejercicios prácticos pero en general excelente.' : 'Very good content. Would love more hands-on exercises but overall great.', date: locale === 'ar' ? 'منذ شهرين' : locale === 'es' ? 'hace 2 meses' : '2 months ago' },
                ].map((review, i) => (
                  <div key={i} className="border border-gray-200 rounded-xl p-5">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">{review.name[0]}</div>
                        <span className="font-medium text-gray-900 text-sm">{review.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">{review.date}</span>
                    </div>
                    <div className="text-orange-500 text-sm mb-2">{'★'.repeat(review.rating)}</div>
                    <p className="text-sm text-gray-600">{review.text}</p>
                  </div>
                ))}
              </div>
            )}

            {activeTab === 'live' && (
              <div className="space-y-6">
                {liveClasses.length === 0 ? (
                  <div className="text-center py-12">
                    <p className="text-4xl mb-3">📡</p>
                    <p className="text-gray-500">No live classes scheduled for this course yet.</p>
                  </div>
                ) : (
                  <>
                    {/* Live Now */}
                    {liveClasses.filter(lc => lc.status === 'live').length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-red-600 mb-3 font-[family-name:var(--font-manrope)]">🔴 Live Now</h3>
                        <div className="space-y-3">
                          {liveClasses.filter(lc => lc.status === 'live').map(lc => (
                            <div key={lc.id} className="p-4 rounded-xl border border-red-200 bg-red-50/50">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-semibold text-gray-900">{lc.title}</h4>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse font-bold">LIVE</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mt-0.5">{lc.duration} min</p>
                                  {lc.description && <p className="text-sm text-gray-500 mt-1">{lc.description}</p>}
                                  <div className="mt-2"><PlatformBadge platform={lc.platform} /></div>
                                </div>
                                <div className="shrink-0">
                                  {enrolled ? (
                                    <a href={lc.meeting_url} target="_blank" rel="noopener noreferrer"
                                      className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
                                      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                      Join Now
                                    </a>
                                  ) : (
                                    <span className="text-xs text-gray-400 italic">Enroll to join</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Upcoming */}
                    {liveClasses.filter(lc => lc.status === 'scheduled').length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 font-[family-name:var(--font-manrope)]">📅 Upcoming</h3>
                        <div className="space-y-3">
                          {liveClasses.filter(lc => lc.status === 'scheduled').map(lc => (
                            <div key={lc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 rounded-xl border border-gray-100 bg-white hover:border-orange-200 transition-colors gap-3">
                              <div>
                                <h4 className="font-semibold text-gray-900">{lc.title}</h4>
                                <p className="text-sm text-gray-600 mt-0.5">{new Date(lc.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })} · {lc.duration} min</p>
                                {lc.description && <p className="text-sm text-gray-500 mt-1">{lc.description}</p>}
                                <div className="mt-2"><PlatformBadge platform={lc.platform} /></div>
                              </div>
                              <div className="shrink-0">
                                <CountdownTimer targetDate={lc.scheduled_at} />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Past Recordings */}
                    {liveClasses.filter(lc => lc.status === 'completed').length > 0 && (
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 mb-3 font-[family-name:var(--font-manrope)]">🎬 Recordings</h3>
                        <div className="space-y-3">
                          {liveClasses.filter(lc => lc.status === 'completed').map(lc => (
                            <div key={lc.id} className="rounded-xl border border-gray-100 bg-white hover:border-orange-200 transition-colors overflow-hidden">
                              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3">
                                <div>
                                  <h4 className="font-semibold text-gray-900">{lc.title}</h4>
                                  <p className="text-sm text-gray-600 mt-0.5">{new Date(lc.scheduled_at).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })} · {lc.duration} min</p>
                                  <div className="mt-2"><PlatformBadge platform={lc.platform} /></div>
                                </div>
                                <div className="shrink-0">
                                  {enrolled && lc.recording_url ? (
                                    <a href={`/courses/${slug}/learn?mode=live`}
                                      className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                                      <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                                      Watch Recording
                                    </a>
                                  ) : !enrolled ? (
                                    <span className="text-xs text-gray-400 italic">Enroll to watch</span>
                                  ) : (
                                    <span className="text-xs text-gray-400">No recording</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:w-80 shrink-0">
            <div className="sticky top-24 space-y-4">
              <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="mb-4">
                  {course.priceType === 'free' ? (
                    <span className="text-3xl font-bold text-green-600">{t('coursesPage.free')}</span>
                  ) : course.priceType === 'members' ? (
                    <div><span className="text-sm text-gray-500">{t('coursesPage.membersOnly')}</span></div>
                  ) : (
                    <span className="text-3xl font-bold text-gray-900">${course.price}</span>
                  )}
                </div>

                {enrollError && (
                  <div className="mb-3 p-2 bg-red-50 border border-red-200 rounded-lg text-red-600 text-xs">{enrollError}</div>
                )}

                {enrolled && progress !== null && progress > 0 && (
                  <div className="mb-3">
                    <div className="flex items-center justify-between text-xs text-gray-500 mb-1">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                )}

                <div className="space-y-3 mb-6">
                  {enrolled ? (
                    <Link href={`/courses/${course.slug}/learn`}>
                      <Button className="w-full" size="lg">
                        {progress && progress > 0 ? 'Continue Learning →' : 'Start Learning →'}
                      </Button>
                    </Link>
                  ) : course.priceType === 'paid' ? (
                    <>
                      {isAuthenticated ? (
                        <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling}>
                          {enrolling ? 'Enrolling...' : `${t('courseDetail.enrollNow')} — $${course.price}`}
                        </Button>
                      ) : (
                        <Link href={`/login?redirect=/courses/${slug}`}><Button className="w-full" size="lg">{t('courseDetail.enrollNow')} — ${course.price}</Button></Link>
                      )}
                      <Button variant="outline" className="w-full">{t('courseDetail.getWithMembership')}</Button>
                    </>
                  ) : course.priceType === 'members' ? (
                    <>
                      {isAuthenticated ? (
                        <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling}>
                          {enrolling ? 'Enrolling...' : t('courseDetail.getMembership')}
                        </Button>
                      ) : (
                        <Link href={`/login?redirect=/courses/${slug}`}><Button className="w-full" size="lg">{t('courseDetail.getMembership')}</Button></Link>
                      )}
                      <p className="text-xs text-gray-400 text-center">{t('courseDetail.includedWithPro')}</p>
                    </>
                  ) : (
                    isAuthenticated ? (
                      <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling}>
                        {enrolling ? 'Enrolling...' : t('courseDetail.startLearningFree')}
                      </Button>
                    ) : (
                      <Link href={`/login?redirect=/courses/${slug}`}><Button className="w-full" size="lg">{t('courseDetail.startLearningFree')}</Button></Link>
                    )
                  )}
                </div>

                <div className="flex gap-2 mb-6">
                  <button onClick={handleWishlist} className={`flex-1 flex items-center justify-center gap-1 py-2 text-sm border rounded-lg transition-colors cursor-pointer ${wishlisted ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-500 hover:text-orange-600 border-gray-200'}`}>
                    <svg className="w-4 h-4" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
                    {wishlisted ? 'Wishlisted' : t('courseDetail.wishlist')}
                  </button>
                  <button onClick={handleShare} className="flex-1 flex items-center justify-center gap-1 py-2 text-sm text-gray-500 hover:text-orange-600 border border-gray-200 rounded-lg transition-colors cursor-pointer relative">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
                    {shareMsg || t('courseDetail.share')}
                  </button>
                </div>

                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm font-semibold text-gray-900 mb-4">{t('courseDetail.courseIncludes')}</h4>
                  <div className="divide-y divide-gray-100">
                    {[
                      { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>, label: 'Duration', value: (() => { const d = Number(course.duration) || 0; return d >= 60 ? `${Math.floor(d/60)} hours` : d > 0 ? `${d} min` : course.duration || '—'; })() },
                      { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" /></svg>, label: 'Lectures', value: course.lesson_count || course.lectures || totalLessons || 0 },
                      { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" /></svg>, label: 'Video', value: course.video_duration || '—' },
                      { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.879 7.519c1.171-1.025 3.071-1.025 4.242 0 1.172 1.025 1.172 2.687 0 3.712-.203.179-.43.326-.67.442-.745.361-1.45.999-1.45 1.827v.75M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9 5.25h.008v.008H12v-.008z" /></svg>, label: 'Quizzes', value: course.quiz_count || course.quizzes || 0 },
                      { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" /></svg>, label: 'Level', value: <span className="capitalize">{course.level}</span> },
                      { icon: <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228m0 0a6.003 6.003 0 01-2.021.547M14.27 9.728a6.003 6.003 0 01-2.021.547m0 0v4.975" /></svg>, label: 'Certificate', value: 'Yes' },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center justify-between py-3">
                        <div className="flex items-center gap-3 text-gray-500">
                          {item.icon}
                          <span className="text-sm">{item.label}</span>
                        </div>
                        <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Live Classes */}
        {liveClasses.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-medium text-gray-900 mb-6 font-heading">📡 Upcoming Live Classes</h2>
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {liveClasses.map((lc: any) => (
                <div key={lc.id} className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 bg-orange-50 rounded-xl border border-orange-100 gap-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{lc.title}</h3>
                    <p className="text-sm text-gray-600">{formatLiveDate(lc.scheduled_at)} · {lc.duration} min</p>
                    <div className="flex items-center gap-2 mt-1">
                      <PlatformBadge platform={lc.platform} />
                      {lc.status === 'live' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse font-bold">🔴 LIVE NOW</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    {lc.status === 'live' ? (
                      <a href={lc.meeting_url} target="_blank" rel="noopener noreferrer"
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                        Join Now
                      </a>
                    ) : (
                      <CountdownTimer targetDate={lc.scheduled_at} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* FAQs */}
        {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
        {(course as any).faqs && (course as any).faqs.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-medium text-gray-900 mb-6 font-heading">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {(course as any).faqs.map((faq: { id: number; question: string; answer: string }, idx: number) => (
                <details key={faq.id || idx} className="group border border-gray-200 rounded-xl overflow-hidden">
                  <summary className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-gray-50 transition">
                    <span className="text-sm font-medium text-gray-800">{faq.question}</span>
                    <svg className="w-5 h-5 text-gray-400 group-open:rotate-180 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <div className="px-6 pb-4 text-sm text-gray-600 leading-relaxed">{faq.answer}</div>
                </details>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-3xl font-medium text-gray-900 mb-6 font-heading">{t('courseDetail.relatedCourses')}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map(c => <CourseCard key={c.slug} course={c} />)}
            </div>
          </section>
        )}
      </div>

      {/* Mobile sticky bottom action bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40 md:hidden" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        <div className="flex items-center gap-2 px-4 py-3">
          {/* Wishlist */}
          <button onClick={handleWishlist} className={`p-2.5 border rounded-lg transition-colors cursor-pointer ${wishlisted ? 'text-red-500 border-red-200 bg-red-50' : 'text-gray-500 hover:text-orange-600 border-gray-200'}`}>
            <svg className="w-5 h-5" fill={wishlisted ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" /></svg>
          </button>
          {/* Share */}
          <button onClick={handleShare} className="p-2.5 text-gray-500 hover:text-orange-600 border border-gray-200 rounded-lg transition-colors cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" /></svg>
          </button>
          {/* Main CTA */}
          <div className="flex-1">
            {enrolled ? (
              <Link href={`/courses/${course.slug}/learn`}>
                <Button className="w-full" size="lg">
                  {progress && progress > 0 ? 'Continue Learning →' : 'Start Learning →'}
                </Button>
              </Link>
            ) : course.priceType === 'free' ? (
              isAuthenticated ? (
                <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Enrolling...' : 'Start Free →'}
                </Button>
              ) : (
                <Link href={`/login?redirect=/courses/${slug}`}><Button className="w-full" size="lg">Start Free →</Button></Link>
              )
            ) : (
              isAuthenticated ? (
                <Button className="w-full" size="lg" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Enrolling...' : course.priceType === 'members' ? 'Get Membership' : `Enroll — $${course.price}`}
                </Button>
              ) : (
                <Link href={`/login?redirect=/courses/${slug}`}>
                  <Button className="w-full" size="lg">
                    {course.priceType === 'members' ? 'Get Membership' : `Enroll — $${course.price}`}
                  </Button>
                </Link>
              )
            )}
          </div>
        </div>
      </div>

      {/* Wishlist Toast */}
      {wishlistToast && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in">
          {wishlistToast}
        </div>
      )}
    </div>
  );
}
