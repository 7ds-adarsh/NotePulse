"use client";

import { useEffect, useState } from "react";

interface User {
    email: string;
}

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function Navbar() {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [darkMode, setDarkMode] = useState(false);

    useEffect(() => {
        // Check for saved theme preference or default to light mode
        const savedTheme = localStorage.getItem('theme');
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const initialDarkMode = savedTheme === 'dark' || (!savedTheme && prefersDark);

        setDarkMode(initialDarkMode);
        document.documentElement.classList.toggle('dark', initialDarkMode);
    }, []);

    const toggleDarkMode = () => {
        const newDarkMode = !darkMode;
        setDarkMode(newDarkMode);
        document.documentElement.classList.toggle('dark', newDarkMode);
        localStorage.setItem('theme', newDarkMode ? 'dark' : 'light');
    };

    const fetchUser = async () => {
        try {
            const res = await fetch(`${apiBase}/api/auth/profile`, {
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                setUser(data);
            } else {
                setUser(null);
            }
        } catch {
            setUser(null);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await fetch(`${apiBase}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
        });

        setUser(null);
        window.location.href = "/";
    };

    useEffect(() => {
        fetchUser();
    }, []);

    if (loading) return <p className="text-center py-4 text-gray-500 dark:text-gray-400">Loading...</p>;

    return (
        <nav className="flex justify-between items-center bg-white dark:bg-gray-800 p-4 shadow-md border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Notty</h2>

            <div className="flex items-center gap-4">
                {/* Dark Mode Toggle */}
                <button
                    onClick={toggleDarkMode}
                    className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                    title={darkMode ? "Switch to light mode" : "Switch to dark mode"}
                >
                    {darkMode ? (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                    ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                        </svg>
                    )}
                </button>

                {user ? (
                    <div className="flex items-center gap-4">
                        <span className="text-gray-700 dark:text-gray-300">Welcome, {user.email}</span>
                        <button
                            onClick={handleLogout}
                            className="text-white bg-blue-500 hover:bg-blue-600 px-3 py-1 rounded-md transition"
                        >
                            Logout
                        </button>
                    </div>
                ) : (
                    <a href="/login" className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition duration-200">Login</a>
                )}
            </div>
        </nav>
    );
}