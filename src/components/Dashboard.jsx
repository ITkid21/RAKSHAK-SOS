import React, { useState, useEffect, useRef } from 'react';
import SOSButton from './SOSButton';
import ThemeToggle from './ThemeToggle';
import ProfileModal from './ProfileModal';
import { MapPin, Battery, ShieldCheck, ShieldAlert, Mic, CheckCircle, Radio, User, Menu, X, AlertTriangle, Phone, MessageSquare, Stethoscope, ExternalLink, RefreshCw } from 'lucide-react';

// Simulated Police Stations (for internal "nearest dispatch" logic only)
const POLICE_STATIONS = [
    { name: "Dombivali Police Station", lat: 19.2183, lng: 73.0868 },
    { name: "Thane Police Station", lat: 19.2183, lng: 72.9781 },
    { name: "Mumbai Central Control", lat: 18.9750, lng: 72.8258 }
];

const AI_TIPS = [
    "Stay in well-lit areas.",
    "Share your live location with a trusted contact.",
    "Avoid isolated shortcuts.",
    "Trust your instincts; if it feels wrong, leave.",
    "Keep your phone battery charged."
];

const STAGE_CONFIG = {
    ALERT: { label: "STAGE 1: ALERT", color: "#3b82f6", desc: "Sharing Live Location" },
    RISK: { label: "STAGE 2: RISK", color: "#ef4444", desc: "Emergency Signal Sent" },
    PROOF: { label: "STAGE 3: PROOF", color: "#f59e0b", desc: "Recording Evidence..." },
    SAFE: { label: "STAGE 4: SAFE", color: "#22c5e", desc: "Marking as Safe..." }
};

