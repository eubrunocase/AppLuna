export interface AuthenticationDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
}

export interface UserSummaryDTO {
  id: string;
  name: string;
  apartment: string;
  email: string;
  role?: string;
}

export interface RequestUserDTO {
  name: string;
  apartment: string;
  email: string;
  password: string;
  role: string;
}

export interface ReservationSummary {
  id: string;
  date: string;
  spaceType: string;
}

export interface ResponseUserDTO {
  id: string;
  name: string;
  apartment: string;
  email: string;
  role: string;
  reservation: ReservationSummary[];
}

/** Backward-compat alias — old code referenced `UserReservationInfo`. */
export type UserReservationInfo = ReservationSummary;
