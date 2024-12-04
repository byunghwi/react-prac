
import { create } from 'zustand';
import apiService from '../api/apiService';

const useWarningStore = create((set, get) => ({

  getLimitList: async() => {
    try {
      let response = await apiService.loadLimitList();
      return response;
    } catch (error) {
      console.log(error);
    }
  },

  modifyLimit: async(data) => {
    try {
      let response = await apiService.modifyLimit(data);
      return response;
      // if(response.status == 200) {
      //   modalMsg.value = "저장 되었습니다.";
      // }else{
      //   modalMsg.value = response;
      // }  
    } catch (error) {
      console.log(error)
    }
  }
}))

export default useWarningStore;