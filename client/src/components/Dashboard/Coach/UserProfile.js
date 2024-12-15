import React, { useEffect, useState } from 'react';
import { apiService } from '../../../api/apiService';
import { Box, TextField, Typography } from '@mui/material';
import { Modal, Button, Form } from "react-bootstrap";


const UserProfile = () => {
  const [formData, setFormData] = useState({
    _id:'',
    fn: '',
    ln:'',
    username:'',
    birthday: '',
    phoneNumber: '',
  });
  const [isLocked, setIsLocked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // שליפת נתונים מהשרת
    const fetchUserProfile = async () => {
      try {
        const response = await apiService.get('/auth/me', {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        //console.log(response.data);
        setFormData(response.data);
      } catch (error) {
        console.error('Error fetching profile data', error);
      }
    };
    fetchUserProfile();
  }, []);

  const deleteUser = async () => {
    try {
        const res = await apiService.delete(
        '/auth/',
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      alert('הפרופיל נמחק!');
      
    } catch (error) {
      console.error('Error saving profile', error);
      alert('שגיאה בשמירת הפרופיל');
    }
  }
  const updateUser = async () => {
    try {
        // אימות שהמספר תואם לפורמט של טלפון ישראלי
        const phoneRegex = /^05\d{8}$/; // רק מספרי טלפון ישראלים בפורמט 05X-XXXXXXX
        if (phoneRegex.test(formData.phoneNumber)) {
            //console.log('Phone is valid:', formData.phoneNumber);
        } else {
            alert('מספר טלפון לא תקין');
            return;
        }
        // console.log("token:", localStorage.getItem('token'))
      const res = await apiService.put(
        '/auth/me',
        { ...formData },
        { headers: { Authorization: `Bearer ${localStorage.getItem('token')}` } }
      );
      setFormData(res.data);
      setIsLocked(true);
      alert('הפרופיל נשמר בהצלחה!');
    } catch (error) {
      console.error('Error saving profile', error);
      alert('שגיאה בשמירת הפרופיל');
    }
  };

  const releaseCell = ()=> {
    setIsLocked(!isLocked);
  }
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };


  return (
        <Box
          component="form"
          onSubmit={()=>{}}
          sx={{
            maxWidth: '400px',
            margin: 'auto',
            marginTop: '50px',
            padding: '20px',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
          }}
        >
          <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: '20px' }}>
            פרופיל
          </Typography>
          <TextField
            fullWidth
            label="שם משתמש"
            name="username"
            value={formData.username}
            onChange={handleChange}
            sx={{ marginBottom: '15px' }}
            disabled={isLocked}
          />
          {/* <TextField
            type={showPassword ? "text" : "password"}
            label="סיסמה"
            name="password"
            value={formData.password}
            onChange={handleChange}
            sx={{ marginBottom: '15px' }}
            disabled={isLocked}
          />
                <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          {showPassword ? "👁️" : "🙈"}
          </button> */}
          <TextField
            fullWidth
            label="שם פרטי"
            name="fn"
            value={formData.fn}
            onChange={handleChange}
            sx={{ marginBottom: '15px' }}
            disabled={isLocked}
          />
          <TextField
            fullWidth
            label="שם משפחה"
            name="ln"
            value={formData.ln}
            onChange={handleChange}
            sx={{ marginBottom: '15px' }}
            disabled={isLocked}
          />
          <TextField
            type="date"
            fullWidth
            label="תאריך לידה"
            name="birthday"
            value={formData.birthday}
            placeholder="dd/mm/yyyy hh:mm"
            onChange={handleChange}
            sx={{ marginBottom: '15px' }}
            disabled={isLocked}
          />

          <TextField
            fullWidth
            type="tl"
            label="מס טלפון"
            placeholder="לדוגמה: 052-1234567"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            sx={{ marginBottom: '15px' }}
            disabled={isLocked}
          />
            <Button variant="danger" onClick={deleteUser}>
            מחק פרופיל
            </Button>
          <Button variant="secondary" onClick={releaseCell}>
            {isLocked ? "עדכון" : "ביטול"}
          </Button>
          {!isLocked && <Button variant="primary" onClick={updateUser}>
            שמור
          </Button>}
        </Box>
      );
};

export default UserProfile;
