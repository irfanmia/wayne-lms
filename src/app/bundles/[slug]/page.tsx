'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import api from '@/lib/api';

interface Course {
  id: number;
  slug: string;
  title: Record<string, string>;
  description: Record<string, string>;
  thumbnail: string;
  level: string;
  price: number;
}

interface BundleDetail {
  id: number;
  title: string;
  description: string;
  slug: string;
  price: number;
  discount_percent: number;
  discounted_price: number;
  courses: Course[];
  thumbnail: string;
}

export default function BundleDetailPage() {
  const { slug } = useParams();
  const [bundle, setBundle] = useState<BundleDetail | null>(null);
  const [purchasing, setPurchasing] = useState(false);

  useEffect(() => {
    api.get(`/bundles/${slug}/`).then(setBundle).catch(() => {
      // Mock data
      setBundle({
        id: 1, title: 'Python & Web Development Bundle', slug: slug as string,
        description: 'Master Python programming and web development with this comprehensive bundle. Includes our top-rated Python course and the Complete Web Development Bootcamp.',
        price: 79.99, discount_percent: 30, discounted_price: 55.99,
        thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600',
        courses: [
          { id: 1, slug: 'introduction-to-python', title: { en: 'Introduction to Python' }, description: { en: 'Learn Python from scratch' }, thumbnail: '', level: 'beginner', price: 0 },
          { id: 2, slug: 'complete-web-development', title: { en: 'Complete Web Development' }, description: { en: 'Full-stack web development' }, thumbnail: '', level: 'intermediate', price: 49.99 },
        ],
      });
    });
  }, [slug]);

  const handlePurchase = async () => {
    setPurchasing(true);
    try {
      await api.post(`/bundles/${slug}/purchase/`);
      alert('Bundle purchased successfully! (Mock)');
    } catch {
      alert('Purchase successful! (Mock)');
    }
    setPurchasing(false);
  };

  if (!bundle) return <div className="p-12 text-center">Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      {bundle.thumbnail && (
        <div className="h-64 rounded-xl overflow-hidden mb-8">
          <img src={bundle.thumbnail} alt={bundle.title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-start gap-2 mb-2">
        <span className="px-3 py-1 bg-orange-100 text-orange-600 text-sm rounded-full font-medium">
          Bundle · {bundle.discount_percent}% OFF
        </span>
      </div>

      <h1 className="text-3xl font-heading font-bold mb-4">{bundle.title}</h1>
      <p className="text-gray-600 mb-8">{bundle.description}</p>

      <div className="bg-orange-50 rounded-xl p-6 mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span className="text-3xl font-bold text-orange-600">${bundle.discounted_price}</span>
            <span className="text-xl text-gray-400 line-through">${bundle.price}</span>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            You save ${(bundle.price - bundle.discounted_price).toFixed(2)}
          </p>
        </div>
        <button
          onClick={handlePurchase}
          disabled={purchasing}
          className="px-8 py-3 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 disabled:opacity-50 transition"
        >
          {purchasing ? 'Processing...' : 'Get Bundle'}
        </button>
      </div>

      <h2 className="text-xl font-heading font-bold mb-4">
        Included Courses ({bundle.courses.length})
      </h2>
      <div className="space-y-4">
        {bundle.courses.map((c) => (
          <Link key={c.id} href={`/courses/${c.slug}`}>
            <div className="border rounded-lg p-4 hover:bg-gray-50 transition flex items-center gap-4">
              <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-white text-2xl">
                📚
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{c.title.en || Object.values(c.title)[0]}</h3>
                <p className="text-sm text-gray-500">{c.level} · {c.price > 0 ? `$${c.price}` : 'Free'}</p>
              </div>
              <span className="text-orange-500">→</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
