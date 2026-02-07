import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Search, MapPin, Star, ShieldCheck, Activity, Calendar, LogOut } from 'lucide-react';

const PatientHome = () => {
    // --- 1. STATE MANAGEMENT ---
    const [hospitals, setHospitals] = useState([]); // Stores all hospitals from DB
    const [filteredHospitals, setFilteredHospitals] = useState([]); // Stores filtered list for search
    const [loading, setLoading] = useState(true); // Loading state for API
    const [searchTerm, setSearchTerm] = useState(''); // Current value in search bar
    const [suggestions, setSuggestions] = useState([]); // Suggestions dropdown list
    const [showSuggestions, setShowSuggestions] = useState(false); // Toggle for dropdown visibility
    const navigate = useNavigate();

    // Base URL for Backend to handle Images and API calls
    const IMAGE_BASE_URL = 'http://127.0.0.1:8000';

    // --- 2. DATA FETCHING ---
    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                setLoading(true);
                // Fetching all hospitals globally (No distance limit)
                const res = await axios.get(`${IMAGE_BASE_URL}/api/hospitals/search/`);
                setHospitals(res.data);
                setFilteredHospitals(res.data);
            } catch (err) {
                console.error("API Error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHospitals();
    }, []);

    // --- 3. SEARCH & SUGGESTION LOGIC ---
    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 0) {
            // Filter logic for both Hospital Name and City
            const filtered = hospitals.filter(h => 
                h.name.toLowerCase().includes(value.toLowerCase()) || 
                h.city.toLowerCase().includes(value.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
            setFilteredHospitals(filtered);
        } else {
            setShowSuggestions(false);
            setFilteredHospitals(hospitals);
        }
    };

    const handleSelectSuggestion = (item) => {
        setSearchTerm(item.name);
        setFilteredHospitals([item]);
        setShowSuggestions(false);
    };

    // --- 4. RENDER LOADING STATE ---
    if (loading) return (
        <div style={{textAlign:'center', marginTop:'100px', fontFamily:'Inter, sans-serif'}}>
            <Activity size={48} color="#3498db" className="animate-spin" />
            <h2>Initialising HealthCare Network...</h2>
        </div>
    );

    // --- 5. MAIN UI RENDER ---
    return (
        <div style={pageStyle}>
            {/* --- NAVIGATION BAR --- */}
            <nav style={navStyle}>
                <div style={logoArea}>
                    <Activity size={30} color="#3498db" />
                    <span style={logoText}>HealthCare<span style={{color:'#3498db'}}>Plus</span></span>
                </div>
                <div style={navActions}>
                    <button style={myApptBtn} onClick={() => navigate('/my-appointments')}>
                        <Calendar size={18} /> My Appointments
                    </button>
                    <button style={logoutBtn} onClick={() => { localStorage.clear(); window.location.href='/login'; }}>
                        <LogOut size={18} /> Logout
                    </button>
                </div>
            </nav>

            {/* --- HERO SECTION --- */}
            <div style={heroBox}>
                <h1 style={heroTitle}>Find the Best Medical Care</h1>
                <p style={heroSubText}>Book appointments at verified hospitals across India.</p>
                
                {/* Search Bar Wrapper */}
                <div style={{position: 'relative', maxWidth: '700px', margin: '0 auto'}}>
                    <div style={searchContainer}>
                        <Search color="#94a3b8" size={24} />
                        <input 
                            type="text" 
                            placeholder="Search by Hospital Name or City..." 
                            style={searchInput}
                            value={searchTerm}
                            onChange={handleSearch}
                            onFocus={() => searchTerm.length > 0 && setShowSuggestions(true)}
                        />
                    </div>
                    
                    {/* Search Suggestions Dropdown */}
                    {showSuggestions && suggestions.length > 0 && (
                        <div style={suggestionBox}>
                            {suggestions.map((item) => (
                                <div key={item.id} style={suggestionItem} onClick={() => handleSelectSuggestion(item)}>
                                    <MapPin size={16} color="#3498db" />
                                    <span>{item.name} <small style={{color:'#64748b'}}>({item.city})</small></span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* --- HOSPITAL LISTING SECTION --- */}
            <div style={mainContent}>
                <h2 style={sectionHeading}>Verified Medical Centers</h2>
                <div style={gridContainer}>
                    {filteredHospitals.map((hosp) => (
                        <div 
                            key={hosp.id} 
                            style={cardBox}
                            // Smooth Hover Animation
                            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-10px)'}
                            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                        >
                            {/* Hospital Image with fallback for broken links */}
                            <img 
                                src={hosp.primary_image ? (hosp.primary_image.startsWith('http') ? hosp.primary_image : `${IMAGE_BASE_URL}${hosp.primary_image}`) : 'https://via.placeholder.com/400x200?text=No+Image'} 
                                alt={`Hospital ${hosp.name}`} 
                                style={cardImg} 
                                onError={(e) => { e.target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found'; }}
                            />
                            
                            {/* Card Content Details */}
                            <div style={cardDetails}>
                                <div style={cardHeaderRow}>
                                    <h3 style={hospitalTitle}>{hosp.name}</h3>
                                    <span style={verifiedBadge}><ShieldCheck size={14}/> Verified</span>
                                </div>
                                <p style={cityLabel}><MapPin size={12}/> {hosp.city}</p>
                                <div style={ratingRow}>
                                    <Star size={14} fill="#f1c40f" color="#f1c40f"/> 4.5 
                                    <span style={{fontSize:'12px', color:'#94a3b8', marginLeft:'5px'}}>(100+ Reviews)</span>
                                </div>
                                
                                {/* Pricing and Booking Action */}
                                <div style={priceActionRow}>
                                    <div style={priceContainer}>
                                        <span style={priceTag}>Consultation Fee</span>
                                        <span style={feeAmount}>₹{hosp.consultation_fee}</span>
                                    </div>
                                    <button 
                                        style={bookBtn} 
                                        onClick={() => navigate(`/hospital/${hosp.id}/doctors`)}
                                    >
                                        Book Now
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

// --- STYLES (Professional Theme) ---
const pageStyle = { backgroundColor: '#f8fafc', minHeight: '100vh', fontFamily: 'Inter, sans-serif' };
const navStyle = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '15px 5%', backgroundColor: 'white', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', position: 'sticky', top: 0, zIndex: 100 };
const logoArea = { display: 'flex', alignItems: 'center', gap: '10px' };
const logoText = { fontSize: '24px', fontWeight: '800', color: '#1e293b' };
const navActions = { display: 'flex', gap: '15px' };
const myApptBtn = { display: 'flex', alignItems: 'center', gap: '8px', background: '#f1f5f9', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600', color: '#475569' };
const logoutBtn = { display: 'flex', alignItems: 'center', gap: '8px', background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '700' };

const heroBox = { background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', padding: '70px 20px', textAlign: 'center', color: 'white' };
const heroTitle = { fontSize: '38px', fontWeight: '800', marginBottom: '10px' };
const heroSubText = { fontSize: '18px', color: '#94a3b8', marginBottom: '40px' };
const searchContainer = { display: 'flex', alignItems: 'center', backgroundColor: 'white', padding: '15px 25px', borderRadius: '15px', boxShadow: '0 10px 25px rgba(0,0,0,0.2)' };
const searchInput = { border: 'none', outline: 'none', width: '100%', marginLeft: '15px', fontSize: '18px', color: '#1e293b' };
const suggestionBox = { position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'white', borderRadius: '12px', marginTop: '10px', boxShadow: '0 10px 25px rgba(0,0,0,0.1)', zIndex: 50, overflow: 'hidden' };
const suggestionItem = { padding: '12px 20px', display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', color: '#1e293b', textAlign: 'left' };

const mainContent = { maxWidth: '1200px', margin: '0 auto', padding: '50px 20px' };
const sectionHeading = { fontSize: '26px', fontWeight: '700', marginBottom: '30px', color: '#1e293b' };
const gridContainer = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '30px' };
const cardBox = { backgroundColor: 'white', borderRadius: '20px', overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.06)', transition: 'transform 0.3s ease', cursor: 'pointer' };
const cardImg = { width: '100%', height: '220px', objectFit: 'cover' };
const cardDetails = { padding: '20px' };
const cardHeaderRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' };
const hospitalTitle = { fontSize: '20px', fontWeight: '700', color: '#0f172a' };
const verifiedBadge = { backgroundColor: '#dcfce7', color: '#166534', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '4px' };
const cityLabel = { color: '#64748b', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '5px' };
const ratingRow = { display: 'flex', alignItems: 'center', gap: '5px', color: '#1e293b', fontWeight: '600', marginBottom: '20px' };
const priceActionRow = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '15px' };
const priceContainer = { display: 'flex', flexDirection: 'column' };
const priceTag = { fontSize: '11px', color: '#94a3b8', textTransform: 'uppercase', fontWeight: '700' };
const feeAmount = { fontSize: '20px', fontWeight: '800', color: '#1e293b' };
const bookBtn = { backgroundColor: '#3498db', color: 'white', border: 'none', padding: '12px 25px', borderRadius: '12px', cursor: 'pointer', fontWeight: '700' };

export default PatientHome;