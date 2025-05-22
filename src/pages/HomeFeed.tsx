// src/pages/HomeFeed.tsx
import React from 'react';
import { Audience, SortType } from '../constants/enums';
import Posts from '../components/Posts';
import { ErrorBoundary } from '../components/ErrorBoundary'; // Import ErrorBoundary

export default function HomeFeed() {
  // Default to All audience and New sorting
  return (
    <div className="home-feed">
      <ErrorBoundary fallback={<div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>The feed could not be loaded. Please try refreshing the page.</div>}>
        <Posts audience={Audience.All} sortBy={SortType.New} />
      </ErrorBoundary>
    </div>
  );
}