'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';
import { useAuth } from '@/lib/auth';

interface WishlistCourse {
  slug: string;
  title: Record<string, string> | string;
  description?: Record<string, string> | string;
  thumbnail?: string;
  level?: string;
  instructor?: string;
  price?: string | number;
  is_free?: boolean;
  priceType?: string;
  module_count?: number;
  category?: string;
}

interface WishlistItem {
  id: number;
  course: WishlistCourse;
  added_at: string;
}

export default function WishlistPage() {
  const { isAuthenticated } = useAuth();
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    api.getWishlist()
      .then((data: any) => {
        const list = Array.isArray(data) ? data : data?.results || [];
        setItems(list);
      })
      .catch(() => setItems([]))
      .finally(() => setLoading(false));
  }, [isAuthenticated]);

  const removeItem = async (courseSlug: string) => {
    try {
      await api.toggleWishlist(courseSlug);
      setItems(prev => prev.filter(i => i.course.slug !== courseSlug));
    } catch { /* ignore */ }
  };

  const t = (obj: Record<string, string> | string | undefined) => {
    if (!obj) return '';
    if (typeof obj === 'string') return obj;
    return obj?.en || Object.values(obj)[0] || '';
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center">
        <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
        </svg>
        <p className="text-gray-500 mb-4">Please log in to view your wishlist</p>
        <Link href="/login?redirect=/wishlist" className="inline-block px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition">
          Log In
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-heading">My Wishlist</h1>
        {items.length > 0 && (
          <span className="text-sm text-gray-500">{items.length} course{items.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-orange-500" />
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-lg font-medium text-gray-700 mb-2">Your wishlist is empty</p>
          <p className="text-gray-500 mb-6">Explore courses and add them to your wishlist to save for later</p>
          <Link href="/courses" className="inline-block px-6 py-2.5 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 transition">
            Browse Courses →
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {items.map(item => {
            const course = item.course;
            const title = t(course.title as Record<string, string>);
            const desc = t(course.description as Record<string, string>);
            const isFree = course.is_free || course.priceType === 'free' || Number(course.price) === 0;

            return (
              <div key={item.id} className="flex items-start gap-5 p-5 border border-gray-200 rounded-xl hover:shadow-md transition-shadow bg-white">
                {/* Thumbnail */}
                <Link href={`/courses/${course.slug}`} className="shrink-0">
                  <div className="w-40 h-24 bg-gradient-to-br from-orange-100 to-orange-50 rounded-lg overflow-hidden">
                    {course.thumbnail ? (
                      <img src={course.thumbnail} alt={title} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-orange-300 text-3xl font-bold">
                        {title.charAt(0)}
                      </div>
                    )}
                  </div>
                </Link>

                {/* Details */}
                <div className="flex-1 min-w-0">
                  <Link href={`/courses/${course.slug}`} className="text-base font-semibold text-gray-900 hover:text-orange-600 transition-colors line-clamp-1">
                    {title}
                  </Link>
                  {desc && <p className="text-sm text-gray-500 mt-1 line-clamp-2">{desc}</p>}
                  <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                    {course.instructor && <span>{course.instructor}</span>}
                    {course.level && (
                      <>
                        <span>·</span>
                        <span className="capitalize">{course.level}</span>
                      </>
                    )}
                    {course.module_count && (
                      <>
                        <span>·</span>
                        <span>{course.module_count} modules</span>
                      </>
                    )}
                    {course.category && (
                      <>
                        <span>·</span>
                        <span>{course.category}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-3 mt-3">
                    <Link href={`/courses/${course.slug}`}>
                      <button className="px-4 py-1.5 bg-orange-500 text-white text-xs font-medium rounded-lg hover:bg-orange-600 transition cursor-pointer">
                        {isFree ? 'Start Learning — Free' : `Enroll — $${course.price}`}
                      </button>
                    </Link>
                    <button
                      onClick={() => removeItem(course.slug)}
                      className="px-3 py-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                </div>

                {/* Price */}
                <div className="shrink-0 text-right">
                  {isFree ? (
                    <span className="text-lg font-bold text-green-600">Free</span>
                  ) : (
                    <span className="text-lg font-bold text-gray-900">${course.price}</span>
                  )}
                  <p className="text-xs text-gray-400 mt-1">
                    Added {new Date(item.added_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
