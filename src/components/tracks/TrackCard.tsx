'use client';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { formatNumber } from '@/lib/utils';
import { useI18n, tContent } from '@/lib/i18n';

type Track = {
  slug: string;
  name: string;
  icon: string;
  description: unknown;
  students: number;
  exercises: number;
  difficulty: string;
  isFree: boolean;
};

export default function TrackCard({ track }: { track: Track }) {
  const { t, locale } = useI18n();
  const description = tContent(track.description, locale);
  const difficultyVariant = track.difficulty === 'beginner' ? 'success' : track.difficulty === 'intermediate' ? 'warning' : 'purple';
  const isUrl = track.icon.startsWith('http');

  return (
    <Link href={`/tracks/${track.slug}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-6 hover:border-orange-300 hover:shadow-md transition-all duration-200 group h-full">
        <div className="flex items-start justify-between mb-4">
          {isUrl ? (
            <img src={track.icon} alt={track.name} className="w-10 h-10 object-contain" />
          ) : (
            <span className="text-4xl group-hover:animate-bounce transition-all duration-300">{track.icon}</span>
          )}
          {track.isFree ? (
            <Badge variant="success">{t('trackCard.free')}</Badge>
          ) : (
            <Badge variant="purple">{t('trackCard.pro')}</Badge>
          )}
        </div>
        <h3 className="text-gray-900 font-semibold text-lg mb-2 group-hover:text-orange-600 transition-colors font-heading">{track.name}</h3>
        <p className="text-gray-500 text-sm mb-4 line-clamp-2">{description}</p>
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>{formatNumber(track.students)} {t('trackCard.students')}</span>
          <span>{track.exercises} {t('trackCard.exercises')}</span>
        </div>
        <div className="mt-3">
          <Badge variant={difficultyVariant}>{track.difficulty}</Badge>
        </div>
      </div>
    </Link>
  );
}
