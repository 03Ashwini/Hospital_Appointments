import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Calendar, User, Hash, MapPin, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MyAppointments = () => {
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    const API_BASE_URL = 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchMyTokens = async () => {
            try {
                const token = localStorage.getItem('access_token');
                // 🚀 Backend URL hit ho raha hai
                const res = await axios.get(`${API_BASE_URL}/api/appointments/my/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAppointments(res.data);
            } catch (err) {
                console.error("Data load nahi hua!", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMyTokens();
    }, []);

    if (loading) return <div style={centerStyle}>Loading your appointments...</div>;

    return (
        <div style={containerStyle}>
            <button onClick={() => navigate(-1)} style={backBtn}>
                <ArrowLeft size={18} /> Back to Dashboard
            </button>
            
            <h2 style={titleStyle}>My Confirmed Appointments</h2>

            <div style={gridStyle}>
                {appointments.length > 0 ? (
                    appointments.map((appt) => (
                        <div key={appt.id} style={cardStyle}>
                            <div style={tokenBadge}>
                                <Hash size={16} /> Token: {appt.token_no} {/* 👈 Yahan '1' dikhega */}
                            </div>
                            
                            <div style={infoRow}>
                                <User size={18} color="#64748b" />
                                <span><strong>Doctor:</strong> {appt.doctor_name}</span>
                            </div>
                            
                            <div style={infoRow}>
                                <MapPin size={18} color="#64748b" />
                                <span><strong>Hospital:</strong> {appt.hospital_name}</span>
                            </div>

                            <div style={infoRow}>
                                <Calendar size={18} color="#64748b" />
                                <span><strong>Time:</strong> {appt.slot_time}</span>
                            </div>

                            <div style={statusStyle}>Confirmed</div>
                        </div>
                    ))
                ) : (
                    <div style={noDataStyle}>No appointments found. Book one now!</div>
                )}
            </div>
        </div>
    );
};

// --- Styles ---
const containerStyle = { padding: '40px 10%', backgroundColor: '#f8fafc', minHeight: '100vh' };
const titleStyle = { fontSize: '28px', fontWeight: '800', marginBottom: '30px', color: '#1e293b' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px' };
const cardStyle = { backgroundColor: '#fff', padding: '20px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const tokenBadge = { backgroundColor: '#3498db', color: '#fff', padding: '5px 12px', borderRadius: '20px', display: 'inline-flex', alignItems: 'center', gap: '5px', fontWeight: '700', marginBottom: '15px' };
const infoRow = { display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', fontSize: '15px', color: '#334155' };
const statusStyle = { marginTop: '15px', color: '#27ae60', fontWeight: '700', fontSize: '14px', textAlign: 'right' };
const backBtn = { border: 'none', background: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b', marginBottom: '20px', fontWeight: '600' };
const noDataStyle = { textAlign: 'center', padding: '50px', color: '#94a3b8', gridColumn: '1/-1' };
const centerStyle = { height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' };

export default MyAppointments;