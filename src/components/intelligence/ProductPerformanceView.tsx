import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types';
import { ProductDrillDownModal } from '../products/ProductDrillDownModal';
import {
  Award,
  TrendingDown,
  Archive,
  Search,
  ExternalLink,
  Tag,
  Gift,
  RotateCcw,
  Ban,
  ArrowUpRight,
  AlertTriangle,
} from 'lucide-react';

export const ProductPerformanceView: React.FC = () => {
  const { products, sales } = useInventory();

  const [activeTab, setActiveTab] = useState<'bestsellers' | 'slowmoving' | 'deadstock'>('bestsellers');
  const [deadStockDaysFilter, setDeadStockDaysFilter] = useState<'all' | '30' | '60' | '90' | '180'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  // Compute product sales performance map
  const productPerformance = products.map((prod) => {
    const prodSales = sales.filter((s) => s.productId === prod.id);
    const unitsSold = prodSales.reduce((sum, s) => sum + s.quantity, 0);
    const revenue = prodSales.reduce((sum, s) => sum + s.revenue, 0);
    const profit = prodSales.reduce((sum, s) => sum + s.profit, 0);
    const profitMargin = revenue > 0 ? Math.round((profit / revenue) * 100) : 0;
    const turnoverRate = prod.onHand > 0 ? Math.round((unitsSold / (prod.onHand + unitsSold)) * 100) : 0;

    return {
      product: prod,
      unitsSold,
      revenue,
      profit,
      profitMargin,
      turnoverRate,
      daysWithoutSale: prod.daysWithoutSale,
    };
  });

  // Best-sellers sorted by units sold / revenue
  const bestSellers = [...productPerformance]
    .filter((p) => p.unitsSold > 0)
    .sort((a, b) => b.unitsSold - a.unitsSold);

  // Slow-moving: low turnover, or days without sale between 15 and 90
  const slowMoving = [...productPerformance]
    .filter((p) => p.turnoverRate < 20 || (p.daysWithoutSale >= 15 && p.daysWithoutSale < 90))
    .sort((a, b) => b.product.onHand - a.product.onHand);

  // Dead stock: days without sale >= 30, with specific tier filter (Requirement 3)
  const deadStock = [...productPerformance].filter((p) => {
    if (deadStockDaysFilter === '30') return p.daysWithoutSale >= 30 && p.daysWithoutSale < 60;
    if (deadStockDaysFilter === '60') return p.daysWithoutSale >= 60 && p.daysWithoutSale < 90;
    if (deadStockDaysFilter === '90') return p.daysWithoutSale >= 90 && p.daysWithoutSale < 180;
    if (deadStockDaysFilter === '180') return p.daysWithoutSale >= 180;
    return p.daysWithoutSale >= 30;
  });

  const handleDeadStockAction = (action: string, prodName: string) => {
    alert(`Initiated action: [${action}] for "${prodName}". Status flagged in ERP.`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Award className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Product Performance & Velocity</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Isolate your best revenue drivers, identify sluggish inventory turnover, and clear stagnant dead stock.
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('bestsellers')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'bestsellers' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Best-Sellers ({bestSellers.length})
          </button>
          <button
            onClick={() => setActiveTab('slowmoving')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'slowmoving' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Slow-Moving ({slowMoving.length})
          </button>
          <button
            onClick={() => setActiveTab('deadstock')}
            className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
              activeTab === 'deadstock' ? 'bg-white text-rose-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Dead Stock ({deadStock.length})
          </button>
        </div>
      </div>

      {/* TAB 1: BEST-SELLERS (Requirement 3 Table) */}
      {activeTab === 'bestsellers' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
              Top Ranked Products by Revenue & Units Sold
            </h3>
            <span className="text-[11px] text-slate-400">Click row for full product drill-down</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4 w-12 text-center"># Rank</th>
                  <th className="py-3 px-4">Product</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Units Sold</th>
                  <th className="py-3 px-4 text-right">Revenue</th>
                  <th className="py-3 px-4 text-right">Gross Profit</th>
                  <th className="py-3 px-4 text-right">Margin (%)</th>
                  <th className="py-3 px-4 text-right">Turnover</th>
                  <th className="py-3 px-4 text-right">Drill Down</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {bestSellers.map((item, idx) => (
                  <tr
                    key={item.product.id}
                    onClick={() => setSelectedProduct(item.product)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4 text-center font-bold font-mono">
                      <span
                        className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs ${
                          idx === 0
                            ? 'bg-amber-100 text-amber-900 border border-amber-300 font-extrabold'
                            : idx === 1
                            ? 'bg-slate-200 text-slate-800 font-bold'
                            : idx === 2
                            ? 'bg-amber-50 text-amber-800'
                            : 'text-slate-500'
                        }`}
                      >
                        {idx + 1}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">{item.product.sku}</span>
                      <span className="block text-slate-600 text-[11px]">{item.product.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.product.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                      {item.unitsSold}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                      ₹{item.revenue.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-teal-700">
                      ₹{item.profit.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-700">
                      {item.profitMargin}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-emerald-700 font-semibold">
                      {item.turnoverRate}%
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button className="text-xs font-semibold text-teal-700 hover:text-teal-900 inline-flex items-center gap-1">
                        <span>Details</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: SLOW-MOVING PRODUCTS (Requirement 3) */}
      {activeTab === 'slowmoving' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-700">
                Slow-Moving Stock (Low Turnover / Idle Days)
              </h3>
              <p className="text-[11px] text-slate-500">
                High inventory with low demand velocities. Consider promotional markdown.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3 px-4">Product SKU & Name</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Current On-Hand</th>
                  <th className="py-3 px-4 text-right">Stock Value (Tied Capital)</th>
                  <th className="py-3 px-4 text-right">Days Since Last Sale</th>
                  <th className="py-3 px-4 text-right">Turnover Rate</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {slowMoving.map((item) => (
                  <tr
                    key={item.product.id}
                    onClick={() => setSelectedProduct(item.product)}
                    className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-4">
                      <span className="font-mono font-bold text-slate-900">{item.product.sku}</span>
                      <span className="block text-slate-500 text-[11px]">{item.product.name}</span>
                    </td>
                    <td className="py-3 px-4 text-slate-600">
                      {item.product.category}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                      {item.product.onHand} {item.product.uom}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-extrabold text-amber-900">
                      ₹{(item.product.onHand * item.product.costPerUnit).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-semibold text-rose-700">
                      {item.daysWithoutSale} days
                    </td>
                    <td className="py-3 px-4 text-right font-mono text-slate-500">
                      {item.turnoverRate}%
                    </td>
                    <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => handleDeadStockAction('Bundle Discount Promo', item.product.name)}
                        className="px-2.5 py-1 text-[11px] font-semibold bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 cursor-pointer"
                      >
                        Create Promo
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: DEAD STOCK WITH TIER FILTERS (Requirement 3) */}
      {activeTab === 'deadstock' && (
        <div className="space-y-4">
          {/* Tier Filters: 30, 60, 90, 180+ days */}
          <div className="bg-white p-4 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Archive className="w-4 h-4 text-rose-600" />
                Dead Stock Analysis & Liquidation Engine
              </h3>
              <p className="text-xs text-slate-500">
                Products with zero sales activity over prolonged periods. Decide whether to discount, bundle, return to supplier, or discontinue.
              </p>
            </div>

            <div className="flex items-center gap-1 text-xs">
              <span className="text-slate-500 font-semibold mr-1">No sales for:</span>
              {[
                { id: 'all', label: 'All Stagnant' },
                { id: '30', label: '30+ Days' },
                { id: '60', label: '60+ Days' },
                { id: '90', label: '90+ Days' },
                { id: '180', label: '180+ Days' },
              ].map((tier) => (
                <button
                  key={tier.id}
                  onClick={() => setDeadStockDaysFilter(tier.id as any)}
                  className={`px-2.5 py-1 rounded-lg font-semibold transition-colors cursor-pointer ${
                    deadStockDaysFilter === tier.id
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {tier.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Product SKU & Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4 text-right">Idle Stock</th>
                    <th className="py-3 px-4 text-right">Tied Value</th>
                    <th className="py-3 px-4 text-right">Zero Sales Duration</th>
                    <th className="py-3 px-4 text-right">Action Resolution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {deadStock.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-400">
                        No dead stock found matching this duration tier!
                      </td>
                    </tr>
                  ) : (
                    deadStock.map((item) => (
                      <tr
                        key={item.product.id}
                        onClick={() => setSelectedProduct(item.product)}
                        className="hover:bg-slate-50/80 cursor-pointer transition-colors"
                      >
                        <td className="py-3 px-4">
                          <span className="font-mono font-bold text-slate-900">{item.product.sku}</span>
                          <span className="block text-slate-500 text-[11px]">{item.product.name}</span>
                        </td>
                        <td className="py-3 px-4 text-slate-600">
                          {item.product.category}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                          {item.product.onHand} {item.product.uom}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-extrabold text-rose-700">
                          ₹{(item.product.onHand * item.product.costPerUnit).toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <span className="px-2 py-0.5 rounded-md font-mono font-bold text-xs bg-rose-100 text-rose-800">
                            {item.daysWithoutSale} days idle
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                          {/* 4 Action triggers specified in prompt: Discount, Bundle, Return, Discontinue */}
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleDeadStockAction('Apply Clearance Discount', item.product.name)}
                              title="Apply Markdown Discount"
                              className="px-2 py-1 bg-amber-50 text-amber-800 hover:bg-amber-100 rounded-lg border border-amber-200 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                            >
                              <Tag className="w-3 h-3" />
                              Discount
                            </button>
                            <button
                              onClick={() => handleDeadStockAction('Bundle with Fast Moving Item', item.product.name)}
                              title="Create Product Bundle"
                              className="px-2 py-1 bg-sky-50 text-sky-800 hover:bg-sky-100 rounded-lg border border-sky-200 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                            >
                              <Gift className="w-3 h-3" />
                              Bundle
                            </button>
                            <button
                              onClick={() => handleDeadStockAction('Return Stock to Supplier', item.product.name)}
                              title="Return to Supplier"
                              className="px-2 py-1 bg-indigo-50 text-indigo-800 hover:bg-indigo-100 rounded-lg border border-indigo-200 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                            >
                              <RotateCcw className="w-3 h-3" />
                              Return
                            </button>
                            <button
                              onClick={() => handleDeadStockAction('Discontinue SKU', item.product.name)}
                              title="Discontinue Product"
                              className="px-2 py-1 bg-rose-50 text-rose-800 hover:bg-rose-100 rounded-lg border border-rose-200 font-semibold text-[11px] cursor-pointer flex items-center gap-1"
                            >
                              <Ban className="w-3 h-3" />
                              Discontinue
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* PRODUCT DRILL-DOWN MODAL */}
      <ProductDrillDownModal
        product={selectedProduct}
        onClose={() => setSelectedProduct(null)}
      />
    </div>
  );
};
