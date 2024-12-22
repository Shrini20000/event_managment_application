// Django API Communication Utilities

/**
 * Configuration for API communication
 */
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8000/api/';

/**
 * Helper function to handle common error responses
 * @param {Response} response - Fetch API response object
 * @returns {Promise} Resolved or rejected promise with parsed response
 */
async function handleResponse(response) {
  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`HTTP error! status: ${response.status}, message: ${errorBody}`);
  }

  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    return response.json();
  }
  return response.text();
}

/**
 * Utility for making unauthorized GET requests
 * @param {string} endpoint - API endpoint
 * @param {Object} [params] - Query parameters
 * @returns {Promise} Promise resolving to response data
 */
export async function getUnAuthorized(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  // Add query parameters
  Object.keys(params).forEach(key =>
    url.searchParams.append(key, params[key])
  );

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Unauthorized GET request failed:', error);
    throw error;
  }
}

/**
 * Utility for making unauthorized POST requests
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @returns {Promise} Promise resolving to response data
 */
export async function postUnAuthorized(endpoint, data) {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Unauthorized POST request failed:', error);
    throw error;
  }
}

/**
 * Utility for making authorized GET requests
 * @param {string} endpoint - API endpoint
 * @param {Object} [params] - Query parameters
 * @returns {Promise} Promise resolving to response data
 */
export async function getAuthorized(endpoint, params = {}) {
  const url = new URL(`${API_BASE_URL}${endpoint}`);

  // Add query parameters
  Object.keys(params).forEach(key =>
    url.searchParams.append(key, params[key])
  );

  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Authorized GET request failed:', error);
    throw error;
  }
}

/**
 * Utility for making authorized POST requests
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @returns {Promise} Promise resolving to response data
 */
export async function postAuthorized(endpoint, data, contentType = 'application/json') {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': contentType
      },
      body: contentType === 'multipart/form-data' ? data : JSON.stringify(data)
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Authorized POST request failed:', error);
    throw error;
  }
}

/**
 * Utility for making authorized PUT requests
 * @param {string} endpoint - API endpoint
 * @param {Object} data - Request payload
 * @returns {Promise} Promise resolving to response data
 */
export async function putAuthorized(endpoint, data, contentType = 'application/json') {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }

    // Create headers based on content type
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json',
    };

    // Only add Content-Type for JSON requests
    if (contentType !== 'multipart/form-data') {
      headers['Content-Type'] = contentType;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: headers,
      body: contentType === 'multipart/form-data' ? data : JSON.stringify(data)
    });

    return await handleResponse(response);
  } catch (error) {
    console.error('Authorized PUT request failed:', error);
    throw error;
  }
}

/**
 * Utility for making authorized DELETE requests
 * @param {string} endpoint - API endpoint
 * @returns {Promise} Promise resolving to response data
 */
export async function deleteAuthorized(endpoint) {
  try {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      throw new Error('No access token found');
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    return await handleResponse(response);
  } catch (error) {
    console.error('Authorized DELETE request failed:', error);
    throw error;
  }
}

/**
 * Refresh access token utility
 * @returns {Promise} Promise resolving to new access token
 */
export async function refreshToken() {
  try {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
      throw new Error('No refresh token found');
    }

    const response = await fetch(`${API_BASE_URL}/token/refresh/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ refresh: refreshToken })
    });

    const data = await handleResponse(response);

    // Update stored access token
    localStorage.setItem('accessToken', data.access);
    return data.access;
  } catch (error) {
    console.error('Token refresh failed:', error);
    // Clear tokens on refresh failure
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    throw error;
  }
}

/**
 * Logout utility to clear tokens
 */
export function logout() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  // Optional: Redirect to login page or dispatch logout action
}
