import { EquipmentReservationStatus } from './enums';

export interface EquipmentReservationRequestDTO {
  equipmentId: number;
  date: string;
  startTime: string;
  endTime: string;
}

export interface EquipmentReservationResponseDTO {
  id: string;
  equipmentName: string;
  userName: string;
  userApartment: string;
  date: string;
  startTime: string;
  endTime: string;
  status: EquipmentReservationStatus;
  createdAt: string;
  pickedUpAt?: string | null;
  returnedAt?: string | null;
  canceledAt?: string | null;
}
