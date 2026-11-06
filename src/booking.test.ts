import { describe, it, expect } from "vitest";
import { checkAvailability } from "./lib/availability";
import type { Booking, Room } from "./lib/types";
import { rooms } from "./lib/sampleData";
import { filterRooms } from "./lib/filters";

describe("Task #04 - Automated Regression & Feature Test Suite", () => {
  const dummyRoom: Room = rooms[0]; // Room A (capacity: 8)

  // --- AC Regressions (Time & Duration Rules) ---
  it("T01 (AC1): Should reject booking if start time is after end time", () => {
    const result = checkAvailability("14:00", "12:00", dummyRoom, [], 480);
    expect(result.decision).toBe("unavailable");
    expect(result.reasons).toContain("End time must be later than start time.");
  });

  it("T02 (AC2 Boundary): Exactly 120 minutes should pass", () => {
    const result = checkAvailability("10:00", "12:00", dummyRoom, [], 480);
    expect(result.decision).toBe("available");
  });

  it("T03 (AC2 Boundary): 121 minutes duration should fail", () => {
    const result = checkAvailability("10:00", "12:01", dummyRoom, [], 480);
    expect(result.decision).toBe("unavailable");
  });

  it("T04 (AC4 Boundary): Touching intervals (10:00-11:00 and 11:00-12:00) should be allowed", () => {
    const existingBookings: Booking[] = [
      { id: "b1", roomId: "r1", start: 600, end: 660, bookedBy: "Test", purpose: "Test" } // 10:00 - 11:00
    ];
    const result = checkAvailability("11:00", "12:00", dummyRoom, existingBookings, 480);
    expect(result.decision).toBe("available");
  });

  it("T05 (AC4 Logic): Overlapping time intervals should fail", () => {
    const existingBookings: Booking[] = [
      { id: "b1", roomId: "r1", start: 600, end: 690, bookedBy: "Test", purpose: "Test" } // 10:00 - 11:30
    ];
    const result = checkAvailability("11:00", "12:00", dummyRoom, existingBookings, 480);
    expect(result.decision).toBe("unavailable");
  });

  // --- F1-F5 Filter & UI Rules ---
  it("T06 (F1 Boundary): Room capacity exact match vs insufficient capacity", () => {
    const exactMatch = filterRooms(rooms, { minCapacity: 8, equipment: [] });
    const insufficient = filterRooms(rooms, { minCapacity: 50, equipment: [] });
    
    expect(exactMatch.some((r) => r.id === "r1")).toBe(true);
    expect(insufficient.length).toBe(0);
  });
  
  it("T07 (F2 Rule): Equipment filter must match ALL selected required items", () => {
      const matched = filterRooms(rooms, {
        minCapacity: 0,
        equipment: ["Projector", "Whiteboard"]
      });
      // r4 has both Projector and Whiteboard
      expect(matched.map((r) => r.id)).toContain("r4");
    });

  it("T08 (F3 Rule): Blocked room check triggers blocked reason", () => {
    const blockedRoom = rooms.find((r) => r.id === "r2")!; // Engineering Lab 204
    const result = checkAvailability("14:00", "15:00", blockedRoom, blockedRoom.bookings, 480);
    expect(result.decision).toBe("unavailable");
    expect(result.reasons.some((r) => r.includes("blocked"))).toBe(true);
  });

  it("T09 (F4 Rule): Clear empty state array returned when criteria exceed capacity", () => {
    const emptyResult = filterRooms(rooms, { minCapacity: 100, equipment: [] });
    expect(emptyResult).toHaveLength(0);
  });

  it("T10 (F5 Integration): Room switching isolates availability context between rooms", () => {
    const room1 = rooms[0]; // r1 has booking 540-600 (09:00-10:00)
    const room5 = rooms[4]; // r5 has 0 bookings

    const resRoom1 = checkAvailability("09:00", "10:00", room1, room1.bookings, 480);
    const resRoom5 = checkAvailability("09:00", "10:00", room5, room5.bookings, 480);

    expect(resRoom1.decision).toBe("unavailable");
    expect(resRoom5.decision).toBe("available");
  });
});

