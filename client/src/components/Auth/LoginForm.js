import React, { useEffect, useState } from 'react';
import { apiService, setAuthToken } from '../../api/apiService';
import { Box, Button, TextField, Typography,Link } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const LoginForm = ({ onLogin }) => {
    const [isLoading, setIsLoading] = useState(false);
  

  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  useEffect(()=>{
    console.log("Environment Variables:", process.env.URL_SERVER);
    if(localStorage.getItem("token") && localStorage.getItem("role")){
        navigate("/dashboard")
    }
  },[])
  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    setError('');
    try {
      
        // console.log(username, password)
      const { data } = await apiService.post('/auth/login', { username, password });
      // console.log("user:", data)
      const { token, role, id } = data;
      //console.log(token,role)
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
        כניסה למערכת
      </Typography>
      <TextField
        fullWidth
        type="text"
        label="שם משתמש"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        sx={{ marginBottom: '15px' }}
      />
      <TextField
        fullWidth
        type={showPassword? "text" : "password"}
        label="סיסמה"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
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
      {error && <Typography color="error" sx={{ marginBottom: '10px' }}>{error}</Typography>}
      <Button fullWidth type="submit" variant="contained" color="primary">
        Login
      </Button>
      <Typography variant="h5" sx={{ textAlign: 'center', margin: '20px' }}>
        ***************************
      </Typography>
      <Typography variant="h6" sx={{ textAlign: 'center', margin: '20px' }}>
      <Link type='button' underline="hover" onClick={()=>navigate("/register")}>להרשמה כמאמן לחץ כאן</Link>
      </Typography>

    </Box>
  );
};

export default LoginForm;
