'use client';
import { useState, useEffect, useCallback, use } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';
import PlatformBadge from '@/components/ui/PlatformBadge';
// API-only: no mock data imports
import CourseSidebar from '@/components/learn/CourseSidebar';
import TextLesson from '@/components/learn/TextLesson';
import VideoLesson from '@/components/learn/VideoLesson';
import Quiz from '@/components/learn/Quiz';
import Discussion from '@/components/learn/Discussion';
import AssignmentLoader from '@/components/learn/AssignmentLoader';
import PracticeMode from '@/components/practice/PracticeMode';
import CountdownTimer from '@/components/ui/CountdownTimer';
import AITutorChat from '@/components/learn/AITutorChat';

type ViewMode = 'lesson' | 'quiz';
type CourseMode = 'learning' | 'practice' | 'live';

interface LessonData {
  id: number;
  title: Record<string, string>;
  content: Record<string, string>;
  lesson_type: string;
  video_url: string;
  video_duration: string;
  quiz_id: number | null;
  assignment_id: number | null;
  duration: number;
  order: number;
}

interface QuizData {
  id: number;
  title: Record<string, string>;
  quiz_type: string;
  questions_count: number;
  order: number;
  questions: Array<{
    id: number;
    text: string;
    question_type?: string;
    order: number;
    choices?: Array<{ id: number; text: string; order: number }>;
    correct_answer?: string;
    correct_choices?: number[];
    matching_pairs?: Array<{ left: string; right: string }>;
    explanation?: string;
    points?: number;
  }>;
}

interface CourseData {
  id: number;
  slug: string;
  title: Record<string, string>;
  modules: Array<{
    id: number;
    title: Record<string, string>;
    order: number;
    lessons: LessonData[];
    quiz: { id: number; title: Record<string, string>; questions_count: number } | null;
  }>;
  assessment: { id: number; title: Record<string, string>; questions_count: number } | null;
  progress: { completed_lessons: number[]; total_lessons: number; percent: number };
}

