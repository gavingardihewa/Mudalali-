import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatLKR, cleanPhoneForWhatsApp } from '../utils/formatters';
import {
  Sparkles,
  AlertTriangle,
  TrendingUp,
  ShieldCheck,
  MessageCircle,
  X,
  Building2,
  CheckCircle2,
  BookOpen,
  ArrowRight
} from 'lucide-react';

export const SmartAssistantModal: React.FC = () => {
  const {
    isAssistantModalOpen,
    setIsAssistantModalOpen,
    creditCustomers,
    instalmentPlans,
    cheques,
    products,
    dailyDrawer,
    branches,
    setActiveTab,
    setIsTransferModalOpen,
    language,
    showToast
  } = useApp();

  const [activeTab, setActiveTabState] = useState<'insights' | 'sms_composer' | 'tax_sme'>('insights');
  const [customMsgCustomer, setCustomMsgCustomer] = useState(creditCustomers[0]?.id || '');
  const [customMsgType, setCustomMsgType] = useState<'payment_due' | 'special_offer' | 'cheque_bounced'>('payment_due');
  const [customMsgLanguage, setCustomMsgLanguage] = useState<'sinhala' | 'singlish' | 'tamil' | 'english'>(
    language === 'ta' ? 'tamil' : language === 'si' ? 'sinhala' : 'english'
  );

  if (!isAssistantModalOpen) return null;

  // Analysis calculations
  const totalOutstandingCredit = creditCustomers.reduce((s, c) => s + c.totalOutstanding, 0);
  const overdueInstalments = instalmentPlans.flatMap(p =>
    p.schedules.filter(s => s.status === 'overdue').map(s => ({ plan: p, schedule: s }))
  );
  const overdueInstalmentsAmount = overdueInstalments.reduce((s, i) => s + i.schedule.amount, 0);
  const maturingChequesThisWeek = cheques.filter(c => c.status === 'pending');
  const maturingChequesAmount = maturingChequesThisWeek.reduce((s, c) => s + c.amount, 0);

  // Selected customer for SMS generator
  const selectedCust = creditCustomers.find(c => c.id === customMsgCustomer) || creditCustomers[0];

  const generateDynamicSms = () => {
    if (!selectedCust) return '';

    if (customMsgType === 'payment_due') {
      if (customMsgLanguage === 'sinhala') {
        return `ගෞරවනීය ${selectedCust.name} මහතාණනි / මියනි,\n\nඔබගේ මුදලාලි ස්ටෝර්ස් ගිණුමේ හිඟ මුදල වන රු. ${selectedCust.totalOutstanding.toLocaleString()} ගෙවීම සඳහා අද දින පහසු වේලාවක පැමිණෙන ලෙස හෝ බැංකු ගිණුමට තැන්පත් කරන මෙන් කාරුණිකව මතක් කරමු.\n\nස්තූතියි,\nමුදලාලි කළමනාකාරිත්වය`;
      } else if (customMsgLanguage === 'singlish') {
        return `Gaurawanwitha ${selectedCust.name},\nObage Mudalali Stores ginume higa mudala wana Rs. ${selectedCust.totalOutstanding.toLocaleString()} gewima sandaha lagama shaakawa wetha paminila ho bank a/c wetha thampath karanna.\n\nSthuthi,\nMudalali Management`;
      } else if (customMsgLanguage === 'tamil') {
        return `அன்பார்ந்த ${selectedCust.name} அவர்களுக்கு,\n\nஉங்கள் முதலாளி ஸ்டோர்ஸ் நிறுவன கணக்கின் நிலுவைத் தொகையான ரூ. ${selectedCust.totalOutstanding.toLocaleString()} செலுத்துமாறு அன்புடன் நினைவூட்டுகிறோம். உங்கள் வசதிக்கேற்ப பணத்தைச் செலுத்துமாறு கேட்டுக்கொள்கிறோம்.\n\nநன்றி,\nமுதலாளி நிர்வாகம்`;
      } else {
        return `Dear ${selectedCust.name},\nThis is a friendly reminder that your outstanding credit balance of Rs. ${selectedCust.totalOutstanding.toLocaleString()} with Mudalali Stores is due for settlement. Kindly arrange payment today.\n\nThank you,\nMudalali Stores`;
      }
    } else if (customMsgType === 'cheque_bounced') {
      if (customMsgLanguage === 'sinhala') {
        return `හදිසි දැනුම්දීමයි: ${selectedCust.name},\n\nඔබ විසින් අප ආයතනය වෙත ලබාදුන් චෙක්පත බැංකුව මඟින් නිෂ්කාශනය නොවී (Return) ආපසු ලැබී ඇත. කරුණාකර අද දිනම අදාළ මුදල මුදලින් හෝ ඔන්ලයින් ගෙවීමට කටයුතු කරන්න.\n\nමුදලාලි ස්ටෝර්ස්`;
      } else if (customMsgLanguage === 'tamil') {
        return `அவசர அறிவித்தல்: அன்பார்ந்த ${selectedCust.name} அவர்களுக்கு,\n\nநீங்கள் வழங்கிய காசோலை வங்கியினால் திருப்பி அனுப்பப்பட்டுள்ளது (Cheque Returned). தயவுசெய்து உடனடியாக இந்நிலுவைத் தொகையை பணமாகவோ அல்லது வங்கி மூலமாகவோ செலுத்துமாறு கேட்டுக்கொள்கிறோம்.\n\nமுதலாளி ஸ்டோர்ஸ்`;
      } else {
        return `Urgent Notice: Dear ${selectedCust.name},\nThe cheque submitted to Mudalali Stores has been returned by the bank. Kindly settle this amount in cash or CEFT immediately.\n\nMudalali Stores`;
      }
    } else {
      if (customMsgLanguage === 'sinhala') {
        return `විශේෂ වට්ටම් දැනුම්දීමයි: ${selectedCust.name},\n\nඅපගේ සියලුම ශාඛාවන්හි ගෘහ විදුලි උපකරණ සහ තොග මිලදී ගැනීම් සඳහා සුවිශේෂී වට්ටම් හිමිවේ. අදම පැමිණෙන්න!\n\nමුදලාලි ස්ටෝර්ස්`;
      } else if (customMsgLanguage === 'tamil') {
        return `சிறப்பு தள்ளுபடி அறிவிப்பு: அன்பார்ந்த ${selectedCust.name} அவர்களுக்கு,\n\nஎங்களின் அனைத்து கிளைகளிலும் மின்னணு உபகரணங்கள் மற்றும் மொத்த கொள்முதல்களுக்கு விசேட தள்ளுபடிகள் வழங்கப்படுகின்றன. இன்றே வருகை தாருங்கள்!\n\nமுதலாளி ஸ்டோர்ஸ்`;
      } else {
        return `Exclusive SME Offer: Dear ${selectedCust.name},\nSpecial wholesale and hire-purchase terms available this week across all Mudalali branches. Visit your nearest outlet today!\n\nMudalali Stores`;
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-amber-500" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                {language === 'si'
                  ? 'මුදලාලි ස්මාර්ට් උපදේශක (Executive Advisor)'
                  : language === 'ta'
                  ? 'முதலாளி நிர்வாக ஆலோசகர் (Executive Advisor)'
                  : 'Mudalali Business Advisor'}
              </h3>
              <div className="text-xs text-slate-500">
                {language === 'si'
                  ? 'මුදල් ප්‍රවාහ සෞඛ්‍යය, ණය අවදානම් ඇඟවීම් සහ සිංහල/දෙමළ පණිවිඩ සකසනය'
                  : language === 'ta'
                  ? 'பணப்புழக்க நிலவரம், கடன் இடர் எச்சரிக்கைகள் & தமிழ்/சிங்கள செய்தி அமைப்பான்'
                  : 'Lankan cash flow health, credit risk alerts & multilingual notice composer'}
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsAssistantModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* 6 Executive Questions Shortcut */}
        <div className="mt-3 p-3 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-transparent rounded-2xl border border-amber-300 dark:border-amber-700/60 flex items-center justify-between gap-2">
          <div>
            <div className="font-bold text-xs text-amber-950 dark:text-amber-200">
              6 Core Mudalali Executive Queries
            </div>
            <div className="text-[11px] text-slate-500">
              Realized collections, unpaid debtors, margins, branch diagnostics & Rs. 2M stock simulator
            </div>
          </div>
          <button
            onClick={() => {
              setIsAssistantModalOpen(false);
              setActiveTab('advisor');
            }}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs whitespace-nowrap shadow-xs"
          >
            Open Q&A →
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold my-4">
          <button
            onClick={() => setActiveTabState('insights')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'insights'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Health & Alerts
          </button>
          <button
            onClick={() => setActiveTabState('sms_composer')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'sms_composer'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Sinhala SMS Composer
          </button>
          <button
            onClick={() => setActiveTabState('tax_sme')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'tax_sme'
                ? 'bg-slate-900 text-white dark:bg-slate-100 dark:text-slate-900 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Lankan SME Guide
          </button>
        </div>

        {activeTab === 'insights' && (
          <div className="space-y-3">
            {/* Cash Flow Forecast Alert */}
            <div className="p-3.5 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-900 dark:text-amber-200 font-bold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Cash Flow Warning: Upcoming Cheques vs Cash</span>
              </div>
              <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                You have <strong>{formatLKR(maturingChequesAmount)}</strong> in pending cheques this week. Drawer cash in hand is <strong>{formatLKR(dailyDrawer.expectedClosingCash)}</strong>. Prioritize recovering from high-balance credit debtors today to cover bank clearing balances.
              </p>
            </div>

            {/* Debtor Risk Radar */}
            <div className="p-3.5 rounded-2xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-rose-900 dark:text-rose-200 font-bold text-xs">
                <ShieldCheck className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Watchlist Debtor Alert: Bandara & Sons</span>
              </div>
              <p className="text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                Bandara & Sons has <strong>Rs. 142,500</strong> outstanding with last payment recorded on 12th Oct (25+ days ago). Recommend withholding new wholesale goods on credit until at least Rs. 50,000 is settled.
              </p>
              <button
                onClick={() => {
                  setIsAssistantModalOpen(false);
                  setActiveTab('naya');
                }}
                className="text-xs font-bold text-rose-700 underline"
              >
                Inspect in Credit Book →
              </button>
            </div>

            {/* Inter-Branch Transfer Opportunity */}
            <div className="p-3.5 rounded-2xl bg-sky-50/50 dark:bg-sky-950/20 border border-sky-200/60 dark:border-sky-900/40 space-y-1.5">
              <div className="flex items-center gap-2 text-sky-900 dark:text-sky-200 font-bold text-xs">
                <TrendingUp className="w-4 h-4 text-sky-600 shrink-0" />
                <span>Stock Balancing Opportunity</span>
              </div>
              <p className="text-xs text-sky-800 dark:text-sky-300 leading-relaxed">
                Negombo branch has only 1 washing machine and 2 Smart TVs in physical stock. Pettah Main Hub has 6 washing machines and 14 TVs. Recommend dispatching 3 units to Negombo via Fort cargo.
              </p>
              <button
                onClick={() => {
                  setIsAssistantModalOpen(false);
                  setIsTransferModalOpen(true);
                }}
                className="text-xs font-bold text-sky-700 underline"
              >
                Open Transfer Dispatcher →
              </button>
            </div>
          </div>
        )}

        {activeTab === 'sms_composer' && (
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Recipient Debtor
                </label>
                <select
                  value={customMsgCustomer}
                  onChange={e => setCustomMsgCustomer(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {creditCustomers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({formatLKR(c.totalOutstanding)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Message Type
                </label>
                <select
                  value={customMsgType}
                  onChange={e => setCustomMsgType(e.target.value as any)}
                  className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="payment_due">Friendly Payment Reminder</option>
                  <option value="cheque_bounced">Bounced Cheque Urgent Notice</option>
                  <option value="special_offer">Promotion / Wholesale Deal</option>
                </select>
              </div>
            </div>

            {/* Language toggle */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setCustomMsgLanguage('sinhala')}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  customMsgLanguage === 'sinhala' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                සිංහල
              </button>
              <button
                type="button"
                onClick={() => setCustomMsgLanguage('tamil')}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  customMsgLanguage === 'tamil' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setCustomMsgLanguage('singlish')}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  customMsgLanguage === 'singlish' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                Singlish
              </button>
              <button
                type="button"
                onClick={() => setCustomMsgLanguage('english')}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  customMsgLanguage === 'english' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                English
              </button>
            </div>

            {/* Message Preview */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[11px] font-bold text-slate-500 block mb-1">
                Generated Message Preview:
              </span>
              <p className="whitespace-pre-line text-slate-800 dark:text-slate-200 text-xs leading-relaxed">
                {generateDynamicSms()}
              </p>
            </div>

            <div className="flex gap-2">
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(selectedCust?.phone || '0770000000')}?text=${encodeURIComponent(
                  generateDynamicSms()
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Send via WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generateDynamicSms());
                  showToast('Copied message to clipboard!', 'success');
                }}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Copy Text
              </button>
            </div>
          </div>
        )}

        {activeTab === 'tax_sme' && (
          <div className="space-y-3 text-xs leading-relaxed text-slate-700 dark:text-slate-300">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                1. Sri Lankan Tax (RAMIS / IRD) Guidelines for SMEs
              </div>
              <p className="text-[11px]">
                Businesses with quarterly taxable turnover exceeding Rs. 15 Million (or Rs. 60 Million per annum) are required to register for Value Added Tax (VAT 18%). Maintain separate invoice registers for VAT invoices.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                2. Hire Purchase Act & NIC Verification
              </div>
              <p className="text-[11px]">
                Always record the physical photocopy of both Buyer NIC and Guarantor NIC (ඇපකරු) before handing over high-value hire purchase appliances. Ensure down payment receipt is given in print or via WhatsApp.
              </p>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
              <div className="font-bold text-slate-900 dark:text-slate-100">
                3. LankaPay National QR (LankaQR)
              </div>
              <p className="text-[11px]">
                LankaQR enables instant merchant settlement at 0.5%–1% transaction fees, significantly lower than standard credit card interchange fees (2.5%–3.5%).
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
