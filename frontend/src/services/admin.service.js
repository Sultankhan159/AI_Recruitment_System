import api from './api';

const getSystemStats = async () => {
  const response = await api.get('/admin/system-stats');
  return response.data;
};

const getAllUsers = async () => {
  const response = await api.get('/admin/users');
  return response.data;
};

const AdminService = {
  getSystemStats,
  getAllUsers,
};

export default AdminService;
