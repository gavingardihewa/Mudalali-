import React from 'react';
import { useApp } from '../context/AppContext';
import { BranchId, Language } from '../types';
import { Building2, Wallet, Sparkles, RefreshCw, Sun, Moon } from 'lucide-react';
import { formatLKR } from '../utils/formatters';
import { MudalaliLogo } from './MudalaliLogo';

export const Header: React.FC = () => {
  const {
    currentBranchId,
    setCurrentBranchId,
    branches,
    language,
    setLanguage,
    theme,
    toggleTheme,
    dailyDrawer,
    setIsDailyDrawerOpen,
    setIsAssistantModalOpen,
    activeTab,
    setActiveTab
  } = useApp();

  const currentBranch = branches.find(b => b.id === currentBranchId);

  return (
    <header className="sticky top-0 z-30 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800">
      <div className="w-full max-w-7xl mx-auto px-2.5 sm:px-4 py-1.5 sm:py-3 flex items-center justify-between gap-1.5 sm:gap-4">
        {/* Zone 1: Mudalali OS Logo */}
        <MudalaliLogo
          size="sm"
          language={language}
          subtitleClassName="hidden md:block"
          onClick={() => setActiveTab('dashboard')}
          className="shrink-0 cursor-pointer"
        />

        {/* Zone 2: Branch selector & Language Switcher (tablet/desktop) & Quick Theme Toggle */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Branch Switcher (hidden on mobile phones, available in home dashboard and More menu) */}
          <div className="hidden sm:flex items-center gap-1 sm:gap-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg px-2 py-1 sm:px-2.5 sm:py-1.5 border border-slate-200 dark:border-slate-700">
            <Building2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-500 shrink-0" />
            <select
              value={currentBranchId}
              onChange={e => setCurrentBranchId(e.target.value as 'all' | BranchId)}
              className="bg-transparent text-[11px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer truncate max-w-[90px] sm:max-w-[150px] md:max-w-[180px]"
            >
              <option value="all" className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                🇱🇰 All Branches
              </option>
              {branches.map(b => (
                <option key={b.id} value={b.id} className="dark:bg-slate-900 text-slate-900 dark:text-slate-100">
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Language Switcher (hidden on small phone view to prevent header overflow; available in 'More' tab) */}
          <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 shrink-0">
            {(['en', 'si', 'ta'] as Language[]).map(l => (
              <button
                key={l}
                onClick={() => setLanguage(l)}
                className={`px-1.5 py-0.5 sm:px-2 sm:py-0.5 text-[10px] sm:text-xs font-semibold rounded transition-colors cursor-pointer ${
                  language === l
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title={l === 'en' ? 'English' : l === 'si' ? 'සිංහල (Sinhala)' : 'தமிழ் (Tamil)'}
              >
                {l === 'en' ? 'EN' : l === 'si' ? 'සිං' : 'தமிழ்'}
              </button>
            ))}
          </div>

          {/* Quick Theme Toggle Button (Sleek and compact across all screens) */}
          <button
            onClick={toggleTheme}
            className="p-1 sm:p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-amber-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer shrink-0"
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle dark/light mode"
          >
            {theme === 'dark' ? (
              <Sun className="w-3.5 h-3.5 text-amber-400" />
            ) : (
              <Moon className="w-3.5 h-3.5 text-slate-700" />
            )}
          </button>
        </div>

        {/* Zone 3: Primary Actions (Cash Drawer on TOP, Advisor on BOTTOM on Mobile & Tablet, Row on Desktop) */}
        <div className="flex flex-col items-end justify-center gap-1 lg:flex-row lg:items-center lg:gap-2 shrink-0">
          {/* Top on Mobile & Tablet: Cash in Drawer */}
          <button
            onClick={() => setIsDailyDrawerOpen(true)}
            className="flex items-center justify-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 lg:py-1.5 rounded-md sm:rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200/90 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[10px] sm:text-xs font-semibold hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors shadow-2xs cursor-pointer whitespace-nowrap w-full lg:w-auto"
            title="Daily Cash Drawer / Podi Potha"
          >
            <Wallet className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
            <span className="hidden sm:inline text-[10px] sm:text-[11px] font-normal text-emerald-700 dark:text-emerald-400">
              {language === 'si' ? 'මුදල්:' : language === 'ta' ? 'பணம்:' : 'Cash:'}
            </span>
            <span className="tabular-nums font-bold tracking-tight">{formatLKR(dailyDrawer.expectedClosingCash)}</span>
          </button>

          {/* Bottom on Mobile & Tablet: Senior Mudalali Executive Advisor */}
          <button
            onClick={() => setActiveTab('advisor')}
            className={`flex items-center justify-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 lg:py-1.5 text-[10px] sm:text-xs font-bold rounded-md sm:rounded-lg transition-all whitespace-nowrap shadow-2xs cursor-pointer w-full lg:w-auto ${
              activeTab === 'advisor'
                ? 'bg-amber-500 text-slate-950 font-bold ring-2 ring-amber-400'
                : 'text-white bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500'
            }`}
            title="Senior Mudalali Executive Advisor"
          >
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-amber-400 dark:text-white shrink-0" />
            <span className="hidden sm:inline">
              {language === 'si'
                ? 'මුදලාලි උපදේශක (Q&A)'
                : language === 'ta'
                ? 'முதலாளி ஆலோசகர் (Q&A)'
                : 'Mudalali Advisor (Q&A)'}
            </span>
            <span className="sm:hidden inline">
              {language === 'si' ? 'උපදේශක' : language === 'ta' ? 'ஆலோசகர்' : 'Advisor'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
