// src/components/FormattedText.jsx
import React from "react";
import { useNavigate } from "react-router-dom";

/**
 * FormattedText component that renders text with special formatting:
 * - Handles user mentions in format [@Username](user:guid)
 * - Could be extended for other markdown-like formatting
 *
 * @param {Object} props Component props
 * @param {string} props.text The text to format
 * @param {string} [props.className] Optional CSS class name
 * @param {Object} [props.style] Optional inline styles
 */
const FormattedText = ({ text, className = "", style = {} }) => {
  const navigate = useNavigate();

  if (!text) return null;

  // Function to handle click on user mentions
  const handleUserClick = (username) => {
    navigate(`/profile/${username}`);
  };

  // Parse the text to find mentions and convert them to React elements
  const renderFormattedText = () => {
    // Regular expression to match [@Username](user:guid) pattern
    const mentionRegex = /\[@([^\]]+)\]\(user:([^)]+)\)/g;

    // Split the text into parts based on the regex matches
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = mentionRegex.exec(text)) !== null) {
      // Add the text before the match
      if (match.index > lastIndex) {
        parts.push({
          type: "text",
          content: text.substring(lastIndex, match.index),
        });
      }

      // Add the mention
      parts.push({
        type: "mention",
        username: match[1],
        guid: match[2],
      });

      lastIndex = match.index + match[0].length;
    }

    // Add the remaining text after the last match
    if (lastIndex < text.length) {
      parts.push({
        type: "text",
        content: text.substring(lastIndex),
      });
    }

    // Convert the parts to React elements
    return parts.map((part, index) => {
      if (part.type === "text") {
        return <span key={index}>{part.content}</span>;
      } else if (part.type === "mention") {
        return (
          <span
            key={index}
            className="user-mention"
            onClick={() => handleUserClick(part.username)}
            style={{
              color: "var(--accent-color, #D600AA)",
              fontWeight: "bold",
              cursor: "pointer",
            }}
          >
            @{part.username}
          </span>
        );
      }
      return null;
    });
  };

  return (
    <span className={`formatted-text ${className}`} style={style}>
      {renderFormattedText()}
    </span>
  );
};

export default FormattedText;
