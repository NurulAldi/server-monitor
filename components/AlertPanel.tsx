"use client";
import React from "react";
import { Bell, Cpu, Thermometer, Zap } from "lucide-react";

export type AlertItem = {
  pesan: string;
  waktu: string; // ISO
};

type AlertSegment = {
  key: string;
  label: string;
  short: string;
  severity: "info" | "warning" | "critical";
};

type Props = {
  alerts: AlertItem[];
};

function parseSegments(pesan: string): AlertSegment[] {
  // pesan may contain multiple segments separated by ';'
  return pesan.split(";").map((seg) => {
    const s = seg.trim();
    // Detect CPU
    if (/cpu/i.test(s)) {
      const m = s.match(/([0-9]+\.?[0-9]*)%/);
      const val = m ? `${m[1]}%` : "";
      return { key: s, label: "CPU", short: `High (${val})`, severity: "warning" as const };
    }
    // Detect suhu / temperature
    if (/suhu|temperature|temp/i.test(s)) {
      const m = s.match(/([0-9]+\.?[0-9]*)(°?C)?/i);
      const val = m ? `${m[1]}°C` : "";
      return { key: s, label: "Temp", short: `High (${val})`, severity: "critical" as const };
    }
    // Fallback generic
    return { key: s, label: "Alert", short: s, severity: "info" as const };
  });
}

export default function AlertPanel({ alerts }: Props) {
  // Expand grouped messages into flattened list with timestamps
  const items = alerts.flatMap((a) => {
    const segments = parseSegments(a.pesan);
    const time = a.waktu;
    return segments.map((seg) => ({ ...seg, waktu: time }));
  });

  const formatTime = (iso?: string) => {
    try {
      const d = new Date(iso ?? "");
      return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    } catch (err) {
      return "";
    }
  };

  const iconFor = (severity: AlertSegment["severity"], label: string) => {
    const classes = "w-4 h-4 text-white";
    if (label === "CPU") return <Cpu className={classes} />;
    if (label === "Temp") return <Thermometer className={classes} />;
    return <Zap className={classes} />;
  };

  const bgFor = (severity: AlertSegment["severity"]) => {
    if (severity === "critical") return "bg-red-500";
    if (severity === "warning") return "bg-orange-500";
    return "bg-slate-400";
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-3">
      <div className="flex items-center gap-3">
        <div className="p-1 rounded-md bg-amber-100 text-amber-700">
          <Bell className="w-4 h-4" />
        </div>
        <h3 className="text-sm font-medium text-slate-600">Recent Alerts</h3>
      </div>

      <div className="mt-3 h-56 overflow-y-auto divide-y divide-slate-100 pr-2">
        {items.length === 0 && (
          <div className="text-sm text-slate-500 py-4">No alerts</div>
        )}

        {items.map((it, idx) => (
          <div key={`${it.key}-${idx}`} className="flex items-center gap-3 py-2 text-sm">
            <div className={`inline-flex items-center justify-center w-7 h-7 rounded-md ${bgFor(it.severity)}`}>
              {iconFor(it.severity, it.label)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="font-medium text-slate-800 truncate">
                {it.label}: <span className="font-normal text-slate-600">{it.short}</span>
              </div>
            </div>

            <div className="text-xs text-slate-400">{formatTime(it.waktu)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
