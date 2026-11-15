import type {
  Branch,
  BranchDiagnostic,
  BranchId,
  Cheque,
  CreditCustomer,
  DailyDrawer,
  DailyExpense,
  DebtorRiskAssessment,
  InstalmentPlan,
  BackendAnalyticsReport,
  Product,
  ProductMarginMetric,
  Sale,
  Supplier,
  CartItem
} from '../src/types/index.js';

export interface ComputeAnalyticsInput {
  branches: Branch[];
  products: Product[];
  creditCustomers: CreditCustomer[];
  instalmentPlans: InstalmentPlan[];
  cheques: Cheque[];
  sales: Sale[];
  suppliers: Supplier[];
  dailyDrawer: DailyDrawer;
  dailyExpenses: DailyExpense[];
  simulatedPurchaseAmount?: number;
  branchScope?: 'all' | BranchId;
}

const REFERENCE_DATE_MS = Date.now();

function daysBetweenDateString(dateStr?: string): number {
  if (!dateStr) return 90;
  const parsed = Date.parse(dateStr);
  if (isNaN(parsed)) return 30;
  const diff = Math.floor((REFERENCE_DATE_MS - parsed) / (1000 * 60 * 60 * 24));
  return Math.max(0, diff);
}

function isWithinNextDays(dateStr: string, days: number): boolean {
  const parsed = Date.parse(dateStr);
  if (isNaN(parsed)) return false;
  const diffDays = (parsed - REFERENCE_DATE_MS) / (1000 * 60 * 60 * 24);
  return diffDays >= -2 && diffDays <= days; // include recently matured pending items up to +N days
}

/**
 * Core Backend Financial Calculations & SME Algorithms Engine
 */
