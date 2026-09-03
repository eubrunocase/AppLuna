import { DeliveryStatus } from './enums';

/**
 * Backend JSON key is `user` (mapped from `userId` via @JsonProperty).
 * POST /delivery/create and PUT /delivery/update/{id} use voucherKey (MinIO object key).
 */
export interface RequestDeliveryDTO {
  user: string;
  protocolNumber?: string | null;
  discrimination?: string | null;
  voucherKey: string;
  otherRecipient?: string | null;
}

export interface ResponseDeliveryDTO {
  id: string;
  user: string;
  protocolNumber?: string | null;
  discrimination?: string | null;
  voucherKey?: string | null;
  createdAt: string;
  createdBy: string;
  otherRecipient?: string | null;
  status: DeliveryStatus;
  deliveredAt?: string | null;
  pickedUpBy?: string | null;
}

export interface DeliveryUploadUrlResponse {
  uploadUrl: string;
  key: string;
}

export interface DeliveryDownloadUrlResponse {
  downloadUrl: string;
}
