export enum UserRoles {
  ADMIN_ROLE = 'ADMIN_ROLE',
  RESIDENT_ROLE = 'RESIDENTE_ROLE',
  RESIDENTE_ROLE = 'RESIDENTE_ROLE',
  EMPLOYEE = 'EMPLOYEE'
}

export enum SpaceType {
  SALAO_FESTAS = 'SALAO_FESTAS',
  CHURRASQUEIRA = 'CHURRASQUEIRA',
  ACADEMIA = 'ACADEMIA',
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
