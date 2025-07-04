import api from './api';

// Log levels for different types of activities
export const LOG_LEVELS = {
  INFO: 'INFO',
  WARNING: 'WARNING',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL'
};

// Activity types for categorization
export const ACTIVITY_TYPES = {
  AUTH: 'AUTHENTICATION',
  PRODUCT: 'PRODUCT_MANAGEMENT',
  CATEGORY: 'CATEGORY_MANAGEMENT',
  USER: 'USER_MANAGEMENT',
  SYSTEM: 'SYSTEM'
};

class LoggingService {
  // Log admin activity to the backend
  async logActivity(activityData) {
    try {
      // Check if we have admin data before attempting to log
      const adminId = this.getCurrentAdminId();
      const adminEmail = this.getCurrentAdminEmail();
      
      // If we don't have admin data yet, skip logging for now
      if (!adminId && !adminEmail) {
        console.log('Skipping log - admin data not available yet');
        return;
      }

      const logEntry = {
        ...activityData,
        timestamp: new Date().toISOString(),
        adminId: adminId,
        adminEmail: adminEmail
      };

      await api.post('/api/admin/logs', logEntry);
    } catch (error) {
      // Only log errors that aren't 403 (permission issues)
      if (error.response && error.response.status === 403) {
        console.log('Logging endpoint not accessible - this is normal if endpoint is not fully implemented');
      } else {
        console.error('Failed to log activity:', error);
      }
      // Don't throw error to avoid breaking the main functionality
    }
  }

  // Get current admin ID from localStorage or context
  getCurrentAdminId() {
    try {
      const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
      return user.userId || null;
    } catch (error) {
      console.log('Error parsing admin user data:', error);
      return null;
    }
  }

  // Get current admin email from localStorage or context
  getCurrentAdminEmail() {
    try {
      const user = JSON.parse(localStorage.getItem('admin_user') || '{}');
      return user.email || null;
    } catch (error) {
      console.log('Error parsing admin user data:', error);
      return null;
    }
  }

  // Authentication activities
  async logLogin(adminEmail) {
    await this.logActivity({
      level: LOG_LEVELS.INFO,
      type: ACTIVITY_TYPES.AUTH,
      action: 'LOGIN',
      description: `Admin logged in: ${adminEmail}`,
      details: { adminEmail }
    });
  }

  async logLogout(adminEmail) {
    await this.logActivity({
      level: LOG_LEVELS.INFO,
      type: ACTIVITY_TYPES.AUTH,
      action: 'LOGOUT',
      description: `Admin logged out: ${adminEmail}`,
      details: { adminEmail }
    });
  }

  // Product management activities
  async logProductCreated(productName, productId) {
    await this.logActivity({
      level: LOG_LEVELS.INFO,
      type: ACTIVITY_TYPES.PRODUCT,
      action: 'CREATE',
      description: `Product created: ${productName}`,
      details: { productName, productId }
    });
  }

  async logProductUpdated(productName, productId) {
    await this.logActivity({
      level: LOG_LEVELS.INFO,
      type: ACTIVITY_TYPES.PRODUCT,
      action: 'UPDATE',
      description: `Product updated: ${productName}`,
      details: { productName, productId }
    });
  }

  async logProductDeleted(productName, productId) {
    await this.logActivity({
      level: LOG_LEVELS.WARNING,
      type: ACTIVITY_TYPES.PRODUCT,
      action: 'DELETE',
      description: `Product deleted: ${productName}`,
      details: { productName, productId }
    });
  }

  // Category management activities
  async logCategoryCreated(categoryName, categoryId) {
    await this.logActivity({
      level: LOG_LEVELS.INFO,
      type: ACTIVITY_TYPES.CATEGORY,
      action: 'CREATE',
      description: `Category created: ${categoryName}`,
      details: { categoryName, categoryId }
    });
  }

  async logCategoryUpdated(categoryName, categoryId) {
    await this.logActivity({
      level: LOG_LEVELS.INFO,
      type: ACTIVITY_TYPES.CATEGORY,
      action: 'UPDATE',
      description: `Category updated: ${categoryName}`,
      details: { categoryName, categoryId }
    });
  }

  async logCategoryDeleted(categoryName, categoryId) {
    await this.logActivity({
      level: LOG_LEVELS.WARNING,
      type: ACTIVITY_TYPES.CATEGORY,
      action: 'DELETE',
      description: `Category deleted: ${categoryName}`,
      details: { categoryName, categoryId }
    });
  }

  // User management activities
  async logUserDeleted(userEmail, userId) {
    await this.logActivity({
      level: LOG_LEVELS.CRITICAL,
      type: ACTIVITY_TYPES.USER,
      action: 'DELETE',
      description: `User account deleted: ${userEmail}`,
      details: { userEmail, userId }
    });
  }

  // Generic activity logger
  async logGenericActivity(type, action, description, details = {}) {
    await this.logActivity({
      level: LOG_LEVELS.INFO,
      type,
      action,
      description,
      details
    });
  }

  // Fetch logs from backend
  async getLogs(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.startDate) params.append('startDate', filters.startDate);
      if (filters.endDate) params.append('endDate', filters.endDate);
      if (filters.type) params.append('type', filters.type);
      if (filters.level) params.append('level', filters.level);
      if (filters.adminId) params.append('adminId', filters.adminId);
      if (filters.limit) params.append('limit', filters.limit);

      const response = await api.get(`/api/admin/logs?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch logs:', error);
      throw error;
    }
  }
}

export default new LoggingService(); 