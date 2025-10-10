const API_URL = import.meta.env.VITE_API_URL;

const getAuthHeaders = () => ({
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
});

export const collaborationService = {
  // Send collaboration request
  sendRequest: async (documentId, email, permission, message) => {
    const response = await fetch(`${API_URL}/api/collaboration/request`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ documentId, email, permission, message })
    });
    return response.json();
  },

  // Respond to collaboration request
  respondToRequest: async (requestId, action) => {
    const response = await fetch(`${API_URL}/api/collaboration/respond`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ requestId, action })
    });
    return response.json();
  },

  // Generate share link
  generateShareLink: async (documentId, permission) => {
    const response = await fetch(`${API_URL}/api/collaboration/share-link`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ documentId, permission })
    });
    return response.json();
  },

  // Get collaboration requests
  getRequests: async () => {
    const response = await fetch(`${API_URL}/api/collaboration/requests`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Get collaborative documents
  getDocuments: async () => {
    const response = await fetch(`${API_URL}/api/collaboration/documents`, {
      headers: getAuthHeaders()
    });
    return response.json();
  }
};

export const notificationService = {
  // Get notifications
  getNotifications: async (page = 1, limit = 20) => {
    const response = await fetch(`${API_URL}/api/notifications?page=${page}&limit=${limit}`, {
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Mark notification as read
  markAsRead: async (notificationId) => {
    const response = await fetch(`${API_URL}/api/notifications/${notificationId}/read`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return response.json();
  },

  // Mark all notifications as read
  markAllAsRead: async () => {
    const response = await fetch(`${API_URL}/api/notifications/read-all`, {
      method: 'PATCH',
      headers: getAuthHeaders()
    });
    return response.json();
  }
};