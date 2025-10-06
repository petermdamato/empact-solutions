"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { onAuthStateChanged } from "firebase/auth";
import { firebaseAuth } from "@/lib/firebaseClient";

export function WindowCloseHandler() {
  const hasUserInteracted = useRef(false);

  const [isUnloadHandlerActive, setIsUnloadHandlerActive] = useState(false);
  const { data: session } = useSession(); // Fixed: use 'data' property
  const signoutUri = "/api/auth/logout";

  useEffect(() => {
    let loginDetected = false;
    let timer;

    const startLoginTimer = () => {
      if (loginDetected) return;
      loginDetected = true;

      timer = setTimeout(() => {
        setIsUnloadHandlerActive(true);
        console.log(
          "WindowCloseHandler activated - will logout on window close"
        );
      }, 1000); // 30 seconds after login
    };

    // Listen for Firebase auth state changes
    const unsubscribeFirebase = onAuthStateChanged(firebaseAuth, (user) => {
      if (user && !loginDetected) {
        console.log("Firebase user detected:", user.uid);
        startLoginTimer();
      }
    });

    // Listen for NextAuth session
    if (session && !loginDetected) {
      console.log("NextAuth session detected");
      startLoginTimer();
    }

    const handleUserInteraction = () => {
      hasUserInteracted.current = true;
    };

    const handleBeforeUnload = () => {
      if (isUnloadHandlerActive) {
        sessionStorage.clear();
        localStorage.removeItem("nextauth.message");

        // Use the correct API endpoint
        if (navigator.sendBeacon) {
          navigator.sendBeacon(signoutUri);
        }
      }
    };

    // Add event listeners
    window.addEventListener("click", handleUserInteraction);
    window.addEventListener("keydown", handleUserInteraction);
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      if (timer) clearTimeout(timer);
      unsubscribeFirebase();

      window.removeEventListener("click", handleUserInteraction);
      window.removeEventListener("keydown", handleUserInteraction);
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [session]);

  return null;
}
