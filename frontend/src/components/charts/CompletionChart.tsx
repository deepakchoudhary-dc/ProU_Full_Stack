import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import { statsService } from '../../services/stats';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const movingAverage = (data: number[], windowSize = 7) => {
  const result: number[] = [];
  for (let i = 0; i < data.length; i++) {
    const start = Math.max(0, i - windowSize + 1);
    const window = data.slice(start, i + 1);
    const avg = window.reduce((a, b) => a + b, 0) / window.length;
    result.push(Number(avg.toFixed(2)));
  }
  return result;
};

const CompletionChart = ({ days = 30 }: { days?: number }) => {
  const { data } = useQuery({
    queryKey: ['productivity', days],
    queryFn: () => statsService.getProductivityStats(days),
  });

  const chartData = useMemo(() => {
    const labels = (data?.productivity || []).map((p: any) => p.date);
    const counts = (data?.productivity || []).map((p: any) => p.count);
    const avg = movingAverage(counts, 7);

    return {
      labels,
      datasets: [
        {
          label: 'Tasks Completed',
          data: counts,
          borderColor: 'rgba(59,130,246,1)',
          backgroundColor: 'rgba(59,130,246,0.12)',
          tension: 0.2,
          fill: true,
        },
        {
          label: '7-day Avg',
          data: avg,
          borderColor: 'rgba(16,185,129,1)',
          backgroundColor: 'rgba(16,185,129,0.08)',
          tension: 0.3,
          borderDash: [6, 4],
          fill: false,
        },
      ],
    };
  }, [data]);

  const options = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      tooltip: { mode: 'index' as const, intersect: false },
    },
    interaction: { mode: 'nearest' as const, axis: 'x' as const, intersect: false },
    scales: {
      x: { display: true },
      y: { display: true, beginAtZero: true },
    },
  }), []);

  return (
    <div className="h-64">
      <Line options={options} data={chartData} />
    </div>
  );
};

export default CompletionChart;
