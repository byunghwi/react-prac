
import { Link } from 'react-router-dom';
import '../styles/menu.css';

export default function Menu() {
  
  return (
    <div className="left">
      <ul>
        <li><Link to="/user/list">관제 배정 관리</Link></li>
        <li>접속 이력</li>
        <li><Link to="/auth/auth">권한 관리</Link></li>
      </ul>
      <ul>
        <li><Link to="/vertiport/list">버티포트 관리</Link></li>
        <li><Link to="/corridor/list">회랑 관리</Link></li>
        <li><Link to="/alertLimits">경보 임계치 설정</Link></li>
      </ul>
      <ul>
        <li><Link to="/playback/list">비행 기록 리뷰</Link></li>
      </ul>
    </div>
  )
}