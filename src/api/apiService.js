import axios from 'axios';

const login = async(data) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  }
  try {
    const response = await axios.post('/api/mng/login', data, config);
    return response.data;
  } catch (error) {
    console.error('[apiService] Login Error', error?.response || error);
    return Promise.reject(error?.response?.data?.message || '로그인 중 문제 발생');
  }
}

const logout = async(data) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Autorizstion': 'Bearer ' + sessionStorage.getItem('token') 
    }
  }
  try {
    const response = await axios.post('/api/mng/logout', data, config);
    return response.status;
  } catch (error) {
    console.error('[apiService] Logout Error', error?.response || error);
    return Promise.reject(error?.response?.data?.message || '로그아웃 중 문제 발생');
  }
}

export default {
  login, logout
}