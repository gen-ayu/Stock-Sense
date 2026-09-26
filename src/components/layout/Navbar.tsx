import React, { useState } from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  Boxes,
  Bell,
  Search,
  User as UserIcon,
  LogOut,
  RotateCcw,
  AlertTriangle,
  Menu,
  Shield,
  ExternalLink,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar: () => void;
  onOpenAuth: () => void;
  onSelectNav: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar, onOpenAuth, onSelectNav }) => {
  const { currentUser, logout, products, resetToDefaults } = useInventory();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  const lowStockProducts = products.filter((p) => p.onHand <= p.reorderPoint);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-xs">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile hamburger & Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div
            onClick={() => onSelectNav('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group select-none"
          >
            <div className="w-9 h-9 rounded-xl bg-teal-600 flex items-center justify-center text-white shadow-md shadow-teal-600/30 group-hover:scale-105 transition-transform">
              <Boxes className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight text-slate-900 group-hover:text-teal-700 transition-colors">
                  Stock<span className="text-teal-600">Sense</span>
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-mono font-semibold bg-teal-50 text-teal-700 rounded-md border border-teal-200">
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium leading-none -mt-0.5">
                Modular Inventory System
              </p>
            </div>
          </div>
        </div>

        {/* Center: System Status Indicator */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-full text-xs text-slate-600">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="font-medium">System Online:</span>
          <span className="font-mono text-slate-500">WH Central Active</span>
        </div>

        {/* Right: Notifications, Quick Actions, Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notifications Dropdown */}
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              title="Stock Alerts"
            >
              <Bell className="w-5 h-5" />
              {lowStockProducts.length > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                  {lowStockProducts.length}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50 animate-in fade-in zoom-in-95">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-500" />
                    <span>Low Stock Alerts ({lowStockProducts.length})</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotifications(false);
                      onSelectNav('products');
                    }}
                    className="text-xs text-teal-600 hover:text-teal-700 font-medium cursor-pointer"
                  >
                    View All
                  </button>
                </div>

                <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1">
                  {lowStockProducts.length === 0 ? (
                    <p className="text-xs text-slate-500 py-3 text-center">All product stocks healthy!</p>
                  ) : (
                    lowStockProducts.map((p) => (
                      <div
                        key={p.id}
                        onClick={() => {
                          setShowNotifications(false);
                          onSelectNav('products');
                        }}
                        className="p-2.5 rounded-xl bg-amber-50/60 border border-amber-200/70 hover:bg-amber-100/60 transition-colors cursor-pointer"
                      >
                        <div className="flex justify-between items-start">
                          <span className="text-xs font-semibold text-slate-800">{p.name}</span>
                          <span className="text-xs font-mono font-bold text-rose-600">
                            {p.onHand} {p.uom} left
                          </span>
                        </div>
                        <div className="flex justify-between items-center mt-1 text-[11px] text-slate-500">
                          <span className="font-mono text-[10px] text-slate-400">{p.sku}</span>
                          <span>Reorder Point: {p.reorderPoint}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Reset Demo Data */}
          <button
            onClick={() => {
              if (window.confirm('Reset all inventory records to the initial demo seed?')) {
                resetToDefaults();
              }
            }}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200/80 rounded-xl transition-colors cursor-pointer"
            title="Reset to default seed data"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Demo</span>
          </button>

          {/* User Profile / Menu */}
          {currentUser ? (
            <div className="relative">
              <button
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowNotifications(false);
                }}
                className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer border border-transparent hover:border-slate-200"
              >
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 border border-teal-200 overflow-hidden flex items-center justify-center font-bold text-sm">
                  {currentUser.avatar ? (
                    <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
                  ) : (
                    currentUser.name.charAt(0)
                  )}
                </div>
                <div className="hidden sm:block text-left">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">{currentUser.name}</p>
                  <p className="text-[10px] text-teal-600 font-medium leading-none mt-0.5">{currentUser.role}</p>
                </div>
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{currentUser.name}</p>
                    <p className="text-[11px] text-slate-500 font-mono">{currentUser.loginId}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-teal-50 text-teal-700 text-[10px] font-semibold rounded-md border border-teal-200">
                      {currentUser.role}
                    </span>
                  </div>

                  <div className="pt-1">
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        onSelectNav('settings');
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg flex items-center gap-2 cursor-pointer"
                    >
                      <Shield className="w-4 h-4 text-slate-400" />
                      <span>Warehouse Settings</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        onOpenAuth();
                      }}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg flex items-center gap-2 cursor-pointer mt-1"
                    >
                      <LogOut className="w-4 h-4 text-rose-500" />
                      <span>Log Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-teal-600 hover:bg-teal-700 rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <UserIcon className="w-3.5 h-3.5" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
