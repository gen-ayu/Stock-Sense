import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Delivery, OperationItem } from '../../types';
import { StatusBadge } from '../common/StatusBadge';
import { PrintVoucherModal } from '../common/PrintVoucherModal';
import {
  ArrowUpRight,
  Plus,
  Search,
  List,
  Kanban,
  Printer,
  CheckCircle2,
  Clock,
  Trash2,
  X,
  AlertTriangle,
  RotateCw,
} from 'lucide-react';

interface DeliveriesViewProps {
  isCreateOpen?: boolean;
  onCloseCreate?: () => void;
}

export const DeliveriesView: React.FC<DeliveriesViewProps> = ({
  isCreateOpen: externalCreateOpen,
  onCloseCreate: externalCloseCreate,
}) => {
  const {
    deliveries,
    products,
    warehouses,
    locations,
    currentUser,
    createDelivery,
    updateDeliveryStatus,
    recheckDeliveryAvailability,
    todayDate,
  } = useInventory();

  const [viewMode, setViewMode] = useState<'list' | 'kanban'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null);
  const [printOrder, setPrintOrder] = useState<Delivery | null>(null);
  const [internalCreateOpen, setInternalCreateOpen] = useState(false);

  const isModalOpen = Boolean(externalCreateOpen || internalCreateOpen);
  const closeModal = () => {
    if (externalCloseCreate) externalCloseCreate();
    setInternalCreateOpen(false);
  };

  // Form state
  const [partner, setPartner] = useState('Azure Interior');
  const [deliveryAddress, setDeliveryAddress] = useState('Floor 4, Azure Tower, Cyber Gateway');
  const [warehouseCode, setWarehouseCode] = useState('WH');
  const [sourceLocationCode, setSourceLocationCode] = useState('WH/Stock1');
  const [scheduleDate, setScheduleDate] = useState('2026-09-29');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<Array<{ productId: string; quantity: number }>>([
    { productId: products[0]?.id || '', quantity: 5 },
  ]);

  // Filtered deliveries
  const filteredDeliveries = deliveries.filter((d) => {
    if (statusFilter !== 'All' && d.status !== statusFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = d.reference.toLowerCase().includes(q);
      const matchPartner = d.partner.toLowerCase().includes(q);
      if (!matchRef && !matchPartner) return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    const opItems: OperationItem[] = items.map((it) => {
      const prod = products.find((p) => p.id === it.productId);
      return {
        productId: it.productId,
        productSku: prod?.sku || '',
        productName: prod?.name || '',
        quantity: Number(it.quantity) || 1,
        unitCost: prod?.costPerUnit || 0,
        uom: prod?.uom || 'Units',
        locationCode: sourceLocationCode,
      };
    });

    createDelivery({
      partner,
      deliveryAddress,
      warehouseId: warehouses[0]?.id || 'wh_1',
      warehouseCode,
      sourceLocationCode,
      scheduleDate,
      status: 'Ready', // createDelivery will auto-downgrade to 'Waiting' if stock is insufficient!
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

  // Helper to check if delivery has any line with insufficient stock
  const checkStockShortage = (delivery: Delivery) => {
    return delivery.items.some((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return !prod || prod.onHand < item.quantity;
    });
  };

  return (
    <div className="space-y-5">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-sky-50 text-sky-700">
              <ArrowUpRight className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Delivery Orders</h1>
            <span className="text-xs font-mono font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-md border border-sky-200">
              WH/OUT/xxxx
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Pick, pack and dispatch customer orders. Out-of-stock items automatically switch to Waiting.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Dual View Toggle */}
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'list' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <List className="w-4 h-4" />
              <span>List</span>
            </button>
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                viewMode === 'kanban' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <Kanban className="w-4 h-4" />
              <span>Kanban</span>
            </button>
          </div>

          <button
            onClick={() => setInternalCreateOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>NEW DELIVERY</span>
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Reference (WH/OUT/0001) or Customer (Azure Interior)..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-slate-500 font-medium">Filter Status:</span>
          {['All', 'Draft', 'Waiting', 'Ready', 'Done'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                statusFilter === st
                  ? 'bg-slate-900 text-white font-semibold'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Contact (Customer)</th>
                  <th className="py-3 px-4">Source Location</th>
                  <th className="py-3 px-4">Schedule Date</th>
                  <th className="py-3 px-4">Items / Stock Alert</th>
                  <th className="py-3 px-4">Responsible</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDeliveries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No deliveries found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredDeliveries.map((d) => {
                    const isLate = (d.status === 'Draft' || d.status === 'Waiting' || d.status === 'Ready') && d.scheduleDate < todayDate;
                    const hasShortage = checkStockShortage(d);

                    return (
                      <tr
                        key={d.id}
                        onClick={() => setSelectedDelivery(d)}
                        className={`hover:bg-slate-50/80 cursor-pointer transition-colors ${
                          hasShortage && d.status === 'Waiting'
                            ? 'bg-rose-50/40 border-l-4 border-rose-500'
                            : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-mono font-bold text-sky-900">
                          {d.reference}
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-800">
                          {d.partner}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {d.sourceLocationCode}
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <span>{d.scheduleDate}</span>
                            {isLate && (
                              <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                                LATE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <div className="space-y-1">
                            {d.items.map((i, idx) => {
                              const p = products.find((prod) => prod.id === i.productId);
                              const short = p ? p.onHand < i.quantity : true;
                              return (
                                <div key={idx} className="flex items-center gap-1.5">
                                  <span className={`font-mono ${short && d.status !== 'Done' ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                                    {i.productSku} ({i.quantity})
                                  </span>
                                  {short && d.status !== 'Done' && (
                                    <span className="px-1.5 py-0.2 bg-rose-100 text-rose-700 text-[10px] font-bold rounded flex items-center gap-0.5">
                                      <AlertTriangle className="w-2.5 h-2.5" />
                                      Low Stock ({p?.onHand || 0} left)
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {d.responsibleUser}
                        </td>
                        <td className="py-3 px-4">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-end gap-1.5">
                            {d.status === 'Waiting' && (
                              <button
                                onClick={() => {
                                  const ok = recheckDeliveryAvailability(d.id);
                                  if (!ok) {
                                    alert('Stock is still insufficient for one or more items!');
                                  }
                                }}
                                title="Recheck Stock"
                                className="px-2 py-1 text-[11px] font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-300 cursor-pointer flex items-center gap-1"
                              >
                                <RotateCw className="w-3 h-3" />
                                Recheck
                              </button>
                            )}
                            {d.status === 'Draft' && (
                              <button
                                onClick={() => updateDeliveryStatus(d.id, 'Ready')}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg border border-sky-200 cursor-pointer"
                              >
                                Set Ready
                              </button>
                            )}
                            {d.status === 'Ready' && (
                              <button
                                onClick={() => updateDeliveryStatus(d.id, 'Done')}
                                className="px-2.5 py-1 text-[11px] font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg shadow-xs cursor-pointer flex items-center gap-1"
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                VALIDATE
                              </button>
                            )}
                            <button
                              onClick={() => setPrintOrder(d)}
                              title="Print Dispatch Voucher"
                              className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              <Printer className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* KANBAN VIEW */}
      {viewMode === 'kanban' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['Draft', 'Waiting', 'Ready', 'Done'] as const).map((colStatus) => {
            const colItems = filteredDeliveries.filter((d) => d.status === colStatus);
            return (
              <div
                key={colStatus}
                className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200/80 flex flex-col min-h-[420px]"
              >
                <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs uppercase tracking-wider text-slate-700">
                      {colStatus}
                    </span>
                    <span className="px-2 py-0.5 bg-white text-slate-700 font-mono text-xs font-bold rounded-full shadow-2xs border border-slate-200">
                      {colItems.length}
                    </span>
                  </div>
                </div>

                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colItems.map((d) => {
                    const isLate = (d.status === 'Draft' || d.status === 'Waiting' || d.status === 'Ready') && d.scheduleDate < todayDate;
                    const hasShortage = checkStockShortage(d);

                    return (
                      <div
                        key={d.id}
                        onClick={() => setSelectedDelivery(d)}
                        className={`bg-white p-3.5 rounded-xl border shadow-xs hover:shadow-md transition-shadow cursor-pointer space-y-2 ${
                          hasShortage && d.status === 'Waiting'
                            ? 'border-rose-400 ring-1 ring-rose-400/30 bg-rose-50/20'
                            : 'border-slate-200'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono font-bold text-xs text-sky-900">
                            {d.reference}
                          </span>
                          {isLate && (
                            <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded">
                              LATE
                            </span>
                          )}
                        </div>

                        <div>
                          <p className="text-xs font-semibold text-slate-800">{d.partner}</p>
                          <p className="text-[11px] text-slate-500 truncate">{d.deliveryAddress}</p>
                        </div>

                        {hasShortage && d.status === 'Waiting' && (
                          <div className="p-1.5 bg-rose-50 border border-rose-200 rounded-lg text-[10px] text-rose-700 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3 shrink-0 text-rose-500" />
                            <span>Out of stock alert: waiting for intake</span>
                          </div>
                        )}

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                          <span>{d.scheduleDate}</span>
                          <span className="font-mono font-semibold text-slate-700">
                            {d.items.reduce((s, i) => s + i.quantity, 0)} units
                          </span>
                        </div>

                        {/* Card action */}
                        <div className="pt-1 flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          {d.status === 'Waiting' && (
                            <button
                              onClick={() => recheckDeliveryAvailability(d.id)}
                              className="w-full py-1 text-xs font-semibold bg-amber-100 text-amber-800 hover:bg-amber-200 rounded-lg cursor-pointer text-center"
                            >
                              Recheck Stock Availability
                            </button>
                          )}
                          {d.status === 'Draft' && (
                            <button
                              onClick={() => updateDeliveryStatus(d.id, 'Ready')}
                              className="w-full py-1 text-xs font-semibold bg-sky-50 text-sky-700 hover:bg-sky-100 rounded-lg border border-sky-200 cursor-pointer text-center"
                            >
                              Move to Ready
                            </button>
                          )}
                          {d.status === 'Ready' && (
                            <button
                              onClick={() => updateDeliveryStatus(d.id, 'Done')}
                              className="w-full py-1 text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg cursor-pointer text-center flex items-center justify-center gap-1"
                            >
                              <CheckCircle2 className="w-3.5 h-3.5" />
                              Validate Dispatch
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DETAIL MODAL */}
      {selectedDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-6 bg-slate-900 text-white flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-bold font-mono text-sky-400">
                    {selectedDelivery.reference}
                  </h3>
                  <StatusBadge status={selectedDelivery.status} />
                </div>
                <p className="text-xs text-slate-400 mt-1">Delivery Order & Fulfillment Manifest</p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPrintOrder(selectedDelivery)}
                  className="px-3 py-1.5 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  Print
                </button>
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Stepper */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-500">Lifecycle Progress:</span>
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded-md ${selectedDelivery.status === 'Draft' ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  Draft
                </span>
                <span>➔</span>
                <span className={`px-2 py-0.5 rounded-md ${selectedDelivery.status === 'Waiting' ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  Waiting
                </span>
                <span>➔</span>
                <span className={`px-2 py-0.5 rounded-md ${selectedDelivery.status === 'Ready' ? 'bg-sky-600 text-white' : selectedDelivery.status === 'Done' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                  Ready
                </span>
                <span>➔</span>
                <span className={`px-2 py-0.5 rounded-md ${selectedDelivery.status === 'Done' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                  Done
                </span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block mb-0.5">Customer</span>
                  <p className="font-semibold text-slate-800">{selectedDelivery.partner}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Schedule Date</span>
                  <p className="font-semibold text-slate-800 font-mono">{selectedDelivery.scheduleDate}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Source Location</span>
                  <p className="font-semibold text-sky-800 font-mono">{selectedDelivery.sourceLocationCode}</p>
                </div>
                <div>
                  <span className="text-slate-400 block mb-0.5">Responsible</span>
                  <p className="font-semibold text-slate-800">{selectedDelivery.responsibleUser}</p>
                </div>
              </div>

              <div>
                <span className="text-slate-400 text-xs block mb-0.5">Delivery Destination Address</span>
                <p className="text-xs text-slate-700 bg-slate-50 p-2.5 rounded-xl border border-slate-200">
                  {selectedDelivery.deliveryAddress}
                </p>
              </div>

              {/* Items Table with Out of stock red alerts */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 mb-2">Order Line Items</h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-slate-50 border-b border-slate-200 text-slate-600">
                      <tr>
                        <th className="py-2 px-3">Product</th>
                        <th className="py-2 px-3 text-right">Required</th>
                        <th className="py-2 px-3 text-right">Available On Hand</th>
                        <th className="py-2 px-3 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedDelivery.items.map((it, idx) => {
                        const prod = products.find((p) => p.id === it.productId);
                        const isShort = prod ? prod.onHand < it.quantity : true;
                        return (
                          <tr key={idx} className={isShort && selectedDelivery.status !== 'Done' ? 'bg-rose-50/60' : ''}>
                            <td className="py-2.5 px-3">
                              <span className={`font-mono font-semibold ${isShort && selectedDelivery.status !== 'Done' ? 'text-rose-700' : 'text-slate-800'}`}>
                                {it.productSku}
                              </span>
                              <span className="block text-slate-500 text-[11px]">{it.productName}</span>
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                              {it.quantity} {it.uom}
                            </td>
                            <td className="py-2.5 px-3 text-right font-mono font-bold">
                              <span className={isShort && selectedDelivery.status !== 'Done' ? 'text-rose-600' : 'text-slate-700'}>
                                {prod?.onHand || 0} {it.uom}
                              </span>
                            </td>
                            <td className="py-2.5 px-3 text-right">
                              {isShort && selectedDelivery.status !== 'Done' ? (
                                <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-100 px-2 py-0.5 rounded">
                                  <AlertTriangle className="w-3 h-3" /> Insufficient Stock
                                </span>
                              ) : (
                                <span className="text-emerald-600 font-semibold text-[11px]">In Stock</span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
                <button
                  onClick={() => setSelectedDelivery(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Close
                </button>

                <div className="flex items-center gap-2">
                  {selectedDelivery.status === 'Waiting' && (
                    <button
                      onClick={() => {
                        const success = recheckDeliveryAvailability(selectedDelivery.id);
                        if (success) {
                          setSelectedDelivery({ ...selectedDelivery, status: 'Ready' });
                          alert('Stock is now available! Delivery moved to READY.');
                        } else {
                          alert('Stock remains insufficient.');
                        }
                      }}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer flex items-center gap-1"
                    >
                      <RotateCw className="w-3.5 h-3.5" />
                      Recheck Stock
                    </button>
                  )}

                  {selectedDelivery.status === 'Ready' && (
                    <button
                      onClick={() => {
                        updateDeliveryStatus(selectedDelivery.id, 'Done');
                        setSelectedDelivery({ ...selectedDelivery, status: 'Done' });
                      }}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      Validate & Dispatch (-Stock)
                    </button>
                  )}

                  {selectedDelivery.status === 'Done' && (
                    <span className="px-3 py-1.5 bg-emerald-50 text-emerald-800 font-semibold text-xs rounded-xl border border-emerald-200 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      Dispatched and Deducted from Stock
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW DELIVERY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-sky-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">New Outgoing Delivery Order</h3>
                <p className="text-xs text-slate-300">Auto sequential numbering: WH/OUT/xxxx</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Contact</label>
                  <input
                    type="text"
                    required
                    value={partner}
                    onChange={(e) => setPartner(e.target.value)}
                    placeholder="e.g. Azure Interior"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Schedule Date</label>
                  <input
                    type="date"
                    required
                    value={scheduleDate}
                    onChange={(e) => setScheduleDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl focus:ring-1 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Delivery Address</label>
                <input
                  type="text"
                  required
                  value={deliveryAddress}
                  onChange={(e) => setDeliveryAddress(e.target.value)}
                  placeholder="Street, City, Postal Code"
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
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
                  <label className="block font-semibold text-slate-700 mb-1">Source Location</label>
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
              </div>

              {/* Items Section */}
              <div className="pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Delivery Items
                  </label>
                  <button
                    type="button"
                    onClick={addItemRow}
                    className="text-xs text-sky-600 hover:text-sky-700 font-semibold cursor-pointer"
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
                            {p.sku} - {p.name} (Stock: {p.onHand})
                          </option>
                        ))}
                      </select>

                      <div className="w-24 flex items-center gap-1">
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
                <label className="block text-xs font-semibold text-slate-700 mb-1">Notes / Instructions</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  placeholder="e.g. Loading dock pass required"
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
                  className="px-5 py-2 text-xs font-bold text-white bg-sky-600 hover:bg-sky-700 rounded-xl shadow-sm cursor-pointer"
                >
                  Confirm & Create Delivery
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PRINT VOUCHER MODAL */}
      <PrintVoucherModal
        order={printOrder}
        type="Delivery"
        onClose={() => setPrintOrder(null)}
      />
    </div>
  );
};
