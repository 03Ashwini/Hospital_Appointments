import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ShieldCheck, User, Calendar, Clock, CreditCard, Loader2 } from 'lucide-react';

const ConfirmBooking = () => {
    const { slotId } = useParams();
    const [slotData, setSlotData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isProcessing, setIsProcessing] = useState(false); // 👈 Loader for payment process
    const navigate = useNavigate();
    const API_BASE_URL = 'http://127.0.0.1:8000';

    useEffect(() => {
        const fetchSlotDetails = async () => {
            try {
                // Backend endpoint for single slot details
                const res = await axios.get(`${API_BASE_URL}/api/appointments/slots/details/${slotId}/`);
                setSlotData(res.data);
            } catch (err) {
                console.error("Slot fetch error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSlotDetails();
    }, [slotId]);

    const handlePayment = async () => {
        const token = localStorage.getItem('access_token'); 
        if (!token) {
            alert("Session expired! Please login again.");
            navigate('/login');
            return;
        }

        setIsProcessing(true); // Button disable kar do
        try {
            const headers = { 
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json' 
            };

            // 1. Create Appointment (Matches Postman body)
            const apptRes = await axios.post(`${API_BASE_URL}/api/appointments/create/`, {
                doctor: slotData.doctor.id || slotData.doctor,   
                hospital: slotData.hospital.id || slotData.hospital, 
                slot: parseInt(slotId)
            }, { headers });

            // 2. Create Razorpay Order
            const payRes = await axios.post(`${API_BASE_URL}/api/payments/create/`, {
                appointment: apptRes.data.id
            }, { headers });

            // 3. Open Razorpay Popup
            const options = {
                key: "rzp_test_RznaJYjBKaALCe", 
                amount: payRes.data.amount * 100, 
                currency: "INR",
                name: "HealthCare Plus",
                description: `Booking with ${slotData.doctor_name}`,
                order_id: payRes.data.order_id, 
                handler: async function (response) {
                    try {
                        // 🚀 CRITICAL: Payment Success ke baad verify hit karo
                        const verifyRes = await axios.post(`${API_BASE_URL}/api/payments/verify/`, {
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_signature: response.razorpay_signature,
                            appointment_id: apptRes.data.id
                        }, { headers });

                        alert(`Success! Token Generated: ${verifyRes.data.token_no}`); //
                        navigate('/patient-home');
                    } catch (vErr) {
                        alert("Verification Failed! Contact Support.");
                    }
                },
                prefill: { name: localStorage.getItem('username') || "Patient" },
                theme: { color: "#3498db" }
            };

            const rzp = new window.Razorpay(options);
            rzp.open();

        } catch (err) {
            console.error("Flow Error:", err.response?.data);
            alert("Error: " + (err.response?.data?.detail || "Process failed. Check slots."));
        } finally {
            setIsProcessing(false);
        }
    };

    // ... (Loading and Error UI remains same as your code)
    if (loading) return <div style={centerStyle}><Loader2 className="animate-spin" size={32}/><p>Loading...</p></div>;
    if (!slotData) return <div style={centerStyle}>Details not found.</div>;

    return (
        <div style={pageContainer}>
            <div style={bookingCard}>
                <div style={headerSection}>
                    <ShieldCheck color="#27ae60" size={28}/>
                    <h2 style={{margin:0}}>Confirm Selection</h2>
                </div>
                <div style={divider}></div>
                <div style={infoRow}>
                    <User color="#64748b" size={20}/>
                    <div><span style={label}>Doctor</span><p style={value}>{slotData.doctor_name}</p></div>
                </div>
                <div style={infoRow}>
                    <Calendar color="#64748b" size={20}/>
                    <div><span style={label}>Date</span><p style={value}>{slotData.date}</p></div>
                </div>
                <div style={infoRow}>
                    <Clock color="#64748b" size={20}/>
                    <div><span style={label}>Time</span><p style={value}>{slotData.start_time}</p></div>
                </div>
                <div style={paymentSummary}>
                    <span style={{fontWeight: '500'}}>Fee</span>
                    <span style={totalAmount}>₹{slotData.consultation_fee}</span>
                </div>
                <button 
                    style={{...payButtonStyle, opacity: isProcessing ? 0.7 : 1}} 
                    onClick={handlePayment}
                    disabled={isProcessing}
                >
                    {isProcessing ? <Loader2 className="animate-spin" size={20}/> : <CreditCard size={20}/>}
                    {isProcessing ? "Processing..." : `Pay ₹${slotData.consultation_fee}`}
                </button>
            </div>
        </div>
    );
};
const pageContainer = { display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#f0f4f8', padding: '20px' };
const bookingCard = { background: '#fff', width: '100%', maxWidth: '400px', borderRadius: '16px', padding: '30px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)' };
const headerSection = { display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' };
const divider = { height: '1px', background: '#e2e8f0', margin: '15px 0 25px 0' };
const infoRow = { display: 'flex', gap: '15px', marginBottom: '20px', alignItems: 'flex-start' };
const label = { fontSize: '12px', color: '#94a3b8', display: 'block', marginBottom: '2px' };
const value = { fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0 };
const paymentSummary = { background: '#f8fafc', padding: '15px', borderRadius: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '30px' };
const totalAmount = { fontSize: '20px', fontWeight: '700', color: '#0f172a' };
const payButtonStyle = { width: '100%', padding: '16px', background: '#3498db', color: 'white', border: 'none', borderRadius: '12px', fontSize: '16px', fontWeight: '600', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' };
const centerStyle = { height: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '15px', color: '#64748b' };
// ... (Your CSS-in-JS Styles)
export default ConfirmBooking;