import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types';
import {
  X,
  TrendingUp,
  Package,
  Calendar,
  Layers,
  Clock,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowLeftRight,
  SlidersHorizontal,
  DollarSign,
  Percent,
} from 'lucide-react';

interface ProductDrillDownModalProps {
  product: Product | null;
  onClose: () => void;
}

export const ProductDrillDownModal: React.FC<ProductDrillDownModalProps> = ({
  product,
  onClose,
}) => {
  const { sales, moves, receipts, transfers, adjustments } = useInventory();

  if (!product) return null;

  // Filter sales for this product
  const productSales = sales.filter((s) => s.productId === product.id);
  const unitsSold = productSales.reduce((sum, s) => sum + s.quantity, 0);
  const revenue = productSales.reduce((sum, s) => sum + s.revenue, 0);
  const purchaseCost = unitsSold * product.costPerUnit;
  const grossProfit = revenue - purchaseCost;
  const profitMargin = revenue > 0 ? Math.round((grossProfit / revenue) * 1000) / 10 : 0;
  const totalStockValue = product.onHand * product.costPerUnit;

  // Waterfall Stock Movement calculations (Requirement 4)
  const purchaseIn = receipts
    .filter((r) => r.status === 'Done')
    .reduce((sum, r) => {
      const it = r.items.find((item) => item.productId === product.id);
      return sum + (it ? it.quantity : 0);
    }, 0);

  const transferOut = transfers
    .filter((t) => t.status === 'Done')
    .reduce((sum, t) => {
      const it = t.items.find((item) => item.productId === product.id);
      return sum + (it ? it.quantity : 0);
    }, 0);

  const saleOut = unitsSold;

  const adjDiff = adjustments
    .filter((a) => a.productId === product.id)
    .reduce((sum, a) => sum + a.difference, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-8 animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-6 text-white flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md font-mono text-xs font-bold bg-teal-500/20 text-teal-300 border border-teal-400/30">
                {product.sku}
              </span>
              <span className="text-xs text-slate-300 font-medium">{product.category}</span>
            </div>
            <h2 className="text-2xl font-black tracking-tight mt-1">{product.name}</h2>
            <p className="text-xs text-slate-300 mt-0.5">{product.description || 'Enterprise catalog item'}</p>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6 max-h-[calc(85vh-120px)] overflow-y-auto">
          {/* Key Intelligence Matrix (Requirement 4 exact layout) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block mb-0.5">Current Stock</span>
              <p className="text-xl font-bold font-mono text-slate-900">
                {product.onHand.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">{product.uom}</span>
              </p>
              <span className="text-[10px] text-teal-700 font-mono">
                Free: {product.freeToUse} | Reserved: {product.reserved}
              </span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Units Sold</span>
              <p className="text-xl font-bold font-mono text-slate-900">
                {unitsSold.toLocaleString()}{' '}
                <span className="text-xs font-normal text-slate-500">{product.uom}</span>
              </p>
              <span className="text-[10px] text-slate-500 font-mono">Total Sales Orders</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Revenue</span>
              <p className="text-xl font-bold font-mono text-slate-900">
                ₹{revenue.toLocaleString()}
              </p>
              <span className="text-[10px] text-emerald-600 font-medium">Realized sales</span>
            </div>

            <div>
              <span className="text-slate-400 block mb-0.5">Purchase Cost</span>
              <p className="text-xl font-bold font-mono text-slate-700">
                ₹{purchaseCost.toLocaleString()}
              </p>
              <span className="text-[10px] text-slate-400 font-mono">Cost of goods sold</span>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-slate-400 block mb-0.5">Gross Profit</span>
              <p className="text-xl font-bold font-mono text-teal-700">
                ₹{grossProfit.toLocaleString()}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-slate-400 block mb-0.5">Profit Margin</span>
              <p className="text-xl font-bold font-mono text-teal-700">
                {profitMargin}%
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-slate-400 block mb-0.5">Average Daily Sales</span>
              <p className="text-xl font-bold font-mono text-slate-900">
                {product.averageDailySales} <span className="text-xs font-normal text-slate-500">/day</span>
              </p>
            </div>

            <div className="pt-3 border-t border-slate-200">
              <span className="text-slate-400 block mb-0.5">Total Stock Value</span>
              <p className="text-xl font-bold font-mono text-slate-900">
                ₹{totalStockValue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Timing details */}
          <div className="flex flex-wrap items-center justify-between text-xs px-2 text-slate-500">
            <span>Last Sale: <strong className="text-slate-800 font-mono">{product.lastSaleDate}</strong></span>
            <span>Last Purchase: <strong className="text-slate-800 font-mono">{product.lastPurchaseDate}</strong></span>
            <span>Lead Time: <strong className="text-slate-800 font-mono">{product.leadTimeDays} days</strong></span>
            <span>Days without sale: <strong className={`font-mono ${product.daysWithoutSale >= 90 ? 'text-rose-600 font-bold' : 'text-slate-800'}`}>{product.daysWithoutSale} days</strong></span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Sales History Table (Requirement 4) */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3 flex items-center justify-between">
                <span>Recent Sales History</span>
                <span className="text-[11px] font-mono text-slate-400">{productSales.length} records</span>
              </h4>

              <div className="overflow-x-auto max-h-56">
                <table className="w-full text-xs text-left">
                  <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                    <tr>
                      <th className="py-2 px-2.5">Date</th>
                      <th className="py-2 px-2.5">Channel</th>
                      <th className="py-2 px-2.5 text-right">Qty</th>
                      <th className="py-2 px-2.5 text-right">Revenue</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {productSales.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-slate-400">
                          No sales recorded yet.
                        </td>
                      </tr>
                    ) : (
                      productSales.map((s) => (
                        <tr key={s.id} className="hover:bg-slate-50/70">
                          <td className="py-2 px-2.5 font-mono text-slate-600">{s.date}</td>
                          <td className="py-2 px-2.5 text-slate-800 font-medium">{s.channel}</td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                            {s.quantity}
                          </td>
                          <td className="py-2 px-2.5 text-right font-mono font-bold text-slate-900">
                            ₹{s.revenue.toLocaleString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock Movement Waterfall (Requirement 4) */}
            <div className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col justify-between">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-3">
                  Stock Movement Waterfall
                </h4>
                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between items-center p-2 rounded-xl bg-emerald-50 text-emerald-800">
                    <span>Purchases / Inbound Receipts (+)</span>
                    <span className="font-bold">+{purchaseIn} {product.uom}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-indigo-50 text-indigo-800">
                    <span>Internal Transfer Moves (-)</span>
                    <span className="font-bold">-{transferOut} {product.uom}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-rose-50 text-rose-800">
                    <span>Sales & Dispatches (-)</span>
                    <span className="font-bold">-{saleOut} {product.uom}</span>
                  </div>

                  <div className="flex justify-between items-center p-2 rounded-xl bg-amber-50 text-amber-800">
                    <span>Stock Count Adjustments (Δ)</span>
                    <span className="font-bold">{adjDiff >= 0 ? `+${adjDiff}` : adjDiff} {product.uom}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t-2 border-slate-900 flex justify-between items-center text-sm font-bold font-mono">
                <span className="text-slate-700 uppercase text-xs">Current Physical Balance:</span>
                <span className="text-lg text-teal-800 font-extrabold">{product.onHand} {product.uom}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs"
          >
            Close Drill-Down
          </button>
        </div>
      </div>
    </div>
  );
};
