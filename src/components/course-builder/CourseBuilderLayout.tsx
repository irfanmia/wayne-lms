'use client';
import { useState, useEffect, createContext, useContext } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import api from '@/lib/api';

const tabs = [
  { key: 'settings', label: 'Settings', icon: '⚙️' },
  { key: 'curriculum', label: 'Curriculum', icon: '📚' },
  { key: 'drip', label: 'Drip', icon: '💧' },
  { key: 'pricing', label: 'Pricing', icon: '💰' },
  { key: 'coupons', label: 'Coupons', icon: '🎟️' },
  { key: 'options', label: 'Options', icon: '🔧' },
  { key: 'faq', label: 'FAQ', icon: '❓' },
  { key: 'notice', label: 'Notice', icon: '📢' },
];

const statusOptions = ['Published', 'Draft', 'Pending'] as const;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type CourseData = Record<string, any>;

// Context to share course state with child editors
interface CourseBuilderContextType {
  isNewCourse: boolean;
  isSaved: boolean;
  courseName: string;
  courseCategory: string;
  courseData: CourseData | null;
  courseLoading: boolean;
  courseError: string | null;
  setCourseName: (name: string) => void;
  setCourseCategory: (cat: string) => void;
  setCourseData: (data: CourseData | null) => void;
  markSaved: () => void;
  saveCourse: (data: Record<string, unknown>) => Promise<void>;
}

const CourseBuilderContext = createContext<CourseBuilderContextType>({
  isNewCourse: false,
  isSaved: true,
  courseName: '',
  courseCategory: '',
  courseData: null,
  courseLoading: false,
  courseError: null,
  setCourseName: () => {},
  setCourseCategory: () => {},
  setCourseData: () => {},
  markSaved: () => {},
  saveCourse: async () => {},
});

export const useCourseBuilder = () => useContext(CourseBuilderContext);

