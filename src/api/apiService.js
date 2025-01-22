import axios from "axios";

const loadVertiportList = (params) => {
  return axios.get(`/api/mng/vertiport`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    params: params
  }).then((response) => {
    console.log("[apiService] loadVertiportList response: ", response);
    return response.data;
  }).catch((error) => {
    console.log('[apiService] loadVertiportList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const loadVertiportDetail = (id) => {
  return axios.get(`/api/mng/vertiport/` + id, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
  }).then((response) => {
    // console.log("[apiService] loadVertiportDetail response: ", response);
    if (response.status == 200) return response.data;
  }).catch((error) => {

    console.log('[apiService] loadVertiportDetail 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const updateVertiportDetail = (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/vertiport/update`, data, config).then((response) => {
    // console.log("[apiService] updateVertiportDetail response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] updateVertiportDetail 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const insertVertiportDetail = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/vertiport/insert`, data, config).then((response) => {
    console.log("[apiService] insertVertiportDetail response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] insertVertiportDetail 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const deleteVertiport = async (id) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.delete(`/api/mng/vertiport/delete/${id}`, config).then((response) => {
    // console.log("[apiService] deleteVertiport response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] deleteVertiport 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const loadCorridorList = (params) => {
  return axios.get(`/api/mng/corridor`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    params: params
  }).then((response) => {
    console.log("[apiService] loadCorridorList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] loadCorridorList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const loadCorridorDetail = (id) => {
  return axios.get(`/api/mng/corridor/` + id, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
  }).then((response) => {
    console.log("[apiService] loadCorridorDetail response: ", response);
    if (response.status == 200) return response.data;
  }).catch((error) => {

    console.log('[apiService] loadCorridorDetail 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const insertCorridorDetail = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/corridor/insert`, data, config).then((response) => {
    console.log("[apiService] insertCorridorDetail response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] insertCorridorDetail 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const updateCorridorDetail = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/corridor/update`, data, config).then((response) => {
    console.log("[apiService] updateCorridorDetail response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] updateCorridorDetail 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const loadWaypointList = (params) => {
  return axios.get(`/api/mng/waypoint`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    params: params
  }).then((response) => {
    console.log("[apiService] loadWaypointList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] loadWaypointList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const modifyWaypoint = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/waypoint/update`, data, config).then((response) => {
    console.log("[apiService] modifyWaypoint response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] modifyWaypoint 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const createWaypoint = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/waypoint/insert`, data, config).then((response) => {
    console.log("[apiService] createWaypoint response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] createWaypoint 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const login = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'multipart/form-data',
    }
  }
  return axios.post(`/api/mng/login`, data, config).then((response) => {
    // console.log("[apiService] login response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] login 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const logEdit = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/user/password`, data, config).then((response) => {
    // console.log("[apiService] logEdit response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] logEdit 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const logout = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/logout`, data, config).then((response) => {
    // console.log("[apiService] logout response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] logout 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const loadUserList = (params) => {
  return axios.get(`/api/mng/user`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    params: params
  }).then((response) => {
    // console.log("[apiService] loadUserList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] loadUserList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const loadUserLogList = (params) => {
  return axios.get(`/api/mng/user/logs`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    params: params
  }).then((response) => {
    // console.log("[apiService] loadUserLogList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] loadUserLogList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const loadUserDetail = (id) => {
  return axios.get(`/api/mng/user/` + id, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
  }).then((response) => {
    // console.log("[apiService] loadUserDetail response: ", response);
    if (response.status == 200) return response.data;
  }).catch((error) => {
    console.log('[apiService] loadUserDetail 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const loadAuthList = () => {
  return axios.get(`/api/mng/role/auth`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
  }).then((response) => {
    // console.log("[apiService] loadAuthList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] loadAuthList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const loadRoleList = () => {
  return axios.get(`/api/mng/role`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
  }).then((response) => {
    // console.log("[apiService] loadRoleList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] loadRoleList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const saveRole = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/role/insert`, data, config).then((response) => {
    // console.log("[apiService] saveRole response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] saveRole 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const modifyRole = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/role/update`, data, config).then((response) => {
    // console.log("[apiService] modifyRole response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] modifyRole 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const deleteRole = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.delete(`/api/mng/role/delete/${data}`, config).then((response) => {
    // console.log("[apiService] deleteRole response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] deleteRole 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const loadLimitList = () => {
  return axios.get(`/api/mng/warning`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
  }).then((response) => {
    // console.log("[apiService] loadLimitList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] loadLimitList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const modifyLimit = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/warning/update`, data, config).then((response) => {
    console.log("[apiService] modifyLimit response: ", response);
    return response;
  }).catch((error) => {

    console.log('[apiService] modifyLimit 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const loadPlayBack = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/aircraft/get-playback-data`, data, config).then((response) => {
    console.log("[apiService] loadPlayBack response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {
    console.log('[apiService] loadPlayBack 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;
  });
}

const pausePlayBack = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/aircraft/pause`, data, config).then((response) => {
    console.log("[apiService] pausePlayBack response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] pausePlayBack 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const stopPlayBack = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/aircraft/stop`, data, config).then((response) => {
    console.log("[apiService] stopPlayBack response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] stopPlayBack 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const getBuildings = (bounds, signal) => {
  //console.log('apiService bounds: ', bounds);
  return axios.post('/api/buildings/buildinglist', // URL
    bounds,
    {
      headers: {
        'Content-Type': 'application/json'
      },
      signal: signal // 요청 신호 (취소 요청)
    }
  )
    .then((response) => {
      return response.data;
    })
    .catch((error) => {

      console.log('[apiService] building 정보를 받아오는 중 에러가 발생했습니다.', error);

    });
}

const getNotams = () => {
  return axios.get(`/api/notam`, {
    headers: {
      'Content-Type': 'application/json'
    },
    //params: { schFromDate:20240903 } // 예외처리용
  })
    .then((response) => {
      // console.log("[apiService] getNotam response: ", response);
      return response.data;
    })
    .catch((error) => {

      console.log('[apiService] getNotam 정보를 받아오는 중 에러가 발생했습니다.', error);

    });
}
const loadNotamList = (params) => {
  return axios.get('/api/mng/notam/notam-list', {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    params: params
  }).then((response) => {
    // console.log("[apiService] loadNotamList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] loadNotamList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const loadNotamDetail = (selectedNotams) => {
  const queryString = selectedNotams.join(',');
  return axios.get(`/api/mng/notam/notam-detail`, {
    params: { notamId: queryString },
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
  }).then((response) => {
    // console.log("[apiService] loadNotamDetail response: ", response);
    if (response.status == 200) return response.data;
  }).catch((error) => {

    console.log('[apiService] loadNotamDetail 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const getGeofenceList = (params) => {
  return axios.get(`/api/geofence/list`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    params: params
  }).then((response) => {
    // console.log("[apiService] getGeofenceList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] getGeofenceList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const saveGeofence = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/geofence/add`, data, config).then((response) => {
    // console.log("[apiService] saveGeofence response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] saveGeofence 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const loadSidCvfpSmallList = (params) => {
  return axios.get(`/api/mng/vertiport/sid-cvfp`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    params: params
  }).then((response) => {
    console.log("[apiService] loadSidCvfpSmallList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] loadSidCvfpSmallList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}


const loadSidCvfpList = (params) => {
  return axios.get(`/api/mng/sid-cvfp`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
    params: params
  }).then((response) => {
    console.log("[apiService] loadSidCvfpList response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] loadSidCvfpList 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const loadSidCvfpDetail = (vid, id) => {
  return axios.get(`/api/mng/sid-cvfp/${vid}/` + id, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    },
  }).then((response) => {
    // console.log("[apiService] loadSidCvfpDetail response: ", response);
    if (response.status == 200) return response.data;
  }).catch((error) => {

    console.log('[apiService] loadSidCvfpDetail 정보를 받아오는 중 에러가 발생했습니다.', error);

  });
}

const updateSidCvfpDetail = (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/sid-cvfp/update`, data, config).then((response) => {
    // console.log("[apiService] updateSidCvfpDetail response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] updateSidCvfpDetail 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const insertSidCvfpDetail = async (data) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.post(`/api/mng/sid-cvfp/insert`, data, config).then((response) => {
    console.log("[apiService] insertSidCvfpDetail response: ", response);
    if (response.status == 200) {
      return response.status;
    } else {
      return response.statusText;
    }
  }).catch((error) => {

    console.log('[apiService] insertSidCvfpDetail 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

const deleteSidCvfp = async (id) => {
  const config = {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + sessionStorage.getItem('token')
    }
  }
  return axios.delete(`/api/mng/sid-cvfp/delete/${id}`, config).then((response) => {
    // console.log("[apiService] deleteSidCvfp response: ", response);
    return response.data;
  }).catch((error) => {

    console.log('[apiService] deleteSidCvfp 정보를 받아오는 중 에러가 발생했습니다.', error);
    return error;

  });
}

export default {
  loadVertiportList, loadVertiportDetail, updateVertiportDetail, insertVertiportDetail,
  loadCorridorList, loadCorridorDetail, insertCorridorDetail, updateCorridorDetail,
  loadWaypointList,
  login, logout, logEdit,
  loadUserList, loadUserDetail, loadUserLogList,
  loadAuthList, loadRoleList, saveRole, modifyRole, deleteRole,
  loadLimitList, modifyLimit,
  modifyWaypoint, createWaypoint,
  loadPlayBack, pausePlayBack, stopPlayBack,
  getBuildings, getNotams, loadNotamList, loadNotamDetail,
  getGeofenceList, saveGeofence,
  loadSidCvfpSmallList, loadSidCvfpList, loadSidCvfpDetail, updateSidCvfpDetail, insertSidCvfpDetail, deleteSidCvfp
}