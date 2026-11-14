import React from 'react';
import { Language } from '../types';

interface MudalaliLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  showSubtitle?: boolean;
  subtitleClassName?: string;
  language?: Language;
  className?: string;
  onClick?: () => void;
}

export const MudalaliLogo: React.FC<MudalaliLogoProps> = ({
  size = 'md',
  showText = true,
  showSubtitle = true,
  subtitleClassName = '',
  language = 'en',
  className = '',
  onClick
}) => {
  const iconSizes = {
    xs: 'w-6.5 h-6.5 rounded-lg p-0.5',
    sm: 'w-7.5 h-7.5 sm:w-8.5 sm:h-8.5 rounded-lg sm:rounded-xl p-0.5',
    md: 'w-12 h-12 rounded-2xl p-1',
    lg: 'w-16 h-16 rounded-2xl p-1',
    xl: 'w-20 h-20 rounded-3xl p-1.5'
  };

  const svgSizes = {
    xs: 'w-3.5 h-3.5',
    sm: 'w-4 h-4 sm:w-4.5 sm:h-4.5',
    md: 'w-7 h-7',
    lg: 'w-9 h-9',
    xl: 'w-12 h-12'
  };

  const textSizes = {
    xs: 'text-xs font-black',
    sm: 'text-xs sm:text-base font-black',
    md: 'text-lg sm:text-xl font-black',
    lg: 'text-xl sm:text-2xl font-black',
    xl: 'text-2xl sm:text-3xl font-black'
  };

  const gapSizes = {
    xs: 'gap-1.5',
    sm: 'gap-1.5 sm:gap-2.5',
    md: 'gap-2.5 sm:gap-3',
    lg: 'gap-3 sm:gap-4',
    xl: 'gap-4 sm:gap-5'
  };

  const subtitleSizes = {
    xs: 'text-[9px]',
    sm: 'text-[9px] sm:text-[10px]',
    md: 'text-xs',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm'
  };

  return (
    <div
      onClick={onClick}
      className={`inline-flex items-center ${gapSizes[size]} ${onClick ? 'cursor-pointer group' : ''} ${className}`}
    >
      {/* Golden Crest Emblem */}
      <div
        className={`${iconSizes[size]} bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 shadow-md shadow-amber-500/20 shrink-0 flex items-center justify-center transform transition-transform group-hover:scale-105 duration-200`}
      >
        <div className="w-full h-full rounded-[inherit] bg-slate-950 flex items-center justify-center relative overflow-hidden border border-amber-400/40">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/20 via-transparent to-amber-500/10 pointer-events-none" />
          
          <svg
            className={`${svgSizes[size]} text-amber-400`}
            viewBox="0 0 48 48"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {/* Center Pillar */}
            <path d="M24 6v36" stroke="url(#mudalaliGoldGrad)" strokeWidth="3" />
            <path d="M12 14h24" stroke="url(#mudalaliGoldGrad)" strokeWidth="3" />
            <path d="M14 6h20" stroke="url(#mudalaliGoldGrad)" strokeWidth="2.5" />
            {/* Left Pan (Credit Balance / Rupee) */}
            <path d="M12 14l-6 10h12L12 14z" fill="rgba(245, 158, 11, 0.25)" stroke="url(#mudalaliGoldGrad)" />
            {/* Right Pan (Instalments / Stock) */}
            <path d="M36 14l-6 10h12L36 14z" fill="rgba(245, 158, 11, 0.25)" stroke="url(#mudalaliGoldGrad)" />
            {/* Heavy Base */}
            <path d="M16 42h16" stroke="url(#mudalaliGoldGrad)" strokeWidth="3.5" />
            <defs>
              <linearGradient id="mudalaliGoldGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                <stop stopColor="#FDE68A" />
                <stop offset="0.5" stopColor="#F59E0B" />
                <stop offset="1" stopColor="#D97706" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>

      {/* Typography */}
      {showText && (
        <div className="text-left">
          <div className={`${textSizes[size]} tracking-tight text-slate-900 dark:text-white flex items-center gap-1.5 leading-none`}>
            <span>MUDALALI</span>
            <span className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 bg-clip-text text-transparent font-black">
              OS
            </span>
          </div>

          {showSubtitle && (
            <div className={`${subtitleSizes[size]} text-slate-500 dark:text-slate-400 mt-0.5 sm:mt-1 leading-tight ${subtitleClassName}`}>
              {language === 'si'
                ? 'ශ්‍රී ලංකා ව්‍යාපාර මෙහෙයුම් පද්ධතිය'
                : language === 'ta'
                ? 'இலங்கை வணிக இயக்க முறைமை'
                : 'Sri Lankan SME Business OS'}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
