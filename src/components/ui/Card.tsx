import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({ children, className = '', hover = false }) => {
  return (
    <div className={`bg-[#1E1E1E] border border-gray-800 rounded-xl p-6 ${hover ? 'hover:border-[#00E5FF]/50 transition-all' : ''} ${className}`}>
      {children}
    </div>
  );
};
