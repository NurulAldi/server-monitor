"use client";
import React from 'react';
import useSWR from 'swr';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fetcher = (url: string) => fetch(url).then((r) => r.json());

type Metric = 'cpu' | 'mem' | 'disk' | 'suhu';

type Props = {
  title: string;
  metric: Metric;
  color: string;
  yDomain: [number, number];
  unit?: string;
  windowSize?: number; // number of visible points (sliding window)
  fetchLimit?: number; // how many points to request from server (defaults to windowSize)
};

function MetricChartComponent({ title, metric, color, yDomain, unit = '', windowSize = 30, fetchLimit }: Props) {
  const limit = fetchLimit ?? windowSize;
  const { data } = useSWR(`/api/server-status/history?limit=${limit}&metric=${metric}`, fetcher, {
    refreshInterval: 3000,
    revalidateOnFocus: true,
  });

  // Local sliding window state. Store raw timestamp (t) for reliable comparisons
  const [points, setPoints] = React.useState<{ t: number; label: string; value: number }[]>([]);
  const lastTRef = React.useRef<number | null>(null);

  // Initialize or append new points when `data` updates from SWR
  React.useEffect(() => {
    if (!data?.data) return;
    // server returns [{ waktu: number, value: number }, ...]
    const server: { waktu: number; value: number }[] = data.data;
    if (!server.length) return;

    const lastServerT = server[server.length - 1].waktu;

    // If not initialized yet, seed last `windowSize` points
    if (lastTRef.current === null) {
      const seed = server
        .slice(-windowSize)
        .map((d) => ({ t: d.waktu, label: new Date(d.waktu).toLocaleTimeString(), value: +(d.value ?? 0).toFixed(1) }));
      setPoints(seed);
      lastTRef.current = lastServerT;
      return;
    }

    // If there are new items since last seen timestamp, append them in order
    if (lastServerT > (lastTRef.current ?? 0)) {
      // find all new items
      const newItems = server.filter((d) => d.waktu > (lastTRef.current ?? 0));
      if (!newItems.length) return;

      setPoints((prev) => {
        let copy = prev.slice();
        newItems.forEach((d) => {
          const item = { t: d.waktu, label: new Date(d.waktu).toLocaleTimeString(), value: +(d.value ?? 0).toFixed(1) };
          if (copy.length >= windowSize) copy = copy.slice(1);
          copy = copy.concat(item); // slice+concat pattern
        });
        return copy;
      });

      lastTRef.current = lastServerT;
    }
  }, [data, windowSize]);

  // Memoize chart data for rendering
  const chartData = React.useMemo(() => points.map((p) => ({ waktu: p.label, value: p.value })), [points]);

  return (
    <div className="bg-slate-800/30 border border-white/5 shadow-md rounded-xl p-4 h-full">
      <div className="text-xs font-semibold text-white mb-2">{title}</div>

      {/* Clipping container: prevents abrupt disappearance of points on the left */}
      <div className="w-full h-[260px] overflow-hidden">
        <ResponsiveContainer>
          <LineChart data={chartData} className="transition-transform duration-500 ease-linear">
            <XAxis dataKey="waktu" tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <YAxis domain={yDomain} tick={{ fontSize: 11, fill: '#94a3b8' }} />
            <Tooltip
              formatter={(value: any) => `${value}${unit}`}
              contentStyle={{
                backgroundColor: 'rgba(15,23,42,0.95)',
                border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 8,
                padding: 8,
                color: '#fff',
                boxShadow: '0 6px 20px rgba(2,6,23,0.6)'
              }}
              labelStyle={{ color: '#94a3b8', fontSize: 12 }}
              itemStyle={{ color: '#fff', fontWeight: 600 }}
              cursor={{ stroke: '#334155', strokeWidth: 1 }}
            />
            {/* Disable Recharts default animation which redraws the line; we use sliding-window update instead */}
            <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={false} isAnimationActive={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

// Use memo to avoid rerenders when unrelated props change
export default React.memo(MetricChartComponent, (prev, next) => {
  return (
    prev.metric === next.metric &&
    prev.color === next.color &&
    prev.windowSize === next.windowSize &&
    prev.unit === next.unit &&
    prev.yDomain[0] === next.yDomain[0] &&
    prev.yDomain[1] === next.yDomain[1]
  );
});
