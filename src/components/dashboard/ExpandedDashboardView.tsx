import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { TimeFilterPeriod } from '../../types';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Package,
  ShoppingCart,
  Truck,
  ArrowUpRight,
  ArrowDownLeft,
  ArrowLeftRight,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Calendar,
  Sparkles,
  ChevronRight,
  SlidersHorizontal,
  Plus,
  Boxes,
  ShieldAlert,
  Archive,
  BarChart3,
  Layers,
  Percent,
} from 'lucide-react';

interface ExpandedDashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenNewSale: () => void;
  onOpenNewReceipt: () => void;
  onOpenNewDelivery: () => void;
}

export const ExpandedDashboardView: React.FC<ExpandedDashboardViewProps> = ({
  onNavigate,
  onOpenNewSale,
  onOpenNewReceipt,
  onOpenNewDelivery,
}) => {
  const {
    kpis,
    timeFilter,
    setTimeFilter,
    customStartDate,
    setCustomStartDate,
    customEndDate,
    setCustomEndDate,
    insights,
    sales,
  } = useInventory();

  const [showCustomPicker, setShowCustomPicker] = useState(false);

  // Time filter buttons
  const timePeriods: { id: TimeFilterPeriod; label: string }[] = [
    { id: 'today', label: 'Today' },
    { id: 'week', label: 'This Week' },
    { id: 'month', label: 'This Month' },
    { id: '6months', label: 'Last 6 Months' },
    { id: 'year', label: 'This Year' },
    { id: 'custom', label: 'Custom' },
  ];

  // Visual trend mock bars for 6 months (Jan - Jun / Apr - Sep)
  const trendBars = [
    { label: 'Apr', amount: 105000, height: '42%' },
    { label: 'May', amount: 140000, height: '56%' },
    { label: 'Jun', amount: 175000, height: '70%' },
    { label: 'Jul', amount: 210000, height: '84%' },
    { label: 'Aug', amount: 195000, height: '78%' },
    { label: 'Sep (Current)', amount: 245000, height: '98%', active: true },
  ];

  return (
    <div className="space-y-6">
      {/* Platform Title Banner & Time Filter Bar */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 rounded-3xl text-white shadow-xl flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 rounded-md border border-teal-400/30">
              RETAIL & INVENTORY INTELLIGENCE
            </span>
            <span className="text-xs text-slate-300 font-medium">Executive Overview</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight mt-1.5">
            Stock<span className="text-teal-400">Sense</span> Retail Command
          </h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Unified visibility across sales channels, multi-warehouse stock health, financial projections, and automated operational intelligence.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewSale}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Record Sale</span>
          </button>
          <button
            onClick={onOpenNewReceipt}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
          >
            <ArrowDownLeft className="w-4 h-4" />
            <span>New Intake</span>
          </button>
          <button
            onClick={onOpenNewDelivery}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-200 bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>New Dispatch</span>
          </button>
        </div>
      </div>

      {/* Global Time Filter & Period Comparison Bar (Requirement 1 & 11) */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Time Tabs */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mr-2 font-mono flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Timeframe:
          </span>
          {timePeriods.map((period) => (
            <button
              key={period.id}
              onClick={() => {
                setTimeFilter(period.id);
                if (period.id === 'custom') setShowCustomPicker(true);
                else setShowCustomPicker(false);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                timeFilter === period.id
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period.label}
            </button>
          ))}
        </div>

        {/* Comparison Indicator */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="text-slate-500 font-medium">Comparison:</span>
          <span className="font-semibold text-slate-800">
            {timeFilter === 'year'
              ? 'This Year vs Last Year'
              : timeFilter === 'today'
              ? 'Today vs Yesterday'
              : 'This Period vs Previous Period'}
          </span>
        </div>
      </div>

      {/* Custom Date Range Picker if active */}
      {showCustomPicker && (
        <div className="bg-white p-4 rounded-2xl border border-teal-200 shadow-xs flex flex-wrap items-center gap-3 text-xs animate-in fade-in">
          <span className="font-semibold text-slate-700">Select Custom Range:</span>
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={customStartDate}
              onChange={(e) => setCustomStartDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
            />
            <span className="text-slate-400">to</span>
            <input
              type="date"
              value={customEndDate}
              onChange={(e) => setCustomEndDate(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-mono text-xs"
            />
          </div>
          <span className="text-teal-700 font-medium font-mono text-[11px]">Filtered Dynamically</span>
        </div>
      )}

      {/* Period Comparison Metric Badges (Requirement 11) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Total Revenue</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold font-mono text-slate-900">
              ₹{kpis.totalRevenue.toLocaleString()}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {kpis.revenueGrowthPercent}%
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Units Sold</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold font-mono text-slate-900">
              {kpis.totalUnitsSold.toLocaleString()}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {kpis.unitsGrowthPercent}%
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Completed Orders</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold font-mono text-slate-900">
              {kpis.totalSalesCount}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
              <TrendingDown className="w-3 h-3 mr-0.5" />
              {Math.abs(kpis.ordersGrowthPercent)}%
            </span>
          </div>
        </div>

        <div className="p-3.5 bg-white rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] font-medium text-slate-500 block">Gross Profit</span>
          <div className="flex items-baseline justify-between mt-1">
            <span className="text-lg font-bold font-mono text-teal-700">
              ₹{kpis.estimatedProfit.toLocaleString()}
            </span>
            <span className="inline-flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {kpis.profitGrowthPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* 4 CORE SECTIONS: 1. Financial & Revenue, 2. Inventory Health, 3. Operations, 4. Sales Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Section A: Financial & Income (Requirement 1 & 7) */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-teal-50 text-teal-700">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Financial Performance & Cash Projections</h2>
                  <p className="text-xs text-slate-500">
                    Realized Revenue vs. Expected & Pending Receivables
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => onNavigate('sales-analytics')}
              className="text-xs text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Detailed Breakdown</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {/* Actual vs Expected vs Pending Grid (Requirement 7) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Actual Revenue */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200">
              <div className="flex items-center justify-between text-xs text-emerald-800 font-semibold mb-1">
                <span>Actual Revenue</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
              <p className="text-2xl font-mono font-extrabold text-emerald-950">
                ₹{kpis.netSales.toLocaleString()}
              </p>
              <p className="text-[11px] text-emerald-700 mt-1">Paid & settled sales</p>
            </div>

            {/* Expected Income */}
            <div className="p-4 rounded-2xl bg-sky-50/70 border border-sky-200">
              <div className="flex items-center justify-between text-xs text-sky-800 font-semibold mb-1">
                <span>Expected Income</span>
                <span className="w-2 h-2 rounded-full bg-sky-500" />
              </div>
              <p className="text-2xl font-mono font-extrabold text-sky-950">
                ₹{kpis.expectedIncome.toLocaleString()}
              </p>
              <p className="text-[11px] text-sky-700 mt-1">Pending orders & contracts</p>
            </div>

            {/* Pending Payments */}
            <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200">
              <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
                <span>Pending Payments</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
              <p className="text-2xl font-mono font-extrabold text-amber-950">
                ₹{kpis.pendingPayments.toLocaleString()}
              </p>
              <p className="text-[11px] text-amber-700 mt-1">Unpaid invoices & credit sales</p>
            </div>
          </div>

          {/* Secondary Financial Ledger */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Cost of Goods (COGS)</span>
              <p className="font-mono font-bold text-slate-800 text-sm">
                ₹{kpis.costOfGoods.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Estimated Profit</span>
              <p className="font-mono font-bold text-teal-700 text-sm">
                ₹{kpis.estimatedProfit.toLocaleString()}
              </p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Profit Margin</span>
              <p className="font-mono font-bold text-slate-800 text-sm">
                {kpis.profitMargin}%
              </p>
            </div>
            <div>
              <span className="text-slate-400 block mb-0.5">Potential Revenue</span>
              <p className="font-mono font-bold text-slate-900 text-sm">
                ₹{kpis.potentialRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Sales Trend Visualization (Requirement 2 chart visualization) */}
          <div className="pt-2">
            <div className="flex items-center justify-between mb-3 text-xs">
              <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-teal-600" />
                Sales Trend Analysis (Monthly Revenue in ₹)
              </span>
              <span className="text-slate-400 font-mono text-[11px]">₹105K ➔ ₹245K Trend</span>
            </div>

            <div className="h-40 bg-slate-50 rounded-2xl p-4 border border-slate-200 flex items-end justify-between gap-3">
              {trendBars.map((bar, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                  <span className="text-[10px] font-mono text-slate-500 font-medium">
                    ₹{(bar.amount / 1000).toFixed(0)}K
                  </span>
                  <div
                    style={{ height: bar.height }}
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-500 ${
                      bar.active
                        ? 'bg-teal-600 shadow-md shadow-teal-600/30'
                        : 'bg-slate-300 hover:bg-teal-400'
                    }`}
                  />
                  <span className={`text-[10px] font-mono font-semibold ${bar.active ? 'text-teal-900 font-bold' : 'text-slate-500'}`}>
                    {bar.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section B: Retailer "Health" & Derived Insights Feed (Requirement 10) */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-50 text-amber-700">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-slate-900">Retail Intelligence</h2>
                  <p className="text-[11px] text-slate-500">Actionable Derived Insights</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate('insights')}
                className="text-xs text-teal-600 font-semibold hover:underline cursor-pointer"
              >
                All
              </button>
            </div>

            <div className="mt-4 space-y-3 max-h-[380px] overflow-y-auto pr-1">
              {insights.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  onClick={() => item.targetTab && onNavigate(item.targetTab)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    item.severity === 'critical'
                      ? 'bg-rose-50/60 border-rose-200 hover:bg-rose-100/60'
                      : item.severity === 'warning'
                      ? 'bg-amber-50/60 border-amber-200 hover:bg-amber-100/60'
                      : item.severity === 'success'
                      ? 'bg-emerald-50/60 border-emerald-200 hover:bg-emerald-100/60'
                      : 'bg-sky-50/60 border-sky-200 hover:bg-sky-100/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-bold text-slate-900 leading-tight">{item.title}</h4>
                    {item.metric && (
                      <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-white/80 text-slate-800 shadow-2xs whitespace-nowrap">
                        {item.metric}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-600 mt-1 leading-snug">{item.description}</p>
                  <div className="mt-2 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 font-mono">{item.timestamp}</span>
                    <span className="font-semibold text-teal-700 flex items-center gap-0.5">
                      {item.actionText} →
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs flex items-center justify-between">
            <span className="text-slate-600">Stock health status:</span>
            <span className="font-bold font-mono text-teal-800">
              {kpis.lowStockItems === 0 ? 'Optimal' : `${kpis.lowStockItems} Alerts Pending`}
            </span>
          </div>
        </div>
      </div>

      {/* Section C: Inventory Health & Valuation (Requirement 1) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-700">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Inventory Valuation & Health Status</h2>
              <p className="text-xs text-slate-500">Real-time valuation, safety stock, and inventory aging</p>
            </div>
          </div>

          <button
            onClick={() => onNavigate('stock-intelligence')}
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Stock Intelligence Engine</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-7 gap-3">
          {/* Total Stock Value */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10.5px] font-semibold text-slate-500 block">Total Stock Value</span>
            <p className="text-lg font-mono font-extrabold text-slate-900 mt-1">
              ₹{kpis.totalStockValue.toLocaleString()}
            </p>
            <span className="text-[10px] text-slate-400">At cost price</span>
          </div>

          {/* Items in Stock */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200">
            <span className="text-[10.5px] font-semibold text-slate-500 block">Items in Stock</span>
            <p className="text-lg font-mono font-extrabold text-slate-900 mt-1">
              {kpis.itemsInStock}
            </p>
            <span className="text-[10px] text-slate-400">Across all warehouses</span>
          </div>

          {/* Low Stock */}
          <div
            onClick={() => onNavigate('stock-intelligence')}
            className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 cursor-pointer hover:bg-amber-100/70 transition-colors"
          >
            <span className="text-[10.5px] font-semibold text-amber-800 block">Low-Stock Items</span>
            <p className="text-lg font-mono font-extrabold text-amber-950 mt-1">
              {kpis.lowStockItems}
            </p>
            <span className="text-[10px] text-amber-700">Below safety threshold</span>
          </div>

          {/* Out of Stock */}
          <div
            onClick={() => onNavigate('stock-intelligence')}
            className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 cursor-pointer hover:bg-rose-100/70 transition-colors"
          >
            <span className="text-[10.5px] font-semibold text-rose-800 block">Out-of-Stock</span>
            <p className="text-lg font-mono font-extrabold text-rose-950 mt-1">
              {kpis.outOfStockItems}
            </p>
            <span className="text-[10px] text-rose-700">Immediate reorder</span>
          </div>

          {/* Expiring Soon */}
          <div
            onClick={() => onNavigate('expiry')}
            className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 cursor-pointer hover:bg-amber-100/70 transition-colors"
          >
            <span className="text-[10.5px] font-semibold text-amber-800 block">Expiring Soon (30d)</span>
            <p className="text-lg font-mono font-extrabold text-amber-950 mt-1">
              {kpis.expiringSoonItems}
            </p>
            <span className="text-[10px] text-amber-700">Batches flagged</span>
          </div>

          {/* Expired Items */}
          <div
            onClick={() => onNavigate('expiry')}
            className="p-3.5 rounded-2xl bg-rose-50/70 border border-rose-200 cursor-pointer hover:bg-rose-100/70 transition-colors"
          >
            <span className="text-[10.5px] font-semibold text-rose-800 block">Expired Items</span>
            <p className="text-lg font-mono font-extrabold text-rose-950 mt-1">
              {kpis.expiredItems}
            </p>
            <span className="text-[10px] text-rose-700">Scrap / return</span>
          </div>

          {/* Overstocked */}
          <div
            onClick={() => onNavigate('product-performance')}
            className="p-3.5 rounded-2xl bg-indigo-50/70 border border-indigo-200 cursor-pointer hover:bg-indigo-100/70 transition-colors"
          >
            <span className="text-[10.5px] font-semibold text-indigo-800 block">Overstocked</span>
            <p className="text-lg font-mono font-extrabold text-indigo-950 mt-1">
              {kpis.overstockedItems}
            </p>
            <span className="text-[10px] text-indigo-700">Capital tied up</span>
          </div>
        </div>
      </div>

      {/* Section D: Operations & Warehouse Workflows (Requirement 1) */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-50 text-sky-700">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Operations Workflow Counters</h2>
              <p className="text-xs text-slate-500">Live operational queues across warehouse floor</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('history')}
            className="text-xs text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 cursor-pointer"
          >
            <span>Audit Ledger</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div
            onClick={() => onNavigate('deliveries')}
            className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-sky-300 transition-colors cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-600">Pending Deliveries</span>
            <p className="text-2xl font-mono font-bold text-slate-900 mt-1">
              {kpis.pendingDeliveries}
            </p>
            {kpis.lateDeliveries > 0 ? (
              <span className="text-[10px] font-bold text-rose-600 font-mono">
                {kpis.lateDeliveries} Late
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 font-medium">On Schedule</span>
            )}
          </div>

          <div
            onClick={() => onNavigate('receipts')}
            className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-teal-300 transition-colors cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-600">Pending Receipts</span>
            <p className="text-2xl font-mono font-bold text-slate-900 mt-1">
              {kpis.pendingReceipts}
            </p>
            {kpis.lateReceipts > 0 ? (
              <span className="text-[10px] font-bold text-rose-600 font-mono">
                {kpis.lateReceipts} Late
              </span>
            ) : (
              <span className="text-[10px] text-emerald-600 font-medium">On Schedule</span>
            )}
          </div>

          <div
            onClick={() => onNavigate('transfers')}
            className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-indigo-300 transition-colors cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-600">Pending Transfers</span>
            <p className="text-2xl font-mono font-bold text-slate-900 mt-1">
              {kpis.scheduledTransfers}
            </p>
            <span className="text-[10px] text-slate-400">Location moves</span>
          </div>

          <div
            onClick={() => onNavigate('adjustments')}
            className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-amber-300 transition-colors cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-600">Stock Adjustments</span>
            <p className="text-2xl font-mono font-bold text-slate-900 mt-1">
              {kpis.stockAdjustmentsCount}
            </p>
            <span className="text-[10px] text-amber-700 font-mono">Count Audits</span>
          </div>

          <div
            onClick={() => onNavigate('receipts')}
            className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 hover:border-emerald-300 transition-colors cursor-pointer"
          >
            <span className="text-xs font-semibold text-slate-600">Supplier Purchases</span>
            <p className="text-2xl font-mono font-bold text-slate-900 mt-1">
              {kpis.supplierPurchasesCount}
            </p>
            <span className="text-[10px] text-emerald-600">Validated Inbound</span>
          </div>
        </div>
      </div>
    </div>
  );
};
