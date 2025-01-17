import Header from './Header'
import Menu from './Menu'
import { Outlet } from 'react-router-dom';
import '../styles/main.css';
import useModalStore from '../stores/modal';
import Modal from './Modal';

export default function Main() {
  const {isModalOpen, closeModal} = useModalStore();

  return (
    <>
      <Menu />
      <div className="right">
        <Header />
        <Outlet />
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}/>
    </>
  )
}