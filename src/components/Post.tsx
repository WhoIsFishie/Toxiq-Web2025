// src/components/Post.jsx
import React from 'react';
import FormattedText from './FormattedText';
import ReplyCard from './ReplyCard';
import {
  CommentRegular,
  ShareRegular
} from '@fluentui/react-icons';
import { PostService } from '../services/apiClient';
import { PostType, ReplyType } from '../constants/enums';
import { useNavigate } from 'react-router-dom';
import SupportButtons from './SupportButtons';
export default function Post({ post, fullPost = false, onShare }) {
  const navigate = useNavigate();

  const [supportStatus, setSupportStatus] = React.useState(post.SupportStatus);
  const [supportCount, setSupportCount] = React.useState(post.SupportCount || post.supportCount || 0);
  const [commentCount, setCommentCount] = React.useState(post.CommentCount || post.commentCount || 0);
  const originalSupportStatus = React.useRef(post.SupportCount || post.supportCount || 0);

  const id = post.Id || post.id;
  const userName = post.UserName || post.userName || 'unknown';
  const name = post.Name || post.name || '💢🥴';
  const content = post.Content || post.content || 'NOT FOUND';
  const postColor = post.PostColor || post.postColor || 'black';
  const type = post.Type || post.type || PostType.Text;
  const replyType = post.ReplyType || post.replyType || ReplyType.Non;
  const postMedia = post.PostMedia || post.postMedia || [];

  // Calculate background color based on post type
  const getBackgroundColor = () => {
    switch (type) {
      case PostType.Wall:
        return postColor;
      case PostType.Burn:
      case PostType.Text:
      case PostType.Reply:
      default:
        return 'black';
    }
  };

  const handleUpvote = async () => {
    if (supportStatus !== true) {
      try {
        await PostService.likePost(id);
        setSupportCount((originalSupportStatus.current || supportCount) + 1);
        setSupportStatus(true);
      } catch (error) {
        console.error('Error liking post:', error);
      }
    } else {
      try {
        await PostService.removeVote(id);
        setSupportCount(originalSupportStatus.current || supportCount);
        setSupportStatus(null);
      } catch (error) {
        console.error('Error removing vote:', error);
      }
    }
  };

  const handleDownvote = async () => {
    if (supportStatus !== false) {
      try {
        await PostService.dislikePost(id);
        setSupportCount((originalSupportStatus.current || supportCount) - 1);
        setSupportStatus(false);
      } catch (error) {
        console.error('Error disliking post:', error);
      }
    } else {
      try {
        await PostService.removeVote(id);
        setSupportCount(originalSupportStatus.current || supportCount);
        setSupportStatus(null);
      } catch (error) {
        console.error('Error removing vote:', error);
      }
    }
  };

  const handlePostClick = () => {
    if (!fullPost) {
      navigate(`/posts/${post.Id || post.id}`);
    }
  };

  const handleProfileClick = (e) => {
    e.stopPropagation();
    window.location.href = `/profile/${userName}`;
  };

  return (
    <div
      className="post-container"
      onClick={handlePostClick}
      style={{
        borderRadius: '0px',
        margin: '0',
        overflow: 'hidden',
        backgroundColor: 'var(--off-black)',
        color: 'var(--text-color)'
      }}
    >
      <div style={{ padding: '12px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontSize: '16px' }}>{name}</span>
            <span
              style={{ fontWeight: 'bold', cursor: 'pointer' }}
              onClick={handleProfileClick}
            >
              @{userName}
            </span>
          </div>
          {type === PostType.Burn && <span>🔥🔥</span>}
        </div>

        {/* Content */}
        <div>
          <p style={{
            fontSize: '17px',
            lineHeight: '1.2',
            whiteSpace: 'pre-wrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            maxHeight: fullPost ? 'none' : '200px'
          }}>
            <FormattedText
              text={content}
              style={{
                fontSize: 'inherit',
                fontFamily: 'inherit'
              }}
            />
          </p>

          {/* Post Media (Image) */}
          {postMedia && postMedia.length > 0 && postMedia[0]?.MediaPath && (
            <img
              src={postMedia[0].MediaPath}
              alt="Post attachment"
              style={{
                maxWidth: '100%',
                borderRadius: '8px',
                marginTop: '8px',
                maxHeight: '512px'
              }}
            />
          )}

          {/* Reply content if exists */}
          {replyType !== ReplyType.Non && (
            <div style={{ marginTop: '8px' }}>
              <ReplyCard
                parentPost={post}
                fullPost={fullPost}
              />
            </div>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '12px',
          opacity: 0.7,
          fontSize: '11px'
        }}>
          <span>{supportCount} Likes</span>
          <span>{commentCount} Comments</span>
        </div>

        {/* Action buttons */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '10px',
          gap: '15px',
          height: '33px'
        }}>
          {/* Like/Dislike buttons */}

          <SupportButtons
            supportStatus={supportStatus}
            supportCount={supportCount}
            onUpvote={() => handleUpvote()}
            onDownvote={() => handleDownvote()}
            variant="post"
            showCount='false'
          />


          {/* Comment button */}
          <button
            onClick={handlePostClick}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '15px',
              padding: '0px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <CommentRegular fontSize={20} />

            <span style={{ fontWeight: 'bold' }}>Comment</span>
          </button>

          {/* Share button */}
          <button
            onClick={(e) => { e.stopPropagation(); onShare && onShare(post); }}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '10px',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              border: 'none',
              borderRadius: '15px',
              padding: '0px',
              cursor: 'pointer',
              color: 'white'
            }}
          >
            <ShareRegular fontSize={20} />
            <span style={{ fontWeight: 'bold' }}>Share</span>
          </button>
        </div>
      </div>

      {/* Separator */}
      <div style={{ height: '1px', backgroundColor: 'rgba(255, 255, 255, 0.3)', opacity: 0.3 }}></div>
    </div>
  );
}