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