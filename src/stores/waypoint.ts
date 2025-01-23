import { create } from 'zustand';
import apiService from '../api/apiService.js';
import useModalStore from "./modal";
import Constants from "../utils/constants";

interface WaypointStore {
  cntTotalList: number,
  pageNo: number,
  setpageNo: (val:number) => void,
  SrchType: any,
  setSrchType: (val?:string) => void,
  SrchValue: any,
  setSrchValue: (val?:string) => void,
  isOpenWaypointPop: boolean,
  waypointList: any,
  allWaypoints: (isPaging?: boolean) => Promise<void>;
  modifyWaypoint: (data?: any) => Promise<void>;
  createWaypoint: (data?: any) => Promise<void>;
}

const useWaypointStore = create<WaypointStore>((set, get) => ({
  cntTotalList: 0,
  pageNo: 1,
  setpageNo: (val:number) => set({ pageNo: val}),
  SrchType: '',
  setSrchType: (val?:string) => set({ SrchType: val}),
  SrchValue: '',
  setSrchValue: (val?:string) => set({ SrchValue: val}),
  isOpenWaypointPop: (false),
  waypointList: ([]),
  allWaypoints: async(isPaging) => {
    try {
      let params:any = {dataType: "JSON"}
      if(isPaging){
        params.pageNo = get().pageNo;
        params.numOfRows = Constants.NumOfRows; //10
      }
      params.srchValue = get().SrchValue;
      let result = await apiService.loadWaypointList(params);
      get().waypointList = result.waypointList;
      get().cntTotalList = result.totalCount;
    } catch (error) {
      console.log(error);
    }
  },
  modifyWaypoint: async(data) => {
    let result = await apiService.modifyWaypoint(data);
    if(result === 200) {
      useModalStore.getState().modalMsg = "수정 되었습니다.";
      await get().allWaypoints();
    }else{
      useModalStore.getState().modalMsg = result;
    }
    useModalStore.getState().openModal();
  },
  createWaypoint: async(data) => {
    let result = await apiService.createWaypoint(data);
    if(result === 200) {
      useModalStore.getState().modalMsg = "생성 되었습니다.";
      await get().allWaypoints();
    }else{
      useModalStore.getState().modalMsg = result;
    }
    useModalStore.getState().openModal();
  },
}))

export default useWaypointStore;