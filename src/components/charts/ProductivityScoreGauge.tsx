import { useMemo } from 'react';

interface ProductivityScoreGaugeProps {
  score: number;
  size?: number;
  label?: string;
}

function getScoreColor(score: number): string {
  if (score >= 80) return '#22c55e';
  if (score >= 60) return '#3b82f6';
  if (score >= 40) return '#f59e0b';
  return '#ef4444';
}

function getScoreLabel(score: number): string {
  if (score >= 80) return 'Excellent';
  if (score >= 60) return 'Good';
  if (score >= 40) return 'Fair';
  return 'Needs Improvement';
}

export function ProductivityScoreGauge({
  score,
  size = 200,
  label,
}: ProductivityScoreGaugeProps) {
  const clampedScore = useMemo(
    () => Math.min(100, Math.max(0, score)),
    [score]
  );

  const color = useMemo(() => getScoreColor(clampedScore), [clampedScore]);
  const scoreLabel = useMemo(() => getScoreLabel(clampedScore), [clampedScore]);

  const radius = (size - 20) / 2;
  const circumference = 2 * Math.PI * radius;
  const arcLength = circumference * 0.75;
  const filledLength = arcLength * (clampedScore / 100);
  const center = size / 2;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
      {label && (
        <h3 className="mb-2 text-sm font-semibold text-gray-900 dark:text-white">
          {label}
        </h3>
      )}
      <div
        className="flex flex-col items-center"
        role="img"
        aria-label={`Productivity score: ${clampedScore} out of 100 - ${scoreLabel}`}
      >
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Background arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke="currentColor"
            strokeWidth={12}
            strokeDasharray={`${arcLength} ${circumference - arcLength}`}
            strokeDashoffset={-circumference * 0.125}
            strokeLinecap="round"
            className="text-gray-200 dark:text-gray-600"
            transform={`rotate(135, ${center}, ${center})`}
          />
          {/* Filled arc */}
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth={12}
            strokeDasharray={`${filledLength} ${circumference - filledLength}`}
            strokeDashoffset={-circumference * 0.125}
            strokeLinecap="round"
            transform={`rotate(135, ${center}, ${center})`}
            className="transition-all duration-700 ease-out"
          />
          {/* Score text */}
          <text
            x={center}
            y={center - 8}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-900 text-3xl font-bold dark:fill-white"
            fontSize={size * 0.18}
            fontWeight={700}
          >
            {clampedScore}
          </text>
          <text
            x={center}
            y={center + size * 0.1}
            textAnchor="middle"
            dominantBaseline="central"
            className="fill-gray-500 dark:fill-gray-400"
            fontSize={size * 0.07}
          >
            {scoreLabel}
          </text>
        </svg>
      </div>
    </div>
  );
}
