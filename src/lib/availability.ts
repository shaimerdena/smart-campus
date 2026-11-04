import type { AvailabilityResult, Booking, Room } from "./types";
import { MAX_BOOKING_MINUTES, MINUTES_PER_DAY } from "./types";

const fmtTime = (mins: number): string => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  const ampm = h < 12 ? "AM" : "PM";
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${m.toString().padStart(2, "0")} ${ampm}`;
};

export function formatTime(mins: number): string {
  return fmtTime(mins);
}

export function timeToMinutes(timeStr: string): number {
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + m;
}

export function minutesToTime(mins: number): string {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
}

/**
 * Checks whether a candidate interval is valid and available.
 * AC1: 0 ≤ start < end ≤ 1440, start > currentTime
 * AC2: duration ≤ 120 min
 * AC3: room must not be blocked
 * AC4: no overlap with existing bookings (touching allowed)
 * AC5: returns decision without modifying booking data
 */
export function checkAvailability(
  startStr: string,
  endStr: string,
  room: Room,
  roomBookings: Booking[],
  currentTime: number
): AvailabilityResult {
  const reasons: string[] = [];
  const start = timeToMinutes(startStr);
  const end = timeToMinutes(endStr);

  // AC1: validate interval bounds
  if (start < 0 || end > MINUTES_PER_DAY) {
    reasons.push("Times must be between 12:00 AM and 11:59 PM.");
  }
  if (start >= end) {
    reasons.push("End time must be later than start time.");
  }
  if (start <= currentTime) {
    reasons.push(`Start time must be after the current time (${fmtTime(currentTime)}).`);
  }

  // AC2: duration check
  const duration = end - start;
  if (duration > MAX_BOOKING_MINUTES) {
    reasons.push(
      `Booking exceeds the 120-minute maximum (requested ${duration} min).`
    );
  }

  // AC3: blocked room check
  if (room.blocked) {
    reasons.push(`This room is currently blocked and cannot be booked.`);
  }

  // AC4: overlap check (touching endpoints allowed)
  const overlapping = roomBookings.filter(
    (b) => start < b.end && end > b.start
  );
  if (overlapping.length > 0) {
    const first = overlapping[0];
    reasons.push(
      `Overlaps an existing booking (${fmtTime(first.start)} – ${fmtTime(first.end)}).`
    );
  }

  const decision = reasons.length === 0 ? "available" : "unavailable";
  return { decision, reasons };
}
