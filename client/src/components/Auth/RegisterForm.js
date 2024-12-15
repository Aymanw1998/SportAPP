import React, { useState } from 'react';
import { apiService, setAuthToken} from '../../api/apiService';
import { Box, Button, TextField, Typography, Link, } from '@mui/material';
import { useNavigate } from 'react-router-dom';
const RegisterForm = ({onLogin}) => {
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fn: '',
    ln: '',
    username: '',
    password: '',
    birthday: '',
    phoneNumber: '',
    role: 'coach',
  });
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    setError('');
    try {
      if(formData.fn.length == 0 || formData.ln.length == 0 || formData.username.length == 0 || formData.password.length == 0
        || formData.birthday.length == 0 || formData.phoneNumber.length == 0)
        {setError("אחד מהשדות ריק"); return;}
  
        // אימות שהמספר תואם לפורמט של טלפון ישראלי
        const phoneRegex = /^05\d{8}$/; // רק מספרי טלפון ישראלים בפורמט 05X-XXXXXXX
        if (phoneRegex.test(formData.phoneNumber)) {
            //console.log('Phone is valid:', formData.phoneNumber);
        } else {
            alert('מספר טלפון לא תקין');
            return;
        }
        //console.log("formData for register", formData);
      await apiService.post('/auth/register', formData);
      alert('Registration successful!');
        try {
          const { data } = await apiService.post('/auth/login', { username: formData.username, password: formData.password });
          const { token, role, id } = data;
          localStorage.setItem('token', token);
          localStorage.setItem('role', role);
          localStorage.setItem('id', id);
          setAuthToken(token);
          await onLogin(role);
          navigate("/dashboard")
        } catch (err) {
          console.error(err);
          setError(err.response?.data?.message || 'Login failed');
         } finally {
          setIsLoading(false); // סיום טעינה
        }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
  } finally {
    setIsLoading(false); // סיום טעינה
  }
  };

  return (
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
        הרשמה כמאמן
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
      {error && <Typography color="error" sx={{ marginBottom: '10px' }}>{error}</Typography>}
      <Button fullWidth type="submit" variant="contained" color="primary">
        יצירה
      </Button>
      <Typography variant="h5" sx={{ textAlign: 'center', margin: '20px' }}>
        ***************************
      </Typography>
      <Typography variant="h6" sx={{ textAlign: 'center', margin: '20px' }}>
      <Link type='button' underline="hover" onClick={()=>navigate("/")}>קיים חשבון</Link>
      </Typography>
    </Box>
  );
};

export default RegisterForm;
