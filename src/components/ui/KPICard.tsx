import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { useEffect } from 'react';

type AccentColor = 'navy' | 'orange' | 'success' | 'danger';

interface KPICardProps {
  title: string;
  value: number;
  subtitle?: string;
  trend?: number;
  trendLabel?: string;
  accentColor?: AccentColor;
  icon?: React.ReactNode;
}

const accentBorderColors: Record<AccentColor, string> = {
  navy: 'border-l-[#1B2A4A]',
  orange: 'border-l-[#E8672C]',
  success: 'border-l-green-500',
  danger: 'border-l-red-500',
};

const accentIconBgColors: Record<AccentColor, string> = {
  navy: 'bg-[#1B2A4A]/10 text-[#1B2A4A]',
  orange: 'bg-[#E8672C]/10 text-[#E8672C]',
  success: 'bg-green-100 text-green-600',
  danger: 'bg-red-100 text-red-600',
};

function AnimatedNumber({ value }: { value: number }) {
  const motionVal = useMotionValue(0);
  const rounded = useTransform(motionVal, (v) => {
    if (value >= 1000) return Math.round(v).toLocaleString();
    if (Number.isInteger(value)) return Math.round(v).toLocaleString();
    return v.toFixed(1);
  });

  useEffect(() => {
    const controls = animate(motionVal, value, {
      duration: 1.2,
      ease: 'easeOut',
    });
    return controls.stop;
  }, [value, motionVal]);

  return <motion.span>{rounded}</motion.span>;
}

export default function KPICard({
  title,
  value,
  subtitle,
  trend,
  trendLabel,
  accentColor = 'navy',
  icon,
}: KPICardProps) {
  const trendIsPositive = trend !== undefined && trend >= 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className={[
        'bg-white rounded-xl border border-[#E2E6EF] border-l-4 p-3.5 shadow-sm',
        accentBorderColors[accentColor],
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <p className="uppercase text-[10px] tracking-wider text-[#6B7A99] font-medium mb-1.5">
            {title}
          </p>

          <p className="font-display text-[2rem] lg:text-[2.1rem] font-bold text-[#1B2A4A] leading-none">
            <AnimatedNumber value={value} />
          </p>

          {subtitle && (
            <p className="text-xs text-[#6B7A99] mt-1">{subtitle}</p>
          )}

          {trend !== undefined && (
            <div className="flex items-center gap-1 mt-2">
              {trendIsPositive ? (
                <TrendingUp className="w-4 h-4 text-green-600" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
              <span
                className={[
                  'text-xs font-semibold',
                  trendIsPositive ? 'text-green-600' : 'text-red-500',
                ].join(' ')}
              >
                {trendIsPositive ? '+' : ''}
                {trend}%
              </span>
              {trendLabel && (
                <span className="text-[11px] text-[#6B7A99]">{trendLabel}</span>
              )}
            </div>
          )}
        </div>

        {icon && (
          <div
            className={[
              'shrink-0 w-9 h-9 rounded-lg flex items-center justify-center ml-3',
              accentIconBgColors[accentColor],
            ].join(' ')}
          >
            {icon}
          </div>
        )}
      </div>
    </motion.div>
  );
}
