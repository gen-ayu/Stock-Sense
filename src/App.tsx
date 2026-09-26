import React, { useState } from 'react';
import { InventoryProvider } from './context/InventoryContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { ExpandedDashboardView } from './components/dashboard/ExpandedDashboardView';
import { SalesAnalyticsView } from './components/sales/SalesAnalyticsView';
import { SalesChannelsView } from './components/sales/SalesChannelsView';
import { SellerHubView } from './components/sellers/SellerHubView';
import { ProductPerformanceView } from './components/intelligence/ProductPerformanceView';
import { StockIntelligenceView } from './components/intelligence/StockIntelligenceView';
import { ExpiryManagementView } from './components/expiry/ExpiryManagementView';
import { RetailerInsightsView } from './components/intelligence/RetailerInsightsView';
import { ReportsView } from './components/reports/ReportsView';
import { ReceiptsView } from './components/operations/ReceiptsView';
import { DeliveriesView } from './components/operations/DeliveriesView';
import { InternalTransfersView } from './components/operations/InternalTransfersView';
import { StockAdjustmentsView } from './components/operations/StockAdjustmentsView';
import { MoveHistoryView } from './components/operations/MoveHistoryView';
import { ProductsView } from './components/products/ProductsView';
import { WarehouseSettingsView } from './components/settings/WarehouseSettingsView';
import { AuthModal } from './components/auth/AuthModal';

const AppContent: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  // Quick Action Modal states triggered from Dashboard / Nav
  const [isCreateReceiptOpen, setIsCreateReceiptOpen] = useState<boolean>(false);
  const [isCreateDeliveryOpen, setIsCreateDeliveryOpen] = useState<boolean>(false);
  const [isCreateTransferOpen, setIsCreateTransferOpen] = useState<boolean>(false);
  const [isCreateAdjustmentOpen, setIsCreateAdjustmentOpen] = useState<boolean>(false);
  const [isRecordSaleOpen, setIsRecordSaleOpen] = useState<boolean>(false);

  const handleOpenReceiptCreate = () => {
    setCurrentTab('receipts');
    setIsCreateReceiptOpen(true);
  };

  const handleOpenDeliveryCreate = () => {
    setCurrentTab('deliveries');
    setIsCreateDeliveryOpen(true);
  };

  const handleOpenTransferCreate = () => {
    setCurrentTab('transfers');
    setIsCreateTransferOpen(true);
  };

  const handleOpenAdjustmentCreate = () => {
    setCurrentTab('adjustments');
    setIsCreateAdjustmentOpen(true);
  };

  const handleOpenRecordSale = () => {
    setCurrentTab('sales-analytics');
    setIsRecordSaleOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-teal-500 selection:text-white">
      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        onOpenAuth={() => setIsAuthModalOpen(true)}
        onSelectNav={(tab) => setCurrentTab(tab)}
      />

      {/* Main Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <Sidebar
          currentTab={currentTab}
          onSelectTab={(tab) => setCurrentTab(tab)}
          isOpenMobile={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Central Content Area */}
        <main className="flex-1 overflow-y-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="max-w-7xl mx-auto pb-16">
            {/* 1. Main Executive Dashboard */}
            {currentTab === 'dashboard' && (
              <ExpandedDashboardView
                onNavigate={(tab) => setCurrentTab(tab)}
                onOpenNewSale={handleOpenRecordSale}
                onOpenNewReceipt={handleOpenReceiptCreate}
                onOpenNewDelivery={handleOpenDeliveryCreate}
              />
            )}

            {/* 2. Retailer Insights */}
            {currentTab === 'insights' && (
              <RetailerInsightsView onNavigate={(tab) => setCurrentTab(tab)} />
            )}

            {/* 3. Sales Analytics & Transactions */}
            {currentTab === 'sales-analytics' && (
              <SalesAnalyticsView
                isRecordSaleOpen={isRecordSaleOpen}
                onCloseRecordSale={() => setIsRecordSaleOpen(false)}
              />
            )}

            {/* 4. Sales Channels Deep-Dive */}
            {currentTab === 'sales-channels' && (
              <SalesChannelsView onNavigate={(tab) => setCurrentTab(tab)} />
            )}

            {/* 5. Seller → Seller Hub */}
            {currentTab === 'seller-hub' && <SellerHubView />}

            {/* 6. Product Performance & Dead Stock */}
            {currentTab === 'product-performance' && <ProductPerformanceView />}

            {/* 7. Stock Intelligence & Reorders */}
            {currentTab === 'stock-intelligence' && (
              <StockIntelligenceView onOpenNewReceipt={handleOpenReceiptCreate} />
            )}

            {/* 8. Expiry Management */}
            {currentTab === 'expiry' && <ExpiryManagementView />}

            {/* 9. Operations: Receipts */}
            {currentTab === 'receipts' && (
              <ReceiptsView
                isCreateOpen={isCreateReceiptOpen}
                onCloseCreate={() => setIsCreateReceiptOpen(false)}
              />
            )}

            {/* 10. Operations: Deliveries */}
            {currentTab === 'deliveries' && (
              <DeliveriesView
                isCreateOpen={isCreateDeliveryOpen}
                onCloseCreate={() => setIsCreateDeliveryOpen(false)}
              />
            )}

            {/* 11. Operations: Transfers */}
            {currentTab === 'transfers' && (
              <InternalTransfersView
                isCreateOpen={isCreateTransferOpen}
                onCloseCreate={() => setIsCreateTransferOpen(false)}
              />
            )}

            {/* 12. Operations: Adjustments */}
            {currentTab === 'adjustments' && (
              <StockAdjustmentsView
                isCreateOpen={isCreateAdjustmentOpen}
                onCloseCreate={() => setIsCreateAdjustmentOpen(false)}
              />
            )}

            {/* 13. Operations: Move History */}
            {currentTab === 'history' && <MoveHistoryView />}

            {/* 14. Products Master Catalog */}
            {currentTab === 'products' && <ProductsView />}

            {/* 15. Reports & Export Center */}
            {currentTab === 'reports' && <ReportsView />}

            {/* 16. Warehouses & Locations Settings */}
            {currentTab === 'settings' && <WarehouseSettingsView />}
          </div>
        </main>
      </div>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <InventoryProvider>
      <AppContent />
    </InventoryProvider>
  );
}

export default App;