export function computeBusinessAnalytics(input: ComputeAnalyticsInput): BackendAnalyticsReport {
  const {
    branches = [],
    products = [],
    creditCustomers = [],
    instalmentPlans = [],
    cheques = [],
    sales = [],
    suppliers = [],
    dailyDrawer,
    dailyExpenses = [],
    simulatedPurchaseAmount = 2000000,
    branchScope = 'all'
  } = input;

  const inScope = (branchId: BranchId) => branchScope === 'all' || branchId === branchScope;

  const scopedCustomers = creditCustomers.filter(c => inScope(c.branchId));
  const scopedPlans = instalmentPlans.filter(p => inScope(p.branchId));
  const scopedCheques = cheques.filter(ch => inScope(ch.branchId));
  const scopedSales = sales.filter(s => inScope(s.branchId));
  const scopedExpenses = dailyExpenses.filter(e => inScope(e.branchId));

  // ---------------------------------------------------------------------------
  // 1. CASH FLOW & REALIZED COLLECTIONS ALGORITHM
  // ---------------------------------------------------------------------------
  const posCashCollected = dailyDrawer?.totalCashSales || 0;
  const creditCashCollected = dailyDrawer?.totalCreditCollections || 0;
  const instalmentCashCollected = dailyDrawer?.totalInstalmentCollections || 0;
  const clearedCustomerCheques = scopedCheques
    .filter(c => c.type === 'received' && c.status === 'cleared')
    .reduce((sum, c) => sum + c.amount, 0);

  const totalActuallyCollected =
    posCashCollected + creditCashCollected + instalmentCashCollected + clearedCustomerCheques;

  const pettyCashExpenses = Math.max(
    dailyDrawer?.totalCashExpenses || 0,
    scopedExpenses.reduce((sum, e) => sum + e.amount, 0)
  );

  const cashConversionRatePct =
    totalActuallyCollected + pettyCashExpenses > 0
      ? Number(((totalActuallyCollected / (totalActuallyCollected + pettyCashExpenses)) * 100).toFixed(1))
      : 100;

  const currentCashInDrawer = dailyDrawer?.expectedClosingCash || 0;

  // ---------------------------------------------------------------------------
  // 2. DEBTOR CREDIT RISK SCORING ALGORITHM (0-100 SCALE)
  // ---------------------------------------------------------------------------
  const returnedCheques = scopedCheques.filter(c => c.status === 'returned');

  const riskAssessments: DebtorRiskAssessment[] = scopedCustomers
    .filter(c => c.totalOutstanding > 0)
    .map(c => {
      const utilizationPct =
        c.creditLimit > 0 ? Math.min(150, (c.totalOutstanding / c.creditLimit) * 100) : 100;
      const daysSinceLastPayment = daysBetweenDateString(c.lastPaymentDate || c.createdAt);

      const customerReturnedCount = returnedCheques.filter(ch =>
        ch.partyName.toLowerCase().includes(c.name.toLowerCase().split(' ')[0])
      ).length;

      // Algorithmic scoring weights:
      // - Utilization (up to 40 pts)
      // - Days overdue / inactivity since last payment (up to 30 pts)
      // - Returned cheques history (25 pts per bounce, capped at 30 pts)
      // - Watchlist trust flag (+15 pts)
      let score = 0;
      score += Math.min(40, (utilizationPct / 100) * 40);
      score += Math.min(30, (daysSinceLastPayment / 45) * 30);
      score += Math.min(30, customerReturnedCount * 25);
      if (c.creditScoreTrust === 'Watchlist') score += 15;
      else if (c.creditScoreTrust === 'Medium') score += 5;

      const riskScore = Math.min(100, Math.round(score));
      const riskTier: DebtorRiskAssessment['riskTier'] =
        riskScore >= 65 ? 'Critical' : riskScore >= 35 ? 'Elevated' : 'Low';

      let recommendedAction = 'Routine monthly statement check';
      if (customerReturnedCount > 0) {
        recommendedAction = 'Freeze credit & collect cash replacement for dishonored cheque';
      } else if (riskTier === 'Critical') {
        recommendedAction = 'Dispatch field collector & lock POS credit sales';
      } else if (riskTier === 'Elevated') {
        recommendedAction = 'Send WhatsApp payment notice before next cycle';
      }

      return {
        customerId: c.id,
        name: c.name,
        phone: c.phone,
        nicNumber: c.nicNumber,
        branchId: c.branchId,
        totalOutstanding: c.totalOutstanding,
        creditLimit: c.creditLimit,
        utilizationPct: Number(utilizationPct.toFixed(1)),
        daysSinceLastPayment,
        returnedChequesCount: customerReturnedCount,
        riskScore,
        riskTier,
        recommendedAction
      };
    })
    .sort((a, b) => b.riskScore - a.riskScore || b.totalOutstanding - a.totalOutstanding);

  const overdueInstalmentsList = scopedPlans.flatMap(plan =>
    plan.schedules.filter(s => s.status === 'overdue').map(s => ({ plan, schedule: s }))
  );

  const totalCreditReceivables = scopedCustomers.reduce((s, c) => s + c.totalOutstanding, 0);
  const totalOverdueInstalments = overdueInstalmentsList.reduce((s, item) => s + item.schedule.amount, 0);
  const returnedChequesValue = returnedCheques.reduce((s, c) => s + c.amount, 0);

  // ---------------------------------------------------------------------------
  // 3. CHEQUE (PDC) LIQUIDITY PROJECTION & EXPOSURE ALGORITHM
  // ---------------------------------------------------------------------------
  const pendingReceivedCheques = scopedCheques.filter(
    c => c.type === 'received' && (c.status === 'pending' || c.status === 'deposited')
  );
  const pendingIssuedCheques = scopedCheques.filter(
    c => c.type === 'issued' && (c.status === 'pending' || c.status === 'deposited')
  );

  const totalPendingInflow = pendingReceivedCheques.reduce((s, c) => s + c.amount, 0);
  const totalPendingOutflow = pendingIssuedCheques.reduce((s, c) => s + c.amount, 0);

  const maturing7DaysInflow = pendingReceivedCheques
    .filter(c => isWithinNextDays(c.maturityDate, 7))
    .reduce((s, c) => s + c.amount, 0);

  const maturing7DaysOutflow = pendingIssuedCheques
    .filter(c => isWithinNextDays(c.maturityDate, 7))
    .reduce((s, c) => s + c.amount, 0);

  const net7DayChequeFlow = maturing7DaysInflow - maturing7DaysOutflow;

  // Risk-discount incoming PDCs based on historical dishonor rate (minimum 5% prudence haircut)
  const totalCustomerChequesCount = Math.max(
    1,
    scopedCheques.filter(c => c.type === 'received').length
  );
  const dishonorRate = returnedCheques.filter(c => c.type === 'received').length / totalCustomerChequesCount;
  const prudenceHaircut = Math.min(0.35, Math.max(0.05, dishonorRate));
  const riskAdjustedPdcInflows = Math.round(totalPendingInflow * (1 - prudenceHaircut));

  // ---------------------------------------------------------------------------
  // 4. INVENTORY VALUATION, MARGIN & ECONOMIC REORDER ALGORITHM
  // ---------------------------------------------------------------------------
  let totalInventoryCostValue = 0;
  let totalInventoryRetailValue = 0;
  let lowStockSkuCount = 0;
  let totalSuggestedReorderCost = 0;

  const rankedProducts: ProductMarginMetric[] = products
    .map(p => {
      const unitsInScope =
        branchScope === 'all'
          ? Object.values(p.stocks).reduce((a, b) => a + b, 0)
          : p.stocks[branchScope] || 0;

      const retailProfit = Math.max(0, p.retailPrice - p.costPrice);
      const retailMarginPct = p.retailPrice > 0 ? (retailProfit / p.retailPrice) * 100 : 0;
      const wholesaleProfit = Math.max(0, p.wholesalePrice - p.costPrice);
      const wholesaleMarginPct = p.wholesalePrice > 0 ? (wholesaleProfit / p.wholesalePrice) * 100 : 0;

      const stockValueCost = unitsInScope * p.costPrice;
      const stockValueRetail = unitsInScope * p.retailPrice;
      const potentialProfit = unitsInScope * retailProfit;

      totalInventoryCostValue += stockValueCost;
      totalInventoryRetailValue += stockValueRetail;

      // Target safety stock = 2x minStockLevel per branch (or 4x across all 4 branches)
      const threshold = branchScope === 'all' ? p.minStockLevel * 2 : p.minStockLevel;
      const targetLevel = branchScope === 'all' ? p.minStockLevel * 4 : p.minStockLevel * 2;
      const isLow = unitsInScope <= threshold;
      if (isLow) lowStockSkuCount += 1;

      const suggestedReorderUnits = isLow ? Math.max(1, targetLevel - unitsInScope) : 0;
      const estimatedReorderCost = suggestedReorderUnits * p.costPrice;
      totalSuggestedReorderCost += estimatedReorderCost;

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
        retailMarginPct: Number(retailMarginPct.toFixed(1)),
        wholesaleProfit,
        wholesaleMarginPct: Number(wholesaleMarginPct.toFixed(1)),
        totalUnits: unitsInScope,
        stockValueCost,
        potentialProfit,
        suggestedReorderUnits,
        estimatedReorderCost
      };
    })
    .sort((a, b) => b.retailMarginPct - a.retailMarginPct);

  const averageGrossMarginPct =
    totalInventoryRetailValue > 0
      ? Number((((totalInventoryRetailValue - totalInventoryCostValue) / totalInventoryRetailValue) * 100).toFixed(1))
      : 0;

  // ---------------------------------------------------------------------------
  // 5. BRANCH COMPOSITE HEALTH & ANOMALY DIAGNOSTICS ALGORITHM
  // ---------------------------------------------------------------------------
  const diagnostics: BranchDiagnostic[] = branches.map(b => {
    const branchStockCount = products.reduce((sum, p) => sum + (p.stocks[b.id] || 0), 0);
    const inventoryValueCost = products.reduce((sum, p) => sum + (p.stocks[b.id] || 0) * p.costPrice, 0);
    const lowStockCount = products.filter(p => (p.stocks[b.id] || 0) <= p.minStockLevel).length;
    const outOfStockCount = products.filter(p => (p.stocks[b.id] || 0) === 0).length;

    const branchDebtors = creditCustomers.filter(c => c.branchId === b.id);
    const creditTotal = branchDebtors.reduce((s, c) => s + c.totalOutstanding, 0);

    const branchPlans = instalmentPlans.filter(p => p.branchId === b.id);
    const overduePlanList = branchPlans.filter(p => p.schedules.some(s => s.status === 'overdue'));
    const overdueInstalmentAmount = overduePlanList.reduce(
      (sum, plan) =>
        sum + plan.schedules.filter(s => s.status === 'overdue').reduce((a, s) => a + s.amount, 0),
      0
    );

    const branchReturnedCheques = cheques.filter(c => c.branchId === b.id && c.status === 'returned').length;
    const branchSales = sales.filter(s => s.branchId === b.id);
    const salesRevenue = branchSales.reduce((s, sale) => s + sale.total, 0);

    // Algorithmic Risk Score (higher = worse)
    const stockRisk = lowStockCount * 11 + outOfStockCount * 16;
    const waraRisk = (overduePlanList.length / Math.max(1, branchPlans.length)) * 35;
    const creditRisk = creditTotal > 100000 ? 18 : creditTotal > 50000 ? 10 : 0;
    const chequeRisk = branchReturnedCheques * 15;

    const riskScore = Math.min(100, Math.round(stockRisk + waraRisk + creditRisk + chequeRisk));
    const healthScore = Math.max(0, 100 - riskScore);

    const primaryDrivers: string[] = [];
    if (lowStockCount > 0) {
      primaryDrivers.push(`${lowStockCount} SKUs at or below safety threshold (${outOfStockCount} out of stock)`);
    }
    if (creditTotal > 0) {
      const topDebtor = [...branchDebtors].sort((x, y) => y.totalOutstanding - x.totalOutstanding)[0];
      if (topDebtor) {
        primaryDrivers.push(
          `Rs. ${creditTotal.toLocaleString()} in credit (top: ${topDebtor.name}, Rs. ${topDebtor.totalOutstanding.toLocaleString()})`
        );
      }
    }
    if (overduePlanList.length > 0) {
      primaryDrivers.push(
        `${overduePlanList.length} overdue Wara contract(s) totaling Rs. ${overdueInstalmentAmount.toLocaleString()}`
      );
    }
    if (branchReturnedCheques > 0) {
      primaryDrivers.push(`${branchReturnedCheques} returned/bounced cheque(s) unresolved`);
    }
    if (primaryDrivers.length === 0) {
      primaryDrivers.push('Healthy stock depth and clean collection velocity');
    }

    return {
      branchId: b.id,
      branchName: b.name,
      address: b.address,
      manager: b.manager,
      stockCount: branchStockCount,
      inventoryValueCost,
      lowStockCount,
      outOfStockCount,
      creditTotal,
      activePlans: branchPlans.length,
      overduePlans: overduePlanList.length,
      overdueInstalmentAmount,
      returnedChequesCount: branchReturnedCheques,
      salesCount: branchSales.length,
      salesRevenue,
      riskScore,
      healthScore,
      primaryDrivers
    };
  });

  const sortedByRisk = [...diagnostics].sort((a, b) => b.riskScore - a.riskScore);
  const underperformingBranch = sortedByRisk[0] || null;
  const topPerformingBranch = sortedByRisk[sortedByRisk.length - 1] || null;

  // ---------------------------------------------------------------------------
  // 6. WORKING CAPITAL AFFORDABILITY & CASH-FLOW STRESS TEST ALGORITHM
  // ---------------------------------------------------------------------------
  const committedSupplierDebt = suppliers.reduce((s, supp) => s + supp.totalOutstanding, 0);
  const committedLiabilities = committedSupplierDebt; // Supplier AP already encompasses issued PO commitments
  const estimatedBankCapital = 450000; // Base commercial bank float
  // Expected collections weighted conservatively at 60% of near-term recoverable credit + Wara
  const expectedMonthlyCollections = Math.round((totalCreditReceivables * 0.45) + 125000);

  const totalLiquidAssets =
    currentCashInDrawer + estimatedBankCapital + riskAdjustedPdcInflows + expectedMonthlyCollections;

  const netSafeCapitalAvailable = Math.max(0, totalLiquidAssets - committedLiabilities);
  const purchaseDeficit = simulatedPurchaseAmount - netSafeCapitalAvailable;
  const canAffordCash = purchaseDeficit <= 0;
  const recommendedDownPayment = Math.round(simulatedPurchaseAmount * 0.25);
  const balanceToNegotiatePdc = simulatedPurchaseAmount - recommendedDownPayment;

  let affordabilityVerdict = '';
  if (canAffordCash) {
    affordabilityVerdict = `YES — Net safe capital buffer of Rs. ${netSafeCapitalAvailable.toLocaleString()} covers this Rs. ${simulatedPurchaseAmount.toLocaleString()} purchase in full.`;
  } else if (recommendedDownPayment <= currentCashInDrawer + estimatedBankCapital) {
    affordabilityVerdict = `PARTIAL / TERMS REQUIRED — Do NOT pay full cash (shortfall Rs. ${purchaseDeficit.toLocaleString()}). Negotiate 25% cash down (Rs. ${recommendedDownPayment.toLocaleString()}) and 30/60-day PDCs for Rs. ${balanceToNegotiatePdc.toLocaleString()}.`;
  } else {
    affordabilityVerdict = `HIGH LIQUIDITY RISK — Recover overdue receivables (Rs. ${totalOverdueInstalments.toLocaleString()} Wara + Rs. ${totalCreditReceivables.toLocaleString()} Naya) before committing to new debt.`;
  }

  // ---------------------------------------------------------------------------
  // 7. ACCOUNTANT DOUBLE-ENTRY WORKING CAPITAL & TAX/VAT AUDIT SUMMARY
  // ---------------------------------------------------------------------------
  const totalCurrentAssets =
    currentCashInDrawer +
    estimatedBankCapital +
    totalInventoryCostValue +
    totalCreditReceivables +
    totalPendingInflow;

  const totalCurrentLiabilities = committedSupplierDebt + totalPendingOutflow;
  const netWorkingCapital = totalCurrentAssets - totalCurrentLiabilities;
  const debtToAssetRatioPct =
    totalCurrentAssets > 0
      ? Number(((totalCurrentLiabilities / totalCurrentAssets) * 100).toFixed(1))
      : 0;

  // Estimate monthly turnover & 18% Sri Lankan VAT provision based on realized POS + collections
  const taxableSalesBasis =
    scopedSales.reduce((s, sale) => s + sale.total, 0) + posCashCollected;
  const estimatedVatLiability = Math.round(taxableSalesBasis * 0.18);
  const drawerVariance = dailyDrawer ? dailyDrawer.actualClosingCash - dailyDrawer.expectedClosingCash : 0;

  return {
    computedAt: new Date().toISOString(),
    engineVersion: 'Mudalali-CalcEngine/2.4.0',
    cashFlow: {
      posCashCollected,
      creditCashCollected,
      instalmentCashCollected,
      clearedCustomerCheques,
      totalActuallyCollected,
      pettyCashExpenses,
      cashConversionRatePct,
      currentCashInDrawer
    },
    liquidityAndAffordability: {
      estimatedBankCapital,
      pendingReceivedPdcsRaw: totalPendingInflow,
      riskAdjustedPdcInflows,
      expectedMonthlyCollections,
      totalLiquidAssets,
      committedSupplierDebt,
      pendingIssuedPdcs: totalPendingOutflow,
      committedLiabilities,
      netSafeCapitalAvailable,
      simulatedPurchaseAmount,
      purchaseDeficit,
      canAffordCash,
      recommendedDownPayment,
      balanceToNegotiatePdc,
      affordabilityVerdict
    },
    debtors: {
      unpaidDebtorsCount: riskAssessments.length,
      totalCreditReceivables,
      overdueInstalmentsCount: overdueInstalmentsList.length,
      totalOverdueInstalments,
      returnedChequesCount: returnedCheques.length,
      returnedChequesValue,
      riskAssessments
    },
    marginsAndInventory: {
      totalInventoryCostValue,
      totalInventoryRetailValue,
      averageGrossMarginPct,
      lowStockSkuCount,
      totalSuggestedReorderCost,
      rankedProducts
    },
    branches: {
      diagnostics,
      underperformingBranch,
      topPerformingBranch
    },
    chequeProjection: {
      maturing7DaysInflow,
      maturing7DaysOutflow,
      net7DayChequeFlow,
      totalPendingInflow,
      totalPendingOutflow,
      returnedExposure: returnedChequesValue
    },
    accountingLedgerSummary: {
      totalCurrentAssets,
      totalCurrentLiabilities,
      netWorkingCapital,
      debtToAssetRatioPct,
      estimatedVatLiability,
      drawerVariance,
      auditStatus: Math.abs(drawerVariance) < 1 ? 'Balanced' : 'Variance Flagged'
    }
  };
}

