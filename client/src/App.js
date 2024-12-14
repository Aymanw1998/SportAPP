import React, { useState } from 'react';
import { Routes, Route, BrowserRouter } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import CoachDashboard from './components/Dashboard/Coach/CoachDashboard';
import TraineeDashboard from './components/Dashboard/Trainee/TraineeDashboard';
import CalendarBooking from './components/Calendar/CalendarBooking';
import ListTrainees from './components/ListTrainees/ListTrainees';
import UserProfile from './components/Dashboard/Coach/UserProfile';
import { setAuthToken } from './api/apiService';
import Header from './components/Header/Header';

function App(props) {
  const [role, setRole] = useState(localStorage.getItem('role'));

  const handleLogin = (role) => {
    setRole(role);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    setAuthToken(null);
    setRole(null);
  };

  return (
    <BrowserRouter>
      {(role === "coach" || role === "trainee") && <Header onLogout={handleLogout}/>}

      <Routes>
        <Route path='/' element={<LoginForm onLogin={handleLogin}/>}/>

        <Route path='/register' element={<RegisterForm onLogin={handleLogin}/>}/>

        {/* הדפים שמוגנים עבור coach ו-trainee */}
        {role === "coach" && <Route path="/dashboard" element={<CoachDashboard />} />}
        {role === "trainee" && <Route path="/dashboard" element={<TraineeDashboard />} />}

        {/* דפים נוספים שמוגנים */}
        <Route path="/calendar" element={<CalendarBooking />}/>
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/trainees" element={<ListTrainees />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
