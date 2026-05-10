"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type UserProfile = {
    email: string;
};

const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000";

export default function Dashboard() {
    const [user, setUser] = useState<UserProfile | null>(null);
    const [stats, setStats] = useState({
        total_notes: 0,
        notes_this_week: 0,
        last_updated: "Never"
    });
    const [lastUpdated, setLastUpdated] = useState(new Date());
    const router = useRouter();

    const fetchStats = async () => {
        try {
            const res = await fetch(`${apiBase}/api/stats/`, {
                credentials: "include",
            });

            if (res.ok) {
                const data = await res.json();
                setStats(data);
                setLastUpdated(new Date());
            }
        } catch (error) {
            console.error("Error fetching stats:", error);
        }
    };

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch(`${apiBase}/api/auth/profile`, {
                credentials: "include",
            });

            if (!res.ok) {
                router.push("/login"); // 🔥 protect route
                return;
            }

            const data = await res.json();
            setUser(data);

            // Fetch initial stats
            await fetchStats();
        };

        checkAuth();

        // Set up real-time updates every 5 seconds
        const interval = setInterval(fetchStats, 5000);

        return () => clearInterval(interval);
    }, [router]);

    if (!user) return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 to-slate-800">
            <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                <p className="text-xl text-slate-300">Loading...</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800">
            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Welcome back! 👋</h2>
                            <p className="text-slate-300 mb-4">
                                You're logged in as <span className="font-semibold text-blue-400">{user.email}</span>
                            </p>
                            <div className="flex items-center gap-2 text-sm text-slate-400">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <span>Live data • Last updated {lastUpdated.toLocaleTimeString()}</span>
                            </div>
                        </div>
                        <button
                            onClick={fetchStats}
                            className="px-4 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-blue-300 hover:bg-blue-500/30 hover:border-blue-400/60 transition-all duration-300 flex items-center gap-2"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Refresh
                        </button>
                    </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    {[
                        { label: "Total Notes", value: stats.total_notes.toString(), icon: "📝", color: "from-blue-500/20 to-cyan-500/20" },
                        { label: "This Week", value: stats.notes_this_week.toString(), icon: "📊", color: "from-green-500/20 to-emerald-500/20" },
                        { label: "Last Updated", value: stats.last_updated, icon: "⏰", color: "from-purple-500/20 to-pink-500/20" },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className={`bg-gradient-to-br ${stat.color} border border-slate-700/50 rounded-xl p-6 backdrop-blur-sm hover:border-slate-600/50 transition-all duration-300 group`}
                        >
                            <div className="text-4xl mb-3 group-hover:scale-110 transition-transform">{stat.icon}</div>
                            <p className="text-slate-400 text-sm mb-2">{stat.label}</p>
                            <p className="text-3xl font-bold text-white">{stat.value}</p>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-8 backdrop-blur-sm">
                    <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                        <span>📋</span> Quick Actions
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { title: "Create New Note", desc: "Start writing your next note" },
                            { title: "View All Notes", desc: "Browse your notes library" },
                        ].map((action, i) => (
                            <button
                                key={i}
                                onClick={() => router.push("/notes")}
                                className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg text-left hover:border-blue-400/60 hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 group"
                            >
                                <p className="font-semibold text-white group-hover:text-blue-300 transition-colors">{action.title}</p>
                                <p className="text-sm text-slate-400 mt-1">{action.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}