import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminMain from '../components/Main';
import Login from '../components/Login';

function AppRoutes() {
  console.log('로그인 상태 확인: ', sessionStorage.getItem('user'));
  const isAuthenticated = !!sessionStorage.getItem('user'); // 로그인 상태 확인

  return (
    <Router>
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

        {/* <Route path="/user" element={<AdminMain />}>
          <Route path="list" element={<UserList />} />
          <Route path="register" element={<UserRegister />} />
          <Route path="history" element={<UserHistory />} />
          <Route path="auth" element={<UserAuth />} />
          <Route path="detail/:id" element={<UserModify />} />
        </Route>

       
        <Route path="/vertiport" element={<AdminMain />}>
          <Route path="list" element={<VertiportList />} />
          <Route path="register" element={<VertiportRegister />} />
          <Route path="detail/:id" element={<VertiportModify />} />
        </Route>

       
        <Route path="/corridor" element={<AdminMain />}>
          <Route path="list" element={<CorridorList />} />
          <Route path="register" element={<CorridorRegister />} />
          <Route path="detail/:id" element={<CorridorModify />} />
        </Route>

        
        <Route path="/alertLimits" element={<AdminMain />}>
          <Route path="" element={<AlertLimits />} />
        </Route> */}
      </Routes>
    </Router>
  );
}

export default AppRoutes;