import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun } from 'lucide-react';

export default function ThemeToggle({ className = '' }) {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`relative p-2 rounded-xl transition-all duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#b0e7e7] dark:focus:ring-[#2d9e9e] ${theme === 'dark'
                    ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-orange-500'
                } ${className}`}
            aria-label="Toggle theme"
            title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
            <div className="relative w-5 h-5">
                <Sun
                    className={`absolute inset-0 w-full h-full transition-all duration-500 transform ${theme === 'dark' ? 'opacity-0 rotate-90 scale-0' : 'opacity-100 rotate-0 scale-100'
                        }`}
                />
                <Moon
                    className={`absolute inset-0 w-full h-full transition-all duration-500 transform ${theme === 'dark' ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-90 scale-0'
                        }`}
                />
            </div>
        </button>
    );
}
