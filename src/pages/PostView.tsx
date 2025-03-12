// src/pages/PostView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostService, CommentService } from '../services/apiClient';
import Post from '../components/Post';
import LoadingScreen from '../components/LoadingScreen';
import { backButton } from '@telegram-apps/sdk-react';

const PostView = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [replyTo, setReplyTo] = useState(null);
  const commentInputRef = useRef(null);
  
  
  // Effect for back button
  useEffect(() => {
    backButton.show();
    const cleanup = backButton.onClick(() => {
      navigate(-1);
    });
    
    return () => {
      cleanup();
      backButton.hide();
    };
  }, [navigate]);
  
  // Load the post and comments
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load post data
        const postData = await PostService.getPost(postId);
        setPost(postData);
        
        // Load comments
        const commentData = await CommentService.getComments({
          Id: postId,
          Page: 1,
          Count: 100,
          IsReply: false,
          Sort: 0
        });
        
        setComments(commentData.Data || []);
        
        // Load replies for each comment
        if (commentData.Data && commentData.Data.length > 0) {
          loadReplies(commentData.Data);
        }
      } catch (error) {
        console.error('Error loading post data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (postId) {
      loadData();
    }
  }, [postId]);
  
  const loadReplies = async (commentsList) => {
    try {
      const commentsWithReplies = await Promise.all(
        commentsList.map(async (comment) => {
          const replyData = await CommentService.getComments({
            Id: comment.Id,
            Page: 1,
            Count: 100,
            IsReply: true,
            Sort: 0
          });
          
          return {
            ...comment,
            Replies: replyData.Data || [],
            ReplyCount: replyData.Data?.length || 0
          };
        })
      );
      
      setComments(commentsWithReplies);
    } catch (error) {
      console.error('Error loading replies:', error);
    }
  };
  
  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    
    if (!commentText.trim() && !replyTo) return;
    
    try {
      const newComment = {
        Content: commentText,
        PostId: postId,
        IsReply: !!replyTo,
        RepliedTo: replyTo ? replyTo.Id : null
      };
      
      const response = await CommentService.submitComment(newComment);
      
      // Handle successful comment
      if (response) {
        if (replyTo) {
          // Add reply to the parent comment
          setComments(prevComments => 
            prevComments.map(comment => 
              comment.Id === replyTo.Id 
                ? {
                    ...comment,
                    Replies: [...(comment.Replies || []), { ...response, Content: commentText }],
                    ReplyCount: (comment.ReplyCount || 0) + 1
                  }
                : comment
            )
          );
        } else {
          // Add new comment to the list
          setComments(prevComments => [
            { ...response, Content: commentText, Replies: [] },
            ...prevComments
          ]);
        }
        
        // Update post comment count
        setPost(prevPost => ({
          ...prevPost,
          CommentCount: (prevPost.CommentCount || 0) + 1
        }));
        
        // Reset state
        setCommentText('');
        setReplyTo(null);
      }
    } catch (error) {
      console.error('Error submitting comment:', error);
    }
  };
  
  const handleReply = (comment) => {
    setReplyTo(comment);
    setCommentText(`@${comment.UserName} `);
    if (commentInputRef.current) {
      commentInputRef.current.focus();
    }
  };
  
  const cancelReply = () => {
    setReplyTo(null);
    setCommentText('');
  };
  
  if (isLoading) {
    return <LoadingScreen />;
  }
  
  if (!post) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <h3>Post not found</h3>
        <button 
          onClick={() => navigate(-1)}
          style={{
            padding: '8px 16px',
            backgroundColor: 'var(--accent-color)',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Go Back
        </button>
      </div>
    );
  }
  
  return (
    <div className="post-view-container">
      {/* Post */}
      <Post post={post} fullPost={true} />
      
      {/* Comment Form */}
      <div className="comment-form-container" style={{
        position: 'sticky',
        bottom: 0,
        backgroundColor: 'var(--card-background)',
        padding: '10px',
        borderTop: '1px solid var(--border-color)'
      }}>
        {replyTo && (
          <div className="reply-info" style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '5px 10px',
            fontSize: '14px',
            opacity: 0.7
          }}>
            <div>Replying to @{replyTo.UserName}</div>
            <button 
              onClick={cancelReply}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--accent-color)',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        )}
        
        <form onSubmit={handleCommentSubmit} style={{
          display: 'flex',
          gap: '10px',
          padding: '5px'
        }}>
          <input
            ref={commentInputRef}
            type="text"
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder="Add a comment..."
            style={{
              flex: 1,
              padding: '12px',
              backgroundColor: '#282828',
              border: 'none',
              borderRadius: '15px',
              color: 'white'
            }}
          />
          <button 
            type="submit"
            style={{
              backgroundColor: 'transparent',
              border: 'none',
              color: 'white',
              fontSize: '18px',
              cursor: 'pointer'
            }}
          >
            ↗️
          </button>
        </form>
      </div>
      
      {/* Comments */}
      <div className="comments-container" style={{ padding: '10px' }}>
        <h3 style={{ margin: '10px 0' }}>Comments ({comments.length})</h3>
        
        {comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
            No comments yet. Be the first to comment!
          </div>
        ) : (
          <div className="comments-list">
            {comments.map(comment => (
              <CommentItem 
                key={comment.Id} 
                comment={comment} 
                onReply={handleReply} 
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

// Comment Component
const CommentItem = ({ comment, onReply }) => {
  const [showReplies, setShowReplies] = useState(false);
  
  return (
    <div className="comment-item" style={{
      margin: '10px 0',
      padding: '10px',
      backgroundColor: 'var(--card-background)',
      borderRadius: '8px',
      border: '1px solid var(--border-color)'
    }}>
      <div className="comment-header" style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '5px'
      }}>
        <span style={{ fontWeight: 'bold', marginRight: '5px' }}>@{comment.UserName}</span>
        <span style={{ fontSize: '12px', opacity: 0.7 }}>
          {new Date(comment.DateCreated).toLocaleString()}
        </span>
      </div>
      
      <div className="comment-content" style={{ margin: '10px 0' }}>
        {comment.Content}
      </div>
      
      <div className="comment-actions" style={{
        display: 'flex',
        justifyContent: 'space-between',
        marginTop: '5px',
        fontSize: '12px'
      }}>
        <button 
          onClick={() => onReply(comment)}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--accent-color)',
            cursor: 'pointer'
          }}
        >
          Reply
        </button>
        
        {comment.ReplyCount > 0 && (
          <button 
            onClick={() => setShowReplies(!showReplies)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--accent-color)',
              cursor: 'pointer'
            }}
          >
            {showReplies ? 'Hide Replies' : `Show Replies (${comment.ReplyCount})`}
          </button>
        )}
      </div>
      
      {/* Replies */}
      {showReplies && comment.Replies && comment.Replies.length > 0 && (
        <div className="replies-container" style={{
          marginTop: '10px',
          paddingLeft: '20px',
          borderLeft: '2px solid var(--border-color)'
        }}>
          {comment.Replies.map(reply => (
            <div 
              key={reply.Id}
              className="reply-item"
              style={{
                margin: '10px 0',
                padding: '8px',
                backgroundColor: 'rgba(40, 40, 40, 0.5)',
                borderRadius: '8px'
              }}
            >
              <div style={{ fontWeight: 'bold', marginBottom: '5px' }}>
                @{reply.UserName}
              </div>
              <div>{reply.Content}</div>
              <button 
                onClick={() => onReply(comment)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--accent-color)',
                  fontSize: '12px',
                  marginTop: '5px',
                  cursor: 'pointer'
                }}
              >
                Reply
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostView;