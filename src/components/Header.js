import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import '../styles/header.css'
import useAuthStore from '../stores/auth'

export default function Header() {
  const navigate = useNavigate(); // 로그인 후 이동을 위한 네비게이션 훅
  const logout = useAuthStore((state) => state.logout); // zustand 스토어의 로그인 함수 가져오기

  const handleLogout = async() => {
    const result = await logout();

    if (result === "success") {
      navigate("/login"); // 성공적으로 로그인하면 user/list 페이지로 이동
    }
  }
  
  return (
    <div className='header'>
      <ul className='nav-links'>
        <li><Link to="/">HOME</Link></li>
      </ul>
      <button className='logout-button' onClick={handleLogout}>로그아웃</button>
    </div>
  )
}