export default function CourseBuilderLayout({ children, slug }: { children: React.ReactNode; slug: string }) {
  const pathname = usePathname();
  const router = useRouter();
  
  const isNewCourse = slug.startsWith('new-course-');
  
  const [courseName, setCourseName] = useState('');
  const [courseCategory, setCourseCategory] = useState('');
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [courseLoading, setCourseLoading] = useState(!isNewCourse);
  const [courseError, setCourseError] = useState<string | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [isSaved, setIsSaved] = useState(!isNewCourse);
  const [status, setStatus] = useState<string>('Draft');
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [saveState, setSaveState] = useState<'saved' | 'saving' | 'unsaved'>(isNewCourse ? 'unsaved' : 'saved');

  const activeTab = tabs.find(t => pathname.includes(`/edit/${t.key}`))?.key || 'settings';

  // Fetch course data from API on mount
  useEffect(() => {
    if (isNewCourse) return;
    setCourseLoading(true);
    setCourseError(null);
    api.getCourse(slug)
      .then(data => {
        const title = typeof data.title === 'object' ? data.title.en || Object.values(data.title)[0] || '' : data.title || '';
        const description = typeof data.description === 'object' ? data.description.en || Object.values(data.description)[0] || '' : data.description || '';
        const mapped: CourseData = {
          ...data,
          title,
          slug: data.slug,
          category: data.category || '',
          level: data.level || 'Beginner',
          description,
          instructor: data.instructor || data.instructor_name || '',
          duration: data.duration || '',
          thumbnail: data.thumbnail || '',
          is_free: data.is_free || false,
          price: data.price || 0,
          modules: data.modules || [],
          sections: (data.modules || []).map((m: Record<string, unknown>, idx: number) => ({
            id: `sec-${m.id || idx}`,
            title: typeof m.title === 'object' ? (m.title as Record<string, string>).en || Object.values(m.title as Record<string, string>)[0] || '' : m.title || '',
            isExpanded: idx === 0,
            items: Array.isArray(m.lessons) ? (m.lessons as Record<string, unknown>[]).map((l: Record<string, unknown>) => ({
              id: `item-${l.id}`,
              type: (l.lesson_type as string) || 'text',
              title: typeof l.title === 'object' ? (l.title as Record<string, string>).en || Object.values(l.title as Record<string, string>)[0] || '' : (l.title as string) || '',
              duration: l.duration ? `${l.duration} min` : '',
              isPreview: !!(l.is_preview),
            })) : [],
          })),
          faq: data.faq || [],
          notice: data.notice || '',
          pricing: data.pricing || { type: data.is_free ? 'free' : 'paid', price: data.price || 0, salePrice: data.sale_price || 0, certificateIncluded: !!(data.certificate_included) },
          quizQuestions: data.quizQuestions || [],
          exercises: data.exercises || [],
          settings: data.settings || { access: 'enrolled', prerequisites: [], courseFiles: [], certificate: false, template: 'default' },
          status: data.status || 'published',
        };
        setCourseData(mapped);
        setCourseName(title);
        setCourseCategory(mapped.category);
        const st = data.status || 'published';
        setStatus(st === 'published' ? 'Published' : st === 'draft' ? 'Draft' : 'Pending');
      })
      .catch(err => setCourseError(err.message || 'Failed to load course'))
      .finally(() => setCourseLoading(false));
  }, [slug, isNewCourse]);

  const isTabDisabled = (tabKey: string) => {
    if (!isNewCourse) return false;
    if (tabKey === 'settings') return false;
    return !isSaved;
  };

  const markSaved = () => {
    setIsSaved(true);
    setSaveState('saved');
  };

  const saveCourse = async (data: Record<string, unknown>) => {
    setSaveState('saving');
    try {
      if (isNewCourse) {
        await api.createCourse(data);
      } else {
        await api.updateCourse(slug, data);
      }
      setSaveState('saved');
    } catch (err) {
      setSaveState('unsaved');
      throw err;
    }
  };

  return (
    <CourseBuilderContext.Provider value={{ isNewCourse, isSaved, courseName, courseCategory, courseData, courseLoading, courseError, setCourseName, setCourseCategory, setCourseData, markSaved, saveCourse }}>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Top Navigation Bar */}
        <div className="bg-gray-900 text-white sticky top-0 z-50 shadow-lg">
          <div className="flex items-center h-14 px-4 gap-4">
            {/* Left: Back + Course Name */}
            <div className="flex items-center gap-3 min-w-0 flex-shrink-0">
              <Link href="/admin/courses" className="flex items-center gap-1 text-gray-400 hover:text-white transition text-sm whitespace-nowrap">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                Back
              </Link>
              <div className="w-px h-6 bg-gray-700" />
              {isEditingName && isSaved ? (
                <input
                  className="bg-gray-800 text-white px-2 py-1 rounded text-sm font-medium w-64"
                  value={courseName}
                  onChange={e => setCourseName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={e => e.key === 'Enter' && setIsEditingName(false)}
                  autoFocus
                />
              ) : (
                <span className="text-sm font-medium truncate max-w-64">
                  {courseLoading ? (
                    <span className="text-gray-500 italic">Loading...</span>
                  ) : courseName || (
                    <span className="text-gray-500 italic">New Course — fill Settings to begin</span>
                  )}
                </span>
              )}
            </div>

            {/* Center: Tabs */}
            <nav className="flex items-center gap-1 mx-auto">
              {tabs.map(tab => {
                const disabled = isTabDisabled(tab.key);
                return disabled ? (
                  <span
                    key={tab.key}
                    className="px-3 py-1.5 rounded text-sm font-medium text-gray-600 cursor-not-allowed opacity-50"
                    title="Save Settings first to unlock"
                  >
                    {tab.label}
                  </span>
                ) : (
                  <Link
                    key={tab.key}
                    href={`/admin/courses/${slug}/edit/${tab.key}`}
                    className={`px-3 py-1.5 rounded text-sm font-medium transition ${
                      activeTab === tab.key
                        ? 'bg-orange-500 text-white'
                        : 'text-gray-400 hover:text-white hover:bg-gray-800'
                    }`}
                  >
                    {tab.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right: Status + View */}
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="text-xs text-gray-500">
                {saveState === 'saved' && '✓ Saved'}
                {saveState === 'saving' && '⟳ Saving...'}
                {saveState === 'unsaved' && '● Unsaved'}
              </span>

              {isSaved && (
                <div className="relative">
                  <button
                    onClick={() => setShowStatusDropdown(!showStatusDropdown)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium ${
                      status === 'Published' ? 'bg-green-600 text-white' : status === 'Draft' ? 'bg-gray-600 text-white' : 'bg-yellow-600 text-white'
                    }`}
                  >
                    {status}
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </button>
                  {showStatusDropdown && (
                    <div className="absolute right-0 mt-1 bg-white rounded-lg shadow-lg border py-1 z-50 w-32">
                      {statusOptions.map(opt => (
                        <button
                          key={opt}
                          onClick={() => { setStatus(opt); setShowStatusDropdown(false); }}
                          className={`w-full text-left px-3 py-1.5 text-sm hover:bg-gray-50 text-gray-700 ${status === opt ? 'font-semibold' : ''}`}
                        >
                          {opt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {isSaved && (
                <Link
                  href={`/courses/${slug}`}
                  target="_blank"
                  className="px-3 py-1.5 rounded text-sm font-medium bg-gray-700 text-white hover:bg-gray-600 transition"
                >
                  View
                </Link>
              )}
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          {courseLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-orange-500" />
            </div>
          ) : courseError ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <p className="text-red-500 text-lg mb-2">⚠️ Failed to load course</p>
                <p className="text-gray-500 text-sm">{courseError}</p>
              </div>
            </div>
          ) : (
            children
          )}
        </div>
      </div>
    </CourseBuilderContext.Provider>
  );
}
