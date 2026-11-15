export type BranchId = 'pettah' | 'kandy' | 'negombo' | 'galle';

export interface Branch {
  id: BranchId;
  name: string;
  sinhalaName: string;
  address: string;
  phone: string;
  manager: string;
}

export type PaymentMethod = 'cash' | 'card' | 'lankapay_qr' | 'credit' | 'cheque';

export interface Product {
  id: string;
  code: string;
  name: string;
  sinhalaName?: string;
  category: 'Electronics & Appliances' | 'Hardware & Electrical' | 'Groceries & Provisions' | 'Textiles & Garments' | 'Automotive & Spares';
  costPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  unit: 'pcs' | 'kg' | 'm' | 'pkt' | 'box';
  stocks: Record<BranchId, number>; // Branch level stock
  minStockLevel: number;
  imageUrl?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  unitPrice: number;
  discount: number;
}

export interface SaleItem {
  productId: string;
  productName: string;
  productCode: string;
  quantity: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Sale {
  id: string;
  invoiceNo: string;
  branchId: BranchId;
  timestamp: string;
  customerName?: string;
  customerPhone?: string;
  items: SaleItem[];
  subtotal: number;
  discountTotal: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentDetails?: {
    cashTendered?: number;
    changeGiven?: number;
    chequeNumber?: string;
    chequeBank?: string;
    creditCustomerId?: string;
    lankaPayRef?: string;
  };
  cashierName: string;
  isCreditSale?: boolean;
}

export interface CreditCustomer {
  id: string;
  name: string;
  sinhalaName?: string;
  phone: string;
  nicNumber: string;
  address: string;
  branchId: BranchId;
  creditLimit: number;
  totalOutstanding: number;
  creditScoreTrust: 'High' | 'Medium' | 'Watchlist';
  createdAt: string;
  lastPaymentDate?: string;
  transactions: CreditTransaction[];
}

export interface CreditTransaction {
  id: string;
  date: string;
  type: 'sale' | 'payment';
  amount: number;
  referenceNo: string; // Invoice No or Receipt No
  note?: string;
  balanceAfter: number;
}

export interface InstalmentSchedule {
  instalmentNumber: number;
  dueDate: string;
  amount: number;
  paidAmount: number;
  paidDate?: string;
  status: 'paid' | 'pending' | 'overdue';
  receiptNo?: string;
}

export interface InstalmentPlan {
  id: string;
  contractNo: string;
  customerName: string;
  customerPhone: string;
  customerNic: string;
  guarantorName: string;
  guarantorPhone: string;
  guarantorNic: string;
  branchId: BranchId;
  itemDescription: string;
  productCode?: string;
  cashPrice: number;
  downPayment: number;
  totalHirePrice: number;
  monthlyAmount: number;
  periodMonths: number;
  startDate: string;
  collectorName: string;
  schedules: InstalmentSchedule[];
  status: 'active' | 'completed' | 'defaulted';
}

export type SriLankanBank =
  | 'Commercial Bank of Ceylon'
  | 'Bank of Ceylon (BOC)'
  | "People's Bank"
  | 'Sampath Bank'
  | 'Hatton National Bank (HNB)'
  | 'Seylan Bank'
  | 'Nations Trust Bank (NTB)'
  | 'DFCC Bank'
  | 'Union Bank';

export interface Cheque {
  id: string;
  chequeNumber: string;
  bank: SriLankanBank;
  branchName: string;
  amount: number;
  type: 'received' | 'issued';
  partyName: string; // Customer or Supplier
  partyPhone?: string;
  receivedOrIssuedDate: string;
  maturityDate: string; // PDC due date
  status: 'pending' | 'deposited' | 'cleared' | 'returned';
  depositAccount?: string;
  notes?: string;
  branchId: BranchId;
}

export interface StockTransfer {
  id: string;
  transferNo: string;
  fromBranch: BranchId;
  toBranch: BranchId;
  items: {
    productId: string;
    productName: string;
    productCode: string;
    quantity: number;
  }[];
  requestDate: string;
  status: 'in-transit' | 'received' | 'cancelled';
  dispatchedBy: string;
  receivedBy?: string;
  notes?: string;
}

export interface DailyExpense {
  id: string;
  branchId: BranchId;
  category: 'Staff Meals & Tea (කඩේ තේ/කෑම)' | 'Transport & 3-Wheel (ප්‍රවාහන)' | 'Utilities & Bills' | 'Packaging & Bags' | 'Casual Wages' | 'Other Sundry';
  amount: number;
  description: string;
  timestamp: string;
  paidBy: string;
}

export interface DailyDrawer {
  branchId: BranchId;
  date: string;
  openingCash: number;
  totalCashSales: number;
  totalCreditCollections: number;
  totalInstalmentCollections: number;
  totalCashExpenses: number;
  expectedClosingCash: number;
  actualClosingCash: number;
  discrepancy: number;
  isClosed: boolean;
  closedAt?: string;
  closedBy?: string;
}

export interface PurchaseOrderItem {
  productId?: string;
  productName: string;
  quantity: number;
  unitCost: number;
  total: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  supplierId: string;
  supplierName: string;
  date: string;
  dueDate: string; // payment deadline
  items: PurchaseOrderItem[];
  totalAmount: number;
  paidAmount: number;
  status: 'received' | 'partial_paid' | 'paid' | 'overdue';
  branchId: BranchId;
  notes?: string;
}

export interface SupplierPayment {
  id: string;
  supplierId: string;
  date: string;
  amount: number;
  paymentMethod: 'cash' | 'cheque' | 'bank_transfer';
  referenceNo: string; // Cheque number or CEFT ref
  chequeNumber?: string;
  bankName?: string;
  note?: string;
}

export interface Supplier {
  id: string;
  companyName: string;
  sinhalaName?: string;
  contactPerson: string;
  phone: string;
  email?: string;
  address: string;
  category: 'Appliances & Electronics' | 'Cables & Hardware' | 'Provisions & Groceries' | 'Textiles & Garments' | 'Automotive Parts';
  bankName: SriLankanBank;
  bankAccountNo: string;
  bankBranch: string;
  totalPurchases: number;
  totalOutstanding: number;
  creditTermsDays: number; // e.g. 14, 30, 45 days
  orders: PurchaseOrder[];
  payments: SupplierPayment[];
}

export type ActiveTab =
  | 'dashboard'
  | 'pos'
  | 'naya'
  | 'wara'
  | 'inventory'
  | 'suppliers'
  | 'cheques'
  | 'transfers'
  | 'drawer'
  | 'advisor';

export type Language = 'en' | 'si' | 'ta';

export type ThemeMode = 'light' | 'dark';

export type UserRole = 'accountant' | 'mudalali';

export interface UserProfile {
  id: string;
  role: UserRole;
  displayName: string;
  sinhalaTitle: string;
  tamilTitle: string;
  subtitle: string;
  sinhalaSubtitle: string;
  tamilSubtitle: string;
  accessScope: string[];
  permissions: {
    canViewExecutiveAnalytics: boolean;
    canApproveCreditOverrides: boolean;
    canEditAccountingAudits: boolean;
    canCloseDrawer: boolean;
    canResetSystemData: boolean;
    canManageSuppliers: boolean;
  };
}

export interface DebtorRiskAssessment {
  customerId: string;
  name: string;
  phone: string;
  nicNumber: string;
  branchId: BranchId;
  totalOutstanding: number;
  creditLimit: number;
  utilizationPct: number;
  daysSinceLastPayment: number;
  returnedChequesCount: number;
  riskScore: number; // 0-100
  riskTier: 'Low' | 'Elevated' | 'Critical';
  recommendedAction: string;
}

export interface ProductMarginMetric {
  id: string;
  code: string;
  name: string;
  category: string;
  costPrice: number;
  wholesalePrice: number;
  retailPrice: number;
  unit: string;
  retailProfit: number;
  retailMarginPct: number;
  wholesaleProfit: number;
  wholesaleMarginPct: number;
  totalUnits: number;
  stockValueCost: number;
  potentialProfit: number;
  suggestedReorderUnits: number;
  estimatedReorderCost: number;
}

export interface BranchDiagnostic {
  branchId: BranchId;
  branchName: string;
  address: string;
  manager: string;
  stockCount: number;
  inventoryValueCost: number;
  lowStockCount: number;
  outOfStockCount: number;
  creditTotal: number;
  activePlans: number;
  overduePlans: number;
  overdueInstalmentAmount: number;
  returnedChequesCount: number;
  salesCount: number;
  salesRevenue: number;
  riskScore: number;
  healthScore: number; // 0-100
  primaryDrivers: string[];
}

export interface BackendAnalyticsReport {
  computedAt: string;
  engineVersion: string;
  cashFlow: {
    posCashCollected: number;
    creditCashCollected: number;
    instalmentCashCollected: number;
    clearedCustomerCheques: number;
    totalActuallyCollected: number;
    pettyCashExpenses: number;
    cashConversionRatePct: number;
    currentCashInDrawer: number;
  };
  liquidityAndAffordability: {
    estimatedBankCapital: number;
    pendingReceivedPdcsRaw: number;
    riskAdjustedPdcInflows: number;
    expectedMonthlyCollections: number;
    totalLiquidAssets: number;
    committedSupplierDebt: number;
    pendingIssuedPdcs: number;
    committedLiabilities: number;
    netSafeCapitalAvailable: number;
    simulatedPurchaseAmount: number;
    purchaseDeficit: number;
    canAffordCash: boolean;
    recommendedDownPayment: number;
    balanceToNegotiatePdc: number;
    affordabilityVerdict: string;
  };
  debtors: {
    unpaidDebtorsCount: number;
    totalCreditReceivables: number;
    overdueInstalmentsCount: number;
    totalOverdueInstalments: number;
    returnedChequesCount: number;
    returnedChequesValue: number;
    riskAssessments: DebtorRiskAssessment[];
  };
  marginsAndInventory: {
    totalInventoryCostValue: number;
    totalInventoryRetailValue: number;
    averageGrossMarginPct: number;
    lowStockSkuCount: number;
    totalSuggestedReorderCost: number;
    rankedProducts: ProductMarginMetric[];
  };
  branches: {
    diagnostics: BranchDiagnostic[];
    underperformingBranch: BranchDiagnostic | null;
    topPerformingBranch: BranchDiagnostic | null;
  };
  chequeProjection: {
    maturing7DaysInflow: number;
    maturing7DaysOutflow: number;
    net7DayChequeFlow: number;
    totalPendingInflow: number;
    totalPendingOutflow: number;
    returnedExposure: number;
  };
  accountingLedgerSummary: {
    totalCurrentAssets: number;
    totalCurrentLiabilities: number;
    netWorkingCapital: number;
    debtToAssetRatioPct: number;
    estimatedVatLiability: number;
    drawerVariance: number;
    auditStatus: 'Balanced' | 'Variance Flagged';
  };
}

