import { create } from 'zustand';
import apiService from '../api/apiService';

const useUserStore = create((set, get) => ({
  cntTotalList: 0,
  pageNo: 1,
  roleList: [],
  authList: [],
  actions: {
    setRoleList: async(newVale) => {
      set({ roleList: newVale })
    },
  
    setAuthList: async(newVal) => {
      set({ authList: newVal })
    },
  
    getUserList: async(searchType, searchValue) => {
      try {
        let params = {}
        params.pageNo = get().pageNo;
        params.numOfRows = 10;
        params.srchType = searchType;
        params.srchValue = searchValue;
        let result = await apiService.loadUserList(params);
        set({ cntTotalList: result.totalCount })
        return result.userList;
      } catch (error) {
        console.log(error);
      }
    },
  
    getRoleList: async() => {
      try {
        let response = await apiService.loadRoleList();
        set({ roleList: response })
      } catch (error) {
        console.log(error);
      }
    },
  
    getAuthList: async() => {
      try {
        let response = await apiService.loadAuthList();
        set({authList: response})
      } catch (error) {
        console.log(error);
      }
    },
  
    modifyRole: async(role) => {
      try {
        let response = await apiService.modifyRole(role);
        return response;
      } catch (error) {
        console.log(error);
      }
    },
  
    saveRole: async(role) => {
      try {
        let response = await apiService.saveRole(role);
        return response;
      } catch (error) {
        console.log(error);
      }
    },
  
    deleteRole: async(id) => {
      try {
        let response = await apiService.deleteRole(id);
        return response;
      } catch (error) {
        console.log(error);
      }
    }
  }
}));

export default useUserStore;