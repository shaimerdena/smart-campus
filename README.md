# Smart Campus — Room Availability & Booking System

A lightweight, high-performance web application designed for campus room discovery, filtering, and availability validation. Built with React, TypeScript, Vite, and Tailwind CSS.

---

## Features
- **5-Room Interactive Catalog:** Displays room details including location, seating capacity, equipment badges, and status indicators.
- **Dynamic Filtering (F1–F4):** Filter rooms by minimum attendee capacity and multi-equipment criteria with graceful empty-state handling.
- **Availability Validation Engine (AC1–AC6):** Real-time time interval verification, duration limit checks ($\le 120$ minutes), blocked facility locks, and overlap detection.
- **Interactive Schedule Timeline (F5):** Live schedule rendering for the selected room with strict state isolation.

---

## Project Setup & Installation

### Prerequisites
Ensure you have **Node.js** (v18 or higher) and **npm** installed on your system.

1. Clone the repository or extract the project files:
   ```bash
   git clone <your-repository-url>
   cd smart-campus
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
## Development Server
To start the local development server:
```bash
npm run dev
```
Open your browser at http://localhost:5173.
## Running Automated Tests
To run the Vitest test suite (10 automated unit & integration tests):
```bash
npx vitest run
```
