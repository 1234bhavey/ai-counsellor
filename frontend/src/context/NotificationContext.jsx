import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

const NotificationItem = ({ notification, onRemove }) => {
  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    info: Info
  };

  const colors = {
    success: 'bg-green-50 border-green-200 text-green-800',
    error: 'bg-red-50 border-red-200 text-red-800',
    info: 'bg-blue-50 border-blue-200 text-blue-800'
  };

  const Icon = icons[notification.type] || Info;

  return (
    <div className={`flex items-center justify-between p-4 rounded-xl border shadow-lg backdrop-blur-sm animate-slide-up ${colors[notification.type]}`}>
      <div className="flex items-center space-x-3">
        <Icon className="h-5 w-5 flex-shrink-0" />
        <div>
          <p className="font-medium text-sm">{notification.title}</p>
          {notification.message && (
            <p className="text-xs opacity-90 mt-1">{notification.message}</p>
          )}
        </div>
      </div>
      <button
        onClick={() => onRemove(notification.id)}
        className="ml-4 text-current opacity-60 hover:opacity-100 transition-opacity"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
};

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: 'info',
      duration: 5000,
      ...notification
    };

    setNotifications(prev => [...prev, newNotification]);

    // Auto remove after duration
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const showSuccess = useCallback((title, message, duration = 4000) => {
    return addNotification({ type: 'success', title, message, duration });
  }, [addNotification]);

  const showError = useCallback((title, message, duration = 6000) => {
    return addNotification({ type: 'error', title, message, duration });
  }, [addNotification]);

  const showInfo = useCallback((title, message, duration = 5000) => {
    return addNotification({ type: 'info', title, message, duration });
  }, [addNotification]);

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      clearAll,
      showSuccess,
      showError,
      showInfo
    }}>
      {children}
      
      {/* Notification Container */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-sm">
          {notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onRemove={removeNotification}
            />
          ))}
        </div>
      )}
    </NotificationContext.Provider>
  );
};