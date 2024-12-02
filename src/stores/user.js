import { create } from 'zustand';
import apiService from '../api/apiService';

const useUserStore = create((set, get) => ({
  cntTotalList: 0,
  pageNo: 1,

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
      return response;
    } catch (error) {
      console.log(error);
    }
  },

  getAuthList: async() => {
    try {
      let response = await apiService.loadAuthList();
      return response;
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
  }
}));

export default useUserStore;