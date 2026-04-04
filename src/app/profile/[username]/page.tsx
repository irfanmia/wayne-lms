'use client';
import { use, useState, useEffect } from 'react';
import Badge from '@/components/ui/Badge';
import ProgressBar from '@/components/ui/ProgressBar';
import { useI18n, tContent } from '@/lib/i18n';
import { useAuth } from '@/lib/auth';
import api from '@/lib/api';

const emptyUser = {
  name: '', bio: '', location: '', reputation: 0, isPro: false,
  joinedDate: new Date().toISOString(),
  badges: [] as { name: string; icon: string; description: string }[],
  activeTracks: [] as { slug: string; name: string; icon: string; progress: number; exercisesCompleted: number; totalExercises: number }[],
  solutions: [] as { exercise: string; track: string; publishedAt: string; stars: number }[],
  certificates: [] as { id: string; name: string | Record<string, string>; track: string; date: string }[],
};

export default function ProfilePage({ params }: { params: Promise<{ username: string }> }) {
  const { username } = use(params);
  const { t, locale } = useI18n();
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(emptyUser);
  const [loading, setLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const me = await api.getMe();
        setUser({
          ...emptyUser,
          ...me,
          name: me.name || me.username || username,
          bio: me.bio || '',
          location: me.location || '',
          reputation: me.reputation || 0,
          badges: me.badges || [],
          activeTracks: me.active_tracks || me.activeTracks || [],
          solutions: me.solutions || [],
          certificates: me.certificates || [],
        });
        setIsOffline(false);
      } catch {
        setUser({ ...emptyUser, name: username });
        setIsOffline(true);
      }
      setLoading(false);
    };
    load();
  }, [username, authUser]);

  if (loading) return <div className="max-w-5xl mx-auto px-4 py-12"><div className="animate-pulse space-y-6"><div className="h-24 w-24 bg-gray-200 rounded-2xl" /><div className="h-8 bg-gray-200 rounded w-48" /><div className="h-4 bg-gray-200 rounded w-32" /></div></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
      {isOffline && (
        <div className="mb-4 inline-flex items-center gap-1.5 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
          <span className="w-1.5 h-1.5 bg-amber-500 rounded-full" /> Offline mode
        </div>
      )}
      <div className="flex flex-col md:flex-row items-start gap-6 mb-12">
        <div className="w-24 h-24 bg-orange-500 rounded-2xl flex items-center justify-center text-white text-3xl font-bold">
          {user.name.split(' ').map(n => n[0]).join('')}
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-4xl font-medium text-gray-900 font-heading">{user.name}</h1>
            {user.isPro && <Badge variant="purple">Pro</Badge>}
          </div>
          <p className="text-gray-400 text-sm mb-2">@{username}</p>
          <p className="text-gray-500 mb-3">{typeof user.bio === 'object' ? tContent(user.bio, locale) : user.bio}</p>
          <div className="flex items-center gap-4 text-sm text-gray-400">
            <span>📍 {user.location}</span>
            <span>⭐ {user.reputation.toLocaleString()} {t('profile.reputation')}</span>
            <span>📅 {t('profile.joined')} {new Date(user.joinedDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      <section className="mb-12">
        <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('profile.badges')}</h2>
        <div className="flex flex-wrap gap-3">
          {user.badges.map(b => (
            <div key={typeof b.name === 'object' ? tContent(b.name, locale) : b.name} className="bg-white border border-gray-200 rounded-xl px-4 py-3 flex items-center gap-2 shadow-sm">
              <span className="text-xl">{b.icon}</span>
              <div>
                <p className="text-gray-900 text-sm font-medium">{typeof b.name === 'object' ? tContent(b.name, locale) : b.name}</p>
                <p className="text-gray-400 text-xs">{typeof b.description === 'object' ? tContent(b.description, locale) : b.description}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('profile.trackProgress')}</h2>
        <div className="space-y-4">
          {user.activeTracks.map(tr => (
            <div key={tr.slug} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                {tr.icon.startsWith('http') ? (
                  <img src={tr.icon} alt={tr.name} className="w-8 h-8 object-contain" />
                ) : (
                  <span className="text-2xl">{tr.icon}</span>
                )}
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-gray-900 font-medium">{tr.name}</h4>
                    <span className="text-orange-600 text-sm">{tr.progress}%</span>
                  </div>
                  <p className="text-gray-400 text-xs">{tr.exercisesCompleted}/{tr.totalExercises} {t('trackCard.exercises')}</p>
                </div>
              </div>
              <ProgressBar value={tr.progress} />
            </div>
          ))}
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('profile.publishedSolutions')}</h2>
        <div className="space-y-3">
          {user.solutions.map((s, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm">
              <div>
                <p className="text-gray-900 font-medium">{s.exercise}</p>
                <p className="text-gray-400 text-sm">{s.track} • {new Date(s.publishedAt).toLocaleDateString()}</p>
              </div>
              <span className="text-yellow-500 text-sm">⭐ {s.stars}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-medium text-gray-900 mb-4 font-heading">{t('profile.certificates')}</h2>
        {user.certificates.map(c => (
          <a key={c.id} href={`/certificates/${c.id}`} className="block bg-orange-50 border border-orange-200 rounded-xl p-5 hover:border-orange-400 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-900 font-medium">{typeof c.name === 'object' ? tContent(c.name, locale) : c.name}</p>
                <p className="text-gray-400 text-sm">{c.track} • Earned {new Date(c.date).toLocaleDateString()}</p>
              </div>
              <Badge variant="success">{t('profile.verified')}</Badge>
            </div>
          </a>
        ))}
      </section>
    </div>
  );
}
