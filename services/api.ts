import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const STORAGE_KEY_TOKEN = '@concert_access_token';
const STORAGE_KEY_REFRESH = '@concert_refresh_token';

// In development, Android emulator connects to host machine via 10.0.2.2
export const API_BASE_URL =
  Platform.OS === 'android'
    ? 'http://10.0.2.2:5000/api/v1'
    : 'http://localhost:5000/api/v1';

class ApiClient {
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private refreshSubscribers: ((token: string) => void)[] = [];

  constructor() {
    this.loadTokens();
  }

  async loadTokens() {
    try {
      const [token, refresh] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEY_TOKEN),
        AsyncStorage.getItem(STORAGE_KEY_REFRESH),
      ]);
      this.accessToken = token;
      this.refreshToken = refresh;
    } catch {
      // Ignore storage errors on initial load
    }
  }

  async setTokens(access: string, refresh: string) {
    this.accessToken = access;
    this.refreshToken = refresh;
    await Promise.all([
      AsyncStorage.setItem(STORAGE_KEY_TOKEN, access),
      AsyncStorage.setItem(STORAGE_KEY_REFRESH, refresh),
    ]);
  }

  async clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    await Promise.all([
      AsyncStorage.removeItem(STORAGE_KEY_TOKEN),
      AsyncStorage.removeItem(STORAGE_KEY_REFRESH),
    ]);
  }

  getAccessToken() {
    return this.accessToken;
  }

  getRefreshToken() {
    return this.refreshToken;
  }

  private onTokenRefreshed(newToken: string) {
    this.refreshSubscribers.forEach((cb) => cb(newToken));
    this.refreshSubscribers = [];
  }

  private addRefreshSubscriber(cb: (token: string) => void) {
    this.refreshSubscribers.push(cb);
  }

  async request<T>(
    endpoint: string,
    options: RequestInit = {},
    retry = true
  ): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    };

    if (this.accessToken && !headers['Authorization']) {
      headers['Authorization'] = `Bearer ${this.accessToken}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json().catch(() => ({}));

      // Handle 401 Unauthorized -> Attempt token refresh
      if (response.status === 401 && retry && this.refreshToken) {
        if (!this.isRefreshing) {
          this.isRefreshing = true;
          try {
            const refreshRes = await fetch(`${API_BASE_URL}/auth/refresh`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken: this.refreshToken }),
            });
            const refreshData = await refreshRes.json();

            if (refreshData.success && refreshData.data?.accessToken) {
              await this.setTokens(
                refreshData.data.accessToken,
                refreshData.data.refreshToken || this.refreshToken
              );
              this.onTokenRefreshed(refreshData.data.accessToken);
              this.isRefreshing = false;
              // Retry original request with new token
              return this.request<T>(endpoint, options, false);
            } else {
              await this.clearTokens();
              this.isRefreshing = false;
            }
          } catch {
            await this.clearTokens();
            this.isRefreshing = false;
          }
        } else {
          // Wait for token to refresh
          return new Promise<T>((resolve) => {
            this.addRefreshSubscriber(async () => {
              resolve(this.request<T>(endpoint, options, false));
            });
          });
        }
      }

      if (!response.ok) {
        const errorMsg = data.message || `Request failed with status ${response.status}`;
        throw new Error(errorMsg);
      }

      return data as T;
    } catch (error: any) {
      throw error;
    }
  }

  // --- Auth Endpoints ---
  async register(data: { name: string; email: string; password: string; phone?: string }) {
    const res = await this.request<{ success: boolean; data: { user: any; tokens: { accessToken: string; refreshToken: string } } }>(
      '/auth/register',
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (res.data?.tokens) {
      await this.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res.data;
  }

  async login(data: { email: string; password: string }) {
    const res = await this.request<{ success: boolean; data: { user: any; tokens: { accessToken: string; refreshToken: string } } }>(
      '/auth/login',
      { method: 'POST', body: JSON.stringify(data) }
    );
    if (res.data?.tokens) {
      await this.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
    }
    return res.data;
  }

  async logout() {
    try {
      if (this.refreshToken) {
        await this.request('/auth/logout', {
          method: 'POST',
          body: JSON.stringify({ refreshToken: this.refreshToken }),
        });
      }
    } finally {
      await this.clearTokens();
    }
  }

  async getMe() {
    const res = await this.request<{ success: boolean; data: any }>('/auth/me');
    return res.data;
  }

  // --- Concert Endpoints ---
  async getConcerts(params?: { search?: string; city?: string; featured?: boolean }) {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.city) query.append('city', params.city);
    if (params?.featured !== undefined) query.append('featured', String(params.featured));

    const qs = query.toString() ? `?${query.toString()}` : '';
    const res = await this.request<{ success: boolean; count: number; data: any[] }>(`/concerts${qs}`);
    return res.data;
  }

  async getConcertById(id: string) {
    const res = await this.request<{ success: boolean; data: any }>(`/concerts/${id}`);
    return res.data;
  }

  // --- Reservation Endpoints ---
  async createReservation(categoryId: string, quantity: number) {
    const res = await this.request<{ success: boolean; message: string; data: { session: any } }>(
      '/reservations',
      {
        method: 'POST',
        body: JSON.stringify({ categoryId, quantity }),
      }
    );
    return res.data;
  }

  async getReservationSession(sessionId: string) {
    const res = await this.request<{ success: boolean; data: any }>(`/reservations/${sessionId}`);
    return res.data;
  }

  async cancelReservationSession(sessionId: string) {
    const res = await this.request<{ success: boolean; message: string }>(
      `/reservations/${sessionId}`,
      { method: 'DELETE' }
    );
    return res;
  }

  async getMyActiveReservations() {
    const res = await this.request<{ success: boolean; count: number; data: any[] }>('/reservations/active');
    return res.data;
  }

  // --- Booking Endpoints ---
  async confirmBooking(sessionId: string, paymentMethod = 'CREDIT_CARD') {
    const res = await this.request<{ success: boolean; message: string; data: { booking: any } }>(
      '/bookings/confirm',
      {
        method: 'POST',
        body: JSON.stringify({ sessionId, paymentMethod }),
      }
    );
    return res.data;
  }

  async getMyBookings() {
    const res = await this.request<{ success: boolean; count: number; data: any[] }>('/bookings/my-bookings');
    return res.data;
  }

  // --- Ticket Endpoints ---
  async getMyTickets() {
    const res = await this.request<{ success: boolean; count: number; data: any[] }>('/tickets/my-tickets');
    return res.data;
  }

  async getTicketById(ticketId: string) {
    const res = await this.request<{ success: boolean; data: any }>(`/tickets/${ticketId}`);
    return res.data;
  }
}

export const api = new ApiClient();
