import { cn } from '@/lib/utils';

type BadgeProps = {
  variant?: 'default' | 'success' | 'warning' | 'info' | 'purple';
  children: React.ReactNode;
  className?: string;
};

export default function Badge({ variant = 'default', className, children }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
        variant === 'default' && 'bg-gray-100 text-gray-600',
        variant === 'success' && 'bg-green-50 text-green-700',
        variant === 'warning' && 'bg-orange-50 text-orange-700',
        variant === 'info' && 'bg-blue-50 text-blue-700',
        variant === 'purple' && 'bg-purple-50 text-purple-700',
        className
      )}
    >
      {children}
    </span>
  );
}