export default function LearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const searchParams = useSearchParams();
  const router = useRouter();
  const [courseMode, setCourseMode] = useState<CourseMode>(
    (searchParams.get('mode') as CourseMode) || 'learning'
  );
  const [course, setCourse] = useState<CourseData | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<number | null>(null);
  const [currentQuizId, setCurrentQuizId] = useState<number | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('lesson');
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null);
  const [currentQuiz, setCurrentQuiz] = useState<QuizData | null>(null);
  const [completedLessons, setCompletedLessons] = useState<number[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [liveClasses, setLiveClasses] = useState<any[]>([]);
  const [discussionOpen, setDiscussionOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [selectedRecording, setSelectedRecording] = useState<any>(null);

  const switchMode = (mode: CourseMode) => {
    setCourseMode(mode);
    router.replace(`/courses/${slug}/learn?mode=${mode}`, { scroll: false });
  };

  // Get all lessons flat
  const getAllLessons = useCallback((): LessonData[] => {
    if (!course) return [];
    return course.modules.flatMap(m => m.lessons);
  }, [course]);

  // Load course data
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getCourseLearning(slug);
        setCourse(data);
        setCompletedLessons(data.progress?.completed_lessons || []);
      } catch (err) {
        console.error('Failed to load course:', err);
      }
    };
    load();
    // Fetch live classes for this course
    api.getLiveClasses(slug)
      .then((data: unknown) => {
        const list = Array.isArray(data) ? data : (data as { results?: unknown[] })?.results || [];
        setLiveClasses(list);
      })
      .catch(() => { /* ignore */ });
  }, [slug]);

  // Set first lesson when course loads
  useEffect(() => {
    if (course && !currentLessonId && !currentQuizId) {
      const lessons = getAllLessons();
      if (lessons.length > 0) {
        setCurrentLessonId(lessons[0].id);
        setViewMode('lesson');
      }
    }
  }, [course, currentLessonId, currentQuizId, getAllLessons]);

  // Load lesson content when selected
  useEffect(() => {
    if (!currentLessonId || !course) return;
    // Find lesson from course data
    const lessons = getAllLessons();
    const found = lessons.find(l => l.id === currentLessonId);
    if (found) {
      setCurrentLesson(found);
      // If lesson type is quiz, also load quiz
      if (found.lesson_type === 'quiz' && found.quiz_id) {
        loadQuiz(found.quiz_id);
      }
    }
    // Also try API for full content
    api.getLesson(currentLessonId).then(data => {
      setCurrentLesson(data);
    }).catch(() => {});
  }, [currentLessonId, course, getAllLessons]);

  const loadQuiz = async (quizId: number) => {
    try {
      const data = await api.getQuiz(quizId);
      setCurrentQuiz(data);
    } catch (err) {
      console.error('Failed to load quiz:', err);
    }
  };

  const selectLesson = (id: number) => {
    setCurrentLessonId(id);
    setCurrentQuizId(null);
    setViewMode('lesson');
    
    setSidebarOpen(false);
  };

  const selectQuiz = (id: number) => {
    setCurrentQuizId(id);
    setCurrentLessonId(null);
    setViewMode('quiz');
    
    loadQuiz(id);
    setSidebarOpen(false);
  };

  const navigateLesson = (direction: 'prev' | 'next') => {
    if (!currentLessonId) return;
    const lessons = getAllLessons();
    const idx = lessons.findIndex(l => l.id === currentLessonId);
    if (direction === 'prev' && idx > 0) selectLesson(lessons[idx - 1].id);
    if (direction === 'next' && idx < lessons.length - 1) selectLesson(lessons[idx + 1].id);
  };

  const completeAndNext = async () => {
    if (!currentLessonId) return;
    try {
      await api.completeLesson(currentLessonId);
    } catch { /* mock */ }
    if (!completedLessons.includes(currentLessonId)) {
      setCompletedLessons(prev => [...prev, currentLessonId]);
    }
    navigateLesson('next');
  };

  const t = (obj: Record<string, string>) => obj?.['en'] || Object.values(obj || {})[0] || '';

  // Hide global footer on course learn page
  useEffect(() => {
    const footer = document.querySelector('footer');
    if (footer) footer.style.display = 'none';
    return () => { if (footer) footer.style.display = ''; };
  }, []);

  if (!course) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" />
      </div>
    );
  }

  const allLessons = getAllLessons();
  const currentIdx = currentLessonId ? allLessons.findIndex(l => l.id === currentLessonId) : -1;
  const hasPrevious = currentIdx > 0;
  const progressPct = allLessons.length > 0 ? Math.round(completedLessons.length / allLessons.length * 100) : 0;

  const ModeToggle = ({ current }: { current: CourseMode }) => (
    <div className="flex gap-1 border border-gray-200 rounded-lg p-0.5">
      {([['learning', '📖 Learning'], ['practice', '💻 Practice'], ['live', '📡 Live']] as const).map(([mode, label]) => (
        <button
          key={mode}
          onClick={() => switchMode(mode as CourseMode)}
          className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer ${
            current === mode ? 'bg-orange-500 text-white' : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );

  const formatLiveDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  if (courseMode === 'practice') {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <Link href={`/courses/${slug}`} className="text-sm text-gray-500 hover:text-orange-600 transition-colors">← Back to course</Link>
            <ModeToggle current="practice" />
          </div>
        </div>
        <PracticeMode courseSlug={slug} courseTitle={course ? t(course.title) : ''} />
      </div>
    );
  }

  if (courseMode === 'live') {
    const liveNow = liveClasses.filter((lc: { status: string }) => lc.status === 'live');
    const upcoming = liveClasses.filter((lc: { status: string; scheduled_at: string }) => lc.status === 'scheduled' && new Date(lc.scheduled_at) > new Date());
    const past = liveClasses.filter((lc: { status: string }) => lc.status === 'completed');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const LiveCard = ({ lc, type }: { lc: any; type: 'live' | 'upcoming' | 'past' }) => (
      <div className={`rounded-xl border transition-colors ${type === 'live' ? 'border-red-200 bg-red-50/50' : 'bg-white border-gray-100 hover:border-orange-200'}`}>
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-gray-900">{lc.title}</h4>
              {type === 'live' && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 animate-pulse font-bold">🔴 LIVE</span>}
            </div>
            <p className="text-sm text-gray-600 mt-0.5">{formatLiveDate(lc.scheduled_at)} · {lc.duration} min</p>
            {lc.description && <p className="text-sm text-gray-500 mt-1">{lc.description}</p>}
            <div className="mt-2"><PlatformBadge platform={lc.platform} /></div>
          </div>
          <div className="shrink-0">
            {type === 'live' && (
              <a href={lc.meeting_url} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-red-500 hover:bg-red-600 text-white px-5 py-2.5 rounded-lg text-sm font-bold transition-colors shadow-sm">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                Join Now
              </a>
            )}
            {type === 'upcoming' && <CountdownTimer targetDate={lc.scheduled_at} />}
            {type === 'past' && lc.recording_url && (
              <button onClick={() => setSelectedRecording(selectedRecording?.id === lc.id ? null : lc)}
                className="inline-flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                {selectedRecording?.id === lc.id ? 'Hide' : 'Watch Recording'}
              </button>
            )}
          </div>
        </div>
        {/* Inline video player for recordings — like lesson video */}
        {type === 'past' && selectedRecording?.id === lc.id && lc.recording_url && (
          <div className="border-t border-gray-100 p-4">
            <div className="relative w-full bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
              {lc.recording_url.includes('youtube.com') || lc.recording_url.includes('youtu.be') ? (
                <iframe
                  src={lc.recording_url.replace('watch?v=', 'embed/').replace('youtu.be/', 'youtube.com/embed/')}
                  className="absolute inset-0 w-full h-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : lc.recording_url.includes('vimeo.com') ? (
                <iframe
                  src={lc.recording_url.replace('vimeo.com/', 'player.vimeo.com/video/')}
                  className="absolute inset-0 w-full h-full"
                  allow="autoplay; fullscreen; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <video controls className="absolute inset-0 w-full h-full" src={lc.recording_url}>
                  Your browser does not support video playback.
                </video>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between">
              <div>
                <h4 className="font-semibold text-gray-900">{lc.title}</h4>
                <p className="text-sm text-gray-500">{formatLiveDate(lc.scheduled_at)} · {lc.duration} min · Recording</p>
              </div>
              <PlatformBadge platform={lc.platform} />
            </div>
          </div>
        )}
      </div>
    );

    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <Link href={`/courses/${slug}`} className="text-sm text-gray-500 hover:text-orange-600 transition-colors">← Back to course</Link>
            <ModeToggle current="live" />
          </div>
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
          {liveNow.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-red-600 mb-3 font-[family-name:var(--font-manrope)]">🔴 Live Now</h3>
              <div className="space-y-3">
                {liveNow.map((lc: { id: number }) => <LiveCard key={lc.id} lc={lc} type="live" />)}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 font-[family-name:var(--font-manrope)]">📅 Upcoming</h3>
            {upcoming.length > 0 ? (
              <div className="space-y-3">
                {upcoming.map((lc: { id: number }) => <LiveCard key={lc.id} lc={lc} type="upcoming" />)}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No upcoming live classes scheduled.</p>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 mb-3 font-[family-name:var(--font-manrope)]">🎬 Recordings</h3>
            {past.length > 0 ? (
              <div className="space-y-3">
                {past.map((lc: { id: number }) => <LiveCard key={lc.id} lc={lc} type="past" />)}
              </div>
            ) : (
              <p className="text-gray-500 text-sm">No recordings available yet.</p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <CourseSidebar
        courseSlug={slug}
        courseTitle={t(course.title)}
        modules={course.modules}
        completedLessons={completedLessons}
        currentLessonId={currentLessonId}
        currentQuizId={currentQuizId}
        assessment={course.assessment}
        onSelectLesson={selectLesson}
        onSelectQuiz={selectQuiz}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
            </div>
            <div className="flex items-center gap-4">
              {/* Mode Toggle */}
              <ModeToggle current="learning" />
              <button
                onClick={() => setDiscussionOpen(true)}
                className="p-2 text-gray-500 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors cursor-pointer"
                title="Discussion"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 pb-24">
          {viewMode === 'lesson' && currentLesson && (
            <>
              {currentLesson.lesson_type === 'video' ? (
                <VideoLesson
                  title={t(currentLesson.title)}
                  content={t(currentLesson.content)}
                  videoUrl={currentLesson.video_url}
                  videoDuration={currentLesson.video_duration}
                  isCompleted={completedLessons.includes(currentLesson.id)}
                />
              ) : currentLesson.lesson_type === 'assignment' && currentLesson.assignment_id ? (
                <AssignmentLoader
                  assignmentId={currentLesson.assignment_id}
                />
              ) : currentLesson.lesson_type === 'quiz' && currentQuiz ? (
                <Quiz
                  quizId={currentQuiz.id}
                  title={t(currentQuiz.title)}
                  questionsCount={currentQuiz.questions_count}
                  questions={currentQuiz.questions as any[]}
                  onComplete={completeAndNext}
                />
              ) : (
                <TextLesson
                  title={t(currentLesson.title)}
                  content={t(currentLesson.content)}
                  isCompleted={completedLessons.includes(currentLesson.id)}
                />
              )}
            </>
          )}

          {viewMode === 'quiz' && currentQuiz && (
            <Quiz
              quizId={currentQuiz.id}
              title={t(currentQuiz.title)}
              questionsCount={currentQuiz.questions_count}
              questions={currentQuiz.questions as any[]}
              isAssessment={currentQuiz.quiz_type === 'assessment'}
            />
          )}

          {!currentLesson && viewMode === 'lesson' && (
            <div className="text-center py-20 text-gray-400">
              <p className="text-lg">Select a lesson from the sidebar to start learning</p>
            </div>
          )}
        </div>
        </div>

        {/* Sticky Bottom Bar — fixed to viewport bottom */}
        {currentLesson && viewMode === 'lesson' && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-40" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
            <div className="lg:ml-80 px-3 sm:px-6 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-3 max-w-4xl mx-auto">
              {/* Previous */}
              <button
                onClick={() => navigateLesson('prev')}
                disabled={!hasPrevious}
                className="p-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                <span className="hidden sm:inline">← Previous</span>
              </button>

              {/* Progress bar */}
              <div className="flex-1 flex items-center gap-2 min-w-0">
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div className="bg-orange-500 h-2 rounded-full transition-all" style={{ width: `${progressPct}%` }} />
                </div>
                <span className="text-xs text-gray-500 whitespace-nowrap">{progressPct}%</span>
              </div>

              {/* Next */}
              <button
                onClick={() => navigateLesson('next')}
                disabled={currentIdx >= allLessons.length - 1}
                className="p-2 sm:px-4 sm:py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                <svg className="w-5 h-5 sm:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                <span className="hidden sm:inline">Next →</span>
              </button>

              {/* Completed toggle */}
              <button
                onClick={() => {
                  if (!completedLessons.includes(currentLesson.id)) {
                    setCompletedLessons(prev => [...prev, currentLesson.id]);
                  } else {
                    setCompletedLessons(prev => prev.filter(id => id !== currentLesson.id));
                  }
                }}
                className={`p-2 sm:px-4 sm:py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
                  completedLessons.includes(currentLesson.id)
                    ? 'bg-green-500 text-white hover:bg-green-600'
                    : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                <span className="hidden sm:inline">{completedLessons.includes(currentLesson.id) ? 'Completed' : 'Mark Complete'}</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discussion Slide-in Panel — full height */}
      {discussionOpen && (
        <>
          <div
            className="fixed inset-0 z-[55] bg-black/10"
            onClick={() => setDiscussionOpen(false)}
          />
          <div className="fixed inset-y-0 right-0 z-[60] w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slide-in-right">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h3 className="font-heading font-bold text-gray-900">💬 Discussion</h3>
                {currentLesson && (
                  <p className="text-xs text-gray-500 mt-0.5">{t(currentLesson.title)}</p>
                )}
              </div>
              <button
                onClick={() => setDiscussionOpen(false)}
                className="p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="flex-1 overflow-y-auto px-5 py-4">
              {currentLesson ? (
                <Discussion lessonId={currentLesson.id} />
              ) : (
                <p className="text-gray-400 text-sm text-center py-8">Select a lesson to view its discussion</p>
              )}
            </div>
          </div>
        </>
      )}

      {/* AI Tutor Chat */}
      {currentLesson && courseData && (
        <AITutorChat
          courseId={courseData.id}
          lessonId={currentLesson.id}
          lessonType={currentLesson.lesson_type}
          lessonTitle={t(currentLesson.title)}
          lessonContent={currentLesson.content ? t(currentLesson.content) : ''}
        />
      )}
    </div>
  );
}
