import React, { useState, useMemo } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Package,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Filter,
  Plus,
  Search,
  Warehouse,
  ChevronRight,
  TrendingDown,
  Boxes,
} from 'lucide-react';

interface DashboardViewProps {
  onNavigate: (tab: string) => void;
  onOpenNewReceipt: () => void;
  onOpenNewDelivery: () => void;
  onOpenNewTransfer: () => void;
  onOpenNewAdjustment: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  onNavigate,
  onOpenNewReceipt,
  onOpenNewDelivery,
  onOpenNewTransfer,
  onOpenNewAdjustment,
}) => {
  const {
    kpis,
    receipts,
    deliveries,
    transfers,
    adjustments,
    products,
    warehouses,
    locations,
    todayDate,
  } = useInventory();

  // Dynamic Filters matching PDF requirements
  const [selectedDocType, setSelectedDocType] = useState<string>('All'); // All | Receipts | Delivery | Internal | Adjustments
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [selectedLocation, setSelectedLocation] = useState<string>('All');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Extract unique categories
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category)));
  }, [products]);

  // Unified list of operations for filtering
  const unifiedOperations = useMemo(() => {
    const list: Array<{
      id: string;
      docType: 'Receipt' | 'Delivery' | 'Internal' | 'Adjustment';
      reference: string;
      partner: string;
      date: string;
      status: string;
      location: string;
      itemsCount: number;
      category?: string;
      isLate: boolean;
      tabTarget: string;
    }> = [];

    // Receipts
    receipts.forEach((r) => {
      const isLate = (r.status === 'Draft' || r.status === 'Ready') && r.scheduleDate < todayDate;
      const cat = r.items[0]
        ? products.find((p) => p.id === r.items[0].productId)?.category
        : undefined;
      list.push({
        id: r.id,
        docType: 'Receipt',
        reference: r.reference,
        partner: r.partner,
        date: r.scheduleDate,
        status: r.status,
        location: r.destinationLocationCode,
        itemsCount: r.items.reduce((sum, i) => sum + i.quantity, 0),
        category: cat,
        isLate,
        tabTarget: 'receipts',
      });
    });

    // Deliveries
    deliveries.forEach((d) => {
      const isLate = (d.status === 'Draft' || d.status === 'Waiting' || d.status === 'Ready') && d.scheduleDate < todayDate;
      const cat = d.items[0]
        ? products.find((p) => p.id === d.items[0].productId)?.category
        : undefined;
      list.push({
        id: d.id,
        docType: 'Delivery',
        reference: d.reference,
        partner: d.partner,
        date: d.scheduleDate,
        status: d.status,
        location: d.sourceLocationCode,
        itemsCount: d.items.reduce((sum, i) => sum + i.quantity, 0),
        category: cat,
        isLate,
        tabTarget: 'deliveries',
      });
    });

    // Transfers
    transfers.forEach((t) => {
      list.push({
        id: t.id,
        docType: 'Internal',
        reference: t.reference,
        partner: `${t.sourceLocationCode} ➔ ${t.destinationLocationCode}`,
        date: t.scheduleDate,
        status: t.status,
        location: t.sourceLocationCode,
        itemsCount: t.items.reduce((sum, i) => sum + i.quantity, 0),
        isLate: false,
        tabTarget: 'transfers',
      });
    });

    // Adjustments
    adjustments.forEach((a) => {
      list.push({
        id: a.id,
        docType: 'Adjustment',
        reference: a.reference,
        partner: a.reason,
        date: a.date,
        status: 'Done',
        location: a.locationCode,
        itemsCount: Math.abs(a.difference),
        category: products.find((p) => p.id === a.productId)?.category,
        isLate: false,
        tabTarget: 'adjustments',
      });
    });

    return list.sort((a, b) => b.reference.localeCompare(a.reference));
  }, [receipts, deliveries, transfers, adjustments, products, todayDate]);

  // Filtered unified operations
  const filteredOperations = useMemo(() => {
    return unifiedOperations.filter((op) => {
      if (selectedDocType !== 'All' && op.docType !== selectedDocType) return false;
      if (selectedStatus !== 'All' && op.status !== selectedStatus) return false;
      if (selectedLocation !== 'All' && !op.location.includes(selectedLocation)) return false;
      if (selectedCategory !== 'All' && op.category !== selectedCategory) return false;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchRef = op.reference.toLowerCase().includes(query);
        const matchPartner = op.partner.toLowerCase().includes(query);
        const matchLoc = op.location.toLowerCase().includes(query);
        if (!matchRef && !matchPartner && !matchLoc) return false;
      }
      return true;
    });
  }, [unifiedOperations, selectedDocType, selectedStatus, selectedLocation, selectedCategory, searchQuery]);

  return (
    <div className="space-y-6">
      {/* Top Banner & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 rounded-3xl text-white shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 text-[10px] font-mono font-bold bg-teal-500/20 text-teal-300 rounded border border-teal-400/30">
              OPERATIONS HUB
            </span>
            <span className="text-xs text-slate-300">Live Warehouse Activity</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">Inventory Dashboard</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Real-time tracking of incoming receipts, dispatches, stock levels, and warehouse operations.
          </p>
        </div>

        {/* Quick Launch Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onOpenNewReceipt}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-500 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Receipt</span>
          </button>
          <button
            onClick={onOpenNewDelivery}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Delivery</span>
          </button>
          <button
            onClick={onOpenNewAdjustment}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-300 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Adjustment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Receipts */}
        <div
          onClick={() => onNavigate('receipts')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-teal-300 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Receipts Operations
            </span>
            <div className="p-2 rounded-xl bg-teal-50 text-teal-600 group-hover:scale-110 transition-transform">
              <ArrowDownLeft className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {kpis.pendingReceipts}
              </span>
              <span className="text-xs font-medium text-slate-500">to receive</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
              <span className="text-slate-500">Total: {receipts.length} ops</span>
              {kpis.lateReceipts > 0 ? (
                <span className="flex items-center gap-1 font-semibold text-rose-600 font-mono">
                  <Clock className="w-3.5 h-3.5" />
                  {kpis.lateReceipts} Late
                </span>
              ) : (
                <span className="text-emerald-600 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> On Schedule
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 2: Deliveries */}
        <div
          onClick={() => onNavigate('deliveries')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-sky-300 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Delivery Orders
            </span>
            <div className="p-2 rounded-xl bg-sky-50 text-sky-600 group-hover:scale-110 transition-transform">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {kpis.pendingDeliveries}
              </span>
              <span className="text-xs font-medium text-slate-500">to deliver</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
              {kpis.waitingDeliveries > 0 ? (
                <span className="flex items-center gap-1 font-semibold text-amber-600 font-mono">
                  <AlertTriangle className="w-3.5 h-3.5" />
                  {kpis.waitingDeliveries} Waiting
                </span>
              ) : (
                <span className="text-slate-500">Total: {deliveries.length} ops</span>
              )}

              {kpis.lateDeliveries > 0 && (
                <span className="font-semibold text-rose-600 font-mono">
                  {kpis.lateDeliveries} Late
                </span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 3: Stock on Hand */}
        <div
          onClick={() => onNavigate('products')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-indigo-300 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Products In Stock
            </span>
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-110 transition-transform">
              <Package className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {kpis.itemsInStock}
              </span>
              <span className="text-xs font-medium text-slate-500">units available</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
              <span className="text-slate-500">{products.length} distinct SKUs</span>
              {kpis.lowStockItems > 0 ? (
                <span className="flex items-center gap-1 font-semibold text-rose-600 font-mono">
                  <TrendingDown className="w-3.5 h-3.5" />
                  {kpis.lowStockItems} Low Stock
                </span>
              ) : (
                <span className="text-emerald-600 font-medium">Healthy</span>
              )}
            </div>
          </div>
        </div>

        {/* KPI 4: Internal Transfers & Audits */}
        <div
          onClick={() => onNavigate('transfers')}
          className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer group relative overflow-hidden"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Internal Transfers
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600 group-hover:scale-110 transition-transform">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900 font-mono">
                {kpis.scheduledTransfers}
              </span>
              <span className="text-xs font-medium text-slate-500">scheduled</span>
            </div>

            <div className="mt-3 flex items-center justify-between text-xs pt-3 border-t border-slate-100">
              <span className="text-slate-500">Locations: {locations.length} active</span>
              <span className="text-teal-700 font-medium font-mono">
                {adjustments.length} Audits
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic Filters Bar matching PDF specs */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reference (WH/IN/0001, WH/OUT/0001) or partner (Azure Interior)..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:bg-white transition-all"
            />
          </div>

          {/* Quick Clear */}
          {(selectedDocType !== 'All' ||
            selectedStatus !== 'All' ||
            selectedLocation !== 'All' ||
            selectedCategory !== 'All' ||
            searchQuery) && (
            <button
              onClick={() => {
                setSelectedDocType('All');
                setSelectedStatus('All');
                setSelectedLocation('All');
                setSelectedCategory('All');
                setSearchQuery('');
              }}
              className="text-xs text-rose-600 hover:text-rose-700 font-medium px-2 py-1 cursor-pointer"
            >
              Reset Filters
            </button>
          )}
        </div>

        {/* Filter selectors grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-slate-100 text-xs">
          {/* 1. By Document Type */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Document Type</label>
            <select
              value={selectedDocType}
              onChange={(e) => setSelectedDocType(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Documents</option>
              <option value="Receipt">Receipts (Incoming)</option>
              <option value="Delivery">Delivery (Outgoing)</option>
              <option value="Internal">Internal Transfers</option>
              <option value="Adjustment">Stock Adjustments</option>
            </select>
          </div>

          {/* 2. By Status */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Operational Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Statuses</option>
              <option value="Draft">Draft</option>
              <option value="Waiting">Waiting</option>
              <option value="Ready">Ready</option>
              <option value="Done">Done</option>
              <option value="Canceled">Canceled</option>
            </select>
          </div>

          {/* 3. By Warehouse / Location */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Warehouse Location</label>
            <select
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Locations</option>
              {locations.map((loc) => (
                <option key={loc.id} value={loc.shortCode}>
                  {loc.shortCode} - {loc.name}
                </option>
              ))}
            </select>
          </div>

          {/* 4. By Product Category */}
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Product Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 font-medium focus:ring-1 focus:ring-teal-500"
            >
              <option value="All">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Unified Operations Activity Stream */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Active Warehouse Operations</h3>
            <p className="text-xs text-slate-500">
              Showing {filteredOperations.length} matching operations across warehouses
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-slate-400">Live Sync</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Doc Type</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Partner / Description</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Schedule Date</th>
                <th className="py-3 px-4 text-center">Items Qty</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredOperations.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    No operations match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredOperations.map((op) => (
                  <tr key={`${op.docType}_${op.id}`} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                          op.docType === 'Receipt'
                            ? 'bg-teal-50 text-teal-700 border border-teal-200'
                            : op.docType === 'Delivery'
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : op.docType === 'Internal'
                            ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}
                      >
                        {op.docType}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">
                      {op.reference}
                    </td>
                    <td className="py-3 px-4 text-slate-700 font-medium truncate max-w-xs">
                      {op.partner}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {op.location}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <span>{op.date}</span>
                        {op.isLate && (
                          <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                            LATE
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-slate-800">
                      {op.itemsCount}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={op.status} />
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onNavigate(op.tabTarget)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-900 cursor-pointer"
                      >
                        <span>Open</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
