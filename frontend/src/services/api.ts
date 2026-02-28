const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class ApiService {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseUrl}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  }

  // Round endpoints
  async getCurrentRound() {
    return this.request('/rounds/current');
  }

  async getAllRounds(page = 1, limit = 10) {
    return this.request(`/rounds/all?page=${page}&limit=${limit}`);
  }

  async getRoundById(roundId: number) {
    return this.request(`/rounds/${roundId}`);
  }

  async getRoundStats(roundId: number) {
    return this.request(`/rounds/${roundId}/stats`);
  }

  async getRoundWinners(roundId: number) {
    return this.request(`/rounds/${roundId}/winners`);
  }

  // Ticket endpoints
  async getTicketById(ticketId: string) {
    return this.request(`/tickets/${ticketId}`);
  }

  async getTicketsByPlayer(address: string, page = 1, limit = 20) {
    return this.request(`/tickets/player/${address}?page=${page}&limit=${limit}`);
  }

  async getTicketsByRound(roundId: number, page = 1, limit = 50) {
    return this.request(`/tickets/round/${roundId}?page=${page}&limit=${limit}`);
  }

  async getPlayerTicketsForRound(address: string, roundId: number) {
    return this.request(`/tickets/player/${address}/round/${roundId}`);
  }

  // User endpoints
  async getUserProfile(address: string) {
    return this.request(`/users/${address}/profile`);
  }

  async getUserStats(address: string) {
    return this.request(`/users/${address}/stats`);
  }

  async getUserWinnings(address: string, claimed?: boolean) {
    const query = claimed !== undefined ? `?claimed=${claimed}` : '';
    return this.request(`/users/${address}/winnings${query}`);
  }

  async getTopPlayers(limit = 10) {
    return this.request(`/users/top?limit=${limit}`);
  }

  // Statistics endpoints
  async getGlobalStats() {
    return this.request('/stats/global');
  }

  async getRecentActivity(limit = 10) {
    return this.request(`/stats/activity?limit=${limit}`);
  }

  async getNumberFrequency() {
    return this.request('/stats/numbers/frequency');
  }

  // Health check
  async healthCheck() {
    return this.request('/health');
  }
}

export const api = new ApiService();
export default api;
