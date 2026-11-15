import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatLKR, cleanPhoneForWhatsApp, getSinhalaReminderText, getSinglishReminderText, getTamilReminderText, getCustomerReminderText } from '../utils/formatters';
import {
  TrendingUp,
  Wallet,
  BookOpen,
  CalendarClock,
  Landmark,
  AlertTriangle,
  ArrowRight,
  ReceiptText,
  Boxes,
  Building2,
  CheckCircle2,
  MessageCircle,
  ExternalLink,
  Plus,
  Sparkles,
  Calculator,
  Crown,
  Scale,
  FileSpreadsheet
} from 'lucide-react';
import { BranchId } from '../types';
import { MudalaliLogo } from './MudalaliLogo';

export const DashboardView: React.FC = () => {
  const {
    currentBranchId,
    setCurrentBranchId,
    branches,
    products,
    creditCustomers,
    instalmentPlans,
    cheques,
    dailyDrawer,
    setActiveTab,
    setIsDailyDrawerOpen,
    setIsTransferModalOpen,
    language,
    showToast,
    currentUser,
    setIsLoginScreenOpen,
    backendAnalytics
  } = useApp();

  // WhatsApp reminder modal state
  const [activeReminderCustomer, setActiveReminderCustomer] = useState<{
    name: string;
    phone: string;
    amount: number;
    dueDate: string;
    type: 'credit' | 'instalment';
  } | null>(null);
  const [reminderLang, setReminderLang] = useState<'si' | 'ta' | 'en' | 'singlish'>(language === 'ta' ? 'ta' : 'si');

  // Filter calculations based on currentBranchId
  const branchFilter = (itemBranchId: BranchId) => {
    return currentBranchId === 'all' || itemBranchId === currentBranchId;
  };

  const filteredCredit = creditCustomers.filter(c => branchFilter(c.branchId));
  const filteredInstalments = instalmentPlans.filter(p => branchFilter(p.branchId));
  const filteredCheques = cheques.filter(chq => branchFilter(chq.branchId));

  const totalOutstandingCredit = filteredCredit.reduce((sum, c) => sum + c.totalOutstanding, 0);

  // Overdue instalments count & total
  const overdueInstalments = filteredInstalments.flatMap(plan =>
    plan.schedules
      .filter(s => s.status === 'overdue')
      .map(s => ({ plan, schedule: s }))
  );
  const totalOverdueInstalments = overdueInstalments.reduce((sum, item) => sum + item.schedule.amount, 0);

  // Cheques maturing within 3 days or returned
  const pendingCheques = filteredCheques.filter(chq => chq.status === 'pending');
  const returnedCheques = filteredCheques.filter(chq => chq.status === 'returned');
  const maturingChequesAmount = pendingCheques.reduce((sum, chq) => sum + chq.amount, 0);

  // Low stock products in current scope
  const lowStockProducts = products.filter(p => {
    if (currentBranchId === 'all') {
      const totalStock = Object.values(p.stocks).reduce((a, b) => a + b, 0);
      return totalStock <= p.minStockLevel * 2;
    } else {
      const bStock = p.stocks[currentBranchId] || 0;
      return bStock <= p.minStockLevel;
    }
  });

  const activeBranchName =
    currentBranchId === 'all'
      ? 'All Sri Lanka Branches'
      : branches.find(b => b.id === currentBranchId)?.name;

  return (
    <div className="space-y-5 pb-10">
      {/* Mudalali OS Master Home Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-amber-950/90 text-white rounded-3xl p-4 sm:p-6 shadow-md border border-slate-800/80 relative overflow-hidden">
        {/* Subtle background ambient glow */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          {/* Logo & Platform Identity */}
          <div className="flex items-start sm:items-center gap-3.5">
            <MudalaliLogo
              size="lg"
              showText={false}
              language={language}
            />

            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-1.5 leading-none">
                  <span>MUDALALI</span>
                  <span className="bg-gradient-to-r from-amber-400 via-amber-300 to-amber-500 bg-clip-text text-transparent">
                    OS
                  </span>
                </span>
                <span className="text-[11px] font-bold text-amber-400">
                  · {activeBranchName}
                </span>
                <button
                  onClick={() => setIsLoginScreenOpen(true)}
                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                    currentUser?.role === 'accountant'
                      ? 'bg-sky-500/20 border-sky-400/40 text-sky-300 hover:bg-sky-500/30'
                      : 'bg-amber-500/20 border-amber-400/40 text-amber-300 hover:bg-amber-500/30'
                  }`}
                  title="Switch between Accountant & Mudalali profiles"
                >
                  {currentUser?.role === 'accountant' ? (
                    <Calculator className="w-3 h-3" />
                  ) : (
                    <Crown className="w-3 h-3" />
                  )}
                  <span>{currentUser?.displayName || 'Mudalali'}</span>
                </button>
              </div>

              <h1 className="text-sm sm:text-base font-bold text-slate-200 mt-1.5 flex items-center gap-2">
                <span>
                  {currentUser?.role === 'accountant'
                    ? language === 'si'
                      ? 'ගණකාධිකාරී ගිණුම් හා විගණන පුවරුව'
                      : language === 'ta'
                      ? 'கணக்காளர் தணிக்கை & கணக்கு மையம்'
                      : 'Accountant Ledger & Audit Desk'
                    : language === 'si'
                    ? 'මුදලාලි ව්‍යාපාර මෙහෙයුම් පුවරුව'
                    : language === 'ta'
                    ? 'முதலாளி வணிக கட்டுப்பாட்டு மையம்'
                    : "Mudalali's Command Center"}
                </span>
              </h1>

              <p className="text-xs text-slate-400 mt-0.5 max-w-xl">
                {currentUser?.role === 'accountant'
                  ? 'Working capital balance, VAT liability estimates, 7-day PDC clearing schedule & drawer variance audit.'
                  : language === 'si'
                  ? 'දෛනික මුදල්, ණය පොත, වාරික එකතු කිරීම් සහ ශාඛා තොග තත්‍ය කාලීනව කළමනාකරණය'
                  : language === 'ta'
                  ? 'பணப்புழக்கம், கடன் வாடிக்கையாளர் புத்தகம், தவணை வசூல் மற்றும் பல கிளை இருப்பு'
                  : 'Live cash drawer, credit debtor book, instalment recovery & multi-branch stock.'}
              </p>
            </div>
          </div>

          {/* Quick Actions: Branch Selection & Open POS */}
          <div className="flex items-center gap-2 self-start lg:self-auto flex-wrap">
            {/* Branch Selection Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-700/80 rounded-xl px-3 py-2 text-xs font-semibold text-white shadow-xs transition-colors cursor-pointer group">
              <Building2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
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
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-1"
                title="Select Active Branch"
              >
                <option value="all" className="bg-slate-900 text-white">
                  🇱🇰 All Branches
                </option>
                {branches.map(b => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-white">
                    {b.name}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setActiveTab('pos')}
              className="flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 hover:from-amber-400 hover:to-amber-300 text-slate-950 font-black text-xs rounded-xl shadow-md transition-transform active:scale-[0.98] whitespace-nowrap cursor-pointer"
            >
              <ReceiptText className="w-4 h-4 stroke-[2.5]" />
              <span>{language === 'si' ? 'නව බිලක් (POS)' : language === 'ta' ? 'புதிய பில் (POS)' : 'Open Counter POS'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Role-Specific Backend Analytics Engine Card (Accountant vs Mudalali) */}
      {backendAnalytics && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                  currentUser?.role === 'accountant'
                    ? 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
                    : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                }`}
              >
                {currentUser?.role === 'accountant' ? (
                  <FileSpreadsheet className="w-4 h-4" />
                ) : (
                  <Scale className="w-4 h-4" />
                )}
              </div>
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
                  {currentUser?.role === 'accountant'
                    ? 'Accountant Trial Balance & Liquidity Audit (Backend Engine)'
                    : 'Mudalali Executive Solvency & Margin Snapshot (Backend Engine)'}
                </h2>
                <div className="text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{backendAnalytics.engineVersion}</span>
                  <span className="mx-1.5" aria-hidden="true">·</span>
                  <span>Audit: {backendAnalytics.accountingLedgerSummary.auditStatus}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveTab('advisor')}
              className="text-xs font-bold text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 self-start sm:self-auto cursor-pointer"
            >
              <span>Full Algorithm Report</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                {currentUser?.role === 'accountant' ? 'Net Working Capital' : 'Safe Liquidity Buffer'}
              </div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                {formatLKR(
                  currentUser?.role === 'accountant'
                    ? backendAnalytics.accountingLedgerSummary.netWorkingCapital
                    : backendAnalytics.liquidityAndAffordability.netSafeCapitalAvailable
                )}
              </div>
              <div className="text-[11px] text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">
                {currentUser?.role === 'accountant'
                  ? `Assets ${formatLKR(backendAnalytics.accountingLedgerSummary.totalCurrentAssets)}`
                  : `Cash Conversion ${backendAnalytics.cashFlow.cashConversionRatePct}%`}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                {currentUser?.role === 'accountant' ? 'Total Liabilities (AP + PDC)' : 'Stock Valuation (Cost)'}
              </div>
              <div className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-0.5">
                {formatLKR(
                  currentUser?.role === 'accountant'
                    ? backendAnalytics.accountingLedgerSummary.totalCurrentLiabilities
                    : backendAnalytics.marginsAndInventory.totalInventoryCostValue
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.role === 'accountant'
                  ? `Debt-to-Asset: ${backendAnalytics.accountingLedgerSummary.debtToAssetRatioPct}%`
                  : `Avg Gross Margin: ${backendAnalytics.marginsAndInventory.averageGrossMarginPct}%`}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                {currentUser?.role === 'accountant' ? 'Est. 18% VAT Provision' : '7-Day Net PDC Flow'}
              </div>
              <div
                className={`text-base sm:text-lg font-extrabold tabular-nums mt-0.5 ${
                  currentUser?.role !== 'accountant' && backendAnalytics.chequeProjection.net7DayChequeFlow < 0
                    ? 'text-rose-600 dark:text-rose-400'
                    : 'text-slate-900 dark:text-slate-100'
                }`}
              >
                {formatLKR(
                  currentUser?.role === 'accountant'
                    ? backendAnalytics.accountingLedgerSummary.estimatedVatLiability
                    : backendAnalytics.chequeProjection.net7DayChequeFlow
                )}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {currentUser?.role === 'accountant'
                  ? `Drawer Variance: ${formatLKR(backendAnalytics.accountingLedgerSummary.drawerVariance)}`
                  : `In ${formatLKR(backendAnalytics.chequeProjection.maturing7DaysInflow)} · Out ${formatLKR(backendAnalytics.chequeProjection.maturing7DaysOutflow)}`}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <div className="text-slate-500 dark:text-slate-400 font-medium">
                {currentUser?.role === 'accountant' ? 'Reorder Budget Needed' : 'Flagged Branch Risk'}
              </div>
              <div className="text-base sm:text-lg font-extrabold text-amber-600 dark:text-amber-400 tabular-nums mt-0.5 truncate">
                {currentUser?.role === 'accountant'
                  ? formatLKR(backendAnalytics.marginsAndInventory.totalSuggestedReorderCost)
                  : backendAnalytics.branches.underperformingBranch?.branchName.split(' ')[0] || 'Healthy'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                {currentUser?.role === 'accountant'
                  ? `${backendAnalytics.marginsAndInventory.lowStockSkuCount} SKUs below safety stock`
                  : `Health Score: ${backendAnalytics.branches.underperformingBranch?.healthScore ?? 100}/100`}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6 Core Executive Questions Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              Ask Senior Mudalali (Executive Financial Intelligence)
            </h2>
          </div>
          <button
            onClick={() => setActiveTab('advisor')}
            className="text-xs text-amber-600 dark:text-amber-400 font-bold hover:underline flex items-center gap-1"
          >
            <span>Open All Answers</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {[
            { q: 'How much did I actually collect this month?', si: 'මේ මාසයේ ඇත්තටම ලැබුණු මුදල් එකතුව කීයද?' },
            { q: 'Which customers have not paid?', si: 'මුදල් නොගෙවූ ගනුදෙනුකරුවන් කවුද?' },
            { q: 'Which products generate the highest margins?', si: 'වැඩිම ලාභ ප්‍රතිශතයක් දෙන භාණ්ඩ මොනවාද?' },
            { q: 'Which branch is underperforming?', si: 'ගැටලු ඇති හෝ පාඩු ලබන ශාඛාව කුමක්ද?' },
            { q: 'How much do I owe suppliers?', si: 'තොග සැපයුම්කරුවන්ට ගෙවිය යුතු මුදල කීයද?' },
            { q: 'Can I afford to purchase another Rs. 2 million worth of stock?', si: 'රු. ලක්ෂ 20ක අලුත් තොගයක් මිලදී ගත හැකිද?' }
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab('advisor')}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 bg-slate-50/60 dark:bg-slate-800/40 text-left transition-all group flex items-start justify-between gap-2"
            >
              <div>
                <div className="font-bold text-xs text-slate-800 dark:text-slate-200 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors">
                  {item.q}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {item.si}
                </div>
              </div>
              <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-500 shrink-0 mt-0.5 transition-transform group-hover:translate-x-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Primary KPI Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Metric 1: Cash in Drawer */}
        <div
          onClick={() => setIsDailyDrawerOpen(true)}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-emerald-300 dark:hover:border-emerald-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Cash in Drawer</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatLKR(dailyDrawer.expectedClosingCash)}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 mt-1.5 font-medium">
            <span>Podi Potha Active</span>
            <span className="text-slate-400">·</span>
            <span className="underline">Count & Close</span>
          </div>
        </div>

        {/* Metric 2: Naya Potha / Outstanding Credit */}
        <div
          onClick={() => setActiveTab('naya')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-amber-300 dark:hover:border-amber-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Outstanding Credit (ණය)</span>
            <div className="w-7 h-7 rounded-lg bg-amber-50 dark:bg-amber-950/60 text-amber-600 flex items-center justify-center">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatLKR(totalOutstandingCredit)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            <span>{filteredCredit.length} registered debtors</span>
          </div>
        </div>

        {/* Metric 3: Wara Potha / Instalments */}
        <div
          onClick={() => setActiveTab('wara')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-indigo-300 dark:hover:border-indigo-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Overdue Instalments (වාරික)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-600 flex items-center justify-center">
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-rose-600 dark:text-rose-400 tabular-nums">
            {formatLKR(totalOverdueInstalments)}
          </div>
          <div className="text-[11px] text-rose-500 mt-1.5 font-medium">
            <span>{overdueInstalments.length} contracts pending collection</span>
          </div>
        </div>

        {/* Metric 4: Cheques & PDCs */}
        <div
          onClick={() => setActiveTab('cheques')}
          className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:border-sky-300 dark:hover:border-sky-700 cursor-pointer transition-colors"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">PDCs in Hand (චෙක්පත්)</span>
            <div className="w-7 h-7 rounded-lg bg-sky-50 dark:bg-sky-950/60 text-sky-600 flex items-center justify-center">
              <Landmark className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
            {formatLKR(maturingChequesAmount)}
          </div>
          <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-1.5">
            <span>{pendingCheques.length} maturing</span>
            {returnedCheques.length > 0 && (
              <span className="text-rose-600 font-semibold ml-1">· {returnedCheques.length} Returned!</span>
            )}
          </div>
        </div>
      </div>

      {/* Critical Owner Action Alerts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Urgent Collection Box: Overdue Instalments & Naya debtors */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Action Required: Overdue Recoveries
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('wara')}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View Wara Potha</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          {overdueInstalments.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
              All active instalment accounts are up to date!
            </div>
          ) : (
            <div className="space-y-2.5">
              {overdueInstalments.slice(0, 3).map(({ plan, schedule }, idx) => (
                <div
                  key={`${plan.id}-${idx}`}
                  className="p-3 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-200/60 dark:border-rose-900/40 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {plan.customerName}
                    </div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-2">
                      <span className="truncate">{plan.itemDescription}</span>
                      <span>·</span>
                      <span className="text-rose-600 font-medium">Due: {schedule.dueDate}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <span className="font-bold text-xs text-rose-700 dark:text-rose-400 tabular-nums">
                      {formatLKR(schedule.amount)}
                    </span>
                    <button
                      onClick={() =>
                        setActiveReminderCustomer({
                          name: plan.customerName,
                          phone: plan.customerPhone,
                          amount: schedule.amount,
                          dueDate: schedule.dueDate,
                          type: 'instalment'
                        })
                      }
                      className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs flex items-center gap-1"
                      title="Send WhatsApp Reminder"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span className="text-[10px] hidden sm:inline">Remind</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Cheques Maturing & Low Stock Alerts */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                PDCs Maturing & Low Stock Warning
              </h2>
            </div>
            <button
              onClick={() => setActiveTab('inventory')}
              className="text-xs font-medium text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1"
            >
              <span>View Stock</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {/* Cheque row */}
            {pendingCheques.slice(0, 1).map(chq => (
              <div
                key={chq.id}
                className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200/60 dark:border-amber-900/40 flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                    {chq.bank} - Chq #{chq.chequeNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400">
                    From: {chq.partyName} · <span className="text-amber-700 dark:text-amber-400 font-medium">Matures: {chq.maturityDate}</span>
                  </div>
                </div>
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 tabular-nums shrink-0">
                  {formatLKR(chq.amount)}
                </div>
              </div>
            ))}

            {/* Low Stock alert row */}
            {lowStockProducts.slice(0, 2).map(prod => {
              const currentStock =
                currentBranchId === 'all'
                  ? Object.values(prod.stocks).reduce((a, b) => a + b, 0)
                  : prod.stocks[currentBranchId] || 0;

              return (
                <div
                  key={prod.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                      {prod.name}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-2">
                      <span>Code: {prod.code}</span>
                      <span>·</span>
                      <span className="text-rose-600 font-semibold">Only {currentStock} {prod.unit} left</span>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsTransferModalOpen(true)}
                    className="px-2.5 py-1 text-[11px] font-semibold bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 rounded-lg hover:bg-sky-100 transition-colors shrink-0"
                  >
                    Transfer
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Multi-Branch Snapshot */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              Sri Lankan Branch Network
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Physical branch managers, live contact numbers, and fast switching
            </p>
          </div>
          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 rounded-lg text-xs font-semibold"
          >
            <span>Inter-Branch Stock Movement</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {branches.map(b => {
            const isSelected = currentBranchId === b.id;
            // Branch credit total
            const branchCredit = creditCustomers
              .filter(c => c.branchId === b.id)
              .reduce((s, c) => s + c.totalOutstanding, 0);

            return (
              <div
                key={b.id}
                onClick={() => setCurrentBranchId(b.id)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${
                  isSelected
                    ? 'border-amber-500 bg-amber-50/30 dark:bg-amber-950/20 ring-2 ring-amber-500/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-xs text-slate-900 dark:text-slate-100">
                    {b.name.split(' ')[0]} {b.name.split(' ')[1] || ''}
                  </span>
                  {isSelected && (
                    <span className="text-[10px] bg-amber-500 text-slate-950 px-1.5 py-0.5 rounded font-bold">
                      ACTIVE
                    </span>
                  )}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {b.address}
                </div>
                <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 font-medium">
                  Mgr: {b.manager.split(' ')[0]}
                </div>
                <div className="mt-2.5 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px]">
                  <span className="text-slate-500">Credit Book:</span>
                  <span className="font-semibold tabular-nums text-slate-800 dark:text-slate-200">
                    {formatLKR(branchCredit)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* WhatsApp Reminder Modal */}
      {activeReminderCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                    Send WhatsApp Reminder
                  </h3>
                  <div className="text-xs text-slate-500">
                    To: {activeReminderCustomer.name} ({activeReminderCustomer.phone})
                  </div>
                </div>
              </div>
              <button
                onClick={() => setActiveReminderCustomer(null)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Language toggle for reminder */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold my-3">
              <button
                type="button"
                onClick={() => setReminderLang('si')}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  reminderLang === 'si' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                සිංහල
              </button>
              <button
                type="button"
                onClick={() => setReminderLang('ta')}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  reminderLang === 'ta' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setReminderLang('en')}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  reminderLang === 'en' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setReminderLang('singlish')}
                className={`flex-1 py-1 rounded-lg transition-colors ${
                  reminderLang === 'singlish' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                Singlish
              </button>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl mb-4 text-xs">
              <div className="font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span>
                  {reminderLang === 'si' ? 'Sinhala Notice (සිංහල පණිවිඩය)' : reminderLang === 'ta' ? 'Tamil Notice (தமிழ் அறிவிப்பு)' : reminderLang === 'en' ? 'English Notice' : 'Singlish Notice'}:
                </span>
                <span className="text-[10px] text-emerald-600 font-semibold">Ready to Send</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line text-[11px] leading-relaxed">
                {getCustomerReminderText(
                  reminderLang,
                  activeReminderCustomer.name,
                  activeReminderCustomer.amount,
                  activeReminderCustomer.dueDate,
                  'Mudalali Stores'
                )}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(activeReminderCustomer.phone)}?text=${encodeURIComponent(
                  getCustomerReminderText(
                    reminderLang,
                    activeReminderCustomer.name,
                    activeReminderCustomer.amount,
                    activeReminderCustomer.dueDate,
                    'Mudalali Stores'
                  )
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {reminderLang === 'ta' ? 'வாட்ஸ்அப் அனுப்பு' : reminderLang === 'si' ? 'වට්ස්ඇප් යවන්න' : 'Open in WhatsApp'}
                </span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    getCustomerReminderText(
                      reminderLang,
                      activeReminderCustomer.name,
                      activeReminderCustomer.amount,
                      activeReminderCustomer.dueDate,
                      'Mudalali Stores'
                    )
                  );
                  showToast('Reminder copied to clipboard!', 'success');
                }}
                className="py-2.5 px-3 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-xl text-xs font-semibold hover:bg-slate-200"
              >
                Copy Text
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
