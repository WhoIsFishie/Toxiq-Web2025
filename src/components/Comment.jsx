// src/components/Comment.jsx
import React, { useState } from "react";
import { CommentService } from "../services/apiClient";
import FormattedText from "./FormattedText";
import SupportButtons from "./SupportButtons";

const Comment = ({ comment, onReply, isReply = false }) => {
  const [supportStatus, setSupportStatus] = useState(
    comment.SupportStatus || comment.supportStatus
  );
  const [supportCount, setSupportCount] = useState(
    comment.SupportCount || comment.supportCount || 0
  );

  const [showReplies, setShowReplies] = useState(false);

  const id = comment.Id || comment.id;
  const userName = comment.UserName || comment.userName;
  const name = comment.Name || comment.name;
  const content = comment.Content || comment.content;
  const dateCreated = comment.DateCreated || comment.dateCreated;

  const replyCount = comment.ReplyCount || comment.replyCount || 0;
  const replies = comment.Replies || comment.replies || [];
  const postMedia = comment.PostMedia || comment.postMedia;

  // Format timestamp
  const formatTimestamp = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (diffSec < 60) return "just now";
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHour < 24) return `${diffHour}h ago`;
    if (diffDay < 30) return `${diffDay}d ago`;

    return date.toLocaleDateString();
  };

  // Format content with mentions
  const formatContent = (text) => {
    if (!text) return "";

    // Convert #username to @username with styling
    return text.replace(/#(\w+)/g, "@$1");
  };

  const handleLike = async () => {
    try {
      await CommentService.likeComment(id);
      setSupportCount((prev) => prev + 1);
      setSupportStatus(true);
    } catch (error) {
      console.error("Error liking comment:", error);
    }
  };

  const handleDislike = async () => {
    try {
      await CommentService.dislikeComment(id);
      setSupportCount((prev) => prev - 1);
      setSupportStatus(false);
    } catch (error) {
      console.error("Error disliking comment:", error);
    }
  };

  return (
    <div
      className={`comment ${isReply ? "reply" : ""}`}
      style={{
        paddingLeft: isReply ? "15px" : "0",
        marginLeft: isReply ? "10px" : "0",
        borderLeft: isReply ? "2px solid rgba(255, 255, 255, 0.2)" : "none",
        marginBottom: "10px",
      }}
    >
      <div
        className="comment-content"
        style={{
          padding: "10px",
          backgroundColor: "var(--off-black)",
          borderRadius: "8px",
          border: "0px solid var(--border-color)",
        }}
      >
        {/* Header - Username and name */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "5px",
            marginBottom: "5px",
          }}
        >
          <span style={{ fontWeight: "normal" }}>{name}</span>
          <span
            style={{ opacity: 0.6, fontWeight: "bold", cursor: "pointer" }}
            onClick={() => (window.location.href = `/profile/${userName}`)}
          >
            @{userName}
          </span>
        </div>

        {/* Comment media/image if present */}
        {postMedia && postMedia.MediaPath && (
          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            <img
              src={postMedia.MediaPath}
              alt="Comment media"
              style={{ maxWidth: "128px", maxHeight: "128px" }}
            />
          </div>
        )}

        {/* Comment text */}
        {content && (
          <div
            style={{
              marginTop: "5px",
              marginBottom: "10px",
              lineHeight: 1.2,
              opacity: 0.9,
              wordBreak: "break-word",
            }}
          >
            <FormattedText
              text={content}
              style={{
                fontSize: "inherit",
                fontFamily: "inherit",
              }}
            />
          </div>
        )}

        {/* Interaction row */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginTop: "5px",
            opacity: 0.8,
            fontSize: "12px",
          }}
        >
          <div>
            <span style={{ opacity: 0.4 }}>{formatTimestamp(dateCreated)}</span>
            {!isReply && (
              <button
                onClick={() => onReply(comment)}
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--accent-color)",
                  marginLeft: "10px",
                  cursor: "pointer",
                  fontSize: "12px",
                }}
              >
                Reply
              </button>
            )}
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <SupportButtons
              supportStatus={supportStatus}
              supportCount={supportCount}
              onUpvote={() => handleLike()}
              onDownvote={() => handleDislike()}
              variant="comment"
              size="small"
            />
          </div>
        </div>
      </div>

      {/* Replies section */}
      {!isReply && replyCount > 0 && (
        <div style={{ marginTop: "5px", marginLeft: "10px" }}>
          <button
            onClick={() => setShowReplies(!showReplies)}
            style={{
              background: "none",
              border: "none",
              color: "var(--accent-color)",
              padding: "5px",
              cursor: "pointer",
              fontSize: "12px",
            }}
          >
            {showReplies ? "Hide Replies" : `Show Replies (${replyCount})`}
          </button>

          {showReplies && replies && (
            <div className="replies" style={{ marginTop: "5px" }}>
              {replies.map((reply) => (
                <Comment
                  key={reply.Id}
                  comment={reply}
                  onReply={() => onReply(comment)}
                  isReply={true}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Comment;
