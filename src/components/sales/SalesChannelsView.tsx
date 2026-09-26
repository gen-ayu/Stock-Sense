import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import { SalesChannel } from '../../types';
import {
  Store,
  ShoppingCart,
  Users,
  Package,
  Truck,
  ArrowUpRight,
  TrendingUp,
  Award,
  AlertCircle,
} from 'lucide-react';

export const SalesChannelsView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { sales, products } = useInventory();

  const channels: Array<{
    name: SalesChannel;
    icon: React.ReactNode;
    color: string;
    description: string;
  }> = [
    {
      name: 'E-commerce',
      icon: <ShoppingCart className="w-5 h-5 text-purple-600" />,
      color: 'border-purple-200 bg-purple-50/30',
      description: 'Online direct-to-consumer store & digital marketplaces (Amazon, Shopify)',
    },
    {
      name: 'Physical Store',
      icon: <Store className="w-5 h-5 text-blue-600" />,
      color: 'border-blue-200 bg-blue-50/30',
      description: 'Flagship retail showroom, walk-ins & point-of-sale registers',
    },
    {
      name: 'Seller → Seller',
      icon: <Users className="w-5 h-5 text-amber-600" />,
      color: 'border-amber-200 bg-amber-50/30',
      description: 'Peer merchant B2B transfers, trade credit & surplus trading',
    },
    {
      name: 'Wholesale',
      icon: <Package className="w-5 h-5 text-emerald-600" />,
      color: 'border-emerald-200 bg-emerald-50/30',
      description: 'Bulk contractor supplies, distributor shipments & pallet orders',
    },
    {
      name: 'Direct',
      icon: <Truck className="w-5 h-5 text-rose-600" />,
      color: 'border-rose-200 bg-rose-50/30',
      description: 'Turnkey corporate contracts, architect & developer orders',
    },
  ];

  const channelMetrics = channels.map((ch) => {
    const chSales = sales.filter((s) => s.channel === ch.name);
    const revenue = chSales.reduce((sum, s) => sum + s.revenue, 0);
    const profit = chSales.reduce((sum, s) => sum + s.profit, 0);
    const units = chSales.reduce((sum, s) => sum + s.quantity, 0);
    const orders = chSales.length;

    // Determine top and slowest product in this channel
    const productSoldMap: Record<string, { name: string; qty: number }> = {};
    chSales.forEach((s) => {
      if (!productSoldMap[s.productId]) {
        productSoldMap[s.productId] = { name: s.productName, qty: 0 };
      }
      productSoldMap[s.productId].qty += s.quantity;
    });

    const sortedProducts = Object.values(productSoldMap).sort((a, b) => b.qty - a.qty);
    const topProduct = sortedProducts[0] || { name: 'None yet', qty: 0 };
    const slowestProduct = sortedProducts[sortedProducts.length - 1] || { name: 'None', qty: 0 };

    return {
      ...ch,
      orders,
      units,
      revenue,
      profit,
      topProduct,
      slowestProduct,
    };
  });

  const totalRevenueAllChannels = channelMetrics.reduce((sum, c) => sum + c.revenue, 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales Channel Deep-Dive</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Analyze channel profitability, top velocity items, and order volume distribution across retail modalities.
          </p>
        </div>

        <button
          onClick={() => onNavigate('sales-analytics')}
          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          View All Transactions
        </button>
      </div>

      {/* Channel Cards Grid (Requirement 9) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {channelMetrics.map((ch) => {
          const sharePercent =
            totalRevenueAllChannels > 0
              ? Math.round((ch.revenue / totalRevenueAllChannels) * 100)
              : 0;

          return (
            <div
              key={ch.name}
              className={`p-6 rounded-3xl border shadow-xs bg-white flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-slate-100">{ch.icon}</div>
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{ch.name}</h3>
                      <p className="text-[11px] text-slate-400">{ch.orders} completed orders</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-slate-100 rounded-lg text-xs font-mono font-bold text-slate-700">
                    {sharePercent}% Share
                  </span>
                </div>

                <p className="text-xs text-slate-500 mt-2.5 leading-relaxed">{ch.description}</p>

                {/* Primary Financial Stats */}
                <div className="grid grid-cols-2 gap-3 mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Total Revenue</span>
                    <p className="text-lg font-mono font-extrabold text-slate-900 mt-0.5">
                      ₹{ch.revenue.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <span className="text-slate-400 block text-[11px]">Gross Profit</span>
                    <p className="text-lg font-mono font-extrabold text-teal-700 mt-0.5">
                      ₹{ch.profit.toLocaleString()}
                    </p>
                  </div>
                  <div className="col-span-2 pt-2 border-t border-slate-200/60 flex justify-between items-center text-[11px] text-slate-600 font-mono">
                    <span>Units Delivered: {ch.units}</span>
                    <span>
                      Margin: {ch.revenue > 0 ? Math.round((ch.profit / ch.revenue) * 100) : 0}%
                    </span>
                  </div>
                </div>

                {/* Channel Product Intelligence */}
                <div className="mt-4 space-y-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <Award className="w-4 h-4 shrink-0 text-emerald-600" />
                      <div className="truncate">
                        <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                          Top Performer
                        </span>
                        <span className="font-semibold text-slate-800 truncate text-[11px]">
                          {ch.topProduct.name}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono font-bold text-emerald-800 text-xs whitespace-nowrap ml-2">
                      {ch.topProduct.qty} units
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <AlertCircle className="w-4 h-4 shrink-0 text-slate-400" />
                      <div className="truncate">
                        <span className="text-[10px] uppercase font-semibold text-slate-400 block">
                          Slowest Performer
                        </span>
                        <span className="text-slate-600 truncate text-[11px]">
                          {ch.slowestProduct.name}
                        </span>
                      </div>
                    </div>
                    <span className="font-mono text-slate-500 text-xs whitespace-nowrap ml-2">
                      {ch.slowestProduct.qty} units
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => onNavigate('sales-analytics')}
                className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors"
              >
                <span>Filter Orders in {ch.name}</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
