import React, { useState, useEffect } from 'react'
import IntroStep from './components/IntroStep'
import LocationStep from './components/LocationStep'
import Dashboard from './components/Dashboard'

export const ThemeContext = React.createContext();

function App() {
    // Check system preference or localStorage
    const [theme, setTheme] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved || 'dark'; // Default to Dark Mode
    });

    // Step State: INTRO -> LOCATION -> DASHBOARD
    const [currentStep, setCurrentStep] = useState(() => {
        // Simple persistence for demo
        const savedStep = localStorage.getItem('sos_step');
        return savedStep || 'INTRO';
    });

    useEffect(() => {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem('theme', theme);

        const metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (metaThemeColor) {
            metaThemeColor.setAttribute('content', theme === 'dark' ? '#0f172a' : '#f8fafc');
        }
    }, [theme]);

    useEffect(() => {
        localStorage.setItem('sos_step', currentStep);
    }, [currentStep]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const handleIntroComplete = () => {
        setCurrentStep('LOCATION');
    };

    const handleLocationGranted = (coords) => {
        console.log("Location Granted:", coords);
        setCurrentStep('DASHBOARD');
    };

    const handleReset = () => {
        localStorage.removeItem('sos_step');
        setCurrentStep('INTRO');
        window.location.reload();
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {currentStep === 'INTRO' && <IntroStep onStart={handleIntroComplete} />}
            {currentStep === 'LOCATION' && <LocationStep onLocationGranted={handleLocationGranted} />}
            {currentStep === 'DASHBOARD' && <Dashboard onReset={handleReset} />}
        </ThemeContext.Provider>
    )
}

export default App
