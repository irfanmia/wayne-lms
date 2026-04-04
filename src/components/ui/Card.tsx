import { cn } from '@/lib/utils';

export default function Card({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'bg-white border border-gray-200 rounded-xl p-6 transition-all duration-200 shadow-sm',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
