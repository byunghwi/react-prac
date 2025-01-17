import { React, useState, useEffect } from "react";
import { Link, useNavigate } from 'react-router-dom';
import '../styles/header.css'
import useAuthStore from '../stores/auth'

export default function Header() {
  const navigate = useNavigate(); // 로그인 후 이동을 위한 네비게이션 훅
  const logout = useAuthStore((state) => state.logout); // zustand 스토어의 로그인 함수 가져오기
  const foldMenu = useAuthStore((state) => state.foldMenu); // zustand 스토어의 로그인 함수 가져오기
  const { getSessionData, loginId } = useAuthStore();

  let isOpenMyInfo = (false)

  useEffect(() => {
    getSessionData();
  }, []);

  const [isShowLogout, setisShowLogout] = useState(false);

  const handleLogout = async() => {
    const result = await logout();
    if (result === "success") {
      navigate("/login"); // 성공적으로 로그인하면 user/list 페이지로 이동
    }
  }

  const handleMouseLeave = () => {
    setisShowLogout(false)
  };

  const handleMouseOver = () => {
    setisShowLogout(true)
  };

  const closeMyInfo = () => {
    isOpenMyInfo.value = false;
  }


  return (
    <ul className='header'>
      <li><button className="foldBtn" onClick={foldMenu}></button></li>
      <li className="info" onMouseLeave={handleMouseLeave}>
        <div className="on"><button className='logout-button' onMouseOver={handleMouseOver} onClick={()=>isOpenMyInfo=true}>{ loginId }</button></div>
        <div className={`${isShowLogout ? 'on' : ''}`}><button className='logout-button' onClick={handleLogout}>로그아웃</button></div>
      </li>
    </ul>
    // <MyInfo v-if="isOpenMyInfo" :isOpen="isOpenMyInfo" @closeMyInfo="closeMyInfo" />
  )
}
