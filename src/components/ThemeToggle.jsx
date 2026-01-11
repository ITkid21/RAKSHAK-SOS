import React, { useContext } from 'react';
import { Sun, Moon } from 'lucide-react';
import { ThemeContext } from '../App';

const ThemeToggle = () => {
    const { theme, toggleTheme } = useContext(ThemeContext);

    return (
        <button
            onClick={toggleTheme}
            className="glass-panel"
            style={{ padding: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            aria-label="Toggle Theme"
        >
            {theme === 'dark' ? <Sun size={24} color="#fcd34d" /> : <Moon size={24} color="#94a3b8" />}
        </button>
    );
};

export default ThemeToggle;
