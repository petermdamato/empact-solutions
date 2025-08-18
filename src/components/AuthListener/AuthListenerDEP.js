"use client";

import { useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCSV } from "@/context/CSVContext";
import { useSession, signOut } from "next-auth/react";
import moment from "moment";

export function AuthListener() {
  const { data: session, status, update } = useSession();
  const { setCsvData, setValidationErrors, setFileName } = useCSV();
  const router = useRouter();

  // Debug logging
  console.log("Session status:", status);
  console.log("Session data:", session);
  console.log("Time now", moment().format("YYYY-MM-DD HH:mm:ss"));

  if (session?.expires) {
    console.log(
      "Token expires: ",
      moment(session.expires).format("YYYY-MM-DD HH:mm:ss"),
      "Now:",
      moment().format("YYYY-MM-DD HH:mm:ss"),
      "Is expired:",
      moment().isAfter(moment(session.expires))
    );
  }

  const clearUserData = useCallback(() => {
    setCsvData([]);
    setValidationErrors([]);
    setFileName("");
  }, [setCsvData, setValidationErrors, setFileName]);

  const handleSignOut = useCallback(async () => {
    console.log("Signing out user due to expired token");
    clearUserData();
    await signOut({ redirect: false });
    router.push("/api/auth/signin");
  }, [clearUserData, router]);

  useEffect(() => {
    const checkTokenExpiration = async () => {
      // Don't check while session is loading
      if (status === "loading") {
        return;
      }

      // If no session exists, redirect to sign in
      if (status === "unauthenticated" || !session) {
        console.log("No session found, redirecting to sign in");
        clearUserData();
        router.push("/api/auth/signin");
        return;
      }

      // If session exists but no expires time, something is wrong
      if (!session.expires) {
        console.log("Session missing expiration, signing out");
        await handleSignOut();
        return;
      }

      // Check if token is expired or about to expire (within 30 seconds)
      const expirationTime = moment(session.expires);
      const now = moment();
      const thirtySecondsFromNow = moment().add(30, "seconds");

      if (
        now.isAfter(expirationTime) ||
        thirtySecondsFromNow.isAfter(expirationTime)
      ) {
        console.log("Token expired or about to expire, signing out");
        await handleSignOut();
        return;
      }

      // If token is getting close to expiration (within 5 minutes), trigger an update
      const fiveMinutesFromNow = moment().add(5, "minutes");
      if (fiveMinutesFromNow.isAfter(expirationTime)) {
        console.log("Token close to expiration, triggering update");
        try {
          await update();
        } catch (error) {
          console.error("Failed to update session:", error);
          await handleSignOut();
        }
      }
    };

    // Check immediately on mount
    checkTokenExpiration();

    // Set up interval to check every 10 seconds
    const interval = setInterval(checkTokenExpiration, 10000);

    return () => clearInterval(interval);
  }, [session, status, handleSignOut, clearUserData, router, update]);

  // Also listen for session changes directly
  useEffect(() => {
    if (status === "unauthenticated") {
      console.log("Session became unauthenticated");
      clearUserData();
      router.push("/api/auth/signin");
    }
  }, [status, clearUserData, router]);

  return null;
}
