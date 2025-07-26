import { authApi, handleApiError } from "@/lib/api";
import {
  AuthResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
} from "@/types/auth";
import { User } from "@/types/user";
import * as SecureStore from "expo-secure-store";

class AuthService {
  private static readonly TOKEN_KEY = "access_token";
  private static readonly REFRESH_TOKEN_KEY = "refresh_token";
  private static readonly USER_KEY = "user";

  /**
   * Login user with email and password
   */
  static async login(credentials: LoginRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.login(credentials);

      if (!response) {
        throw new Error("Login failed");
      }

      const { user, tokens } = response.data;

      // Store tokens and user data
      await this.storeAuthData(tokens, user);

      return {
        success: response.success,
        message: response.message,
        statusCode: response.statusCode,
        data: { user, tokens },
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Register a new user
   */
  static async register(userData: RegisterRequest): Promise<AuthResponse> {
    try {
      const response = await authApi.register(userData);

      if (!response) {
        throw new Error("Registration failed");
      }

      const { user, tokens } = response.data;

      // Store tokens and user data
      await this.storeAuthData(tokens, user);

      return {
        success: response.success,
        message: response.message,
        statusCode: response.statusCode,
        data: { user, tokens },
      };
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Logout user
   */
  static async logout(): Promise<void> {
    try {
      await authApi.logout();
    } catch (error) {
      // Continue with logout even if API call fails
      console.warn("Logout API call failed:", error);
    } finally {
      // Clear stored auth data
      await this.clearAuthData();
    }
  }

  /**
   * Refresh access token
   */
  static async refreshToken(): Promise<AuthTokens> {
    try {
      const response = await authApi.refresh();

      if (!response) {
        throw new Error("Token refresh failed");
      }

      const tokens = response;

      // Update stored tokens
      await this.storeTokens(tokens);

      return tokens;
    } catch (error) {
      // If refresh fails, clear auth data and throw error
      await this.clearAuthData();
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Get current user profile
   */
  static async getCurrentUser(): Promise<User> {
    try {
      const response = await authApi.me();

      if (!response) {
        throw new Error("Failed to get user profile");
      }

      const user = response;

      // Update stored user data
      await this.storeUser(user);

      return user;
    } catch (error) {
      throw new Error(handleApiError(error));
    }
  }

  /**
   * Check if user is authenticated
   */
  static async isAuthenticated(): Promise<boolean> {
    try {
      const token = await this.getAccessToken();
      return !!token;
    } catch {
      return false;
    }
  }

  /**
   * Get stored access token
   */
  static async getAccessToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.TOKEN_KEY);
    } catch (error) {
      console.error("Error getting access token:", error);
      return null;
    }
  }

  /**
   * Get stored refresh token
   */
  static async getRefreshToken(): Promise<string | null> {
    try {
      return await SecureStore.getItemAsync(this.REFRESH_TOKEN_KEY);
    } catch (error) {
      console.error("Error getting refresh token:", error);
      return null;
    }
  }

  /**
   * Get stored user data
   */
  static async getStoredUser(): Promise<User | null> {
    try {
      const userData = await SecureStore.getItemAsync(this.USER_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Error getting stored user:", error);
      return null;
    }
  }

  /**
   * Store authentication data
   */
  private static async storeAuthData(
    tokens: AuthTokens,
    user: User
  ): Promise<void> {
    await Promise.all([this.storeTokens(tokens), this.storeUser(user)]);
  }

  /**
   * Store tokens
   */
  private static async storeTokens(tokens: AuthTokens): Promise<void> {
    await Promise.all([
      SecureStore.setItemAsync(this.TOKEN_KEY, tokens.accessToken),
      SecureStore.setItemAsync(this.REFRESH_TOKEN_KEY, tokens.refreshToken),
    ]);
  }

  /**
   * Store user data
   */
  private static async storeUser(user: User): Promise<void> {
    await SecureStore.setItemAsync(this.USER_KEY, JSON.stringify(user));
  }

  /**
   * Clear all stored authentication data
   */
  private static async clearAuthData(): Promise<void> {
    await Promise.all([
      SecureStore.deleteItemAsync(this.TOKEN_KEY),
      SecureStore.deleteItemAsync(this.REFRESH_TOKEN_KEY),
      SecureStore.deleteItemAsync(this.USER_KEY),
    ]);
  }
}

export default AuthService;
