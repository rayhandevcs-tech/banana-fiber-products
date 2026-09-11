import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui';

export type StockLevel = 'in-stock' | 'low-stock' | 'out-of-stock';

/** Single source of truth for how a stock number becomes a status. */
export function getStockLevel(stock: number, lowStockThreshold: number): StockLevel {
  if (stock <= 0) return 'out-of-stock';
  if (stock <= lowStockThreshold) return 'low-stock';
  return 'in-stock';
}

const config = {
  'in-stock': { tone: 'success', Icon: CheckCircle2 },
  'low-stock': { tone: 'warning', Icon: AlertTriangle },
  'out-of-stock': { tone: 'danger', Icon: XCircle },
} as const;

/**
 * Stock status. Always renders an icon alongside the colour and the words, so
 * the status is never communicated by colour alone.
 */
export function StockBadge({
  level,
  label,
  size = 'sm',
  className,
}: {
  level: StockLevel;
  label: string;
  size?: 'sm' | 'md';
  className?: string;
}) {
  const { tone, Icon } = config[level];
  return (
    <Badge
      tone={tone}
      size={size}
      icon={<Icon className="h-3.5 w-3.5" />}
      className={className}
    >
      {label}
    </Badge>
  );
}
