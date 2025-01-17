
import { create } from 'zustand';
import apiService from '../api/apiService';
// import { usePlaybackStore } from './playback.js';

interface AuthStore {
  loginId: any,
  isLoggedIn: boolean,
  isFoldMenu: boolean,
  login: (data:any) => any,
  logout: () => any,
  getSessionData: () => void,
  setSessionStorageWithExpiry: (key: any, value: any, timeToLive: any) => void,
  getSessionStorageWithExpiry: (key: any) => void,
  foldMenu: () => void,
  logEdit: (data: any) => void,
}

const useAuthStore = create<AuthStore>((set, get) => ({
  loginId: '',
  isLoggedIn: false,
  isFoldMenu: false,
  getSessionData: () => {
    const storedUser: any = get().getSessionStorageWithExpiry('user');
    if (storedUser) {
      set({
        loginId: storedUser.value,
        isLoggedIn: true,
      })
    } else {
      set({
        loginId: '',
        isLoggedIn: false,
      })
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      localStorage.clear();
      // usePlaybackStore.getState().socket && socket.close();
      // const navigate = useNavigate(); // 로그인 후 이동을 위한 네비게이션 훅
      // navigate('/login');
    }
  },
  // sessionStorage에 데이터를 저장하는 함수 (timeToLive: 만료 시간, 초 단위)
  setSessionStorageWithExpiry: (key: any, value: any, timeToLive: any) => {
    const now = new Date();
    const expiry = now.getTime() + timeToLive * 1000;
    const item = {
      value: value,
      expiry: expiry
    };
    sessionStorage.setItem(key, JSON.stringify(item));
  },
  // sessionStorage에서 데이터를 가져오는 함수 (만료 시간이 지나면 null 반환)
  getSessionStorageWithExpiry: (key: any) => {
    const itemStr = sessionStorage.getItem(key);
    if (!itemStr) {
      return null;
    }
    const item = JSON.parse(itemStr);
    const now = new Date();
    if (now.getTime() > item.expiry) {
      sessionStorage.removeItem(key);
      return null;
    }
    return item;
  },
  login: async(data: any) => {
    return await apiService.login(data).then((userData) => {
      if(userData.loginId){
        console.log("userData", userData)
        set({
          loginId: userData.loginId,
          isLoggedIn: true,
        })
        get().setSessionStorageWithExpiry('user', userData.loginId, 60 * 60 * 24); // 24h 동안 유지
        sessionStorage.setItem('token', userData.token);
        sessionStorage.setItem('loginName', userData.userName);
        //sessionStorage.setItem('playback', UtilFunc.generateUUID());
        // setSessionStorageWithExpiry('token', userData.token, 60 * 60 * 24);
        return 'success';
      }else{
        return 'fail';
      }
    }).catch((error) => {
      return 'fail';
    });
  },
  logout: () => {
    apiService.logout().then((userData) => {
      set({
        loginId: '',
        isLoggedIn: false,
      })
      // socket?.close();
      sessionStorage.removeItem('user');
      sessionStorage.removeItem('token');
      //sessionStorage.removeItem('playback');
      localStorage.clear();
      // router.replace('/login');
    }).catch((error) => {
      // router.replace('/login');
    });
  },
  // getSessionData();
  foldMenu: () => {
    set({ isFoldMenu : !get().isFoldMenu})
  },
  logEdit: async(data) => {
    return await apiService.logEdit(data).then((userData) => {
      if(userData){
        return 'success';
      }else{
        return 'fail';
      }
    }).catch((error) => {
      return 'fail';
    });
  },
}));

export default useAuthStore;








