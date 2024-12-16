import { create } from 'zustand';
import apiService from '../api/apiService';

const useVertiportStore = create((set, get) => ({
  vertiportList:[],
  vertiportDetail:{},
  SrchType:"",
  SrchValue: "",
  pageNo: 1,
  cntTotalList: 0,
  isMemoVP:false,
  selectedVertiports: [],

  actions: {
    getVertiportList: async(isPaging) => {
      try {
        const { pageNo, SrchType, SrchValue } = get();
        let params = {dataType: "JSON"}
        if(isPaging){
          params.pageNo = pageNo;
          params.numOfRows = 10;
        }
        params.srchType = SrchType;
        params.srchValue = SrchValue;
        let result = await apiService.loadVertiportList(params);
        set({
          vertiportList: result.vertiportList,
          cntTotalList: result.totalCount
        })
      } catch (error) {
        console.log(error);
      }
    },
  }
}))

export default useVertiportStore;