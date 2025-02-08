import React, { useState, useEffect } from 'react';
// import { TextField, Button, Typography, Alert } from '@mui/material';
import { apiService } from '../../api/apiService';
// import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, MenuItem, Select } from '@mui/material';

const UpdateTrainee = ({id, fetchTrainees}) => {
    const [formData, setFormData] = useState({
      _id: '',
      fn: '',
      ln: '',
      username: '',
      password: '',
      birthday: '',
      phoneNumber: '',
      maxMeetingsPerWeek: '',
    });
  const [errorMessage, setErrorMessage] = useState('');
  // console.log("id", id)
  useEffect(() => {
    // שליפת נתונים מהשרת
    const fetchUserProfile = async () => {
      try {
        const response = await apiService.get('/auth/myTrainee');
        //console.log(response.data.filter(t => t._id === id)[0]);
        setFormData(response.data.filter(t => t._id === id)[0]);
      } catch (error) {
        console.error('Error fetching profile data', error);
      }
    };
    fetchUserProfile();
  }, [id]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
        //console.log(localStorage.getItem('token'), localStorage.getItem('role'))
      const response = await apiService.put('/auth/myTrainee', formData);
      setErrorMessage('');
      setFormData({ 
        ...response.data,
        
      });
      // setInterval(()=>navigate("/dashboard"),2000);
    } catch (err) {
      setErrorMessage(err.response?.data?.message || 'שגיאה בעדכון משתמש.');
    }
    fetchTrainees();
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: '400px', margin: 'auto', marginTop: '50px', padding: '20px', border: '1px solid #ccc', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',}}>
        <Typography variant="h5" sx={{ textAlign: 'center', marginBottom: '20px' }}>עדכון מתאמן</Typography>
          <TextField fullWidth label="שם משתמש" name="username" value={formData.username} onChange={handleChange} sx={{ marginBottom: '15px' }}/>
          <TextField fullWidth label="שם פרטי" name="fn" value={formData.fn} onChange={handleChange} sx={{ marginBottom: '15px' }}/>
          <TextField fullWidth label="שם משפחה" name="ln" value={formData.ln} onChange={handleChange} sx={{ marginBottom: '15px' }}/>
        <Typography variant="h5" >בחירת כמות מקסימלית של פגישות בשבוע למתאמן</Typography>
        <Select labelId="demo-simple-select-label" id="demo-simple-select" value={formData.maxMeetingsPerWeek} name="maxMeetingsPerWeek" label="בחר מקסימום פגישות בשבוע" onChange={handleChange}>
          <MenuItem value={1}>1</MenuItem>
          <MenuItem value={2}>2</MenuItem>
          <MenuItem value={3}>3</MenuItem>
          <MenuItem value={4}>4</MenuItem>
          <MenuItem value={5}>5</MenuItem>
          <MenuItem value={6}>6</MenuItem>
          <MenuItem value={7}>7</MenuItem>
        </Select>
        <TextField fullWidth type="date" label="תאריך לידה" name="birthday" value={formData.birthday} placeholder="DD/MM/YYYY" pattern="([0-2][0-9]|(3)[0-1])\/([0][1-9]|(1)[0-2])\/([0-9]{4})" onChange={handleChange} sx={{ marginBottom: '15px' }}/>
        <TextField fullWidth type="tl" label="מס טלפון" placeholder="לדוגמה: 052-1234567" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} sx={{ marginBottom: '15px' }}/>
        {errorMessage && <Typography color="error" sx={{ marginBottom: '10px' }}>{errorMessage}</Typography>}
        <Button fullWidth type="submit" variant="contained" color="primary">עדכון</Button>
      </Box>
    </div>
  );
};

export default UpdateTrainee;
