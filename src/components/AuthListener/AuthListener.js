"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCSV } from "@/context/CSVContext";
import { signOut } from "next-auth/react";
import { useActivityBasedSession } from "@/hooks/useActivityBasedSession"; // Import the hook
import moment from "moment";

export function AuthListener() {
  const { session, status } = useActivityBasedSession(); // Use the hook instead of useSession
  const { setCsvData, setValidationErrors, setFileName } = useCSV();
  const router = useRouter();
  const hasRedirectedRef = useRef(false);

  // Debug logging

  useEffect(() => {
    console.log(status);
    const handleAuthFailure = async () => {
      if (hasRedirectedRef.current) return;

      hasRedirectedRef.current = true;
      console.log("Handling authentication failure");

      // Clear context
      setCsvData([]);
      setValidationErrors([]);
      setFileName("");

      // Sign out and redirect
      await signOut({ redirect: false });
      router.push("/api/auth/signin");
    };

    // Handle unauthenticated status
    if (status === "unauthenticated") {
      console.log("User is unauthenticated");
      handleAuthFailure();
      return;
    }

    // Don't check while loading
    if (status === "loading" || !session?.expires) {
      return;
    }

    // Check for expired sessions every 30 seconds as a backup
    const checkExpiration = () => {
      const expirationTime = moment.unix(session.expires);
      const now = moment();

      if (now.isAfter(expirationTime)) {
        console.log("Session expired in AuthListener backup check");
        handleAuthFailure();
      }
    };

    // Initial check
    checkExpiration();

    // Set up backup interval check
    const interval = setInterval(checkExpiration, 60000);

    return () => {
      clearInterval(interval);
      hasRedirectedRef.current = false;
    };
  }, [session, status, setCsvData, setValidationErrors, setFileName, router]);

  return null;
}
