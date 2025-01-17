import { BrowserRouter as Router } from 'react-router-dom';
import AppRoutes from './routes/routes'; // 라우트 설정 가져오기
import './assets/scss/dist/css/style.css';
import './App.css';

export default function App() {
  return (
    <div id='app' className='wrap-app'>
      <Router>
        <AppRoutes />
      </Router>
    </div>
  )
}
