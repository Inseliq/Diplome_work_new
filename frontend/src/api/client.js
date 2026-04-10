import axios from 'axios';
import { config } from './config/env';
import { logger } from '../app/utils/logger';

/**
 * Базовый axios-инстанс.
 * Все запросы идут на VITE_API_URL.
 */
const instance = axios.create({
  baseURL: config.apiUrl,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ── Request interceptor — логируем исходящий запрос ── */
instance.interceptors.request.use(
  (cfg) => {
    logger.api(cfg.method, cfg.baseURL + cfg.url, '→');
    return cfg;
  },
  (error) => {
    logger.error('Request error', error);
    return Promise.reject(error);
  }
);

/* ── Response interceptor — логируем и нормализуем ошибки ── */
instance.interceptors.response.use(
  (response) => {
    logger.api(response.config.method, response.config.url, response.status);
    return response.data;   // возвращаем сразу data, без .data в эндпоинтах
  },
  (error) => {
    if (error.response) {
      // Сервер ответил с ошибкой (4xx / 5xx)
      logger.error(
        `API ${error.response.status}: ${error.config?.url}`,
        error.response.data
      );
      return Promise.reject({
        status: error.response.status,
        message: error.response.data?.message || error.response.statusText,
        data: error.response.data,
      });
    }

    if (error.request) {
      // Запрос ушёл, но ответа не было (нет сети, таймаут)
      logger.warn('Network error / timeout', error.config?.url);
      return Promise.reject({
        status: 0,
        message: 'Network error',
      });
    }

    // Что-то сломалось ещё до отправки
    logger.error('Unexpected error', error);
    return Promise.reject({ status: -1, message: error.message });
  }
);

export const apiClient = {
  get: (path) => instance.get(path),
  post: (path, body) => instance.post(path, body),
  put: (path, body) => instance.put(path, body),
  delete: (path) => instance.delete(path),
};