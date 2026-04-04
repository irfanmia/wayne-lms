'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import kidsApi from '@/lib/kids-api';

interface Challenge {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  points: number;
  icon_emoji: string;
  order: number;
}

interface Lesson {
  id: number;
  title: string;
  slug: string;
  description: string;
  intro_text: string;
  icon_emoji: string;
  order: number;
  challenges: Challenge[];
}

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  age_group: string;
  icon_emoji: string;
  color: string;
  lessons: Lesson[];
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

const AGE_LABELS: Record<string, string> = {
  '5-7': '👶 Ages 5–7',
  '8-10': '🧒 Ages 8–10',
  '11-13': '🧑 Ages 11–13',
};

export default function KidCoursePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedLesson, setExpandedLesson] = useState<number | null>(null);

  useEffect(() => {
    kidsApi.getCourse(slug).then(data => {
      setCourse(data);
      // Auto-expand first lesson
      if (data.lessons?.length > 0) setExpandedLesson(data.lessons[0].id);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-6xl animate-bounce">🚀</div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-20">
        <div className="text-5xl mb-4">😕</div>
        <p className="text-gray-500 text-lg">Course not found</p>
        <a href="/kids/challenges" className="text-orange-500 hover:underline mt-4 inline-block font-semibold">← Back to Challenges</a>
      </div>
    );
  }

  const totalChallenges = course.lessons.reduce((sum, l) => sum + (l.challenges?.length || 0), 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Back link */}
      <a href="/kids/challenges" className="text-gray-400 hover:text-orange-500 transition-colors text-sm mb-6 inline-block">← All Courses</a>

      {/* Course header */}
      <div className="rounded-3xl p-8 mb-8 border-2 border-gray-100" style={{ backgroundColor: course.color + '10' }}>
        <div className="flex items-start gap-4">
          <div className="text-6xl">{course.icon_emoji}</div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold font-[Manrope] mb-2">{course.title}</h1>
            <p className="text-gray-600 mb-4">{course.description}</p>
            <div className="flex flex-wrap gap-3 text-sm">
              <span className="bg-white px-3 py-1.5 rounded-full border border-gray-200 font-medium">
                {AGE_LABELS[course.age_group] || course.age_group}
              </span>
              <span className="bg-white px-3 py-1.5 rounded-full border border-gray-200 font-medium">
                📚 {course.lessons.length} lessons
              </span>
              <span className="bg-white px-3 py-1.5 rounded-full border border-gray-200 font-medium">
                🧩 {totalChallenges} challenges
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Lessons accordion */}
      <h2 className="text-xl font-bold font-[Manrope] mb-4">📖 Lessons & Challenges</h2>
      <div className="space-y-3">
        {course.lessons.sort((a, b) => a.order - b.order).map((lesson, idx) => (
          <div key={lesson.id} className="bg-white rounded-2xl border-2 border-gray-100 overflow-hidden hover:border-orange-200 transition-colors">
            {/* Lesson header */}
            <button
              onClick={() => setExpandedLesson(expandedLesson === lesson.id ? null : lesson.id)}
              className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-orange-50/50 transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-orange-100 flex items-center justify-center text-lg font-bold text-orange-600 shrink-0">
                {idx + 1}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-gray-900">{lesson.icon_emoji} {lesson.title}</h3>
                {lesson.description && (
                  <p className="text-sm text-gray-500 truncate">{lesson.description}</p>
                )}
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400 bg-gray-50 px-2 py-1 rounded-full">
                  {lesson.challenges?.length || 0} challenges
                </span>
                <span className={`text-gray-400 transition-transform ${expandedLesson === lesson.id ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </div>
            </button>

            {/* Expanded challenges */}
            {expandedLesson === lesson.id && lesson.challenges?.length > 0 && (
              <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50">
                {lesson.intro_text && (
                  <p className="text-sm text-gray-500 mb-4 italic">{lesson.intro_text}</p>
                )}
                <div className="grid sm:grid-cols-2 gap-3">
                  {lesson.challenges.sort((a, b) => a.order - b.order).map((challenge) => (
                    <a
                      key={challenge.id}
                      href={`/kids/learn/${challenge.id}`}
                      className="bg-white rounded-xl p-4 border border-gray-200 hover:border-orange-400 hover:shadow-md transition-all group flex items-start gap-3"
                    >
                      <span className="text-2xl">{challenge.icon_emoji}</span>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-sm group-hover:text-orange-500 transition-colors">
                          {challenge.title}
                        </h4>
                        {challenge.description && (
                          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{challenge.description}</p>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          <span className={`text-[10px] px-1.5 py-0.5 rounded-full border ${DIFFICULTY_COLORS[challenge.difficulty] || ''}`}>
                            {challenge.difficulty}
                          </span>
                          <span className="text-xs text-orange-500 font-semibold">+{challenge.points} pts</span>
                        </div>
                      </div>
                      <span className="text-gray-300 group-hover:text-orange-400 transition-colors mt-1">→</span>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {/* Empty lesson */}
            {expandedLesson === lesson.id && (!lesson.challenges || lesson.challenges.length === 0) && (
              <div className="border-t border-gray-100 px-6 py-8 bg-gray-50/50 text-center">
                <div className="text-3xl mb-2">🔜</div>
                <p className="text-gray-400 text-sm">Challenges coming soon!</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div className="mt-8 text-center">
        <a href="/kids/challenges" className="text-orange-500 hover:underline font-semibold">← Browse all courses</a>
      </div>
    </div>
  );
}
