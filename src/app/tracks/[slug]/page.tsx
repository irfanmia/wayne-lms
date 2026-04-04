'use client';
import { use, useState, useEffect } from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import ConceptMap from '@/components/practice/ConceptMap';
import PracticeStats from '@/components/practice/PracticeStats';
import staticTracks from '@/data/tracks.json';
import staticExercises from '@/data/exercises.json';
import conceptsData from '@/data/concepts.json';
import { formatNumber } from '@/lib/utils';
import { useI18n, tContent } from '@/lib/i18n';
import api from '@/lib/api';
import { ConceptMapNode, ConceptMapEdge, PracticeProgress, PracticeBadge } from '@/data/mockPracticeData';

// Map concept status strings
function mapStatus(s: string): 'completed' | 'in_progress' | 'not_started' | 'locked' {
  if (s === 'completed') return 'completed';
  if (s === 'in-progress' || s === 'in_progress') return 'in_progress';
  if (s === 'available' || s === 'not_started') return 'not_started';
  return 'locked';
}

// Concept icons by name
const conceptIcons: Record<string, string> = {
  'Basics': '📘', 'Strings': '📝', 'Numbers': '🔢', 'Conditionals': '🔀',
  'Lists': '📋', 'Loops': '🔄', 'Sets': '🎯', 'Dictionaries': '📖',
  'Functions': '⚡', 'Classes': '🏗️', 'Algorithms': '🧮', 'Data Structures': '🗂️',
};

// Track badges
const trackBadges: PracticeBadge[] = [
  { id: 1, name: 'First Step', slug: 'first-step', description: 'Complete your first exercise', icon_url: '🎯', criteria_type: 'exercises', earned: true, earned_at: '2025-01-15' },
  { id: 2, name: 'Quick Learner', slug: 'quick-learner', description: 'Complete 5 exercises', icon_url: '⚡', criteria_type: 'exercises', earned: true, earned_at: '2025-01-20' },
  { id: 3, name: 'Concept Master', slug: 'concept-master', description: 'Complete all exercises in a concept', icon_url: '🏆', criteria_type: 'concepts', earned: false, earned_at: null },
  { id: 4, name: 'Streak Star', slug: 'streak-star', description: 'Maintain a 7-day streak', icon_url: '🌟', criteria_type: 'streak', earned: false, earned_at: null },
  { id: 5, name: 'Track Champion', slug: 'track-champion', description: 'Complete all exercises in this track', icon_url: '👑', criteria_type: 'track', earned: false, earned_at: null },
];