const Dashboard = ({ onReset }) => {
    // Stages: ALERT (Default on load), RISK, PROOF, SAFE
    const [stage, setStage] = useState('ALERT');
    const [assignedStation, setAssignedStation] = useState(null);
    const [locationData, setLocationData] = useState(null);
    const [address, setAddress] = useState("Locating address...");
    const [batteryLevel, setBatteryLevel] = useState(null);
    const [recordingTime, setRecordingTime] = useState(0);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [isSideMenuOpen, setIsSideMenuOpen] = useState(false);
    const [aiTip, setAiTip] = useState(AI_TIPS[0]);

    const wsRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const clickTimeoutRef = useRef(null);
    const clickCountRef = useRef(0);
    const lastAddressFetchRef = useRef(0);

    // --- On Mount: Start Tracking & Battery ---
    useEffect(() => {
        // Battery
        if ('getBattery' in navigator) {
            navigator.getBattery().then(battery => {
                setBatteryLevel(Math.floor(battery.level * 100));
                battery.addEventListener('levelchange', () => setBatteryLevel(Math.floor(battery.level * 100)));
            });
        }

        // Initialize WebSocket & Geolocation
        connectWebSocket();
        const watchId = navigator.geolocation.watchPosition(
            handleLocationUpdate,
            (err) => console.error(err),
            { enableHighAccuracy: true, maximumAge: 0, timeout: 5000 }
        );

        // Random AI Tip Rotation
        const tipInterval = setInterval(() => {
            setAiTip(AI_TIPS[Math.floor(Math.random() * AI_TIPS.length)]);
        }, 10000);

        return () => {
            navigator.geolocation.clearWatch(watchId);
            if (wsRef.current) wsRef.current.close();
            clearInterval(tipInterval);
        };
    }, []);

    // --- Logic: Location & Nearest Station ---
    const handleLocationUpdate = (pos) => {
        const { latitude, longitude } = pos.coords;
        // Full Precision
        setLocationData({ lat: latitude, lng: longitude });

        // Reverse Geocoding (Throttled to every 10s to avoid API limits)
        const now = Date.now();
        if (now - lastAddressFetchRef.current > 10000) {
            fetchAddress(latitude, longitude);
            lastAddressFetchRef.current = now;
        }

        // Calculate Nearest Station (Simple Euclidean for demo)
        const nearest = POLICE_STATIONS.reduce((prev, curr) => {
            const prevDist = Math.sqrt(Math.pow(prev.lat - latitude, 2) + Math.pow(prev.lng - longitude, 2));
            const currDist = Math.sqrt(Math.pow(curr.lat - latitude, 2) + Math.pow(curr.lng - longitude, 2));
            return currDist < prevDist ? curr : prev;
        });
        setAssignedStation(nearest.name);

        // Send Update if WS Open
        sendUpdate(latitude, longitude, stage, nearest.name);
    };

    const fetchAddress = async (lat, lng) => {
        try {
            const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
            const data = await response.json();
            if (data && data.display_name) {
                // Shorten address for UI
                const shortAddr = data.display_name.split(',').slice(0, 3).join(',');
                setAddress(shortAddr);
            }
        } catch (error) {
            console.error("Address Fetch Error", error);
            setAddress("Address unavailable");
        }
    };

    const connectWebSocket = () => {
        // Use hostname to allow LAN connections (e.g. 192.168.x.x)
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const host = window.location.hostname;
        const wsUrl = `${protocol}//${host}:8080`;

        wsRef.current = new WebSocket(wsUrl);
        wsRef.current.onopen = () => console.log('Connected to Dispatch');
        wsRef.current.onerror = (e) => console.error('WS Error', e);
    };

    const sendUpdate = (lat, lng, currentStage, station) => {
        if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
            wsRef.current.send(JSON.stringify({
                id: 'USER_123',
                mode: currentStage,
                coords: { lat, lng },
                station: station,
                timestamp: new Date().toISOString()
            }));
        }
    };

    // --- Logic: SOS Interactions ---
    const handleSOSClick = () => {
        // Triple Click Logic
        clickCountRef.current += 1;

        if (clickCountRef.current === 1) {
            clickTimeoutRef.current = setTimeout(() => {
                // Timeout reached: It was a Single Click (RISK)
                if (stage !== 'PROOF') { // Don't downgrade if already in PROOF
                    triggerRiskMode();
                }
                clickCountRef.current = 0;
            }, 400); // 400ms window for multi-click
        } else if (clickCountRef.current === 3) {
            // Triple Click Detected (PROOF)
            clearTimeout(clickTimeoutRef.current);
            triggerProofMode();
            clickCountRef.current = 0;
        }
    };

    const triggerRiskMode = () => {
        setStage('RISK');
        if (locationData) sendUpdate(locationData.lat, locationData.lng, 'RISK', assignedStation);
    };

    const triggerProofMode = async () => {
        setStage('PROOF');
        setRecordingTime(10);

        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorderRef.current = new MediaRecorder(stream);
            audioChunksRef.current = [];

            mediaRecorderRef.current.ondataavailable = (event) => {
                if (event.data.size > 0) audioChunksRef.current.push(event.data);
            };

            mediaRecorderRef.current.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                sendAudioProof(audioBlob);
                stream.getTracks().forEach(track => track.stop()); // Stop mic
            };

            mediaRecorderRef.current.start();

            // Countdown Timer
            const timer = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev <= 1) {
                        clearInterval(timer);
                        stopRecording();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);

        } catch (err) {
            console.error("Mic Access Denied", err);
            alert("Microphone access needed for Proof Mode");
            setStage('RISK'); // Fallback
        }
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
    };

    const sendAudioProof = (blob) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
            const base64Audio = reader.result;
            if (wsRef.current) {
                wsRef.current.send(JSON.stringify({
                    id: 'USER_123',
                    mode: 'PROOF',
                    audio: base64Audio,
                    timestamp: new Date().toISOString()
                }));
            }
        };
    };

    const handleSafe = () => {
        setStage('SAFE'); // Briefly show Safe state
        if (wsRef.current) {
            wsRef.current.send(JSON.stringify({
                id: 'USER_123',
                mode: 'SAFE',
                timestamp: new Date().toISOString()
            }));
        }

        // Return to Stage 1 (Alert/Live Tracking) after a short delay
        setTimeout(() => {
            setStage('ALERT');
            // DO NOT RESET TO INTRO
        }, 2000);
    };

    const handleCallGuardian = () => {
        const phone = localStorage.getItem('sos_guardian_phone');
        if (phone) window.open(`tel:${phone}`);
        else alert('Please save a Guardian Contact in Profile first.');
    };

    const handleSMSGuardian = () => {
        const phone = localStorage.getItem('sos_guardian_phone');
        if (phone) window.open(`sms:${phone}?body=I NEED HELP! Tracking my location.`);
        else alert('Please save a Guardian Contact in Profile first.');
    };

    const openMap = (query) => {
        if (locationData) {
            window.open(`https://www.google.com/maps/search/${query}/@${locationData.lat},${locationData.lng},14z`);
        } else {
            alert('Waiting for location...');
        }
    };

    return (
        <div style={{
            width: '100%',
            maxWidth: '100%', // Responsive full width
            margin: '0 auto',
            height: '100vh',
            backgroundColor: 'var(--color-bg)',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: 'none',
            overflow: 'hidden'
        }}>

            <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />

            {/* Header */}
            <header style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {/* Hamburger Menu Click */}
                    <button onClick={() => setIsSideMenuOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}>
                        <Menu size={26} />
                    </button>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <ShieldCheck size={20} color={STAGE_CONFIG[stage].color} />
                        <div>
                            <span style={{ fontWeight: 800, fontSize: '14px', letterSpacing: '1px', color: STAGE_CONFIG[stage].color }}>
                                {STAGE_CONFIG[stage].label}
                            </span>
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                    {/* Profile Icon */}
                    <button onClick={() => setIsProfileOpen(true)} style={{ background: 'none', border: 'none', color: 'var(--color-text)', cursor: 'pointer' }}>
                        <User size={24} />
                    </button>
                </div>
            </header>

            {/* Status Panel (Nearest Station) */}
            <div style={{ padding: '0 20px', marginBottom: '10px' }}>
                <div className="glass-panel" style={{
                    padding: '16px',
                    borderLeft: `4px solid ${STAGE_CONFIG[stage].color}`,
                    display: 'flex', alignItems: 'center', gap: '12px'
                }}>
                    <Radio size={24} className="pulse-slow" color={STAGE_CONFIG[stage].color} />
                    <div>
                        <div style={{ fontSize: '10px', opacity: 0.6, textTransform: 'uppercase' }}>Nearest Dispatch Unit</div>
                        <div style={{ fontWeight: 600, fontSize: '15px' }}>
                            {assignedStation || "Locating..."}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Action Area */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', width: '100%' }}>

                {stage === 'PROOF' && (
                    <div style={{ marginBottom: '20px', textAlign: 'center' }}>
                        <div style={{
                            fontSize: '48px', fontWeight: 'bold', color: '#f59e0b',
                            animation: 'pulse 1s infinite'
                        }}>
                            00:{recordingTime.toString().padStart(2, '0')}
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center', color: '#f59e0b' }}>
                            <Mic size={16} /> Recording Evidence...
                        </div>
                    </div>
                )}

                {stage !== 'PROOF' && (
                    <SOSButton onTrigger={handleSOSClick} />
                )}

                <p style={{ marginTop: '20px', fontSize: '12px', opacity: 0.5, maxWidth: '200px', textAlign: 'center' }}>
                    Tap Once for <b>RISK</b><br />
                    Tap 3 Times for <b>PROOF</b> (Audio)
                </p>

                {/* I AM SAFE Button */}
                {(stage === 'RISK' || stage === 'PROOF') && (
                    <button onClick={handleSafe} style={{
                        marginTop: '40px',
                        padding: '12px 32px',
                        background: '#22c5e',
                        border: 'none',
                        borderRadius: '30px',
                        color: 'white',
                        fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        boxShadow: '0 4px 12px rgba(34, 197, 94, 0.4)'
                    }}>
                        <CheckCircle size={20} /> I AM SAFE
                    </button>
                )}
            </div>

            {/* Footer Stats / Address */}
            <footer className="glass-panel" style={{ margin: '20px', padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <div style={{ background: 'rgba(59, 130, 246, 0.1)', padding: '8px', borderRadius: '50%' }}>
                            <MapPin size={20} color="#3b82f6" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <p style={{ fontSize: '10px', color: 'var(--color-text-dim)' }}>CURRENT LOCATION</p>
                            <p style={{ fontWeight: 600, fontSize: '13px', lineHeight: '1.4' }}>
                                {address}
                            </p>
                        </div>
                    </div>
                    <button onClick={() => window.open(`https://www.google.com/maps?q=${locationData?.lat},${locationData?.lng}`)}
                        style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}>
                        <ExternalLink size={18} />
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '16px', fontSize: '11px', color: 'var(--color-text-dim)', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
                    <span>
                        GPS: {locationData ? `${locationData.lat.toFixed(5)}, ${locationData.lng.toFixed(5)}` : 'Waiting...'}
                    </span>
                    <span>
                        BAT: {batteryLevel !== null ? `${batteryLevel}%` : '--%'}
                    </span>
                </div>
            </footer>

            {/* SIDE DRAWER (HAMBURGER MENU) */}
            {/* Overlay */}
            {isSideMenuOpen && (
                <div
                    onClick={() => setIsSideMenuOpen(false)}
                    style={{
                        position: 'absolute', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.5)', zIndex: 10
                    }}
                />
            )}

            {/* Drawer Menu */}
            <div style={{
                position: 'absolute', top: 0, left: 0, bottom: 0,
                width: '85%', maxWidth: '300px',
                background: '#1e293b',
                zIndex: 20,
                transform: isSideMenuOpen ? 'translateX(0)' : 'translateX(-100%)',
                transition: 'transform 0.3s ease-in-out',
                boxShadow: '4px 0 15px rgba(0,0,0,0.5)',
                padding: '20px',
                overflowY: 'auto'
            }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: 'bold', color: 'white' }}>Safety Hub</h2>
                    <button onClick={() => setIsSideMenuOpen(false)} style={{ background: 'none', border: 'none', color: '#94a3b8' }}>
                        <X size={24} />
                    </button>
                </div>

                {/* 1. Real Safe Zones (Maps Links) */}
                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#60a5fa' }}>
                        <MapPin size={16} /> Find Safe Zones
                    </h4>
                    <div style={{ display: 'grid', gap: '8px' }}>
                        <button onClick={() => openMap("hospitals")} style={{
                            background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: 'none', color: 'white',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                        }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>Nearby Hospitals</div>
                                <div style={{ fontSize: '11px', opacity: 0.6 }}>Open Google Maps</div>
                            </div>
                            <ExternalLink size={14} color="#60a5fa" />
                        </button>

                        <button onClick={() => openMap("police station")} style={{
                            background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: 'none', color: 'white',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                        }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>Nearby Police</div>
                                <div style={{ fontSize: '11px', opacity: 0.6 }}>Open Google Maps</div>
                            </div>
                            <ExternalLink size={14} color="#60a5fa" />
                        </button>

                        <button onClick={() => openMap("crowded public places")} style={{
                            background: 'rgba(255,255,255,0.05)', padding: '12px', borderRadius: '8px', border: 'none', color: 'white',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer'
                        }}>
                            <div style={{ textAlign: 'left' }}>
                                <div style={{ fontSize: '13px', fontWeight: 600 }}>Crowded Areas</div>
                                <div style={{ fontSize: '11px', opacity: 0.6 }}>Malls, Markets, Stations</div>
                            </div>
                            <ExternalLink size={14} color="#60a5fa" />
                        </button>
                    </div>
                </div>

                {/* 2. Safety Tips */}
                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#a78bfa' }}>
                        <div style={{ width: '8px', height: '8px', background: '#a78bfa', borderRadius: '50%', boxShadow: '0 0 8px #a78bfa' }}></div>
                        Safety Tips
                    </h4>
                    <div style={{
                        background: 'linear-gradient(45deg, rgba(167, 139, 250, 0.1), rgba(167, 139, 250, 0.05))',
                        padding: '16px', borderRadius: '8px', border: '1px solid rgba(167, 139, 250, 0.2)',
                        fontSize: '13px', lineHeight: '1.5', color: 'white'
                    }}>
                        "{aiTip}"
                    </div>
                </div>

                {/* 3. Emergency Actions */}
                <div style={{ marginBottom: '24px' }}>
                    <h4 style={{ margin: '0 0 12px 0', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px', color: '#ef4444' }}>
                        <AlertTriangle size={16} /> Emergency Actions
                    </h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px' }}>
                        <button onClick={() => window.open('tel:112')} style={{
                            padding: '12px', background: '#dc2626', color: 'white', border: 'none', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold'
                        }}>
                            <Phone size={16} /> Call 112
                        </button>
                        <button onClick={handleCallGuardian} style={{
                            padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                            <User size={16} /> Call Guardian
                        </button>
                        <button onClick={handleSMSGuardian} style={{
                            padding: '12px', background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', borderRadius: '8px',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'
                        }}>
                            <MessageSquare size={16} /> SMS Guardian
                        </button>
                    </div>
                </div>

                {/* Settings / Extra */}
                <div style={{ borderTop: '1px solid #334155', paddingTop: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                        <span style={{ fontSize: '14px', color: '#94a3b8' }}>App Settings</span>
                        <ThemeToggle />
                    </div>

                    <button onClick={onReset} style={{
                        width: '100%', padding: '12px', background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: '8px',
                        color: '#fca5a5', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        cursor: 'pointer', fontSize: '13px'
                    }}>
                        <RefreshCw size={14} /> Restart Demo (Reset App)
                    </button>
                </div>

            </div>

            <style>{`
                .pulse-slow { animation: pulse 2s infinite; }
                @keyframes pulse {
                    0% { opacity: 1; transform: scale(1); }
                    50% { opacity: 0.5; transform: scale(0.95); }
                    100% { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default Dashboard;
