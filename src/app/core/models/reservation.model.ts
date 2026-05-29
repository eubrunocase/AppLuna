import { UserSummaryDTO } from './user.model';
import { ReservationStatus } from './enums';

export interface ReservationCreateDTO {
  date: string;
  space: number;
}

export interface SpaceInfo {
  id: number;
  type: string;
}

export interface ReservationResponseDTO {
  id: string;
  date: string;
  user: UserSummaryDTO;
  space: SpaceInfo;
  status: ReservationStatus;
  createdAt: string;
  canceledAt?: string | null;
}

export interface MonthlyReservationReportDTO {
  residentName: string;
  apartment: string;
  date: string;
  spaceType: string;
}
