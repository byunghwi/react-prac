
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/menu.css';
import useSettingStore from "../stores/setting";
import useAuthStore from '../stores/auth';

export default function Menu() {

  const { isFoldMenu } = useAuthStore();
  const { setSrchType, setSrchValue, setpageNo, setcntTotalList, setsharedData } = useSettingStore();

  useEffect(() => {
    initValue();
  },[]);

  const initValue = () => {
    setSrchType("");
    setSrchValue("");
    setpageNo(1);
    setcntTotalList(0);
    setsharedData(null);
  }

  return (
    <div className={`left ${!isFoldMenu ? 'on' : ''}`}>
      <ul>
        <li><Link to="/">UAM Admin</Link></li>
      </ul>
      <ul>
        <li><Link to="/user/list">관제 배정 관리</Link></li>
        <li><Link to="/user/history">접속 이력</Link></li>
        <li><Link to="/user/auth">권한 관리</Link></li>
      </ul>
      <ul>
        <li><Link to="/vertiport/list">버티포트 관리</Link></li>
        <li><Link to="/corridor/list">회랑 관리</Link></li>
        <li><Link to="/sidcvfp/list">SID / CVFP 관리</Link></li>
        <li><Link to="/waypoint/list">waypoint 관리</Link></li>
        <li><Link to="/alert/Limits">경보 임계치 설정</Link></li>
        <li><Link to="/notam/list">NOTAM</Link></li>
        </ul>
      <ul>
        <li><Link to="/playback/list">비행 기록 리뷰</Link></li>
      </ul>
    </div>
  )
}