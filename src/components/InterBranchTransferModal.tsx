import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { BranchId } from '../types';
import {
  ArrowLeftRight,
  Boxes,
  Plus,
  Trash2,
  CheckCircle2,
  Truck,
  X,
  AlertCircle
} from 'lucide-react';

export const InterBranchTransferModal: React.FC = () => {
  const {
    isTransferModalOpen,
    setIsTransferModalOpen,
    branches,
    products,
    stockTransfers,
    initiateStockTransfer,
    completeStockTransfer,
    showToast
  } = useApp();

  const [activeTab, setActiveTab] = useState<'transfers_list' | 'new_transfer'>('transfers_list');

  // New transfer form state
  const [fromBranch, setFromBranch] = useState<BranchId>('pettah');
  const [toBranch, setToBranch] = useState<BranchId>('kandy');
  const [transferItems, setTransferItems] = useState<{ productId: string; quantity: number }[]>([
    { productId: products[0]?.id || '', quantity: 1 }
  ]);
  const [notes, setNotes] = useState('Dispatched via Store Lorry / Fort Cargo');

  if (!isTransferModalOpen) return null;

  const handleAddItem = () => {
    setTransferItems(prev => [...prev, { productId: products[0]?.id || '', quantity: 1 }]);
  };

  const handleRemoveItem = (index: number) => {
    setTransferItems(prev => prev.filter((_, idx) => idx !== index));
  };

  const handleUpdateItem = (index: number, field: 'productId' | 'quantity', val: any) => {
    setTransferItems(prev =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: val } : item))
    );
  };

  const handleInitiate = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromBranch === toBranch) {
      showToast('Source and destination branches cannot be the same.', 'error');
      return;
    }

    if (transferItems.length === 0) {
      showToast('Please add at least one product.', 'error');
      return;
    }

    // Verify stock availability in fromBranch
    for (const item of transferItems) {
      const prod = products.find(p => p.id === item.productId);
      const available = prod?.stocks[fromBranch] || 0;
      if (item.quantity > available) {
        showToast(
          `Insufficient stock for ${prod?.name}. Available: ${available} units.`,
          'error'
        );
        return;
      }
    }

    initiateStockTransfer(fromBranch, toBranch, transferItems, notes);
    setActiveTab('transfers_list');
    showToast('Stock transfer dispatched in-transit successfully!', 'success');
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-2xl w-full max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Inter-Branch Stock Movement (ශාඛා අතර භාණ්ඩ හුවමාරුව)
              </h3>
              <div className="text-xs text-slate-500">
                Move inventory between Pettah Hub, Kandy, Negombo, and Galle
              </div>
            </div>
          </div>
          <button
            onClick={() => setIsTransferModalOpen(false)}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold my-4">
          <button
            onClick={() => setActiveTab('transfers_list')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'transfers_list'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-500'
            }`}
          >
            Active & Past Transfers ({stockTransfers.length})
          </button>
          <button
            onClick={() => setActiveTab('new_transfer')}
            className={`flex-1 py-1.5 rounded-lg transition-colors ${
              activeTab === 'new_transfer'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-500'
            }`}
          >
            + Create New Transfer
          </button>
        </div>

        {activeTab === 'transfers_list' ? (
          <div className="space-y-3">
            {stockTransfers.map(tr => {
              const fromName = branches.find(b => b.id === tr.fromBranch)?.name.split(' ')[0];
              const toName = branches.find(b => b.id === tr.toBranch)?.name.split(' ')[0];
              const isInTransit = tr.status === 'in-transit';

              return (
                <div
                  key={tr.id}
                  className={`p-4 rounded-2xl border text-xs ${
                    isInTransit
                      ? 'border-sky-300 dark:border-sky-900/60 bg-sky-50/20 dark:bg-sky-950/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-700 dark:text-slate-300">
                        {tr.transferNo}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] flex items-center gap-1 ${
                          isInTransit
                            ? 'bg-sky-100 text-sky-800 dark:bg-sky-950 dark:text-sky-300'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isInTransit ? <Truck className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        <span>{isInTransit ? 'In-Transit' : 'Received & Stocked'}</span>
                      </span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{tr.requestDate}</span>
                  </div>

                  {/* Route */}
                  <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200 my-1 text-sm">
                    <span>{fromName}</span>
                    <ArrowLeftRight className="w-3.5 h-3.5 text-sky-500" />
                    <span>{toName}</span>
                  </div>

                  {/* Items */}
                  <div className="space-y-1 my-2 bg-slate-50 dark:bg-slate-800/40 p-2.5 rounded-xl">
                    {tr.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between">
                        <span className="font-medium text-slate-700 dark:text-slate-300">
                          {item.productName} ({item.productCode})
                        </span>
                        <span className="font-bold tabular-nums text-slate-900 dark:text-slate-100">
                          {item.quantity} units
                        </span>
                      </div>
                    ))}
                  </div>

                  {tr.notes && (
                    <div className="text-[11px] text-slate-500 italic mb-2">
                      Note: {tr.notes}
                    </div>
                  )}

                  {/* Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[11px] text-slate-400">
                      Dispatched by: {tr.dispatchedBy}
                    </span>
                    {isInTransit && (
                      <button
                        onClick={() => completeStockTransfer(tr.id, 'Destination Manager')}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1 shadow-xs"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept & Add to {toName} Stock</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}

            {stockTransfers.length === 0 && (
              <div className="p-8 text-center text-xs text-slate-400">
                No active stock transfers.
              </div>
            )}
          </div>
        ) : (
          <form onSubmit={handleInitiate} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Source Branch (Dispatched From)
                </label>
                <select
                  value={fromBranch}
                  onChange={e => setFromBranch(e.target.value as BranchId)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Destination Branch (Receiving)
                </label>
                <select
                  value={toBranch}
                  onChange={e => setToBranch(e.target.value as BranchId)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {branches.map(b => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Transfer Items Table */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                  Select Products to Transfer
                </label>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs text-sky-600 font-semibold flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Another Item</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto">
                {transferItems.map((item, idx) => {
                  const prod = products.find(p => p.id === item.productId);
                  const availableInSource = prod?.stocks[fromBranch] || 0;

                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700"
                    >
                      <select
                        value={item.productId}
                        onChange={e => handleUpdateItem(idx, 'productId', e.target.value)}
                        className="flex-1 px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs"
                      >
                        {products.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.name} (Avail: {p.stocks[fromBranch] || 0} {p.unit})
                          </option>
                        ))}
                      </select>

                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          min={1}
                          max={availableInSource}
                          value={item.quantity}
                          onChange={e => handleUpdateItem(idx, 'quantity', parseInt(e.target.value) || 1)}
                          className="w-16 px-2 py-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center tabular-nums"
                        />
                        <span className="text-[11px] text-slate-400">units</span>
                      </div>

                      {transferItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="p-1.5 text-rose-500 hover:text-rose-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Dispatch Method & Courier Notes
              </label>
              <input
                type="text"
                placeholder="e.g. Sent via Kandy Intercity Train cargo / Three-wheeler"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setActiveTab('transfers_list')}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
              >
                Back
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-xs"
              >
                Dispatch Stock Transfer
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
