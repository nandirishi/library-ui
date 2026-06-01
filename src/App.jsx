import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Fixed: Now correctly importing from the axios package

function App() {
  const [userId, setUserId] = useState('');
  const [bookId, setBookId] = useState('');
  const [books, setBooks] = useState([]);
  const [actionType, setActionType] = useState('borrow'); // 'borrow' or 'return'
  const [status, setStatus] = useState({ message: 'System Status: Idle', type: 'info' });

  // Fetch books from the Java Spring Boot Backend API
  const fetchBooks = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/books');
      setBooks(response.data);
    } catch (error) {
      console.error("Error loading library catalog", error);
      setStatus({ message: 'Error: Failed to connect to the backend server.', type: 'error' });
    }
  };

  // Run on page load
  useEffect(() => {
    fetchBooks();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!userId || !bookId) {
      setStatus({ message: 'Validation Error: Both fields are mandatory.', type: 'error' });
      return;
    }

    const endpoint = actionType === 'borrow' ? 'borrow' : 'return';
    setStatus({ message: `Processing ${actionType}...`, type: 'pending' });

    try {
      const response = await axios.post(`http://localhost:8080/api/books/${endpoint}`, {
        userId: parseInt(userId),
        bookId: parseInt(bookId)
      });
      
      setStatus({ message: response.data.message, type: 'success' });
      setUserId('');
      setBookId('');
      fetchBooks(); // Auto-refresh inventory numbers in real-time
    } catch (error) {
      const errMsg = error.response?.data?.message || 'API connection failed.';
      setStatus({ message: errMsg, type: 'error' });
    }
  };

  return (
    <div style={{ fontFamily: "'Segoe UI', sans-serif", padding: '40px', backgroundColor: '#f4f6f9', minHeight: '100vh', display: 'flex', gap: '40px', justifyContent: 'center', alignItems: 'flex-start' }}>
      
      {/* Control Panel Card */}
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', width: '340px', boxSizing: 'border-box' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50' }}>Library Management</h3>
        
        {/* Toggle Switch */}
        <div style={{ display: 'flex', marginBottom: '20px', borderRadius: '6px', overflow: 'hidden', border: '1px solid #cbd5e1' }}>
          <button type="button" onClick={() => setActionType('borrow')} style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: actionType === 'borrow' ? '#3498db' : '#fff', color: actionType === 'borrow' ? '#fff' : '#333', transition: 'all 0.2s' }}>Checkout</button>
          <button type="button" onClick={() => setActionType('return')} style={{ flex: 1, padding: '10px', border: 'none', cursor: 'pointer', fontWeight: 'bold', backgroundColor: actionType === 'return' ? '#2ecc71' : '#fff', color: actionType === 'return' ? '#fff' : '#333', transition: 'all 0.2s' }}>Return</button>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '15px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#34495e', fontSize: '14px' }}>User ID Token:</label>
            <input type="number" value={userId} onChange={(e) => setUserId(e.target.value)} placeholder="e.g., 1" style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', color: '#34495e', fontSize: '14px' }}>Target Book ID:</label>
            <input type="number" value={bookId} onChange={(e) => setBookId(e.target.value)} placeholder="e.g., 1" style={{ width: '100%', padding: '10px', boxSizing: 'border-box', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
          </div>
          <button type="submit" style={{ width: '100%', padding: '12px', backgroundColor: actionType === 'borrow' ? '#3498db' : '#2ecc71', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', fontSize: '15px', transition: 'background-color 0.2s' }}>
            {actionType === 'borrow' ? 'Confirm Checkout' : 'Process Return'}
          </button>
        </form>

        {/* System Feedback Notification Box */}
        <div style={{ marginTop: '20px', padding: '12px', borderRadius: '4px', fontSize: '14px', textAlign: 'center', fontWeight: '500', backgroundColor: status.type === 'success' ? '#dff0d8' : status.type === 'error' ? '#f2dede' : status.type === 'pending' ? '#d9edf7' : '#e2e8f0', color: status.type === 'success' ? '#3c763d' : status.type === 'error' ? '#a94442' : status.type === 'pending' ? '#31708f' : '#64748b' }}>
          {status.message}
        </div>
      </div>

      {/* Live Catalog Table Card */}
      <div style={{ backgroundColor: '#fff', padding: '30px', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.05)', flex: 1, maxWidth: '650px', boxSizing: 'border-box' }}>
        <h3 style={{ marginTop: 0, marginBottom: '20px', color: '#2c3e50' }}>Live Resource Catalog</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #cbd5e1', color: '#475569', fontSize: '14px' }}>
              <th style={{ padding: '12px 10px' }}>ID</th>
              <th style={{ padding: '12px 10px' }}>ISBN</th>
              <th style={{ padding: '12px 10px' }}>Title</th>
              <th style={{ padding: '12px 10px', textAlign: 'center' }}>Available Copies</th>
            </tr>
          </thead>
          <tbody>
            {books.length === 0 ? (
              <tr>
                <td colSpan="4" style={{ padding: '20px', textAlign: 'center', color: '#94a3b8' }}>No data found. Ensure your database is initialized.</td>
              </tr>
            ) : (
              books.map(book => (
                <tr key={book.id} style={{ borderBottom: '1px solid #e2e8f0', color: '#334155', fontSize: '15px' }}>
                  <td style={{ padding: '12px 10px' }}>{book.id}</td>
                  <td style={{ padding: '12px 10px', color: '#64748b', fontFamily: 'monospace' }}>{book.isbn}</td>
                  <td style={{ padding: '12px 10px', fontWeight: '500' }}>{book.title}</td>
                  <td style={{ padding: '12px 10px', fontWeight: 'bold', textAlign: 'center', color: book.availableCopies > 0 ? '#27ae60' : '#c0392b' }}>
                    {book.availableCopies}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

    </div>
  );
}

export default App;