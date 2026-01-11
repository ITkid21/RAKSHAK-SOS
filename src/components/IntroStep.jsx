import React, { useState, useEffect } from 'react';
import { ArrowRight, ShieldAlert, CheckCircle, Mic, MapPin, Lock, Info, ChevronRight, ShieldCheck } from 'lucide-react';

const IntroStep = ({ onStart }) => {
    const [step, setStep] = useState(0); // 0: Splash, 1: Location Info, 2: 4 Stages, 3: Purpose

    // Auto-advance Splash Screen
    useEffect(() => {
        if (step === 0) {
            const timer = setTimeout(() => setStep(1), 2500);
            return () => clearTimeout(timer);
        }
    }, [step]);

    const nextStep = () => setStep(prev => prev + 1);

    // --- RENDERERS ---

    // 0. Splash Screen
    if (step === 0) {
        return (
            <div style={{
                height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                background: '#0f172a', color: 'white', textAlign: 'center'
            }}>
                <div style={{ animation: 'popIn 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)' }}>
                    <div style={{
                        width: '120px', height: '120px', margin: '0 auto 24px', borderRadius: '50%',
                        background: 'radial-gradient(circle, rgba(239, 68, 68, 0.3) 0%, rgba(0,0,0,0) 70%)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        border: '2px solid rgba(239,68,68,0.2)', boxShadow: '0 0 50px rgba(239, 68, 68, 0.4)'
                    }}>
                        <ShieldAlert size={60} color="#ef4444" />
                    </div>
                    <h1 style={{ fontSize: '42px', fontWeight: '900', letterSpacing: '-1px', marginBottom: '8px', background: 'linear-gradient(to right, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Rakshak SOS
                    </h1>
                    <p style={{ color: '#64748b', letterSpacing: '2px', fontSize: '14px', textTransform: 'uppercase' }}>Safety Reinvented</p>
                </div>
                <style>{`
                    @keyframes popIn {
                        0% { opacity: 0; transform: scale(0.5); }
                        100% { opacity: 1; transform: scale(1); }
                    }
                `}</style>
            </div>
        );
    }

    // Common Container for slides
    return (
        <div style={{
            height: '100vh', display: 'flex', flexDirection: 'column',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: 'white', overflow: 'hidden', position: 'relative'
        }}>
            {/* Progress Bar */}
            <div style={{ display: 'flex', gap: '8px', padding: '20px', justifyContent: 'center' }}>
                {[1, 2, 3].map(i => (
                    <div key={i} style={{
                        height: '4px', width: '40px', borderRadius: '2px',
                        background: i <= step ? '#3b82f6' : 'rgba(255,255,255,0.1)',
                        transition: 'all 0.3s ease'
                    }} />
                ))}
            </div>

            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '24px', textAlign: 'center', animation: 'fadeIn 0.5s ease' }}>

                {/* 1. LOCATION PERMISSION INFO */}
                {step === 1 && (
                    <>
                        <div style={{ width: '100px', height: '100px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '32px' }}>
                            <MapPin size={48} color="#60a5fa" />
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Location Privacy</h2>
                        <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '350px' }}>
                            In an emergency, every second counts. Rakshak SOS uses your <b>Live Location</b> to track your movement.
                        </p>
                        <div style={{ margin: '30px 0', padding: '16px', background: 'rgba(34, 197, 94, 0.1)', borderRadius: '12px', display: 'flex', gap: '12px', alignItems: 'start', textAlign: 'left', maxWidth: '350px' }}>
                            <Lock size={20} color="#22c55e" style={{ flexShrink: 0, marginTop: '2px' }} />
                            <p style={{ fontSize: '13px', color: '#86efac', margin: 0 }}>
                                Your location is <b>encrypted</b> and shared <b>ONLY</b> with the nearest Police Dispatch Unit during an active alert.
                            </p>
                        </div>
                    </>
                )}

                {/* 2. 4 STAGES */}
                {step === 2 && (
                    <>
                        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px' }}>4 Levels of Safety</h2>
                        <div style={{ width: '100%', maxWidth: '350px', display: 'grid', gap: '16px', textAlign: 'left' }}>
                            <StageCard icon={<MapPin size={18} color="#3b82f6" />} title="1. ALERT" desc="Live tracking active. Police monitoring." color="rgba(59, 130, 246, 0.1)" textColor="#60a5fa" />
                            <StageCard icon={<ShieldAlert size={18} color="#ef4444" />} title="2. RISK" desc="One Tap SOS. High priority alarm." color="rgba(239, 68, 68, 0.1)" textColor="#f87171" />
                            <StageCard icon={<Mic size={18} color="#f59e0b" />} title="3. PROOF" desc="Triple Tap. Records audio evidence." color="rgba(245, 158, 11, 0.1)" textColor="#fbbf24" />
                            <StageCard icon={<CheckCircle size={18} color="#22c55e" />} title="4. SAFE" desc="Danger passed. Resolve alert." color="rgba(34, 197, 94, 0.1)" textColor="#4ade80" />
                        </div>
                    </>
                )}

                {/* 3. PURPOSE */}
                {step === 3 && (
                    <>
                        <div style={{ width: '80px', height: '80px', background: 'rgba(168, 85, 247, 0.1)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px' }}>
                            <ShieldCheck size={40} color="#a855f7" />
                        </div>
                        <h2 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '16px' }}>Mission: Rakshak</h2>
                        <p style={{ fontSize: '16px', color: '#cbd5e1', lineHeight: '1.6', maxWidth: '350px', marginBottom: '24px' }}>
                            Our purpose is to bridge the gap between you and first responders.
                        </p>
                        <div style={{ width: '100%', maxWidth: '350px', textAlign: 'left', display: 'grid', gap: '12px' }}>
                            <FeatureItem text="Instant Police Connection (112)" />
                            <FeatureItem text="Guardian Alerts (Auto SMS/Call)" />
                            <FeatureItem text="Nearby Safe Zones (Hospitals)" />
                            <FeatureItem text="Audio Evidence Collection" />
                        </div>
                    </>
                )}

            </div>

            {/* Footer Buttons */}
            <div style={{ padding: '24px', width: '100%', maxWidth: '400px', margin: '0 auto' }}>
                <button
                    onClick={step === 3 ? onStart : nextStep}
                    style={{
                        width: '100%', padding: '18px', borderRadius: '14px', border: 'none',
                        background: step === 3 ? '#22c55e' : '#2563eb',
                        color: 'white', fontSize: '16px', fontWeight: 'bold',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                        cursor: 'pointer',
                        boxShadow: step === 3 ? '0 4px 15px rgba(34, 197, 94, 0.4)' : '0 4px 15px rgba(37, 99, 235, 0.4)'
                    }}
                >
                    {step === 3 ? "Complete Setup" : "Next"}
                    <ChevronRight size={20} />
                </button>
            </div>

            <style>{`
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateX(10px); }
                    to { opacity: 1; transform: translateX(0); }
                }
            `}</style>
        </div>
    );
};

// Helper Components
const StageCard = ({ icon, title, desc, color, textColor }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)' }}>
        <div style={{ padding: '10px', borderRadius: '10px', background: color }}>{icon}</div>
        <div>
            <div style={{ fontWeight: 'bold', color: textColor, fontSize: '14px' }}>{title}</div>
            <div style={{ fontSize: '12px', color: '#94a3b8' }}>{desc}</div>
        </div>
    </div>
);

const FeatureItem = ({ text }) => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px' }}>
        <CheckCircle size={16} color="#22c55e" />
        <span style={{ fontSize: '14px', color: '#e2e8f0' }}>{text}</span>
    </div>
);

export default IntroStep;
