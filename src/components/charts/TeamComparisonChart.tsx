import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface TeamComparisonEntry {
  team: string;
  productivity: number;
  activeHours: number;
  idleHours: number;
}

interface TeamComparisonChartProps {
  data: TeamComparisonEntry[];
  height?: number;
}

export function TeamComparisonChart({ data, height = 300 }: TeamComparisonChartProps) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-48 bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed border-gray-300 dark:border-gray-600">
        <p className="text-gray-500 dark:text-gray-400 text-sm">No data available</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      <h3 className="mb-4 text-sm font-semibold text-gray-900 dark:text-white">
        Team Comparison
      </h3>
      <div role="img" aria-label="Grouped bar chart comparing productivity and hours across teams">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} barCategoryGap="20%">
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
            <XAxis
              dataKey="team"
              tick={{ fontSize: 12 }}
              className="text-gray-500 dark:text-gray-400"
            />
            <YAxis
              tick={{ fontSize: 12 }}
              className="text-gray-500 dark:text-gray-400"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Bar
              dataKey="activeHours"
              fill="#3b82f6"
              name="Active Hours"
              radius={[4, 4, 0, 0]}
            />
            <Bar
              dataKey="idleHours"
              fill="#fbbf24"
              name="Idle Hours"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
