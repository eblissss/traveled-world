import { ReactNode } from 'react';

interface TooltipProps {
  children: ReactNode;
  content: string;
  className?: string;
}

export function Tooltip({ children, content, className = '' }: TooltipProps) {
  return (
    <div className={`relative group ${className}`}>
      {children}
      <div className="
        absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2
        px-3 py-1.5 bg-gray-900 text-white text-sm rounded-lg
        opacity-0 group-hover:opacity-100 transition-opacity duration-150
        pointer-events-none whitespace-nowrap z-50
      ">
        {content}
        <div className="absolute top-full left-1/2 transform -translate-x-1/2 -mt-1">
          <div className="border-4 border-transparent border-t-gray-900"></div>
        </div>
      </div>
    </div>
  );
}