describe("Task — AC regression suite (past, reversed, duration, blocked, overlap, touching, fixtures)", () => {
  const openRoom: Room = rooms[0]; // r1, not blocked
  const blockedRoom: Room = rooms.find((r) => r.id === "r2")!; // r2, blocked
  const emptyRoom: Room = rooms.find((r) => r.id === "r5")!; // r5, not blocked, no bookings
  const CURRENT = 540; // 09:00

  // Deep snapshot of fixtures so any mutation is detectable.
  function snapshotRooms() {
    return rooms.map((r) => ({
      id: r.id,
      name: r.name,
      blocked: r.blocked,
      capacity: r.capacity,
      equipment: [...r.equipment],
      bookings: r.bookings.map((b) => ({ ...b })),
    }));
  }

  // Past time — AC1: start must be after currentTime.
  // 08:00–09:00 (480–540) starts at 480, which is NOT > 480, so reject.
  it("R01 (AC1): rejects a start time at or before the current time", () => {
    const result = checkAvailability("08:00", "09:00", openRoom, [], CURRENT);
    expect(result.decision).toBe("unavailable");
    expect(result.reasons.some((r) => r.includes("after the current time"))).toBe(true);
  });

  // Reversed interval — AC1: requires start < end.
  // 14:00–12:00 gives start > end, so reject.
  it("R02 (AC1): rejects a reversed interval where start is after end", () => {
    const result = checkAvailability("14:00", "12:00", openRoom, [], CURRENT);
    expect(result.decision).toBe("unavailable");
    expect(result.reasons).toContain("End time must be later than start time.");
  });

  // 121-minute duration — AC2: duration must be <= 120.
  // 10:00–12:01 is 121 minutes, so reject.
  it("R03 (AC2): rejects a booking one minute over the 120-minute maximum", () => {
    const result = checkAvailability("10:00", "12:01", emptyRoom, [], CURRENT);
    expect(result.decision).toBe("unavailable");
    expect(result.reasons.some((r) => r.includes("120-minute maximum"))).toBe(true);
  });

  // Blocked room — AC3: a blocked room can never be booked.
  // r2 is blocked, so reject regardless of the otherwise-valid interval.
  it("R04 (AC3): rejects any interval when the selected room is blocked", () => {
    const result = checkAvailability("14:00", "15:00", blockedRoom, blockedRoom.bookings, CURRENT);
    expect(result.decision).toBe("unavailable");
    expect(result.reasons.some((r) => r.includes("blocked"))).toBe(true);
  });

  // Overlap — AC4: an interval that intersects an existing booking is rejected.
  // r1 has a booking 09:00–10:00 (540–600); a candidate 09:30–10:30 (570–630)
  // intersects it (570 < 600 && 630 > 540), so reject.
  it("R05 (AC4): rejects an interval that overlaps an existing booking", () => {
    const result = checkAvailability("09:30", "10:30", openRoom, openRoom.bookings, CURRENT);
    expect(result.decision).toBe("unavailable");
    expect(result.reasons.some((r) => r.includes("Overlaps"))).toBe(true);
  });

  // Touching endpoints — AC4: touching is explicitly allowed.
  // r1 has a booking 09:00–10:00 (540–600); a candidate 10:00–11:00 (600–660)
  // touches but does not overlap (start 600 is not < b.end 600), so accept.
  it("R06 (AC4): allows an interval that only touches an existing booking's endpoint", () => {
    const result = checkAvailability("10:00", "11:00", openRoom, openRoom.bookings, CURRENT);
    expect(result.decision).toBe("available");
    expect(result.reasons).toHaveLength(0);
  });

  // Unchanged fixtures — AC5: checking availability must not mutate booking data.
  // Run a rejected check (overlap + over-limit), then confirm the rooms array,
  // every room's fields, and every booking are byte-for-byte unchanged.
  it("R07 (AC5): leaves the fixtures and booking data unchanged after a check", () => {
    const before = snapshotRooms();
    checkAvailability("10:30", "13:30", openRoom, openRoom.bookings, CURRENT);
    const after = snapshotRooms();
    expect(after).toEqual(before);
    // Explicitly confirm no booking was added, removed, or reordered.
    const allBookingsBefore = rooms.flatMap((r) => r.bookings.map((b) => b.id));
    const allBookingsAfter = rooms.flatMap((r) => r.bookings.map((b) => b.id));
    expect(allBookingsAfter).toEqual(allBookingsBefore);
  });
});