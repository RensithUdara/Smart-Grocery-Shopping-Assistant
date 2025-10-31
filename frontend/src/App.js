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
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Sidebar */}
            <div className={`
        fixed inset-y-0 left-0 z-50 w-80 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 transform transition-all duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Header */}
                <div className="relative h-24 px-6 flex items-center bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 overflow-hidden">
                    <div className="absolute inset-0 bg-black/10"></div>
                    <div className="relative z-10 flex items-center justify-between w-full">
                        <div className="flex items-center space-x-4">
                            <div className="relative">
                                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg">
                                    <Sparkles className="h-7 w-7 text-white" />
                                </div>
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white tracking-wide">
                                    Smart Grocery
                                </h1>
                                <p className="text-white/80 text-sm font-medium -mt-1">
                                    Your AI Assistant ✨
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={closeSidebar}
                            className="lg:hidden p-2 rounded-xl bg-white/20 hover:bg-white/30 text-white transition-all duration-200"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>
                    {/* Decorative shapes */}
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16"></div>
                    <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full translate-y-12 -translate-x-12"></div>
                </div>

                {/* Navigation */}
                <nav className="mt-6 px-4">
                    <div className="space-y-3">
                        {navigation.map((item, index) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={closeSidebar}
                                    className={`
                    group block p-4 rounded-2xl transition-all duration-300 ease-in-out relative overflow-hidden hover:scale-105
                    ${isActive
                                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-xl transform scale-105`
                                            : `hover:${item.bgColor} text-gray-700 hover:shadow-lg border-2 border-transparent hover:border-gray-100`
                                        }
                  `}
                                >
                                    <div className="flex items-center space-x-4">
                                        <div className={`
                      p-3 rounded-xl transition-all duration-300
                      ${isActive
                                                ? 'bg-white/20 shadow-lg'
                                                : `${item.bgColor} group-hover:scale-110`
                                            }
                    `}>
                                            <Icon className={`h-6 w-6 ${isActive ? 'text-white' : item.textColor}`} />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-semibold text-lg ${isActive ? 'text-white' : 'text-gray-800'}`}>
                                                {item.name}
                                            </h3>
                                            <p className={`text-sm mt-1 ${isActive ? 'text-white/80' : 'text-gray-500'}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                        {isActive && (
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                                                <div className="w-2 h-2 bg-white/70 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        )}
                                    </div>
                                    {/* Decorative gradient overlay for hover effect */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile Section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-r from-gray-50 to-white rounded-t-3xl border-t border-gray-200">
                    <div className="flex items-center space-x-4 p-4 rounded-2xl bg-white hover:shadow-lg transition-all duration-300 cursor-pointer border border-gray-100">
                        <div className="relative">
                            <div className="w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center shadow-lg">
                                <User className="h-6 w-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                        </div>
                        <div className="flex-1">
                            <div className="text-base font-bold text-gray-800">Alex Johnson</div>
                            <div className="text-sm text-gray-500 flex items-center space-x-2">
                                <span>Premium Pro</span>
                                <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                <span className="text-purple-600 font-medium">✨ AI Enhanced</span>
                            </div>
                        </div>
                        <div className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
                            <Settings className="h-5 w-5 text-gray-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="lg:pl-80">
                {/* Top bar */}
                <div className="sticky top-0 z-30 bg-white/90 backdrop-blur-xl border-b border-gray-200/50 shadow-lg">
                    <div className="flex items-center justify-between px-8 py-5">
                        <div className="flex items-center space-x-6">
                            <button
                                onClick={() => setSidebarOpen(true)}
                                className="lg:hidden p-3 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg transition-all duration-200"
                            >
                                <Menu className="h-6 w-6" />
                            </button>
                            <div className="hidden lg:block">
                                <div className="flex items-center space-x-3 mb-2">
                                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                                        {navigation.find(item => item.href === location.pathname)?.name || 'Dashboard'}
                                    </h1>
                                    <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full">
                                        <span className="text-xs font-bold text-purple-600">✨ AI</span>
                                    </div>
                                </div>
                                <p className="text-gray-600 font-medium">
                                    {navigation.find(item => item.href === location.pathname)?.description || 'Welcome back! Here\'s what\'s happening today.'}
                                </p>
                            </div>
                        </div>

                        {/* Top bar actions */}
                        <div className="flex items-center space-x-4">
                            {/* Search bar */}
                            <div className="hidden md:flex items-center bg-gray-50 rounded-2xl px-4 py-2 hover:bg-gray-100 transition-colors">
                                <Search className="h-5 w-5 text-gray-400 mr-3" />
                                <input
                                    type="text"
                                    placeholder="Search groceries..."
                                    className="bg-transparent text-gray-600 placeholder-gray-400 outline-none w-48"
                                />
                            </div>

                            {/* Status indicators */}
                            <div className="hidden lg:flex items-center space-x-3">
                                <div className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-50 to-green-50 rounded-2xl border border-emerald-200">
                                    <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-sm font-semibold text-emerald-700">All Systems Active</span>
                                </div>
                                <div className="px-3 py-2 bg-gray-100 rounded-xl">
                                    <span className="text-sm font-semibold text-gray-600">
                                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                </div>
                            </div>

                            {/* Action buttons */}
                            <div className="flex items-center space-x-2">
                                <button className="relative p-3 rounded-2xl bg-gradient-to-r from-orange-100 to-red-100 text-orange-600 hover:shadow-lg transition-all duration-200 hover:scale-105">
                                    <Bell className="h-5 w-5" />
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs font-bold text-white">3</span>
                                    </div>
                                </button>

                                <button className="p-3 rounded-2xl bg-gradient-to-r from-pink-100 to-rose-100 text-pink-600 hover:shadow-lg transition-all duration-200 hover:scale-105">
                                    <Sun className="h-5 w-5" />
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