// api.js
import axios from 'axios';

const API_URL = '/api';

// Set up Axios interceptors
// axios.interceptors.push({
//   responseError: async (error) => {
//     if (error.response.status === 401) {
//       // Token expired, refresh token
//       try {
//         const response = await axios.post(`${API_URL}/refresh-token`);
//         // Update token in axios headers
//         axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
//         return await axios(error.config);
//       } catch (refreshError) {
//         console.error(refreshError);
//       }
//     }
//     return Promise.reject(error);
//   },
// });

// API Endpoints
const fetchUserData = async (userId) => {
  const response = await axios.get(`${API_URL}/users/${userId}`);
  return response.data;
};

const fetchGroupData = async (groupId) => {
  const response = await axios.get(`${API_URL}/groups/${groupId}`);
  return response.data;
};

const fetchMessageHistory = async (receiverId) => {
  const response = await axios.get(`${API_URL}/messages/${receiverId}`);
  return response.data;
};

const fetchGroupMessages = async (groupId) => {
  const response = await axios.get(`${API_URL}/${groupId}/messages`);
  return response.data;
};

const fetchChats = async () => {
  const response = await axios.get(`${API_URL}/chats`);
  return response.data;
};

const fetchUsers = async () => {
  const response = await axios.get(`${API_URL}/users`);
  return response.data;
};

const fetchGroups = async () => {
  const response = await axios.get(`${API_URL}/groups`);
  return response.data;
};

const createNewGroup = async (formData) => {
  const response = await axios.post(`${API_URL}/create-group`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const sendMessage = async (formData) => {
  const response = await axios.post(`${API_URL}/send-message`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return response.data;
};

const logout = () => {
  axios.post('/logout', null, { withCredentials: true })
    .then(() => window.location.href = '/login')
    .catch((error) => console.error(error));
}

export {
  logout,
  createNewGroup,
  fetchChats,
  fetchUserData,
  fetchGroupData,
  fetchUsers,
  fetchMessageHistory,
  fetchGroups,
  fetchGroupMessages,
  sendMessage,
};
