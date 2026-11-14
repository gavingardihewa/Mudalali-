import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { CreditCustomer, BranchId } from '../types';
import { formatLKR, cleanPhoneForWhatsApp, getSinhalaReminderText, getSinglishReminderText, getEnglishReminderText, getTamilReminderText, getCustomerReminderText } from '../utils/formatters';
import {
  Search,
  UserPlus,
  BookOpen,
  MessageCircle,
  Phone,
  Clock,
  ShieldCheck,
  ShieldAlert,
  ArrowDownLeft,
  ArrowUpRight,
  ChevronRight,
  X,
  CreditCard,
  Building2,
  FileSpreadsheet
} from 'lucide-react';

export const NayaBookView: React.FC = () => {
  const {
    currentBranchId,
    creditCustomers,
    recordCreditPayment,
    addCreditCustomer,
    branches,
    language,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterTrust, setFilterTrust] = useState<'all' | 'Watchlist' | 'High'>('all');
  const [selectedCustomer, setSelectedCustomer] = useState<CreditCustomer | null>(null);

  // Modals
  const [isNewDebtorModalOpen, setIsNewDebtorModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [reminderLang, setReminderLang] = useState<'si' | 'ta' | 'singlish' | 'en'>(language === 'ta' ? 'ta' : 'si');

  // New Debtor Form state
  const [newCustName, setNewCustName] = useState('');
  const [newCustPhone, setNewCustPhone] = useState('');
  const [newCustNic, setNewCustNic] = useState('');
  const [newCustAddress, setNewCustAddress] = useState('');
  const [newCustBranch, setNewCustBranch] = useState<BranchId>('pettah');
  const [newCustLimit, setNewCustLimit] = useState('100000');
  const [newCustTrust, setNewCustTrust] = useState<'High' | 'Medium' | 'Watchlist'>('Medium');

  const filteredCustomers = creditCustomers.filter(c => {
    const matchesBranch = currentBranchId === 'all' || c.branchId === currentBranchId;
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.phone.includes(searchQuery) ||
      c.nicNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.sinhalaName && c.sinhalaName.includes(searchQuery));
    const matchesTrust = filterTrust === 'all' || c.creditScoreTrust === filterTrust;
    return matchesBranch && matchesSearch && matchesTrust;
  });

  const totalOutstanding = filteredCustomers.reduce((sum, c) => sum + c.totalOutstanding, 0);

  const handleRecordPayment = () => {
    if (!selectedCustomer) return;
    const amount = parseFloat(paymentAmount);
    if (!amount || amount <= 0) {
      showToast('Please enter a valid payment amount.', 'error');
      return;
    }

    recordCreditPayment(selectedCustomer.id, amount, paymentNote || 'Cash settlement received');
    setIsPaymentModalOpen(false);
    setPaymentAmount('');
    setPaymentNote('');
    showToast(`Payment of Rs. ${amount.toLocaleString()} recorded successfully!`, 'success');

    // Update selected customer view
    const updated = creditCustomers.find(c => c.id === selectedCustomer.id);
    if (updated) {
      setSelectedCustomer({
        ...updated,
        totalOutstanding: Math.max(0, updated.totalOutstanding - amount)
      });
    }
  };

  const handleCreateDebtor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustName.trim() || !newCustPhone.trim()) {
      showToast('Please provide customer name and phone number.', 'error');
      return;
    }

    addCreditCustomer({
      name: newCustName,
      phone: newCustPhone,
      nicNumber: newCustNic || 'N/A',
      address: newCustAddress || 'Local Address',
      branchId: newCustBranch,
      creditLimit: parseFloat(newCustLimit) || 50000,
      creditScoreTrust: newCustTrust
    });

    setIsNewDebtorModalOpen(false);
    setNewCustName('');
    setNewCustPhone('');
    setNewCustNic('');
    setNewCustAddress('');
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto space-y-4">
      {/* Top Banner / Naya Potha Header */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{language === 'si' ? 'ණය පොත (Naya Potha)' : language === 'ta' ? 'கடன் புத்தகம் (Naya Potha)' : 'Customer Credit Ledger'}</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 font-semibold">
                  {filteredCustomers.length} Debtors
                </span>
              </h2>
              <div className="text-xs text-slate-500">
                Track customer balances, credit limits, settlements & instant WhatsApp notices
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsNewDebtorModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow-xs transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{language === 'si' ? 'නව ණය ගැතියා' : language === 'ta' ? 'புதிய கடன் வாடிக்கையாளர்' : 'New Credit Debtor'}</span>
            </button>
          </div>
        </div>

        {/* Aggregate Credit KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
            <div className="text-[11px] text-slate-500">Total Outstanding Debt</div>
            <div className="text-lg font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
              {formatLKR(totalOutstanding)}
            </div>
          </div>
          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50">
            <div className="text-[11px] text-amber-800 dark:text-amber-300">Debtors on Watchlist</div>
            <div className="text-lg font-extrabold text-amber-900 dark:text-amber-200 tabular-nums">
              {creditCustomers.filter(c => c.creditScoreTrust === 'Watchlist').length} Accounts
            </div>
          </div>
          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50">
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300">High Trust Regulars</div>
            <div className="text-lg font-extrabold text-emerald-900 dark:text-emerald-200 tabular-nums">
              {creditCustomers.filter(c => c.creditScoreTrust === 'High').length} Accounts
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by customer name, phone, or NIC..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterTrust('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTrust === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              All Debtors
            </button>
            <button
              onClick={() => setFilterTrust('Watchlist')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTrust === 'Watchlist'
                  ? 'bg-amber-500 text-slate-950 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Watchlist (High Risk)
            </button>
            <button
              onClick={() => setFilterTrust('High')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterTrust === 'High'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              High Trust
            </button>
          </div>
        </div>
      </div>

      {/* Debtors List and Selected Ledger Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Debtors Table / List (7 cols) */}
        <div className="lg:col-span-7 space-y-2.5">
          {filteredCustomers.map(cust => {
            const isSelected = selectedCustomer?.id === cust.id;
            const branchName = branches.find(b => b.id === cust.branchId)?.name.split(' ')[0];
            const percentOfLimit = Math.min(100, (cust.totalOutstanding / cust.creditLimit) * 100);

            return (
              <div
                key={cust.id}
                onClick={() => setSelectedCustomer(cust)}
                className={`p-4 bg-white dark:bg-slate-900 rounded-2xl border transition-all cursor-pointer text-left ${
                  isSelected
                    ? 'border-amber-500 ring-2 ring-amber-500/20 bg-amber-50/20 dark:bg-amber-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 truncate">
                        {cust.name}
                      </h3>
                      {cust.creditScoreTrust === 'Watchlist' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-rose-100 text-rose-800 font-bold">
                          Watchlist
                        </span>
                      )}
                      {cust.creditScoreTrust === 'High' && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 font-bold">
                          Trusted
                        </span>
                      )}
                    </div>
                    {cust.sinhalaName && (
                      <div className="text-xs text-slate-500">{cust.sinhalaName}</div>
                    )}
                    <div className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-slate-400" />
                        {cust.phone}
                      </span>
                      <span>·</span>
                      <span>NIC: {cust.nicNumber}</span>
                      <span>·</span>
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        {branchName} Branch
                      </span>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="text-xs text-slate-400">Outstanding Balance</div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatLKR(cust.totalOutstanding)}
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">
                      Limit: {formatLKR(cust.creditLimit)}
                    </div>
                  </div>
                </div>

                {/* Credit Limit Usage Bar */}
                <div className="mt-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mb-1">
                    <span>Credit Utilized</span>
                    <span>{percentOfLimit.toFixed(0)}%</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        percentOfLimit > 85 ? 'bg-rose-500' : percentOfLimit > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentOfLimit}%` }}
                    />
                  </div>
                </div>

                {/* Action buttons inside card */}
                <div className="mt-3 pt-2 flex items-center justify-between gap-2">
                  <span className="text-[11px] text-slate-500">
                    Last paid: {cust.lastPaymentDate || 'No payments recorded'}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedCustomer(cust);
                        setIsReminderModalOpen(true);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 flex items-center gap-1"
                    >
                      <MessageCircle className="w-3 h-3" />
                      <span>WhatsApp</span>
                    </button>
                    <button
                      onClick={e => {
                        e.stopPropagation();
                        setSelectedCustomer(cust);
                        setIsPaymentModalOpen(true);
                      }}
                      className="px-3 py-1 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-100 dark:text-slate-900 rounded-lg hover:bg-slate-800"
                    >
                      Record Payment
                    </button>
                  </div>
                </div>
              </div>
            );
          })}

          {filteredCustomers.length === 0 && (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
              No credit debtors found.
            </div>
          )}
        </div>

        {/* Selected Debtor Ledger (5 cols) */}
        <div className="lg:col-span-5">
          {selectedCustomer ? (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-sm sticky top-20 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                    {selectedCustomer.name}
                  </h3>
                  <div className="text-xs text-slate-500">
                    Customer Ledger & Audit History (ගිණුම් විස්තරය)
                  </div>
                </div>
                <button
                  onClick={() => setIsPaymentModalOpen(true)}
                  className="px-3 py-1.5 text-xs font-bold text-amber-950 bg-amber-500 hover:bg-amber-400 rounded-xl"
                >
                  Pay Now
                </button>
              </div>

              {/* Outstanding balance card */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between">
                <div>
                  <div className="text-xs text-slate-500">Current Total Debt</div>
                  <div className="text-xl font-black text-rose-600 dark:text-rose-400 tabular-nums">
                    {formatLKR(selectedCustomer.totalOutstanding)}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-slate-500">Credit Limit</div>
                  <div className="text-sm font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                    {formatLKR(selectedCustomer.creditLimit)}
                  </div>
                </div>
              </div>

              {/* Transactions Ledger */}
              <div>
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                  Recent Ledger Entries ({selectedCustomer.transactions.length})
                </h4>
                <div className="space-y-2 max-h-[340px] overflow-y-auto pr-1">
                  {selectedCustomer.transactions.map(tx => (
                    <div
                      key={tx.id}
                      className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 text-xs"
                    >
                      <div className="flex items-center justify-between font-semibold">
                        <div className="flex items-center gap-1.5">
                          {tx.type === 'sale' ? (
                            <ArrowUpRight className="w-3.5 h-3.5 text-rose-600" />
                          ) : (
                            <ArrowDownLeft className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                          <span
                            className={
                              tx.type === 'sale'
                                ? 'text-rose-700 dark:text-rose-400'
                                : 'text-emerald-700 dark:text-emerald-400'
                            }
                          >
                            {tx.type === 'sale' ? 'Credit Sale (ණය)' : 'Payment Received (ගෙවීම)'}
                          </span>
                        </div>
                        <span className="tabular-nums font-bold text-slate-900 dark:text-slate-100">
                          {formatLKR(tx.amount)}
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                        <span>Ref: {tx.referenceNo}</span>
                        <span>{tx.date}</span>
                      </div>

                      {tx.note && (
                        <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-1 bg-white dark:bg-slate-900 p-1.5 rounded-lg border border-slate-100 dark:border-slate-800">
                          {tx.note}
                        </div>
                      )}

                      <div className="text-[10px] text-slate-400 mt-1 text-right">
                        Balance After: {formatLKR(tx.balanceAfter)}
                      </div>
                    </div>
                  ))}

                  {selectedCustomer.transactions.length === 0 && (
                    <div className="p-4 text-center text-xs text-slate-400">
                      No transaction entries yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-400">
              Select a customer on the left to inspect their credit history ledger and transactions.
            </div>
          )}
        </div>
      </div>

      {/* Record Payment Modal */}
      {isPaymentModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Record Credit Settlement
                </h3>
                <div className="text-xs text-slate-500">
                  Debtor: {selectedCustomer.name} (Debt: {formatLKR(selectedCustomer.totalOutstanding)})
                </div>
              </div>
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 my-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Settlement Amount Received (LKR)
                </label>
                <input
                  type="number"
                  placeholder="Enter amount (e.g. 25000)"
                  value={paymentAmount}
                  onChange={e => setPaymentAmount(e.target.value)}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold tabular-nums"
                />
              </div>

              {/* Quick Full Settlement */}
              <button
                type="button"
                onClick={() => setPaymentAmount(selectedCustomer.totalOutstanding.toString())}
                className="text-xs text-amber-600 dark:text-amber-400 font-semibold underline"
              >
                Pay Full Outstanding ({formatLKR(selectedCustomer.totalOutstanding)})
              </button>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Payment Reference or Note
                </label>
                <input
                  type="text"
                  placeholder="e.g. Cash collected by Farook / CEFT transfer"
                  value={paymentNote}
                  onChange={e => setPaymentNote(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsPaymentModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleRecordPayment}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Confirm Settlement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Reminder Modal */}
      {isReminderModalOpen && selectedCustomer && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  Send WhatsApp Reminder
                </h3>
                <div className="text-xs text-slate-500">
                  {selectedCustomer.name} · {selectedCustomer.phone}
                </div>
              </div>
              <button
                onClick={() => setIsReminderModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
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

            <div className="space-y-3 my-3">
              <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs">
                <div className="font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                  <span>
                    {reminderLang === 'si' ? 'Sinhala Notice (සිංහල)' : reminderLang === 'ta' ? 'Tamil Notice (தமிழ்)' : reminderLang === 'en' ? 'English Notice' : 'Singlish Notice'}:
                  </span>
                  <span className="text-[10px] text-emerald-600 font-semibold">1-Tap Ready</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 whitespace-pre-line leading-relaxed">
                  {getCustomerReminderText(
                    reminderLang,
                    selectedCustomer.name,
                    selectedCustomer.totalOutstanding,
                    new Date().toLocaleDateString('en-GB'),
                    'Mudalali Wholesale & Retail'
                  )}
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(selectedCustomer.phone)}?text=${encodeURIComponent(
                  getCustomerReminderText(
                    reminderLang,
                    selectedCustomer.name,
                    selectedCustomer.totalOutstanding,
                    new Date().toLocaleDateString('en-GB'),
                    'Mudalali Wholesale & Retail'
                  )
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                <span>
                  {reminderLang === 'ta' ? 'வாட்ஸ்அப் அனுப்பு' : reminderLang === 'si' ? 'වට්ස්ඇප් යවන්න' : 'Open WhatsApp'}
                </span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    getCustomerReminderText(
                      reminderLang,
                      selectedCustomer.name,
                      selectedCustomer.totalOutstanding,
                      new Date().toLocaleDateString('en-GB'),
                      'Mudalali Wholesale & Retail'
                    )
                  );
                  showToast('Reminder copied to clipboard!', 'success');
                }}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Debtor Modal */}
      {isNewDebtorModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Register New Credit Debtor (ණය ගැතියා)
              </h3>
              <button
                onClick={() => setIsNewDebtorModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateDebtor} className="space-y-3 my-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Customer / Business Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Gamini Perera / Apex Stores"
                  value={newCustName}
                  onChange={e => setNewCustName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone (07x-xxxxxxx) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="077-1234567"
                    value={newCustPhone}
                    onChange={e => setNewCustPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    National ID (NIC)
                  </label>
                  <input
                    type="text"
                    placeholder="851234567V / 1990..."
                    value={newCustNic}
                    onChange={e => setNewCustNic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="e.g. No. 45, Temple Road, Colombo"
                  value={newCustAddress}
                  onChange={e => setNewCustAddress(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Branch
                  </label>
                  <select
                    value={newCustBranch}
                    onChange={e => setNewCustBranch(e.target.value as BranchId)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Limit (Rs.)
                  </label>
                  <input
                    type="number"
                    value={newCustLimit}
                    onChange={e => setNewCustLimit(e.target.value)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Trust Rating
                  </label>
                  <select
                    value={newCustTrust}
                    onChange={e => setNewCustTrust(e.target.value as any)}
                    className="w-full px-2 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Watchlist">Watchlist</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewDebtorModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs"
                >
                  Register Debtor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
