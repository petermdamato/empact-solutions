// hooks/useActivityBasedSession.js
import { useSession } from "next-auth/react";
import { useEffect, useRef, useCallback } from "react";

export function useActivityBasedSession() {
  const { data: session, status, update } = useSession();
  const lastUpdateRef = useRef(0);
  const activityTimeoutRef = useRef(null);
  const isUpdatingRef = useRef(false);

  const handleActivity = useCallback(() => {
    // Don't process activity if we're not authenticated or currently updating
    if (status !== "authenticated" || !session || isUpdatingRef.current) {
      return;
    }

    const now = Date.now();
    const timeSinceLastUpdate = now - lastUpdateRef.current;
    // Only update session if it's been more than 2 minutes since last update
    // This prevents too frequent server calls
    if (timeSinceLastUpdate > 2 * 60 * 1000) {
      // Clear any existing timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }

      // Debounce the update call by 2 seconds
      activityTimeoutRef.current = setTimeout(async () => {
        try {
          isUpdatingRef.current = true;
          lastUpdateRef.current = now;
          await update();
        } catch (error) {
          console.error("Failed to update session:", error);
        } finally {
          isUpdatingRef.current = false;
        }
      }, 2000);
    }
  }, [session, status, update]);

  useEffect(() => {
    // Only set up listeners when authenticated
    if (status !== "authenticated") {
      return;
    }

    // Activity events to listen for - covering most user interactions
    const events = [
      "mousedown",
      "mousemove",
      "keydown",
      "keypress",
      "scroll",
      "touchstart",
      "click",
      "focus",
      "blur",
    ];

    // Add event listeners with passive option for performance
    events.forEach((event) => {
      document.addEventListener(event, handleActivity, {
        passive: true,
        capture: true,
      });
    });

    // Initial activity registration
    handleActivity();

    return () => {
      // Cleanup event listeners
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity, { capture: true });
      });

      // Clear timeout
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
      }
    };
  }, [handleActivity, status]);

  // Reset refs when session changes
  useEffect(() => {
    if (status === "unauthenticated") {
      lastUpdateRef.current = 0;
      isUpdatingRef.current = false;
      if (activityTimeoutRef.current) {
        clearTimeout(activityTimeoutRef.current);
        activityTimeoutRef.current = null;
      }
    }
  }, [status]);

  return { session, status };
}
