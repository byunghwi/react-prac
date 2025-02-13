import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import AdminMain from '../components/Main';
import Login from '../components/Login';
import UserList from '../pages/user/List'
import UserRegister from '../pages/user/Register'
import UserModify from '../pages/user/Modify'
import UserHistory from '../pages/user/History'
import UserAuth from '../pages/user/Auth'
import AlertLimits from '../pages/alert/Limits'
import VertiportList from '../pages/vertiport/List'
import VertiportRegister from '../pages/vertiport/Register'
import VertiportModify from '../pages/vertiport/Modify'
import CorridorList from '../pages/corridor/List';
import CorridorRegister from '../pages/corridor/Register';
import CorridorModify from '../pages/corridor/Modify';
import Playback from '../pages/playback/Playback';

function AppRoutes() {
  const location = useLocation();
  console.log(`현재 URL: ${location.pathname}, 세션:${sessionStorage.getItem('user')}` );
  const isAuthenticated = !!sessionStorage.getItem('user'); // 로그인 상태 확인

  return (
      <Routes>
        {/* 루트 경로 */}
        <Route
          path="/"
          element={
            isAuthenticated ? <AdminMain /> : <Navigate to="/login" replace />
          }
        />

        {/* 로그인 페이지 */}
        <Route
          path="/login"
          element={
            isAuthenticated ? <Navigate to="/" replace /> : <Login />
          }
        />

        <Route path="/user" element={isAuthenticated ? <AdminMain /> : <Navigate to="/login" replace /> }>
          <Route path="list" element={<UserList />} />
          <Route path="register" element={<UserRegister />} />
          <Route path="detail/:id" element={<UserModify />} />
          <Route path="history" element={<UserHistory />} />
          <Route path="auth" element={<UserAuth />} />
        </Route>

        <Route path="/vertiport" element={isAuthenticated ? <AdminMain /> : <Navigate to="/login" replace /> }>
          <Route path="list" element={<VertiportList />} />
          <Route path="register" element={<VertiportRegister />} />
          <Route path="detail/:id" element={<VertiportModify />} />
        </Route>

        <Route path="/corridor" element={isAuthenticated ? <AdminMain /> : <Navigate to="/login" replace /> }>
          <Route path="list" element={<CorridorList />} />
          <Route path="register" element={<CorridorRegister />} />
          <Route path="detail/:id" element={<CorridorModify />} />
        </Route>

        <Route path="/alert" element={isAuthenticated ? <AdminMain /> : <Navigate to="/login" replace /> }>
          <Route path="Limits" element={<AlertLimits />} />
        </Route>

        <Route path="/playback" element={<AdminMain />}>
          <Route path="list" element={<Playback />} />
        </Route>

      </Routes>
  );
}

export default AppRoutes;