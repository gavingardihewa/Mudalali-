import React, { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserProfile, UserRole } from '../types';
import { MudalaliLogo } from './MudalaliLogo';
import {
  Calculator,
  Crown,
  KeyRound,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  X,
  Lock
} from 'lucide-react';

interface RemoteProfileEntry {
  profile: UserProfile;
  defaultPinHint: string;
}

export const ProfileLoginScreen: React.FC = () => {
  const {
    language,
    setLanguage,
    showBootScreen,
    isLoginScreenOpen,
    setIsLoginScreenOpen,
    currentUser,
    loginWithProfile
  } = useApp();

  const [profiles, setProfiles] = useState<RemoteProfileEntry[]>([]);
  const [selectedRole, setSelectedRole] = useState<UserRole>('accountant');
  const [pinInput, setPinInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetch('/api/auth/profiles')
      .then(res => (res.ok ? res.json() : null))
      .then(data => {
        if (data?.profiles && Array.isArray(data.profiles)) {
          setProfiles(data.profiles);
        }
      })
      .catch(() => {
        // Fallback profile definitions matching backend order: Accountant, Mudalali
        setProfiles([
          {
            defaultPinHint: '1234',
            profile: {
              id: 'profile-accountant',
              role: 'accountant',
              displayName: 'Accountant',
              sinhalaTitle: 'ගණකාධිකාරී',
              tamilTitle: 'கணக்காளர்',
              subtitle: 'Ledger Audit, Tax / VAT, PDC Reconciliation & Payables',
              sinhalaSubtitle: 'ගිණුම් පරීක්ෂාව, බදු, චෙක්පත් සහ සැපයුම්කරු ගෙවීම්',
              tamilSubtitle: 'கணக்கு தணிக்கை, வரி, காசோலை & சப்ளையர் கொடுப்பனவு',
              accessScope: [
                'Trial Balance & Working Capital Audit',
                'Cheque / PDC Clearing & Dishonor Tracking',
                'Supplier Invoices, Deadlines & Settlements'
              ],
              permissions: {
                canViewExecutiveAnalytics: true,
                canApproveCreditOverrides: false,
                canEditAccountingAudits: true,
                canCloseDrawer: true,
                canResetSystemData: false,
                canManageSuppliers: true
              }
            }
          },
          {
            defaultPinHint: '8888',
            profile: {
              id: 'profile-mudalali',
              role: 'mudalali',
              displayName: 'Mudalali',
              sinhalaTitle: 'මුදලාලි (හිමිකරු)',
              tamilTitle: 'முதலாளி (உரிமையாளர்)',
              subtitle: 'Executive Proprietor, Multi-Branch Command & Strategic AI',
              sinhalaSubtitle: 'ව්‍යාපාර හිමිකරු, ශාඛා පාලනය සහ විධායක තීරණ',
              tamilSubtitle: 'வணிக உரிமையாளர், கிளை நிர்வாகம் & மூலோபாய ஆலோசனை',
              accessScope: [
                'Full Multi-Branch Command Center',
                'Purchase Affordability & Cash Stress Testing',
                'Executive AI Advisor & Margin Strategy'
              ],
              permissions: {
                canViewExecutiveAnalytics: true,
                canApproveCreditOverrides: true,
                canEditAccountingAudits: true,
                canCloseDrawer: true,
                canResetSystemData: true,
                canManageSuppliers: true
              }
            }
          }
        ]);
      });
  }, []);

  if (showBootScreen || !isLoginScreenOpen) return null;

  const activeEntry = profiles.find(p => p.profile.role === selectedRole) || profiles[0];

  const handlePinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await loginWithProfile(selectedRole, { pin: pinInput });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Invalid PIN');
    } else {
      setPinInput('');
    }
  };

  const handleQuickLogin = async (role: UserRole) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    const res = await loginWithProfile(role, { quickDemoLogin: true });
    setIsSubmitting(false);
    if (!res.success) {
      setErrorMsg(res.error || 'Sign-in failed');
    } else {
      setPinInput('');
    }
  };

  return (
    <div className="fixed inset-0 z-40 bg-slate-100/95 dark:bg-slate-950/95 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="w-full max-w-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto">
        {/* Top Bar */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-900">
          <MudalaliLogo size="sm" language={language} />

          <div className="flex items-center gap-2">
            {/* Compact Language Switcher */}
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700">
              {(['en', 'si', 'ta'] as const).map(l => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLanguage(l)}
                  className={`px-2 py-0.5 text-[11px] font-bold rounded transition-colors cursor-pointer ${
                    language === l
                      ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-2xs'
                      : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'si' ? 'සිං' : 'தமிழ்'}
                </button>
              ))}
            </div>

            {currentUser && (
              <button
                type="button"
                onClick={() => setIsLoginScreenOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer"
                title="Cancel profile switch"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-5 sm:p-6 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Lock className="w-3.5 h-3.5" />
                <span>
                  {language === 'si'
                    ? 'ප්‍රවේශ පැතිකඩ තෝරන්න'
                    : language === 'ta'
                    ? 'உள்நுழைவு சுயவிவரத்தைத் தேர்ந்தெடுக்கவும்'
                    : 'Select Operator Profile'}
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white mt-0.5">
                {language === 'si'
                  ? 'ගණකාධිකාරී (Accountant) හෝ මුදලාලි (Mudalali) ලෙස පිවිසෙන්න'
                  : language === 'ta'
                  ? 'கணக்காளர் (Accountant) அல்லது முதலாளி (Mudalali) ஆக உள்நுழையவும்'
                  : 'Sign in as Accountant or Mudalali'}
              </h2>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <span>Role-based session</span>
              <span className="mx-1.5" aria-hidden="true">·</span>
              <span>Backend Engine v2.4</span>
            </div>
          </div>

          {/* Two Profile Cards: Accountant (1st) and Mudalali (2nd) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {profiles.map(({ profile, defaultPinHint }) => {
              const isSelected = selectedRole === profile.role;
              const isAccountant = profile.role === 'accountant';
              const isCurrent = currentUser?.role === profile.role;

              const title =
                language === 'si'
                  ? profile.sinhalaTitle
                  : language === 'ta'
                  ? profile.tamilTitle
                  : profile.displayName;
              const subtitle =
                language === 'si'
                  ? profile.sinhalaSubtitle
                  : language === 'ta'
                  ? profile.tamilSubtitle
                  : profile.subtitle;

              return (
                <div
                  key={profile.id}
                  onClick={() => {
                    setSelectedRole(profile.role);
                    setErrorMsg(null);
                  }}
                  className={`rounded-2xl p-4 border-2 transition-all cursor-pointer flex flex-col justify-between gap-3 ${
                    isSelected
                      ? isAccountant
                        ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/25 shadow-sm'
                        : 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/25 shadow-sm'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${
                            isAccountant
                              ? 'bg-sky-600 text-white'
                              : 'bg-amber-500 text-slate-950'
                          }`}
                        >
                          {isAccountant ? (
                            <Calculator className="w-5 h-5" />
                          ) : (
                            <Crown className="w-5 h-5" />
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-black text-slate-900 dark:text-white">
                              {profile.displayName}
                            </h3>
                            {isCurrent && (
                              <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                                · Active
                              </span>
                            )}
                          </div>
                          {language !== 'en' && (
                            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
                              {title}
                            </div>
                          )}
                          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            PIN: <span className="font-mono font-bold text-slate-700 dark:text-slate-200">{defaultPinHint}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 leading-relaxed">
                      {subtitle}
                    </p>

                    <ul className="mt-3 space-y-1.5 border-t border-slate-200/80 dark:border-slate-700/60 pt-2.5">
                      {profile.accessScope.slice(0, 3).map((item, i) => (
                        <li
                          key={i}
                          className="text-[11px] text-slate-600 dark:text-slate-400 flex items-center gap-1.5"
                        >
                          <CheckCircle2
                            className={`w-3.5 h-3.5 shrink-0 ${
                              isAccountant ? 'text-sky-600 dark:text-sky-400' : 'text-amber-600 dark:text-amber-400'
                            }`}
                          />
                          <span className="truncate">{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={e => {
                      e.stopPropagation();
                      handleQuickLogin(profile.role);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-black flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                      isAccountant
                        ? 'bg-sky-600 hover:bg-sky-500 text-white'
                        : 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                    }`}
                  >
                    <span>
                      {language === 'si'
                        ? `${profile.displayName} ලෙස පිවිසෙන්න`
                        : language === 'ta'
                        ? `${profile.displayName} ஆக உள்நுழைக`
                        : `Sign In as ${profile.displayName}`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Server-Verified PIN Entry Form for Selected Profile */}
          <form
            onSubmit={handlePinSubmit}
            className="p-3.5 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-200 shrink-0">
                <KeyRound className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-white">
                  {activeEntry
                    ? `Verify ${activeEntry.profile.displayName} Passcode`
                    : 'Verify Profile PIN'}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  Demo PIN — Accountant: <span className="font-mono font-bold">1234</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  Mudalali: <span className="font-mono font-bold">8888</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="password"
                inputMode="numeric"
                maxLength={8}
                placeholder="Enter PIN"
                value={pinInput}
                onChange={e => setPinInput(e.target.value)}
                className="w-28 sm:w-32 px-3 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-600 text-sm font-mono font-bold text-center tracking-widest text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="submit"
                disabled={isSubmitting || !pinInput.trim()}
                className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 disabled:opacity-40 text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Unlock
              </button>
            </div>
          </form>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
