import axios from 'axios';

const API_BASE_URL = 'http://192.168.0.121:8000';

export const api = axios.create({
  baseURL: API_BASE_URL,
});

export const generateTitleText = (idea) => api.post('/generate-title', { idea });
export const generateSectionText = (idea, title, section, authors, references, image_provided, image_path, num_pages) =>
  api.post('/generate-section', { idea, title, section, authors, references, image_provided, image_path, num_pages });
export const generateReferencesText = (idea) => api.post('/generate-references', { idea });
export const exportWordDocument = (title, authors, sections, references, images) =>
  api.post('/export-word', { title, authors, sections, references, images });
export const exportPdfDocument = (title, authors, sections, references, images) =>
  api.post('/export-pdf', { title, authors, sections, references, images });
export const regenerateSectionText = (idea, title, authors, section_name, existing_sections, references, image_provided, image_path, num_pages) =>
  api.post('/regenerate-section', { idea, title, authors, section_name, existing_sections, references, image_provided, image_path, num_pages });
export const savePaperProfile = (title, authors, idea, sections, references, images) =>
  api.post('/save-paper', { title, authors, idea, sections, references, images });
export const loadPaperProfile = (paper_id) => api.get(`/load-paper?paper_id=${paper_id}`);

export const uploadImageFile = (file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/upload-image', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const sendChatMessage = (message, html_context) =>
  api.post('/chat', { message, html_context });
