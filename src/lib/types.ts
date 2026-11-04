export interface Room {
  id: string;
  name: string;
  location: string;
  capacity: number;
  blocked: boolean;
  equipment: string[];
  bookings: Booking[];
}

export interface Booking {
  id: string;
  roomId: string;
  start: number;
  end: number;
  bookedBy: string;
  purpose: string;
}

export interface AvailabilityResult {
  decision: "available" | "unavailable";
  reasons: string[];
}

export const MINUTES_PER_DAY = 1440;
export const MAX_BOOKING_MINUTES = 120;
