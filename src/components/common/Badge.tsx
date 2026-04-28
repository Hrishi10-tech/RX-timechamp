type BadgeVariant = 'critical' | 'warning' | 'info' | 'success' | 'neutral';

interface BadgeProps {
  variant: BadgeVariant;
  children: React.ReactNode;
  size?: 'sm' | 'md';
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  critical:
    'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  warning:
    'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  success:
    'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  neutral:
    'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300',
};

const dotColors: Record<BadgeVariant, string> = {
  critical: 'bg-red-500',
  warning: 'bg-yellow-500',
  info: 'bg-blue-500',
  success: 'bg-green-500',
  neutral: 'bg-gray-500',
};

export function Badge({ variant, children, size = 'sm', dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${variantClasses[variant]} ${
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
      }`}
    >
      {dot && (
        <span
          className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]}`}
          aria-hidden="true"
        />
      )}
      {children}
    </span>
  );
}
