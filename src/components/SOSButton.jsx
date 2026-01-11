import React, { useState } from 'react';
import { Phone, AlertTriangle } from 'lucide-react';

const SOSButton = ({ onTrigger }) => {
    const [isPressed, setIsPressed] = useState(false);

    const handlePress = () => {
        setIsPressed(true);
        // Haptic feedback if available
        if (navigator.vibrate) navigator.vibrate(200);

        // Trigger action after small delay for animation
        setTimeout(() => {
            onTrigger();
            setIsPressed(false);
        }, 300);
    };

    const buttonStyle = {
        width: '200px',
        height: '200px',
        borderRadius: '50%',
        background: 'linear-gradient(135deg, var(--color-primary), var(--color-danger))',
        boxShadow: `0 0 40px var(--color-primary-glow), 
                inset 0 4px 20px rgba(255,255,255,0.3),
                0 10px 20px rgba(0,0,0,0.2)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        transform: isPressed ? 'scale(0.95)' : 'scale(1)',
        transition: 'transform 0.1s cubic-bezier(0.4, 0, 0.2, 1)',
        border: '4px solid rgba(255,255,255,0.2)',
        position: 'relative',
        zIndex: 10
    };

    const rippleStyle = {
        position: 'absolute',
        borderRadius: '50%',
        width: '100%',
        height: '100%',
        border: '2px solid var(--color-primary)',
        animation: 'ripple 2s infinite linear',
        zIndex: -1
    };

    return (
        <>
            <style>
                {`
          @keyframes ripple {
            0% { transform: scale(1); opacity: 0.8; }
            100% { transform: scale(1.5); opacity: 0; }
          }
        `}
            </style>
            <div style={{ position: 'relative', display: 'flex', justifyContent: 'center' }}>
                {/* Decorative Ripples */}
                <div style={{ ...rippleStyle, animationDelay: '0s' }}></div>
                <div style={{ ...rippleStyle, animationDelay: '0.6s' }}></div>
                <div style={{ ...rippleStyle, animationDelay: '1.2s' }}></div>

                <button onClick={handlePress} style={buttonStyle}>
                    <AlertTriangle size={64} strokeWidth={2} style={{ marginBottom: '8px' }} />
                    <span style={{ fontSize: '24px', fontWeight: '800', letterSpacing: '2px' }}>SOS</span>
                    <span style={{ fontSize: '12px', opacity: 0.9, fontWeight: 500 }}>PRESS FOR HELP</span>
                </button>
            </div>
        </>
    );
};

export default SOSButton;
