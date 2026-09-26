import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  SlidersHorizontal,
  Plus,
  Search,
  CheckCircle2,
  X,
  AlertCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface StockAdjustmentsViewProps {
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export const StockAdjustmentsView: React.FC<StockAdjustmentsViewProps> = ({
  isCreateOpen: externalCreateOpen,
  onCloseCreate: externalCloseCreate,
}) => {
  const {
    adjustments,
    products,
    locations,
    currentUser,
    createAdjustment,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [internalCreateOpen, setInternalCreateOpen] = useState(false);

  const isModalOpen = Boolean(externalCreateOpen || internalCreateOpen);
  const closeModal = () => {
    if (externalCloseCreate) externalCloseCreate();
    setInternalCreateOpen(false);
  };

  // Form State
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [locationCode, setLocationCode] = useState('WH/Stock1');
  const [countedQuantity, setCountedQuantity] = useState<number>(0);
  const [reason, setReason] = useState('Physical stock count discrepancy');

  const selectedProduct = products.find((p) => p.id === selectedProductId) || products[0];
  const recordedQty = selectedProduct ? selectedProduct.onHand : 0;
  const difference = (Number(countedQuantity) || 0) - recordedQty;

  const filteredAdjustments = adjustments.filter((a) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = a.reference.toLowerCase().includes(q);
      const matchProd = a.productName.toLowerCase().includes(q) || a.productSku.toLowerCase().includes(q);
      const matchReason = a.reason.toLowerCase().includes(q);
      if (!matchRef && !matchProd && !matchReason) return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;

    createAdjustment({
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      productSku: selectedProduct.sku,
      locationCode,
      recordedQuantity: recordedQty,
      countedQuantity: Number(countedQuantity),
      reason,
      adjustedBy: currentUser?.loginId || 'ayush.giri',
    });

    closeModal();
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Adjustments</h1>
            <span className="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              WH/ADJ/xxxx
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Reconcile physical inventory counts against system records (damaged goods, shrinkage, audits).
          </p>
        </div>

        <button
          onClick={() => {
            if (selectedProduct) setCountedQuantity(selectedProduct.onHand);
            setInternalCreateOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>NEW ADJUSTMENT</span>
        </button>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Reference (WH/ADJ/0001), Product or Reason..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4 text-right">System Recorded</th>
                <th className="py-3 px-4 text-right">Physical Counted</th>
                <th className="py-3 px-4 text-right">Delta (Diff)</th>
                <th className="py-3 px-4">Reason / Notes</th>
                <th className="py-3 px-4 text-right">Auditor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdjustments.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No stock adjustments recorded.
                  </td>
                </tr>
              ) : (
                filteredAdjustments.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-amber-900">
                      {a.reference}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {a.date}
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-semibold text-slate-800">{a.productSku}</span>
                      <span className="block text-slate-500 text-[11px]">{a.productName}</span>
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {a.locationCode}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-slate-700">
                      {a.recordedQuantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                      {a.countedQuantity}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded ${
                          a.difference > 0
                            ? 'bg-emerald-50 text-emerald-700'
                            : a.difference < 0
                            ? 'bg-rose-50 text-rose-700'
                            : 'text-slate-500'
                        }`}
                      >
                        {a.difference > 0 ? (
                          <>
                            <TrendingUp className="w-3 h-3" />+{a.difference}
                          </>
                        ) : a.difference < 0 ? (
                          <>
                            <TrendingDown className="w-3 h-3" />
                            {a.difference}
                          </>
                        ) : (
                          '0'
                        )}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      {a.reason}
                    </td>
                    <td className="py-3 px-4 text-right text-slate-600">
                      {a.adjustedBy}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE ADJUSTMENT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-amber-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Stock Count Reconciliation</h3>
                <p className="text-xs text-slate-300">Format: WH/ADJ/xxxx</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setCountedQuantity(p.onHand);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name} (Recorded: {p.onHand} {p.uom})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location</label>
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

              <div className="grid grid-cols-2 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <span className="text-slate-400 block mb-0.5">System Recorded</span>
                  <p className="text-xl font-bold font-mono text-slate-800">
                    {recordedQty} <span className="text-xs font-normal text-slate-500">{selectedProduct?.uom}</span>
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-0.5">Physical Count</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={countedQuantity}
                    onChange={(e) => setCountedQuantity(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono font-bold text-base bg-white border border-slate-300 rounded-xl text-center"
                  />
                </div>
              </div>

              {/* Calculated difference notification */}
              <div
                className={`p-3 rounded-xl border flex items-center justify-between font-mono text-xs ${
                  difference === 0
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : difference > 0
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-bold'
                    : 'bg-rose-50 border-rose-200 text-rose-800 font-bold'
                }`}
              >
                <span>Stock Correction Delta:</span>
                <span>
                  {difference > 0 ? `+${difference}` : difference} {selectedProduct?.uom}
                </span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason for Adjustment</label>
                <input
                  type="text"
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="e.g. 3 kg steel damaged during forklift transit"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-sm cursor-pointer"
                >
                  Apply & Record Adjustment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
