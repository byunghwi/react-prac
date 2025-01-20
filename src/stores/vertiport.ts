import { create } from 'zustand';
import apiService from '../api/apiService';
import Constants from "../utils/constants";
// import { cloneDeep } from 'lodash';
// import useMapStore from "./map";
import useModalStore from "./modal";
// import { useWeatherStore } from './weatherStore';


interface VertiportStore {
  cntTotalList: number,
  pageNo: number,
  setpageNo: (val:number) => void,
  SrchType: any,
  setSrchType: (val?:string) => void,
  SrchValue: any,
  setSrchValue: (val?:string) => void,
  vertiportList: any,
  vertiportDetail: any,
  isMemoVP: any,
  selectedVertiports: any,
  getVertiportList: (isPaging) => void,
  getVertiportDetail: (id) => void,
  updateVertiportDetail: () => void,
  insertVertiportDetail: (data) => void,
  deleteVertiport: (id) => void,
  visibleVPMemo: (id, close) => void,
}

const useVertiportStore = create<VertiportStore>((set, get) => ({
  cntTotalList: 0,
  pageNo: 1,
  setpageNo: (val:number) => set({ pageNo: val}),
  SrchType: '',
  setSrchType: (val?:string) => set({ SrchType: val}),
  SrchValue: '',
  setSrchValue: (val?:string) => set({ SrchValue: val}),

  // const storeMap = useMapStore();
  // const storeModal = useModalStore();
  // const storeWeather = useWeatherStore();

  // const { showVertiport } = storeMap;
  // const { openModal } = storeModal;
  // const { modalMsg, isModalOK} = storeToRefs(storeModal);

  vertiportList: ([]),
  vertiportDetail: ({}),
  isMemoVP: (false),
  selectedVertiports: ([]),
  getVertiportList: async(isPaging) => {
    try {
      let params: any = {dataType: "JSON"}
      if(isPaging){
        params.pageNo = get().pageNo;
        params.numOfRows = Constants.NumOfRows;
      }
      params.srchType = get().SrchType;
      params.srchValue = get().SrchValue;
      let result = await apiService.loadVertiportList(params);
      set({
        vertiportList: result.vertiportList,
        cntTotalList: result.totalCount
      })
    } catch (error) {
      console.log(error);
    }
  },
  getVertiportDetail: async(id) => {
    try {
      let response = await apiService.loadVertiportDetail(id);
      console.log("response", response)
      if(response) {
        set({vertiportDetail: response})
        // to do
      }
    } catch (error) {
      console.log(error);
    }
  },
  updateVertiportDetail: async() => {
    let result = await apiService.updateVertiportDetail(get().vertiportDetail);
    useModalStore.getState().isModalOK = true;
    if(result === 200) {
      useModalStore.getState().modalMsg = "수정 되었습니다.";
    }else{
      useModalStore.getState().modalMsg = result;
    }
    useModalStore.getState().openModal();
  },
  insertVertiportDetail: async(data) => {
    let result = await apiService.insertVertiportDetail(data);
    useModalStore.getState().isModalOK = true;
    if(result === 200) {
      useModalStore.getState().modalMsg = "등록 되었습니다.";
    }else{
      useModalStore.getState().modalMsg = result as any;
    }
    useModalStore.getState().openModal();
  },
  deleteVertiport: async(id) => {
    await apiService.deleteVertiport(id);
  },
  visibleVPMemo: async(id, close) =>{
    // to do
  },
}))

export default useVertiportStore;