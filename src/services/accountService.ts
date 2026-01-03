import { apiClient } from "../config/api";
import type {
  Account,
  ApiResponse,
  PageResponse,
  UpdateAccountRequest,
  UpdatePinRequest,
  DepositRequest,
} from "../types";

export const accountService = {
  // Get all accounts with pagination
  getAllAccounts: async (params: {
    page: number;
    size: number;
    sortBy?: string;
    sortDirection?: string;
  }): Promise<PageResponse<Account>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<Account>>>(
      "/admin/accounts",
      { params }
    );
    return response.data.data;
  },

  // Get account by ID
  getAccountById: async (accountId: string): Promise<Account> => {
    const response = await apiClient.get<ApiResponse<Account>>(
      `/admin/accounts/${accountId}`
    );
    return response.data.data;
  },

  // Update account
  updateAccount: async (
    accountId: string,
    data: UpdateAccountRequest
  ): Promise<Account> => {
    const response = await apiClient.put<ApiResponse<Account>>(
      `/admin/accounts/${accountId}`,
      data
    );
    return response.data.data;
  },

  // Lock account
  lockAccount: async (accountId: string): Promise<Account> => {
    const response = await apiClient.put<ApiResponse<Account>>(
      `/admin/accounts/${accountId}/lock`
    );
    return response.data.data;
  },

  // Unlock account
  unlockAccount: async (accountId: string): Promise<Account> => {
    const response = await apiClient.put<ApiResponse<Account>>(
      `/admin/accounts/${accountId}/unlock`
    );
    return response.data.data;
  },

  // Update PIN
  updatePin: async (
    accountId: string,
    data: UpdatePinRequest
  ): Promise<void> => {
    await apiClient.put<ApiResponse<void>>(`/accounts/${accountId}/pin`, data);
  },

  // Admin deposit
  deposit: async (data: DepositRequest): Promise<any> => {
    const response = await apiClient.post<ApiResponse<any>>(
      "/transactions/admin/deposit",
      data
    );
    return response.data.data;
  },
};
