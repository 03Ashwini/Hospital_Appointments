import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const res = await axios.post('http://127.0.0.1:8000/api/accounts/login/', credentials);
            localStorage.setItem('access_token', res.data.access);
            const role = res.data.user_type;

            if (role === 'superadmin' || res.data.is_staff) {
                navigate('/dashboard'); 
            } else if (role === 'patient') {
                navigate('/patient-home'); 
            } else if (role === 'hospital_admin') {
                navigate('/hospital-dashboard');
            } else {
                alert("Role not recognized!");
            }
        } catch (err) {
            setError(err.response?.data?.non_field_errors?.[0] || 'Invalid Username or Password');
        }
    };

    return (
        <div style={styles.fullPage}>
            <div style={styles.overlay}></div>
            
            <div style={styles.loginCard}>
                <div style={styles.header}>
                    <h1 style={styles.title}>HEALTHCARE <span style={{color: '#0ea5e9'}}>INDIA</span></h1>
                    <p style={styles.subtitle}>Institutional Authentication Portal</p>
                </div>

                <form onSubmit={handleSubmit} style={styles.formContainer}>
                    <input 
                        type="text" 
                        placeholder="Username" 
                        style={styles.premiumInput}
                        onChange={(e) => setCredentials({...credentials, username: e.target.value})} 
                        required 
                    />
                    
                    <div style={{position: 'relative'}}>
                        <input 
                            type="password" 
                            placeholder="Password" 
                            style={styles.premiumInput}
                            onChange={(e) => setCredentials({...credentials, password: e.target.value})} 
                            required 
                        />
                        {/* 🔑 Forgot Password Link */}
                        <p 
                            onClick={() => navigate('/forgot-password')} 
                            style={styles.forgotPass}
                        >
                            Forgot?
                        </p>
                    </div>

                    {error && <p style={styles.errorMessage}>{error}</p>}

                    <button type="submit" style={styles.ctaButton}>SECURE LOGIN</button>
                </form>

                <div style={styles.divider}>
                    <span style={styles.dividerLine}></span>
                    <span style={styles.dividerText}>OR CONTINUE WITH</span>
                    <span style={styles.dividerLine}></span>
                </div>

                {/* 🌐 Google Social Login Button */}
                <button 
                    type="button" 
                    style={styles.googleButton}
                    onClick={() => {
                        window.location.href = "http://127.0.0.1:8000/accounts/google/login/";
                    }}
                >
                    <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="G" style={{width: '18px'}} />
                    Sign in with Google
                </button>

                <p style={styles.cardFooter}>Not on the network? <span onClick={() => navigate('/register')} style={styles.registerLink}>Register Now</span></p>
            </div>
        </div>
    );
};

const styles = {
    fullPage: { height: '100vh', width: '100vw', backgroundImage: `url('https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", position: 'relative', overflow: 'hidden' },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.75)', zIndex: 1 },
    loginCard: { background: 'rgba(241, 245, 249, 0.96)', padding: '40px', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', width: '90%', maxWidth: '400px', zIndex: 2, position: 'relative', border: '1px solid rgba(255, 255, 255, 0.3)', textAlign: 'center' },
    header: { marginBottom: '30px' },
    title: { fontSize: '26px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px', margin: 0 },
    subtitle: { fontSize: '11px', color: '#64748b', fontWeight: '600', marginTop: '6px', textTransform: 'uppercase', letterSpacing: '1px' },
    formContainer: { display: 'flex', flexDirection: 'column', gap: '18px' },
    premiumInput: { width: '100%', padding: '14px 18px', border: '1px solid #cbd5e1', borderRadius: '12px', fontSize: '14px', background: '#fff', outlineColor: '#0ea5e9', boxSizing: 'border-box' },
    forgotPass: { position: 'absolute', right: '15px', top: '14px', fontSize: '12px', color: '#0ea5e9', fontWeight: '700', cursor: 'pointer' },
    errorMessage: { color: '#ef4444', fontSize: '12px', fontWeight: '600', margin: '0' },
    ctaButton: { background: '#0ea5e9', color: '#fff', padding: '16px', borderRadius: '12px', border: 'none', fontSize: '13px', fontWeight: '800', letterSpacing: '1px', cursor: 'pointer', boxShadow: '0 10px 20px rgba(14, 165, 233, 0.3)' },
    divider: { display: 'flex', alignItems: 'center', margin: '20px 0', gap: '10px' },
    dividerLine: { flex: 1, height: '1px', background: '#cbd5e1' },
    dividerText: { fontSize: '10px', color: '#94a3b8', fontWeight: 'bold' },
    googleButton: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', width: '100%', padding: '12px', borderRadius: '12px', border: '1px solid #cbd5e1', background: '#fff', fontSize: '14px', fontWeight: '600', color: '#475569', cursor: 'pointer', transition: '0.3s' },
    cardFooter: { marginTop: '20px', fontSize: '14px', color: '#64748b' },
    registerLink: { color: '#0ea5e9', fontWeight: '800', cursor: 'pointer', marginLeft: '5px' }
};

export default Login;