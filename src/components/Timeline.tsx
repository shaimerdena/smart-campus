import { useMemo } from "react";
import type { Booking } from "@/lib/types";
import { formatTime, minutesToTime } from "@/lib/availability";

interface Props {
  bookings: Booking[];
  candidateStart: number | null;
  candidateEnd: number | null;
}

const pxPerMinute = 0.55;

export default function Timeline({ bookings, candidateStart, candidateEnd }: Props) {
  const totalWidth = 1440 * pxPerMinute;
  const hours = useMemo(
    () => Array.from({ length: 25 }, (_, i) => i * 60),
    []
  );

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-slate-50/50 p-4">
      <div className="relative" style={{ width: totalWidth, minWidth: "100%" }}>
        {/* Hour grid lines + labels */}
        {hours.map((m) => (
          <div
            key={m}
            className="absolute top-0 bottom-0 border-l border-slate-200"
            style={{ left: m * pxPerMinute }}
          >
            {m % 60 === 0 && (
              <span className="absolute -top-0 -translate-y-full text-[10px] text-slate-400 whitespace-nowrap -translate-x-1/2">
                {minutesToTime(m)}
              </span>
            )}
          </div>
        ))}

        {/* Booking bars */}
        <div className="relative h-14" style={{ marginTop: 18 }}>
          {bookings.map((b) => (
            <div
              key={b.id}
              className="absolute top-0 h-12 rounded-md bg-sky-500/85 px-1.5 py-1 overflow-hidden shadow-sm"
              style={{
                left: b.start * pxPerMinute,
                width: (b.end - b.start) * pxPerMinute,
              }}
              title={`${b.bookedBy} — ${b.purpose}`}
            >
              <p className="text-[10px] font-semibold text-white leading-tight truncate">
                {b.bookedBy}
              </p>
              <p className="text-[9px] text-white/80 leading-tight truncate">
                {formatTime(b.start)} – {formatTime(b.end)}
              </p>
            </div>
          ))}

          {/* Candidate interval marker */}
          {candidateStart !== null && candidateEnd !== null && (
            <div
              className="absolute top-0 h-12 rounded-md border-2 border-dashed border-emerald-500 bg-emerald-400/20 px-1.5 py-1 overflow-hidden"
              style={{
                left: candidateStart * pxPerMinute,
                width: (candidateEnd - candidateStart) * pxPerMinute,
              }}
              title="Requested interval"
            >
              <p className="text-[10px] font-semibold text-emerald-700 leading-tight truncate">
                Requested
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
