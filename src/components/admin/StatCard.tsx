import { motion } from 'motion/react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  color: string;
  bgColor: string;
  trend?: string;
  delay?: number;
}

/**
 * Reusable stat card component for dashboards
 * Used in Dashboard, Analytics, QuotesDashboard, Compliance
 */
export default function StatCard({
  label,
  value,
  icon: Icon,
  color,
  bgColor,
  trend,
  delay = 0,
}: StatCardProps) {
  const getTrendColor = (trendValue?: string) => {
    if (!trendValue) return 'text-slate-400';
    if (trendValue.startsWith('+')) return 'text-emerald-600';
    if (trendValue.startsWith('-')) return 'text-red-500';
    return 'text-slate-400';
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: delay * 0.1 }}
      className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`w-12 h-12 ${bgColor} ${color} rounded-xl flex items-center justify-center`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-bold ${getTrendColor(trend)}`}>
            {trend}
          </span>
        )}
      </div>
      <p className="text-xs font-bold text-slate-500 uppercase tracking-widest leading-none mb-1">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900">{value}</p>
    </motion.div>
  );
}
