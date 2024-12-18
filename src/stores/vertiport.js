import { create } from 'zustand';
import apiService from '../api/apiService';

const useVertiportStore = create((set, get) => ({
  vertiportList:[],
  vertiportDetail:{},
  cntTotalList: 0,
  isMemoVP:false,
  selectedVertiports: [],

  actions: {
    getVertiportList: async(isPaging, pparams) => {
      try {
        let params = {dataType: "JSON"}
        if(isPaging){
          params.pageNo = pparams.pageNo;
          params.numOfRows = 10;
        }
        params.srchType = pparams.srchType;
        params.srchValue = pparams.srchValue;
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