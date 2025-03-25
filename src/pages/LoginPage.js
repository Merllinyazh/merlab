import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Input from '../components/common/Input';
import Button from '../components/common/Button';



const LoginPage = () => {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ email: '', password: '' });
 
  const styles = {
    container: {
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundImage: "url('public/assets/Login.png')",
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat',
    },
    form: {
      backgroundColor: 'var(--white)',
      padding: '40px',
      borderRadius: '12px',
      width: '400px',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    },
    title: {
      textAlign: 'center',
      marginBottom: '32px',
      color: 'var(--text-primary)',
    },
    forgotPassword: {
      textAlign: 'center',
      marginTop: '16px',
    },
    link: {
      color: 'var(--primary-color)',
      textDecoration: 'none',
    },
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Add login logic here
    navigate('/dashboard');
  };

  return (
    <div style={styles.container}>
      <div style={styles.form}>
        <h1 style={styles.title}>Login</h1>
        <form onSubmit={handleSubmit}>
          <Input
            label="Email"
            type="email"
            value={credentials.email}
            onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          />
          <Input
            label="Password"
            type="password"
            value={credentials.password}
            onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          />
          <Button type="submit" fullWidth>
            Login
          </Button>
        </form>
        <div style={styles.forgotPassword}>
          <a href="#" style={styles.link}>Forgot password?</a>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;