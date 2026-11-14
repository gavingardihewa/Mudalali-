import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Product, BranchId } from '../types';
import { formatLKR } from '../utils/formatters';
import {
  Boxes,
  Plus,
  Search,
  ArrowLeftRight,
  AlertTriangle,
  Building2,
  Check,
  Edit2,
  X,
  TrendingDown,
  Layers,
  SlidersHorizontal,
  BellRing
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  const {
    currentBranchId,
    setCurrentBranchId,
    branches,
    products,
    updateProductStock,
    updateProductMinStock,
    addProduct,
    setIsTransferModalOpen,
    language,
    showToast
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [filterLowStockOnly, setFilterLowStockOnly] = useState(false);

  // Stock Adjustment state
  const [adjustingProduct, setAdjustingProduct] = useState<{
    product: Product;
    branchId: BranchId;
    currentQty: number;
  } | null>(null);
  const [adjustmentValue, setAdjustmentValue] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('Stock Count Audit (තොග පරීක්ෂාව)');

  // Threshold Preset Adjustment state
  const [editingThresholdProduct, setEditingThresholdProduct] = useState<Product | null>(null);
  const [newThresholdInput, setNewThresholdInput] = useState('5');

  // Add Product modal
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newSinhalaName, setNewSinhalaName] = useState('');
  const [newCategory, setNewCategory] = useState<Product['category']>('Electronics & Appliances');
  const [newCost, setNewCost] = useState('');
  const [newWholesale, setNewWholesale] = useState('');
  const [newRetail, setNewRetail] = useState('');
  const [newUnit, setNewUnit] = useState<Product['unit']>('pcs');
  const [newMinLevel, setNewMinLevel] = useState('5');
  const [initialBranchStocks, setInitialBranchStocks] = useState<Record<BranchId, number>>({
    pettah: 10,
    kandy: 5,
    negombo: 3,
    galle: 2
  });

  const categories = [
    'all',
    'Electronics & Appliances',
    'Hardware & Electrical',
    'Groceries & Provisions',
    'Textiles & Garments',
    'Automotive & Spares'
  ];

  // Helper to determine low stock status for any item
  const getProductStockStatus = (p: Product) => {
    const totalStock = Object.values(p.stocks).reduce((a, b) => a + b, 0);
    const threshold = p.minStockLevel || 5;

    const lowBranches = branches.filter(b => (p.stocks[b.id] || 0) <= threshold);
    const outOfStockBranches = branches.filter(b => (p.stocks[b.id] || 0) === 0);

    let isLow = false;
    let isOutOfStock = false;
    let isCritical = false;
    let activeStock = totalStock;

    if (currentBranchId === 'all') {
      activeStock = totalStock;
      isLow = totalStock <= threshold * 2 || lowBranches.length > 0;
      isOutOfStock = totalStock === 0;
      isCritical = totalStock > 0 && totalStock <= threshold;
    } else {
      activeStock = p.stocks[currentBranchId] || 0;
      isLow = activeStock <= threshold;
      isOutOfStock = activeStock === 0;
      isCritical = activeStock > 0 && activeStock <= Math.max(1, Math.floor(threshold / 2));
    }

    return {
      isLow,
      isOutOfStock,
      isCritical,
      totalStock,
      activeStock,
      threshold,
      lowBranches,
      outOfStockBranches
    };
  };

  const lowStockProducts = products.filter(p => getProductStockStatus(p).isLow);

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sinhalaName && p.sinhalaName.includes(searchQuery));
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;

    let matchesLowStock = true;
    if (filterLowStockOnly) {
      matchesLowStock = getProductStockStatus(p).isLow;
    }

    return matchesSearch && matchesCategory && matchesLowStock;
  });

  const handleConfirmAdjustment = () => {
    if (!adjustingProduct) return;
    const newQty = parseInt(adjustmentValue);
    if (isNaN(newQty) || newQty < 0) {
      showToast('Please enter a valid stock quantity.', 'error');
      return;
    }
    updateProductStock(adjustingProduct.product.id, adjustingProduct.branchId, newQty);
    setAdjustingProduct(null);
    showToast(`Stock updated to ${newQty} units!`, 'success');
  };

  const handleSaveThreshold = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingThresholdProduct) return;
    const val = parseInt(newThresholdInput);
    if (isNaN(val) || val < 1) {
      showToast('Please enter a valid positive threshold.', 'error');
      return;
    }
    updateProductMinStock(editingThresholdProduct.id, val);
    showToast(`Alert threshold for "${editingThresholdProduct.name}" set to ${val} units!`, 'success');
    setEditingThresholdProduct(null);
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode || !newName || !newRetail) {
      showToast('Please fill product code, name, and retail price.', 'error');
      return;
    }

    addProduct({
      code: newCode.toUpperCase(),
      name: newName,
      sinhalaName: newSinhalaName || undefined,
      category: newCategory,
      costPrice: parseFloat(newCost) || 0,
      wholesalePrice: parseFloat(newWholesale) || parseFloat(newRetail),
      retailPrice: parseFloat(newRetail),
      unit: newUnit,
      stocks: initialBranchStocks,
      minStockLevel: parseInt(newMinLevel) || 5
    });

    setIsAddModalOpen(false);
    setNewCode('');
    setNewName('');
    setNewSinhalaName('');
    setNewCost('');
    setNewWholesale('');
    setNewRetail('');
    setNewMinLevel('5');
    showToast(`Product "${newName}" added with threshold of ${parseInt(newMinLevel) || 5} units!`, 'success');
  };

  return (
    <div className="pb-24 max-w-7xl mx-auto space-y-4">
      {/* Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 sm:p-5 border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
                  {language === 'si'
                    ? 'භාණ්ඩ තොගය සහ ශාඛා'
                    : language === 'ta'
                    ? 'பொருட்கள் இருப்பு & கிளைகள்'
                    : 'Physical Multi-Branch Stock'}
                </h2>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-semibold">
                  {products.length} SKUs
                </span>
                {lowStockProducts.length > 0 && (
                  <button
                    onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
                    className="text-xs px-2.5 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 font-bold flex items-center gap-1 cursor-pointer transition-colors hover:bg-rose-100"
                  >
                    <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400" />
                    <span>{lowStockProducts.length} Low Stock Alerts</span>
                  </button>
                )}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {language === 'si'
                  ? 'පිටකොටුව ප්‍රධාන මධ්‍යස්ථානය, මහනුවර, මීගමුව සහ ගාල්ල ශාඛා තොග නිරීක්ෂණය'
                  : language === 'ta'
                  ? 'புறக்கோட்டை பிரதான மையம், கண்டி, நீர்கொழும்பு & காலி இருப்பு நிலவரம்'
                  : 'Pettah Central Hub, Kandy, Negombo & Galle inventory tracking'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800 text-xs font-bold rounded-xl hover:bg-sky-100 transition-colors cursor-pointer"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>
                {language === 'si'
                  ? 'ශාඛා අතර මාරුවීම්'
                  : language === 'ta'
                  ? 'கிளை மாற்றங்கள்'
                  : 'Inter-Branch Transfer'}
              </span>
            </button>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 dark:bg-amber-600 text-white text-xs font-bold rounded-xl shadow-xs hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>
                {language === 'si'
                  ? 'නව භාණ්ඩයක්'
                  : language === 'ta'
                  ? 'புதிய பொருள்'
                  : 'Add New Product'}
              </span>
            </button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder={
                language === 'si'
                  ? 'භාණ්ඩ කේතය, නම හෝ විස්තරය සොයන්න...'
                  : language === 'ta'
                  ? 'SKU குறியீடு, பெயர் அல்லது பொருள் விவரம் தேடுக...'
                  : 'Search by SKU code, name or description...'
              }
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>

          <button
            onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
            className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap ${
              filterLowStockOnly
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900 hover:bg-rose-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
            <span>
              {language === 'si'
                ? `අඩු තොග පමණි (${lowStockProducts.length})`
                : language === 'ta'
                ? `குறைந்த இருப்பு மட்டும் (${lowStockProducts.length})`
                : `Low Stock Only (${lowStockProducts.length})`}
            </span>
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-3 text-xs">
          {categories.map(c => (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-3 py-1 rounded-lg whitespace-nowrap font-medium transition-colors cursor-pointer ${
                selectedCategory === c
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}
            >
              {c === 'all' ? 'All Categories' : c}
            </button>
          ))}
        </div>
      </div>

      {/* Prominent Low Stock Alert Banner */}
      {lowStockProducts.length > 0 && (
        <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/70 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-500 text-white flex items-center justify-center shrink-0 shadow-xs">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-extrabold text-xs sm:text-sm text-rose-950 dark:text-rose-100">
                  {language === 'si'
                    ? `අඩු තොග අනතුරු ඇඟවීම්: භාණ්ඩ ${lowStockProducts.length}ක් අවම සීමාවට වඩා පහළ වැටී ඇත`
                    : language === 'ta'
                    ? `குறைந்த இருப்பு எச்சரிக்கை: ${lowStockProducts.length} பொருட்கள் நிர்ணயித்த அளவுக்குக் கீழ் உள்ளன`
                    : `Low Stock Alert: ${lowStockProducts.length} Items Below Preset Minimum Threshold`}
                </span>
                <span className="px-2 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-200/80 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 uppercase tracking-wider">
                  {currentBranchId === 'all' ? 'Multi-Branch Alert' : branches.find(b => b.id === currentBranchId)?.name.split(' ')[0]}
                </span>
              </div>
              <p className="text-xs text-rose-700 dark:text-rose-300 mt-0.5">
                {language === 'si'
                  ? 'නියමිත තොග සීමාව ඉක්මවා ඇති භාණ්ඩ සඳහා සැපයුම්කරුවන්ගෙන් නැවත ඇණවුම් (PO) කරන්න හෝ වෙනත් ශාඛාවකින් තොග මාරු කරන්න.'
                  : language === 'ta'
                  ? 'நிர்ணயிக்கப்பட்ட அளவுக்குக் கீழ் குறைந்துள்ள பொருட்களுக்கு சப்ளையர் ஆர்டர் அல்லது கிளை மாற்றம் செய்க.'
                  : 'Items have dropped below your configured safety thresholds. Replenish immediately to prevent lost sales.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
            <button
              onClick={() => setFilterLowStockOnly(!filterLowStockOnly)}
              className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-2xs cursor-pointer flex items-center justify-center gap-1.5 ${
                filterLowStockOnly
                  ? 'bg-rose-600 text-white hover:bg-rose-700'
                  : 'bg-white dark:bg-slate-800 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-700 hover:bg-rose-100/50'
              }`}
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{filterLowStockOnly ? 'Show All Products' : `Filter ${lowStockProducts.length} Low Stock SKUs`}</span>
            </button>

            <button
              onClick={() => setIsTransferModalOpen(true)}
              className="flex-1 sm:flex-none px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors shadow-2xs cursor-pointer flex items-center justify-center gap-1.5"
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
              <span>Transfer Stock</span>
            </button>
          </div>
        </div>
      )}

      {/* Stock Items Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
              <tr>
                <th className="py-3 px-4 min-w-[220px]">Item & Alert Status</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3 text-right">Cost Price</th>
                <th className="py-3 px-3 text-right">Wholesale</th>
                <th className="py-3 px-3 text-right">Retail (Rs.)</th>
                <th className="py-3 px-3 text-center">Alert Threshold</th>
                <th className="py-3 px-4 text-center">Pettah Hub</th>
                <th className="py-3 px-4 text-center">Kandy</th>
                <th className="py-3 px-4 text-center">Negombo</th>
                <th className="py-3 px-4 text-center">Galle</th>
                <th className="py-3 px-4 text-center">Total Stock</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
              {filteredProducts.map(prod => {
                const status = getProductStockStatus(prod);
                const totalStock = status.totalStock;

                return (
                  <tr
                    key={prod.id}
                    className={`transition-colors ${
                      status.isOutOfStock
                        ? 'bg-rose-50/40 dark:bg-rose-950/20 hover:bg-rose-50/60'
                        : status.isLow
                        ? 'bg-amber-50/30 dark:bg-amber-950/15 hover:bg-amber-50/50'
                        : 'hover:bg-slate-50/70 dark:hover:bg-slate-800/40'
                    }`}
                  >
                    <td className="py-3 px-4 max-w-[280px]">
                      <div className="font-bold text-slate-900 dark:text-slate-100 truncate">
                        {prod.name}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                        <span>{prod.code}</span>
                        {prod.sinhalaName && (
                          <>
                            <span aria-hidden="true">·</span>
                            <span className="text-slate-500 font-sans truncate">{prod.sinhalaName}</span>
                          </>
                        )}
                      </div>

                      {/* Prominent Low Stock Alert Badge */}
                      {status.isLow && (
                        <div
                          className={`mt-1.5 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight border transition-all ${
                            status.isOutOfStock
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-200 border-rose-300 dark:border-rose-800'
                              : status.isCritical
                              ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700'
                              : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-900'
                          }`}
                          title={`Configured Alert Threshold: ${prod.minStockLevel} ${prod.unit}`}
                        >
                          <AlertTriangle className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0 animate-pulse" />
                          <span>
                            {status.isOutOfStock
                              ? (language === 'si' ? 'තොග අවසන් (0)' : language === 'ta' ? 'கையிருப்பு இல்லை (0)' : 'Out of Stock Alert')
                              : status.isCritical
                              ? (language === 'si' ? `අතිශය අඩු තොගය (අවම: ${prod.minStockLevel})` : language === 'ta' ? `மிகக் குறைந்த இருப்பு (குறைந்தது: ${prod.minStockLevel})` : `Critical Low Stock (≤ ${prod.minStockLevel})`)
                              : (language === 'si' ? `අඩු තොග අනතුරු ඇඟවීම (අවම: ${prod.minStockLevel})` : language === 'ta' ? `குறைந்த இருப்பு எச்சரிக்கை (குறைந்தது: ${prod.minStockLevel})` : `Low Stock Alert · Min: ${prod.minStockLevel}`)}
                          </span>
                          {currentBranchId === 'all' && status.lowBranches.length > 0 && (
                            <span className="text-[9px] font-normal opacity-80">
                              [{status.lowBranches.map(b => b.name.split(' ')[0]).join(', ')}]
                            </span>
                          )}
                        </div>
                      )}
                    </td>

                    <td className="py-3 px-3 text-slate-500 whitespace-nowrap">
                      {prod.category}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-slate-600 dark:text-slate-400 tabular-nums">
                      {formatLKR(prod.costPrice)}
                    </td>

                    <td className="py-3 px-3 text-right font-medium text-amber-700 dark:text-amber-400 tabular-nums">
                      {formatLKR(prod.wholesalePrice)}
                    </td>

                    <td className="py-3 px-3 text-right font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                      {formatLKR(prod.retailPrice)}
                    </td>

                    {/* Alert Threshold Column (Click to Edit) */}
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          setEditingThresholdProduct(prod);
                          setNewThresholdInput(prod.minStockLevel.toString());
                        }}
                        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-100 hover:bg-amber-100 dark:bg-slate-800 dark:hover:bg-amber-950/50 text-slate-700 dark:text-slate-200 hover:text-amber-800 dark:hover:text-amber-300 font-bold text-xs tabular-nums border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer group"
                        title="Click to edit preset low stock alert threshold"
                      >
                        <SlidersHorizontal className="w-2.5 h-2.5 text-slate-400 group-hover:text-amber-600" />
                        <span>≤ {prod.minStockLevel} {prod.unit}</span>
                      </button>
                    </td>

                    {/* Stock by branch with click to adjust */}
                    {(['pettah', 'kandy', 'negombo', 'galle'] as BranchId[]).map(bId => {
                      const count = prod.stocks[bId] || 0;
                      const isBranchLow = count <= prod.minStockLevel;

                      return (
                        <td key={bId} className="py-3 px-4 text-center">
                          <button
                            onClick={() => {
                              setAdjustingProduct({
                                product: prod,
                                branchId: bId,
                                currentQty: count
                              });
                              setAdjustmentValue(count.toString());
                            }}
                            className={`px-2 py-1 rounded-md text-xs font-bold tabular-nums transition-colors cursor-pointer ${
                              count === 0
                                ? 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-200 border border-rose-300 dark:border-rose-800'
                                : isBranchLow
                                ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-200'
                            }`}
                            title={`Click to adjust ${branches.find(b => b.id === bId)?.name.split(' ')[0]} stock (Threshold: ${prod.minStockLevel})`}
                          >
                            {count}
                          </button>
                        </td>
                      );
                    })}

                    {/* Total Stock */}
                    <td className="py-3 px-4 text-center">
                      <div className={`font-extrabold tabular-nums text-xs ${
                        status.isOutOfStock
                          ? 'text-rose-600 dark:text-rose-400'
                          : status.isLow
                          ? 'text-rose-700 dark:text-rose-400'
                          : 'text-slate-900 dark:text-slate-100'
                      }`}>
                        {totalStock} {prod.unit}
                      </div>
                      {status.isLow && (
                        <span className="text-[9px] font-bold text-rose-600 dark:text-rose-400 uppercase tracking-tight block">
                          Low Stock
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => {
                            setEditingThresholdProduct(prod);
                            setNewThresholdInput(prod.minStockLevel.toString());
                          }}
                          className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/40 rounded-lg cursor-pointer"
                          title="Preset Alert Threshold"
                        >
                          <SlidersHorizontal className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setIsTransferModalOpen(true)}
                          className="p-1.5 text-sky-600 hover:bg-sky-50 dark:hover:bg-sky-950/40 rounded-lg cursor-pointer"
                          title="Transfer stock to another branch"
                        >
                          <ArrowLeftRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="p-8 text-center text-xs text-slate-400 space-y-2">
            <AlertTriangle className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
            <p>No products match the selected criteria.</p>
            {filterLowStockOnly && (
              <button
                onClick={() => setFilterLowStockOnly(false)}
                className="text-amber-600 hover:underline font-bold text-xs cursor-pointer"
              >
                Clear Low Stock filter to show all {products.length} SKUs
              </button>
            )}
          </div>
        )}
      </div>

      {/* Threshold Setting Modal */}
      {editingThresholdProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                  Preset Low Stock Alert Threshold
                </h3>
              </div>
              <button
                onClick={() => setEditingThresholdProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:text-slate-800 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleSaveThreshold} className="my-3 space-y-3 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold block">Target SKU</span>
                <div className="font-bold text-sm text-slate-900 dark:text-slate-100 mt-0.5">
                  {editingThresholdProduct.name}
                </div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {editingThresholdProduct.code} · Current stock: {Object.values(editingThresholdProduct.stocks).reduce((a, b) => a + b, 0)} {editingThresholdProduct.unit}
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Trigger Alert When Stock Drops To or Below:
                </label>
                <div className="relative">
                  <input
                    type="number"
                    min="1"
                    required
                    value={newThresholdInput}
                    onChange={e => setNewThresholdInput(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-extrabold tabular-nums text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-slate-400">
                    {editingThresholdProduct.unit}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Mudalali OS will render the 'Low Stock Alert' badge whenever inventory in any branch falls below this preset threshold.
                </p>
              </div>

              {/* Quick preset buttons */}
              <div>
                <span className="text-[10px] font-semibold text-slate-500 block mb-1">Quick Presets:</span>
                <div className="flex gap-1.5">
                  {[2, 3, 5, 10, 20].map(val => (
                    <button
                      key={val}
                      type="button"
                      onClick={() => setNewThresholdInput(val.toString())}
                      className={`flex-1 py-1 rounded-lg border text-xs font-bold transition-colors cursor-pointer ${
                        newThresholdInput === val.toString()
                          ? 'border-amber-500 bg-amber-500 text-slate-950'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {val}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingThresholdProduct(null)}
                  className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Save Preset Alert
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock Adjustment Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100">
                Adjust Physical Stock
              </h3>
              <button
                onClick={() => setAdjustingProduct(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="my-3 space-y-2 text-xs">
              <div className="font-bold text-slate-800 dark:text-slate-200">
                {adjustingProduct.product.name}
              </div>
              <div className="text-slate-500">
                Branch: {branches.find(b => b.id === adjustingProduct.branchId)?.name}
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  New Physical Count Quantity
                </label>
                <input
                  type="number"
                  value={adjustmentValue}
                  onChange={e => setAdjustmentValue(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-base font-bold tabular-nums"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  Reason for Adjustment
                </label>
                <select
                  value={adjustmentReason}
                  onChange={e => setAdjustmentReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                >
                  <option value="Stock Count Audit (තොග පරීක්ෂාව)">Physical Stock Audit</option>
                  <option value="Damaged / Broken in transit">Damaged in Transit</option>
                  <option value="Customer Return / Exchange">Customer Return</option>
                  <option value="Pola / Market Shrinkage">Pola Discrepancy</option>
                </select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setAdjustingProduct(null)}
                className="flex-1 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAdjustment}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs shadow-xs cursor-pointer"
              >
                Update Stock
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add New Product Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full max-h-[92vh] overflow-y-auto animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-base text-slate-900 dark:text-slate-100">
                Add New Product / SKU to Catalog
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3 my-4">
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    SKU Code *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. ELEC-BL-01"
                    value={newCode}
                    onChange={e => setNewCode(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Product Title (English) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Panasonic Blender 450W"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Sinhala Name (කඩේ නම)
                  </label>
                  <input
                    type="text"
                    placeholder="පැනසොනික් බ්ලෙන්ඩරය"
                    value={newSinhalaName}
                    onChange={e => setNewSinhalaName(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Category
                  </label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    <option value="Electronics & Appliances">Electronics & Appliances</option>
                    <option value="Hardware & Electrical">Hardware & Electrical</option>
                    <option value="Groceries & Provisions">Groceries & Provisions</option>
                    <option value="Textiles & Garments">Textiles & Garments</option>
                    <option value="Automotive & Spares">Automotive & Spares</option>
                  </select>
                </div>
              </div>

              {/* Pricing breakdown & Alert Threshold */}
              <div className="grid grid-cols-4 gap-2">
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Cost (Rs.)
                  </label>
                  <input
                    type="number"
                    placeholder="Cost"
                    value={newCost}
                    onChange={e => setNewCost(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Wholesale
                  </label>
                  <input
                    type="number"
                    placeholder="Wholesale"
                    value={newWholesale}
                    onChange={e => setNewWholesale(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block mb-1">
                    Retail (Rs.) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Retail"
                    value={newRetail}
                    onChange={e => setNewRetail(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-bold tabular-nums"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block mb-1">
                    Alert Min *
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    placeholder="5"
                    value={newMinLevel}
                    onChange={e => setNewMinLevel(e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-rose-50/50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 rounded-xl text-xs font-bold tabular-nums text-rose-900 dark:text-rose-100"
                    title="Low Stock Alert triggers when quantity drops to or below this"
                  />
                </div>
              </div>

              {/* Initial Branch Stock Allocation */}
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  Initial Stock Quantities by Branch:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {branches.map(b => (
                    <div key={b.id}>
                      <span className="text-[10px] text-slate-500 block truncate">{b.name.split(' ')[0]}</span>
                      <input
                        type="number"
                        value={initialBranchStocks[b.id] || 0}
                        onChange={e =>
                          setInitialBranchStocks(prev => ({
                            ...prev,
                            [b.id]: parseInt(e.target.value) || 0
                          }))
                        }
                        className="w-full px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-xs font-bold text-center tabular-nums"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-slate-900 dark:bg-amber-600 text-white font-bold rounded-xl text-xs shadow-xs cursor-pointer"
                >
                  Save Product & Set Threshold
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
