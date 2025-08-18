"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCSV } from "@/context/CSVContext";
import { useSession, signOut } from "next-auth/react";
import moment from "moment";

export function AuthListener() {
  const { data: session, update } = useSession();
  const { setCsvData, setValidationErrors, setFileName } = useCSV();
  const router = useRouter();
  useEffect(() => {
    const checkTokenExpiration = async () => {
      // If token is expired or about to expire (within 30 seconds)
      if (
        session === null ||
        (session !== undefined &&
          moment().isAfter(moment.unix(session.expires)))
      ) {
        // Clear context
        setCsvData([]);
        setValidationErrors([]);
        setFileName("");

        // Sign out and redirect
        await signOut({ redirect: false });
        router.push("/api/auth/signin");
      }
    };

    // Check immediately on mount
    checkTokenExpiration();

    // Set up interval to check every 30 seconds
    const interval = setInterval(checkTokenExpiration, 60000);

    return () => clearInterval(interval);
  }, [session, setCsvData, setValidationErrors, setFileName, router]);

  return null;
}
