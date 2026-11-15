import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatLKR, cleanPhoneForWhatsApp, getSinhalaReminderText } from '../utils/formatters';
import {
  Sparkles,
  HelpCircle,
  TrendingUp,
  TrendingDown,
  DollarSign,
  AlertTriangle,
  Building2,
  Users,
  Percent,
  Landmark,
  Scale,
  ArrowRight,
  MessageCircle,
  Phone,
  CheckCircle2,
  Sliders,
  Send,
  Loader2,
  RefreshCw,
  Clock,
  ShieldAlert,
  Boxes
} from 'lucide-react';
import { BranchId } from '../types';

export type ExecutiveQueryId =
  | 'collected_this_month'
  | 'unpaid_customers'
  | 'highest_margins'
  | 'underperforming_branch'
  | 'supplier_debt'
  | 'afford_stock_2m';

export const ExecutiveAdvisorView: React.FC = () => {
  const {
    dailyDrawer,
    creditCustomers,
    instalmentPlans,
    cheques,
    products,
    branches,
    sales,
    suppliers,
    setActiveTab,
    setIsTransferModalOpen,
    backendAnalytics,
    isAnalyticsSyncing,
    simulatedPurchaseAmount,
    setSimulatedPurchaseAmount,
    refreshBackendAnalytics,
    currentUser
  } = useApp();

  const [selectedQuery, setSelectedQuery] = useState<ExecutiveQueryId>('collected_this_month');
  const [customPrompt, setCustomPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiAnswer, setAiAnswer] = useState<string | null>(null);

  // 1. Server-Computed Cash Flow & Realized Collections (with immediate safe fallback)
  const cashFlow = backendAnalytics?.cashFlow;
  const posCashCollected = cashFlow?.posCashCollected ?? dailyDrawer.totalCashSales;
  const creditCashCollected = cashFlow?.creditCashCollected ?? dailyDrawer.totalCreditCollections;
  const instalmentCashCollected = cashFlow?.instalmentCashCollected ?? dailyDrawer.totalInstalmentCollections;
  const clearedCustomerCheques =
    cashFlow?.clearedCustomerCheques ??
    cheques
      .filter(c => c.type === 'received' && c.status === 'cleared')
      .reduce((s, c) => s + c.amount, 0);
  const totalActuallyCollected =
    cashFlow?.totalActuallyCollected ??
    posCashCollected + creditCashCollected + instalmentCashCollected + clearedCustomerCheques;
  const pettyCashExpenses = cashFlow?.pettyCashExpenses ?? dailyDrawer.totalCashExpenses;
  const cashConversionRatePct =
    cashFlow?.cashConversionRatePct ??
    Number(((totalActuallyCollected / Math.max(1, totalActuallyCollected + pettyCashExpenses)) * 100).toFixed(1));

  // 2. Server-Computed Debtor Credit Risk Assessments & Overdue Wara
  const riskAssessments = backendAnalytics?.debtors.riskAssessments ?? [];
  const unpaidCreditDebtors = creditCustomers
    .filter(c => c.totalOutstanding > 0)
    .sort((a, b) => b.totalOutstanding - a.totalOutstanding);

  const overdueInstalments = instalmentPlans.flatMap(plan =>
    plan.schedules
      .filter(s => s.status === 'overdue')
      .map(s => ({ plan, schedule: s }))
  );

  const totalUnpaidReceivables =
    (backendAnalytics?.debtors.totalCreditReceivables ??
      unpaidCreditDebtors.reduce((s, c) => s + c.totalOutstanding, 0)) +
    (backendAnalytics?.debtors.totalOverdueInstalments ??
      overdueInstalments.reduce((s, i) => s + i.schedule.amount, 0));

  // 3. Server-Computed Margins & Reorder Quantities
  const marginRankedProducts =
    backendAnalytics?.marginsAndInventory.rankedProducts ??
    [...products]
      .map(p => {
        const retailProfit = p.retailPrice - p.costPrice;
        const retailMarginPct = p.retailPrice > 0 ? Number(((retailProfit / p.retailPrice) * 100).toFixed(1)) : 0;
        const wholesaleProfit = p.wholesalePrice - p.costPrice;
        const wholesaleMarginPct = p.wholesalePrice > 0 ? Number(((wholesaleProfit / p.wholesalePrice) * 100).toFixed(1)) : 0;
        const totalUnits = Object.values(p.stocks).reduce((a, b) => a + b, 0);
        return {
          id: p.id,
          code: p.code,
          name: p.name,
          category: p.category,
          costPrice: p.costPrice,
          wholesalePrice: p.wholesalePrice,
          retailPrice: p.retailPrice,
          unit: p.unit,
          retailProfit,
          retailMarginPct,
          wholesaleProfit,
          wholesaleMarginPct,
          totalUnits,
          stockValueCost: totalUnits * p.costPrice,
          potentialProfit: totalUnits * retailProfit,
          suggestedReorderUnits: totalUnits <= p.minStockLevel * 2 ? Math.max(1, p.minStockLevel * 4 - totalUnits) : 0,
          estimatedReorderCost: 0
        };
      })
      .sort((a, b) => b.retailMarginPct - a.retailMarginPct);

  // 4. Server-Computed Composite Branch Diagnostics & Health Scores
  const branchDiagnostics =
    backendAnalytics?.branches.diagnostics ??
    branches.map(b => {
      const stockCount = products.reduce((sum, p) => sum + (p.stocks[b.id] || 0), 0);
      const lowStockCount = products.filter(p => (p.stocks[b.id] || 0) <= p.minStockLevel).length;
      const outOfStockCount = products.filter(p => (p.stocks[b.id] || 0) === 0).length;
      const creditTotal = creditCustomers
        .filter(c => c.branchId === b.id)
        .reduce((s, c) => s + c.totalOutstanding, 0);
      const branchPlans = instalmentPlans.filter(p => p.branchId === b.id);
      const overduePlans = branchPlans.filter(p => p.schedules.some(s => s.status === 'overdue')).length;
      const riskScore = Math.min(100, Math.round(lowStockCount * 15 + (overduePlans / Math.max(1, branchPlans.length)) * 40 + (creditTotal > 100000 ? 20 : 0)));
      return {
        branchId: b.id,
        branchName: b.name,
        address: b.address,
        manager: b.manager,
        stockCount,
        inventoryValueCost: 0,
        lowStockCount,
        outOfStockCount,
        creditTotal,
        activePlans: branchPlans.length,
        overduePlans,
        overdueInstalmentAmount: 0,
        returnedChequesCount: 0,
        salesCount: sales.filter(s => s.branchId === b.id).length,
        salesRevenue: 0,
        riskScore,
        healthScore: Math.max(0, 100 - riskScore),
        primaryDrivers: ['Calculating live diagnostics on server...']
      };
    });

  const underperformingBranchData =
    backendAnalytics?.branches.underperformingBranch ??
    [...branchDiagnostics].sort((a, b) => b.riskScore - a.riskScore)[0];

  // 5. Server-Computed Supplier Debt & 7-Day Cheque Maturity Projection
  const totalSupplierDebt = suppliers.reduce((s, supp) => s + supp.totalOutstanding, 0);
  const supplierCheques = cheques.filter(c => c.type === 'issued');
  const pendingSupplierCheques = supplierCheques.filter(c => c.status === 'pending' || c.status === 'deposited');
  const nextMaturingSupplierCheque = [...pendingSupplierCheques].sort((a, b) =>
    a.maturityDate.localeCompare(b.maturityDate)
  )[0];
  const totalSupplierChequesOwed =
    backendAnalytics?.chequeProjection.totalPendingOutflow ??
    pendingSupplierCheques.reduce((s, c) => s + c.amount, 0);
  const totalSupplierOwed = backendAnalytics?.liquidityAndAffordability.committedSupplierDebt ?? totalSupplierDebt;

  // 6. Server-Computed Liquidity & Stock Purchase Stress-Test
  const liq = backendAnalytics?.liquidityAndAffordability;
  const currentCashInDrawer = cashFlow?.currentCashInDrawer ?? dailyDrawer.expectedClosingCash;
  const estimatedBankCapital = liq?.estimatedBankCapital ?? 450000;
  const pendingReceivedPdcsRaw =
    liq?.pendingReceivedPdcsRaw ??
    cheques
      .filter(c => c.type === 'received' && (c.status === 'pending' || c.status === 'deposited'))
      .reduce((s, c) => s + c.amount, 0);
  const riskAdjustedPdcInflows = liq?.riskAdjustedPdcInflows ?? Math.round(pendingReceivedPdcsRaw * 0.9);
  const expectedMonthlyCollections = liq?.expectedMonthlyCollections ?? 250000;
  const totalLiquidAssets =
    liq?.totalLiquidAssets ??
    currentCashInDrawer + estimatedBankCapital + riskAdjustedPdcInflows + expectedMonthlyCollections;
  const committedLiabilities = liq?.committedLiabilities ?? totalSupplierOwed;
  const netSafeCapitalAvailable =
    liq?.netSafeCapitalAvailable ?? Math.max(0, totalLiquidAssets - committedLiabilities);

  const purchaseDeficit = liq?.purchaseDeficit ?? simulatedPurchaseAmount - netSafeCapitalAvailable;
  const canAffordCash = liq?.canAffordCash ?? purchaseDeficit <= 0;
  const recommendedDownPayment = liq?.recommendedDownPayment ?? Math.round(simulatedPurchaseAmount * 0.25);
  const balanceToNegotiatePdc = liq?.balanceToNegotiatePdc ?? simulatedPurchaseAmount - recommendedDownPayment;
  const affordabilityVerdict = liq?.affordabilityVerdict;

  // Handle Ask Mudalali AI
  const handleAskCustom = async (questionText: string) => {
    setIsAiLoading(true);
    setAiAnswer(null);

    try {
      const response = await fetch('/api/mudalali-advisor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: questionText,
          contextData: {
            cashInDrawer: currentCashInDrawer,
            collectionsThisMonth: totalActuallyCollected,
            totalCredit: unpaidCreditDebtors.reduce((s, c) => s + c.totalOutstanding, 0),
            overdueInstalments: overdueInstalments.reduce((s, i) => s + i.schedule.amount, 0),
            supplierLiabilities: totalSupplierOwed,
            unpaidDebtors: unpaidCreditDebtors.map(c => ({
              name: c.name,
              debt: c.totalOutstanding,
              phone: c.phone
            })),
            highMarginProducts: marginRankedProducts.slice(0, 3).map(p => ({
              name: p.name,
              marginPct: p.retailMarginPct.toFixed(1) + '%'
            })),
            branchesSummary: branchDiagnostics.map(b => ({
              name: b.branchName,
              credit: b.creditTotal,
              lowStock: b.lowStockCount,
              healthScore: b.healthScore
            }))
          }
        })
      });

      const data = await response.json();
      if (data.answer) {
        setAiAnswer(data.answer);
      } else {
        // Fallback message handled in UI
        setAiAnswer(
          `Sri Lankan SME Assessment:\n\n• Current Realized Cash Collections: Rs. ${totalActuallyCollected.toLocaleString()}\n• Immediate Supplier Liabilities: Rs. ${totalSupplierOwed.toLocaleString()}\n• Net Safe Liquidity Buffer: Rs. ${netSafeCapitalAvailable.toLocaleString()}\n\nRecommendation: Prioritize recovering the Rs. ${unpaidCreditDebtors[0]?.totalOutstanding.toLocaleString()} owed by ${unpaidCreditDebtors[0]?.name} before committing to major unhedged stock purchases.`
        );
      }
    } catch (err) {
      console.error(err);
      setAiAnswer(
        `Direct SME Evaluation:\n\n• Verified Cash Collected: Rs. ${totalActuallyCollected.toLocaleString()}\n• Total Debt Pending from Customers: Rs. ${unpaidCreditDebtors.reduce((s, c) => s + c.totalOutstanding, 0).toLocaleString()}\n• Supplier Cheques Due: Rs. ${totalSupplierOwed.toLocaleString()}`
      );
    } finally {
      setIsAiLoading(false);
    }
  };

  const executiveQueries: {
    id: ExecutiveQueryId;
    question: string;
    sinhala: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
  }[] = [
    {
      id: 'collected_this_month',
      question: 'How much did I actually collect this month?',
      sinhala: 'මේ මාසයේ ඇත්තටම ලැබුණු මුදල් එකතුව කීයද?',
      icon: DollarSign,
      accentColor: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200'
    },
    {
      id: 'unpaid_customers',
      question: 'Which customers have not paid?',
      sinhala: 'මුදල් නොගෙවූ සහ ණය ප්‍රමාද ගනුදෙනුකරුවන් කවුද?',
      icon: Users,
      accentColor: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200'
    },
    {
      id: 'highest_margins',
      question: 'Which products generate the highest margins?',
      sinhala: 'වැඩිම ලාභ ප්‍රතිශතයක් (Margin) ලබාදෙන භාණ්ඩ මොනවාද?',
      icon: Percent,
      accentColor: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200'
    },
    {
      id: 'underperforming_branch',
      question: 'Which branch is underperforming?',
      sinhala: 'වඩාත්ම පාඩු ලබන හෝ ගැටලු ඇති ශාඛාව කුමක්ද?',
      icon: Building2,
      accentColor: 'text-orange-600 bg-orange-50 dark:bg-orange-950/40 border-orange-200'
    },
    {
      id: 'supplier_debt',
      question: 'How much do I owe suppliers?',
      sinhala: 'තොග සැපයුම්කරුවන්ට (Suppliers) ගෙවිය යුතු මුදල කීයද?',
      icon: Landmark,
      accentColor: 'text-sky-600 bg-sky-50 dark:bg-sky-950/40 border-sky-200'
    },
    {
      id: 'afford_stock_2m',
      question: 'Can I afford to purchase another Rs. 2 million worth of stock?',
      sinhala: 'රු. ලක්ෂ 20ක (2 Million) අලුත් තොගයක් මිලදී ගැනීමට මට හැකියාව තිබේද?',
      icon: Scale,
      accentColor: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200'
    }
  ];

  return (
    <div className="pb-24 max-w-7xl mx-auto space-y-5">
      {/* Executive Command Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 text-white rounded-2xl p-4 sm:p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-amber-400 font-semibold text-xs tracking-wider uppercase mb-1">
              <span className="inline-flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Mudalali Executive Intelligence Engine</span>
              </span>
              <span className="text-slate-500">·</span>
              <span className="text-[11px] font-mono normal-case text-slate-300">
                Engine: {backendAnalytics?.engineVersion || 'Mudalali-CalcEngine/2.4.0'}
              </span>
              {currentUser && (
                <>
                  <span className="text-slate-500">·</span>
                  <span className="text-[11px] normal-case text-amber-200">
                    Profile: {currentUser.displayName}
                  </span>
                </>
              )}
              <button
                type="button"
                onClick={() => refreshBackendAnalytics()}
                disabled={isAnalyticsSyncing}
                className="ml-1 inline-flex items-center gap-1 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[11px] normal-case font-semibold text-white transition-colors"
              >
                <RefreshCw className={`w-3 h-3 ${isAnalyticsSyncing ? 'animate-spin' : ''}`} />
                <span>{isAnalyticsSyncing ? 'Computing...' : 'Recalculate'}</span>
              </button>
            </div>
            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
              Instant SME Executive Queries
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Tap any critical business question below for server-verified calculations, debtor risk scoring, profit margins, branch diagnostics, and purchasing affordability.
            </p>
          </div>

          {/* Quick Voice / Text Input */}
          <div className="w-full md:w-80">
            <form
              onSubmit={e => {
                e.preventDefault();
                if (customPrompt.trim()) handleAskCustom(customPrompt);
              }}
              className="flex items-center bg-white/10 backdrop-blur-md rounded-xl p-1 border border-white/20"
            >
              <input
                type="text"
                placeholder="Ask any question in Sinhala / English..."
                value={customPrompt}
                onChange={e => setCustomPrompt(e.target.value)}
                className="flex-1 bg-transparent px-3 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={isAiLoading || !customPrompt.trim()}
                className="p-2 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-slate-950 rounded-lg transition-transform active:scale-95"
              >
                {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 6 Executive Question Cards Bar */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2.5">
        {executiveQueries.map(q => {
          const Icon = q.icon;
          const isSelected = selectedQuery === q.id;

          return (
            <button
              key={q.id}
              onClick={() => {
                setSelectedQuery(q.id);
                setAiAnswer(null);
              }}
              className={`p-3 rounded-2xl border text-left flex flex-col justify-between transition-all min-h-[110px] ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/40 dark:bg-amber-950/30 ring-2 ring-amber-500/20 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center border ${q.accentColor}`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                {isSelected && (
                  <span className="w-2 h-2 rounded-full bg-amber-500" />
                )}
              </div>

              <div>
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                  {q.question}
                </div>
                <div className="text-[10px] text-slate-400 mt-0.5 truncate">
                  {q.sinhala}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* AI Answer Stream Card (if custom asked) */}
      {aiAnswer && (
        <div className="bg-amber-50/60 dark:bg-amber-950/30 border border-amber-300 dark:border-amber-800 rounded-2xl p-4 sm:p-5 shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200 dark:border-amber-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span className="font-bold text-xs text-amber-900 dark:text-amber-200 uppercase tracking-wide">
                Senior Mudalali Executive Analysis
              </span>
            </div>
            <button
              onClick={() => setAiAnswer(null)}
              className="text-xs text-amber-700 hover:text-amber-900 font-semibold"
            >
              Clear
            </button>
          </div>
          <p className="text-xs text-amber-950 dark:text-amber-100 whitespace-pre-line leading-relaxed">
            {aiAnswer}
          </p>
        </div>
      )}

      {/* Detailed Response Panels for Each of the 6 Questions */}

      {/* QUESTION 1: How much did I actually collect this month? */}
      {selectedQuery === 'collected_this_month' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
                Question 01 · Realized Inflow Audit
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                How much did I actually collect this month?
              </h2>
              <div className="text-xs text-slate-500">
                Total physical cash and cleared bank deposits collected into the business.
              </div>
            </div>

            <div className="text-left sm:text-right p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl border border-emerald-200 dark:border-emerald-800">
              <div className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">
                Total Verified Realized Collections:
              </div>
              <div className="text-2xl font-black text-emerald-700 dark:text-emerald-400 tabular-nums">
                {formatLKR(totalActuallyCollected)}
              </div>
            </div>
          </div>

          {/* Breakdown Matrix */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 font-medium">POS Counter Cash Sales</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
                {formatLKR(posCashCollected)}
              </div>
              <div className="text-[11px] text-emerald-600 mt-1 font-semibold">
                Direct walk-in counter sales
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 font-medium">Credit Debtors Recovered (ණය)</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
                {formatLKR(creditCashCollected)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Settled by Bandara, Rizwan, etc.
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 font-medium">Instalment Collections (වාරික)</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
                {formatLKR(instalmentCashCollected)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Down payments + route recovery
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="text-xs text-slate-500 font-medium">Cleared Customer Cheques</div>
              <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums mt-1">
                {formatLKR(clearedCustomerCheques)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1">
                Bank cleared into current account
              </div>
            </div>
          </div>

          {/* Practical Insight note */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1.5">
            <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Senior Mudalali Assessment:</span>
            </div>
            <p className="leading-relaxed">
              Your business has realized <strong>{formatLKR(totalActuallyCollected)}</strong> in hard cash and cleared deposits this month. After deducting daily petty shop expenses (tea, 3-wheel courier, packaging of <strong>{formatLKR(pettyCashExpenses)}</strong>), your operational cash conversion rate stands at <strong>{cashConversionRatePct.toFixed(1)}%</strong>.
            </p>
          </div>
        </div>
      )}

      {/* QUESTION 2: Which customers have not paid? */}
      {selectedQuery === 'unpaid_customers' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-rose-600 uppercase tracking-wider">
                Question 02 · Unpaid Accounts & Defaulters
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                Which customers have not paid?
              </h2>
              <div className="text-xs text-slate-500">
                Detailed roster of credit book debtors and hire-purchase overdue instalments.
              </div>
            </div>

            <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-left sm:text-right">
              <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                Total Unpaid / Outstanding Owed:
              </div>
              <div className="text-2xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                {formatLKR(totalUnpaidReceivables)}
              </div>
            </div>
          </div>

          {/* Section A: Credit Debtors (Naya Potha) with Backend Risk Scoring */}
          <div>
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center justify-between">
              <span>Naya Potha (ණය පොත) Debtors — Algorithmic Risk Scoring</span>
              <span className="text-xs text-slate-500 font-normal">
                {(riskAssessments.length > 0 ? riskAssessments.length : unpaidCreditDebtors.length)} Debtors
              </span>
            </h3>

            <div className="space-y-2">
              {unpaidCreditDebtors.map(debtor => {
                const branchName = branches.find(b => b.id === debtor.branchId)?.name.split(' ')[0];
                const risk = riskAssessments.find(r => r.customerId === debtor.id);
                const riskTier = risk?.riskTier ?? (debtor.creditScoreTrust === 'Watchlist' ? 'Critical' : 'Low');
                const riskColor =
                  riskTier === 'Critical'
                    ? 'text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60'
                    : riskTier === 'Elevated'
                    ? 'text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60'
                    : 'text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60';

                return (
                  <div
                    key={debtor.id}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-300 dark:hover:border-slate-700"
                  >
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {debtor.name}
                        </span>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded font-mono ${riskColor}`}>
                          {risk ? `Risk ${risk.riskScore}/100 · ${riskTier}` : debtor.creditScoreTrust}
                        </span>
                        <span className="text-[11px] text-slate-400">({branchName} Branch)</span>
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                        <span className="font-mono">{debtor.phone}</span>
                        <span>·</span>
                        <span>NIC: {debtor.nicNumber}</span>
                        <span>·</span>
                        <span>
                          {risk
                            ? `Util: ${risk.utilizationPct}% · ${risk.daysSinceLastPayment}d since payment`
                            : `Last paid: ${debtor.lastPaymentDate || 'Never'}`}
                        </span>
                      </div>
                      {risk?.recommendedAction && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-1">
                          Action: <span className="font-semibold">{risk.recommendedAction}</span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                      <div className="text-right">
                        <div className="text-sm sm:text-base font-black text-rose-600 dark:text-rose-400 tabular-nums">
                          {formatLKR(debtor.totalOutstanding)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Limit: {formatLKR(debtor.creditLimit)}
                        </div>
                      </div>

                      <a
                        href={`https://wa.me/${cleanPhoneForWhatsApp(debtor.phone)}?text=${encodeURIComponent(
                          getSinhalaReminderText(
                            debtor.name,
                            debtor.totalOutstanding,
                            new Date().toLocaleDateString('en-GB'),
                            'Mudalali Stores'
                          )
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Remind</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section B: Overdue Hire Purchase Instalments (Wara Potha) */}
          <div className="pt-2">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 mb-2 flex items-center justify-between">
              <span>Wara Potha (වාරික) - Overdue Contract Collections</span>
              <span className="text-xs text-rose-600 font-semibold">{overdueInstalments.length} Missed Instalments</span>
            </h3>

            <div className="space-y-2">
              {overdueInstalments.map(({ plan, schedule }, idx) => (
                <div
                  key={`${plan.id}-${idx}`}
                  className="p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50/20 dark:bg-rose-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {plan.customerName}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        ({plan.contractNo})
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                      Item: <strong>{plan.itemDescription}</strong> · Missed Due Date: <span className="text-rose-600 font-semibold">{schedule.dueDate}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">
                      Collector: {plan.collectorName} · Phone: {plan.customerPhone}
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-rose-200/50">
                    <div className="text-right">
                      <div className="text-base font-black text-rose-700 dark:text-rose-400 tabular-nums">
                        {formatLKR(schedule.amount)}
                      </div>
                      <div className="text-[10px] text-slate-400">Instalment #{schedule.instalmentNumber}</div>
                    </div>

                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(plan.customerPhone)}?text=${encodeURIComponent(
                        getSinhalaReminderText(
                          plan.customerName,
                          schedule.amount,
                          schedule.dueDate,
                          'Mudalali Hire Purchase'
                        )
                      )}`}
                      target="_blank"
                      rel="noreferrer"
                      className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Collect</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUESTION 3: Which products generate the highest margins? */}
      {selectedQuery === 'highest_margins' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-amber-600 uppercase tracking-wider">
                Question 03 · Margin & Profitability Leaderboard
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                Which products generate the highest margins?
              </h2>
              <div className="text-xs text-slate-500">
                Ranked by retail and wholesale markup percentage and absolute unit profit.
              </div>
            </div>

            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-900 text-left sm:text-right">
              <div className="text-xs font-semibold text-amber-800 dark:text-amber-300">
                Top Margin Champion:
              </div>
              <div className="text-base font-black text-amber-900 dark:text-amber-100">
                {marginRankedProducts[0]?.name}
              </div>
              <div className="text-xs text-amber-700 dark:text-amber-400 font-bold tabular-nums">
                {marginRankedProducts[0]?.retailMarginPct.toFixed(1)}% Gross Margin (+{formatLKR(marginRankedProducts[0]?.retailProfit)}/unit)
              </div>
            </div>
          </div>

          {/* Margin Rankings Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                <tr>
                  <th className="py-2.5 px-3">Rank & Product</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Cost</th>
                  <th className="py-2.5 px-3 text-right">Retail Price</th>
                  <th className="py-2.5 px-3 text-right">Profit / Unit</th>
                  <th className="py-2.5 px-3 text-center">Retail Margin %</th>
                  <th className="py-2.5 px-3 text-right">Stock Value & Reorder</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {marginRankedProducts.map((prod, idx) => (
                  <tr key={prod.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2">
                        <span className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold ${
                          idx === 0 ? 'bg-amber-500 text-slate-950' : idx === 1 ? 'bg-slate-300 text-slate-800' : idx === 2 ? 'bg-amber-700 text-white' : 'text-slate-400'
                        }`}>
                          {idx + 1}
                        </span>
                        <div>
                          <div className="font-bold text-slate-900 dark:text-slate-100">{prod.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{prod.code}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-3 text-slate-500">{prod.category}</td>

                    <td className="py-3 px-3 text-right font-mono text-slate-600 dark:text-slate-400 tabular-nums">
                      {formatLKR(prod.costPrice)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatLKR(prod.retailPrice)}
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                      +{formatLKR(prod.retailProfit)}
                    </td>

                    <td className="py-3 px-3 text-center">
                      <span className={`px-2 py-0.5 rounded font-extrabold tabular-nums ${
                        prod.retailMarginPct >= 25
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : prod.retailMarginPct >= 18
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {prod.retailMarginPct.toFixed(1)}%
                      </span>
                    </td>

                    <td className="py-3 px-3 text-right font-mono font-medium text-slate-700 dark:text-slate-300 tabular-nums">
                      <div>{formatLKR(prod.potentialProfit)} profit</div>
                      {prod.suggestedReorderUnits > 0 && (
                        <div className="text-[10px] text-amber-600 dark:text-amber-400">
                          Reorder +{prod.suggestedReorderUnits} {prod.unit}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <span className="font-bold">Algorithmic Margin & Inventory Strategy:</span>
            <p className="text-[11px] leading-relaxed">
              Your top margin drivers right now are{' '}
              {marginRankedProducts.slice(0, 3).map((p, i) => (
                <React.Fragment key={p.id}>
                  <strong>
                    {p.name} ({p.retailMarginPct.toFixed(1)}%)
                  </strong>
                  {i < 2 ? (i === 0 ? ', ' : ', and ') : ''}
                </React.Fragment>
              ))}
              . Portfolio average gross margin is{' '}
              <strong>{(backendAnalytics?.marginsAndInventory.averageGrossMarginPct ?? 18.5).toFixed(1)}%</strong>
              {backendAnalytics && backendAnalytics.marginsAndInventory.lowStockSkuCount > 0 && (
                <>
                  {' '}with <strong>{backendAnalytics.marginsAndInventory.lowStockSkuCount} SKUs</strong> flagged for reorder (est. budget{' '}
                  <strong>{formatLKR(backendAnalytics.marginsAndInventory.totalSuggestedReorderCost)}</strong>).
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* QUESTION 4: Which branch is underperforming? */}
      {selectedQuery === 'underperforming_branch' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-orange-600 uppercase tracking-wider">
                Question 04 · Branch Performance Diagnostics
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                Which branch is underperforming?
              </h2>
              <div className="text-xs text-slate-500">
                Evaluation across stock availability, overdue credit concentration, and manager sales.
              </div>
            </div>

            <div className="p-3 bg-orange-50 dark:bg-orange-950/40 rounded-xl border border-orange-200 dark:border-orange-900 text-left sm:text-right">
              <div className="text-xs font-semibold text-orange-800 dark:text-orange-300">
                Flagged Underperformer · Health {underperformingBranchData?.healthScore ?? 0}/100
              </div>
              <div className="text-lg font-black text-orange-900 dark:text-orange-100">
                {underperformingBranchData?.branchName}
              </div>
              <div className="text-xs text-orange-700 dark:text-orange-400 font-bold">
                Manager: {underperformingBranchData?.manager}
              </div>
            </div>
          </div>

          {/* Underperforming Root Cause Analysis */}
          <div className="p-4 bg-orange-50/40 dark:bg-orange-950/20 rounded-2xl border border-orange-200/60 dark:border-orange-900/40 space-y-3">
            <h3 className="font-bold text-sm text-orange-950 dark:text-orange-100 flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span>Root Cause Analysis for {underperformingBranchData?.branchName}:</span>
              </span>
              <span className="text-xs font-mono text-orange-700 dark:text-orange-300">
                Risk Score: {underperformingBranchData?.riskScore ?? 0}/100
              </span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-orange-200/40">
                <div className="text-slate-500">1. Stock Depletion</div>
                <div className="text-base font-bold text-rose-600 tabular-nums mt-0.5">
                  {underperformingBranchData?.lowStockCount ?? 0} Critical SKUs Depleted
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {underperformingBranchData?.outOfStockCount ?? 0} SKU(s) completely out of stock in this branch.
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-orange-200/40">
                <div className="text-slate-500">2. Debtor Overdue Concentration</div>
                <div className="text-base font-bold text-rose-600 tabular-nums mt-0.5">
                  {formatLKR(underperformingBranchData?.creditTotal || 0)} Trapped in Credit
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {underperformingBranchData?.returnedChequesCount ?? 0} returned/bounced cheque(s) recorded at branch.
                </div>
              </div>

              <div className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-orange-200/40">
                <div className="text-slate-500">3. Hire Purchase Arrears</div>
                <div className="text-base font-bold text-rose-600 tabular-nums mt-0.5">
                  {underperformingBranchData?.overduePlans ?? 0} Overdue Contracts
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  {formatLKR(underperformingBranchData?.overdueInstalmentAmount || 0)} in past-due Wara instalments.
                </div>
              </div>
            </div>

            {underperformingBranchData?.primaryDrivers && underperformingBranchData.primaryDrivers.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="text-[11px] font-bold text-orange-900 dark:text-orange-200">
                  Server-Computed Primary Diagnostic Drivers:
                </div>
                <ul className="text-xs text-slate-700 dark:text-slate-300 space-y-0.5 list-disc list-inside">
                  {underperformingBranchData.primaryDrivers.map((driver, i) => (
                    <li key={i}>{driver}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => setIsTransferModalOpen(true)}
                className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5"
              >
                <Boxes className="w-3.5 h-3.5" />
                <span>Dispatch Stock from Pettah to {underperformingBranchData?.branchName.split(' ')[0]}</span>
              </button>
            </div>
          </div>

          {/* All Branches Comparison Table */}
          <div>
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2">
              All Sri Lanka Branches Comparative Scorecard:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {branchDiagnostics.map(bm => (
                <div
                  key={bm.branchId}
                  className={`p-3.5 rounded-xl border text-xs ${
                    bm.branchId === underperformingBranchData?.branchId
                      ? 'border-orange-400 bg-orange-50/20 dark:bg-orange-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {bm.branchName}
                    </div>
                    <span className={`text-[11px] font-mono font-bold ${
                      bm.healthScore >= 75 ? 'text-emerald-600' : bm.healthScore >= 50 ? 'text-amber-600' : 'text-rose-600'
                    }`}>
                      {bm.healthScore}/100
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500">{bm.address}</div>

                  <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Total Stock Count:</span>
                      <span className="font-bold tabular-nums">{bm.stockCount} units</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Low Stock SKUs:</span>
                      <span className={`font-bold tabular-nums ${bm.lowStockCount > 0 ? 'text-amber-600' : 'text-slate-600'}`}>
                        {bm.lowStockCount}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Credit Book Debt:</span>
                      <span className="font-bold tabular-nums text-rose-600">{formatLKR(bm.creditTotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Overdue Wara:</span>
                      <span className="font-bold tabular-nums text-rose-600">{bm.overduePlans} accounts</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* QUESTION 5: How much do I owe suppliers? */}
      {selectedQuery === 'supplier_debt' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
                Question 05 · Supplier Liabilities & PDCs
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                How much do I owe suppliers?
              </h2>
              <div className="text-xs text-slate-500">
                Accounts payable to wholesale distributors, credit purchase orders, and issued post-dated cheques.
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-50 dark:bg-rose-950/40 rounded-xl border border-rose-200 dark:border-rose-900 text-left sm:text-right">
                <div className="text-xs font-semibold text-rose-800 dark:text-rose-300">
                  Total Supplier Debt:
                </div>
                <div className="text-2xl font-black text-rose-700 dark:text-rose-300 tabular-nums font-mono">
                  {formatLKR(totalSupplierDebt)}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('suppliers')}
                className="px-3.5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shrink-0 shadow-xs"
              >
                <Building2 className="w-4 h-4" />
                <span>Supplier Management Tab</span>
              </button>
            </div>
          </div>

          {/* Supplier Breakdown Cards */}
          <div>
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2">
              Payables Breakdown by Supplier ({suppliers.filter(s => s.totalOutstanding > 0).length} active balances):
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {suppliers.map(supp => (
                <div
                  key={supp.id}
                  className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center justify-between text-xs"
                >
                  <div>
                    <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                      {supp.companyName}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Rep: {supp.contactPerson} • {supp.bankName}
                    </div>
                    <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-0.5">
                      Terms: {supp.creditTermsDays} Days Credit
                    </div>
                  </div>

                  <div className="text-right">
                    <div className={`font-mono font-black text-sm tabular-nums ${
                      supp.totalOutstanding > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {formatLKR(supp.totalOutstanding)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {supp.orders.filter(o => o.paidAmount < o.totalAmount).length} pending PO(s)
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supplier Cheques Schedule */}
          <div>
            <h4 className="font-bold text-xs text-slate-700 dark:text-slate-300 mb-2">
              Post-Dated Cheques (PDC) Issued to Distributors:
            </h4>
            <div className="space-y-2">
              {pendingSupplierCheques.map(chq => (
                <div
                  key={chq.id}
                  className="p-3.5 rounded-xl border border-sky-200 dark:border-sky-900/60 bg-sky-50/30 dark:bg-sky-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                        {chq.partyName}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-sky-100 text-sky-800 font-mono font-bold text-[10px]">
                        Chq #{chq.chequeNumber}
                      </span>
                    </div>
                    <div className="text-slate-600 dark:text-slate-300 mt-1">
                      Bank: <strong>{chq.bank}</strong> · Branch: {chq.branchName}
                    </div>
                    {chq.notes && (
                      <div className="text-[11px] text-slate-500 italic mt-0.5">
                        "{chq.notes}"
                      </div>
                    )}
                  </div>

                  <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-sky-200/50">
                    <div className="text-base font-black text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatLKR(chq.amount)}
                    </div>
                    <div className="text-[11px] text-amber-700 dark:text-amber-400 font-semibold flex items-center sm:justify-end gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Clearing Maturity: {chq.maturityDate}</span>
                    </div>
                  </div>
                </div>
              ))}

              {pendingSupplierCheques.length === 0 && (
                <div className="p-6 text-center text-xs text-slate-500 bg-slate-50 dark:bg-slate-800/30 rounded-xl">
                  You currently have zero pending supplier cheques or outstanding liabilities!
                </div>
              )}
            </div>
          </div>

          {/* Clearing safety check */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-700 text-xs space-y-1.5">
            <span className="font-bold text-slate-900 dark:text-slate-100">
              Commercial Bank Account Clearing & 7-Day Liquidity Check:
            </span>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {nextMaturingSupplierCheque ? (
                <>
                  Total pending supplier PDC exposure is <strong>{formatLKR(totalSupplierChequesOwed)}</strong>. Next maturing cheque is{' '}
                  <strong>{formatLKR(nextMaturingSupplierCheque.amount)}</strong> issued to{' '}
                  <strong>{nextMaturingSupplierCheque.partyName}</strong> on <strong>{nextMaturingSupplierCheque.maturityDate}</strong>.{' '}
                </>
              ) : (
                <>No pending supplier PDCs require immediate clearing. </>
              )}
              {backendAnalytics && (
                <>
                  Projected 7-day net cheque flow is{' '}
                  <strong className={backendAnalytics.chequeProjection.net7DayChequeFlow >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                    {backendAnalytics.chequeProjection.net7DayChequeFlow >= 0 ? '+' : ''}
                    {formatLKR(backendAnalytics.chequeProjection.net7DayChequeFlow)}
                  </strong>{' '}
                  ({formatLKR(backendAnalytics.chequeProjection.maturing7DaysInflow)} inflow vs{' '}
                  {formatLKR(backendAnalytics.chequeProjection.maturing7DaysOutflow)} outflow).
                </>
              )}
            </p>
          </div>
        </div>
      )}

      {/* QUESTION 6: Can I afford to purchase another Rs. 2 million worth of stock? */}
      {selectedQuery === 'afford_stock_2m' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-2xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-slate-800">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                Question 06 · Stock Affordability & Solvency Simulator
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-0.5">
                Can I afford to purchase another Rs. 2 million worth of stock?
              </h2>
              <div className="text-xs text-slate-500">
                Live cash flow stress-test comparing liquid reserves, incoming PDCs, and supplier liabilities.
              </div>
            </div>

            <div
              className={`p-3 rounded-xl border text-left sm:text-right ${
                canAffordCash
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 text-emerald-800'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 text-amber-900 dark:text-amber-200'
              }`}
            >
              <div className="text-xs font-bold">
                {canAffordCash ? '✓ Full Cash Affordability: YES' : '⚠️ Full Cash Affordability: HIGH RISK'}
              </div>
              <div className="text-xs font-medium mt-0.5">
                {canAffordCash
                  ? 'Safe to buy with existing reserves'
                  : 'Requires 25% Down + 30-Day PDC Split'}
              </div>
            </div>
          </div>

          {/* Interactive Simulation Slider */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-indigo-600" />
                <span>Simulate Planned Stock Purchase Order:</span>
              </span>
              <span className="text-lg font-black text-indigo-600 dark:text-indigo-400 tabular-nums">
                {formatLKR(simulatedPurchaseAmount)}
              </span>
            </div>

            <input
              type="range"
              min={200000}
              max={5000000}
              step={100000}
              value={simulatedPurchaseAmount}
              onChange={e => setSimulatedPurchaseAmount(parseInt(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />

            <div className="flex justify-between text-[11px] text-slate-400 font-mono">
              <span>Rs. 200,000 (Pola Batch)</span>
              <span>Rs. 2,000,000 (Target)</span>
              <span>Rs. 5,000,000 (Container)</span>
            </div>
          </div>

          {/* Financial Breakdown Table */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Column 1: Available Liquid Resources */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                <span>Available Inflow Capacity</span>
                <span className="text-emerald-600 tabular-nums font-mono">+{formatLKR(totalLiquidAssets)}</span>
              </h4>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Physical Drawer Cash in Hand:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {formatLKR(currentCashInDrawer)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Liquid Bank Account Buffer:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    {formatLKR(estimatedBankCapital)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Risk-Adjusted Customer PDCs:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    +{formatLKR(riskAdjustedPdcInflows)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Projected Wara / Naya Inflows:</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200 tabular-nums">
                    +{formatLKR(expectedMonthlyCollections)}
                  </span>
                </div>
              </div>
            </div>

            {/* Column 2: Liabilities & Net Safe Capital */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/30 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
              <h4 className="font-bold text-slate-900 dark:text-slate-100 flex items-center justify-between pb-1 border-b border-slate-200 dark:border-slate-700">
                <span>Committed Supplier Liabilities</span>
                <span className="text-rose-600 tabular-nums font-mono">-{formatLKR(committedLiabilities)}</span>
              </h4>
              <div className="space-y-1.5 text-slate-600 dark:text-slate-400">
                <div className="flex justify-between">
                  <span>Supplier Payables & Issued PDCs:</span>
                  <span className="font-bold text-rose-600 tabular-nums">-{formatLKR(totalSupplierOwed)}</span>
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-slate-900 dark:text-slate-100">
                  <span>Net Safe Liquid Buying Buffer:</span>
                  <span className="text-indigo-600 dark:text-indigo-400 text-sm tabular-nums">
                    {formatLKR(netSafeCapitalAvailable)}
                  </span>
                </div>
                <div className="flex justify-between text-[11px] pt-1">
                  <span>Cash Gap for {formatLKR(simulatedPurchaseAmount)}:</span>
                  <span className={`font-extrabold tabular-nums ${canAffordCash ? 'text-emerald-600' : 'text-rose-600'}`}>
                    {canAffordCash ? 'Surplus + ' + formatLKR(Math.abs(purchaseDeficit)) : 'Deficit - ' + formatLKR(purchaseDeficit)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Senior Mudalali Concrete Action Plan */}
          <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-2xl border border-indigo-200 dark:border-indigo-900/60 space-y-2.5 text-xs text-indigo-950 dark:text-indigo-100">
            <h4 className="font-bold text-sm flex items-center gap-1.5 text-indigo-900 dark:text-indigo-200">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Algorithmic SME Procurement Plan for {formatLKR(simulatedPurchaseAmount)}:</span>
            </h4>

            {affordabilityVerdict && (
              <div className="p-2.5 rounded-lg bg-white/70 dark:bg-slate-900/60 border border-indigo-200/70 dark:border-indigo-800/70 font-semibold text-indigo-900 dark:text-indigo-200">
                {affordabilityVerdict}
              </div>
            )}

            <div className="space-y-2 leading-relaxed">
              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  {canAffordCash ? (
                    <>
                      <strong>Cash Capacity Verified:</strong> Net safe working capital ({formatLKR(netSafeCapitalAvailable)}) covers {formatLKR(simulatedPurchaseAmount)} while reserving funds for supplier commitments ({formatLKR(committedLiabilities)}).
                    </>
                  ) : (
                    <>
                      <strong>Do NOT pay full {formatLKR(simulatedPurchaseAmount)} upfront in cash:</strong> Doing so leaves a cash gap of {formatLKR(purchaseDeficit)} and threatens pending supplier cheque clearing ({formatLKR(totalSupplierChequesOwed)}).
                    </>
                  )}
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <strong>Execute 25% Advance Down Payment ({formatLKR(recommendedDownPayment)}):</strong> Pay 25% from current drawer ({formatLKR(currentCashInDrawer)}) and bank balance to lock wholesale pricing.
                </div>
              </div>

              <div className="flex items-start gap-2">
                <div className="w-5 h-5 rounded-md bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <strong>Issue 30-Day Post-Dated Cheque for Balance ({formatLKR(balanceToNegotiatePdc)}):</strong> Negotiate 30-day PDC terms aligned with your risk-adjusted PDC inflows ({formatLKR(riskAdjustedPdcInflows)}) and credit collections ({formatLKR(expectedMonthlyCollections)}).
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
