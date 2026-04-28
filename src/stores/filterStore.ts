/** Zustand filter store: dateRange, selectedUsers, department, setters. */

import { create } from "zustand";

import { subDays } from "date-fns";

interface FilterState {
  startDate: Date;
  endDate: Date;
  selectedUsers: string[];
  department: string | null;
  searchQuery: string;
  setDateRange: (start: Date, end: Date) => void;
  setSelectedUsers: (users: string[]) => void;
  setDepartment: (department: string | null) => void;
  setSearchQuery: (query: string) => void;
  resetFilters: () => void;
}

const DEFAULT_RANGE_DAYS = 7;

function getDefaultStartDate(): Date {
  return subDays(new Date(), DEFAULT_RANGE_DAYS);
}

function getDefaultEndDate(): Date {
  return new Date();
}

export const useFilterStore = create<FilterState>((set) => ({
  startDate: getDefaultStartDate(),
  endDate: getDefaultEndDate(),
  selectedUsers: [],
  department: null,
  searchQuery: "",

  setDateRange: (start: Date, end: Date): void => {
    set({ startDate: start, endDate: end });
  },

  setSelectedUsers: (users: string[]): void => {
    set({ selectedUsers: users });
  },

  setDepartment: (department: string | null): void => {
    set({ department });
  },

  setSearchQuery: (query: string): void => {
    set({ searchQuery: query });
  },

  resetFilters: (): void => {
    set({
      startDate: getDefaultStartDate(),
      endDate: getDefaultEndDate(),
      selectedUsers: [],
      department: null,
      searchQuery: "",
    });
  },
}));
