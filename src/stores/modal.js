import { create } from 'zustand';

const useModalStore = create((set, get) => ({
  isModalOpen: false,
  modalTitle: "",
  modalMsg: "",
  isModalOK: false,
  isLoading: false,

  actions: {
    openModal: (title='', msg='', isOK=false) => {
      set({
        isModalOpen: true,
        modalTitle: title,
        modalMsg: msg,
        isModalOK: isOK
      })
    },
    closeModal: () => {
      set({isModalOpen: false})
    }, 
    showLoading: () => {
      set({ isLoading: true });
    },
    hideLoading: () => {
      set({isLoading: false});
    },
    setModalOK: (value) =>
      set({isModalOK: value}),
    }
}))

export default useModalStore;