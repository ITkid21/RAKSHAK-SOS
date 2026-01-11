import React, { useState } from 'react';
import { Shield, MapPin, Mic, Check, ChevronRight } from 'lucide-react';

const Onboarding = ({ onComplete }) => {
    const [step, setStep] = useState(0);
    const [permissions, setPermissions] = useState({
        tracking: false,
        recording: false
    });

    const handleToggle = (key) => {
        setPermissions(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const nextStep = () => {
        if (step < 2) {
            setStep(step + 1);
        } else {
            // Save to localStorage
            localStorage.setItem('sos_permissions', JSON.stringify(permissions));
            localStorage.setItem('sos_onboarded', 'true');
            onComplete();
        }
    };

    const steps = [
        {
            title: "Welcome to Secure SOS",
            icon: <Shield size={48} color="var(--color-primary)" />,
            content: (
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: '16px', lineHeight: '1.6' }}>
                        Your safety is our priority. This app is designed to instantly notify emergency contacts and services with your location and status in critical situations.
                    </p>
                    <div style={{ fontSize: '12px', color: 'var(--color-text-dim)' }}>
                        Please review the required permissions in the next steps to ensure full functionality.
                    </div>
                </div>
            )
        },
        {
            title: "Live Location Tracking",
            icon: <MapPin size={48} color="var(--color-success)" />,
            content: (
                <div>
                    <p style={{ marginBottom: '20px', textAlign: 'center', lineHeight: '1.5' }}>
                        We need permission to access your <strong>Real-time Location</strong>. This activates <u>only</u> when you trigger the SOS button.
                    </p>
                    <div
                        className="glass-panel"
                        onClick={() => handleToggle('tracking')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            border: permissions.tracking ? '1px solid var(--color-success)' : '1px solid transparent'
                        }}
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '2px solid var(--color-text-dim)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: permissions.tracking ? 'var(--color-success)' : 'transparent',
                            borderColor: permissions.tracking ? 'var(--color-success)' : 'var(--color-text-dim)'
                        }}>
                            {permissions.tracking && <Check size={14} color="white" />}
                        </div>
                        <span style={{ fontWeight: 500 }}>Allow Location Tracking</span>
                    </div>
                </div>
            )
        },
        {
            title: "Evidence Recording",
            icon: <Mic size={48} color="#3b82f6" />,
            content: (
                <div>
                    <p style={{ marginBottom: '20px', textAlign: 'center', lineHeight: '1.5' }}>
                        Capture 30 seconds of <strong>Audio/Video</strong> automatically when SOS is triggered to provide evidence of the emergency.
                    </p>
                    <div
                        className="glass-panel"
                        onClick={() => handleToggle('recording')}
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            padding: '16px',
                            cursor: 'pointer',
                            border: permissions.recording ? '1px solid #3b82f6' : '1px solid transparent'
                        }}
                    >
                        <div style={{
                            width: '24px',
                            height: '24px',
                            borderRadius: '50%',
                            border: '2px solid var(--color-text-dim)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            background: permissions.recording ? '#3b82f6' : 'transparent',
                            borderColor: permissions.recording ? '#3b82f6' : 'var(--color-text-dim)'
                        }}>
                            {permissions.recording && <Check size={14} color="white" />}
                        </div>
                        <span style={{ fontWeight: 500 }}>Allow Audio Recording</span>
                    </div>
                </div>
            )
        }
    ];

    return (
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            background: 'var(--color-bg)',
            zIndex: 100,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px'
        }}>
            <div className="glass-panel" style={{
                width: '100%', maxWidth: '400px', padding: '32px 24px',
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                minHeight: '400px'
            }}>

                {/* Helper Animation Area */}
                <div style={{ marginBottom: '24px', padding: '20px', background: 'rgba(255,255,255,0.05)', borderRadius: '50%' }}>
                    {steps[step].icon}
                </div>

                <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', textAlign: 'center' }}>
                    {steps[step].title}
                </h2>

                <div style={{ flex: 1, width: '100%' }}>
                    {steps[step].content}
                </div>

                <div style={{ width: '100%', marginTop: '32px' }}>
                    <button
                        className="btn-primary"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        onClick={nextStep}
                    >
                        <span>{step === 2 ? "Activate System" : "Next"}</span>
                        <ChevronRight size={20} />
                    </button>
                </div>

                {/* Dots */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '24px' }}>
                    {[0, 1, 2].map(i => (
                        <div key={i} style={{
                            width: '8px', height: '8px', borderRadius: '50%',
                            background: i === step ? 'var(--color-primary)' : 'var(--color-text-dim)',
                            opacity: i === step ? 1 : 0.3,
                            transition: 'all 0.3s ease'
                        }} />
                    ))}
                </div>

            </div>
        </div>
    );
};

export default Onboarding;
