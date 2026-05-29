import { DeliveryStatus } from './enums';

export interface RequestDeliveryDTO {
  userId: string;
  protocolNumber?: string | null;
  discrimination?: string | null;
  image?: string | null;
  otherRecipient?: string | null;
}

export interface ResponseDeliveryDTO {
  id: string;
  userId: string;
  protocolNumber?: string | null;
  discrimination?: string | null;
  image?: string | null;
  createdAt: string;
  createdBy: string;
  otherRecipient?: string | null;
  status: DeliveryStatus;
  deliveredAt?: string | null;
  pickedUpBy?: string | null;
}
