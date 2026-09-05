import { motion } from 'framer-motion';

interface BadgeProps {
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info';
  children: React.ReactNode;
  className?: string;
}

const badgeVariants = {
  default: 'bg-bg-elevated text-text-secondary border-border-subtle',
  success: 'bg-success/10 text-success border-success/20',
  warning: 'bg-warning/10 text-warning border-warning/20',
  error: 'bg-error/10 text-error border-error/20',
  info: 'bg-accent-primary/10 text-accent-primary border-accent-primary/20',
};

export default function Badge({ variant = 'default', children, className = '' }: BadgeProps) {
  return (
    <motion.span
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
        border transition-colors duration-200
        ${badgeVariants[variant]} ${className}
      `}
    >
      {children}
    </motion.span>
  );
}
