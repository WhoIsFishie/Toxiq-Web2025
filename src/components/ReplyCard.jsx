import React, { useEffect, useState } from "react";
import {
  PostService,
  CommentService,
  NotesService,
} from "../services/apiClient";
import FormattedText from "./FormattedText";
import {
  PersonQuestionMarkRegular,
  CommentRegular,
} from "@fluentui/react-icons";
import { ReplyType } from "../constants/enums";

const ReplyCard = ({ parentPost, replyType, replyRefId, fullPost = true }) => {
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (parentPost && parentPost.ReplyRefId) {
      pullPost();
    } else if (replyType && replyRefId) {
      pullPostByParams(replyType, replyRefId);
    }
  }, [parentPost, replyType, replyRefId]);

  const pullPost = async () => {
    if (!parentPost || !parentPost.ReplyType) return;

    setLoading(true);
    try {
      switch (parentPost.ReplyType) {
        case ReplyType.Text:
          const textPost = await PostService.getPost(parentPost.ReplyRefId);
          setPost(textPost);
          break;
        case ReplyType.Note:
          try {
            const noteData = await NotesService.getNote(parentPost.ReplyRefId);
            setPost({
              Content: noteData.Content,
              UserName: "Anon",
              Name: "",
            });
          } catch (error) {
            setPost({
              Content: "Content Deleted",
              UserName: "Anon",
              Name: "",
            });
          }
          break;
        case ReplyType.Comment:
          const commentData = await CommentService.getComment(
            parentPost.ReplyRefId
          );
          setPost({
            Content: commentData.Content,
            UserName: commentData.UserName,
            Name: commentData.Name,
          });
          break;
        case ReplyType.Prompt:
          const promptData = await PostService.getPrompt(parentPost.ReplyRefId);
          setPost(promptData);
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Error loading reply content:", error);
    } finally {
      setLoading(false);
    }
  };

  const pullPostByParams = async (type, id) => {
    setLoading(true);
    try {
      // Same implementation as pullPost but using provided type and id
      switch (type) {
        case ReplyType.Text:
          const textPost = await PostService.getPost(id);
          setPost(textPost);
          break;
        // Other cases...
      }
    } catch (error) {
      console.error("Error loading reply content:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = () => {
    if (fullPost && parentPost?.ReplyType === ReplyType.Text && post) {
      // Navigate to the post
      window.location.href = `/posts/${post.Id || post.id}`;
    }
  };

  if (loading) {
    return (
      <div
        style={{
          padding: "10px",
          backgroundColor: "black",
          borderColor: "var(--gray-900)",
          borderWidth: "1px",
          borderRadius: "10px",
          minHeight: "60px",
        }}
      >
        <div style={{ opacity: 0.3 }}>Loading reply...</div>
      </div>
    );
  }

  if (!post) return null;

  return (
    <div
      onClick={handleCardClick}
      style={{
        padding: "10px",
        backgroundColor: parentPost?.PostColor ? parentPost.PostColor : "black",
        borderColor: "var(--gray-900)",
        borderWidth: "1px",
        borderStyle: "solid",
        borderRadius: "10px",
        cursor: fullPost ? "pointer" : "default",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: "5px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <span>{post.Name || ""}</span>
          <span style={{ opacity: 0.6 }}>@{post.UserName || "NA"}</span>
        </div>

        <div>
          {parentPost?.ReplyType === ReplyType.Note && (
            <PersonQuestionMarkRegular fontSize={18} />
          )}
          {parentPost?.ReplyType === ReplyType.Comment && (
            <CommentRegular fontSize={18} />
          )}
        </div>
      </div>

      <div
        style={{
          fontFamily: "Roboto-Medium",
          fontSize: "14px",
          textAlign: "left",
          overflow: "hidden",
          display: "-webkit-box",
          WebkitLineClamp: 6,
          WebkitBoxOrient: "vertical",
          color: "white",
        }}
      >
        <FormattedText text={post.Content} />
      </div>
    </div>
  );
};

export default ReplyCard;
