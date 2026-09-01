import { DeliveryStatus } from './enums';

/**
 * Backend JSON key is `user` (mapped from `userId` via @JsonProperty on the record).
 * Both POST /delivery/create and PUT /delivery/update/{id} use this shape.
 */
export interface RequestDeliveryDTO {
  user?: string | null;
  protocolNumber?: string | null;
  discrimination?: string | null;
  /** Sent as base64 string — Jackson decodes to byte[]. */
  image?: string | null;
  otherRecipient?: string | null;
}

/**
 * Backend uses JSON key `user` for the recipient and `image` is `byte[]` (number[] in JSON).
 */
export interface ResponseDeliveryDTO {
  id: string;
  user: string;
  protocolNumber?: string | null;
  discrimination?: string | null;
  image?: number[] | null;
  createdAt: string;
  createdBy: string;
  otherRecipient?: string | null;
  status: DeliveryStatus;
  deliveredAt?: string | null;
  pickedUpBy?: string | null;
}
