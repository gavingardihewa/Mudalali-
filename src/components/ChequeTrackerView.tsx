import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Cheque, SriLankanBank, BranchId } from '../types';
import { formatLKR } from '../utils/formatters';
import {
  Landmark,
  Plus,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  Filter,
  X,
  Building2
} from 'lucide-react';

export const ChequeTrackerView: React.FC = () => {
  const {
    currentBranchId,
    cheques,
    addCheque,
    updateChequeStatus,
    branches,
    language,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'received' | 'issued' | 'maturing_soon' | 'returned'>('all');

  // New Cheque Modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newNumber, setNewNumber] = useState('');
  const [newBank, setNewBank] = useState<SriLankanBank>('Commercial Bank of Ceylon');
  const [newBranchName, setNewBranchName] = useState('Colombo Main');
  const [newAmount, setNewAmount] = useState('');
  const [newType, setNewType] = useState<'received' | 'issued'>('received');
  const [newParty, setNewParty] = useState('');
  const [newPartyPhone, setNewPartyPhone] = useState('');
  const [newMaturityDate, setNewMaturityDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [newNotes, setNewNotes] = useState('');
  const [newChequeBranch, setNewChequeBranch] = useState<BranchId>('pettah');

  // Filter cheques
  const filteredCheques = cheques.filter(chq => {
    const matchesBranch = currentBranchId === 'all' || chq.branchId === currentBranchId;
    const matchesSearch =
      chq.chequeNumber.includes(searchQuery) ||
      chq.partyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      chq.bank.toLowerCase().includes(searchQuery.toLowerCase());

    let matchesFilter = true;
    if (filterType === 'received') matchesFilter = chq.type === 'received';
    else if (filterType === 'issued') matchesFilter = chq.type === 'issued';
    else if (filterType === 'returned') matchesFilter = chq.status === 'returned';
    else if (filterType === 'maturing_soon') {
      const today = new Date();
      const mat = new Date(chq.maturityDate);
      const diffDays = Math.ceil((mat.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      matchesFilter = chq.status === 'pending' && diffDays >= 0 && diffDays <= 4;
    }

    return matchesBranch && matchesSearch && matchesFilter;
  });

  const totalReceivedPDC = cheques
    .filter(c => c.type === 'received' && c.status === 'pending')
    .reduce((s, c) => s + c.amount, 0);

  const totalIssuedPDC = cheques
    .filter(c => c.type === 'issued' && c.status === 'pending')
    .reduce((s, c) => s + c.amount, 0);

  const returnedCount = cheques.filter(c => c.status === 'returned').length;

  const handleCreateCheque = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber.trim() || !newAmount || !newParty.trim()) {
      showToast('Please fill cheque number, amount, and party name.', 'error');
      return;
    }

    addCheque({
      chequeNumber: newNumber.trim(),
      bank: newBank,
      branchName: newBranchName || 'City Branch',
      amount: parseFloat(newAmount),
      type: newType,
      partyName: newParty.trim(),
      partyPhone: newPartyPhone || undefined,
      receivedOrIssuedDate: new Date().toISOString().split('T')[0],
      maturityDate: newMaturityDate,
      status: 'pending',
      notes: newNotes || undefined,
      branchId: newChequeBranch
    });

    setIsAddModalOpen(false);
    setNewNumber('');
    setNewAmount('');
    setNewParty('');
    setNewPartyPhone('');
    setNewNotes('');
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-600 dark:text-sky-400 flex items-center justify-center font-bold">
              <Landmark className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>
                  {language === 'si'
                    ? 'චෙක්පත් සහ PDC කළමනාකරණය'
                    : language === 'ta'
                    ? 'காசோலைகள் & PDC மேலாண்மை'
                    : 'Cheque & PDC Register'}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950 text-sky-800 dark:text-sky-300 font-semibold">
                  {cheques.length} Cheques
                </span>
              </h2>
              <div className="text-xs text-slate-500">
                {language === 'si'
                  ? 'පාරිභෝගිකයින්ගේ ඉදිරි දින චෙක්පත් (PDC), සැපයුම්කරුවන්ගේ ගෙවීම් සහ අගරු වූ චෙක්පත්'
                  : language === 'ta'
                  ? 'வாடிக்கையாளர் பின்தேதியிட்ட காசோலைகள் (PDC), சப்ளையர் கொடுப்பனவுகள் & நிராகரிக்கப்பட்ட காசோலைகள்'
                  : 'Track customer Post-Dated Cheques (PDCs), supplier payments & returned cheques'}
              </div>
            </div>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-xs transition-colors self-start sm:self-auto"
          >
            <Plus className="w-4 h-4" />
            <span>
              {language === 'si'
                ? 'නව චෙක්පතක් සටහන් කරන්න'
                : language === 'ta'
                ? 'புதிய காசோலை பதிவு'
                : 'Record New Cheque'}
            </span>
          </button>
        </div>

        {/* Summary Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/20 rounded-xl border border-emerald-200/50">
            <div className="text-[11px] text-emerald-800 dark:text-emerald-300">
              {language === 'si'
                ? 'ලැබුණු පාරිභෝගික චෙක්පත් (තැන්පත් කිරීමට)'
                : language === 'ta'
                ? 'கைவசம் உள்ள வாடிக்கையாளர் PDC'
                : 'Customer PDCs in Hand (To Deposit)'}
            </div>
            <div className="text-lg font-extrabold text-emerald-900 dark:text-emerald-200 tabular-nums">
              {formatLKR(totalReceivedPDC)}
            </div>
          </div>

          <div className="p-3 bg-amber-50/50 dark:bg-amber-950/20 rounded-xl border border-amber-200/50">
            <div className="text-[11px] text-amber-800 dark:text-amber-300">
              {language === 'si'
                ? 'සැපයුම්කරුවන්ට නිකුත් කළ චෙක්පත් (බැරකම්)'
                : language === 'ta'
                ? 'வழங்கப்பட்ட சப்ளையர் காசோலைகள்'
                : 'Issued Supplier Cheques (Liabilities)'}
            </div>
            <div className="text-lg font-extrabold text-amber-900 dark:text-amber-200 tabular-nums">
              {formatLKR(totalIssuedPDC)}
            </div>
          </div>

          <div className="p-3 bg-rose-50/50 dark:bg-rose-950/20 rounded-xl border border-rose-200/50">
            <div className="text-[11px] text-rose-800 dark:text-rose-300">
              {language === 'si'
                ? 'අගරු වූ / Bounced චෙක්පත්'
                : language === 'ta'
                ? 'நிராகரிக்கப்பட்ட காசோலைகள்'
                : 'Returned / Bounced Cheques'}
            </div>
            <div className="text-lg font-extrabold text-rose-900 dark:text-rose-200 tabular-nums">
              {returnedCount} {returnedCount === 1 ? 'Cheque' : 'Cheques'}
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                language === 'si'
                  ? 'චෙක්පත් අංකය, පාර්ශ්වයේ නම හෝ බැංකුව සොයන්න...'
                  : language === 'ta'
                  ? 'காசோலை எண், பெயர் அல்லது வங்கி தேடுக...'
                  : 'Search by cheque number, party name or bank...'
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold overflow-x-auto">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'all' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs' : 'text-slate-500'
              }`}
            >
              All Cheques
            </button>
            <button
              onClick={() => setFilterType('maturing_soon')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'maturing_soon' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-500'
              }`}
            >
              Maturing in 3 Days
            </button>
            <button
              onClick={() => setFilterType('received')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'received' ? 'bg-emerald-600 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Customer PDCs
            </button>
            <button
              onClick={() => setFilterType('issued')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'issued' ? 'bg-sky-600 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Supplier Cheques
            </button>
            <button
              onClick={() => setFilterType('returned')}
              className={`px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap ${
                filterType === 'returned' ? 'bg-rose-600 text-white shadow-xs' : 'text-slate-500'
              }`}
            >
              Returned
            </button>
          </div>
        </div>
      </div>

      {/* Cheques Grid / List */}
      <div className="space-y-3">
        {filteredCheques.map(chq => {
          const isReceived = chq.type === 'received';
          const isPending = chq.status === 'pending';
          const isReturned = chq.status === 'returned';
          const isCleared = chq.status === 'cleared';
          const isDeposited = chq.status === 'deposited';

          return (
            <div
              key={chq.id}
              className={`bg-white dark:bg-slate-900 rounded-2xl p-4 border transition-all ${
                isReturned
                  ? 'border-rose-300 dark:border-rose-900/60 bg-rose-50/20 dark:bg-rose-950/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1 ${
                        isReceived
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                      }`}
                    >
                      {isReceived ? <ArrowDownLeft className="w-3 h-3" /> : <ArrowUpRight className="w-3 h-3" />}
                      <span>{isReceived ? 'Received from Customer' : 'Issued to Supplier'}</span>
                    </span>

                    <span className="font-mono text-xs font-extrabold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Chq #{chq.chequeNumber}
                    </span>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        isCleared
                          ? 'bg-emerald-100 text-emerald-800'
                          : isReturned
                          ? 'bg-rose-100 text-rose-800 font-extrabold'
                          : isDeposited
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {chq.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-1">
                    {chq.bank} · <span className="text-slate-500 font-normal">{chq.branchName}</span>
                  </div>

                  <div className="text-xs text-slate-600 dark:text-slate-300 font-medium mt-0.5">
                    {isReceived ? 'From: ' : 'To: '} <strong>{chq.partyName}</strong>
                    {chq.partyPhone && <span className="text-slate-400 font-mono ml-2">({chq.partyPhone})</span>}
                  </div>

                  {chq.notes && (
                    <div className="text-[11px] text-slate-500 mt-1 italic">
                      "{chq.notes}"
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 dark:border-slate-800">
                  <div className="text-right">
                    <div className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatLKR(chq.amount)}
                    </div>
                    <div className="text-[11px] text-slate-500 flex items-center gap-1 justify-end">
                      <Clock className="w-3 h-3" />
                      <span>Matures: <strong>{chq.maturityDate}</strong></span>
                    </div>
                  </div>

                  {/* Status update actions */}
                  <div className="flex items-center gap-1.5">
                    {isPending && (
                      <button
                        onClick={() => updateChequeStatus(chq.id, 'cleared')}
                        className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold shadow-xs"
                      >
                        Mark Cleared
                      </button>
                    )}
                    {isPending && (
                      <button
                        onClick={() => {
                          updateChequeStatus(chq.id, 'returned');
                          showToast(`Cheque #${chq.chequeNumber} marked as Returned (Insufficient Funds)`, 'error');
                        }}
                        className="px-2 py-1.5 bg-rose-100 text-rose-800 hover:bg-rose-200 rounded-lg text-xs font-semibold"
                      >
                        Mark Returned
                      </button>
                    )}
                    {isReturned && (
                      <button
                        onClick={() => updateChequeStatus(chq.id, 'cleared')}
                        className="px-2.5 py-1.5 bg-emerald-600 text-white rounded-lg text-xs font-semibold"
                      >
                        Re-Cleared
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredCheques.length === 0 && (
          <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs text-slate-500">
            No cheques found in this filter category.
          </div>
        )}
      </div>

      {/* Add New Cheque Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Record New Cheque (චෙක්පතක් ඇතුළත් කිරීම)
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateCheque} className="space-y-3 my-4">
              {/* Type toggle */}
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setNewType('received')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    newType === 'received'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Received (Customer PDC)
                </button>
                <button
                  type="button"
                  onClick={() => setNewType('issued')}
                  className={`flex-1 py-1.5 rounded-lg transition-colors ${
                    newType === 'issued'
                      ? 'bg-amber-500 text-slate-950 shadow-xs'
                      : 'text-slate-500'
                  }`}
                >
                  Issued (To Supplier)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cheque Number *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 784920"
                    value={newNumber}
                    onChange={e => setNewNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Amount (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 150000"
                    value={newAmount}
                    onChange={e => setNewAmount(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold tabular-nums"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Sri Lankan Bank
                </label>
                <select
                  value={newBank}
                  onChange={e => setNewBank(e.target.value as SriLankanBank)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
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

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Bank Branch
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Kandy Main / Pettah"
                    value={newBranchName}
                    onChange={e => setNewBranchName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Maturity / Due Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={newMaturityDate}
                    onChange={e => setNewMaturityDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Party Name (Customer / Supplier) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Rizwan Stores"
                    value={newParty}
                    onChange={e => setNewParty(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Phone Number
                  </label>
                  <input
                    type="text"
                    placeholder="07x-xxxxxxx"
                    value={newPartyPhone}
                    onChange={e => setNewPartyPhone(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Assigned Store Branch
                </label>
                <select
                  value={newChequeBranch}
                  onChange={e => setNewChequeBranch(e.target.value as BranchId)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
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
                  Notes
                </label>
                <input
                  type="text"
                  placeholder="e.g. Order #1102 payment"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl text-xs shadow-xs"
                >
                  Save to Cheque Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
