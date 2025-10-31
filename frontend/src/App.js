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
    X,
    Home,
    Bell,
    Search,
    User,
    Sun,
    Sparkles
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
    const [currentTime, setCurrentTime] = useState(new Date());
    const location = useLocation();

    const navigation = [
        {
            name: 'Dashboard',
            href: '/',
            icon: Home,
            description: 'Overview of your grocery status',
            gradient: 'from-purple-400 to-pink-400',
            bgColor: 'bg-purple-50',
            textColor: 'text-purple-600'
        },
        {
            name: 'Shopping List',
            href: '/shopping-list',
            icon: ShoppingCart,
            description: 'Manage your shopping items',
            gradient: 'from-blue-400 to-cyan-400',
            bgColor: 'bg-blue-50',
            textColor: 'text-blue-600'
        },
        {
            name: 'Smart Suggestions',
            href: '/suggestions',
            icon: Brain,
            description: 'AI-powered recommendations',
            gradient: 'from-emerald-400 to-teal-400',
            bgColor: 'bg-emerald-50',
            textColor: 'text-emerald-600'
        },
        {
            name: 'Expiration Tracker',
            href: '/expiration',
            icon: Clock,
            description: 'Track item freshness',
            gradient: 'from-orange-400 to-red-400',
            bgColor: 'bg-orange-50',
            textColor: 'text-orange-600'
        },
        {
            name: 'Health Guide',
            href: '/health',
            icon: Heart,
            description: 'Nutritional insights',
            gradient: 'from-rose-400 to-pink-400',
            bgColor: 'bg-rose-50',
            textColor: 'text-rose-600'
        },
        {
            name: 'Analytics',
            href: '/analytics',
            icon: BarChart3,
            description: 'Shopping patterns & trends',
            gradient: 'from-indigo-400 to-purple-400',
            bgColor: 'bg-indigo-50',
            textColor: 'text-indigo-600'
        },
        {
            name: 'Settings',
            href: '/settings',
            icon: Settings,
            description: 'Customize your experience',
            gradient: 'from-gray-400 to-slate-400',
            bgColor: 'bg-gray-50',
            textColor: 'text-gray-600'
        },
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

        // Update time every minute
        const timeInterval = setInterval(() => {
            setCurrentTime(new Date());
        }, 60000);

        return () => clearInterval(timeInterval);
    }, []);

    const closeSidebar = () => setSidebarOpen(false);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
                <div className="text-center">
                    <div className="relative mb-8">
                        <div className="w-20 h-20 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center mx-auto animate-bounce shadow-2xl">
                            <Sparkles className="h-10 w-10 text-white animate-pulse" />
                        </div>
                        <div className="absolute -inset-4 bg-gradient-to-r from-purple-400 via-pink-400 to-red-400 rounded-3xl opacity-30 animate-ping"></div>
                    </div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 bg-clip-text text-transparent mb-3">
                        Smart Grocery
                    </h1>
                    <p className="text-lg text-gray-600 mb-8 font-medium">Creating your magical grocery experience ✨</p>
                    <div className="w-80 bg-gray-200 rounded-full h-3 mx-auto overflow-hidden">
                        <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 h-3 rounded-full animate-pulse shadow-sm" style={{ width: '75%' }}></div>
                    </div>
                    <div className="mt-6 flex justify-center space-x-2">
                        <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-3 h-3 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
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

                        {/* Top bar actions */}
                        <div className="flex items-center space-x-3">
                            <div className="hidden md:flex items-center space-x-4">
                                <div className="flex items-center space-x-2 px-3 py-2 bg-gray-50 rounded-xl">
                                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-medium text-gray-600">Online</span>
                                </div>
                                <div className="text-sm text-gray-500">
                                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>

                            <button className="relative p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                                <Clock className="h-6 w-6" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
                            </button>

                            <button className="p-2 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200">
                                <Heart className="h-6 w-6" />
                            </button>

                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center cursor-pointer">
                                <span className="text-white font-semibold text-sm">U</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 p-6 bg-gray-50/50 min-h-screen">
                    <div className="max-w-7xl mx-auto">
                        <Routes>
                            <Route path="/" element={<Dashboard />} />
                            <Route path="/shopping-list" element={<ShoppingList />} />
                            <Route path="/suggestions" element={<Suggestions />} />
                            <Route path="/expiration" element={<ExpirationTracker />} />
                            <Route path="/health" element={<HealthRecommendations />} />
                            <Route path="/analytics" element={<Analytics />} />
                            <Route path="/settings" element={<SettingsPage />} />
                        </Routes>
                    </div>
                </main>
            </div>
        </div>
    );
}

export default App;