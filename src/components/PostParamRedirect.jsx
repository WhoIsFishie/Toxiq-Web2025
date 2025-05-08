// src/components/PostParamRedirect.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { useLaunchParams, useSignal, initData } from "@telegram-apps/sdk-react";
import LoadingScreen from "./LoadingScreen";
import PostView from "../pages/PostView";

// Utility function to extract post ID from various URL formats
const extractPostIdFromUrl = (location, params, launchParams) => {
  // Log all possible sources we're checking
  console.log("Extracting post ID from:");
  console.log("- Route params:", params);
  console.log("- Location:", location);
  console.log("- Window location:", window.location.href);

  // 1. Check if we have a postId in the route params (top priority)
  // Format: /posts/GUID
  if (params && params.postId && params.postId.length > 5) {
    console.log("✓ Found postId in route params:", params.postId);
    return { 
      source: "route-param", 
      id: params.postId 
    };
  }

  // 2. Get full URL and check if it contains tgWebAppStartParam anywhere
  // This handles the case even when using HashRouter
  const fullUrl = window.location.href;
  
  if (fullUrl.includes("tgWebAppStartParam=")) {
    // Extract the parameter using regex
    const match = fullUrl.match(/tgWebAppStartParam=([^&#]+)/);
    if (match && match[1] && match[1].length > 5) {
      console.log("✓ Found tgWebAppStartParam in full URL:", match[1]);
      return { 
        source: "tg-web-app-param", 
        id: match[1]
      };
    }
  }

  // 3. Check for tgWebAppStartParam in the query string of the React Router location
  // Format: /posts/?tgWebAppStartParam=GUID
  let searchParams = new URLSearchParams(location.search);
  let tgParam = searchParams.get("tgWebAppStartParam");
  if (tgParam && tgParam.length > 5) {
    console.log("✓ Found tgWebAppStartParam in location.search:", tgParam);
    return { 
      source: "tg-web-app-param", 
      id: tgParam
    };
  }

  // 4. Check location hash query params for HashRouter
  if (location.hash && location.hash.includes("?")) {
    const hashQueryPart = location.hash.split("?")[1];
    if (hashQueryPart) {
      searchParams = new URLSearchParams(hashQueryPart);
      tgParam = searchParams.get("tgWebAppStartParam");
      if (tgParam && tgParam.length > 5) {
        console.log("✓ Found tgWebAppStartParam in hash query:", tgParam);
        return { 
          source: "hash-query-param", 
          id: tgParam
        };
      }
    }
  }

  // 5. Check for startapp parameter from Telegram
  // Format: /?startapp=GUID
  if (location.pathname.includes("/?startapp=") || fullUrl.includes("startapp=")) {
    let startappParam;
    
    // Try location pathname
    if (location.pathname.includes("/?startapp=")) {
      const parts = location.pathname.split("/?startapp=");
      if (parts.length > 1 && parts[1].length > 5) {
        startappParam = parts[1];
      }
    }
    
    // Try regex on full URL if not found above
    if (!startappParam && fullUrl.includes("startapp=")) {
      const match = fullUrl.match(/startapp=([^&#]+)/);
      if (match && match[1] && match[1].length > 5) {
        startappParam = match[1];
      }
    }
    
    if (startappParam) {
      console.log("✓ Found startapp param:", startappParam);
      return { 
        source: "startapp-param", 
        id: startappParam
      };
    }
  }

  // 6. Check Telegram's launch params
  if (launchParams && launchParams.startParam && launchParams.startParam.length > 5) {
    console.log("✓ Found launch param:", launchParams.startParam);
    return { 
      source: "launch-param", 
      id: launchParams.startParam
    };
  }

  console.log("✗ No valid post ID found in any source");
  // No valid post ID found
  return null;
};

const PostParamRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams();
  const launchParams = useLaunchParams();
  const initDataState = useSignal(initData.state);
  const [debugInfo, setDebugInfo] = useState("Initializing...");
  const [postId, setPostId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Enhanced debugging
    console.log("===== DEBUG INFO =====");
    console.log("Current location:", location);
    console.log("Location pathname:", location.pathname);
    console.log("Location search:", location.search);
    console.log("Location hash:", location.hash);
    console.log("Full URL:", window.location.href);
    console.log("URL params:", params);
    console.log("Launch params:", launchParams);
    console.log("Init data:", initDataState);

    // Extract post ID from various sources
    const postIdInfo = extractPostIdFromUrl(location, params, launchParams);
    
    // Update debug info
    if (postIdInfo) {
      const debugMessage = `Found post ID: ${postIdInfo.id} (Source: ${postIdInfo.source})`;
      console.log(debugMessage);
      setDebugInfo(debugMessage);
      
      // Set the post ID for rendering
      setPostId(postIdInfo.id);
      
      // IMPORTANT: Since we're having issues with the normal route parameter, 
      // let's not redirect and instead render the PostView directly with the ID
      console.log(`Found post ID ${postIdInfo.id}, will render PostView directly with this ID`);
      setIsLoading(false);

      // Uncomment this if you want to try the redirect approach again
      /*
      // If the ID came from a non-route parameter source, redirect to the clean URL
      if (postIdInfo.source !== "route-param") {
        console.log(`Redirecting to clean URL: /posts/${postIdInfo.id}`);
        setTimeout(() => {
          navigate(`/posts/${postIdInfo.id}`, { replace: true });
        }, 100);
      } else {
        // We already have a clean URL, just mark as done loading
        setIsLoading(false);
      }
      */
    } else {
      // No valid post ID found, redirect to home
      console.log("No valid post ID found");
      setDebugInfo("No valid post ID found, redirecting to home");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
    }
  }, [navigate, location, params, launchParams, initDataState]);

  // If we have a post ID and are not redirecting, render the PostView
  if (postId && !isLoading) {
    // Pass the postId as a prop to PostView to ensure it has the correct ID
    return <PostView key={postId} postIdOverride={postId} />;
  }

  // Otherwise show loading screen while processing
  return (
    <div style={{ padding: "20px", textAlign: "center" }}>
      <LoadingScreen />
      <div style={{ marginTop: "20px", fontSize: "12px", color: "gray" }}>
        {debugInfo}
      </div>
    </div>
  );
};

export default PostParamRedirect;