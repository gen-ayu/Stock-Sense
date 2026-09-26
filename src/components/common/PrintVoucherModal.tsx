import React from 'react';
import { Printer, X, CheckCircle2, Box, Calendar, User, MapPin } from 'lucide-react';
import { Receipt, Delivery } from '../../types';

interface PrintVoucherModalProps {
  order: Receipt | Delivery | null;
  type: 'Receipt' | 'Delivery';
  onClose: () => void;
}

export const PrintVoucherModal: React.FC<PrintVoucherModalProps> = ({ order, type, onClose }) => {
  if (!order) return null;

  const handlePrint = () => {
    window.print();
  };

  const isReceipt = type === 'Receipt';
  const partnerLabel = isReceipt ? 'Received From (Vendor)' : 'Delivered To (Customer)';
  const locationLabel = isReceipt ? 'Destination Location' : 'Source Location';
  const locCode = isReceipt
    ? (order as Receipt).destinationLocationCode
    : (order as Delivery).sourceLocationCode;

  const totalQty = order.items.reduce((acc, item) => acc + item.quantity, 0);
  const totalVal = order.items.reduce((acc, item) => acc + item.quantity * item.unitCost, 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        {/* Modal Controls (Not Printed) */}
        <div className="no-print flex items-center justify-between px-6 py-4 bg-slate-900 text-white border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-teal-400" />
            <h3 className="font-semibold text-base">
              Print {isReceipt ? 'Goods Receipt Slip' : 'Delivery Dispatch Note'}
            </h3>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-teal-600 rounded-lg hover:bg-teal-500 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              Print Document
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Voucher Content */}
        <div id="printable-voucher" className="p-8 sm:p-10 bg-white text-slate-900">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-slate-900 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-600 flex items-center justify-center text-white font-bold text-xl shadow-md">
                  SS
                </div>
                <div>
                  <h1 className="text-2xl font-black tracking-tight text-slate-900">StockSense</h1>
                  <p className="text-xs text-slate-500 font-medium">Enterprise Warehouse Management System</p>
                </div>
              </div>
              <div className="mt-3 text-xs text-slate-600 leading-relaxed">
                Plot 42, Logistics Hub, Industrial Corridor, Sector 18<br />
                Warehouse Code: <span className="font-mono font-semibold">{order.warehouseCode}</span> | Email: logistics@stocksense.io
              </div>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block px-3 py-1 bg-slate-100 border border-slate-300 rounded text-xs font-mono font-semibold uppercase tracking-wider text-slate-700 mb-1">
                Official Document
              </span>
              <h2 className="text-xl font-mono font-extrabold text-teal-800">
                {order.reference}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Status: <span className="font-semibold text-emerald-600 uppercase">{order.status}</span>
              </p>
              {order.completedAt && (
                <p className="text-xs text-slate-400 font-mono">
                  Validated: {new Date(order.completedAt).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          {/* Meta Info Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-b border-slate-200 text-xs">
            <div>
              <span className="text-slate-400 block mb-1 font-medium">{partnerLabel}</span>
              <p className="font-semibold text-slate-800 text-sm">{order.partner}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Schedule Date</span>
              <p className="font-semibold text-slate-800 font-mono text-sm">{order.scheduleDate}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1 font-medium">{locationLabel}</span>
              <p className="font-semibold text-teal-700 font-mono text-sm">{locCode}</p>
            </div>
            <div>
              <span className="text-slate-400 block mb-1 font-medium">Responsible Officer</span>
              <p className="font-semibold text-slate-800 text-sm">{order.responsibleUser}</p>
            </div>
          </div>

          {/* Products Table */}
          <div className="mt-6">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
              Itemized Manifest
            </h4>
            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                  <tr>
                    <th className="py-2.5 px-3">#</th>
                    <th className="py-2.5 px-3">Item SKU / Description</th>
                    <th className="py-2.5 px-3 text-right">Qty</th>
                    <th className="py-2.5 px-3">UOM</th>
                    <th className="py-2.5 px-3 text-right">Unit Price</th>
                    <th className="py-2.5 px-3 text-right">Subtotal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {order.items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{idx + 1}</td>
                      <td className="py-2.5 px-3">
                        <span className="font-mono font-medium text-slate-800">{item.productSku}</span>
                        <span className="block text-slate-500 text-[11px]">{item.productName}</span>
                      </td>
                      <td className="py-2.5 px-3 text-right font-bold font-mono text-slate-900">
                        {item.quantity}
                      </td>
                      <td className="py-2.5 px-3 text-slate-500">{item.uom}</td>
                      <td className="py-2.5 px-3 text-right font-mono text-slate-600">
                        ₹{item.unitCost.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 text-right font-mono font-semibold text-slate-900">
                        ₹{(item.quantity * item.unitCost).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-slate-50 font-semibold border-t-2 border-slate-200">
                  <tr>
                    <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-slate-500">
                      Total Items Count:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-900">
                      {totalQty}
                    </td>
                    <td colSpan={2} className="py-2.5 px-3 text-right uppercase text-slate-500">
                      Total Valuation:
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-teal-700">
                      ₹{totalVal.toLocaleString()}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>

          {/* Notes if any */}
          {order.notes && (
            <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs">
              <span className="font-semibold text-slate-700">Operational Notes: </span>
              <span className="text-slate-600">{order.notes}</span>
            </div>
          )}

          {/* Barcode Simulation & Signatures */}
          <div className="mt-8 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-end gap-6">
            <div>
              {/* Simulated barcode */}
              <div className="font-mono text-lg tracking-widest text-slate-700 font-bold select-none">
                |||| | ||||| |||| || |||||| | ||| |||||||
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                REF: {order.reference} • SYS-STOCKSENSE-VERIFIED
              </div>
            </div>

            <div className="flex gap-8 text-center text-xs">
              <div className="border-t border-slate-400 pt-1 w-36">
                <p className="text-slate-500">Prepared / Picked By</p>
                <p className="font-semibold text-slate-800 mt-0.5">{order.responsibleUser}</p>
              </div>
              <div className="border-t border-slate-400 pt-1 w-36">
                <p className="text-slate-500">Authorized Signature</p>
                <p className="font-semibold text-slate-800 mt-0.5">Warehouse Lead</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
