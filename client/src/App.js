import React, { useEffect, useState } from 'react';
import { Routes, Route, BrowserRouter, useNavigate } from 'react-router-dom';
import LoginForm from './components/Auth/LoginForm';
import RegisterForm from './components/Auth/RegisterForm';
import CoachDashboard from './components/Dashboard/Coach/CoachDashboard';
import TraineeDashboard from './components/Dashboard/Trainee/TraineeDashboard';
import CalendarBooking from './components/Calendar/CalendarBooking';
import ListTrainees from './components/ListTrainees/ListTrainees';
import UserProfile from './components/Dashboard/Coach/UserProfile';
import { apiService, setAuthToken } from './api/apiService';
import Header from './components/Header/Header';

function App(props) {
  const [role, setRole] = useState(localStorage.getItem('role'));
  const navigate = useNavigate();
  const handleLogin = (role) => {
    setRole(role);
  };
  
  const handleLogout = () => {
    console.log("logout clicked");
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('id');
    localStorage.removeItem('username');
    localStorage.removeItem('name');
    setAuthToken(null);
    setRole(null);
    navigate("/")
  };

  return (
    <>
      {localStorage.getItem('role') && <Header onLogout={handleLogout}/>}
      <Routes>
        <Route path='/' element={<LoginForm onLogin={handleLogin}/>}/>

        <Route path='/register' element={<RegisterForm onLogin={handleLogin}/>}/>

        {/* הדפים שמוגנים עבור coach ו-trainee */}
        <Route path="/dashboard" element={ role === "coach" ? <CoachDashboard /> : <TraineeDashboard />} />

        {/* דפים נוספים שמוגנים */}
        <Route path="/calendar" element={<CalendarBooking />}/>
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/trainees" element={<ListTrainees />} />
      </Routes>
    </>
  );
}

export default App;
