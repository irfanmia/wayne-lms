'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import api from '@/lib/api';

interface Bundle {
  id: number;
  title: string;
  description: string;
  slug: string;
  price: number;
  discount_percent: number;
  discounted_price: number;
  course_count: number;
  thumbnail: string;
}

const mockBundles: Bundle[] = [
  { id: 1, title: 'Python & Web Development Bundle', description: 'Master Python programming and web development with this comprehensive bundle.', slug: 'python-web-dev-bundle', price: 79.99, discount_percent: 30, discounted_price: 55.99, course_count: 3, thumbnail: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=600' },
  { id: 2, title: 'Data Science Starter Pack', description: 'Everything you need to start your data science journey.', slug: 'data-science-starter', price: 99.99, discount_percent: 25, discounted_price: 74.99, course_count: 2, thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600' },
];

export default function BundlesPage() {
  const [bundles, setBundles] = useState<Bundle[]>(mockBundles);

  useEffect(() => {
    api.get('/bundles/').then(setBundles).catch(() => {});
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-heading font-bold mb-2">Course Bundles</h1>
      <p className="text-gray-500 mb-8">Save more by bundling courses together</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {bundles.map((b) => (
          <Link key={b.id} href={`/bundles/${b.slug}`}>
            <div className="group border rounded-xl overflow-hidden hover:shadow-lg transition">
              {b.thumbnail && (
                <div className="h-48 overflow-hidden">
                  <img src={b.thumbnail} alt={b.title} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-orange-100 text-orange-600 text-xs rounded-full font-medium">
                    {b.discount_percent}% OFF
                  </span>
                  <span className="text-sm text-gray-500">{b.course_count} courses</span>
                </div>
                <h2 className="text-xl font-heading font-bold mb-2">{b.title}</h2>
                <p className="text-gray-500 text-sm mb-4">{b.description}</p>
                <div className="flex items-center gap-3">
                  <span className="text-2xl font-bold text-orange-600">${b.discounted_price}</span>
                  <span className="text-lg text-gray-400 line-through">${b.price}</span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