export default function TrackDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const { t, locale } = useI18n();

  const staticTrack = staticTracks.find(t => t.slug === slug);
  const [track, setTrack] = useState(staticTrack);
  const [exercises, setExercises] = useState(staticExercises.filter(e => e.trackSlug === slug));
  const [isOffline, setIsOffline] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedConcept, setSelectedConcept] = useState<string | null>(null);

  const trackConcepts = conceptsData.filter(c => c.trackSlug === slug);

  useEffect(() => {
    api.getTrack(slug)
      .then((data) => { setTrack(data); setIsOffline(false); })
      .catch(() => { setTrack(staticTrack); setIsOffline(true); });
    api.getExercises(slug)
      .then((data) => {
        const results = Array.isArray(data) ? data : data.results || data;
        if (results.length > 0) setExercises(results);
      })
      .catch(() => {});
  }, [slug]);

  if (!track) notFound();

  const description = tContent(track.description, locale);

  // Build concept map nodes
  const conceptMapNodes: ConceptMapNode[] = trackConcepts.map((c, i) => {
    const conceptExercises = exercises.filter(e => e.concept === c.slug);
    const completed = conceptExercises.filter(e => e.status === 'completed').length;
    return {
      id: i + 1,
      title: c.name,
      slug: c.slug,
      icon: conceptIcons[c.name] || '📘',
      order: i,
      status: mapStatus(c.status),
      completed,
      total: conceptExercises.length || Math.ceil(exercises.length / trackConcepts.length),
    };
  });

  // Build edges from prerequisites
  const slugToId: Record<string, number> = {};
  trackConcepts.forEach((c, i) => { slugToId[c.slug] = i + 1; });
  const conceptMapEdges: ConceptMapEdge[] = [];
  trackConcepts.forEach((c, i) => {
    c.prerequisites.forEach(prereq => {
      if (slugToId[prereq]) {
        conceptMapEdges.push({ from: slugToId[prereq], to: i + 1 });
      }
    });
  });

  // Stats
  const completedCount = exercises.filter(e => e.status === 'completed').length;
  const totalPoints = exercises.reduce((sum, e) => sum + (e.points || 10), 0);
  const earnedPoints = exercises.filter(e => e.status === 'completed').reduce((sum, e) => sum + (e.points || 10), 0);

  const progress: PracticeProgress = {
    completed: completedCount,
    total: exercises.length,
    points: earnedPoints,
    badges_earned: trackBadges.filter(b => b.earned).length,
    streak: 2,
  };

  // Get exercises for selected concept
  const selectedConceptExercises = selectedConcept
    ? exercises.filter(e => e.concept === selectedConcept)
    : [];

  const handleConceptSelect = (conceptSlug: string) => {
    setSelectedConcept(selectedConcept === conceptSlug ? null : conceptSlug);
  };

  return (
    <div className="flex min-h-screen bg-white">
      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 h-screen w-80 bg-white border-r border-gray-200 z-50
        overflow-y-auto flex-shrink-0 transition-transform lg:translate-x-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="p-4">
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden absolute top-3 right-3 text-gray-400 hover:text-gray-600 cursor-pointer">✕</button>

          {/* Track header */}
          <div className="flex items-center gap-2 mb-4">
            <Link href="/tracks" className="text-gray-400 hover:text-orange-600 text-sm">‹</Link>
            {track.icon?.startsWith?.('http') ? (
              <img src={track.icon} alt={track.name} className="w-6 h-6 object-contain" />
            ) : (
              <span className="text-xl">{track.icon}</span>
            )}
            <h2 className="font-bold text-gray-900 text-sm">{track.name}</h2>
          </div>

          {isOffline && (
            <div className="mb-3 flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
              <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Offline mode
            </div>
          )}

          {/* Stats */}
          <PracticeStats progress={progress} badges={trackBadges} />

          {/* Concept list */}
          <div className="mt-6 space-y-1">
            <h4 className="text-xs font-semibold text-gray-500 uppercase mb-2">Concepts</h4>
            {trackConcepts.map((concept, i) => {
              const conceptExercises = exercises.filter(e => e.concept === concept.slug);
              const completed = conceptExercises.filter(e => e.status === 'completed').length;
              const isActive = selectedConcept === concept.slug;

              return (
                <button
                  key={concept.slug}
                  onClick={() => handleConceptSelect(concept.slug)}
                  className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors cursor-pointer ${
                    isActive ? 'bg-orange-50 border border-orange-200' : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{conceptIcons[concept.name] || '📘'}</span>
                    <span className={`text-sm font-medium ${isActive ? 'text-orange-700' : 'text-gray-800'}`}>{concept.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {completed}/{conceptExercises.length || '—'}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${
                      mapStatus(concept.status) === 'completed' ? 'bg-green-400' :
                      mapStatus(concept.status) === 'in_progress' ? 'bg-orange-400' :
                      mapStatus(concept.status) === 'not_started' ? 'bg-gray-300' : 'bg-gray-200'
                    }`} />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 min-w-0">
        {/* Top bar */}
        <div className="sticky top-0 bg-white border-b border-gray-200 z-30">
          <div className="flex items-center justify-between px-4 sm:px-6 py-3">
            <div className="flex items-center gap-3">
              <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 text-gray-500 hover:text-gray-700 cursor-pointer">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
              </button>
              <div className="flex items-center gap-2">
                {track.icon?.startsWith?.('http') ? (
                  <img src={track.icon} alt={track.name} className="w-6 h-6 object-contain" />
                ) : (
                  <span className="text-xl">{track.icon}</span>
                )}
                <h1 className="text-lg font-heading font-bold text-gray-900 hidden sm:block">{track.name}</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                {completedCount}/{exercises.length} exercises · {earnedPoints} pts
              </span>
              {track.isFree ? <Badge variant="success">{t('trackCard.free')}</Badge> : <Badge variant="purple">{t('trackCard.pro')}</Badge>}
            </div>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6">
          {/* Track description */}
          <div className="mb-8 bg-gradient-to-r from-orange-50 to-white rounded-2xl border border-orange-100 p-6">
            <p className="text-gray-600">{description}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              {track.tags.map((tag: string) => <Badge key={tag}>{tag}</Badge>)}
            </div>
          </div>

          {/* Concept Map */}
          {conceptMapNodes.length > 0 && !selectedConcept && (
            <ConceptMap
              nodes={conceptMapNodes}
              edges={conceptMapEdges}
              onSelectConcept={handleConceptSelect}
            />
          )}

          {/* Selected concept exercises */}
          {selectedConcept && (
            <div>
              <button
                onClick={() => setSelectedConcept(null)}
                className="text-sm text-gray-500 hover:text-orange-600 mb-4 cursor-pointer"
              >
                ← Back to concept map
              </button>
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span>{conceptIcons[trackConcepts.find(c => c.slug === selectedConcept)?.name || ''] || '📘'}</span>
                {trackConcepts.find(c => c.slug === selectedConcept)?.name}
                <span className="text-sm font-normal text-gray-400">
                  {selectedConceptExercises.length} exercises
                </span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {selectedConceptExercises.map(ex => {
                  const title = typeof ex.name === 'object' ? tContent(ex.name, locale) : ex.name;
                  const difficulty = ex.difficultyKey || 'easy';
                  const points = ex.points || 10;
                  const status = ex.status || 'not_started';

                  return (
                    <Link
                      key={ex.slug}
                      href={`/tracks/${slug}/exercises/${ex.slug}`}
                      className={`text-left p-4 rounded-xl border transition-all hover:shadow-md ${
                        status === 'completed'
                          ? 'bg-green-50 border-green-200'
                          : 'bg-white border-gray-200 hover:border-orange-300'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                          difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          difficulty === 'medium' ? 'bg-orange-100 text-orange-700' :
                          'bg-red-100 text-red-700'
                        }`}>{difficulty}</span>
                        <span className="text-xs text-gray-500">{points} pts</span>
                      </div>
                      <h4 className="font-medium text-gray-800">{title}</h4>
                      <div className="flex items-center gap-2 mt-2">
                        {status === 'completed' && <span className="text-green-500 text-sm">✅ Done</span>}
                        {status === 'failed' && <span className="text-red-500 text-sm">❌ Failed</span>}
                        {status === 'in_progress' && <span className="text-orange-500 text-sm">🔄 In Progress</span>}
                      </div>
                    </Link>
                  );
                })}
                {selectedConceptExercises.length === 0 && (
                  <p className="text-gray-400 text-sm col-span-full py-8 text-center">No exercises for this concept yet</p>
                )}
              </div>
            </div>
          )}

          {/* All exercises grouped by concept (below concept map) */}
          {!selectedConcept && (
            <div className="space-y-8 mt-8">
              {trackConcepts.map(concept => {
                const conceptExercises = exercises.filter(e => e.concept === concept.slug);
                if (conceptExercises.length === 0) return null;

                return (
                  <div key={concept.slug}>
                    <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center gap-2">
                      <span>{conceptIcons[concept.name] || '📘'}</span> {concept.name}
                      <span className="text-sm font-normal text-gray-400">
                        {conceptExercises.filter(e => e.status === 'completed').length}/{conceptExercises.length}
                      </span>
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {conceptExercises.map(ex => {
                        const title = typeof ex.name === 'object' ? tContent(ex.name, locale) : ex.name;
                        const difficulty = ex.difficultyKey || 'easy';
                        const points = ex.points || 10;
                        const status = ex.status || 'not_started';

                        return (
                          <Link
                            key={ex.slug}
                            href={`/tracks/${slug}/exercises/${ex.slug}`}
                            className={`text-left p-4 rounded-xl border transition-all hover:shadow-md ${
                              status === 'completed'
                                ? 'bg-green-50 border-green-200'
                                : 'bg-white border-gray-200 hover:border-orange-300'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                                difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                                difficulty === 'medium' ? 'bg-orange-100 text-orange-700' :
                                'bg-red-100 text-red-700'
                              }`}>{difficulty}</span>
                              <span className="text-xs text-gray-500">{points} pts</span>
                            </div>
                            <h4 className="font-medium text-gray-800">{title}</h4>
                            <div className="flex items-center gap-2 mt-2">
                              {status === 'completed' && <span className="text-green-500 text-sm">✅ Done</span>}
                              {status === 'failed' && <span className="text-red-500 text-sm">❌ Failed</span>}
                              {status === 'in_progress' && <span className="text-orange-500 text-sm">🔄 In Progress</span>}
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {exercises.length === 0 && (
            <div className="text-center py-12 text-gray-400">{t('trackDetail.comingSoon')}</div>
          )}
        </div>
      </div>
    </div>
  );
}
