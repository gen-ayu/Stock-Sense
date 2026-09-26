import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Filter,
  CheckCircle2,
  TrendingUp,
  Package,
  DollarSign,
  Boxes,
} from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { sales, products, batches, kpis, receipts, deliveries, todayDate } = useInventory();

  const [reportType, setReportType] = useState<'sales' | 'inventory' | 'financial' | 'products'>('sales');
  const [reportPeriod, setReportPeriod] = useState<'all' | 'month' | 'year'>('month');

  // CSV Exporter
  const exportToCSV = () => {
    let headers: string[] = [];
    let rows: string[][] = [];
    let filename = `StockSense_${reportType}_report_${todayDate}.csv`;

    if (reportType === 'sales') {
      headers = ['Order Number', 'Date', 'Product', 'Channel', 'Customer', 'Qty', 'Selling Price', 'Revenue', 'Profit', 'Status'];
      rows = sales.map((s) => [
        s.orderNumber,
        s.date,
        `"${s.productName}"`,
        s.channel,
        `"${s.customerOrSeller}"`,
        String(s.quantity),
        String(s.sellingPrice),
        String(s.revenue),
        String(s.profit),
        s.paymentStatus,
      ]);
    } else if (reportType === 'inventory') {
      headers = ['SKU', 'Product Name', 'Category', 'Unit Cost', 'Selling Price', 'On Hand', 'Free Stock', 'Reserved', 'Stock Value', 'Lead Time'];
      rows = products.map((p) => [
        p.sku,
        `"${p.name}"`,
        p.category,
        String(p.costPerUnit),
        String(p.sellingPrice),
        String(p.onHand),
        String(p.freeToUse),
        String(p.reserved),
        String(p.onHand * p.costPerUnit),
        `${p.leadTimeDays}d`,
      ]);
    } else if (reportType === 'financial') {
      headers = ['Metric Name', 'Amount (INR)', 'Description'];
      rows = [
        ['Total Revenue', String(kpis.totalRevenue), 'Gross sales revenue'],
        ['Net Realized Sales', String(kpis.netSales), 'Paid completed orders'],
        ['Expected Income', String(kpis.expectedIncome), 'Pending orders & future receivables'],
        ['Pending Payments', String(kpis.pendingPayments), 'Unpaid invoices & trade credit'],
        ['Cost of Goods Sold (COGS)', String(kpis.costOfGoods), 'Material purchase cost'],
        ['Estimated Gross Profit', String(kpis.estimatedProfit), 'Net operating profit'],
        ['Profit Margin', `${kpis.profitMargin}%`, 'Gross margin percentage'],
        ['Total Stock Asset Value', String(kpis.totalStockValue), 'Inventory assets on hand at cost'],
      ];
    } else {
      headers = ['SKU', 'Product Name', 'Category', 'Price', 'Cost', 'Margin', 'Units Sold', 'Total Revenue'];
      rows = products.map((p) => {
        const prodSales = sales.filter((s) => s.productId === p.id);
        const units = prodSales.reduce((sum, s) => sum + s.quantity, 0);
        const rev = prodSales.reduce((sum, s) => sum + s.revenue, 0);
        return [
          p.sku,
          `"${p.name}"`,
          p.category,
          String(p.sellingPrice),
          String(p.costPerUnit),
          `${p.sellingPrice > 0 ? Math.round(((p.sellingPrice - p.costPerUnit) / p.sellingPrice) * 100) : 0}%`,
          String(units),
          String(rev),
        ];
      });
    }

    const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <FileText className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Reports & Export Center</h1>
            <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              CSV & PDF Print Ready
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Generate and export comprehensive auditing statements for Sales, Inventory Valuation, Financial Margins, and SKU Performance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>EXPORT CSV</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>PRINT REPORT</span>
          </button>
        </div>
      </div>

      {/* Report Categories Tabs (Requirement 13) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        {[
          { id: 'sales', label: 'Sales Reports', desc: 'Daily, weekly, monthly channels', icon: TrendingUp },
          { id: 'inventory', label: 'Inventory Reports', desc: 'Valuation, moves, aging & expiry', icon: Package },
          { id: 'financial', label: 'Financial Reports', desc: 'Revenue, profits, expected income', icon: DollarSign },
          { id: 'products', label: 'Product Reports', desc: 'Top/slow SKUs, profitability', icon: Boxes },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = reportType === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setReportType(tab.id as any)}
              className={`p-4 rounded-2xl border text-left transition-all cursor-pointer ${
                isActive
                  ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white text-slate-900 border-slate-200 hover:border-teal-300'
              }`}
            >
              <div className="flex items-center gap-2 font-bold text-sm">
                <Icon className={`w-4 h-4 ${isActive ? 'text-teal-400' : 'text-slate-600'}`} />
                <span>{tab.label}</span>
              </div>
              <p className={`text-[11px] mt-1 ${isActive ? 'text-slate-300' : 'text-slate-400'}`}>
                {tab.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Report Preview Document */}
      <div id="printable-voucher" className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-5">
        <div className="flex flex-col sm:flex-row justify-between items-start border-b border-slate-200 pb-4 gap-2">
          <div>
            <h2 className="text-lg font-bold text-slate-900 uppercase tracking-wide">
              {reportType.toUpperCase()} AUDIT MANIFEST
            </h2>
            <p className="text-xs text-slate-500">
              Generated: <span className="font-mono">{todayDate}</span> • StockSense Retail Platform v2.0
            </p>
          </div>
          <span className="px-3 py-1 bg-slate-100 rounded-lg font-mono font-bold text-xs text-slate-800">
            CONFIDENTIAL REPORT
          </span>
        </div>

        {/* Dynamic Table Preview */}
        {reportType === 'sales' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">Order #</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Product</th>
                  <th className="py-2.5 px-3">Channel</th>
                  <th className="py-2.5 px-3">Buyer / Merchant</th>
                  <th className="py-2.5 px-3 text-right">Qty</th>
                  <th className="py-2.5 px-3 text-right">Revenue</th>
                  <th className="py-2.5 px-3 text-right">Profit</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((s) => (
                  <tr key={s.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{s.orderNumber}</td>
                    <td className="py-2.5 px-3 font-mono text-slate-600">{s.date}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{s.productName}</td>
                    <td className="py-2.5 px-3 text-slate-600">{s.channel}</td>
                    <td className="py-2.5 px-3 text-slate-700">{s.customerOrSeller}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold">{s.quantity}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      ₹{s.revenue.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                      ₹{s.profit.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-right font-semibold text-emerald-700">{s.paymentStatus}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'financial' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-3 px-4">Financial Ledger Item</th>
                  <th className="py-3 px-4">Classification</th>
                  <th className="py-3 px-4 text-right">Current Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-900">Total Sales Revenue</td>
                  <td className="py-3 px-4 text-slate-500">Gross realization</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                    ₹{kpis.totalRevenue.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-emerald-800">Actual Realized Revenue</td>
                  <td className="py-3 px-4 text-slate-500">Paid & verified in bank</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-emerald-900 text-sm">
                    ₹{kpis.netSales.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-sky-800">Expected Income (Future Inbound)</td>
                  <td className="py-3 px-4 text-slate-500">Pending dispatches & orders</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-sky-900">
                    ₹{kpis.expectedIncome.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-amber-800">Pending Payments (Accounts Receivable)</td>
                  <td className="py-3 px-4 text-slate-500">Credit sales & unpaid invoices</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-amber-900">
                    ₹{kpis.pendingPayments.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-700">Cost of Goods Sold (COGS)</td>
                  <td className="py-3 px-4 text-slate-500">Total production/purchase expenditure</td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-slate-800">
                    ₹{kpis.costOfGoods.toLocaleString()}
                  </td>
                </tr>
                <tr className="bg-teal-50/60 font-bold">
                  <td className="py-3 px-4 text-teal-950 font-bold">Estimated Gross Profit (Margin {kpis.profitMargin}%)</td>
                  <td className="py-3 px-4 text-teal-800">Operating Margin</td>
                  <td className="py-3 px-4 text-right font-mono font-black text-teal-900 text-base">
                    ₹{kpis.estimatedProfit.toLocaleString()}
                  </td>
                </tr>
                <tr>
                  <td className="py-3 px-4 font-bold text-slate-800">Total Physical Inventory Valuation</td>
                  <td className="py-3 px-4 text-slate-500">On-hand assets at purchase cost</td>
                  <td className="py-3 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                    ₹{kpis.totalStockValue.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'inventory' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Cost Price</th>
                  <th className="py-2.5 px-3 text-right">Retail Price</th>
                  <th className="py-2.5 px-3 text-right">On Hand</th>
                  <th className="py-2.5 px-3 text-right">Free Stock</th>
                  <th className="py-2.5 px-3 text-right">Asset Valuation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id}>
                    <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.sku}</td>
                    <td className="py-2.5 px-3 font-medium text-slate-800">{p.name}</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-600">₹{p.costPerUnit}</td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">₹{p.sellingPrice}</td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {p.onHand} {p.uom}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                      {p.freeToUse} {p.uom}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-extrabold text-slate-900">
                      ₹{(p.onHand * p.costPerUnit).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {reportType === 'products' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-3">SKU</th>
                  <th className="py-2.5 px-3">Product Name</th>
                  <th className="py-2.5 px-3">Category</th>
                  <th className="py-2.5 px-3 text-right">Units Sold</th>
                  <th className="py-2.5 px-3 text-right">Sales Revenue</th>
                  <th className="py-2.5 px-3 text-right">Unit Profit</th>
                  <th className="py-2.5 px-3 text-right">Days Idle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => {
                  const pSales = sales.filter((s) => s.productId === p.id);
                  const units = pSales.reduce((sum, s) => sum + s.quantity, 0);
                  const rev = pSales.reduce((sum, s) => sum + s.revenue, 0);
                  return (
                    <tr key={p.id}>
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-900">{p.sku}</td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{p.name}</td>
                      <td className="py-2.5 px-3 text-slate-600">{p.category}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">{units}</td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                        ₹{rev.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                        ₹{p.sellingPrice - p.costPerUnit}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono">
                        {p.daysWithoutSale} days
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
