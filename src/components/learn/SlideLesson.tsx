'use client';
import { useState } from 'react';

interface Slide {
  title: string;
  content: string;
  image_url?: string;
}

interface SlideLessonProps {
  slides: Slide[];
  lessonTitle: string;
}

export default function SlideLesson({ slides, lessonTitle }: SlideLessonProps) {
  const [current, setCurrent] = useState(0);

  if (!slides || slides.length === 0) {
    return <div className="p-8 text-center text-gray-500">No slides available</div>;
  }

  const slide = slides[current];

  return (
    <div className="max-w-4xl mx-auto">
      <p className="text-sm text-orange-500 font-medium mb-1">Slide lesson</p>
      <h1 className="text-2xl font-heading font-bold mb-6">{lessonTitle}</h1>

      <div className="bg-gray-900 rounded-2xl overflow-hidden shadow-xl">
        {slide.image_url && (
          <div className="relative h-64 md:h-96">
            <img
              src={slide.image_url}
              alt={slide.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 to-transparent" />
          </div>
        )}
        <div className="p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">{slide.title}</h2>
          <p className="text-gray-300 text-lg leading-relaxed">{slide.content}</p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between mt-6">
        <button
          onClick={() => setCurrent(Math.max(0, current - 1))}
          disabled={current === 0}
          className="px-6 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-40 transition font-medium"
        >
          ← Previous
        </button>
        <span className="text-sm text-gray-500">
          {current + 1} / {slides.length}
        </span>
        <button
          onClick={() => setCurrent(Math.min(slides.length - 1, current + 1))}
          disabled={current === slides.length - 1}
          className="px-6 py-2 rounded-lg bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-40 transition font-medium"
        >
          Next →
        </button>
      </div>

      {/* Slide dots */}
      <div className="flex justify-center gap-2 mt-4">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-3 h-3 rounded-full transition ${
              i === current ? 'bg-orange-500' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
