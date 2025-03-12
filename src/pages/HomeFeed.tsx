// src/pages/HomeFeed.tsx
import React from 'react';
import { Audience, SortType } from '../constants/enums';
import Posts from '../components/Posts';

export default function HomeFeed() {
  // Default to All audience and New sorting
  return (
    <div className="home-feed">
      {/* Just use the Posts component with default values */}
      <Posts audience={Audience.All} sortBy={SortType.New} />
    </div>
  );
}