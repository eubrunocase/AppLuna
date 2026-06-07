import { ReservationStatus, SpaceType } from './enums';

/**
 * IMPORTANT: backend JSON keys are `date` + `space` (not `spaceId`).
 * The docs are misleading — the Spring DTO uses `@JsonProperty("space")`.
 */
export interface ReservationCreateDTO {
  date: string;
  space: number;
}

/**
 * IMPORTANT: backend JSON keys are `user`, `date`, `space` (not userId/spaceId).
 * Used for `PUT /reservation/{id}`.
 */
export interface ReservationRequestDTO {
  user: string;
  date: string;
  space: number;
}

export interface SpaceInfo {
  id: number;
  type: SpaceType | string;
}

/**
 * The nested user inside a ReservationResponseDTO only contains
 * `id`, `name`, `email` — there is NO apartment field.
 */
export interface ReservationResponseUserSummary {
  id: string;
  name: string;
  email: string;
}

export interface ReservationResponseDTO {
  id: string;
  date: string;
  user: ReservationResponseUserSummary;
  space: SpaceInfo;
  status: ReservationStatus;
  createdAt: string;
  canceledAt?: string | null;
}

export interface MonthlyReservationReportDTO {
  residentName: string;
  apartment: string;
  date: string;
  spaceType: SpaceType | string;
}

export interface AvailabilityResponseDTO {
  spaceId: number;
  date: string;
  available: boolean;
}

export interface AvailabilityMonthDTO {
  spaceId: number;
  year: number;
  month: number;
  unavailableDates: string[];
  availableDates: string[];
  totalDays: number;
  unavailableCount: number;
  availableCount: number;
  occupancyPercentage: number;
}

export interface OccupancyStatsResponseDTO {
  spaceId: number;
  year: number;
  month: number;
  totalDays: number;
  unavailableDays: number;
  availableDays: number;
  occupancyPercentage: number;
}

export interface AvailabilityPeriodRequestDTO {
  startDate: string;
  endDate: string;
}

export interface AvailabilityPeriodResponseDTO {
  spaceId: number;
  startDate: string;
  endDate: string;
  totalDaysInPeriod: number;
  unavailableDates: string[];
  availableDates: string[];
  fullyAvailable: boolean;
  fullyBooked: boolean;
}
