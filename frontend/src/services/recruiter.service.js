import api from './api';

const postJob = async (jobData) => {
  const response = await api.post('/recruiter/jobs', jobData);
  return response.data;
};

const getCandidates = async () => {
  const response = await api.get('/recruiter/candidates');
  return response.data;
};

const updateApplicationStatus = async (applicationId, status) => {
  const response = await api.put(`/recruiter/applications/${applicationId}/status`, { status });
  return response.data;
};

const scheduleInterview = async (applicationId, interviewData) => {
  const response = await api.post(`/recruiter/applications/${applicationId}/interviews`, interviewData);
  return response.data;
};

const generateAiQuestions = async (interviewId) => {
  const response = await api.post(`/recruiter/interviews/${interviewId}/generate-questions`);
  return response.data;
};

const getInterviews = async (applicationId) => {
  const response = await api.get(`/recruiter/applications/${applicationId}/interviews`);
  return response.data;
};

const updateInterviewStatus = async (interviewId, status) => {
  const response = await api.put(`/recruiter/interviews/${interviewId}/status`, { status });
  return response.data;
};

const getAnalytics = async () => {
  const response = await api.get('/recruiter/analytics');
  return response.data;
};

const RecruiterService = {
  postJob,
  getCandidates,
  updateApplicationStatus,
  scheduleInterview,
  generateAiQuestions,
  getInterviews,
  updateInterviewStatus,
  getAnalytics,
};

export default RecruiterService;
