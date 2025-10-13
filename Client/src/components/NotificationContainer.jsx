import React, { useEffect, useState } from 'react';
import { useNotification } from '../context/NotificationContext';
import './NotificationContainer.css';

const NotificationContainer = () => {
  const { notifications, removeNotification } = useNotification();
  const [removingIds, setRemovingIds] = useState(new Set());

  const handleRemove = (id) => {
    setRemovingIds(prev => new Set([...prev, id]));
    setTimeout(() => {
      removeNotification(id);
      setRemovingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(id);
        return newSet;
      });
    }, 300);
  };

  return (
    <div className="notification-container">
      {notifications.map(notification => (
        <div
          key={notification.id}
          className={`notification notification-${notification.type} ${
            removingIds.has(notification.id) ? 'removing' : ''
          }`}
        >
          <div className="notification-content">
            <span className="notification-message">{notification.message}</span>
            <button
              className="notification-close"
              onClick={() => handleRemove(notification.id)}
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default NotificationContainer;