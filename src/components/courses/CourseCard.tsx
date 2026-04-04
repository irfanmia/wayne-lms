'use client';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';
import { useI18n, tContent } from '@/lib/i18n';

type Course = {
  slug: string;
  title: unknown;
  category: unknown;
  thumbnail: string;
  priceType: string;
  price: number;
  students: number;
  lectures: number;
  level: string;
  rating: number;
  reviewCount?: number;
};

export default function CourseCard({ course }: { course: Course }) {
  const { locale } = useI18n();
  const title = tContent(course.title, locale);
  const category = tContent(course.category, locale);
  const priceLabel = course.priceType === 'free' ? (locale === 'ar' ? 'مجاني' : locale === 'es' ? 'Gratis' : 'Free') : course.priceType === 'members' ? (locale === 'ar' ? 'للأعضاء فقط' : locale === 'es' ? 'Solo Miembros' : 'Members Only') : `$${course.price}`;
  const priceVariant = course.priceType === 'free' ? 'success' : course.priceType === 'members' ? 'purple' : 'warning';

  return (
    <Link href={`/courses/${course.slug}`}>
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-orange-300 hover:shadow-md transition-all duration-200 group h-full flex flex-col">
        <div className="relative">
          {course.thumbnail ? (
            <img src={course.thumbnail} alt={title} className="w-full h-44 object-cover" />
          ) : (
            <div className="w-full h-44 bg-gradient-to-br from-orange-100 via-orange-50 to-white flex items-center justify-center">
              <span className="text-4xl font-bold text-orange-200">{title.charAt(0)}</span>
            </div>
          )}
          <div className="absolute top-3 left-3">
            <Badge variant="default">{category}</Badge>
          </div>
          <div className="absolute top-3 right-3">
            <Badge variant={priceVariant}>{priceLabel}</Badge>
          </div>
        </div>
        <div className="p-5 flex flex-col flex-1">
          <h3 className="text-gray-900 font-semibold text-base mb-2 group-hover:text-orange-600 transition-colors font-heading line-clamp-2">{title}</h3>
          <div className="flex items-center gap-1 mb-3">
            {course.rating > 0 && course.reviewCount ? (
              <>
                <span className="text-orange-500 text-sm">{'★'.repeat(Math.floor(course.rating))}</span>
                <span className="text-gray-400 text-xs">{course.rating} ({course.reviewCount})</span>
              </>
            ) : (
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">New</span>
            )}
          </div>
          <div className="mt-auto flex items-center gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {formatNumber(course.students)}
            </span>
            <span className="flex items-center gap-1">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
              {course.lectures} {locale === 'ar' ? 'دروس' : locale === 'es' ? 'lecciones' : 'lessons'}
            </span>
            <Badge variant={course.level === 'Beginner' ? 'success' : course.level === 'Intermediate' ? 'warning' : 'purple'}>{course.level}</Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
