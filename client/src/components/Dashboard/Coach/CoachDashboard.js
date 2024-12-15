import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiService } from '../../../api/apiService';

const CoachDashboard = () => {
  const [me, setMe] = useState();
  useEffect(()=>console.log("me"),[me]);

  const ftechMe = async () => {
    
    try {
      const me = await apiService.get('/auth/me', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setMe(me.data);
    } catch (err) {
      console.error('Error fetching me:', err);
    }
  };

  useEffect(() => {
    ftechMe();
  }, []);


  // מוסיף אירוע לכל כפתור Dropdown
document.querySelectorAll('.dropdown-btn').forEach(button => {
  button.addEventListener('click', () => {
      // בוחר את התוכן הקשור לכפתור
      const content = button.nextElementSibling;
      //console.log(content.style);
      // החלפת מצב תצוגה באמצעות class
      content.classList.toggle('active');
      //console.log(content.style);
  });
});

  return (
    <div>
      <h1>ברוך הבאה למערכת האישית שלך</h1>
      {me && <h1>{me.fn + " " + me.ln} בתפקיד {me.role}</h1>}
    </div>
  );
};

export default CoachDashboard;
