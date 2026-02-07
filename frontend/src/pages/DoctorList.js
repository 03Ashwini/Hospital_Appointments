import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Stethoscope, Star, Clock, ChevronRight, ArrowLeft } from 'lucide-react';

const DoctorList = () => {
    // Get hospitalId from the URL (e.g., /hospital/5/doctors)
    const { hospitalId } = useParams();
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const API_BASE_URL = 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                setLoading(true);
                // Fetch doctors belonging to this specific hospital
                const res = await axios.get(`${API_BASE_URL}/api/hospitals/${hospitalId}/doctors/`);
                setDoctors(res.data);
            } catch (err) {
                console.error("Error fetching doctors:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchDoctors();
    }, [hospitalId]);

    if (loading) return <div style={loaderStyle}>Loading Specialists...</div>;

    return (
        <div style={pageStyle}>
            {/* Back Navigation */}
            <button onClick={() => navigate(-1)} style={backBtn}>
                <ArrowLeft size={18} /> Back to Hospitals
            </button>

            <header style={headerSection}>
                <h2 style={titleStyle}>Available Specialists</h2>
                <p style={subTitle}>Select a doctor to book your appointment slot</p>
            </header>

            {/* Doctors Grid */}
            <div style={gridStyle}>
                {doctors.length > 0 ? (
                    doctors.map((doc) => (
                        <div key={doc.id} style={docCard}>
                            <div style={cardTop}>
                                <div style={iconCircle}>
                                    <Stethoscope size={30} color="#3498db" />
                                </div>
                                <div style={docInfo}>
                                    <h3 style={docName}>{doc.name}</h3>
                                    <p style={specText}>{doc.specialization}</p>
                                    <div style={ratingRow}>
                                        <Star size={14} fill="#f1c40f" color="#f1c40f" />
                                        <span>4.9 (Experience: {doc.experience_years} Years)</span>
                                    </div>
                                </div>
                            </div>

                            <div style={cardStats}>
                                <div style={statItem}>
                                    <span style={statLabel}>Fee</span>
                                    <span style={statValue}>₹{doc.consultation_fee}</span>
                                </div>
                                <div style={statItem}>
                                    <span style={statLabel}>Availability</span>
                                    <span style={statValue}><Clock size={12}/> Mon - Sat</span>
                                </div>
                            </div>

                            <button 
                                style={selectBtn} 
                                onClick={() => navigate(`/book-slot/${doc.id}`)}
                            >
                                View Slots <ChevronRight size={18} />
                            </button>
                        </div>
                    ))
                ) : (
                    <div style={emptyState}>No doctors registered for this hospital yet.</div>
                )}
            </div>
        </div>
    );
};

// --- Professional Styles ---
const pageStyle = { padding: '40px 5%', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600', marginBottom: '20px' };
const headerSection = { marginBottom: '40px' };
const titleStyle = { fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 };
const subTitle = { color: '#64748b', marginTop: '5px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px' };
const docCard = { backgroundColor: 'white', borderRadius: '16px', padding: '24px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', border: '1px solid #e2e8f0' };
const cardTop = { display: 'flex', gap: '15px', marginBottom: '20px' };
const iconCircle = { width: '60px', height: '60px', borderRadius: '50%', backgroundColor: '#ebf5ff', display: 'flex', alignItems: 'center', justifyContent: 'center' };
const docInfo = { flex: 1 };
const docName = { fontSize: '18px', fontWeight: '700', color: '#0f172a', margin: '0 0 4px 0' };
const specText = { color: '#3498db', fontWeight: '600', fontSize: '14px', margin: 0 };
const ratingRow = { display: 'flex', alignItems: 'center', gap: '5px', fontSize: '12px', color: '#64748b', marginTop: '8px' };
const cardStats = { display: 'flex', justifyContent: 'space-between', padding: '15px 0', borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9', marginBottom: '20px' };
const statItem = { display: 'flex', flexDirection: 'column', gap: '4px' };
const statLabel = { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' };
const statValue = { fontSize: '15px', fontWeight: '700', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '4px' };
const selectBtn = { width: '100%', backgroundColor: '#1e293b', color: 'white', border: 'none', padding: '12px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' };
const loaderStyle = { textAlign: 'center', marginTop: '100px', fontSize: '20px', color: '#64748b' };
const emptyState = { gridColumn: '1/-1', textAlign: 'center', padding: '50px', color: '#94a3b8' };

export default DoctorList;