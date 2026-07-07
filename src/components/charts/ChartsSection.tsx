import { useMemo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut, Bar, Line } from 'react-chartjs-2';
import { Card, CardHeader, CardBody } from '../ui/Primitives';
import { useAppStore } from '../../store/useAppStore';
import { FORMAT_LABELS } from '../../utils/format';

ChartJS.register(ArcElement, BarElement, CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const PALETTE = ['#2563EB', '#3B82F6', '#22C55E', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4', '#F472B6'];

export function ChartsSection() {
  const results = useAppStore((s) => s.results);
  const cameraResults = useAppStore((s) => s.cameraResults);
  const files = useAppStore((s) => s.files);
  const all = useMemo(() => [...results, ...cameraResults], [results, cameraResults]);

  const distribution = useMemo(() => {
    const counts: Record<string, number> = {};
    all.forEach((r) => {
      const label = FORMAT_LABELS[r.format] ?? r.format;
      counts[label] = (counts[label] ?? 0) + 1;
    });
    return counts;
  }, [all]);

  const perFile = useMemo(() => {
    const counts: Record<string, number> = {};
    files
      .filter((f) => f.status === 'done')
      .forEach((f) => {
        counts[f.name] = f.results.length;
      });
    return counts;
  }, [files]);

  const confidenceTrend = useMemo(() => {
    const sorted = [...all].sort((a, b) => a.timestamp - b.timestamp);
    const map: Record<ConfidenceLevelKey, number> = { high: 3, medium: 2, low: 1 };
    return sorted.slice(-20).map((r, i) => ({ x: i + 1, y: map[r.confidence] }));
  }, [all]);

  const hasData = all.length > 0;

  return (
    <section className="grid lg:grid-cols-3 gap-5">
      <Card>
        <CardHeader>
          <h3 className="font-semibold">Format distribution</h3>
        </CardHeader>
        <CardBody className="h-64 flex items-center justify-center">
          {hasData ? (
            <Doughnut
              data={{
                labels: Object.keys(distribution),
                datasets: [{ data: Object.values(distribution), backgroundColor: PALETTE, borderWidth: 0 }],
              }}
              options={{ plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 11 } } } }, maintainAspectRatio: false }}
            />
          ) : (
            <EmptyChart />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Barcodes by file</h3>
        </CardHeader>
        <CardBody className="h-64">
          {Object.keys(perFile).length > 0 ? (
            <Bar
              data={{
                labels: Object.keys(perFile).map((n) => (n.length > 12 ? n.slice(0, 12) + '\u2026' : n)),
                datasets: [{ data: Object.values(perFile), backgroundColor: '#2563EB', borderRadius: 6, maxBarThickness: 28 }],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: { y: { beginAtZero: true, ticks: { precision: 0 } } },
                maintainAspectRatio: false,
              }}
            />
          ) : (
            <EmptyChart />
          )}
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="font-semibold">Confidence trend</h3>
        </CardHeader>
        <CardBody className="h-64">
          {confidenceTrend.length > 1 ? (
            <Line
              data={{
                labels: confidenceTrend.map((p) => p.x),
                datasets: [
                  {
                    data: confidenceTrend.map((p) => p.y),
                    borderColor: '#22C55E',
                    backgroundColor: 'rgba(34,197,94,0.12)',
                    fill: true,
                    tension: 0.35,
                    pointRadius: 2,
                  },
                ],
              }}
              options={{
                plugins: { legend: { display: false } },
                scales: {
                  y: {
                    min: 0,
                    max: 4,
                    ticks: {
                      stepSize: 1,
                      callback: (v) => ({ 1: 'Low', 2: 'Med', 3: 'High' } as any)[v as number] ?? '',
                    },
                  },
                },
                maintainAspectRatio: false,
              }}
            />
          ) : (
            <EmptyChart />
          )}
        </CardBody>
      </Card>
    </section>
  );
}

type ConfidenceLevelKey = 'high' | 'medium' | 'low';

function EmptyChart() {
  return <p className="text-sm text-[var(--color-muted)] m-auto">Charts populate once scans complete.</p>;
}
