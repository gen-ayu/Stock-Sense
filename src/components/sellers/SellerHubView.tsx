import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { SellerTransaction, PaymentStatus } from '../../types';
import {
  Users,
  Plus,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  DollarSign,
  Building2,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
} from 'lucide-react';

export const SellerHubView: React.FC = () => {
  const {
    sellerTransactions,
    products,
    recordSellerTransaction,
    updateSellerPaymentStatus,
  } = useInventory();

  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'All' | 'Sale to Seller' | 'Purchase from Seller'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [transactionType, setTransactionType] = useState<'Sale to Seller' | 'Purchase from Seller'>('Sale to Seller');
  const [partnerSeller, setPartnerSeller] = useState('Metro Office Merchants B2B');
  const [selectedProductId, setSelectedProductId] = useState(products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(5);
  const [unitPrice, setUnitPrice] = useState<number>(4700);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('Pending');
  const [date, setDate] = useState('2026-09-26');
  const [paymentDueDate, setPaymentDueDate] = useState('2026-10-15');
  const [notes, setNotes] = useState('');

  const currentProd = products.find((p) => p.id === selectedProductId) || products[0];

  // Aggregates
  const totalSoldToSellers = sellerTransactions
    .filter((st) => st.transactionType === 'Sale to Seller')
    .reduce((sum, st) => sum + st.totalAmount, 0);

  const totalBoughtFromSellers = sellerTransactions
    .filter((st) => st.transactionType === 'Purchase from Seller')
    .reduce((sum, st) => sum + st.totalAmount, 0);

  const totalOutstandingReceivables = sellerTransactions
    .filter((st) => st.transactionType === 'Sale to Seller' && st.paymentStatus !== 'Paid')
    .reduce((sum, st) => sum + st.totalAmount, 0);

  // Partners leaderboard
  const partnerMap: Record<string, { name: string; volume: number; count: number; balance: number }> = {};
  sellerTransactions.forEach((st) => {
    if (!partnerMap[st.partnerSeller]) {
      partnerMap[st.partnerSeller] = { name: st.partnerSeller, volume: 0, count: 0, balance: 0 };
    }
    partnerMap[st.partnerSeller].volume += st.totalAmount;
    partnerMap[st.partnerSeller].count += 1;
    if (st.paymentStatus !== 'Paid') {
      partnerMap[st.partnerSeller].balance += st.totalAmount;
    }
  });

  const topPartners = Object.values(partnerMap).sort((a, b) => b.volume - a.volume);

  const filteredTransactions = sellerTransactions.filter((st) => {
    if (filterType !== 'All' && st.transactionType !== filterType) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchRef = st.reference.toLowerCase().includes(q);
      const matchPartner = st.partnerSeller.toLowerCase().includes(q);
      const matchProd = st.productName.toLowerCase().includes(q) || st.productSku.toLowerCase().includes(q);
      if (!matchRef && !matchPartner && !matchProd) return false;
    }
    return true;
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentProd) return;

    recordSellerTransaction({
      transactionType,
      sellerName: 'StockSense Retail (Us)',
      partnerSeller,
      productId: currentProd.id,
      productSku: currentProd.sku,
      productName: currentProd.name,
      quantity: Number(quantity),
      unitPrice: Number(unitPrice),
      totalAmount: Number(quantity) * Number(unitPrice),
      paymentStatus,
      date,
      paymentDueDate: paymentStatus !== 'Paid' ? paymentDueDate : undefined,
      notes,
    });

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-700">
              <Users className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Seller → Seller B2B Hub</h1>
            <span className="text-xs font-mono font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
              Dual Movement + Financial Settlement
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Separate merchant-to-merchant transactions from internal transfers. Tracks simultaneous physical inventory shifts and financial credit balances.
          </p>
        </div>

        <button
          onClick={() => {
            if (currentProd) setUnitPrice(currentProd.sellingPrice);
            setIsModalOpen(true);
          }}
          className="flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>NEW SELLER TRANSACTION</span>
        </button>
      </div>

      {/* Overview Cards (Requirement 8) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Sold to Other Sellers</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-mono font-extrabold text-slate-900">
            ₹{totalSoldToSellers.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Total B2B Outbound Sales</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Purchased from Sellers</span>
            <ArrowDownLeft className="w-4 h-4 text-indigo-600" />
          </div>
          <p className="text-2xl font-mono font-extrabold text-slate-900">
            ₹{totalBoughtFromSellers.toLocaleString()}
          </p>
          <span className="text-[11px] text-slate-400">Surplus / bulk intake</span>
        </div>

        <div className="p-5 bg-white rounded-2xl border border-amber-200 bg-amber-50/30 shadow-xs">
          <div className="flex items-center justify-between text-xs text-amber-800 font-semibold mb-1">
            <span>Outstanding B2B Receivables</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-mono font-extrabold text-amber-950">
            ₹{totalOutstandingReceivables.toLocaleString()}
          </p>
          <span className="text-[11px] text-amber-700">Awaiting partner settlement</span>
        </div>
      </div>

      {/* Top Business Partners Grid */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
        <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
          <Building2 className="w-4 h-4 text-slate-600" />
          Frequent Business Partners & Balance Statements
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {topPartners.map((partner) => (
            <div
              key={partner.name}
              className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 flex flex-col justify-between"
            >
              <div>
                <span className="font-bold text-xs text-slate-900">{partner.name}</span>
                <span className="text-[11px] text-slate-500 block">{partner.count} transactions</span>
              </div>
              <div className="mt-3 pt-2 border-t border-slate-200/80 flex justify-between items-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 block">Total Volume</span>
                  <span className="font-mono font-bold text-slate-800">₹{partner.volume.toLocaleString()}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block">Pending Balance</span>
                  <span className={`font-mono font-bold ${partner.balance > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
                    ₹{partner.balance.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by Reference (S2S-2026-001), Partner Seller, or Product..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-1.5">
          <span className="text-slate-500 font-medium mr-1">Type:</span>
          {(['All', 'Sale to Seller', 'Purchase from Seller'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilterType(t)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                filterType === t
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Ref #</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Partner Seller</th>
                <th className="py-3 px-4">Product</th>
                <th className="py-3 px-4 text-right">Quantity</th>
                <th className="py-3 px-4 text-right">Unit Price</th>
                <th className="py-3 px-4 text-right">Total Money</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Payment Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTransactions.map((st) => (
                <tr key={st.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-amber-900">
                    {st.reference}
                  </td>
                  <td className="py-3 px-4 font-medium">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-semibold text-[11px] ${
                        st.transactionType === 'Sale to Seller'
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      {st.transactionType === 'Sale to Seller' ? (
                        <ArrowUpRight className="w-3 h-3 text-emerald-600" />
                      ) : (
                        <ArrowDownLeft className="w-3 h-3 text-indigo-600" />
                      )}
                      {st.transactionType}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-900">
                    {st.partnerSeller}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-800">{st.productSku}</span>
                    <span className="block text-slate-500 text-[11px]">{st.productName}</span>
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-900">
                    {st.quantity}
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-slate-600">
                    ₹{st.unitPrice.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                    ₹{st.totalAmount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-600">
                    {st.date}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <select
                      value={st.paymentStatus}
                      onChange={(e) =>
                        updateSellerPaymentStatus(st.id, e.target.value as PaymentStatus)
                      }
                      className={`text-[11px] font-bold px-2 py-0.5 rounded-lg border cursor-pointer ${
                        st.paymentStatus === 'Paid'
                          ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                          : st.paymentStatus === 'Pending'
                          ? 'bg-amber-50 text-amber-800 border-amber-300'
                          : 'bg-sky-50 text-sky-800 border-sky-300'
                      }`}
                    >
                      <option value="Paid">Paid</option>
                      <option value="Pending">Pending</option>
                      <option value="Credit">Credit</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE TRANSACTION MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-amber-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base">New Seller → Seller Transaction</h3>
                <p className="text-xs text-slate-300">Synchronizes physical stock move + financial billing ledger</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Nature</label>
                  <select
                    value={transactionType}
                    onChange={(e) => setTransactionType(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Sale to Seller">Sale to Seller (Outbound Stock)</option>
                    <option value="Purchase from Seller">Purchase from Seller (Inbound Stock)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Partner Seller / Merchant</label>
                  <input
                    type="text"
                    required
                    value={partnerSeller}
                    onChange={(e) => setPartnerSeller(e.target.value)}
                    placeholder="e.g. Vardhman Traders B2B"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Product</label>
                <select
                  value={selectedProductId}
                  onChange={(e) => {
                    setSelectedProductId(e.target.value);
                    const p = products.find((prod) => prod.id === e.target.value);
                    if (p) setUnitPrice(p.sellingPrice);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} - {p.name} (Stock: {p.onHand} {p.uom})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                    className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Agreed Unit Price (₹)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={unitPrice}
                    onChange={(e) => setUnitPrice(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
                  <select
                    value={paymentStatus}
                    onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Paid">Paid / Settled</option>
                    <option value="Pending">Pending (Invoice)</option>
                    <option value="Credit">Credit Agreement</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Transaction Date</label>
                  <input
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs font-mono font-bold">
                <span className="text-amber-900">Total Settlement Value:</span>
                <span className="text-base text-amber-950">₹{(quantity * unitPrice).toLocaleString()}</span>
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
                  className="px-5 py-2 font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Commit Seller Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
