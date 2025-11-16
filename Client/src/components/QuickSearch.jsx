import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotification } from '../context/NotificationContext';
import './QuickSearch.css';

const QuickSearch = ({ onResults, placeholder = "Search documents by title, content, or document address..." }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const searchRef = useRef(null);
  const resultsRef = useRef(null);
  const debounceRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setResults([]);
      setShowResults(false);
      if (onResults) onResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/documents/search?q=${encodeURIComponent(searchQuery)}`,
        {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      if (response.ok) {
        const data = await response.json();
        setResults(data);
        setShowResults(true);
        if (onResults) onResults(data);
      } else {
        throw new Error('Search failed');
      }
    } catch (error) {
      console.error('Search error:', error);
      showNotification('Search failed. Please try again.', 'error');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);
    setSelectedIndex(-1);

    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Debounce search
    debounceRef.current = setTimeout(() => {
      performSearch(value);
    }, 300);
  };

  const handleKeyDown = (e) => {
    if (!showResults || results.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < results.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : results.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && results[selectedIndex]) {
          openDocument(results[selectedIndex]);
        } else if (results.length > 0) {
          openDocument(results[0]);
        }
        break;
      case 'Escape':
        setShowResults(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const openDocument = (doc) => {
    setShowResults(false);
    setQuery('');
    
    // Add to recent documents
    const recentDocs = JSON.parse(localStorage.getItem('recentDocuments') || '[]');
    const docData = {
      title: doc.title,
      lastModified: new Date().toISOString(),
      preview: doc.content?.replace(/<[^>]*>/g, '').substring(0, 100) || 'No preview available',
      wordCount: doc.wordCount || 0,
      id: doc._id,
      documentAddress: doc.documentAddress
    };
    
    const filtered = recentDocs.filter(d => 
      d.id !== doc._id && d.documentAddress !== doc.documentAddress
    );
    filtered.unshift(docData);
    localStorage.setItem('recentDocuments', JSON.stringify(filtered.slice(0, 10)));
    
    // Determine the correct route based on identifier type
    let route;
    const identifier = doc.documentAddress || doc._id;
    
    if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
      // MongoDB ObjectId format
      route = doc.userPermission === 'edit' || doc.isOwner ? `/editor/${identifier}` : `/viewer/${identifier}`;
    } else {
      // Document address format
      route = doc.userPermission === 'edit' || doc.isOwner ? `/editor/address/${identifier}` : `/viewer/address/${identifier}`;
    }
    
    console.log('Navigating to:', route, 'for document:', doc.title);
    navigate(route);
  };

  const highlightMatch = (text, query) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark>$1</mark>');
  };

  const getDocumentTypeIcon = (doc) => {
    if (doc.isOwner) return 'ri-file-text-line';
    if (doc.userPermission === 'edit') return 'ri-edit-line';
    return 'ri-eye-line';
  };

  const getDocumentTypeBadge = (doc) => {
    if (doc.isOwner) return { text: 'Owner', className: 'owner' };
    if (doc.userPermission === 'edit') return { text: 'Editor', className: 'editor' };
    return { text: 'Viewer', className: 'viewer' };
  };

  return (
    <div className="quick-search" ref={searchRef}>
      <div className="search-input-container">
        <i className="ri-search-line search-icon"></i>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query && setShowResults(true)}
          placeholder={placeholder}
          className="search-input"
        />
        {isSearching && (
          <i className="ri-loader-4-line loading-icon"></i>
        )}
        {query && (
          <button
            className="clear-button"
            onClick={() => {
              setQuery('');
              setResults([]);
              setShowResults(false);
              if (onResults) onResults([]);
            }}
          >
            <i className="ri-close-line"></i>
          </button>
        )}
      </div>

      {showResults && results.length > 0 && (
        <div className="search-results" ref={resultsRef}>
          <div className="results-header">
            <span className="results-count">{results.length} documents found</span>
            <button
              className="close-results"
              onClick={() => setShowResults(false)}
            >
              <i className="ri-close-line"></i>
            </button>
          </div>
          
          <div className="results-list">
            {results.map((doc, index) => {
              const badge = getDocumentTypeBadge(doc);
              return (
                <div
                  key={doc._id}
                  className={`result-item ${index === selectedIndex ? 'selected' : ''}`}
                  onClick={() => openDocument(doc)}
                  onMouseEnter={() => setSelectedIndex(index)}
                >
                  <div className="result-icon">
                    <i className={getDocumentTypeIcon(doc)}></i>
                  </div>
                  
                  <div className="result-content">
                    <div className="result-header">
                      <h4 
                        className="result-title"
                        dangerouslySetInnerHTML={{
                          __html: highlightMatch(doc.title, query)
                        }}
                      />
                      <span className={`result-badge ${badge.className}`}>
                        {badge.text}
                      </span>
                    </div>
                    
                    <p 
                      className="result-preview"
                      dangerouslySetInnerHTML={{
                        __html: highlightMatch(
                          doc.content?.replace(/<[^>]*>/g, '').substring(0, 120) || 'No content',
                          query
                        )
                      }}
                    />
                    
                    <div className="result-meta">
                      <span className="result-address">
                        <i className="ri-link"></i>
                        {doc.documentAddress || doc._id}
                      </span>
                      <span className="result-stats">
                        <i className="ri-file-text-line"></i>
                        {doc.wordCount || 0} words
                      </span>
                      <span className="result-date">
                        {new Date(doc.lastModified).toLocaleDateString()}
                      </span>
                      {doc.searchScore && (
                        <span className="result-score">
                          Match: {Math.round(doc.searchScore * 100)}%
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="result-actions">
                    <button
                      className="action-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        openDocument(doc);
                      }}
                      title={doc.userPermission === 'edit' ? 'Edit document' : 'View document'}
                    >
                      <i className={doc.userPermission === 'edit' ? 'ri-edit-line' : 'ri-eye-line'}></i>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="results-footer">
            <span className="keyboard-hint">
              Use ↑↓ to navigate, Enter to open, Esc to close
            </span>
          </div>
        </div>
      )}

      {showResults && query && results.length === 0 && !isSearching && (
        <div className="search-results">
          <div className="no-results">
            <i className="ri-search-line"></i>
            <h4>No documents found</h4>
            <p>Try searching with different keywords or document address</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuickSearch;