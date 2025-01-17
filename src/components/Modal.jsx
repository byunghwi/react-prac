import { useState } from "react";
import useModalStore from "../stores/modal";
import "../styles/modal.css";

export default function Modal({ isOpen, onClose }) {
  const {
    modalTitle,
    modalMsg,
    isModalOK,
    isLoading,
    setModalOK,
  } = useModalStore();

  const closeModal = () => {
    onClose();
  };

  const closeModalOK = () => {
    onClose();
    setModalOK(false);
  };

  return (
    <>
      {isOpen && (
        <div className="modal-overlay">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>{modalTitle}</h2>
            <p>{modalMsg}</p>
            {isModalOK ? (
              <button className="ok-button" onClick={closeModalOK}>
                확인1
              </button>
            ) : (
              <button className="ok-button" onClick={closeModal}>
                확인2
              </button>
            )}
          </div>
        </div>
      )}
      {isLoading && (
        <div className="spinner-overlay">
          <div className="spinner"></div>
        </div>
      )}
    </>
  );
}
