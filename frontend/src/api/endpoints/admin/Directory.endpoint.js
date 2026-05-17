import { apiClient } from '../../client';

export const getAdminDirectoryDictionaries = () =>
  apiClient.get('/api/admin/directory/dictionaries');

export const createAdminDirectoryEquipment = (body) =>
  apiClient.post('/api/admin/directory/equipment', body);

export const updateAdminDirectoryEquipment = (key, body) =>
  apiClient.put(`/api/admin/directory/equipment/${encodeURIComponent(key)}`, body);

export const deleteAdminDirectoryEquipment = (key) =>
  apiClient.delete(`/api/admin/directory/equipment/${encodeURIComponent(key)}`);

export const createAdminDirectoryFieldItem = (body) =>
  apiClient.post('/api/admin/directory/field-items', body);

export const updateAdminDirectoryFieldItem = (key, body) =>
  apiClient.put(`/api/admin/directory/field-items/${encodeURIComponent(key)}`, body);

export const deleteAdminDirectoryFieldItem = (key) =>
  apiClient.delete(`/api/admin/directory/field-items/${encodeURIComponent(key)}`);

export const getAdminDirectoryVehicles = (search = '') => {
  const query = search ? `?search=${encodeURIComponent(search)}` : '';

  return apiClient.get(`/api/admin/directory/vehicles${query}`);
};

export const getAdminDirectoryVehicle = (vehicleId) =>
  apiClient.get(`/api/admin/directory/vehicles/${vehicleId}`);

export const upsertAdminDirectoryVehicle = (vehicleId, body) =>
  apiClient.put(`/api/admin/directory/vehicles/${vehicleId}`, body);

export const deleteAdminDirectoryVehicle = (vehicleId) =>
  apiClient.delete(`/api/admin/directory/vehicles/${vehicleId}`);

export const createAdminDirectoryBuild = (vehicleId, body) =>
  apiClient.post(`/api/admin/directory/vehicles/${vehicleId}/builds`, body);

export const updateAdminDirectoryBuild = (vehicleId, buildId, body) =>
  apiClient.put(`/api/admin/directory/vehicles/${vehicleId}/builds/${buildId}`, body);

export const deleteAdminDirectoryBuild = (vehicleId, buildId) =>
  apiClient.delete(`/api/admin/directory/vehicles/${vehicleId}/builds/${buildId}`);

export const createAdminDirectoryFieldModification = (vehicleId, body) =>
  apiClient.post(`/api/admin/directory/vehicles/${vehicleId}/field-modifications`, body);

export const updateAdminDirectoryFieldModification = (vehicleId, fieldModificationId, body) =>
  apiClient.put(`/api/admin/directory/vehicles/${vehicleId}/field-modifications/${fieldModificationId}`, body);

export const deleteAdminDirectoryFieldModification = (vehicleId, fieldModificationId) =>
  apiClient.delete(`/api/admin/directory/vehicles/${vehicleId}/field-modifications/${fieldModificationId}`);