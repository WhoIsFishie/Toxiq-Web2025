// src/pages/HomeFeed.tsx
import { useEffect, useState } from 'react';
import { List, Cell } from '@telegram-apps/telegram-ui';
import { PostService } from '../services/apiClient';
import { Audience, SortType } from '../constants/enums';

export default function HomeFeed() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        setLoading(true);
        const response = await PostService.getFeed({
          Page: 1,
          Count: 20,
          Audience: Audience.All,
          Sort: SortType.New
        });
        
        // Add console log to inspect the API response
        console.log('API Response:', response);
        
        // Check the actual structure of your response
        // It might be response.data instead of response.Data 
        // or the posts might be nested differently
        if (response && Array.isArray(response.Data)) {
          setPosts(response.Data);
        } else if (response && Array.isArray(response.data)) {
          setPosts(response.data);
        } else if (Array.isArray(response)) {
          setPosts(response);
        } else {
          console.error('Unexpected response format:', response);
          setError('Unexpected data format from API');
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Error fetching posts:', err);
        setError('Failed to load posts');
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        padding: '20px' 
      }}>
        <div 
          style={{
            width: '30px',
            height: '30px',
            border: '3px solid rgba(0, 0, 0, 0.1)',
            borderLeftColor: '#3390ec',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}
        />
        <style jsx>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Add debug output to check posts array
  console.log('Posts state:', posts);
  
  if (error) {
    return <div style={{ padding: '20px', textAlign: 'center', color: 'red' }}>{error}</div>;
  }

  return (
    <List>
      {!posts || posts.length === 0 ? (
        <Cell>No posts available (Found {posts ? posts.length : 0} posts)</Cell>
      ) : (
        posts.map(post => (
          <Cell 
            key={post.id || post.Id} 
            subtitle={`@${post.userName || post.UserName || 'unknown'}`}
            multiline={true}
          >
            <div style={{ backgroundColor: post.postColor || post.PostColor, padding: '8px', borderRadius: '8px', marginBottom: '8px' }}>
              {post.content || post.Content}
            </div>
            <div style={{ display: 'flex', gap: '10px', fontSize: '14px' }}>
              <span>👍 {post.supportCount || post.SupportCount || 0}</span>
              <span>💬 {post.commentCount || post.CommentCount || 0}</span>
            </div>
          </Cell>
        ))
      )}
    </List>
  );
}