import React, { useState } from 'react';
// import { TextField, Button, Typography, Alert } from '@mui/material';
import { apiService } from '../../api/apiService';
import { useNavigate } from 'react-router-dom';
import { Box, Button, TextField, Typography, MenuItem, Select, InputLabel } from '@mui/material';

const CreateTrainee = ({fetchTrainees}) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
      fn: '',
      ln: '',
      username: '',
      password: '',
      birthday: '',
      phoneNumber: '',
      maxMeetingsPerWeek: '',
    });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      
      const response = await apiService.post('/auth/create-trainee', formData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setSuccessMessage(response.data.message);
      setErrorMessage('');
      setFormData({ fn: '',
        ln: '',
        username: '',
        password: '',
        birthday: '',
        phoneNumber: '',
        maxMeetingsPerWeek: '',

      });
      // setInterval(()=>navigate("/dashboard"),2000);
    } catch (err) {
      setSuccessMessage('')
      setErrorMessage(err.response?.data?.message || 'שגיאה ביצירת משתמש.');
    }
    fetchTrainees()
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto' }}>
      
      <Box
      component="form"
      onSubmit={handleSubmit}
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
        רישום מתאמן
      </Typography>
      <TextField
        fullWidth
        label="שם משתמש"
        name="username"
        value={formData.username}
        onChange={handleChange}
        sx={{ marginBottom: '15px' }}
      />
      <TextField
        type={showPassword? "text" : "password"}
        label="סיסמה"
        name="password"
        value={formData.password}
        onChange={handleChange}
        sx={{ marginBottom: '15px' }}
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
        </button>
      <TextField
        fullWidth
        label="שם פרטי"
        name="fn"
        value={formData.fn}
        onChange={handleChange}
        sx={{ marginBottom: '15px' }}
      />
      <TextField
        fullWidth
        label="שם משפחה"
        name="ln"
        value={formData.ln}
        onChange={handleChange}
        sx={{ marginBottom: '15px' }}
      />
      <Typography variant="h5" >
        בחירת כמות מקסימלית של פגישות בשבוע למתאמן
      </Typography>
      <Select
      labelId="demo-simple-select-label"
      id="demo-simple-select"
      value={formData.maxMeetingsPerWeek}
      name="maxMeetingsPerWeek"
      label="בחר מקסימום פגישות בשבוע"
      onChange={handleChange}
      >
      <MenuItem value={1}>1</MenuItem>
      <MenuItem value={2}>2</MenuItem>
      <MenuItem value={3}>3</MenuItem>
      <MenuItem value={4}>4</MenuItem>
      <MenuItem value={5}>5</MenuItem>
      <MenuItem value={6}>6</MenuItem>
      <MenuItem value={7}>7</MenuItem>
      </Select>
      <TextField
        fullWidth
        type="date"
        label="תאריך לידה"
        name="birthday"
        value={formData.birthday}
        placeholder="DD/MM/YYYY"
        pattern="([0-2][0-9]|(3)[0-1])\/([0][1-9]|(1)[0-2])\/([0-9]{4})" 
        onChange={handleChange}
        sx={{ marginBottom: '15px' }}
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
      />
      {errorMessage && <Typography color="error" sx={{ marginBottom: '10px' }}>{errorMessage}</Typography>}
      <Button fullWidth type="submit" variant="contained" color="primary">
        יצירה
      </Button>
    </Box>
    </div>
  );
};

export default CreateTrainee;
