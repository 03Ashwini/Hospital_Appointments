import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Search, MapPin, Hospital, Calendar, IndianRupee } from 'lucide-react'; // Icons ke liye

const Dashboard = () => {
    const [stats, setStats] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredCity, setFilteredCity] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        const token = localStorage.getItem('access_token');
        const res = await axios.get('http://127.0.0.1:8000/api/analytics/super-admin/stats/', {
            headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data);
        setFilteredCity(res.data.city_wise_stats);
    };

    // Search Logic
    const handleSearch = (e) => {
        const value = e.target.value.toLowerCase();
        setSearchTerm(value);
        const filtered = stats.city_wise_stats.filter(item => 
            item.city_name.toLowerCase().includes(value)
        );
        setFilteredCity(filtered);
    };

    if (!stats) return <div className="loader">Loading...</div>;

    return (
        <div style={containerStyle}>
            {/* Header Section */}
            <div style={headerStyle}>
                <h2>📊 Analytics Command Center</h2>
                <div style={searchWrapper}>
                    <Search size={18} style={{marginRight: '10px'}} />
                    <input 
                        placeholder="Search City (e.g. Pune)..." 
                        value={searchTerm}
                        onChange={handleSearch}
                        style={searchInput}
                    />
                </div>
            </div>

            {/* KPI Cards */}
            <div style={gridStyle}>
                <div style={cardStyle}>
                    <IndianRupee color="#2ecc71" />
                    <h3>₹{stats.summary_kpis.total_revenue}</h3>
                    <p>Total Revenue</p>
                </div>
                <div style={cardStyle}>
                    <Calendar color="#3498db" />
                    <h3>{stats.summary_kpis.appointment_count}</h3>
                    <p>Appointments</p>
                </div>
                <div style={cardStyle}>
                    <Hospital color="#9b59b6" />
                    <h3>{stats.summary_kpis.total_hospitals}</h3>
                    <p>Active Hospitals</p>
                </div>
            </div>

            {/* City Table Section */}
            <div style={tableContainer}>
                <h3 style={{marginBottom: '15px'}}>City-wise Performance Breakdown</h3>
                <table style={mainTable}>
                    <thead>
                        <tr style={tableHeader}>
                            <th>City</th>
                            <th>Appointments</th>
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredCity.map((city, i) => (
                            <tr key={i} style={tableRow}>
                                <td><MapPin size={14} inline /> {city.city_name}</td>
                                <td>{city.total_appointments}</td>
                                <td>₹{city.revenue}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// --- MODERN CSS-IN-JS ---
const containerStyle = { padding: '30px', backgroundColor: '#f8f9fa', minHeight: '100vh', fontFamily: 'Segoe UI' };
const headerStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' };
const searchWrapper = { display: 'flex', alignItems: 'center', background: 'white', padding: '10px 20px', borderRadius: '30px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)' };
const searchInput = { border: 'none', outline: 'none', fontSize: '16px' };
const gridStyle = { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '40px' };
const cardStyle = { background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)', textAlign: 'center' };
const tableContainer = { background: 'white', padding: '25px', borderRadius: '15px', boxShadow: '0 4px 20px rgba(0,0,0,0.08)' };
const mainTable = { width: '100%', borderCollapse: 'collapse' };
const tableHeader = { background: '#f8f9fa', textAlign: 'left', color: '#7f8c8d' };
const tableRow = { borderBottom: '1px solid #eee', height: '50px' };

export default Dashboard;