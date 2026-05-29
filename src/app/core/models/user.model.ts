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

export interface UserReservationInfo {
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
  reservations: UserReservationInfo[];
}
