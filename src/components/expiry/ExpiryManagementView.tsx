import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { BatchItem } from '../../types';
import {
  Clock,
  Plus,
  Search,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  X,
  MapPin,
  Building,
  RotateCcw,
} from 'lucide-react';

export const ExpiryManagementView: React.FC = () => {
  const { batches, products, warehouses, locations, createBatch, todayDate } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Expired' | 'Expiring 7d' | 'Expiring 30d' | 'Safe'>('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New Batch Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [batchNumber, setBatchNumber] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [expiryDate, setExpiryDate] = useState('2026-10-15');
  const [warehouseCode, setWarehouseCode] = useState('WH');
  const [locationCode, setLocationCode] = useState('WH/Cold');
  const [supplier, setSupplier] = useState('Apex Specialty Supplies');

  const currentProd = products.find((p) => p.id === selectedProductId) || products[0];

  // Expiry dashboard counts (Requirement 5 exact badges)
  const expiredCount = batches.filter((b) => b.daysRemaining <= 0).length;
  const expiring7dCount = batches.filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 7).length;
  const expiring30dCount = batches.filter((b) => b.daysRemaining > 7 && b.daysRemaining <= 30).length;
  const safeCount = batches.filter((b) => b.daysRemaining > 30).length;
  const totalExpiringSoon = batches.filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 30).length;

  const categories = ['All', ...Array.from(new Set(batches.map((b) => b.category)))];

  const filteredBatches = batches.filter((b) => {
    if (statusFilter !== 'All' && b.status !== statusFilter) return false;
    if (categoryFilter !== 'All' && b.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchBatch = b.batchNumber.toLowerCase().includes(q);
      const matchProd = b.productName.toLowerCase().includes(q) || b.productSku.toLowerCase().includes(q);
      const matchSupplier = b.supplier.toLowerCase().includes(q);
      if (!matchBatch && !matchProd && !matchSupplier) return false;
    }
    return true;
  });

  const handleCreateBatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProd) return;

    createBatch({
      productId: currentProd.id,
      productSku: currentProd.sku,
      productName: currentProd.name,
      category: currentProd.category,
      batchNumber: batchNumber || `BATCH-2026-${Math.floor(100 + Math.random() * 900)}`,
      quantity: Number(quantity),
      expiryDate,
      warehouseCode,
      locationCode,
      supplier,
      purchaseCost: currentProd.costPerUnit,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-700">
              <Clock className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Batch & Expiry Management</h1>
            <span className="text-xs font-mono font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-md border border-rose-200">
              Perishable Goods & Chemical Shelf-Life
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Automated tracking of lot batches, days remaining countdowns, vendor recalls, and priority clearance.
          </p>
        </div>

        <button
          onClick={() => {
            setBatchNumber(`BATCH-2026-B${Math.floor(100 + Math.random() * 900)}`);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>REGISTER NEW BATCH</span>
        </button>
      </div>

      {/* Expiry Dashboard Badges (Requirement 5 exact format) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* 🔴 Expired */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Expired' ? 'All' : 'Expired')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Expired'
              ? 'bg-rose-900 text-white border-rose-900 shadow-md'
              : 'bg-white text-slate-900 border-rose-200 hover:border-rose-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-rose-600">
              <span className="w-3 h-3 rounded-full bg-rose-500" />
              <span className={statusFilter === 'Expired' ? 'text-white' : 'text-rose-900'}>
                🔴 Expired
              </span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${statusFilter === 'Expired' ? 'bg-white/20' : 'bg-rose-50 text-rose-700'}`}>
              Scrap Immediately
            </span>
          </div>
          <p className="text-3xl font-mono font-extrabold mt-3">{expiredCount}</p>
          <span className={`text-[11px] mt-1 block ${statusFilter === 'Expired' ? 'text-slate-300' : 'text-slate-400'}`}>
            Batches past expiry date
          </span>
        </div>

        {/* 🟠 Expiring in 7 days */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Expiring 7d' ? 'All' : 'Expiring 7d')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Expiring 7d'
              ? 'bg-amber-900 text-white border-amber-900 shadow-md'
              : 'bg-white text-slate-900 border-amber-200 hover:border-amber-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-amber-600">
              <span className="w-3 h-3 rounded-full bg-amber-500 animate-pulse" />
              <span className={statusFilter === 'Expiring 7d' ? 'text-white' : 'text-amber-900'}>
                🟠 Expiring in 7 Days
              </span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${statusFilter === 'Expiring 7d' ? 'bg-white/20' : 'bg-amber-50 text-amber-700'}`}>
              Critical Clearance
            </span>
          </div>
          <p className="text-3xl font-mono font-extrabold mt-3">{expiring7dCount}</p>
          <span className={`text-[11px] mt-1 block ${statusFilter === 'Expiring 7d' ? 'text-slate-300' : 'text-slate-400'}`}>
            Immediate discount/push
          </span>
        </div>

        {/* 🟡 Expiring in 30 days */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Expiring 30d' ? 'All' : 'Expiring 30d')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Expiring 30d'
              ? 'bg-yellow-900 text-white border-yellow-900 shadow-md'
              : 'bg-white text-slate-900 border-yellow-200 hover:border-yellow-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-yellow-600">
              <span className="w-3 h-3 rounded-full bg-yellow-400" />
              <span className={statusFilter === 'Expiring 30d' ? 'text-white' : 'text-yellow-900'}>
                🟡 Expiring in 30 Days
              </span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${statusFilter === 'Expiring 30d' ? 'bg-white/20' : 'bg-yellow-50 text-yellow-800'}`}>
              Priority Intake
            </span>
          </div>
          <p className="text-3xl font-mono font-extrabold mt-3">{expiring30dCount}</p>
          <span className={`text-[11px] mt-1 block ${statusFilter === 'Expiring 30d' ? 'text-slate-300' : 'text-slate-400'}`}>
            Monitor stock outflow
          </span>
        </div>

        {/* 🟢 Safe */}
        <div
          onClick={() => setStatusFilter(statusFilter === 'Safe' ? 'All' : 'Safe')}
          className={`p-4 rounded-2xl border transition-all cursor-pointer ${
            statusFilter === 'Safe'
              ? 'bg-emerald-900 text-white border-emerald-900 shadow-md'
              : 'bg-white text-slate-900 border-emerald-200 hover:border-emerald-400'
          }`}
        >
          <div className="flex items-center justify-between text-xs font-bold">
            <div className="flex items-center gap-1.5 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className={statusFilter === 'Safe' ? 'text-white' : 'text-emerald-900'}>
                🟢 Safe
              </span>
            </div>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${statusFilter === 'Safe' ? 'bg-white/20' : 'bg-emerald-50 text-emerald-700'}`}>
              Healthy Shelf-Life
            </span>
          </div>
          <p className="text-3xl font-mono font-extrabold mt-3">{safeCount}</p>
          <span className={`text-[11px] mt-1 block ${statusFilter === 'Safe' ? 'text-slate-300' : 'text-slate-400'}`}>
            &gt; 30 days remaining
          </span>
        </div>
      </div>

      {/* Alert Banner (Requirement 5) */}
      {totalExpiringSoon > 0 && (
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-2xl flex items-center justify-between gap-4 text-xs text-amber-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <p>
              <strong className="font-bold">⚠️ Expiry Risk Alert:</strong>{' '}
              {batches.filter((b) => b.daysRemaining > 0 && b.daysRemaining <= 30).reduce((s, b) => s + b.quantity, 0)} units across{' '}
              {totalExpiringSoon} product batches will expire within 30 days. Recommend priority fulfillment or promotional clearance.
            </p>
          </div>
          <button
            onClick={() => setStatusFilter('Expiring 30d')}
            className="px-3 py-1.5 bg-amber-200 hover:bg-amber-300 text-amber-950 font-bold rounded-xl whitespace-nowrap cursor-pointer transition-colors"
          >
            Show Expiring Batches
          </button>
        </div>
      )}

      {/* Search & Category Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Batch # (BATCH-2026-A109), Product, or Supplier..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-rose-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                Category: {c}
              </option>
            ))}
          </select>

          {statusFilter !== 'All' && (
            <button
              onClick={() => setStatusFilter('All')}
              className="px-2 py-1 text-xs text-rose-600 hover:underline cursor-pointer"
            >
              Clear Filter
            </button>
          )}
        </div>
      </div>

      {/* Batches Table (Requirement 5 exact fields) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Batch Number</th>
                <th className="py-3 px-4">Product SKU & Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">Expiry Date</th>
                <th className="py-3 px-4 text-right">Days Remaining</th>
                <th className="py-3 px-4">Warehouse & Loc</th>
                <th className="py-3 px-4">Supplier</th>
                <th className="py-3 px-4 text-right">Batch Value</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {b.batchNumber}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-800">{b.productSku}</span>
                    <span className="block text-slate-500 text-[11px]">{b.productName}</span>
                  </td>
                  <td className="py-3 px-4 text-slate-600">
                    {b.category}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                    {b.quantity}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-700">
                    {b.expiryDate}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span
                      className={`px-2 py-0.5 rounded ${
                        b.daysRemaining <= 0
                          ? 'bg-rose-100 text-rose-800'
                          : b.daysRemaining <= 7
                          ? 'bg-amber-100 text-amber-900'
                          : b.daysRemaining <= 30
                          ? 'bg-yellow-100 text-yellow-900'
                          : 'text-slate-600'
                      }`}
                    >
                      {b.daysRemaining <= 0 ? 'EXPIRED' : `${b.daysRemaining} days`}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {b.warehouseCode} / {b.locationCode}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium truncate max-w-xs">
                    {b.supplier}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    ₹{(b.quantity * b.purchaseCost).toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-[11px] font-bold ${
                        b.status === 'Expired'
                          ? 'bg-rose-100 text-rose-800'
                          : b.status === 'Expiring 7d'
                          ? 'bg-amber-100 text-amber-800'
                          : b.status === 'Expiring 30d'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* REGISTER BATCH MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-rose-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Register Inbound Product Batch</h3>
                <p className="text-xs text-slate-300">Set lot number, manufacturing & expiration dates</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBatch} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch / Lot Number</label>
                  <input
                    type="text"
                    required
                    value={batchNumber}
                    onChange={(e) => setBatchNumber(e.target.value)}
                    placeholder="BATCH-2026-X1"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Batch Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expiry Date</label>
                <input
                  type="date"
                  required
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Warehouse</label>
                  <select
                    value={warehouseCode}
                    onChange={(e) => setWarehouseCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {warehouses.map((w) => (
                      <option key={w.id} value={w.shortCode}>
                        {w.shortCode} - {w.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Storage Location</label>
                  <select
                    value={locationCode}
                    onChange={(e) => setLocationCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.shortCode}>
                        {loc.shortCode} ({loc.name})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Supplier / Manufacturer</label>
                <input
                  type="text"
                  required
                  value={supplier}
                  onChange={(e) => setSupplier(e.target.value)}
                  placeholder="e.g. Apex Chemical Solvents"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Commit Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
