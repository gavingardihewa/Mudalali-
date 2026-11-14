import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { InstalmentPlan, BranchId } from '../types';
import { formatLKR, cleanPhoneForWhatsApp, getSinhalaReminderText, getSinglishReminderText, getTamilReminderText, getCustomerReminderText } from '../utils/formatters';
import {
  CalendarClock,
  Plus,
  Search,
  MessageCircle,
  CheckCircle2,
  AlertTriangle,
  User,
  ShieldAlert,
  ChevronDown,
  ChevronUp,
  X,
  Clock,
  Receipt
} from 'lucide-react';

export const WaraPlanView: React.FC = () => {
  const {
    currentBranchId,
    instalmentPlans,
    recordInstalmentPayment,
    addInstalmentPlan,
    branches,
    products,
    language,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'overdue' | 'active' | 'completed'>('all');
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [waraReminderLang, setWaraReminderLang] = useState<'si' | 'ta' | 'en' | 'singlish'>(language === 'ta' ? 'ta' : 'si');

  // Modals
  const [isNewPlanModalOpen, setIsNewPlanModalOpen] = useState(false);
  const [collectingPlan, setCollectingPlan] = useState<{
    plan: InstalmentPlan;
    scheduleIndex: number;
    amount: number;
  } | null>(null);

  const [reminderData, setReminderData] = useState<{
    name: string;
    phone: string;
    amount: number;
    dueDate: string;
  } | null>(null);

  // New Contract Wizard state
  const [custName, setCustName] = useState('');
  const [custPhone, setCustPhone] = useState('');
  const [custNic, setCustNic] = useState('');
  const [guarantorName, setGuarantorName] = useState('');
  const [guarantorPhone, setGuarantorPhone] = useState('');
  const [guarantorNic, setGuarantorNic] = useState('');
  const [branchId, setBranchId] = useState<BranchId>('kandy');
  const [selectedProductId, setSelectedProductId] = useState('');
  const [itemDescription, setItemDescription] = useState('');
  const [cashPrice, setCashPrice] = useState('89500');
  const [downPayment, setDownPayment] = useState('25000');
  const [periodMonths, setPeriodMonths] = useState(10);
  const [markupPercent, setMarkupPercent] = useState(15); // standard hire purchase interest markup
  const [collectorName, setCollectorName] = useState('Sunil - Route Collector');

  // Filter plans
  const filteredPlans = instalmentPlans.filter(plan => {
    const matchesBranch = currentBranchId === 'all' || plan.branchId === currentBranchId;
    const matchesSearch =
      plan.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.contractNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.itemDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.customerNic.toLowerCase().includes(searchQuery.toLowerCase());

    const hasOverdue = plan.schedules.some(s => s.status === 'overdue');
    let matchesStatus = true;
    if (filterStatus === 'overdue') matchesStatus = hasOverdue;
    else if (filterStatus === 'active') matchesStatus = plan.status === 'active';
    else if (filterStatus === 'completed') matchesStatus = plan.status === 'completed';

    return matchesBranch && matchesSearch && matchesStatus;
  });

  // Calculate wizard totals
  const numCash = parseFloat(cashPrice) || 0;
  const numDown = parseFloat(downPayment) || 0;
  const principalDue = Math.max(0, numCash - numDown);
  const interestAmount = (principalDue * markupPercent) / 100;
  const totalHirePayable = numDown + principalDue + interestAmount;
  const monthlyAmount = periodMonths > 0 ? Math.round((principalDue + interestAmount) / periodMonths) : 0;

  const handleProductSelect = (prodId: string) => {
    setSelectedProductId(prodId);
    const prod = products.find(p => p.id === prodId);
    if (prod) {
      setItemDescription(prod.name);
      setCashPrice(prod.retailPrice.toString());
      setDownPayment((Math.round(prod.retailPrice * 0.25)).toString()); // 25% down payment default
    }
  };

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (!custName || !custPhone || !itemDescription) {
      showToast('Please fill customer details and item description.', 'error');
      return;
    }

    addInstalmentPlan({
      customerName: custName,
      customerPhone: custPhone,
      customerNic: custNic || 'N/A',
      guarantorName: guarantorName || 'N/A',
      guarantorPhone: guarantorPhone || 'N/A',
      guarantorNic: guarantorNic || 'N/A',
      branchId,
      itemDescription,
      productCode: products.find(p => p.id === selectedProductId)?.code,
      cashPrice: numCash,
      downPayment: numDown,
      totalHirePrice: totalHirePayable,
      monthlyAmount,
      periodMonths,
      startDate: new Date().toISOString().split('T')[0],
      collectorName: collectorName || 'Field Agent'
    });

    setIsNewPlanModalOpen(false);
    // Reset wizard
    setCustName('');
    setCustPhone('');
    setCustNic('');
  };

  const handleConfirmCollection = () => {
    if (!collectingPlan) return;
    recordInstalmentPayment(
      collectingPlan.plan.id,
      collectingPlan.scheduleIndex,
      collectingPlan.amount,
      collectingPlan.plan.collectorName
    );
    setCollectingPlan(null);
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto space-y-4">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold">
              <CalendarClock className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>
                  {language === 'si'
                    ? 'වාරික පොත (Wara Potha)'
                    : language === 'ta'
                    ? 'தவணை முறை (Wara Potha)'
                    : 'Hire Purchase & Instalment Plans'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-800 dark:text-indigo-300 font-semibold">
                  {filteredPlans.length} Contracts
                </span>
              </h2>
              <div className="text-xs text-slate-500">
                {language === 'si'
                  ? 'මාසික අයවීම්, ඇපකරුවන්, ක්ෂේත්‍ර එකතු කරන්නන් සහ සිංහල/දෙමළ නිවේදන'
                  : language === 'ta'
                  ? 'மாதாந்திர தவணை வசூல், உத்தரவாததாரர் விபரம் மற்றும் தமிழ்/சிங்கள நினைவூட்டல்'
                  : 'Track monthly recovery, guarantor details, field collectors & send trilingual notices'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsNewPlanModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>
              {language === 'si'
                ? 'නව වාරික සැලැස්ම'
                : language === 'ta'
                ? 'புதிய தவணை திட்டம்'
                : 'New Hire Contract'}
            </span>
          </button>
        </div>

        {/* Filter bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search contract no, customer name, NIC, or item..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'all'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              All Plans
            </button>
            <button
              onClick={() => setFilterStatus('overdue')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'overdue'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Overdue Only
            </button>
            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg transition-colors ${
                filterStatus === 'active'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-500'
              }`}
            >
              Active
            </button>
          </div>
        </div>
      </div>

      {/* Plans List */}
      <div className="space-y-3">
        {filteredPlans.map(plan => {
          const isExpanded = expandedPlanId === plan.id;
          const paidSchedules = plan.schedules.filter(s => s.status === 'paid');
          const overdueSchedules = plan.schedules.filter(s => s.status === 'overdue');
          const nextPending = plan.schedules.find(s => s.status !== 'paid');
          const totalPaidSoFar = plan.downPayment + paidSchedules.reduce((s, item) => s + item.paidAmount, 0);
          const percentPaid = Math.min(100, (totalPaidSoFar / plan.totalHirePrice) * 100);

          return (
            <div
              key={plan.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl border transition-all ${
                overdueSchedules.length > 0
                  ? 'border-rose-300 dark:border-rose-900/60 shadow-2xs'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              {/* Plan Card Header */}
              <div
                onClick={() => setExpandedPlanId(isExpanded ? null : plan.id)}
                className="p-4 cursor-pointer flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
                      {plan.contractNo}
                    </span>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                      {plan.customerName}
                    </h3>
                    {overdueSchedules.length > 0 && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        <span>{overdueSchedules.length} Overdue</span>
                      </span>
                    )}
                    {plan.status === 'completed' && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                        Completed
                      </span>
                    )}
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-1">
                    {plan.itemDescription}
                  </div>

                  <div className="text-[11px] text-slate-400 mt-1 flex items-center gap-3 flex-wrap">
                    <span>Phone: {plan.customerPhone}</span>
                    <span>·</span>
                    <span>NIC: {plan.customerNic}</span>
                    <span>·</span>
                    <span>Collector: {plan.collectorName}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between md:justify-end gap-4 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Monthly Instalment</div>
                    <div className="text-base font-extrabold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatLKR(plan.monthlyAmount)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      Paid: {paidSchedules.length}/{plan.periodMonths} wara
                    </div>
                  </div>

                  <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="px-4 pb-2">
                <div className="w-full bg-slate-100 dark:bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${
                      percentPaid === 100 ? 'bg-emerald-500' : 'bg-indigo-600'
                    }`}
                    style={{ width: `${percentPaid}%` }}
                  />
                </div>
              </div>

              {/* Expanded Schedule & Actions */}
              {isExpanded && (
                <div className="p-4 pt-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 rounded-b-2xl space-y-4">
                  {/* Guarantor & Financial Summary */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div>
                      <div className="text-slate-400">Guarantor (ඇපකරු)</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">{plan.guarantorName}</div>
                      <div className="text-[11px] text-slate-500">{plan.guarantorPhone} · {plan.guarantorNic}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Cash Price vs Total Hire</div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {formatLKR(plan.cashPrice)} → {formatLKR(plan.totalHirePrice)}
                      </div>
                      <div className="text-[11px] text-slate-500">Down Payment: {formatLKR(plan.downPayment)}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Remaining Balance</div>
                      <div className="font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                        {formatLKR(Math.max(0, plan.totalHirePrice - totalPaidSoFar))}
                      </div>
                      <div className="text-[11px] text-slate-500">Started: {plan.startDate}</div>
                    </div>
                  </div>

                  {/* Instalment Schedule Matrix */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                      Monthly Payment Matrix (වාරික කාලසටහන)
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
                      {plan.schedules.map((sch, idx) => {
                        return (
                          <div
                            key={idx}
                            className={`p-2.5 rounded-xl border text-xs flex flex-col justify-between ${
                              sch.status === 'paid'
                                ? 'bg-emerald-50/40 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/40'
                                : sch.status === 'overdue'
                                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900'
                                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold text-slate-700 dark:text-slate-300">
                                Wara #{sch.instalmentNumber}
                              </span>
                              {sch.status === 'paid' ? (
                                <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-0.5">
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Paid</span>
                                </span>
                              ) : sch.status === 'overdue' ? (
                                <span className="text-[10px] text-rose-600 font-bold">Overdue</span>
                              ) : (
                                <span className="text-[10px] text-slate-400">Pending</span>
                              )}
                            </div>

                            <div className="font-extrabold text-sm tabular-nums text-slate-900 dark:text-slate-100 my-1">
                              {formatLKR(sch.amount)}
                            </div>

                            <div className="text-[10px] text-slate-500 mb-2">
                              Due: {sch.dueDate}
                              {sch.paidDate && <div>Paid: {sch.paidDate}</div>}
                            </div>

                            {/* Action per schedule */}
                            {sch.status !== 'paid' ? (
                              <div className="flex items-center gap-1 mt-auto pt-1 border-t border-slate-100 dark:border-slate-800">
                                <button
                                  onClick={() =>
                                    setCollectingPlan({
                                      plan,
                                      scheduleIndex: idx,
                                      amount: sch.amount
                                    })
                                  }
                                  className="flex-1 py-1 px-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-[11px] font-bold"
                                >
                                  Collect
                                </button>
                                <button
                                  onClick={() =>
                                    setReminderData({
                                      name: plan.customerName,
                                      phone: plan.customerPhone,
                                      amount: sch.amount,
                                      dueDate: sch.dueDate
                                    })
                                  }
                                  className="p-1 text-emerald-600 hover:bg-emerald-100 rounded-lg"
                                  title="WhatsApp Notice"
                                >
                                  <MessageCircle className="w-4 h-4" />
                                </button>
                              </div>
                            ) : (
                              <div className="text-[10px] text-emerald-700 font-mono text-center">
                                Rec: {sch.receiptNo}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredPlans.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No instalment plans found matching your filter.
          </div>
        )}
      </div>

      {/* Collect Payment Confirmation Modal */}
      {collectingPlan && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-150">
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 mb-1">
              Collect Instalment #{collectingPlan.scheduleIndex + 1}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Contract: {collectingPlan.plan.contractNo} ({collectingPlan.plan.customerName})
            </p>

            <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/50 mb-4 text-center">
              <div className="text-xs text-indigo-700 dark:text-indigo-300">Amount Collected (LKR)</div>
              <div className="text-xl font-black text-indigo-900 dark:text-indigo-100 tabular-nums">
                {formatLKR(collectingPlan.amount)}
              </div>
            </div>

            <div className="text-xs text-slate-500 mb-4">
              Collector: <strong>{collectingPlan.plan.collectorName}</strong>. Cash will be added to the daily drawer.
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setCollectingPlan(null)}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmCollection}
                className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-xs"
              >
                Confirm Collection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reminder Modal */}
      {reminderData && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  {language === 'si'
                    ? 'වාරික මතක්කිරීමේ WhatsApp පණිවිඩය'
                    : language === 'ta'
                    ? 'தவணை நினைவூட்டல் WhatsApp செய்தி'
                    : 'Send Instalment WhatsApp Notice'}
                </h3>
                <p className="text-xs text-slate-500">{reminderData.name} • {reminderData.phone}</p>
              </div>
              <button
                onClick={() => setReminderData(null)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Language Selection Tabs */}
            <div className="flex items-center gap-1.5 mt-3 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold">
              <button
                type="button"
                onClick={() => setWaraReminderLang('si')}
                className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
                  waraReminderLang === 'si'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                සිංහල
              </button>
              <button
                type="button"
                onClick={() => setWaraReminderLang('ta')}
                className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
                  waraReminderLang === 'ta'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                தமிழ்
              </button>
              <button
                type="button"
                onClick={() => setWaraReminderLang('en')}
                className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
                  waraReminderLang === 'en'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                English
              </button>
              <button
                type="button"
                onClick={() => setWaraReminderLang('singlish')}
                className={`flex-1 py-1.5 rounded-lg transition-colors text-center ${
                  waraReminderLang === 'singlish'
                    ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Singlish
              </button>
            </div>

            <div className="my-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto text-slate-800 dark:text-slate-200 font-sans border border-slate-200 dark:border-slate-700">
              {getCustomerReminderText(
                waraReminderLang,
                reminderData.name,
                reminderData.amount,
                reminderData.dueDate,
                'Mudalali Hire Purchase'
              )}
            </div>

            <div className="flex gap-2">
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(reminderData.phone)}?text=${encodeURIComponent(
                  getCustomerReminderText(
                    waraReminderLang,
                    reminderData.name,
                    reminderData.amount,
                    reminderData.dueDate,
                    'Mudalali Hire Purchase'
                  )
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <MessageCircle className="w-4 h-4" />
                <span>Open WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(
                    getCustomerReminderText(
                      waraReminderLang,
                      reminderData.name,
                      reminderData.amount,
                      reminderData.dueDate,
                      'Mudalali Hire Purchase'
                    )
                  );
                  showToast('Reminder copied to clipboard!', 'success');
                }}
                className="px-3 py-2.5 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-semibold"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      )}

      {/* New Hire Contract Wizard */}
      {isNewPlanModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                  New Hire Purchase Contract (වාරික ගිවිසුම)
                </h3>
                <div className="text-xs text-slate-500">
                  Calculates down payment, monthly markup & instalment schedule
                </div>
              </div>
              <button
                onClick={() => setIsNewPlanModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreatePlan} className="space-y-3 my-4">
              {/* Product quick picker */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Choose Item / Stock Product
                </label>
                <select
                  value={selectedProductId}
                  onChange={e => handleProductSelect(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="">-- Choose from Catalog or Enter Custom Item --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name} - Retail: {formatLKR(p.retailPrice)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Item Description
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Samsung 32 inch LED TV Model 2026"
                  value={itemDescription}
                  onChange={e => setItemDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              {/* Financial terms */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Cash Price
                  </label>
                  <input
                    type="number"
                    value={cashPrice}
                    onChange={e => setCashPrice(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Down Payment
                  </label>
                  <input
                    type="number"
                    value={downPayment}
                    onChange={e => setDownPayment(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Period
                  </label>
                  <select
                    value={periodMonths}
                    onChange={e => setPeriodMonths(parseInt(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value={3}>3 Months</option>
                    <option value={6}>6 Months</option>
                    <option value={8}>8 Months</option>
                    <option value={10}>10 Months</option>
                    <option value={12}>12 Months</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block mb-1">
                    Markup %
                  </label>
                  <input
                    type="number"
                    value={markupPercent}
                    onChange={e => setMarkupPercent(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Calculated Monthly Instalment Banner */}
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/30 rounded-xl border border-indigo-200/50 flex items-center justify-between">
                <div>
                  <span className="text-xs text-indigo-700 dark:text-indigo-300">Monthly Instalment:</span>
                  <div className="text-lg font-black text-indigo-900 dark:text-indigo-100 tabular-nums">
                    {formatLKR(monthlyAmount)} / month
                  </div>
                </div>
                <div className="text-right text-xs text-slate-500">
                  <div>Total Hire: {formatLKR(totalHirePayable)}</div>
                  <div>({periodMonths} wara)</div>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Buyer Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Customer full name"
                    value={custName}
                    onChange={e => setCustName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Buyer Phone *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="07x-xxxxxxx"
                    value={custPhone}
                    onChange={e => setCustPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Buyer NIC *
                  </label>
                  <input
                    type="text"
                    placeholder="National ID"
                    value={custNic}
                    onChange={e => setCustNic(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Branch & Collector
                  </label>
                  <select
                    value={branchId}
                    onChange={e => setBranchId(e.target.value as BranchId)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  >
                    {branches.map(b => (
                      <option key={b.id} value={b.id}>
                        {b.name.split(' ')[0]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guarantor Details */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Guarantor Information (ඇපකරුගේ විස්තර)
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <input
                    type="text"
                    placeholder="Guarantor Name"
                    value={guarantorName}
                    onChange={e => setGuarantorName(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Guarantor Phone"
                    value={guarantorPhone}
                    onChange={e => setGuarantorPhone(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                  <input
                    type="text"
                    placeholder="Guarantor NIC"
                    value={guarantorNic}
                    onChange={e => setGuarantorNic(e.target.value)}
                    className="px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsNewPlanModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Create Contract & Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
