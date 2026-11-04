import { useState, useMemo, useEffect } from "react";
import {
  Clock,
  MapPin,
  Users,
  Building2,
  Search,
  CalendarClock,
  AlertCircle,
  Check,
  Filter,
  X,
  Ban,
} from "lucide-react";
import { rooms } from "@/lib/sampleData";
import type { AvailabilityResult } from "@/lib/types";
import {
  checkAvailability,
  timeToMinutes,
  formatTime,
} from "@/lib/availability";
import Timeline from "@/components/Timeline";
import ResultBanner from "@/components/ResultBanner";

const ALL_EQUIPMENT = Array.from(
  new Set(rooms.flatMap((r) => r.equipment))
).sort();

export default function App() {
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0].id);
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");
  const [result, setResult] = useState<AvailabilityResult | null>(null);
  const [hasChecked, setHasChecked] = useState(false);

  // Filters
  const [minCapacity, setMinCapacity] = useState<number>(0);
  const [requiredEquipment, setRequiredEquipment] = useState<string[]>([]);

  // Simulated "current time" — 9:00 AM (540 min)
  const currentTime = 540;

  const [liveClock, setLiveClock] = useState(() => {
    const now = new Date();
    return now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
  });
  useEffect(() => {
    const t = setInterval(() => {
      const now = new Date();
      setLiveClock(now.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }));
    }, 1000);
    return () => clearInterval(t);
  }, []);

  const filteredRooms = useMemo(
    () =>
      rooms.filter((room) => {
        if (room.capacity < minCapacity) return false;
        if (requiredEquipment.length > 0) {
          const hasAll = requiredEquipment.every((e) => room.equipment.includes(e));
          if (!hasAll) return false;
        }
        return true;
      }),
    [minCapacity, requiredEquipment]
  );

  const noVisibleRooms = filteredRooms.length === 0;
  const selectedRoomVisible = filteredRooms.some((r) => r.id === selectedRoomId);

  const selectedRoom = useMemo(
    () => rooms.find((r) => r.id === selectedRoomId)!,
    [selectedRoomId]
  );

  // Clear any stale availability result when filters change so it never
  // shows for a room that is now hidden.
  useEffect(() => {
    setResult(null);
    setHasChecked(false);
  }, [minCapacity, requiredEquipment]);

  const roomBookings = useMemo(() => selectedRoom.bookings, [selectedRoom]);

  const candidateStart = hasChecked ? timeToMinutes(startTime) : null;
  const candidateEnd = hasChecked ? timeToMinutes(endTime) : null;

  const handleSelectRoom = (id: string) => {
    setSelectedRoomId(id);
    setResult(null);
    setHasChecked(false);
  };

  const handleCheck = () => {
    const res = checkAvailability(startTime, endTime, selectedRoom, roomBookings, currentTime);
    setResult(res);
    setHasChecked(true);
  };

  const handleReset = () => {
    setResult(null);
    setHasChecked(false);
  };

  const toggleEquipment = (item: string) => {
    setRequiredEquipment((prev) =>
      prev.includes(item) ? prev.filter((e) => e !== item) : [...prev, item]
    );
  };

  const clearFilters = () => {
    setMinCapacity(0);
    setRequiredEquipment([]);
  };

  const hasActiveFilters = minCapacity > 0 || requiredEquipment.length > 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-3xl px-4 py-5 sm:px-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
              <CalendarClock className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-900 sm:text-xl">
                Smart Campus Room Availability
              </h1>
              <p className="text-sm text-slate-500">
                Check if a study room is free for your time slot
              </p>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-400">
            <Clock className="h-3.5 w-3.5" />
            <span>Simulated current time: {formatTime(currentTime)} · Real clock: {liveClock}</span>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-8">
        <div className="space-y-6">
          {/* Filters + Room List */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
              <Building2 className="h-4 w-4 text-sky-600" />
              Select a Room
            </h2>

            {/* F1 + F2: Filters */}
            <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Filter className="h-3.5 w-3.5" /> Filters
                </span>
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="flex items-center gap-1 text-xs font-medium text-sky-600 hover:text-sky-700"
                  >
                    <X className="h-3 w-3" /> Clear all
                  </button>
                )}
              </div>

              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                {/* F1: Minimum capacity */}
                <div>
                  <label className="block">
                    <span className="text-xs font-medium text-slate-500">
                      Min. Capacity (attendees)
                    </span>
                    <input
                      type="number"
                      min={0}
                      value={minCapacity === 0 ? "" : minCapacity}
                      placeholder="Any"
                      onChange={(e) => {
                        const v = parseInt(e.target.value, 10);
                        setMinCapacity(Number.isNaN(v) || v < 0 ? 0 : v);
                      }}
                      className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                    />
                  </label>
                </div>

                {/* F2: Required equipment */}
                <div>
                  <span className="text-xs font-medium text-slate-500">
                    Required Equipment
                  </span>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {ALL_EQUIPMENT.map((item) => {
                      const active = requiredEquipment.includes(item);
                      return (
                        <button
                          key={item}
                          onClick={() => toggleEquipment(item)}
                          className={`rounded-full border px-2.5 py-1 text-xs font-medium transition-colors ${
                            active
                              ? "border-sky-500 bg-sky-50 text-sky-700"
                              : "border-slate-200 bg-white text-slate-500 hover:border-slate-300 hover:bg-slate-50"
                          }`}
                        >
                          {active && <Check className="mr-0.5 inline h-3 w-3" />}
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Vertical room list */}
            <div className="mt-4 space-y-2.5">
              {filteredRooms.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center">
                  <Ban className="mx-auto h-6 w-6 text-slate-300" />
                  <p className="mt-2 text-sm font-medium text-slate-500">
                    No rooms match your filters
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Try lowering the capacity or removing equipment requirements.
                  </p>
                </div>
              ) : (
                filteredRooms.map((room) => {
                  const active = room.id === selectedRoomId;
                  return (
                    <button
                      key={room.id}
                      onClick={() => handleSelectRoom(room.id)}
                      className={`w-full text-left rounded-xl border p-4 transition-all ${
                        active
                          ? "border-sky-500 ring-2 ring-sky-500/20 bg-sky-50"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-semibold text-slate-800 leading-tight">
                              {room.name}
                            </p>
                            {active && (
                              <span className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-sky-600">
                                <Check className="h-2.5 w-2.5 text-white" />
                              </span>
                            )}
                          </div>
                          <p className="mt-1 flex items-center gap-1 text-xs text-slate-400">
                            <MapPin className="h-3 w-3" /> {room.location}
                          </p>
                        </div>

                        {/* Badges */}
                        <div className="flex flex-shrink-0 flex-wrap items-center justify-end gap-1.5">
                          <span className="inline-flex items-center gap-0.5 rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-600">
                            <Users className="h-3 w-3" /> {room.capacity} seats
                          </span>
                          {room.blocked ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-rose-100 px-2 py-0.5 text-[11px] font-medium text-rose-600">
                              <AlertCircle className="h-3 w-3" /> Blocked
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-medium text-emerald-600">
                              <Check className="h-3 w-3" /> Open
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Equipment badges */}
                      <div className="mt-2.5 flex flex-wrap gap-1.5">
                        {room.equipment.map((eq) => (
                          <span
                            key={eq}
                            className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-500"
                          >
                            {eq}
                          </span>
                        ))}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </section>

          {/* Time Selection — requires a visible, non-blocked room */}
          {!selectedRoomVisible ? (
            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-amber-800">
                    Select a room to check availability
                  </h2>
                  <p className="mt-1 text-sm text-amber-700">
                    {noVisibleRooms
                      ? "No rooms match your current filters. Adjust the filters above to see rooms, then select one to check availability."
                      : "The currently selected room is hidden by your filters. Select a visible room from the list above to check availability."}
                  </p>
                </div>
              </div>
            </section>
          ) : selectedRoom.blocked ? (
            <section className="rounded-2xl border border-rose-200 bg-rose-50 p-5 shadow-sm sm:p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 flex-shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <h2 className="text-sm font-semibold text-rose-800">
                    Room Blocked / Unavailable
                  </h2>
                  <p className="mt-1 text-sm text-rose-700">
                    This room is currently blocked and cannot be booked. Please select a different room to check availability.
                  </p>
                </div>
              </div>
            </section>
          ) : (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
                <Clock className="h-4 w-4 text-sky-600" />
                Pick a Time Slot
              </h2>
              <div className="mt-3 grid gap-4 sm:grid-cols-2">
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">Start Time</span>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => {
                      setStartTime(e.target.value);
                      handleReset();
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                  />
                </label>
                <label className="block">
                  <span className="text-xs font-medium text-slate-500">End Time</span>
                  <input
                    type="time"
                    value={endTime}
                    onChange={(e) => {
                      setEndTime(e.target.value);
                      handleReset();
                    }}
                    className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20 focus:outline-none"
                  />
                </label>
              </div>
              <p className="mt-2 text-xs text-slate-400">
                Max booking length: 120 minutes. Touching bookings are allowed (e.g., 10:00–11:00 and 11:00–12:00).
              </p>

              <div className="mt-4 flex gap-3">
                <button
                  onClick={handleCheck}
                  className="flex items-center gap-2 rounded-lg bg-sky-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-sky-700 active:bg-sky-800"
                >
                  <Search className="h-4 w-4" />
                  Check Availability
                </button>
                {hasChecked && (
                  <button
                    onClick={handleReset}
                    className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                  >
                    Reset
                  </button>
                )}
              </div>
            </section>
          )}

          {/* Result — only shown for visible, non-blocked rooms */}
          {hasChecked && result && selectedRoomVisible && !selectedRoom.blocked && (
            <ResultBanner result={result} />
          )}

          {/* Timeline */}
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-700">
                Today's Schedule — {selectedRoomVisible ? selectedRoom.name : "No room selected"}
              </h2>
              {selectedRoomVisible && !selectedRoom.blocked && (
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <span className="h-2.5 w-2.5 rounded-sm bg-sky-500/85" /> Booked
                  </span>
                  {candidateStart !== null && (
                    <span className="flex items-center gap-1">
                      <span className="h-2.5 w-2.5 rounded-sm border-2 border-dashed border-emerald-500 bg-emerald-400/20" /> Requested
                    </span>
                  )}
                </div>
              )}
            </div>
            {!selectedRoomVisible ? (
              <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-amber-300 bg-amber-50/60 py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-100">
                  <AlertCircle className="h-5 w-5 text-amber-500" />
                </div>
                <p className="mt-3 text-sm font-semibold text-amber-700">
                  Schedule is unavailable until you select a visible room.
                </p>
                <p className="mt-1 text-xs text-amber-400">
                  Choose a room from the list above to view its schedule.
                </p>
              </div>
            ) : selectedRoom.blocked ? (
              <div className="mt-4 flex flex-col items-center justify-center rounded-xl border border-dashed border-rose-300 bg-rose-50/60 py-12 text-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-rose-100">
                  <Ban className="h-5 w-5 text-rose-500" />
                </div>
                <p className="mt-3 text-sm font-semibold text-rose-700">
                  Schedule display is disabled because this room is currently blocked.
                </p>
                <p className="mt-1 text-xs text-rose-400">
                  Booking information is hidden while the room is unavailable.
                </p>
              </div>
            ) : roomBookings.length === 0 ? (
              <p className="mt-4 text-sm text-slate-400">No existing bookings for this room.</p>
            ) : (
              <div className="mt-6">
                <Timeline
                  bookings={roomBookings}
                  candidateStart={candidateStart}
                  candidateEnd={candidateEnd}
                />
              </div>
            )}
          </section>

          {/* Room details — only for a visible room */}
          {selectedRoomVisible && (
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-sm font-semibold text-slate-700">Room Details</h2>
              <dl className="mt-3 grid gap-3 sm:grid-cols-3">
                <div>
                  <dt className="text-xs text-slate-400">Location</dt>
                  <dd className="text-sm font-medium text-slate-700">{selectedRoom.location}</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Capacity</dt>
                  <dd className="text-sm font-medium text-slate-700">{selectedRoom.capacity} seats</dd>
                </div>
                <div>
                  <dt className="text-xs text-slate-400">Status</dt>
                  <dd className="text-sm font-medium">
                    {selectedRoom.blocked ? (
                      <span className="text-rose-600">Blocked</span>
                    ) : (
                      <span className="text-emerald-600">Open</span>
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-3">
                <dt className="text-xs text-slate-400">Equipment</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {selectedRoom.equipment.map((f) => (
                    <span
                      key={f}
                      className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600"
                    >
                      {f}
                    </span>
                  ))}
                </dd>
              </div>
            </section>
          )}
        </div>

        <p className="mt-8 text-center text-xs text-slate-400">
          Fictional data for prototype use only. This checker does not save or confirm bookings.
        </p>
      </main>
    </div>
  );
}
