
import '../styles/menu.css';

export default function Menu() {
  return (
    <div className="left">
      <ul>
        <li>관제 배정 관리</li>
        <li>접속 이력</li>
        <li>권한 관리</li>
      </ul>
      <ul>
        <li>버티포트 관리</li>
        <li>회랑 관리</li>
        <li>경보 임계치 설정</li>
      </ul>
      <ul>
        <li>비행 기록 리뷰</li>
      </ul>
    </div>
  )
}