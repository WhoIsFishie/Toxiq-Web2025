// src/components/LoadingScreen.tsx
import React from 'react';

export default function LoadingScreen() {
  return (
    <div className="loading-container" style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      height: '100vh',
      backgroundColor: 'var(--background-color)',
      color: 'var(--text-color)'
    }}>
      <div style={{ marginBottom: '16px' }}>
        <div className="custom-spinner" style={{
          width: '40px',
          height: '40px',
          border: '4px solid rgba(255, 255, 255, 0.1)',
          borderLeftColor: 'var(--accent-color)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
      </div>
      <p>Loading...</p>
      
      <style jsx>{`
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}