/**
 * Backend POS Bill Verification & Margin Calculation Algorithm
 */
export function calculatePosBill(params: {
  items: CartItem[];
  discountAmount?: number;
  customerCreditLimit?: number;
  customerCurrentOutstanding?: number;
  paymentMethod?: string;
}) {
  const {
    items = [],
    discountAmount = 0,
    customerCreditLimit = 0,
    customerCurrentOutstanding = 0,
    paymentMethod = 'cash'
  } = params;

  let subtotal = 0;
  let itemDiscounts = 0;
  let totalCostOfGoods = 0;

  const lineBreakdown = items.map(item => {
    const grossLine = item.unitPrice * item.quantity;
    const lineDiscount = item.discount || 0;
    const netLine = Math.max(0, grossLine - lineDiscount);
    const lineCogs = (item.product?.costPrice || 0) * item.quantity;

    subtotal += grossLine;
    itemDiscounts += lineDiscount;
    totalCostOfGoods += lineCogs;

    return {
      productId: item.product.id,
      code: item.product.code,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      netLine,
      lineProfit: netLine - lineCogs
    };
  });

  const totalDiscount = itemDiscounts + Math.max(0, discountAmount);
  const netTotal = Math.max(0, subtotal - totalDiscount);
  const grossProfit = netTotal - totalCostOfGoods;
  const grossMarginPct = netTotal > 0 ? Number(((grossProfit / netTotal) * 100).toFixed(1)) : 0;

  let creditWarning: string | null = null;
  if (paymentMethod === 'credit' && customerCreditLimit > 0) {
    const projectedBalance = customerCurrentOutstanding + netTotal;
    if (projectedBalance > customerCreditLimit) {
      creditWarning = `Projected debt Rs. ${projectedBalance.toLocaleString()} exceeds customer credit limit of Rs. ${customerCreditLimit.toLocaleString()}`;
    }
  }

  return {
    subtotal,
    totalDiscount,
    netTotal,
    totalCostOfGoods,
    grossProfit,
    grossMarginPct,
    estimatedVatIncluded18Pct: Math.round((netTotal * 18) / 118),
    creditWarning,
    lineBreakdown
  };
}

