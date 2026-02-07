import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Clock, ArrowLeft, CheckCircle, CalendarDays, AlertCircle } from 'lucide-react';

const SlotBooking = () => {
    const { doctorId } = useParams();
    const [slots, setSlots] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedSlot, setSelectedSlot] = useState(null);
    const navigate = useNavigate();

    const API_BASE_URL = 'http://127.0.0.1:8000';

    const formatTime = (timeString) => {
        try {
            const date = new Date(timeString);
            return date.toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
            });
        } catch (e) { return timeString; }
    };

    useEffect(() => {
        const fetchSlots = async () => {
            try {
                setLoading(true);
                // 🚀 LIVE FIX: Local Date string format (YYYY-MM-DD) for Django compatibility
                const today = new Date().toLocaleDateString('en-CA'); 

                const res = await axios.get(`${API_BASE_URL}/api/hospitals/slots/available/`, {
                    params: {
                        doctor_id: doctorId,
                        date: today,
                        is_booked: false // 👈 Sirf available slots mangao
                    }
                });
                setSlots(res.data);
            } catch (err) {
                console.error("Slot Fetch Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlots();
    }, [doctorId]);

    const handleBooking = () => {
        if (!selectedSlot) {
            alert("Bhai, pehle time select kar lo!");
            return;
        }
        // Slot selection lock karne ke liye navigation
        navigate(`/confirm-booking/${selectedSlot.id}`);
    };

    if (loading) return (
        <div style={centerStyle}>
            <div className="animate-pulse" style={{fontSize:'20px', fontWeight:'700'}}>Checking Live Availability...</div>
        </div>
    );

    return (
        <div style={pageStyle}>
            <button onClick={() => navigate(-1)} style={backBtn}>
                <ArrowLeft size={18} /> Back to Specialists
            </button>

            <header style={headerSection}>
                <div style={badge}><CalendarDays size={14}/> Today's Live Slots</div>
                <h2 style={titleText}>Available Appointments</h2>
                <p style={subTitleText}>Book your 30-minute session with our specialist.</p>
            </header>

            <div style={slotGrid}>
                {slots.length > 0 ? (
                    slots.map((slot) => (
                        <div 
                            key={slot.id} 
                            style={{
                                ...slotCard, 
                                opacity: slot.is_booked ? 0.5 : 1, // Visual cue for booked slots
                                pointerEvents: slot.is_booked ? 'none' : 'auto',
                                borderColor: selectedSlot?.id === slot.id ? '#3498db' : '#e2e8f0',
                                backgroundColor: selectedSlot?.id === slot.id ? '#f0f7ff' : 'white',
                            }}
                            onClick={() => !slot.is_booked && setSelectedSlot(slot)}
                        >
                            <div style={{display:'flex', alignItems:'center', gap:'12px'}}>
                                <Clock size={22} color={selectedSlot?.id === slot.id ? '#3498db' : '#64748b'} />
                                <div>
                                    <div style={timeValue}>{formatTime(slot.start_time)}</div>
                                    <div style={durationText}>{slot.is_booked ? "Already Booked" : "Available"}</div>
                                </div>
                            </div>
                            {selectedSlot?.id === slot.id && <CheckCircle size={20} color="#3498db" />}
                        </div>
                    ))
                ) : (
                    <div style={noSlotsBox}>
                        <AlertCircle size={48} color="#cbd5e1" style={{marginBottom:'15px'}}/>
                        <h3>No Slots Available Right Now</h3>
                        <p>Our automation system is generating new slots. Please refresh in a few minutes.</p>
                    </div>
                )}
            </div>

            {selectedSlot && (
                <div style={footerSection}>
                    <div style={selectionNotice}>
                        Selected: <strong>{formatTime(selectedSlot.start_time)}</strong>
                    </div>
                    <button style={confirmBtn} onClick={handleBooking}>
                        Proceed to Payment
                    </button>
                </div>
            )}
        </div>
    );
};

// --- Professional CSS-in-JS Styles ---
const pageStyle = { padding: '50px 8%', backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
const backBtn = { display: 'flex', alignItems: 'center', gap: '8px', border: 'none', background: 'none', color: '#64748b', cursor: 'pointer', fontWeight: '600', marginBottom: '30px' };
const headerSection = { marginBottom: '50px' };
const badge = { display:'inline-flex', alignItems:'center', gap:'6px', backgroundColor:'#e0f2fe', color:'#0369a1', padding:'6px 12px', borderRadius:'20px', fontSize:'12px', fontWeight:'700', marginBottom:'15px' };
const titleText = { fontSize: '32px', fontWeight: '800', color: '#1e293b', margin: 0 };
const subTitleText = { color: '#64748b', fontSize: '16px', marginTop: '8px' };
const slotGrid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '25px' };
const slotCard = { padding: '25px', borderRadius: '18px', border: '2px solid', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', transition: 'all 0.3s ease' };
const timeValue = { fontSize: '18px', fontWeight: '800', color: '#1e293b' };
const durationText = { fontSize: '12px', color: '#94a3b8', marginTop: '2px' };
const footerSection = { marginTop: '60px', textAlign: 'center', backgroundColor: 'white', padding: '40px', borderRadius: '25px', boxShadow: '0 -10px 30px rgba(0,0,0,0.02)' };
const selectionNotice = { fontSize: '18px', color: '#475569', marginBottom: '25px' };
const confirmBtn = { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '18px 80px', borderRadius: '15px', fontSize: '18px', fontWeight: '800', cursor: 'pointer', transition: '0.3s', boxShadow: '0 10px 25px rgba(52, 152, 219, 0.4)' };
const noSlotsBox = { gridColumn: '1/-1', textAlign: 'center', padding: '80px', backgroundColor: 'white', borderRadius: '25px', color: '#94a3b8', border: '1px dashed #e2e8f0' };
const centerStyle = { height:'100vh', display:'flex', flexDirection: 'column', justifyContent:'center', alignItems:'center', backgroundColor:'#f8fafc', gap: '15px' }; // 👈 Sirf ek baar rakho

export default SlotBooking;