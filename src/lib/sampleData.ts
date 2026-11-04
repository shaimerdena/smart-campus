import type { Room } from "./types";

export const rooms: Room[] = [
  {
    id: "r1",
    name: "Library Study Room A",
    location: "Main Library, Floor 2",
    capacity: 8,
    blocked: false,
    equipment: ["Whiteboard", "Power Outlets", "Wi-Fi"],
    bookings: [
      { id: "b1-1", roomId: "r1", start: 540, end: 600, bookedBy: "A. Patel", purpose: "Group Study" },
      { id: "b1-2", roomId: "r1", start: 780, end: 870, bookedBy: "M. Chen", purpose: "Project Meeting" },
    ],
  },
  {
    id: "r2",
    name: "Engineering Lab 204",
    location: "Thompson Hall, Floor 2",
    capacity: 30,
    blocked: true,
    equipment: ["Computers", "Projector", "Power Outlets"],
    bookings: [
      { id: "b2-1", roomId: "r2", start: 600, end: 720, bookedBy: "Dr. Lee", purpose: "Lab Session" },
    ],
  },
  {
    id: "r3",
    name: "Collaborative Hub 3",
    location: "Innovation Center, Floor 1",
    capacity: 12,
    blocked: false,
    equipment: ["Smart TV", "Whiteboard", "Power Outlets", "Video Conferencing"],
    bookings: [
      { id: "b3-1", roomId: "r3", start: 600, end: 660, bookedBy: "J. Smith", purpose: "Lab Workshop" },
      { id: "b3-2", roomId: "r3", start: 900, end: 960, bookedBy: "R. Gomez", purpose: "Presentation Prep" },
    ],
  },
  {
    id: "r4",
    name: "Seminar Room 110",
    location: "Humanities Building, Floor 1",
    capacity: 20,
    blocked: false,
    equipment: ["Projector", "Whiteboard", "Wi-Fi", "Audio System"],
    bookings: [
      { id: "b4-1", roomId: "r4", start: 660, end: 750, bookedBy: "Prof. Adams", purpose: "Faculty Seminar" },
      { id: "b4-2", roomId: "r4", start: 1020, end: 1080, bookedBy: "K. Wright", purpose: "Guest Lecture" },
    ],
  },
  {
    id: "r5",
    name: "Focus Pod B",
    location: "Quiet Wing, Floor 3",
    capacity: 4,
    blocked: false,
    equipment: ["Power Outlets", "Wi-Fi"],
    bookings: [],
  },
];
