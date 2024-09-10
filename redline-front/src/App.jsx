import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './components/LoginPage';
import HomePage from './components/HomePage';

function App() {
  const token = localStorage.getItem('token');

  return (
    <Router>
      <Routes>
        {/* Если токена нет, перенаправляем на страницу входа */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* Защищенный маршрут */}
        <Route path="/home" element={token ? <HomePage /> : <Navigate to="/login" />} />
        
        {/* Корневой маршрут */}
        <Route path="/" element={<Navigate to={token ? '/home' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
