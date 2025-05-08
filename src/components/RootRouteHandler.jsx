// src/components/RootRouteHandler.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import HomeFeed from "../pages/HomeFeed";

/**
 * This component handles the root route ("/") and checks if there are any 
 * query parameters that should redirect to a post view.
 */
const RootRouteHandler = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [shouldRedirect, setShouldRedirect] = useState(false);

  useEffect(() => {
    console.log("====== RootRouteHandler DEBUG ======");
    console.log("Full URL:", window.location.href);
    console.log("Location pathname:", location.pathname);
    console.log("Location search:", location.search);
    console.log("Location hash:", location.hash);
    console.log("Object.keys(location):", Object.keys(location));
    console.log("Full Location:", location);

    const fullUrl = window.location.href;
    
    // Check for tgWebAppStartParam in the URL
    if (fullUrl.includes("tgWebAppStartParam=")) {
      const match = fullUrl.match(/tgWebAppStartParam=([^&#]+)/);
      if (match && match[1] && match[1].length > 5) {
        console.log("Root handler found tgWebAppStartParam:", match[1]);
        
        // Redirect to the posts route
        navigate(`/posts?tgWebAppStartParam=${match[1]}`, { replace: true });
        setShouldRedirect(true);
        return;
      }
    }
    
    // Check for startapp parameter
    if (fullUrl.includes("startapp=")) {
      const match = fullUrl.match(/startapp=([^&#]+)/);
      if (match && match[1] && match[1].length > 5) {
        console.log("Root handler found startapp param:", match[1]);
        
        // Redirect to the posts route
        navigate(`/posts?tgWebAppStartParam=${match[1]}`, { replace: true });
        setShouldRedirect(true);
        return;
      }
    }
    
    // No need to redirect, so render the HomeFeed
    setShouldRedirect(false);
  }, [navigate, location]);

  // If we're in the process of redirecting, render nothing
  if (shouldRedirect) {
    return null;
  }

  // Otherwise, render the HomeFeed
  return <HomeFeed />;
};

export default RootRouteHandler;