import { useNotification } from '../context/NotificationContext';

// Utility hook to replace alert functions with notifications
export const useAlert = () => {
  const { showNotification } = useNotification();

  const alert = (message, type = 'info') => {
    return showNotification(message, type);
  };

  const success = (message) => {
    return showNotification(message, 'success');
  };

  const error = (message) => {
    return showNotification(message, 'error');
  };

  const warning = (message) => {
    return showNotification(message, 'warning');
  };

  const info = (message) => {
    return showNotification(message, 'info');
  };

  return { alert, success, error, warning, info };
};