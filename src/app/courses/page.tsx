'use client';
import { useState, useEffect } from 'react';
import CourseCard from '@/components/courses/CourseCard';
import Button from '@/components/ui/Button';
import staticCourses from '@/data/courses.json';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function CoursesPage() {
  const { t } = useI18n();
  const [courses, setCourses] = useState(staticCourses);
  const [isOffline, setIsOffline] = useState(false);

  const categories = ['All', 'ai-ml', 'web-dev', 'devops'];
  const levels = ['All Levels', 'Beginner', 'Intermediate', 'Advanced'];
  const priceFilters = ['All Prices', 'Free', 'Members Only', 'Paid'];

  const categoryLabels: Record<string, string> = {
    'All': t('coursesPage.all'),
    'ai-ml': t('categories.aiMl'),
    'web-dev': t('categories.webDev'),
    'devops': t('categories.devops'),
  };
  const levelLabels: Record<string, string> = {
    'All Levels': t('coursesPage.allLevels'),
    'Beginner': t('coursesPage.beginner'),
    'Intermediate': t('coursesPage.intermediate'),
    'Advanced': t('coursesPage.advanced'),
  };
  const priceLabels: Record<string, string> = {
    'All Prices': t('coursesPage.allPrices'),
    'Free': t('coursesPage.free'),
    'Members Only': t('coursesPage.membersOnly'),
    'Paid': t('coursesPage.paid'),
  };

  const [category, setCategory] = useState('All');
  const [level, setLevel] = useState('All Levels');
  const [priceFilter, setPriceFilter] = useState('All Prices');
  const [visibleCount, setVisibleCount] = useState(6);

  useEffect(() => {
    const params: Record<string, string> = {};
    if (category !== 'All') params.category = category;
    if (level !== 'All Levels') params.level = level;
    if (priceFilter === 'Free') params.price_type = 'free';
    else if (priceFilter === 'Members Only') params.price_type = 'members';
    else if (priceFilter === 'Paid') params.price_type = 'paid';

    api.getCourses(Object.keys(params).length ? params : undefined)
      .then((data) => {
        const results = Array.isArray(data) ? data : data.results || data;
        if (results.length > 0) {
          // Map API fields to match CourseCard expected shape
          const mapped = results.map((c: Record<string, unknown>) => ({
            ...c,
            title: c.title && typeof c.title === 'object' ? c.title : { en: c.title, ar: c.title, es: c.title },
            description: c.description && typeof c.description === 'object' ? c.description : { en: c.description, ar: c.description, es: c.description },
            category: c.category && typeof c.category === 'object' ? c.category : { en: c.category || 'Programming', ar: c.category || 'برمجة', es: c.category || 'Programación' },
            categorySlug: c.categorySlug || c.category_slug || (typeof c.category === 'string' ? c.category.toLowerCase().replace(/\s+/g, '-') : 'programming'),
            rating: c.rating ?? 0,
            reviewCount: c.reviewCount || c.review_count || 0,
            students: c.students || c.student_count || 0,
            lectures: c.lectures || c.module_count || 0,
            priceType: c.priceType || c.price_type || (c.is_free ? 'free' : 'paid'),
            level: c.level || 'Beginner',
          }));
          setCourses(mapped);
          setIsOffline(false);
        } else {
          setCourses(staticCourses);
          setIsOffline(true);
        }
      })
      .catch(() => {
        setCourses(staticCourses);
        setIsOffline(true);
      });
  }, [category, level, priceFilter]);

  const filtered = isOffline ? courses.filter(c => {
    if (category !== 'All' && c.categorySlug !== category) return false;
    if (level !== 'All Levels' && c.level !== level) return false;
    if (priceFilter === 'Free' && c.priceType !== 'free') return false;
    if (priceFilter === 'Members Only' && c.priceType !== 'members') return false;
    if (priceFilter === 'Paid' && c.priceType !== 'paid') return false;
    return true;
  }) : courses;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
      <div className="mb-10">
        <h1 className="text-5xl font-medium text-gray-900 mb-3 font-heading">{t('coursesPage.title')}</h1>
        <p className="text-gray-500 text-lg">{t('coursesPage.subtitle')}</p>
        {isOffline && (
          <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Offline mode — showing cached data
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)} className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer ${category === c ? 'bg-orange-500 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>{categoryLabels[c]}</button>
          ))}
        </div>
        <select value={level} onChange={e => setLevel(e.target.value)} className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-600">
          {levels.map(l => <option key={l} value={l}>{levelLabels[l]}</option>)}
        </select>
        <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)} className="px-4 py-2 rounded-lg text-sm border border-gray-200 bg-white text-gray-600">
          {priceFilters.map(p => <option key={p} value={p}>{priceLabels[p]}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.slice(0, visibleCount).map(course => (
          <CourseCard key={course.slug} course={course} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-gray-400">{t('coursesPage.noResults')}</div>
      )}

      {visibleCount < filtered.length && (
        <div className="text-center mt-10">
          <Button variant="outline" onClick={() => setVisibleCount(v => v + 6)}>{t('coursesPage.loadMore')}</Button>
        </div>
      )}
    </div>
  );
}
