// src/components/Posts.jsx
import React, { useState, useEffect } from 'react';
import { PostService } from '../services/apiClient';
import { Audience, SortType } from '../constants/enums';
import Post from './Post';

export default function Posts({ audience = Audience.All, sortBy = SortType.New }) {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [hasMorePosts, setHasMorePosts] = useState(true);

  const fetchPosts = async (pageNum = 1) => {
    try {
      setLoading(true);
      const response = await PostService.getFeed({
        Page: pageNum,
        Count: 10,
        Audience: audience,
        Sort: sortBy
      });
      
      // Add console log to debug the structure
      console.log('API Response:', response);
      
      // Check different possible response structures
      let postsData = [];
      
      if (response && Array.isArray(response.Data)) {
        postsData = response.Data;
      } else if (response && Array.isArray(response.data)) {
        postsData = response.data;
      } else if (Array.isArray(response)) {
        postsData = response;
      } else if (response && typeof response === 'object') {
        // Try to find an array property in the response
        const arrayProps = Object.keys(response).filter(key => 
          Array.isArray(response[key]) && response[key].length > 0
        );
        
        if (arrayProps.length > 0) {
          // Use the first array property found
          postsData = response[arrayProps[0]];
          console.log(`Found posts array in property: ${arrayProps[0]}`);
        } else {
          console.error('Could not locate posts array in response:', response);
          setError('Could not find posts data in API response');
          setLoading(false);
          return;
        }
      } else {
        console.error('Unexpected response format:', response);
        setError('Unexpected data format from API');
        setLoading(false);
        return;
      }
      
      console.log('Extracted posts data:', postsData);
      
      if (pageNum === 1) {
        setPosts(postsData);
      } else {
        setPosts(prev => [...prev, ...postsData]);
      }
      
      // Check if we've reached the end
      const totalPages = response.TotalPage || response.totalPages || response.totalPage || 1;
      if (postsData.length < 10 || pageNum >= totalPages) {
        setHasMorePosts(false);
      }
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError('Failed to load posts');
      setLoading(false);
    }
  };

  useEffect(() => {
    // Reset and fetch when audience or sort changes
    setPosts([]);
    setPage(1);
    setHasMorePosts(true);
    fetchPosts(1);
  }, [audience, sortBy]);

  const loadMorePosts = () => {
    if (!loading && hasMorePosts) {
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
            onClick={() => fetchPosts(1)}
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
            <Post 
              key={post.Id || post.id || index} 
              post={post} 
              onShare={handleShare}
            />
          ))}
          
          {loading && (
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
          )}
          
          {!hasMorePosts && posts.length > 0 && (
            <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
              No more posts to load
            </div>
          )}
        </>
      )}
    </div>
  );
}