// src/components/Posts.jsx
import React, { useState, useEffect } from 'react';
import { PostService } from '../services/apiClient';
import { Audience, SortType } from '../constants/enums';
import Post from './Post';
import { ErrorBoundary } from './ErrorBoundary'; // Import ErrorBoundary

export default function Posts({ audience = Audience.All, sortBy = SortType.New }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadMoreError, setLoadMoreError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      if (pageNum > 1) { // Clear specific load more error before attempting to load more
        setLoadMoreError(null);
      }
      const response = await PostService.getFeed({
        Page: pageNum,
        Count: 10,
        Audience: audience,
        Sort: sortBy
      });
      
      // console.log('API Response:', response); // Optional: for debugging

      if (response && response.data && Array.isArray(response.data.posts) && typeof response.data.totalPages === 'number') {
        const postsData = response.data.posts;
        const totalPages = response.data.totalPages;

        if (pageNum === 1) {
          setPosts(postsData);
          setError(null); // Clear main error on successful initial load
        } else {
          setPosts(prev => [...prev, ...postsData]);
        }
        setLoadMoreError(null); // Clear load more error on any successful fetch

        if (postsData.length === 0 || pageNum >= totalPages) {
          setHasMorePosts(false);
        } else {
          setHasMorePosts(true);
        }
      } else {
        console.warn('Unexpected API response format:', response);
        const errorMessage = 'Invalid API response format from server.';
        if (pageNum === 1) {
          setError(errorMessage);
        } else {
          setLoadMoreError(errorMessage);
        }
        setHasMorePosts(false); // Stop further pagination attempts
      }

      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching posts:', err);
      const message = err?.message || 'Failed to load posts';
      if (pageNum === 1) {
        setError(message);
        setLoadMoreError(null); // Ensure no loadMoreError if initial load fails
      } else {
        setLoadMoreError(message);
        // Do not set main error if "load more" fails, keep existing posts
      }
      setHasMorePosts(false); // Stop further pagination attempts on error
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset and fetch when audience or sort changes
    setPosts([]);
    setPage(1);
    setHasMorePosts(true);
    setError(null); // Clear main error
    setLoadMoreError(null); // Clear load more error
    fetchPosts(1);
  }, [audience, sortBy]);

  const loadMorePosts = () => {
    if (!loading && hasMorePosts) {
      setLoadMoreError(null); // Clear previous load more error before retrying
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  const handleShare = (post) => {
    // You can implement sharing functionality here
    const shareUrl = `https://chat.toxiq.xyz/posts/${post.Id}`;
    
    if (navigator.share) {
      navigator.share({
        title: `Post by @${post.UserName}`,
        text: post.Content?.substring(0, 50) + (post.Content?.length > 50 ? '...' : ''),
        url: shareUrl,
      }).catch(err => {
        console.error('Error sharing:', err);
        // Fallback to clipboard
        copyToClipboard(shareUrl);
      });
    } else {
      // Fallback to clipboard
      copyToClipboard(shareUrl);
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        // Show a toast notification
        alert('Link copied to clipboard!');
      },
      () => {
        console.error('Failed to copy');
      }
    );
  };

  // Implement infinite scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + document.documentElement.scrollTop >= 
        document.documentElement.scrollHeight - 200 &&
        hasMorePosts &&
        !loading
      ) {
        loadMorePosts();
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loading, hasMorePosts]);

  if (loading && posts.length === 0) {
    return (
      <div className="loading-indicator" style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '20px'
      }}>
        <div style={{
          width: '30px',
          height: '30px',
          border: '3px solid rgba(0, 0, 0, 0.1)',
          borderLeftColor: '#3390ec',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}/>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error && posts.length === 0) {
    return (
      <div className="error-message" style={{ 
        padding: '20px', 
        textAlign: 'center', 
        color: 'red' 
      }}>
        {error}
        <div style={{ marginTop: '10px' }}>
          <button
            onClick={() => {
              setError(null); // Clear main error before retrying
              setLoadMoreError(null); // Clear load more error before retrying
              fetchPosts(1);
            }}
            style={{
              padding: '8px 16px',
              backgroundColor: '#3390ec',
              border: 'none',
              borderRadius: '4px',
              color: 'white',
              cursor: 'pointer'
            }}
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="posts-container" style={{ padding: '0px',margin:0 }}>
      {posts.length === 0 && !loading ? (
        <div style={{ textAlign: 'center', padding: '0px' }}>No posts available</div>
      ) : (
        <>
          {posts.map((post, index) => (
            <ErrorBoundary
              key={post.Id || post.id || index} // Key on ErrorBoundary
              fallback={<div style={{ padding: '10px', color: 'orange', border: '1px dashed gray', margin: '10px 0', textAlign: 'center' }}>A post could not be displayed.</div>}
            >
              <Post
                post={post}
                onShare={handleShare}
              />
            </ErrorBoundary>
          ))}

          {/* Loading indicator for subsequent loads */}
          {loading && posts.length > 0 && (
            <div className="loading-indicator" style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '20px'
            }}>
              <div style={{
                width: '30px',
                height: '30px',
                border: '3px solid rgba(0, 0, 0, 0.1)',
                borderLeftColor: '#3390ec',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }} />
              {/* Removed redundant <style> block for spin animation as it should be global or in CSS file */}
            </div>
          )}

          {/* Error display for "load more" failures */}
          {loadMoreError && !loading && (
            <div style={{ textAlign: 'center', padding: '10px', color: 'red' }}>
              {loadMoreError}
              <button 
                onClick={loadMorePosts} 
                style={{ 
                  marginLeft: '10px',
                  padding: '5px 10px',
                  backgroundColor: '#3390ec',
                  border: 'none',
                  borderRadius: '4px',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Retry
              </button>
            </div>
          )}
          
          {!hasMorePosts && posts.length > 0 && !loadMoreError && ( // Only show if no error
            <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
              No more posts to load
            </div>
          )}
        </>
      )}
    </div>
  );
}