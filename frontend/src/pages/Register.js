import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [role, setRole] = useState('patient');
    const [formData, setFormData] = useState({
        username: '', email: '', password: '', password2: '', phone_number: '',
        hospital_name: '', hospital_city: '', hospital_address: ''
    });
    const navigate = useNavigate();

    // 🔄 Tab switch karne par data reset karne ke liye
    const handleRoleChange = (newRole) => {
        setRole(newRole);
        setFormData({
            username: '', email: '', password: '', password2: '', phone_number: '',
            hospital_name: '', hospital_city: '', hospital_address: ''
        });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        
        // 💡 Logic Fix: Role ke hisaab se payload filter karna zaroori hai
        let payload;
        if (role === 'patient') {
            payload = {
                username: formData.username,
                email: formData.email,
                phone_number: formData.phone_number,
                password: formData.password,
                password2: formData.password2
            };
        } else {
            // Backend mandatory fields check
            payload = {
                ...formData,
                hospital_address: formData.hospital_address || "Institutional Address" 
            };
        }

        const endpoint = role === 'patient' 
            ? 'http://127.0.0.1:8000/api/accounts/register/patient/' 
            : 'http://127.0.0.1:8000/api/accounts/register/hospital-admin/';

        try {
            const res = await axios.post(endpoint, payload);
            if (res.status === 201 || res.status === 200) {
                alert(role === 'patient' ? "Patient Registration Successful!" : "Hospital Admin Registered! Waiting for Approval.");
                navigate('/login');
            }
        } catch (err) { 
            console.error("Backend Error:", err.response?.data);
            // Error handling for unique fields like phone/username
            const errorDetail = err.response?.data ? JSON.stringify(err.response.data) : "Network Error";
            alert("Registration Failed: " + errorDetail); 
        }
    };

    return (
        <div style={styles.fullPage}>
            <div style={styles.overlay}></div>
            <div style={styles.registrationCard}>
                <div style={styles.header}>
                    <h1 style={styles.title}>HEALTHCARE <span style={{color: '#0ea5e9'}}>INDIA</span></h1>
                    <p style={styles.subtitle}>Healthcare Appointment Interface</p>
                </div>

                <div style={styles.tabSwitcher}>
                    <button 
                        type="button"
                        onClick={() => handleRoleChange('patient')} 
                        style={{...styles.tabLink, background: role === 'patient' ? '#fff' : 'transparent', color: role === 'patient' ? '#0ea5e9' : '#94a3b8', boxShadow: role === 'patient' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'}}
                    >
                        Patient
                    </button>
                    <button 
                        type="button"
                        onClick={() => handleRoleChange('hospital_admin')} 
                        style={{...styles.tabLink, background: role === 'hospital_admin' ? '#fff' : 'transparent', color: role === 'hospital_admin' ? '#0ea5e9' : '#94a3b8', boxShadow: role === 'hospital_admin' ? '0 2px 10px rgba(0,0,0,0.05)' : 'none'}}
                    >
                        Hospital Admin
                    </button>
                </div>

                <form onSubmit={handleRegister} style={styles.formContainer}>
                    <div style={styles.inputGrid}>
                        {/* ⚠️ value bind karna reset ke liye mandatory hai */}
                        <input type="text" placeholder="Username" value={formData.username} style={styles.premiumInput} onChange={(e) => setFormData({...formData, username: e.target.value})} required />
                        <input type="email" placeholder="Email Address" value={formData.email} style={styles.premiumInput} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
                    </div>

                    {role === 'hospital_admin' ? (
                        <div style={styles.institutionPane}>
                            <input type="text" placeholder="Hospital Name" value={formData.hospital_name} style={styles.premiumInput} onChange={(e) => setFormData({...formData, hospital_name: e.target.value})} required />
                            <div style={styles.inputGrid}>
                                <input type="text" placeholder="City" value={formData.hospital_city} style={styles.premiumInput} onChange={(e) => setFormData({...formData, hospital_city: e.target.value})} required />
                                <input type="text" placeholder="Mobile No." value={formData.phone_number} style={styles.premiumInput} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} required />
                            </div>
                        </div>
                    ) : (
                        <input type="text" placeholder="Phone Number" value={formData.phone_number} style={styles.premiumInput} onChange={(e) => setFormData({...formData, phone_number: e.target.value})} required />
                    )}

                    <div style={styles.inputGrid}>
                        <input type="password" placeholder="Password" value={formData.password} style={styles.premiumInput} onChange={(e) => setFormData({...formData, password: e.target.value})} required />
                        <input type="password" placeholder="Confirm" value={formData.password2} style={styles.premiumInput} onChange={(e) => setFormData({...formData, password2: e.target.value})} required />
                    </div>

                    <button type="submit" style={styles.ctaButton}>REGISTER NOW</button>
                </form>

                <p style={styles.cardFooter}>Already have an account? <span onClick={() => navigate('/login')} style={styles.loginLink}>Sign In</span></p>
            </div>
        </div>
    );
};

// --- STYLES (AS PER YOUR DESIGN) ---

const styles = {
    fullPage: { height: '100vh', width: '100vw', backgroundImage: `url('https://images.unsplash.com/photo-1516549655169-df83a0774514?q=80&w=2070&auto=format&fit=crop')`, backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", position: 'relative' },
    overlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15, 23, 42, 0.7)', zIndex: 1 },
    registrationCard: { background: 'rgba(241, 245, 249, 0.96)', padding: '35px 40px', borderRadius: '24px', boxShadow: '0 30px 60px rgba(0,0,0,0.4)', width: '90%', maxWidth: '480px', zIndex: 2, position: 'relative', border: '1px solid rgba(255, 255, 255, 0.3)' },
    header: { textAlign: 'center', marginBottom: '25px' },
    title: { fontSize: '24px', fontWeight: '900', color: '#0f172a', letterSpacing: '-0.5px' },
    subtitle: { fontSize: '12px', color: '#64748b', fontWeight: '500', marginTop: '4px' },
    tabSwitcher: { display: 'flex', background: '#f1f5f9', borderRadius: '12px', padding: '4px', marginBottom: '25px' },
    tabLink: { flex: 1, padding: '10px', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: '700', fontSize: '12px', transition: '0.3s ease' },
    formContainer: { display: 'flex', flexDirection: 'column', gap: '15px' },
    inputGrid: { display: 'flex', gap: '12px' },
    premiumInput: { width: '100%', padding: '12px 15px', border: '1px solid #e2e8f0', borderRadius: '10px', fontSize: '13px', background: '#fff', outlineColor: '#0ea5e9', boxSizing: 'border-box' },
    institutionPane: { display: 'flex', flexDirection: 'column', gap: '15px' },
    ctaButton: { background: '#0ea5e9', color: '#fff', padding: '14px', borderRadius: '12px', border: 'none', fontSize: '14px', fontWeight: '800', letterSpacing: '0.5px', cursor: 'pointer', marginTop: '5px', boxShadow: '0 10px 20px rgba(14, 165, 233, 0.3)' },
    cardFooter: { marginTop: '20px', textAlign: 'center', fontSize: '13px', color: '#64748b' },
    loginLink: { color: '#0ea5e9', fontWeight: '800', cursor: 'pointer', marginLeft: '4px' }
};

export default Register;