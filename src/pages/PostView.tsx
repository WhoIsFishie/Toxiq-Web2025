// src/pages/PostView.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PostService, CommentService } from '../services/apiClient';
import Post from '../components/Post';
import LoadingScreen from '../components/LoadingScreen';
import { backButton } from '@telegram-apps/sdk-react';
import Comment from '../components/Comment';
import {
    Send16Filled
} from '@fluentui/react-icons';
import { Component2DoubleTapSwipeDown24Filled } from '@fluentui/react-icons/fonts';

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
    // In src/pages/PostView.jsx
    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                // Load post data
                const postData = await PostService.getPost(postId);
                console.log('Post data loaded:', postData);
                setPost(postData);

                // Load comments
                const commentData = await CommentService.getComments({
                    Id: postId,
                    Page: 1,
                    Count: 100,
                    IsReply: false,
                    Sort: 0
                });

                console.log('Raw comment data:', commentData);

                // IMPORTANT FIX: Use lowercase 'data' instead of uppercase 'Data'
                const commentsArray = commentData && commentData.data ? commentData.data : [];
                console.log('Setting comments state with:', commentsArray);
                setComments(commentsArray);

                // Load replies for each comment
                if (commentsArray.length > 0) {
                    loadReplies(commentsArray);
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
                        Id: comment.Id || comment.id, // Also handle lowercase id
                        Page: 1,
                        Count: 100,
                        IsReply: true,
                        Sort: 0
                    });

                    // IMPORTANT FIX: Use lowercase 'data' property
                    return {
                        ...comment,
                        Replies: replyData.data || [],
                        ReplyCount: replyData.data?.length || 0
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
                backgroundColor: 'var(--off-black)',
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
                        <Send16Filled fontSize={20} />
                    </button>
                </form>
            </div>

            {/* Comments */}
            <div className="comments-container" style={{ padding: '10px' }}>
                {comments.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '20px', opacity: 0.7 }}>
                        No comments yet. Be the first to comment!
                    </div>
                ) : (
                    <div className="comments-list">
                        {comments.map(comment => (
                            <Comment
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
export default PostView;