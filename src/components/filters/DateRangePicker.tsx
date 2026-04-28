import { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, ChevronDown } from 'lucide-react';

interface DateRange {
  start: string;
  end: string;
}

interface DateRangePickerProps {
  value: DateRange;
  onChange: (range: DateRange) => void;
  presets?: PresetRange[];
}

interface PresetRange {
  label: string;
  getValue: () => DateRange;
}

function formatDate(date: Date): string {
  return date.toISOString().split('T')[0] ?? '';
}

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

const defaultPresets: PresetRange[] = [
  { label: 'Today', getValue: () => ({ start: formatDate(new Date()), end: formatDate(new Date()) }) },
  { label: 'Last 7 days', getValue: () => ({ start: formatDate(daysAgo(7)), end: formatDate(new Date()) }) },
  { label: 'Last 30 days', getValue: () => ({ start: formatDate(daysAgo(30)), end: formatDate(new Date()) }) },
  { label: 'Last 90 days', getValue: () => ({ start: formatDate(daysAgo(90)), end: formatDate(new Date()) }) },
  { label: 'This month', getValue: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: formatDate(start), end: formatDate(now) };
  }},
  { label: 'Last month', getValue: () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 0);
    return { start: formatDate(start), end: formatDate(end) };
  }},
];

export function DateRangePicker({ value, onChange, presets }: DateRangePickerProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const activePresets = presets ?? defaultPresets;

  const handlePresetClick = useCallback(
    (preset: PresetRange) => {
      onChange(preset.getValue());
      setOpen(false);
    },
    [onChange]
  );

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        aria-label="Select date range"
        aria-expanded={open}
        aria-haspopup="dialog"
      >
        <Calendar className="h-4 w-4" />
        <span>
          {value.start} - {value.end}
        </span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-72 rounded-lg border border-gray-200 bg-white p-4 shadow-xl dark:border-gray-600 dark:bg-gray-800"
          role="dialog"
          aria-label="Date range picker"
        >
          {/* Presets */}
          <div className="mb-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Quick Select
            </p>
            <div className="flex flex-wrap gap-1.5">
              {activePresets.map((preset) => (
                <button
                  key={preset.label}
                  onClick={() => handlePresetClick(preset)}
                  className="rounded-md bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-blue-100 hover:text-blue-700 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400"
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Custom range inputs */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">
              Custom Range
            </p>
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label
                  htmlFor="date-start"
                  className="mb-1 block text-xs text-gray-500 dark:text-gray-400"
                >
                  Start
                </label>
                <input
                  id="date-start"
                  type="date"
                  value={value.start}
                  onChange={(e) => onChange({ ...value, start: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <span className="mt-5 text-gray-400">-</span>
              <div className="flex-1">
                <label
                  htmlFor="date-end"
                  className="mb-1 block text-xs text-gray-500 dark:text-gray-400"
                >
                  End
                </label>
                <input
                  id="date-end"
                  type="date"
                  value={value.end}
                  onChange={(e) => onChange({ ...value, end: e.target.value })}
                  className="w-full rounded-md border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
