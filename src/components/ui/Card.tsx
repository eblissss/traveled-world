import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cardVariants } from '../../lib/animations';

interface CardProps {
  children: ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      className={`
        bg-bg-secondary rounded-xl p-4 shadow-lg
        border border-gray-200 dark:border-gray-700
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

