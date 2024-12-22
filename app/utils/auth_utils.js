import { useState } from 'react';

/**
 * Custom hook to manage access token, handle token rotation, and provide authentication utilities
 * @returns {Object} Authentication state and methods
 */
export const useAuthToken = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() =>
    !!localStorage.getItem('accessToken')
  );

  console.log('access token:', localStorage.getItem('accessToken'));
  /**
   * Decode JWT token to check expiration
   * @param {string} token - JWT token
   * @returns {Object|null} Decoded token payload or null
   */
  const decodeToken = (token) => {
    if (!token) return null;
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace('-', '+').replace('_', '/');
      return JSON.parse(window.atob(base64));
    } catch (error) {
      console.error('Token decoding failed:', error);
      return null;
    }
  };

  /**
   * Check if token is expired
   * @param {string} token - JWT token
   * @returns {boolean} Whether token is expired
   */
  const isTokenExpired = (token) => {
    const decoded = decodeToken(token);
    if (!decoded) return true;

    // JWT exp is in seconds, Date.now() is in milliseconds
    return decoded.exp * 1000 < Date.now();
  };

  /**
   * Rotate access token using refresh token
   * @returns {Promise<string|null>} New access token or null
   */
  const rotateToken = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      logout();
      return null;
    }

    try {
      const response = await fetch('/api/token/refresh/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh: refreshToken }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Update tokens in localStorage
      localStorage.setItem('accessToken', data.access);

      // Optional: Update refresh token if backend provides a new one
      if (data.refresh) {
        localStorage.setItem('refreshToken', data.refresh);
      }

      setIsAuthenticated(true);
      return data.access;
    } catch (error) {
      console.error('Token rotation failed:', error);
      logout();
      return null;
    }
  };

  /**
   * Logout utility to clear authentication state
   */
  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setIsAuthenticated(false);
  };

  /**
   * Login utility to set tokens
   * @param {string} access - Access token
   * @param {string} refresh - Refresh token
   */
  const login = (access, refresh) => {
    localStorage.setItem('accessToken', access);
    localStorage.setItem('refreshToken', refresh);
    setIsAuthenticated(true);
  }

  /**
   * Get current access token from localStorage
   * @returns {string|null} Current access token
   */
  const getAccessToken = () => {
    return localStorage.getItem('accessToken');
  };

  /**
   * Get current refresh token from localStorage
   * @returns {string|null} Current refresh token
   */
  const getRefreshToken = () => {
    return localStorage.getItem('refreshToken');
  };

  /**
   * Intercept and handle token expiration for API requests
   * @param {Function} apiCall - API request function
   * @returns {Function} Wrapped API call with token rotation
   */
  const withTokenRotation = (apiCall) => {
    return async (...args) => {
      // Check if current token is expired
      const currentToken = getAccessToken();
      if (isTokenExpired(currentToken)) {
        const newToken = await rotateToken();
        if (!newToken) {
          throw new Error('Unable to refresh token');
        }
      }

      // Execute original API call with current token
      return apiCall(...args);
    };
  };

  return {
    accessToken: getAccessToken(),
    refreshToken: getRefreshToken(),
    isAuthenticated,
    login,
    logout,
    rotateToken,
    withTokenRotation,
    isTokenExpired,
    getAccessToken,
    getRefreshToken
  };
};
