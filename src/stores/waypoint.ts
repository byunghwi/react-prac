import { create } from 'zustand';
import apiService from '../api/apiService.js';
import useModalStore from "./modal";
import Constants from "../utils/constants";

interface WaypointStore {
  isOpenWaypointPop: boolean,
  SrchValue: string,
  pageNo: number,
  cntTotalList: number,
  waypointList: any,
  allWaypoints: (isPaging?: boolean) => Promise<void>;
  modifyWaypoint: (data?: any) => Promise<void>;
  createWaypoint: (data?: any) => Promise<void>;
}

const useWaypointStore = create<WaypointStore>((set, get) => ({
  isOpenWaypointPop: (false),
  SrchValue: (""),
  pageNo: (1),
  cntTotalList: (0),
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