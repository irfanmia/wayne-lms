'use client';
import { useState, useEffect, useCallback } from 'react';
import {
  PracticeOverview, PracticeExerciseDetail, PracticeProgress, PracticeBadge,
} from '@/data/mockPracticeData';
import ConceptMap from './ConceptMap';
import ExerciseView from './ExerciseView';
import CourseBadges from './CourseBadges';
import PracticeSidebar from './PracticeSidebar';

interface Props {
  courseSlug: string;
  courseTitle: string;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

async function fetchJSON(url: string) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(url, { headers });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

const emptyOverview: PracticeOverview = { concepts: [], total_exercises: 0, completed_exercises: 0, total_points: 0 };
const emptyConceptMap = { nodes: [], edges: [] };
const emptyProgress: PracticeProgress = { completed: 0, total: 0, points: 0, badges_earned: 0, streak: 0 };

export default function PracticeMode({ courseSlug, courseTitle }: Props) {
  const [overview, setOverview] = useState<PracticeOverview>(emptyOverview);
  const [conceptMapData, setConceptMapData] = useState(emptyConceptMap);
  const [progress, setProgress] = useState<PracticeProgress>(emptyProgress);
  const [badges, setBadges] = useState<PracticeBadge[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<PracticeExerciseDetail | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showBadges, setShowBadges] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [ov, cm, pr, bg] = await Promise.all([
        fetchJSON(`${API}/courses/${courseSlug}/practice/`),
        fetchJSON(`${API}/courses/${courseSlug}/practice/concept-map/`),
        fetchJSON(`${API}/courses/${courseSlug}/practice/progress/`),
        fetchJSON(`${API}/courses/${courseSlug}/practice/badges/`),
      ]);
      setOverview(ov);
      setConceptMapData(cm);
      setProgress(pr);
      setBadges(bg);
    } catch (err) {
      console.error('Failed to load practice data:', err);
      setError('Failed to load practice data. Please enroll in this course first.');
    } finally {
      setLoading(false);
    }
  }, [courseSlug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const selectExercise = async (conceptSlug: string, exerciseSlug: string) => {
    try {
      const data = await fetchJSON(`${API}/courses/${courseSlug}/practice/exercises/${exerciseSlug}/`);
      setSelectedExercise(data);
    } catch {
      // Build from overview data
      const concept = overview.concepts.find(c => c.slug === conceptSlug);
      const ex = concept?.exercises.find(e => e.slug === exerciseSlug);
      if (ex) {
        setSelectedExercise({
          ...ex,
          description: '',
          instructions: `Complete the "${ex.title}" exercise.`,
          starter_code: '# Write your code here\n',
          test_code: '',
          concept: concept?.title || '',
          concept_slug: conceptSlug,
          code_submitted: null,
          attempts: 0,
        });
      }
    }
    setSidebarOpen(false);
  };

  const handleConceptSelect = (slug: string) => {
    const concept = overview.concepts.find(c => c.slug === slug);
    if (concept && concept.exercises.length > 0) {
      selectExercise(slug, concept.exercises[0].slug);
    }
  };

  const handleExerciseComplete = () => {
    loadData(); // Refresh all data
  };

  const handleNextExercise = () => {
    if (!selectedExercise) return;
    // Find current exercise in overview and go to next
    const allExercises = overview.concepts.flatMap(c =>
      c.exercises.map(e => ({ ...e, conceptSlug: c.slug }))
    );
    const idx = allExercises.findIndex(e => e.slug === selectedExercise.slug);
    if (idx >= 0 && idx < allExercises.length - 1) {
      const next = allExercises[idx + 1];
      selectExercise(next.conceptSlug, next.slug);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading practice exercises...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <p className="text-red-500 text-lg mb-2">⚠️ {error}</p>
          <button onClick={loadData} className="text-orange-600 hover:text-orange-700 font-medium cursor-pointer">
            Try again
          </button>
        </div>
      </div>
    );
  }

  if (overview.total_exercises === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center max-w-md">
          <p className="text-gray-500 text-lg">No practice exercises available for this course yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white">
      {/* Practice Sidebar */}
      <PracticeSidebar
        courseTitle={courseTitle}
        concepts={overview.concepts}
        progress={progress}
        badges={badges}
        currentExerciseSlug={selectedExercise?.slug || null}
        onSelectExercise={selectExercise}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-500 hover:text-gray-700 cursor-pointer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {overview.completed_exercises}/{overview.total_exercises} exercises · {overview.total_points} pts
              </span>
              <button
                onClick={() => setShowBadges(!showBadges)}
                className="text-sm text-orange-600 hover:text-orange-700 font-medium cursor-pointer"
              >
                🏆 Badges
              </button>
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Badges panel (togglable) */}
          {showBadges && (
            <div className="mb-8">
              <CourseBadges badges={badges} />
            </div>
          )}

          {/* Concept Map */}
          {!selectedExercise && (
            <ConceptMap
              nodes={conceptMapData.nodes}
              edges={conceptMapData.edges}
              onSelectConcept={handleConceptSelect}
            />
          )}

          {/* Exercise View */}
          {selectedExercise ? (
            <div>
              <button
                onClick={() => setSelectedExercise(null)}
                className="text-sm text-gray-500 hover:text-orange-600 mb-4 cursor-pointer"
              >
                ← Back to concept map
              </button>
              <ExerciseView
                exercise={selectedExercise}
                courseSlug={courseSlug}
                onComplete={handleExerciseComplete}
                onNext={handleNextExercise}
              />
            </div>
          ) : (
            /* Exercise list grouped by concept */
            <div className="space-y-6">
              {overview.concepts.map(concept => (
                <div key={concept.id}>
                  <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <span>{concept.icon}</span> {concept.title}
                    <span className="text-sm font-normal text-gray-400">
                      {concept.completed_count}/{concept.exercise_count}
                    </span>
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {concept.exercises.map(ex => (
                      <button
                        key={ex.id}
                        onClick={() => selectExercise(concept.slug, ex.slug)}
                        className={`text-left p-4 rounded-xl border transition-all cursor-pointer hover:shadow-md ${
                          ex.status === 'completed'
                            ? 'bg-green-50 border-green-200'
                            : 'bg-white border-gray-200 hover:border-orange-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                            ex.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            ex.difficulty === 'medium' ? 'bg-orange-100 text-orange-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {ex.difficulty}
                          </span>
                          <span className="text-xs text-gray-500">{ex.points} pts</span>
                        </div>
                        <h4 className="font-medium text-gray-800">{ex.title}</h4>
                        <div className="flex items-center gap-2 mt-2">
                          {ex.status === 'completed' && <span className="text-green-500 text-sm">✅ Done</span>}
                          {ex.status === 'failed' && <span className="text-red-500 text-sm">❌ Failed</span>}
                          {ex.status === 'in_progress' && <span className="text-orange-500 text-sm">🔄 In Progress</span>}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
