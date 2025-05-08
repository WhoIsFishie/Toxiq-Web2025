// src/components/TgParamHandler.jsx
import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import PostView from "../pages/PostView";

/**
 * Component to specifically handle URLs in the format:
 * /posts/?tgWebAppStartParam=guid
 * 
 * This component directly extracts the parameter from the URL
 * and renders the PostView without any redirection.
 */
const TgParamHandler = () => {
  const location = useLocation();
  const [postId, setPostId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [debugInfo, setDebugInfo] = useState("Extracting post ID...");

  useEffect(() => {
    console.log("===== TgParamHandler MOUNTED =====");
    console.log("Full URL:", window.location.href);
    
    // Function to extract the tgWebAppStartParam directly from URL
    const extractPostId = () => {
      // Direct approach: parse URL query string like in the Blazor example
      const url = new URL(window.location.href);
      const params = new URLSearchParams(url.search);
      const postIdFromParam = params.get("tgWebAppStartParam");
      
      if (postIdFromParam && postIdFromParam.length > 5) {
        console.log("Found tgWebAppStartParam in URL params:", postIdFromParam);
        return postIdFromParam;
      }
      
      // Fallback: try to extract from the full URL with regex
      const fullUrl = window.location.href;
      if (fullUrl.includes("tgWebAppStartParam=")) {
        const match = fullUrl.match(/tgWebAppStartParam=([^&#]+)/);
        if (match && match[1] && match[1].length > 5) {
          console.log("Found tgWebAppStartParam using regex:", match[1]);
          return match[1];
        }
      }
      
      return null;
    };

    // Try to get the post ID directly from the URL
    const extractedPostId = extractPostId();
    
    if (extractedPostId) {
      console.log("Successfully extracted post ID:", extractedPostId);
      setPostId(extractedPostId);
      setDebugInfo(`Found post ID: ${extractedPostId}`);
      setIsLoading(false);
    } else {
      console.log("No tgWebAppStartParam found in URL");
      setDebugInfo("No post ID found");
      setIsLoading(false);
    }
  }, []);

  // If we found a post ID, render the PostView component directly
  if (postId) {
    return <PostView postIdOverride={postId} />;
  }
  
  // If we're still loading or couldn't find a post ID
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      {isLoading ? (
        <LoadingScreen />
      ) : (
        <div>
          <h3>Post Not Found</h3>
          <p>Unable to find a post with the provided ID.</p>
        </div>
      )}
      <div style={{ marginTop: "20px", fontSize: "12px", color: "gray" }}>
        {debugInfo}
      </div>
    </div>
  );
};

export default TgParamHandler;