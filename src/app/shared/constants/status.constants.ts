import { ReservationStatus, EquipmentReservationStatus } from '../../core/models/enums';

export const RESERVATION_STATUS_LABELS: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'Pendente',
  [ReservationStatus.APPROVED]: 'Aprovada',
  [ReservationStatus.REJECTED]: 'Rejeitada',
  [ReservationStatus.CANCELLED]: 'Cancelada',
  [ReservationStatus.AWAITING_INSPECTION]: 'Aguardando Vistoria',
  [ReservationStatus.AWAITING_SIGNATURE]: 'Aguardando Termo',
  [ReservationStatus.CONFIRMED]: 'Confirmada'
};

export const RESERVATION_STATUS_CLASSES: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'chip-PENDING',
  [ReservationStatus.APPROVED]: 'chip-APPROVED',
  [ReservationStatus.REJECTED]: 'chip-REJECTED',
  [ReservationStatus.CANCELLED]: 'chip-CANCELLED',
  [ReservationStatus.AWAITING_INSPECTION]: 'chip-AWAITING_INSPECTION',
  [ReservationStatus.AWAITING_SIGNATURE]: 'chip-AWAITING_SIGNATURE',
  [ReservationStatus.CONFIRMED]: 'chip-CONFIRMED'
};

export const RESERVATION_STATUS_COLORS: Record<ReservationStatus, string> = {
  [ReservationStatus.PENDING]: 'warning',
  [ReservationStatus.APPROVED]: 'success',
  [ReservationStatus.REJECTED]: 'danger',
  [ReservationStatus.CANCELLED]: 'medium',
  [ReservationStatus.AWAITING_INSPECTION]: 'tertiary',
  [ReservationStatus.AWAITING_SIGNATURE]: 'warning',
  [ReservationStatus.CONFIRMED]: 'success'
};

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentReservationStatus, string> = {
  [EquipmentReservationStatus.CONFIRMED]: 'Confirmado',
  [EquipmentReservationStatus.IN_USE]: 'Em Uso',
  [EquipmentReservationStatus.RETURNED]: 'Devolvido',
  [EquipmentReservationStatus.CANCELED]: 'Cancelado'
};

export const EQUIPMENT_STATUS_CLASSES: Record<EquipmentReservationStatus, string> = {
  [EquipmentReservationStatus.CONFIRMED]: 'chip-CONFIRMED',
  [EquipmentReservationStatus.IN_USE]: 'chip-IN_USE',
  [EquipmentReservationStatus.RETURNED]: 'chip-RETURNED',
  [EquipmentReservationStatus.CANCELED]: 'chip-CANCELED'
};

export const EQUIPMENT_STATUS_COLORS: Record<EquipmentReservationStatus, string> = {
  [EquipmentReservationStatus.CONFIRMED]: 'primary',
  [EquipmentReservationStatus.IN_USE]: 'warning',
  [EquipmentReservationStatus.RETURNED]: 'success',
  [EquipmentReservationStatus.CANCELED]: 'medium'
};

export function getReservationStatusLabel(status: ReservationStatus): string {
  return RESERVATION_STATUS_LABELS[status] || status;
}

export function getReservationStatusColor(status: ReservationStatus): string {
  return RESERVATION_STATUS_COLORS[status] || 'medium';
}

export function getEquipmentStatusLabel(status: EquipmentReservationStatus): string {
  return EQUIPMENT_STATUS_LABELS[status] || status;
}

export function getEquipmentStatusColor(status: EquipmentReservationStatus): string {
  return EQUIPMENT_STATUS_COLORS[status] || 'medium';
}
