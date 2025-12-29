import { cn } from '@/lib/utils';

interface TimeframeSelectorProps {
  selected: number;
  onChange: (days: number) => void;
}

const timeframes = [
  { label: '24H', days: 1 },
  { label: '7D', days: 7 },
  { label: '30D', days: 30 },
  { label: '90D', days: 90 },
  { label: '1Y', days: 365 },
];

export function TimeframeSelector({ selected, onChange }: TimeframeSelectorProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-secondary/50">
      {timeframes.map(({ label, days }) => (
        <button
          key={days}
          onClick={() => onChange(days)}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200",
            selected === days
              ? "bg-primary text-primary-foreground shadow-lg"
              : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
          )}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
