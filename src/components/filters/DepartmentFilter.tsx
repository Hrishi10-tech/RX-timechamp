import { useState, useRef, useEffect, useMemo } from 'react';
import { ChevronDown, Building2, Check } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  memberCount: number;
}

interface DepartmentFilterProps {
  departments: Department[];
  selectedId: string | null;
  onChange: (id: string | null) => void;
  placeholder?: string;
}

export function DepartmentFilter({
  departments,
  selectedId,
  onChange,
  placeholder = 'All Departments',
}: DepartmentFilterProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectedDept = useMemo(
    () => departments.find((d) => d.id === selectedId),
    [departments, selectedId]
  );

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
        aria-label="Filter by department"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <Building2 className="h-4 w-4 text-gray-400" />
        <span>{selectedDept ? selectedDept.name : placeholder}</span>
        <ChevronDown className="h-4 w-4" />
      </button>

      {open && (
        <ul
          className="absolute left-0 top-full z-50 mt-1 w-56 rounded-lg border border-gray-200 bg-white py-1 shadow-xl dark:border-gray-600 dark:bg-gray-800"
          role="listbox"
          aria-label="Department options"
        >
          {/* All option */}
          <li
            onClick={() => {
              onChange(null);
              setOpen(false);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onChange(null);
                setOpen(false);
              }
            }}
            className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
              selectedId === null ? 'bg-blue-50 dark:bg-blue-900/10' : ''
            }`}
            role="option"
            aria-selected={selectedId === null}
            tabIndex={0}
          >
            <span className="text-gray-700 dark:text-gray-300">{placeholder}</span>
            {selectedId === null && <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />}
          </li>

          <li className="my-1 border-t border-gray-200 dark:border-gray-700" role="separator" />

          {departments.map((dept) => (
            <li
              key={dept.id}
              onClick={() => {
                onChange(dept.id);
                setOpen(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onChange(dept.id);
                  setOpen(false);
                }
              }}
              className={`flex cursor-pointer items-center justify-between px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                selectedId === dept.id ? 'bg-blue-50 dark:bg-blue-900/10' : ''
              }`}
              role="option"
              aria-selected={selectedId === dept.id}
              tabIndex={0}
            >
              <div>
                <span className="font-medium text-gray-700 dark:text-gray-300">
                  {dept.name}
                </span>
                <span className="ml-2 text-xs text-gray-400 dark:text-gray-500">
                  ({dept.memberCount})
                </span>
              </div>
              {selectedId === dept.id && (
                <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
