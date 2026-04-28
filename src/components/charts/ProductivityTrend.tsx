import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

interface ProductivityDataPoint {
  date: string;
  score: number;
  average: number;
}

interface ProductivityTrendProps {
  data: ProductivityDataPoint[];
  height?: number;
}

export function ProductivityTrend({ data, height = 300 }: ProductivityTrendProps) {
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
        Productivity Trend
      </h3>
      <div role="img" aria-label="Line chart showing productivity score trends over time">
        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 12 }}
              className="text-gray-500 dark:text-gray-400"
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12 }}
              className="text-gray-500 dark:text-gray-400"
              label={{ value: 'Score', angle: -90, position: 'insideLeft', fontSize: 12 }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px' }} />
            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ r: 4 }}
              activeDot={{ r: 6 }}
              name="Your Score"
            />
            <Line
              type="monotone"
              dataKey="average"
              stroke="#9ca3af"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Team Average"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
