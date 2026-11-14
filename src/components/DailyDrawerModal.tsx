import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { DailyExpense } from '../types';
import { formatLKR } from '../utils/formatters';
import {
  Wallet,
  Plus,
  Coins,
  CheckCircle2,
  AlertCircle,
  X,
  Coffee,
  Truck,
  Zap,
  ShoppingBag,
  Users,
  RotateCcw
} from 'lucide-react';

export const DailyDrawerModal: React.FC = () => {
  const {
    isDailyDrawerOpen,
    setIsDailyDrawerOpen,
    dailyDrawer,
    dailyExpenses,
    addDailyExpense,
    closeDailyDrawer,
    reopenDailyDrawer,
    branches,
    currentBranchId,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'summary' | 'add_expense' | 'close_drawer'>('summary');

  // Expense form
  const [expenseCat, setExpenseCat] = useState<DailyExpense['category']>('Staff Meals & Tea (කඩේ තේ/කෑම)');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expensePaidBy, setExpensePaidBy] = useState('Store Manager');

  // Closing cash form
  const [countedCash, setCountedCash] = useState<string>(dailyDrawer.expectedClosingCash.toString());
  const [closedByName, setClosedByName] = useState('Mudalali (Owner)');

  if (!isDailyDrawerOpen) return null;

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expenseAmount);
    if (!amt || amt <= 0) {
      showToast('Please enter a valid expense amount.', 'error');
      return;
    }

    addDailyExpense({
      branchId: currentBranchId === 'all' ? 'pettah' : currentBranchId,
      category: expenseCat,
      amount: amt,
      description: expenseDesc || expenseCat,
      paidBy: expensePaidBy
    });

    setExpenseAmount('');
    setExpenseDesc('');
    setActiveTab('summary');
    showToast(`Petty expense of Rs. ${amt.toLocaleString()} recorded!`, 'success');
  };

  const handleCloseDrawer = (e: React.FormEvent) => {
    e.preventDefault();
    const actual = parseFloat(countedCash);
    if (isNaN(actual)) {
      showToast('Please enter counted physical cash.', 'error');
      return;
    }

    closeDailyDrawer(actual, closedByName);
    setActiveTab('summary');
    showToast('Daily drawer closed and reconciled successfully!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Daily Podi Potha & Cash Drawer (දවසේ ලාච්චුව)
              </h3>
              <div className="text-xs text-slate-500">
                Cash sales, credit collections, petty kade expenses & day closing
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsDailyDrawerOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold my-4">
          <button
            onClick={() => setActiveTab('summary')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'summary'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Drawer Tally
          </button>
          <button
            onClick={() => setActiveTab('add_expense')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'add_expense'
                ? 'bg-amber-500 text-slate-950 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            + Log Petty Expense (කඩේ වියදම්)
          </button>
          <button
            onClick={() => setActiveTab('close_drawer')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'close_drawer'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            {dailyDrawer.isClosed ? 'Drawer Closed ✓' : 'Close Day Drawer'}
          </button>
        </div>

        {activeTab === 'summary' && (
          <div className="space-y-4">
            {/* Status indicator */}
            {dailyDrawer.isClosed ? (
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200 dark:border-emerald-800 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Day Closed at {dailyDrawer.closedAt} by {dailyDrawer.closedBy}</span>
                </div>
                <button
                  onClick={reopenDailyDrawer}
                  className="text-[11px] text-emerald-700 underline font-semibold"
                >
                  Re-Open Drawer
                </button>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-2xl border border-amber-200 dark:border-amber-800 flex items-center justify-between text-xs">
                <span className="text-amber-800 dark:text-amber-200 font-semibold">
                  Day In Progress · Cash drawer active
                </span>
                <span className="text-[10px] bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200 px-2 py-0.5 rounded-full font-bold">
                  LIVE
                </span>
              </div>
            )}

            {/* Expected Cash in Hand Calculation Box */}
            <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Opening Morning Float (ආරම්භක මුදල්)</span>
                <span className="font-bold tabular-nums text-sm">
                  {formatLKR(dailyDrawer.openingCash)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span>+ POS Counter Cash Sales</span>
                <span className="font-bold tabular-nums">
                  +{formatLKR(dailyDrawer.totalCashSales)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span>+ Credit Debtors Recovered in Cash</span>
                <span className="font-bold tabular-nums">
                  +{formatLKR(dailyDrawer.totalCreditCollections)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-emerald-400">
                <span>+ Instalment (Wara) Cash Collections</span>
                <span className="font-bold tabular-nums">
                  +{formatLKR(dailyDrawer.totalInstalmentCollections)}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs text-rose-400">
                <span>- Petty Cash Expenses (කඩේ වියදම්)</span>
                <span className="font-bold tabular-nums">
                  -{formatLKR(dailyDrawer.totalCashExpenses)}
                </span>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                <div>
                  <div className="text-[11px] text-slate-400">Expected Physical Cash in Drawer</div>
                  <div className="text-xl font-black text-amber-400 tabular-nums">
                    {formatLKR(dailyDrawer.expectedClosingCash)}
                  </div>
                </div>
                {dailyDrawer.isClosed && (
                  <div className="text-right">
                    <div className="text-[11px] text-slate-400">Actual Counted</div>
                    <div className="text-lg font-bold text-white tabular-nums">
                      {formatLKR(dailyDrawer.actualClosingCash)}
                    </div>
                    <div
                      className={`text-xs font-bold ${
                        dailyDrawer.discrepancy === 0
                          ? 'text-emerald-400'
                          : dailyDrawer.discrepancy > 0
                          ? 'text-sky-400'
                          : 'text-rose-400'
                      }`}
                    >
                      {dailyDrawer.discrepancy === 0
                        ? 'Exact Match ✓'
                        : dailyDrawer.discrepancy > 0
                        ? `+${formatLKR(dailyDrawer.discrepancy)} Overage`
                        : `${formatLKR(dailyDrawer.discrepancy)} Shortage`}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Daily Petty Expenses Feed */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Today's Petty Cash Outflows (කඩේ වියදම්)
                </h4>
                <button
                  onClick={() => setActiveTab('add_expense')}
                  className="text-xs text-amber-600 font-semibold"
                >
                  + Add Expense
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {dailyExpenses.map(exp => (
                  <div
                    key={exp.id}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-slate-800 dark:text-slate-200">
                        {exp.category}
                      </div>
                      <div className="text-[11px] text-slate-500">{exp.description}</div>
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {exp.timestamp} · Paid by: {exp.paidBy}
                      </div>
                    </div>
                    <div className="font-extrabold text-sm text-rose-600 dark:text-rose-400 tabular-nums shrink-0">
                      -{formatLKR(exp.amount)}
                    </div>
                  </div>
                ))}

                {dailyExpenses.length === 0 && (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No petty expenses logged today.
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'add_expense' && (
          <form onSubmit={handleAddExpense} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Expense Category
              </label>
              <select
                value={expenseCat}
                onChange={e => setExpenseCat(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              >
                <option value="Staff Meals & Tea (කඩේ තේ/කෑම)">Staff Meals & Plain Tea (කඩේ තේ/කෑම)</option>
                <option value="Transport & 3-Wheel (ප්‍රවාහන)">Transport / Three-Wheeler Hire (ප්‍රවාහන)</option>
                <option value="Packaging & Bags">Packaging, Bubble Wrap & Bags</option>
                <option value="Casual Wages">Casual Daily Labor / Porters (කුලී)</option>
                <option value="Utilities & Bills">Electricity / Water / Internet Bill</option>
                <option value="Other Sundry">Other Sundry Shop Expense</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Amount Paid from Cash Drawer (LKR) *
              </label>
              <input
                type="number"
                required
                placeholder="e.g. 1500"
                value={expenseAmount}
                onChange={e => setExpenseAmount(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold tabular-nums"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Description / Purpose
              </label>
              <input
                type="text"
                placeholder="e.g. Morning short eats from Saiva hotel for 4 shop boys"
                value={expenseDesc}
                onChange={e => setExpenseDesc(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Authorized / Paid By
              </label>
              <input
                type="text"
                value={expensePaidBy}
                onChange={e => setExpensePaidBy(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs"
              >
                Deduct from Drawer
              </button>
            </div>
          </form>
        )}

        {activeTab === 'close_drawer' && (
          <form onSubmit={handleCloseDrawer} className="space-y-4">
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div className="text-slate-500">System Calculated Expected Cash:</div>
              <div className="text-lg font-black text-slate-900 dark:text-slate-100 tabular-nums">
                {formatLKR(dailyDrawer.expectedClosingCash)}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Physical Cash Notes Counted in Drawer (LKR) *
              </label>
              <input
                type="number"
                required
                value={countedCash}
                onChange={e => setCountedCash(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-black tabular-nums text-slate-900 dark:text-slate-100"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Closing Manager Name / Signature
              </label>
              <input
                type="text"
                value={closedByName}
                onChange={e => setClosedByName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('summary')}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Lock & Close Drawer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
