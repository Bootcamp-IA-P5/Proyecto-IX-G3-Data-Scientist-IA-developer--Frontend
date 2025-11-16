import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';

interface RiskGaugeProps {
  value: number; // 0-100
}

export function RiskGauge({ value }: RiskGaugeProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDisplayValue(value);
    }, 100);
    return () => clearTimeout(timer);
  }, [value]);

  const getColor = (val: number) => {
    if (val < 30) return { primary: '#10b981', secondary: '#d1fae5', accent: '#059669' }; // green
    if (val < 70) return { primary: '#f59e0b', secondary: '#fef3c7', accent: '#d97706' }; // orange
    return { primary: '#ef4444', secondary: '#fee2e2', accent: '#dc2626' }; // red
  };

  const getRiskLevel = (val: number) => {
    if (val < 30) return 'Bajo';
    if (val < 70) return 'Medio';
    return 'Alto';
  };

  const angle = (displayValue / 100) * 180 - 90;
  const colors = getColor(displayValue);

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-full max-w-xs">
        {/* Gauge Container */}
        <div className="relative aspect-[2/1]">
          <svg viewBox="0 0 200 120" className="w-full h-full">
            {/* Background Track */}
            <defs>
              <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#10b981" />
                <stop offset="50%" stopColor="#f59e0b" />
                <stop offset="100%" stopColor="#ef4444" />
              </linearGradient>
            </defs>
            
            {/* Background arc */}
            <path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="16"
              strokeLinecap="round"
            />
            
            {/* Colored gradient arc */}
            <motion.path
              d="M 30 100 A 70 70 0 0 1 170 100"
              fill="none"
              stroke="url(#gaugeGradient)"
              strokeWidth="16"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />

            {/* Tick marks */}
            {[0, 25, 50, 75, 100].map((tick) => {
              const tickAngle = (tick / 100) * 180 - 90;
              const tickRad = (tickAngle * Math.PI) / 180;
              const innerRadius = 62;
              const outerRadius = 72;
              const x1 = 100 + Math.cos(tickRad) * innerRadius;
              const y1 = 100 + Math.sin(tickRad) * innerRadius;
              const x2 = 100 + Math.cos(tickRad) * outerRadius;
              const y2 = 100 + Math.sin(tickRad) * outerRadius;

              return (
                <line
                  key={tick}
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#64748b"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              );
            })}
            
            {/* Needle */}
            <motion.g
              initial={{ rotate: -90 }}
              animate={{ rotate: angle }}
              transition={{ duration: 2, type: 'spring', damping: 15, stiffness: 80 }}
              style={{ originX: '100px', originY: '100px' }}
            >
              <line
                x1="100"
                y1="100"
                x2="100"
                y2="40"
                stroke={colors.primary}
                strokeWidth="4"
                strokeLinecap="round"
              />
              <circle cx="100" cy="100" r="8" fill={colors.primary} />
              <circle cx="100" cy="100" r="4" fill="white" />
            </motion.g>
          </svg>
        </div>

        {/* Value Display */}
        <motion.div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 translate-y-4"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="text-center">
            <motion.div
              className="text-5xl font-bold mb-1"
              style={{ color: colors.primary }}
              key={displayValue}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {displayValue.toFixed(1)}%
            </motion.div>
            <div 
              className="text-sm font-semibold px-3 py-1 rounded-full inline-block"
              style={{ 
                backgroundColor: colors.secondary,
                color: colors.accent
              }}
            >
              Riesgo {getRiskLevel(displayValue)}
            </div>
          </div>
        </motion.div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-6 mt-8">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-600 font-medium">Bajo (0-30%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-orange-500" />
          <span className="text-xs text-slate-600 font-medium">Medio (30-70%)</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-red-500" />
          <span className="text-xs text-slate-600 font-medium">Alto (70-100%)</span>
        </div>
      </div>
    </div>
  );
}

