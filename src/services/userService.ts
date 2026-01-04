import { apiClient } from "../config/api";
import type {
  AdminUser,
  ApiResponse,
  PageResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CreateUserResponse,
} from "../types";

export const userService = {
  // Search users with pagination
  searchUsers: async (params: {
    keyword?: string;
    page: number;
    size: number;
  }): Promise<PageResponse<AdminUser>> => {
    const response = await apiClient.get<ApiResponse<PageResponse<AdminUser>>>(
      "/admin/users",
      { params }
    );
    return response.data.data;
  },

  // Get user by ID
  getUserById: async (userId: string): Promise<AdminUser> => {
    const response = await apiClient.get<ApiResponse<AdminUser>>(
      `/admin/users/${userId}`
    );
    return response.data.data;
  },

  // Create new user
  createUser: async (data: CreateUserRequest): Promise<CreateUserResponse> => {
    const response = await apiClient.post<ApiResponse<CreateUserResponse>>(
      "/admin/users",
      data
    );
    return response.data.data;
  },

  // Update user
  updateUser: async (
    userId: string,
    data: UpdateUserRequest
  ): Promise<AdminUser> => {
    const response = await apiClient.put<ApiResponse<AdminUser>>(
      `/admin/users/${userId}`,
      data
    );
    return response.data.data;
  },

  // Lock user account
  lockUser: async (userId: string): Promise<string> => {
    const response = await apiClient.put<ApiResponse<string>>(
      `/admin/users/${userId}/lock`
    );
    return response.data.data;
  },

  // Unlock user account
  unlockUser: async (userId: string): Promise<string> => {
    const response = await apiClient.put<ApiResponse<string>>(
      `/admin/users/${userId}/unlock`
    );
    return response.data.data;
  },
};

