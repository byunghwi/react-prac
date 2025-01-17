
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import '../styles/menu.css';
// import { useUserStore } from "@/stores/user.js";
// import { useCorridorStore } from "@/stores/corridor.js";
// import { useVertiportStore } from "@/stores/vertiport.js";
// import useWaypointStore from "@/stores/waypoint";
import useAuthStore from '../stores/auth';


export default function Menu() {

  // const storeUser = useUserStore();
  // const storeCorridor = useCorridorStore();
  // const storeVertiport = useVertiportStore();
  // const storeWaypoint = useWaypointStore();

  // const { SrchType: userSrchType, SrchValue: userSrchValue, pageNo: userpageNo, cntTotalList: usercntTotalList } = (storeUser);
  // const { SrchType: cdSrchType, SrchValue: cdSrchValue, pageNo: cdpageNo, cntTotalList: cdcntTotalList } = (storeCorridor);
  // const { SrchType: vpSrchType, SrchValue: vpSrchValue, pageNo: vppageNo, cntTotalList: vpcntTotalList } = (storeVertiport);
  // const { SrchValue: wpSrchValue, pageNo: wppageNo, cntTotalList: wpcntTotalList } = (storeWaypoint);
  const { isFoldMenu } = useAuthStore();

  useEffect(() => {
    const initValue = () => {
      // userSrchType.value = "";
      // userSrchValue.value = "";
      // userpageNo.value = 1;
      // usercntTotalList.value = 0;

      // cdSrchType.value = "";
      // cdSrchValue.value = "";
      // cdpageNo.value = 1;
      // cdcntTotalList.value = 0;

      // vpSrchType.value = "";
      // vpSrchValue.value = "";
      // vppageNo.value = 1;
      // vpcntTotalList.value = 0;

      // wpSrchValue = "";
      // wppageNo = 1;
      // wpcntTotalList = 0;
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