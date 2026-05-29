export interface StandardErrorDTO {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
}

export interface ValidationErrorDTO extends StandardErrorDTO {
  validationErrors: {
    [field: string]: string;
  };
}
