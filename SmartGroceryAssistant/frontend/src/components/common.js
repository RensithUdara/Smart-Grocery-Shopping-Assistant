import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingSpinner = ({ size = 'md', text = 'Loading...' }) => {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    };

    return (
        <div className="flex flex-col items-center justify-center p-8">
            <Loader2 className={`animate-spin text-blue-600 ${sizeClasses[size]}`} />
            {text && <p className="mt-2 text-sm text-gray-600">{text}</p>}
        </div>
    );
};

export const EmptyState = ({ icon: Icon, title, description, action }) => {
    return (
        <div className="text-center py-12">
            {Icon && <Icon className="mx-auto h-12 w-12 text-gray-400" />}
            <h3 className="mt-4 text-lg font-medium text-gray-900">{title}</h3>
            {description && (
                <p className="mt-2 text-sm text-gray-500">{description}</p>
            )}
            {action && <div className="mt-6">{action}</div>}
        </div>
    );
};

export const StatCard = ({ title, value, icon: Icon, trend, color = 'blue' }) => {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-100',
        green: 'text-green-600 bg-green-100',
        yellow: 'text-yellow-600 bg-yellow-100',
        red: 'text-red-600 bg-red-100',
        purple: 'text-purple-600 bg-purple-100',
    };

    return (
        <div className="card">
            <div className="flex items-center">
                <div className="flex-shrink-0">
                    <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
                        <Icon className="h-6 w-6" />
                    </div>
                </div>
                <div className="ml-4 flex-1">
                    <p className="text-sm font-medium text-gray-600">{title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{value}</p>
                    {trend && (
                        <p className={`text-sm ${trend.positive ? 'text-green-600' : 'text-red-600'}`}>
                            {trend.value}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Badge = ({ children, variant = 'default', size = 'md' }) => {
    const variants = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800',
        info: 'bg-blue-100 text-blue-800',
    };

    const sizes = {
        sm: 'px-2 py-1 text-xs',
        md: 'px-3 py-1 text-sm',
        lg: 'px-4 py-2 text-base',
    };

    return (
        <span className={`inline-flex items-center font-medium rounded-full ${variants[variant]} ${sizes[size]}`}>
            {children}
        </span>
    );
};

export const AlertBanner = ({ type = 'info', title, description, action, onClose }) => {
    const types = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            titleText: 'text-green-900',
        },
        warning: {
            bg: 'bg-yellow-50',
            border: 'border-yellow-200',
            text: 'text-yellow-800',
            titleText: 'text-yellow-900',
        },
        danger: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            titleText: 'text-red-900',
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            titleText: 'text-blue-900',
        },
    };

    const typeStyles = types[type];

    return (
        <div className={`rounded-lg border p-4 ${typeStyles.bg} ${typeStyles.border}`}>
            <div className="flex items-start">
                <div className="flex-1">
                    {title && (
                        <h3 className={`text-sm font-medium ${typeStyles.titleText}`}>
                            {title}
                        </h3>
                    )}
                    {description && (
                        <div className={`${title ? 'mt-1' : ''} text-sm ${typeStyles.text}`}>
                            {description}
                        </div>
                    )}
                    {action && <div className="mt-3">{action}</div>}
                </div>
                {onClose && (
                    <button
                        onClick={onClose}
                        className={`ml-3 -mx-1.5 -my-1.5 rounded-lg p-1.5 hover:bg-opacity-75 ${typeStyles.text}`}
                    >
                        <span className="sr-only">Close</span>
                        ×
                    </button>
                )}
            </div>
        </div>
    );
};

export const Modal = ({ isOpen, onClose, title, children, maxWidth = 'md' }) => {
    if (!isOpen) return null;

    const maxWidthClasses = {
        sm: 'max-w-sm',
        md: 'max-w-md',
        lg: 'max-w-lg',
        xl: 'max-w-xl',
        '2xl': 'max-w-2xl',
    };

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex min-h-screen items-end justify-center px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                {/* Backdrop */}
                <div
                    className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                    onClick={onClose}
                />

                {/* Modal panel */}
                <div className={`inline-block transform overflow-hidden rounded-lg bg-white px-4 pt-5 pb-4 text-left align-bottom shadow-xl transition-all sm:my-8 sm:w-full ${maxWidthClasses[maxWidth]} sm:p-6 sm:align-middle`}>
                    {title && (
                        <div className="mb-4">
                            <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                        </div>
                    )}
                    {children}
                </div>
            </div>
        </div>
    );
};

export const ConfirmDialog = ({
    isOpen,
    onClose,
    onConfirm,
    title = 'Confirm Action',
    message,
    confirmText = 'Confirm',
    cancelText = 'Cancel',
    type = 'danger'
}) => {
    const buttonClass = type === 'danger' ? 'btn-danger' : 'btn-primary';

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={title}>
            <div className="mb-6">
                <p className="text-gray-600">{message}</p>
            </div>
            <div className="flex gap-3 justify-end">
                <button
                    onClick={onClose}
                    className="btn btn-outline"
                >
                    {cancelText}
                </button>
                <button
                    onClick={() => {
                        onConfirm();
                        onClose();
                    }}
                    className={`btn ${buttonClass}`}
                >
                    {confirmText}
                </button>
            </div>
        </Modal>
    );
};

export const Tabs = ({ tabs, activeTab, onChange }) => {
    return (
        <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
                {tabs.map((tab) => (
                    <button
                        key={tab.id}
                        onClick={() => onChange(tab.id)}
                        className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === tab.id
                                ? 'border-blue-500 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                            }`}
                    >
                        {tab.label}
                    </button>
                ))}
            </nav>
        </div>
    );
};