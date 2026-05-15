import { apiClient } from '../client';

/**
 * GET /api/directory/vehicles
 * Возвращает список техники для каталога.
 */
export const getDirectoryVehicles = () => apiClient.get('/api/directory/vehicles');

/**
 * GET /api/directory/vehicles/:id
 * Возвращает данные конкретного танка: техника + сборки + полевая.
 */
export const getDirectoryVehicleById = (id) => apiClient.get(`/api/directory/vehicles/${id}`);

/**
 * GET /api/directory/dictionaries
 * Возвращает справочники оборудования и полевой модернизации.
 */
export const getDirectoryDictionaries = () => apiClient.get('/api/directory/dictionaries');