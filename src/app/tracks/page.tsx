'use client';
import { useState, useEffect } from 'react';
import TrackCard from '@/components/tracks/TrackCard';
import AnimatedSection from '@/components/ui/AnimatedSection';
import { StaggerContainer, StaggerItem } from '@/components/ui/StaggerContainer';
import GridBackground from '@/components/ui/GridBackground';
import api from '@/lib/api';
import { useI18n } from '@/lib/i18n';

export default function TracksPage() {
  const { t } = useI18n();
  const [search, setSearch] = useState('');
  const [difficulty, setDifficulty] = useState('all');
  const [category, setCategory] = useState('all');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [tracks, setTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    api.getTracks()
      .then((data) => {
        const results = Array.isArray(data) ? data : data.results || data;
        setTracks(results);
        setError(null);
      })
      .catch((err) => {
        setError(err?.message || 'Failed to load tracks');
      })
      .finally(() => setLoading(false));
  }, []);

  const filtered = tracks.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false;
    if (difficulty !== 'all' && t.difficulty !== difficulty) return false;
    if (category !== 'all' && t.category !== category) return false;
    return true;
  });

  const categories = ['all', ...new Set(tracks.map(t => t.category))];

  return (
    <GridBackground className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <AnimatedSection>
          <div className="mb-10">
            <h1 className="text-4xl font-extrabold text-gray-900 mb-3 font-heading">{t('tracksPage.title')}</h1>
            <p className="text-gray-500 text-lg">{t('tracksPage.subtitle')}</p>
            {error && !loading && (
              <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-3 py-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" /> Couldn&apos;t reach server: {error}
              </div>
            )}
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.1}>
          <div className="flex flex-wrap items-center gap-4 mb-8">
            <input
              type="text"
              placeholder={t('tracksPage.searchPlaceholder') as string}
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500 w-64 transition-all"
            />
            <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
              <option value="all">{t('tracksPage.allDifficulties')}</option>
              <option value="beginner">{t('tracksPage.beginner')}</option>
              <option value="intermediate">{t('tracksPage.intermediate')}</option>
              <option value="advanced">{t('tracksPage.advanced')}</option>
            </select>
            <select value={category} onChange={e => setCategory(e.target.value)} className="bg-white border border-gray-300 rounded-lg px-4 py-2.5 text-gray-700 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500">
              {categories.map(c => <option key={c} value={c}>{c === 'all' ? t('tracksPage.allCategories') : c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
            <span className="text-gray-400 text-sm ml-auto">{filtered.length} {t('tracksPage.tracks')}</span>
          </div>
        </AnimatedSection>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(track => (
            <StaggerItem key={track.slug}>
              <div className="card-hover rounded-xl">
                <TrackCard track={track} />
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>
        {loading && tracks.length === 0 && (
          <div className="text-center py-20 text-gray-400">Loading tracks…</div>
        )}
        {!loading && filtered.length === 0 && (
          <div className="text-center py-20 text-gray-400">{t('tracksPage.noResults')}</div>
        )}
      </div>
    </GridBackground>
  );
}
