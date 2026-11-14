import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import {
  Branch,
  BranchId,
  Product,
  CreditCustomer,
  InstalmentPlan,
  Cheque,
  Sale,
  StockTransfer,
  DailyExpense,
  DailyDrawer,
  Language,
  ThemeMode,
  ActiveTab,
  Supplier,
  PurchaseOrder,
  PurchaseOrderItem,
  SupplierPayment
} from '../types';
import {
  INITIAL_BRANCHES,
  INITIAL_PRODUCTS,
  INITIAL_CREDIT_CUSTOMERS,
  INITIAL_INSTALMENT_PLANS,
  INITIAL_CHEQUES,
  INITIAL_DAILY_EXPENSES,
  INITIAL_SUPPLIERS
} from '../data/mockInitialData';

interface AppContextType {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  theme: ThemeMode;
  setTheme: (theme: ThemeMode) => void;
  toggleTheme: () => void;
  currentBranchId: 'all' | BranchId;
  setCurrentBranchId: (id: 'all' | BranchId) => void;
  branches: Branch[];
  products: Product[];
  creditCustomers: CreditCustomer[];
  instalmentPlans: InstalmentPlan[];
  cheques: Cheque[];
  sales: Sale[];
  stockTransfers: StockTransfer[];
  dailyExpenses: DailyExpense[];
  dailyDrawer: DailyDrawer;
  suppliers: Supplier[];
  
  // Actions
  recordSale: (sale: Omit<Sale, 'id' | 'invoiceNo' | 'timestamp'>) => Sale;
  recordCreditPayment: (customerId: string, amount: number, note?: string) => void;
  addCreditCustomer: (customer: Omit<CreditCustomer, 'id' | 'createdAt' | 'transactions' | 'totalOutstanding'>) => void;
  recordInstalmentPayment: (planId: string, scheduleIndex: number, amount: number, collector: string) => void;
  addInstalmentPlan: (plan: Omit<InstalmentPlan, 'id' | 'contractNo' | 'status' | 'schedules'>) => void;
  updateProductStock: (productId: string, branchId: BranchId, newQuantity: number) => void;
  updateProductMinStock: (productId: string, newMinLevel: number) => void;
  addProduct: (product: Omit<Product, 'id'>) => void;
  initiateStockTransfer: (fromBranch: BranchId, toBranch: BranchId, items: { productId: string; quantity: number }[], notes?: string) => void;
  completeStockTransfer: (transferId: string, receivedBy: string) => void;
  addCheque: (cheque: Omit<Cheque, 'id'>) => void;
  updateChequeStatus: (chequeId: string, status: Cheque['status'], account?: string) => void;
  addDailyExpense: (expense: Omit<DailyExpense, 'id' | 'timestamp'>) => void;
  closeDailyDrawer: (actualCash: number, closedBy: string) => void;
  reopenDailyDrawer: () => void;
  addSupplier: (supplier: Omit<Supplier, 'id' | 'totalPurchases' | 'totalOutstanding' | 'orders' | 'payments'>) => void;
  createPurchaseOrder: (po: {
    supplierId: string;
    branchId: BranchId;
    items: PurchaseOrderItem[];
    dueDate: string;
    notes?: string;
    addToStockImmediately?: boolean;
  }) => void;
  recordSupplierPayment: (
    supplierId: string,
    payment: {
      amount: number;
      paymentMethod: 'cash' | 'cheque' | 'bank_transfer';
      referenceNo: string;
      chequeNumber?: string;
      bankName?: string;
      note?: string;
      poId?: string;
    }
  ) => void;
  resetAllData: () => void;

  // View Modal state for instant receipts & previews
  activeReceipt: Sale | null;
  setActiveReceipt: (sale: Sale | null) => void;
  isDailyDrawerOpen: boolean;
  setIsDailyDrawerOpen: (open: boolean) => void;
  isTransferModalOpen: boolean;
  setIsTransferModalOpen: (open: boolean) => void;
  isAssistantModalOpen: boolean;
  setIsAssistantModalOpen: (open: boolean) => void;
  toast: { message: string; type: 'success' | 'error' | 'info' } | null;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
  showBootScreen: boolean;
  setShowBootScreen: (show: boolean) => void;
  completeBoot: (lang: Language) => void;
  triggerBootScreen: () => void;
}

