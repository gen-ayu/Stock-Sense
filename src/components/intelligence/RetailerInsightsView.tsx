import React from 'react';
import { useInventory } from '../../context/InventoryContext';
import {
  Sparkles,
  AlertTriangle,
  Archive,
  Clock,
  TrendingUp,
  DollarSign,
  RotateCw,
  ShoppingCart,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export const RetailerInsightsView: React.FC<{ onNavigate: (tab: string) => void }> = ({ onNavigate }) => {
  const { insights, kpis } = useInventory();

  const iconMap: Record<string, React.ReactNode> = {
    LOW_STOCK: <AlertTriangle className="w-5 h-5 text-rose-600" />,
    DEAD_STOCK: <Archive className="w-5 h-5 text-amber-600" />,
    EXPIRY: <Clock className="w-5 h-5 text-orange-600" />,
    GROWTH: <TrendingUp className="w-5 h-5 text-emerald-600" />,
    REVENUE: <DollarSign className="w-5 h-5 text-sky-600" />,
    TURNOVER: <RotateCw className="w-5 h-5 text-purple-600" />,
    REORDER: <ShoppingCart className="w-5 h-5 text-indigo-600" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-amber-950 p-6 rounded-3xl text-white shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 rounded-md border border-amber-400/30">
              ALGORITHMIC DERIVED INSIGHTS
            </span>
            <span className="text-xs text-slate-300">Continuous Warehouse AI Monitoring</span>
          </div>
          <h1 className="text-2xl font-black tracking-tight mt-1">Retailer Health & Operations Feed</h1>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            Automated intelligence synthesizes stock velocity, dead inventory, expiring batches, and revenue patterns into actionable directives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 bg-white/10 rounded-xl text-xs font-mono font-semibold text-slate-200">
            {insights.length} Actionable Directives
          </span>
        </div>
      </div>

      {/* Intelligence Grid (Requirement 10) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((ins) => (
          <div
            key={ins.id}
            className={`p-5 rounded-3xl border shadow-xs bg-white flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow ${
              ins.severity === 'critical'
                ? 'border-rose-300 ring-1 ring-rose-400/10'
                : ins.severity === 'warning'
                ? 'border-amber-300 ring-1 ring-amber-400/10'
                : ins.severity === 'success'
                ? 'border-emerald-300 ring-1 ring-emerald-400/10'
                : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div
                    className={`p-2.5 rounded-2xl ${
                      ins.severity === 'critical'
                        ? 'bg-rose-50'
                        : ins.severity === 'warning'
                        ? 'bg-amber-50'
                        : ins.severity === 'success'
                        ? 'bg-emerald-50'
                        : 'bg-slate-100'
                    }`}
                  >
                    {iconMap[ins.type] || <Sparkles className="w-5 h-5 text-teal-600" />}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 font-mono">
                      Directive • {ins.type.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {ins.title}
                    </h3>
                  </div>
                </div>

                {ins.metric && (
                  <span className="px-2 py-0.5 rounded-lg text-xs font-mono font-bold bg-slate-100 text-slate-800">
                    {ins.metric}
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                {ins.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-400 font-mono">{ins.timestamp}</span>
              {ins.targetTab && (
                <button
                  onClick={() => onNavigate(ins.targetTab!)}
                  className="px-3 py-1.5 bg-slate-900 hover:bg-teal-700 text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                >
                  <span>{ins.actionText || 'Take Action'}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
