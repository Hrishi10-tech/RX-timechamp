import { useMemo } from 'react';

interface HeatmapCell {
  day: string;
  hour: number;
  intensity: number;
}

interface RealTimeActivityHeatmapProps {
  data: HeatmapCell[];
  height?: number;
}

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const hours = Array.from({ length: 12 }, (_, i) => i + 8);

function getIntensityColor(intensity: number): string {
  if (intensity >= 80) return 'bg-blue-700 dark:bg-blue-500';
  if (intensity >= 60) return 'bg-blue-500 dark:bg-blue-400';
  if (intensity >= 40) return 'bg-blue-300 dark:bg-blue-600';
  if (intensity >= 20) return 'bg-blue-100 dark:bg-blue-800';
  return 'bg-gray-100 dark:bg-gray-700';
}

export function RealTimeActivityHeatmap({ data }: RealTimeActivityHeatmapProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  const cellMap = useMemo(() => {
    const map = new Map<string, number>();
    data.forEach((cell) => {
      map.set(`${cell.day}-${cell.hour}`, cell.intensity);
    });
    return map;
  }, [data]);

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
        Activity Heatmap
      </h3>
      <div
        role="img"
        aria-label="Heatmap grid showing activity density across days and hours"
        className="overflow-x-auto"
      >
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left text-xs font-medium text-gray-500 dark:text-gray-400">
                <span className="sr-only">Day</span>
              </th>
              {hours.map((hour) => (
                <th
                  key={hour}
                  className="px-1 py-1 text-center text-xs font-medium text-gray-500 dark:text-gray-400"
                >
                  {hour}:00
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {days.map((day) => (
              <tr key={day}>
                <td className="px-2 py-1 text-xs font-medium text-gray-600 dark:text-gray-400">
                  {day}
                </td>
                {hours.map((hour) => {
                  const intensity = cellMap.get(`${day}-${hour}`) ?? 0;
                  return (
                    <td key={`${day}-${hour}`} className="p-0.5">
                      <div
                        className={`mx-auto h-6 w-full min-w-[28px] rounded ${getIntensityColor(intensity)} transition-colors`}
                        title={`${day} ${hour}:00 - ${intensity}% activity`}
                        aria-label={`${day} ${hour}:00 - ${intensity}% activity`}
                      />
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-end gap-2">
          <span className="text-xs text-gray-500 dark:text-gray-400">Less</span>
          <div className="flex gap-1">
            {['bg-gray-100 dark:bg-gray-700', 'bg-blue-100 dark:bg-blue-800', 'bg-blue-300 dark:bg-blue-600', 'bg-blue-500 dark:bg-blue-400', 'bg-blue-700 dark:bg-blue-500'].map(
              (color, i) => (
                <div key={i} className={`h-3 w-3 rounded-sm ${color}`} />
              )
            )}
          </div>
          <span className="text-xs text-gray-500 dark:text-gray-400">More</span>
        </div>
      </div>
    </div>
  );
}
