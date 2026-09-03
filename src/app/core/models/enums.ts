export enum UserRoles {
  ADMIN_ROLE = 'ADMIN_ROLE',
  RESIDENT_ROLE = 'RESIDENT_ROLE',
  /** Alias legado; o backend usa `RESIDENT_ROLE`. */
  RESIDENTE_ROLE = 'RESIDENT_ROLE',
  EMPLOYEE = 'EMPLOYEE'
}

export function isResidentRole(role: string | null | undefined): boolean {
  const normalized = (role || '').trim().toUpperCase();
  return (
    normalized === 'RESIDENT_ROLE' ||
    normalized === 'RESIDENTE_ROLE' ||
    normalized === 'ROLE_RESIDENT_ROLE' ||
    normalized === 'ROLE_RESIDENTE_ROLE'
  );
}

export enum SpaceType {
  SALAO_FESTAS = 'SALAO_FESTAS',
  CHURRASQUEIRA = 'CHURRASQUEIRA',
  CAMPO_FUTEBOL = 'CAMPO_FUTEBOL'
}

export enum ReservationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
  CANCELLED = 'CANCELLED'
}

export enum DeliveryStatus {
  PENDING = 'PENDING',
  DELIVERED = 'DELIVERED'
}

export enum EquipmentReservationStatus {
  CONFIRMED = 'CONFIRMED',
  IN_USE = 'IN_USE',
  RETURNED = 'RETURNED',
  CANCELED = 'CANCELED'
}

export enum ReportExportStatus {
  PROCESSING = 'PROCESSING',
  READY = 'READY',
  ERROR = 'ERROR'
}

export enum ReportFormat {
  PDF = 'PDF',
  DOCX = 'DOCX'
}
