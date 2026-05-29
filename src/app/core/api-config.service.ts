import { Injectable, inject } from '@angular/core';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiConfigService {
  readonly API_URL = environment.apiUrl;
}
