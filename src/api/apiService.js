import axios from 'axios';

const login = async (data) => {
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

const logout = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
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

const loadUserList = (params) => {
  return axios.get(`/api/mng/user`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    params: params
  }).then((response) => {
    return response.data;
  }).catch((error) => {
    console.log('[apiService] loadUserList 정보를 받아오는 중 에러가 발생했습니다.', error);
  });
}

const loadRoleList = () => {
  return axios.get(`/api/mng/role`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
  }).then((response) => {
    return response.data;
  }).catch((error) => {
    console.log('[apiService] loadRoleList 정보를 받아오는 중 에러가 발생했습니다.', error);
  });
}

const loadAuthList = () => {
  return axios.get(`/api/mng/role/auth`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
  }).then((response) => {
    return response.data;
  }).catch((error) => {
    console.log('[apiService] loadAuthList 정보를 받아오는 중 에러가 발생했습니다.', error);
  });
}

const modifyRole = async(data) => {
  const config =  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/role/update`, data, config).then((response) => {
    return response.data;
  }).catch((error) => {
    return error;
  });
}

const saveRole = async(data) => {
  const config =  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/role/insert`, data, config).then((response) => {
    return response.data;
  }).catch((error) => {
    return error;
  });
}

const deleteRole = async(data) => {
  const config =  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ sessionStorage.getItem('token')
    }
  }
  return axios.delete(`/api/mng/role/delete/${data}`, config).then((response) => {
    return response.data;
  }).catch((error) => {
    return error;
  });
}

const loadLimitList = () => {
  return axios.get(`/api/mng/warning`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ sessionStorage.getItem('token')
    },
  }).then((response) => {
    return response.data;
  }).catch((error) => {
    console.log('[apiService] loadLimitList 정보를 받아오는 중 에러가 발생했습니다.', error);
  });
}

const modifyLimit = async(data) => {
  const config =  {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer '+ sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/warning/update`, data, config).then((response) => {
    return response;
  }).catch((error) => {
    return error;
  });
}


export default {
  login, logout, loadUserList, loadRoleList, loadAuthList, modifyRole, saveRole, deleteRole, loadLimitList, modifyLimit
}