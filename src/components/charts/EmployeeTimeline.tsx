import { useMemo } from 'react';

type ActivityType = 'active' | 'idle' | 'break' | 'offline';

interface TimelineSegment {
  start: string;
  end: string;
  type: ActivityType;
  label?: string;
}

interface EmployeeTimelineEntry {
  employeeName: string;
  segments: TimelineSegment[];
}

interface EmployeeTimelineProps {
  data: EmployeeTimelineEntry[];
}

const typeColors: Record<ActivityType, string> = {
  active: 'bg-blue-500',
  idle: 'bg-yellow-400',
  break: 'bg-gray-300 dark:bg-gray-600',
  offline: 'bg-red-400',
};

const typeLabels: Record<ActivityType, string> = {
  active: 'Active',
  idle: 'Idle',
  break: 'Break',
  offline: 'Offline',
};

function timeToMinutes(time: string): number {
  const [hours = 0, minutes = 0] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

const TIMELINE_START = 9 * 60;
const TIMELINE_END = 17 * 60;
const TIMELINE_RANGE = TIMELINE_END - TIMELINE_START;

export function EmployeeTimeline({ data }: EmployeeTimelineProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  const hourMarkers = useMemo(() => {
    const markers: number[] = [];
    for (let h = 9; h <= 17; h++) {
      markers.push(h);
    }
    return markers;
  }, []);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
        Employee Timeline
      </h3>
      <div
        role="img"
        aria-label="Horizontal timeline showing activity periods for each employee"
      >
        {/* Hour labels */}
        <div className="mb-2 ml-32 flex justify-between">
          {hourMarkers.map((hour) => (
            <span
              key={hour}
              className="text-xs text-gray-400 dark:text-gray-500"
            >
              {hour}:00
            </span>
          ))}
        </div>

        {/* Employee rows */}
        <div className="space-y-3">
          {data.map((entry) => (
            <div key={entry.employeeName} className="flex items-center gap-3">
              <span className="w-28 shrink-0 truncate text-sm font-medium text-gray-700 dark:text-gray-300">
                {entry.employeeName}
              </span>
              <div className="relative h-8 flex-1 rounded bg-gray-100 dark:bg-gray-700">
                {entry.segments.map((segment, idx) => {
                  const startMin = timeToMinutes(segment.start) - TIMELINE_START;
                  const endMin = timeToMinutes(segment.end) - TIMELINE_START;
                  const left = (startMin / TIMELINE_RANGE) * 100;
                  const width = ((endMin - startMin) / TIMELINE_RANGE) * 100;

                  return (
                    <div
                      key={idx}
                      className={`absolute top-0 h-full ${typeColors[segment.type]} rounded transition-colors`}
                      style={{ left: `${left}%`, width: `${width}%` }}
                      title={`${segment.start} - ${segment.end}: ${typeLabels[segment.type]}${segment.label ? ` (${segment.label})` : ''}`}
                    >
                      {width > 8 && segment.label && (
                        <span className="absolute inset-0 flex items-center justify-center truncate px-1 text-[10px] font-medium text-white">
                          {segment.label}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-4 flex flex-wrap gap-4">
          {(Object.keys(typeColors) as ActivityType[]).map((type) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={`h-3 w-3 rounded-sm ${typeColors[type]}`} />
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {typeLabels[type]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
