import React from 'react';
import { Bell, Calendar, MessageSquare, X, CheckCheck } from 'lucide-react';
import { BRAND_CONFIG } from '../brandConfig';

interface Notification {
    id: string;
    type: 'appointment' | 'message';
    title: string;
    message: string;
    time: string;
    isRead: boolean;
}

interface NotificationDropdownProps {
    isOpen: boolean;
    onClose: () => void;
    notifications: Notification[];
    onMarkAsRead: (id: string) => void;
    onMarkAllAsRead: () => void;
    onNotificationClick: (notification: Notification) => void;
    onViewAll: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
    isOpen,
    onClose,
    notifications,
    onMarkAsRead,
    onMarkAllAsRead,
    onNotificationClick,
    onViewAll
}) => {
    if (!isOpen) return null;

    const unreadCount = notifications.filter(n => !n.isRead).length;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 z-40"
                onClick={onClose}
            />

            {/* Dropdown */}
            <div className="absolute right-0 top-16 w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 animate-in slide-in-from-top-5 duration-200">
                {/* Header */}
                <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div>
                        <h3 className="font-bold text-slate-900 text-lg">Bildirişlər</h3>
                        {unreadCount > 0 && (
                            <p className="text-xs text-slate-500 mt-0.5">{unreadCount} oxunmamış</p>
                        )}
                    </div>
                    <div className="flex items-center gap-2">
                        {unreadCount > 0 && (
                            <button
                                onClick={onMarkAllAsRead}
                                className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1"
                            >
                                <CheckCheck size={14} />
                                Hamısını oxu
                            </button>
                        )}
                        <button
                            onClick={onClose}
                            className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                        >
                            <X size={18} />
                        </button>
                    </div>
                </div>

                {/* Notifications List */}
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                    {notifications.length === 0 ? (
                        <div className="p-8 text-center">
                            <Bell size={32} className="mx-auto mb-3 text-slate-300" />
                            <p className="text-slate-400 text-sm font-medium">Bildiriş yoxdur</p>
                        </div>
                    ) : (
                        notifications.map((notification) => (
                            <div
                                key={notification.id}
                                onClick={() => {
                                    onNotificationClick(notification);
                                    if (!notification.isRead) {
                                        onMarkAsRead(notification.id);
                                    }
                                }}
                                className={`p-4 border-b border-slate-50 cursor-pointer transition-colors hover:bg-slate-50 ${!notification.isRead ? 'bg-emerald-50/30' : ''
                                    }`}
                            >
                                <div className="flex gap-3">
                                    {/* Icon */}
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${notification.type === 'appointment'
                                        ? 'bg-blue-100 text-blue-600'
                                        : 'bg-emerald-100 text-emerald-600'
                                        }`}>
                                        {notification.type === 'appointment' ? (
                                            <Calendar size={20} />
                                        ) : (
                                            <MessageSquare size={20} />
                                        )}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <h4 className={`text-sm font-bold text-slate-900 ${!notification.isRead ? 'font-extrabold' : ''}`}>
                                                {notification.title}
                                            </h4>
                                            {!notification.isRead && (
                                                <span className="w-2 h-2 bg-emerald-500 rounded-full shrink-0 mt-1.5" />
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">{notification.message}</p>
                                        <p className="text-[10px] text-slate-400 font-medium">{notification.time}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {notifications.length > 0 && (
                    <div className="p-3 border-t border-slate-100 text-center">
                        <button
                            onClick={onViewAll}
                            className="text-xs text-slate-500 hover:text-emerald-600 font-semibold transition-colors"
                        >
                            Hamısını gör
                        </button>
                    </div>
                )}
            </div>
        </>
    );
};

export default NotificationDropdown;
