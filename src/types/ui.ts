/** UI component types for tables, filters, and shared component props. */

import type { ReactNode } from "react";

export type SortDirection = "asc" | "desc";

export interface SortState {
  column: string;
  direction: SortDirection;
}

export interface FilterState {
  search: string;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  selectedUsers: string[];
  department: string | null;
}

export interface PaginationState {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
}

export interface ColumnDef<T> {
  id: string;
  header: string;
  accessorKey: keyof T;
  cell?: (value: T[keyof T], row: T) => ReactNode;
  sortable?: boolean;
  width?: string;
  align?: "left" | "center" | "right";
}

export interface SelectOption {
  label: string;
  value: string;
}

export interface TabItem {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number;
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export interface ModalState {
  isOpen: boolean;
  title: string;
  content?: ReactNode;
}

export interface ToastMessage {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  description?: string;
  duration?: number;
}

export type ChartTimeRange = "7d" | "14d" | "30d" | "90d";

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface NavItem {
  label: string;
  href: string;
  icon: string;
  badge?: number;
  children?: NavItem[];
}

export type ExportFormat = "csv" | "pdf";
