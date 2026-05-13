import axios from 'axios';
import { config } from './config/env';
import { logger } from '../app/utils/logger';

/**
 * Базовый axios-инстанс.
 * Все запросы идут на VITE_API_URL.
 * withCredentials нужен, чтобы браузер отправлял HttpOnly cookies:
 * accessToken и refreshToken.
 */
const instance = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Эндпоинты, на которых НЕ нужно пытаться обновлять токен.
 * Иначе можно получить бесконечный цикл.
 */
const AUTH_REFRESH_URL = '/api/auth/refresh';

const AUTH_PUBLIC_URLS = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/refresh',
];

instance.interceptors.request.use(
  (cfg) => {
    const method = cfg.method?.toUpperCase() || 'GET';
    const url = `${cfg.baseURL || ''}${cfg.url || ''}`;

    logger.api(method, url, '→');

    return cfg;
  },
  (error) => {
    logger.error('Request error', error);
    return Promise.reject(error);
  }
);

instance.interceptors.response.use(
  (response) => {
    logger.api(
      response.config.method?.toUpperCase(),
      response.config.url,
      response.status
    );

    // Возвращаем сразу data, без .data в эндпоинтах
    return response.data;
  },
  async (error) => {
    const originalRequest = error.config;

    const status = error.response?.status;
    const url = originalRequest?.url || '';

    const isUnauthorized = status === 401;
    const isPublicAuthUrl = AUTH_PUBLIC_URLS.some((authUrl) =>
      url.includes(authUrl)
    );

    if (
      isUnauthorized &&
      originalRequest &&
      !originalRequest._retry &&
      !isPublicAuthUrl
    ) {
      originalRequest._retry = true;

      try {
        logger.api('POST', AUTH_REFRESH_URL, 'refresh');

        await instance.post(AUTH_REFRESH_URL);

        return instance(originalRequest);
      } catch (refreshError) {
        logger.warn('Refresh token failed');

        return Promise.reject(normalizeAxiosError(refreshError));
      }
    }

    return Promise.reject(normalizeAxiosError(error));
  }
);

function normalizeAxiosError(error) {
  if (error.response) {
    logger.error(
      `API ${error.response.status}: ${error.config?.url}`,
      error.response.data
    );

    return {
      status: error.response.status,
      message: error.response.data?.message || error.response.statusText,
      data: error.response.data,
    };
  }

  if (error.request) {
    logger.warn('Network error / timeout', error.config?.url);

    return {
      status: 0,
      message: 'Network error',
    };
  }

  logger.error('Unexpected error', error);

  return {
    status: -1,
    message: error.message || 'Unexpected error',
  };
}

export const apiClient = {
  get: (path, config) => instance.get(path, config),
  post: (path, body, config) => instance.post(path, body, config),
  put: (path, body, config) => instance.put(path, body, config),
  delete: (path, config) => instance.delete(path, config),
};