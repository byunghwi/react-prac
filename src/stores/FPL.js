import { create } from "zustand";

const useFPLStore = create((set, get) => {
  return {
    FPLList: [],
    isDetailFPLView: false,
    FPLDetail: {},
    actions: {

    }
  }
})

export default useFPLStore;