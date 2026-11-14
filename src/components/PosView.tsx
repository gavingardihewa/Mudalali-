import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, PaymentMethod, BranchId, CartItem } from '../types';
import { formatLKR } from '../utils/formatters';
import {
  Search,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  CreditCard,
  QrCode,
  BookOpen,
  Landmark,
  Banknote,
  Building2,
  X,
  AlertCircle
} from 'lucide-react';

export const PosView: React.FC = () => {
  const {
    currentBranchId,
    setCurrentBranchId,
    branches,
    products,
    creditCustomers,
    recordSale,
    language,
    showToast
  } = useApp();

  // If currentBranchId is 'all', default to 'pettah' for billing
  const billingBranch: BranchId = currentBranchId === 'all' ? 'pettah' : currentBranchId;

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [pricingMode, setPricingMode] = useState<'retail' | 'wholesale'>('retail');
  const [cart, setCart] = useState<CartItem[]>([]);

  // Checkout state
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('cash');
  const [cashTendered, setCashTendered] = useState<string>('');
  const [selectedCreditCustomerId, setSelectedCreditCustomerId] = useState<string>('');
  const [chequeNumber, setChequeNumber] = useState('');
  const [chequeBank, setChequeBank] = useState('Commercial Bank of Ceylon');

  // Filter products by category and search
  const categories = [
    'all',
    'Electronics & Appliances',
    'Hardware & Electrical',
    'Groceries & Provisions',
    'Textiles & Garments',
    'Automotive & Spares'
  ];

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sinhalaName && p.sinhalaName.includes(searchQuery));
    const matchesCat = selectedCategory === 'all' || p.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  const addToCart = (product: Product) => {
    const unitPrice = pricingMode === 'wholesale' ? product.wholesalePrice : product.retailPrice;
    setCart(prev => {
      const existing = prev.find(item => item.product.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1, unitPrice }
            : item
        );
      }
      return [...prev, { product, quantity: 1, unitPrice, discount: 0 }];
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.product.id === productId) {
            const newQty = item.quantity + delta;
            return newQty > 0 ? { ...item, quantity: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  const subtotal = cart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const total = subtotal; // can add invoice-level discount if desired

  const parsedCashTendered = parseFloat(cashTendered) || 0;
  const changeDue = Math.max(0, parsedCashTendered - total);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;

    if (paymentMethod === 'credit' && !selectedCreditCustomerId) {
      showToast('Please select a credit customer from the list or register a new one.', 'error');
      return;
    }

    if (paymentMethod === 'cheque' && !chequeNumber.trim()) {
      showToast('Please enter the cheque number.', 'error');
      return;
    }

    const saleItems = cart.map(item => ({
      productId: item.product.id,
      productName: item.product.name,
      productCode: item.product.code,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      discount: item.discount,
      total: item.unitPrice * item.quantity
    }));

    recordSale({
      branchId: billingBranch,
      customerName:
        paymentMethod === 'credit'
          ? creditCustomers.find(c => c.id === selectedCreditCustomerId)?.name
          : customerName || 'Cash Counter Customer',
      customerPhone: customerPhone || undefined,
      items: saleItems,
      subtotal,
      discountTotal: 0,
      total,
      paymentMethod,
      paymentDetails: {
        cashTendered: paymentMethod === 'cash' ? parsedCashTendered : undefined,
        changeGiven: paymentMethod === 'cash' ? changeDue : undefined,
        creditCustomerId: paymentMethod === 'credit' ? selectedCreditCustomerId : undefined,
        chequeNumber: paymentMethod === 'cheque' ? chequeNumber : undefined,
        chequeBank: paymentMethod === 'cheque' ? chequeBank : undefined,
        lankaPayRef: paymentMethod === 'lankapay_qr' ? `LP-${Date.now().toString().slice(-6)}` : undefined
      },
      cashierName: 'Mudalali (Admin)',
      isCreditSale: paymentMethod === 'credit'
    });

    // Reset checkout state
    setCart([]);
    setIsCheckoutOpen(false);
    setCashTendered('');
    setCustomerName('');
    setCustomerPhone('');
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto">
      {/* Top POS Header Bar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 mb-4 shadow-2xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              POS
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{language === 'si' ? 'කඩේ බිල දැමීම' : language === 'ta' ? 'விற்பனை பில் (POS)' : 'Counter Sales & Billing'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium">
                  {branches.find(b => b.id === billingBranch)?.name.split(' ')[0]} Hub
                </span>
              </h2>
              <div className="text-xs text-slate-500">
                Tap items to add to bill · Fast wholesale/retail toggle
              </div>
            </div>
          </div>

          {/* Pricing Mode Toggle & Branch Selector */}
          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl p-1 text-xs font-semibold">
              <button
                onClick={() => setPricingMode('retail')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pricingMode === 'retail'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Retail (සිල්ලර)
              </button>
              <button
                onClick={() => setPricingMode('wholesale')}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  pricingMode === 'wholesale'
                    ? 'bg-amber-500 text-slate-950 shadow-xs'
                    : 'text-slate-500 hover:text-slate-900'
                }`}
              >
                Wholesale (තොග)
              </button>
            </div>

            {/* Quick Branch switch for billing */}
            <select
              value={billingBranch}
              onChange={e => setCurrentBranchId(e.target.value as BranchId)}
              className="px-2.5 py-1.5 text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none"
            >
              {branches.map(b => (
                <option key={b.id} value={b.id}>
                  {b.name.split(' ')[0]} Counter
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="mt-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by product name, code (e.g. ELEC-TV-43), or Sinhala name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Scroller */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-medium transition-colors ${
                  selectedCategory === cat
                    ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                }`}
              >
                {cat === 'all' ? 'All Items' : cat}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Grid: Products List + Desktop Cart Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Product Catalog Grid (8 cols on desktop) */}
        <div className="lg:col-span-7 xl:col-span-8">
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
              const branchStock = product.stocks[billingBranch] || 0;
              const unitPrice =
                pricingMode === 'wholesale' ? product.wholesalePrice : product.retailPrice;
              const isLowStock = branchStock <= product.minStockLevel;
              const isOutOfStock = branchStock <= 0;

              return (
                <div
                  key={product.id}
                  onClick={() => !isOutOfStock && addToCart(product)}
                  className={`bg-white dark:bg-slate-900 p-3 rounded-2xl border transition-all text-left flex flex-col justify-between ${
                    isOutOfStock
                      ? 'opacity-50 cursor-not-allowed border-slate-200 dark:border-slate-800'
                      : 'cursor-pointer border-slate-200 dark:border-slate-800 hover:border-amber-400 dark:hover:border-amber-600 active:scale-[0.98] shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-1">
                      <span>{product.code}</span>
                      <span
                        className={`font-semibold ${
                          isOutOfStock
                            ? 'text-rose-600'
                            : isLowStock
                            ? 'text-amber-600'
                            : 'text-emerald-600 dark:text-emerald-400'
                        }`}
                      >
                        {branchStock} {product.unit}
                      </span>
                    </div>

                    <h3 className="font-bold text-xs sm:text-sm text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug">
                      {product.name}
                    </h3>
                    {product.sinhalaName && (
                      <div className="text-[11px] text-slate-500 truncate mt-0.5">
                        {product.sinhalaName}
                      </div>
                    )}
                  </div>

                  <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">
                        {pricingMode}
                      </div>
                      <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatLKR(unitPrice)}
                      </div>
                    </div>
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center font-bold">
                      <Plus className="w-4 h-4" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No matching items found for "{searchQuery}".
            </div>
          )}
        </div>

        {/* Cart Panel (Desktop sticky or Mobile sheet trigger) */}
        <div className="lg:col-span-5 xl:col-span-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-20">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Current Bill ({cart.reduce((s, i) => s + i.quantity, 0)} items)
                </h3>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-[11px] text-rose-500 hover:text-rose-700 font-medium"
                >
                  Clear Bill
                </button>
              )}
            </div>

            {/* Cart Items list */}
            {cart.length === 0 ? (
              <div className="py-12 text-center text-xs text-slate-400">
                Tap items on the left to add them to the bill.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800/80 max-h-[360px] overflow-y-auto my-2">
                {cart.map(item => (
                  <div key={item.product.id} className="py-2.5 flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold text-xs text-slate-900 dark:text-slate-100 truncate">
                        {item.product.name}
                      </div>
                      <div className="text-[11px] text-slate-500 tabular-nums">
                        {formatLKR(item.unitPrice)} each
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={() => updateQuantity(item.product.id, -1)}
                        className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:bg-slate-200"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center text-xs font-bold tabular-nums">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.product.id, 1)}
                        className="w-6 h-6 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 flex items-center justify-center hover:bg-slate-200"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right shrink-0 min-w-[70px]">
                      <div className="font-bold text-xs text-slate-900 dark:text-slate-100 tabular-nums">
                        {formatLKR(item.unitPrice * item.quantity)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Total breakdown */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-1.5">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span className="tabular-nums font-semibold text-slate-800 dark:text-slate-200">
                  {formatLKR(subtotal)}
                </span>
              </div>
              <div className="flex items-center justify-between text-sm sm:text-base font-extrabold text-slate-900 dark:text-slate-100 pt-1 border-t border-dashed border-slate-200 dark:border-slate-800">
                <span>Net Total (මුදල)</span>
                <span className="tabular-nums text-amber-600 dark:text-amber-400">
                  {formatLKR(total)}
                </span>
              </div>
            </div>

            {/* Primary Action Button */}
            <button
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
              className="w-full mt-4 py-3 bg-slate-900 dark:bg-amber-600 hover:bg-slate-800 dark:hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm rounded-xl flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-[0.98]"
            >
              <Banknote className="w-4 h-4" />
              <span>Checkout & Bill ({formatLKR(total)})</span>
            </button>
          </div>
        </div>
      </div>

      {/* Checkout Drawer / Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Finalize Payment (ගෙවීම් අවසන් කිරීම)
                </h3>
                <div className="text-xs text-slate-500">
                  Branch: {branches.find(b => b.id === billingBranch)?.name}
                </div>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Total Banner */}
            <div className="my-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                Amount Payable:
              </span>
              <span className="text-xl font-black text-slate-900 dark:text-slate-100 tabular-nums">
                {formatLKR(total)}
              </span>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2 mb-4">
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Select Payment Mode:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'cash', label: 'Cash (මුදල්)', icon: Banknote },
                  { id: 'lankapay_qr', label: 'LankaPay QR', icon: QrCode },
                  { id: 'card', label: 'Card (කාඩ්)', icon: CreditCard },
                  { id: 'credit', label: 'Naya (ණය)', icon: BookOpen },
                  { id: 'cheque', label: 'Cheque (චෙක්)', icon: Landmark }
                ].map(pm => {
                  const Icon = pm.icon;
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as PaymentMethod)}
                      className={`p-2.5 rounded-xl border text-left flex items-center gap-2 text-xs font-semibold transition-colors ${
                        isSelected
                          ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 ring-2 ring-amber-500/20'
                          : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <Icon className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="truncate">{pm.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Payment Mode Details */}
            {paymentMethod === 'cash' && (
              <div className="space-y-3 p-3 bg-emerald-50/40 dark:bg-emerald-950/20 rounded-2xl border border-emerald-200/60 dark:border-emerald-900/40 mb-4">
                <div className="text-xs font-bold text-emerald-900 dark:text-emerald-200">
                  Cash Received (ලද මුදල්)
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Enter tendered amount (e.g. 50000)"
                    value={cashTendered}
                    onChange={e => setCashTendered(e.target.value)}
                    className="flex-1 px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold tabular-nums"
                  />
                  <button
                    onClick={() => setCashTendered(total.toString())}
                    className="px-3 py-2 bg-emerald-600 text-white rounded-xl text-xs font-semibold"
                  >
                    Exact
                  </button>
                </div>

                {/* Quick denomination buttons */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[1000, 2000, 5000, 10000, 20000, 50000].map(amt => (
                    <button
                      key={amt}
                      onClick={() => setCashTendered(amt.toString())}
                      className="px-2 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-700 dark:text-slate-300"
                    >
                      + Rs. {amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {parsedCashTendered > 0 && (
                  <div className="flex items-center justify-between text-xs pt-2 border-t border-emerald-200/50">
                    <span className="text-emerald-800 dark:text-emerald-300 font-medium">Change to return (ඉතිරි):</span>
                    <span className="font-extrabold text-sm tabular-nums text-emerald-700 dark:text-emerald-400">
                      {formatLKR(changeDue)}
                    </span>
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'lankapay_qr' && (
              <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 text-center mb-4 space-y-2">
                <div className="font-bold text-xs text-slate-900 dark:text-slate-100 flex items-center justify-center gap-1.5">
                  <QrCode className="w-4 h-4 text-amber-500" />
                  <span>Scan with any Sri Lankan Bank App (LankaPay JustPay)</span>
                </div>
                {/* SVG Mock QR Code */}
                <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto border border-slate-300 shadow-xs flex items-center justify-center">
                  <div className="grid grid-cols-5 gap-1 w-full h-full p-1 bg-slate-900 rounded-lg">
                    {Array.from({ length: 25 }).map((_, i) => (
                      <div
                        key={i}
                        className={`${
                          (i % 2 === 0 || i % 3 === 0) ? 'bg-white' : 'bg-transparent'
                        } rounded-xs`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-[11px] text-slate-500">
                  Ref: LP-{Date.now().toString().slice(-6)} · Amount: {formatLKR(total)}
                </div>
              </div>
            )}

            {paymentMethod === 'credit' && (
              <div className="space-y-3 p-3 bg-amber-50/40 dark:bg-amber-950/20 rounded-2xl border border-amber-200/60 dark:border-amber-900/40 mb-4">
                <div className="text-xs font-bold text-amber-900 dark:text-amber-200">
                  Assign to Credit Book (ණය පොතට එක්කිරීම)
                </div>
                <select
                  value={selectedCreditCustomerId}
                  onChange={e => setSelectedCreditCustomerId(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="">-- Choose Debtor / Customer --</option>
                  {creditCustomers.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.name} (Current Debt: {formatLKR(c.totalOutstanding)} / Limit: {formatLKR(c.creditLimit)})
                    </option>
                  ))}
                </select>
                {selectedCreditCustomerId && (
                  <div className="text-[11px] text-amber-800 dark:text-amber-300">
                    This Rs. {total.toLocaleString()} invoice will be added directly to customer's outstanding balance.
                  </div>
                )}
              </div>
            )}

            {paymentMethod === 'cheque' && (
              <div className="space-y-3 p-3 bg-sky-50/40 dark:bg-sky-950/20 rounded-2xl border border-sky-200/60 dark:border-sky-900/40 mb-4">
                <div className="text-xs font-bold text-sky-900 dark:text-sky-200">
                  Received Cheque Details (චෙක්පත් විස්තර)
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="Cheque No (e.g. 784920)"
                    value={chequeNumber}
                    onChange={e => setChequeNumber(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                  <select
                    value={chequeBank}
                    onChange={e => setChequeBank(e.target.value)}
                    className="px-3 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="Commercial Bank of Ceylon">Commercial Bank</option>
                    <option value="Bank of Ceylon (BOC)">Bank of Ceylon (BOC)</option>
                    <option value="People's Bank">People's Bank</option>
                    <option value="Sampath Bank">Sampath Bank</option>
                    <option value="Hatton National Bank (HNB)">Hatton National Bank</option>
                    <option value="Seylan Bank">Seylan Bank</option>
                    <option value="Nations Trust Bank (NTB)">Nations Trust Bank</option>
                  </select>
                </div>
              </div>
            )}

            {/* Customer Contact details */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <input
                type="text"
                placeholder="Customer Name (Optional)"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
              <input
                type="text"
                placeholder="Phone (07x-xxxxxxx for SMS/WhatsApp)"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            {/* Complete Sale Button */}
            <div className="flex gap-2">
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold"
              >
                Back to Edit
              </button>
              <button
                onClick={handleCompleteSale}
                className="flex-2 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md transition-transform active:scale-[0.98]"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Issue Receipt & Complete Bill</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
