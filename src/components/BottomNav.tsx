import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ActiveTab, BranchId } from '../types';
import {
  LayoutDashboard,
  ReceiptText,
  BookOpen,
  CalendarClock,
  Boxes,
  Landmark,
  ArrowLeftRight,
  Wallet,
  MoreHorizontal,
  X,
  RotateCcw,
  Sparkles,
  Building2,
  Sun,
  Moon
} from 'lucide-react';

export const BottomNav: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    language,
    setLanguage,
    theme,
    setTheme,
    currentBranchId,
    setCurrentBranchId,
    branches,
    setIsDailyDrawerOpen,
    setIsTransferModalOpen,
    resetAllData,
    showToast
  } = useApp();

  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const mainTabs: { id: ActiveTab; label: string; sinhala: string; tamil: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Overview', sinhala: 'සාරාංශය', tamil: 'கண்ணோட்டம்', icon: LayoutDashboard },
    { id: 'pos', label: 'POS Billa', sinhala: 'බිල (POS)', tamil: 'பில் (POS)', icon: ReceiptText },
    { id: 'naya', label: 'Naya Potha', sinhala: 'ණය පොත', tamil: 'கடன் புத்தகம்', icon: BookOpen },
    { id: 'wara', label: 'Wara Potha', sinhala: 'වාරික පොත', tamil: 'தவணை முறை', icon: CalendarClock },
    { id: 'inventory', label: 'Stock', sinhala: 'තොග', tamil: 'இருப்பு', icon: Boxes }
  ];

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    setIsMoreMenuOpen(false);
  };

  return (
    <>
      {/* More Menu Bottom Sheet */}
      {isMoreMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end p-0 sm:p-4 animate-in fade-in duration-150"
          onClick={() => setIsMoreMenuOpen(false)}
        >
          <div
            className="bg-white dark:bg-slate-900 rounded-t-3xl sm:rounded-3xl border-t sm:border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md mx-auto w-full max-h-[84vh] sm:max-h-[80vh] flex flex-col animate-in slide-in-from-bottom duration-200 overflow-hidden"
            onClick={e => e.stopPropagation()}
          >
            {/* Sheet Header (Fixed) */}
            <div className="pt-2 px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800 shrink-0">
              <div
                className="w-10 h-1 bg-slate-300 dark:bg-slate-700 rounded-full mx-auto mb-2 cursor-pointer"
                onClick={() => setIsMoreMenuOpen(false)}
              />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                    {language === 'si' ? 'අමතර මෙහෙයුම්' : language === 'ta' ? 'கூடுதல் செயல்பாடுகள்' : 'More Operations'}
                  </h3>
                  <div className="text-[11px] text-slate-500">
                    {language === 'si' ? 'භාෂාව සහ මෙහෙයුම් මෙවලම්' : language === 'ta' ? 'மொழி மற்றும் வணிக கருவிகள்' : 'Language and operational tools'}
                  </div>
                </div>
                <button
                  onClick={() => setIsMoreMenuOpen(false)}
                  className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                  title="Close"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Scrollable Sheet Body */}
            <div className="p-3 overflow-y-auto overscroll-contain space-y-2.5">
              {/* Language Switcher Bar */}
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 px-1 flex items-center justify-between">
                  <span>Language (භාෂාව / மொழி):</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {language === 'en' ? 'English' : language === 'si' ? 'සිංහල' : 'தமிழ்'}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-1">
                  <button
                    onClick={() => {
                      setLanguage('en');
                      showToast('Language changed to English', 'info');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      language === 'en'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    English
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('si');
                      showToast('භාෂාව සිංහලට මාරු කරන ලදී', 'info');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      language === 'si'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    සිංහල
                  </button>
                  <button
                    onClick={() => {
                      setLanguage('ta');
                      showToast('மொழி தமிழுக்கு மாற்றப்பட்டது', 'info');
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                      language === 'ta'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600'
                    }`}
                  >
                    தமிழ்
                  </button>
                </div>
              </div>

              {/* Screen Background Theme Selector (Dark Mode / Light Mode) */}
              <div className="p-1.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 mb-1 px-1 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    {theme === 'dark' ? (
                      <Moon className="w-3 h-3 text-amber-500 shrink-0" />
                    ) : (
                      <Sun className="w-3 h-3 text-amber-500 shrink-0" />
                    )}
                    <span>
                      {language === 'si'
                        ? 'තිරයේ පසුබිම (Theme):'
                        : language === 'ta'
                        ? 'திரை பின்னணி (Theme):'
                        : 'Screen Background:'}
                    </span>
                  </span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">
                    {theme === 'dark'
                      ? language === 'si'
                        ? 'අඳුරු (Dark)'
                        : language === 'ta'
                        ? 'இருள் (Dark)'
                        : 'Dark Mode'
                      : language === 'si'
                      ? 'ආලෝක (Light)'
                      : language === 'ta'
                      ? 'வெளிச்சம் (Light)'
                      : 'Light Mode'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => {
                      setTheme('light');
                      showToast(
                        language === 'si'
                          ? 'ආලෝක පසුබිම (Light Mode) සක්‍රිය කරන ලදී'
                          : language === 'ta'
                          ? 'வெளிச்ச முறை (Light Mode) மாற்றப்பட்டது'
                          : 'Switched to Light Mode',
                        'info'
                      );
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      theme === 'light'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-650'
                    }`}
                  >
                    <Sun className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                    <span>{language === 'si' ? 'ආලෝක (Light)' : language === 'ta' ? 'வெளிச்சம்' : 'Light Mode'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setTheme('dark');
                      showToast(
                        language === 'si'
                          ? 'අඳුරු පසුබිම (Dark Mode) සක්‍රිය කරන ලදී'
                          : language === 'ta'
                          ? 'இருண்ட முறை (Dark Mode) மாற்றப்பட்டது'
                          : 'Switched to Dark Mode',
                        'info'
                      );
                    }}
                    className={`py-1.5 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-amber-500 text-slate-950 shadow-xs'
                        : 'bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-650'
                    }`}
                  >
                    <Moon className="w-3.5 h-3.5 text-indigo-500 dark:text-amber-300" />
                    <span>{language === 'si' ? 'අඳුරු (Dark)' : language === 'ta' ? 'இருள்' : 'Dark Mode'}</span>
                  </button>
                </div>
              </div>

              {/* Grid of Operations */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => handleSelectTab('suppliers')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'suppliers'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {language === 'si' ? 'සැපයුම්කරුවන් (POs)' : language === 'ta' ? 'சப்ளையர்கள் & PO' : 'Suppliers & POs'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {language === 'si' ? 'ඇණවුම් සහ ණය' : language === 'ta' ? 'கொள்முதல் & கடன்' : 'Orders & Deadlines'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectTab('advisor')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'advisor'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {language === 'si' ? 'විධායක උපදේශක' : language === 'ta' ? 'நிர்வாக ஆலோசகர்' : 'Executive Q&A'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {language === 'si' ? 'ප්‍රධාන ප්‍රශ්න 6' : language === 'ta' ? 'முக்கிய 6 கேள்விகள்' : '6 Mudalali Queries'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => handleSelectTab('cheques')}
                  className={`p-2.5 rounded-xl border text-left flex items-start gap-2.5 transition-colors cursor-pointer ${
                    activeTab === 'cheques'
                      ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30'
                      : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                  }`}
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Landmark className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {language === 'si' ? 'චෙක්පත් පොත (PDC)' : language === 'ta' ? 'காசோலைகள் (PDC)' : 'Cheque Register'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {language === 'si' ? 'කල්පිරෙන චෙක්පත්' : language === 'ta' ? 'முதிர்வு காசோலைகள்' : 'Bank PDC Maturities'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsTransferModalOpen(true);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-900/60 text-sky-700 dark:text-sky-300 flex items-center justify-center shrink-0 mt-0.5">
                    <ArrowLeftRight className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {language === 'si' ? 'ශාඛා හුවමාරු' : language === 'ta' ? 'கிளை மாற்றங்கள்' : 'Branch Transfers'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {language === 'si' ? 'ශාඛා අතර භාණ්ඩ' : language === 'ta' ? 'பொருட்கள் பரிமாற்றம்' : 'Stock Dispatch'}
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => {
                    setIsMoreMenuOpen(false);
                    setIsDailyDrawerOpen(true);
                  }}
                  className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 text-left flex items-start gap-2.5 transition-colors cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Wallet className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {language === 'si' ? 'පොඩි පොත (ලාච්චුව)' : language === 'ta' ? 'பணப்பெட்டி (டிராயர்)' : 'Podi Potha'}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {language === 'si' ? 'මුදල් හා දෛනික වියදම්' : language === 'ta' ? 'பணம் & செலவுகள்' : 'Daily Drawer Cash'}
                    </div>
                  </div>
                </button>

                {/* Mobile Branch Switcher Card */}
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-left flex items-start gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0 mt-0.5">
                    <Building2 className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-[10px] text-slate-500 uppercase tracking-wider mb-0.5 truncate">
                      {language === 'si' ? 'ශාඛාව තෝරන්න' : language === 'ta' ? 'கிளை' : 'Branch'}
                    </div>
                    <select
                      value={currentBranchId}
                      onChange={e => {
                        const newId = e.target.value as 'all' | BranchId;
                        setCurrentBranchId(newId);
                        showToast(
                          newId === 'all'
                            ? 'Consolidated view: All Sri Lanka Branches'
                            : `Switched to ${branches.find(b => b.id === newId)?.name}`,
                          'info'
                        );
                      }}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2 py-1 text-[11px] font-bold text-slate-900 dark:text-slate-100 outline-none cursor-pointer truncate"
                    >
                      <option value="all">🇱🇰 All Branches</option>
                      {branches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Reset Demo Data Button */}
              <button
                onClick={() => {
                  resetAllData();
                  setIsMoreMenuOpen(false);
                  showToast(
                    language === 'si'
                      ? 'දත්ත නැවත මුල් තත්වයට පත් කරන ලදී!'
                      : language === 'ta'
                      ? 'மாதிரி தரவு மீட்டமைக்கப்பட்டது!'
                      : 'Demo data reset to initial state!',
                    'info'
                  );
                }}
                className="w-full p-2 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/30 dark:bg-rose-950/20 text-left flex items-center gap-2.5 transition-colors cursor-pointer hover:bg-rose-50 dark:hover:bg-rose-950/40"
              >
                <div className="w-7 h-7 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-700 dark:text-rose-300 flex items-center justify-center shrink-0">
                  <RotateCcw className="w-3.5 h-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-bold text-xs text-rose-900 dark:text-rose-200">
                    {language === 'si' ? 'නැවත මුල් තත්වයට (Reset Demo Data)' : language === 'ta' ? 'தரவை மீட்டமை (Reset Demo)' : 'Reset Demo Data'}
                  </div>
                  <div className="text-[10px] text-rose-600 dark:text-rose-400 truncate">
                    {language === 'si' ? 'ප්‍රදර්ශන දත්ත නැවත පූරණය කරන්න' : language === 'ta' ? 'மாதிரி தரவை மீட்டமைக்க' : 'Reload clean factory sample data'}
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop / Tablet Sub-navigation Bar */}
      <div className="hidden lg:block bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <nav className="flex items-center gap-1 py-1.5 overflow-x-auto">
            {mainTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                    isActive
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200 dark:border-slate-700'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-amber-500' : 'text-slate-400'}`} />
                  <span>{language === 'si' ? tab.sinhala : language === 'ta' ? tab.tamil : tab.label}</span>
                </button>
              );
            })}

            {/* Extra tabs in desktop */}
            <div className="h-4 w-px bg-slate-300 dark:bg-slate-700 mx-2" />

            <button
              onClick={() => setActiveTab('suppliers')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'suppliers'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Building2 className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'si' ? 'සැපයුම්කරුවන්' : language === 'ta' ? 'சப்ளையர்கள்' : 'Suppliers & POs'}</span>
            </button>

            <button
              onClick={() => setActiveTab('advisor')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'advisor'
                  ? 'bg-amber-500 text-slate-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>{language === 'si' ? 'විධායක උපදේශක' : language === 'ta' ? 'நிர்வாக ஆலோசகர்' : 'Executive Q&A'}</span>
            </button>

            <button
              onClick={() => setActiveTab('cheques')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === 'cheques'
                  ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 shadow-xs border border-slate-200 dark:border-slate-700'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              <Landmark className="w-3.5 h-3.5 text-amber-600" />
              <span>{language === 'si' ? 'චෙක්පත් ලේඛනය' : language === 'ta' ? 'காசோலைகள்' : 'Cheque/PDC Register'}</span>
            </button>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 text-sky-600" />
              <span>{language === 'si' ? 'ශාඛා හුවමාරු' : language === 'ta' ? 'கிளை மாற்றம்' : 'Inter-Branch Transfer'}</span>
            </button>

            <button
              onClick={() => setIsDailyDrawerOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 whitespace-nowrap"
            >
              <Wallet className="w-3.5 h-3.5 text-emerald-600" />
              <span>{language === 'si' ? 'පොඩි පොත' : language === 'ta' ? 'பணப்பெட்டி' : 'Podi Potha (Drawer)'}</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Fixed Mobile Bottom Tab Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 pb-safe">
        <div className="grid grid-cols-6 items-center h-16 max-w-lg mx-auto px-1">
          {mainTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
                  isActive
                    ? 'text-amber-600 dark:text-amber-400'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.4]' : 'stroke-[1.8]'}`} />
                <span className={`text-[10px] mt-1 tracking-tight truncate max-w-[54px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                  {language === 'si' ? tab.sinhala : language === 'ta' ? tab.tamil : tab.label}
                </span>
              </button>
            );
          })}

          {/* More Actions tab */}
          <button
            onClick={() => setIsMoreMenuOpen(true)}
            className={`flex flex-col items-center justify-center h-full min-h-[44px] min-w-[44px] transition-colors ${
              activeTab === 'suppliers' || activeTab === 'cheques' || activeTab === 'advisor'
                ? 'text-amber-600 dark:text-amber-400 font-bold'
                : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-[1.8]" />
            <span className="text-[10px] mt-1 font-medium tracking-tight">
              {language === 'si' ? 'තවත්' : language === 'ta' ? 'மேலும்' : 'More'}
            </span>
          </button>
        </div>
      </div>
    </>
  );
};
