import { create } from 'zustand';
import apiService from '../api/apiService';

const useCorridorStore = create((set, get) => ({
  corridorList: [],
  corridorDetail: {},
  selectedCorridors: [],
  mySector: [],
  cntTotalList: 0,

  actions: {
    getCorridorList: async (isPaging, pparams) => {
      try {
        let params = { dataType: "JSON" }
        if (isPaging) {
          params.pageNo = pparams.pageNo;
          params.numOfRows = 10;
        }
        params.srchType = pparams.srchType;
        params.srchValue = pparams.srchValue;
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
    setMySector: (param) => set({mySector:param})
  }

}))

export default useCorridorStore;