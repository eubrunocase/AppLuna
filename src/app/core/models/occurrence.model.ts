export interface OccurrenceCreateRequestDTO {
  description: string;
  incidentDate: string;
}

export interface OccurrenceResponseDTO {
  id: string;
  userName: string;
  description: string;
  incidentDate: string;
  createdAt: string;
}
