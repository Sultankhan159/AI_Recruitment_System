import api from './api';

const postJob = async (title, description) => {
  const response = await api.post('/recruiter/jobs', { title, description });
  return response.data;
};

const getCandidates = async () => {
  const response = await api.get('/recruiter/candidates');
  return response.data;
};

const RecruiterService = {
  postJob,
  getCandidates,
};

export default RecruiterService;
