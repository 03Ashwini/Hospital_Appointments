import React, { useState } from 'react';
import axios from 'axios';

const AdminDashboard = () => {
    const [activeTab, setActiveTab] = useState('doctors');

    return (
        <div style={containerStyle}>
            <aside style={sidebarStyle}>
                <h2>Hospital Admin</h2>
                <button onClick={() => setActiveTab('doctors')}>👨‍⚕️ Manage Doctors</button>
                <button onClick={() => setActiveTab('slots')}>📅 Generate Slots</button>
            </aside>

            <main style={mainStyle}>
                {activeTab === 'doctors' ? <DoctorForm /> : <SlotGenerator />}
            </main>
        </div>
    );
};

// --- Sub-Component 1: Doctor Registration ---
const DoctorForm = () => {
    const [formData, setFormData] = useState({ name: '', specialization: '', consultation_fee: '' });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            // 🚀 API: POST /api/hospitals/doctors/
            await axios.post('http://127.0.0.1:8000/api/hospitals/doctors/', formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Doctor Registered! Login credentials generated automatically.");
        } catch (err) { alert("Registration Failed!"); }
    };

    return (
        <form onSubmit={handleSubmit} style={formStyle}>
            <h3>Register New Doctor</h3>
            <input placeholder="Doctor Name" onChange={e => setFormData({...formData, name: e.target.value})} />
            <input placeholder="Specialization" onChange={e => setFormData({...formData, specialization: e.target.value})} />
            <input type="number" placeholder="Consultation Fee" onChange={e => setFormData({...formData, consultation_fee: e.target.value})} />
            <button type="submit">Add Doctor</button>
        </form>
    );
};

// --- Sub-Component 2: Slot Generator ---
const SlotGenerator = () => {
    const [slotData, setSlotData] = useState({ doctor_id: '', date: '', start_time: '', end_time: '' });

    const handleGenerate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('access_token');
            // 🚀 API: POST /api/hospitals/slots/bulk-create/
            await axios.post('http://127.0.0.1:8000/api/hospitals/slots/bulk-create/', slotData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert("Slots Generated Successfully!");
        } catch (err) { alert("Error generating slots!"); }
    };

    return (
        <form onSubmit={handleGenerate} style={formStyle}>
            <h3>Bulk Create Slots</h3>
            <input type="number" placeholder="Doctor ID" onChange={e => setSlotData({...slotData, doctor_id: e.target.value})} />
            <input type="date" onChange={e => setSlotData({...slotData, date: e.target.value})} />
            <input type="time" onChange={e => setSlotData({...slotData, start_time: e.target.value})} />
            <input type="time" onChange={e => setSlotData({...slotData, end_time: e.target.value})} />
            <button type="submit">Generate 30-min Slots</button> {/* Logic based on gap_minutes=30 */}
        </form>
    );
};

// Basic Styles
const containerStyle = { display: 'flex', minHeight: '100vh' };
const sidebarStyle = { width: '250px', backgroundColor: '#2c3e50', color: 'white', padding: '20px' };
const mainStyle = { flex: 1, padding: '40px', backgroundColor: '#f4f7f6' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '15px', maxWidth: '400px', padding: '20px', backgroundColor: 'white', borderRadius: '8px' };

export default AdminDashboard;