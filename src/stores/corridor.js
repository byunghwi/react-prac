import { create } from 'zustand';
import apiService from '../api/apiService';

const useCorridorStore = create((set, get) => ({
  corridorList: [],
  corridorDetail: {},
  selectedCorridors: [],
  mySector: [],
  SrchType: "",
  SrchValue: "",
  pageNo: 1,
  cntTotalList: 0,

  actions: {
    getCorridorList: async (isPaging) => {
      try {
        const { pageNo, SrchType, SrchValue } = get();
        let params = { dataType: "JSON" }
        if (isPaging) {
          params.pageNo = pageNo;
          params.numOfRows = 10;
        }
        params.srchType = SrchType;
        params.srchValue = SrchValue;
        let result = await apiService.loadCorridorList(params);
        set({
          corridorList: result.corridorList,
          cntTotalList: result.totalCount
        })
      } catch (error) {
        console.log(error);
      }
    },
    setCorridorDetail: (param) => set({corridorDetail: param}),
    setMysector: (param) => set({mySector:param})
  }

}))

export default useCorridorStore;