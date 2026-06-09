import api from './api';

const getProfile = async () => {
  const response = await api.get('/candidate/profile');
  return response.data;
};

const updateProfile = async (profileData) => {
  const response = await api.put('/candidate/profile', profileData);
  return response.data;
};

const applyForJob = async (jobId) => {
  const response = await api.post('/candidate/apply', { jobId });
  return response.data;
};

// Education
const addEducation = async (educationDto) => {
  const response = await api.post('/candidate/education', educationDto);
  return response.data;
};

const updateEducation = async (id, educationDto) => {
  const response = await api.put(`/candidate/education/${id}`, educationDto);
  return response.data;
};

const deleteEducation = async (id) => {
  const response = await api.delete(`/candidate/education/${id}`);
  return response.data;
};

// Experience
const addExperience = async (experienceDto) => {
  const response = await api.post('/candidate/experience', experienceDto);
  return response.data;
};

const updateExperience = async (id, experienceDto) => {
  const response = await api.put(`/candidate/experience/${id}`, experienceDto);
  return response.data;
};

const deleteExperience = async (id) => {
  const response = await api.delete(`/candidate/experience/${id}`);
  return response.data;
};

// Skills
const addSkill = async (skillDto) => {
  const response = await api.post('/candidate/skills', skillDto);
  return response.data;
};

const deleteSkill = async (id) => {
  const response = await api.delete(`/candidate/skills/${id}`);
  return response.data;
};

// Certifications
const addCertification = async (certificationDto) => {
  const response = await api.post('/candidate/certifications', certificationDto);
  return response.data;
};

const updateCertification = async (id, certificationDto) => {
  const response = await api.put(`/candidate/certifications/${id}`, certificationDto);
  return response.data;
};

const deleteCertification = async (id) => {
  const response = await api.delete(`/candidate/certifications/${id}`);
  return response.data;
};

const CandidateService = {
  getProfile,
  updateProfile,
  applyForJob,
  addEducation,
  updateEducation,
  deleteEducation,
  addExperience,
  updateExperience,
  deleteExperience,
  addSkill,
  deleteSkill,
  addCertification,
  updateCertification,
  deleteCertification,
};

export default CandidateService;
