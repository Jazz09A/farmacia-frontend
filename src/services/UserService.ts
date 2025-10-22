// 🏥 Servicio para operaciones del usuario
import { authService } from './AuthService';

export interface UserStats {
  total_orders: number;
  total_spent: number;
  total_products_purchased: number;
}

class UserService {
  private baseUrl = import.meta.env.VITE_API_URL + '/api/v1/user' || 'http://localhost:8000/api/v1/user';

  // 📊 Obtener estadísticas del usuario
  async getUserStats(): Promise<UserStats> {
    try {
      const response = await authService.authenticatedFetch(`/stats`);
      
      if (!response.ok) {
        throw new Error(`Error fetching user stats: ${response.status}`);
      }
      
      const data: UserStats = await response.json();
      return data;
    } catch (error) {
      console.error('Failed to fetch user stats:', error);
      throw error;
    }
  }
}

export const userService = new UserService();
export default userService;
