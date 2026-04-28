import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { ChevronDown, X, Check, Search } from 'lucide-react';

interface UserOption {
  id: string;
  name: string;
  email: string;
  department?: string;
}

interface UserSelectorProps {
  users: UserOption[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  placeholder?: string;
}

export function UserSelector({
  users,
  selectedIds,
  onChange,
  placeholder = 'Select users...',
}: UserSelectorProps) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const filteredUsers = useMemo(() => {
    if (!search) return users;
    const lower = search.toLowerCase();
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(lower) ||
        u.email.toLowerCase().includes(lower)
    );
  }, [users, search]);

  const toggleUser = useCallback(
    (id: string) => {
      if (selectedIds.includes(id)) {
        onChange(selectedIds.filter((s) => s !== id));
      } else {
        onChange([...selectedIds, id]);
      }
    },
    [selectedIds, onChange]
  );

  const removeUser = useCallback(
    (id: string) => {
      onChange(selectedIds.filter((s) => s !== id));
    },
    [selectedIds, onChange]
  );

  const selectedUsers = useMemo(
    () => users.filter((u) => selectedIds.includes(u.id)),
    [users, selectedIds]
  );

  return (
    <div ref={ref} className="relative">
      {/* Trigger */}
      <button
        onClick={() => setOpen(!open)}
        className="flex min-h-[38px] w-full items-center justify-between gap-2 rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-left text-sm dark:border-gray-600 dark:bg-gray-700"
        aria-label="Select users"
        aria-expanded={open}
        aria-haspopup="listbox"
      >
        <div className="flex flex-1 flex-wrap gap-1">
          {selectedUsers.length === 0 ? (
            <span className="text-gray-400 dark:text-gray-500">{placeholder}</span>
          ) : (
            selectedUsers.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-1 rounded bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300"
              >
                {user.name}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    removeUser(user.id);
                  }}
                  className="rounded-full hover:bg-blue-200 dark:hover:bg-blue-800"
                  aria-label={`Remove ${user.name}`}
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))
          )}
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
      </button>

      {/* Dropdown */}
      {open && (
        <div
          className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-600 dark:bg-gray-800"
          role="listbox"
          aria-label="Users list"
          aria-multiselectable="true"
        >
          {/* Search */}
          <div className="border-b border-gray-200 p-2 dark:border-gray-700">
            <div className="relative">
              <Search className="pointer-events-none absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search users..."
                className="w-full rounded-md border-0 bg-gray-50 py-1.5 pl-8 pr-3 text-sm text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                aria-label="Search users"
              />
            </div>
          </div>

          {/* Options */}
          <ul className="max-h-48 overflow-y-auto py-1" role="list">
            {filteredUsers.length === 0 ? (
              <li className="px-4 py-3 text-center text-sm text-gray-500 dark:text-gray-400">
                No users found
              </li>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedIds.includes(user.id);
                return (
                  <li
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        toggleUser(user.id);
                      }
                    }}
                    className={`flex cursor-pointer items-center gap-3 px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 ${
                      isSelected ? 'bg-blue-50 dark:bg-blue-900/10' : ''
                    }`}
                    role="option"
                    aria-selected={isSelected}
                    tabIndex={0}
                  >
                    <div
                      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${
                        isSelected
                          ? 'border-blue-600 bg-blue-600'
                          : 'border-gray-300 dark:border-gray-600'
                      }`}
                    >
                      {isSelected && <Check className="h-3 w-3 text-white" />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="truncate text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
