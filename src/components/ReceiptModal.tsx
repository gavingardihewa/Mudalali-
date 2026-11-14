import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { formatLKR, cleanPhoneForWhatsApp } from '../utils/formatters';
import {
  Printer,
  MessageCircle,
  X,
  CheckCircle2,
  Building2,
  QrCode
} from 'lucide-react';

export const ReceiptModal: React.FC = () => {
  const { activeReceipt, setActiveReceipt, branches } = useApp();
  const [customWhatsAppPhone, setCustomWhatsAppPhone] = useState('');

  if (!activeReceipt) return null;

  const branch = branches.find(b => b.id === activeReceipt.branchId);

  const getWhatsAppReceiptText = () => {
    let text = `🧾 *MUDALALI STORES - CASH RECEIPT*\n`;
    text += `Branch: ${branch?.name || 'Main Hub'}\n`;
    text += `Tel: ${branch?.phone || '011-2321456'}\n`;
    text += `Invoice: ${activeReceipt.invoiceNo}\n`;
    text += `Date: ${activeReceipt.timestamp}\n`;
    text += `Customer: ${activeReceipt.customerName || 'Walk-in'}\n`;
    text += `--------------------------------\n`;

    activeReceipt.items.forEach(item => {
      text += `${item.productName}\n  ${item.quantity} x Rs. ${item.unitPrice.toLocaleString()} = Rs. ${item.total.toLocaleString()}\n`;
    });

    text += `--------------------------------\n`;
    text += `*TOTAL: Rs. ${activeReceipt.total.toLocaleString()}*\n`;
    text += `Payment: ${activeReceipt.paymentMethod.toUpperCase()}\n`;
    text += `\nස්තූතියි නැවත එන්න! / Thank you, come again!`;

    return text;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:p-0 print:bg-white">
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200 dark:border-slate-800 shadow-2xl max-w-sm w-full max-h-[95vh] overflow-y-auto animate-in zoom-in-95 duration-150 print:border-none print:shadow-none print:max-w-none print:w-full">
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800 print:hidden">
          <div className="flex items-center gap-1.5 text-emerald-600 font-bold text-xs">
            <CheckCircle2 className="w-4 h-4" />
            <span>Sale Completed Successfully</span>
          </div>
          <button
            onClick={() => setActiveReceipt(null)}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Authentic Sri Lankan Thermal Bill Styling */}
        <div className="my-3 p-4 bg-slate-50 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-slate-100 space-y-3">
          {/* Bill Header */}
          <div className="text-center space-y-0.5 pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="font-extrabold text-base tracking-wider font-sans">
              MUDALALI STORES
            </div>
            <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans">
              Wholesale & Retail Commercial Trading
            </div>
            <div className="text-[10px] text-slate-500">{branch?.address}</div>
            <div className="text-[10px] text-slate-500">Tel: {branch?.phone}</div>
            <div className="text-[9px] text-slate-400 pt-0.5">BR No: PV-98402/LK</div>
          </div>

          {/* Invoice Meta */}
          <div className="text-[11px] space-y-0.5 pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-between">
              <span>Inv No:</span>
              <span className="font-bold">{activeReceipt.invoiceNo}</span>
            </div>
            <div className="flex justify-between">
              <span>Date:</span>
              <span>{activeReceipt.timestamp}</span>
            </div>
            <div className="flex justify-between">
              <span>Cashier:</span>
              <span>{activeReceipt.cashierName}</span>
            </div>
            <div className="flex justify-between">
              <span>Customer:</span>
              <span className="truncate max-w-[160px] font-medium">
                {activeReceipt.customerName || 'Walk-in Counter'}
              </span>
            </div>
          </div>

          {/* Items Table */}
          <div className="space-y-1.5 pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-between text-[10px] font-bold text-slate-400">
              <span>ITEM</span>
              <span>QTY x PRICE</span>
              <span>TOTAL</span>
            </div>
            {activeReceipt.items.map((item, idx) => (
              <div key={idx} className="space-y-0.5">
                <div className="font-medium text-[11px] truncate">{item.productName}</div>
                <div className="flex justify-between text-[10px] text-slate-500 dark:text-slate-400 tabular-nums">
                  <span>
                    {item.quantity} x {formatLKR(item.unitPrice)}
                  </span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatLKR(item.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="space-y-1 text-xs pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-between">
              <span>Subtotal:</span>
              <span className="tabular-nums">{formatLKR(activeReceipt.subtotal)}</span>
            </div>
            <div className="flex justify-between font-extrabold text-sm pt-1 border-t border-slate-200 dark:border-slate-800">
              <span>NET TOTAL:</span>
              <span className="tabular-nums text-amber-600 dark:text-amber-400">
                {formatLKR(activeReceipt.total)}
              </span>
            </div>
          </div>

          {/* Payment Method Details */}
          <div className="text-[11px] space-y-0.5 pb-2 border-b border-dashed border-slate-300 dark:border-slate-700">
            <div className="flex justify-between font-semibold">
              <span>Paid via:</span>
              <span className="uppercase text-amber-700 dark:text-amber-400">
                {activeReceipt.paymentMethod}
              </span>
            </div>
            {activeReceipt.paymentDetails?.cashTendered && (
              <>
                <div className="flex justify-between">
                  <span>Cash Tendered:</span>
                  <span className="tabular-nums">
                    {formatLKR(activeReceipt.paymentDetails.cashTendered)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-emerald-600">
                  <span>Change Given:</span>
                  <span className="tabular-nums">
                    {formatLKR(activeReceipt.paymentDetails.changeGiven || 0)}
                  </span>
                </div>
              </>
            )}
            {activeReceipt.paymentDetails?.chequeNumber && (
              <div className="flex justify-between text-[10px]">
                <span>Cheque No:</span>
                <span>
                  {activeReceipt.paymentDetails.chequeNumber} ({activeReceipt.paymentDetails.chequeBank})
                </span>
              </div>
            )}
            {activeReceipt.paymentDetails?.lankaPayRef && (
              <div className="flex justify-between text-[10px]">
                <span>LankaPay Ref:</span>
                <span>{activeReceipt.paymentDetails.lankaPayRef}</span>
              </div>
            )}
          </div>

          {/* LankaPay QR & Greeting */}
          <div className="text-center pt-1 space-y-1">
            <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400">
              <QrCode className="w-3 h-3" />
              <span>Verified LankaPay Transaction</span>
            </div>
            <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-sans">
              ස්තූතියි නැවත එන්න!
            </div>
            <div className="text-[10px] text-slate-400 font-sans">
              Thank you, Please visit again!
            </div>
          </div>
        </div>

        {/* Action Buttons (Print / WhatsApp / Done) */}
        <div className="flex flex-col gap-2 pt-1 print:hidden">
          <div className="flex gap-2">
            <button
              onClick={handlePrint}
              className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 hover:bg-slate-200 transition-colors"
            >
              <Printer className="w-4 h-4" />
              <span>Print Bill</span>
            </button>

            {activeReceipt.customerPhone ? (
              <a
                href={`https://wa.me/${cleanPhoneForWhatsApp(activeReceipt.customerPhone)}?text=${encodeURIComponent(
                  getWhatsAppReceiptText()
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                <span>WhatsApp Bill</span>
              </a>
            ) : (
              <div className="flex-1 flex items-center gap-1">
                <input
                  type="text"
                  placeholder="07x-xxxxxxx"
                  value={customWhatsAppPhone}
                  onChange={e => setCustomWhatsAppPhone(e.target.value)}
                  className="w-24 px-2 py-2 text-xs border border-slate-300 dark:border-slate-700 rounded-lg bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                />
                <a
                  href={`https://wa.me/${cleanPhoneForWhatsApp(customWhatsAppPhone || '0770000000')}?text=${encodeURIComponent(
                    getWhatsAppReceiptText()
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 shadow-xs transition-colors"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Send</span>
                </a>
              </div>
            )}
          </div>

          <button
            onClick={() => setActiveReceipt(null)}
            className="w-full py-2.5 bg-slate-900 dark:bg-amber-600 text-white font-bold rounded-xl text-xs"
          >
            Done & Next Customer
          </button>
        </div>
      </div>
    </div>
  );
};
