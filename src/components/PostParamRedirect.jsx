// src/components/PostParamRedirect.jsx
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useLaunchParams, useSignal, initData } from "@telegram-apps/sdk-react";
import LoadingScreen from "./LoadingScreen";

const PostParamRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const launchParams = useLaunchParams();
  const initDataState = useSignal(initData.state);
  const [debugInfo, setDebugInfo] = useState("Initializing...");

  useEffect(() => {
    // Log debugging information
    console.log("Current location:", location);
    console.log("Search params:", location.search);
    console.log("Launch params:", launchParams);
    console.log("Init data:", initDataState);

    // First check URL query parameters
    const searchParams = new URLSearchParams(location.search);
    const paramFromSearch = searchParams.get("tgWebAppStartParam");

    // Then check direct param in the path - sometimes Telegram adds it directly
    let pathParam = null;
    if (location.pathname.includes("/?startapp=")) {
      const parts = location.pathname.split("/?startapp=");
      if (parts.length > 1) pathParam = parts[1];
    }

    // Finally check Telegram's startParam
    const startParam = paramFromSearch || pathParam || launchParams.startParam;

    setDebugInfo(`Found param: ${startParam || "none"}`);
    console.log("Parameter found:", startParam);

    if (startParam) {
      // Simplified validation - just check if it's not empty
      if (startParam.length > 5) {
        console.log("Redirecting to:", `/posts/${startParam}`);
        setDebugInfo(`Redirecting to: /posts/${startParam}`);

        // Slight delay to ensure state updates
        setTimeout(() => {
          navigate(`/posts/${startParam}`, { replace: true });
        }, 100);
      } else {
        console.warn("Invalid post ID format:", startParam);
        setDebugInfo(`Invalid parameter: ${startParam}`);
        setTimeout(() => {
          navigate("/", { replace: true });
        }, 500);
      }
    } else {
      // No parameter found
      setDebugInfo("No parameter found, redirecting to home");
      setTimeout(() => {
        navigate("/", { replace: true });
      }, 500);
    }
  }, [navigate, location, launchParams, initDataState]);

  // Return loading indicator with debug info while redirecting
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
