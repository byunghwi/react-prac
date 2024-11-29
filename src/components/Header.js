import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/header.css'

export default function Header() {
  return (
    <div className='header'>
      <ul className='nav-links'>
        <li><Link to="/">HOME</Link></li>
      </ul>
      <button className='logout-button'>로그아웃</button>
    </div>
  )
}
