// API Response types
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
  errors?: Record<string, string>;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}

// Account types
export interface Account {
  accountId: string;
  accountNumber: string;
  userId: string;
  balance: number;
  createdAt: string;
  accountStatus: AccountStatus;
  fullName?: string;
}

export type AccountStatus = 'ACTIVE' | 'LOCKED' | 'CLOSED';

// Request types
export interface UpdateAccountRequest {
  status: AccountStatus;
}

export interface UpdatePinRequest {
  newPin: string;
}

export interface DepositRequest {
  accountNumber: string;
  amount: number;
  description?: string;
}

export interface CreateAccountRequest {
  userId: string;
  accountNumberType: "PHONE_NUMBER" | "AUTO_GENERATE";
  phoneNumber?: string;
  pin?: string;
}

// Auth types
export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  id_token: string;
  token_type: string;
  scope: string;
}

export interface User {
  username: string;
  role: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}
