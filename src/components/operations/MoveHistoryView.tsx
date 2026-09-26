import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { StatusBadge } from '../common/StatusBadge';
import {
  History,
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  Filter,
} from 'lucide-react';

export const MoveHistoryView: React.FC = () => {
  const { moves } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'ALL' | 'IN' | 'OUT' | 'INTERNAL' | 'ADJUSTMENT'>('ALL');

  const filteredMoves = moves.filter((m) => {
    if (typeFilter !== 'ALL' && m.type !== typeFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = m.reference.toLowerCase().includes(q);
      const matchPartner = m.partner.toLowerCase().includes(q);
      const matchProd = m.productName.toLowerCase().includes(q) || m.productSku.toLowerCase().includes(q);
      const matchFrom = m.fromLocation.toLowerCase().includes(q);
      const matchTo = m.toLocation.toLowerCase().includes(q);
      if (!matchRef && !matchPartner && !matchProd && !matchFrom && !matchTo) return false;
    }
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <History className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Move History</h1>
            <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200">
              Complete Audit Trail Ledger
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Tracks all physical inventory moves between From and To locations with dedicated color-coded movement tags.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-800 font-medium font-mono">IN (Inbound)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-rose-800 font-medium font-mono">OUT (Outbound)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
            <span className="text-indigo-800 font-medium font-mono">INTERNAL</span>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Reference (WH/IN/0001), Contact (Azure Interior), Product..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium mr-1">Movement Type:</span>
          {(['ALL', 'IN', 'OUT', 'INTERNAL', 'ADJUSTMENT'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTypeFilter(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                typeFilter === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Event Type</th>
                <th className="py-3 px-4">Reference</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Contact / Partner</th>
                <th className="py-3 px-4">Product SKU & Name</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4">From Location</th>
                <th className="py-3 px-4">To Location</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredMoves.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400">
                    No movement records found.
                  </td>
                </tr>
              ) : (
                filteredMoves.map((m) => {
                  const isIn = m.type === 'IN';
                  const isOut = m.type === 'OUT';
                  const isInternal = m.type === 'INTERNAL';

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-50/80 transition-colors ${
                        isIn
                          ? 'border-l-4 border-l-emerald-500'
                          : isOut
                          ? 'border-l-4 border-l-rose-500'
                          : isInternal
                          ? 'border-l-4 border-l-indigo-500'
                          : 'border-l-4 border-l-amber-500'
                      }`}
                    >
                      {/* Event Type Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-mono text-[11px] font-bold ${
                            isIn
                              ? 'bg-emerald-100 text-emerald-800'
                              : isOut
                              ? 'bg-rose-100 text-rose-800'
                              : isInternal
                              ? 'bg-indigo-100 text-indigo-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {isIn && <ArrowDownLeft className="w-3 h-3" />}
                          {isOut && <ArrowUpRight className="w-3 h-3" />}
                          {isInternal && <ArrowLeftRight className="w-3 h-3" />}
                          {m.type}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono font-bold text-slate-900">
                        {m.reference}
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {m.date}
                      </td>

                      <td className="py-3 px-4 text-slate-700 font-medium">
                        {m.partner}
                      </td>

                      <td className="py-3 px-4">
                        <span className="font-mono font-medium text-slate-900">{m.productSku}</span>
                        <span className="block text-slate-500 text-[11px]">{m.productName}</span>
                      </td>

                      <td className="py-3 px-4 text-right font-mono font-extrabold text-sm">
                        <span
                          className={
                            isIn ? 'text-emerald-700' : isOut ? 'text-rose-700' : 'text-slate-800'
                          }
                        >
                          {isIn ? `+${m.quantity}` : isOut ? `-${m.quantity}` : m.quantity}
                        </span>
                      </td>

                      <td className="py-3 px-4 font-mono text-slate-600">
                        {m.fromLocation}
                      </td>

                      <td className="py-3 px-4 font-mono font-semibold text-slate-800">
                        {m.toLocation}
                      </td>

                      <td className="py-3 px-4 text-right">
                        <StatusBadge status={m.status} size="sm" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
