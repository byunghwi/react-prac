import Header from './Header'
import Menu from './Menu'
import { Outlet } from 'react-router-dom';
import '../styles/main.css';
import useModalStore from '../stores/modal';
import Modal from './Modal';

export default function Main() {
  const {isModalOpen, actions: {closeModal}} = useModalStore();

  return (
    <>
      <Header />
      <Menu />
      <div className="right">
        <Outlet />
      </div>
      <Modal isOpen={isModalOpen} onClose={closeModal}/>
    </>
  )
}