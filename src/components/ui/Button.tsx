'use client';
import { cn } from '@/lib/utils';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  size?: 'sm' | 'md' | 'lg';
};

export default function Button({ variant = 'primary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 cursor-pointer',
        size === 'sm' && 'px-3 py-1.5 text-sm',
        size === 'md' && 'px-5 py-2.5 text-sm',
        size === 'lg' && 'px-7 py-3 text-base',
        variant === 'primary' && 'bg-orange-500 text-white hover:bg-orange-600 shadow-sm btn-glow',
        variant === 'secondary' && 'bg-white text-orange-600 hover:bg-orange-50 border border-orange-300',
        variant === 'ghost' && 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
        variant === 'outline' && 'border border-gray-300 text-gray-700 hover:border-orange-500 hover:text-orange-600',
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
