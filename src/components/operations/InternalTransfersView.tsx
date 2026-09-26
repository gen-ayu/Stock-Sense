import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { InternalTransfer, OperationItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import {
  ArrowLeftRight,
  Plus,
  Search,
  CheckCircle2,
  Trash2,
  X,
  MapPin,
} from 'lucide-react';

interface InternalTransfersViewProps {
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export const InternalTransfersView: React.FC<InternalTransfersViewProps> = ({
  isCreateOpen: externalCreateOpen,
  onCloseCreate: externalCloseCreate,
}) => {
  const {
    transfers,
    products,
    locations,
    currentUser,
    createTransfer,
    updateTransferStatus,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [internalCreateOpen, setInternalCreateOpen] = useState(false);
  const [selectedTransfer, setSelectedTransfer] = useState<InternalTransfer | null>(null);

  const isModalOpen = Boolean(externalCreateOpen || internalCreateOpen);
  const closeModal = () => {
    if (externalCloseCreate) externalCloseCreate();
    setInternalCreateOpen(false);
  };

  // Form State
  const [sourceLocationCode, setSourceLocationCode] = useState('WH/Stock1');
  const [destinationLocationCode, setDestinationLocationCode] = useState('WH/Stock2');
  const [scheduleDate, setScheduleDate] = useState('2026-09-28');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: products[0]?.id || '', quantity: 5 },
  ]);

  const filteredTransfers = transfers.filter((t) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = t.reference.toLowerCase().includes(q);
      const matchSrc = t.sourceLocationCode.toLowerCase().includes(q);
      const matchDest = t.destinationLocationCode.toLowerCase().includes(q);
      if (!matchRef && !matchSrc && !matchDest) return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (sourceLocationCode === destinationLocationCode) {
      alert('Source and destination locations must be different!');
      return;
    }

    const opItems: OperationItem[] = items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productSku: prod?.sku || '',
        productName: prod?.name || '',
        quantity: Number(it.quantity) || 1,
        unitCost: prod?.costPerUnit || 0,
        uom: prod?.uom || 'Units',
      };
    });

    createTransfer({
      sourceLocationCode,
      destinationLocationCode,
      scheduleDate,
      status: 'Ready',
      responsibleUser: currentUser?.loginId || 'ayush.giri',
      notes,
      items: opItems,
    });

    closeModal();
  };

  const addItemRow = () => {
    if (products.length > 0) {
      setItems([...items, { productId: products[0].id, quantity: 1 }]);
    }
  };

  const removeItemRow = (idx: number) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <ArrowLeftRight className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Internal Transfers</h1>
            <span className="text-xs font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
              WH/INT/xxxx
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Move stock between warehouse zones, racks and rooms. Total stock remains constant while location quantities rebalance.
          </p>
        </div>

        <button
          onClick={() => setInternalCreateOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>NEW TRANSFER</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Reference (WH/INT/0001) or Location (WH/Stock1)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
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
                <th className="py-3 px-4">From Location</th>
                <th className="py-3 px-4">To Location</th>
                <th className="py-3 px-4">Schedule Date</th>
                <th className="py-3 px-4">Items Transferred</th>
                <th className="py-3 px-4">Responsible</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransfers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No internal transfers recorded.
                  </td>
                </tr>
              ) : (
                filteredTransfers.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTransfer(t)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 font-mono font-bold text-indigo-900">
                      {t.reference}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                      {t.sourceLocationCode}
                    </td>
                    <td className="py-3 px-4 font-mono font-semibold text-indigo-700">
                      {t.destinationLocationCode}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">
                      {t.scheduleDate}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {t.items.map((i) => `${i.productSku} (${i.quantity})`).join(', ')}
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {t.responsibleUser}
                    </td>
                    <td className="py-3 px-4">
                      <StatusBadge status={t.status} />
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      {t.status === 'Ready' && (
                        <button
                          onClick={() => updateTransferStatus(t.id, 'Done')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1 ml-auto"
                        >
                          <CheckCircle2 className="w-3 h-3" />
                          VALIDATE
                        </button>
                      )}
                      {t.status === 'Draft' && (
                        <button
                          onClick={() => updateTransferStatus(t.id, 'Ready')}
                          className="px-2.5 py-1 text-[11px] font-semibold bg-indigo-50 text-indigo-700 hover:bg-indigo-100 rounded-lg border border-indigo-200 cursor-pointer ml-auto"
                        >
                          Set Ready
                        </button>
                      )}
                      {t.status === 'Done' && (
                        <span className="text-[11px] text-emerald-600 font-semibold">Completed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">New Internal Stock Movement</h3>
                <p className="text-xs text-slate-300">Format: WH/INT/xxxx</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Source Location (From)</label>
                  <select
                    value={sourceLocationCode}
                    onChange={(e) => setSourceLocationCode(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.shortCode}>
                        {loc.shortCode} ({loc.name})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Destination Location (To)</label>
                  <select
                    value={destinationLocationCode}
                    onChange={(e) => setDestinationLocationCode(e.target.value)}
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Schedule Date</label>
                <input
                  type="date"
                  required
                  value={scheduleDate}
                  onChange={(e) => setScheduleDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl font-mono"
                />
              </div>

              {/* Items Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Transfer Items
                  </label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold cursor-pointer"
                  >
                    + Add Product Line
                  </button>
                </div>

                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {items.map((it, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                      <select
                        value={it.productId}
                        onChange={(e) => {
                          const updated = [...items];
                          updated[idx].productId = e.target.value;
                          setItems(updated);
                        }}
                        className="flex-1 px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg"
                      >
                        {products.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.sku} - {p.name}
                          </option>
                        ))}
                      </select>

                      <div className="w-24">
                        <input
                          type="number"
                          min={1}
                          value={it.quantity}
                          onChange={(e) => {
                            const updated = [...items];
                            updated[idx].quantity = Math.max(1, parseInt(e.target.value) || 1);
                            setItems(updated);
                          }}
                          className="w-full px-2 py-1.5 text-center font-mono font-bold bg-white border border-slate-300 rounded-lg"
                        />
                      </div>

                      {items.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeItemRow(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Reason / Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Replenishment for assembly production line"
                  className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-sm cursor-pointer"
                >
                  Create Transfer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
