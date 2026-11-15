/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { BottomNav } from './components/BottomNav';
import { DashboardView } from './components/DashboardView';
import { PosView } from './components/PosView';
import { NayaBookView } from './components/NayaBookView';
import { WaraPlanView } from './components/WaraPlanView';
import { InventoryView } from './components/InventoryView';
import { ChequeTrackerView } from './components/ChequeTrackerView';
import { SupplierManagementView } from './components/SupplierManagementView';
import { ExecutiveAdvisorView } from './components/ExecutiveAdvisorView';
import { ReceiptModal } from './components/ReceiptModal';
import { DailyDrawerModal } from './components/DailyDrawerModal';
import { InterBranchTransferModal } from './components/InterBranchTransferModal';
import { SmartAssistantModal } from './components/SmartAssistantModal';
import { BootScreen } from './components/BootScreen';
import { ProfileLoginScreen } from './components/ProfileLoginScreen';
import { Smartphone, Monitor } from 'lucide-react';

const MainContent: React.FC = () => {
  const { activeTab, toast } = useApp();
  const [isMobileFrameMode, setIsMobileFrameMode] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors">
      {/* Device Frame Viewport Toggle (Visible only on lg+ screens for testing) */}
      <div className="hidden 2xl:flex fixed bottom-6 right-6 z-50 bg-slate-900 text-white p-1 rounded-2xl shadow-xl items-center gap-1 border border-slate-700 text-xs">
        <button
          onClick={() => setIsMobileFrameMode(false)}
          className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
            !isMobileFrameMode ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Monitor className="w-3.5 h-3.5" />
          <span>Full Responsive</span>
        </button>
        <button
          onClick={() => setIsMobileFrameMode(true)}
          className={`px-3 py-1.5 rounded-xl font-semibold flex items-center gap-1.5 transition-colors ${
            isMobileFrameMode ? 'bg-amber-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Mobile Phone Frame</span>
        </button>
      </div>

      <div
        className={
          isMobileFrameMode
            ? 'max-w-[420px] mx-auto my-6 border-8 border-slate-800 rounded-[44px] shadow-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 flex flex-col h-[880px] relative'
            : 'flex-1 flex flex-col'
        }
      >
        <Header />
        <BottomNav />

        <main
          className={`flex-1 p-3.5 sm:p-5 max-w-7xl mx-auto w-full ${
            isMobileFrameMode ? 'overflow-y-auto' : ''
          }`}
        >
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'pos' && <PosView />}
          {activeTab === 'naya' && <NayaBookView />}
          {activeTab === 'wara' && <WaraPlanView />}
          {activeTab === 'inventory' && <InventoryView />}
          {activeTab === 'suppliers' && <SupplierManagementView />}
          {activeTab === 'cheques' && <ChequeTrackerView />}
          {activeTab === 'advisor' && <ExecutiveAdvisorView />}
        </main>
      </div>

      {/* Global Modals, Boot & Login Profiles */}
      <BootScreen />
      <ProfileLoginScreen />
      <ReceiptModal />
      <DailyDrawerModal />
      <InterBranchTransferModal />
      <SmartAssistantModal />

      {/* In-App Floating Toast Notification (replaces window.alert) */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-top duration-200 max-w-md w-11/12">
          <div
            className={`px-4 py-3 rounded-2xl shadow-xl border text-xs font-semibold flex items-center justify-between gap-3 ${
              toast.type === 'error'
                ? 'bg-rose-900 text-white border-rose-700'
                : toast.type === 'success'
                ? 'bg-emerald-900 text-white border-emerald-700'
                : 'bg-slate-900 text-white border-slate-700'
            }`}
          >
            <span>{toast.message}</span>
            <span className="text-[10px] opacity-75">✕</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
