import api from './api';

const login = async (email, password) => {
  const response = await api.post('/auth/signin', { email, password });
  if (response.data.token) {
    localStorage.setItem('user', JSON.stringify(response.data));
  }
  return response.data;
};

const register = async (email, password, firstName, lastName, roles) => {
  const response = await api.post('/auth/signup', {
    email,
    password,
    firstName,
    lastName,
    role: roles,
  });
  return response.data;
};

const logout = () => {
  localStorage.removeItem('user');
};

const getCurrentUser = () => {
  return JSON.parse(localStorage.getItem('user'));
};

const AuthService = {
  login,
  register,
  logout,
  getCurrentUser,
};

export default AuthService;
