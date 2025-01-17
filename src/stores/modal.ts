import { create } from 'zustand';

interface ModalStore {
  isModalOpen: boolean,
  modalTitle: string,
  modalMsg: string,
  isModalOK: boolean,
  isLoading: boolean,
  openModal: (title?:any, msg?:any, isOK?:any) => void,
  closeModal: () => void,
  showLoading: () => void,
  hideLoading: () => void,
  setModalOK: (value:any) => void,
}

const useModalStore = create<ModalStore>((set, get) => ({
  isModalOpen: false,
  modalTitle: "",
  modalMsg: "",
  isModalOK: false,
  isLoading: false,
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
  setModalOK: (value:any) => {
    set({isModalOK: value})
  }
}))

export default useModalStore;