/**
 * Backend Wara Potha (Hire Purchase) Amortization & Schedule Generator Algorithm
 */
export function calculateHirePurchaseSchedule(params: {
  cashPrice: number;
  downPayment: number;
  periodMonths: number;
  monthlyInterestRatePct?: number;
  startDate?: string;
}) {
  const cashPrice = Math.max(0, Number(params.cashPrice) || 0);
  const downPayment = Math.max(0, Number(params.downPayment) || 0);
  const periodMonths = Math.max(1, Math.min(60, Number(params.periodMonths) || 6));
  const monthlyRate = (Number(params.monthlyInterestRatePct ?? 2.5) || 2.5) / 100;
  const startDateObj = params.startDate ? new Date(params.startDate) : new Date();

  const principalFinanced = Math.max(0, cashPrice - downPayment);
  const totalInterestCharge = Math.round(principalFinanced * monthlyRate * periodMonths);
  const totalHireBalance = principalFinanced + totalInterestCharge;
  const monthlyAmount = Math.ceil(totalHireBalance / periodMonths / 50) * 50; // Round neatly to nearest Rs. 50
  const totalHirePrice = downPayment + monthlyAmount * periodMonths;
  const effectiveAnnualRatePct = Number((monthlyRate * 12 * 100).toFixed(1));

  const schedules = Array.from({ length: periodMonths }, (_, idx) => {
    const due = new Date(startDateObj);
    due.setMonth(startDateObj.getMonth() + idx + 1);
    return {
      instalmentNumber: idx + 1,
      dueDate: due.toISOString().split('T')[0],
      amount: monthlyAmount,
      paidAmount: 0,
      status: 'pending' as const
    };
  });

  return {
    cashPrice,
    downPayment,
    principalFinanced,
    totalInterestCharge,
    monthlyAmount,
    totalHirePrice,
    effectiveAnnualRatePct,
    schedules
  };
}
