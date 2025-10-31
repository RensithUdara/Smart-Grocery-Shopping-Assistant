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
        fixed inset-y-0 left-0 z-50 w-80 bg-gradient-to-b from-white/98 via-white/95 to-gray-50/98 backdrop-blur-2xl shadow-2xl border-r border-gradient-to-b from-purple-200/30 via-pink-200/30 to-blue-200/30 transform transition-all duration-500 ease-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
                {/* Header */}
                <div className="relative h-28 px-6 flex items-center bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 overflow-hidden shadow-2xl">
                    <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-black/10 to-black/20"></div>
                    
                    {/* Animated background patterns */}
                    <div className="absolute inset-0">
                        <div className="absolute top-0 left-0 w-40 h-40 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '0s' }}></div>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/15 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '2s' }}></div>
                        <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                    </div>
                    
                    <div className="relative z-10 flex items-center justify-between w-full">
                        <div className="flex items-center space-x-5">
                            <div className="relative group">
                                <div className="w-14 h-14 bg-white/25 backdrop-blur-lg rounded-2xl flex items-center justify-center shadow-2xl border border-white/20 group-hover:scale-110 transition-transform duration-300">
                                    <Sparkles className="h-8 w-8 text-white drop-shadow-lg" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-5 h-5 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full animate-bounce shadow-lg border-2 border-white/50"></div>
                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white tracking-wide drop-shadow-lg">
                                    Smart Grocery
                                </h1>
                                <p className="text-white/90 text-sm font-semibold -mt-1 drop-shadow-sm">
                                    Your AI Assistant ✨
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={closeSidebar}
                            className="lg:hidden p-3 rounded-2xl bg-white/25 hover:bg-white/35 text-white transition-all duration-300 hover:scale-110 backdrop-blur-sm shadow-lg border border-white/20"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                    
                    {/* Enhanced decorative shapes */}
                    <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-bl from-white/15 to-transparent rounded-full -translate-y-18 translate-x-18 blur-xl"></div>
                    <div className="absolute bottom-0 left-0 w-28 h-28 bg-gradient-to-tr from-white/15 to-transparent rounded-full translate-y-14 -translate-x-14 blur-xl"></div>
                </div>

                {/* Navigation */}
                <nav className="mt-8 px-5">
                    <div className="space-y-2">
                        {navigation.map((item, index) => {
                            const isActive = location.pathname === item.href;
                            const Icon = item.icon;

                            return (
                                <Link
                                    key={item.name}
                                    to={item.href}
                                    onClick={closeSidebar}
                                    className={`
                    group block p-5 rounded-3xl transition-all duration-500 ease-out relative overflow-hidden transform hover:scale-[1.02] active:scale-[0.98]
                    ${isActive
                                            ? `bg-gradient-to-r ${item.gradient} text-white shadow-2xl shadow-purple-500/25 border border-white/20`
                                            : `hover:${item.bgColor} text-gray-700 hover:shadow-xl hover:shadow-gray-300/30 border-2 border-gray-100/50 hover:border-gray-200/80 bg-white/60 backdrop-blur-sm`
                                        }
                  `}
                                    style={{
                                        animationDelay: `${index * 100}ms`
                                    }}
                                >
                                    <div className="flex items-center space-x-5">
                                        <div className={`
                      relative p-4 rounded-2xl transition-all duration-500 group-hover:rotate-6 group-hover:scale-110
                      ${isActive
                                                ? 'bg-white/25 shadow-2xl backdrop-blur-sm border border-white/30'
                                                : `${item.bgColor} group-hover:shadow-lg border border-gray-200/50`
                                            }
                    `}>
                                            <Icon className={`h-7 w-7 transition-colors duration-300 ${isActive ? 'text-white drop-shadow-lg' : item.textColor}`} />
                                            {isActive && (
                                                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-white/20 to-transparent animate-pulse"></div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className={`font-bold text-xl mb-1 transition-colors duration-300 ${isActive ? 'text-white drop-shadow-lg' : 'text-gray-800'}`}>
                                                {item.name}
                                            </h3>
                                            <p className={`text-sm font-medium leading-relaxed ${isActive ? 'text-white/90' : 'text-gray-600'}`}>
                                                {item.description}
                                            </p>
                                        </div>
                                        <div className="flex flex-col items-center space-y-2">
                                            {isActive && (
                                                <div className="flex space-x-1">
                                                    <div className="w-2.5 h-2.5 bg-white rounded-full animate-pulse shadow-lg"></div>
                                                    <div className="w-2.5 h-2.5 bg-white/80 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.3s' }}></div>
                                                    <div className="w-2.5 h-2.5 bg-white/60 rounded-full animate-pulse shadow-lg" style={{ animationDelay: '0.6s' }}></div>
                                                </div>
                                            )}
                                            <div className={`w-1 h-8 rounded-full transition-all duration-500 ${isActive ? 'bg-white/40' : 'bg-gray-300 group-hover:bg-gray-400'}`}></div>
                                        </div>
                                    </div>
                                    
                                    {/* Enhanced decorative elements */}
                                    {isActive && (
                                        <div className="absolute inset-0 rounded-3xl">
                                            <div className="absolute top-2 right-2 w-8 h-8 bg-white/20 rounded-full blur-lg animate-pulse"></div>
                                            <div className="absolute bottom-2 left-2 w-6 h-6 bg-white/15 rounded-full blur-md animate-pulse" style={{ animationDelay: '1s' }}></div>
                                        </div>
                                    )}
                                    
                                    {/* Gradient hover overlay */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${item.gradient} opacity-0 group-hover:opacity-[0.15] transition-all duration-500 rounded-3xl`}></div>
                                    
                                    {/* Shimmer effect on hover */}
                                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </nav>

                {/* User Profile Section */}
                <div className="absolute bottom-0 left-0 right-0 p-5">
                    <div className="bg-gradient-to-r from-white/90 via-white/95 to-gray-50/90 backdrop-blur-xl rounded-3xl border border-gray-200/60 shadow-2xl shadow-gray-300/20">
                        <div className="flex items-center space-x-5 p-6 hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-500 cursor-pointer rounded-3xl group">
                            <div className="relative">
                                <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl flex items-center justify-center shadow-2xl border-2 border-white/50 group-hover:scale-110 transition-transform duration-300">
                                    <User className="h-8 w-8 text-white drop-shadow-lg" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full border-3 border-white shadow-xl animate-pulse flex items-center justify-center">
                                    <div className="w-2 h-2 bg-white rounded-full"></div>
                                </div>
                                {/* Decorative ring */}
                                <div className="absolute inset-0 rounded-3xl border-2 border-gradient-to-r from-purple-300/50 to-pink-300/50 scale-110 opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                            </div>
                            <div className="flex-1">
                                <div className="text-xl font-bold text-gray-800 mb-1 group-hover:text-gray-900 transition-colors">Alex Johnson</div>
                                <div className="text-sm text-gray-600 flex items-center space-x-3">
                                    <div className="flex items-center space-x-2">
                                        <div className="w-2 h-2 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                                        <span className="font-semibold">Premium Pro</span>
                                    </div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                                    <span className="text-purple-600 font-bold flex items-center space-x-1">
                                        <Sparkles className="h-3 w-3" />
                                        <span>AI Enhanced</span>
                                    </span>
                                </div>
                                <div className="mt-2 flex items-center space-x-2">
                                    <div className="flex-1 bg-gradient-to-r from-purple-200 to-pink-200 rounded-full h-1.5 overflow-hidden">
                                        <div className="bg-gradient-to-r from-purple-500 to-pink-500 h-full w-4/5 rounded-full shadow-sm"></div>
                                    </div>
                                    <span className="text-xs font-bold text-purple-600">80%</span>
                                </div>
                            </div>
                            <div className="relative">
                                <div className="p-3 rounded-2xl hover:bg-gray-100/80 transition-all duration-300 hover:scale-110 group/settings">
                                    <Settings className="h-6 w-6 text-gray-400 group-hover/settings:text-gray-600 transition-colors" />
                                </div>
                                {/* Notification badge */}
                                <div className="absolute -top-1 -right-1 w-4 h-4 bg-gradient-to-r from-red-400 to-pink-400 rounded-full flex items-center justify-center shadow-lg">
                                    <span className="text-white text-xs font-bold">3</span>
                                </div>
                            </div>
                        </div>
                        
                        {/* Bottom gradient bar */}
                        <div className="h-1 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-b-3xl"></div>
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

                                <div className="relative group">
                                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-2xl flex items-center justify-center cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105">
                                        <User className="h-5 w-5 text-white" />
                                    </div>
                                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Page content */}
                <main className="flex-1 p-8 bg-gradient-to-br from-gray-50/50 via-white to-blue-50/30 min-h-screen">
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