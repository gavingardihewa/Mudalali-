import React, { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { Supplier, PurchaseOrder, BranchId, SriLankanBank } from '../types';
import {
  Building2,
  CalendarClock,
  Phone,
  Mail,
  Copy,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  CreditCard,
  Truck,
  ArrowUpRight,
  ExternalLink,
  ChevronRight,
  X,
  FileText,
  BadgeAlert,
  Calendar,
  Check,
  SendHorizontal
} from 'lucide-react';

export const SupplierManagementView: React.FC = () => {
  const {
    suppliers,
    branches,
    products,
    addSupplier,
    createPurchaseOrder,
    recordSupplierPayment,
    showToast,
    language
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'all' | 'deadlines' | 'orders' | 'payments'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Modal controls
  const [isNewSupplierModalOpen, setIsNewSupplierModalOpen] = useState(false);
  const [isNewPOModalOpen, setIsNewPOModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedPOForPayment, setSelectedPOForPayment] = useState<PurchaseOrder | null>(null);

  // Form State: New Supplier
  const [newCompany, setNewCompany] = useState('');
  const [newSinhalaName, setNewSinhalaName] = useState('');
  const [newContactPerson, setNewContactPerson] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newCategory, setNewCategory] = useState<Supplier['category']>('Appliances & Electronics');
  const [newBankName, setNewBankName] = useState<SriLankanBank>('Commercial Bank of Ceylon');
  const [newAccountNo, setNewAccountNo] = useState('');
  const [newBankBranch, setNewBankBranch] = useState('');
  const [newCreditDays, setNewCreditDays] = useState('30');

  // Form State: New Purchase Order
  const [poSupplierId, setPoSupplierId] = useState('');
  const [poBranchId, setPoBranchId] = useState<BranchId>('pettah');
  const [poDueDate, setPoDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 30);
    return d.toISOString().split('T')[0];
  });
  const [poNotes, setPoNotes] = useState('');
  const [poAddToStock, setPoAddToStock] = useState(true);
  const [poLineItems, setPoLineItems] = useState<
    { productId: string; productName: string; quantity: number; unitCost: number; total: number }[]
  >([{ productId: '', productName: '', quantity: 1, unitCost: 0, total: 0 }]);

  // Form State: Record Payment
  const [paymentSupplierId, setPaymentSupplierId] = useState('');
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'bank_transfer' | 'cheque' | 'cash'>('bank_transfer');
  const [paymentRef, setPaymentRef] = useState('');
  const [paymentChequeNo, setPaymentChequeNo] = useState('');
  const [paymentBank, setPaymentBank] = useState('Commercial Bank of Ceylon');
  const [paymentNote, setPaymentNote] = useState('');

  // Calculations
  const totalDebt = useMemo(() => {
    return suppliers.reduce((sum, s) => sum + s.totalOutstanding, 0);
  }, [suppliers]);

  const allOrders = useMemo(() => {
    return suppliers.flatMap(s => s.orders).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [suppliers]);

  const allPayments = useMemo(() => {
    return suppliers.flatMap(s =>
      s.payments.map(p => ({
        ...p,
        supplierName: s.companyName
      }))
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [suppliers]);

  // Upcoming deadlines (unpaid/partially paid orders)
  const pendingOrders = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    return allOrders
      .filter(o => o.status !== 'paid' && o.paidAmount < o.totalAmount)
      .map(o => {
        const due = new Date(o.dueDate);
        const now = new Date(today);
        const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 3600 * 24));
        return {
          ...o,
          balance: o.totalAmount - o.paidAmount,
          diffDays,
          isOverdue: diffDays < 0,
          isDueSoon: diffDays >= 0 && diffDays <= 7
        };
      })
      .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }, [allOrders]);

  const dueWithin7DaysAmount = useMemo(() => {
    return pendingOrders
      .filter(o => o.diffDays <= 7)
      .reduce((sum, o) => sum + o.balance, 0);
  }, [pendingOrders]);

  const overdueCount = useMemo(() => {
    return pendingOrders.filter(o => o.isOverdue).length;
  }, [pendingOrders]);

  // Filtered suppliers
  const filteredSuppliers = useMemo(() => {
    return suppliers.filter(s => {
      const matchSearch =
        s.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.sinhalaName && s.sinhalaName.includes(searchQuery)) ||
        s.contactPerson.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.phone.includes(searchQuery) ||
        s.bankAccountNo.includes(searchQuery);
      const matchCategory = categoryFilter === 'all' || s.category === categoryFilter;
      return matchSearch && matchCategory;
    });
  }, [suppliers, searchQuery, categoryFilter]);

  // Helper: Copy text to clipboard
  const handleCopyText = (text: string, label: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`${label} copied: ${text}`, 'success');
    }
  };

  // Handler: Add Supplier
  const handleSaveSupplier = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany || !newPhone) {
      showToast('Please provide company name and phone number', 'error');
      return;
    }
    addSupplier({
      companyName: newCompany,
      sinhalaName: newSinhalaName || undefined,
      contactPerson: newContactPerson || 'Main Representative',
      phone: newPhone,
      email: newEmail || undefined,
      address: newAddress || 'Colombo, Sri Lanka',
      category: newCategory,
      bankName: newBankName,
      bankAccountNo: newAccountNo || 'Pending',
      bankBranch: newBankBranch || 'Main Branch',
      creditTermsDays: parseInt(newCreditDays) || 30
    });
    setIsNewSupplierModalOpen(false);
    // Reset
    setNewCompany('');
    setNewSinhalaName('');
    setNewContactPerson('');
    setNewPhone('');
    setNewEmail('');
    setNewAddress('');
    setNewAccountNo('');
    setNewBankBranch('');
  };

  // Handler: Line Items in New PO
  const handleAddLineItem = () => {
    setPoLineItems([...poLineItems, { productId: '', productName: '', quantity: 1, unitCost: 0, total: 0 }]);
  };

  const handleUpdateLineItem = (index: number, field: string, value: any) => {
    const updated = [...poLineItems];
    const item = { ...updated[index] };
    if (field === 'productId') {
      item.productId = value;
      const found = products.find(p => p.id === value);
      if (found) {
        item.productName = found.name;
        item.unitCost = found.costPrice;
        item.total = found.costPrice * item.quantity;
      }
    } else if (field === 'productName') {
      item.productName = value;
    } else if (field === 'quantity') {
      item.quantity = Math.max(1, Number(value));
      item.total = item.quantity * item.unitCost;
    } else if (field === 'unitCost') {
      item.unitCost = Math.max(0, Number(value));
      item.total = item.quantity * item.unitCost;
    }
    updated[index] = item;
    setPoLineItems(updated);
  };

  const handleRemoveLineItem = (index: number) => {
    if (poLineItems.length <= 1) return;
    setPoLineItems(poLineItems.filter((_, i) => i !== index));
  };

  const poGrandTotal = poLineItems.reduce((sum, item) => sum + item.total, 0);

  // Handler: Save PO
  const handleSavePO = (e: React.FormEvent) => {
    e.preventDefault();
    if (!poSupplierId) {
      showToast('Please select a supplier', 'error');
      return;
    }
    const validItems = poLineItems.filter(i => i.productName.trim() !== '' && i.quantity > 0);
    if (validItems.length === 0) {
      showToast('Please specify at least one valid item with name and quantity', 'error');
      return;
    }

    createPurchaseOrder({
      supplierId: poSupplierId,
      branchId: poBranchId,
      items: validItems,
      dueDate: poDueDate,
      notes: poNotes,
      addToStockImmediately: poAddToStock
    });

    setIsNewPOModalOpen(false);
    // Reset
    setPoLineItems([{ productId: '', productName: '', quantity: 1, unitCost: 0, total: 0 }]);
    setPoNotes('');
  };

  // Handler: Open Payment Modal for specific supplier or PO
  const openPaymentModal = (supplier: Supplier, po?: PurchaseOrder) => {
    setPaymentSupplierId(supplier.id);
    setSelectedPOForPayment(po || null);
    if (po) {
      setPaymentAmount(String(po.totalAmount - po.paidAmount));
      setPaymentNote(`Settlement for PO ${po.poNumber}`);
    } else {
      setPaymentAmount(String(supplier.totalOutstanding));
      setPaymentNote(`Account settlement`);
    }
    setPaymentRef(`CEFT-${Date.now().toString().slice(-6)}`);
    setIsPaymentModalOpen(true);
  };

  const handleSavePayment = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(paymentAmount);
    if (!paymentSupplierId || isNaN(amt) || amt <= 0) {
      showToast('Please enter a valid payment amount', 'error');
      return;
    }

    recordSupplierPayment(paymentSupplierId, {
      amount: amt,
      paymentMethod,
      referenceNo: paymentMethod === 'cheque' ? paymentChequeNo : paymentRef,
      chequeNumber: paymentMethod === 'cheque' ? paymentChequeNo : undefined,
      bankName: paymentBank,
      note: paymentNote,
      poId: selectedPOForPayment?.id
    });

    setIsPaymentModalOpen(false);
    setSelectedPOForPayment(null);
    setPaymentAmount('');
  };

  return (
    <div className="space-y-5 pb-20">
      {/* Top Banner & KPI Strip */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-amber-600 dark:text-amber-400">
              <Building2 className="w-4 h-4" />
              <span>
                {language === 'si'
                  ? 'සැපයුම්කරුවන්ගේ කළමනාකරණය'
                  : language === 'ta'
                  ? 'சப்ளையர் மேலாண்மை'
                  : 'Supplier Management'}
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">
              {language === 'si'
                ? 'වෙළඳ සැපයුම්කරුවන් සහ ඇණවුම්'
                : language === 'ta'
                ? 'சப்ளையர்கள், கொள்முதல் & நிலுவைகள்'
                : 'Suppliers, Purchase Orders & Deadlines'}
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {language === 'si'
                ? 'පිටකොටුවේ ආනයනකරුවන්, දිවයිනේ බෙදාහරින්නන්, LankaPay CEFT සහ ගෙවීම් දින සීමා කළමනාකරණය'
                : language === 'ta'
                ? 'புறக்கோட்டை இறக்குமதியாளர்கள், விநியோகஸ்தர்கள், LankaPay CEFT மற்றும் தவணை காலக்கெடு'
                : 'Track Pettah importers, national distributors, LankaPay CEFT details, and upcoming payment deadlines.'}
            </p>
          </div>

          <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
            <button
              onClick={() => {
                if (suppliers.length > 0) setPoSupplierId(suppliers[0].id);
                setIsNewPOModalOpen(true);
              }}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>
                {language === 'si'
                  ? '+ නව ඇණවුම (PO)'
                  : language === 'ta'
                  ? '+ புதிய கொள்முதல் (PO)'
                  : '+ New Purchase Order'}
              </span>
            </button>
            <button
              onClick={() => setIsNewSupplierModalOpen(true)}
              className="px-3.5 py-2 rounded-xl bg-slate-900 dark:bg-slate-100 hover:bg-slate-800 dark:hover:bg-white text-white dark:text-slate-950 font-bold text-xs flex items-center gap-1.5 transition-colors"
            >
              <Building2 className="w-4 h-4" />
              <span>
                {language === 'si'
                  ? '+ නව සැපයුම්කරු'
                  : language === 'ta'
                  ? '+ புதிய சப்ளையர்'
                  : '+ Add Supplier'}
              </span>
            </button>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 pt-5">
          <div className="p-4 rounded-2xl bg-rose-50/70 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50">
            <div className="text-[11px] font-semibold text-rose-700 dark:text-rose-400 flex items-center justify-between">
              <span>
                {language === 'si'
                  ? 'මුළු සැපයුම් ණය'
                  : language === 'ta'
                  ? 'மொத்த சப்ளையர் கடன்'
                  : 'Total Supplier Debt'}
              </span>
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-rose-950 dark:text-rose-100 font-mono tabular-nums mt-1.5">
              Rs. {totalDebt.toLocaleString()}
            </div>
            <div className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">
              Owed to {suppliers.filter(s => s.totalOutstanding > 0).length} distributors
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50">
            <div className="text-[11px] font-semibold text-amber-700 dark:text-amber-400 flex items-center justify-between">
              <span>
                {language === 'si'
                  ? 'දින 7ක් තුළ ගෙවිය යුතු'
                  : language === 'ta'
                  ? '7 நாட்களில் செலுத்த வேண்டியவை'
                  : 'Due in Next 7 Days'}
              </span>
              <CalendarClock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-amber-950 dark:text-amber-100 font-mono tabular-nums mt-1.5">
              Rs. {dueWithin7DaysAmount.toLocaleString()}
            </div>
            <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1">
              {pendingOrders.filter(o => o.diffDays <= 7).length} PO payment deadlines
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>
                {language === 'si'
                  ? 'කල්පසු වූ ඇණවුම්'
                  : language === 'ta'
                  ? 'காலாவதியான நிலுவைகள்'
                  : 'Overdue Deadlines'}
              </span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1.5">
              {overdueCount}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {overdueCount > 0 ? 'Requires immediate settlement' : 'All deadlines on track'}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
            <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 flex items-center justify-between">
              <span>
                {language === 'si'
                  ? 'ක්‍රියාකාරී සැපයුම්කරුවන්'
                  : language === 'ta'
                  ? 'செயலில் உள்ள சப்ளையர்கள்'
                  : 'Active Suppliers'}
              </span>
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100 font-mono tabular-nums mt-1.5">
              {suppliers.length}
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-1">
              {allOrders.length} historical purchase orders
            </div>
          </div>
        </div>
      </div>

      {/* Sub-Tabs Navigation */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('all')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'all'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>
            {language === 'si'
              ? 'සියලු සැපයුම්කරුවන්'
              : language === 'ta'
              ? 'அனைத்து சப்ளையர்கள்'
              : 'All Suppliers'}{' '}
            ({suppliers.length})
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('deadlines')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'deadlines'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CalendarClock className="w-3.5 h-3.5" />
          <span>
            {language === 'si'
              ? 'ගෙවීම් දින සීමා'
              : language === 'ta'
              ? 'செலுத்தும் காலக்கெடு'
              : 'Payment Deadlines'}
          </span>
          {pendingOrders.length > 0 && (
            <span className="w-5 h-5 rounded-full bg-rose-500 text-white text-[10px] flex items-center justify-center font-bold">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveSubTab('orders')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'orders'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>
            {language === 'si'
              ? 'ඇණවුම් ලේඛනය (PO History)'
              : language === 'ta'
              ? 'கொள்முதல் வரலாறு'
              : 'Purchase Orders History'}{' '}
            ({allOrders.length})
          </span>
        </button>

        <button
          onClick={() => setActiveSubTab('payments')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap flex items-center gap-1.5 ${
            activeSubTab === 'payments'
              ? 'bg-amber-500 text-slate-950 shadow-xs'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          <span>
            {language === 'si'
              ? 'ගෙවීම් වාර්තා'
              : language === 'ta'
              ? 'செலுத்தல் வரலாறு'
              : 'Settlements History'}{' '}
            ({allPayments.length})
          </span>
        </button>
      </div>

      {/* TAB 1: ALL SUPPLIERS DIRECTORY */}
      {activeSubTab === 'all' && (
        <div className="space-y-4">
          {/* Search & Filter Bar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200 dark:border-slate-800">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search supplier, contact rep, phone, or bank account..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-amber-500 outline-none"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={categoryFilter}
                onChange={e => setCategoryFilter(e.target.value)}
                className="px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border-none text-xs text-slate-900 dark:text-slate-100 outline-none cursor-pointer"
              >
                <option value="all">All Categories</option>
                <option value="Appliances & Electronics">Appliances & Electronics</option>
                <option value="Cables & Hardware">Cables & Hardware</option>
                <option value="Provisions & Groceries">Provisions & Groceries</option>
                <option value="Textiles & Garments">Textiles & Garments</option>
                <option value="Automotive Parts">Automotive Parts</option>
              </select>
            </div>
          </div>

          {/* Supplier Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredSuppliers.map(supplier => (
              <div
                key={supplier.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 hover:border-amber-400/50 transition-colors shadow-xs flex flex-col justify-between"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                        {supplier.companyName}
                      </h3>
                      {supplier.sinhalaName && (
                        <div className="text-xs text-slate-500 dark:text-slate-400">
                          {supplier.sinhalaName}
                        </div>
                      )}
                      <div className="text-[11px] font-medium text-amber-600 dark:text-amber-400 mt-0.5">
                        {supplier.category} • {supplier.creditTermsDays} Days Credit
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-[10px] uppercase font-semibold text-slate-400">
                        Outstanding
                      </div>
                      <div
                        className={`text-base font-black font-mono tabular-nums ${
                          supplier.totalOutstanding > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        Rs. {supplier.totalOutstanding.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Representative & Address */}
                  <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Representative:</span>
                      <span className="font-semibold text-slate-800 dark:text-slate-200">{supplier.contactPerson}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Address:</span>
                      <span className="truncate max-w-[200px] text-right">{supplier.address}</span>
                    </div>
                  </div>

                  {/* Quick Contact Bar */}
                  <div className="mt-3 flex items-center gap-2">
                    <a
                      href={`tel:${supplier.phone.replace(/[^0-9]/g, '')}`}
                      className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-semibold text-[11px] flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5 text-emerald-600" />
                      <span>{supplier.phone}</span>
                    </a>

                    <a
                      href={`https://wa.me/94${supplier.phone.replace(/[^0-9]/g, '').slice(-9)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="py-1.5 px-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-bold text-[11px] flex items-center gap-1 border border-emerald-200 dark:border-emerald-800"
                    >
                      <span>WhatsApp</span>
                    </a>

                    {supplier.email && (
                      <a
                        href={`mailto:${supplier.email}`}
                        className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 hover:text-slate-900 dark:text-slate-400"
                        title={supplier.email}
                      >
                        <Mail className="w-3.5 h-3.5" />
                      </a>
                    )}
                  </div>

                  {/* LankaPay CEFT Bank Box */}
                  <div className="mt-3.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-slate-800 text-xs">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 mb-1">
                      <span className="font-bold flex items-center gap-1 text-slate-700 dark:text-slate-300">
                        <CreditCard className="w-3 h-3 text-amber-500" />
                        <span>CEFT / Bank Details</span>
                      </span>
                      <button
                        onClick={() => handleCopyText(supplier.bankAccountNo, 'A/C Number')}
                        className="text-amber-600 dark:text-amber-400 hover:underline flex items-center gap-1 font-semibold text-[10px]"
                      >
                        <Copy className="w-3 h-3" />
                        <span>Copy A/C</span>
                      </button>
                    </div>
                    <div className="font-semibold text-slate-900 dark:text-slate-100">
                      {supplier.bankName}
                    </div>
                    <div className="font-mono tabular-nums text-slate-700 dark:text-slate-300 text-[11px] mt-0.5">
                      A/C: {supplier.bankAccountNo} • {supplier.bankBranch}
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setSelectedSupplier(supplier)}
                    className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-amber-600 flex items-center gap-1"
                  >
                    <span>View History ({supplier.orders.length} POs)</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-1.5">
                    {supplier.totalOutstanding > 0 && (
                      <button
                        onClick={() => openPaymentModal(supplier)}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition-colors"
                      >
                        <CreditCard className="w-3 h-3" />
                        <span>Settle Bill</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setPoSupplierId(supplier.id);
                        setIsNewPOModalOpen(true);
                      }}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-900 dark:text-slate-100 font-bold text-xs flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>New PO</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredSuppliers.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
              <Building2 className="w-10 h-10 mx-auto text-slate-300 mb-2" />
              <div className="font-bold text-sm">No suppliers matched your search</div>
              <div className="text-xs text-slate-400 mt-1">Try adjusting your search terms or filter</div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PAYMENT DEADLINES TIMELINE */}
      {activeSubTab === 'deadlines' && (
        <div className="space-y-4">
          <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-2xl flex items-start gap-3">
            <Clock className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs text-slate-700 dark:text-slate-300">
              <span className="font-bold">Sri Lankan SME Credit Management Tip:</span> Pettah suppliers prioritize store owners who settle within credit deadlines or provide verified Post-Dated Cheques (PDCs) on time. This preserves your credit limit and maximum wholesale margins.
            </div>
          </div>

          <div className="space-y-3">
            {pendingOrders.map(order => {
              const supplier = suppliers.find(s => s.id === order.supplierId);
              return (
                <div
                  key={order.id}
                  className={`bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border transition-all ${
                    order.isOverdue
                      ? 'border-rose-400 bg-rose-50/20 dark:border-rose-900'
                      : order.isDueSoon
                      ? 'border-amber-400 bg-amber-50/10 dark:border-amber-800'
                      : 'border-slate-200 dark:border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900 dark:text-slate-100">
                          {order.supplierName}
                        </span>
                        <span className="font-mono text-xs text-slate-400">
                          {order.poNumber}
                        </span>
                      </div>

                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                        Ordered on {order.date} • Delivered to{' '}
                        <span className="font-semibold text-slate-700 dark:text-slate-300 uppercase">
                          {order.branchId} Branch
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="text-[10px] uppercase font-semibold text-slate-400">
                          Payment Due
                        </div>
                        <div className="text-base font-black text-rose-600 dark:text-rose-400 font-mono tabular-nums">
                          Rs. {order.balance.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Total PO: Rs. {order.totalAmount.toLocaleString()}
                        </div>
                      </div>

                      <div className="text-right pl-3 border-l border-slate-200 dark:border-slate-800">
                        <div
                          className={`text-xs font-bold flex items-center gap-1 justify-end ${
                            order.isOverdue
                              ? 'text-rose-600 dark:text-rose-400'
                              : order.isDueSoon
                              ? 'text-amber-600 dark:text-amber-400'
                              : 'text-emerald-600 dark:text-emerald-400'
                          }`}
                        >
                          {order.isOverdue ? (
                            <>
                              <BadgeAlert className="w-3.5 h-3.5" />
                              <span>Overdue by {Math.abs(order.diffDays)} days!</span>
                            </>
                          ) : order.diffDays === 0 ? (
                            <>
                              <Clock className="w-3.5 h-3.5" />
                              <span>Due Today!</span>
                            </>
                          ) : (
                            <>
                              <Calendar className="w-3.5 h-3.5" />
                              <span>Due in {order.diffDays} days</span>
                            </>
                          )}
                        </div>
                        <div className="text-[11px] font-mono text-slate-500">
                          Deadline: {order.dueDate}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Items summary */}
                  <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap gap-2 items-center justify-between">
                    <div>
                      <span className="font-medium text-slate-500">Items: </span>
                      {order.items.map((it, idx) => (
                        <span key={idx} className="font-medium text-slate-800 dark:text-slate-200">
                          {it.productName} ({it.quantity}x)
                          {idx < order.items.length - 1 ? ', ' : ''}
                        </span>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="text-[11px] text-amber-700 dark:text-amber-300 italic">
                        Note: {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    {supplier && (
                      <div className="text-xs text-slate-500 flex items-center gap-2">
                        <span>A/C: {supplier.bankAccountNo} ({supplier.bankName})</span>
                        <button
                          onClick={() => handleCopyText(supplier.bankAccountNo, 'A/C Number')}
                          className="text-amber-600 hover:underline flex items-center gap-0.5 text-[10px] font-semibold"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copy</span>
                        </button>
                      </div>
                    )}

                    {supplier && (
                      <button
                        onClick={() => openPaymentModal(supplier, order)}
                        className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Settle Bill (Rs. {order.balance.toLocaleString()})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {pendingOrders.length === 0 && (
              <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500">
                <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-500 mb-2" />
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  All Supplier Deadlines Clear!
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  You have no overdue or outstanding purchase orders awaiting payment.
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PURCHASE ORDERS REGISTER */}
      {activeSubTab === 'orders' && (
        <div className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Historical Purchase Orders
                </h3>
                <div className="text-xs text-slate-500">
                  List of all stock deliveries and consignments received
                </div>
              </div>

              <button
                onClick={() => {
                  if (suppliers.length > 0) setPoSupplierId(suppliers[0].id);
                  setIsNewPOModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs flex items-center gap-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New PO</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-3 px-4 font-semibold">PO Number</th>
                    <th className="py-3 px-4 font-semibold">Supplier</th>
                    <th className="py-3 px-4 font-semibold">Date / Due</th>
                    <th className="py-3 px-4 font-semibold">Branch</th>
                    <th className="py-3 px-4 font-semibold">Items</th>
                    <th className="py-3 px-4 font-semibold text-right">Amount (LKR)</th>
                    <th className="py-3 px-4 font-semibold text-center">Status</th>
                    <th className="py-3 px-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
                  {allOrders.map(order => {
                    const supp = suppliers.find(s => s.id === order.supplierId);
                    return (
                      <tr key={order.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900 dark:text-slate-100">
                          {order.poNumber}
                        </td>
                        <td className="py-3 px-4">
                          <div className="font-semibold text-slate-900 dark:text-slate-100">
                            {order.supplierName}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div>{order.date}</div>
                          <div className="text-[10px] text-slate-400">Due: {order.dueDate}</div>
                        </td>
                        <td className="py-3 px-4">
                          <span className="uppercase text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                            {order.branchId}
                          </span>
                        </td>
                        <td className="py-3 px-4 max-w-[220px]">
                          <div className="truncate">
                            {order.items.map(i => `${i.productName} (${i.quantity})`).join(', ')}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {order.items.length} line item(s)
                          </div>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold tabular-nums text-slate-900 dark:text-slate-100">
                          Rs. {order.totalAmount.toLocaleString()}
                          {order.paidAmount > 0 && order.paidAmount < order.totalAmount && (
                            <div className="text-[10px] text-amber-600">
                              Paid: Rs. {order.paidAmount.toLocaleString()}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {order.status === 'paid' ? (
                            <span className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                              PAID
                            </span>
                          ) : order.status === 'partial_paid' ? (
                            <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-md">
                              PARTIAL
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-700 dark:text-rose-300 bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 rounded-md">
                              UNPAID
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-right">
                          {order.status !== 'paid' && supp && (
                            <button
                              onClick={() => openPaymentModal(supp, order)}
                              className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-[11px]"
                            >
                              Pay
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: SETTLEMENTS & PAYMENTS HISTORY */}
      {activeSubTab === 'payments' && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
              Supplier Settlements & Transfer Ledger
            </h3>
            <div className="text-xs text-slate-500">
              Record of LankaPay CEFT transfers, issued cheques, and cash payments made to suppliers
            </div>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {allPayments.map(payment => (
              <div key={payment.id} className="p-4 flex items-center justify-between gap-3 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-slate-100 text-sm">
                    {payment.supplierName}
                  </div>
                  <div className="text-slate-500 dark:text-slate-400 mt-0.5">
                    {payment.date} • Ref #{payment.referenceNo}{' '}
                    {payment.bankName && `• ${payment.bankName}`}
                  </div>
                  {payment.note && (
                    <div className="text-[11px] text-slate-400 italic mt-0.5">
                      {payment.note}
                    </div>
                  )}
                </div>

                <div className="text-right">
                  <div className="font-bold text-emerald-600 dark:text-emerald-400 text-base font-mono tabular-nums">
                    - Rs. {payment.amount.toLocaleString()}
                  </div>
                  <div className="text-[10px] uppercase font-semibold text-slate-400">
                    {payment.paymentMethod.replace('_', ' ')}
                  </div>
                </div>
              </div>
            ))}

            {allPayments.length === 0 && (
              <div className="p-8 text-center text-slate-400 text-xs">
                No supplier settlement records found.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: VIEW SUPPLIER HISTORY & PROFILE */}
      {selectedSupplier && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                  {selectedSupplier.companyName}
                </h2>
                {selectedSupplier.sinhalaName && (
                  <div className="text-xs text-slate-500">{selectedSupplier.sinhalaName}</div>
                )}
                <div className="text-xs text-amber-600 dark:text-amber-400 font-medium mt-0.5">
                  {selectedSupplier.category} • {selectedSupplier.creditTermsDays} Days Credit Terms
                </div>
              </div>
              <button
                onClick={() => setSelectedSupplier(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Contact & Banking Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 my-4">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 text-xs">
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Representative Contact
                </div>
                <div>{selectedSupplier.contactPerson}</div>
                <div className="font-semibold text-slate-900 dark:text-slate-100 mt-1">
                  {selectedSupplier.phone}
                </div>
                {selectedSupplier.email && <div className="text-slate-400">{selectedSupplier.email}</div>}
                <div className="text-slate-400 mt-1">{selectedSupplier.address}</div>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/50 text-xs">
                <div className="flex items-center justify-between font-bold text-amber-800 dark:text-amber-300 mb-1">
                  <span>CEFT Bank Account</span>
                  <button
                    onClick={() => handleCopyText(selectedSupplier.bankAccountNo, 'A/C Number')}
                    className="text-amber-600 hover:underline flex items-center gap-0.5 text-[10px]"
                  >
                    <Copy className="w-3 h-3" />
                    <span>Copy</span>
                  </button>
                </div>
                <div className="font-semibold text-slate-900 dark:text-slate-100">
                  {selectedSupplier.bankName}
                </div>
                <div className="font-mono tabular-nums text-slate-700 dark:text-slate-300 mt-0.5">
                  A/C: {selectedSupplier.bankAccountNo}
                </div>
                <div className="text-slate-500 text-[11px]">{selectedSupplier.bankBranch}</div>
              </div>
            </div>

            {/* Outstanding Summary */}
            <div className="p-3.5 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-between text-xs mb-4">
              <div>
                <span className="text-slate-500">Current Outstanding Balance:</span>
                <span className="font-black text-rose-600 dark:text-rose-400 font-mono text-base ml-2">
                  Rs. {selectedSupplier.totalOutstanding.toLocaleString()}
                </span>
              </div>
              {selectedSupplier.totalOutstanding > 0 && (
                <button
                  onClick={() => {
                    const supp = selectedSupplier;
                    setSelectedSupplier(null);
                    openPaymentModal(supp);
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs"
                >
                  Settle Balance
                </button>
              )}
            </div>

            {/* Historical POs for this supplier */}
            <div className="space-y-3">
              <h4 className="font-bold text-xs text-slate-500 uppercase tracking-wider">
                Purchase Orders ({selectedSupplier.orders.length})
              </h4>
              {selectedSupplier.orders.map(order => (
                <div
                  key={order.id}
                  className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 text-xs flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-slate-900 dark:text-slate-100">
                        {order.poNumber}
                      </span>
                      <span className="text-slate-400 ml-2">Date: {order.date}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 dark:text-slate-100">
                      Rs. {order.totalAmount.toLocaleString()}
                    </div>
                  </div>

                  <div className="text-slate-600 dark:text-slate-400">
                    {order.items.map(i => `${i.productName} (${i.quantity}x)`).join(', ')}
                  </div>

                  <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-slate-400">Due: {order.dueDate}</span>
                    <span
                      className={`font-bold ${
                        order.status === 'paid'
                          ? 'text-emerald-600'
                          : order.status === 'partial_paid'
                          ? 'text-amber-600'
                          : 'text-rose-600'
                      }`}
                    >
                      Status: {order.status.toUpperCase()} (Paid Rs. {order.paidAmount.toLocaleString()})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ADD NEW SUPPLIER */}
      {isNewSupplierModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {language === 'si'
                    ? 'නව සැපයුම්කරු ලියාපදිංචි කිරීම'
                    : language === 'ta'
                    ? 'புதிய சப்ளையர் பதிவு'
                    : 'Add New Supplier'}
                </h2>
                <div className="text-xs text-slate-500">
                  {language === 'si'
                    ? 'තොග බෙදාහරින්නන්, පිටකොටුවේ ආනයනකරුවන් හෝ කර්මාන්තශාලා ලියාපදිංචිය'
                    : language === 'ta'
                    ? 'மொத்த விற்பனையாளர்கள், புறக்கோட்டை இறக்குமதியாளர்கள் பதிவு'
                    : 'Register wholesale distributor, Pettah importer, or factory'}
                </div>
              </div>
              <button
                onClick={() => setIsNewSupplierModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveSupplier} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Company / Distributor Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kelani Cables PLC or Pettah Importers"
                  value={newCompany}
                  onChange={e => setNewCompany(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Sinhala Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. කැළණි කේබල්ස් පී.එල්.සී"
                  value={newSinhalaName}
                  onChange={e => setNewSinhalaName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Contact Person / Rep
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Rohan Senanayake"
                    value={newContactPerson}
                    onChange={e => setNewContactPerson(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Phone / Mobile *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="077-1234567"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="sales@supplier.lk"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="Appliances & Electronics">Appliances & Electronics</option>
                    <option value="Cables & Hardware">Cables & Hardware</option>
                    <option value="Provisions & Groceries">Provisions & Groceries</option>
                    <option value="Textiles & Garments">Textiles & Garments</option>
                    <option value="Automotive Parts">Automotive Parts</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Physical Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. No. 44, 4th Cross Street, Pettah, Colombo 11"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              {/* Sri Lankan Bank Details for CEFT */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <div className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                  <CreditCard className="w-3.5 h-3.5 text-amber-500" />
                  <span>Sri Lankan Bank Details (LankaPay CEFT)</span>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Bank Name</label>
                  <select
                    value={newBankName}
                    onChange={e => setNewBankName(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                  >
                    <option value="Commercial Bank of Ceylon">Commercial Bank of Ceylon</option>
                    <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                    <option value="People's Bank">People's Bank</option>
                    <option value="Sampath Bank">Sampath Bank</option>
                    <option value="Hatton National Bank (HNB)">Hatton National Bank (HNB)</option>
                    <option value="Seylan Bank">Seylan Bank</option>
                    <option value="Nations Trust Bank (NTB)">Nations Trust Bank (NTB)</option>
                    <option value="DFCC Bank">DFCC Bank</option>
                    <option value="Union Bank">Union Bank</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Account Number</label>
                    <input
                      type="text"
                      placeholder="e.g. 1002849182"
                      value={newAccountNo}
                      onChange={e => setNewAccountNo(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Branch</label>
                    <input
                      type="text"
                      placeholder="e.g. Pettah / City Office"
                      value={newBankBranch}
                      onChange={e => setNewBankBranch(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-500 mb-1">Credit Terms (Days)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="30"
                    value={newCreditDays}
                    onChange={e => setNewCreditDays(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewSupplierModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs"
                >
                  Save Supplier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: CREATE PURCHASE ORDER */}
      {isNewPOModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {language === 'si'
                    ? 'නව මිලදී ගැනීමේ ඇණවුම (Purchase Order)'
                    : language === 'ta'
                    ? 'புதிய கொள்முதல் ஆணை (PO)'
                    : 'Create Purchase Order (PO)'}
                </h2>
                <div className="text-xs text-slate-500">
                  {language === 'si'
                    ? 'භාණ්ඩ තොග ලැබීම සහ ගෙවීම් දින සීමාව සටහන් කරන්න'
                    : language === 'ta'
                    ? 'புதிய பொருள் விநியோகம் மற்றும் தவணைக் காலக்கெடுவை பதிவுசெய்க'
                    : 'Record new delivery consignment and payment deadline'}
                </div>
              </div>
              <button
                onClick={() => setIsNewPOModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePO} className="space-y-4 mt-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Select Supplier *
                  </label>
                  <select
                    value={poSupplierId}
                    onChange={e => setPoSupplierId(e.target.value)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                  >
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.companyName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Receiving Branch *
                  </label>
                  <select
                    value={poBranchId}
                    onChange={e => setPoBranchId(e.target.value as BranchId)}
                    required
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Deadline (Due Date) *
                </label>
                <input
                  type="date"
                  required
                  value={poDueDate}
                  onChange={e => setPoDueDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              {/* Line Items List */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">
                    Order Items (භාණ්ඩ විස්තර)
                  </label>
                  <button
                    type="button"
                    onClick={handleAddLineItem}
                    className="text-amber-600 dark:text-amber-400 font-bold text-xs flex items-center gap-1 hover:underline"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                {poLineItems.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <select
                        value={item.productId}
                        onChange={e => handleUpdateLineItem(index, 'productId', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none text-xs"
                      >
                        <option value="">-- Choose Existing Product (or type below) --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.code} - {p.name} (Cost: Rs. {p.costPrice.toLocaleString()})
                          </option>
                        ))}
                      </select>
                      {poLineItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveLineItem(index)}
                          className="text-rose-500 hover:text-rose-700 font-bold px-1"
                        >
                          ✕
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      placeholder="Item description / name"
                      value={item.productName}
                      onChange={e => handleUpdateLineItem(index, 'productName', e.target.value)}
                      required
                      className="w-full px-2.5 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none text-xs"
                    />

                    <div className="grid grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[10px] text-slate-500">Qty</label>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => handleUpdateLineItem(index, 'quantity', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] text-slate-500">Unit Cost (Rs.)</label>
                        <input
                          type="number"
                          min="0"
                          value={item.unitCost}
                          onChange={e => handleUpdateLineItem(index, 'unitCost', e.target.value)}
                          className="w-full px-2 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono text-xs"
                        />
                      </div>
                      <div className="text-right">
                        <label className="block text-[10px] text-slate-500">Total</label>
                        <div className="font-mono font-bold text-slate-900 dark:text-slate-100 py-1.5 text-xs tabular-nums">
                          Rs. {item.total.toLocaleString()}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Total Summary */}
              <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                <div>
                  <div className="font-bold text-amber-900 dark:text-amber-200">Total Purchase Value</div>
                  <div className="text-[11px] text-amber-700 dark:text-amber-300">
                    Will be added to supplier outstanding
                  </div>
                </div>
                <div className="text-lg font-black text-amber-950 dark:text-amber-100 font-mono tabular-nums">
                  Rs. {poGrandTotal.toLocaleString()}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="addToStock"
                  checked={poAddToStock}
                  onChange={e => setPoAddToStock(e.target.checked)}
                  className="rounded text-amber-500 focus:ring-amber-500"
                />
                <label htmlFor="addToStock" className="text-slate-700 dark:text-slate-300 font-medium">
                  Automatically add received stock to branch inventory
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Delivery / Cheque Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Balance Rs. 200,000 to be settled via BOC PDC cheque #109281 on Nov 20"
                  value={poNotes}
                  onChange={e => setPoNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNewPOModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold shadow-xs"
                >
                  Confirm Purchase Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: RECORD SUPPLIER PAYMENT */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-5 sm:p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                  {language === 'si'
                    ? 'සැපයුම්කරුට මුදල් ගෙවීම'
                    : language === 'ta'
                    ? 'சப்ளையர் பணம் செலுத்துதல்'
                    : 'Record Supplier Settlement'}
                </h2>
                <div className="text-xs text-slate-500">
                  {selectedPOForPayment ? `Settling ${selectedPOForPayment.poNumber}` : language === 'ta' ? 'பொது கடன் தீர்வு' : language === 'si' ? 'පොදු ණය පියවීම' : 'General debt settlement'}
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSavePayment} className="space-y-3.5 mt-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Supplier
                </label>
                <select
                  value={paymentSupplierId}
                  onChange={e => setPaymentSupplierId(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.companyName} (Owed: Rs. {s.totalOutstanding.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Amount (LKR) *
                </label>
                <input
                  type="number"
                  required
                  min="1"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  placeholder="e.g. 150000"
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none font-mono text-sm font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Payment Method
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('bank_transfer')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      paymentMethod === 'bank_transfer'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    LankaPay CEFT
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cheque')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      paymentMethod === 'cheque'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    PDC Cheque
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('cash')}
                    className={`py-2 rounded-xl font-bold border transition-colors ${
                      paymentMethod === 'cash'
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-200'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Cash
                  </button>
                </div>
              </div>

              {paymentMethod === 'bank_transfer' && (
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    CEFT / Online Transfer Reference
                  </label>
                  <input
                    type="text"
                    required
                    value={paymentRef}
                    onChange={e => setPaymentRef(e.target.value)}
                    placeholder="e.g. CEFT-884920"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none font-mono"
                  />
                </div>
              )}

              {paymentMethod === 'cheque' && (
                <div className="space-y-2.5 p-3 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900">
                  <div className="font-semibold text-amber-900 dark:text-amber-200">
                    Cheque Details (Will auto-add to Cheque Register)
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Cheque Number *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 890123"
                      value={paymentChequeNo}
                      onChange={e => setPaymentChequeNo(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-500 mb-1">Drawn on Bank</label>
                    <input
                      type="text"
                      value={paymentBank}
                      onChange={e => setPaymentBank(e.target.value)}
                      className="w-full px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              )}

              {paymentMethod === 'cash' && (
                <div className="p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
                  Cash payment will be automatically recorded and deducted from today's Daily Drawer (Podi Potha).
                </div>
              )}

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Note / Memo
                </label>
                <input
                  type="text"
                  placeholder="e.g. Partial settlement for refrigerator delivery"
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 outline-none"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs"
                >
                  Confirm Settlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
