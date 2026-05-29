# LunaLink API - Documentação e Contratos (Backend Schema)

Este documento descreve a arquitetura de dados e os contratos HTTP do backend do LunaLink (Spring Boot 3.2.x). 
O frontend foi re-arquitetado para ser 100% **PWA (Progressive Web App)** usando Angular/Ionic, com foco em Web Push Notifications nativas (VAPID).

---

## 🏗️ 1. Contexto para o Agente Frontend (IA)

Você é um Engenheiro de Software Sênior especialista em Angular, Ionic e PWAs.
Sua missão é reconstruir a camada de integração (HTTP Services e Models) do nosso frontend para consumir esta API.

**Regras de Ouro:**
1. **NÃO use Firebase.** O envio de notificações é feito via Web Push nativo (VAPID).
2. **Tipagem Estrita:** Crie Interfaces TypeScript baseadas *exatamente* nos DTOs descritos abaixo. Use `string` para datas ISO e UUIDs, `number` para IDs sequenciais e os `Enums` conforme listado.
3. **Tratamento de Erros:** O backend agora retorna erros estruturados (ex: `StandardErrorDTO` e `ValidationErrorDTO`). O frontend deve estar preparado para capturar `HTTP 400` e exibir o campo `message` ou o objeto `validationErrors`.

---

## 🧩 2. Enums Globais (TypeScript)

```typescript
export enum UserRoles {
  ADMIN_ROLE = 'ADMIN_ROLE',
  RESIDENT_ROLE = 'RESIDENT_ROLE',
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
```

---

## 📦 3. Modelos de Dados (DTOs)

### 👤 3.1. Autenticação e Usuários (`Users`)
*Nota: O campo de acesso principal agora é o `email`.*

```typescript
export interface AuthenticationDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  token: string;
}

export interface UserSummaryDTO {
  id: string; // UUID
  name: string;
  apartment: string;
  email: string;
}

export interface RequestUserDTO {
  name: string;
  apartment: string;
  email: string;
  password: string;
  role: UserRoles;
}

export interface ResponseUserDTO {
  id: string; // UUID
  name: string;
  apartment: string;
  email: string;
  role: UserRoles;
  reservations: {
    id: string; // UUID
    date: string; // YYYY-MM-DD
    spaceType: string;
  }[];
}
```

### 📆 3.2. Reservas de Espaço (`Reservation`)

```typescript
export interface ReservationCreateDTO {
  date: string; // YYYY-MM-DD
  spaceId: number;
}

# Ids dos espaços
  1 - Salão de Festas
  2 - Churrasqueira
  3 - Academia
  4 - Campo de Futebol

export interface ReservationResponseDTO {
  id: string; // UUID
  date: string; // YYYY-MM-DD
  user: UserSummaryDTO;
  space: {
    id: number;
    type: string;
  };
  status: ReservationStatus;
  createdAt: string; // YYYY-MM-DDTHH:mm:ss
  canceledAt?: string | null;
}

export interface MonthlyReservationReportDTO {
  residentName: string;
  apartment: string;
  date: string; // YYYY-MM-DD
  spaceType: string;
}
```

### 📦 3.3. Entregas (`Delivery`)

```typescript
export interface RequestDeliveryDTO {
  userId: string; // UUID
  protocolNumber?: string | null;
  discrimination?: string | null;
  image?: string | null; // Base64 byte array
  otherRecipient?: string | null;
}

export interface ResponseDeliveryDTO {
  id: string; // UUID
  userId: string; // UUID
  protocolNumber?: string | null;
  discrimination?: string | null;
  image?: string | null;
  createdAt: string; // YYYY-MM-DDTHH:mm:ss
  createdBy: string; // Email do funcionário
  otherRecipient?: string | null;
  status: DeliveryStatus;
  deliveredAt?: string | null;
  pickedUpBy?: string | null;
}
```

### 📺 3.4. Empréstimo de Equipamentos (`EquipmentReservation`)

```typescript
export interface EquipmentReservationRequestDTO {
  equipmentId: number;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string; // HH:mm
}

export interface EquipmentReservationResponseDTO {
  id: string; // UUID
  equipmentName: string;
  userName: string;
  userApartment: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm:ss
  endTime: string; // HH:mm:ss
  status: EquipmentReservationStatus;
  createdAt: string; // YYYY-MM-DDTHH:mm:ss
  pickedUpAt?: string | null;
  returnedAt?: string | null;
}
```

### 🚨 3.5. Ocorrências (`Occurrence`)

```typescript
export interface OccurrenceCreateRequestDTO {
  description: string;
  incidentDate: string; // YYYY-MM-DDTHH:mm:ss (Data não pode ser no futuro)
}

export interface OccurrenceResponseDTO {
  id: string; // UUID
  userName: string;
  description: string;
  incidentDate: string; // YYYY-MM-DDTHH:mm:ss
  createdAt: string; // YYYY-MM-DDTHH:mm:ss
}
```

