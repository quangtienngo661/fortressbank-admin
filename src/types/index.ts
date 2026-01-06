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

export interface AdminUserResponse {
  id: string;
  username: string;
  email: string;
  fullName: string;
  citizenId: string;
  dob: string;
  phoneNumber: string;
  enabled: boolean;
  createdAt: string;
}

// User Management types
export interface AdminUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  citizenId: string;
  dob: string; // ISO date string
  phoneNumber: string;
  enabled: boolean;
  createdAt: string; // ISO datetime string
}

// Dashboard Statistics types
export type PeriodType = 'TODAY' | 'THIS_WEEK' | 'THIS_MONTH' | 'THIS_YEAR' | 'CUSTOM';

export interface AccountStats {
  totalAccounts: number;
  activeAccounts: number;
  lockedAccounts: number;
  closedAccounts: number;
}

export interface DashboardStatisticsResponse {
  startDate: string;
  endDate: string;
  periodLabel: string;
  // Transaction metrics
  totalTransactions: number;
  successfulTransactions: number;
  failedTransactions: number;
  pendingTransactions: number;
  // Financial metrics
  totalVolume: number;
  totalFees: number;
  averageTransactionAmount: number;
  // Transaction type breakdown
  internalTransfers: number;
  externalTransfers: number;
  deposits: number;
  withdrawals: number;
  billPayments: number;
  // Account statistics
  accountStats: AccountStats;
}

export interface DashboardStatisticsRequest {
  period?: PeriodType;
  startDate?: string;
  endDate?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  dob: string; // ISO date string (YYYY-MM-DD)
  citizenId: string;
  phoneNumber: string;
  accountNumberType: "PHONE_NUMBER" | "AUTO_GENERATE";
  pin: string;
  createCard?: boolean;
  roles?: string[];
}

export interface UpdateUserRequest {
  fullName: string;
  email: string;
  dob: string; // ISO date string (YYYY-MM-DD)
  phoneNumber: string;
}

export interface AccountDto {
  accountId: string;
  userId: string;
  balance: number;
  createdAt: string;
  accountNumber: string;
  accountStatus: string;
}

export interface CardDto {
  cardId: string;
  cardNumber: string;
  cardHolderName: string;
  expirationDate: string;
  status: string;
  cardType: string;
}

export interface CreateUserResponse {
  userId: string;
  username: string;
  email: string;
  fullName: string;
  citizenId: string;
  dob: string;
  phoneNumber: string;
  createdAt: string;
  account: AccountDto;
  card: CardDto | null;
}
