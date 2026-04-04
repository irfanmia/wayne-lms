import { cn } from '@/lib/utils';

export default function ProgressBar({ value, className }: { value: number; className?: string }) {
  return (
    <div className={cn('w-full bg-gray-100 rounded-full h-2', className)}>
      <div
        className="bg-orange-500 h-2 rounded-full transition-all duration-500"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
