import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes'; // 라우트 설정 가져오기

export default function App() {
  return (
    <div id='app'>
      <Router>
        <AppRoutes />
      </Router>
    </div>
  )
}
