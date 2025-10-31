import React, { useState, useEffect } from 'react';
import {
    Settings as SettingsIcon,
    User,
    Bell,
    Shield,
    Database,
    Download,
    Upload,
    Trash2,
    Save,
    RefreshCw,
    Eye,
    EyeOff,
    Check
} from 'lucide-react';
import {
    Badge,
    Modal,
    AlertBanner,
    ConfirmDialog,
    Tabs
} from '../components/common';
import toast from 'react-hot-toast';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showExportModal, setShowExportModal] = useState(false);
    const [settings, setSettings] = useState({
        profile: {
            name: 'John Doe',
            email: 'john@example.com',
            dietary_preferences: [],
            allergies: [],
            household_size: 2,
            budget_limit: 500
        },
        notifications: {
            expiration_alerts: true,
            price_alerts: true,
            shopping_reminders: true,
            health_tips: true,
            weekly_summary: true,
            email_notifications: false
        },
        privacy: {
            data_sharing: false,
            analytics_tracking: true,
            location_access: false,
            crash_reporting: true
        },
        data: {
            auto_backup: true,
            backup_frequency: 'weekly',
            storage_used: '2.4 MB',
            last_backup: '2024-01-15'
        }
    });

    const [unsavedChanges, setUnsavedChanges] = useState(false);
    const [saving, setSaving] = useState(false);

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'privacy', label: 'Privacy', icon: Shield },
        { id: 'data', label: 'Data & Backup', icon: Database }
    ];

    const dietaryOptions = [
        'Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free',
        'Keto', 'Paleo', 'Low-Carb', 'Low-Sodium'
    ];

    const allergyOptions = [
        'Nuts', 'Dairy', 'Gluten', 'Eggs', 'Soy', 'Shellfish', 'Fish'
    ];

    const updateSetting = (section, key, value) => {
        setSettings(prev => ({
            ...prev,
            [section]: {
                ...prev[section],
                [key]: value
            }
        }));
        setUnsavedChanges(true);
    };

    const saveSettings = async () => {
        setSaving(true);
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Here you would typically send to your backend
            toast.success('Settings saved successfully');
            setUnsavedChanges(false);
        } catch (error) {
            toast.error('Failed to save settings');
        } finally {
            setSaving(false);
        }
    };

    const exportData = () => {
        const dataToExport = {
            settings,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };

        const dataStr = JSON.stringify(dataToExport, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `grocery-assistant-settings-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
        toast.success('Settings exported successfully');
        setShowExportModal(false);
    };

    const clearAllData = async () => {
        try {
            // Simulate API call to clear data
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success('All data cleared successfully');
            setShowDeleteModal(false);
        } catch (error) {
            toast.error('Failed to clear data');
        }
    };

    const renderProfileTab = () => (
        <div className="space-y-6">
            {/* Basic Information */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={settings.profile.name}
                            onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address
                        </label>
                        <input
                            type="email"
                            value={settings.profile.email}
                            onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                            className="input"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Household Size
                        </label>
                        <select
                            value={settings.profile.household_size}
                            onChange={(e) => updateSetting('profile', 'household_size', parseInt(e.target.value))}
                            className="input"
                        >
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(size => (
                                <option key={size} value={size}>{size} {size === 1 ? 'person' : 'people'}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Monthly Budget ($)
                        </label>
                        <input
                            type="number"
                            value={settings.profile.budget_limit}
                            onChange={(e) => updateSetting('profile', 'budget_limit', parseFloat(e.target.value))}
                            className="input"
                            min="0"
                            step="10"
                        />
                    </div>
                </div>
            </div>

            {/* Dietary Preferences */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Dietary Preferences</h3>
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Select your dietary preferences:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {dietaryOptions.map(option => (
                                <button
                                    key={option}
                                    onClick={() => {
                                        const current = settings.profile.dietary_preferences;
                                        const updated = current.includes(option)
                                            ? current.filter(p => p !== option)
                                            : [...current, option];
                                        updateSetting('profile', 'dietary_preferences', updated);
                                    }}
                                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${settings.profile.dietary_preferences.includes(option)
                                            ? 'bg-blue-100 border-blue-300 text-blue-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {settings.profile.dietary_preferences.includes(option) && (
                                        <Check className="h-3 w-3 inline mr-1" />
                                    )}
                                    {option}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Allergies and restrictions:
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {allergyOptions.map(allergy => (
                                <button
                                    key={allergy}
                                    onClick={() => {
                                        const current = settings.profile.allergies;
                                        const updated = current.includes(allergy)
                                            ? current.filter(a => a !== allergy)
                                            : [...current, allergy];
                                        updateSetting('profile', 'allergies', updated);
                                    }}
                                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${settings.profile.allergies.includes(allergy)
                                            ? 'bg-red-100 border-red-300 text-red-700'
                                            : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    {settings.profile.allergies.includes(allergy) && (
                                        <Check className="h-3 w-3 inline mr-1" />
                                    )}
                                    {allergy}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderNotificationsTab = () => (
        <div className="space-y-6">
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Notification Preferences</h3>
                <div className="space-y-4">
                    {[
                        { key: 'expiration_alerts', label: 'Expiration Alerts', description: 'Get notified when items are about to expire' },
                        { key: 'price_alerts', label: 'Price Alerts', description: 'Alerts for price changes on your items' },
                        { key: 'shopping_reminders', label: 'Shopping Reminders', description: 'Reminders for regular shopping trips' },
                        { key: 'health_tips', label: 'Health Tips', description: 'Weekly nutritional recommendations' },
                        { key: 'weekly_summary', label: 'Weekly Summary', description: 'Weekly shopping and spending summary' },
                        { key: 'email_notifications', label: 'Email Notifications', description: 'Receive notifications via email' }
                    ].map(item => (
                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1">
                                <h4 className="font-medium text-gray-900">{item.label}</h4>
                                <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.notifications[item.key]}
                                    onChange={(e) => updateSetting('notifications', item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderPrivacyTab = () => (
        <div className="space-y-6">
            <AlertBanner
                type="info"
                title="Privacy & Security"
                description="Your privacy is important to us. You control what data is shared and how it's used."
            />

            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Privacy Settings</h3>
                <div className="space-y-4">
                    {[
                        {
                            key: 'data_sharing',
                            label: 'Data Sharing',
                            description: 'Allow anonymous data sharing to improve the service',
                            warning: true
                        },
                        {
                            key: 'analytics_tracking',
                            label: 'Analytics Tracking',
                            description: 'Track usage patterns to provide better recommendations'
                        },
                        {
                            key: 'location_access',
                            label: 'Location Access',
                            description: 'Use location to find nearby stores and deals',
                            warning: true
                        },
                        {
                            key: 'crash_reporting',
                            label: 'Crash Reporting',
                            description: 'Automatically send crash reports to help improve the app'
                        }
                    ].map(item => (
                        <div key={item.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                            <div className="flex-1">
                                <div className="flex items-center">
                                    <h4 className="font-medium text-gray-900">{item.label}</h4>
                                    {item.warning && (
                                        <Badge variant="warning" size="sm" className="ml-2">
                                            Sensitive
                                        </Badge>
                                    )}
                                </div>
                                <p className="text-sm text-gray-600">{item.description}</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={settings.privacy[item.key]}
                                    onChange={(e) => updateSetting('privacy', item.key, e.target.checked)}
                                    className="sr-only peer"
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    ))}
                </div>
            </div>

            {/* Data Usage Summary */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Data Usage Summary</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">Data Collected</h4>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Shopping lists and purchase history</li>
                            <li>• Food preferences and dietary restrictions</li>
                            <li>• Usage patterns and app interactions</li>
                        </ul>
                    </div>

                    <div className="p-3 bg-gray-50 rounded-lg">
                        <h4 className="font-medium text-gray-900">Data Not Collected</h4>
                        <ul className="text-sm text-gray-600 mt-2 space-y-1">
                            <li>• Personal messages or communications</li>
                            <li>• Financial account information</li>
                            <li>• Precise location without permission</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );

    const renderDataTab = () => (
        <div className="space-y-6">
            {/* Storage Information */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Storage Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{settings.data.storage_used}</div>
                        <div className="text-sm text-gray-600">Storage Used</div>
                    </div>

                    <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                            {settings.data.last_backup ? new Date(settings.data.last_backup).toLocaleDateString() : 'Never'}
                        </div>
                        <div className="text-sm text-gray-600">Last Backup</div>
                    </div>

                    <div className="text-center">
                        <Badge variant={settings.data.auto_backup ? 'success' : 'warning'}>
                            {settings.data.auto_backup ? 'Enabled' : 'Disabled'}
                        </Badge>
                        <div className="text-sm text-gray-600 mt-1">Auto Backup</div>
                    </div>
                </div>
            </div>

            {/* Backup Settings */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Backup Settings</h3>
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Automatic Backup</h4>
                            <p className="text-sm text-gray-600">Automatically backup your data</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings.data.auto_backup}
                                onChange={(e) => updateSetting('data', 'auto_backup', e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Backup Frequency
                        </label>
                        <select
                            value={settings.data.backup_frequency}
                            onChange={(e) => updateSetting('data', 'backup_frequency', e.target.value)}
                            className="input max-w-xs"
                            disabled={!settings.data.auto_backup}
                        >
                            <option value="daily">Daily</option>
                            <option value="weekly">Weekly</option>
                            <option value="monthly">Monthly</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Data Management Actions */}
            <div className="card">
                <h3 className="text-lg font-semibold mb-4">Data Management</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Export Data */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium mb-2">Export Your Data</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Download all your data in a portable format
                        </p>
                        <button
                            onClick={() => setShowExportModal(true)}
                            className="btn btn-outline w-full"
                        >
                            <Download className="h-4 w-4 mr-2" />
                            Export Data
                        </button>
                    </div>

                    {/* Import Data */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium mb-2">Import Data</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Restore data from a previous export
                        </p>
                        <button
                            onClick={() => toast.info('Import feature coming soon')}
                            className="btn btn-outline w-full"
                            disabled
                        >
                            <Upload className="h-4 w-4 mr-2" />
                            Import Data
                        </button>
                    </div>

                    {/* Backup Now */}
                    <div className="p-4 border border-gray-200 rounded-lg">
                        <h4 className="font-medium mb-2">Create Backup</h4>
                        <p className="text-sm text-gray-600 mb-3">
                            Create a backup of your data right now
                        </p>
                        <button
                            onClick={() => {
                                toast.success('Backup created successfully');
                                updateSetting('data', 'last_backup', new Date().toISOString().split('T')[0]);
                            }}
                            className="btn btn-primary w-full"
                        >
                            <RefreshCw className="h-4 w-4 mr-2" />
                            Create Backup
                        </button>
                    </div>

                    {/* Clear Data */}
                    <div className="p-4 border border-red-200 rounded-lg bg-red-50">
                        <h4 className="font-medium mb-2 text-red-800">Clear All Data</h4>
                        <p className="text-sm text-red-700 mb-3">
                            Permanently delete all your data (cannot be undone)
                        </p>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="btn btn-danger w-full"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Clear All Data
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
                    <p className="text-gray-600">Manage your preferences and account settings</p>
                </div>

                {unsavedChanges && (
                    <button
                        onClick={saveSettings}
                        disabled={saving}
                        className="btn btn-primary"
                    >
                        {saving ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="h-4 w-4 mr-2" />
                                Save Changes
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* Unsaved Changes Alert */}
            {unsavedChanges && (
                <AlertBanner
                    type="warning"
                    title="Unsaved Changes"
                    description="You have unsaved changes. Don't forget to save them before leaving this page."
                />
            )}

            {/* Tabs */}
            <Tabs
                tabs={tabs}
                activeTab={activeTab}
                onTabChange={setActiveTab}
            />

            {/* Tab Content */}
            <div className="tab-content">
                {activeTab === 'profile' && renderProfileTab()}
                {activeTab === 'notifications' && renderNotificationsTab()}
                {activeTab === 'privacy' && renderPrivacyTab()}
                {activeTab === 'data' && renderDataTab()}
            </div>

            {/* Export Modal */}
            {showExportModal && (
                <Modal onClose={() => setShowExportModal(false)} title="Export Your Data">
                    <div className="space-y-4">
                        <p className="text-gray-600">
                            This will download all your settings, shopping lists, purchase history, and preferences in JSON format.
                        </p>

                        <div className="p-4 bg-blue-50 rounded-lg">
                            <h4 className="font-medium text-blue-900 mb-2">What's included:</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• User profile and preferences</li>
                                <li>• Shopping lists and items</li>
                                <li>• Purchase history</li>
                                <li>• App settings and configurations</li>
                            </ul>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowExportModal(false)}
                                className="btn btn-outline flex-1"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={exportData}
                                className="btn btn-primary flex-1"
                            >
                                <Download className="h-4 w-4 mr-2" />
                                Download Data
                            </button>
                        </div>
                    </div>
                </Modal>
            )}

            {/* Delete Confirmation */}
            <ConfirmDialog
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={clearAllData}
                title="Clear All Data"
                message="This will permanently delete all your data including shopping lists, purchase history, and settings. This action cannot be undone."
                confirmText="Delete Everything"
                cancelText="Keep Data"
                variant="danger"
            />
        </div>
    );
};

export default Settings;