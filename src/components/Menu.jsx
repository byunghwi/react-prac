
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/menu.css';
import useUserStore from "../stores/user";
import useCorridorStore from "../stores/corridor";
import useVertiportStore from "../stores/vertiport";
import useWaypointStore from "../stores/waypoint";
import useAuthStore from '../stores/auth';


export default function Menu() {

  const { isFoldMenu } = useAuthStore();

  useEffect(() => {
    const initValue = () => {
      useUserStore.getState().setSrchType("");
      useUserStore.getState().setSrchValue("");
      useUserStore.getState().setpageNo(1);
      useUserStore.getState().cntTotalList = 0;

      useCorridorStore.getState().setSrchType("");
      useCorridorStore.getState().setSrchValue("");
      useCorridorStore.getState().setpageNo(1);
      useCorridorStore.getState().cntTotalList = 0;

      useVertiportStore.getState().setSrchType("");
      useVertiportStore.getState().setSrchValue("");
      useVertiportStore.getState().setpageNo(1);
      useVertiportStore.getState().cntTotalList = 0;

      useWaypointStore.getState().setSrchType("");
      useWaypointStore.getState().setSrchValue("");
      useWaypointStore.getState().setpageNo(1);
      useWaypointStore.getState().cntTotalList = 0;
    }
    initValue();
  });

  return (
    <div className={`left ${!isFoldMenu ? 'on' : ''}`}>
      <ul>
        <li><Link to="/">UAM Admin</Link></li>
      </ul>
      <ul>
        <li><Link to="/user/list">관제 배정 관리</Link></li>
        <li><Link to="/user/history">접속 이력</Link></li>
        <li><Link to="/auth/auth">권한 관리</Link></li>
      </ul>
      <ul>
        <li><Link to="/vertiport/list">버티포트 관리</Link></li>
        <li><Link to="/corridor/list">회랑 관리</Link></li>
        <li><Link to="/sidcvfp/list">SID / CVFP 관리</Link></li>
        <li><Link to="/waypoint/list">waypoint 관리</Link></li>
        <li><Link to="/alertLimits">경보 임계치 설정</Link></li>
        <li><Link to="/notam/list">NOTAM</Link></li>
        </ul>
      <ul>
        <li><Link to="/playback/list">비행 기록 리뷰</Link></li>
      </ul>
    </div>
  )
}