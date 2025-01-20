import { create } from 'zustand';
import apiService from '../api/apiService';
import Constants from "../utils/constants";

interface UserStore {
  cntTotalList: number,
  pageNo: number,
  setpageNo: (val:number) => void,
  SrchType: any,
  setSrchType: (val?:string) => void,
  SrchValue: any,
  setSrchValue: (val?:string) => void,
  userDetail: any,
  getUserList: () => Promise<void>,
  getRoleList: () => Promise<void>,
  getAuthList: () => Promise<void>,
  getUserLogList: (startDate, endDate) => Promise<void>,
  getUserDetail: (id) => Promise<void>,
}

const useUserStore = create<UserStore>((set, get) => ({
  cntTotalList: 0,
  pageNo: 1,
  setpageNo: (val:number) => set({ pageNo: val}),
  userDetail: {},
  SrchType: '',
  setSrchType: (val?:string) => set({ SrchType: val}),
  SrchValue: '',
  setSrchValue: (val?:string) => set({ SrchValue: val}),
  getUserList: async() => {
    try {
      let params: any = {}
      params.pageNo = get().pageNo;
      params.numOfRows = Constants.NumOfRows;
      params.srchType = get().SrchType;
      params.srchValue = get().SrchValue;
      let result = await apiService.loadUserList(params);
      set({cntTotalList: result.totalCount});
      return result.userList;
    } catch (error) {
      console.log(error);
    }
  },
  getUserLogList: async(startDate, endDate) => {
    try {
      let params: any = {}
      params.pageNo = get().pageNo;
      params.numOfRows = Constants.NumOfRows;
      if(startDate) params.startDate = startDate;
      if(endDate) params.endDate = endDate;
      params.srchType = get().SrchType;
      params.srchValue = get().SrchValue;
      let result = await apiService.loadUserLogList(params);
      set({cntTotalList: result.totalCount});
      return result.logList;
    } catch (error) {
      console.log(error);
    }
  },
  getUserDetail: async(id) => {
    try {
      let response = await apiService.loadUserDetail(id);
      if(response) {
        set({userDetail: response});
      }
    } catch (error) {
      console.log(error);
    }
  },
  getAuthList: async() => {
    try {
      
      let response = await apiService.loadAuthList();
      console.log('getAuthList...', response);
      return response;
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
}));

export default useUserStore;