'use client';
import Link from 'next/link';
import Badge from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useI18n, tContent } from '@/lib/i18n';

type Exercise = {
  slug: string;
  trackSlug: string;
  name: string;
  difficulty: unknown;
  difficultyKey?: string;
  type: string;
  description: unknown;
  status: string;
  points: number;
};

export default function ExerciseCard({ exercise }: { exercise: Exercise }) {
  const { locale } = useI18n();
  const description = tContent(exercise.description, locale);
  const difficulty = tContent(exercise.difficulty, locale);
  const difficultyKey = exercise.difficultyKey || (typeof exercise.difficulty === 'string' ? exercise.difficulty : (exercise.difficulty as Record<string, string>)?.en || 'easy');

  const statusConfig: Record<string, { variant: 'success' | 'warning' | 'info' | 'default'; label: Record<string, string> }> = {
    completed: { variant: 'success', label: { en: '✓ Completed', ar: '✓ مكتمل', es: '✓ Completado' } },
    'in-progress': { variant: 'warning', label: { en: '◐ In Progress', ar: '◐ قيد التنفيذ', es: '◐ En Progreso' } },
    available: { variant: 'info', label: { en: 'Available', ar: 'متاح', es: 'Disponible' } },
    locked: { variant: 'default', label: { en: '🔒 Locked', ar: '🔒 مقفل', es: '🔒 Bloqueado' } },
  };
  const st = statusConfig[exercise.status] || statusConfig.locked;
  const isLocked = exercise.status === 'locked';

  return (
    <Link
      href={isLocked ? '#' : `/tracks/${exercise.trackSlug}/exercises/${exercise.slug}`}
      className={cn(isLocked && 'pointer-events-none opacity-50')}
    >
      <div className="bg-white border border-gray-200 rounded-xl p-5 hover:border-orange-300 hover:shadow-md transition-all duration-200 group">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-gray-900 font-medium group-hover:text-orange-600 transition-colors">{exercise.name}</h4>
          <Badge variant={st.variant}>{st.label[locale] || st.label.en}</Badge>
        </div>
        <p className="text-gray-500 text-sm mb-3">{description}</p>
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <Badge variant={difficultyKey === 'easy' ? 'success' : difficultyKey === 'medium' ? 'warning' : 'purple'}>{difficulty}</Badge>
          <span className="capitalize">{exercise.type}</span>
          <span>+{exercise.points} pts</span>
        </div>
      </div>
    </Link>
  );
}
