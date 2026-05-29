export interface PushSubscriptionRequestDTO {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface PublicKeyResponseDTO {
  publicKey: string;
}
