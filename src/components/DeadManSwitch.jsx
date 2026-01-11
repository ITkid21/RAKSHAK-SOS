import React, { useState, useEffect, useRef } from 'react';
import { Timer, StopCircle, Play } from 'lucide-react';

const DeadManSwitch = ({ onTrigger }) => {
    const [isActive, setIsActive] = useState(false);
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes default
    const [initialTime, setInitialTime] = useState(300);
    const intervalRef = useRef(null);

    useEffect(() => {
        if (isActive) {
            intervalRef.current = setInterval(() => {
                setTimeLeft((prev) => {
                    if (prev <= 1) {
                        clearInterval(intervalRef.current);
                        setIsActive(false);
                        onTrigger(); // TRIGGER SOS
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            clearInterval(intervalRef.current);
        }

        return () => clearInterval(intervalRef.current);
    }, [isActive, onTrigger]);

    const toggleTimer = () => {
        if (isActive) {
            // "I'm Safe" - Stop and Reset
            setIsActive(false);
            setTimeLeft(initialTime);
        } else {
            // Start Timer
            setIsActive(true);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    // Warning color when low time
    const isUrgent = isActive && timeLeft < 30;

    return (
        <div className="glass-panel" style={{
            padding: '20px',
            marginBottom: '24px',
            border: isUrgent ? '2px solid var(--color-danger)' : '1px solid var(--glass-border)',
            transition: 'all 0.3s ease'
        }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Timer size={20} color={isUrgent ? 'var(--color-danger)' : 'var(--color-text)'} />
                    <span style={{ fontWeight: 600 }}>Safety Timer</span>
                </div>
                <div style={{
                    fontSize: '24px',
                    fontWeight: 'bold',
                    color: isUrgent ? 'var(--color-danger)' : 'var(--color-primary)',
                    fontFamily: 'monospace'
                }}>
                    {formatTime(timeLeft)}
                </div>
            </div>

            <button
                onClick={toggleTimer}
                style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: 'var(--radius-md)',
                    background: isActive ? 'var(--color-surface)' : 'var(--color-primary)',
                    color: isActive ? 'var(--color-text)' : 'white',
                    border: isActive ? '1px solid var(--color-text-dim)' : 'none',
                    fontWeight: 600,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                }}
            >
                {isActive ? (
                    <>
                        <StopCircle size={20} />
                        STOP - I'M SAFE
                    </>
                ) : (
                    <>
                        <Play size={20} fill="currentColor" />
                        START TIMER (5 MIN)
                    </>
                )}
            </button>
        </div>
    );
};

export default DeadManSwitch;
