import React, { useState } from 'react';
import { MapPin, Navigation, AlertTriangle } from 'lucide-react';

const LocationStep = ({ onLocationGranted }) => {
    const [status, setStatus] = useState('idle'); // idle, requesting, error

    const requestLocation = () => {
        setStatus('requesting');

        if (!navigator.geolocation) {
            setStatus('error');
            alert('Geolocation is not supported by your browser');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                // Success
                setStatus('success');
                setTimeout(() => {
                    onLocationGranted(position.coords);
                }, 1000);
            },
            (error) => {
                // Error
                console.error(error);
                setStatus('error');
            },
            { enableHighAccuracy: true }
        );
    };

    return (
        <div style={{
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            padding: '24px',
            background: '#0f172a',
            color: 'white',
            textAlign: 'center'
        }}>
            <div style={{
                background: 'rgba(30, 41, 59, 0.5)',
                padding: '40px 24px',
                borderRadius: '24px',
                width: '100%',
                maxWidth: '350px',
                border: '1px solid rgba(148, 163, 184, 0.1)'
            }}>
                <div style={{
                    width: '80px', height: '80px',
                    background: status === 'error' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(59, 130, 246, 0.1)',
                    borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    margin: '0 auto 24px'
                }}>
                    {status === 'error' ?
                        <AlertTriangle size={32} color="#ef4444" /> :
                        <Navigation size={32} color="#3b82f6" className={status === 'requesting' ? 'spin-animation' : ''} />
                    }
                </div>

                <h2 style={{ fontSize: '24px', marginBottom: '12px' }}>Enable Location</h2>
                <p style={{ color: '#94a3b8', fontSize: '15px', lineHeight: '1.5', marginBottom: '32px' }}>
                    To connect you with the <b>nearest police station</b>, we need access to your precise location. This is required for the "Alert" stage.
                </p>

                {status === 'error' && (
                    <div style={{
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: '#ef4444',
                        padding: '12px',
                        borderRadius: '8px',
                        fontSize: '13px',
                        marginBottom: '20px'
                    }}>
                        Location access denied. Please enable it in browser settings and try again.
                    </div>
                )}

                <button
                    onClick={requestLocation}
                    disabled={status === 'requesting'}
                    style={{
                        width: '100%',
                        padding: '16px',
                        background: '#3b82f6',
                        border: 'none',
                        borderRadius: '12px',
                        color: 'white',
                        fontSize: '16px',
                        fontWeight: '600',
                        cursor: status === 'requesting' ? 'wait' : 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        opacity: status === 'requesting' ? 0.7 : 1
                    }}
                >
                    {status === 'requesting' ? 'Locating...' : 'Turn On Location'}
                    {status !== 'requesting' && <MapPin size={18} />}
                </button>
            </div>

            <style>{`
                .spin-animation {
                    animation: spin 2s linear infinite;
                }
                @keyframes spin {
                    from { transform: rotate(0deg); }
                    to { transform: rotate(360deg); }
                }
            `}</style>
        </div>
    );
};

export default LocationStep;
