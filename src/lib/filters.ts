import type { Room } from "./types";

export interface FilterCriteria {
  minCapacity: number;
  equipment: string[];
}

/**
 * Pure room filtering (F1–F2).
 * F1: capacity >= minCapacity
 * F2: room must contain ALL selected equipment tags
 */
export function filterRooms(catalog: Room[], criteria: FilterCriteria): Room[] {
  return catalog.filter((room) => {
    if (room.capacity < criteria.minCapacity) return false;
    if (
      criteria.equipment.length > 0 &&
      !criteria.equipment.every((eq) => room.equipment.includes(eq))
    ) {
      return false;
    }
    return true;
  });
}
