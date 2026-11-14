import React, { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { Language } from '../types';
import {
  ShieldCheck,
  Check,
  Sparkles,
  Building2,
  Receipt,
  Zap,
  ArrowRight
} from 'lucide-react';

interface BootScreenProps {
  onDismiss?: () => void;
}

export const BootScreen: React.FC<BootScreenProps> = ({ onDismiss }) => {
  const { language, setLanguage, completeBoot, showBootScreen } = useApp();
  const [selectedLang, setSelectedLang] = useState<Language>(language || 'si');
  const [bootProgress, setBootProgress] = useState(0);
  const [bootStage, setBootStage] = useState(0);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const timersRef = useRef<NodeJS.Timeout[]>([]);

  const bootStages = [
    {
      pct: 12,
      logEn: 'Initializing Ceylon Commercial Kernel v2.4...',
      logSi: 'ලංකා වාණිජ මෙහෙයුම් කර්නලය (v2.4) ආරම්භ කෙරේ...',
      logTa: 'இலங்கை வணிக கர்னல் v2.4 துவக்கப்படுகிறது...',
      badge: 'KERNEL'
    },
    {
      pct: 38,
      logEn: 'Mounting Pettah Central Hub & Multi-Branch Databases...',
      logSi: 'පිටකොටුව මධ්‍යස්ථානය සහ මහනුවර, මීගමුව, ගාල්ල ශාඛා සම්බන්ධ කෙරේ...',
      logTa: 'புறக்கோட்டை மையம் & பல கிளை தரவுத்தளங்கள் இணைக்கப்படுகின்றன...',
      badge: 'BRANCHES'
    },
    {
      pct: 68,
      logEn: 'Verifying Naya Potha & Wara Potha Offline Ledgers...',
      logSi: 'ණය පොත සහ වාරික පොත දේශීය දත්ත පරීක්ෂාව [තහවුරුයි]...',
      logTa: 'கடன் புத்தகம் & தவணை முறை பதிவேடுகள் சரிபார்க்கப்பட்டன [சரி]...',
      badge: 'POTHA'
    },
    {
      pct: 90,
      logEn: 'Connecting Ceylon Banking PDC Register & LankaPay CEFT...',
      logSi: 'චෙක්පත් ලේඛනය සහ LankaPay CEFT ගෙවීම් පද්ධතිය සක්‍රියයි...',
      logTa: 'காசோலைகள் & LankaPay CEFT பணம் செலுத்தும் தொகுதி தயார்...',
      badge: 'BANKING'
    },
    {
      pct: 100,
      logEn: 'Mudalali OS Loaded • Ready to Trade • Welcome!',
      logSi: 'මුදලාලි OS සාර්ථකව පූරණය විය • ව්‍යාපාරයට සූදානම් • ආයුබෝවන්!',
      logTa: 'முதலாளி OS ஏற்றப்பட்டது • கணினி தயார் • வணக்கம்!',
      badge: 'READY'
    }
  ];

  // Keep local selection synced with context
  useEffect(() => {
    setSelectedLang(language);
  }, [language]);

  // Self-running boot sequence when showBootScreen is active
  useEffect(() => {
    if (!showBootScreen) {
      setBootProgress(0);
      setBootStage(0);
      setIsFadingOut(false);
      return;
    }

    // Clear previous timers
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];

    // Stage 1 (0 -> 12%)
    const t1 = setTimeout(() => {
      setBootProgress(15);
      setBootStage(0);
    }, 100);

    // Stage 2 (15 -> 38%)
    const t2 = setTimeout(() => {
      setBootProgress(42);
      setBootStage(1);
    }, 450);

    // Stage 3 (42 -> 68%)
    const t3 = setTimeout(() => {
      setBootProgress(72);
      setBootStage(2);
    }, 900);

    // Stage 4 (72 -> 92%)
    const t4 = setTimeout(() => {
      setBootProgress(94);
      setBootStage(3);
    }, 1350);

    // Stage 5 (100%)
    const t5 = setTimeout(() => {
      setBootProgress(100);
      setBootStage(4);
    }, 1750);

    // Stage 6 (Trigger smooth fade out and dismiss)
    const t6 = setTimeout(() => {
      setIsFadingOut(true);
      const tEnd = setTimeout(() => {
        completeBoot(selectedLang);
        if (onDismiss) onDismiss();
      }, 500);
      timersRef.current.push(tEnd);
    }, 2200);

    timersRef.current = [t1, t2, t3, t4, t5, t6];

    return () => {
      timersRef.current.forEach(clearTimeout);
    };
  }, [showBootScreen]);

  if (!showBootScreen) return null;

  const handleLanguageSelect = (lang: Language) => {
    setSelectedLang(lang);
    setLanguage(lang);
  };

  const handleSkipOrFastLaunch = () => {
    timersRef.current.forEach(clearTimeout);
    setIsFadingOut(true);
    setTimeout(() => {
      completeBoot(selectedLang);
      if (onDismiss) onDismiss();
    }, 200);
  };

  const currentLog =
    selectedLang === 'si'
      ? bootStages[bootStage]?.logSi
      : selectedLang === 'ta'
      ? bootStages[bootStage]?.logTa
      : bootStages[bootStage]?.logEn;

  return (
    <div
      className={`fixed inset-0 z-50 bg-slate-950 text-slate-100 flex flex-col justify-between overflow-hidden selection:bg-amber-500 selection:text-slate-950 font-sans transition-opacity duration-500 ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient background glows */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Golden Central Aura */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] bg-amber-500/15 rounded-full blur-[140px] animate-pulse duration-1000" />
        {/* Subtle top edge glow */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-amber-600/10 rounded-full blur-[120px]" />
        {/* Fine grid texture */}
        <div className="absolute inset-0 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:32px_32px] opacity-15" />
      </div>

      {/* Top Header Strip: Quick Skip & Status */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 pt-4 sm:pt-6 flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
          <span className="text-amber-400 font-bold">MUDALALI_BOOT_v2.4</span>
          <span className="hidden sm:inline text-slate-600">|</span>
          <span className="hidden sm:inline text-slate-400">SRI LANKA SME OS</span>
        </div>

        <button
          onClick={handleSkipOrFastLaunch}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-xs text-slate-300 hover:text-white transition-colors cursor-pointer group"
          title="Skip boot animation"
        >
          <span>{selectedLang === 'si' ? 'මඟහරින්න' : selectedLang === 'ta' ? 'தவிர்க்க' : 'Fast Launch'}</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
      </div>

      {/* Center: Main Logo & Boot Animation */}
      <div className="relative z-10 max-w-2xl mx-auto w-full px-4 my-auto flex flex-col items-center text-center">
        {/* Logo Emblem with Ambient Pulsing Glow */}
        <div className="relative mb-6 group">
          {/* Outer glowing ring */}
          <div className="absolute -inset-2 rounded-[32px] bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 opacity-70 blur-lg animate-pulse" />

          {/* Golden Crest Frame */}
          <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-amber-300 via-amber-500 to-amber-600 p-1 shadow-2xl shadow-amber-500/30 flex items-center justify-center transform transition-all duration-700 scale-100 hover:scale-105">
            <div className="w-full h-full rounded-[22px] bg-slate-950 flex flex-col items-center justify-center relative overflow-hidden border border-amber-400/50">
              {/* Inner ambient shine */}
              <div className="absolute inset-0 bg-gradient-to-b from-amber-500/25 via-transparent to-amber-500/10 pointer-events-none" />

              {/* Sri Lankan Scales of Trade & Rupee Symbol */}
              <svg
                className="w-12 h-12 sm:w-14 sm:h-14 text-amber-400 drop-shadow-md"
                viewBox="0 0 48 48"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {/* Center Balance Shaft */}
                <path d="M24 6v36" stroke="url(#bootGoldGrad)" strokeWidth="3" />
                <path d="M12 14h24" stroke="url(#bootGoldGrad)" strokeWidth="3" />
                <path d="M14 6h20" stroke="url(#bootGoldGrad)" strokeWidth="2.5" />
                {/* Left Pan (Credit / Rupee) */}
                <path d="M12 14l-6 10h12L12 14z" fill="rgba(245, 158, 11, 0.3)" stroke="url(#bootGoldGrad)" />
                {/* Right Pan (Instalments / Stock) */}
                <path d="M36 14l-6 10h12L36 14z" fill="rgba(245, 158, 11, 0.3)" stroke="url(#bootGoldGrad)" />
                {/* Firm Base */}
                <path d="M16 42h16" stroke="url(#bootGoldGrad)" strokeWidth="3.5" />
                <defs>
                  <linearGradient id="bootGoldGrad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
                    <stop stopColor="#FDE68A" />
                    <stop offset="0.5" stopColor="#F59E0B" />
                    <stop offset="1" stopColor="#D97706" />
                  </linearGradient>
                </defs>
              </svg>

              <span className="text-[10px] font-black tracking-widest text-amber-400 mt-1 uppercase">
                MUDALALI
              </span>
            </div>
          </div>

          {/* Pulsing Status Dot */}
          <div className="absolute -bottom-1 -right-1 px-2 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[9px] font-black tracking-wider flex items-center gap-1 border border-emerald-300 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-950 animate-ping" />
            BOOTING
          </div>
        </div>

        {/* Brand Typography */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white flex items-center justify-center gap-2.5">
          <span>MUDALALI</span>
          <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
            OS
          </span>
        </h1>

        <div className="text-xs sm:text-sm font-semibold text-amber-400/90 mt-1.5 flex items-center gap-2">
          <span>මුදලාලි OS</span>
          <span>•</span>
          <span>முதலாளி OS</span>
          <span>•</span>
          <span className="text-slate-400 font-normal">Sri Lankan SME Business OS</span>
        </div>

        {/* Progress Bar & Real-time Boot Logs */}
        <div className="w-full max-w-md mt-7 bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-2xl backdrop-blur-md">
          {/* Top Status & Percentage */}
          <div className="flex items-center justify-between text-xs mb-2.5 font-mono">
            <div className="flex items-center gap-2 text-slate-300">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
              <span className="text-amber-400 font-bold uppercase tracking-wider text-[11px]">
                {bootStages[bootStage]?.badge || 'SYSTEM'}
              </span>
            </div>
            <div className="text-amber-400 font-black tracking-wider text-sm">
              {bootProgress}%
            </div>
          </div>

          {/* Animated Progress Bar */}
          <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden relative p-0.5 border border-slate-700/60">
            <div
              className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-emerald-400 rounded-full transition-all duration-300 ease-out shadow-lg shadow-amber-500/50 relative"
              style={{ width: `${bootProgress}%` }}
            >
              {/* Glowing leading edge */}
              <div className="absolute right-0 top-0 bottom-0 w-2 bg-white rounded-full opacity-75 shadow-sm" />
            </div>
          </div>

          {/* Dynamic Console / Boot Log Line */}
          <div className="mt-3.5 pt-2.5 border-t border-slate-800/80 flex items-center gap-2 text-left">
            <div className="text-slate-500 font-mono text-[11px] shrink-0">{'>'}</div>
            <div className="text-xs sm:text-sm text-slate-300 font-mono truncate animate-in fade-in duration-150">
              {currentLog}
            </div>
          </div>
        </div>

        {/* Active Hub Tags */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-5 text-[11px] text-slate-400">
          <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-1.5 text-slate-300">
            <Building2 className="w-3.5 h-3.5 text-amber-400" />
            Pettah Central Hub Connected
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-1.5 text-slate-300">
            <Receipt className="w-3.5 h-3.5 text-emerald-400" />
            Naya & Wara Potha Ready
          </span>
          <span className="px-2.5 py-1 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-1.5 text-slate-300">
            <ShieldCheck className="w-3.5 h-3.5 text-sky-400" />
            LankaPay CEFT Synced
          </span>
        </div>
      </div>

      {/* Bottom Language Selector Strip */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 pb-4 sm:pb-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 border-t border-slate-900 pt-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span>Default Language (පෙරනිමි භාෂාව / மொழி):</span>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            type="button"
            onClick={() => handleLanguageSelect('si')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
              selectedLang === 'si'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>සිංහල</span>
            {selectedLang === 'si' && <Check className="w-3 h-3 stroke-[3]" />}
          </button>

          <button
            type="button"
            onClick={() => handleLanguageSelect('ta')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
              selectedLang === 'ta'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>தமிழ்</span>
            {selectedLang === 'ta' && <Check className="w-3 h-3 stroke-[3]" />}
          </button>

          <button
            type="button"
            onClick={() => handleLanguageSelect('en')}
            className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-colors flex items-center gap-1.5 ${
              selectedLang === 'en'
                ? 'bg-amber-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>English</span>
            {selectedLang === 'en' && <Check className="w-3 h-3 stroke-[3]" />}
          </button>
        </div>
      </div>
    </div>
  );
};
