import { Router, useNavigate } from 'react-router-dom';
import { create } from 'zustand';
import apiService from '../api/apiService';

// sessionStorage에서 만료 시간 포함하여 데이터 가져오기
const getSessionStorageWithExpiry = (key) => {
  const itemStr = sessionStorage.getItem(key);
  if (!itemStr) return null;

  const item = JSON.parse(itemStr);
  const now = new Date();
  if (now.getTime() > item.expiry) {
    sessionStorage.removeItem(key);
    return null;
  }
  return item.value;
}

// sessionStorage에 데이터를 저장하는 함수 (timeToLive: 만료 시간, 초 단위)
const setSessionStorageWithExpiry = (key, value, timeToLive) => {
  const now = new Date();
  const expiry = now.getTime() + timeToLive * 1000;
  const item = {
    value: value,
    expiry: expiry
  };
  sessionStorage.setItem(key, JSON.stringify(item));
}

const useAuthStore = create((set, get) => ({
  loginId: '',
  isLoggedIn: false,
  
  login: async(data) => {
    try {
      await apiService.login(data).then((userData) => {
        if(userData.loginId) {
          set({ loginId: userData.loginId, isLoggedIn: true }) //화살표 함수에서 객체 리터럴을 반환하려면 소괄호 ()로 감싸야 한다.
          setSessionStorageWithExpiry('user', userData.loginId, 60*60*24)
          sessionStorage.setItem('token', userData.token);
          return 'success';
        } else {
          return 'fail';
        }
      })
    } catch (error) {
      return 'fail';
    }
  },

  logout: async() => {
    const navigate = useNavigate();

    try {
      await apiService.logout();
      set({ loginId: '', isLoggedIn: false});
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.clear();
      navigate('/login');
    } catch (error) {
      navigate('/login');
    }
  },

  getSessionData: () => {
    const storedUser = getSessionStorageWithExpiry('user');
    const navivate = useNavigate(); // React Router로 페이지 이동
    
    if (storedUser) {
      set({ loginId: storedUser, isLoggedIn: true });
    } else {
      set({ loginId: '', isLoggedIn: false });
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.clear();
      navivate('/login');
    }
  }
}));


export default useAuthStore;