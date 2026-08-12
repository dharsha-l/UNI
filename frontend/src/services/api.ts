// API service layer - all calls go through here
// Structured for easy swap to Python/FastAPI backend

import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' }
});

// Auth
export const login = (email: string, password: string) =>
  api.post('/auth/login', { email, password }).then(r => r.data);

// Dashboard
export const getDashboard = () =>
  api.get('/analytics/dashboard').then(r => r.data);

// Institutions
export const getInstitutions = () =>
  api.get('/institutions').then(r => r.data);

export const getInstitution = (id: string) =>
  api.get(`/institutions/${id}`).then(r => r.data);

// Inspections
export const getInspections = () =>
  api.get('/inspections').then(r => r.data);

export const getInspection = (id: string) =>
  api.get(`/inspections/${id}`).then(r => r.data);

export const createInspection = (data: any) =>
  api.post('/inspections', data).then(r => r.data);

export const crossVerify = (inspectionId: string) =>
  api.post(`/inspections/${inspectionId}/cross-verify`).then(r => r.data);

// Documents
export const getDocuments = (inspectionId: string) =>
  api.get(`/documents/${inspectionId}`).then(r => r.data);

export const uploadDocument = (inspectionId: string, file: File) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('inspection_id', inspectionId);
  return axios.post('/api/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};

export const analyzeDocument = (docId: string) =>
  api.post(`/documents/${docId}/analyze`).then(r => r.data);

export const analyzeAllDocuments = (inspectionId: string) =>
  api.post(`/documents/analyze-all/${inspectionId}`).then(r => r.data);

// Images
export const getImages = (inspectionId: string) =>
  api.get(`/images/${inspectionId}`).then(r => r.data);

export const uploadImage = (inspectionId: string, file: File, category: string) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('inspection_id', inspectionId);
  formData.append('category', category);
  return axios.post('/api/images/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};

export const analyzeImage = (imageId: string) =>
  api.post(`/images/${imageId}/analyze`).then(r => r.data);

export const analyzeAllImages = (inspectionId: string) =>
  api.post(`/images/analyze-all/${inspectionId}`).then(r => r.data);

export const getDetections = (inspectionId: string) =>
  api.get(`/images/detections/${inspectionId}`).then(r => r.data);

// Claims
export const getClaims = (inspectionId: string) =>
  api.get(`/analytics/claims/${inspectionId}`).then(r => r.data);

// External Data
export const getExternalData = (institutionId: string) =>
  api.get(`/analytics/external/${institutionId}`).then(r => r.data);

// Findings
export const getFindings = (inspectionId: string) =>
  api.get(`/findings/${inspectionId}`).then(r => r.data);

export const getFinding = (id: string) =>
  api.get(`/findings/detail/${id}`).then(r => r.data);

export const acceptFinding = (id: string, inspectorId: string, comment?: string) =>
  api.post(`/findings/${id}/accept`, { inspector_id: inspectorId, comment }).then(r => r.data);

export const overrideFinding = (id: string, inspectorId: string, reason: string, comment?: string) =>
  api.post(`/findings/${id}/override`, { inspector_id: inspectorId, reason, comment }).then(r => r.data);

// Regulations
export const getRegulations = () =>
  api.get('/regulations').then(r => r.data);

export const searchRegulations = (query: string) =>
  api.get(`/regulations/search?q=${encodeURIComponent(query)}`).then(r => r.data);

// History
export const getInspectionHistory = (institutionId: string) =>
  api.get(`/analytics/history/${institutionId}`).then(r => r.data);

// Reports
export const generateReport = (inspectionId: string) =>
  api.post(`/reports/${inspectionId}/generate`).then(r => r.data);

export const getReport = (inspectionId: string) =>
  api.get(`/reports/${inspectionId}`).then(r => r.data);

export default api;
