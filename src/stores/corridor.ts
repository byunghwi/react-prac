import { create } from 'zustand';
import apiService from '../api/apiService';
import Constants from "../utils/constants";
import useModalStore from "./modal";

interface CorridorStore {
  cntTotalList: number,
  pageNo: number,
  setpageNo: (val:number) => void,
  SrchType: any,
  setSrchType: (val?:string) => void,
  SrchValue: any,
  setSrchValue: (val?:string) => void,
  corridorList: any,
  corridorDetail: any,
  setcorridorDetail: (newValue:any) => void,
  selectedCorridors: any,
  mySector: any,
  setmySector: (newValue:any) => void,
  sortMySector: (compareFunction) => any,
  corridorTypes: any,
  setcorridorTypes: (newValue:any) => void,
  getCorridorList: (isPaging) => void,
  loadCorridorDetail: (code) => void,
  getCorridorDetail: (id) => void,
  updateCorridorDetail: () => void,
  insertCorridorDetail: (data) => void,
  allCorridors: () => void,
}

const useCorridorStore = create<CorridorStore>((set, get) => ({
  cntTotalList: 0,
  pageNo: 1,
  setpageNo: (val:number) => set({ pageNo: val}),
  SrchType: '',
  setSrchType: (val?:string) => set({ SrchType: val}),
  SrchValue: '',
  setSrchValue: (val?:string) => set({ SrchValue: val}),
  corridorList: [],
  corridorDetail: {},
  setcorridorDetail: (newValue:any) => set({ corridorDetail: newValue}),
  selectedCorridors: [],
  mySector: [],
  setmySector: (newValue:any) => set({ mySector: newValue}),
  sortMySector: (compareFunction) =>
    set((state) => ({
      mySector: [...state.mySector].sort(compareFunction),
    })),
  corridorTypes: ([]),
  setcorridorTypes: (newValue:any) => set({corridorTypes:newValue}),
  getCorridorList: async(isPaging) => {
    try {
      let params: any = {dataType: "JSON"}
      if(isPaging){
        params.pageNo = get().pageNo;
        params.numOfRows = Constants.NumOfRows;
      }
      params.srchType = get().SrchType;
      params.srchValue = get().SrchValue;
      let result = await apiService.loadCorridorList(params);
      set({
        corridorList: result.corridorList,
        cntTotalList: result.totalCount
      })
    } catch (error) {
      console.log(error);
    }
  },
  loadCorridorDetail: async(code) => {
    return apiService.loadCorridorDetail(code);
  },
  getCorridorDetail: async(id) => {
    try {
      let response = await apiService.loadCorridorDetail(id);
      if(response) {
        console.log("response", response)
        set({corridorDetail: response})
      }
    } catch (error) {
      console.log(error);
    }
  },
  updateCorridorDetail: async() => {
    let result = await apiService.updateCorridorDetail(get().corridorDetail);
    useModalStore.getState().isModalOK = true;
    if(result === 200) {
      useModalStore.getState().modalMsg = "수정 되었습니다.";
    }else{
      useModalStore.getState().modalMsg = result;
    }
    useModalStore.getState().openModal();
  },
  insertCorridorDetail: async(data) => {
    let result = await apiService.insertCorridorDetail(data);
    useModalStore.getState().isModalOK = true;
    if(result === 200) {
      useModalStore.getState().modalMsg = "등록 되었습니다.";
    }else{
      useModalStore.getState().modalMsg = result;
    }
    useModalStore.getState().openModal();
  },
  allCorridors: async() => {
    try {
      let result = await apiService.loadCorridorList({detail:true});
      set({corridorList: result.corridorList})
    } catch (error) {
      console.log(error);
    }
  },

}))

export default useCorridorStore;