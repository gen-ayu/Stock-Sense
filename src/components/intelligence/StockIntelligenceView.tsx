import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { StockHealthStatus, Product } from '../../types';
import {
  Brain,
  AlertTriangle,
  Package,
  TrendingDown,
  Clock,
  CheckCircle2,
  Search,
  ShoppingCart,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

interface StockIntelligenceViewProps {
  onOpenNewReceipt?: () => void;
}

export const StockIntelligenceView: React.FC<StockIntelligenceViewProps> = ({ onOpenNewReceipt }) => {
  const { products, batches, createReceipt, warehouses, currentUser } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHealthStatus, setSelectedHealthStatus] = useState<string>('All');

  // Compute detailed stock intelligence for each product (Requirement 6)
  const productIntelligence = products.map((prod) => {
    const dailyVelocity = prod.averageDailySales > 0 ? prod.averageDailySales : 0.5;
    const daysUntilStockout = Math.floor(prod.onHand / dailyVelocity);
    const safetyBuffer = dailyVelocity * prod.leadTimeDays;
    const isUnderLeadTime = daysUntilStockout <= prod.leadTimeDays;

    // Recommended reorder formula: (Lead Time * Daily Velocity * 2) - Current OnHand
    const recommendedReorder = Math.max(
      Math.ceil(dailyVelocity * prod.leadTimeDays * 2 - prod.onHand),
      prod.reorderPoint
    );

    // Determine status (Requirement 6 exact list)
    let health: StockHealthStatus = 'Healthy';
    if (prod.onHand === 0) health = 'Out of Stock';
    else if (daysUntilStockout <= 3) health = 'Critical';
    else if (prod.onHand <= prod.reorderPoint) health = 'Low Stock';
    else if (prod.onHand >= prod.overstockThreshold) health = 'Overstocked';
    else if (prod.daysWithoutSale >= 90) health = 'Dead Stock';

    return {
      product: prod,
      dailyVelocity,
      daysUntilStockout,
      leadTimeDays: prod.leadTimeDays,
      recommendedReorder,
      isUnderLeadTime,
      health,
    };
  });

  const statuses: Array<StockHealthStatus | 'All'> = [
    'All',
    'Low Stock',
    'Critical',
    'Out of Stock',
    'Overstocked',
    'Dead Stock',
    'Healthy',
  ];

  const filteredItems = productIntelligence.filter((item) => {
    if (selectedHealthStatus !== 'All' && item.health !== selectedHealthStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.product.name.toLowerCase().includes(q);
      const matchSku = item.product.sku.toLowerCase().includes(q);
      if (!matchName && !matchSku) return false;
    }
    return true;
  });

  const handleInstantReorder = (item: (typeof productIntelligence)[0]) => {
    createReceipt({
      partner: 'Primary Authorized Supplier',
      warehouseId: warehouses[0]?.id || 'wh_1',
      warehouseCode: 'WH',
      destinationLocationCode: 'WH/Stock1',
      scheduleDate: new Date(Date.now() + item.leadTimeDays * 86400000).toISOString().split('T')[0],
      status: 'Ready',
      responsibleUser: currentUser?.loginId || 'ayush.giri',
      notes: `Automated StockSense Reorder Intelligence trigger. Reorder recommendation: ${item.recommendedReorder} units.`,
      items: [
        {
          productId: item.product.id,
          productSku: item.product.sku,
          productName: item.product.name,
          quantity: item.recommendedReorder,
          unitCost: item.product.costPerUnit,
          uom: item.product.uom,
          locationCode: 'WH/Stock1',
        },
      ],
    });

    alert(
      `Generated incoming purchase order for ${item.recommendedReorder} ${item.product.uom} of ${item.product.name}!`
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-700">
              <Brain className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Stock Intelligence & Reorder Engine</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Replaces static inventory counts with dynamic stockout forecasting, daily sales velocity, lead-time buffers, and algorithmic reorder suggestions.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-mono font-bold text-indigo-800 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-200">
            Algorithmic Forecasting Active
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Product Name or SKU..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-indigo-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-500 font-medium mr-1">Health:</span>
          {statuses.map((st) => (
            <button
              key={st}
              onClick={() => setSelectedHealthStatus(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                selectedHealthStatus === st
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Reorder Intelligence Cards (Requirement 6 exact model) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredItems.map((item) => (
          <div
            key={item.product.id}
            className={`p-6 rounded-3xl border shadow-xs bg-white flex flex-col justify-between space-y-4 ${
              item.health === 'Critical' || item.health === 'Out of Stock'
                ? 'border-rose-300 ring-1 ring-rose-400/20'
                : item.health === 'Low Stock'
                ? 'border-amber-300 ring-1 ring-amber-400/20'
                : 'border-slate-200'
            }`}
          >
            <div>
              {/* Product header & Status Badge */}
              <div className="flex items-start justify-between gap-2">
                <div>
                  <span className="font-mono text-xs font-bold text-slate-400 block">
                    {item.product.sku}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 leading-tight">
                    {item.product.name}
                  </h3>
                </div>

                <span
                  className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold whitespace-nowrap ${
                    item.health === 'Critical' || item.health === 'Out of Stock'
                      ? 'bg-rose-100 text-rose-800'
                      : item.health === 'Low Stock'
                      ? 'bg-amber-100 text-amber-800'
                      : item.health === 'Overstocked'
                      ? 'bg-purple-100 text-purple-800'
                      : item.health === 'Dead Stock'
                      ? 'bg-slate-100 text-slate-700'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {item.health}
                </span>
              </div>

              {/* Requirement 6 Intelligence breakdown */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Current Stock:</span>
                  <span className="font-mono font-bold text-slate-900 text-sm">
                    {item.product.onHand} {item.product.uom}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Average Daily Sales:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {item.dailyVelocity} units/day
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Supplier Lead Time:</span>
                  <span className="font-mono font-semibold text-slate-800">
                    {item.leadTimeDays} days
                  </span>
                </div>

                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="font-bold text-slate-700">Estimated Stock-Out:</span>
                  <span
                    className={`font-mono font-extrabold ${
                      item.daysUntilStockout <= 3
                        ? 'text-rose-600'
                        : item.daysUntilStockout <= 7
                        ? 'text-amber-600'
                        : 'text-emerald-700'
                    }`}
                  >
                    {item.product.onHand === 0
                      ? 'Already Out of Stock'
                      : `${item.daysUntilStockout} days`}
                  </span>
                </div>
              </div>

              {/* Recommended Reorder Banner */}
              <div
                className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                  item.isUnderLeadTime || item.health === 'Low Stock'
                    ? 'bg-amber-50 border-amber-300 text-amber-900'
                    : 'bg-slate-50 border-slate-200 text-slate-700'
                }`}
              >
                <div>
                  <span className="block font-bold">⚠️ Recommended Reorder:</span>
                  <span className="text-[11px] text-slate-500 font-mono">
                    Based on {item.leadTimeDays}d lead time + run-rate
                  </span>
                </div>
                <span className="text-lg font-mono font-black text-amber-950">
                  {item.recommendedReorder} {item.product.uom}
                </span>
              </div>
            </div>

            <button
              onClick={() => handleInstantReorder(item)}
              className="w-full py-2.5 px-3 bg-slate-900 hover:bg-teal-700 text-white font-semibold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>Generate Purchase Reorder</span>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
