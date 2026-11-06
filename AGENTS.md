# AGENTS.md — Agent Guidelines & Project Context

## Project Overview
Smart Campus Room Availability & Filtering System. A frontend single-page application for searching, filtering, and validating campus room availability built with React, TypeScript, Vite, and Tailwind CSS.

## System Architecture & Data Flow
- **`src/lib/types.ts`**: Core interfaces (`Room`, `Booking`, `AvailabilityResult`) and domain constants (`MAX_BOOKING_MINUTES`, `MINUTES_PER_DAY`).
- **`src/lib/sampleData.ts`**: Fixture dataset containing 5 rooms with embedded booking arrays.
- **`src/lib/availability.ts`**: Pure domain validation function `checkAvailability()` executing rules AC1–AC6.
- **`src/lib/filters.ts`**: Pure filtering utility `filterRooms()` shared between UI and test suites (F1–F4).
- **`src/App.tsx`**: Main UI container managing layout state, filter parameters, and selected room timeline.
- **`src/booking.test.ts`**: Automated Vitest suite (10 test cases) verifying regression and boundary rules.

## Core Constraints & Business Rules
1. **Validation Limits (AC1–AC6):**
   - Time bounds: $0 \le \text{start} < \text{end} \le 1440$ minutes, $\text{start} > \text{currentTime}$.
   - Duration limit: $\text{duration} \le 120$ minutes.
   - Blocked check: Blocked facilities (`room.blocked === true`) cannot be booked.
   - Overlap detection: Interval intersections ($start < b.end \land end > b.start$) trigger conflict. Touching boundaries ($10:00\text{--}11:00$ and $11:00\text{--}12:00$) are allowed.
2. **Filtering Rules (F1–F5):**
   - F1: Capacity filter must enforce $\text{capacity} \ge \text{minCapacity}$.
   - F2: Equipment filter must check that room equipment contains **all** selected required tags.
   - F3/F4: UI state must handle blocked flags and display empty-state fallbacks gracefully.
   - F5: Room selection must completely isolate booking context.

## Refactoring & Code Quality Guidelines
- **Single Source of Truth:** Never duplicate domain rules or filtering logic inside component files or test setup helpers. Import directly from `src/lib/`.
- **Pure Functions:** Business rules and criteria logic must remain framework-agnostic pure functions returning immutable decision payloads (`{ decision, reasons }`).
- **Data Integrity:** Do not mutate mock fixtures (`rooms` array) during availability evaluations or UI rendering.

## Verification Workflow
- All code changes must pass the automated Vitest test suite:
  ```bash
  npx vitest run