const STORAGE_KEY = 'mudalali_sme_os_v1';

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [language, setLanguageState] = useState<Language>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_lang`);
    return (saved === 'si' || saved === 'ta' || saved === 'en') ? (saved as Language) : 'en';
  });
  const [showBootScreen, setShowBootScreen] = useState<boolean>(true);

  const [theme, setThemeState] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_theme`);
    if (saved === 'light' || saved === 'dark') return saved as ThemeMode;
    if (typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark';
    }
    return 'dark';
  });

  const setTheme = (mode: ThemeMode) => {
    setThemeState(mode);
    localStorage.setItem(`${STORAGE_KEY}_theme`, mode);
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.remove('dark');
      root.classList.add('light');
    }
  }, [theme]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem(`${STORAGE_KEY}_lang`, lang);
  };

  const completeBoot = (lang: Language) => {
    setLanguage(lang);
    setShowBootScreen(false);
  };

  const triggerBootScreen = () => {
    setShowBootScreen(true);
  };

  const [currentBranchId, setCurrentBranchId] = useState<'all' | BranchId>('pettah');

  const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_products`);
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [creditCustomers, setCreditCustomers] = useState<CreditCustomer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_credit_cust`);
    return saved ? JSON.parse(saved) : INITIAL_CREDIT_CUSTOMERS;
  });
  const [instalmentPlans, setInstalmentPlans] = useState<InstalmentPlan[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_instalment_plans`);
    return saved ? JSON.parse(saved) : INITIAL_INSTALMENT_PLANS;
  });
  const [cheques, setCheques] = useState<Cheque[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_cheques`);
    return saved ? JSON.parse(saved) : INITIAL_CHEQUES;
  });
  const [dailyExpenses, setDailyExpenses] = useState<DailyExpense[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_expenses`);
    return saved ? JSON.parse(saved) : INITIAL_DAILY_EXPENSES;
  });
  const [sales, setSales] = useState<Sale[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_sales`);
    return saved ? JSON.parse(saved) : [];
  });
  const [stockTransfers, setStockTransfers] = useState<StockTransfer[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_transfers`);
    return saved ? JSON.parse(saved) : [
      {
        id: 'tr-01',
        transferNo: 'TR-2026-0012',
        fromBranch: 'pettah',
        toBranch: 'kandy',
        items: [
          { productId: 'prod-2', productName: 'Innovex 43" Smart Android FHD LED TV', productCode: 'ELEC-TV-43', quantity: 4 }
        ],
        requestDate: '2026-11-06 09:30 AM',
        status: 'in-transit',
        dispatchedBy: 'M. M. Farook',
        notes: 'Dispatched via Fort Colombo train cargo'
      }
    ];
  });
  const [suppliers, setSuppliers] = useState<Supplier[]>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_suppliers`);
    return saved ? JSON.parse(saved) : INITIAL_SUPPLIERS;
  });

  // Daily Drawer state
  const [dailyDrawer, setDailyDrawer] = useState<DailyDrawer>(() => {
    const saved = localStorage.getItem(`${STORAGE_KEY}_drawer`);
    return saved ? JSON.parse(saved) : {
      branchId: 'pettah',
      date: '2026-11-07',
      openingCash: 50000,
      totalCashSales: 48500,
      totalCreditCollections: 35000,
      totalInstalmentCollections: 23000,
      totalCashExpenses: 3050,
      expectedClosingCash: 153450,
      actualClosingCash: 153450,
      discrepancy: 0,
      isClosed: false
    };
  });

  // Modal controls
  const [activeReceipt, setActiveReceipt] = useState<Sale | null>(null);
  const [isDailyDrawerOpen, setIsDailyDrawerOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isAssistantModalOpen, setIsAssistantModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Sync to LocalStorage
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_products`, JSON.stringify(products));
  }, [products]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_credit_cust`, JSON.stringify(creditCustomers));
  }, [creditCustomers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_instalment_plans`, JSON.stringify(instalmentPlans));
  }, [instalmentPlans]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_cheques`, JSON.stringify(cheques));
  }, [cheques]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_expenses`, JSON.stringify(dailyExpenses));
  }, [dailyExpenses]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_sales`, JSON.stringify(sales));
  }, [sales]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_transfers`, JSON.stringify(stockTransfers));
  }, [stockTransfers]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_drawer`, JSON.stringify(dailyDrawer));
  }, [dailyDrawer]);
  useEffect(() => {
    localStorage.setItem(`${STORAGE_KEY}_suppliers`, JSON.stringify(suppliers));
  }, [suppliers]);

  // Action: Record Sale (POS)
  const recordSale = (saleData: Omit<Sale, 'id' | 'invoiceNo' | 'timestamp'>): Sale => {
    const invoiceNumber = `INV-${Date.now().toString().slice(-6)}`;
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newSale: Sale = {
      ...saleData,
      id: `sale-${Date.now()}`,
      invoiceNo: invoiceNumber,
      timestamp
    };

    // 1. Deduct stock from selected branch
    setProducts(prevProducts =>
      prevProducts.map(prod => {
        const itemInSale = saleData.items.find(i => i.productId === prod.id);
        if (itemInSale) {
          const currentBranchStock = prod.stocks[saleData.branchId] || 0;
          return {
            ...prod,
            stocks: {
              ...prod.stocks,
              [saleData.branchId]: Math.max(0, currentBranchStock - itemInSale.quantity)
            }
          };
        }
        return prod;
      })
    );

    // 2. If Credit sale, update customer ledger (Naya Potha)
    if (saleData.paymentMethod === 'credit' && saleData.paymentDetails?.creditCustomerId) {
      setCreditCustomers(prev =>
        prev.map(c => {
          if (c.id === saleData.paymentDetails?.creditCustomerId) {
            const updatedOutstanding = c.totalOutstanding + saleData.total;
            return {
              ...c,
              totalOutstanding: updatedOutstanding,
              transactions: [
                {
                  id: `tx-${Date.now()}`,
                  date: new Date().toISOString().split('T')[0],
                  type: 'sale',
                  amount: saleData.total,
                  referenceNo: invoiceNumber,
                  note: `Invoice sale (${saleData.items.length} items)`,
                  balanceAfter: updatedOutstanding
                },
                ...c.transactions
              ]
            };
          }
          return c;
        })
      );
    }

    // 3. If Cheque sale, add to cheques register
    if (saleData.paymentMethod === 'cheque' && saleData.paymentDetails?.chequeNumber) {
      const newCheque: Cheque = {
        id: `chq-${Date.now()}`,
        chequeNumber: saleData.paymentDetails.chequeNumber,
        bank: (saleData.paymentDetails.chequeBank as any) || 'Commercial Bank of Ceylon',
        branchName: 'Local Branch',
        amount: saleData.total,
        type: 'received',
        partyName: saleData.customerName || 'Walk-in Customer',
        partyPhone: saleData.customerPhone,
        receivedOrIssuedDate: new Date().toISOString().split('T')[0],
        maturityDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        notes: `Received for invoice ${invoiceNumber}`,
        branchId: saleData.branchId
      };
      setCheques(prev => [newCheque, ...prev]);
    }

    // 4. Update Daily Drawer if cash sale
    if (saleData.paymentMethod === 'cash') {
      setDailyDrawer(prev => ({
        ...prev,
        totalCashSales: prev.totalCashSales + saleData.total,
        expectedClosingCash: prev.expectedClosingCash + saleData.total
      }));
    }

    setSales(prev => [newSale, ...prev]);
    setActiveReceipt(newSale);
    return newSale;
  };

  // Action: Record Credit Payment (Naya Potha)
  const recordCreditPayment = (customerId: string, amount: number, note?: string) => {
    const recNo = `REC-${Date.now().toString().slice(-5)}`;
    setCreditCustomers(prev =>
      prev.map(c => {
        if (c.id === customerId) {
          const newBalance = Math.max(0, c.totalOutstanding - amount);
          return {
            ...c,
            totalOutstanding: newBalance,
            lastPaymentDate: new Date().toISOString().split('T')[0],
            transactions: [
              {
                id: `tx-${Date.now()}`,
                date: new Date().toISOString().split('T')[0],
                type: 'payment',
                amount,
                referenceNo: recNo,
                note: note || 'Cash settlement received',
                balanceAfter: newBalance
              },
              ...c.transactions
            ]
          };
        }
        return c;
      })
    );

    // Update Drawer cash
    setDailyDrawer(prev => ({
      ...prev,
      totalCreditCollections: prev.totalCreditCollections + amount,
      expectedClosingCash: prev.expectedClosingCash + amount
    }));
  };

  // Action: Add new debtor to Credit Book
  const addCreditCustomer = (customer: Omit<CreditCustomer, 'id' | 'createdAt' | 'transactions' | 'totalOutstanding'>) => {
    const newCust: CreditCustomer = {
      ...customer,
      id: `cust-${Date.now()}`,
      createdAt: new Date().toISOString().split('T')[0],
      totalOutstanding: 0,
      transactions: []
    };
    setCreditCustomers(prev => [newCust, ...prev]);
  };

  // Action: Record instalment payment (Wara Potha)
  const recordInstalmentPayment = (planId: string, scheduleIndex: number, amount: number, collector: string) => {
    const receiptNo = `WR-${Date.now().toString().slice(-4)}`;
    setInstalmentPlans(prev =>
      prev.map(plan => {
        if (plan.id === planId) {
          const newSchedules = [...plan.schedules];
          if (newSchedules[scheduleIndex]) {
            newSchedules[scheduleIndex] = {
              ...newSchedules[scheduleIndex],
              paidAmount: amount,
              paidDate: new Date().toISOString().split('T')[0],
              status: 'paid',
              receiptNo
            };
          }
          const allPaid = newSchedules.every(s => s.status === 'paid');
          return {
            ...plan,
            status: allPaid ? 'completed' : 'active',
            schedules: newSchedules
          };
        }
        return plan;
      })
    );

    setDailyDrawer(prev => ({
      ...prev,
      totalInstalmentCollections: prev.totalInstalmentCollections + amount,
      expectedClosingCash: prev.expectedClosingCash + amount
    }));
  };

  // Action: Add new instalment plan (Hire purchase)
  const addInstalmentPlan = (plan: Omit<InstalmentPlan, 'id' | 'contractNo' | 'status' | 'schedules'>) => {
    const contractNo = `WARA-${plan.branchId.toUpperCase().slice(0, 2)}-${Date.now().toString().slice(-4)}`;
    const schedules: InstalmentPlan['schedules'] = [];
    const startDateObj = new Date(plan.startDate);

    for (let i = 1; i <= plan.periodMonths; i++) {
      const dueDate = new Date(startDateObj);
      dueDate.setMonth(startDateObj.getMonth() + i);
      schedules.push({
        instalmentNumber: i,
        dueDate: dueDate.toISOString().split('T')[0],
        amount: plan.monthlyAmount,
        paidAmount: 0,
        status: 'pending'
      });
    }

    const newPlan: InstalmentPlan = {
      ...plan,
      id: `hp-${Date.now()}`,
      contractNo,
      status: 'active',
      schedules
    };

    setInstalmentPlans(prev => [newPlan, ...prev]);

    // Down payment is collected in cash into daily drawer
    if (plan.downPayment > 0) {
      setDailyDrawer(prev => ({
        ...prev,
        totalInstalmentCollections: prev.totalInstalmentCollections + plan.downPayment,
        expectedClosingCash: prev.expectedClosingCash + plan.downPayment
      }));
    }
  };

  // Action: Update product stock
  const updateProductStock = (productId: string, branchId: BranchId, newQuantity: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            stocks: {
              ...p.stocks,
              [branchId]: Math.max(0, newQuantity)
            }
          };
        }
        return p;
      })
    );
  };

  // Action: Update product minimum stock threshold
  const updateProductMinStock = (productId: string, newMinLevel: number) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === productId) {
          return {
            ...p,
            minStockLevel: Math.max(1, newMinLevel)
          };
        }
        return p;
      })
    );
  };

  // Action: Add Product
  const addProduct = (product: Omit<Product, 'id'>) => {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`
    };
    setProducts(prev => [newProduct, ...prev]);
  };

  // Action: Inter-branch Stock Transfer
  const initiateStockTransfer = (fromBranch: BranchId, toBranch: BranchId, transferItems: { productId: string; quantity: number }[], notes?: string) => {
    const transferNo = `TR-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const now = new Date();
    const requestDate = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    // Deduct stock immediately from source branch
    setProducts(prev =>
      prev.map(p => {
        const itemToTransfer = transferItems.find(i => i.productId === p.id);
        if (itemToTransfer) {
          const current = p.stocks[fromBranch] || 0;
          return {
            ...p,
            stocks: {
              ...p.stocks,
              [fromBranch]: Math.max(0, current - itemToTransfer.quantity)
            }
          };
        }
        return p;
      })
    );

    const fullItems = transferItems.map(ti => {
      const p = products.find(prod => prod.id === ti.productId);
      return {
        productId: ti.productId,
        productName: p ? p.name : 'Item',
        productCode: p ? p.code : 'CODE',
        quantity: ti.quantity
      };
    });

    const newTransfer: StockTransfer = {
      id: `tr-${Date.now()}`,
      transferNo,
      fromBranch,
      toBranch,
      items: fullItems,
      requestDate,
      status: 'in-transit',
      dispatchedBy: 'Store Manager',
      notes
    };

    setStockTransfers(prev => [newTransfer, ...prev]);
  };

  // Action: Complete stock transfer
  const completeStockTransfer = (transferId: string, receivedBy: string) => {
    const tr = stockTransfers.find(t => t.id === transferId);
    if (!tr || tr.status !== 'in-transit') return;

    // Add items to target branch
    setProducts(prev =>
      prev.map(p => {
        const itemTransferred = tr.items.find(i => i.productId === p.id);
        if (itemTransferred) {
          const current = p.stocks[tr.toBranch] || 0;
          return {
            ...p,
            stocks: {
              ...p.stocks,
              [tr.toBranch]: current + itemTransferred.quantity
            }
          };
        }
        return p;
      })
    );

    setStockTransfers(prev =>
      prev.map(t => (t.id === transferId ? { ...t, status: 'received', receivedBy } : t))
    );
  };

  // Action: Cheques
  const addCheque = (cheque: Omit<Cheque, 'id'>) => {
    const newCheque: Cheque = {
      ...cheque,
      id: `chq-${Date.now()}`
    };
    setCheques(prev => [newCheque, ...prev]);
  };

  const updateChequeStatus = (chequeId: string, status: Cheque['status'], account?: string) => {
    setCheques(prev =>
      prev.map(chq => {
        if (chq.id === chequeId) {
          return {
            ...chq,
            status,
            depositAccount: account || chq.depositAccount
          };
        }
        return chq;
      })
    );
  };

  // Action: Daily Expenses
  const addDailyExpense = (expense: Omit<DailyExpense, 'id' | 'timestamp'>) => {
    const now = new Date();
    const timestamp = now.toLocaleDateString('en-GB') + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newExpense: DailyExpense = {
      ...expense,
      id: `exp-${Date.now()}`,
      timestamp
    };
    setDailyExpenses(prev => [newExpense, ...prev]);

    // Deduct cash from drawer
    setDailyDrawer(prev => ({
      ...prev,
      totalCashExpenses: prev.totalCashExpenses + expense.amount,
      expectedClosingCash: prev.expectedClosingCash - expense.amount
    }));
  };

  const closeDailyDrawer = (actualCash: number, closedBy: string) => {
    const discrepancy = actualCash - dailyDrawer.expectedClosingCash;
    setDailyDrawer(prev => ({
      ...prev,
      actualClosingCash: actualCash,
      discrepancy,
      isClosed: true,
      closedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      closedBy
    }));
  };

  const reopenDailyDrawer = () => {
    setDailyDrawer(prev => ({
      ...prev,
      isClosed: false,
      closedAt: undefined,
      closedBy: undefined
    }));
  };

  // Action: Supplier Management
  const addSupplier = (suppData: Omit<Supplier, 'id' | 'totalPurchases' | 'totalOutstanding' | 'orders' | 'payments'>) => {
    const newSupp: Supplier = {
      ...suppData,
      id: `supp-${Date.now()}`,
      totalPurchases: 0,
      totalOutstanding: 0,
      orders: [],
      payments: []
    };
    setSuppliers(prev => [newSupp, ...prev]);
    showToast(`Supplier ${suppData.companyName} added successfully!`, 'success');
  };

  const createPurchaseOrder = (poData: {
    supplierId: string;
    branchId: BranchId;
    items: PurchaseOrderItem[];
    dueDate: string;
    notes?: string;
    addToStockImmediately?: boolean;
  }) => {
    const poTotal = poData.items.reduce((sum, item) => sum + item.total, 0);
    const poNumber = `PO-${new Date().getFullYear()}-${Date.now().toString().slice(-4)}`;
    const today = new Date().toISOString().split('T')[0];

    const targetSupplier = suppliers.find(s => s.id === poData.supplierId);
    const supplierName = targetSupplier ? targetSupplier.companyName : 'Supplier';

    const newPO: PurchaseOrder = {
      id: `po-${Date.now()}`,
      poNumber,
      supplierId: poData.supplierId,
      supplierName,
      date: today,
      dueDate: poData.dueDate,
      items: poData.items,
      totalAmount: poTotal,
      paidAmount: 0,
      status: 'received',
      branchId: poData.branchId,
      notes: poData.notes
    };

    // Update supplier records
    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === poData.supplierId) {
          return {
            ...s,
            totalPurchases: s.totalPurchases + poTotal,
            totalOutstanding: s.totalOutstanding + poTotal,
            orders: [newPO, ...s.orders]
          };
        }
        return s;
      })
    );

    // Optionally increase inventory stocks in products
    if (poData.addToStockImmediately) {
      setProducts(prevProducts =>
        prevProducts.map(prod => {
          const itemInPO = poData.items.find(
            i => i.productId === prod.id || i.productName.toLowerCase().trim() === prod.name.toLowerCase().trim()
          );
          if (itemInPO) {
            const currentStock = prod.stocks[poData.branchId] || 0;
            return {
              ...prod,
              stocks: {
                ...prod.stocks,
                [poData.branchId]: currentStock + itemInPO.quantity
              }
            };
          }
          return prod;
        })
      );
    }

    showToast(`Purchase order ${poNumber} for Rs. ${poTotal.toLocaleString()} created!`, 'success');
  };

  const recordSupplierPayment = (
    supplierId: string,
    payment: {
      amount: number;
      paymentMethod: 'cash' | 'cheque' | 'bank_transfer';
      referenceNo: string;
      chequeNumber?: string;
      bankName?: string;
      note?: string;
      poId?: string;
    }
  ) => {
    const today = new Date().toISOString().split('T')[0];
    const newPayment: SupplierPayment = {
      id: `spay-${Date.now()}`,
      supplierId,
      date: today,
      amount: payment.amount,
      paymentMethod: payment.paymentMethod,
      referenceNo: payment.referenceNo,
      chequeNumber: payment.chequeNumber,
      bankName: payment.bankName,
      note: payment.note
    };

    setSuppliers(prev =>
      prev.map(s => {
        if (s.id === supplierId) {
          const newOutstanding = Math.max(0, s.totalOutstanding - payment.amount);
          let remainingToAllocate = payment.amount;
          const updatedOrders = s.orders.map(order => {
            if (payment.poId && order.id === payment.poId) {
              const updatedPaid = Math.min(order.totalAmount, order.paidAmount + payment.amount);
              return {
                ...order,
                paidAmount: updatedPaid,
                status: updatedPaid >= order.totalAmount ? ('paid' as const) : ('partial_paid' as const)
              };
            } else if (!payment.poId && remainingToAllocate > 0 && order.paidAmount < order.totalAmount) {
              const unpaid = order.totalAmount - order.paidAmount;
              const payThis = Math.min(remainingToAllocate, unpaid);
              remainingToAllocate -= payThis;
              const newPaid = order.paidAmount + payThis;
              return {
                ...order,
                paidAmount: newPaid,
                status: newPaid >= order.totalAmount ? ('paid' as const) : ('partial_paid' as const)
              };
            }
            return order;
          });

          return {
            ...s,
            totalOutstanding: newOutstanding,
            payments: [newPayment, ...s.payments],
            orders: updatedOrders
          };
        }
        return s;
      })
    );

    // If payment method is 'cash', deduct from daily drawer
    if (payment.paymentMethod === 'cash') {
      setDailyDrawer(prev => ({
        ...prev,
        totalCashExpenses: prev.totalCashExpenses + payment.amount,
        expectedClosingCash: prev.expectedClosingCash - payment.amount
      }));
    }

    // If payment method is 'cheque', record in Cheques register as issued cheque
    if (payment.paymentMethod === 'cheque' && payment.chequeNumber) {
      const supp = suppliers.find(s => s.id === supplierId);
      const newCheque: Cheque = {
        id: `chq-${Date.now()}`,
        chequeNumber: payment.chequeNumber,
        bank: (payment.bankName as any) || 'Commercial Bank of Ceylon',
        branchName: 'City Office',
        amount: payment.amount,
        type: 'issued',
        partyName: supp ? `${supp.companyName} (Supplier)` : 'Supplier',
        partyPhone: supp?.phone,
        receivedOrIssuedDate: today,
        maturityDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'pending',
        notes: payment.note || `Issued payment to ${supp?.companyName || 'Supplier'}`,
        branchId: 'pettah'
      };
      setCheques(prev => [newCheque, ...prev]);
    }

    showToast(`Supplier payment of Rs. ${payment.amount.toLocaleString()} recorded!`, 'success');
  };

  const resetAllData = () => {
    localStorage.removeItem(`${STORAGE_KEY}_products`);
    localStorage.removeItem(`${STORAGE_KEY}_credit_cust`);
    localStorage.removeItem(`${STORAGE_KEY}_instalment_plans`);
    localStorage.removeItem(`${STORAGE_KEY}_cheques`);
    localStorage.removeItem(`${STORAGE_KEY}_expenses`);
    localStorage.removeItem(`${STORAGE_KEY}_sales`);
    localStorage.removeItem(`${STORAGE_KEY}_transfers`);
    localStorage.removeItem(`${STORAGE_KEY}_drawer`);
    localStorage.removeItem(`${STORAGE_KEY}_suppliers`);
    setProducts(INITIAL_PRODUCTS);
    setCreditCustomers(INITIAL_CREDIT_CUSTOMERS);
    setInstalmentPlans(INITIAL_INSTALMENT_PLANS);
    setCheques(INITIAL_CHEQUES);
    setDailyExpenses(INITIAL_DAILY_EXPENSES);
    setSuppliers(INITIAL_SUPPLIERS);
    setSales([]);
    window.location.reload();
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        language,
        setLanguage,
        theme,
        setTheme,
        toggleTheme,
        currentBranchId,
        setCurrentBranchId,
        branches,
        products,
        creditCustomers,
        instalmentPlans,
        cheques,
        sales,
        stockTransfers,
        dailyExpenses,
        dailyDrawer,
        suppliers,
        recordSale,
        recordCreditPayment,
        addCreditCustomer,
        recordInstalmentPayment,
        addInstalmentPlan,
        updateProductStock,
        updateProductMinStock,
        addProduct,
        initiateStockTransfer,
        completeStockTransfer,
        addCheque,
        updateChequeStatus,
        addDailyExpense,
        closeDailyDrawer,
        reopenDailyDrawer,
        addSupplier,
        createPurchaseOrder,
        recordSupplierPayment,
        resetAllData,
        activeReceipt,
        setActiveReceipt,
        isDailyDrawerOpen,
        setIsDailyDrawerOpen,
        isTransferModalOpen,
        setIsTransferModalOpen,
        isAssistantModalOpen,
        setIsAssistantModalOpen,
        toast,
        showToast,
        showBootScreen,
        setShowBootScreen,
        completeBoot,
        triggerBootScreen
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
