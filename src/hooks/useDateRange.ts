/** Date range picker hook wrapping filterStore. */

import { useCallback, useMemo } from "react";

import { useFilterStore } from "@/stores/filterStore";
import { formatApiDate, getDateRangeForPeriod } from "@/utils/dateHelpers";
import type { ChartTimeRange } from "@/types/ui";

export interface UseDateRangeReturn {
  startDate: Date;
  endDate: Date;
  startDateApi: string;
  endDateApi: string;
  setDateRange: (start: Date, end: Date) => void;
  setPreset: (period: ChartTimeRange) => void;
  reset: () => void;
}

export function useDateRange(): UseDateRangeReturn {
  const { startDate, endDate, setDateRange, resetFilters } = useFilterStore();

  const startDateApi = useMemo(() => formatApiDate(startDate), [startDate]);
  const endDateApi = useMemo(() => formatApiDate(endDate), [endDate]);

  const setPreset = useCallback(
    (period: ChartTimeRange): void => {
      const { start, end } = getDateRangeForPeriod(period);
      setDateRange(start, end);
    },
    [setDateRange],
  );

  return {
    startDate,
    endDate,
    startDateApi,
    endDateApi,
    setDateRange,
    setPreset,
    reset: resetFilters,
  };
}
