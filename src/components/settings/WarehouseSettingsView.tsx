import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  Warehouse as WarehouseIcon,
  MapPin,
  Plus,
  Building,
  Layers,
  X,
  Compass,
} from 'lucide-react';

export const WarehouseSettingsView: React.FC = () => {
  const { warehouses, locations, createWarehouse, createLocation } = useInventory();

  const [isAddWhModalOpen, setIsAddWhModalOpen] = useState(false);
  const [isAddLocModalOpen, setIsAddLocModalOpen] = useState(false);

  // New Warehouse Form
  const [whName, setWhName] = useState('');
  const [whShortCode, setWhShortCode] = useState('');
  const [whAddress, setWhAddress] = useState('');

  // New Location Form
  const [locName, setLocName] = useState('');
  const [locShortCode, setLocShortCode] = useState('');
  const [locWarehouseId, setLocWarehouseId] = useState(warehouses[0]?.id || 'wh_1');

  const handleCreateWarehouse = (e: React.FormEvent) => {
    e.preventDefault();
    createWarehouse({
      name: whName,
      shortCode: whShortCode.toUpperCase(),
      address: whAddress,
    });
    setIsAddWhModalOpen(false);
    setWhName('');
    setWhShortCode('');
    setWhAddress('');
  };

  const handleCreateLocation = (e: React.FormEvent) => {
    e.preventDefault();
    const parentWh = warehouses.find((w) => w.id === locWarehouseId) || warehouses[0];
    const formattedCode = locShortCode.includes('/')
      ? locShortCode
      : `${parentWh.shortCode}/${locShortCode}`;

    createLocation({
      name: locName,
      shortCode: formattedCode,
      warehouseId: parentWh.id,
      warehouseCode: parentWh.shortCode,
    });

    setIsAddLocModalOpen(false);
    setLocName('');
    setLocShortCode('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-teal-50 text-teal-700">
              <WarehouseIcon className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Warehouse & Locations Configuration</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Configure multi-warehouse hierarchies, storage rooms, racks, bays, and sequential identifier prefixes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsAddWhModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Warehouse</span>
          </button>
          <button
            onClick={() => setIsAddLocModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add Location / Room</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Section 1: Warehouses */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Building className="w-4 h-4 text-slate-700" />
              <h2 className="font-bold text-sm text-slate-900">Registered Warehouses</h2>
            </div>
            <span className="text-xs font-mono font-bold text-slate-500">
              {warehouses.length} Active
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {warehouses.map((wh) => (
              <div key={wh.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{wh.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
                      <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                      <span>{wh.address}</span>
                    </p>
                  </div>
                  <span className="px-2 py-1 font-mono font-extrabold text-xs bg-slate-100 text-slate-800 rounded-lg border border-slate-200">
                    {wh.shortCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Locations & Rooms */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50/50">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-teal-700" />
              <h2 className="font-bold text-sm text-slate-900">Internal Storage Locations & Racks</h2>
            </div>
            <span className="text-xs font-mono font-bold text-teal-700">
              {locations.length} Locations
            </span>
          </div>

          <div className="divide-y divide-slate-100">
            {locations.map((loc) => (
              <div key={loc.id} className="p-4 hover:bg-slate-50/60 transition-colors">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-slate-800">{loc.name}</h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Parent Warehouse: <span className="font-semibold text-slate-600">{loc.warehouseCode}</span>
                    </p>
                  </div>
                  <span className="px-2.5 py-1 font-mono font-bold text-xs bg-teal-50 text-teal-800 rounded-lg border border-teal-200">
                    {loc.shortCode}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ADD WAREHOUSE MODAL */}
      {isAddWhModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Register New Warehouse</h3>
              <button onClick={() => setIsAddWhModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateWarehouse} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Warehouse Name</label>
                <input
                  type="text"
                  required
                  value={whName}
                  onChange={(e) => setWhName(e.target.value)}
                  placeholder="e.g. South Logistics Depot"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Short Code <span className="text-slate-400 font-normal">(Used in WH/IN/xxxx references)</span>
                </label>
                <input
                  type="text"
                  required
                  maxLength={5}
                  value={whShortCode}
                  onChange={(e) => setWhShortCode(e.target.value)}
                  placeholder="e.g. WH, SLD"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Full Physical Address</label>
                <textarea
                  required
                  value={whAddress}
                  onChange={(e) => setWhAddress(e.target.value)}
                  rows={2}
                  placeholder="Plot 10, Industrial Area, Sector 5..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddWhModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl cursor-pointer"
                >
                  Create Warehouse
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD LOCATION MODAL */}
      {isAddLocModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95">
            <div className="p-5 bg-teal-900 text-white flex items-center justify-between">
              <h3 className="font-bold text-base">Add Storage Location / Zone</h3>
              <button onClick={() => setIsAddLocModalOpen(false)} className="text-slate-400 hover:text-white p-1 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateLocation} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent Warehouse</label>
                <select
                  value={locWarehouseId}
                  onChange={(e) => setLocWarehouseId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                >
                  {warehouses.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.shortCode} - {w.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Location / Room Name</label>
                <input
                  type="text"
                  required
                  value={locName}
                  onChange={(e) => setLocName(e.target.value)}
                  placeholder="e.g. Cold Storage Bay 4, Rack C2"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Location Short Code <span className="text-slate-400 font-normal">(e.g. WH/Stock3, WH/Cold)</span>
                </label>
                <input
                  type="text"
                  required
                  value={locShortCode}
                  onChange={(e) => setLocShortCode(e.target.value)}
                  placeholder="e.g. Stock3 or WH/Stock3"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono uppercase"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddLocModalOpen(false)}
                  className="px-4 py-2 font-medium text-slate-600 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 font-bold text-white bg-teal-600 hover:bg-teal-700 rounded-xl cursor-pointer"
                >
                  Save Location
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
