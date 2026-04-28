import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DomainEntry {
  domain: string;
  visits: number;
  duration: number;
}

interface TopDomainsBarProps {
  data: DomainEntry[];
  height?: number;
}

export function TopDomainsBar({ data, height = 300 }: TopDomainsBarProps) {
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
        Top Domains
      </h3>
      <div role="img" aria-label="Bar chart showing top visited domains by number of visits">
        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} layout="vertical" margin={{ left: 40 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-600" />
            <XAxis
              type="number"
              tick={{ fontSize: 12 }}
              className="text-gray-500 dark:text-gray-400"
            />
            <YAxis
              dataKey="domain"
              type="category"
              width={120}
              tick={{ fontSize: 11 }}
              className="text-gray-500 dark:text-gray-400"
            />
            <Tooltip
              contentStyle={{
                borderRadius: '8px',
                border: '1px solid #e5e7eb',
                fontSize: '12px',
              }}
              formatter={(value: number, name: string) => [
                name === 'visits' ? `${value} visits` : `${value} min`,
                name === 'visits' ? 'Visits' : 'Duration',
              ]}
            />
            <Bar dataKey="visits" fill="#3b82f6" radius={[0, 4, 4, 0]} name="visits" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
