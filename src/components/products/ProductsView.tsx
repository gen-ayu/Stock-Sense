import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import { Product } from '../../types';
import {
  Package,
  Plus,
  Search,
  Edit3,
  AlertTriangle,
  X,
  Layers,
  MapPin,
  TrendingDown,
  Check,
  ChevronDown,
} from 'lucide-react';

export const ProductsView: React.FC = () => {
  const { products, locations, warehouses, createProduct, updateProductStock } = useInventory();
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingStockProduct, setEditingStockProduct] = useState<Product | null>(null);
  const [newStockValue, setNewStockValue] = useState<number>(0);
  const [selectedStockLoc, setSelectedStockLoc] = useState<string>('WH/Stock1');

  // New Product Form State
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [category, setCategory] = useState('Office Furniture');
  const [uom, setUom] = useState('Units');
  const [costPerUnit, setCostPerUnit] = useState<number>(3000);
  const [initialStock, setInitialStock] = useState<number>(50);
  const [reorderPoint, setReorderPoint] = useState<number>(10);
  const [initialLocation, setInitialLocation] = useState('WH/Stock1');
  const [description, setDescription] = useState('');

  const categories = ['All', ...Array.from(new Set(products.map((p) => p.category)))];

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = p.name.toLowerCase().includes(q);
      const matchSku = p.sku.toLowerCase().includes(q);
      const matchCat = p.category.toLowerCase().includes(q);
      if (!matchName && !matchSku && !matchCat) return false;
    }
    return true;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    createProduct({
      name,
      sku: sku.startsWith('[') ? sku : `[${sku.toUpperCase()}] ${name}`,
      category,
      uom,
      costPerUnit: Number(costPerUnit),
      sellingPrice: Number(costPerUnit) * 1.5,
      onHand: Number(initialStock),
      reorderPoint: Number(reorderPoint),
      overstockThreshold: Number(reorderPoint) * 5,
      leadTimeDays: 7,
      lastSaleDate: '2026-09-26',
      lastPurchaseDate: '2026-09-26',
      description,
      locations: [
        {
          locationId: `loc_${Date.now()}`,
          locationCode: initialLocation,
          onHand: Number(initialStock),
        },
      ],
    });

    setIsAddModalOpen(false);
    // Reset form
    setName('');
    setSku('');
    setInitialStock(0);
  };

  const handleUpdateStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStockProduct) return;
    updateProductStock(editingStockProduct.id, Number(newStockValue), selectedStockLoc);
    setEditingStockProduct(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <Package className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Products & Stock Inventory</h1>
            <span className="text-xs font-mono font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200">
              {products.length} SKUs Cataloged
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Real-time on-hand vs. free-to-use inventory levels, per-unit valuation, and location allocation.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>ADD NEW PRODUCT</span>
        </button>
      </div>

      {/* Search & Category Filter */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs text-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by SKU ([DESK001]), Name (Desk), or Category..."
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <span className="text-slate-500 font-medium mr-1">Category:</span>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                categoryFilter === cat
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Products & Stock Table matching wireframe */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">Product SKU & Name</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Per Unit Cost</th>
                <th className="py-3.5 px-4 text-right">On Hand</th>
                <th className="py-3.5 px-4 text-right">Reserved (Deliv.)</th>
                <th className="py-3.5 px-4 text-right">Free to Use</th>
                <th className="py-3.5 px-4">Locations Breakdown</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => {
                const isLow = p.onHand <= p.reorderPoint;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div>
                          <span className="font-mono font-bold text-slate-900 text-sm">{p.sku}</span>
                          <span className="block text-slate-600 text-xs font-medium">{p.name}</span>
                        </div>
                        {isLow && (
                          <span className="px-1.5 py-0.5 bg-rose-100 text-rose-700 text-[10px] font-bold rounded flex items-center gap-0.5">
                            <AlertTriangle className="w-3 h-3" />
                            Low Stock
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md font-medium text-[11px]">
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-800 text-sm">
                      ₹{p.costPerUnit.toLocaleString()}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-extrabold text-slate-900 text-sm">
                      {p.onHand} <span className="text-[11px] font-normal text-slate-500">{p.uom}</span>
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-semibold text-amber-700">
                      {p.reserved} {p.uom}
                    </td>

                    <td className="py-3.5 px-4 text-right font-mono font-bold text-teal-700 text-sm">
                      {p.freeToUse} {p.uom}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {p.locations.map((loc, i) => (
                          <span
                            key={i}
                            className="px-2 py-0.5 bg-teal-50 border border-teal-200 text-teal-800 rounded font-mono text-[10.5px]"
                          >
                            {loc.locationCode}: <span className="font-bold">{loc.onHand}</span>
                          </span>
                        ))}
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {/* Wireframe requirement: "User must be able to update the stock from here" */}
                      <button
                        onClick={() => {
                          setEditingStockProduct(p);
                          setNewStockValue(p.onHand);
                          setSelectedStockLoc(p.locations[0]?.locationCode || 'WH/Stock1');
                        }}
                        className="px-2.5 py-1.5 text-xs font-semibold text-teal-700 hover:text-white hover:bg-teal-600 bg-teal-50 rounded-lg border border-teal-200 transition-colors cursor-pointer inline-flex items-center gap-1"
                      >
                        <Edit3 className="w-3 h-3" />
                        <span>Update Stock</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* QUICK STOCK UPDATE MODAL */}
      {editingStockProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-sm w-full border border-slate-200 shadow-2xl p-6 text-xs space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Direct Stock Update</h3>
                <p className="text-[11px] text-slate-500 font-mono">{editingStockProduct.sku}</p>
              </div>
              <button
                onClick={() => setEditingStockProduct(null)}
                className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleUpdateStockSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Location</label>
                <select
                  value={selectedStockLoc}
                  onChange={(e) => setSelectedStockLoc(e.target.value)}
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.shortCode}>
                      {loc.shortCode} - {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  New Physical On-Hand Quantity ({editingStockProduct.uom})
                </label>
                <input
                  type="number"
                  min={0}
                  required
                  value={newStockValue}
                  onChange={(e) => setNewStockValue(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2 text-center text-lg font-mono font-bold bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingStockProduct(null)}
                  className="px-3 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-lg cursor-pointer shadow-xs"
                >
                  Save Stock Level
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD NEW PRODUCT MODAL */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden my-8">
            <div className="p-5 bg-gradient-to-r from-slate-900 to-teal-950 text-white flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg">Add New Product to Catalog</h3>
                <p className="text-xs text-slate-300">Register SKU, Valuation and Initial Inventory</p>
              </div>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Product Name</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ergonomic Desk"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">SKU / Code</label>
                  <input
                    type="text"
                    required
                    value={sku}
                    onChange={(e) => setSku(e.target.value)}
                    placeholder="e.g. DESK001"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Category</label>
                  <input
                    type="text"
                    required
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Office Furniture"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Unit of Measure (UOM)</label>
                  <select
                    value={uom}
                    onChange={(e) => setUom(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="Units">Units</option>
                    <option value="kg">kg</option>
                    <option value="meters">meters</option>
                    <option value="boxes">boxes</option>
                    <option value="pallets">pallets</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Per Unit Cost (₹)</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={costPerUnit}
                    onChange={(e) => setCostPerUnit(parseFloat(e.target.value) || 0)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min={0}
                    value={initialStock}
                    onChange={(e) => setInitialStock(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono font-bold bg-white border border-slate-300 rounded-lg text-center"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Reorder Point</label>
                  <input
                    type="number"
                    min={0}
                    value={reorderPoint}
                    onChange={(e) => setReorderPoint(parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 font-mono bg-white border border-slate-300 rounded-lg text-center"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stock Location</label>
                  <select
                    value={initialLocation}
                    onChange={(e) => setInitialLocation(e.target.value)}
                    className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.shortCode}>
                        {loc.shortCode}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Product Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Material specs, dimensions, storage conditions..."
                  className="w-full px-3 py-1.5 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-sm cursor-pointer"
                >
                  Save Product to Catalog
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
