import axios from "axios";

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001",
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAuthToken = (token) => {
  if (token) {
    apiClient.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  } else {
    delete apiClient.defaults.headers.common["Authorization"];
  }
};

/**
 * A generic POST request handler
 * @param {string} url - The endpoint url
 * @param {object} data - The data to be sent in the request body
 * @returns {Promise<any>}
 */
export const apiPost = async (url, data) => {
  try {
    const response = await apiClient.post(url, data);
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error("An unknown network error occurred");
  }
};

/**
 * A generic GET request handler
 * @param {string} url - The endpoint url
 * @param {object} [params] - The URL parameters to be sent with the request
 * @returns {Promise<any>}
 */

export const apiGet = async (url, params) => {
  try {
    const response = await apiClient.get(url, { params });
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error("An unknown network error occurred");
  }
};

/**
 * A generic DELETE request handler
 * @param {string} url - The endpoint url
 * @returns {Promise<any>}
 */

export const apiDelete = async (url) => {
  try {
    const response = await apiClient.delete(url);
    return response.data;
  } catch (error) {
    throw error.response
      ? error.response.data
      : new Error("An unknown network error occurred");
  }
};

export default apiClient;
