import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { SaleRecord, SalesChannel, PaymentStatus } from '../../types';
import {
  TrendingUp,
  Plus,
  Search,
  Store,
  ShoppingCart,
  Users,
  Package,
  Truck,
  Globe,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  CreditCard,
  DollarSign,
} from 'lucide-react';

interface SalesAnalyticsViewProps {
  isRecordSaleOpen?: boolean;
  onCloseRecordSale?: () => void;
}

export const SalesAnalyticsView: React.FC<SalesAnalyticsViewProps> = ({
  isRecordSaleOpen: externalOpen,
  onCloseRecordSale: externalClose,
}) => {
  const { sales, products, recordSale, updateSalePaymentStatus } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedChannel, setSelectedChannel] = useState<string>('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState<string>('All');
  const [internalOpen, setInternalOpen] = useState(false);

  const isModalOpen = Boolean(externalOpen || internalOpen);
  const closeModal = () => {
    if (externalClose) externalClose();
    setInternalOpen(false);
  };

  // Form State for Recording Sale
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [channel, setChannel] = useState<SalesChannel>('E-commerce');
  const [quantity, setQuantity] = useState<number>(1);
  const [sellingPrice, setSellingPrice] = useState<number>(4800);
  const [customerOrSeller, setCustomerOrSeller] = useState('Metro Retail Client');
  const [date, setDate] = useState('2026-09-26');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Paid');
  const [notes, setNotes] = useState('');

  const currentProd = products.find((p) => p.id === selectedProductId) || products[0];

  const channelIcons: Record<SalesChannel, React.ReactNode> = {
    'Physical Store': <Store className="w-3.5 h-3.5 text-blue-600" />,
    'E-commerce': <ShoppingCart className="w-3.5 h-3.5 text-purple-600" />,
    'Seller → Seller': <Users className="w-3.5 h-3.5 text-amber-600" />,
    Wholesale: <Package className="w-3.5 h-3.5 text-emerald-600" />,
    Direct: <Truck className="w-3.5 h-3.5 text-rose-600" />,
  };

  const channels: SalesChannel[] = [
    'Physical Store',
    'E-commerce',
    'Seller → Seller',
    'Wholesale',
    'Direct',
  ];

  // Channel summary aggregates
  const channelStats = channels.map((ch) => {
    const chSales = sales.filter((s) => s.channel === ch);
    const revenue = chSales.reduce((sum, s) => sum + s.revenue, 0);
    const profit = chSales.reduce((sum, s) => sum + s.profit, 0);
    const units = chSales.reduce((sum, s) => sum + s.quantity, 0);
    return { channel: ch, count: chSales.length, revenue, profit, units };
  });

  const filteredSales = sales.filter((s) => {
    if (selectedChannel !== 'All' && s.channel !== selectedChannel) return false;
    if (selectedPaymentStatus !== 'All' && s.paymentStatus !== selectedPaymentStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchOrder = s.orderNumber.toLowerCase().includes(q);
      const matchProd = s.productName.toLowerCase().includes(q) || s.productSku.toLowerCase().includes(q);
      const matchCustomer = s.customerOrSeller.toLowerCase().includes(q);
      if (!matchOrder && !matchProd && !matchCustomer) return false;
    }
    return true;
  });

  const handleSaleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProd) return;

    recordSale({
      orderNumber: `SO-2026-${String(sales.length + 1).padStart(4, '0')}`,
      productId: currentProd.id,
      productSku: currentProd.sku,
      productName: currentProd.name,
      category: currentProd.category,
      quantity: Number(quantity),
      sellingPrice: Number(sellingPrice),
      purchaseCost: currentProd.costPerUnit,
      channel,
      customerOrSeller,
      date,
      paymentStatus,
      notes,
    });

    closeModal();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Sales Analytics & Channels</h1>
            <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {sales.length} Transactions Recorded
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Track revenue, margins, COGS, and payment settlements across Retail Stores, Online Portals, Wholesale, and Seller-to-Seller networks.
          </p>
        </div>

        <button
          onClick={() => {
            if (currentProd) setSellingPrice(currentProd.sellingPrice);
            setInternalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>RECORD NEW SALE</span>
        </button>
      </div>

      {/* Channel Breakdown Cards (Requirement 2 & 9) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {channelStats.map((stat) => (
          <div
            key={stat.channel}
            onClick={() => setSelectedChannel(stat.channel === selectedChannel ? 'All' : stat.channel)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              selectedChannel === stat.channel
                ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                : 'bg-white text-slate-900 border-slate-200 hover:border-teal-300'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                {channelIcons[stat.channel]}
                <span>{stat.channel}</span>
              </div>
              <span
                className={`text-[10px] font-mono px-1.5 py-0.5 rounded-md ${
                  selectedChannel === stat.channel ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'
                }`}
              >
                {stat.count} orders
              </span>
            </div>

            <div className="mt-3">
              <p className="text-lg font-mono font-extrabold">
                ₹{stat.revenue.toLocaleString()}
              </p>
              <div className="flex justify-between items-center text-[11px] mt-1 text-slate-400">
                <span>Profit: ₹{stat.profit.toLocaleString()}</span>
                <span>{stat.units} units</span>
              </div>
            </div>
          </div>
        ))}
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
            placeholder="Search by Order #, Product SKU, or Customer / Seller..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={selectedChannel}
            onChange={(e) => setSelectedChannel(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="All">All Channels</option>
            {channels.map((ch) => (
              <option key={ch} value={ch}>
                {ch}
              </option>
            ))}
          </select>

          <select
            value={selectedPaymentStatus}
            onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-700"
          >
            <option value="All">All Payment Statuses</option>
            <option value="Paid">Paid</option>
            <option value="Pending">Pending</option>
            <option value="Credit">Credit</option>
            <option value="Overdue">Overdue</option>
          </select>
        </div>
      </div>

      {/* Sales Transactions Table (Requirement 2 itemized manifest) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Order #</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Product SKU & Name</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Customer / Partner</th>
                <th className="py-3 px-4 text-right">Qty</th>
                <th className="py-3 px-4 text-right">Selling Price</th>
                <th className="py-3 px-4 text-right">Cost</th>
                <th className="py-3 px-4 text-right">Revenue</th>
                <th className="py-3 px-4 text-right">Profit (%)</th>
                <th className="py-3 px-4 text-right">Payment</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">
                    {s.orderNumber}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {s.date}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-slate-800">{s.productSku}</span>
                    <span className="block text-slate-500 text-[11px]">{s.productName}</span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-slate-100 rounded-md font-medium text-slate-700">
                      {channelIcons[s.channel]}
                      <span>{s.channel}</span>
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-medium">
                    {s.customerOrSeller}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {s.quantity}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-700">
                    ₹{s.sellingPrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-400">
                    ₹{s.purchaseCost.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900">
                    ₹{s.revenue.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold">
                    <span className="text-teal-700">₹{s.profit.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 block font-normal">
                      ({s.profitMargin}%)
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={s.paymentStatus}
                      onChange={(e) => updateSalePaymentStatus(s.id, e.target.value as PaymentStatus)}
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer ${
                        s.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : s.paymentStatus === 'Pending'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : s.paymentStatus === 'Credit'
                          ? 'bg-sky-50 text-sky-800 border-sky-300'
                          : 'bg-rose-50 text-rose-800 border-rose-300'
                      }`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Credit">Credit</option>
                      <option value="Overdue">Overdue</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RECORD SALE MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">Record Customer / Seller Sale</h3>
                <p className="text-xs text-slate-300">Creates transaction & automatically decrements inventory</p>
              </div>
              <button onClick={closeModal} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setSellingPrice(p.sellingPrice);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name} (Stock: {p.onHand} {p.uom} | Cost: ₹{p.costPerUnit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sales Channel</label>
                  <select
                    value={channel}
                    onChange={(e) => setChannel(e.target.value as SalesChannel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {channels.map((ch) => (
                      <option key={ch} value={ch}>
                        {ch}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Paid">Paid (Actual Revenue)</option>
                    <option value="Pending">Pending (Invoice)</option>
                    <option value="Credit">Credit Sale</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity Sold</label>
                  <input
                    type="number"
                    min={1}
                    max={currentProd?.onHand || 1000}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit Selling Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={sellingPrice}
                    onChange={(e) => setSellingPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Customer / Buyer</label>
                  <input
                    type="text"
                    required
                    value={customerOrSeller}
                    onChange={(e) => setCustomerOrSeller(e.target.value)}
                    placeholder="e.g. Nexus Tech Corp or Retail POS"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Sale Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              {/* Profit summary banner */}
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-slate-500">Gross Sale Amount:</span>
                  <p className="font-mono font-bold text-slate-900 text-sm">
                    ₹{(quantity * sellingPrice).toLocaleString()}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-teal-700 font-semibold">Net Profit:</span>
                  <p className="font-mono font-bold text-teal-800 text-sm">
                    ₹{((quantity * sellingPrice) - (quantity * (currentProd?.costPerUnit || 0))).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Confirm & Commit Sale
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