### 🔔 3.6. Web Push e Erros (`Notification` & `Exception`)

```typescript
export interface PushSubscriptionRequestDTO {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface StandardErrorDTO {
  timestamp: string; // YYYY-MM-DDTHH:mm:ss
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
```

---

## 🚀 4. Endpoints da API HTTP
*Todas as requisições, exceto `/auth/login`, exigem o header `Authorization: Bearer {token}`.*

### 🔑 Autenticação e Usuários
| Método | Endpoint | Acesso | Body | Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/lunaLink/auth/login` | Público | `AuthenticationDTO` | `200` `LoginResponseDTO` |
| `GET` | `/lunaLink/users/summary` | Auth | - | `200` `UserSummaryDTO[]` |
| `POST` | `/lunaLink/users/create` | Admin | `RequestUserDTO` | `200` `ResponseUserDTO` |
| `PUT` | `/lunaLink/users/update/{id}` | Admin | `RequestUserDTO` | `200` `ResponseUserDTO` |
| `GET` | `/lunaLink/users` | Auth | - | `200` `ResponseUserDTO[]` |

### 🏢 Reservas de Espaços
| Método | Endpoint | Acesso | Body | Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/lunaLink/reservation` | Auth | `ReservationCreateDTO` | `201` `ReservationResponseDTO` |
| `GET` | `/lunaLink/reservation` | Auth | - | `200` `ReservationResponseDTO[]` |
| `GET` | `/lunaLink/reservation/{id}` | Auth | - | `200` `ReservationResponseDTO` |
| `DELETE` | `/lunaLink/reservation/{id}` | Admin | - | `204` No Content |
| `PUT` | `/lunaLink/reservation/{id}` | Auth | `{ "date": "YYYY-MM-DD" }` | `200` `ReservationResponseDTO` |
| `PUT` | `/lunaLink/reservation/{id}/approve` | Admin | - | `200` `ReservationResponseDTO` (status: APPROVED) |
| `PUT` | `/lunaLink/reservation/{id}/reject` | Admin | - | `200` `ReservationResponseDTO` (status: REJECTED) |
| `GET` | `/lunaLink/reservation/checkAvaliability/{date}/{spaceId}` | Auth | - | `200` Boolean |
| `GET` | `/lunaLink/reservation/report/monthly?month=X&year=YYYY` | Admin | - | `200` `MonthlyReservationReportDTO[]` |

### 📦 Entregas
| Método | Endpoint | Acesso | Body | Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/lunaLink/delivery/create` | Auth | `RequestDeliveryDTO` | `200` `ResponseDeliveryDTO` |
| `GET` | `/lunaLink/delivery/findAll` | Auth | - | `200` `ResponseDeliveryDTO[]` |
| `PATCH` | `/lunaLink/delivery/{id}/confirm-receipt?pickedUpBy={Nome}` | Auth | - | `200` `ResponseDeliveryDTO` (status: DELIVERED) |

### 📺 Empréstimo de Equipamentos
| Método | Endpoint | Acesso | Body | Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/lunaLink/equipment-reservation` | Auth | `EquipmentReservationRequestDTO`| `201` `EquipmentReservationResponseDTO` |
| `GET` | `/lunaLink/equipment-reservation?date=YYYY-MM-DD&status=IN_USE` | Admin | - | `200` `EquipmentReservationResponseDTO[]` |
| `PATCH` | `/lunaLink/equipment-reservation/{id}/handover` | Admin | - | `200` `EquipmentReservationResponseDTO` (status: IN_USE) |
| `PATCH` | `/lunaLink/equipment-reservation/{id}/return` | Admin | - | `200` `EquipmentReservationResponseDTO` (status: RETURNED) |

### 🚨 Ocorrências
| Método | Endpoint | Acesso | Body | Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `POST` | `/lunaLink/occurrences` | Auth | `OccurrenceCreateRequestDTO` | `201` `OccurrenceResponseDTO` (Erro 400 se data for no futuro) |

### 🔔 Web Push (Service Worker)
| Método | Endpoint | Acesso | Body | Retorno |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/lunaLink/push/public-key` | Auth | - | `200` `{ "publicKey": "String" }` |
| `POST` | `/lunaLink/push/subscribe` | Auth | `PushSubscriptionRequestDTO` | `200 OK` |
| `POST` | `/lunaLink/push/unsubscribe` | Auth | `{ "endpoint": "String" }` | `200 OK` |

---
**Instrução final para o Agente IA:**
Analise este documento. Confirme que você entendeu a nova arquitetura PWA. E use as informações presentes neste arquivo para construir o front end PWA do LunaLink.