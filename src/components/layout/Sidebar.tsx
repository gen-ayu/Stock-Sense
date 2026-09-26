import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  LayoutDashboard,
  Sparkles,
  TrendingUp,
  Store,
  Users,
  Award,
  Brain,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  History,
  Package,
  FileText,
  Warehouse,
  LogOut,
  UserCheck,
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onSelectTab: (tab: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  onSelectTab,
  isOpenMobile,
  onCloseMobile,
}) => {
  const { kpis, currentUser, logout, insights } = useInventory();

  const navGroups = [
    {
      label: 'EXECUTIVE OVERVIEW',
      items: [
        {
          id: 'dashboard',
          label: 'Main Dashboard',
          sublabel: 'Sales, Financials & Operations',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          id: 'insights',
          label: 'Retailer Insights',
          sublabel: 'Derived Action Directives',
          icon: Sparkles,
          badge: insights.length > 0 ? `${insights.length} alerts` : null,
          badgeColor: 'bg-amber-100 text-amber-800',
        },
      ],
    },
    {
      label: 'SALES & FINANCE',
      items: [
        {
          id: 'sales-analytics',
          label: 'Sales Analytics',
          sublabel: 'Revenue, Profit & COGS',
          icon: TrendingUp,
          badge: `₹${(kpis.totalRevenue / 1000).toFixed(0)}k`,
          badgeColor: 'bg-teal-100 text-teal-800',
        },
        {
          id: 'sales-channels',
          label: 'Sales Channels',
          sublabel: 'E-commerce, Retail & Direct',
          icon: Store,
          badge: '5 Channels',
        },
        {
          id: 'seller-hub',
          label: 'Seller → Seller Hub',
          sublabel: 'B2B Merchant Transactions',
          icon: Users,
          badge: kpis.pendingPayments > 0 ? 'Receivables' : null,
          badgeColor: 'bg-amber-100 text-amber-800',
        },
      ],
    },
    {
      label: 'RETAIL INTELLIGENCE',
      items: [
        {
          id: 'product-performance',
          label: 'Product Performance',
          sublabel: 'Best, Slow & Dead Stock',
          icon: Award,
          badge: kpis.deadStockItems > 0 ? `${kpis.deadStockItems} Dead` : null,
          badgeColor: 'bg-rose-100 text-rose-800',
        },
        {
          id: 'stock-intelligence',
          label: 'Stock Intelligence',
          sublabel: 'Lead Times & Reorders',
          icon: Brain,
          badge: kpis.lowStockItems > 0 ? `${kpis.lowStockItems} Reorder` : null,
          badgeColor: 'bg-amber-100 text-amber-800',
        },
        {
          id: 'expiry',
          label: 'Expiry Management',
          sublabel: 'Batch Tracking & Shelf-Life',
          icon: Clock,
          badge: kpis.expiredItems > 0 ? `${kpis.expiredItems} Expired` : kpis.expiringSoonItems > 0 ? `${kpis.expiringSoonItems} Soon` : null,
          badgeColor: kpis.expiredItems > 0 ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800',
        },
      ],
    },
    {
      label: 'WAREHOUSE OPERATIONS',
      items: [
        {
          id: 'receipts',
          label: 'Receipts',
          sublabel: 'Incoming (WH/IN)',
          icon: ArrowDownLeft,
          badge: kpis.pendingReceipts > 0 ? `${kpis.pendingReceipts}` : null,
          badgeColor: kpis.lateReceipts > 0 ? 'bg-rose-100 text-rose-800' : 'bg-teal-100 text-teal-800',
        },
        {
          id: 'deliveries',
          label: 'Delivery Orders',
          sublabel: 'Outgoing (WH/OUT)',
          icon: ArrowUpRight,
          badge: kpis.pendingDeliveries > 0 ? `${kpis.pendingDeliveries}` : null,
          badgeColor: kpis.waitingDeliveries > 0 ? 'bg-amber-100 text-amber-800' : 'bg-sky-100 text-sky-800',
        },
        {
          id: 'transfers',
          label: 'Internal Transfers',
          sublabel: 'Location Moves',
          icon: ArrowLeftRight,
          badge: kpis.scheduledTransfers > 0 ? `${kpis.scheduledTransfers}` : null,
        },
        {
          id: 'adjustments',
          label: 'Stock Adjustments',
          sublabel: 'Physical Count Audits',
          icon: SlidersHorizontal,
          badge: null,
        },
        {
          id: 'history',
          label: 'Move History',
          sublabel: 'Audit Trail Ledger',
          icon: History,
          badge: null,
        },
      ],
    },
    {
      label: 'CATALOG & CONFIG',
      items: [
        {
          id: 'products',
          label: 'Products & Stock',
          sublabel: 'Master Catalog & Costs',
          icon: Package,
          badge: `${kpis.totalProductsCount} SKUs`,
        },
        {
          id: 'reports',
          label: 'Reports Center',
          sublabel: 'CSV & Printable Audits',
          icon: FileText,
          badge: 'Export',
          badgeColor: 'bg-teal-100 text-teal-800',
        },
        {
          id: 'settings',
          label: 'Warehouses & Locations',
          sublabel: 'Zones, Racks & Codes',
          icon: Warehouse,
          badge: null,
        },
      ],
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed lg:sticky top-0 lg:top-16 z-40 h-[100dvh] lg:h-[calc(100vh-4rem)] w-72 bg-white border-r border-slate-200/80 flex flex-col justify-between transition-transform duration-300 ease-in-out select-none ${
          isOpenMobile ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
          {/* Mobile close */}
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 lg:hidden">
            <span className="font-bold text-slate-800 text-xs uppercase tracking-wider">Navigation Menu</span>
            <button
              onClick={onCloseMobile}
              className="text-xs px-2 py-1 bg-slate-100 rounded-lg text-slate-600 cursor-pointer"
            >
              Close
            </button>
          </div>

          {navGroups.map((group, gIdx) => (
            <div key={gIdx} className="space-y-1">
              <p className="px-3 text-[10px] font-bold tracking-wider text-slate-400 uppercase font-mono">
                {group.label}
              </p>
              {group.items.map((item) => {
                const Icon = item.icon;
                const isActive = currentTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      onSelectTab(item.id);
                      onCloseMobile();
                    }}
                    className={`w-full group flex items-center justify-between px-3 py-2 rounded-xl text-left transition-all duration-150 cursor-pointer ${
                      isActive
                        ? 'bg-teal-50 text-teal-950 font-bold shadow-xs border border-teal-200/80'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className={`p-1.5 rounded-lg transition-colors ${
                          isActive
                            ? 'bg-teal-600 text-white'
                            : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                        }`}
                      >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                      </div>
                      <div className="truncate">
                        <p className={`text-xs tracking-tight ${isActive ? 'font-bold text-teal-950' : 'font-medium'}`}>
                          {item.label}
                        </p>
                        {item.sublabel && (
                          <p className="text-[10px] text-slate-400 font-normal leading-none mt-0.5 truncate">
                            {item.sublabel}
                          </p>
                        )}
                      </div>
                    </div>

                    {item.badge && (
                      <span
                        className={`ml-2 px-1.5 py-0.5 text-[9.5px] font-mono font-bold rounded-md whitespace-nowrap ${
                          item.badgeColor || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Profile Card Footer */}
        {currentUser && (
          <div className="p-3 border-t border-slate-200 bg-slate-50/70">
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white border border-slate-200 shadow-2xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-lg bg-teal-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-xs">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="truncate">
                  <p className="text-xs font-bold text-slate-800 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-teal-700 font-medium truncate flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-teal-600" />
                    <span>{currentUser.role}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={logout}
                title="Log out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
};
