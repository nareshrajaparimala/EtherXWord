import React, { useState, useEffect } from 'react';
import './CollaborationRequests.css';
import { useNotification } from '../context/NotificationContext';

const CollaborationRequests = () => {
  const { showNotification } = useNotification();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/collaboration/requests`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching collaboration requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const respondToRequest = async (requestId, action) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/collaboration/respond`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ requestId, action })
      });

      if (response.ok) {
        setRequests(requests.filter(req => req._id !== requestId));
        showNotification(`Collaboration request ${action}ed successfully!`, 'success');
      } else {
        const error = await response.json();
        showNotification(error.message || `Failed to ${action} request`, 'error');
      }
    } catch (error) {
      console.error(`Error ${action}ing request:`, error);
      showNotification(`Failed to ${action} request`, 'error');
    }
  };

  if (loading) {
    return <div className="loading">Loading collaboration requests...</div>;
  }

  if (requests.length === 0) {
    return (
      <div className="no-requests">
        <i className="ri-user-add-line"></i>
        <p>No collaboration requests</p>
      </div>
    );
  }

  return (
    <div className="collaboration-requests">
      <h3>Collaboration Requests</h3>
      <div className="requests-list">
        {requests.map(request => (
          <div key={request._id} className="request-item">
            <div className="request-info">
              <div className="request-header">
                <strong>{request.sender.fullName}</strong>
                <span className="request-time">
                  {new Date(request.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p className="request-document">
                Document: <strong>{request.document.title}</strong>
              </p>
              <p className="request-permission">
                Permission: <span className={`permission ${request.permission}`}>
                  {request.permission === 'edit' ? 'Can Edit' : 'Can View'}
                </span>
              </p>
              {request.message && (
                <p className="request-message">"{request.message}"</p>
              )}
            </div>
            <div className="request-actions">
              <button
                onClick={() => respondToRequest(request._id, 'accept')}
                className="btn btn-accept"
              >
                <i className="ri-check-line"></i>
                Accept
              </button>
              <button
                onClick={() => respondToRequest(request._id, 'reject')}
                className="btn btn-reject"
              >
                <i className="ri-close-line"></i>
                Decline
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CollaborationRequests;