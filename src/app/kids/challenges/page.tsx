'use client';

import { useState, useEffect } from 'react';
import kidsApi from '@/lib/kids-api';

interface Challenge {
  id: number;
  title: string;
  slug: string;
  description: string;
  difficulty: string;
  challenge_type: string;
  points: number;
  icon_emoji: string;
  lesson_title: string;
  course_title: string;
}

interface Course {
  id: number;
  title: string;
  slug: string;
  description: string;
  age_group: string;
  icon_emoji: string;
  color: string;
  lesson_count: number;
  challenge_count: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  hard: 'bg-red-100 text-red-700 border-red-200',
};

const DIFFICULTY_STARS: Record<string, string> = {
  easy: '⭐', medium: '⭐⭐', hard: '⭐⭐⭐',
};

export default function ChallengesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      kidsApi.getCourses().catch(() => ({ results: [] })),
      kidsApi.getChallenges().catch(() => ({ results: [] })),
    ]).then(([coursesRes, challengesRes]) => {
      setCourses(coursesRes.results || coursesRes || []);
      setChallenges(challengesRes.results || challengesRes || []);
      setLoading(false);
    });
  }, []);

  const filteredChallenges = filter === 'all'
    ? challenges
    : challenges.filter(c => c.difficulty === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl animate-bounce mb-4">🎯</div>
          <p className="text-gray-500 text-lg">Loading challenges...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="text-center mb-10">
        <h1 className="text-3xl md:text-4xl font-bold font-[Manrope] mb-2">
          Coding Challenges 🎯
        </h1>
        <p className="text-gray-600">Pick a challenge and start coding!</p>
      </div>

      {/* Course cards */}
      {courses.length > 0 && (
        <div className="grid md:grid-cols-3 gap-4 mb-10">
          {courses.map(course => (
            <a key={course.id}
              href={`/kids/courses/${course.slug}`}
              className="rounded-2xl p-6 border-2 cursor-pointer hover:shadow-lg hover:border-orange-400 hover:-translate-y-1 transition-all border-gray-100 group"
              style={{ backgroundColor: course.color + '15' }}>
              <div className="text-4xl mb-2">{course.icon_emoji}</div>
              <h3 className="font-bold text-lg group-hover:text-orange-500 transition-colors">{course.title}</h3>
              <p className="text-sm text-gray-600 mb-3">{course.description}</p>
              <div className="flex gap-2 text-xs">
                <span className="bg-white px-2 py-1 rounded-full">{course.lesson_count} lessons</span>
                <span className="bg-white px-2 py-1 rounded-full">{course.challenge_count} challenges</span>
              </div>
              <div className="mt-3 text-orange-500 text-sm font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                Start Learning →
              </div>
            </a>
          ))}
        </div>
      )}

      {/* Filter buttons */}
      <div className="flex gap-2 mb-6 justify-center flex-wrap">
        {[
          { key: 'all', label: 'All', emoji: '🎯' },
          { key: 'easy', label: 'Easy', emoji: '⭐' },
          { key: 'medium', label: 'Medium', emoji: '⭐⭐' },
          { key: 'hard', label: 'Hard', emoji: '⭐⭐⭐' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-4 py-2 rounded-full font-medium transition-all ${
              filter === f.key
                ? 'bg-orange-500 text-white shadow-md'
                : 'bg-white text-gray-600 border border-gray-200 hover:border-orange-300'
            }`}
          >
            {f.emoji} {f.label}
          </button>
        ))}
      </div>

      {/* Challenge grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredChallenges.map(challenge => (
          <a
            key={challenge.id}
            href={`/kids/learn/${challenge.id}`}
            className="bg-white rounded-2xl p-5 border-2 border-gray-100 hover:border-orange-300 hover:shadow-lg transition-all group"
          >
            <div className="flex items-start justify-between mb-3">
              <span className="text-3xl">{challenge.icon_emoji}</span>
              <span className={`text-xs px-2 py-1 rounded-full border ${DIFFICULTY_COLORS[challenge.difficulty]}`}>
                {DIFFICULTY_STARS[challenge.difficulty]} {challenge.difficulty}
              </span>
            </div>
            <h3 className="font-bold text-gray-900 mb-1 group-hover:text-orange-500 transition-colors">
              {challenge.title}
            </h3>
            <p className="text-sm text-gray-500 mb-3">{challenge.description || challenge.lesson_title}</p>
            <div className="flex items-center justify-between text-sm">
              <span className="text-orange-500 font-semibold">+{challenge.points} pts</span>
              <span className="text-gray-400 group-hover:text-orange-500 transition-colors">
                Start →
              </span>
            </div>
          </a>
        ))}
      </div>

      {filteredChallenges.length === 0 && (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">🤷</div>
          <p className="text-gray-500">No challenges found. Try a different filter!</p>
        </div>
      )}
    </div>
  );
}
