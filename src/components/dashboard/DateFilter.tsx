import { useState } from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { DateRange as DayPickerDateRange } from 'react-day-picker';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { DateRange } from '@/hooks/useCampaignData';

interface DateFilterProps {
  dateRange: DateRange;
  onDateRangeChange: (range: DateRange) => void;
  availableDateRange: { min: Date; max: Date } | null;
}

export function DateFilter({ dateRange, onDateRangeChange, availableDateRange }: DateFilterProps) {
  const [selectedRange, setSelectedRange] = useState<DayPickerDateRange | undefined>({
    from: dateRange.from,
    to: dateRange.to,
  });
  const [isOpen, setIsOpen] = useState(false);

  const presets = [
    { label: '7 dias', days: 7 },
    { label: '14 dias', days: 14 },
    { label: '30 dias', days: 30 },
    { label: '90 dias', days: 90 },
  ];

  const handlePreset = (days: number) => {
    // Use the max available date as reference instead of today
    const to = availableDateRange?.max ? new Date(availableDateRange.max) : new Date();
    to.setHours(23, 59, 59, 999);
    
    const from = new Date(to);
    from.setDate(to.getDate() - (days - 1)); // -1 because we want to include "to" day
    from.setHours(0, 0, 0, 0);
    
    const newRange = { from, to };
    setSelectedRange(newRange);
    onDateRangeChange(newRange);
  };

  const handleSelect = (range: DayPickerDateRange | undefined) => {
    setSelectedRange(range);
    if (range?.from && range?.to) {
      onDateRangeChange({ from: range.from, to: range.to });
      setIsOpen(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-3 p-4 glass-card rounded-lg">
      <span className="text-sm font-medium text-muted-foreground">Período:</span>

      <div className="flex gap-2">
        {presets.map((preset) => (
          <Button
            key={preset.days}
            variant="ghost"
            size="sm"
            onClick={() => handlePreset(preset.days)}
            className="text-xs hover:bg-primary/10 hover:text-primary"
          >
            {preset.label}
          </Button>
        ))}
      </div>

      <div className="h-6 w-px bg-border/50" />

      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "justify-start text-left font-normal gap-2 bg-secondary/50 border-border/50 hover:bg-secondary hover:text-primary",
            )}
          >
            <CalendarIcon className="h-4 w-4 text-primary" />
            {format(dateRange.from, "dd MMM", { locale: ptBR })} - {format(dateRange.to, "dd MMM yyyy", { locale: ptBR })}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-popover border-border" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={dateRange.from}
            selected={selectedRange}
            onSelect={handleSelect}
            numberOfMonths={2}
            disabled={(date) => {
              if (!availableDateRange) return false;
              return date < availableDateRange.min || date > availableDateRange.max;
            }}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}
