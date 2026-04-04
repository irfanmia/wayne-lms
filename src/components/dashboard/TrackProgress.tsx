'use client';
import Link from 'next/link';
import ProgressBar from '@/components/ui/ProgressBar';
import { useI18n } from '@/lib/i18n';

type TrackProgressProps = {
  slug: string;
  name: string;
  icon: string;
  progress: number;
  exercisesCompleted: number;
  totalExercises: number;
};

export default function TrackProgress({ slug, name, icon, progress, exercisesCompleted, totalExercises }: TrackProgressProps) {
  const { t } = useI18n();
  return (
    <Link href={`/tracks/${slug}`}>
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center gap-3 mb-3">
          {icon.startsWith('http') ? (
            <img src={icon} alt={name} className="w-8 h-8 object-contain" />
          ) : (
            <span className="text-2xl">{icon}</span>
          )}
          <div className="flex-1">
            <h4 className="text-gray-900 font-medium group-hover:text-orange-600 transition-colors">{name}</h4>
            <p className="text-gray-400 text-xs">{exercisesCompleted}/{totalExercises} {t('trackCard.exercises')}</p>
          </div>
          <span className="text-orange-600 font-semibold text-sm">{progress}%</span>
        </div>
        <ProgressBar value={progress} />
      </div>
    </Link>
  );
}
