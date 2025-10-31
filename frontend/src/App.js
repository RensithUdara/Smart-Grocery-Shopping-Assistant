import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import {
    ShoppingCart,
    Brain,
    Clock,
    Heart,
    BarChart3,
    Settings,
    Menu,
    X
} from 'lucide-react';

// Import pages
import Dashboard from './pages/Dashboard';
import ShoppingList from './pages/ShoppingList';
import Suggestions from './pages/Suggestions';
import ExpirationTracker from './pages/ExpirationTracker';
import HealthRecommendations from './pages/HealthRecommendations';
import Analytics from './pages/Analytics';
import SettingsPage from './pages/Settings';

// Import API service
import { apiService } from './services/apiService';

function App() {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const location = useLocation();

    const navigation = [
        { name: 'Dashboard', href: '/', icon: BarChart3 },
        { name: 'Shopping List', href: '/shopping-list', icon: ShoppingCart },
        { name: 'Smart Suggestions', href: '/suggestions', icon: Brain },
        { name: 'Expiration Tracker', href: '/expiration', icon: Clock },
        { name: 'Health Guide', href: '/health', icon: Heart },
        { name: 'Analytics', href: '/analytics', icon: BarChart3 },
        { name: 'Settings', href: '/settings', icon: Settings },
    ];

    useEffect(() => {
        // Initialize app - check if data exists, if not suggest adding sample data
        const initializeApp = async () => {
            try {
                await apiService.getDataSummary();
                setLoading(false);
            } catch (error) {
                console.error('Error initializing app:', error);
                setLoading(false);
            }
        };

        initializeApp();
    }, []);

    const closeSidebar = () => setSidebarOpen(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading Smart Grocery Assistant...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 shadow-2xl transform transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Header */}
                <div className="flex items-center justify-between h-20 px-6 border-b border-slate-700/50">
                    <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg">
                            <ShoppingCart className="h-7 w-7 text-white" />
                        </div>
                        <div>
                            <span className="text-xl font-bold text-white">
                                Smart Grocery
                            </span>
                            <div className="text-sm text-slate-300 -mt-1">
                                Assistant
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={closeSidebar}
                        className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/50 transition-all duration-200"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="mt-8 px-4">
                    <div className="space-y-2">
                        {navigation.map((item) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={closeSidebar}
                                    className={`
                    group flex items-center px-4 py-3.5 text-sm font-medium rounded-xl transition-all duration-200 ease-in-out relative overflow-hidden
                    ${isActive
                                            ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/25 scale-105'
                                            : 'text-slate-300 hover:text-white hover:bg-slate-700/50 hover:scale-105 hover:shadow-lg'
                                        }
                  `}
                                >
                                    <div className={`
                    p-2 rounded-lg mr-3 transition-all duration-200
                    ${isActive
                                            ? 'bg-white/20 shadow-lg'
                                            : 'bg-slate-700/50 group-hover:bg-slate-600/50'
                                        }
                  `}>
                                        <Icon className="h-5 w-5 flex-shrink-0" />
                                    </div>
                                    <span className="flex-1">{item.name}</span>
                                    {isActive && (
                                        <div className="w-2 h-2 bg-white rounded-full shadow-lg"></div>
                                    )}
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-slate-700/50">
                    <div className="flex items-center space-x-3 p-3 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 transition-all duration-200 cursor-pointer">
                        <div className="w-10 h-10 bg-gradient-to-r from-emerald-400 to-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white font-semibold text-sm">U</span>
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-white">User</div>
                            <div className="text-xs text-slate-400">Premium Member</div>
                        </div>
                        <Settings className="h-4 w-4 text-slate-400" />
                    </div>
                    <div className="text-xs text-slate-500 text-center mt-3">
                        v1.0.0 • Smart Grocery Assistant
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-72">
                {/* Top bar */}
                <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-sm border-b border-gray-200/60 shadow-sm">
                    <div className="flex items-center justify-between px-6 py-4">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="hidden lg:block">
                                <h1 className="text-2xl font-bold text-gray-900 capitalize">
                                    {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                                </h1>
                                <p className="text-sm text-gray-500 mt-1">
                                    Welcome back! Here's what's happening with your groceries today.
                                </p>
                            </div>
                        </div>

                        <div className="flex-1 lg:flex lg:items-center lg:justify-between">
                            <h1 className="text-2xl font-semibold text-gray-900 lg:ml-0 ml-4">
                                {navigation.find(nav => nav.href === location.pathname)?.name || 'Dashboard'}
                            </h1>

                            <div className="hidden lg:flex lg:items-center lg:space-x-4">
                                <div className="text-sm text-gray-500">
                                    Welcome to your Smart Grocery Assistant
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 p-6">
                    <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/shopping-list" element={<ShoppingList />} />
                        <Route path="/suggestions" element={<Suggestions />} />
                        <Route path="/expiration" element={<ExpirationTracker />} />
                        <Route path="/health" element={<HealthRecommendations />} />
                        <Route path="/analytics" element={<Analytics />} />
                        <Route path="/settings" element={<SettingsPage />} />
                    </Routes>
                </main>
            </div>
        </div>
    );
}

export default App;