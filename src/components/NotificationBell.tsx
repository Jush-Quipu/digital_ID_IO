import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { NotificationService, Notification } from '../utils/notificationHelpers';
import { auth } from '../firebase';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) return;

    const unsubscribe = NotificationService.subscribeToNotifications(
      auth.currentUser.uid,
      setNotifications
    );

    return () => unsubscribe();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAsRead = async (notificationId: string) => {
    await NotificationService.markAsRead(notificationId);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="relative p-2 rounded-full hover:bg-gray-700 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-cyan-500 text-xs w-5 h-5 flex items-center justify-center rounded-full">
            {unreadCount}
          </span>
        )}
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-lg border border-gray-700 z-50">
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">Notifications</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-gray-400 text-sm">No notifications</p>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-3 rounded-md ${
                      notification.read ? 'bg-gray-700/50' : 'bg-gray-700'
                    }`}
                    onClick={() => handleMarkAsRead(notification.id)}
                  >
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;